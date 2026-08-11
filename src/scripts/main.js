import { translations } from '../lib/i18n';
import { projects } from '../data/projects';
import { skillGroups } from '../data/skills';

const sections = Array.from(document.querySelectorAll('.snap-section'));
const navLinks = document.querySelectorAll('.nav-links a');
let current = -1;
let isScrolling = false;
let isRevealing = false;
let isInitializing = true;
let revealTimeouts = [];
let unlockTimeout = null;

const container = document.querySelector('.scroll-container');

// ── Idioma e tema ─────────────────────────────────────────
let currentLang = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
const t = (key) => translations[currentLang][key] ?? translations.pt[key] ?? key;

function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

function setMetaContent(attr, content) {
  const meta = document.querySelector(`meta[name="${attr}"]`) || document.querySelector(`meta[property="${attr}"]`);
  if (meta) meta.setAttribute('content', content);
}

function isMobileWidth() {
  return window.matchMedia('(max-width: 640px)').matches;
}

const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function calcRevealDuration(section) {
  if (isMobileWidth()) return 500;
  const stagger = parseInt(section.dataset.stagger, 10) || 80;
  const count = section.querySelectorAll('.reveal').length;
  return Math.min(count * stagger + 1000, 2200);
}

// ── Pill deslizante ──────────────────────────────────────
const navPill = document.createElement('div');
navPill.classList.add('nav-pill');
document.querySelector('.nav-links').appendChild(navPill);

function movePill(link) {
  if (isMobileWidth()) return;
  const nav = document.querySelector('.nav-links');
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  navPill.style.left = (linkRect.left - navRect.left) + 'px';
  navPill.style.width = linkRect.width + 'px';
  navPill.style.bottom = (navRect.bottom - linkRect.bottom) + 'px';
}

// ── Scroll suave ──────────────────────────────────────────
let scrollWaiter = null;

function scrollToSection(section, smooth = false) {
  const max = container.scrollHeight - container.clientHeight;
  const target = Math.min(section.offsetTop, Math.max(0, max));
  if (smooth) {
    try {
      container.scrollTo({ top: target, behavior: 'smooth' });
    } catch (e) {
      container.scrollTop = target;
    }
    return target;
  }
  const prevBehavior = container.style.scrollBehavior;
  container.style.scrollBehavior = 'auto';
  try {
    container.scrollTo({ top: target, behavior: 'auto' });
  } catch (e) {
    container.scrollTop = target;
  }
  if (prevBehavior === '') container.style.removeProperty('scroll-behavior');
  else container.style.scrollBehavior = prevBehavior;
  return target;
}

function waitForScrollEnd(targetPos, callback) {
  if (scrollWaiter) scrollWaiter();
  let attempts = 0;
  const check = setInterval(() => {
    const arrived = Math.abs(container.scrollTop - targetPos) < 5;
    if (arrived || attempts > 40) {
      clearInterval(check);
      callback();
    }
    attempts++;
  }, 50);
  scrollWaiter = () => clearInterval(check);
}

// ── Atualização do Estado do Menu ─────────────────────────
function setActiveNav(index) {
  if (index < 0 || index >= sections.length) return;
  document.body.dataset.section = sections[index].id;
  const isMobile = isMobileWidth();

  const widths = new Map();
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${sections[index].id}`;
    widths.set(link, isActive && !isMobile ? link.offsetWidth : null);
  });

  navLinks.forEach(link => {
    link.classList.remove('can-hover');
    const isActive = link.getAttribute('href') === `#${sections[index].id}`;
    const text = link.querySelector('.nav-text');
    const icon = link.querySelector('.nav-icon');

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      if (!isMobile) {
        link.style.width = widths.get(link) + 'px';

        text.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
        text.style.opacity = '0';
        text.style.transform = 'scale(0.6)';

        setTimeout(() => {
          text.style.display = 'none';
          icon.style.display = 'block';
          icon.style.animation = '';
          void icon.offsetWidth;
          icon.style.animation = 'iconPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
          movePill(link);

          setTimeout(() => {
            if (link.classList.contains('active')) {
              link.classList.add('can-hover');
            }
          }, 350);
        }, 150);
      }

    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');

      if (!isMobile) {
        link.style.width = '';
      }

      icon.style.display = isMobile ? 'block' : 'none';
      icon.style.animation = 'none';
      text.style.display = isMobile ? 'none' : 'inline-block';
      text.style.opacity = '1';
      text.style.transform = 'scale(1)';
    }
  });
}

