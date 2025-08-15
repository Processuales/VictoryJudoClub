// Import styles so Vite bundles CSS for production
import './styles.css';
import LocomotiveScroll from "locomotive-scroll";

/* Smooth scrolling for section links with phone highlight on Contact */
let loco;
const container = document.querySelector("[data-scroll-container]");

function pulsePhone() {
  const el = document.getElementById("contactPhone");
  if (!el) return;
  el.classList.remove("pop-highlight");
  void el.offsetWidth; // restart animation
  el.classList.add("pop-highlight");
  setTimeout(() => el.classList.remove("pop-highlight"), 1400);
}

try {
  loco = new LocomotiveScroll({ el: container, smooth: true });
  document.querySelectorAll("[data-scroll-to]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = a.getAttribute("href");
      if (!target) return;

      const isContact = target === "#contact";
      if (isContact) {
        loco.scrollTo(target, { duration: 900, offset: 0, callback: () => pulsePhone() });
      } else {
        loco.scrollTo(target, { duration: 900, offset: 0 });
      }
    });
  });
} catch (e) {
  console.warn("Locomotive Scroll not initialized. Falling back to default anchors.", e);
  document.querySelectorAll("[data-scroll-to]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = a.getAttribute("href");
      if (!target) return;
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
      if (target === "#contact") {
        setTimeout(pulsePhone, 900);
      }
    });
  });
}

/* Dark mode toggle */
const toggle = document.getElementById("themeToggle");
if (toggle) {
  toggle.addEventListener("change", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
  });
}

/* Footer year */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* HERO slider: slide, not fade */
const track = document.getElementById("heroTrack");
if (track) {
  const slides = Array.from(track.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll("[data-hero-index]"));
  const prevBtn = document.querySelector("[data-hero='prev']");
  const nextBtn = document.querySelector("[data-hero='next']");

  let i = 0;
  let timer;

  const go = (idx) => {
    i = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === i));
  };

  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  const start = () => { stop(); timer = setInterval(next, 5000); };
  const stop = () => { if (timer) clearInterval(timer); };

  // init
  go(0);
  start();

  // controls
  nextBtn?.addEventListener("click", () => { next(); start(); });
  prevBtn?.addEventListener("click", () => { prev(); start(); });
  dots.forEach((d, di) => d.addEventListener("click", () => { go(di); start(); }));

  // optional: pause on hover for desktop
  const hero = document.getElementById("hero");
  hero?.addEventListener("mouseenter", stop);
  hero?.addEventListener("mouseleave", start);
}

/* ===== Header banner sizing and image metrics ===== */
(function setupHeaderBanner() {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const navbar = header?.querySelector(".navbar");

  // Keep fixed background height exactly equal to the visible navbar
  function applyHeaderHeight() {
    if (!navbar) return;
    const h = navbar.offsetHeight; // exact pixel height in current breakpoint
    root.style.setProperty("--hdr-h", h + "px");
  }
  applyHeaderHeight();
  window.addEventListener("resize", applyHeaderHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(applyHeaderHeight).catch(()=>{});
  }

  // Measure the image pixel size at runtime and expose it
  const IMG_URL = "/public/images/top_bar_image.png"; // moved to public/images
  const probe = new Image();
  probe.decoding = "async";
  probe.src = IMG_URL;

  const onReady = () => {
    const w = probe.naturalWidth || 0;
    const h = probe.naturalHeight || 0;
    if (w && h) {
      root.style.setProperty("--hdr-img-w", w);
      root.style.setProperty("--hdr-img-h", h);
      const aspect = (w / h).toFixed(3);
      console.table({
        "Top bar image width (px)": w,
        "Top bar image height (px)": h,
        "Aspect ratio": aspect
      });

      if (parseFloat(aspect) < 1.4) {
        root.style.setProperty("--hdr-focal-y", "35%");
      }
    } else {
      console.warn("Could not read top bar image size.");
    }
  };

  if ("decode" in probe) {
    probe.decode().then(onReady).catch(onReady);
  } else {
    probe.onload = onReady;
    probe.onerror = () => console.warn("Header image failed to load.");
  }
})();
