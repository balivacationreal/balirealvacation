/* =========================================================
   Netlify Function: /api/visitors
   =========================================================
   The thin adapter. All of the logic lives in
   lib/visitors-core.mjs, which knows nothing about Netlify —
   this file supplies the two things only the platform can:

   • STORAGE — Netlify Blobs. `setJSON(key, value, { onlyIfMatch })`
     is the compare-and-set primitive the counter needs; without a
     precondition, two visitors arriving together silently lose an
     increment.

   • GEOLOCATION — `context.geo`, resolved at the edge. No IP ever
     leaves this function, and there is no third-party lookup on
     the hot path.

   Routed from /api/visitors by the redirect in netlify.toml.
   Local dev: `netlify dev` serves both; a plain `npx eleventy
   --serve` does not, and the widget degrades to a quiet
   "statistics unavailable" line, which is the intended failure.
   ========================================================= */
import { getStore } from '@netlify/blobs';
import { createVisitorsHandler } from './lib/visitors-core.mjs';

// Netlify sets URL to the site's primary address at build and at runtime.
const siteUrl = process.env.URL || 'https://balirealvacation.com';
const siteHost = (() => {
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return 'balirealvacation.com';
  }
})();

/* A site-specific pepper for the hash salt. It only has to be stable and not
   guessable from outside — the daily rotation itself comes from the date,
   which visitors-core.mjs mixes in. */
const salt = process.env.VISITOR_GLOBE_SALT || process.env.SITE_ID || siteHost;

/* Deploy previews and branch deploys share a site's blob storage, so without
   this they would count their own traffic into the live numbers. They get
   their own sandbox instead, and still render the card normally.

   Strong consistency because this is a counter: an eventually-consistent read
   hands back a stale ETag, the compare-and-set then fails, and we burn the
   retry budget re-reading the same stale value. The traffic here is far too
   small for the cost to matter. */
const storeName = process.env.CONTEXT === 'production' ? 'visitor-globe' : 'visitor-globe-preview';

// Built once per function instance so the summary cache inside the handler
// actually survives between requests on a warm instance.
let handler;

export default async (request, context) => {
  handler ||= createVisitorsHandler({
    store: getStore({ name: storeName, consistency: 'strong' }),
    siteHost,
    salt,
  });
  try {
    return await handler(request, context?.geo);
  } catch (error) {
    // Never let the widget take the page down with it. The card shows
    // "statistics unavailable" and nothing else on the page notices.
    console.error('visitor globe:', error);
    return new Response(
      JSON.stringify({ total_visits: 0, online_now: 0, places: 0, countries: [], locations: [] }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }
};

export const config = { path: '/api/visitors' };
