var SEASON_STATE = 'out-of-season'; // 'in-season' | 'out-of-season' | 'closed-to-new'
// SEASON STATE — flip once a year. Best Resolve Accounting concept (spec mockup).

/* BEST RESOLVE ACCOUNTING — concept B (spec mockup).
   The season state changes three things and nothing else: which door is primary, the season band's
   text, and whether gated jackets render in their dashed off-season state.
   It never changes a date, never adds urgency, never shows a countdown, never hides a price.
   No tracking, no chat widget, no exit-intent, no count-up, no file inputs. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  root.setAttribute('data-season', SEASON_STATE);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SEASON = {
    'in-season':     { primary: 'appointment', text: 'Filing season is open. Returns are being booked now.' },
    'out-of-season': { primary: 'appointment', text: 'Off-season: bookkeeping, planning and catch-up work are open now.' },
    'closed-to-new': { primary: 'appointment', text: 'Closed to new season work. Returning clients can still book.' }
  };
  var s = SEASON[SEASON_STATE] || SEASON['in-season'];

  document.querySelectorAll('[data-door]').forEach(function (el) {
    el.classList.toggle('is-primary', el.getAttribute('data-door') === s.primary);
  });
  document.querySelectorAll('[data-season-text]').forEach(function (el) { el.textContent = s.text; });
  document.querySelectorAll('.jacket[data-gated]').forEach(function (j) {
    var off = SEASON_STATE === 'closed-to-new';
    j.classList.toggle('is-off', off);
    j.classList.toggle('is-active', !off && j.hasAttribute('data-active'));
    var label = j.getAttribute('data-label') || '';
    j.setAttribute('aria-label', label + ' — ' + (off ? 'not currently taken' : (j.classList.contains('is-active') ? 'active' : 'resting')));
  });

  // Header condenses 84px -> 62px past 130px; sticky bar after the hero leaves
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero, .page-head');
  var bar = document.querySelector('.sticky-bar');
  function onScroll() {
    if (header) header.classList.toggle('condensed', window.scrollY > 130);
    if (bar && hero) bar.classList.toggle('show', reduce || hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile overlay
  var openBtn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.overlay');
  if (openBtn && overlay) {
    var closeBtn = overlay.querySelector('.overlay-close');
    openBtn.addEventListener('click', function () { overlay.classList.add('open'); openBtn.setAttribute('aria-expanded', 'true'); closeBtn.focus(); });
    closeBtn.addEventListener('click', function () { overlay.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeBtn.click(); });
  }

  // Reveals (8px rise, 45ms stagger), jacket open, rail build, table rows — each once
  var targets = document.querySelectorAll('.reveal, .jacket, .rail, .table-wrap, .tags');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains('reveal')) {
          var i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(i, 6) * 45 + 'ms';
        }
        if (el.classList.contains('table-wrap')) {
          el.querySelectorAll('tbody tr').forEach(function (tr, n) { tr.style.transitionDelay = n * 35 + 'ms'; });
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Appointment slot picker
  var slots = document.querySelectorAll('.slot');
  var echo = document.getElementById('slot-echo');
  var hidden = document.getElementById('chosen-slot');
  slots.forEach(function (b) {
    b.addEventListener('click', function () {
      slots.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      if (echo) echo.textContent = b.getAttribute('data-slot');
      if (hidden) hidden.value = b.getAttribute('data-slot');
    });
  });

  // Quote route: returns a band and a human — never a figure
  var quote = document.getElementById('quote-form');
  if (quote) {
    quote.addEventListener('change', function () {
      var answered = quote.querySelectorAll('input[type=radio]:checked').length;
      var out = document.getElementById('band-echo');
      if (out) out.textContent = answered >= 3 ? 'Likely Band B — a person confirms the band and fee in writing before any work starts (demo logic).' : 'Answer a few questions above';
    });
  }

  // Forms: unticked consent required; nothing is sent in the demo
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = f.querySelector('.error');
      if (!f.checkValidity()) { f.reportValidity(); return; }
      if (hidden && f.contains(hidden) && !hidden.value) { if (err) { err.textContent = 'Pick an appointment slot first.'; err.focus(); } return; }
      f.hidden = true;
      var ok = document.getElementById(f.getAttribute('data-success'));
      if (ok) { ok.classList.add('show'); ok.focus(); }
    });
  });
})();
