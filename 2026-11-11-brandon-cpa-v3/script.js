/* Brandon Rodriguez, CPA — site script (Version 1). No chat widget, no pop-ups. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function track(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }

  // Header condenses on scroll; the mobile action bar appears once the hero is out of view
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var bar = document.querySelector('.sticky-bar');
  function onScroll() {
    if (header) header.classList.toggle('condensed', window.scrollY > 120);
    if (bar && hero) bar.classList.toggle('show', hero.getBoundingClientRect().bottom < 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // Scroll reveals with a short stagger among siblings; the How It Works line draws once
  var targets = document.querySelectorAll('.how-steps, .reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.classList.contains('reveal') && el.parentElement) {
          var i = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
        }
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  // Analytics events for the ads: calls and consultation CTAs
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { track('click_to_call'); }); });
  document.querySelectorAll('a[href="#contact"]').forEach(function (a) { a.addEventListener('click', function () { track('book_consultation_click'); }); });

  // Contact form: sends through FormSubmit to the address in the form's action attribute
  var form = document.getElementById('contact-form');
  if (form) {
    var ok = document.getElementById(form.getAttribute('data-success'));
    var err = form.querySelector('.error');
    var btn = form.querySelector('button[type=submit]');
    var label = btn.textContent;
    var done = function () {
      track('generate_lead', { form: 'consultation' });
      var nameField = form.querySelector('[name="first_name"]');
      var first = nameField ? nameField.value.trim().split(' ')[0] : '';
      var who = ok.querySelector('[data-name]');
      if (who && first) who.textContent = ', ' + first;
      form.hidden = true;
      ok.classList.add('show');
      ok.focus();
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var action = form.getAttribute('action');
      if (action.indexOf('BRANDON_EMAIL_HERE') !== -1) {
        // Preview mode: no inbox connected yet, so nothing is sent
        console.info('Contact form preview: add the email address to the form action to start receiving messages.');
        done();
        return;
      }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch(action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(done)
        .catch(function () {
          btn.disabled = false; btn.textContent = label;
          err.textContent = "Your message didn't go through. Please call or text (619) 854-1434, or email bestresolveaccntng@gmail.com.";
        });
    });
  }
})();

/* Signature intro: writes the name, then lifts away and lets the hero animate in */
(function () {
  'use strict';
  var d = document.documentElement, ov = document.querySelector('.intro-overlay');
  if (!ov) return;
  if (!d.classList.contains('intro-on')) { ov.parentNode.removeChild(ov); return; }
  try { sessionStorage.setItem('br-intro:' + location.pathname, '1'); } catch (e) {}
  var done = false, started = false, timer;
  function finish() {
    if (done) return; done = true; clearTimeout(timer);
    ov.classList.add('out');
    d.classList.remove('intro-on');
    setTimeout(function () { if (ov.parentNode) ov.parentNode.removeChild(ov); }, 850);
  }
  function go() { if (started) return; started = true; ov.classList.add('go'); timer = setTimeout(finish, 2500); }
  if (document.fonts && document.fonts.load) { document.fonts.load('64px "Mrs Saint Delafield"').then(go, go); setTimeout(go, 900); } else { go(); }
  ['click', 'keydown', 'touchstart', 'wheel'].forEach(function (t) { window.addEventListener(t, finish, { once: true, passive: true }); });
})();
