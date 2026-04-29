/**
 * Hero image rotation (homepage only).
 *
 * Crossfades through every <picture class="hero-image"> inside
 * .hero-image-stack on a 20-second interval. The CSS controls the
 * 2000ms opacity transition; this script just toggles .is-active.
 *
 * Respects prefers-reduced-motion: leaves the first image active and
 * exits without scheduling rotation.
 */
(function () {
  'use strict';

  function init() {
    var images = document.querySelectorAll('.hero-image-stack .hero-image');
    if (images.length < 2) return;

    if (window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    var current = 0;
    var ROTATION_INTERVAL = 20000;

    setInterval(function () {
      images[current].classList.remove('is-active');
      current = (current + 1) % images.length;
      images[current].classList.add('is-active');
    }, ROTATION_INTERVAL);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
