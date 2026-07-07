(function () {
  'use strict';

  const mapSection = document.getElementById('course-map');
  if (!mapSection) return;

  /* ─── state ─── */
  let map, markerCluster, allMarkers = [], allData = [];
  let currentFilters = { province: '', category: '', status: '', search: '' };
  let isDark = localStorage.getItem('mygv_map_theme') === 'dark';

  /* ─── DOM refs ─── */
  const container = document.getElementById('mapContainer');
  const countEl = document.getElementById('mapCount');
  const searchInput = document.getElementById('mapSearch');
  const filterProvince = document.getElementById('filterProvince');
  const filterCategory = document.getElementById('filterCategory');
  const filterStatus = document.getElementById('filterStatus');
  const clearBtn = document.getElementById('mapClearFilters');
  const locateBtn = document.getElementById('mapLocate');
  const nearbyBtn = document.getElementById('mapNearby');
  const darkToggle = document.getElementById('mapDarkToggle');
  const noResults = document.getElementById('mapNoResults');

  /* ─── i18n helpers ─── */
  function t(key, fallback) {
    const curLang = window.currentLang || document.documentElement.lang || 'en';
    const dict = i18n[curLang];
    return dict && dict[key] !== undefined ? dict[key] : (fallback || key);
  }
  function tData(value, type) {
    if (!value) return value;
    const key = type + '_' + value.replace(/\s+/g, '_');
    const translated = t(key);
    return translated !== key ? translated : value;
  }

  /* ─── colorful tiles ─── */
  const tileLight = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const tileDark  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const tileUrl = () => isDark ? tileDark : tileLight;
  const tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

  let tileLayer;

  /* ─── load data ─── */
  function loadData() {
    try {
      const scriptTag = document.getElementById('golfCoursesData');
      if (!scriptTag) throw new Error('Data script tag not found');
      allData = JSON.parse(scriptTag.textContent);
      populateFilters(allData);
      initMap();
      buildMarkers(allData);
    } catch (err) {
      console.error('Map data load error:', err);
      if (container) container.innerHTML = '<p style="text-align:center;padding:3rem;color:#888;">Failed to load course data.</p>';
    }
  }

  /* ─── populate filter dropdowns ─── */
  function populateFilters(data) {
    const provinces = [...new Set(data.map(d => d.province).filter(Boolean))].sort();
    const categories = [...new Set(data.map(d => d.category).filter(Boolean))].sort();
    const statuses = [...new Set(data.map(d => d.status).filter(Boolean))].sort();

    provinces.forEach(p => {
      const o = document.createElement('option');
      o.value = p; o.textContent = tData(p, 'province');
      filterProvince.appendChild(o);
    });
    categories.forEach(c => {
      const o = document.createElement('option');
      o.value = c; o.textContent = tData(c, 'category');
      filterCategory.appendChild(o);
    });
    statuses.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = tData(s, 'status');
      filterStatus.appendChild(o);
    });
  }

  /* ─── init Leaflet map ─── */
  function initMap() {
    map = L.map(container, {
      center: [46.0, -64.0],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    tileLayer = L.tileLayer(tileUrl(), {
      maxZoom: 18,
      attribution: tileAttr
    }).addTo(map);

    map.on('zoomend', updateCount);
    map.on('moveend', updateCount);

    container._map = map;
  }

  /* ─── green circular marker icon ─── */
  function createIcon() {
    return L.divIcon({
      className: 'gv-marker',
      html: '<svg viewBox="0 0 32 32" width="28" height="28"><circle cx="16" cy="16" r="14" fill="#1B6B3A" stroke="#fff" stroke-width="2"/><text x="16" y="20" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">⛳</text></svg>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -16]
    });
  }

  /* ─── build markers from data ─── */
  function buildMarkers(data) {
    if (markerCluster) {
      markerCluster.clearLayers();
      map.removeLayer(markerCluster);
    }
    allMarkers = [];

    markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster) {
        const count = cluster.getChildCount();
        let size = 'small';
        if (count >= 10) size = 'medium';
        if (count >= 25) size = 'large';
        return L.divIcon({
          html: '<div><span>' + count + '</span></div>',
          className: 'gv-cluster gv-cluster-' + size,
          iconSize: size === 'small' ? [36, 36] : size === 'medium' ? [44, 44] : [52, 52]
        });
      }
    });

    data.forEach(d => {
      const marker = L.marker([d.lat, d.lng], { icon: createIcon() });
      marker._gvData = d;

      marker.bindPopup(function () { return buildPopup(d); }, {
        maxWidth: 320,
        className: 'gv-popup',
        closeButton: true
      });

      marker.on('mouseover', function () { this.openPopup(); });
      marker.on('mouseout', function () { this.closePopup(); });

      allMarkers.push(marker);
      markerCluster.addLayer(marker);
    });

    map.addLayer(markerCluster);
    updateCount();
  }

  /* ─── popup HTML ─── */
  function buildPopup(d) {
    const moreLabel = t('map_more_info', 'More info');
    const imgHtml = d.image ? '<img src="' + d.image + '" alt="' + d.name + '" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:0.5rem;">' : '';
    const urlHtml = d.url ? '<a href="' + d.url + '" target="_blank" rel="noopener" class="gv-popup-link">' + moreLabel + ' →</a>' : '';
    return '<div class="gv-popup-inner">' +
      imgHtml +
      '<h4 class="gv-popup-name">' + d.name + '</h4>' +
      '<p class="gv-popup-location">' + d.city + ', ' + tData(d.province, 'province') + '</p>' +
      '<p class="gv-popup-desc">' + d.desc + '</p>' +
      (d.category ? '<span class="gv-popup-tag">' + tData(d.category, 'category') + '</span>' : '') +
      urlHtml +
      '</div>';
  }

  /* ─── apply filters ─── */
  function applyFilters() {
    const f = currentFilters;
    const filtered = allData.filter(d => {
      if (f.province && d.province !== f.province) return false;
      if (f.category && d.category !== f.category) return false;
      if (f.status && d.status !== f.status) return false;
      if (f.search && !d.name.toLowerCase().includes(f.search.toLowerCase())) return false;
      return true;
    });

    if (noResults) noResults.style.display = filtered.length ? 'none' : 'block';

    buildMarkers(filtered);
    updateCount();

    if (filtered.length) {
      const group = L.featureGroup(allMarkers);
      map.fitBounds(group.getBounds().pad(0.1), { maxZoom: 10, padding: [20, 20] });
    }
  }

  /* ─── update visible count ─── */
  function updateCount() {
    const visible = markerCluster ? markerCluster.getLayers().length : 0;
    if (countEl) countEl.textContent = visible + ' ' + t('map_courses', 'courses');
  }

  /* ─── geolocation ─── */
  function locateUser(callback) {
    if (!navigator.geolocation) {
      alert(t('map_geo_error', 'Geolocation not supported.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        map.setView(latlng, 12);
        L.circleMarker(latlng, {
          radius: 8,
          color: '#c9a96e',
          fillColor: '#c9a96e',
          fillOpacity: 0.8,
          weight: 2
        }).addTo(map);
        if (callback) callback(latlng);
      },
      function () {
        alert(t('map_geo_denied', 'Location access denied.'));
      }
    );
  }

  /* ─── find nearby ─── */
  function findNearby(latlng) {
    if (!allMarkers.length) return;
    const sorted = allMarkers.map(m => {
      const d = m._gvData;
      const dist = map.distance(latlng, [d.lat, d.lng]);
      return { marker: m, data: d, dist: dist };
    }).sort((a, b) => a.dist - b.dist).slice(0, 5);

    const bounds = L.latLngBounds(sorted.map(s => [s.data.lat, s.data.lng]));
    map.fitBounds(bounds.pad(0.2), { maxZoom: 12 });
    sorted.forEach(s => s.marker.openPopup());
  }

  /* ─── theme toggle ─── */
  function toggleTheme() {
    isDark = !isDark;
    localStorage.setItem('mygv_map_theme', isDark ? 'dark' : 'light');
    if (tileLayer) tileLayer.setUrl(tileUrl());
    container.classList.toggle('map-dark', isDark);
    if (darkToggle) darkToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  /* ─── event bindings ─── */
  function bindEvents() {
    searchInput.addEventListener('input', function () {
      currentFilters.search = this.value;
      applyFilters();
    });

    filterProvince.addEventListener('change', function () {
      currentFilters.province = this.value;
      applyFilters();
    });
    filterCategory.addEventListener('change', function () {
      currentFilters.category = this.value;
      applyFilters();
    });
    filterStatus.addEventListener('change', function () {
      currentFilters.status = this.value;
      applyFilters();
    });

    clearBtn.addEventListener('click', function () {
      currentFilters = { province: '', category: '', status: '', search: '' };
      searchInput.value = '';
      filterProvince.value = '';
      filterCategory.value = '';
      filterStatus.value = '';
      applyFilters();
    });

    locateBtn.addEventListener('click', function () {
      locateUser();
    });

    nearbyBtn.addEventListener('click', function () {
      locateUser(function (latlng) {
        findNearby(latlng);
      });
    });

    darkToggle.addEventListener('click', toggleTheme);

    /* mobile filter toggle handled by responsive CSS stacking */
  }

  /* ─── public: reapply map translations ─── */
  window.applyMapTranslations = function () {
    const labels = {
      map_search_placeholder: t('map_search_placeholder', 'Search courses...'),
      map_filter_province: t('map_filter_province', 'All Provinces'),
      map_filter_category: t('map_filter_category', 'All Categories'),
      map_filter_status: t('map_filter_status', 'All Statuses'),
      map_clear: t('map_clear', 'Clear Filters'),
      map_locate: t('map_locate', 'My Location'),
      map_nearby: t('map_nearby', 'Nearby'),
    };
    if (searchInput) searchInput.placeholder = labels.map_search_placeholder;
    const defs = [filterProvince, filterCategory, filterStatus];
    const defaults = [labels.map_filter_province, labels.map_filter_category, labels.map_filter_status];
    const types = ['province', 'category', 'status'];
    defs.forEach((el, i) => {
      if (!el) return;
      for (let j = 0; j < el.options.length; j++) {
        const opt = el.options[j];
        if (j === 0) {
          opt.textContent = defaults[i];
        } else if (opt.value) {
          opt.textContent = tData(opt.value, types[i]);
        }
      }
    });
    if (clearBtn) clearBtn.innerHTML = '<i class="fa-solid fa-eraser"></i> ' + labels.map_clear;
    if (locateBtn) locateBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + labels.map_locate;
    if (nearbyBtn) nearbyBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i> ' + labels.map_nearby;
    if (noResults) {
      const p = noResults.querySelector('p');
      if (p) p.textContent = t('map_no_results', 'No courses match your filters.');
    }
    updateCount();
  };

  /* ─── init ─── */
  function init() {
    if (isDark) {
      container.classList.add('map-dark');
      if (darkToggle) darkToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    bindEvents();
    loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
