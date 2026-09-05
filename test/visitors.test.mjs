/* =========================================================
   Tests for /api/visitors (the visitor globe).

   Run:  npm test        (or: node test/visitors.test.mjs)
   No dependencies, no live backend, no Netlify CLI.

   It lives here rather than beside the function because every
   top-level file in netlify/functions/ is deployed as an endpoint,
   and a test file is not an endpoint.

   Ported from the AccelerateMyEdu worker test. The assertions are
   the valuable part and carry over almost unchanged; the storage
   stub was rewritten for the Netlify Blobs shape.

   THE STUB HONOURS PRECONDITIONS. A mock that accepts every write
   makes the compare-and-set retry untestable, and that retry is the
   one path that fails silently in production: without it two
   visitors arriving together each read the same blob and one
   increment vanishes with nothing logged anywhere.

   Assertions go through POST, not GET, wherever a number has just
   been written — the GET summary is cached for 30 s per instance,
   so reading it back would test the cache rather than the store.
   ========================================================= */
import { webcrypto } from 'node:crypto';
import { createVisitorsHandler, countryRollup, resolveGeo } from '../netlify/functions/lib/visitors-core.mjs';

// Node 18 does not expose webcrypto globally; Netlify runs Node 20, which does.
if (!globalThis.crypto?.subtle) globalThis.crypto = webcrypto;

const SITE = 'balirealvacation.com';

/* ── in-memory Netlify Blobs, with ETag preconditions ───── */
function makeStore() {
  const blobs = new Map();          // key -> { data, etag }
  let seq = 1;
  const stats = { reads: 0, writes: 0 };
  // When set, runs once before the next write — used to simulate another
  // request winning the race between our read and our write.
  let beforeNextWrite = null;

  return {
    async getWithMetadata(key) {
      stats.reads++;
      const b = blobs.get(key);
      if (!b) return null;
      if (b.corrupt) throw new Error('unparseable blob');
      return { data: structuredClone(b.data), etag: b.etag };
    },
    async setJSON(key, value, opts = {}) {
      if (beforeNextWrite) {
        const f = beforeNextWrite;
        beforeNextWrite = null;
        f();
      }
      const cur = blobs.get(key);
      if (opts.onlyIfNew && cur) return { modified: false };
      if (opts.onlyIfMatch && (!cur || cur.etag !== opts.onlyIfMatch)) return { modified: false };
      stats.writes++;
      blobs.set(key, { data: structuredClone(value), etag: `e${seq++}` });
      return { modified: true };
    },
    // test-only helpers
    _stats: stats,
    _keys: () => [...blobs.keys()],
    _read: (key) => blobs.get(key)?.data ?? null,
    _put: (key, data) => blobs.set(key, { data, etag: `e${seq++}` }),
    _corrupt: (key) => blobs.set(key, { data: null, etag: `e${seq++}`, corrupt: true }),
    _onBeforeWrite: (f) => { beforeNextWrite = f; },
  };
}

/* A fresh handler per scenario, so the 30 s summary cache from one test
   can never leak into the next. `clock` is milliseconds and mutable. */
