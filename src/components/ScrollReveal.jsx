import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TEXT = [
  '.home-intro h1',
  '.section-head',
  '.page-head',
  '.section-action',
  '.plans-note-line',
  '.cta-band > :not(video)',
  '.about-split > :not(.about-media, .photo)',
  '.faq-list > *',
  '.faq-callout',
  '.legal-doc > *',
];
const CARDS = [
  '.home-trust-item',
  '.how-step',
  '.plan-card',
  '.product-card',
  '.about-perks > *',
  '.credit-compare > *',
  '.info-flow-step',
];
const IMAGES = ['.about-media', '.about-split .photo', '.plan-shot', '.product-gallery .main-art'];

const SKIP = '.hero-band, .site-header, .site-footer, .modal, [role="dialog"]';

function mark(node, kind) {
  if (node.dataset.reveal || node.dataset.revealDone || node.closest(SKIP)) return false;
  node.dataset.reveal = kind;
  const siblings = node.parentElement ? [...node.parentElement.children] : [];
  const index = Math.max(0, siblings.indexOf(node));
  node.style.setProperty('--reveal-delay', `${Math.min(index, 6) * 90}ms`);
  return true;
}

/** Fades text, cards and photos in as they scroll into view. */
export default function ScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const root = document.querySelector('main');
    if (!root) return undefined;

    const timers = new Set();
    const settle = (node) => {
      const delay = parseInt(node.style.getPropertyValue('--reveal-delay'), 10) || 0;
      const timer = setTimeout(() => {
        timers.delete(timer);
        node.dataset.revealDone = '1';
        delete node.dataset.reveal;
        node.classList.remove('is-revealed');
        node.style.removeProperty('--reveal-delay');
      }, delay + 1200);
      timers.add(timer);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
          settle(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const scan = () => {
      const groups = [
        [TEXT, 'text'],
        [CARDS, 'card'],
        [IMAGES, 'image'],
      ];
      groups.forEach(([selectors, kind]) => {
        root.querySelectorAll(selectors.join(',')).forEach((node) => {
          if (mark(node, kind)) io.observe(node);
        });
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      timers.forEach(clearTimeout);
      root.querySelectorAll('[data-reveal]').forEach((node) => {
        delete node.dataset.reveal;
        node.classList.remove('is-revealed');
      });
    };
  }, [pathname]);

  return null;
}
