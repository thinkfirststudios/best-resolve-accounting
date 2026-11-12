/* Best Resolve Accounting — V12 site script. No chat widget, no pop-ups. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function track(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }

  // Header condenses past 120px; sticky bar once the hero leaves
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var bar = document.querySelector('.sticky-bar');
  function onScroll() {
    if (header) header.classList.toggle('condensed', window.scrollY > 120);
    if (bar && hero) bar.classList.toggle('show', reduce || hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // PREVIEW ONLY: ?bg=light|split|glow|ledger shows a hero background option. Remove once one is chosen.
  var bgOpt = /[?&]bg=(light|split|glow|ledger)/.exec(location.search);
  if (bgOpt && hero) { hero.classList.add('bg-' + bgOpt[1]); if (bgOpt[1] === 'split') hero.classList.add('bg-light'); }

  // Mobile menu
  var openBtn = document.querySelector('.menu-btn');
  var overlay = document.querySelector('.overlay');
  if (openBtn && overlay) {
    var closeBtn = overlay.querySelector('.overlay-close');
    var close = function () { overlay.classList.remove('open'); openBtn.setAttribute('aria-expanded', 'false'); };
    openBtn.addEventListener('click', function () { overlay.classList.add('open'); openBtn.setAttribute('aria-expanded', 'true'); closeBtn.focus(); });
    closeBtn.addEventListener('click', function () { close(); openBtn.focus(); });
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) { close(); openBtn.focus(); } });
  }

  // Hero statements: dots switch them; auto-advance only without reduced motion, pausable, stops on hover/focus
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('.dots-nav [data-slide]');
  var pause = document.querySelector('.dots-nav .pause');
  if (slides.length > 1) {
    var cur = 0, timer = null, held = false;
    var show = function (n) {
      cur = n;
      slides.forEach(function (s, i) { s.classList.toggle('on', i === n); s.setAttribute('aria-hidden', i === n ? 'false' : 'true'); });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === n ? 'true' : 'false'); });
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var start = function () { if (reduce || held || timer) return; timer = setInterval(function () { show((cur + 1) % slides.length); }, 7000); };
    dots.forEach(function (d) { d.addEventListener('click', function () { show(+d.getAttribute('data-slide')); stop(); held = true; if (pause) pause.textContent = 'Play'; }); });
    if (pause) {
      if (reduce) { pause.textContent = 'Play'; held = true; }
      pause.addEventListener('click', function () { held = !held; pause.textContent = held ? 'Play' : 'Pause'; if (held) stop(); else { reduce = false; start(); } });
    }
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('focusin', stop);
    }
    show(0); start();
  }

  // Reveals: 18px rise, 70ms stagger; heading underline and card rules draw once
  var targets = document.querySelectorAll('.reveal, .find-card, .em');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains('reveal')) {
          var i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
          el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Analytics events: calls and consultation buttons
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { track('click_to_call'); }); });
  document.querySelectorAll('a[href="#contact"], a[data-booking]').forEach(function (a) { a.addEventListener('click', function () { track('book_consultation_click'); }); });

  // BOOKING LINK: Brandon's Google Calendar booking page. Every "Book a free consultation" button opens it
  // in a new tab. Leave it empty and the buttons scroll to the contact form instead. Menu links named
  // "Contact" always go to the contact section.
  var BOOKING_URL = 'https://calendar.app.google/yWFgAbv3nsA1akneA';
  if (BOOKING_URL) {
    document.querySelectorAll('a[href="#contact"]').forEach(function (a) {
      if (a.textContent.trim() === 'Contact') return;
      a.href = BOOKING_URL; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  // Contact form: posts to Netlify Forms (the hidden "form-name" field tells Netlify which form it is)
  var form = document.getElementById('contact-form');
  if (form) {
    var ok = document.getElementById(form.getAttribute('data-success'));
    var err = form.querySelector('.error');
    var btn = form.querySelector('button[type=submit]');
    var label = btn.textContent;
    var done = function () {
      track('generate_lead', { form: 'consultation' });
      var first = (form.querySelector('[name="first_name"]').value || '').trim().split(' ')[0];
      var who = ok.querySelector('[data-name]');
      if (who && first) who.textContent = ', ' + first;
      form.hidden = true;
      ok.classList.add('show');
      ok.focus();
    };
    var fail = function () {
      btn.disabled = false; btn.textContent = label;
      err.textContent = "Your message didn't go through. Please call or text (619) 854-1434, or email bestresolveaccntng@gmail.com.";
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch('/', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) { if (!r.ok) throw new Error(r.status); done(); }).catch(fail);
    });
  }
})();
