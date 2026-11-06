/**
 * Finds the last observed section whose top has crossed the viewport midpoint.
 * This keeps the active destination meaningful when a section is taller than
 * the viewport. Destinations stay as plain geometry for easy testing.
 */
export function findActiveSection(sections, scrollTop, viewportHeight) {
  if (!sections.length) return null;

  const midpoint = scrollTop + viewportHeight / 2;
  return sections.reduce((active, section) => (
    section.top <= midpoint && section.top >= active.top ? section : active
  ), sections[0]).id;
}

function navigationPillUpdate(pill, link) {
  if (!pill) return null;
  if (!link) return { hidden: true, position: null };
  if (window.matchMedia('(max-width: 640px)').matches) {
    return { hidden: false, position: null };
  }

  const navigation = link.parentElement;
  if (!navigation) return { hidden: false, position: null };

  const navigationRect = navigation.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  return {
    hidden: false,
    position: {
      left: `${linkRect.left - navigationRect.left}px`,
      width: `${linkRect.width}px`,
      bottom: `${navigationRect.bottom - linkRect.bottom}px`,
    },
  };
}

function applyNavigationPillUpdate(pill, update) {
  if (!pill || !update) return;

  if (pill.hidden !== update.hidden) pill.hidden = update.hidden;
  if (!update.position) return;

  for (const [property, value] of Object.entries(update.position)) {
    if (pill.style[property] !== value) pill.style[property] = value;
  }
}

export function updateNavigationPill(pill, link) {
  applyNavigationPillUpdate(pill, navigationPillUpdate(pill, link));
}

export function updateNavigationState(links, sectionId) {
  let activeLink = null;
  for (const link of links) {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    if (link.classList.contains('active') !== isActive) {
      link.classList.toggle('active', isActive);
    }
    if (isActive) {
      if (link.getAttribute('aria-current') !== 'location') {
        link.setAttribute('aria-current', 'location');
      }
      activeLink = link;
    } else if (link.getAttribute('aria-current') !== null) {
      link.removeAttribute('aria-current');
    }
  }

  return activeLink;
}

function observedSectionDestination(toggle, sectionId) {
  const serializedDestinations = toggle.getAttribute('data-language-sections');
  if (!serializedDestinations || !sectionId) return null;

  try {
    const destinations = JSON.parse(serializedDestinations);
    return typeof destinations[sectionId] === 'string' ? destinations[sectionId] : null;
  } catch {
    return null;
  }
}

export function updateLanguageDestination(toggle, activeLink, sectionId) {
  if (!toggle) return;

  const alternateHref = activeLink?.getAttribute('data-language-alternate')
    || observedSectionDestination(toggle, sectionId);
  const defaultHref = toggle.getAttribute('data-language-default');
  const destination = alternateHref || defaultHref;

  if (destination && toggle.getAttribute('href') !== destination) {
    toggle.setAttribute('href', destination);
  }
}

function setActiveNavigation(sectionId, links, pill, pillUpdate) {
  if (document.body.dataset.section !== sectionId) {
    document.body.dataset.section = sectionId;
  }
  const activeLink = updateNavigationState(links, sectionId);

  updateLanguageDestination(document.getElementById('lang-toggle'), activeLink, sectionId);
  applyNavigationPillUpdate(pill, pillUpdate);
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
  const sections = Array.from(document.querySelectorAll('main > section[id]'));
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (!sections.length) return;

  const navigation = document.querySelector('.nav-links');
  const header = document.querySelector('nav');
  let previousHeaderHeight;
  let headerHeightNeedsSync = Boolean(header);
  const syncHeaderHeight = height => {
    if (height === null || height === previousHeaderHeight) return;

    previousHeaderHeight = height;
    document.documentElement.style.setProperty('--nav-height', `${height}px`);
  };
  const pill = navigation?.querySelector('.nav-pill') ?? document.createElement('div');
  const needsPillAppend = navigation && !pill.parentElement;
  if (navigation && !pill.parentElement) pill.className = 'nav-pill';

  const update = () => {
    const headerHeight = headerHeightNeedsSync ? header.getBoundingClientRect().height : null;
    headerHeightNeedsSync = false;
    const geometry = navigationGeometry(sections);
    const activeSection = findActiveSection(geometry, window.scrollY, window.innerHeight);

    let activeLink = null;
    let pillUpdate = null;
    if (activeSection) {
      activeLink = links.find(link => link.getAttribute('href') === `#${activeSection}`) ?? null;
      pillUpdate = navigationPillUpdate(pill, activeLink);
    }

    if (needsPillAppend && !pill.parentElement) navigation.appendChild(pill);
    syncHeaderHeight(headerHeight);
    if (activeSection) setActiveNavigation(activeSection, links, pill, pillUpdate);
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
  const headerResized = () => {
    headerHeightNeedsSync = Boolean(header);
    scheduleUpdate();
  };
  if (header && window.ResizeObserver) {
    const observer = new window.ResizeObserver(headerResized);
    observer.observe(header);
  }
  window.addEventListener('resize', headerResized);
  window.addEventListener('hashchange', scheduleUpdate);
  document.addEventListener('languagechange', scheduleUpdate);
  update();
  scheduleUpdate();
  document.fonts?.ready?.then(() => {
    headerHeightNeedsSync = Boolean(header);
    scheduleUpdate();
  });
}