// ── Re-medida da navbar após troca de idioma ──────────────
function remeasureNav() {
  if (isMobileWidth()) {
    const activeLink = document.querySelector('.nav-links a.active');
    if (activeLink) movePill(activeLink);
    return;
  }

  const isActiveSet = new Set();
  navLinks.forEach(link => {
    const text = link.querySelector('.nav-text');
    text.style.display = 'inline-block';
    text.style.opacity = '1';
    text.style.transform = 'scale(1)';
    if (link.classList.contains('active')) isActiveSet.add(link);
  });

  const widths = new Map();
  isActiveSet.forEach(link => {
    widths.set(link, link.offsetWidth);
  });

  navLinks.forEach(link => {
    const text = link.querySelector('.nav-text');
    const icon = link.querySelector('.nav-icon');
    const isActive = isActiveSet.has(link);
    if (isActive) {
      link.style.width = widths.get(link) + 'px';
      icon.style.display = 'block';
      text.style.display = 'none';
      text.style.opacity = '0';
    } else {
      link.style.width = '';
      icon.style.display = 'none';
      text.style.display = 'inline-block';
      text.style.opacity = '1';
    }
  });

  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) movePill(activeLink);
}

// ── Renderização de projetos e habilidades ───────────────
const GITHUB_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>';
const EXTERNAL_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

function renderProjects(lang) {
  const list = document.getElementById('projects-list');
  if (!list) return;
  list.innerHTML = projects.map((p) => `
    <div class="project-card reveal visible">
      <div class="project-card-inner">
        <div class="project-name">${p.name[lang]}</div>
        <div class="project-desc">${p.desc[lang]}</div>
        <div class="project-stack">${p.stack.map((s) => `<span class="stack-tag">${s}</span>`).join('')}</div>
      </div>
      <a href="${p.href}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="${p.ariaLabel[lang]}">
        ${GITHUB_SVG}<span>GitHub</span>${EXTERNAL_SVG}
      </a>
    </div>`).join('');
  setupTilt();
}

function renderSkills(lang) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = skillGroups.map((g) => `
    <div class="skill-card reveal visible">
      <div class="skill-cat">${g.cat[lang]}</div>
      <div class="skill-tags">${g.tags[lang].map((s) => `<span class="tag">${s}</span>`).join('')}</div>
    </div>`).join('');
}

// ── Troca de idioma ──────────────────────────────────────
function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = dict[key] ?? '';
  });

  document.querySelectorAll('footer[data-i18n="contact.footer"]').forEach(el => {
    el.textContent = (dict['contact.footer'] ?? '').replace('{year}', String(new Date().getFullYear()));
  });

  const cvFiles = { pt: 'MiguelZagerGobbo-CV.pdf', en: 'MiguelZagerGobbo-CV-EN.pdf' };
  document.querySelectorAll('a[data-cv]').forEach(a => {
    const name = cvFiles[currentLang];
    a.href = `${import.meta.env.BASE_URL}files/${name}`;
    if (a.hasAttribute('download')) a.setAttribute('download', name);
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = dict[key] ?? '';
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', dict[el.getAttribute('data-i18n-aria')] ?? '');
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.setAttribute('placeholder', dict[el.getAttribute('data-i18n-ph')] ?? '');
  });

  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.setAttribute('alt', dict[el.getAttribute('data-i18n-alt')] ?? '');
  });

  renderProjects(lang);
  renderSkills(lang);

  document.title = dict['meta.title'];
  setMetaContent('description', dict['meta.description']);
  setMetaContent('og:title', dict['meta.title']);
  setMetaContent('og:description', dict['meta.description']);

  updateControlAria();
  savePref('lang', lang);
  remeasureNav();
}

// ── Tema claro/escuro ────────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');

function currentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function updateControlAria() {
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', t(currentTheme() === 'dark' ? 'theme.light' : 'theme.dark'));
  }
  if (langToggle) langToggle.setAttribute('aria-label', t('lang.switch'));
}

function applyTheme(theme, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  setMetaContent('theme-color', theme === 'dark' ? '#241C14' : '#F8F0E5');
  updateControlAria();
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  if (persist) savePref('theme', theme);
}

themeToggle?.addEventListener('click', () => {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
});

