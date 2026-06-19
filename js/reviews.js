// reviews.js — customer testimonials backed by Convex.
// Loads as an ES module:  <script type="module" src="/js/reviews.js"></script>
//
// 1) Set your Convex deployment URL below (or define window.CONVEX_URL before this loads).
// 2) Pin the esm.sh version to match the `convex` version in your package.json if you can.

import { ConvexHttpClient } from "https://esm.sh/convex/browser";
import { anyApi } from "https://esm.sh/convex/server";

// --- config ---------------------------------------------------------------
const CONVEX_URL =
  (typeof window !== "undefined" && window.CONVEX_URL) ||
  "https://colorless-gnu-950.convex.cloud";

// --- localized UI strings -------------------------------------------------
const TOURS = [
  { value: "West Nusa Penida Tour",        en: "West Nusa Penida Tour",        id: "Tur Nusa Penida Barat",                 zh: "西佩尼达岛之旅" },
  { value: "East Nusa Penida Tour",        en: "East Nusa Penida Tour",        id: "Tur Nusa Penida Timur",                 zh: "东佩尼达岛之旅" },
  { value: "Nusa Penida Snorkeling",       en: "Nusa Penida Snorkeling",       id: "Snorkeling Nusa Penida",                zh: "佩尼达岛浮潜" },
  { value: "Uluwatu Full Day Tour",        en: "Uluwatu Full Day Tour",        id: "Tur Sehari Penuh Uluwatu",              zh: "乌鲁瓦图全日游" },
  { value: "Sekumpul Waterfall Tour",      en: "Sekumpul Waterfall Tour",      id: "Tur Air Terjun Sekumpul",               zh: "赛库普瀑布之旅" },
  { value: "North Bali Canyoning",         en: "North Bali Canyoning",         id: "Canyoning Bali Utara",                  zh: "北巴厘岛峡谷探险" },
  { value: "Mount Batur Sunrise Trekking", en: "Mount Batur Sunrise Trekking", id: "Trekking Matahari Terbit Gunung Batur", zh: "巴图尔火山日出徒步" },
  { value: "Private Driver Tour",          en: "Private Driver Tour",          id: "Tur Sopir Pribadi",                     zh: "专属司机之旅" },
];

const I18N = {
  en: {
    heading: "What Our Travelers Say", formHeading: "Share your experience",
    ratingLabel: "Your rating", nameLabel: "Your name", locationLabel: "Country (optional)",
    tourLabel: "Which tour? (optional)", tourPlaceholder: "Select a tour…",
    commentLabel: "Your experience", submit: "Submit Review", submitting: "Sending…",
    loading: "Loading reviews…", empty: "Be the first to share your experience!",
    error: "Couldn't load reviews right now. Please try again later.",
    needRating: "Please choose a star rating.",
    needName: "Please enter your name.",
    needComment: "Please write a few words about your experience.",
    success: "Thank you! Your review will appear here once our team approves it.",
    failed: "Sorry, something went wrong. Please try again.",
  },
  id: {
    heading: "Apa Kata Wisatawan Kami", formHeading: "Bagikan pengalaman Anda",
    ratingLabel: "Penilaian Anda", nameLabel: "Nama Anda", locationLabel: "Negara (opsional)",
    tourLabel: "Tur yang mana? (opsional)", tourPlaceholder: "Pilih tur…",
    commentLabel: "Pengalaman Anda", submit: "Kirim Ulasan", submitting: "Mengirim…",
    loading: "Memuat ulasan…", empty: "Jadilah yang pertama membagikan pengalaman Anda!",
    error: "Tidak dapat memuat ulasan saat ini. Silakan coba lagi nanti.",
    needRating: "Silakan pilih penilaian bintang.",
    needName: "Silakan masukkan nama Anda.",
    needComment: "Silakan tulis beberapa kata tentang pengalaman Anda.",
    success: "Terima kasih! Ulasan Anda akan tampil di sini setelah disetujui tim kami.",
    failed: "Maaf, terjadi kesalahan. Silakan coba lagi.",
  },
  zh: {
    heading: "游客怎么说", formHeading: "分享您的体验",
    ratingLabel: "您的评分", nameLabel: "您的姓名", locationLabel: "国家（可选）",
    tourLabel: "哪个行程？（可选）", tourPlaceholder: "选择一个行程…",
    commentLabel: "您的体验", submit: "提交评价", submitting: "提交中…",
    loading: "正在加载评价…", empty: "成为第一个分享体验的人吧！",
    error: "目前无法加载评价，请稍后再试。",
    needRating: "请选择星级评分。",
    needName: "请输入您的姓名。",
    needComment: "请写几句关于您体验的话。",
    success: "谢谢！您的评价将在我们团队审核后显示在此处。",
    failed: "抱歉，出现了错误，请重试。",
  },
};

const LANG = (() => {
  const l = (document.documentElement.lang || "en").slice(0, 2).toLowerCase();
  return I18N[l] ? l : "en";
})();
const t = I18N[LANG];
const tourLabel = (value) => {
  const row = TOURS.find((x) => x.value === value);
  return row ? row[LANG] || row.en : value;
};

