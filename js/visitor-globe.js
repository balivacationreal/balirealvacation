/* =========================================================
   <visitor-globe> — Bali Real Vacation fork
   =========================================================
   Based on visitor-globe-widget by Shuai Yang
   https://github.com/StatSleuth8/visitor-globe-widget

   Copyright (c) 2026 Shuai Yang. Permission is hereby granted,
   free of charge, to any person obtaining a copy of this
   software and associated documentation files (the "Software"),
   to deal in the Software without restriction, including without
   limitation the rights to use, copy, modify, merge, publish,
   distribute, sublicense, and/or sell copies of the Software,
   and to permit persons to whom the Software is furnished to do
   so, subject to the following conditions: the above copyright
   notice and this permission notice shall be included in all
   copies or substantial portions of the Software. THE SOFTWARE
   IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
   OTHER DEALINGS IN THE SOFTWARE.

   src/assets/countries-110m.json is the same 110m TopoJSON the
   upstream project ships, derived from Natural Earth (public
   domain).

   Forked from the AccelerateMyEdu build of this widget. What is
   different here, and why — none of it is cosmetic accident:

   1. THREE FEATURES UPSTREAM DOES NOT HAVE. A prominent TOTAL
      VISITORS counter, an ONLINE NOW figure fed by a heartbeat
      on the stats poll, and a COUNTRIES OF ORIGIN list. The
      backend contract for all three is in
      netlify/functions/lib/visitors-core.mjs.

   2. THREE LANGUAGES, READ FROM <html lang>. This site serves a
      separate page per language (/, /id/, /zh/), so unlike
      AccelerateMyEdu there is no runtime toggle and no event to
      listen for — the language is fixed for the life of the
      page, exactly as js/reviews.js treats it. Shadow DOM is out
      of reach of any site-wide helper, so the component still
      owns its own strings.

   3. NO PERSISTENT CLIENT IDENTIFIER. Upstream mints a random
      visitor id in localStorage that survives forever. This uses
      sessionStorage only, so nothing durable is left on a
      visitor's device and the site stays out of consent-banner
      territory. Deduplication is server-side. Do not "fix" this
      by reaching for localStorage.

   4. NO POLITICAL RELABELLING. Upstream's normalizeLocation()
      rewrites Hong Kong / Taiwan / Macau to "China". Publishing
      that on a tourism home page is a statement we are not
      making; this fork reports whatever geolocation returns.

   5. TOURISM PALETTE. Every colour is a --vg-* custom property
      fed from the host page. Canvas colours are parsed as HEX
      ONLY — rgb(), hsl() and color-mix() silently fall back.

   Backend: /api/visitors, a Netlify Function. The card degrades
   to a quiet "statistics unavailable" line if it is not there.
   ========================================================= */

