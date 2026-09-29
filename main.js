/* PSL Alloys site behaviour. No dependencies. */
(function () {
  'use strict';

  // Where quote requests go. Set this to your form backend (Formspree, Getform,
  // your own API...). While it is empty, the form opens the visitor's email app instead.
  var FORM_ENDPOINT = '';
  var SALES_EMAIL = 'sales@pslalloys.com';

  var doc = document.documentElement;
  doc.classList.add('js');

  // Header background once the page scrolls
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  nav.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); } });

  // Scroll reveal fallback for browsers without CSS scroll timelines
  var reveals = document.querySelectorAll('.reveal');
  var hasTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!hasTimeline && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // Film strip arrows
  var strip = document.getElementById('strip');
  function stripBy(dir) {
    var tile = strip.querySelector('.tile');
    var step = tile ? tile.getBoundingClientRect().width + 24 : 340;
    strip.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  document.getElementById('stripPrev').addEventListener('click', function () { stripBy(-1); });
  document.getElementById('stripNext').addEventListener('click', function () { stripBy(1); });

  // Alloy grade selector
  var grades = [
    { id: 'cuzr', name: 'CuZr', code: 'C15000', full: 'Copper zirconium', rwma: 'RWMA Class 1', cond: 90, hard: 72, use: 'Aluminium and galvanised or coated steel, where low contact resistance stops sticking.' },
    { id: 'cucrzr', name: 'CuCrZr', code: 'C18150', full: 'Copper chromium zirconium', rwma: 'RWMA Class 2', cond: 80, hard: 80, use: 'The all-round grade for caps, shanks and holders on mild, coated and galvanised steel.' },
    { id: 'cucobe', name: 'CuCoBe', code: 'C17500', full: 'Copper cobalt beryllium', rwma: 'RWMA Class 3', cond: 50, hard: 98, use: 'Stainless steel and high-force projection and seam welding where tips must not deform.' },
    { id: 'cunisi', name: 'CuNiSi', code: 'C18000', full: 'Copper nickel silicon', rwma: 'RWMA Class 3', cond: 45, hard: 94, use: 'A beryllium-free alternative to Class 3 for shafts, bushes and heavy-duty holders.' },
    { id: 'wcu', name: 'W-Cu', code: '75W / 25Cu', full: 'Tungsten copper', rwma: 'RWMA Class 11', cond: 40, hard: 100, use: 'Brazed faces for nut, stud and projection electrodes that see high pressure and wear.' }
  ];
  var pills = document.getElementById('gradePills');
  var $ = function (id) { return document.getElementById(id); };
  function showGrade(id) {
    var g = grades.filter(function (x) { return x.id === id; })[0];
    $('gName').textContent = g.name;
    $('gFull').textContent = g.full + ', ' + g.code;
    $('gRwma').textContent = g.rwma;
    $('gCondL').textContent = '~' + g.cond + '% IACS';
    $('gHardL').textContent = '~' + g.hard + ' HRB';
    $('gCond').style.width = g.cond + '%';
    $('gHard').style.width = g.hard + '%';
    $('gUse').textContent = g.use;
    Array.prototype.forEach.call(pills.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === id)); });
  }
  grades.forEach(function (g) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = g.name;
    b.dataset.id = g.id;
    b.addEventListener('click', function () { showGrade(g.id); });
    pills.appendChild(b);
  });
  showGrade('cucrzr');

  // Product links pre-fill the quote form
  var productSelect = $('productSelect');
  document.querySelectorAll('[data-product]').forEach(function (a) {
    a.addEventListener('click', function () { productSelect.value = a.dataset.product; });
  });

  // Quote form
  var form = $('quoteForm');
  var msg = $('formMsg');
  function say(text, isErr) { msg.textContent = text; msg.classList.toggle('err', !!isErr); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    ['name', 'email'].forEach(function (n) {
      var f = form.elements[n];
      var ok = f.value.trim() !== '' && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim()));
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !bad) bad = f;
    });
    if (bad) { say(bad.name === 'email' ? 'Enter a valid email so we can reply.' : 'Enter your name.', true); bad.focus(); return; }

    if (FORM_ENDPOINT) {
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; say('Sending your request…');
      fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); say('Request sent. We reply within one working day.'); })
        .catch(function () { say('Could not send. Email us at ' + SALES_EMAIL + ' instead.', true); })
        .finally(function () { btn.disabled = false; });
      return;
    }

    var f = form.elements;
    var body = [
      'Name: ' + f.name.value, 'Company: ' + f.company.value, 'Email: ' + f.email.value,
      'Phone: ' + f.phone.value, 'Product: ' + f.product.value, '', f.notes.value
    ].join('\n');
    window.location.href = 'mailto:' + SALES_EMAIL + '?subject=' + encodeURIComponent('Quote request: ' + f.product.value) + '&body=' + encodeURIComponent(body);
    say(f.drawing.files.length ? 'Your email app is opening. Attach your drawing there before sending.' : 'Your email app is opening with your request.');
  });

  $('year').textContent = new Date().getFullYear();
})();
