const sections = Array.from(document.querySelectorAll('.snap-section'));
const navLinks = document.querySelectorAll('.nav-links a');
let current = 0;
let isScrolling = false;

// Remove scroll-snap do CSS — controle total pelo JS
const container = document.querySelector('.scroll-container');
container.style.overflowY = 'hidden';

function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  isScrolling = true;
  current = index;

  sections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Atualiza navbar
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${sections[index].id}`);
  });

  // Libera scroll após a transição terminar
  setTimeout(() => { isScrolling = false; }, 900);
}

// Scroll do mouse
let wheelAccum = 0;
window.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (isScrolling) return;

  wheelAccum += e.deltaY;

  if (wheelAccum > 50) {
    wheelAccum = 0;
    goTo(current + 1);
  } else if (wheelAccum < -50) {
    wheelAccum = 0;
    goTo(current - 1);
  }
}, { passive: false });

// Cliques na navbar
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    const index = sections.findIndex(s => s.id === id);
    goTo(index);
  });
});

// Marca seção inicial
goTo(0);