(function () {
  'use strict';

  /* ════════════════════════════════════════
     NAVBAR SCROLL
  ════════════════════════════════════════ */
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  function syncNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', syncNav, { passive: true });
  syncNav();

  /* ════════════════════════════════════════
     CLOSE MOBILE MENU ON LINK CLICK
  ════════════════════════════════════════ */
  const navCollapse = document.getElementById('navMain');
  if (navCollapse) {
    const closeLinks = navCollapse.querySelectorAll('.nav-link');
    closeLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 1200 && navCollapse.classList.contains('show')) {
          var bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* ════════════════════════════════════════
     ENHANCED SCROLL-REVEAL
  ════════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale, .anim').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale, .anim').forEach(function (el) {
      el.classList.add('in');
    });
  }

  /* ─── stagger children helper ─── */
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    var delay = parseFloat(parent.getAttribute('data-stagger')) || 0.1;
    var children = parent.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.classList.contains('reveal') || child.classList.contains('reveal-l') || child.classList.contains('reveal-r') || child.classList.contains('reveal-scale') || child.classList.contains('anim')) {
        child.style.transitionDelay = (i * delay) + 's';
      }
    }
  });

  /* ════════════════════════════════════════
     COUNTER ANIMATION
  ════════════════════════════════════════ */
  var counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) target = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (isNaN(target)) return;
          var duration = 1500;
          var startTime = null;
          function animateCounter(time) {
            if (!startTime) startTime = time;
            var progress = Math.min((time - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
              requestAnimationFrame(animateCounter);
            } else {
              el.textContent = target;
            }
          }
          requestAnimationFrame(animateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
      counters.forEach(function (c) { counterObserver.observe(c); });
  }

  /* ════════════════════════════════════════
     PACKAGE PRICE COUNTER
  ════════════════════════════════════════ */
  var priceVals = document.querySelectorAll('.pkg-price-val, .t-price-val');
  if (priceVals.length && 'IntersectionObserver' in window) {
    var priceObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;
          var duration = 1200;
          var startTime = null;
          function animPrice(time) {
            if (!startTime) startTime = time;
            var p = Math.min((time - startTime) / duration, 1);
            var e = 1 - Math.pow(1 - p, 3);
            var cur = Math.floor(e * target);
            el.textContent = cur.toLocaleString('en-US');
            if (p < 1) requestAnimationFrame(animPrice);
            else el.textContent = target.toLocaleString('en-US');
          }
          requestAnimationFrame(animPrice);
          priceObserver.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    priceVals.forEach(function (v) { priceObserver.observe(v); });
  }

  /* ════════════════════════════════════════
     HOME CARD CLICK (open animation + redirect)
  ════════════════════════════════════════ */
  document.querySelectorAll('.hm-card').forEach(function (card) {
    card.addEventListener('click', function () {
      if (card.classList.contains('opening')) return;
      card.classList.add('opening');
      var href = card.getAttribute('data-href');
      if (href) {
        setTimeout(function () {
          window.location.href = href;
        }, 1000);
      }
    });
  });

  /* ════════════════════════════════════════
     CARD TILT ON MOUSE MOVE
  ════════════════════════════════════════ */
  document.querySelectorAll('[data-tilt]').forEach(function (card) {
    var glow = card.querySelector('.hm-card-glow');
    var tiltFactor = 20;
    if (card.classList.contains('corp-bespoke-card')) {
      tiltFactor = 8;
    }
    if (card.classList.contains('about-value-card')) {
      tiltFactor = 6;
    }
    card.addEventListener('mousemove', function (e) {
      if (card.classList.contains('opening')) return;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var inner = card.querySelector('.pkg-card-inner, .hm-card-inner, .corp-bespoke-inner, .about-value-inner');
      var isHm = inner && inner.classList.contains('hm-card-inner');
      if (inner) {
        inner.style.transform =
          'translateY(-12px) rotateX(' + (-y * tiltFactor) + 'deg) rotateY(' + (x * tiltFactor) + 'deg)';
      }
      if (glow && isHm) {
        var px = (x * 100 + 50);
        var py = (y * 100 + 50);
        glow.style.background =
          'radial-gradient(ellipse at ' + px + '% ' + py + '%, rgba(201,169,110,0.25), transparent 70%)';
      }
    });
    card.addEventListener('mouseleave', function () {
      var inner = card.querySelector('.pkg-card-inner, .hm-card-inner, .corp-bespoke-inner, .about-value-inner');
      if (inner) inner.style.transform = '';
      if (glow) glow.style.background = '';
    });
  });

  /* ════════════════════════════════════════
     ACTIVE NAV LINK BY PAGE
  ════════════════════════════════════════ */
  (function () {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  })();

  /* ════════════════════════════════════════
     LANGUAGE SWITCHER
  ════════════════════════════════════════ */
  function getInitialLang() {
    var saved = localStorage.getItem('mygv_lang');
    if (saved && i18n[saved]) return saved;
    var navLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2);
    if (i18n[navLang]) return navLang;
    return 'en';
  }

  var currentLang = getInitialLang();
  window.currentLang = currentLang;

  function applyTranslation(lang) {
    var dict = i18n[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (el.tagName === 'IMG') {
          el.setAttribute('alt', dict[key]);
        } else {
          while (el.firstChild) el.removeChild(el.firstChild);
          el.appendChild(document.createTextNode(dict[key]));
        }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    var flagMap = { en: '<img src="https://flagcdn.com/w20/ca.png" alt="EN" class="flag-img">', fr: '<img src="https://flagcdn.com/w20/fr.png" alt="FR" class="flag-img">', es: '<img src="https://flagcdn.com/w20/es.png" alt="ES" class="flag-img">' };
    var codeMap = { en: 'EN', fr: 'FR', es: 'ES' };

    var flagEl = document.getElementById('currentFlag');
    var codeEl = document.getElementById('currentLang');
    if (flagEl) flagEl.innerHTML = flagMap[lang] || flagMap.en;
    if (codeEl) codeEl.textContent = codeMap[lang] || 'EN';

    document.querySelectorAll('.lang-dropdown .dropdown-item').forEach(function (item) {
      item.classList.toggle('active-lang', item.dataset.lang === lang);
    });

    document.documentElement.lang = lang;
    localStorage.setItem('mygv_lang', lang);
    currentLang = lang;
    window.currentLang = lang;
    if (typeof window.applyMapTranslations === 'function') {
      window.applyMapTranslations();
    }
  }

  var langDropdown = document.querySelector('.lang-dropdown');
  if (langDropdown) {
    langDropdown.addEventListener('click', function (e) {
      var item = e.target.closest('.dropdown-item');
      if (!item) return;
      e.preventDefault();
      var lang = item.dataset.lang;
      if (lang && lang !== currentLang) {
        applyTranslation(lang);
      }
      var btn = document.querySelector('.lang-btn');
      if (btn && window.innerWidth >= 1200) {
        var bsDD = bootstrap.Dropdown.getInstance(btn);
        if (bsDD) bsDD.hide();
      }
    });
  }

  applyTranslation(currentLang);

  /* ════════════════════════════════════════
     COURSE CARD ACCORDION
  ════════════════════════════════════════ */
  document.querySelectorAll('.gvnb-card-header').forEach(function (header) {
    header.addEventListener('click', function () {
      this.closest('.gvnb-card').classList.toggle('is-open');
    });
  });

})();
