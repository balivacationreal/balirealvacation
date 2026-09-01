// Inspiring Balinese Art — the artists we know personally and the work they
// have for sale.
//
// Feeds one place: /balinese-art.html (+ /id, /zh), rendered by
// partials/art-artists.njk. All copy lives here so the three language pages
// stay identical apart from their front matter.
//
// Switching things off:
//   active: false          → takes the whole section off the page
//   artist.active: false   → hides one artist but keeps their copy on file
//   work.forSale: false    → shows the piece as past work, with no price or CTA
//
// Adding an artist: copy a block in `artists`, give it a new `id`, drop the
// photos in src/assets/art/, and translate the i18n block. Contact goes to the
// artist or their family directly — we take no commission on a sale.
const artists = [
  {
    id: "jero-wayan-amer-ambarie",
    active: true,
    featured: true, // shown first

    name: "Jero Wayan Amer Ambarie",
    born: 1964,

    // Straight to the artist, deliberately not to the agency number.
    whatsapp: "6287852707147",
    whatsappDisplay: "+62 878-5270-7147",

    photos: {
      portrait: {
        src: "/src/assets/art/jero-wayan-amer-ambarie-portrait.webp",
        w: 226,
        h: 362
      },
      atWork: {
        src: "/src/assets/art/jero-wayan-amer-ambarie-at-work.webp",
        w: 1000,
        h: 1333
      },
      magazine: {
        src: "/src/assets/art/jero-wayan-amer-ambarie-magazine-page.webp",
        w: 1154,
        h: 1175
      }
    },

    // Venue names stay untranslated — they are proper nouns.
    exhibitions: [
      [1979, "First prize, National Youth painting competition, Jakarta"],
      [1995, "Seniwati Gallery group exhibition, Grand Mirage Hotel, Nusa Dua"],
      [1995, "Seniwati Gallery group exhibition, Media Park Sud, Cologne, Germany"],
      [1996, "Seniwati Gallery group exhibition, Museum Puri Lukisan, Ubud"],
      [1996, "Museum Puri Lukisan group exhibition, “The Young Artists of Bali”"],
      [1996, "Seniwati Gallery exhibition, Bentara Budaya, Jakarta"],
      [1997, "Kebyar Seni group show, Museum Puri Lukisan, Ubud"],
      [1998, "Group show, Rudana Museum, Mas, Ubud"]
    ],

    works: [
      {
        id: "pasar-di-pantai",
        forSale: true,
        title: "Pasar di Pantai",
        year: null, // undated
        images: {
          main: {
            src: "/src/assets/art/pasar-di-pantai.webp",
            w: 1071,
            h: 872
          },
          withArtist: {
            src: "/src/assets/art/pasar-di-pantai-with-artist.webp",
            w: 880,
            h: 1204
          }
        }
      },
      {
        // Untitled here on purpose: we have the photograph but not the name
        // the artist gave it, so the caption describes the scene instead.
        id: "village-market",
        forSale: false,
        year: null,
        images: {
          main: {
            src: "/src/assets/art/jero-wayan-amer-ambarie-village-market.webp",
            w: 900,
            h: 1200
          }
        }
      },
      {
        id: "market-day",
        forSale: false,
        year: 2015, // from the signature on the canvas
        images: {
          main: {
            src: "/src/assets/art/jero-wayan-amer-ambarie-market-day.webp",
            w: 900,
            h: 1200
          }
        }
      }
    ],

    i18n: {
      en: {
        badge: "Young Artists style · Penestanan, Ubud",
        tagline: "In her sixties, and still painting on the floor of her studio.",
        bio: [
          "Jero Wayan Amer Ambarie was born in 1964 in Penestanan, the village just west of Ubud where the Young Artists style began. Her father was a farmer who became a painter after learning from Arie Smit, the Dutch artist whose encouragement gave that village its place in Balinese art.",
          "She learned by watching him. As a small child her paintings were already good enough to hang in his exhibitions — under his name, as was normal at the time. In 1979, still at school, she won first prize in the National Youth painting competition in Jakarta.",
          "Painting made her different from the other girls in the village and she came close to giving it up. Her school talked her out of it, and she has not stopped since — through marriage, three children, and more than forty years.",
          "She still works the way she always has: cross-legged on the floor, the canvas propped in front of her, filling it with the ordinary life of Bali. Fish markets, harvest days, the crowd on the sand when the boats come in. Look closely and there is a joke in there somewhere — a dog making off with a fish, a child who has wandered away from their mother. That quiet humour is as much her signature as the name in the corner."
        ],
        exhibitionsTitle: "Selected exhibitions",
        magazineCaption:
          "Her profile in a Balinese art magazine of the 1990s, kept by the family.",
        atWorkCaption: "Working on “Pasar di Pantai” at home.",
        works: {
          "pasar-di-pantai": {
            subtitle: "Beach Market",
            spec: "Oil on canvas · 50 × 60 cm · signed “Amer Ambari, Bali”",
            desc: [
              "Early morning on a fishing beach. The sails are still out on the water, dolphins break the surface, and on the sand the night's catch is already changing hands.",
              "There are more than eighty figures here, each one painted separately: porters balancing their shoulder baskets, women picking through the fish, children in the way of everybody, and two village dogs who know exactly where to stand."
            ],
            withArtistCaption: "Jero Wayan with the finished painting."
          },
          "village-market": {
            subtitle: "A village market",
            spec: "Earlier work · not for sale",
            desc: []
          },
          "market-day": {
            subtitle: "A market day",
            spec: "Earlier work, signed 2015 · not for sale",
            desc: []
          }
        },
        forSaleLabel: "Available",
        pastWorkLabel: "Past work",
        priceLabel: "Price",
        priceValue: "On request — ask the artist",
        cta: "WhatsApp Jero Wayan",
        contactNote:
          "This number reaches Jero Wayan and her family directly. Bali Real Vacation takes no commission on a sale — we simply put her work in front of people who would never otherwise see it. Indonesian is easiest for her, so we have written the opening message in both languages for you.",
        // Bilingual on purpose: the artist reads the Indonesian half.
        waText:
          "Halo Ibu Jero Wayan! Saya melihat lukisan “Pasar di Pantai” di balirealvacation.com dan tertarik untuk membelinya. / Hello! I saw your painting “Pasar di Pantai” on balirealvacation.com and I am interested in buying it."
      },

      id: {
        badge: "Gaya Young Artists · Penestanan, Ubud",
        tagline: "Sudah berumur enam puluhan, masih melukis di lantai studionya.",
        bio: [
          "Jero Wayan Amer Ambarie lahir tahun 1964 di Penestanan, desa di sebelah barat Ubud tempat gaya Young Artists bermula. Ayahnya seorang petani yang menjadi pelukis setelah belajar dari Arie Smit, pelukis Belanda yang dorongannya membuat desa itu dikenal dalam sejarah seni rupa Bali.",
          "Ia belajar dengan cara memperhatikan ayahnya. Sejak kecil lukisannya sudah cukup bagus untuk ikut dipamerkan — memakai nama ayahnya, seperti yang lazim pada masa itu. Tahun 1979, saat masih sekolah, ia menjadi Juara Satu lomba lukis nasional untuk pelajar di Jakarta.",
          "Melukis membuatnya berbeda dari anak perempuan lain di desanya, dan ia nyaris berhenti. Pihak sekolah membujuknya untuk terus, dan sejak itu ia tidak pernah berhenti — melewati pernikahan, tiga anak, dan lebih dari empat puluh tahun.",
          "Cara kerjanya masih sama seperti dulu: duduk bersila di lantai, kanvas disandarkan di depannya, lalu diisi dengan kehidupan Bali sehari-hari. Pasar ikan, hari panen, keramaian di pasir saat perahu-perahu pulang. Kalau diamati, selalu ada kelucuan yang diselipkan — anjing yang menggondol ikan, anak kecil yang lepas dari ibunya. Humor yang tenang itu sama khasnya dengan tanda tangannya di sudut kanvas."
        ],
        exhibitionsTitle: "Pameran terpilih",
        magazineCaption:
          "Profilnya di sebuah majalah seni rupa Bali tahun 1990-an, disimpan keluarganya.",
        atWorkCaption: "Mengerjakan “Pasar di Pantai” di rumahnya.",
        works: {
          "pasar-di-pantai": {
            subtitle: "Pasar di Pantai",
            spec: "Cat minyak di atas kanvas · 50 × 60 cm · ditandatangani “Amer Ambari, Bali”",
            desc: [
              "Pagi hari di pantai nelayan. Layar-layar masih di tengah laut, lumba-lumba menyembul di permukaan, dan di pasir hasil tangkapan semalam sudah berpindah tangan.",
              "Ada lebih dari delapan puluh figur di sini, dilukis satu per satu: pemikul dengan keranjang di pundak, para perempuan memilih ikan, anak-anak yang menghalangi jalan, dan dua ekor anjing kampung yang tahu persis di mana harus berdiri."
            ],
            withArtistCaption: "Jero Wayan bersama lukisan yang sudah rampung."
          },
          "village-market": {
            subtitle: "Suasana pasar desa",
            spec: "Karya terdahulu · tidak dijual",
            desc: []
          },
          "market-day": {
            subtitle: "Hari pasar",
            spec: "Karya terdahulu, bertanda tangan 2015 · tidak dijual",
            desc: []
          }
        },
        forSaleLabel: "Tersedia",
        pastWorkLabel: "Karya terdahulu",
        priceLabel: "Harga",
        priceValue: "Hubungi pelukisnya langsung",
        cta: "WhatsApp Jero Wayan",
        contactNote:
          "Nomor ini langsung terhubung dengan Jero Wayan dan keluarganya. Bali Real Vacation tidak mengambil komisi atas penjualan — kami hanya menampilkan karyanya kepada orang-orang yang mungkin tidak akan pernah melihatnya.",
        waText:
          "Halo Ibu Jero Wayan! Saya melihat lukisan “Pasar di Pantai” di balirealvacation.com dan tertarik untuk membelinya."
      },

      zh: {
        badge: "Young Artists 画派 · 乌布 Penestanan 村",
        tagline: "年过六旬，依然席地而坐，在画布前作画。",
        bio: [
          "Jero Wayan Amer Ambarie 于 1964 年出生在乌布以西的 Penestanan 村 —— Young Artists 画派的发源地。她的父亲原本是农民，跟随荷兰画家 Arie Smit 学画后成为画家；正是 Arie Smit 的鼓励，让这个村子在巴厘岛艺术史上留下了名字。",
          "她是看着父亲作画长大的。很小的时候，她的画就已经好到可以挂进父亲的展览 —— 署的是父亲的名字，这在当时是常事。1979 年，还在读书的她获得了雅加达全国青少年绘画比赛一等奖。",
          "画画让她与村里其他女孩不一样，她曾几乎放弃。是学校劝她坚持下来 —— 此后她再没有停过，走过婚姻、三个孩子和四十多年的岁月。",
          "她的工作方式一如既往：盘腿坐在地上，画布斜靠在面前，一笔一笔填满巴厘岛的日常。鱼市、收割的日子、渔船归来时沙滩上的人潮。凑近看，画里总藏着一点玩笑 —— 叼走一条鱼的狗，跑丢了母亲的孩子。这份安静的幽默，和角落里的签名一样，都是她的标志。"
        ],
        exhibitionsTitle: "重要展览",
        magazineCaption: "1990 年代巴厘岛艺术杂志上的人物专访，由家人保存至今。",
        atWorkCaption: "在家中绘制《海边市集》。",
        works: {
          "pasar-di-pantai": {
            subtitle: "海边市集",
            spec: "布面油画 · 50 × 60 厘米 · 签名「Amer Ambari, Bali」",
            desc: [
              "渔村海滩的清晨。帆船还在海上，海豚跃出水面，沙滩上，一夜的渔获已经开始易手。",
              "画中有八十多个人物，全部逐一描绘：肩挑竹筐的脚夫、挑选鲜鱼的妇人、四处乱跑的孩子，还有两只知道该守在哪里的村中土狗。"
            ],
            withArtistCaption: "Jero Wayan 与完成后的作品。"
          },
          "village-market": {
            subtitle: "乡村市集一景",
            spec: "早期作品 · 非卖品",
            desc: []
          },
          "market-day": {
            subtitle: "赶集的日子",
            spec: "早期作品，画上签署 2015 年 · 非卖品",
            desc: []
          }
        },
        forSaleLabel: "可购买",
        pastWorkLabel: "早期作品",
        priceLabel: "价格",
        priceValue: "请直接向画家询问",
        cta: "WhatsApp 联系 Jero Wayan",
        contactNote:
          "此号码可直接联系到 Jero Wayan 本人及其家人。Bali Real Vacation 不从交易中抽取任何佣金 —— 我们只是把她的作品带到本来看不到它的人面前。她最习惯用印尼语交流，因此我们已为您准备好中文与印尼文对照的开场信息。",
        // 双语：印尼语部分是给画家看的。
        waText:
          "Halo Ibu Jero Wayan! Saya melihat lukisan “Pasar di Pantai” di balirealvacation.com dan tertarik untuk membelinya. / 您好！我在 balirealvacation.com 上看到您的作品《海边市集》，希望了解购买事宜。"
      }
    }
  }
];

