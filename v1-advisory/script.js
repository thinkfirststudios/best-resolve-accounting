/* CARRACK ADVISORY — fictional demo. No tracking, no chat widget, no exit-intent, no count-up. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header condenses past 120px; the mobile sticky bar appears once the hero has scrolled away
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero, .page-head');
  var bar = document.querySelector('.sticky-bar');
  function onScroll() {
    if (header) header.classList.toggle('condensed', window.scrollY > 120);
    if (bar && hero) bar.classList.toggle('show', reduce || hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile overlay menu
  var openBtn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.overlay');
  if (openBtn && overlay) {
    var closeBtn = overlay.querySelector('.overlay-close');
    openBtn.addEventListener('click', function () { overlay.classList.add('open'); openBtn.setAttribute('aria-expanded', 'true'); closeBtn.focus(); });
    closeBtn.addEventListener('click', function () { overlay.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) closeBtn.click(); });
  }

  // Reveals: rise + fade with a short stagger among siblings; the process rail's line draws once
  var targets = document.querySelectorAll('.reveal, .rail');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains('reveal') && el.parentElement) {
          var i = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Introductory-call time picker: single-select, echoed into the summary
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
  var reason = document.getElementById('reason');
  var reasonEcho = document.getElementById('reason-echo');
  if (reason && reasonEcho) reason.addEventListener('change', function () { reasonEcho.textContent = reason.value || '—'; });

  // Forms: unticked consent required; nothing is sent anywhere in the demo
  document.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = f.querySelector('.error');
      if (!f.checkValidity()) { f.reportValidity(); return; }
      if (hidden && f.contains(hidden) && !hidden.value) {
        if (err) { err.textContent = 'Pick a time in step 1 first.'; err.focus(); }
        return;
      }
      if (err) err.textContent = '';
      var ok = document.getElementById(f.getAttribute('data-success'));
      f.hidden = true;
      if (ok) { ok.classList.add('show'); ok.focus(); }
    });
  });
})();
