/* ================================================================
   WEDDING WEBSITE — script.js
   Maria Valeria & Juan David · 21.11.2026
   ================================================================ */
'use strict';

/* ----------------------------------------------------------------
   1. COUNTDOWN — 21 Nov 2026, 4:00pm Barranquilla (UTC-5)
   ---------------------------------------------------------------- */
(function initCountdown() {
  const target  = new Date('2026-11-21T16:00:00-05:00');
  const els     = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };
  if (!els.days) return;

  function pad(n, len = 2) { return String(n).padStart(len, '0'); }

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.days.textContent = '000';
      els.hours.textContent = els.mins.textContent = els.secs.textContent = '00';
      return;
    }
    els.days.textContent  = pad(Math.floor(diff / 86400000), 3);
    els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.mins.textContent  = pad(Math.floor((diff % 3600000) / 60000));
    els.secs.textContent  = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
})();

/* ----------------------------------------------------------------
   2. SCROLL REVEAL — .reveal, .reveal-left, .reveal-right
      + timeline dot activation
   ---------------------------------------------------------------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');

      // Activate adjacent timeline dot
      const timeline = entry.target.closest('.boda__timeline');
      if (timeline) {
        const row = entry.target.closest('.boda__row');
        if (row) {
          // Desktop: activa el line-col
          const lineCol = row.querySelector('.boda__line-col');
          if (lineCol) setTimeout(() => lineCol.classList.add('dot-active'), 280);
          // Mobile: activa el ::before del row
          setTimeout(() => row.classList.add('dot-active'), 280);
        }
      }

      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ----------------------------------------------------------------
   3. NAV — scroll background
   ---------------------------------------------------------------- */
(function initNav() {
  const header = document.getElementById('site-header');
  if (!header) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 50);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
  header.classList.toggle('scrolled', window.scrollY > 50);
})();

/* ----------------------------------------------------------------
   4. MOBILE NAV — hamburger
   ---------------------------------------------------------------- */
(function initBurger() {
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('nav-drawer');
  if (!burger || !drawer) return;

  function toggle(force) {
    const open = typeof force === 'boolean' ? force : !burger.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
  }

  burger.addEventListener('click', () => toggle());
  drawer.querySelectorAll('.nav__drawer-link').forEach(l => l.addEventListener('click', () => toggle(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
  document.addEventListener('click', e => {
    if (!document.getElementById('site-header').contains(e.target)) toggle(false);
  });
})();

/* ----------------------------------------------------------------
   5. HOSPEDAJE SLIDER
   ---------------------------------------------------------------- */
(function initSlider() {
  const track   = document.getElementById('hospedaje-track');
  const btnPrev = document.getElementById('sliderPrev');
  const btnNext = document.getElementById('sliderNext');
  if (!track) return;

  let idx = 0;

  function cards()     { return [...track.querySelectorAll('.hospedaje__card')]; }
  function cardWidth() { const c = cards()[0]; return c ? c.offsetWidth : 0; }
  function total()     { return cards().length; }

  function go(n) {
    idx = Math.max(0, Math.min(n, total() - 1));
    track.style.transform = `translateX(-${idx * cardWidth()}px)`;
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx === total() - 1;
  }

  if (btnPrev) btnPrev.addEventListener('click', () => go(idx - 1));
  if (btnNext) btnNext.addEventListener('click', () => go(idx + 1));

  // Swipe táctil mobile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? idx + 1 : idx - 1);
  });

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => go(idx), 100); });
  go(0);
})();

/* ----------------------------------------------------------------
   6. VESTIMENTA CAROUSELS — uno para mujeres, uno para hombres
   ---------------------------------------------------------------- */
(function initVestCarousels() {
  const configs = [
    { trackId: 'vest-track-women', dotsId: 'vest-dots-women' },
    { trackId: 'vest-track-men',   dotsId: 'vest-dots-men'   },
  ];

  configs.forEach(({ trackId, dotsId }) => {
    const track = document.getElementById(trackId);
    const dotsWrap = document.getElementById(dotsId);
    if (!track) return;

    const slides = [...track.querySelectorAll('.vest-slide')];
    const total  = slides.length;
    let idx      = 0;

    // Build dots
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'vest-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Foto ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);
      });
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.vest-dot').forEach((d, i) =>
        d.classList.toggle('is-active', i === idx)
      );
    }

    function go(n) {
      idx = ((n % total) + total) % total; // wrap around
      track.style.transform = `translateX(-${idx * 100}%)`;
      updateDots();
    }

    // Find the prev/next buttons for this track
    const block  = track.closest('.vestimenta__block') || track.closest('.vestimenta__carousel');
    const carousel = track.closest('.vestimenta__carousel');
    if (carousel) {
      const btnPrev = carousel.querySelector('.vest-btn--prev');
      const btnNext = carousel.querySelector('.vest-btn--next');
      if (btnPrev) btnPrev.addEventListener('click', () => go(idx - 1));
      if (btnNext) btnNext.addEventListener('click', () => go(idx + 1));
    }

    // Touch/swipe
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) go(diff > 0 ? idx + 1 : idx - 1);
    });
  });
})();

/* ----------------------------------------------------------------
   7. EXPLORA CAROUSEL
   ---------------------------------------------------------------- */
(function initExploraCarousel() {
  const track    = document.getElementById('explora-track');
  const dotsWrap = document.getElementById('explora-dots');
  const btnPrev  = document.getElementById('exploraPrev');
  const btnNext  = document.getElementById('exploraNext');
  if (!track) return;

  const cards = [...track.querySelectorAll('.explora__card')];
  const total = cards.length;
  let idx     = 0;

  // Build dots
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'explora__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Lugar ${i + 1}`);
      dot.addEventListener('click', () => go(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.explora__dot').forEach((d, i) =>
      d.classList.toggle('is-active', i === idx)
    );
  }

  function go(n) {
    idx = ((n % total) + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    updateDots();
  }

  if (btnPrev) btnPrev.addEventListener('click', () => go(idx - 1));
  if (btnNext) btnNext.addEventListener('click', () => go(idx + 1));

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) go(diff > 0 ? idx + 1 : idx - 1);
  });

  // Resize recalculate
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => go(idx), 100); });
})();