module.exports = {
  active: true,

  // Page-level copy: hero, intro, and the closing "are you an artist?" banner.
  i18n: {
    en: {
      heroTag: "Bali, in the hands of the people who live it",
      heroTitle: "Inspiring Balinese Art",
      heroLead:
        "Painters we know personally, and the work they have for sale. No gallery mark-up, no middleman — you deal with the artist.",
      introTitle: "Why this page exists",
      intro: [
        "Bali sells a great deal of art to visitors, and very little of that money reaches the people who actually paint. The good work often stays in the village, seen by nobody, while the shops on the main road sell copies of it.",
        "So we started this page. Each artist here is someone we have met in person, and whose work we would hang in our own home. You contact them directly, you pay them directly, and we take nothing from the sale."
      ],
      ctaTitle: "Are You a Balinese Artist?",
      ctaText:
        "Painters, carvers, silversmiths, weavers — if you make your work by hand here on the islands and you would like it seen by the travellers who already visit this site, talk to us. There is no fee and no commission.",
      ctaBtn: "Show us your work",
      ctaWaText:
        "Hello Bali Real Vacation! I am an artist in Bali and I would like my work featured on your Balinese Art page.",
      disclaimer:
        "Bali Real Vacation publishes these artists as an introduction. We are not an art dealer and we are not a party to any sale. Prices, condition, packing and shipping are agreed directly between you and the artist."
    },

    id: {
      heroTag: "Bali, dari tangan orang-orang yang menjalaninya",
      heroTitle: "Seni Bali yang Menginspirasi",
      heroLead:
        "Para pelukis yang kami kenal secara pribadi, beserta karya yang mereka jual. Tanpa markup galeri, tanpa perantara — Anda berhubungan langsung dengan senimannya.",
      introTitle: "Kenapa halaman ini ada",
      intro: [
        "Bali menjual banyak sekali karya seni kepada wisatawan, tetapi sangat sedikit uang itu yang sampai ke tangan orang yang benar-benar melukis. Karya yang bagus sering berhenti di desa, tidak dilihat siapa pun, sementara toko di jalan besar menjual tiruannya.",
        "Karena itu kami membuat halaman ini. Setiap seniman di sini adalah orang yang pernah kami temui langsung, dan yang karyanya akan kami pajang di rumah sendiri. Anda menghubungi mereka langsung, membayar mereka langsung, dan kami tidak mengambil apa pun dari penjualan itu."
      ],
      ctaTitle: "Anda Seniman Bali?",
      ctaText:
        "Pelukis, pemahat, perajin perak, penenun — jika Anda membuat karya dengan tangan sendiri di pulau ini dan ingin dilihat oleh wisatawan yang sudah mengunjungi situs ini, hubungi kami. Tanpa biaya dan tanpa komisi.",
      ctaBtn: "Tunjukkan karya Anda",
      ctaWaText:
        "Halo Bali Real Vacation! Saya seniman di Bali dan ingin karya saya ditampilkan di halaman Seni Bali.",
      disclaimer:
        "Bali Real Vacation menampilkan para seniman ini sebagai perkenalan. Kami bukan pedagang seni dan bukan pihak dalam transaksi jual beli. Harga, kondisi karya, pengemasan, dan pengiriman disepakati langsung antara Anda dan senimannya."
    },

    zh: {
      heroTag: "巴厘岛，出自生活在这里的人之手",
      heroTitle: "打动人心的巴厘岛艺术",
      heroLead:
        "我们亲自认识的画家，以及他们出售的作品。没有画廊加价，没有中间商 —— 您直接与艺术家本人洽谈。",
      introTitle: "我们为什么做这个页面",
      intro: [
        "巴厘岛每年向游客卖出大量艺术品，但真正落到创作者手里的钱少之又少。好作品常常留在村子里无人问津，而大路边的店铺卖的却是它们的仿制品。",
        "所以我们开设了这个页面。这里的每一位艺术家我们都亲自见过，他们的作品我们自己也愿意挂在家里。您直接联系他们、直接付款给他们，我们不从中收取任何费用。"
      ],
      ctaTitle: "您是巴厘岛的艺术家吗？",
      ctaText:
        "画家、木雕师、银匠、织工 —— 如果您在岛上亲手创作，并希望作品被已经访问本站的旅行者看到，请与我们联系。不收费，也不抽成。",
      ctaBtn: "向我们展示您的作品",
      ctaWaText:
        "您好 Bali Real Vacation！我是巴厘岛的艺术家，希望我的作品能出现在你们的巴厘艺术页面上。",
      disclaimer:
        "Bali Real Vacation 仅作为引介方展示这些艺术家。我们不是艺术品经销商，也不是任何交易的当事方。价格、作品状况、包装与运输均由您与艺术家直接商定。"
    }
  },

  artists,

  // Pre-filtered for the templates: Nunjucks cannot build these itself, since a
  // `set` inside a `for` loop does not survive the loop.
  openArtists: artists
    .filter((a) => a.active)
    .sort((a, b) => (b.featured === true) - (a.featured === true))
    .map((a) => ({
      ...a,
      forSaleWorks: a.works.filter((w) => w.forSale),
      pastWorks: a.works.filter((w) => !w.forSale)
    }))
};
