/**
 * Map Lightbox Controller for No Camera Bag
 * Lazy loads Leaflet map and OpenStreetMap tiles upon user interaction and explicit consent (GDPR-compliant).
 * Integrates with Cloudflare Zaraz Purpose AdeA (OpenStreetMap).
 * Supports direct deep-linking from image badges (.badge-map) to specific photo spots.
 */
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-map-btn');
  const closeBtn = document.getElementById('close-map-btn');
  const modal = document.getElementById('map-modal');
  const backdrop = modal ? modal.querySelector('.map-modal-backdrop') : null;
  const spotsDataEl = document.getElementById('map-spots-data');
  const mapContainer = document.getElementById('map-container');
  const consentOverlay = document.getElementById('map-consent-overlay');

  if (!modal || !spotsDataEl || !mapContainer) {
    return;
  }

  const STORAGE_KEY = 'ncb_osm_consent';
  const DEFAULT_ID = 'AdeA';

  let map = null;
  let markersBounds = [];
  let markersMap = {};
  let isMapInitialized = false;
  let pendingSpotId = null;

  function getOsmPurposeId() {
    try {
      if (window.zaraz && window.zaraz.consent && window.zaraz.consent.purposes) {
        const purposes = window.zaraz.consent.purposes;
        if (Array.isArray(purposes)) {
          for (let i = 0; i < purposes.length; i++) {
            const name = (purposes[i] && purposes[i].name) ? purposes[i].name.toLowerCase() : '';
            if (name.includes('openstreetmap') || name.includes('osm')) {
              return purposes[i].id;
            }
          }
        } else if (typeof purposes === 'object') {
          for (const id in purposes) {
            if (Object.prototype.hasOwnProperty.call(purposes, id)) {
              const p = purposes[id];
              const name = (p && p.name) ? p.name.toLowerCase() : '';
              if (name.includes('openstreetmap') || name.includes('osm') || id === DEFAULT_ID || id.toLowerCase() === 'openstreetmap') {
                return id;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error identifying OpenStreetMap purpose in Zaraz:', e);
    }
    return DEFAULT_ID;
  }

  function getConsentFromCookie() {
    try {
      const match = document.cookie.match(/(?:^|;\s*)cf_consent=([^;]+)/);
      if (match && match[1]) {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed && typeof parsed === 'object') {
          const id = getOsmPurposeId();
          if (parsed[id] === true || parsed[DEFAULT_ID] === true || parsed['openstreetmap'] === true || parsed['osm'] === true) {
            return true;
          }
          if (parsed[id] === false || parsed[DEFAULT_ID] === false) {
            return false;
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function hasOsmConsent() {
    // 1. Check local storage persistence
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        return true;
      }
    } catch (e) {}

    // 2. Check cookie consent if granted
    const cookieConsent = getConsentFromCookie();
    if (cookieConsent === true) {
      return true;
    }

    // 3. Check Zaraz Consent API
    try {
      if (window.zaraz && window.zaraz.consent) {
        const id = getOsmPurposeId();

        if (typeof window.zaraz.consent.get === 'function') {
          if (window.zaraz.consent.get(id) === true ||
              window.zaraz.consent.get(DEFAULT_ID) === true ||
              window.zaraz.consent.get('openstreetmap') === true ||
              window.zaraz.consent.get('osm') === true) {
            return true;
          }
        }

        if (typeof window.zaraz.consent.getAll === 'function') {
          const all = window.zaraz.consent.getAll();
          if (all && typeof all === 'object') {
            if (all[id] === true ||
                all[DEFAULT_ID] === true ||
                all['openstreetmap'] === true ||
                all['osm'] === true) {
              return true;
            }
          }
        }
      }
    } catch (e) {
      console.error('Error checking Zaraz consent:', e);
    }

    return false;
  }

  function setOsmConsent() {
    // 1. Store in localStorage
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}

    // 2. Persist in Zaraz
    try {
      if (window.zaraz && window.zaraz.consent && typeof window.zaraz.consent.set === 'function') {
        const id = getOsmPurposeId();
        const consentObj = {};
        consentObj[id] = true;
        window.zaraz.consent.set(consentObj);
      }
    } catch (e) {
      console.error('Error setting Zaraz consent:', e);
    }
  }

  function openConsentSettings() {
    try {
      if (window.zaraz && window.zaraz.consent) {
        if (window.zaraz.consent.modal && typeof window.zaraz.consent.modal.show === 'function') {
          window.zaraz.consent.modal.show();
        } else {
          window.zaraz.consent.modal = true;
        }
      }
    } catch (e) {
      console.error('Error opening Zaraz consent modal:', e);
    }
  }

  function initMap() {
    if (isMapInitialized || typeof L === 'undefined') {
      return;
    }

    let spots = [];
    try {
      spots = JSON.parse(spotsDataEl.textContent || '[]');
    } catch (e) {
      console.error('Failed to parse photo spots JSON:', e);
      return;
    }

    if (!Array.isArray(spots) || spots.length === 0) {
      return;
    }

    map = L.map('map-container', {
      zoomControl: true,
      scrollWheelZoom: true
    });

    // GDPR compliant OSM Tile Layer loaded ONLY after user clicked to open the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersBounds = [];
    markersMap = {};

    spots.forEach((spot, index) => {
      if (!spot.coords || !Array.isArray(spot.coords) || spot.coords.length < 2) {
        return;
      }

      const lat = parseFloat(spot.coords[0]);
      const lng = parseFloat(spot.coords[1]);

      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      const spotId = String(spot.id || ('spot-' + index));
      markersBounds.push([lat, lng]);

      const pinIcon = L.divIcon({
        className: 'photo-marker-container',
        html: `
          <div class="photo-marker-wrapper" data-spot-id="${escapeHtml(spotId)}">
            <div class="photo-marker-frame">
              ${spot.image ? `<img src="${spot.image}" alt="${escapeHtml(spot.title || '')}" loading="lazy">` : ''}
            </div>
            <div class="photo-marker-tip"></div>
          </div>
        `,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
        popupAnchor: [0, -52]
      });

      const popupHtml = `
        <div class="spot-popup-card">
          ${spot.image ? `<div class="spot-popup-img-wrapper"><img src="${spot.image}" alt="${escapeHtml(spot.title || '')}" class="spot-popup-img" loading="lazy"></div>` : ''}
          <div class="spot-popup-content">
            ${spot.tag ? `<span class="spot-popup-badge">${escapeHtml(spot.tag)}</span>` : ''}
            ${spot.title ? `<h4 class="spot-popup-title">${escapeHtml(spot.title)}</h4>` : ''}
            ${spot.camera ? `<p class="spot-popup-camera">${escapeHtml(spot.camera)}</p>` : ''}
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: pinIcon })
        .bindPopup(popupHtml, {
          maxWidth: 240,
          minWidth: 200,
          className: 'spot-custom-popup',
          closeButton: true
        })
        .addTo(map);

      marker.on('click', () => {
        setFocusedPin(spotId);
      });

      markersMap[spotId] = marker;
    });

    isMapInitialized = true;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setFocusedPin(targetSpotId) {
    document.querySelectorAll('.photo-marker-wrapper.is-focused').forEach((el) => {
      el.classList.remove('is-focused');
    });

    if (!targetSpotId) return;

    const targetEl = document.querySelector(`.photo-marker-wrapper[data-spot-id="${targetSpotId}"]`);
    if (targetEl) {
      targetEl.classList.add('is-focused');
    }
  }

  function fitMapBounds() {
    if (!map || markersBounds.length === 0) return;

    if (markersBounds.length === 1) {
      map.setView(markersBounds[0], 15);
    } else {
      map.fitBounds(markersBounds, {
        padding: [50, 50],
        maxZoom: 16
      });
    }
  }

  function showMap(targetSpotId) {
    if (consentOverlay) {
      consentOverlay.style.display = 'none';
    }

    if (!isMapInitialized) {
      initMap();
    }

    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        fitMapBounds();

        if (targetSpotId && markersMap[targetSpotId]) {
          const marker = markersMap[targetSpotId];
          marker.openPopup();
          setFocusedPin(targetSpotId);
        } else {
          setFocusedPin(null);
        }
      }
    }, 150);
  }

  function openModal(targetSpotId = null) {
    pendingSpotId = targetSpotId;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (hasOsmConsent()) {
      showMap(targetSpotId);
    } else {
      if (consentOverlay) {
        consentOverlay.style.display = 'flex';
      }
    }
  }

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setFocusedPin(null);
    pendingSpotId = null;
  }

  // Handle consent accept & settings inside map modal
  document.addEventListener('click', (e) => {
    const acceptBtn = e.target.closest('.map-consent-btn-accept');
    if (acceptBtn) {
      e.preventDefault();
      setOsmConsent();
      showMap(pendingSpotId);
      return;
    }

    const settingsBtn = e.target.closest('.map-consent-btn-settings');
    if (settingsBtn) {
      e.preventDefault();
      openConsentSettings();
      return;
    }
  });

  // Handle all open map buttons (e.g. inside map callouts)
  document.addEventListener('click', (e) => {
    const triggerBtn = e.target.closest('#open-map-btn, .open-map-btn, .map-callout-btn');
    if (triggerBtn) {
      e.preventDefault();
      openModal();
    }
  });

  // Handle all image overlay "Map View" badges across the post
  document.addEventListener('click', (e) => {
    const badgeMap = e.target.closest('.badge-map');
    if (badgeMap) {
      e.preventDefault();
      const spotId = badgeMap.getAttribute('data-spot-id');
      openModal(spotId);
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeModal();
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Re-check when Zaraz events fire
  document.addEventListener('zarazConsentAPIReady', () => {
    if (hasOsmConsent() && modal.classList.contains('is-active') && !isMapInitialized) {
      showMap(pendingSpotId);
    }
  });

  document.addEventListener('zarazConsentChoicesUpdated', () => {
    const id = getOsmPurposeId();
    if (window.zaraz && window.zaraz.consent && typeof window.zaraz.consent.get === 'function') {
      if (window.zaraz.consent.get(id) === false) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        if (consentOverlay) {
          consentOverlay.style.display = 'flex';
        }
        return;
      }
    }
    if (hasOsmConsent() && modal.classList.contains('is-active') && !isMapInitialized) {
      showMap(pendingSpotId);
    }
  });
});
