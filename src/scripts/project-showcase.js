export function adjacentProjectIndex(currentIndex, direction, total) {
  if (total <= 0) return -1;
  return Math.min(total - 1, Math.max(0, currentIndex + direction));
}

export function formatProjectCounter(index, total) {
  const position = String(index + 1).padStart(2, '0');
  return `${position} / ${String(total).padStart(2, '0')}`;
}

export function horizontalScrollPosition(currentScroll, containerLeft, containerWidth, itemLeft, itemWidth) {
  if (itemLeft < containerLeft) return currentScroll - (containerLeft - itemLeft);

  const itemEnd = itemLeft + itemWidth;
  const visibleEnd = containerLeft + containerWidth;
  return itemEnd > visibleEnd ? currentScroll + (itemEnd - visibleEnd) : currentScroll;
}

function updateShowcase(showcase, selectedIndex, shouldAnnounce) {
  const panels = Array.from(showcase.querySelectorAll('[data-project-panel]'));
  const selectors = Array.from(showcase.querySelectorAll('[data-project-select]'));
  const previousButton = showcase.querySelector('[data-project-direction="previous"]');
  const nextButton = showcase.querySelector('[data-project-direction="next"]');
  const counter = showcase.querySelector('[data-project-counter]');
  const announcement = showcase.querySelector('[data-project-announcement]');
  const activePanel = panels[selectedIndex];
  const directNavigation = showcase.querySelector('.project-showcase-nav');
  const activeSelector = selectors[selectedIndex];

  if (!activePanel) return;

  panels.forEach((panel, index) => {
    const isActive = index === selectedIndex;
    if (isActive) panel.dataset.active = 'true';
    else delete panel.dataset.active;
    panel.toggleAttribute('inert', !isActive);
    if (isActive) panel.removeAttribute('aria-hidden');
    else panel.setAttribute('aria-hidden', 'true');
  });

  selectors.forEach((selector, index) => {
    if (index === selectedIndex) selector.setAttribute('aria-current', 'true');
    else selector.removeAttribute('aria-current');
  });

  previousButton.disabled = selectedIndex === 0;
  nextButton.disabled = selectedIndex === panels.length - 1;
  previousButton.setAttribute('aria-controls', panels[Math.max(0, selectedIndex - 1)].id);
  nextButton.setAttribute('aria-controls', panels[Math.min(panels.length - 1, selectedIndex + 1)].id);
  counter.textContent = formatProjectCounter(selectedIndex, panels.length);
  const navigationRect = directNavigation.getBoundingClientRect();
  const selectorRect = activeSelector.getBoundingClientRect();
  directNavigation.scrollLeft = horizontalScrollPosition(
    directNavigation.scrollLeft,
    navigationRect.left,
    navigationRect.width,
    selectorRect.left,
    selectorRect.width,
  );

  if (shouldAnnounce) {
    announcement.textContent = showcase.dataset.projectAnnouncementTemplate
      .replace('{current}', String(selectedIndex + 1))
      .replace('{total}', String(panels.length))
      .replace('{name}', activePanel.dataset.projectName);
  }
}

function initializeShowcase(showcase) {
  const panels = Array.from(showcase.querySelectorAll('[data-project-panel]'));
  const selectors = Array.from(showcase.querySelectorAll('[data-project-select]'));
  const previousButton = showcase.querySelector('[data-project-direction="previous"]');
  const nextButton = showcase.querySelector('[data-project-direction="next"]');
  let currentIndex = Math.max(0, panels.findIndex((panel) => panel.dataset.active === 'true'));

  previousButton.addEventListener('click', () => {
    currentIndex = adjacentProjectIndex(currentIndex, -1, panels.length);
    updateShowcase(showcase, currentIndex, true);
  });

  nextButton.addEventListener('click', () => {
    currentIndex = adjacentProjectIndex(currentIndex, 1, panels.length);
    updateShowcase(showcase, currentIndex, true);
  });

  selectors.forEach((selector, index) => {
    selector.addEventListener('click', () => {
      currentIndex = index;
      updateShowcase(showcase, currentIndex, true);
    });
  });

  updateShowcase(showcase, currentIndex, false);
}

export function initProjectShowcase() {
  document.querySelectorAll('[data-project-showcase]').forEach(initializeShowcase);
}
