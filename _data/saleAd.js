// "This website is for sale" — the floating advert shown on every page.
//
// The whole business (site, content, and the local connections behind it) is
// being sold by its owner, so this advert is site-wide rather than living on
// one page: it is rendered by partials/site-for-sale.njk, which layouts/base.njk
// includes for every page in every language.
//
// Switching it off:
//   active: false     → removes the advert from the whole site, no other edits
//   autoOpen: false   → keeps the pill, but it only ever opens on a click
//
// Contact goes to Suta, the owner, on his personal number — deliberately not
// the agency booking number in _data/site.js, which is answered by the team and
// is for guests, not buyers.
module.exports = {
  // Off at Suta's request (2026-10-06) — set back to true to bring it back.
  active: false,

  // The panel opens by itself once per visitor (see `snoozeDays`) so the offer
  // is not missed by someone who never notices the pill. It waits for the
  // homepage land pop-up to be gone first — two panels at once reads as spam.
  autoOpen: true,
  autoOpenDelayMs: 9000,

  // How long a dismissal is remembered, for the auto-open only: the pill itself
  // always stays put, so a buyer who closed the panel can still get back in.
  // Bump `storageKey` when the offer changes to re-show it to everyone.
  snoozeDays: 7,
  storageKey: "brv_site_sale_v1",

  owner: "Suta",
  ownerLegalName: "I Gede Suta Pinatih",
  whatsapp: "6281239156586",
  whatsappDisplay: "+62 812-3915-6586",
  tel: "+6281239156586",

  // Facts about what is on sale, shown as chips under the pitch. Each `key`
  // looks up its translated label in the i18n blocks below, so the numbers are
  // stated once per language and the icons once here. Keep these honest and in
  // step with the repo: 55 built pages across en/id/zh at the last count.
  stats: [
    { icon: "fa-file-lines", key: "statPages" },
    { icon: "fa-language",   key: "statLangs" },
    { icon: "fa-car-side",   key: "statCrew"  }
  ],

  i18n: {
    en: {
      badge: "Business for sale",
      pill: "This website is for sale",
      pillShort: "For sale",
      pillAria: "This website is for sale — open the details",
      title: "Bali Real Vacation is for sale",
      lead:
        "The whole business, not just the domain: this website, all of its content in three languages, and the local connections behind it. Speak to Suta, the owner, directly.",
      includesTitle: "The buyer gets my full support",
      includes: [
        "Full handover support, directly from me",
        "Any modifications you want made to the site",
        "Technical transition, if you would rather host it yourself",
        "Introductions to the drivers and local partners",
        "Ongoing website maintenance"
      ],
      statPages: "55 pages",
      statLangs: "3 languages",
      statCrew: "Drivers & partners",
      directNote: "No agent, no broker — you deal with the owner.",
      cta: "WhatsApp Suta",
      callCta: "Or call this number",
      close: "Close",
      waText:
        "Hello Suta! I saw that balirealvacation.com is for sale and I would like to talk with you about buying it."
    },

    id: {
      badge: "Bisnis dijual",
      pill: "Website ini dijual",
      pillShort: "Dijual",
      pillAria: "Website ini dijual — buka detailnya",
      title: "Bali Real Vacation dijual",
      lead:
        "Bukan sekadar domainnya, tetapi seluruh bisnisnya: website ini, semua kontennya dalam tiga bahasa, dan jaringan lokal di belakangnya. Bicara langsung dengan Suta, pemiliknya.",
      includesTitle: "Pembeli mendapat dukungan penuh dari saya",
      includes: [
        "Pendampingan penuh saat serah terima, langsung dari saya",
        "Perubahan apa pun yang Anda inginkan pada situs ini",
        "Transisi teknis, bila Anda ingin meng-hosting sendiri",
        "Perkenalan dengan para sopir dan mitra lokal",
        "Pemeliharaan website selanjutnya"
      ],
      statPages: "55 halaman",
      statLangs: "3 bahasa",
      statCrew: "Sopir & mitra",
      directNote: "Tanpa agen, tanpa perantara — langsung dengan pemiliknya.",
      cta: "WhatsApp Suta",
      callCta: "Atau telepon nomor ini",
      close: "Tutup",
      waText:
        "Halo Suta! Saya melihat balirealvacation.com dijual dan ingin membicarakan pembeliannya dengan Anda."
    },

    zh: {
      badge: "整站出售",
      pill: "本网站正在出售",
      pillShort: "出售中",
      pillAria: "本网站正在出售 — 查看详情",
      title: "Bali Real Vacation 整体出售",
      lead:
        "出售的不只是域名，而是整个业务：这个网站、三种语言的全部内容，以及背后的本地资源。请直接与业主 Suta 洽谈。",
      includesTitle: "买家可获得我的全程支持",
      includes: [
        "由我本人全程协助交接",
        "按您的需要修改网站",
        "如您希望自行托管，提供技术迁移支持",
        "引荐司机与本地合作伙伴",
        "后续的网站维护"
      ],
      statPages: "55 个页面",
      statLangs: "3 种语言",
      statCrew: "司机与合作伙伴",
      directNote: "无中介、无经纪 — 直接与业主洽谈。",
      cta: "WhatsApp 联系 Suta",
      callCta: "或拨打此号码",
      close: "关闭",
      waText:
        "您好 Suta！我看到 balirealvacation.com 正在出售，想与您商谈收购事宜。"
    }
  }
};
