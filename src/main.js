import './styles.css';
import LocomotiveScroll from 'locomotive-scroll';

/* Smooth scrolling for section links with phone highlight on Contact */
let loco;
const container = document.querySelector('[data-scroll-container]');

function pulsePhone() {
  const el = document.getElementById('contactPhone');
  if (!el) return;
  el.classList.remove('pop-highlight');
  void el.offsetWidth;
  el.classList.add('pop-highlight');
  setTimeout(() => el.classList.remove('pop-highlight'), 1400);
}

try {
  loco = new LocomotiveScroll({
    el: container,
    smooth: true,
    smartphone: { smooth: true },
    tablet: { smooth: true }
  });
  document.querySelectorAll('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.getAttribute('href');
      if (!target) return;

      const isContact = target === '#contact';
      if (isContact) {
        loco.scrollTo(target, { duration: 900, offset: 0, callback: () => pulsePhone() });
      } else {
        loco.scrollTo(target, { duration: 900, offset: 0 });
      }
    });
  });
} catch (e) {
  console.warn('Locomotive Scroll not initialized. Falling back to default anchors.', e);
  document.querySelectorAll('[data-scroll-to]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = a.getAttribute('href');
      if (!target) return;
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      if (target === '#contact') {
        setTimeout(pulsePhone, 900);
      }
    });
  });
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* No hero slider code - single static image by request */
