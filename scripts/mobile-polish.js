/*
 * Mobile polish — runtime layer for sticky-nav scrolled-state and the
 * scroll-progress signature. Loaded on every page via:
 *   <script defer src="…/scripts/mobile-polish.js"></script>
 *
 * Pairs with scripts/mobile-polish.css. The CSS is mobile-only (the JS
 * runs on every viewport but the styles it triggers only take effect
 * under @media max-width: 768px — minor wasted scroll work on desktop,
 * imperceptible).
 *
 * Behaviour:
 *   - .site-header gains .is-scrolled once scrollY > TRIGGER (60px).
 *   - --scroll-progress CSS variable is set on :root every scroll tick,
 *     drives the .scroll-progress bar width.
 *   - rAF-throttled passive listener — no jank, no interference with
 *     existing scroll-reveals or header-blur.
 */
(function () {
  'use strict';

  const TRIGGER = 60;

  const header = document.querySelector('.site-header');
  const root = document.documentElement;

  let ticking = false;
  let lastIsScrolled = null;

  function update() {
    ticking = false;
    const y = window.scrollY || window.pageYOffset || 0;

    // Sticky-nav scrolled-state
    if (header) {
      const isScrolled = y > TRIGGER;
      if (isScrolled !== lastIsScrolled) {
        header.classList.toggle('is-scrolled', isScrolled);
        lastIsScrolled = isScrolled;
      }
    }

    // Scroll progress (0–100%)
    const max = (root.scrollHeight - root.clientHeight) || 0;
    const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
    root.style.setProperty('--scroll-progress', pct + '%');
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
