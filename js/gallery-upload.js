// gallery-upload.js — the crew's upload and approval tool for the guest
// gallery, at /gallery-upload.html (shell in pages/gallery-upload.njk).
//
// One page, two kinds of visitor, told apart by the access code they sign in
// with (see convex/photos.ts):
//   a driver  uploads their own photos and can delete their own
//   an admin  uploads for anyone, and approves, hides or deletes any photo
//
// Photos are shrunk here in the browser before they are sent — a 5 MB phone
// photo leaves as roughly 300 KB plus a small thumbnail. Redrawing the image
// also drops everything embedded in the original file, GPS position included.

const cfg = JSON.parse(document.querySelector("#gu-config").textContent);
const $ = (sel) => document.querySelector(sel);

// Longest edge and JPEG quality of the two copies. JPEG rather than WebP
// because every phone browser can write it; Safari cannot write WebP.
const FULL = { max: 1600, quality: 0.82 };
const THUMB = { max: 480, quality: 0.76 };
const MAX_BATCH = 20;

const CODE_STORE = "brv_gallery_code";
const LANG_STORE = "brv_gallery_lang";

const T = {
  id: {
    title: "Unggah Galeri", signOut: "Keluar", otherLang: "English",
    loginTitle: "Masuk", loginSub: "Masukkan kode akses pribadi Anda. Kode ini diberikan oleh Suta.",
    codeLabel: "Kode akses", signIn: "Masuk", checking: "Memeriksa…",
    badCode: "Kode tidak dikenali. Periksa lagi atau hubungi Suta.",
    offline: "Tidak dapat terhubung. Periksa koneksi internet Anda lalu coba lagi.",
    admin: "Admin", signedInAs: "Masuk sebagai",
    uploadTitle: "Tambah foto", uploadSub: "Pilih foto terbaik Anda bersama tamu. Foto diperkecil otomatis sebelum dikirim.",
    pick: "Pilih foto", driverLabel: "Sopir", tourLabel: "Tur", optional: "(opsional)",
    noTour: "— Tidak dipilih —", captionLabel: "Keterangan",
    consent: "Tamu di foto ini sudah setuju fotonya ditampilkan di situs web kami.",
    send: "Kirim foto", sending: "Mengirim", of: "dari",
    needPhotos: "Pilih minimal satu foto.", needConsent: "Centang persetujuan tamu terlebih dahulu.",
    tooMany: `Maksimal ${MAX_BATCH} foto sekali kirim.`,
    cantRead: "Foto ini tidak dapat dibuka",
    sentWait: "foto terkirim. Foto akan tampil setelah disetujui.",
    sentLive: "foto terkirim dan langsung tampil di galeri.",
    someFailed: "foto gagal dikirim. Coba kirim ulang yang bertanda merah.",
    reason_bad_code: "Kode akses tidak lagi berlaku. Silakan masuk kembali.",
    reason_no_consent: "Persetujuan tamu diperlukan.",
    reason_bad_file: "Berkas foto ditolak.",
    reason_too_many_pending: "Terlalu banyak foto menunggu persetujuan. Tunggu sampai disetujui dulu.",
    reason_no_driver: "Pilih sopirnya.", reason_not_allowed: "Anda tidak diizinkan melakukan ini.",
    listMine: "Foto Anda", listAll: "Semua foto",
    tabWait: "Menunggu", tabLive: "Tampil",
    emptyWait: "Tidak ada foto yang menunggu persetujuan.", emptyLive: "Belum ada foto yang tampil.",
    loading: "Memuat…", live: "Tampil", wait: "Menunggu persetujuan",
    approve: "Setujui", hide: "Sembunyikan", del: "Hapus", sure: "Yakin hapus?",
  },
  en: {
    title: "Gallery Upload", signOut: "Sign out", otherLang: "Bahasa",
    loginTitle: "Sign in", loginSub: "Enter your personal access code. Suta gives these out.",
    codeLabel: "Access code", signIn: "Sign in", checking: "Checking…",
    badCode: "That code is not recognised. Check it or ask Suta.",
    offline: "Couldn't connect. Check your internet connection and try again.",
    admin: "Admin", signedInAs: "Signed in as",
    uploadTitle: "Add photos", uploadSub: "Pick your best photos with guests. They are shrunk automatically before sending.",
    pick: "Choose photos", driverLabel: "Driver", tourLabel: "Tour", optional: "(optional)",
    noTour: "— Not chosen —", captionLabel: "Caption",
    consent: "The guests in these photos have agreed to appear on our website.",
    send: "Send photos", sending: "Sending", of: "of",
    needPhotos: "Choose at least one photo.", needConsent: "Tick the guest agreement first.",
    tooMany: `No more than ${MAX_BATCH} photos at a time.`,
    cantRead: "This photo could not be opened",
    sentWait: "photo(s) sent. They will appear once approved.",
    sentLive: "photo(s) sent and now showing in the gallery.",
    someFailed: "photo(s) failed. Try sending the ones marked red again.",
    reason_bad_code: "That access code no longer works. Please sign in again.",
    reason_no_consent: "The guests' agreement is required.",
    reason_bad_file: "The photo file was refused.",
    reason_too_many_pending: "Too many photos are waiting for approval. Wait for those first.",
    reason_no_driver: "Choose the driver.", reason_not_allowed: "You are not allowed to do that.",
    listMine: "Your photos", listAll: "All photos",
    tabWait: "Waiting", tabLive: "Showing",
    emptyWait: "No photos are waiting for approval.", emptyLive: "No photos are showing yet.",
    loading: "Loading…", live: "Showing", wait: "Waiting for approval",
    approve: "Approve", hide: "Hide", del: "Delete", sure: "Really delete?",
  },
};

