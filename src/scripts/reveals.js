function reveal(element) {
  element.classList.add('visible');
}

export function initReveals() {
  const elements = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;

  if (
    !('IntersectionObserver' in window)
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    elements.forEach(reveal);
    return;
  }

  const threshold = 0.12;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('visible', entry.isIntersecting && entry.intersectionRatio >= threshold);
    }
  }, { threshold });

  elements.forEach((element) => observer.observe(element));
}
