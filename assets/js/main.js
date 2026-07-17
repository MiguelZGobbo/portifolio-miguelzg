emailjs.init('7cO86VT1CxLbCKh3n');

const sections = Array.from(document.querySelectorAll('.snap-section'));
const navLinks = document.querySelectorAll('.nav-links a');
let current = -1;
let isScrolling = false;
let isRevealing = false;
let isInitializing = true;
let revealTimeouts = [];
let unlockTimeout = null;

const container = document.querySelector('.scroll-container');

function isMobileWidth() {
  return window.matchMedia('(max-width: 640px)').matches;
}

function lockScroll() {
  if (isMobileWidth()) container.style.overflow = 'hidden';
}

function unlockScroll() {
  if (isMobileWidth()) container.style.overflow = '';
}

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
  const nav = document.querySelector('.nav-links');
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  navPill.style.left = (linkRect.left - navRect.left) + 'px';
  navPill.style.width = linkRect.width + 'px';
  navPill.style.bottom = (navRect.bottom - linkRect.bottom) + 'px';
}

// ── Scroll suave ──────────────────────────────────────────
let scrollWaiter = null;

function waitForScrollEnd(targetSection, callback) {
  if (scrollWaiter) scrollWaiter();
  let attempts = 0;
  const check = setInterval(() => {
    const currentPos = container.scrollTop;
    const targetPos = targetSection.offsetTop;
    const arrived = Math.abs(currentPos - targetPos) < 5;
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
  const isMobile = window.matchMedia('(max-width: 640px)').matches;

  navLinks.forEach(link => {
    link.classList.remove('can-hover');
    const isActive = link.getAttribute('href') === `#${sections[index].id}`;
    const text = link.querySelector('.nav-text');
    const icon = link.querySelector('.nav-icon');

    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');

      if (!isMobile) {
        link.style.width = link.offsetWidth + 'px';

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
      } else {
        movePill(link);
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

// ── Navegação principal ──────────────────────────────────

function revealSection(section) {
  if (isMobileWidth()) {
    section.querySelectorAll('.reveal').forEach(el => {
      el.getAnimations().forEach(anim => anim.cancel());
      el.classList.add('visible');
      el.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 600, easing: 'ease' });
    });
  } else {
    triggerReveals(section);
  }
}

function triggerReveals(section) {
  revealTimeouts.forEach(t => clearTimeout(t));
  revealTimeouts = [];

  section.querySelectorAll('.reveal').forEach(el => {
    el.style.transition = 'none';
    el.classList.remove('visible');
    el.style.transition = '';
  });
  void document.body.offsetHeight;

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

  const stagger = parseInt(section.dataset.stagger, 10) || 80;
  const gap = 400;

  headerReveals.forEach((el, i) => {
    revealTimeouts.push(setTimeout(() => el.classList.add('visible'), i * stagger));
  });

  const contentStart = (headerReveals.length - 1) * stagger + gap;
  contentReveals.forEach((el, i) => {
    revealTimeouts.push(setTimeout(() => el.classList.add('visible'), contentStart + i * stagger));
  });
}

function goTo(index) {
  if (index < 0 || index >= sections.length) return;
  if (current === index) return;

  revealTimeouts.forEach(t => clearTimeout(t));
  revealTimeouts = [];
  if (unlockTimeout) { clearTimeout(unlockTimeout); unlockTimeout = null; }
  if (scrollWaiter) scrollWaiter();
  isRevealing = false;
  isScrolling = false;

  isScrolling = true;
  isRevealing = isMobileWidth() && !isInitializing;
  current = index;

  const scrollOpts = isMobileWidth()
    ? { block: 'start' }
    : { behavior: 'smooth', block: 'start' };
  sections[index].scrollIntoView(scrollOpts);
  setActiveNav(index);

  waitForScrollEnd(sections[index], () => {
    isScrolling = false;
    revealSection(sections[index]);

    if (isRevealing) {
      unlockTimeout = setTimeout(() => {
        isRevealing = false;
        unlockTimeout = null;
      }, calcRevealDuration(sections[index]));
    }
  });
}

// ── Intersection Observer para Scroll Nativo ──────────────
const observerOptions = {
  root: container,
  rootMargin: '0px 0px -20% 0px', // Dispara quando a seção passa da linha dos 80% da viewport
  threshold: 0.35 // Dispara quando 35% da seção estiver visível (mais sensível)
};

const observer = new IntersectionObserver((entries) => {
  if (isScrolling || isRevealing || isInitializing) return;
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const index = sections.indexOf(entry.target);
      if (index !== -1 && index !== current) {
        isScrolling = true;
        if (isMobileWidth()) isRevealing = true;
        current = index;
        setActiveNav(index);
        entry.target.scrollIntoView(isMobileWidth()
          ? { block: 'start' }
          : { behavior: 'smooth', block: 'start' }
        );
        waitForScrollEnd(sections[index], () => {
          isScrolling = false;
          if (!isInitializing || !isMobileWidth()) revealSection(sections[index]);

          if (isRevealing) {
            unlockTimeout = setTimeout(() => {
              isRevealing = false;
              unlockTimeout = null;
            }, calcRevealDuration(sections[index]));
          }
        });
      }
    }
  });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// ── Cliques na navbar ────────────────────────────────────
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').replace('#', '');
    const index = sections.findIndex(s => s.id === id);
    goTo(index);
  });
});

