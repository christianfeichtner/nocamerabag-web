(function () {
  'use strict';

  function initFeedbackWidget() {
    var widget = document.getElementById('feedbackWidget');
    if (!widget) return;

    // WORKER_URL: Konfigurierbar über data-api-url (aus config.toml) oder Fallback
    var WORKER_URL = widget.getAttribute('data-api-url') || 'http://192.168.1.90:8788';
    var buttons = widget.querySelectorAll('.feedback-btn');
    var messageEl = document.getElementById('feedbackMessage');
    var pathname = window.location.pathname;
    var storageKey = 'rated_' + pathname;

    // Helper: Zustand auf "bereits bewertet" setzen (numerischer Vergleich)
    function applyRatedState(numericRating, showMessage) {
      buttons.forEach(function (btn) {
        var btnRating = parseFloat(btn.getAttribute('data-rating'));
        // Toleranter Fließkomma-Vergleich
        if (!isNaN(btnRating) && Math.abs(btnRating - numericRating) < 0.05) {
          btn.classList.add('is-active');
          btn.classList.remove('is-disabled');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('is-active');
          btn.classList.add('is-disabled');
          btn.setAttribute('aria-pressed', 'false');
        }
        btn.disabled = true;
      });

      if (messageEl && showMessage) {
        messageEl.style.display = 'block';
      }
    }

    // Beim Laden prüfen: Existiert bereits ein numerisches Rating im localStorage?
    try {
      var rawSaved = localStorage.getItem(storageKey);
      if (rawSaved !== null) {
        var savedRating = parseFloat(rawSaved);
        if (!isNaN(savedRating)) {
          applyRatedState(savedRating, true);
          return; // Keine Event-Listener mehr nötig
        }
      }
    } catch (e) {
      console.warn('localStorage not accessible:', e);
    }

    // Helper: Buttons während laufendem Request sperren / entsperren
    function setSubmitting(isSubmitting) {
      if (isSubmitting) {
        widget.classList.add('is-submitting');
      } else {
        widget.classList.remove('is-submitting');
      }
      buttons.forEach(function (btn) {
        btn.disabled = isSubmitting;
      });
    }

    // Click-Handler auf allen 4 Buttons registrieren
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ratingAttr = btn.getAttribute('data-rating');
        var parsedRating = parseFloat(ratingAttr);

        // 1. Clientseitige Plausibilitätsprüfung
        if (isNaN(parsedRating)) {
          console.error('Invalid rating value:', ratingAttr);
          return;
        }

        // 2. Doppel-Klicks sperren
        setSubmitting(true);

        // 3. Payload mit relativer URL (nur Pathname/Slug) und echtem Number-Typ
        var payload = {
          url: window.location.pathname,
          rating: parsedRating
        };

        // 4. POST-Request an API übermitteln
        fetch(WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error('HTTP status ' + response.status);
            }
            return response.json().catch(function () {
              return {};
            });
          })
          .then(function () {
            // Im localStorage als Zahl/String merken
            try {
              localStorage.setItem(storageKey, parsedRating.toString());
            } catch (e) {
              console.warn('Could not save rating to localStorage:', e);
            }

            // UI in den bewerteten Zustand versetzen
            widget.classList.remove('is-submitting');
            applyRatedState(parsedRating, true);
          })
          .catch(function (error) {
            console.error('Failed to submit rating:', error);
            // Sperre aufheben, damit der Nutzer es erneut versuchen kann
            setSubmitting(false);
          });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedbackWidget);
  } else {
    initFeedbackWidget();
  }
})();
