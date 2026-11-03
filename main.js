const toast = document.querySelector('.toast');
let toastTimer;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

document.querySelectorAll('.ca').forEach((el) => {
  el.querySelector('.copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(el.dataset.ca);
      showToast('CA copied. Go get her.');
    } catch {
      showToast('Copy failed, select it manually');
    }
  });
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('section:not(.hero)').forEach((s) => {
  s.classList.add('reveal');
  io.observe(s);
});
