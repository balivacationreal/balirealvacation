// Land-for-lease advertisement (Desa Ped, Nusa Penida).
// Used by _includes/partials/land-lease-modal.njk (homepage pop-up) and the
// "Land & Investment" section on the Local Partners page.
// Set `active: false` to pull the advert from both places in one edit.
module.exports = {
  active: true,

  // Owner contact — the advert deliberately points at the owner, not the agency.
  owner: "Suta",
  ownerLegalName: "I Gede Suta Pinatih",
  whatsapp: "6281239156586",
  whatsappDisplay: "+62 812-3915-6586",

  area: 425,
  leaseYears: "10–15",
  harbourKm: "4.5",

  images: {
    satellite: "/src/assets/land/nusa-penida-land-satellite.webp",
    certificate: "/src/assets/land/nusa-penida-land-certificate-map.webp"
  },

  // Anchor on the Local Partners page that the pop-up's secondary link points to.
  detailsAnchor: "#land-for-lease",

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
      satelliteCaption: "The plot (green) on the Ped–Buyuk coast road, steps from the water.",
      certificateCaption: "Official land-office plot map for the SHM title. The full certificate is shown on request.",
      cta: "WhatsApp Suta",
      details: "See full details",
      close: "Close",
      waText:
        "Hello Suta! I saw your land for lease in Desa Ped, Nusa Penida (425 m²) on balirealvacation.com and I'd like to know more.",

      // Local Partners page section only
      catTitle: "Land & Investment",
      catSub: "A rare chance to build your own project on the north coast of Nusa Penida.",
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
      satelliteCaption: "Lokasi tanah (hijau) di jalan pesisir Ped–Buyuk, beberapa langkah dari laut.",
      certificateCaption: "Peta bidang tanah resmi untuk sertifikat SHM. Sertifikat lengkap ditunjukkan bila diminta.",
      cta: "WhatsApp Suta",
      details: "Lihat detail lengkap",
      close: "Tutup",
      waText:
        "Halo Suta! Saya melihat tanah yang disewakan di Desa Ped, Nusa Penida (425 m²) di balirealvacation.com dan ingin tahu lebih lanjut.",

      catTitle: "Tanah & Investasi",
      catSub: "Kesempatan langka untuk membangun proyek Anda sendiri di pesisir utara Nusa Penida.",
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
      certificateCaption: "SHM 产权证对应的官方土地登记地块图，完整证书可应要求出示。",
      cta: "WhatsApp 联系 Suta",
      details: "查看详细信息",
      close: "关闭",
      waText:
        "您好 Suta！我在 balirealvacation.com 上看到您位于努沙佩尼达佩德村的 425 平方米出租土地，想了解更多信息。",

      catTitle: "土地与投资",
      catSub: "在努沙佩尼达北岸打造自己项目的难得机会。",
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
};
