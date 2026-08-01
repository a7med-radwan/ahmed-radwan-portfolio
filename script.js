/* ================================================================
   Ahmed Radwan Portfolio 2.0 — Premium Interactive Script
   ================================================================ */

'use strict';

/* ================================================================
   1. PRELOADER
   ================================================================ */
class Preloader {
  constructor() {
    this.el = document.getElementById('preloader');
    this.bar = document.getElementById('preloaderBar');
    this.status = document.getElementById('preloaderStatus');
    if (!this.el) return;

    this.steps = [
      'Initializing environment...',
      'Loading modules...',
      'Compiling styles...',
      'Building experience...',
      'Ready to launch! 🚀'
    ];
    this.run();
  }

  run() {
    let progress = 0;
    let stepIndex = 0;

    const tick = () => {
      progress += Math.random() * 18 + 7;
      if (progress > 100) progress = 100;
      this.bar.style.width = progress + '%';

      const threshold = ((stepIndex + 1) / this.steps.length) * 100;
      if (progress >= threshold && stepIndex < this.steps.length - 1) {
        stepIndex++;
        this.status.textContent = this.steps[stepIndex];
      }

      if (progress < 100) {
        setTimeout(tick, 100 + Math.random() * 80);
      } else {
        setTimeout(() => this.hide(), 300);
      }
    };

    setTimeout(tick, 200);
  }

  hide() {
    this.el.classList.add('preloader-hidden');
    setTimeout(() => {
      this.el.style.display = 'none';
      document.body.classList.add('loaded');
      // Trigger initial reveal animations
      triggerReveal();
    }, 700);
  }
}


/* ================================================================
   2. CUSTOM CURSOR
   ================================================================ */
class CustomCursor {
  constructor() {
    this.ring = document.getElementById('cursor-ring');
    this.dot = document.getElementById('cursor-dot');
    if (!this.ring || window.matchMedia('(pointer: coarse)').matches) return;

    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.ringPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.visible = false;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.pos.x = e.clientX;
      this.pos.y = e.clientY;
      if (!this.visible) {
        this.ring.style.opacity = '1';
        this.dot.style.opacity = '1';
        this.visible = true;
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.ring.style.opacity = '0';
      this.dot.style.opacity = '0';
      this.visible = false;
    });

    // Hover effect
    const hoverTargets = 'a, button, .skill-card, .project-card, .color-dot, .contact-item, .cert-verify-btn, .footer-links a, #scroll-top';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.ring.classList.add('cursor-hover');
        this.dot.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        this.ring.classList.remove('cursor-hover');
        this.dot.classList.remove('cursor-hover');
      });
    });
  }

  render() {
    // Smooth lag for ring
    this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.1;
    this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.1;

    this.ring.style.transform = `translate(${this.ringPos.x - 20}px, ${this.ringPos.y - 20}px)`;
    this.dot.style.transform = `translate(${this.pos.x - 4}px,  ${this.pos.y - 4}px)`;

    requestAnimationFrame(() => this.render());
  }
}


/* ================================================================
   3. PARTICLE CANVAS (Hero constellation)
   ================================================================ */
