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

  // Alloy grades. Source: Copper Table 8, "Properties of NF Alloys Materials".
  // comp lists [element, content]; rwma is 0 where the grade has no RWMA class.
  var grades = [
    { id: 'c', group: 'Copper', name: 'NFA C', uns: 'C11000', full: 'Copper', comp: [['Cu', '99.99%']], rwma: 0, hard: '25 B', cond: 100 },
    { id: 'ofc', group: 'Copper', name: 'NFA OFC', uns: 'C10100', full: 'Oxygen free copper, electronic grade', comp: [['Cu', '99.99%'], ['Oxygen', 'less than 5 ppm']], rwma: 0, hard: '40 B / 76 HB', cond: 100 },
    { id: 'sc', group: 'Copper', name: 'NFA SC', uns: 'C10700', full: 'Silver copper', comp: [['Ag', '0.08–0.12%'], ['P', '0.001–0.007%'], ['Cu', 'Rest']], rwma: 0, hard: '53 B / 90 HB', cond: 96 },
    { id: 'zcu', group: 'Copper alloys', name: 'NFA ZCu', uns: 'C15000', full: 'Zirconium copper', comp: [['Zr', '0.10–0.20%'], ['Cu', 'Rest']], rwma: 1, hard: '70 B / 121 HB', cond: 90 },
    { id: 'cc', group: 'Copper alloys', name: 'NFA CC', uns: 'C18200', full: 'Chromium copper', comp: [['Cr', '0.6–1.2%'], ['Fe', '0.10%'], ['Pb', '0.05%'], ['Si', '0.10%'], ['Cu', 'Rest']], rwma: 2, hard: '75 B / 135 HB', cond: 95 },
    { id: 'czr', group: 'Copper alloys', name: 'NFA CZR', uns: 'C18150', full: 'Chromium zirconium copper', comp: [['Cr', '0.50–1.5%'], ['Zr', '0.05–0.25%'], ['Cu', 'Rest']], rwma: 2, hard: '77 B / 140 HB', cond: 75 },
    { id: 'nb05', group: 'Copper alloys', name: 'NFA NB0.5', uns: 'C17510', full: '0.5% beryllium copper (nickel)', comp: [['Be', '0.4%'], ['Al', '0.20%'], ['Fe', '0.10%'], ['Ni', '2%'], ['Si', '0.2%'], ['Cu', 'Rest']], rwma: 3, hard: '100 B / 240 HB', cond: 48 },
    { id: 'cb05', group: 'Copper alloys', name: 'NFA CB0.5', uns: 'C17500', full: '0.5% beryllium copper (cobalt)', comp: [['Be', '0.5%'], ['Al', '0.20%'], ['Co', '2.2%'], ['Fe', '0.10%'], ['Si', '0.2%'], ['Cu', 'Rest']], rwma: 3, hard: '100 B / 240 HB', cond: 48 },
    { id: 'nscc', group: 'Copper alloys', name: 'NFA NSCC', uns: 'C18000', full: 'Nickel silicon chromium copper', comp: [['Ni', '1.8–3%'], ['Cr', '0.1–0.8%'], ['Fe', '0.15%'], ['Si', '0.4–0.8%'], ['Cu', 'Rest']], rwma: 3, hard: '93 B / 199 HB', cond: 48 },
    { id: 'be2', group: 'Copper alloys', name: 'NFA BE 2', uns: 'C17200', full: '2% beryllium copper', comp: [['Be', '1.8–2%'], ['Al', '0.2%'], ['Co', '0.2%'], ['Si', '0.2%'], ['Cu', 'Rest']], rwma: 4, hard: '109 B / 331 HB', cond: 22 },
    { id: 't55', group: 'Refractory metals', name: 'NFA T55 / C 45', uns: '', full: 'Tungsten copper', comp: [['Tungsten', '55%'], ['Copper', '45%']], rwma: 10, hard: '72–82 B', cond: 55 },
    { id: 't70', group: 'Refractory metals', name: 'NFA T70 / C 30', uns: '', full: 'Tungsten copper', comp: [['Tungsten', '70%'], ['Copper', '30%']], rwma: 10, hard: '88–95 B', cond: 49 },
    { id: 't75', group: 'Refractory metals', name: 'NFA T 75 / C 25', uns: '', full: 'Tungsten copper', comp: [['Tungsten', '75%'], ['Copper', '25%']], rwma: 11, hard: '96–95 B', cond: 45 },
    { id: 't80', group: 'Refractory metals', name: 'NFA T 80 / C 20', uns: '', full: 'Tungsten copper', comp: [['Tungsten', '80%'], ['Copper', '20%']], rwma: 12, hard: '99–104 B', cond: 43 },
    { id: 't100', group: 'Refractory metals', name: 'NFA T 100', uns: '', full: 'Tungsten', comp: [['Tungsten', '100%']], rwma: 13, hard: '39 C', cond: 31 },
    { id: 'm100', group: 'Refractory metals', name: 'NFA M 100', uns: '', full: 'Molybdenum', comp: [['Molybdenum', '100%']], rwma: 14, hard: '89 B', cond: 30 },
    { id: 'dsc', group: 'Dispersion strengthened', name: 'NFA DSC', uns: 'C15725', full: 'Dispersion strengthened copper', comp: [], rwma: 20, hard: '73–82 B', cond: 87 }
  ];
  var pills = document.getElementById('gradePills');
  var $ = function (id) { return document.getElementById(id); };
  function rwmaLabel(g) { return g.rwma ? 'RWMA Class ' + g.rwma : 'No RWMA class'; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function showGrade(id) {
    var g = grades.filter(function (x) { return x.id === id; })[0];
    $('gName').textContent = g.name;
    $('gFull').textContent = g.full;
    $('gRwma').textContent = rwmaLabel(g);
    $('gUns').textContent = g.uns || '—';
    $('gHard').textContent = g.hard;
    $('gCondL').textContent = g.cond + '%';
    $('gCond').style.width = g.cond + '%';
    var comp = $('gComp');
    comp.textContent = '';
    if (!g.comp.length) comp.appendChild(el('li', 'comp-only', g.full));
    g.comp.forEach(function (c) {
      var li = el('li');
      li.appendChild(el('span', null, c[0]));
      li.appendChild(el('strong', null, c[1]));
      comp.appendChild(li);
    });
    pills.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === id)); });
  }
  var groupRow = {};
  grades.forEach(function (g) {
    if (!groupRow[g.group]) {
      var wrap = el('div', 'grade-group');
      wrap.appendChild(el('span', 'grade-group-label', g.group));
      groupRow[g.group] = el('div', 'grade-pills');
      wrap.appendChild(groupRow[g.group]);
      pills.appendChild(wrap);
    }
    var b = el('button', null, g.name);
    b.type = 'button';
    b.dataset.id = g.id;
    b.addEventListener('click', function () { showGrade(g.id); });
    groupRow[g.group].appendChild(b);
  });
  showGrade('czr');

  // Full properties table, from the same data
  var rows = $('gradeRows');
  grades.forEach(function (g) {
    var tr = el('tr');
    var th = el('th', null, g.name);
    th.scope = 'row';
    tr.appendChild(th);
    tr.appendChild(el('td', null, g.uns || '—'));
    var compText = g.comp.map(function (c) { return c[0] + ' ' + c[1]; }).join(' · ');
    var td = el('td', 'tc-comp');
    td.appendChild(el('strong', null, g.full));
    if (compText) td.appendChild(el('span', null, compText));
    tr.appendChild(td);
    tr.appendChild(el('td', null, g.rwma ? 'Class ' + g.rwma : '—'));
    tr.appendChild(el('td', null, g.hard));
    tr.appendChild(el('td', 'tc-num', g.cond + '%'));
    rows.appendChild(tr);
  });

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
