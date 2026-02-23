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

/* ── 10. LIGHTBOX ── */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

function openLightbox(src, caption) {
  lightboxImg.src          = src;
  lightboxImg.alt          = caption;
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
