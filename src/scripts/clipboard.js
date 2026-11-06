import { translatePage } from './browser-i18n.js';

export function initClipboard() {
  document.querySelectorAll('.copy-btn').forEach((button) => {
    const control = button.closest('.copy-control');
    const message = control?.querySelector('.copy-status');
    const feedback = control?.querySelector('.copy-feedback');
    const error = control?.querySelector('.copy-error');
    if (!control || !message || !feedback || !error) return;

    let pending = false;
    let dismissed = false;
    let timer;

    const resetFeedback = () => {
      clearTimeout(timer);
      control.dataset.copyState = 'idle';
      message.textContent = '';
      error.textContent = '';
    };

    button.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      dismissed = true;
      if (!pending) resetFeedback();
    });

    button.addEventListener('click', async () => {
      if (pending) return;
      resetFeedback();
      pending = true;
      dismissed = false;
      control.dataset.copyState = 'copying';
      button.setAttribute('aria-busy', 'true');

      let state = 'success';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.text ?? '');
      } catch {
        state = 'error';
      }

      pending = false;
      button.removeAttribute('aria-busy');
      if (dismissed) {
        resetFeedback();
        return;
      }

      control.dataset.copyState = state;
      message.textContent = translatePage(state === 'success' ? 'copy.done' : 'copy.error');
      feedback.textContent = translatePage(state === 'success' ? 'copy.done' : 'copy.failed');
      error.textContent = state === 'error' ? message.textContent : '';
      timer = setTimeout(resetFeedback, state === 'success' ? 2000 : 5000);
    });
  });
}
