/**
 * Map Lightbox Controller for No Camera Bag
 * Lazy loads Leaflet map and OpenStreetMap tiles upon user interaction (GDPR-compliant).
 * Supports direct deep-linking from image badges (.badge-map) to specific photo spots.
 */
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-map-btn');
  const closeBtn = document.getElementById('close-map-btn');
  const modal = document.getElementById('map-modal');
  const backdrop = modal ? modal.querySelector('.map-modal-backdrop') : null;
  const spotsDataEl = document.getElementById('map-spots-data');
  const mapContainer = document.getElementById('map-container');

  if (!modal || !spotsDataEl || !mapContainer) {
    return;
  }

  let map = null;
  let markersBounds = [];
  let markersMap = {};
  let isMapInitialized = false;

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

  function openModal(targetSpotId = null) {
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

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

  function closeModal() {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setFocusedPin(null);
  }

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
});
