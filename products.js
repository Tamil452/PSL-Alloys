/* PSL Alloys products page behaviour. No dependencies. */
(function () {
  'use strict';

  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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

  // Highlight the category chip for the section in view
  var chips = Array.prototype.slice.call(document.querySelectorAll('.cat-nav a'));
  var chipFor = {};
  chips.forEach(function (a) { chipFor[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        chips.forEach(function (a) { a.classList.remove('on'); a.removeAttribute('aria-current'); });
        var a = chipFor[en.target.id];
        if (a) {
          a.classList.add('on');
          a.setAttribute('aria-current', 'true');
          var bar = a.parentNode;
          if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: a.offsetLeft - 24, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(chipFor).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
