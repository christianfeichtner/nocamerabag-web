/**
 * contact.js - Client-side controller for Contact & Feedback Form
 * Handles client-side validation, Honeypot check, Cloudflare Turnstile token handling,
 * loading indicator, API dispatch, and success/error status display.
 */
(function () {
  'use strict';

  function initContactForm() {
    const container = document.getElementById('contactSection');
    const form = document.getElementById('contactForm');
    if (!container || !form) return;

    let apiUrl = container.dataset.apiUrl || 'https://contact-api.nocamerabag.com';

    // Adapt localhost/127.0.0.1 for local network debugging (e.g. mobile on 192.168.x.x)
    if (apiUrl && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      try {
        const parsedUrl = new URL(apiUrl, window.location.origin);
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
          parsedUrl.hostname = window.location.hostname;
          apiUrl = parsedUrl.toString();
        }
      } catch (_) {}
    }

    // DOM Elements
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const trapInput = document.getElementById('contactWebsiteTrap');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const btnSpinner = document.getElementById('contactSpinner');
    const btnText = document.getElementById('contactBtnText');

    const nameError = document.getElementById('contactNameError');
    const emailError = document.getElementById('contactEmailError');
    const messageError = document.getElementById('contactMessageError');
    const turnstileError = document.getElementById('contactTurnstileError');

    const successNotice = document.getElementById('contactSuccessNotice');
    const errorNotice = document.getElementById('contactErrorNotice');
    const errorText = document.getElementById('contactErrorText');

    // Helper: Display field error
    function setFieldError(input, errorEl, msg) {
      if (input) input.classList.add('has-error');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
    }

    // Helper: Clear field error
    function clearFieldError(input, errorEl) {
      if (input) input.classList.remove('has-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }

    // Clear errors on user input
    if (nameInput) {
      nameInput.addEventListener('input', () => clearFieldError(nameInput, nameError));
    }
    if (emailInput) {
      emailInput.addEventListener('input', () => clearFieldError(emailInput, emailError));
    }
    if (messageInput) {
      messageInput.addEventListener('input', () => clearFieldError(messageInput, messageError));
    }

    // Helper: Email validation regex
    function isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    // Reset Turnstile widget if present
    function resetTurnstile() {
      if (window.turnstile && typeof window.turnstile.reset === 'function') {
        try {
          window.turnstile.reset();
        } catch (_) {}
      }
    }

    // Helper: Set submit button loading state
    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      if (isLoading) {
        submitBtn.setAttribute('aria-busy', 'true');
        if (btnSpinner) btnSpinner.style.display = 'inline-flex';
        if (btnText) btnText.textContent = 'Sending...';
      } else {
        submitBtn.removeAttribute('aria-busy');
        if (btnSpinner) btnSpinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Send Message';
      }
    }

    // Form Submission Handler
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Reset previous general notices
      if (errorNotice) errorNotice.style.display = 'none';
      if (successNotice) successNotice.style.display = 'none';
      clearFieldError(nameInput, nameError);
      clearFieldError(emailInput, emailError);
      clearFieldError(messageInput, messageError);
      if (turnstileError) {
        turnstileError.textContent = '';
        turnstileError.style.display = 'none';
      }

      // 1. Client-Side Field Validation
      let hasError = false;
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      const trap = trapInput ? trapInput.value.trim() : '';

      if (!name) {
        setFieldError(nameInput, nameError, 'Please enter your name.');
        hasError = true;
      }

      if (!email) {
        setFieldError(emailInput, emailError, 'Please enter your email address.');
        hasError = true;
      } else if (!isValidEmail(email)) {
        setFieldError(emailInput, emailError, 'Please enter a valid email address (e.g. name@example.com).');
        hasError = true;
      }

      if (!message) {
        setFieldError(messageInput, messageError, 'Please enter your message.');
        hasError = true;
      } else if (message.length < 5) {
        setFieldError(messageInput, messageError, 'Your message is too short (minimum 5 characters).');
        hasError = true;
      }

      // Turnstile Token Check
      let turnstileToken = '';
      const turnstileResponseInput = form.querySelector('[name="cf-turnstile-response"]');
      if (turnstileResponseInput) {
        turnstileToken = turnstileResponseInput.value;
      }

      const turnstileWrapper = form.querySelector('.cf-turnstile');
      if (turnstileWrapper && !turnstileToken) {
        // If turnstile is loaded on the page but not yet solved
        if (turnstileError) {
          turnstileError.textContent = 'Please complete the security check.';
          turnstileError.style.display = 'block';
        }
        hasError = true;
      }

      if (hasError) return;

      // 2. Honeypot check: If bot filled the hidden trap, simulate success without sending
      if (trap.length > 0) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          form.style.display = 'none';
          if (successNotice) successNotice.style.display = 'flex';
        }, 500);
        return;
      }

      // 3. Dispatch to API
      setLoading(true);

      const payload = {
        name: name,
        email: email,
        message: message,
        cf_turnstile_response: turnstileToken,
        website_trap: trap,
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && (result.success || response.status === 200 || response.status === 201)) {
          // Success!
          form.reset();
          form.style.display = 'none';
          if (successNotice) {
            successNotice.style.display = 'flex';
            successNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          // Server returned an error message
          const msg = result.error || 'An error occurred while sending your message. Please try again or email directly to hello@nocamerabag.com.';
          if (errorText) errorText.textContent = msg;
          if (errorNotice) {
            errorNotice.style.display = 'flex';
            errorNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          resetTurnstile();
        }
      } catch (err) {
        // Network or unexpected error
        const msg = 'Unable to connect to the contact server. Please check your internet connection or email directly to hello@nocamerabag.com.';
        if (errorText) errorText.textContent = msg;
        if (errorNotice) {
          errorNotice.style.display = 'flex';
          errorNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        resetTurnstile();
      } finally {
        setLoading(false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }
})();