const templateStyles = `
  :host {
    /* Fed from css/styles.css by the host page; these are only a
       sane standalone fallback. HEX ONLY for the canvas five. */
    --vg-ink:      #1f2a30;
    --vg-muted:    #5f6f78;
    --vg-surface:  #ffffff;
    --vg-border:   #e9e0d2;
    --vg-radius:   18px;
    --vg-shadow:   0 14px 40px rgba(4, 41, 62, 0.12);
    --vg-accent:   #00557f;

    --vg-land:     #0e5b73;   /* continents */
    --vg-coast:    rgba(255,255,255,0.45);
    --vg-ocean:    #dbeef6;   /* water */
    --vg-rim:      #00557f;   /* globe outline */
    --vg-past:     #ff6b4a;   /* places seen */
    --vg-current:  #13b5a6;   /* newest place */
    --vg-live:     #15803d;   /* the online-now dot */

    display: block;
    color: var(--vg-ink);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .vg-panel {
    border: 1px solid var(--vg-border);
    border-radius: var(--vg-radius);
    background: var(--vg-surface);
    box-shadow: var(--vg-shadow);
    padding: 26px 28px 22px;
    overflow: hidden;
  }

  .vg-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .vg-heading {
    min-width: 0;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 1.35rem;
    line-height: 1.25;
    color: var(--vg-accent);
  }

  .vg-description {
    color: var(--vg-muted);
    font-size: 0.9rem;
    margin: 6px 0 18px;
    max-width: 62ch;
  }

  /* ── the counter row ─────────────────────────────────── */

  .vg-counter {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 20px;
  }

  .vg-stat {
    flex: 1 1 140px;
    min-width: 0;
    padding: 12px 16px;
    border: 1px solid var(--vg-border);
    border-radius: 12px;
    background: var(--vg-surface);
  }

  .vg-stat strong {
    display: block;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1.05;
    color: var(--vg-accent);
  }

  /* The headline number. Deliberately much larger than the other
     two — it is the one the card exists to show. */
  .vg-stat--total strong { font-size: 2.6rem; }
  .vg-stat--total { flex: 2 1 200px; }

  .vg-stat--online strong { font-size: 1.7rem; color: var(--vg-live); }
  .vg-stat--places strong { font-size: 1.7rem; }

  .vg-stat span {
    display: block;
    margin-top: 4px;
    color: var(--vg-muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .vg-online-head { display: flex; align-items: center; gap: 7px; }

  .vg-live-dot {
    flex: none;
    width: 9px; height: 9px;
    border-radius: 50%;
    background: var(--vg-live);
    animation: vg-pulse 2s ease-out infinite;
  }

  @keyframes vg-pulse {
    0%, 100% { opacity: 1;    transform: scale(1); }
    50%      { opacity: 0.35; transform: scale(0.75); }
  }

  /* ── globe + recent places ───────────────────────────── */

  .vg-body {
    display: grid;
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
    gap: 24px 28px;
    align-items: center;
  }

  .vg-stage { min-width: 0; display: flex; justify-content: center; }
  .vg-canvas { display: block; width: 100%; aspect-ratio: 1; }
  .vg-side { min-width: 0; }

  .vg-records-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 9px;
    color: var(--vg-muted);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* The label must be able to shrink, or a long Indonesian string
     pushes the card wider than its column on a narrow phone. */
  .vg-records-head > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .vg-records-line { flex: 1 0 12px; height: 1px; background: var(--vg-border); }

  /* Flows into as many columns as the space allows. In a full-width card the
     five rows are short and a single column would leave most of the row
     empty, which reads as a rendering fault rather than a design. */
  .vg-record-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 6px 20px;
  }

  .vg-record {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 0.88rem;
    color: var(--vg-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.25s ease;
  }

  .vg-record::before {
    content: "";
    flex: none;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--vg-past);
  }

  .vg-record[data-current="true"] { color: var(--vg-ink); font-weight: 600; }
  .vg-record[data-current="true"]::before { background: var(--vg-current); }

  /* ── countries of origin ─────────────────────────────── */

  .vg-origins { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--vg-border); }

  .vg-countries {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    margin-top: 9px;
  }

  .vg-country {
    display: inline-flex;
    align-items: baseline;
    gap: 7px;
    padding: 5px 12px;
    border: 1px solid var(--vg-border);
    border-radius: 999px;
    background: var(--vg-surface);
    font-size: 0.85rem;
    color: var(--vg-ink);
    max-width: 100%;
  }

  .vg-country b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .vg-country em {
    font-style: normal;
    font-variant-numeric: tabular-nums;
    color: var(--vg-muted);
    font-size: 0.8rem;
  }
  .vg-country--more { color: var(--vg-muted); border-style: dashed; }

  .vg-empty, .vg-meta { color: var(--vg-muted); font-size: 0.82rem; }
  .vg-meta { display: block; margin-top: 14px; }

  /* Loading and failure states. The card must never show a heading over an
     empty void — before data arrives, and when the API is down, the sections
     that would be blank are removed rather than left standing empty. When it
     is down for good, what is left is the globe and one quiet line, which is
     the whole of the intended failure. */
  .vg-panel[data-state="loading"] .vg-side,
  .vg-panel[data-state="loading"] .vg-origins,
  .vg-panel[data-state="offline"] .vg-counter,
  .vg-panel[data-state="offline"] .vg-side,
  .vg-panel[data-state="offline"] .vg-origins { display: none; }

  .vg-panel[data-state="loading"] .vg-body,
  .vg-panel[data-state="offline"] .vg-body { grid-template-columns: 1fr; }

  .vg-panel[data-state="loading"] .vg-stage,
  .vg-panel[data-state="offline"] .vg-stage { max-width: 240px; margin: 0 auto; }

  .vg-panel[data-state="offline"] .vg-meta { text-align: center; }

  @media (prefers-reduced-motion: reduce) {
    .vg-live-dot { animation: none; }
  }

  @media (max-width: 720px) {
    .vg-panel { padding: 20px 18px 18px; }
    .vg-body { grid-template-columns: 1fr; }
    .vg-stage { max-width: 240px; margin: 0 auto; }
    .vg-stat--total strong { font-size: 2.1rem; }
  }
`;

/* Client-side coarse fallback, used only when the server cannot geolocate
   the request (Netlify normally supplies the real city/lat/lng, so this
   table rarely comes into play). `cc` is here because the ISO code is what
   becomes a flag emoji — it cannot be recovered from the name later.
   Australia, Europe and SE Asia first: that is where this site's guests
   actually come from. */