function harness({ startMs = Date.parse('2026-09-05T02:00:00Z') } = {}) {
  const store = makeStore();
  const clock = { ms: startMs };
  const handler = createVisitorsHandler({
    store,
    siteHost: SITE,
    salt: 'test-salt',
    now: () => clock.ms,
  });

  const call = async (method, path, { body, geo, ip, ua, origin } = {}) => {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (ip) headers['x-nf-client-connection-ip'] = ip;
    if (ua) headers['user-agent'] = ua;
    if (origin) headers.origin = origin;
    const request = new Request(`https://${SITE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const res = await handler(request, geo);
    let json = null;
    try {
      json = await res.clone().json();
    } catch { /* non-JSON */ }
    return { status: res.status, json, headers: res.headers };
  };

  return { store, clock, call };
}

/* ── geolocation fixtures ───────────────────────────────── */
const BALI = {
  country: { code: 'ID', name: 'Indonesia' },
  subdivision: { name: 'Bali' },
  city: 'Denpasar',
  latitude: -8.65,
  longitude: 115.22,
};
const SYDNEY = {
  country: { code: 'AU', name: 'Australia' },
  subdivision: { name: 'New South Wales' },
  city: 'Sydney',
  latitude: -33.87,
  longitude: 151.21,
};
const BERLIN = {
  country: { code: 'DE', name: 'Germany' },
  subdivision: { name: 'Berlin' },
  city: 'Berlin',
  latitude: 52.52,
  longitude: 13.41,
};
// Tor exits report country T1; deploy previews and uptime checks report nothing.
const NOGEO = { country: { code: 'T1', name: '' }, city: '', latitude: '', longitude: '' };

/* Each visitor needs a distinct (ip, ua, visitor_id) triple, or server-side
   dedupe correctly treats them as the same browser. */
const visitor = (n) => ({ ip: `203.0.113.${n}`, ua: `Browser/${n}` });

/* ── assertions ─────────────────────────────────────────── */
let pass = 0;
let fail = 0;
const ok = (cond, label, extra) => {
  if (cond) {
    pass++;
    console.log('  PASS  ' + label);
  } else {
    fail++;
    console.log('  FAIL  ' + label + (extra !== undefined ? '  → ' + JSON.stringify(extra) : ''));
  }
};
const section = (t) => console.log('\n' + t);

const placeOf = (json, city) => (json.locations || []).find((l) => l.city === city);

/* ── 1. empty store ─────────────────────────────────────── */
{
  section('Empty store');
  const { store, call } = harness();
  const res = await call('GET', '/api/visitors');
  ok(res.status === 200, 'GET answers 200, not 500');
  ok(res.json.total_visits === 0, 'total_visits is 0', res.json);
  ok(res.json.online_now === 0, 'online_now is 0', res.json);
  ok(Array.isArray(res.json.countries) && res.json.countries.length === 0, 'countries is []', res.json);
  ok(Array.isArray(res.json.locations) && res.json.locations.length === 0, 'locations is []', res.json);
  ok(store._keys().length === 0, 'a read-only GET creates nothing', store._keys());
  ok(/max-age=60/.test(res.headers.get('cache-control') || ''), 'plain GET is cacheable');
}

/* ── 2. counting and dedupe ─────────────────────────────── */
{
  section('Counting and dedupe');
  const { call } = harness();
  const v = visitor(1);

  const first = await call('POST', '/api/visitors', { body: { visitor_id: 'a' }, geo: BALI, ...v });
  ok(first.status === 201, 'first visit answers 201', first.status);
  ok(first.json.total_visits === 1, 'total is 1', first.json);
  ok(first.json.duplicate === false, 'not flagged duplicate');
  ok(placeOf(first.json, 'Denpasar')?.count === 1, 'Denpasar recorded once', first.json.locations);

  const again = await call('POST', '/api/visitors', { body: { visitor_id: 'a' }, geo: BALI, ...v });
  ok(again.status === 200, 'a repeat inside the window answers 200', again.status);
  ok(again.json.duplicate === true, 'repeat is flagged duplicate');
  ok(again.json.total_visits === 1, 'total stays 1', again.json);

  // Same IP, different browser — a shared office or a family should count twice.
  const other = await call('POST', '/api/visitors', {
    body: { visitor_id: 'b' }, geo: BALI, ip: v.ip, ua: 'Different/9',
  });
  ok(other.json.total_visits === 2, 'a different browser on the same IP counts', other.json);
  ok(placeOf(other.json, 'Denpasar')?.count === 2, 'Denpasar now at 2', other.json.locations);
}

/* ── 3. dedupe expires ──────────────────────────────────── */
{
  section('Dedupe window expires');
  const { call, clock } = harness();
  const v = visitor(2);
  await call('POST', '/api/visitors', { body: { visitor_id: 'a' }, geo: BALI, ...v });
  clock.ms += 31 * 60 * 1000;      // past the 30-minute window
  const later = await call('POST', '/api/visitors', { body: { visitor_id: 'a' }, geo: BALI, ...v });
  ok(later.json.total_visits === 2, 'the same browser counts again after 30 minutes', later.json);
}

/* ── 4. untrusted input ─────────────────────────────────── */
{
  section('Untrusted client input');
  const { call } = harness();

  // No server geolocation, and coordinates outside the valid range.
  const bad = await call('POST', '/api/visitors', {
    body: { visitor_id: 'a', country: 'Nowhere', lat: 999, lng: -999 },
    geo: NOGEO,
    ...visitor(3),
  });
  ok(bad.json.total_visits === 1, 'an unlocatable visit still counts', bad.json);
  ok(bad.json.locations.length === 0, 'out-of-range coordinates are rejected', bad.json.locations);

  // A valid client fallback IS accepted when the edge cannot place the visitor.
  const fallback = await call('POST', '/api/visitors', {
    body: { visitor_id: 'b', cc: 'SG', country: 'Singapore', city: 'Singapore', lat: 1.35, lng: 103.82 },
    geo: NOGEO,
    ...visitor(4),
  });
  ok(placeOf(fallback.json, 'Singapore')?.count === 1, 'a valid client fallback is used', fallback.json.locations);

  // Oversized and control-character strings are truncated and stripped.
  const long = 'X'.repeat(500);
  const huge = await call('POST', '/api/visitors', {
    body: { visitor_id: 'c', cc: 'FR', country: long, city: long, lat: 48.86, lng: 2.35 },
    geo: NOGEO,
    ...visitor(5),
  });
  const stored = huge.json.locations.find((l) => l.city.startsWith('X'));
  ok(stored && stored.city.length <= 60, 'oversized strings are truncated before storage', stored?.city.length);
}

/* ── 5. corrupt store ───────────────────────────────────── */
{
  section('Corrupt store');
  const { store, call } = harness();
  store._corrupt('stats');
  const res = await call('GET', '/api/visitors');
  ok(res.status === 200 && res.json.total_visits === 0, 'an unreadable blob reads as empty, not a 500', res.json);

  const { store: s2, call: c2 } = harness();
  s2._put('stats', { total: 'banana', places: 'not-an-array', seen: 42 });
  const res2 = await c2('GET', '/api/visitors');
  ok(res2.status === 200 && res2.json.total_visits === 0, 'a hand-edited blob normalises to empty', res2.json);
}

/* ── 6. cross-origin ────────────────────────────────────── */
{
  section('Cross-origin');
  const { call } = harness();
  const evil = await call('POST', '/api/visitors', {
    body: { visitor_id: 'a' }, geo: BALI, origin: 'https://evil.example', ...visitor(6),
  });
  ok(evil.status === 403, 'a cross-origin POST is refused', evil.status);

  const own = await call('POST', '/api/visitors', {
    body: { visitor_id: 'a' }, geo: BALI, origin: `https://${SITE}`, ...visitor(6),
  });
  ok(own.status === 201, 'the site\'s own origin is accepted', own.status);

  const www = await call('POST', '/api/visitors', {
    body: { visitor_id: 'b' }, geo: BALI, origin: `https://www.${SITE}`, ...visitor(7),
  });
  ok(www.status === 201, 'the www host is accepted too', www.status);

  // A heartbeat is a write too, so it carries the same guard. The response
  // is still served — it just does not register the stranger as "online".
  const { store: s3, call: c3 } = harness();
  const ours = await c3('GET', '/api/visitors?ping=mine', visitor(30));
  ok(ours.json.online_now === 1, 'a same-origin heartbeat registers', ours.json);
  const writes = s3._stats.writes;
  const theirs = await c3('GET', '/api/visitors?ping=theirs', {
    origin: 'https://evil.example', ...visitor(31),
  });
  ok(theirs.status === 200, 'a cross-origin GET is still answered', theirs.status);
  ok(s3._stats.writes === writes, 'but cannot inflate "online now"', {
    before: writes, after: s3._stats.writes,
  });
}