langToggle?.addEventListener('click', () => {
  applyLang(currentLang === 'pt' ? 'en' : 'pt');
});

// ── Navegação principal ──────────────────────────────────

function cancelRevealAnimations(el) {
  if (typeof el.getAnimations !== 'function') return;
  try { el.getAnimations().forEach(anim => anim.cancel()); } catch (e) {}
}

function resetSectionReveals(section) {
  if (!section) return;
  if (isMobileWidth()) return;
  section.querySelectorAll('.reveal').forEach(el => {
    el.classList.remove('visible');
    el.style.opacity = '';
    el.style.transform = '';
  });
}

function revealSection(section) {
  if (isMobileWidth()) {
    forceRevealSection(section);
  } else {
    triggerReveals(section);
  }
}

function forceRevealSection(section) {
  if (!section) return;
  section.querySelectorAll('.reveal').forEach(el => {
    cancelRevealAnimations(el);
    el.classList.add('visible');
  });
}

function triggerReveals(section) {
  revealTimeouts.forEach(t => clearTimeout(t));
  revealTimeouts = [];

  const isHeader = el =>
    el.classList.contains('section-label') ||
    el.classList.contains('section-title') ||
    el.classList.contains('hero-tag') ||
    el.classList.contains('hero-title');

  const allReveals = section.querySelectorAll('.reveal');
  const headerReveals = [];
  const contentReveals = [];
  allReveals.forEach(el => {
    (isHeader(el) ? headerReveals : contentReveals).push(el);
  });

  const stagger = parseInt(section.dataset.stagger, 10) || 70;
  const gap = 260;

  headerReveals.forEach((el, i) => {
    if (!el.classList.contains('visible'))
      revealTimeouts.push(setTimeout(() => el.classList.add('visible'), i * stagger));
  });

  const contentStart = (headerReveals.length - 1) * stagger + gap;
  contentReveals.forEach((el, i) => {
    if (!el.classList.contains('visible'))
      revealTimeouts.push(setTimeout(() => el.classList.add('visible'), contentStart + i * stagger));
  });
}

function finalizeSection(index) {
  sectionWheelLock = false;
  sectionWheelReadyAt = Date.now() + 150;
  isScrolling = false;
  revealSection(sections[index]);
  if (isRevealing) {
    unlockTimeout = setTimeout(() => {
      isRevealing = false;
      unlockTimeout = null;
    }, calcRevealDuration(sections[index]));
  }
}

function goTo(index, skipWait = false) {
  if (index < 0 || index >= sections.length) return;
  if (current === index) return;
  resetSectionReveals(sections[current]);

  revealTimeouts.forEach(t => clearTimeout(t));
  revealTimeouts = [];
  if (unlockTimeout) { clearTimeout(unlockTimeout); unlockTimeout = null; }
  if (scrollWaiter) scrollWaiter();
  isRevealing = false;
  isScrolling = false;

  isScrolling = true;
  isRevealing = isMobileWidth() && !isInitializing;
  current = index;

  const target = scrollToSection(sections[index], !isMobileWidth());
  setActiveNav(index);

  if (skipWait) {
    finalizeSection(index);
  } else {
    waitForScrollEnd(target, () => finalizeSection(index));
  }
}

// ── Intersection Observer para Scroll Nativo ──────────────
function sectionFullyRevealed(section) {
  return !section || section.querySelectorAll('.reveal:not(.visible)').length === 0;
}

const observerOptions = {
  root: container,
  threshold: [0, 0.6]
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const index = sections.indexOf(entry.target);
    if (index === -1) return;

    if (isMobileWidth()) return;

    if (!entry.isIntersecting) {
      resetSectionReveals(entry.target);
      return;
    }

    if (isScrolling || isInitializing) return;

    if (entry.intersectionRatio >= 0.6) {
      if (index !== current) {
        current = index;
        setActiveNav(index);
      }
      if (!sectionFullyRevealed(entry.target)) {
        finalizeSection(index);
      }
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// ── Seção ativa no mobile (por posição de scroll) ────────
function updateActiveSection() {
  if (!isMobileWidth()) return;
  const mid = container.scrollTop + container.clientHeight / 2;
  let next = current;
  for (let i = 0; i < sections.length; i++) {
    if (mid >= sections[i].offsetTop && mid < sections[i].offsetTop + sections[i].offsetHeight) {
      next = i;
      break;
    }
  }
  if (next !== current && next >= 0) {
    current = next;
    setActiveNav(next);
  }
}

// ── Cliques na navbar ────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    const index = sections.findIndex(s => s.id === id);
    goTo(index);
  });
});

