# Customer Reviews (Convex) — Setup

Replaces the hardcoded testimonial cards with real, customer-submitted reviews.
Nothing appears publicly until **you approve it**.

## Files in this package
- `convex/schema.ts` — the `reviews` table + index
- `convex/reviews.ts` — submit / list / stats functions (+ optional admin)
- `_includes/partials/testimonials.njk` — the section markup (form + live list)
- `js/reviews.js` — the browser logic (loads reviews, handles submit, localized EN/ID/ZH)

## 1. Add the backend
Copy `convex/schema.ts` and `convex/reviews.ts` into your project's `convex/` folder, then:

```bash
npx convex dev      # for development; use `npx convex deploy` for production
```

This creates the table + functions and prints your **Deployment URL** (looks like
`https://acoustic-otter-123.convex.cloud`). You can also find it in the Convex
dashboard under Settings → "URL & Deploy Key" → Deployment URL.
This URL is public and safe to expose in the browser — security is enforced by the
function validators, not by hiding the URL.

## 2. Point the frontend at your deployment
Open `js/reviews.js` and set the URL near the top:

```js
const CONVEX_URL = (window.CONVEX_URL) || "https://YOUR-DEPLOYMENT.convex.cloud";
```

Replace `YOUR-DEPLOYMENT...` with your deployment URL (or define
`window.CONVEX_URL = "..."` in a small inline script before the module loads).

Optional but recommended: pin the import versions to match the `convex` version in
your `package.json`, e.g. `https://esm.sh/convex@1.17.0/browser`.

## 3. Drop in the section + script
- Copy `js/reviews.js` into your `js/` folder and `testimonials.njk` into
  `_includes/partials/`.
- In **each** homepage (`pages/index.njk`, `pages/id/index.njk`, `pages/zh/index.njk`),
  delete the old `<section class="testimonials" id="reviews"> … </section>` block and
  replace it with:

  ```njk
  {% include "partials/testimonials.njk" %}
  ```

- Load the module once (in `_includes/layouts/base.njk`, just before `</body>`):

  ```html
  <script type="module" src="/js/reviews.js"></script>
  ```

  It self-guards on `#rv-form`, so it only does anything on pages that have the section.

Then rebuild (`npx @11ty/eleventy`) and you're live.

## 4. Approving reviews (the moderation step)
New submissions are saved with `approved: false`, so they never show on the site
automatically. To publish one:

- Convex dashboard → **Data** → `reviews` table → open the row → set **`approved`** to
  `true`. It appears on the next page load.

To **seed** the section at launch so it isn't empty, add a few of your real past
reviews directly in the dashboard with `approved: true`.

(Optional) If you'd rather approve from your own admin page later, set an `ADMIN_KEY`
environment variable in the Convex dashboard and use the included `pending` /
`setApproved` functions. Just ask and I'll build a small admin page.

## Good to know
- **One shared pool:** reviews show on all three language pages regardless of the
  language they were written in. Only the form/labels localize; the review text stays
  as the customer wrote it.
- **No CORS setup needed.** The Convex browser client talks to the `.convex.cloud`
  endpoint, which already allows browser origins — unlike the HTTP-actions approach,
  there's no www-vs-non-www CORS to wrestle with here.
- **Spam protection:** a honeypot field + server-side validation, and — most
  importantly — the approval gate means nothing reaches the public page without you.
- **Trust bar (optional):** the `stats` query returns `{ count, average }`. Wire it to
  your hero trust bar to show a live "4.9 / 5 from N reviews" instead of the hardcoded
  numbers. Ask if you'd like that wired up.
