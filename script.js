/* ═══════════════════════════════════════════
   WOOKING · AI Builder — Interactions
   ═══════════════════════════════════════════ */

// ─── Neural Grid Canvas ───
(function initCanvas() {
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cols, rows;
  const spacing = 60;
  let dots = [];
  let mouse = { x: -999, y: -999 };
  let raf;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.ceil(w / spacing) + 1;
    rows = Math.ceil(h / spacing) + 1;
    dots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          x: c * spacing,
          y: r * spacing,
          ox: c * spacing,
          oy: r * spacing,
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Connection lines to mouse
    const range = 180;
    ctx.lineWidth = 0.5;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = mouse.x - d.ox;
      const dy = mouse.y - d.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Push dots away from mouse
      if (dist < range) {
        const force = (1 - dist / range) * 12;
        d.x = d.ox - (dx / dist) * force;
        d.y = d.oy - (dy / dist) * force;
      } else {
        d.x += (d.ox - d.x) * 0.08;
        d.y += (d.oy - d.y) * 0.08;
      }

      // Draw dot
      const alpha = dist < range ? 0.6 : 0.12;
      ctx.beginPath();
      ctx.arc(d.x, d.y, dist < range ? 2 : 1, 0, Math.PI * 2);
      ctx.fillStyle = dist < range
        ? `rgba(0, 229, 255, ${alpha})`
        : `rgba(120, 120, 160, ${alpha})`;
      ctx.fill();

      // Draw connections
      if (dist < range * 1.5) {
        // Check neighbor to the right
        if (i % cols < cols - 1) {
          const right = dots[i + 1];
          const rd = Math.sqrt((mouse.x - right.ox) ** 2 + (mouse.y - right.oy) ** 2);
          const lineAlpha = Math.max(0, 0.15 - (dist + rd) / (range * 5));
          if (lineAlpha > 0) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(right.x, right.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }
        // Check neighbor below
        if (i + cols < dots.length) {
          const below = dots[i + cols];
          const bd = Math.sqrt((mouse.x - below.ox) ** 2 + (mouse.y - below.oy) ** 2);
          const lineAlpha = Math.max(0, 0.15 - (dist + bd) / (range * 5));
          if (lineAlpha > 0) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(below.x, below.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); });
  document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  resize();
  draw();
})();

// ─── Scroll Reveal ───
(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
})();

// ─── Count-Up Stats ───
(function initCountUp() {
  const stats = document.querySelectorAll('.stat-num[data-count]');
  if (!stats.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1200;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((el) => observer.observe(el));
})();

// ─── Card Mouse Glow ───
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

// ─── Nav Scroll State ───
(function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.style.borderBottomColor =
        window.scrollY > 50 ? 'rgba(30, 30, 58, 0.8)' : 'rgba(30, 30, 58, 0.3)';
      ticking = false;
    });
  });
})();

// ─── Smooth anchor offset for fixed nav ───
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});
