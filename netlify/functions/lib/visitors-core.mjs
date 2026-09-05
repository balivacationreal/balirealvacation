/* =========================================================
   /api/visitors — core logic for the <visitor-globe> card
   =========================================================
   Host-agnostic on purpose. This module knows nothing about
   Netlify: it is handed a storage object and a geolocation
   object, and returns a Response. netlify/functions/visitors.mjs
   is the thin adapter that supplies both; test-visitors.mjs
   supplies fakes. That seam exists so the compare-and-set retry
   path can actually be tested — it is the part of this route
   most likely to break silently, because a lost increment
   errors nowhere and the number is just quietly wrong forever.

   Ported from the AccelerateMyEdu Cloudflare Worker
   (worker/index.js, "Route: /api/visitors"). What changed:

   1. TWO STORES, NOT ONE. AccelerateMyEdu has no "online now",
      so its whole aggregate lives in a single document. Here a
      heartbeat arrives with every poll, and letting those fight
      the visit counter for the same compare-and-set token loses
      increments under concurrency. `stats` is written once per
      new visitor; `presence` churns on its own.

   2. COUNTRY CODES ARE STORED. Each place carries its ISO
      alpha-2 code, because the code is what becomes a flag
      emoji in the UI. Reverse-engineering it from the country
      name afterwards does not work.

   3. `countries` IS DERIVED AT READ TIME from `places`, so
      there is no third thing to keep consistent.

   PRIVACY — the four rules this file has to keep (privacy.html
   §5): aggregates only, never an IP, nothing durable on the
   device, and only short-lived salted hashes. Breaking any of
   them puts the site into consent-banner territory, which is a
   product decision and not a code change.
   ========================================================= */

/* ── tunables ───────────────────────────────────────────── */
export const VG = {
  MAX_PLACES: 80,          // distinct places retained in `stats`
  DEDUPE_SECONDS: 1800,    // one count per visitor per 30 min
  MAX_SEEN: 600,           // dedupe hashes retained (pruned by age too)
  PRESENCE_SECONDS: 300,   // how long a session counts as "online"
  MAX_LIVE: 500,           // hard cap on the presence list
  HEARTBEAT_SKIP: 120,     // re-write a live entry at most this often
  CACHE_MS: 30000,         // in-instance cache of the stats summary
  SAVE_RETRIES: 3,
};

const STATS_KEY = 'stats';
const PRESENCE_KEY = 'presence';

/* ── sanitising ─────────────────────────────────────────── */

// Strips control characters and angle brackets, collapses whitespace and
// caps the length. Place names arrive from a geolocation database and
// from the POST body; neither is trusted with the length of a field.
const vgClean = (value, limit = 60) =>
  String(value == null ? '' : value)
    .replace(/[\u0000-\u001f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);

/* A client can put anything in the POST body. Without this check it
   could plant a dot anywhere on the globe. */
const vgCoord = (value, min, max) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 100) / 100 : null;
};

const vgCode = (value) => {
  const cc = vgClean(value, 2).toUpperCase();
  return /^[A-Z]{2}$/.test(cc) ? cc : '';
};

/* ISO alpha-2 → English name. Node ships full ICU, so no lookup table. */
export function vgCountryName(code) {
  const cc = vgCode(code);
  if (!cc) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(cc) || cc;
  } catch {
    return cc;
  }
}

/* ── stored shapes ──────────────────────────────────────── */

const emptyStats = () => ({ v: 1, total: 0, places: [], seen: [] });
const emptyPresence = () => ({ v: 1, live: [] });

/* Rebuild a stored payload defensively. It is our own data, but a
   partial write or a hand-edit in the Netlify UI must not be able to
   take down the home page. */