// ── Redimensionamento da Janela ───────────────────────────
window.addEventListener('resize', () => {
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) {
    navPill.style.transition = 'none';
    movePill(activeLink);
    requestAnimationFrame(() => {
      navPill.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }
});

// ── Inicialização ────────────────────────────────────────
goTo(0);
revealSection(sections[0]);
requestAnimationFrame(() => {
  const activeLink = document.querySelector('.nav-links a.active');
  if (activeLink) movePill(activeLink);
  isInitializing = false;
});

// ── Copiar para clipboard ────────────────────────────────
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const iconCopy = btn.querySelector('.icon-copy');
    const iconCheck = btn.querySelector('.icon-check');

    iconCopy.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
    iconCopy.style.opacity = '0';
    iconCopy.style.transform = 'scale(0.6)';

    setTimeout(() => {
      iconCopy.style.display = 'none';
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
        iconCheck.style.opacity = '1';
        iconCheck.style.transform = 'scale(1)';
        tooltip.style.opacity = '1';
      }));

      setTimeout(() => {
        iconCheck.style.opacity = '0';
        iconCheck.style.transform = 'scale(0.6)';
        tooltip.style.opacity = '0';

        setTimeout(() => {
          iconCheck.style.display = 'none';
          iconCheck.style.transition = 'none';
          iconCopy.style.display = 'block';
          iconCopy.style.opacity = '0';
          iconCopy.style.transform = 'scale(0.6)';
          iconCopy.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
          btn.classList.remove('copied');
          tooltip.remove();

          requestAnimationFrame(() => requestAnimationFrame(() => {
            iconCopy.style.opacity = '1';
            iconCopy.style.transform = 'scale(1)';
          }));
        }, 150);
      }, 2000);
    }, 150);
  });
}

// ── Formulário de contato ────────────────────────────────
function enviarMensagem() {
  const nome = document.getElementById('campo-nome').value.trim();
  const email = document.getElementById('campo-email').value.trim();
  const mensagem = document.getElementById('campo-mensagem').value.trim();
  const btn = document.getElementById('btn-enviar');
  const aviso = document.getElementById('form-aviso');

  // Limpa aviso anterior
  aviso.textContent = '';
  aviso.className = '';

  if (!nome || !email || !mensagem) {
    aviso.textContent = 'Preencha todos os campos antes de enviar.';
    aviso.className = 'erro';
    return;
  }

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  emailjs.send('service_5hcdutl', 'template_z8knk7w', {
    name: nome,
    email: email,
    message: mensagem
  })
    .then(() => {
      btn.textContent = 'Enviar mensagem';
      btn.disabled = false;
      aviso.textContent = 'Mensagem enviada com sucesso!';
      aviso.className = 'sucesso';
      document.getElementById('campo-nome').value = '';
      document.getElementById('campo-email').value = '';
      document.getElementById('campo-mensagem').value = '';
      setTimeout(() => {
        aviso.textContent = '';
        aviso.className = '';
      }, 4000);
    })
    .catch(() => {
      btn.textContent = 'Enviar mensagem';
      btn.disabled = false;
      aviso.textContent = 'Erro ao enviar. Tente novamente.';
      aviso.className = 'erro';
      setTimeout(() => {
        aviso.textContent = '';
        aviso.className = '';
      }, 4000);
    });
}
