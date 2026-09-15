(function() {
  'use strict';

  if (window.__ncbLightboxInit) return;
  window.__ncbLightboxInit = true;

  function initLightbox() {
    const modal = document.getElementById('ncbLightbox');
    if (!modal) return;

    const overlay = modal.querySelector('.lightbox-overlay');
    const closeBtn = modal.querySelector('.lightbox-close');
    const imgEl = modal.querySelector('.lightbox-image');
    const captionEl = modal.querySelector('.lightbox-caption');
    let lastActiveElement = null;

    function openLightbox(src, alt, captionHtml) {
      if (!src) return;
      lastActiveElement = document.activeElement;
      imgEl.src = src;
      imgEl.alt = alt || '';

      if (captionHtml && typeof captionHtml === 'string' && captionHtml.trim()) {
        captionEl.innerHTML = captionHtml.trim();
        captionEl.style.display = 'block';
      } else {
        captionEl.innerHTML = '';
        captionEl.style.display = 'none';
      }

      modal.classList.add('is-active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-locked');
      if (closeBtn) {
        closeBtn.focus();
      }

      // Push event to Google Tag Manager dataLayer
      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'lightbox_open',
          image_src: src,
          image_alt: alt || '',
          image_caption: (captionHtml && typeof captionHtml === 'string') ? captionHtml.replace(/<[^>]*>/g, '').trim() : ''
        });
      }
    }

    function closeLightbox() {
      if (!modal.classList.contains('is-active')) return;
      modal.classList.remove('is-active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lightbox-locked');
      imgEl.src = '';
      imgEl.alt = '';
      if (captionEl) {
        captionEl.innerHTML = '';
        captionEl.style.display = 'none';
      }
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    }

    // Global unified click listener for any lightbox trigger or clickable image
    document.addEventListener('click', function(e) {
      // If clicking inside another overlay action (Pin It or Map View), do not trigger lightbox
      if (e.target.closest('.badge-pinterest, .badge-map, .btn-pinterest')) return;

      let trigger = e.target.closest('[data-track="lightbox-trigger"], .lightbox-trigger, .badge-lightbox, [data-lightbox-trigger], .post-gallery__item');
      let clickedImg = null;

      // If clicked directly on an image inside a lightbox-enabled container
      if (!trigger) {
        const wrapper = e.target.closest('.post-img-wrapper.has-lightbox, .post-image-wrap.has-lightbox, .photo-slot.has-lightbox, .lightbox-gallery-item, .post-gallery__item, .has-lightbox, [data-track="lightbox-trigger"]');
        if (wrapper) {
          trigger = wrapper.querySelector('[data-track="lightbox-trigger"], .badge-lightbox, .lightbox-trigger, [data-lightbox-trigger], .post-gallery__item');
          clickedImg = wrapper.querySelector('img');
        }
      }

      if (!trigger && !clickedImg) return;

      // Prevent default navigation if it's an <a> or <button>
      e.preventDefault();

      const src = (trigger && (trigger.getAttribute('data-full') || trigger.getAttribute('href'))) || clickedImg?.currentSrc || clickedImg?.src || (trigger && trigger.querySelector('img')?.src);
      const alt = (trigger && trigger.getAttribute('data-alt')) || clickedImg?.alt || (trigger && trigger.querySelector('img')?.alt) || '';

      // Resolve caption: 1. data-caption attribute -> 2. Container caption elements -> 3. Fallback to image alt
      let caption = (trigger && trigger.getAttribute('data-caption')) || '';
      
      if (!caption || !caption.trim()) {
        const container = (trigger || clickedImg).closest('.lightbox-gallery-item, .post-figure, figure, .photo-slot, .post-gallery, .post-gallery__item, .post-image-wrap, .post-img-wrapper');
        if (container) {
          const pillSpan = container.querySelector('.overlay-caption span, .image-caption-pill span, .overlay-caption-text span');
          const galleryCaption = container.querySelector('.lightbox-gallery-caption, .post-gallery__caption, figcaption.image-caption, figcaption');
          
          if (galleryCaption && galleryCaption.innerHTML.trim()) {
            caption = galleryCaption.innerHTML.trim();
          } else if (pillSpan && pillSpan.innerHTML.trim()) {
            caption = pillSpan.innerHTML.trim();
          }
        }
      }

      openLightbox(src, alt, caption);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeLightbox();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();
