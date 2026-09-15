(function () {
  'use strict';

  function getYouTubePurposeId() {
    try {
      if (window.zaraz && window.zaraz.consent && window.zaraz.consent.purposes) {
        var purposes = window.zaraz.consent.purposes;
        if (Array.isArray(purposes)) {
          for (var i = 0; i < purposes.length; i++) {
            if (purposes[i] && purposes[i].name && purposes[i].name.toLowerCase().includes('youtube')) {
              return purposes[i].id;
            }
          }
        } else if (typeof purposes === 'object') {
          for (var id in purposes) {
            if (Object.prototype.hasOwnProperty.call(purposes, id)) {
              var p = purposes[id];
              if (p && ((p.name && p.name.toLowerCase().includes('youtube')) || id.toLowerCase() === 'youtube')) {
                return id;
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Error identifying YouTube purpose in Zaraz:', e);
    }
    return 'HGIg';
  }

  function hasYouTubeConsent() {
    try {
      if (window.zaraz && window.zaraz.consent) {
        var id = getYouTubePurposeId();

        // 1. Check via zaraz.consent.get() - MUST strictly be boolean true
        if (typeof window.zaraz.consent.get === 'function') {
          if (window.zaraz.consent.get(id) === true ||
              window.zaraz.consent.get('HGIg') === true ||
              window.zaraz.consent.get('Hglg') === true ||
              window.zaraz.consent.get('youtube') === true) {
            return true;
          }
        }

        // 2. Check via zaraz.consent.getAll() - MUST strictly be boolean true
        if (typeof window.zaraz.consent.getAll === 'function') {
          var all = window.zaraz.consent.getAll();
          if (all && typeof all === 'object') {
            if (all[id] === true ||
                all['HGIg'] === true ||
                all['Hglg'] === true ||
                all['youtube'] === true) {
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

  function setYouTubeConsent() {
    try {
      if (window.zaraz && window.zaraz.consent && typeof window.zaraz.consent.set === 'function') {
        var id = getYouTubePurposeId();
        var consentObj = {};
        consentObj[id] = true;
        consentObj['HGIg'] = true;
        consentObj['Hglg'] = true;
        consentObj['youtube'] = true;
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

  function activateVideo(wrapper) {
    if (!wrapper || wrapper.classList.contains('is-loaded')) return;

    var ytId = wrapper.getAttribute('data-yt-id');
    var ytTitle = wrapper.getAttribute('data-yt-title') || 'YouTube Video';
    if (!ytId) return;

    var iframe = document.createElement('iframe');
    iframe.className = 'youtube-player';
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ytId) + '?autoplay=1';
    iframe.title = ytTitle;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
    wrapper.classList.add('is-loaded');
  }

  function activateAllVideos() {
    var wrappers = document.querySelectorAll('.yt-consent-wrapper:not(.is-loaded)');
    for (var i = 0; i < wrappers.length; i++) {
      activateVideo(wrappers[i]);
    }
  }

  var initialized = false;

  function init() {
    var wrappers = document.querySelectorAll('.yt-consent-wrapper');
    if (!wrappers.length) return;

    // Check if consent has already been granted
    if (hasYouTubeConsent()) {
      activateAllVideos();
      return;
    }

    if (initialized) return;
    initialized = true;

    // Attach click listeners using event delegation
    document.addEventListener('click', function (e) {
      var acceptBtn = e.target.closest('.yt-consent-btn-accept');
      if (acceptBtn) {
        e.preventDefault();
        setYouTubeConsent();
        activateAllVideos();
        return;
      }

      var settingsBtn = e.target.closest('.yt-consent-btn-settings');
      if (settingsBtn) {
        e.preventDefault();
        openConsentSettings();
        return;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Listen for Zaraz consent events if Zaraz API initializes or updates choices asynchronously
  document.addEventListener('zarazConsentAPIReady', function () {
    if (hasYouTubeConsent()) {
      activateAllVideos();
    }
  });

  document.addEventListener('zarazConsentChoicesUpdated', function () {
    if (hasYouTubeConsent()) {
      activateAllVideos();
    }
  });
})();
