// Guest Gallery — photos of our drivers with their guests, shown on
// /guest-gallery.html and its /id and /zh twins.
//
// The photos themselves are NOT in this repo. They live in Convex (table
// `photos`, see convex/photos.ts) and are fetched by js/gallery.js when the
// page opens, so adding or approving a photo needs no rebuild. This file holds
// only what is fixed: who can be filtered on, and the page copy.
//
// Switching it on:
//   live: false  → the page is built and reachable by its URL, but it is not
//                  linked from the nav or footer and is marked noindex, so an
//                  empty gallery is never advertised to guests or to Google.
//   live: true   → adds the nav + footer links and lets Google index it.
//                  Flip this once the first photos are approved.
//
// Adding a driver: add them to `drivers` with a new slug. The slug is what a
// photo is tagged with in Convex, so never rename one that already has photos.
const drivers = [
  { slug: "putu-ardi",     name: "Putu Ardi" },
  { slug: "ketut-widiasa", name: "Ketut Widiasa" },
  { slug: "gede-jahendra", name: "Gede Jahendra" },
  { slug: "kadek-tresna",  name: "Kadek Tresna" },
  { slug: "agung-putri",   name: "Agung Putri" }
];

// `value` is what is stored against a photo. Kept identical to the TOURS list
// in js/reviews.js so a review and a photo of the same trip carry the same tag.
const tours = [
  { value: "West Nusa Penida Tour",        en: "West Nusa Penida Tour",        id: "Tur Nusa Penida Barat",                 zh: "西佩尼达岛之旅" },
  { value: "East Nusa Penida Tour",        en: "East Nusa Penida Tour",        id: "Tur Nusa Penida Timur",                 zh: "东佩尼达岛之旅" },
  { value: "Nusa Penida Snorkeling",       en: "Nusa Penida Snorkeling",       id: "Snorkeling Nusa Penida",                zh: "佩尼达岛浮潜" },
  { value: "Uluwatu Full Day Tour",        en: "Uluwatu Full Day Tour",        id: "Tur Sehari Penuh Uluwatu",              zh: "乌鲁瓦图全日游" },
  { value: "Sekumpul Waterfall Tour",      en: "Sekumpul Waterfall Tour",      id: "Tur Air Terjun Sekumpul",               zh: "赛库普瀑布之旅" },
  { value: "North Bali Canyoning",         en: "North Bali Canyoning",         id: "Canyoning Bali Utara",                  zh: "北巴厘岛峡谷探险" },
  { value: "Mount Batur Sunrise Trekking", en: "Mount Batur Sunrise Trekking", id: "Trekking Matahari Terbit Gunung Batur", zh: "巴图尔火山日出徒步" },
  { value: "Private Driver Tour",          en: "Private Driver Tour",          id: "Tur Sopir Pribadi",                     zh: "专属司机之旅" },
  { value: "Airport Transfer",             en: "Airport Transfer",             id: "Antar-Jemput Bandara",                  zh: "机场接送" }
];

module.exports = {
  live: true,

  // Same deployment as js/reviews.js. Public by design — what a visitor may
  // read is decided by the Convex functions, not by hiding this address.
  convexUrl: "https://colorless-gnu-950.convex.cloud",

  // Photos drawn per "Show more" press. The page fetches the approved list
  // once and reveals it in steps, so the browser only downloads the
  // thumbnails that are actually on screen.
  pageSize: 24,

  drivers,
  tours,

  i18n: {
    en: {
      heroTag: "Real trips, real guests",
      heroTitle: "Guest Gallery",
      heroLead:
        "Moments from the road with our drivers and the travellers they looked after — taken on the day, not in a studio.",
      filterDriver: "Driver",
      filterTour: "Tour",
      all: "All",
      allTours: "All tours",
      loading: "Loading photos…",
      empty: "The first photos are on their way. Please check back soon.",
      emptyFiltered: "No photos here yet. Try another driver or tour.",
      error: "Couldn't load the photos right now. Please try again later.",
      more: "Show more photos",
      with: "With",
      close: "Close",
      prev: "Previous photo",
      next: "Next photo",
      photoAlt: "Guests on a trip with",
      consent:
        "Every photo here is shared with our guests' permission. If you are in one and would like it taken down, message us and we will remove it the same day.",
      crewLink: "Crew: add photos",
      ctaTitle: "Your Photo Could Be Next",
      ctaText:
        "Tell us where you want to go and one of the drivers above will take you there — and take the photo.",
      ctaBtn: "Plan your trip on WhatsApp",
      ctaWaText:
        "Hello Bali Real Vacation! I saw your guest gallery and would like to plan a trip."
    },

    id: {
      heroTag: "Perjalanan nyata, tamu nyata",
      heroTitle: "Galeri Tamu",
      heroLead:
        "Momen di perjalanan bersama para sopir kami dan wisatawan yang mereka dampingi — diambil pada hari itu juga, bukan di studio.",
      filterDriver: "Sopir",
      filterTour: "Tur",
      all: "Semua",
      allTours: "Semua tur",
      loading: "Memuat foto…",
      empty: "Foto-foto pertama sedang dalam perjalanan. Silakan kembali lagi nanti.",
      emptyFiltered: "Belum ada foto di sini. Coba sopir atau tur lain.",
      error: "Foto tidak dapat dimuat saat ini. Silakan coba lagi nanti.",
      more: "Tampilkan lebih banyak foto",
      with: "Bersama",
      close: "Tutup",
      prev: "Foto sebelumnya",
      next: "Foto berikutnya",
      photoAlt: "Tamu dalam perjalanan bersama",
      consent:
        "Setiap foto di sini dibagikan atas izin tamu kami. Jika Anda ada di salah satu foto dan ingin foto itu diturunkan, hubungi kami dan kami akan menghapusnya pada hari yang sama.",
      crewLink: "Kru: tambah foto",
      ctaTitle: "Foto Berikutnya Bisa Jadi Milik Anda",
      ctaText:
        "Beri tahu kami ke mana Anda ingin pergi, dan salah satu sopir di atas akan mengantar Anda — sekaligus mengambil fotonya.",
      ctaBtn: "Rencanakan perjalanan via WhatsApp",
      ctaWaText:
        "Halo Bali Real Vacation! Saya melihat galeri tamu Anda dan ingin merencanakan perjalanan."
    },

    zh: {
      heroTag: "真实的旅程，真实的客人",
      heroTitle: "客人相册",
      heroLead:
        "我们的司机与他们接待的旅行者在路上的瞬间 —— 都是当天实拍，而非棚拍。",
      filterDriver: "司机",
      filterTour: "行程",
      all: "全部",
      allTours: "全部行程",
      loading: "正在加载照片…",
      empty: "第一批照片即将上线，请稍后再来。",
      emptyFiltered: "这里暂时还没有照片，请试试其他司机或行程。",
      error: "目前无法加载照片，请稍后再试。",
      more: "显示更多照片",
      with: "司机",
      close: "关闭",
      prev: "上一张",
      next: "下一张",
      photoAlt: "客人与司机同行：",
      consent:
        "这里的每一张照片都已征得客人同意。如果您出现在照片中并希望撤下，请联系我们，我们会在当天删除。",
      crewLink: "团队成员：上传照片",
      ctaTitle: "下一张照片可能就是您",
      ctaText:
        "告诉我们您想去哪里，上面的司机之一会带您前往 —— 并为您拍下照片。",
      ctaBtn: "通过 WhatsApp 规划行程",
      ctaWaText:
        "您好 Bali Real Vacation！我看到了你们的客人相册，想规划一次行程。"
    }
  }
};
