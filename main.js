const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Toast */
const toast = document.querySelector('.toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1900);
}

/* Copy NDC (contract address) */
document.querySelectorAll('.ndc').forEach((el) => {
  const btn = el.querySelector('.ndc-copy');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.dataset.ca);
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
      showToast('Prescription copied ✓');
    } catch {
      showToast('Copy failed, select it by hand');
    }
  });
});

/* Today's date on the Rx pad, written like a doctor would */
const rxDate = document.getElementById('rx-date');
if (rxDate) {
  const d = new Date();
  rxDate.textContent = `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}`;
}

/* Reveal sections; .in also triggers the bars, signature and stamp */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll('main section:not(.hero)').forEach((s) => {
  s.classList.add('reveal');
  io.observe(s);
});

/* The carton: follows the pointer, can be dragged/spun */
const stage = document.querySelector('.carton-stage');
const carton = document.getElementById('carton');
if (stage && carton && !reduceMotion) {
  let ry = -32, rx = -8, dragging = false, lastX = 0, lastY = 0, vel = 0, raf;

  const apply = () => {
    carton.style.setProperty('--ry', `${ry}deg`);
    carton.style.setProperty('--rx', `${rx}deg`);
  };

  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    vel = 0;
    cancelAnimationFrame(raf);
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (dragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      ry += dx * 0.5;
      rx = Math.max(-35, Math.min(35, rx - dy * 0.3));
      vel = dx * 0.5;
      lastX = e.clientX;
      lastY = e.clientY;
      apply();
    } else if (e.pointerType === 'mouse') {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry = -32 + px * 30;
      rx = -8 - py * 16;
      apply();
    }
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    const coast = () => {
      vel *= 0.94;
      ry += vel;
      apply();
      if (Math.abs(vel) > 0.05) raf = requestAnimationFrame(coast);
    };
    raf = requestAnimationFrame(coast);
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
}

/* Blister pack: press, pop, view */
const viewer = document.querySelector('.viewer');
const viewerImg = viewer.querySelector('img');
const viewerCap = viewer.querySelector('figcaption');
const closeViewer = () => { viewer.hidden = true; };

document.querySelectorAll('.blister').forEach((b) => {
  b.addEventListener('click', () => {
    b.classList.add('pressing');
    setTimeout(() => {
      b.classList.remove('pressing');
      b.classList.add('popped');
      viewerImg.src = b.dataset.src;
      viewerImg.alt = b.querySelector('img').alt;
      viewerCap.textContent = b.dataset.cap;
      viewer.hidden = false;
      const left = document.querySelectorAll('.blister:not(.popped)').length;
      if (left === 0) showToast('Pack finished. Refills: ∞');
    }, reduceMotion ? 0 : 160);
  });
});
viewer.addEventListener('click', closeViewer);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeViewer(); });
