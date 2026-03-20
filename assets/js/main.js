const sections = Array.from(document.querySelectorAll('.snap-section'));
const navLinks = document.querySelectorAll('.nav-links a');
let current = 0;
let isScrolling = false;

const container = document.querySelector('.scroll-container');
container.style.overflowY = 'hidden';

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
      delay += 50;
    });
  });
}

// Detecta quando o scroll parou de verdade
function waitForScrollEnd(targetSection, callback) {
  let lastPos = container.scrollTop;
  let attempts = 0;

  const check = setInterval(() => {
    const currentPos = container.scrollTop;
    const targetPos = targetSection.offsetTop;
    const arrived = Math.abs(currentPos - targetPos) < 5;

    if (arrived || attempts > 40) {
      clearInterval(check);
      callback();
    }

    lastPos = currentPos;
    attempts++;
  }, 50);
}

function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  isScrolling = true;

  resetSection(index);
  current = index;

  sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${sections[index].id}`);
  });

  // Aguarda o scroll chegar de verdade antes de animar
  waitForScrollEnd(sections[index], () => {
    animateSection(index);
    setTimeout(() => { isScrolling = false; }, 900);
  });
}

let wheelAccum = 0;
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (isScrolling) return;
  wheelAccum += e.deltaY;
  if (wheelAccum > 50) { wheelAccum = 0; goTo(current + 1); }
  else if (wheelAccum < -50) { wheelAccum = 0; goTo(current - 1); }
}, { passive: false });

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    const index = sections.findIndex(s => s.id === id);
    goTo(index);
  });
});

sections.forEach((_, i) => resetSection(i));
goTo(0);