class ParticleCanvas {
  constructor() {
    this.canvas = document.getElementById('heroCanvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.parts = [];
    this.mouse = { x: -9999, y: -9999 };
    this.hue = this.getHue();
    this.raf = null;

    this.resize();
    this.create();
    this.draw();
    this.bindEvents();
  }

  getHue() {
    return parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--p-h').trim()) || 274;
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth || window.innerWidth;
    this.canvas.height = this.canvas.offsetHeight || window.innerHeight;
  }

  create() {
    this.parts = [];
    const count = Math.min(130, Math.floor(this.canvas.width / 9));
    for (let i = 0; i < count; i++) {
      const speed = Math.random() * 0.5 + 0.1;
      const angle = Math.random() * Math.PI * 2;
      this.parts.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.55 + 0.2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.create();
    }, { passive: true });

    this.canvas.addEventListener('mousemove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    }, { passive: true });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });

    // Re-read hue when theme changes
    document.addEventListener('themeColorChanged', () => {
      this.hue = this.getHue();
    });
  }

  draw() {
    const { ctx, canvas, parts, mouse } = this;
    const h = this.hue;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    parts.forEach(p => {
      // Mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        const force = (110 - dist) / 110;
        p.vx += (dx / dist) * force * 0.6;
        p.vy += (dy / dist) * force * 0.6;
      }

      // Damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Minimum drift
      const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (spd < 0.08) {
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.08;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${h}, 80%, 72%, ${p.alpha})`;
      ctx.fill();
    });

    // Connections
    const maxDist = 100;
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const p1 = parts[i], p2 = parts[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.28;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${h}, 80%, 72%, ${a})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    this.raf = requestAnimationFrame(() => this.draw());
  }
}


/* ================================================================
   4. SCROLL PROGRESS BAR
   ================================================================ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
  }, { passive: true });
}


/* ================================================================
   5. REVEAL ON SCROLL
   ================================================================ */
let revealObserver;

function triggerReveal() {
  const items = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(item => revealObserver.observe(item));
}


/* ================================================================
   6. NAVBAR — active link + shrink on scroll
   ================================================================ */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    // Shrink / glow on scroll
    if (window.scrollY > 60) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.4)';
      navbar.style.padding = '0.5rem 0';
    } else {
      navbar.style.boxShadow = '';
      navbar.style.padding = '';
    }

    // Active link tracking
    let current = '';
    sections.forEach(sec => {
      const offset = sec.offsetTop - 100;
      if (window.scrollY >= offset) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}


/* ================================================================
   7. TYPING EFFECT
   ================================================================ */
function initTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;

  const phrases = [
    'Laravel & PHP Specialist',
    'RESTful API Architect',
    'AI Integration Engineer',
    'Backend Problem Solver',
    'Clean Code Practitioner'
  ];

  let pIndex = 0, cIndex = 0, deleting = false;

  const TYPE_SPEED = 65;
  const DELETE_SPEED = 30;
  const PAUSE_AFTER = 2000;
  const PAUSE_BEFORE = 400;

  const type = () => {
    const phrase = phrases[pIndex];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++cIndex);
      if (cIndex === phrase.length) {
        deleting = true;
        return setTimeout(type, PAUSE_AFTER);
      }
      setTimeout(type, TYPE_SPEED);
    } else {
      el.textContent = phrase.slice(0, --cIndex);
      if (cIndex === 0) {
        deleting = false;
        pIndex = (pIndex + 1) % phrases.length;
        return setTimeout(type, PAUSE_BEFORE);
      }
      setTimeout(type, DELETE_SPEED);
    }
  };

  setTimeout(type, 1200);
}


/* ================================================================
   8. STATS COUNTER
   ================================================================ */
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.getAttribute('data-target');
      const suffix = el.getAttribute('data-suffix') || '';
      let current = 0;
      const step = target / 55;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current) + suffix;
        }
      }, 28);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  stats.forEach(s => observer.observe(s));
}


/* ================================================================
   9. COLOR THEME SWITCHER
   ================================================================ */
function initColorSwitcher() {
  const dots = document.querySelectorAll('.color-dot');
  const html = document.documentElement;
  const stored = localStorage.getItem('portfolio-theme-color') || 'amethyst';

  html.setAttribute('data-theme-color', stored);
  dots.forEach(d => d.classList.toggle('active', d.getAttribute('data-color') === stored));

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const color = dot.getAttribute('data-color');
      html.classList.add('color-transitioning');
      html.setAttribute('data-theme-color', color);
      localStorage.setItem('portfolio-theme-color', color);
      dots.forEach(d => d.classList.toggle('active', d === dot));
      // Notify particle canvas of hue change
      document.dispatchEvent(new Event('themeColorChanged'));
      setTimeout(() => html.classList.remove('color-transitioning'), 700);
    });
  });
}


/* ================================================================
   10. DARK / LIGHT MODE TOGGLE
   ================================================================ */
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!btn) return;

  const stored = localStorage.getItem('portfolio-theme') || 'dark';
  if (stored === 'light') {
    document.body.classList.add('light-mode');
    icon.className = 'fa-solid fa-sun';
  }

  btn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  });
}


/* ================================================================
   11. PROJECTS CAROUSEL
   ================================================================ */
function initProjectsCarousel() {
  const track = document.getElementById('projectsTrack');
  const container = document.getElementById('projectsTrackContainer');
  const btnPrev = document.getElementById('projPrev');
  const btnNext = document.getElementById('projNext');
  const pagination = document.getElementById('projPagination');
  const current = document.getElementById('projCurrent');
  const total = document.getElementById('projTotal');
  if (!track) return;

  const slides = track.querySelectorAll('.proj-slide');
  let slidesPerView = getSlidesPerView();
  let pages = Math.ceil(slides.length / slidesPerView);
  let page = 0;

  function getSlidesPerView() {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 992) return 2;
    return 3;
  }

  function getSlideWidth() {
    const w = container.clientWidth;
    const gap = 24;
    return (w - gap * (slidesPerView - 1)) / slidesPerView;
  }

  function buildDots() {
    if (!pagination) return;
    pagination.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 'proj-dot' + (i === page ? ' active' : '');
      dot.setAttribute('aria-label', `Page ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      pagination.appendChild(dot);
    }
    if (total) total.textContent = pages;
  }

  function goTo(p, dir = 'left') {
    if (track.classList.contains('is-animating')) return;
    track.classList.add('is-animating');
    track.classList.add(`slide-${dir}-exit`);

    setTimeout(() => {
      page = p;
      const sw = getSlideWidth();
      const offset = page * slidesPerView * (sw + 24);
      track.style.transform = `translateX(-${offset}px)`;
      track.classList.remove('slide-left-exit', 'slide-right-exit');
      updateUI();
    }, 280);

    setTimeout(() => track.classList.remove('is-animating'), 700);
  }

  function updateUI() {
    const dots = pagination?.querySelectorAll('.proj-dot');
    dots?.forEach((d, i) => d.classList.toggle('active', i === page));
    if (current) current.textContent = page + 1;
    if (btnPrev) btnPrev.disabled = page === 0;
    if (btnNext) btnNext.disabled = page === pages - 1;
  }

  function onResize() {
    const spv = getSlidesPerView();
    if (spv !== slidesPerView) {
      slidesPerView = spv;
      pages = Math.ceil(slides.length / slidesPerView);
      page = Math.min(page, pages - 1);
      buildDots();
    }
    const sw = getSlideWidth();
    slides.forEach(s => {
      s.style.flexBasis = sw + 'px';
      s.style.minWidth = sw + 'px';
    });
    const offset = page * slidesPerView * (sw + 24);
    track.style.transition = 'none';
    track.style.transform = `translateX(-${offset}px)`;
    requestAnimationFrame(() => { track.style.transition = ''; });
    updateUI();
  }

  btnPrev?.addEventListener('click', () => { if (page > 0) goTo(page - 1, 'right'); });
  btnNext?.addEventListener('click', () => { if (page < pages - 1) goTo(page + 1, 'left'); });

  // Touch / swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 50 && page < pages - 1) goTo(page + 1, 'left');
    if (diff < -50 && page > 0) goTo(page - 1, 'right');
  });

  window.addEventListener('resize', onResize, { passive: true });
  buildDots();
  onResize();
  updateUI();
}