const store = {
  get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } },
  set(k, val) { try { val ? localStorage.setItem(k, val) : localStorage.removeItem(k); } catch (e) {} },
};

let lang = store.get(LANG_STORE) === "en" ? "en" : "id";
let t = T[lang];
let code = store.get(CODE_STORE);
let who = null;      // { role: "admin" } | { role: "driver", driver }
let picked = [];     // [{ file, url, node, state }]
let rows = [];       // photos already sent
let tab = "wait";
let busy = false;

function el(tag, opts = {}, ...children) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text != null) node.textContent = opts.text; // textContent = XSS-safe
  if (opts.attrs) for (const [k, val] of Object.entries(opts.attrs)) node.setAttribute(k, val);
  for (const c of children) if (c) node.appendChild(c);
  return node;
}

const driverName = (slug) => (cfg.drivers.find((d) => d.slug === slug) || { name: slug }).name;
const tourLabel = (value) => {
  const row = cfg.tours.find((x) => x.value === value);
  return row ? row[lang] || row.en : value;
};

async function convex(kind, path, args) {
  const res = await fetch(cfg.convexUrl + "/api/" + kind, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args, format: "json" }),
  });
  const out = await res.json();
  if (out.status !== "success") throw new Error(out.errorMessage || "Convex rejected the call");
  return out.value;
}

const setMsg = (node, text, kind) => {
  node.textContent = text || "";
  node.className = "msg" + (kind ? " " + kind : "");
};
const reasonText = (reason) => t["reason_" + reason] || reason;

// --- language ---------------------------------------------------------------
function paint() {
  t = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach((n) => { n.textContent = t[n.dataset.t]; });
  $("#gu-lang").textContent = t.otherLang;

  const tourSel = $("#gu-tour");
  const keep = tourSel.value;
  tourSel.replaceChildren(
    el("option", { text: t.noTour, attrs: { value: "" } }),
    ...cfg.tours.map((x) => el("option", { text: x[lang] || x.en, attrs: { value: x.value } }))
  );
  tourSel.value = keep;

  if (who) {
    $("#gu-who").textContent =
      `${t.signedInAs} ${who.role === "admin" ? t.admin : driverName(who.driver)}`;
    $("#gu-list-title").textContent = who.role === "admin" ? t.listAll : t.listMine;
    renderRows();
  }
}
$("#gu-lang").addEventListener("click", () => {
  lang = lang === "id" ? "en" : "id";
  store.set(LANG_STORE, lang);
  paint();
});

// --- sign in / out ------------------------------------------------------------
function showLogin(message) {
  who = null;
  $("#gu-app").hidden = true;
  $("#gu-out").hidden = true;
  $("#gu-login").hidden = false;
  setMsg($("#gu-login-msg"), message || "", message ? "err" : "");
}

async function signIn(candidate, { quiet } = {}) {
  const btn = $("#gu-login-btn");
  btn.disabled = true;
  btn.textContent = t.checking;
  let found;
  try {
    found = await convex("query", "photos:whoami", { code: candidate });
  } catch (e) {
    console.error("[gallery-upload] sign-in failed:", e);
    showLogin(t.offline);
    return;
  } finally {
    btn.disabled = false;
    btn.textContent = t.signIn;
  }
  if (!found) {
    store.set(CODE_STORE, "");
    code = "";
    showLogin(quiet ? "" : t.badCode);
    return;
  }
  code = candidate;
  who = found;
  store.set(CODE_STORE, code);
  $("#gu-code").value = "";
  $("#gu-login").hidden = true;
  $("#gu-app").hidden = false;
  $("#gu-out").hidden = false;

  const isAdmin = who.role === "admin";
  $("#gu-driver-wrap").hidden = !isAdmin;
  $("#gu-driver").replaceChildren(
    ...cfg.drivers.map((d) => el("option", { text: d.name, attrs: { value: d.slug } }))
  );
  paint();
  loadRows();
}

