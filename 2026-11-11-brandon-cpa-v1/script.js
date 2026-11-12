/* Brandon Rodriguez, CPA — site script (Version 1). No chat widget, no pop-ups. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
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
      var nameField = form.querySelector('[name="name"]');
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

/* Motion: headings and groups reveal as they scroll in; the How It Works line (V1) fills with scroll */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('main section:not(.hero) h2').forEach(function (h) { h.setAttribute('data-reveal', ''); });
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty('--i', Math.min(i, 7)); });
  });
  var els = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }

  var steps = document.querySelector('[data-progress]');
  if (steps) {
    var items = steps.querySelectorAll('.step');
    var queued = false;
    var update = function () {
      queued = false;
      var line = window.innerHeight * 0.6, r = steps.getBoundingClientRect();
      var p = reduce ? 1 : Math.max(0, Math.min(1, (line - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      items.forEach(function (s) { s.classList.toggle('on', reduce || s.getBoundingClientRect().top < line); });
    };
    window.addEventListener('scroll', function () { if (!queued) { queued = true; window.requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
