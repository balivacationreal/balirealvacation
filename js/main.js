async function initializeTours() {
  // Check localStorage cache (12-hour TTL) to avoid unnecessary API calls
  let idrRate = parseFloat(localStorage.getItem("cached_idr_rate"));
  let audRate = parseFloat(localStorage.getItem("cached_aud_rate"));
  const rateTime = parseInt(localStorage.getItem("cached_rate_time") || "0");
  const now = Date.now();
  const TWELVE_HOURS = 43200000;
  if (!idrRate || !audRate || now - rateTime > TWELVE_HOURS) {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();
      idrRate = data.rates.IDR;
      audRate = data.rates.AUD;
      localStorage.setItem("cached_idr_rate", idrRate);
      localStorage.setItem("cached_aud_rate", audRate);
      localStorage.setItem("cached_rate_time", now);
    } catch (error) {
      console.error(
        "Could not fetch live exchange rates. Showing default prices.",
        error,
      );
      return; // Static pre-rendered prices remain — nothing more to do
    }
  }
  // Update all .idr-price spans across the page with live-converted values
  document.querySelectorAll(".idr-price[data-usd]").forEach((el) => {
    const usdValue = parseFloat(el.getAttribute("data-usd"));
    const exactIdr = usdValue * idrRate;
    const cleanIdr = Math.ceil(exactIdr / 10000) * 10000;
    const audValue = Math.round(usdValue * audRate);
    const formattedIdr = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cleanIdr);
    el.innerHTML = `${formattedIdr} <span style="color:#888;font-weight:normal;">| ~$${audValue} AUD</span>`;
  });
}
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Live Prices
  initializeTours();
  // 2. Prevent users from selecting past dates in the booking form
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
  // 3. Handle WhatsApp Booking Form Submission
  const bookingForm = document.querySelector(".booking-form");
  if (bookingForm) {
    // Pre-select tour from URL query param ?tour=west-nusa-penida etc.
    const tourParam = new URLSearchParams(window.location.search).get("tour");
    if (tourParam) {
      const packageSelect = document.getElementById("package");
      if (packageSelect) {
        const normalized = tourParam.toLowerCase().replace(/-/g, " ");
        Array.from(packageSelect.options).forEach((opt) => {
          if (opt.value.toLowerCase() === normalized) packageSelect.value = opt.value;
        });
      }
    }

    // Language detection via <html lang>
    const htmlLang = (document.documentElement.lang || "en").split("-")[0];
    const confirmMessages = {
      en: (n) => `Thanks ${n}! Opening WhatsApp to confirm your booking — we'll reply with availability and your payment options (PayPal or bank transfer) shortly.`,
      id: (n) => `Terima kasih ${n}! Membuka WhatsApp untuk mengonfirmasi pemesanan Anda — kami akan membalas dengan ketersediaan dan opsi pembayaran (PayPal atau transfer bank) sesegera mungkin.`,
      zh: (n) => `谢谢 ${n}！正在打开 WhatsApp 确认您的预订 — 我们会尽快回复您的空位情况和付款方式（PayPal 或银行转账）。`,
    };

    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("name").value.trim();
      const whatsapp = document.getElementById("whatsapp").value.trim();
      const tourPackage = document.getElementById("package").value;
      const date = document.getElementById("date").value;
      const pax = document.getElementById("pax").value;
      const notes = (document.getElementById("message").value || "").trim();

      // Structured operator message (always English)
      const waText = [
        "New booking request — Bali Real Vacation",
        `Tour: ${tourPackage}`,
        `Name: ${name}`,
        `Guest WhatsApp: ${whatsapp}`,
        `Preferred date: ${date}`,
        `Guests: ${pax}`,
        `Notes: ${notes || "—"}`,
      ].join("\n");

      // POST to Netlify Forms — fire-and-forget, never block the user
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "booking",
          name,
          whatsapp,
          package: tourPackage,
          date,
          pax,
          message: notes,
        }).toString(),
      }).catch(() => {});

      // Open WhatsApp in a new tab
      window.open(
        "https://wa.me/6282317794462?text=" + encodeURIComponent(waText),
        "_blank",
      );

      // Show language-correct inline confirmation
      const confirmDiv = document.getElementById("booking-confirmation");
      if (confirmDiv) {
        const msgFn = confirmMessages[htmlLang] || confirmMessages.en;
        confirmDiv.textContent = msgFn(name);
        confirmDiv.style.display = "block";
      }
    });
  }
  // 4. Mobile Menu Navigation
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll("#navMenu ul li a");
  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const icon = mobileMenuBtn.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      } else {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
    });
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        const icon = mobileMenuBtn.querySelector("i");
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      });
    });
  }
  // 5. Scroll Reveal Animation Logic
  const revealOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15, // Triggers when 15% of the element is visible
  };
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Unobserve after revealing so it stays visible and saves processing power
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);
  // Find all elements with the 'reveal' class and watch them
  document.querySelectorAll(".reveal").forEach((el) => {
    scrollObserver.observe(el);
  });
  // 6. Scroll to Top Logic (Safely Wrapped)
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (
        document.body.scrollTop > 300 ||
        document.documentElement.scrollTop > 300
      ) {
        scrollTopBtn.style.display = "block";
      } else {
        scrollTopBtn.style.display = "none";
      }
    });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  // 7. FAQ Accordion Logic
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;

      // Optional: Close other open FAQs (Single-accordion mode)
      document.querySelectorAll(".faq-item").forEach((otherItem) => {
        if (otherItem !== item) otherItem.classList.remove("active");
      });

      // Toggle the current FAQ
      item.classList.toggle("active");
    });
  });
});

// Add subtle shadow to navbar once the page is scrolled
(function () {
  var header = document.querySelector("header");
  if (!header) return;
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