/* ================================================================
   12. CERTIFICATIONS CAROUSEL
   ================================================================ */
function initCertsCarousel() {
  const pages = document.querySelectorAll('.cert-page');
  const btnPrev = document.getElementById('certPrev');
  const btnNext = document.getElementById('certNext');
  const dots = document.querySelectorAll('#certPagination .proj-dot');
  const current = document.getElementById('certCurrent');
  let cur = 0;

  function goTo(n) {
    pages[cur].classList.remove('active');
    dots[cur]?.classList.remove('active');
    cur = n;
    pages[cur].classList.add('active');
    dots[cur]?.classList.add('active');
    if (current) current.textContent = cur + 1;
    if (btnPrev) btnPrev.classList.toggle('cert-disabled', cur === 0);
    if (btnNext) btnNext.classList.toggle('cert-disabled', cur === pages.length - 1);
  }

  btnPrev?.addEventListener('click', () => { if (cur > 0) goTo(cur - 1); });
  btnNext?.addEventListener('click', () => { if (cur < pages.length - 1) goTo(cur + 1); });
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
}


/* ================================================================
   13. EXPERIENCE TABS
   ================================================================ */
function initExpTabs() {
  const buttons = document.querySelectorAll('.exp-tab-btn');
  const contents = document.querySelectorAll('.exp-tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      buttons.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`)?.classList.add('active');
    });
  });
}


/* ================================================================
   14. SCROLL-TO-TOP BUTTON
   ================================================================ */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* ================================================================
   15. 3D TILT EFFECT ON PROJECT CARDS
   ================================================================ */
function initTiltCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -7;
      const rotY = ((x - cx) / cx) * 7;
      const shadow = `${-rotY * 2}px ${rotX * 2}px 40px rgba(0,0,0,0.3), 0 0 25px var(--neon-purple-dim)`;

      card.style.transition = 'box-shadow 0.1s ease';
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      card.style.boxShadow = shadow;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.55s ease, box-shadow 0.55s ease';
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.boxShadow = '';
    });
  });
}


/* ================================================================
   16. MAGNETIC BUTTONS
   ================================================================ */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;
      btn.style.transition = 'transform 0.1s ease';
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    });
  });
}


/* ================================================================
   17. SKILL CARDS — STAGGERED ENTRANCE
   ================================================================ */
function initSkillAnimations() {
  const categories = document.querySelectorAll('.skill-category');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const cards = entry.target.querySelectorAll('.skill-card');
      cards.forEach((card, i) => {
        setTimeout(() => card.classList.add('skill-animate'), i * 60);
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  categories.forEach(cat => obs.observe(cat));
}


/* ================================================================
   18. AURORA BLOBS — Update hue on theme change
   ================================================================ */
function initAuroraBlobs() {
  document.addEventListener('themeColorChanged', () => {
    // Blobs use CSS variables, so they update automatically
  });
}


/* ================================================================
   INIT — DOMContentLoaded
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Start preloader (it will call triggerReveal on completion)
  new Preloader();

  // Core systems
  new CustomCursor();
  new ParticleCanvas();

  initScrollProgress();
  initNavbar();
  initScrollTop();

  // Content
  initTyping();
  initStatsCounter();
  initColorSwitcher();
  initThemeToggle();
  initCertsCarousel();
  initExpTabs();

  // Visual effects
  initTiltCards();
  initMagneticButtons();
  initSkillAnimations();
  initAuroraBlobs();

  // Next-Gen Interactive Sections
  new SkillGlobe();
  initImmersiveProjects();
});


/* ================================================================
   19. 3D INTERACTIVE SKILL GLOBE
   ================================================================ */
class SkillGlobe {
  constructor() {
    this.container = document.getElementById('skillTagCloud');
    this.bgCanvas  = document.getElementById('skillGloBg');
    if (!this.container) return;

    // --- Skill data: label + Font Awesome classes + per-skill color ---
    this.SKILLS = [
      // Core Stack — uses theme color
      { label: 'Laravel',    icon: 'fa-brands fa-laravel',        cat: 0 },
      { label: 'PHP',        icon: 'fa-brands fa-php',            cat: 0 },
      { label: 'REST APIs',  icon: 'fa-solid fa-network-wired',   cat: 0 },
      { label: 'JavaScript', icon: 'fa-brands fa-js',             cat: 0 },
      { label: 'Java',       icon: 'fa-brands fa-java',           cat: 0 },
      { label: 'MySQL',      icon: 'fa-solid fa-database',        cat: 0 },
      // Data & Backend
      { label: 'Node.js',    icon: 'fa-brands fa-node-js',        cat: 1 },
      { label: 'MongoDB',    icon: 'fa-solid fa-leaf',            cat: 1 },
      { label: 'Git/GitHub', icon: 'fa-brands fa-github',         cat: 1 },
      { label: 'MVC',        icon: 'fa-solid fa-sitemap',         cat: 1 },
      { label: 'SQLite',     icon: 'fa-solid fa-database',        cat: 1 },
      { label: 'Bootstrap',  icon: 'fa-brands fa-bootstrap',      cat: 1 },
      { label: 'Express.js', icon: 'fa-brands fa-node-js',        cat: 1 },
      // AI & Tools
      { label: 'AI APIs',    icon: 'fa-solid fa-robot',           cat: 2 },
      { label: 'PHPUnit',    icon: 'fa-solid fa-vial',            cat: 2 },
      { label: 'Pest PHP',   icon: 'fa-solid fa-bug-slash',       cat: 2 },
      { label: 'Postman',    icon: 'fa-solid fa-paper-plane',     cat: 2 },
      { label: 'Sanctum',    icon: 'fa-solid fa-shield-halved',   cat: 2 },
      { label: 'CI/CD',      icon: 'fa-solid fa-infinity',        cat: 2 },
      { label: 'Docker',     icon: 'fa-solid fa-cube',            cat: 2 },
      { label: 'CSS3',       icon: 'fa-brands fa-css3-alt',       cat: 2 },
    ];

    // Rotation state
    this.rotX    = 0.4;   // tilt the globe slightly towards viewer
    this.rotY    = 0;
    this.velX    = 0;
    this.velY    = 0.0025; // auto-rotation speed
    this.baseVelY = 0.0025;

    // Drag state
    this.isDragging  = false;
    this.lastMouseX  = 0;
    this.lastMouseY  = 0;
    this.tags        = [];
    this.hue         = this.getHue();
    this.isLightMode = document.body.classList.contains('light-mode');

    this.init();
  }

  getHue() {
    return parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--p-h').trim()
    ) || 274;
  }

  // Fibonacci sphere — uniform point distribution
  spherePoints(n) {
    const golden = (1 + Math.sqrt(5)) / 2;
    return Array.from({ length: n }, (_, i) => {
      const theta = Math.acos(1 - 2 * (i + 0.5) / n);
      const phi   = 2 * Math.PI * i / golden;
      return {
        nx: Math.sin(theta) * Math.cos(phi),
        ny: Math.sin(theta) * Math.sin(phi),
        nz: Math.cos(theta),
      };
    });
  }

  buildTags() {
    this.container.innerHTML = '';
    this.tags = [];
    const pts = this.spherePoints(this.SKILLS.length);

    this.SKILLS.forEach((skill, i) => {
      const el = document.createElement('div');
      el.className = 'skill-tag';

      // Category-based icon color (uses CSS custom props via inline hsl)
      const catHueOffset = [0, 40, 80][skill.cat] || 0;
      const iconColor = `hsl(calc(var(--p-h) + ${catHueOffset}), 85%, 65%)`;

      el.innerHTML = `<i class="${skill.icon}" style="color:${iconColor}"></i><span>${skill.label}</span>`;
      this.container.appendChild(el);
      this.tags.push({ el, ...pts[i] });
    });
  }

  rotatePoint(nx, ny, nz) {
    // Around X
    const cX = Math.cos(this.rotX), sX = Math.sin(this.rotX);
    const y1 = ny * cX - nz * sX;
    const z1 = ny * sX + nz * cX;
    // Around Y
    const cY = Math.cos(this.rotY), sY = Math.sin(this.rotY);
    const x2 = nx * cY + z1 * sY;
    const z2 = -nx * sY + z1 * cY;
    return { rx: x2, ry: y1, rz: z2 };
  }

  updateTags() {
    const W = this.container.offsetWidth;
    const H = this.container.offsetHeight;
    const R = Math.min(W, H) * 0.44;   // sphere radius
    const persp = 900;

    // Sort by Z for correct paint order (back → front)
    const sorted = this.tags.map(t => {
      const { rx, ry, rz } = this.rotatePoint(t.nx, t.ny, t.nz);
      const scale = persp / (persp + rz * R);
      const x = W / 2 + rx * R * scale;
      const y = H / 2 + ry * R * scale;
      const depth = (rz + 1) / 2;  // 0 = back, 1 = front
      return { t, x, y, depth, scale };
    });
    sorted.sort((a, b) => a.depth - b.depth);

    sorted.forEach(({ t, x, y, depth }) => {
      const opacity   = 0.12 + depth * 0.88;
      const tagScale  = 0.55 + depth * 0.75;  // 0.55x back → 1.3x front
      const tx = x - W / 2;
      const ty = y - H / 2;
      t.el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${tagScale.toFixed(3)})`;
      t.el.style.opacity   = opacity.toFixed(3);
      t.el.style.zIndex    = Math.round(depth * 99);
    });
  }

  drawBg() {
    const c = this.bgCanvas;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const cx = W / 2, cy = H / 2;
    const R  = Math.min(
      this.container.offsetWidth,
      this.container.offsetHeight
    ) * 0.44;

    ctx.clearRect(0, 0, W, H);

    const h = this.hue;
    const isLight = this.isLightMode;

    // Outer ambient halo
    const halo = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.6);
    halo.addColorStop(0,   `hsla(${h},80%,60%, ${isLight ? 0.06 : 0.12})`);
    halo.addColorStop(0.5, `hsla(${h},80%,50%, ${isLight ? 0.03 : 0.06})`);
    halo.addColorStop(1,   `hsla(${h},80%,40%, 0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();

    // Inner sphere tint
    const inner = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
    inner.addColorStop(0,   `hsla(${h},70%,70%, ${isLight ? 0.08 : 0.14})`);
    inner.addColorStop(0.6, `hsla(${h},70%,55%, ${isLight ? 0.03 : 0.06})`);
    inner.addColorStop(1,   `hsla(${h},70%,40%, 0)`);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = inner;
    ctx.fill();

    // Equator line (subtle)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, 0.22);  // flatten circle into ellipse
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${h},70%,65%, ${isLight ? 0.12 : 0.18})`;
    ctx.lineWidth = isLight ? 0.8 : 1;
    ctx.setLineDash([4, 8]);
    ctx.stroke();
    ctx.restore();

    // Meridian line (vertical)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.18, 1);
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${h},70%,65%, ${isLight ? 0.10 : 0.14})`;
    ctx.lineWidth = isLight ? 0.8 : 1;
    ctx.setLineDash([4, 10]);
    ctx.stroke();
    ctx.restore();

    ctx.setLineDash([]);
  }

  resizeCanvas() {
    const wrapper = document.getElementById('skillsGlobeWrapper');
    if (!wrapper || !this.bgCanvas) return;
    this.bgCanvas.width  = wrapper.offsetWidth;
    this.bgCanvas.height = wrapper.offsetHeight;
  }

  animate() {
    if (!this.isDragging) {
      // Decay drag inertia, blend back to base auto-rotation
      this.velX *= 0.94;
      this.velY  = this.velY * 0.96 + this.baseVelY * 0.04;
    }

    this.rotY += this.velY;
    this.rotX += this.velX;

    // Soft clamp on X tilt (prevent flipping upside-down)
    const MAX_TILT = Math.PI / 2.2;
    if (this.rotX >  MAX_TILT) { this.rotX =  MAX_TILT; this.velX *= -0.3; }
    if (this.rotX < -MAX_TILT) { this.rotX = -MAX_TILT; this.velX *= -0.3; }

    this.updateTags();
    this.drawBg();

    requestAnimationFrame(() => this.animate());
  }

  bindEvents() {
    const el = this.container;

    /* ---- Mouse ---- */
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.velX = 0;
      this.velY = 0;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.velY = dx * 0.006;
      this.velX = dy * 0.006;
      this.rotY += this.velY;
      this.rotX += this.velX;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      // if almost no velocity after drag, restore auto-rotation
      if (Math.abs(this.velY) < 0.0005) this.velY = this.baseVelY;
    });

    /* ---- Touch ---- */
    el.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
      this.velX = 0;
      this.velY = 0;
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.velY = dx * 0.006;
      this.velX = dy * 0.006;
      this.rotY += this.velY;
      this.rotX += this.velX;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    el.addEventListener('touchend', () => {
      this.isDragging = false;
      if (Math.abs(this.velY) < 0.0005) this.velY = this.baseVelY;
    });

    /* ---- Resize ---- */
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });

    /* ---- Theme changes ---- */
    document.addEventListener('themeColorChanged', () => {
      this.hue = this.getHue();
    });

    // Watch light/dark toggle
    const observer = new MutationObserver(() => {
      this.isLightMode = document.body.classList.contains('light-mode');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  init() {
    this.buildTags();
    this.bindEvents();
    this.resizeCanvas();
    this.animate();
  }
}



/* ================================================================
   20. IMMERSIVE PROJECTS SHOWCASE CONTROLLER
   ================================================================ */
function initImmersiveProjects() {
  const wrapper = document.getElementById('immWrapper');
  if (!wrapper) return;

  const slides = wrapper.querySelectorAll('.imm-slide');
  const dotsContainer = document.getElementById('immDots');
  const curEl = document.getElementById('immCur');
  const totEl = document.getElementById('immTot');
  const prevBtn = document.getElementById('immPrev');
  const nextBtn = document.getElementById('immNext');

  if (!slides.length) return;

  let currentIndex = 0;
  const total = slides.length;

  if (totEl) totEl.textContent = String(total).padStart(2, '0');

  // Generate Navigation Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `imm-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to project ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      dotsContainer.appendChild(dot);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    currentIndex = index;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.imm-dot') : [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    if (curEl) curEl.textContent = String(currentIndex + 1).padStart(2, '0');
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
    if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
  });
}

