// Year
document.getElementById('yr').textContent = new Date().getFullYear();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
  });
});

// Lead form -> posts to your Cloudflare Worker API
const API_URL = 'https://ak-realestate-api.ranabullah01.workers.dev/api/leads';
const form = document.getElementById('leadForm');
const msg = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = 'Sending...';
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      msg.textContent = '✓ Thank you — we will contact you within 24 hours.';
      form.reset();
    } else {
      msg.textContent = 'Could not send. Please email hello@akwebservices.ae';
    }
  } catch {
    msg.textContent = 'Network error. Please try again.';
  }
});
