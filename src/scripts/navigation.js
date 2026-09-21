function sectionCenter(section) {
  return section.top + section.height / 2;
}

/**
 * Finds the observed navigation destination nearest to the viewport midpoint.
 * Destinations are intentionally supplied as plain geometry so this calculation
 * stays independent from the browser DOM.
 */
export function findActiveSection(sections, scrollTop, viewportHeight) {
  if (!sections.length) return null;

  const midpoint = scrollTop + viewportHeight / 2;
  const containingSections = sections.filter((section) => (
    midpoint >= section.top && midpoint < section.top + section.height
 ));

  if (containingSections.length) {
    return containingSections.reduce((nearest, section) => (
      section.top > nearest.top ? section : nearest
    )).id;
  }

  return sections.reduce((nearest, section) => (
    Math.abs(sectionCenter(section) - midpoint) < Math.abs(sectionCenter(nearest) - midpoint)
      ? section
      : nearest
  )).id;
}

export function updateNavigationPill(pill, link) {
  if (!pill) return;

  pill.hidden = !link;
  if (!link || window.matchMedia('(max-width: 640px)').matches) return;

  const navigation = link.parentElement;
  if (!navigation) return;

  const navigationRect = navigation.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  pill.style.left = `${linkRect.left - navigationRect.left}px`;
  pill.style.width = `${linkRect.width}px`;
  pill.style.bottom = `${navigationRect.bottom - linkRect.bottom}px`;
}

export function updateNavigationState(links, sectionId) {
  let activeLink = null;
  for (const link of links) {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'location');
      activeLink = link;
    } else {
      link.removeAttribute('aria-current');
    }
  }

  return activeLink;
}

function setActiveNavigation(sectionId, links, pill) {
  document.body.dataset.section = sectionId;
  const activeLink = updateNavigationState(links, sectionId);

  updateNavigationPill(pill, activeLink);
}

function sectionGeometry(section) {
  const rect = section.getBoundingClientRect();
  return {
    id: section.id,
    top: window.scrollY + rect.top,
    height: rect.height,
  };
}

function navigationGeometry(sections) {
  const geometry = sections.map(sectionGeometry).sort((left, right) => left.top - right.top);

  return geometry.map((section, index) => {
    const nextSection = geometry[index + 1];
    const distanceToNextSection = nextSection ? nextSection.top - section.top : section.height;

    return {
      ...section,
      height: Math.max(section.height, distanceToNextSection),
    };
  });
}

export function initNavigation() {
  const sections = Array.from(document.querySelectorAll('main > section[id], main #cv'));
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!sections.length) return;

  const navigation = document.querySelector('.nav-links');
  const pill = navigation?.querySelector('.nav-pill') ?? document.createElement('div');
  if (navigation && !pill.parentElement) {
    pill.className = 'nav-pill';
    navigation.appendChild(pill);
  }

  const update = () => {
    const activeSection = findActiveSection(
      navigationGeometry(sections),
      window.scrollY,
      window.innerHeight,
    );

    if (activeSection) setActiveNavigation(activeSection, links, pill);
  };

  let animationFrame = 0;
  const scheduleUpdate = () => {
    if (animationFrame) return;
    animationFrame = window.requestAnimationFrame(() => {
      animationFrame = 0;
      update();
    });
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  document.addEventListener('languagechange', scheduleUpdate);
  update();
  scheduleUpdate();
}
