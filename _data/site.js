module.exports = {
  name: "Bali Real Vacation",
  url: "https://balirealvacation.com",
  tagline: "Your trusted travel partner in Bali & Nusa Penida.",
  ga: "G-Y07TTMJDX1",
  whatsapp: "6282317794462",
  telegram: "+6282317794462",
  instagram: "https://instagram.com/balirealvacation",
  // WeChat. `link` is the payload decoded from the official QR, so tapping it on
  // a phone opens WeChat's add-friend screen the way wa.me opens a chat.
  // `id` is the internal wxid — shown for reference; the QR/link are what work.
  wechat: {
    name: "Bali Real Vacation",
    id: "wxid_tw9j59wb6aeh22",
    link: "https://u.wechat.com/kP7cvk9Ubhki3cB2hJDrQe0?s=3",
    qr: "/src/assets/wechat-qr.webp"
  },
  // Primary navigation. `key` maps to _data/ui.json for translated labels.
  // `href` is prefixed per-language in nav.njk (e.g. /zh + /private-driver-tours.html).
  // An item with `children` renders as a dropdown; the parent link stays clickable.
  nav: [
    { key: "home",            href: "/#home" },
    { key: "about",           href: "/#about" },
    { key: "tours_transport", href: "/#packages", children: [
        { key: "packages",         href: "/#packages" },
        { key: "private_driver",   href: "/private-driver-tours.html" },
        { key: "airport_transfer", href: "/airport-transfers.html" }
      ] },
    { key: "local_partners",  href: "/local-partners.html", children: [
        { key: "local_partners_all", href: "/local-partners.html" },
        { key: "land_investment",    href: "/land-investment.html" }
      ] },
    { key: "art",             href: "/balinese-art.html" },
    { key: "guides",          href: "/#guides", children: [
        { key: "penida_guide",     href: "/nusa-penida-guide.html" },
        { key: "bali_guide",       href: "/bali-destinations-guide.html" }
      ] },
    { key: "contact",         href: "/#contact" }
  ],
  footerLinks: [
    { key: "f_private_driver", href: "/private-driver-tours.html" },
    { key: "f_airport",        href: "/airport-transfers.html" },
    { key: "f_local_partners", href: "/local-partners.html" },
    { key: "f_land",           href: "/land-investment.html" },
    { key: "f_art",            href: "/balinese-art.html" },
    { key: "f_penida_guide",   href: "/nusa-penida-guide.html" },
    { key: "f_bali_guide",     href: "/bali-destinations-guide.html" },
    { key: "f_privacy",        href: "/privacy.html" },
    { key: "f_terms",          href: "/term.html" }
  ]
};
