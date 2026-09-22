import { translations } from '../lib/i18n';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function copiedMessage() {
  const language = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
  return translations[language]['copy.done'];
}

async function copyText(text, button) {
  if (!navigator.clipboard?.writeText) return;

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }

  const iconCopy = button.querySelector('.icon-copy');
  const iconCheck = button.querySelector('.icon-check');
  if (!iconCopy || !iconCheck || !button.parentElement) return;

  const tooltip = document.createElement('span');
  tooltip.textContent = copiedMessage();
  tooltip.className = 'copy-tooltip';
  button.parentElement.appendChild(tooltip);

  const fade = (icon, opacity, scale) => {
    icon.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    icon.style.opacity = opacity;
    icon.style.transform = `scale(${scale})`;
  };

  fade(iconCopy, '0', '0.6');
  await delay(150);

  iconCopy.style.display = 'none';
  iconCheck.style.display = 'block';
  fade(iconCheck, '0', '0.6');
  button.classList.add('copied');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fade(iconCheck, '1', '1');
    tooltip.style.opacity = '1';
  }));

  await delay(2000);
  fade(iconCheck, '0', '0.6');
  tooltip.style.opacity = '0';
  await delay(150);

  iconCheck.style.display = 'none';
  iconCheck.style.transition = 'none';
  iconCopy.style.display = 'block';
  fade(iconCopy, '0', '0.6');
  button.classList.remove('copied');
  tooltip.remove();
  requestAnimationFrame(() => requestAnimationFrame(() => fade(iconCopy, '1', '1')));
}

export function initClipboard() {
  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', () => {
      void copyText(button.dataset.text ?? '', button);
    });
  });
}
