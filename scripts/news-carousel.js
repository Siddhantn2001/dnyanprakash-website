/**
 * News clippings carousel (news/index.html only).
 *
 * Vanilla JS. One track, one active slide at a time. Graceful without JS —
 * the first slide stays visible (track at translateX(0)) and everything
 * else hides via overflow: hidden on the viewport.
 */
(function () {
  'use strict';

  var carousel = document.querySelector('[data-news-carousel]');
  if (!carousel) return;
  var track = carousel.querySelector('[data-carousel-track]');
  if (!track) return;
  var slides = track.children;
  if (!slides || slides.length === 0) return;

  var prev = carousel.querySelector('[data-carousel-prev]');
  var next = carousel.querySelector('[data-carousel-next]');
  var dotsContainer = document.querySelector('[data-carousel-dots]');
  var dots = dotsContainer ? dotsContainer.querySelectorAll('[data-slide-index]') : [];

  var current = 0;
  var autoAdvanceId = null;
  var AUTO_INTERVAL = 7000;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('is-active', i === current);
      dots[i].setAttribute('aria-current', i === current ? 'true' : 'false');
    }
  }

  function startAutoAdvance() {
    if (reduceMotion) return;
    stopAutoAdvance();
    autoAdvanceId = setInterval(function () { go(current + 1); }, AUTO_INTERVAL);
  }
  function stopAutoAdvance() {
    if (autoAdvanceId) { clearInterval(autoAdvanceId); autoAdvanceId = null; }
  }

  if (prev) prev.addEventListener('click', function () { go(current - 1); startAutoAdvance(); });
  if (next) next.addEventListener('click', function () { go(current + 1); startAutoAdvance(); });

  for (var i = 0; i < dots.length; i++) {
    (function (idx) {
      dots[idx].addEventListener('click', function () { go(idx); startAutoAdvance(); });
    })(i);
  }

  // Arrow-key navigation (when carousel area has focus)
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); startAutoAdvance(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); startAutoAdvance(); }
  });

  // Pause on hover / focus
  carousel.addEventListener('mouseenter', stopAutoAdvance);
  carousel.addEventListener('mouseleave', startAutoAdvance);
  carousel.addEventListener('focusin', stopAutoAdvance);
  carousel.addEventListener('focusout', startAutoAdvance);

  // Touch swipe support
  var touchStartX = null;
  carousel.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    stopAutoAdvance();
  }, { passive: true });
  carousel.addEventListener('touchend', function (e) {
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      go(dx > 0 ? current - 1 : current + 1);
    }
    touchStartX = null;
    startAutoAdvance();
  }, { passive: true });

  go(0);
  startAutoAdvance();
})();
