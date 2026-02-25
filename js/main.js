/* =====================================================
   main.js — Portfolio Interactivity + AI Chatbot
===================================================== */

/* ── 1. AOS INIT ── */
AOS.init({ once: true, offset: 60, duration: 750 });

/* ── 2. THEME TOGGLE ── */
const html        = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

function applyTheme(isDark) {
  if (isDark) {
    html.classList.add('dark');
    html.classList.remove('light');
    themeIcon.className = 'fas fa-sun';
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
    themeIcon.className = 'fas fa-moon';
  }
}

// Load saved preference (default: dark)
const savedTheme = localStorage.getItem('theme');
applyTheme(savedTheme !== 'light');

themeToggle.addEventListener('click', () => {
  const isDark = html.classList.contains('dark');
  applyTheme(!isDark);
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

/* ── 3. HAMBURGER MENU ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── 4. ACTIVE NAV LINK ON SCROLL ── */
const sections  = document.querySelectorAll('section[id]');
const allLinks  = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        allLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);

sections.forEach(s => navObserver.observe(s));

/* ── 5. NAVBAR SCROLL SHADOW ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 2px 20px rgba(0,0,0,0.3)'
    : 'none';
}, { passive: true });

/* ── 6. TYPED TEXT EFFECT ── */
const phrases   = ['Junior Developer', '.NET & PHP Developer', 'Problem Solver', 'Web Developer'];
const typedEl   = document.getElementById('typedText');
let phraseIndex = 0;
let charIndex   = 0;
let isDeleting  = false;
let typeDelay   = 120;

function typeEffect() {
  const current = phrases[phraseIndex];

  if (isDeleting) {
    typedEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    typeDelay = 60;
  } else {
    typedEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    typeDelay = 120;
  }

  if (!isDeleting && charIndex === current.length) {
    isDeleting = true;
    typeDelay  = 1800; // pause before deleting
  } else if (isDeleting && charIndex === 0) {
    isDeleting  = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeDelay   = 400;
  }

  setTimeout(typeEffect, typeDelay);
}

setTimeout(typeEffect, 800);

/* ── 7. SCROLL-TO-TOP BUTTON ── */
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className     = 'scroll-top-btn';
scrollTopBtn.innerHTML     = '<i class="fas fa-arrow-up"></i>';
scrollTopBtn.setAttribute('aria-label', 'Back to top');
document.body.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 8. CHATBOT ── */
const chatFab      = document.getElementById('chatFab');
const chatFabIcon  = document.getElementById('chatFabIcon');
const chatWindow   = document.getElementById('chatWindow');
const chatClose    = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');

let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  chatWindow.classList.toggle('open', chatOpen);
  chatFab.classList.toggle('open', chatOpen);
  chatFabIcon.className = chatOpen ? 'fas fa-times' : 'fas fa-comments';
  if (chatOpen) {
    setTimeout(() => chatInput.focus(), 300);
  }
}

chatFab.addEventListener('click', toggleChat);
chatClose.addEventListener('click', toggleChat);

// Close chat on outside click
document.addEventListener('click', (e) => {
  if (chatOpen && !chatWindow.contains(e.target) && !chatFab.contains(e.target)) {
    toggleChat();
  }
});

// Send on Enter key
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSend.addEventListener('click', sendMessage);

