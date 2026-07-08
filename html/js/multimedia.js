(function () {
  'use strict';

  /* ─── Filter Tabs ─── */
  var filters = document.querySelectorAll('.mm-filter');
  var items = document.querySelectorAll('.mm-item');

  if (filters.length && items.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = this.getAttribute('data-filter');

        filters.forEach(function (f) { f.classList.remove('active'); });
        this.classList.add('active');

        items.forEach(function (item) {
          if (cat === 'all' || item.getAttribute('data-category') === cat) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ─── Lightbox ─── */
  var lightbox = document.getElementById('mmLightbox');
  var lbImg = document.getElementById('mmLbImg');
  var lbVideoWrap = document.getElementById('mmLbVideoWrap');
  var lbVideo = document.getElementById('mmLbVideo');
  var lbCounter = document.getElementById('mmLbCounter');
  var lbClose = document.querySelector('.mm-lb-close');
  var lbPrev = document.querySelector('.mm-lb-prev');
  var lbNext = document.querySelector('.mm-lb-next');

  var galleryItems = [];
  var currentIndex = -1;
  var currentGroup = '';

  function buildGallery(group) {
    galleryItems = [];
    currentGroup = group || '';
    var selector = group ? '.mm-btn-expand[data-group="' + group + '"]' : '.mm-btn-expand';
    document.querySelectorAll(selector).forEach(function (btn) {
      galleryItems.push({
        src: btn.getAttribute('data-src'),
        isVideo: btn.classList.contains('mm-btn-video')
      });
    });
  }

  function openLightbox(index) {
    if (index < 0 || index >= galleryItems.length) return;
    currentIndex = index;
    var item = galleryItems[index];

    if (item.isVideo) {
      lbImg.style.display = 'none';
      lbVideoWrap.style.display = 'block';
      lbVideo.src = item.src + '?autoplay=1';
    } else {
      lbVideoWrap.style.display = 'none';
      lbImg.style.display = 'block';
      lbVideo.src = '';
      lbImg.src = item.src;
    }

    lbCounter.textContent = (index + 1) + ' / ' + galleryItems.length;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbVideo.src = '';
  }

  function prevItem() {
    var idx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(idx);
  }

  function nextItem() {
    var idx = (currentIndex + 1) % galleryItems.length;
    openLightbox(idx);
  }

  // Init
  buildGallery();

  // Event delegation for expand buttons (handles dynamically added)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.mm-btn-expand');
    if (!btn) return;
    e.stopPropagation();
    var group = btn.getAttribute('data-group') || '';
    buildGallery(group);
    var idx = galleryItems.findIndex(function (item) {
      return item.src === btn.getAttribute('data-src');
    });
    if (idx >= 0) openLightbox(idx);
  });

  // Lightbox controls
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', prevItem);
  if (lbNext) lbNext.addEventListener('click', nextItem);

  // Close on backdrop click
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevItem();
    if (e.key === 'ArrowRight') nextItem();
  });

})();
