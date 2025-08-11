import LocomotiveScroll from "locomotive-scroll";

/* Smooth scrolling for section links with phone highlight on Contact */
let loco;
const container = document.querySelector("[data-scroll-container]");

function pulsePhone() {
  const el = document.getElementById("contactPhone");
  if (!el) return;
  el.classList.remove("pop-highlight"); // reset if already there
  // reflow to restart animation
  void el.offsetWidth;
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
