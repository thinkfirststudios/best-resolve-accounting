/* Brandon Rodriguez, CPA — site script (Version 2). No chat widget, no pop-ups. */

// Season line under the hero. Flip once a year: 'in-season' (roughly Jan–Apr) or 'off-season'.
var SEASON_STATE = 'off-season';

(function () {
  'use strict';
  document.documentElement.classList.add('js');
  function track(name, params) { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); }

  var SEASON_TEXT = {
    'in-season': 'Filing season is open. Book now to get on the calendar.',
    'off-season': 'A good time to set up monthly bookkeeping or catch up.'
  };
  document.querySelectorAll('[data-season-text]').forEach(function (el) {
    el.textContent = SEASON_TEXT[SEASON_STATE] || SEASON_TEXT['off-season'];
  });

  // Header condenses on scroll; the mobile action bar appears once the hero is out of view
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var bar = document.querySelector('.sticky-bar');
  function onScroll() {
    if (header) header.classList.toggle('condensed', window.scrollY > 130);
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
