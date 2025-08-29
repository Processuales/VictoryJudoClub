import './styles.css';
import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap';

/* hairline ~ 1 physical pixel */
(function setHairline() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const px = Math.max(0.33, 1 / dpr);
  document.documentElement.style.setProperty('--hair', `${px}px`);
})();

/* smooth scrolling control */
let loco;
const container = document.querySelector('[data-scroll-container]');
const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

/* pulse the phone in Contact */
function pulsePhone() {
  const el = document.getElementById('contactPhone');
  if (!el) return;
  el.classList.remove('pop-highlight');
  void el.offsetWidth;
  el.classList.add('pop-highlight');
  setTimeout(() => el.classList.remove('pop-highlight'), 1400);
}

/* Desktop and tablet: smooth scroll. Mobile: native scroll */
if (!isMobile) {
  try {
    loco = new LocomotiveScroll({
      el: container,
      smooth: true,
      smartphone: { smooth: false },
      tablet: { smooth: true }
    });

    document.querySelectorAll('[data-scroll-to]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = a.getAttribute('href');
        if (!target) return;

        if (target === '#contact') {
          loco.scrollTo(target, { duration: 900, offset: 0, callback: () => pulsePhone() });
        } else {
          loco.scrollTo(target, { duration: 900, offset: 0 });
        }
      });
    });
  } catch (e) {
    console.warn('Locomotive Scroll not initialized. Falling back to default anchors.', e);
    document.querySelectorAll('[data-scroll-to]').forEach((a) => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const target = a.getAttribute('href');
        if (!target) return;
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
        if (target === '#contact') setTimeout(pulsePhone, 900);
      });
    });
  }
} else {
  // Mobile: native anchor behavior
  document.querySelectorAll('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', () => {
      const target = a.getAttribute('href');
      if (target === '#contact') setTimeout(pulsePhone, 400);
    });
  });
}

/* footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* hero slider autoplay and bleed sync */
(function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  let index = 0;
  slides.forEach((s, i) => s.classList.toggle('is-active', i === 0));

  // bleed element removed by request, leave null to no-op
  const bleedNext = document.querySelector('#coach .bleed-into-next');

  function currentImgSrc(i = index) {
    const img = slides[i]?.querySelector('img');
    return img?.getAttribute('src') || '';
  }

  function setBleed(src) {
    if (!bleedNext || !src) return;
    bleedNext.style.setProperty('--bleed-img', `url("${src}")`);
    gsap.fromTo(bleedNext, { opacity: 0.6 }, { opacity: 0.72, duration: 0.3, ease: 'power2.out' });
  }

  function setAria(idx) {
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'));
  }

  function goTo(newIndex) {
    if (newIndex === index) return;
    slides[index].classList.remove('is-active');
    slides[newIndex].classList.add('is-active');
    index = newIndex;
    setAria(index);
    setBleed(currentImgSrc(index));
  }

  function next() { goTo((index + 1) % slides.length); }

  const INTERVAL_MS = 5000;
  let autoTimer = null;

  function startAuto() { if (!autoTimer) autoTimer = setInterval(next, INTERVAL_MS); }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); else startAuto(); });

  setAria(index);
  setBleed(currentImgSrc(index));
  startAuto();
})();