function normalizeStats(raw) {
  const state = emptyStats();
  if (!raw || typeof raw !== 'object') return state;
  state.total = Number.isFinite(raw.total) ? Math.max(0, Math.trunc(raw.total)) : 0;
  state.places = (Array.isArray(raw.places) ? raw.places : []).flatMap((p) => {
    const lat = vgCoord(p?.lat, -90, 90);
    const lng = vgCoord(p?.lng, -180, 180);
    if (lat === null || lng === null) return [];
    return [{
      cc: vgCode(p.cc),
      country: vgClean(p.country),
      region: vgClean(p.region),
      city: vgClean(p.city),
      lat,
      lng,
      count: Math.max(1, Math.trunc(Number(p.count)) || 1),
      lastSeen: vgClean(p.lastSeen, 40),
    }];
  }).slice(0, VG.MAX_PLACES);
  state.seen = (Array.isArray(raw.seen) ? raw.seen : [])
    .filter((s) => s && typeof s.h === 'string' && Number.isFinite(s.t))
    .map((s) => ({ h: s.h.slice(0, 32), t: Math.trunc(s.t) }))
    .slice(-VG.MAX_SEEN);
  return state;
}

function normalizePresence(raw) {
  const state = emptyPresence();
  if (!raw || typeof raw !== 'object') return state;
  state.live = (Array.isArray(raw.live) ? raw.live : [])
    .filter((s) => s && typeof s.h === 'string' && Number.isFinite(s.t))
    .map((s) => ({ h: s.h.slice(0, 32), t: Math.trunc(s.t) }))
    .slice(-VG.MAX_LIVE);
  return state;
}

/* ── read/write with compare-and-set ────────────────────── */

/* The ETag is the CAS token. A store that has never been written
   answers with nothing, which is not an error — it is a new site. */
async function load(store, key, normalize) {
  let res = null;
  try {
    res = await store.getWithMetadata(key, { type: 'json' });
  } catch {
    // Missing or unparseable blob: start clean rather than fail the request.
  }
  return { state: normalize(res?.data), etag: res?.etag ?? null };
}

/* False means someone else wrote first and the caller should retry. */
async function save(store, key, value, etag) {
  try {
    const r = await store.setJSON(key, value, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    return r?.modified !== false;
  } catch {
    return false;   // a precondition failure is a lost race, not an outage
  }
}

/* ── hashing ────────────────────────────────────────────── */

/* Short-lived, salted, truncated — enough to recognise the same browser
   inside the dedupe window, useless as an identifier once pruned. The
   salt rotates daily so a hash cannot be replayed against a later store.
   The IP is an INPUT here and is never written anywhere. */
export async function visitorHash({ ip, ua, visitorId, salt, nowMs }) {
  const parts = [
    ip || '',
    ua || '',
    vgClean(visitorId, 80),
    new Date(nowMs).toISOString().slice(0, 10),
    salt || '',
  ].join('|');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts));
  return [...new Uint8Array(digest)]
    .slice(0, 10)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/* ── geolocation ────────────────────────────────────────── */

/* The platform's edge geolocation first; the browser's timezone guess
   only as a fallback (Tor exits report country "T1", deploy previews and
   uptime checks report nothing at all). Returns null when neither can
   place the visitor — the caller still counts the visit. */
export function resolveGeo(geo, body) {
  const cc = vgCode(geo?.country?.code);
  const lat = vgCoord(geo?.latitude, -90, 90);
  const lng = vgCoord(geo?.longitude, -180, 180);
  if (cc && lat !== null && lng !== null && !(lat === 0 && lng === 0)) {
    return {
      cc,
      country: vgClean(geo.country?.name) || vgCountryName(cc),
      region: vgClean(geo.subdivision?.name),
      city: vgClean(geo.city),
      lat,
      lng,
    };
  }
  const bLat = vgCoord(body?.lat, -90, 90);
  const bLng = vgCoord(body?.lng, -180, 180);
  const bCountry = vgClean(body?.country);
  if (bCountry && bLat !== null && bLng !== null && !(bLat === 0 && bLng === 0)) {
    return {
      cc: vgCode(body?.cc),
      country: bCountry,
      region: vgClean(body?.region),
      city: vgClean(body?.city),
      lat: bLat,
      lng: bLng,
    };
  }
  return null;
}

const placeKey = (p) =>
  [p.country, p.region, p.city, p.lat.toFixed(2), p.lng.toFixed(2)].join('|').toLowerCase();

/* ── the JSON the widget consumes ───────────────────────── */

/* Countries are rolled up from places rather than stored, so there is one
   less thing to keep consistent. Sorted by count descending and carrying
   the ISO code, which is what becomes a flag emoji in the UI. */
