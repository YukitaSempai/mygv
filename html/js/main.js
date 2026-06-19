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
    closeLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1200 && navCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      });
    });
  }

  /* ════════════════════════════════════════
     SCROLL-REVEAL
  ════════════════════════════════════════ */
  const animEls = document.querySelectorAll('.anim');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
    animEls.forEach(el => io.observe(el));
  } else {
    animEls.forEach(el => el.classList.add('in'));
  }

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
    const saved = localStorage.getItem('mygv_lang');
    if (saved && i18n[saved]) return saved;
    const navLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2);
    if (i18n[navLang]) return navLang;
    return 'en';
  }

  let currentLang = getInitialLang();
  window.currentLang = currentLang;

  function applyTranslation(lang) {
    const dict = i18n[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (el.tagName === 'IMG') {
          el.setAttribute('alt', dict[key]);
        } else {
          el.textContent = dict[key];
        }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    const flagMap = { en: '<img src="https://flagcdn.com/w20/ca.png" alt="EN" class="flag-img">', fr: '<img src="https://flagcdn.com/w20/fr.png" alt="FR" class="flag-img">', es: '<img src="https://flagcdn.com/w20/es.png" alt="ES" class="flag-img">' };
    const codeMap = { en: 'EN', fr: 'FR', es: 'ES' };

    const flagEl = document.getElementById('currentFlag');
    const codeEl = document.getElementById('currentLang');
    if (flagEl) flagEl.innerHTML = flagMap[lang] || flagMap['en'];
    if (codeEl) codeEl.textContent = codeMap[lang] || 'EN';

    document.querySelectorAll('.lang-dropdown .dropdown-item').forEach(item => {
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

  document.querySelector('.lang-dropdown').addEventListener('click', function (e) {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    e.preventDefault();
    const lang = item.dataset.lang;
    if (lang && lang !== currentLang) {
      applyTranslation(lang);
    }
    const btn = document.querySelector('.lang-btn');
    if (btn && window.innerWidth >= 1200) {
      const bsDD = bootstrap.Dropdown.getInstance(btn);
      if (bsDD) bsDD.hide();
    }
  });

  applyTranslation(currentLang);

})();
