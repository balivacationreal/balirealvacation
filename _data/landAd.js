// Land & Investment listings (Nusa Penida / Bali).
//
// Feeds three places, so copy and contact details live here only:
//   - /land-investment.html (+ /id, /zh) — the listings page
//   - partials/land-teaser.njk — the promo block on the Local Partners page
//   - partials/land-lease-modal.njk — the homepage welcome pop-up, which shows
//     the listing flagged `featured: true`
//
// Switching things off:
//   active: false            → removes the advert from all three places
//   listing.active: false    → hides one listing but keeps its copy on file
//
// Adding a listing: copy a block in `listings`, give it a new `id`, drop the
// images in src/assets/land/, and translate the three i18n blocks. Only one
// listing should carry `featured: true` — that is the one the pop-up shows.
const listings = [
    {
      id: "desa-ped-425",
      active: true,
      featured: true, // shown in the homepage pop-up

      // Contact goes to the owner, deliberately not to the agency number.
      owner: "Suta",
      ownerLegalName: "I Gede Suta Pinatih",
      whatsapp: "6281239156586",
      whatsappDisplay: "+62 812-3915-6586",

      area: 425,
      leaseYears: "10–15",
      harbourKm: "4.5",

      // Shown in order on the listing page; the first is also the thumbnail for
      // the Local Partners teaser and the homepage pop-up. `captionKey` looks up
      // the translated caption in this listing's i18n block. `crop` fits a tall
      // image to a fixed height so it does not tower over the copy beside it.
      // `alt` stays English: it describes the picture, not the page copy.
      gallery: [
        {
          key: "satellite",
          src: "/src/assets/land/nusa-penida-land-satellite.webp",
          w: 900, h: 1491, crop: true,
          captionKey: "satelliteCaption",
          alt: "Satellite view of the 425 m² plot for lease in Desa Ped, Nusa Penida, on the coast road in front of the beach"
        },
        {
          key: "certificate",
          src: "/src/assets/land/nusa-penida-land-certificate-map.webp",
          w: 900, h: 793,
          captionKey: "certificateCaption",
          alt: "Official land-office plot map showing the parcel on the Toya Pakeh – Ped main road"
        }
      ],

      // Structured data (schema.org). English only, and per listing — it used to
      // be hardcoded in the page template inside a loop over every listing, which
      // would have described a second plot as Suta's.
      seo: {
        name: "425 m² SHM beachfront land for lease — Desa Ped, Nusa Penida",
        description:
          "A 425 m² SHM (Hak Milik) freehold plot facing Mount Agung, in front of a crystal-clear beach in Desa Ped, about 4.5 km from the fast-boat harbour. Available on a 10–15 year lease directly from the owner.",
        itemName: "Beachfront land plot, Desa Ped",
        addressLocality: "Desa Ped, Nusa Penida"
      },

      i18n: {
        en: {
          badge: "Investment Opportunity",
          title: "Beachfront Land for Lease in Nusa Penida",
          lead:
            "A 425 m² plot facing Mount Agung, right in front of a crystal-clear beach in Desa Ped — available for a 10 to 15 year lease.",
          facts: [
            "425 m² of flat, ready-to-build land",
            "Faces Mount Agung across the strait",
            "Directly in front of a crystal-clear beach, Desa Ped",
            "About 4.5 km from the fast-boat harbour",
            "Lease term 10–15 years, negotiable",
            "SHM (Hak Milik) freehold title in the owner's name"
          ],
          directNote:
            "Deal directly with the rightful owner — no agent, no commission.",
          satelliteCaption:
            "The plot (green) on the Ped–Buyuk coast road, steps from the water.",
          certificateCaption:
            "Official land-office plot map for the SHM title. The full certificate is shown on request.",
          cta: "WhatsApp Suta",
          details: "See full details",
          close: "Close",
          waText:
            "Hello Suta! I saw your land for lease in Desa Ped, Nusa Penida (425 m²) on balirealvacation.com and I'd like to know more.",
          body: [
            "This 425 m² plot sits on the coast road through Desa Ped, on the north shore of Nusa Penida — the calm, swimmable side of the island. The beach is directly across the road, and the view north across the strait is straight at Mount Agung.",
            "The fast-boat harbour is roughly 4.5 km away, so guests reach the plot in about ten minutes from the pier. Neighbouring plots are already built out with villas and small resorts, which makes this one well suited to a guest house, beach café, or a private home."
          ],
          termsTitle: "Lease terms",
          terms: [
            ["Plot size", "425 m²"],
            ["Location", "Desa Ped, Nusa Penida — Ped–Toya Pakeh coast road"],
            ["Outlook", "Beach across the road, facing Mount Agung"],
            ["To the harbour", "About 4.5 km from the fast-boat pier"],
            ["Lease length", "10–15 years"],
            ["Certificate", "SHM (Hak Milik) — freehold, held by the owner"],
            ["Contact", "I Gede Suta Pinatih — the owner, directly"]
          ]
        },

        id: {
          badge: "Peluang Investasi",
          title: "Tanah Tepi Pantai Disewakan di Nusa Penida",
          lead:
            "Tanah 425 m² menghadap Gunung Agung, tepat di depan pantai berair jernih di Desa Ped — tersedia untuk sewa 10 sampai 15 tahun.",
          facts: [
            "Luas 425 m², datar dan siap bangun",
            "Menghadap Gunung Agung di seberang selat",
            "Tepat di depan pantai berair jernih, Desa Ped",
            "Sekitar 4,5 km dari pelabuhan fast boat",
            "Masa sewa 10–15 tahun, bisa dinegosiasikan",
            "Bersertifikat SHM (Hak Milik) atas nama pemilik"
          ],
          directNote:
            "Berhubungan langsung dengan pemilik sah — tanpa perantara, tanpa komisi.",
          satelliteCaption:
            "Lokasi tanah (hijau) di jalan pesisir Ped–Buyuk, beberapa langkah dari laut.",
          certificateCaption:
            "Peta bidang tanah resmi untuk sertifikat SHM. Sertifikat lengkap ditunjukkan bila diminta.",
          cta: "WhatsApp Suta",
          details: "Lihat detail lengkap",
          close: "Tutup",
          waText:
            "Halo Suta! Saya melihat tanah yang disewakan di Desa Ped, Nusa Penida (425 m²) di balirealvacation.com dan ingin tahu lebih lanjut.",
          body: [
            "Tanah seluas 425 m² ini berada di jalan pesisir Desa Ped, di sisi utara Nusa Penida — sisi pulau yang tenang dan nyaman untuk berenang. Pantainya tepat di seberang jalan, dan pemandangan ke utara langsung menghadap Gunung Agung.",
            "Pelabuhan fast boat berjarak sekitar 4,5 km, sekitar sepuluh menit berkendara dari dermaga. Lahan di sekitarnya sudah terbangun vila dan resor kecil, sehingga lokasi ini cocok untuk guest house, kafe pantai, atau rumah pribadi."
          ],
          termsTitle: "Ketentuan sewa",
          terms: [
            ["Luas tanah", "425 m²"],
            ["Lokasi", "Desa Ped, Nusa Penida — jalan pesisir Ped–Toya Pakeh"],
            ["Pemandangan", "Pantai di seberang jalan, menghadap Gunung Agung"],
            ["Ke pelabuhan", "Sekitar 4,5 km dari dermaga fast boat"],
            ["Masa sewa", "10–15 tahun"],
            ["Sertifikat", "SHM (Hak Milik) — atas nama pemilik"],
            ["Kontak", "I Gede Suta Pinatih — langsung dengan pemilik"]
          ]
        },

        zh: {
          badge: "投资机会",
          title: "努沙佩尼达海边土地出租",
          lead:
            "425 平方米地块，正对阿贡火山，位于佩德村清澈海滩正前方 — 可租期 10 至 15 年。",
          facts: [
            "425 平方米平整土地，可直接建造",
            "隔海正对阿贡火山",
            "紧邻佩德村清澈海滩",
            "距快艇码头约 4.5 公里",
            "租期 10–15 年，可面议",
            "持有 SHM（Hak Milik）永久产权证，登记在业主名下"
          ],
          directNote: "直接与合法业主洽谈 — 无中介，无佣金。",
          satelliteCaption: "地块（绿色）位于 Ped–Buyuk 海岸公路旁，距海边仅数步之遥。",
          certificateCaption:
            "SHM 产权证对应的官方土地登记地块图，完整证书可应要求出示。",
          cta: "WhatsApp 联系 Suta",
          details: "查看详细信息",
          close: "关闭",
          waText:
            "您好 Suta！我在 balirealvacation.com 上看到您位于努沙佩尼达佩德村的 425 平方米出租土地，想了解更多信息。",
          body: [
            "这块 425 平方米的土地位于努沙佩尼达北岸佩德村的海岸公路旁 — 岛上海浪平静、适合游泳的一侧。海滩就在马路对面，向北隔海正对阿贡火山。",
            "快艇码头约 4.5 公里，从码头开车约十分钟即可抵达。周边地块已建有别墅和小型度假村，因此这里非常适合开设民宿、海边咖啡馆或作为私人住宅。"
          ],
          termsTitle: "租赁条件",
          terms: [
            ["地块面积", "425 平方米"],
            ["位置", "努沙佩尼达佩德村 — Ped–Toya Pakeh 海岸公路"],
            ["景观", "马路对面即海滩，正对阿贡火山"],
            ["至码头", "距快艇码头约 4.5 公里"],
            ["租期", "10–15 年"],
            ["产权证书", "SHM（Hak Milik）永久产权，业主名下"],
            ["联系人", "I Gede Suta Pinatih — 直接联系业主"]
          ]
        }
      }
    },

    {
      id: "ketut-the-layar-400",
      active: true,
      featured: false, // the homepage pop-up shows the `featured: true` listing

      // Contact goes to the owner, deliberately not to the agency number.
      owner: "Ketut Suartawan",
      ownerLegalName: "Ketut Suartawan",
      whatsapp: "6285253401899",
      whatsappDisplay: "+62 852-5340-1899",

      area: 400,
      leaseYears: null, // term not set — to be agreed with the owner
      harbourKm: null,
      beachMetres: 50,

      gallery: [
        {
          key: "roadside",
          src: "/src/assets/land/ketut-land-roadside.webp",
          w: 1000, h: 750,
          captionKey: "roadsideCaption",
          alt: "The main road frontage of the plot for lease on Nusa Penida, with a new concrete drain along the verge"
        },
        {
          key: "plot",
          src: "/src/assets/land/ketut-land-plot.webp",
          w: 1000, h: 750,
          captionKey: "plotCaption",
          alt: "Standing on the plot for lease, looking inland past coconut palms towards the hills"
        },
        {
          key: "satellite",
          src: "/src/assets/land/ketut-land-satellite.webp",
          w: 900, h: 1273, crop: true,
          captionKey: "satelliteCaption",
          alt: "Aerial view showing the approximate position of the plot beside Villa The Layar, on the main road"
        },
        {
          key: "sitePlan",
          src: "/src/assets/land/ketut-land-site-plan.webp",
          w: 900, h: 1273,
          captionKey: "sitePlanCaption",
          alt: "Sketch plan showing the plot between Villa The Layar and the three-metre lane, with the main road to the north"
        }
      ],

      seo: {
        name: "400 m² roadside land for lease — Nusa Penida",
        description:
          "A 400 m² plot for lease on Nusa Penida, fronting the main road beside Villa The Layar and about 50 metres from the beach. Offered directly by the owner; lease term and price agreed with him.",
        itemName: "Roadside land plot beside Villa The Layar, Nusa Penida",
        addressLocality: "Nusa Penida"
      },

      i18n: {
        en: {
          badge: "Investment Opportunity",
          title: "Roadside Land for Lease on Nusa Penida",
          lead:
            "A 400 m² plot on the main road beside Villa The Layar, about 50 metres from the beach — offered for lease directly by its owner, Ketut Suartawan.",
          facts: [
            "400 m² (4 are) of flat land",
            "Fronts the main road, with the new roadside drain already in",
            "About 50 metres from the beach",
            "Next door to Villa The Layar, the owner's own villa",
            "A three-metre lane runs down the far side, so access on two sides",
            "Lease term and price agreed directly with the owner"
          ],
          directNote: "Deal directly with the owner — no agent, no commission.",
          roadsideCaption:
            "The frontage on the main road. The concrete drain along the verge is new.",
          plotCaption:
            "On the plot, looking inland — flat and cleared, with coconut palms and the hills behind.",
          satelliteCaption:
            "Roughly where the plot sits, between Villa The Layar and the three-metre lane. The outline is ours, drawn to help you place it — it is not a surveyed boundary.",
          sitePlanCaption:
            "How the plot sits among its neighbours. Sketched for orientation only: the figures on it are indicative, and Ketut will show you the certificate and the surveyed measurements.",
          cta: "WhatsApp Ketut",
          details: "See full details",
          close: "Close",
          waText:
            "Halo Pak Ketut! Saya melihat tanah yang disewakan di dekat Villa The Layar, Nusa Penida, di balirealvacation.com dan ingin tahu lebih lanjut. / Hello Ketut! I saw your land for lease near Villa The Layar on balirealvacation.com and I would like to know more.",
          body: [
            "This plot sits right on the main road through the village, next door to Villa The Layar — the owner's own place, so he is on site and easy to find. The beach is about fifty metres away, close enough to walk in a minute.",
            "It is flat and already cleared, and the roadside drain along the frontage has been built. A three-metre lane runs down the far side, which means access from two sides rather than one. Along this stretch the neighbouring plots already carry a villa and a shop, so the ground is proven for a guest house, a café, or a small shop of your own."
          ],
          termsTitle: "Lease terms",
          terms: [
            ["Plot size", "400 m² (4 are)"],
            ["Location", "Nusa Penida — main road, beside Villa The Layar"],
            ["To the beach", "About 50 metres"],
            ["Access", "Main road frontage, plus a three-metre lane on the far side"],
            ["Lease length", "To be agreed with the owner"],
            ["Price", "On request — ask Ketut directly"],
            ["Contact", "Ketut Suartawan — the owner, directly"]
          ]
        },

        id: {
          badge: "Peluang Investasi",
          title: "Tanah Pinggir Jalan Disewakan di Nusa Penida",
          lead:
            "Tanah 400 m² di tepi jalan raya, bersebelahan dengan Villa The Layar, sekitar 50 meter dari pantai — disewakan langsung oleh pemiliknya, Ketut Suartawan.",
          facts: [
            "Luas 400 m² (4 are), tanah datar",
            "Menghadap langsung ke jalan raya, gorong-gorong tepi jalan sudah terpasang",
            "Sekitar 50 meter dari pantai",
            "Bersebelahan dengan Villa The Layar, milik pemilik tanah sendiri",
            "Ada jalan 3 meter di sisi lainnya, jadi akses dari dua sisi",
            "Masa sewa dan harga disepakati langsung dengan pemilik"
          ],
          directNote:
            "Berhubungan langsung dengan pemilik — tanpa perantara, tanpa komisi.",
          roadsideCaption:
            "Bagian depan tanah di tepi jalan raya. Gorong-gorong beton di pinggirnya masih baru.",
          plotCaption:
            "Di atas tanahnya, menghadap ke arah darat — datar dan sudah bersih, dengan pohon kelapa dan perbukitan di belakang.",
          satelliteCaption:
            "Perkiraan posisi tanah, di antara Villa The Layar dan jalan 3 meter. Garis oranye kami buat sendiri sebagai bantuan orientasi — bukan batas hasil pengukuran.",
          sitePlanCaption:
            "Posisi tanah terhadap sekelilingnya. Sketsa ini untuk gambaran saja: ukuran yang tertera bersifat indikatif, dan Ketut akan menunjukkan sertifikat serta ukuran resminya.",
          cta: "WhatsApp Ketut",
          details: "Lihat detail lengkap",
          close: "Tutup",
          waText:
            "Halo Pak Ketut! Saya melihat tanah yang disewakan di dekat Villa The Layar, Nusa Penida, di balirealvacation.com dan ingin tahu lebih lanjut.",
          body: [
            "Tanah ini berada tepat di tepi jalan raya desa, bersebelahan dengan Villa The Layar — milik pemiliknya sendiri, jadi beliau ada di lokasi dan mudah ditemui. Pantainya sekitar lima puluh meter, cukup satu menit berjalan kaki.",
            "Tanahnya datar dan sudah dibersihkan, dan gorong-gorong di tepi jalan depan sudah jadi. Di sisi lainnya ada jalan selebar 3 meter, sehingga aksesnya dari dua sisi, bukan satu. Di sepanjang ruas ini lahan tetangganya sudah terbangun vila dan toko, jadi lokasinya cocok untuk guest house, kafe, atau toko kecil milik Anda sendiri."
          ],
          termsTitle: "Ketentuan sewa",
          terms: [
            ["Luas tanah", "400 m² (4 are)"],
            ["Lokasi", "Nusa Penida — tepi jalan raya, sebelah Villa The Layar"],
            ["Ke pantai", "Sekitar 50 meter"],
            ["Akses", "Menghadap jalan raya, ditambah jalan 3 meter di sisi lain"],
            ["Masa sewa", "Disepakati dengan pemilik"],
            ["Harga", "Hubungi Ketut langsung"],
            ["Kontak", "Ketut Suartawan — langsung dengan pemilik"]
          ]
        },

        zh: {
          badge: "投资机会",
          title: "努沙佩尼达临街土地出租",
          lead:
            "400 平方米地块，紧邻大路，与 Villa The Layar 相邻，距海滩约 50 米 — 由业主 Ketut Suartawan 本人直接出租。",
          facts: [
            "400 平方米（4 are）平整土地",
            "直接临大路，路边排水渠已建好",
            "距海滩约 50 米",
            "紧邻业主自家的 Villa The Layar",
            "另一侧有一条 3 米宽小路，两面通行",
            "租期与价格由业主本人商定"
          ],
          directNote: "直接与业主洽谈 — 无中介，无佣金。",
          roadsideCaption: "地块临大路的一面，路边的混凝土排水渠是新建的。",
          plotCaption:
            "站在地块上向内陆望去 — 地势平整、已清理，椰林与远山为背景。",
          satelliteCaption:
            "地块的大致位置，位于 Villa The Layar 与 3 米小路之间。橙色轮廓由我们绘制，仅供辨识位置，并非实测边界。",
          sitePlanCaption:
            "地块与周边的相对位置。此图仅供参考：图上尺寸为示意性质，Ketut 会向您出示产权证与实测数据。",
          cta: "WhatsApp 联系 Ketut",
          details: "查看详细信息",
          close: "关闭",
          waText:
            "Halo Pak Ketut! Saya melihat tanah yang disewakan di dekat Villa The Layar, Nusa Penida, di balirealvacation.com dan ingin tahu lebih lanjut. / 您好！我在 balirealvacation.com 上看到您位于 Villa The Layar 旁的出租土地，想了解更多信息。",
          body: [
            "这块地就在村里的主路边，紧挨着 Villa The Layar — 那是业主自己的别墅，所以他人就在现场，很好找。海滩约五十米，步行一分钟即到。",
            "土地平整、已清理完毕，临路一侧的排水渠也已建好。另一侧有一条 3 米宽的小路，因此两面都能进出，而不是只有一面。这一段路上，邻近地块已经建起别墅和店铺，说明这里适合开设民宿、咖啡馆，或您自己的小店。"
          ],
          termsTitle: "租赁条件",
          terms: [
            ["地块面积", "400 平方米（4 are）"],
            ["位置", "努沙佩尼达 — 主路旁，Villa The Layar 隔壁"],
            ["至海滩", "约 50 米"],
            ["通行", "临主路，另一侧另有 3 米宽小路"],
            ["租期", "与业主商定"],
            ["价格", "请直接向 Ketut 咨询"],
            ["联系人", "Ketut Suartawan — 直接联系业主"]
          ]
        }
      }
    }
];

