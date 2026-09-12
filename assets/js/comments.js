/**
 * comments.js - Lightweight Client-side controller for Submitting Comments
 * Variant 2: Build-time rendered comments + interactive submission modal
 */
(function () {
  'use strict';

  function initCommentSubmission() {
    const container = document.getElementById('comments');
    if (!container) return;

    const pageId = container.dataset.pageId || '';
    let apiUrl = container.dataset.api || 'http://localhost:8787/api/comments';

    // If testing from a local network IP (e.g. 192.168.x.x) and apiUrl is localhost, adapt hostname
    if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      try {
        const parsedUrl = new URL(apiUrl, window.location.origin);
        if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
          parsedUrl.hostname = window.location.hostname;
          apiUrl = parsedUrl.toString();
        }
      } catch (_) {}
    }

    // DOM Elements
    const textarea = document.getElementById('commentTextInput');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const modal = document.getElementById('commentModal');
    const modalCard = modal ? modal.querySelector('.modal-card') : null;
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const commentForm = document.getElementById('commentForm');
    const nameInput = document.getElementById('commentAuthorName');
    const emailInput = document.getElementById('commentAuthorEmail');
    const replyInput = document.getElementById('replyToCommentId');
    const trapInput = document.getElementById('commentWebsiteTrap') || document.querySelector('input[name="website_trap"]');
    const modalError = document.getElementById('commentModalError');
    const successNotice = document.getElementById('commentSuccessNotice');

    /**
     * Show error inside modal
     */
    function showModalError(message) {
      if (modalError) {
        modalError.textContent = message;
        modalError.style.display = 'flex';
      }
    }

    /**
     * Clear error in modal
     */
    function clearModalError() {
      if (modalError) {
        modalError.textContent = '';
        modalError.style.display = 'none';
      }
    }

    /**
     * Open Modal (Stage 2)
     */
    function openModal() {
      if (!modal) return;
      clearModalError();
      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      setTimeout(() => {
        if (nameInput) nameInput.focus();
      }, 50);
    }

    /**
     * Close Modal
     */
    function closeModal() {
      if (!modal) return;
      clearModalError();
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
    }

    // Event: Click Stage 1 (Textarea -> Modal)
    if (btnOpenModal && textarea) {
      btnOpenModal.addEventListener('click', function () {
        const text = textarea.value.trim();
        if (!text) {
          textarea.focus();
          textarea.classList.add('has-error');
          setTimeout(() => textarea.classList.remove('has-error'), 1200);
          return;
        }
        openModal();
      });
    }

    // Event: Click Reply Button on an existing static comment
    container.addEventListener('click', function (e) {
      const replyBtn = e.target.closest('.comment-btn-reply');
      if (!replyBtn) return;

      const parentId = replyBtn.dataset.replyId;
      if (replyInput) replyInput.value = parentId;

      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Modal Close Triggers
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (modalCard && !modalCard.contains(e.target)) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
        closeModal();
      }
    });

    if (nameInput) nameInput.addEventListener('input', clearModalError);
    if (emailInput) emailInput.addEventListener('input', clearModalError);

    // Event: Submit Stage 2 Form (POST to Worker API)
    if (commentForm) {
      commentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearModalError();

        const name = nameInput ? nameInput.value.trim() : '';
        const rawEmail = emailInput ? emailInput.value.trim() : '';
        const email = rawEmail.length > 0 ? rawEmail : null;
        const content = textarea ? textarea.value.trim() : '';
        const parentId = replyInput && replyInput.value.trim() ? (parseInt(replyInput.value.trim(), 10) || replyInput.value.trim()) : null;
        const websiteTrap = trapInput ? trapInput.value : '';

        if (!content) {
          closeModal();
          if (textarea) {
            textarea.focus();
            textarea.classList.add('has-error');
            setTimeout(() => textarea.classList.remove('has-error'), 1200);
          }
          return;
        }

        if (!name) {
          showModalError('Bitte gib deinen Namen ein.');
          if (nameInput) nameInput.focus();
          return;
        }

        const submitBtn = document.getElementById('btnSubmitComment');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.dataset.originalText = submitBtn.textContent;
          submitBtn.textContent = '...';
        }

        const pageUrl = container.dataset.pageUrl || (window.location.origin + window.location.pathname) || window.location.href.split('?')[0].split('#')[0];
        const slug = container.dataset.slug || window.location.pathname;

        const payload = {
          page_id: pageId,
          page_url: pageUrl,
          pageUrl: pageUrl,
          url: pageUrl,
          post_url: pageUrl,
          slug: slug,
          author_name: name,
          name: name,
          author_email: email,
          email: email,
          content: content,
          comment: content,
          parent_id: parentId,
          website_trap: websiteTrap
        };

        console.log('[Comments] Submitting payload to', apiUrl, payload);

        try {
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (res.status === 201 || res.ok) {
            // Reset inputs on success
            if (textarea) textarea.value = '';
            if (replyInput) replyInput.value = '';
            if (commentForm) commentForm.reset();

            closeModal();

            // Show success notice banner
            if (successNotice) {
              successNotice.style.display = 'flex';
              successNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          } else {
            let errorMsg = 'Kommentar konnte nicht gesendet werden. Bitte versuche es später noch einmal.';
            try {
              const data = await res.json();
              if (data && (data.error || data.message)) {
                errorMsg = data.error || data.message;
              }
            } catch (_) {}
            showModalError(errorMsg);
          }
        } catch (err) {
          console.error('Failed to submit comment to', apiUrl, 'Payload:', payload, 'Error:', err);
          showModalError('Kommentar konnte nicht gesendet werden. Bitte prüfe deine Verbindung und versuche es später noch einmal.');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'Jetzt veröffentlichen';
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommentSubmission);
  } else {
    initCommentSubmission();
  }
})();
