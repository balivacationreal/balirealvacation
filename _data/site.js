module.exports = {
  name: "Bali Real Vacation",
  url: "https://balirealvacation.com",
  tagline: "Your trusted travel partner in Bali & Nusa Penida.",
  ga: "G-Y07TTMJDX1",
  whatsapp: "6282317794462",
  telegram: "+6282317794462",
  instagram: "https://instagram.com/balirealvacation",
  // Primary navigation. `key` maps to _data/ui.json for translated labels.
  // `href` is prefixed per-language in nav.njk (e.g. /zh + /private-driver-tours.html).
  nav: [
    { key: "home",            href: "/#home" },
    { key: "about",           href: "/#about" },
    { key: "packages",        href: "/#packages" },
    { key: "private_driver",  href: "/private-driver-tours.html" },
    { key: "airport_transfer",href: "/airport-transfers.html" },
    { key: "local_partners",  href: "/local-partners.html" },
    { key: "guides",          href: "/#guides" },
    { key: "contact",         href: "/#contact" }
  ],
  footerLinks: [
    { key: "f_private_driver", href: "/private-driver-tours.html" },
    { key: "f_airport",        href: "/airport-transfers.html" },
    { key: "f_local_partners", href: "/local-partners.html" },
    { key: "f_penida_guide",   href: "/nusa-penida-guide.html" },
    { key: "f_bali_guide",     href: "/bali-destinations-guide.html" },
    { key: "f_privacy",        href: "/privacy.html" },
    { key: "f_terms",          href: "/term.html" }
  ]
};
