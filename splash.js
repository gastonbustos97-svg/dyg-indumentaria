/* ============================================
   DYGIndumentaria — Splash Screen Animation v2
   Logo real + Partículas lavanda
   ============================================ */

function initSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  const canvas = document.getElementById('splash-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Partículas en paleta rose gold / blush
  particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 0.4,
    alpha: Math.random() * 0.35 + 0.05,
    color: ['#C49A6C','#DEB98A','#E8A0A8','#A07848','#C97080'][Math.floor(Math.random()*5)],
  }));

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);

    // Líneas de conexión
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(196,154,108,${0.1 * (1 - dist/110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2,'0');
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    }

    animFrame = requestAnimationFrame(drawParticles);
  }

  drawParticles();

  // ── Loading Progress ──
  const fill = document.getElementById('splash-fill');
  const pct  = document.getElementById('splash-pct');
  let started = Date.now();
  const DURATION = 2600;

  function updateProgress() {
    const elapsed = Date.now() - started;
    const progress = Math.min(100, Math.round((elapsed / DURATION) * 100));

    if (fill) fill.style.width = progress + '%';
    if (pct)  pct.textContent = progress + '%';

    if (progress < 100) {
      requestAnimationFrame(updateProgress);
    } else {
      setTimeout(finishSplash, 400);
    }
  }

  requestAnimationFrame(updateProgress);

  function finishSplash() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', resize);
    splash.classList.add('splash-exit');
    const app = document.getElementById('app');
    if (app) app.classList.add('app-ready');
    setTimeout(() => splash.remove(), 900);
  }
}