/* ── 7. compare-and-set ─────────────────────────────────── */
{
  section('Compare-and-set');
  const { store, call } = harness();
  await call('POST', '/api/visitors', { body: { visitor_id: 'a' }, geo: BALI, ...visitor(8) });

  // Another request writes between our read and our write. The retry must
  // re-read and increment from the NEW total, not the stale one.
  store._onBeforeWrite(() => {
    const cur = store._read('stats');
    store._put('stats', { ...cur, total: cur.total + 5 });
  });
  const raced = await call('POST', '/api/visitors', { body: { visitor_id: 'b' }, geo: SYDNEY, ...visitor(9) });
  ok(raced.status === 201, 'a lost race still succeeds after retrying', raced.status);
  ok(raced.json.total_visits === 7, 'the retry increments from the winner\'s total, losing nothing', raced.json.total_visits);

  // A stub that never honoured preconditions would have reported 2 here.
  ok(store._read('stats').total === 7, 'the store agrees', store._read('stats').total);
}

/* ── 8. online now ──────────────────────────────────────── */
{
  section('Online now');
  const { store, call, clock } = harness();

  const a = await call('GET', '/api/visitors?ping=sess-a', visitor(10));
  ok(a.json.online_now === 1, 'a heartbeat registers one session', a.json);
  ok(/no-store/.test(a.headers.get('cache-control') || ''), 'a heartbeat response is never cached');

  const b = await call('GET', '/api/visitors?ping=sess-b', visitor(11));
  ok(b.json.online_now === 2, 'a second session makes two', b.json);

  // The same session polling again inside the skip window must not write.
  const writesBefore = store._stats.writes;
  clock.ms += 60 * 1000;
  const again = await call('GET', '/api/visitors?ping=sess-a', visitor(10));
  ok(again.json.online_now === 2, 'a session is counted once, not once per heartbeat', again.json);
  ok(store._stats.writes === writesBefore, 'and the skip window suppresses the write', {
    before: writesBefore, after: store._stats.writes,
  });

  // Past the skip window it does write again, which keeps the session alive.
  clock.ms += 130 * 1000;
  await call('GET', '/api/visitors?ping=sess-a', visitor(10));
  ok(store._stats.writes > writesBefore, 'past the skip window the heartbeat writes again');

  // sess-b last pinged at t0; sess-a re-registered at t0+190s.
  clock.ms += 120 * 1000;          // sess-b is now 310 s old, sess-a is 120 s old
  const pruned = await call('GET', '/api/visitors');
  ok(pruned.json.online_now === 1, 'a session older than the 5-minute window drops out', pruned.json);

  clock.ms += 400 * 1000;
  const empty = await call('GET', '/api/visitors');
  ok(empty.json.online_now === 0, 'everyone eventually drops out', empty.json);
}