// ── Scroll por seção (desktop): seções de 1 tela trocam a cada gesto;
//    seções com conteúdo maior que a tela rolam o conteúdo e só trocam na borda ──
let sectionWheelLock = false;
let sectionWheelReadyAt = 0;

function sectionContentBottom(sec) {
  let bottom = sec.offsetTop;
  sec.querySelectorAll('.section-inner').forEach(inner => {
    bottom = Math.max(bottom, inner.offsetTop + inner.offsetHeight);
  });
  return bottom;
}

function fitsViewport(sec) {
  return sectionContentBottom(sec) - sec.offsetTop <= container.clientHeight + 2;
}

function sectionRange(i) {
  const sec = sections[i];
  return {
    top: sec.offsetTop,
    bottom: Math.min(
      sec.offsetTop + sec.offsetHeight - container.clientHeight,
      sectionContentBottom(sec) - container.clientHeight
    ),
  };
}

function advanceSection(dir) {
  const next = Math.max(0, Math.min(sections.length - 1, current + dir));
  if (next === current || sectionWheelLock || isScrolling) return;
  sectionWheelLock = true;
  goTo(next);
}

function scrollSectionContent(dir, step) {
  const range = sectionRange(current);
  if (dir > 0) {
    if (container.scrollTop < range.bottom - 2) {
      container.scrollTop = Math.min(range.bottom, container.scrollTop + step);
      return;
    }
    advanceSection(1);
  } else {
    if (container.scrollTop > range.top + 2) {
      container.scrollTop = Math.max(range.top, container.scrollTop - step);
      return;
    }
    advanceSection(-1);
  }
}

function handleScrollInput(dir, step) {
  if (sectionWheelLock || isScrolling) return;
  const sec = sections[current];
  if (!sec) return;
  if (fitsViewport(sec)) {
    advanceSection(dir);
    return;
  }
  scrollSectionContent(dir, step);
}

if (!isMobileWidth()) {
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isInitializing || e.ctrlKey || e.metaKey) return;
    if (Date.now() < sectionWheelReadyAt) return;
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 1) return;
    handleScrollInput(delta > 0 ? 1 : -1, Math.abs(delta));
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (isInitializing) return;
    const el = e.target;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
    let dir = 0;
    let isBig = false;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { dir = 1; isBig = e.key !== 'ArrowDown'; }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { dir = -1; isBig = e.key !== 'ArrowUp'; }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); return; }
    else if (e.key === 'End') { e.preventDefault(); goTo(sections.length - 1); return; }
    if (dir === 0) return;
    e.preventDefault();
    handleScrollInput(dir, isBig ? Math.round(container.clientHeight * 0.85) : 48);
  });
}

// ── Redimensionamento da Janela ───────────────────────────
window.addEventListener('resize', () => {
  updateActiveSection();
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) {
    navPill.style.transition = 'none';
    movePill(activeLink);
    requestAnimationFrame(() => {
      navPill.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }
});

// ── Parallax sutil no hero ───────────────────────────────
const heroPhoto = document.querySelector('.hero-photo');
let rafParallax = null;

function updateParallax() {
  if (!heroPhoto) return;
  heroPhoto.style.translate = `0 ${Math.round(-container.scrollTop * 0.08)}px`;
}

container.addEventListener('scroll', () => {
  if (rafParallax) return;
  rafParallax = requestAnimationFrame(() => {
    updateParallax();
    updateActiveSection();
    rafParallax = null;
  });
}, { passive: true });

// ── Tilt 3D nos cards de projeto ─────────────────────────
function setupTilt() {
  if (isTouchDevice()) return;
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.classList.add('tilting');
      card.style.setProperty('--rx', (-py * 6).toFixed(2) + 'deg');
      card.style.setProperty('--ry', (px * 6).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      setTimeout(() => card.classList.remove('tilting'), 200);
    });
  });
}

// ── Inicialização ────────────────────────────────────────
try {
  goTo(0, true);
} catch (err) {
  document.body.dataset.section = 'home';
  forceRevealSection(sections[0]);
}
if (isMobileWidth()) {
  sections.forEach(forceRevealSection);
}
requestAnimationFrame(() => {
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) movePill(activeLink);
  updateActiveSection();
  isInitializing = false;
});

