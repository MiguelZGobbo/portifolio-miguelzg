const sections = Array.from(document.querySelectorAll('.snap-section'));
const navLinks = document.querySelectorAll('.nav-links a');
let current = 0;
let isScrolling = false;

const container = document.querySelector('.scroll-container');
container.style.overflowY = 'hidden';

// ── Pill deslizante ──────────────────────────────────────
const navPill = document.createElement('div');
navPill.classList.add('nav-pill');
document.querySelector('.nav-links').appendChild(navPill);

function movePill(link) {
  const nav     = document.querySelector('.nav-links');
  const navLeft = nav.getBoundingClientRect().left;
  const linkRect = link.getBoundingClientRect();
  navPill.style.left  = (linkRect.left - navLeft) + 'px';
  navPill.style.width = linkRect.width + 'px';
}

// ── Animações de entrada ─────────────────────────────────
const animatables = [
  ['#home .hero-tag', '#home .hero-title', '#home .hero-sub', '#home .hero-photo'],
  ['#sobre .section-label', '#sobre .section-title', '#sobre .about-text', '#sobre .about-info'],
  ['#habilidades .section-label', '#habilidades .section-title', '#habilidades .skill-card'],
  ['#projetos .section-label', '#projetos .section-title', '#projetos .project-card'],
  ['#cv .section-label', '#cv .section-title', '#cv .cv-box'],
  ['#contato .section-label', '#contato .section-title', '#contato .contact-form', '#contato .contact-info'],
];

function resetSection(index) {
  if (!animatables[index]) return;
  animatables[index].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
    });
  });
}

function animateSection(index) {
  if (!animatables[index]) return;
  let delay = 0;
  animatables[index].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.45s ease-out, transform 0.45s ease-out';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delay);
      delay += 80;
    });
  });
}

function waitForScrollEnd(targetSection, callback) {
  let attempts = 0;
  const check = setInterval(() => {
    const currentPos = container.scrollTop;
    const targetPos  = targetSection.offsetTop;
    const arrived    = Math.abs(currentPos - targetPos) < 5;
    if (arrived || attempts > 40) {
      clearInterval(check);
      callback();
    }
    attempts++;
  }, 50);
}

// ── Navegação principal ──────────────────────────────────
function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  isScrolling = true;
  resetSection(index);
  current = index;

  sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${sections[index].id}`;
    link.classList.toggle('active', isActive);
    if (isActive) movePill(link);
  });

  waitForScrollEnd(sections[index], () => {
    animateSection(index);
    setTimeout(() => { isScrolling = false; }, 5);
  });
}

// ── Scroll do mouse ──────────────────────────────────────
let wheelAccum = 0;
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (isScrolling) return;
  wheelAccum += e.deltaY;
  if (wheelAccum > 50)  { wheelAccum = 0; goTo(current + 1); }
  if (wheelAccum < -50) { wheelAccum = 0; goTo(current - 1); }
}, { passive: false });

// ── Cliques na navbar ────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id    = link.getAttribute('href').replace('#', '');
    const index = sections.findIndex(s => s.id === id);
    goTo(index);
  });
});

// ── Inicialização ────────────────────────────────────────
sections.forEach((_, i) => resetSection(i));
goTo(0);
requestAnimationFrame(() => {
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) movePill(activeLink);
});

// ── Copiar para clipboard ────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const iconCopy  = btn.querySelector('.icon-copy');
    const iconCheck = btn.querySelector('.icon-check');

    iconCopy.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    iconCopy.style.opacity    = '0';
    iconCopy.style.transform  = 'scale(0.6)';

    setTimeout(() => {
      iconCopy.style.display  = 'none';
      iconCheck.style.display = 'block';
      iconCheck.style.opacity = '0';
      iconCheck.style.transform = 'scale(0.6)';
      iconCheck.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      btn.classList.add('copied');

      const tooltip = document.createElement('span');
      tooltip.textContent = 'Copiado!';
      tooltip.style.cssText = `
        font-size: 0.7rem; font-weight: 600;
        color: var(--brown-dark); letter-spacing: 0.04em;
        opacity: 0; transition: opacity 0.15s ease;
      `;
      btn.parentElement.appendChild(tooltip);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        iconCheck.style.opacity   = '1';
        iconCheck.style.transform = 'scale(1)';
        tooltip.style.opacity     = '1';
      }));

      setTimeout(() => {
        iconCheck.style.opacity   = '0';
        iconCheck.style.transform = 'scale(0.6)';
        tooltip.style.opacity     = '0';

        setTimeout(() => {
          iconCheck.style.display = 'none';
          iconCheck.style.transition = 'none';
          iconCopy.style.display  = 'block';
          iconCopy.style.opacity  = '0';
          iconCopy.style.transform = 'scale(0.6)';
          iconCopy.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
          btn.classList.remove('copied');
          tooltip.remove();

          requestAnimationFrame(() => requestAnimationFrame(() => {
            iconCopy.style.opacity   = '1';
            iconCopy.style.transform = 'scale(1)';
          }));
        }, 150);
      }, 2000);
    }, 150);
  });
}