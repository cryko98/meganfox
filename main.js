const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;

/* Toast + copy CA */
const toast = document.querySelector('.toast');
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.ca').forEach((el) => {
  const btn = el.querySelector('.copy');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.dataset.ca);
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1600);
      showToast('CA copied. Go get her.');
    } catch {
      showToast('Copy failed, select it manually');
    }
  });
});

/* Hero headline: split into animated characters */
let delay = 0.15;
document.querySelectorAll('.split .line').forEach((line) => {
  const target = line.querySelector('em') || line;
  const text = target.textContent;
  target.textContent = '';
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? ' ' : ch;
    span.style.animationDelay = `${delay}s`;
    delay += 0.045;
    target.appendChild(span);
  });
});
document.querySelectorAll('.hero .eyebrow, .hero .lede, .hero .ca, .hero .cta, .hero-art').forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.animationDelay = `${0.5 + i * 0.12}s`;
});

/* Lore: split paragraphs into words that light up on scroll */
const scrubWords = [];
document.querySelectorAll('.scrub').forEach((p) => {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = part;
          scrubWords.push(w);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else {
        walk(child);
      }
    });
  };
  walk(p);
});

/* Reveal on scroll */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('.count').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('section:not(.hero):not(.statement)').forEach((s) => {
  s.classList.add('reveal');
  io.observe(s);
});

function countUp(el) {
  const to = Number(el.dataset.to);
  if (reduceMotion) { el.textContent = to; return; }
  const start = performance.now();
  const step = (t) => {
    const p = Math.min((t - start) / 1400, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Scroll-driven effects */
const nav = document.querySelector('.nav');
const progress = document.querySelector('.progress');
const statementLines = document.querySelectorAll('.statement-line');
const statement = document.querySelector('.statement');
const wordmark = document.querySelector('.hero-wordmark');

function onScroll() {
  const y = scrollY;
  const vh = innerHeight;
  nav.classList.toggle('scrolled', y > 40);
  progress.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - vh || 1)})`;

  const lit = vh * 0.62;
  scrubWords.forEach((w) => w.classList.toggle('lit', w.getBoundingClientRect().top < lit));

  if (reduceMotion) return;
  if (wordmark) wordmark.style.transform = `translateX(calc(-50% + ${y * -0.25}px))`;
  const r = statement.getBoundingClientRect();
  if (r.bottom > 0 && r.top < vh) {
    const p = (vh - r.top) / (vh + r.height) - 0.5;
    statementLines.forEach((l, i) => {
      l.style.transform = `translateX(${p * (i % 2 ? -260 : 260)}px)`;
    });
  }
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* Pointer effects: spotlight, tilt, magnetic buttons */
if (finePointer && !reduceMotion) {
  const spot = document.querySelector('.spotlight');
  addEventListener('pointermove', (e) => {
    spot.style.left = `${e.clientX}px`;
    spot.style.top = `${e.clientY}px`;
  });

  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1000px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* Lightbox */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');
function closeLightbox() { lightbox.hidden = true; }
document.querySelectorAll('.gallery-grid figure').forEach((fig) => {
  const open = () => {
    const img = fig.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
  };
  fig.addEventListener('click', open);
  fig.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
});
lightbox.addEventListener('click', closeLightbox);
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

/* Hero embers */
const canvas = document.querySelector('.embers');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const dpr = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.offsetWidth;
    h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, w / 14));
    particles = Array.from({ length: n }, () => spawn(true));
  }
  function spawn(anywhere) {
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: Math.random() * 2.2 + 0.4,
      vy: Math.random() * 0.6 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.2,
      t: Math.random() * Math.PI * 2,
    };
  }
  let running = true;
  new IntersectionObserver(([e]) => { running = e.isIntersecting; if (running) requestAnimationFrame(tick); }).observe(canvas);

  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, i) => {
      p.t += 0.02;
      p.y -= p.vy;
      p.x += p.vx + Math.sin(p.t) * 0.3;
      if (p.y < -10) particles[i] = spawn(false);
      const flicker = p.a * (0.6 + Math.sin(p.t * 3) * 0.4);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      g.addColorStop(0, `rgba(255, 200, 110, ${flicker})`);
      g.addColorStop(1, 'rgba(226, 116, 43, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  addEventListener('resize', resize);
  resize();
}