export function countryRollup(places) {
  const by = new Map();
  for (const p of places) {
    if (!p.cc) continue;
    const e = by.get(p.cc) || { code: p.cc, name: p.country || vgCountryName(p.cc), count: 0 };
    e.count += p.count;
    by.set(p.cc, e);
  }
  return [...by.values()].sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
}

function summarize(state) {
  const locations = [...state.places]
    .sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen))
    .map((p) => ({
      label: [p.city, p.country].filter(Boolean).join(', ') || p.country || 'Visitor',
      country: p.country,
      region: p.region,
      city: p.city,
      lat: p.lat,
      lng: p.lng,
      count: p.count,
      last_seen: p.lastSeen,
    }));
  return {
    total_visits: state.total,
    places: locations.length,
    countries: countryRollup(state.places),
    locations,
  };
}

/* ── handler ────────────────────────────────────────────── */

/**
 * @param {object} deps
 * @param {object} deps.store        Netlify-Blobs-shaped: getWithMetadata / setJSON
 * @param {string} deps.siteHost     hostname allowed to POST (same-origin guard)
 * @param {string} deps.salt         site pepper for the daily-rotating hash salt
 * @param {() => number} [deps.now]  injectable clock, for tests
 */
export function createVisitorsHandler({ store, siteHost, salt = '', now = () => Date.now() }) {
  // Cached per function instance: a burst of home-page loads costs one blob
  // read, not one each. Only the AGGREGATE is cached — `online_now` is
  // always computed from a fresh presence read, because it is the one
  // number a reader can catch being wrong by opening a second tab.
  let cache = { summary: null, exp: 0 };

  const json = (status, body, headers = {}) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    });

  async function statsSummary() {
    const t = now();
    if (cache.summary && cache.exp > t) return cache.summary;
    const { state } = await load(store, STATS_KEY, normalizeStats);
    const summary = summarize(state);
    cache = { summary, exp: t + VG.CACHE_MS };
    return summary;
  }

  /* Records presence and returns how many sessions are live. The write is
     skipped when this session's entry is younger than HEARTBEAT_SKIP,
     which is what keeps the cost proportional to CONCURRENT visitors
     rather than to the polling rate. */
  async function touchPresence(hash) {
    const nowSec = Math.floor(now() / 1000);
    const cutoff = nowSec - VG.PRESENCE_SECONDS;

    for (let attempt = 0; attempt < VG.SAVE_RETRIES; attempt++) {
      const { state, etag } = await load(store, PRESENCE_KEY, normalizePresence);
      state.live = state.live.filter((s) => s.t > cutoff);

      if (!hash) return state.live.length;

      const existing = state.live.find((s) => s.h === hash);
      if (existing && existing.t > nowSec - VG.HEARTBEAT_SKIP) return state.live.length;

      if (existing) existing.t = nowSec;
      else state.live.push({ h: hash, t: nowSec });
      if (state.live.length > VG.MAX_LIVE) state.live = state.live.slice(-VG.MAX_LIVE);

      if (await save(store, PRESENCE_KEY, state, etag)) return state.live.length;
    }
    // Lost every race. Report what we last saw rather than failing — the
    // number is decoration and the next poll is 60 seconds away.
    const { state } = await load(store, PRESENCE_KEY, normalizePresence);
    return state.live.filter((s) => s.t > cutoff).length;
  }

  async function onlineOnly() {
    const cutoff = Math.floor(now() / 1000) - VG.PRESENCE_SECONDS;
    const { state } = await load(store, PRESENCE_KEY, normalizePresence);
    return state.live.filter((s) => s.t > cutoff).length;
  }

  /* Only same-origin browser POSTs should count. Dropping this check lets
     any page on the internet inflate the counter with its own visitors. A
     request with no Origin header is a curl or a same-origin navigation,
     neither of which is what this guards against. */
  function sameOrigin(request) {
    const origin = request.headers.get('origin');
    if (!origin) return true;
    try {
      const host = new URL(origin).hostname;
      const bare = siteHost.replace(/^www\./, '');
      return host === bare || host === `www.${bare}` ||
        host === 'localhost' || host === '127.0.0.1';
    } catch {
      return false;
    }
  }

  async function hashFor(request, visitorId) {
    return visitorHash({
      // Hash INPUT only, never stored. Netlify puts the client address in
      // x-nf-client-connection-ip.
      ip: request.headers.get('x-nf-client-connection-ip') ||
          request.headers.get('x-forwarded-for') || '',
      ua: request.headers.get('user-agent') || '',
      visitorId,
      salt,
      nowMs: now(),
    });
  }

  async function handleGet(request, url) {
    // A heartbeat is a write, so it gets the same origin guard as a visit —
    // otherwise any page on the internet could inflate "online now" with its
    // own readers. A cross-origin GET is still answered, just read-only.
    const ping = sameOrigin(request) ? url.searchParams.get('ping') : null;
    const online = ping
      ? await touchPresence(await hashFor(request, ping))
      : await onlineOnly();
    const summary = await statsSummary();
    // A heartbeat response must never be cached, or a shared cache would
    // serve one visitor's "online now" to everybody for a minute.
    return json(200, { ...summary, online_now: online }, {
      'Cache-Control': ping ? 'no-store' : 'public, max-age=60',
    });
  }

  async function handlePost(request, url, geo) {
    if (!sameOrigin(request)) {
      return json(403, { ok: false, error: 'Cross-origin visits are not counted.' },
        { 'Cache-Control': 'no-store' });
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    if (!body || typeof body !== 'object') body = {};

    // A bare heartbeat: presence only, never a visit.
    const ping = url.searchParams.get('ping');
    if (ping) {
      const id = ping === '1' ? body.visitor_id : ping;
      const online = await touchPresence(await hashFor(request, id));
      const summary = await statsSummary();
      return json(200, { ok: true, ping: true, ...summary, online_now: online },
        { 'Cache-Control': 'no-store' });
    }

    const place = resolveGeo(geo, body);
    const hash = await hashFor(request, body.visitor_id);
    const nowSec = Math.floor(now() / 1000);
    const stamp = new Date(now()).toISOString();
    const online = await touchPresence(hash);

    for (let attempt = 0; attempt < VG.SAVE_RETRIES; attempt++) {
      const { state, etag } = await load(store, STATS_KEY, normalizeStats);

      // Prune the dedupe window first, then check it.
      state.seen = state.seen.filter((s) => s.t > nowSec - VG.DEDUPE_SECONDS);
      if (state.seen.some((s) => s.h === hash)) {
        return json(200, { ok: true, duplicate: true, ...summarize(state), online_now: online },
          { 'Cache-Control': 'no-store' });
      }
      state.seen.push({ h: hash, t: nowSec });
      if (state.seen.length > VG.MAX_SEEN) state.seen = state.seen.slice(-VG.MAX_SEEN);

      // A visit we cannot place is still a visit — it just gets no dot.
      state.total += 1;
      if (place) {
        const key = placeKey(place);
        const existing = state.places.find((p) => placeKey(p) === key);
        if (existing) {
          existing.count += 1;
          existing.lastSeen = stamp;
          if (!existing.cc && place.cc) existing.cc = place.cc;
        } else {
          state.places.push({ ...place, count: 1, lastSeen: stamp });
        }
        if (state.places.length > VG.MAX_PLACES) {
          state.places.sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen));
          state.places = state.places.slice(0, VG.MAX_PLACES);
        }
      }

      if (await save(store, STATS_KEY, state, etag)) {
        const summary = summarize(state);
        cache = { summary, exp: now() + VG.CACHE_MS };
        return json(201, { ok: true, duplicate: false, ...summary, online_now: online },
          { 'Cache-Control': 'no-store' });
      }
    }

    // Lost every race. Report the current numbers rather than an error —
    // the widget is decoration, not a transaction.
    console.error('visitor globe: gave up after CAS retries');
    const { state } = await load(store, STATS_KEY, normalizeStats);
    return json(200, { ok: true, duplicate: false, ...summarize(state), online_now: online },
      { 'Cache-Control': 'no-store' });
  }

  return async function handler(request, geo) {
    const url = new URL(request.url);
    if (request.method === 'GET') return handleGet(request, url);
    if (request.method === 'POST') return handlePost(request, url, geo);
    return json(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'GET, POST' });
  };
}
