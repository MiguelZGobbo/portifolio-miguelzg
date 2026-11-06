export function initProjectViewer() {
  const dialog = document.querySelector('[data-project-viewer]');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('[data-viewer-image]');
  const title = dialog.querySelector('#project-viewer-title');
  const caption = dialog.querySelector('[data-viewer-caption]');
  const close = dialog.querySelector('[data-viewer-close]');
  const error = dialog.querySelector('[data-viewer-error]');
  let trigger;
  let scrollPosition;
  let previousOverflow;
  let pointerStartedOutside = false;
  let loadVersion = 0;
  let closeTimeout;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function requestClose() {
    if (!dialog.open || dialog.dataset.state === 'closing') return;
    if (motion.matches) return dialog.close();
    dialog.dataset.state = 'closing';
    // Keep the native modal active until its fade finishes, even if an event is lost.
    closeTimeout = setTimeout(() => dialog.close(), 250);
  }

  document.querySelectorAll('[data-viewer-trigger]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (dialog.open) return;
      trigger = link;
      const version = ++loadVersion;
      dialog.dataset.state = 'opening';
      dialog.dataset.imageReady = 'false';
      pointerStartedOutside = false;
      scrollPosition = [window.scrollX, window.scrollY];
      previousOverflow = document.documentElement.style.overflow;
      title.textContent = link.dataset.title;
      caption.textContent = link.dataset.caption;
      caption.hidden = !link.dataset.caption;
      error.hidden = true;
      image.alt = link.dataset.description;
      image.width = Number(link.dataset.width);
      image.height = Number(link.dataset.height);
      image.style.aspectRatio = `${image.width} / ${image.height}`;
      image.style.width = `min(${image.width}px, 94vw, calc((90dvh - 100px) * ${image.width / image.height}))`;
      image.src = link.href;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      close.focus();
      image.decode().then(() => {
        if (version === loadVersion && dialog.open && dialog.dataset.state !== 'closing') {
          dialog.dataset.imageReady = 'true';
        }
      }).catch(() => {
        if (version === loadVersion && dialog.open && dialog.dataset.state !== 'closing') error.hidden = false;
      });
    });
  });

  close.addEventListener('click', requestClose);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    requestClose();
  });
  dialog.addEventListener('animationend', event => {
    if (event.target === dialog && event.animationName === 'project-viewer-exit' && dialog.dataset.state === 'closing') dialog.close();
  });
  motion.addEventListener('change', () => {
    if (motion.matches && dialog.open && dialog.dataset.state === 'closing') dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    close.focus();
  });

  function isOutside(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }

  dialog.addEventListener('pointerdown', event => { pointerStartedOutside = isOutside(event); });
  dialog.addEventListener('click', event => {
    if (pointerStartedOutside && isOutside(event)) requestClose();
    pointerStartedOutside = false;
  });
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimeout);
    ++loadVersion;
    delete dialog.dataset.state;
    delete dialog.dataset.imageReady;
    document.documentElement.style.overflow = previousOverflow;
    image.removeAttribute('src');
    trigger?.focus({ preventScroll: true });
    if (scrollPosition) window.scrollTo(...scrollPosition);
  });
}