const timezoneLocations = {
  'Asia/Makassar':     { cc: 'ID', city: 'Denpasar',     region: 'Bali',              country: 'Indonesia',      lat: -8.65,  lng: 115.22 },
  'Asia/Jakarta':      { cc: 'ID', city: 'Jakarta',      region: 'Jakarta',           country: 'Indonesia',      lat: -6.21,  lng: 106.85 },
  'Asia/Jayapura':     { cc: 'ID', city: 'Jayapura',     region: 'Papua',             country: 'Indonesia',      lat: -2.53,  lng: 140.72 },
  'Australia/Perth':   { cc: 'AU', city: 'Perth',        region: 'Western Australia', country: 'Australia',      lat: -31.95, lng: 115.86 },
  'Australia/Sydney':  { cc: 'AU', city: 'Sydney',       region: 'New South Wales',   country: 'Australia',      lat: -33.87, lng: 151.21 },
  'Australia/Melbourne': { cc: 'AU', city: 'Melbourne',  region: 'Victoria',          country: 'Australia',      lat: -37.81, lng: 144.96 },
  'Australia/Brisbane':{ cc: 'AU', city: 'Brisbane',     region: 'Queensland',        country: 'Australia',      lat: -27.47, lng: 153.03 },
  'Pacific/Auckland':  { cc: 'NZ', city: 'Auckland',     region: 'Auckland',          country: 'New Zealand',    lat: -36.85, lng: 174.76 },
  'Asia/Singapore':    { cc: 'SG', city: 'Singapore',    region: 'Singapore',         country: 'Singapore',      lat: 1.35,   lng: 103.82 },
  'Asia/Kuala_Lumpur': { cc: 'MY', city: 'Kuala Lumpur', region: 'Kuala Lumpur',      country: 'Malaysia',       lat: 3.14,   lng: 101.69 },
  'Asia/Bangkok':      { cc: 'TH', city: 'Bangkok',      region: 'Bangkok',           country: 'Thailand',       lat: 13.76,  lng: 100.50 },
  'Asia/Manila':       { cc: 'PH', city: 'Manila',       region: 'Metro Manila',      country: 'Philippines',    lat: 14.60,  lng: 120.98 },
  'Asia/Ho_Chi_Minh':  { cc: 'VN', city: 'Ho Chi Minh',  region: 'Ho Chi Minh',       country: 'Vietnam',        lat: 10.82,  lng: 106.63 },
  'Asia/Tokyo':        { cc: 'JP', city: 'Tokyo',        region: 'Tokyo',             country: 'Japan',          lat: 35.68,  lng: 139.76 },
  'Asia/Seoul':        { cc: 'KR', city: 'Seoul',        region: 'Seoul',             country: 'South Korea',    lat: 37.57,  lng: 126.98 },
  'Asia/Shanghai':     { cc: 'CN', city: 'Shanghai',     region: 'Shanghai',          country: 'China',          lat: 31.23,  lng: 121.47 },
  'Asia/Hong_Kong':    { cc: 'HK', city: 'Hong Kong',    region: 'Hong Kong',         country: 'Hong Kong',      lat: 22.32,  lng: 114.17 },
  'Asia/Taipei':       { cc: 'TW', city: 'Taipei',       region: 'Taipei',            country: 'Taiwan',         lat: 25.03,  lng: 121.56 },
  'Asia/Kolkata':      { cc: 'IN', city: 'Delhi',        region: 'Delhi',             country: 'India',          lat: 28.61,  lng: 77.21 },
  'Asia/Dubai':        { cc: 'AE', city: 'Dubai',        region: 'Dubai',             country: 'UAE',            lat: 25.20,  lng: 55.27 },
  'Europe/London':     { cc: 'GB', city: 'London',       region: 'England',           country: 'United Kingdom', lat: 51.51,  lng: -0.13 },
  'Europe/Dublin':     { cc: 'IE', city: 'Dublin',       region: 'Leinster',          country: 'Ireland',        lat: 53.35,  lng: -6.26 },
  'Europe/Paris':      { cc: 'FR', city: 'Paris',        region: 'Ile-de-France',     country: 'France',         lat: 48.86,  lng: 2.35 },
  'Europe/Amsterdam':  { cc: 'NL', city: 'Amsterdam',    region: 'North Holland',     country: 'Netherlands',    lat: 52.37,  lng: 4.90 },
  'Europe/Berlin':     { cc: 'DE', city: 'Berlin',       region: 'Berlin',            country: 'Germany',        lat: 52.52,  lng: 13.41 },
  'Europe/Madrid':     { cc: 'ES', city: 'Madrid',       region: 'Madrid',            country: 'Spain',          lat: 40.42,  lng: -3.70 },
  'Europe/Rome':       { cc: 'IT', city: 'Rome',         region: 'Lazio',             country: 'Italy',          lat: 41.90,  lng: 12.50 },
  'Europe/Moscow':     { cc: 'RU', city: 'Moscow',       region: 'Moscow',            country: 'Russia',         lat: 55.76,  lng: 37.62 },
  'America/New_York':  { cc: 'US', city: 'New York',     region: 'New York',          country: 'United States',  lat: 40.71,  lng: -74.01 },
  'America/Chicago':   { cc: 'US', city: 'Chicago',      region: 'Illinois',          country: 'United States',  lat: 41.88,  lng: -87.63 },
  'America/Denver':    { cc: 'US', city: 'Denver',       region: 'Colorado',          country: 'United States',  lat: 39.74,  lng: -104.99 },
  'America/Los_Angeles': { cc: 'US', city: 'Los Angeles', region: 'California',       country: 'United States',  lat: 34.05,  lng: -118.24 },
  'America/Toronto':   { cc: 'CA', city: 'Toronto',      region: 'Ontario',           country: 'Canada',         lat: 43.65,  lng: -79.38 },
  'America/Sao_Paulo': { cc: 'BR', city: 'Sao Paulo',    region: 'Sao Paulo',         country: 'Brazil',         lat: -23.55, lng: -46.63 },
  'Africa/Johannesburg': { cc: 'ZA', city: 'Johannesburg', region: 'Gauteng',         country: 'South Africa',   lat: -26.20, lng: 28.05 },
};

/* Shown when the `demo` attribute is present — lets the card be styled
   locally against `npx eleventy --serve`, with no function behind it. */