// --- helpers --------------------------------------------------------------
const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, opts = {}, ...children) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text; // textContent = XSS-safe
  if (opts.attrs) for (const [k, val] of Object.entries(opts.attrs)) node.setAttribute(k, val);
  for (const c of children) if (c) node.appendChild(c);
  return node;
}

function starIcons(rating) {
  const wrap = el("div", { class: "stars" });
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  for (let i = 1; i <= 5; i++) {
    let cls = "fa-solid fa-star";
    let style = "color:#d9d9d9";
    if (i <= full) style = "color:#FFB400";
    else if (half && i === full + 1) { cls = "fa-solid fa-star-half-stroke"; style = "color:#FFB400"; }
    wrap.appendChild(el("i", { attrs: { class: cls, style, "aria-hidden": "true" } }));
  }
  return wrap;
}

function reviewCard(r) {
  const card = el("div", { class: "testimonial-card" });
  card.appendChild(el("i", { attrs: { class: "fa-solid fa-quote-left quote-icon", "aria-hidden": "true" } }));

  const body = el("div");
  body.appendChild(starIcons(r.rating));
  body.appendChild(el("p", { class: "review-text", text: `"${r.comment}"` }));
  if (r.tour) {
    body.appendChild(el("p", {
      text: tourLabel(r.tour),
      attrs: { style: "margin-top:8px;font-size:.82rem;color:var(--primary-color,#005B96);font-weight:600" },
    }));
  }
  card.appendChild(body);

  const reviewer = el("div", { class: "reviewer" });
  reviewer.appendChild(el("h4", { text: r.name }));
  if (r.location) reviewer.appendChild(el("span", { text: r.location }));
  card.appendChild(reviewer);
  return card;
}

// --- init -----------------------------------------------------------------
const form = $("#rv-form");
if (form) {
  // already-configured check
  const configured = !CONVEX_URL.includes("YOUR-DEPLOYMENT");
  const convex = configured ? new ConvexHttpClient(CONVEX_URL) : null;

  // localize all [data-rv] labels
  document.querySelectorAll("[data-rv]").forEach((node) => {
    const key = node.getAttribute("data-rv");
    if (t[key]) node.textContent = t[key];
  });

  // build tour <select>
  const tourSel = $("#rv-tour");
  tourSel.appendChild(el("option", { text: t.tourPlaceholder, attrs: { value: "" } }));
  TOURS.forEach((row) =>
    tourSel.appendChild(el("option", { text: row[LANG] || row.en, attrs: { value: row.value } }))
  );

  // star rating widget
  const starsWrap = $("#rv-stars");
  const ratingInput = $("#rv-rating");
  let current = 0;
  const paint = (n) =>
    starsWrap.querySelectorAll(".rv-star").forEach((b, i) => b.classList.toggle("on", i < n));
  for (let i = 1; i <= 5; i++) {
    const b = el("button", {
      class: "rv-star",
      attrs: { type: "button", "data-value": String(i), role: "radio", "aria-label": `${i}`, "aria-checked": "false" },
    });
    b.appendChild(el("i", { attrs: { class: "fa-solid fa-star", "aria-hidden": "true" } }));
    b.addEventListener("click", () => {
      current = i; ratingInput.value = String(i); paint(i);
      starsWrap.querySelectorAll(".rv-star").forEach((x, idx) =>
        x.setAttribute("aria-checked", idx === i - 1 ? "true" : "false"));
    });
    b.addEventListener("mouseenter", () => paint(i));
    starsWrap.appendChild(b);
  }
  starsWrap.addEventListener("mouseleave", () => paint(current));

  // load + render approved reviews
  const list = $("#rv-list");
  const setState = (msg) => { list.replaceChildren(el("p", { class: "rv-state", text: msg })); };
  async function loadReviews() {
    if (!convex) { setState(t.error); return; }
    try {
      const rows = await convex.query(anyApi.reviews.listApproved, { limit: 12 });
      if (!rows.length) { setState(t.empty); return; }
      list.replaceChildren(...rows.map(reviewCard));
    } catch (e) {
      console.error("[reviews] load failed:", e);
      setState(t.error);
    }
  }
  loadReviews();

  // submit handler
  const msg = $("#rv-msg");
  const submitBtn = $("#rv-submit");
  const showMsg = (text, ok) => { msg.textContent = text; msg.className = "rv-msg " + (ok ? "ok" : "err"); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#rv-name").value.trim();
    const comment = $("#rv-comment").value.trim();
    const rating = Number(ratingInput.value);

    if (!rating) return showMsg(t.needRating, false);
    if (!name) return showMsg(t.needName, false);
    if (comment.length < 10) return showMsg(t.needComment, false);
    if (!convex) return showMsg(t.failed, false);

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = t.submitting;
    try {
      await convex.mutation(anyApi.reviews.submit, {
        name,
        location: $("#rv-location").value.trim() || undefined,
        rating,
        comment,
        tour: $("#rv-tour").value || undefined,
        language: LANG,
        website: $("#rv-website").value, // honeypot
      });
      form.reset();
      current = 0; ratingInput.value = ""; paint(0);
      showMsg(t.success, true);
    } catch (err) {
      console.error("[reviews] submit failed:", err);
      showMsg(err?.message || t.failed, false);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}