function appendMessage(text, sender) {
  const msg    = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  const bubble  = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = text;
  msg.appendChild(bubble);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

function showTypingIndicator() {
  const msg    = document.createElement('div');
  msg.className = 'chat-msg bot chat-typing';
  msg.id        = 'typingIndicator';
  msg.innerHTML = `
    <div class="chat-bubble">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  chatInput.value    = '';
  chatSend.disabled  = true;
  chatInput.disabled = true;

  showTypingIndicator();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();
    removeTypingIndicator();

    if (res.ok && data.reply) {
      appendMessage(data.reply, 'bot');
    } else {
      appendMessage(
        data.error || 'Sorry, something went wrong. Please try again.',
        'bot'
      );
    }
  } catch (err) {
    removeTypingIndicator();
    appendMessage(
      'I seem to be offline right now. Please reach out at tacandongrey@gmail.com!',
      'bot'
    );
  } finally {
    chatSend.disabled  = false;
    chatInput.disabled = false;
    chatInput.focus();
  }
}

/* ── 9. IMAGE CAROUSEL ── */
function initCarousel(carouselId) {
  const carousel = document.getElementById(carouselId);
  if (!carousel) return;

  const imgs = carousel.querySelectorAll('.carousel-img');
  const dots = document.querySelectorAll(`.dot[data-carousel="${carouselId}"]`);
  let current = 0;
  let timer;

  function goTo(index) {
    imgs[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (index + imgs.length) % imgs.length;
    imgs[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function autoPlay() {
    timer = setInterval(() => goTo(current + 1), 3000);
  }

  function pause() { clearInterval(timer); }

  // Dot click
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      pause();
      goTo(parseInt(dot.dataset.index));
      autoPlay();
    });
  });

  // Pause on hover
  carousel.addEventListener('mouseenter', pause);
  carousel.addEventListener('mouseleave', autoPlay);

  autoPlay();
}

initCarousel('hlmCarousel');

/* ── 10. LIGHTBOX + GALLERY ── */

/* Gallery data — one entry per project */
const galleries = {
  hlm: [
    { src: 'images/HLM/login.webp',          caption: 'HLM Pharma — Login' },
    { src: 'images/HLM/Dashboard.webp',       caption: 'HLM Pharma — Dashboard' },
    { src: 'images/HLM/Asset.webp',           caption: 'HLM Pharma — Asset Management' },
    { src: 'images/HLM/assetdetails.webp',    caption: 'HLM Pharma — Asset Details' },
    { src: 'images/HLM/AssetRegister.webp',   caption: 'HLM Pharma — Asset Register' },
    { src: 'images/HLM/assignments.webp',     caption: 'HLM Pharma — Assignments' },
    { src: 'images/HLM/HLM_employees.webp',   caption: 'HLM Pharma — Employees' },
    { src: 'images/HLM/accessories.webp',     caption: 'HLM Pharma — Accessories' },
    { src: 'images/HLM/Supplies.webp',        caption: 'HLM Pharma — Supplies' },
    { src: 'images/HLM/SupplyRequest.webp',   caption: 'HLM Pharma — Supply Request' },
    { src: 'images/HLM/Disposed.webp',        caption: 'HLM Pharma — Disposed Assets' },
  ],
  lagFarms: [
    { src: 'images/LagonglongFARMS/login.webp',          caption: 'Lagonglong FARMS — Login' },
    { src: 'images/LagonglongFARMS/LagFARMS.webp',        caption: 'Lagonglong FARMS — Dashboard' },
    { src: 'images/LagonglongFARMS/Farmers.webp',         caption: 'Lagonglong FARMS — Farmer Registry' },
    { src: 'images/LagonglongFARMS/registerFarmer.webp',  caption: 'Lagonglong FARMS — Register Farmer' },
    { src: 'images/LagonglongFARMS/RSBSA.webp',           caption: 'Lagonglong FARMS — RSBSA' },
    { src: 'images/LagonglongFARMS/NCFRS.webp',           caption: 'Lagonglong FARMS — NCFRS' },
    { src: 'images/LagonglongFARMS/FISHR.webp',           caption: 'Lagonglong FARMS — FISHR' },
    { src: 'images/LagonglongFARMS/Boats.webp',           caption: 'Lagonglong FARMS — Boats' },
    { src: 'images/LagonglongFARMS/Inventory.webp',       caption: 'Lagonglong FARMS — Inventory' },
    { src: 'images/LagonglongFARMS/Distributions.webp',   caption: 'Lagonglong FARMS — Input Distributions' },
    { src: 'images/LagonglongFARMS/Activities.webp',      caption: 'Lagonglong FARMS — Activities' },
    { src: 'images/LagonglongFARMS/geotag.webp',          caption: 'Lagonglong FARMS — Geo-tagging' },
    { src: 'images/LagonglongFARMS/analytics.webp',       caption: 'Lagonglong FARMS — Analytics' },
    { src: 'images/LagonglongFARMS/Report.webp',          caption: 'Lagonglong FARMS — Reports' },
    { src: 'images/LagonglongFARMS/samplereport.webp',    caption: 'Lagonglong FARMS — Sample Report' },
  ],
  agriLaravel: [
    { src: 'images/LagonglongFARMS/login.webp',          caption: 'Agriculture System (Laravel) — Login' },
    { src: 'images/LagonglongFARMS/LagFARMS.webp',        caption: 'Agriculture System (Laravel) — Dashboard' },
    { src: 'images/LagonglongFARMS/Farmers.webp',         caption: 'Agriculture System (Laravel) — Farmer Registry' },
    { src: 'images/LagonglongFARMS/registerFarmer.webp',  caption: 'Agriculture System (Laravel) — Register Farmer' },
    { src: 'images/LagonglongFARMS/RSBSA.webp',           caption: 'Agriculture System (Laravel) — RSBSA' },
    { src: 'images/LagonglongFARMS/NCFRS.webp',           caption: 'Agriculture System (Laravel) — NCFRS' },
    { src: 'images/LagonglongFARMS/FISHR.webp',           caption: 'Agriculture System (Laravel) — FISHR' },
    { src: 'images/LagonglongFARMS/Boats.webp',           caption: 'Agriculture System (Laravel) — Boats' },
    { src: 'images/LagonglongFARMS/Inventory.webp',       caption: 'Agriculture System (Laravel) — Inventory' },
    { src: 'images/LagonglongFARMS/Distributions.webp',   caption: 'Agriculture System (Laravel) — Input Distributions' },
    { src: 'images/LagonglongFARMS/Activities.webp',      caption: 'Agriculture System (Laravel) — Activities' },
    { src: 'images/LagonglongFARMS/geotag.webp',          caption: 'Agriculture System (Laravel) — Geo-tagging' },
    { src: 'images/LagonglongFARMS/analytics.webp',       caption: 'Agriculture System (Laravel) — Analytics' },
    { src: 'images/LagonglongFARMS/Report.webp',          caption: 'Agriculture System (Laravel) — Reports' },
    { src: 'images/LagonglongFARMS/samplereport.webp',    caption: 'Agriculture System (Laravel) — Sample Report' },
  ],
};

const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

let currentGallery    = [];
let currentGalleryIdx = 0;

/* Open gallery by key, starting at a given index */
function openGallery(key, startIndex) {
  currentGallery    = galleries[key] || [];
  currentGalleryIdx = Math.max(0, Math.min(startIndex, currentGallery.length - 1));
  renderLightboxFrame();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* Fallback: wrap a single image as an ad-hoc gallery */
function openLightbox(src, caption) {
  currentGallery    = [{ src, caption }];
  currentGalleryIdx = 0;
  renderLightboxFrame();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightboxMeta() {
  const item  = currentGallery[currentGalleryIdx];
  const total = currentGallery.length;
  lightboxCaption.textContent = item.caption;
  if (total > 1) {
    lightboxCounter.textContent = `${currentGalleryIdx + 1} / ${total}`;
    lightboxPrev.style.display  = '';
    lightboxNext.style.display  = '';
  } else {
    lightboxCounter.textContent = '';
    lightboxPrev.style.display  = 'none';
    lightboxNext.style.display  = 'none';
  }
}

/* direction: 0 = no animation (first open), 1 = next, -1 = prev */
function renderLightboxFrame(direction = 0) {
  const item = currentGallery[currentGalleryIdx];
  if (!item) return;

  if (direction === 0) {
    // Instant swap on first open
    lightboxImg.style.transition = 'none';
    lightboxImg.style.opacity    = '1';
    lightboxImg.style.transform  = 'translateX(0) scale(1)';
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    updateLightboxMeta();
    return;
  }

  // Step 1 — slide current image out
  lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  lightboxImg.style.opacity    = '0';
  lightboxImg.style.transform  = direction > 0
    ? 'translateX(-40px) scale(0.96)'
    : 'translateX(40px) scale(0.96)';

  setTimeout(() => {
    // Step 2 — snap new image in from opposite side (no transition)
    lightboxImg.style.transition = 'none';
    lightboxImg.style.opacity    = '0';
    lightboxImg.style.transform  = direction > 0
      ? 'translateX(40px) scale(0.96)'
      : 'translateX(-40px) scale(0.96)';
    lightboxImg.src = item.src;
    lightboxImg.alt = item.caption;
    updateLightboxMeta();

    // Step 3 — animate into place
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lightboxImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        lightboxImg.style.opacity    = '1';
        lightboxImg.style.transform  = 'translateX(0) scale(1)';
      });
    });
  }, 200);
}

function galleryNav(direction) {
  const total = currentGallery.length;
  if (total <= 1) return;
  currentGalleryIdx = (currentGalleryIdx + direction + total) % total;
  renderLightboxFrame(direction);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

/* Keyboard: Escape closes, arrow keys navigate */
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  galleryNav(-1);
  if (e.key === 'ArrowRight') galleryNav(1);
});

/* Touch swipe support */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(dx) > 50) galleryNav(dx < 0 ? 1 : -1);
}, { passive: true });

