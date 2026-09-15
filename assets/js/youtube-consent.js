(function () {
  'use strict';

  var STORAGE_KEY = 'ncb_youtube_consent';
  var DEFAULT_ID = 'HGIg';

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
    return DEFAULT_ID;
  }

  function getConsentFromCookie() {
    try {
      var match = document.cookie.match(/(?:^|;\s*)cf_consent=([^;]+)/);
      if (match && match[1]) {
        var parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed && typeof parsed === 'object') {
          var id = getYouTubePurposeId();
          if (parsed[id] === true || parsed[DEFAULT_ID] === true || parsed['Hglg'] === true || parsed['youtube'] === true) {
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

  function hasYouTubeConsent() {
    // 1. Check if Zaraz cookie explicitly denied consent
    var cookieConsent = getConsentFromCookie();
    if (cookieConsent === false) {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      return false;
    }

    // 2. Check local storage persistence
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        return true;
      }
    } catch (e) {}

    // 3. Check cookie consent if granted
    if (cookieConsent === true) {
      return true;
    }

    // 4. Check Zaraz Consent API
    try {
      if (window.zaraz && window.zaraz.consent) {
        var id = getYouTubePurposeId();

        if (typeof window.zaraz.consent.get === 'function') {
          if (window.zaraz.consent.get(id) === true ||
              window.zaraz.consent.get(DEFAULT_ID) === true ||
              window.zaraz.consent.get('Hglg') === true ||
              window.zaraz.consent.get('youtube') === true) {
            return true;
          }
        }

        if (typeof window.zaraz.consent.getAll === 'function') {
          var all = window.zaraz.consent.getAll();
          if (all && typeof all === 'object') {
            if (all[id] === true ||
                all[DEFAULT_ID] === true ||
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
    // 1. Store in localStorage for instant persistence
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}

    // 2. Persist in Zaraz
    try {
      if (window.zaraz && window.zaraz.consent && typeof window.zaraz.consent.set === 'function') {
        var id = getYouTubePurposeId();
        var consentObj = {};
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

    if (hasYouTubeConsent()) {
      activateAllVideos();
      return;
    }

    if (initialized) return;
    initialized = true;

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

  // Re-check when Zaraz events fire or after short delay
  document.addEventListener('zarazConsentAPIReady', function () {
    if (hasYouTubeConsent()) {
      activateAllVideos();
    }
  });

  document.addEventListener('zarazConsentChoicesUpdated', function () {
    var id = getYouTubePurposeId();
    if (window.zaraz && window.zaraz.consent && typeof window.zaraz.consent.get === 'function') {
      if (window.zaraz.consent.get(id) === false) {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        return;
      }
    }
    if (hasYouTubeConsent()) {
      activateAllVideos();
    }
  });

  setTimeout(function () {
    if (hasYouTubeConsent()) {
      activateAllVideos();
    }
  }, 300);
})();