const demoStats = {
  total_visits: 4821,
  online_now: 7,
  countries: [
    { code: 'AU', name: 'Australia',      count: 1204 },
    { code: 'ID', name: 'Indonesia',      count: 902 },
    { code: 'DE', name: 'Germany',        count: 318 },
    { code: 'GB', name: 'United Kingdom', count: 264 },
    { code: 'US', name: 'United States',  count: 211 },
    { code: 'SG', name: 'Singapore',      count: 168 },
    { code: 'NL', name: 'Netherlands',    count: 121 },
    { code: 'JP', name: 'Japan',          count: 96 },
  ],
  locations: [
    { country: 'Australia',      region: 'New South Wales',   city: 'Sydney',      lat: -33.87, lng: 151.21, count: 412, last_seen: '2026-09-05T02:11:04Z' },
    { country: 'Indonesia',      region: 'Bali',              city: 'Denpasar',    lat: -8.65,  lng: 115.22, count: 388, last_seen: '2026-09-05T01:40:00Z' },
    { country: 'Australia',      region: 'Western Australia', city: 'Perth',       lat: -31.95, lng: 115.86, count: 301, last_seen: '2026-09-04T22:00:00Z' },
    { country: 'Germany',        region: 'Berlin',            city: 'Berlin',      lat: 52.52,  lng: 13.41,  count: 190, last_seen: '2026-09-04T18:00:00Z' },
    { country: 'United Kingdom', region: 'England',           city: 'London',      lat: 51.51,  lng: -0.13,  count: 164, last_seen: '2026-09-04T12:00:00Z' },
    { country: 'Singapore',      region: 'Singapore',         city: 'Singapore',   lat: 1.35,   lng: 103.82, count: 128, last_seen: '2026-09-03T14:00:00Z' },
    { country: 'United States',  region: 'California',        city: 'Los Angeles', lat: 34.05,  lng: -118.24, count: 97, last_seen: '2026-09-03T09:00:00Z' },
    { country: 'Japan',          region: 'Tokyo',             city: 'Tokyo',       lat: 35.68,  lng: 139.76, count: 96,  last_seen: '2026-09-02T11:00:00Z' },
  ],
};

/* Every string the component renders, in the site's three languages.
   The component owns these because shadow DOM cannot be reached from
   css/styles.css or js/main.js. */
const STRINGS = {
  en: {
    heading:     'Guests planning their Bali trip right now',
    description: 'Approximate locations of recent visitors to this site. Estimated from the connection, at city level at best — we never record anyone’s IP address.',
    total:       'Total visitors',
    online:      'Online now',
    places:      'Places',
    past:        'Recent visitors',
    origins:     'Visitors from',
    more:        (n) => `+${n} more`,
    loading:     'Loading visitor statistics…',
    noCountries: 'Countries appear once visits are recorded.',
    empty:       'Visitor records will appear here.',
    offline:     'Visitor statistics are not available right now.',
    canvasLabel: 'Rotating globe showing approximate visitor locations',
    canvasNoMap: 'Visitor globe; country boundary data could not be loaded',
  },
  id: {
    heading:     'Tamu yang sedang merencanakan perjalanan ke Bali',
    description: 'Perkiraan lokasi pengunjung terbaru situs ini. Diperkirakan dari koneksi, paling detail sampai tingkat kota — kami tidak pernah menyimpan alamat IP siapa pun.',
    total:       'Total pengunjung',
    online:      'Sedang online',
    places:      'Lokasi',
    past:        'Pengunjung terbaru',
    origins:     'Pengunjung dari',
    more:        (n) => `+${n} lainnya`,
    loading:     'Memuat statistik pengunjung…',
    noCountries: 'Negara akan muncul setelah ada kunjungan.',
    empty:       'Catatan pengunjung akan muncul di sini.',
    offline:     'Statistik pengunjung sedang tidak tersedia.',
    canvasLabel: 'Bola dunia berputar yang menampilkan perkiraan lokasi pengunjung',
    canvasNoMap: 'Bola dunia pengunjung; data batas negara gagal dimuat',
  },
  zh: {
    heading:     '正在规划巴厘岛之旅的访客',
    description: '本站近期访客的大致位置。位置根据网络连接估算，最精确到城市级别 —— 我们从不记录任何人的 IP 地址。',
    total:       '访客总数',
    online:      '当前在线',
    places:      '地点',
    past:        '最近访客',
    origins:     '访客来自',
    more:        (n) => `另有 ${n} 个`,
    loading:     '正在加载访客统计…',
    noCountries: '有访问记录后将显示国家/地区。',
    empty:       '访客记录将显示在此处。',
    offline:     '访客统计暂时不可用。',
    canvasLabel: '显示访客大致位置的旋转地球仪',
    canvasNoMap: '访客地球仪；国家边界数据加载失败',
  },
};

const NUMBER_LOCALE = { en: 'en-US', id: 'id-ID', zh: 'zh-CN' };

/* Regional indicator pair from an ISO alpha-2 code — no image assets and
   no lookup table. Windows browsers render these as the letter pair (AU)
   rather than a flag; that is a font gap, not a bug, and it still reads. */
const flagEmoji = (cc) =>
  String(cc || '').toUpperCase().replace(/[^A-Z]/g, '')
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

const MAX_COUNTRIES_SHOWN = 8;