const withHero = (l) => ({ ...l, hero: l.gallery[0] });

module.exports = {
  active: true,

  // Category-level copy: the Local Partners teaser and the listings-page chrome.
  i18n: {
    en: {
      catTitle: "Land & Investment",
      catSub: "A rare chance to build your own project on the north coast of Nusa Penida.",
      teaser:
        "Beyond tours and partners, we also list land available for lease on the islands — offered directly by the owners we know personally, with no agent in between.",
      browseCta: "View land listings",
      countOne: "1 plot available now",
      countMany: "{n} plots available now"
    },
    id: {
      catTitle: "Tanah & Investasi",
      catSub: "Kesempatan langka untuk membangun proyek Anda sendiri di pesisir utara Nusa Penida.",
      teaser:
        "Selain tur dan mitra lokal, kami juga menayangkan tanah yang disewakan di kepulauan ini — ditawarkan langsung oleh pemilik yang kami kenal secara pribadi, tanpa perantara.",
      browseCta: "Lihat daftar tanah",
      countOne: "1 bidang tersedia saat ini",
      countMany: "{n} bidang tersedia saat ini"
    },
    zh: {
      catTitle: "土地与投资",
      catSub: "在努沙佩尼达北岸打造自己项目的难得机会。",
      teaser:
        "除了旅游线路与本地合作伙伴，我们也发布岛上可租赁的土地 — 由我们亲自认识的业主直接出租，中间没有中介。",
      browseCta: "查看土地列表",
      countOne: "目前有 1 块土地",
      countMany: "目前有 {n} 块土地"
    }
  },

  listings,

  // Pre-filtered for the templates: Nunjucks cannot build these itself, since a
  // `set` inside a `for` loop does not survive the loop. `hero` is the first
  // gallery image, carrying its own dimensions — the teaser and the pop-up used
  // to hardcode 900x1491, which is only right for the first listing.
  openListings: listings.filter((l) => l.active).map(withHero),
  featured: (() => {
    const f =
      listings.find((l) => l.active && l.featured) ||
      listings.find((l) => l.active);
    return f ? withHero(f) : null;
  })()
};
