// gallery.js — the guest gallery, backed by Convex.
// Loaded as an ES module by _includes/partials/gallery.njk, which also prints
// the #gal-config JSON this reads (drivers, tours, strings for the page's
// language, and the Convex address — all from _data/gallery.js).
//
// It fetches the approved photo list once, then filters and reveals it in the
// browser. Convex is called over its plain HTTP API, so unlike reviews.js this
// page needs no client library.

const $ = (sel) => document.querySelector(sel);

function el(tag, opts = {}, ...children) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text; // textContent = XSS-safe
  if (opts.attrs) for (const [k, val] of Object.entries(opts.attrs)) node.setAttribute(k, val);
  for (const c of children) if (c) node.appendChild(c);
  return node;
}

const configNode = $("#gal-config");
if (configNode) {
  const cfg = JSON.parse(configNode.textContent);
  const t = cfg.t;
  const LANG = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();

  const driverName = (slug) => {
    const row = cfg.drivers.find((d) => d.slug === slug);
    return row ? row.name : slug;
  };
  const tourLabel = (value) => {
    const row = cfg.tours.find((x) => x.value === value);
    return row ? row[LANG] || row.en : value;
  };

  const filters = $("#gal-filters");
  const chips = $("#gal-chips");
  const tourWrap = $("#gal-tour-wrap");
  const tourSel = $("#gal-tour");
  const state = $("#gal-state");
  const grid = $("#gal-grid");
  const more = $("#gal-more");

  let photos = [];  // every approved photo, newest first
  let shown = [];   // the ones matching the current filters
  let visible = 0;  // how many of `shown` are drawn

  // Filters live in the address (?driver=putu-ardi&tour=…) so a link from a
  // driver's card, or one a guest shares, opens the gallery already filtered.
  const params = new URLSearchParams(location.search);
  let driver = params.get("driver") || "";
  let tour = params.get("tour") || "";

  const setState = (msg) => {
    state.textContent = msg || "";
    state.hidden = !msg;
  };

  function syncUrl() {
    const p = new URLSearchParams();
    if (driver) p.set("driver", driver);
    if (tour) p.set("tour", tour);
    const qs = p.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
  }

  function tile(photo, index) {
    const name = driverName(photo.driver);
    const img = el("img", {
      attrs: {
        src: photo.thumb,
        alt: photo.caption || `${t.photoAlt} ${name}`,
        loading: "lazy",
        decoding: "async",
      },
    });
    const meta = el("span", { class: "gal-tile-meta" }, el("b", { text: name }));
    if (photo.tour) meta.appendChild(el("span", { text: tourLabel(photo.tour) }));
    const btn = el("button", { class: "gal-tile", attrs: { type: "button" } }, img, meta);
    btn.addEventListener("click", () => openLightbox(index));
    return el("li", {}, btn);
  }

  function drawMore() {
    const next = Math.min(visible + cfg.pageSize, shown.length);
    for (let i = visible; i < next; i++) grid.appendChild(tile(shown[i], i));
    visible = next;
    more.hidden = visible >= shown.length;
  }

  function applyFilters() {
    shown = photos.filter(
      (p) => (!driver || p.driver === driver) && (!tour || p.tour === tour)
    );
    chips.querySelectorAll(".gal-chip").forEach((c) => {
      const on = c.dataset.driver === driver;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    tourSel.value = tour;
    grid.replaceChildren();
    visible = 0;
    setState(shown.length ? "" : t.emptyFiltered);
    drawMore();
  }

  // Only drivers and tours that actually have a photo get a filter, so nobody
  // is offered a choice that leads to an empty page.
  function buildFilters() {
    const chip = (slug, label) => {
      const c = el("button", { class: "gal-chip", text: label, attrs: { type: "button", "data-driver": slug } });
      c.addEventListener("click", () => { driver = slug; syncUrl(); applyFilters(); });
      return c;
    };
    const withPhotos = cfg.drivers.filter((d) => photos.some((p) => p.driver === d.slug));
    chips.replaceChildren(chip("", t.all), ...withPhotos.map((d) => chip(d.slug, d.name)));

    const tours = cfg.tours.filter((x) => photos.some((p) => p.tour === x.value));
    tourSel.replaceChildren(
      el("option", { text: t.allTours, attrs: { value: "" } }),
      ...tours.map((x) => el("option", { text: x[LANG] || x.en, attrs: { value: x.value } }))
    );
    tourSel.addEventListener("change", () => { tour = tourSel.value; syncUrl(); applyFilters(); });
    tourWrap.hidden = tours.length < 2;

    // A filter from the address that matches nothing is dropped, not obeyed.
    if (!withPhotos.some((d) => d.slug === driver)) driver = "";
    if (!tours.some((x) => x.value === tour)) tour = "";

    filters.hidden = withPhotos.length < 2 && tours.length < 2;
  }

  // --- full-screen view ---------------------------------------------------
  const lb = $("#gal-lb");
  const lbImg = $("#gal-lb-img");
  const lbCap = $("#gal-lb-cap");
  const lbPrev = $("#gal-lb-prev");
  const lbNext = $("#gal-lb-next");
  let current = 0;

  function showPhoto(index) {
    current = index;
    const photo = shown[index];
    const name = driverName(photo.driver);
    // Sizing the box before the file arrives stops the caption jumping about.
    lbImg.width = photo.width;
    lbImg.height = photo.height;
    lbImg.src = photo.full;
    lbImg.alt = photo.caption || `${t.photoAlt} ${name}`;
    const credit = `${t.with} ${name}` + (photo.tour ? ` · ${tourLabel(photo.tour)}` : "");
    lbCap.replaceChildren(el("span", { text: credit }));
    if (photo.caption) lbCap.prepend(photo.caption);
    lbPrev.hidden = index === 0;
    lbNext.hidden = index === shown.length - 1;
  }
  const step = (by) => {
    const next = current + by;
    if (next >= 0 && next < shown.length) showPhoto(next);
  };
  function openLightbox(index) {
    showPhoto(index);
    lb.showModal();
  }

  $("#gal-lb-close").addEventListener("click", () => lb.close());
  lbPrev.addEventListener("click", () => step(-1));
  lbNext.addEventListener("click", () => step(1));
  // A click on the dark surround (the dialog itself, not the photo) closes it.
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("close", () => lbImg.removeAttribute("src"));
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  // Swipe left / right on a phone.
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });

  more.addEventListener("click", drawMore);

  // --- load -----------------------------------------------------------------
  async function load() {
    try {
      const res = await fetch(cfg.convexUrl + "/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "photos:listApproved", args: {}, format: "json" }),
      });
      const body = await res.json();
      if (body.status !== "success") throw new Error(body.errorMessage || "query failed");
      photos = body.value;
    } catch (e) {
      console.error("[gallery] load failed:", e);
      setState(t.error);
      return;
    }
    if (!photos.length) { setState(t.empty); return; }
    buildFilters();
    applyFilters();
  }
  load();
}