class VisitorGlobe extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.stats = { total_visits: 0, online_now: 0, countries: [], locations: [] };
    this.countryRings = [];
    this.rotation = -35;
    this.frame = 0;
    this.recordOffset = 0;
    this.intervals = [];
    this.animationFrame = 0;
    this.mapFailed = false;
    this.offline = false;
    this.onVisibilityChange = () => {
      this.syncPolling();
      // requestAnimationFrame does not fire in a background tab, so the
      // draw loop has already returned by the time we get here — restart it.
      if (!document.hidden && this.visible && !this.reducedMotion && !this.animationFrame) {
        this.drawLoop();
      }
    };
  }

  /* ── lifecycle ──────────────────────────────────────── */

  connectedCallback() {
    if (this.started) return;
    this.started = true;

    this.endpoint = this.getAttribute('endpoint') || '/api/visitors';
    this.mapSource = this.getAttribute('map-src') || '/src/assets/countries-110m.json';
    // 60 s reacts fast enough to feel live and is comfortably inside the
    // server's 300 s presence window, so a visitor gets four chances to
    // re-register before they are dropped from "online now".
    this.refreshMs = Math.max(30000, Number(this.getAttribute('refresh-ms')) || 60000);
    const spinAttribute = this.getAttribute('spin-speed');
    const requestedSpin = spinAttribute === null ? 0.22 : Number(spinAttribute);
    this.spinSpeed = Number.isFinite(requestedSpin) ? Math.max(0, requestedSpin) : 0.22;
    this.demo = this.hasAttribute('demo');
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.render();

    this.canvas = this.shadowRoot.querySelector('.vg-canvas');
    this.stage = this.shadowRoot.querySelector('.vg-stage');
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.totalElement = this.shadowRoot.querySelector('.vg-total');
    this.onlineElement = this.shadowRoot.querySelector('.vg-online-n');
    this.placesElement = this.shadowRoot.querySelector('.vg-places');
    this.metaElement = this.shadowRoot.querySelector('.vg-meta');
    this.recordList = this.shadowRoot.querySelector('.vg-record-list');
    this.countryList = this.shadowRoot.querySelector('.vg-countries');
    this.panel = this.shadowRoot.querySelector('.vg-panel');

    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(this.stage);
    this.resizeCanvas();

    // Count the visit straight away. Deferring this behind the observer
    // below would quietly redefine "total visitors" as "people who
    // scrolled far enough to see the globe".
    if (!this.demo) this.postVisitOnce();

    /* Everything else waits until the card is on screen: the ~105 KB
       country topology, the stats poll and the animation loop all stay
       off the critical path for a visitor who never scrolls this far.
       The observer also pauses the draw loop on the way out. */
    this.viewObserver = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !this.activated) this.activate();
      this.visible = visible;
      if (visible && !this.reducedMotion && !this.animationFrame) this.drawLoop();
      this.syncPolling();
    }, { rootMargin: '200px' });
    this.viewObserver.observe(this);

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  activate() {
    this.activated = true;
    this.loadCountries();

    if (this.demo) {
      this.stats = demoStats;
      this.updateStatsText();
      this.renderVisitorRecords();
      this.renderCountries();
    } else {
      this.loadStats();
    }

    if (!this.reducedMotion) {
      this.intervals.push(window.setInterval(() => this.rotateRecords(), 2600));
    }
    this.drawGlobe();
  }

  disconnectedCallback() {
    this.stopPolling();
    this.intervals.forEach((interval) => window.clearInterval(interval));
    this.intervals = [];
    this.resizeObserver?.disconnect();
    this.viewObserver?.disconnect();
    window.cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.started = false;
  }

  /* ── polling ────────────────────────────────────────── */

  /* The poll doubles as the presence heartbeat, so "online now" means
     "tabs currently in the foreground" rather than "tabs left open since
     Tuesday". A background tab that kept polling would still be counted
     as a person looking at the page, which is not what a reader assumes
     the number means — so a hidden tab stops polling and drops out of the
     count within the server's five-minute window. */
  syncPolling() {
    const shouldPoll = this.activated && !this.demo && this.visible && !document.hidden;
    if (shouldPoll) this.startPolling();
    else this.stopPolling();
  }

  startPolling() {
    if (this.pollTimer) return;
    this.pollTimer = window.setInterval(() => this.loadStats(), this.refreshMs);
    this.loadStats();
  }

  stopPolling() {
    if (!this.pollTimer) return;
    window.clearInterval(this.pollTimer);
    this.pollTimer = 0;
  }

  /* ── language ───────────────────────────────────────── */

  get t() {
    return STRINGS[this.lang] || STRINGS.en;
  }

  /* The language is fixed for the life of the page: this site serves
     /, /id/ and /zh/ as separate documents. Same source of truth as
     js/reviews.js. */
  readLang() {
    const code = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
    return STRINGS[code] ? code : 'en';
  }

  applyLanguage() {
    const t = this.t;
    const attr = (base) =>
      (this.lang === 'en' ? null : this.getAttribute(`${base}-${this.lang}`)) ||
      this.getAttribute(base);
    const set = (selector, text) => {
      const node = this.shadowRoot.querySelector(selector);
      if (node) node.textContent = text;
    };
    set('.vg-heading', attr('heading') || t.heading);
    set('.vg-description', attr('description') || t.description);
    set('.vg-total-label', t.total);
    set('.vg-online-label', t.online);
    set('.vg-places-label', t.places);
    set('.vg-past-label', t.past);
    set('.vg-origins-label', t.origins);
    this.canvas?.setAttribute('aria-label', this.mapFailed ? t.canvasNoMap : t.canvasLabel);
  }

  /* ── markup ─────────────────────────────────────────── */

  render() {
    this.shadowRoot.innerHTML = `
      <style>${templateStyles}</style>
      <article class="vg-panel">
        <div class="vg-head"><h3 class="vg-heading"></h3></div>
        <p class="vg-description"></p>

        <div class="vg-counter" aria-live="polite">
          <div class="vg-stat vg-stat--total">
            <strong class="vg-total">&ndash;</strong>
            <span class="vg-total-label"></span>
          </div>
          <div class="vg-stat vg-stat--online">
            <span class="vg-online-head">
              <i class="vg-live-dot" aria-hidden="true"></i>
              <strong class="vg-online-n">&ndash;</strong>
            </span>
            <span class="vg-online-label"></span>
          </div>
          <div class="vg-stat vg-stat--places">
            <strong class="vg-places">&ndash;</strong>
            <span class="vg-places-label"></span>
          </div>
        </div>

        <div class="vg-body">
          <div class="vg-stage">
            <canvas class="vg-canvas" width="520" height="520" role="img"></canvas>
          </div>
          <div class="vg-side">
            <div class="vg-records-head">
              <span class="vg-past-label"></span>
              <i class="vg-records-line" aria-hidden="true"></i>
            </div>
            <div class="vg-record-list" aria-live="polite"></div>
          </div>
        </div>

        <div class="vg-origins">
          <div class="vg-records-head">
            <span class="vg-origins-label"></span>
            <i class="vg-records-line" aria-hidden="true"></i>
          </div>
          <ul class="vg-countries" aria-live="polite"></ul>
        </div>

        <small class="vg-meta"></small>
      </article>
    `;
    this.lang = this.readLang();
    this.numberFormat = new Intl.NumberFormat(NUMBER_LOCALE[this.lang] || 'en-US');
    this.applyLanguage();
    this.shadowRoot.querySelector('.vg-panel').dataset.state = 'loading';
    this.shadowRoot.querySelector('.vg-meta').textContent = this.t.loading;
  }

  /* ── network ────────────────────────────────────────── */

  safeStorage(storage, action, fallback = null) {
    try {
      return action(storage);
    } catch {
      return fallback;
    }
  }

  /* Session-scoped only — deliberately NOT localStorage (see header note
     3). It exists so two tabs in one session are not counted twice and so
     the heartbeat can recognise this session; the authoritative dedupe is
     server-side. It dies when the tab closes, which is what keeps it from
     being a tracking identifier. */
  ensureVisitorId() {
    const key = 'brv-visitor-globe-id';
    const existing = this.safeStorage(window.sessionStorage, (s) => s.getItem(key), '');
    if (existing) return existing;
    if (!this.fallbackVisitorId) {
      this.fallbackVisitorId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    }
    this.safeStorage(window.sessionStorage, (s) => s.setItem(key, this.fallbackVisitorId));
    return this.fallbackVisitorId;
  }

  currentLocationGuess() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const fallback = timezoneLocations[timezone] || { cc: '', city: '', region: '', country: '', lat: 20, lng: 0 };
    return {
      visitor_id: this.ensureVisitorId(),
      timezone,
      cc: fallback.cc,
      city: fallback.city,
      region: fallback.region,
      country: fallback.country,
      lat: fallback.lat,
      lng: fallback.lng,
    };
  }

  async postVisitOnce() {
    const key = `brv-visitor-globe-sent:${this.endpoint}`;
    if (this.safeStorage(window.sessionStorage, (s) => s.getItem(key), '')) return;
    this.safeStorage(window.sessionStorage, (s) => s.setItem(key, '1'));
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentLocationGuess()),
        keepalive: true,
      });
      if (!response.ok) return;
      // The POST answers with the same body as GET, so the card can show
      // real numbers the instant it scrolls into view, with no extra round
      // trip. Only seed if a poll has not already produced fresher data.
      if (!this.loadedOnce) this.applyStats(await response.json());
    } catch {
      // Let the next page view try again rather than silently never counting.
      this.safeStorage(window.sessionStorage, (s) => s.removeItem(key));
    }
  }

  async loadStats() {
    try {
      // The ping is the presence heartbeat. The server writes at most once
      // every 120 s per session, so polling more often costs reads, not writes.
      const url = `${this.endpoint}?ping=${encodeURIComponent(this.ensureVisitorId())}`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Visitor API unavailable');
      this.loadedOnce = true;
      this.offline = false;
      this.applyStats(await response.json());
    } catch {
      // Fail quiet. The card keeps its globe and shows one short line; the
      // rest of the page must never notice that the API is down.
      this.offline = true;
      // Only fall back to the stripped-down card if we have nothing to show.
      // A poll that fails after data has already loaded should leave the real
      // numbers on screen, not blank the card over one dropped request.
      if (!this.loadedOnce) this.setState('offline');
      if (this.metaElement) this.metaElement.textContent = this.t.offline;
    }
  }

  setState(state) {
    if (this.panel) this.panel.dataset.state = state;
  }

  applyStats(stats) {
    if (!stats || typeof stats !== 'object') return;
    this.stats = stats;
    this.offline = false;
    this.setState('ready');
    this.updateStatsText();
    this.renderVisitorRecords();
    this.renderCountries();
    if (this.reducedMotion) this.drawGlobe();
  }

  /* ── topology (upstream) ────────────────────────────── */

  decodeTopology(topology) {
    const transform = topology.transform || { scale: [1, 1], translate: [0, 0] };
    const decodedArcs = topology.arcs.map((arc) => {
      let x = 0;
      let y = 0;
      return arc.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [
          x * transform.scale[0] + transform.translate[0],
          y * transform.scale[1] + transform.translate[1],
        ];
      });
    });
    const arcPoints = (index) => (index >= 0 ? decodedArcs[index] : [...decodedArcs[~index]].reverse());
    const ringFromArcs = (arcIndexes) => {
      const ring = [];
      arcIndexes.forEach((arcIndex, index) => {
        const points = arcPoints(arcIndex);
        ring.push(...(index ? points.slice(1) : points));
      });
      return ring;
    };

    const rings = [];
    const countries = topology.objects?.countries?.geometries || [];
    countries.forEach((geometry) => {
      if (geometry.type === 'Polygon') {
        geometry.arcs.forEach((ring) => rings.push(ringFromArcs(ring)));
      } else if (geometry.type === 'MultiPolygon') {
        geometry.arcs.forEach((polygon) => polygon.forEach((ring) => rings.push(ringFromArcs(ring))));
      }
    });
    return rings.filter((ring) => ring.length > 2);
  }

  async loadCountries() {
    try {
      const response = await fetch(this.mapSource, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Country data unavailable');
      this.countryRings = this.decodeTopology(await response.json());
      if (this.reducedMotion) this.drawGlobe();
    } catch {
      // A globe with no coastlines still works as a globe.
      this.countryRings = [];
      this.mapFailed = true;
      this.canvas.setAttribute('aria-label', this.t.canvasNoMap);
    }
  }

  /* ── stats text & records ───────────────────────────── */

  normalizeLocation(location) {
    const country = String(location.country || '').trim();
    const region = String(location.region || '').trim();
    let city = String(location.city || '').trim();
    const label = String(location.label || '').trim();
    if (!city && label.includes(',')) city = label.split(',')[0].trim();
    return { country, region, city, label };
  }

  displayPlace(location) {
    const n = this.normalizeLocation(location);
    if (n.city && n.country) return `${n.city}, ${n.country}`;
    return n.country || n.city || n.region || n.label || '—';
  }

  groupedVisitorRecords() {
    const locations = Array.isArray(this.stats.locations) ? this.stats.locations : [];
    const grouped = new Map();
    locations.forEach((location) => {
      const place = this.displayPlace(location);
      const existing = grouped.get(place) || { place, count: 0, lastSeen: '' };
      existing.count += Number(location.count) || 1;
      existing.lastSeen = String(location.last_seen || existing.lastSeen);
      grouped.set(place, existing);
    });
    return [...grouped.values()].sort(
      (a, b) => b.lastSeen.localeCompare(a.lastSeen) || (b.count - a.count),
    );
  }

  visitorRecords() {
    return this.groupedVisitorRecords().map((record) =>
      (record.count > 1 ? `${record.place} (${this.formatNumber(record.count)})` : record.place));
  }

  // A five-digit counter with no separators reads as noise.
  formatNumber(value) {
    const n = Number(value);
    return this.numberFormat.format(Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0);
  }

  updateStatsText() {
    if (!this.totalElement) return;
    this.totalElement.textContent = this.formatNumber(this.stats.total_visits);
    this.onlineElement.textContent = this.formatNumber(this.stats.online_now);
    this.placesElement.textContent = this.formatNumber(this.groupedVisitorRecords().length);
    this.metaElement.textContent = '';
  }

  renderVisitorRecords() {
    if (!this.recordList) return;
    const records = this.visitorRecords();
    this.recordList.replaceChildren();
    if (!records.length) {
      const empty = document.createElement('div');
      empty.className = 'vg-empty';
      empty.textContent = this.t.empty;
      this.recordList.append(empty);
      return;
    }

    const visibleCount = Math.min(5, records.length);
    for (let index = 0; index < visibleCount; index += 1) {
      const recordIndex = (this.recordOffset + index) % records.length;
      const item = document.createElement('div');
      item.className = 'vg-record';
      item.dataset.current = String(recordIndex === 0);
      // Place names come from a geolocation database via the API —
      // untrusted text, so textContent only, never innerHTML.
      item.textContent = records[recordIndex];
      this.recordList.append(item);
    }
  }

  /* A long list of every country buries the interesting part, which is
     that guests come from everywhere. Top N, then a remainder chip. */
  renderCountries() {
    if (!this.countryList) return;
    const countries = (Array.isArray(this.stats.countries) ? this.stats.countries : [])
      .filter((c) => c && /^[A-Za-z]{2}$/.test(String(c.code || '')));
    this.countryList.replaceChildren();

    if (!countries.length) {
      const empty = document.createElement('li');
      empty.className = 'vg-empty';
      empty.textContent = this.t.noCountries;
      this.countryList.append(empty);
      return;
    }

    countries.slice(0, MAX_COUNTRIES_SHOWN).forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'vg-country';

      const flag = document.createElement('span');
      flag.setAttribute('aria-hidden', 'true');
      flag.textContent = flagEmoji(entry.code);

      const name = document.createElement('b');
      // Country names come from the API — textContent, same rule as above.
      name.textContent = String(entry.name || entry.code);

      const count = document.createElement('em');
      count.textContent = this.formatNumber(entry.count);

      item.append(flag, name, count);
      this.countryList.append(item);
    });

    const remainder = countries.length - MAX_COUNTRIES_SHOWN;
    if (remainder > 0) {
      const more = document.createElement('li');
      more.className = 'vg-country vg-country--more';
      more.textContent = this.t.more(this.formatNumber(remainder));
      this.countryList.append(more);
    }
  }

  rotateRecords() {
    const records = this.visitorRecords();
    if (records.length <= 1) return;
    this.recordOffset = (this.recordOffset + 1) % records.length;
    this.renderVisitorRecords();
  }

  /* ── canvas (upstream, re-tokenised colours) ────────── */

  resizeCanvas() {
    if (!this.stage || !this.canvas || !this.ctx) return;
    const size = Math.max(160, Math.min(320, this.stage.clientWidth || 260));
    this.canvas.width = Math.floor(size * this.dpr);
    this.canvas.height = Math.floor(size * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.reducedMotion) this.drawGlobe();
  }

  project(lat, lng, radius, centerX, centerY) {
    const lambda = ((lng + this.rotation) * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(phi) * Math.sin(lambda),
      y: centerY - radius * Math.sin(phi),
      z: Math.cos(phi) * Math.cos(lambda),
    };
  }

  color(name, fallback) {
    return getComputedStyle(this).getPropertyValue(name).trim() || fallback;
  }

  /* Hex only. rgb(), hsl() and color-mix() silently fall back to the
     default here — write literal hex in the host stylesheet. */
  rgb(color, fallback) {
    const value = color.trim();
    const short = /^#([0-9a-f]{3})$/i.exec(value);
    if (short) return short[1].split('').map((part) => parseInt(part + part, 16));
    const full = /^#([0-9a-f]{6})$/i.exec(value);
    if (full) {
      return [
        parseInt(full[1].slice(0, 2), 16),
        parseInt(full[1].slice(2, 4), 16),
        parseInt(full[1].slice(4, 6), 16),
      ];
    }
    return fallback;
  }

  drawCountryRing(ring, radius, centerX, centerY) {
    let started = false;
    let visiblePoints = 0;
    this.ctx.beginPath();
    ring.forEach(([lng, lat]) => {
      const point = this.project(lat, lng, radius, centerX, centerY);
      if (point.z < -0.02) {
        started = false;
        return;
      }
      visiblePoints += 1;
      if (!started) {
        this.ctx.moveTo(point.x, point.y);
        started = true;
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    });
    if (visiblePoints < 3) return;
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawCountries(radius, centerX, centerY) {
    if (!this.countryRings.length) return;
    this.ctx.fillStyle = this.color('--vg-land', '#0e5b73');
    this.ctx.strokeStyle = this.color('--vg-coast', 'rgba(255,255,255,0.45)');
    this.ctx.lineWidth = 0.5;
    this.countryRings.forEach((ring) => this.drawCountryRing(ring, radius, centerX, centerY));
  }

  drawVisitorPoints(radius, centerX, centerY) {
    const locations = this.stats.locations?.length ? this.stats.locations : [];
    if (!locations.length) return;
    const newestSeen = Math.max(...locations.map((location) => Date.parse(location.last_seen || 0) || 0));
    const pastColor = this.rgb(this.color('--vg-past', '#ff6b4a'), [255, 107, 74]);
    const currentColor = this.rgb(this.color('--vg-current', '#13b5a6'), [19, 181, 166]);

    locations.forEach((location, index) => {
      const point = this.project(Number(location.lat) || 0, Number(location.lng) || 0, radius, centerX, centerY);
      if (point.z < -0.08) return;
      const alpha = Math.max(0.28, Math.min(1, point.z));
      const count = Number(location.count) || 1;
      const dotRadius = Math.min(7, 2.6 + Math.sqrt(count) * 0.9);
      const pulse = this.reducedMotion ? 1 : 1 + Math.sin(this.frame / 30 + index) * 0.14;
      const isCurrent = (Date.parse(location.last_seen || 0) || 0) === newestSeen;
      const [red, green, blue] = isCurrent ? currentColor : pastColor;

      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.22 * alpha})`;
      this.ctx.arc(point.x, point.y, dotRadius * 2.9 * pulse, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${0.95 * alpha})`;
      this.ctx.arc(point.x, point.y, dotRadius, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawGlobe() {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    const centerX = width / 2;
    const centerY = height / 2;
    // Leave room for the rim stroke so it is never clipped.
    const radius = Math.min(width, height) * 0.5 - 3;
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.fillStyle = this.color('--vg-ocean', '#dbeef6');
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.clip();
    this.drawCountries(radius, centerX, centerY);
    this.drawVisitorPoints(radius, centerX, centerY);
    this.ctx.restore();

    this.ctx.strokeStyle = this.color('--vg-rim', '#00557f');
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawLoop() {
    this.drawGlobe();
    // Stop spinning when the card scrolls away or the tab goes to the
    // background — no point burning a frame budget nobody is looking at.
    if (this.reducedMotion || !this.visible || document.hidden) {
      this.animationFrame = 0;
      return;
    }
    this.frame += 1;
    this.rotation += this.spinSpeed;
    this.animationFrame = window.requestAnimationFrame(() => this.drawLoop());
  }
}

if (!customElements.get('visitor-globe')) {
  customElements.define('visitor-globe', VisitorGlobe);
}
