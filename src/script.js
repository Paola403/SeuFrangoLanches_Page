/* ============================================================
   SEU FRANGO LANCHES — script.js
   ============================================================ */

/* ─────────────────────────────────────────
   HORÁRIO DE FUNCIONAMENTO
   Quarta (3) a Domingo (0) das 18h às 22h
   (Domingo = 0, Segunda = 1, Terça = 2, Quarta = 3 ... Sábado = 6)
   ───────────────────────────────────────── */
const SCHEDULE = {
  // diasAbertos: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  openDays:  [0, 3, 4, 5, 6],  // Dom, Qua, Qui, Sex, Sab
  openHour:  18,
  openMin:   30,                // abertura às 18h30
  closeHour: 22,
};

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function checkBusinessHours() {
  // Hora de Brasília (UTC-3)
  const now    = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const day    = now.getDay();    // 0–6
  const hour   = now.getHours(); // 0–23
  const min    = now.getMinutes();

  const badge  = document.getElementById('statusBadge');
  const dot    = document.getElementById('statusDot');
  const text   = document.getElementById('statusText');

  if (!badge) return;

  const isOpenDay  = SCHEDULE.openDays.includes(day);
  const nowTotal   = hour * 60 + min;
  const openTotal  = SCHEDULE.openHour * 60 + SCHEDULE.openMin;
  const closeTotal = SCHEDULE.closeHour * 60;
  const isOpenTime = nowTotal >= openTotal && nowTotal < closeTotal;
  const isOpen     = isOpenDay && isOpenTime;

  badge.classList.remove('is-loading', 'is-open', 'is-closed');

  if (isOpen) {
    // Aberto
    const minutesLeft = closeTotal - nowTotal;
    const hoursLeft   = Math.floor(minutesLeft / 60);
    const minsLeft    = minutesLeft % 60;


    badge.classList.add('is-open');
    text.textContent = `Aberto agora  •  Entrega Rápida`;
  } else {
    // Fechado – calcular próxima abertura
    badge.classList.add('is-closed');

    // Encontrar o próximo dia de abertura
    let daysUntilOpen = 0;
    for (let i = 1; i <= 7; i++) {
      const nextDay = (day + i) % 7;
      if (SCHEDULE.openDays.includes(nextDay)) {
        daysUntilOpen = i;
        break;
      }
    }

    // Se hoje é um dia de abertura mas ainda não chegou a hora
    if (isOpenDay && nowTotal < openTotal) {
      const minsUntil = openTotal - nowTotal;
      const hU = Math.floor(minsUntil / 60);
      const mU = minsUntil % 60;
      if (minsUntil > 60) {
        text.textContent = `Fechado  •  Abre hoje às 18h30`;
      } else if (hU > 0) {
        text.textContent = `🔴 Fechado  •  Abre em ${hU}h${mU > 0 ? mU + 'min' : ''}`;
      } else {
        text.textContent = `🔴 Fechado  •  Abre em ${mU}min`;
      }
    } else if (daysUntilOpen === 1) {
      text.textContent = `Fechado  •  Abre amanhã às 18h30`;
    } else {
      const nextDayName = DAY_NAMES[(day + daysUntilOpen) % 7];
      text.textContent  = `🔴 Fechado  •  Abre ${nextDayName} às 18h30`;
    }
  }
}

// Roda imediatamente e atualiza a cada minuto
checkBusinessHours();
setInterval(checkBusinessHours, 60_000);

/* ─────────────────────────────────────────
   FADE IN ON SCROLL
   ───────────────────────────────────────── */
const fadeObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
);
document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ─────────────────────────────────────────
   NAV: shrink on scroll
   ───────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─────────────────────────────────────────
   NAV: active link highlight
   ───────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');

window.addEventListener('scroll', () => {
  let currentSection = null;
  let minDistance = window.innerHeight;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top);

    if (rect.top <= 150 && distance < minDistance) {
      minDistance = distance;
      currentSection = section;
    }
  });

  if (currentSection) {
    const id = currentSection.getAttribute('id');

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + id);
    });
  }
});

if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#contato');
  });
}


/* ─────────────────────────────────────────
   MOBILE MENU
   ───────────────────────────────────────── */
const navToggle  = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobLinks   = document.querySelectorAll('.mob-link');

function closeMobileMenu() {
  navToggle.classList.remove('open');
  mobileMenu.classList.remove('open');
}
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && !mobileMenu.contains(e.target)) closeMobileMenu();
});

/* ─────────────────────────────────────────
   SMOOTH ANCHOR SCROLL (offset para nav fixa)
   ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────
   REVIEW CARDS — 3-D TILT no mouse move
   ───────────────────────────────────────── */
document.querySelectorAll('.review-card').forEach(card => {
  const TILT = 10; // graus máximo

  card.addEventListener('mousemove', e => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 a 1
    const dy     = (e.clientY - cy) / (rect.height / 2); // -1 a 1
    const rotX   = -dy * TILT;  // inclina em X
    const rotY   =  dx * TILT;  // inclina em Y

    card.style.transform =
      `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1), box-shadow .3s, border-color .3s';
    card.style.transform  = '';
    // Restaura a transition padrão após o easing
    setTimeout(() => { card.style.transition = ''; }, 450);
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform .08s linear, box-shadow .3s, border-color .3s';
  });
});

/* ─────────────────────────────────────────
   CARDÁPIO — DRAG TO SCROLL (sem setas, sem dots)
   Remove qualquer seta/dot injetado por versão anterior
   e adiciona scroll por arrastar suave
   ───────────────────────────────────────── */

// Remove setas e dots que possam ter sido injetados
document.querySelectorAll('.scroll-btn, .scroll-dots, .scroll-dot').forEach(el => el.remove());

// Desfaz o scroll-wrapper se existir (move os filhos de volta)
document.querySelectorAll('.scroll-wrapper').forEach(wrapper => {
  const row = wrapper.querySelector('.products-scroll');
  if (row) wrapper.parentNode.insertBefore(row, wrapper);
  wrapper.remove();
});

// Drag to scroll em cada linha de produtos
document.querySelectorAll('.products-scroll').forEach(row => {
  let isDragging = false;
  let startX     = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  row.addEventListener('mousedown', e => {
    isDragging       = true;
    hasDragged       = false;
    startX           = e.pageX - row.offsetLeft;
    scrollLeft       = row.scrollLeft;
    row.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const x    = e.pageX - row.offsetLeft;
    const walk = (x - startX) * 1.1;
    if (Math.abs(walk) > 4) hasDragged = true;
    row.scrollLeft = scrollLeft - walk;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging       = false;
    row.style.cursor = '';
  });

  // Bloqueia click em links após arrastar
  row.addEventListener('click', e => {
    if (hasDragged) e.preventDefault();
  }, true);
});

/* ─────────────────────────────────────────
   STAGGERED CARD ANIMATIONS
   Delay igual para todos os grupos: 40ms por card, máximo 160ms
   ───────────────────────────────────────── */
document.querySelectorAll('.product-card').forEach((card, i) => {
  card.style.transitionDelay = `${Math.min(i * 0.04, 0.16)}s`;
});
document.querySelectorAll('.diff-card').forEach((card, i) => {
  card.style.transitionDelay = `${Math.min(i * 0.04, 0.16)}s`;
});
document.querySelectorAll('.review-card').forEach((card, i) => {
  card.style.transitionDelay = `${Math.min(i * 0.04, 0.16)}s`;
});