/* ── 9. countries rollup ────────────────────────────────── */
{
  section('Countries of origin');
  const { call } = harness();
  let last;
  // Australia 3, Indonesia 2, Germany 1 — deliberately not in that order.
  const arrivals = [BERLIN, SYDNEY, BALI, SYDNEY, BALI, SYDNEY];
  for (let i = 0; i < arrivals.length; i++) {
    last = await call('POST', '/api/visitors', {
      body: { visitor_id: `v${i}` }, geo: arrivals[i], ...visitor(20 + i),
    });
  }
  const c = last.json.countries;
  ok(c.length === 3, 'three countries', c);
  ok(c[0].code === 'AU' && c[0].count === 3, 'sorted by count descending', c);
  ok(c[1].code === 'ID' && c[1].count === 2, 'second is Indonesia', c);
  ok(c[2].code === 'DE' && c[2].count === 1, 'third is Germany', c);
  ok(c.every((e) => /^[A-Z]{2}$/.test(e.code)), 'every entry carries an ISO alpha-2 code', c);
  ok(c[0].name === 'Australia', 'and a display name', c[0]);

  // Two cities in one country roll up into a single entry.
  const melbourne = { ...SYDNEY, city: 'Melbourne', subdivision: { name: 'Victoria' }, latitude: -37.81, longitude: 144.96 };
  const rolled = await call('POST', '/api/visitors', {
    body: { visitor_id: 'mel' }, geo: melbourne, ...visitor(40),
  });
  const au = rolled.json.countries.find((e) => e.code === 'AU');
  ok(au.count === 4, 'two cities in one country roll up together', rolled.json.countries);
  ok(rolled.json.places === 4, 'but stay separate places (dots)', rolled.json.places);
}

/* ── 10. unit checks on the pure helpers ────────────────── */
{
  section('Pure helpers');
  ok(resolveGeo(NOGEO, {}) === null, 'resolveGeo returns null when nothing can place the visitor');
  ok(resolveGeo(BALI, {}).cc === 'ID', 'resolveGeo prefers the edge geolocation');
  ok(resolveGeo({ country: { code: 'ID' }, latitude: 0, longitude: 0 }, {}) === null,
    'null island is treated as no geolocation');
  ok(countryRollup([{ cc: '', country: 'Nowhere', count: 9 }]).length === 0,
    'a place with no country code is left out of the rollup');
}

/* ── result ─────────────────────────────────────────────── */
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
