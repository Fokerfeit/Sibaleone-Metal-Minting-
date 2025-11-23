// Instant fullscreen lightbox with rotate control and arrow pictograms
(function(){
  const gallery = document.getElementById('gallery');
  const lightbox = document.getElementById('lightbox');
  const imgEl = document.getElementById('lb-image');
  const closeBtn = document.getElementById('lb-close');
  const prevBtn = document.getElementById('lb-prev');
  const nextBtn = document.getElementById('lb-next');
  const rotateBtn = document.getElementById('rotate-btn');

  let items = Array.from(document.querySelectorAll('.thumb'));
  let currentIndex = 0;
  let rotation = 0; // degrees

  function openAt(index){
    const item = items[index];
    const full = item.dataset.full || item.src;
    imgEl.src = full;
    imgEl.alt = item.alt || '';
    currentIndex = index;
    rotation = 0;
    imgEl.style.transform = 'rotate(0deg)';
    lightbox.setAttribute('aria-hidden','false');

    // Request fullscreen for the lightbox to be instant and immersive
    const el = lightbox;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(()=>{/* ignore if blocked */});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    // exit fullscreen if active
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(()=>{});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  function showNext(delta=1){
    currentIndex = (currentIndex + delta + items.length) % items.length;
    const next = items[currentIndex];
    imgEl.src = next.dataset.full || next.src;
    imgEl.alt = next.alt || '';
    rotation = 0;
    imgEl.style.transform = 'rotate(0deg)';
  }

  // click handlers
  items.forEach((el, idx) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openAt(idx);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showNext(-1));
  nextBtn.addEventListener('click', () => showNext(1));

  // rotate button rotates 90deg clockwise per click
  rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    imgEl.style.transform = `rotate(${rotation}deg)`;
  });

  // keyboard controls
  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'true') return;
    switch(e.key){
      case 'Escape':
        closeLightbox(); break;
      case 'ArrowLeft':
        showNext(-1); break;
      case 'ArrowRight':
        showNext(1); break;
      case 'r':
      case 'R':
        rotation = (rotation + 90) % 360;
        imgEl.style.transform = `rotate(${rotation}deg)`;
        break;
    }
  });

  // click on frame to close, but not when clicking the image itself or nav
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === document.getElementById('lb-frame')) {
      closeLightbox();
    }
  });

  // swipe support for touch devices (simple)
  let startX = null;
  imgEl.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) startX = e.touches[0].clientX;
  }, {passive:true});

  imgEl.addEventListener('touchend', (e) => {
    if (startX == null) return;
    const endX = (e.changedTouches && e.changedTouches[0].clientX) || 0;
    const dx = endX - startX;
    if (Math.abs(dx) > 50) {
      showNext(dx < 0 ? 1 : -1);
    }
    startX = null;
  });

  // Expose for debugging if desired
  window._lightbox = {
    openAt, closeLightbox, showNext
  };
})();
