(function () {
  'use strict';

  // Zaraz auto-generates 4-character purpose IDs (screenshot shows HGIg / Hglg).
  var YOUTUBE_PURPOSE_IDS = ['HGIg', 'Hglg', 'youtube'];

  function hasYouTubeConsent() {
    try {
      if (window.zaraz && window.zaraz.consent) {
        if (typeof window.zaraz.consent.get === 'function') {
          for (var i = 0; i < YOUTUBE_PURPOSE_IDS.length; i++) {
            if (window.zaraz.consent.get(YOUTUBE_PURPOSE_IDS[i])) {
              return true;
            }
          }
        }
        if (window.zaraz.consent.purposes && typeof window.zaraz.consent.purposes === 'object') {
          for (var j = 0; j < YOUTUBE_PURPOSE_IDS.length; j++) {
            if (window.zaraz.consent.purposes[YOUTUBE_PURPOSE_IDS[j]]) {
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
        var consentObj = {};
        for (var i = 0; i < YOUTUBE_PURPOSE_IDS.length; i++) {
          consentObj[YOUTUBE_PURPOSE_IDS[i]] = true;
        }
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

  function init() {
    var wrappers = document.querySelectorAll('.yt-consent-wrapper');
    if (!wrappers.length) return;

    // Check if consent has already been granted
    if (hasYouTubeConsent()) {
      activateAllVideos();
      return;
    }

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