/* safe scatter positions for hero cards */
(function scatterHeroCards() {
  const cards = Array.from(document.querySelectorAll('.hero-card'));
  if (!cards.length) return;

  const hero = document.getElementById('intro');
  function rand(min, max) { return Math.random() * (max - min) + min; }

  const ranges = {
    left: {
      upper: { top: [8, 22],  left: [5, 16],  rot: [-12, -3], z: [40, 43] },
      lower: { top: [60, 78], left: [12, 24], rot: [1, 10],   z: [39, 42] }
    },
    right: {
      upper: { top: [10, 24], right: [6, 18],  rot: [5, 13],   z: [39, 43] },
      lower: { top: [55, 76], right: [14, 26], rot: [-9, -2],  z: [38, 42] }
    }
  };

  function safeTopPercent(card, desiredPct) {
    const heroH = hero?.clientHeight || window.innerHeight;
    const cardH = card.offsetHeight || 160;
    const marginPx = 14;
    const maxTopPx = Math.max(0, heroH - marginPx - cardH);
    const maxTopPct = (maxTopPx / heroH) * 100;
    const minTopPct = 4;
    return Math.min(Math.max(desiredPct, minTopPct), Math.max(minTopPct, maxTopPct));
  }

  function applyPosition(card) {
    const side = card.dataset.side;
    const slot = card.dataset.slot;
    const r = ranges[side]?.[slot];
    if (!r) return;

    card.style.left = 'auto';
    card.style.right = 'auto';

    if (side === 'left') card.style.left = `${rand(r.left[0], r.left[1]).toFixed(2)}%`;
    else card.style.right = `${rand(r.right[0], r.right[1]).toFixed(2)}%`;

    const desiredTop = rand(r.top[0], r.top[1]);
    const topPct = safeTopPercent(card, desiredTop);
    card.style.top = `${topPct.toFixed(2)}%`;

    card.style.setProperty('--rot', `${rand(r.rot[0], r.rot[1]).toFixed(2)}deg`);
    card.style.zIndex = String(Math.round(rand(r.z[0], r.z[1])));
  }

  function layout() { cards.forEach(applyPosition); }

  layout();
  window.addEventListener('load', layout);

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(layout, 120); });
})();

/* desktop hover push-away with GSAP */
(function heroHoverFX() {
  const mql = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
  if (!mql.matches) return;

  const cards = Array.from(document.querySelectorAll('.hero-card'));
  if (!cards.length) return;

  const cta = document.querySelector('.glass-panel');
  const others = (exclude) => cards.filter((el) => el !== exclude);

  function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  let activeCard = null;

  function handleEnter(el) {
    activeCard = el;
    const a = center(el);

    others(el).forEach((oc) => {
      const b = center(oc);
      const vx = b.x - a.x, vy = b.y - a.y;
      const len = Math.max(1, Math.hypot(vx, vy));
      const ux = vx / len, uy = vy / len;
      const push = Math.min(22, Math.max(12, 16 + (160 - Math.min(160, len)) * 0.04));
      gsap.to(oc, { x: ux * push, y: uy * push, duration: 0.32, ease: 'power2.out' });
    });

    if (cta) {
      const c = center(cta);
      const vx = c.x - a.x, vy = c.y - a.y;
      const len = Math.max(1, Math.hypot(vx, vy));
      const ux = vx / len, uy = vy / len;
      const push = 10;
      gsap.to(cta, { x: ux * push, y: uy * push, duration: 0.28, ease: 'power2.out' });
    }
  }

  function handleLeave() {
    others(activeCard).forEach((oc) => gsap.to(oc, { x: 0, y: 0, duration: 0.28, ease: 'power2.inOut' }));
    if (cta) gsap.to(cta, { x: 0, y: 0, duration: 0.28, 'ease': 'power2.inOut' });
    activeCard = null;
  }

  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => handleEnter(card));
    card.addEventListener('mouseleave', handleLeave);
  });

  const onQueryChange = (e) => { if (!e.matches) handleLeave(); };
  if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onQueryChange);
  else if (typeof mql.addListener === 'function') mql.addListener(onQueryChange);
})();

