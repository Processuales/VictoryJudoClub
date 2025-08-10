import LocomotiveScroll from "locomotive-scroll";
import { gsap } from "gsap";

/* Theme switcher */
document.querySelectorAll("[data-theme-switch]").forEach((el) => {
  el.addEventListener("click", () => {
    const theme = el.getAttribute("data-theme-switch");
    document.documentElement.setAttribute("data-theme", theme);
  });
});

/* Modal + toast */
const modal = document.getElementById("infoModal");
document.getElementById("openModal")?.addEventListener("click", () => modal?.showModal());
document.getElementById("toastBtn")?.addEventListener("click", () => {
  const toast = document.createElement("div");
  toast.className = "toast toast-end";
  toast.innerHTML = `<div class="alert alert-info"><span>Hello from daisyUI.</span></div>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
});

/* Init Locomotive */
const scrollContainer = document.querySelector("[data-scroll-container]");
let scroll;
try {
  scroll = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
  });

  // Anchor links use Locomotive's scrollTo
  document.querySelectorAll("[data-scroll-to]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = a.getAttribute("href");
      if (!target) return;
      scroll.scrollTo(target);
    });
  });

  // Listen for a test call
  scroll.on("call", (func) => {
    if (func === "centerSeen") {
      const el = document.createElement("div");
      el.className = "toast toast-top toast-center";
      el.innerHTML = `<div class="alert alert-success"><span>Locomotive call fired.</span></div>`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1200);
    }
  });

  window._scroll = scroll; // for quick console checks
} catch (err) {
  console.error("Locomotive failed to init:", err);
}

/* GSAP timeline */
const tl = gsap.timeline({ paused: true });
tl.to("#green", { duration: 0.6, x: 120, rotation: 20, opacity: 0.9 })
  .to("#blue", { duration: 0.8, x: 240, rotation: -15, opacity: 0.9 })
  .to("#orange", { duration: 0.6, x: 360, rotation: 10, opacity: 0.9 });

document.getElementById("playTl")?.addEventListener("click", () => {
  tl.restart();
});
document.getElementById("reverseTl")?.addEventListener("click", () => {
  tl.reverse();
});
document.getElementById("resetTl")?.addEventListener("click", () => {
  tl.pause(0).clear();
  tl
    .to("#green", { duration: 0.6, x: 120, rotation: 20, opacity: 0.9 })
    .to("#blue", { duration: 0.8, x: 240, rotation: -15, opacity: 0.9 })
    .to("#orange", { duration: 0.6, x: 360, rotation: 10, opacity: 0.9 });
});

/* Simple entrance animations so you know GSAP runs on load */
gsap.from(".hero h1", { y: 30, opacity: 0, duration: 0.6 });
gsap.from(".hero p", { y: 20, opacity: 0, duration: 0.6, delay: 0.1 });