// ── Rede de segurança: seção com parte visível nunca fica vazia ──
setInterval(() => {
  const pos = container.scrollTop;
  const viewBottom = pos + container.clientHeight;
  sections.forEach((section, i) => {
    if (section.offsetTop < viewBottom && section.offsetTop + section.offsetHeight > pos) {
      if (!sectionFullyRevealed(section)) {
        if (i === current) finalizeSection(i);
        else forceRevealSection(section);
      }
    }
  });
}, 2000);

applyTheme(currentTheme(), false);
const initLang = document.documentElement.dataset.lang === 'en' ? 'en' : 'pt';
if (initLang !== 'pt') applyLang('en');
else setupTilt();
updateParallax();

// ── Copiar para clipboard ────────────────────────────────
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => copyText(btn.dataset.text, btn));
});

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    return;
  }

  const iconCopy = btn.querySelector('.icon-copy');
  const iconCheck = btn.querySelector('.icon-check');
  const tooltip = document.createElement('span');
  tooltip.textContent = t('copy.done');
  tooltip.style.cssText = `
    font-size: 0.7rem; font-weight: 600;
    color: var(--brown-dark); letter-spacing: 0.04em;
    opacity: 0; transition: opacity 0.15s ease;
  `;
  btn.parentElement.appendChild(tooltip);

  const fade = (icon, opacity, scale) => {
    icon.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    icon.style.opacity = opacity;
    icon.style.transform = `scale(${scale})`;
  };

  fade(iconCopy, 0, 0.6);
  await delay(150);

  iconCopy.style.display = 'none';
  iconCheck.style.display = 'block';
  fade(iconCheck, 0, 0.6);
  btn.classList.add('copied');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fade(iconCheck, 1, 1);
    tooltip.style.opacity = '1';
  }));

  await delay(2000);
  fade(iconCheck, 0, 0.6);
  tooltip.style.opacity = '0';
  await delay(150);

  iconCheck.style.display = 'none';
  iconCheck.style.transition = 'none';
  iconCopy.style.display = 'block';
  fade(iconCopy, 0, 0.6);
  btn.classList.remove('copied');
  tooltip.remove();
  requestAnimationFrame(() => requestAnimationFrame(() => fade(iconCopy, 1, 1)));
}

// ── Formulário de contato ────────────────────────────────
let emailjsPromise = null;

function loadEmailJS() {
  if (window.emailjs) return Promise.resolve();
  if (!emailjsPromise) {
    emailjsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { emailjsPromise = null; reject(new Error('EmailJS load failed')); };
      document.head.appendChild(s);
    });
  }
  return emailjsPromise;
}

function resetFormBtn(btn, aviso, message, className) {
  btn.textContent = t('form.submit');
  btn.disabled = false;
  aviso.textContent = message;
  aviso.className = className;
  setTimeout(() => {
    aviso.textContent = '';
    aviso.className = '';
  }, 4000);
}

function enviarMensagem() {
  const nome = document.getElementById('campo-nome').value.trim();
  const email = document.getElementById('campo-email').value.trim();
  const mensagem = document.getElementById('campo-mensagem').value.trim();
  const btn = document.getElementById('btn-enviar');
  const aviso = document.getElementById('form-aviso');
  const site = document.getElementById('campo-site');

  aviso.textContent = '';
  aviso.className = '';

  if (site && site.value.trim() !== '') {
    btn.textContent = t('form.submit');
    return;
  }

  if (!nome || !email || !mensagem) {
    aviso.textContent = t('form.required');
    aviso.className = 'erro';
    return;
  }

  btn.textContent = t('form.sending');
  btn.disabled = true;

  loadEmailJS()
    .then(() => {
      window.emailjs.init('7cO86VT1CxLbCKh3n');
      return window.emailjs.send('service_5hcdutl', 'template_z8knk7w', {
        name: nome,
        email: email,
        message: mensagem
      });
    })
    .then(() => {
      resetFormBtn(btn, aviso, t('form.ok'), 'sucesso');
      document.getElementById('campo-nome').value = '';
      document.getElementById('campo-email').value = '';
      document.getElementById('campo-mensagem').value = '';
    })
    .catch(() => {
      resetFormBtn(btn, aviso, t('form.err'), 'erro');
    });
}

document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  enviarMensagem();
});