/* Lightbox Gallery Viewer */
(function initLightbox() {
  const overlay = document.getElementById('lightbox');
  const stage = overlay?.querySelector('[data-stage]');
  const imgEl = document.getElementById('lightboxImage');
  const btnPrev = overlay?.querySelector('.lightbox-prev');
  const btnNext = overlay?.querySelector('.lightbox-next');
  const btnClose = overlay?.querySelector('.lightbox-close');

  if (!overlay || !stage || !imgEl || !btnPrev || !btnNext || !btnClose) return;

  const thumbs = Array.from(document.querySelectorAll('#gallery .gallery-thumb img'));
  const sources = thumbs.map((t) => t.getAttribute('src'));
  const alts = thumbs.map((t) => t.getAttribute('alt') || 'Gallery image');

  let current = 0;
  let lastFocused = null;

  function capFactor() {
    const w = window.innerWidth;
    if (w >= 1280) return 0.58;
    if (w >= 768)  return 0.64;
    return 0.72;
  }

  function fitImage() {
    const nw = imgEl.naturalWidth || 1600;
    const nh = imgEl.naturalHeight || 1200;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const baseMargin = Math.max(24, Math.min(64, Math.round(Math.min(vw, vh) * 0.08)));
    const sideUI = 46 * 2 + 24 * 2;
    const topUI  = 56;

    const maxW = Math.max(180, vw - baseMargin * 2 - sideUI);
    const maxH = Math.max(160, vh - baseMargin * 2 - topUI);

    const containScale = Math.min(maxW / nw, maxH / nh);
    const scale = Math.min(containScale, capFactor());

    const w = Math.floor(nw * scale);
    const h = Math.floor(nh * scale);

    imgEl.style.width = `${w}px`;
    imgEl.style.height = `${h}px`;
  }

  function preload(index) {
    const nextIdx = (index + 1) % sources.length;
    const prevIdx = (index - 1 + sources.length) % sources.length;
    [nextIdx, prevIdx].forEach((i) => {
      const src = sources[i];
      if (!src) return;
      const im = new Image();
      im.src = src;
    });
  }

  function show(index) {
    current = ((index % sources.length) + sources.length) % sources.length;
    imgEl.src = sources[current];
    imgEl.alt = alts[current];
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');

    try { if (loco && typeof loco.stop === 'function') loco.stop(); } catch {}

    const onLoad = () => {
      fitImage();
      gsap.fromTo(imgEl, { opacity: 0, scale: 0.985 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power1.out' });
      preload(current);
      imgEl.removeEventListener('load', onLoad);
    };
    imgEl.addEventListener('load', onLoad);

    btnClose.focus();
  }

  function close() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');

    try { if (loco && typeof loco.start === 'function') loco.start(); } catch {}

    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  // Thumb clicks
  document.querySelectorAll('#gallery .gallery-thumb').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-index') || '0', 10);
      open(idx);
    });
  });

  // Controls
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);
  btnClose.addEventListener('click', close);

  // Resize fit
  imgEl.addEventListener('load', fitImage);
  window.addEventListener('resize', () => { if (overlay.classList.contains('is-open')) fitImage(); });
  window.addEventListener('orientationchange', () => {
    setTimeout(() => { if (overlay.classList.contains('is-open')) fitImage(); }, 250);
  });

  // Click outside image or on overlay background closes
  overlay.addEventListener('click', (e) => {
    const t = e.target;
    const clickedControls =
      imgEl.contains(t) ||
      btnNext.contains(t) ||
      btnPrev.contains(t) ||
      btnClose.contains(t);
    if (!clickedControls) close();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
  });

  // Touch swipe
  let touchX = null, touchY = null, touchTime = 0;
  function onTouchStart(e) {
    const t = e.changedTouches[0];
    touchX = t.clientX; touchY = t.clientY; touchTime = Date.now();
  }
  function onTouchEnd(e) {
    if (touchX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    const dt = Date.now() - touchTime;
    const absX = Math.abs(dx), absY = Math.abs(dy);

    if (dt < 600 && absX > 40 && absX > absY) {
      if (dx < 0) next();
      else prev();
    }
    touchX = touchY = null; touchTime = 0;
  }
  stage.addEventListener('touchstart', onTouchStart, { passive: true });
  stage.addEventListener('touchend', onTouchEnd, { passive: true });
})();