$("#gu-login").addEventListener("submit", (e) => {
  e.preventDefault();
  const candidate = $("#gu-code").value.trim();
  if (candidate) signIn(candidate);
});
$("#gu-out").addEventListener("click", () => {
  store.set(CODE_STORE, "");
  code = "";
  clearPicked();
  showLogin();
});

// --- choosing photos ----------------------------------------------------------
function clearPicked() {
  picked.forEach((p) => URL.revokeObjectURL(p.url));
  picked = [];
  $("#gu-picked").replaceChildren();
}

function addPicked(file) {
  const url = URL.createObjectURL(file);
  const x = el("button", { class: "x", attrs: { type: "button", "aria-label": t.del } },
    el("i", { attrs: { class: "fa-solid fa-xmark", "aria-hidden": "true" } }));
  const node = el("div", { class: "p" }, el("img", { attrs: { src: url, alt: "" } }), x);
  const entry = { file, url, node, state: "new" };
  x.addEventListener("click", () => {
    if (busy) return;
    URL.revokeObjectURL(url);
    picked = picked.filter((p) => p !== entry);
    node.remove();
  });
  picked.push(entry);
  $("#gu-picked").appendChild(node);
}

$("#gu-pick").addEventListener("click", () => $("#gu-files").click());
$("#gu-files").addEventListener("change", (e) => {
  // A fresh choice after a finished batch starts a new batch.
  picked.filter((p) => p.state === "done").forEach((p) => { URL.revokeObjectURL(p.url); p.node.remove(); });
  picked = picked.filter((p) => p.state !== "done");
  setMsg($("#gu-msg"), "");
  for (const file of e.target.files) {
    if (picked.length >= MAX_BATCH) { setMsg($("#gu-msg"), t.tooMany, "err"); break; }
    addPicked(file);
  }
  e.target.value = ""; // so the same file can be chosen again
});

// --- shrinking ----------------------------------------------------------------
async function decode(file) {
  try {
    // Honours the rotation a phone records instead of applying.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (e) {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }
}

function resize(source, { max, quality }) {
  const sw = source.width || source.naturalWidth;
  const sh = source.height || source.naturalHeight;
  const scale = Math.min(1, max / Math.max(sw, sh));
  const width = Math.max(1, Math.round(sw * scale));
  const height = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // JPEG has no transparency
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, width, height }) : reject(new Error("encode"))),
      "image/jpeg",
      quality
    )
  );
}

// --- sending ------------------------------------------------------------------
async function putFile(blob) {
  const ticket = await convex("mutation", "photos:uploadUrl", { code });
  if (!ticket.ok) throw Object.assign(new Error(ticket.reason), { reason: ticket.reason });
  const res = await fetch(ticket.url, {
    method: "POST",
    headers: { "Content-Type": blob.type },
    body: blob,
  });
  if (!res.ok) throw new Error("upload HTTP " + res.status);
  return (await res.json()).storageId;
}

async function sendOne(entry, details) {
  let source;
  try {
    source = await decode(entry.file);
  } catch (e) {
    throw Object.assign(new Error("decode"), { text: `${t.cantRead}: ${entry.file.name}` });
  }
  const full = await resize(source, FULL);
  const thumb = await resize(source, THUMB);
  if (source.close) source.close();

  const fullId = await putFile(full.blob);
  const thumbId = await putFile(thumb.blob);
  const out = await convex("mutation", "photos:add", {
    code, thumbId, fullId, width: full.width, height: full.height, consent: true, ...details,
  });
  if (!out.ok) throw Object.assign(new Error(out.reason), { reason: out.reason });
  return out;
}

