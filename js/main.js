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
     BOOTSTRAP DROPDOWN HOVER (desktop only)
  ════════════════════════════════════════ */
  if (window.innerWidth >= 1200) {
    const allNavDds = document.querySelectorAll('.navbar-nav .dropdown-toggle');
    allNavDds.forEach(toggle => {
      const dd = toggle.closest('.dropdown');
      if (!dd) return;
      const menu = dd.querySelector('.dropdown-menu');
      if (!menu) return;

      let hideTimer = null;

      function closeAllNavDropdowns() {
        allNavDds.forEach(otherToggle => {
          if (otherToggle !== toggle) {
            const otherDd = otherToggle.closest('.dropdown');
            if (otherDd && otherDd.classList.contains('show')) {
              const inst = bootstrap.Dropdown.getInstance(otherToggle);
              if (inst) inst.hide();
            }
          }
        });
      }

      function showDropdown() {
        clearTimeout(hideTimer);
        closeAllNavDropdowns();
        if (!dd.classList.contains('show')) {
          const bsDD = bootstrap.Dropdown.getOrCreateInstance(toggle);
          bsDD.show();
        }
      }

      function scheduleHide() {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          if (dd.classList.contains('show')) {
            const bsDD = bootstrap.Dropdown.getInstance(toggle);
            if (bsDD) bsDD.hide();
          }
        }, 180);
      }

      dd.addEventListener('mouseenter', showDropdown);
      dd.addEventListener('mouseleave', scheduleHide);
      menu.addEventListener('mouseenter', showDropdown);
      menu.addEventListener('mouseleave', scheduleHide);
    });
  }

  /* ════════════════════════════════════════
     CLOSE MOBILE MENU ON LINK CLICK
  ════════════════════════════════════════ */
  const navCollapse = document.getElementById('navMain');
  if (navCollapse) {
    const closeLinks = navCollapse.querySelectorAll('.nav-link, .dropdown-item');
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
     ACTIVE NAV LINK ON SCROLL
  ════════════════════════════════════════ */
  const sections = document.querySelectorAll('[id]');
  const scrollLinks = document.querySelectorAll('.nav-link[href^="#"]');

  function syncActiveLink() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 160) current = s.id;
    });
    scrollLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', syncActiveLink, { passive: true });
  syncActiveLink();

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

  function applyTranslation(lang) {
    const dict = i18n[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
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
  }

  document.querySelectorAll('.lang-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const lang = this.dataset.lang;
      if (lang && lang !== currentLang) {
        applyTranslation(lang);
      }
      const btn = document.querySelector('.lang-btn');
      if (btn && window.innerWidth >= 1200) {
        const bsDD = bootstrap.Dropdown.getInstance(btn);
        if (bsDD) bsDD.hide();
      }
    });
  });

  applyTranslation(currentLang);

})();
