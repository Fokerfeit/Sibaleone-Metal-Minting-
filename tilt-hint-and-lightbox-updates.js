// Replace the existing tilt-hint-and-lightbox-updates.js checkOrientation() and the lightbox open fullscreen logic with this.
// This script does two things:
// 1) Shows the "tilt phone" GIF only on touch/phone devices (not on desktop or large tablets).
// 2) Requests fullscreen for the lightbox only when the user is on a small/touch device so desktop browsing is not impacted.
//
// Install: replace the existing <script> block that manages #tilt-hint and the lightbox open/Fullscreen behavior with this script.

(function () {
  // Helpers to detect touch / coarse input and "phone-like" screen size.
  function isTouchDevice() {
    return (
      navigator.maxTouchPoints && navigator.maxTouchPoints > 0
    ) || 'ontouchstart' in window || window.matchMedia('(any-pointer: coarse)').matches;
  }

  // "Phone" heuristic:
  // - prefer true touch devices (isTouchDevice())
  // - require the *narrower* viewport dimension to be less than 820px (portrait phones) OR
  //   the longer dimension to be less than 900px as a fallback for small devices.
  function isPhone() {
    const w = Math.max(window.innerWidth, window.innerHeight);
    const h = Math.min(window.innerWidth, window.innerHeight);
    return isTouchDevice() && (h <= 820 || w <= 900);
  }

  // Tilt hint element
  const tiltHint = document.getElementById('tilt-hint');
  if (tiltHint) {
    function updateTiltHintVisibility() {
      if (isPhone()) {
        tiltHint.style.display = 'flex';
        tiltHint.setAttribute('aria-hidden', 'false');
      } else {
        tiltHint.style.display = 'none';
        tiltHint.setAttribute('aria-hidden', 'true');
      }
    }

    // Run on load and on resize/orientationchange
    window.addEventListener('resize', updateTiltHintVisibility, { passive: true });
    window.addEventListener('orientationchange', updateTiltHintVisibility);
    // Some browsers change touch support availability when docking / connecting keyboard — re-evaluate on focus
    window.addEventListener('focus', updateTiltHintVisibility);

    updateTiltHintVisibility();
  }

  // --- LIGHTBOX: only request fullscreen on small/touch devices (so desktop users are not forced into fullscreen)
  // We'll detect phone/tablet sized screens and only request fullscreen when isPhone() is true.
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const photos = Array.from(document.querySelectorAll('.photo-wrapper'));

  // Keep existing lightbox variables from your current script if present
  // (If you are replacing the whole script, make sure the rest of your lightbox logic uses the same variable names.)
  // For safety, guard that elements exist
  if (!lightbox || !lbImg || photos.length === 0) return;

  // reuse or redefine openAt function - this small wrapper only changes fullscreen behavior
  function requestFullscreenIfAppropriate(el) {
    if (!isPhone()) return; // do not request fullscreen on desktop / large tablet
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => { /* ignore if blocked */ });
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  // Example openAt implementation to integrate with your existing code:
  function openAt(index) {
    const wrapper = photos[index];
    if (!wrapper) return;
    const img = wrapper.querySelector('img');
    lbImg.src = img.dataset.full || img.src;
    lbImg.alt = img.alt || '';
    // reset transforms (your code may set CSS vars)
    lbImg.style.setProperty('--scale', 1);
    lbImg.style.setProperty('--pan-x', '0px');
    lbImg.style.setProperty('--pan-y', '0px');
    // show lightbox
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Request Fullscreen only for phone-like/touch devices
    requestFullscreenIfAppropriate(lightbox);
  }

  // Hook thumbnails (this mirrors your existing approach; replace or merge with your code)
  photos.forEach((wrapper, i) => {
    wrapper.style.cursor = 'zoom-in';
    wrapper.addEventListener('click', () => openAt(i));
    wrapper.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openAt(i); });
  });

  // When closing, exit fullscreen if we entered it
  function closeLightbox() {
    lightbox.style.display = 'none';
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen && document.webkitExitFullscreen();
    }
  }

  // Wire up close button / background click if present (keeps your behavior)
  lightbox.addEventListener('click', e => {
    // close when clicking on the backdrop (lightbox) or a close button inside (you likely have one)
    if (e.target === lightbox || e.target.classList.contains('close-btn')) {
      closeLightbox();
    }
  });

  // Expose helpers for debugging / integration (optional)
  window._tiltHint = { isTouchDevice, isPhone, updateTiltHintVisibility };
  window._lightboxOpenAt = openAt;
  window._lightboxClose = closeLightbox;
})();