$("#gu-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (busy) return;
  const msg = $("#gu-msg");
  const todo = picked.filter((p) => p.state !== "done");
  if (!todo.length) return setMsg(msg, t.needPhotos, "err");
  if (!$("#gu-consent").checked) return setMsg(msg, t.needConsent, "err");

  const details = {};
  if (who.role === "admin") details.driver = $("#gu-driver").value;
  if ($("#gu-tour").value) details.tour = $("#gu-tour").value;
  if ($("#gu-caption").value.trim()) details.caption = $("#gu-caption").value.trim();

  busy = true;
  $("#gu-send").disabled = true;
  let sent = 0, failed = 0, lastError = "", approved = false;
  for (let i = 0; i < todo.length; i++) {
    const entry = todo[i];
    setMsg(msg, `${t.sending} ${i + 1} ${t.of} ${todo.length}…`, "info");
    entry.node.className = "p busy";
    try {
      const out = await sendOne(entry, details);
      approved = out.approved;
      entry.state = "done";
      entry.node.className = "p done";
      sent++;
    } catch (err) {
      console.error("[gallery-upload] send failed:", err);
      entry.state = "fail";
      entry.node.className = "p fail";
      failed++;
      lastError = err.text || (err.reason ? reasonText(err.reason) : t.offline);
      // A dead code or a full queue will fail every remaining photo the same way.
      if (err.reason === "bad_code" || err.reason === "too_many_pending") {
        todo.slice(i + 1).forEach((p) => { p.state = "fail"; p.node.className = "p fail"; failed++; });
        break;
      }
    }
  }
  busy = false;
  $("#gu-send").disabled = false;

  if (failed) setMsg(msg, `${sent ? sent + " ✓ · " : ""}${failed} ${t.someFailed} ${lastError}`, "err");
  else {
    setMsg(msg, `${sent} ${approved ? t.sentLive : t.sentWait}`, "ok");
    $("#gu-caption").value = "";
    $("#gu-consent").checked = false;
  }
  if (sent) loadRows();
});

// --- photos already sent ------------------------------------------------------
async function loadRows() {
  const note = $("#gu-list-msg");
  setMsg(note, t.loading, "info");
  try {
    const out = await convex("query", "photos:mine", { code });
    if (out === null) return showLogin(t.reason_bad_code);
    rows = out;
  } catch (e) {
    console.error("[gallery-upload] list failed:", e);
    return setMsg(note, t.offline, "err");
  }
  renderRows();
}

async function act(button, path, args) {
  button.disabled = true;
  try {
    const out = await convex("mutation", path, { code, ...args });
    if (!out.ok) setMsg($("#gu-list-msg"), reasonText(out.reason), "err");
  } catch (e) {
    console.error("[gallery-upload] action failed:", e);
    setMsg($("#gu-list-msg"), t.offline, "err");
    button.disabled = false;
    return;
  }
  loadRows();
}

function row(photo) {
  const info = el("div", { class: "info" }, el("b", { text: driverName(photo.driver) }));
  if (photo.tour) info.appendChild(el("div", { text: tourLabel(photo.tour) }));
  if (photo.caption) info.appendChild(el("div", { class: "cap", text: photo.caption }));
  info.appendChild(el("span", {
    class: "badge " + (photo.approved ? "live" : "wait"),
    text: photo.approved ? t.live : t.wait,
  }));

  const acts = el("div", { class: "acts" });
  if (who.role === "admin") {
    const toggle = el("button", {
      class: "act" + (photo.approved ? "" : " go"),
      text: photo.approved ? t.hide : t.approve,
      attrs: { type: "button" },
    });
    toggle.addEventListener("click", () =>
      act(toggle, "photos:setApproved", { id: photo.id, approved: !photo.approved }));
    acts.appendChild(toggle);
  }
  // Deleting cannot be undone, so it takes two taps on the same button.
  const del = el("button", { class: "act del", text: t.del, attrs: { type: "button" } });
  del.addEventListener("click", () => {
    if (!del.classList.contains("sure")) {
      del.classList.add("sure");
      del.textContent = t.sure;
      setTimeout(() => { del.classList.remove("sure"); del.textContent = t.del; }, 4000);
      return;
    }
    act(del, "photos:remove", { id: photo.id });
  });
  acts.appendChild(del);

  return el("li", { class: "row" },
    el("img", { attrs: { src: photo.thumb || "", alt: "", loading: "lazy" } }), info, acts);
}

function renderRows() {
  const wait = rows.filter((r) => !r.approved);
  const live = rows.filter((r) => r.approved);
  document.querySelectorAll("#gu-tabs .tab").forEach((b) => {
    const isWait = b.dataset.tab === "wait";
    b.textContent = `${isWait ? t.tabWait : t.tabLive} (${isWait ? wait.length : live.length})`;
    b.classList.toggle("is-on", b.dataset.tab === tab);
  });
  const list = tab === "wait" ? wait : live;
  setMsg($("#gu-list-msg"), list.length ? "" : tab === "wait" ? t.emptyWait : t.emptyLive, "info");
  $("#gu-rows").replaceChildren(...list.map(row));
}
document.querySelectorAll("#gu-tabs .tab").forEach((b) =>
  b.addEventListener("click", () => { tab = b.dataset.tab; renderRows(); }));

// --- start --------------------------------------------------------------------
paint();
if (code) signIn(code, { quiet: true });
else showLogin();
