// ============================================================
// NEXUS BIONICS — Main JavaScript
// Handles: cursor, navbar, scroll reveals, glitch effect
// ============================================================


// ── 1. CUSTOM CURSOR GLOW ───────────────────────────────────
// We hid the default cursor in CSS (cursor: none on body).
// Now we make our own gold glow that follows the mouse.

// ── 1. CUSTOM CURSOR GLOW ───────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');

// Move cursor instantly with no delay
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

// Show cursor only after first mouse movement
document.addEventListener('mousemove', () => {
  cursorGlow.style.opacity = '1';
}, { once: true });

// Grow on hover over clickable elements
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorGlow.style.width  = '44px';
    cursorGlow.style.height = '44px';
  });
  el.addEventListener('mouseleave', () => {
    cursorGlow.style.width  = '20px';
    cursorGlow.style.height = '20px';
  });
});

// Hide default cursor on entire page
document.body.style.cursor = 'none';

// Restore default cursor if mouse leaves the window
document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursorGlow.style.opacity = '1';
});


// ── 2. NAVBAR SCROLL EFFECT ─────────────────────────────────
// When the user scrolls down past 50px, add a 'scrolled' class
// to the navbar. Our CSS already has styles for .navbar.scrolled
// that make it dark + blurred.

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


// ── 3. SCROLL REVEAL ANIMATIONS ─────────────────────────────
// This uses the IntersectionObserver API — a browser tool that
// watches elements and fires a callback when they enter the
// visible area of the screen (the "viewport").
//
// We look for all elements with class="reveal".
// When they scroll into view, we add class="visible".
// The CSS handles the actual animation (defined below in animations.css).

const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // entry.isIntersecting = true means the element is now visible
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stop watching once it's revealed — no need to watch anymore
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,  // trigger when 15% of the element is visible
  rootMargin: '0px 0px -50px 0px'  // trigger 50px before bottom of screen
});

revealElements.forEach(el => revealObserver.observe(el));


// ── 4. STAGGERED CARD ANIMATION ─────────────────────────────
// For grid items (cards), we want each one to appear with a
// slight delay after the previous — a "stagger" effect.
// We do this by setting a CSS custom property --delay on each card.

document.querySelectorAll('.cards-grid .glass-card').forEach((card, index) => {
  card.style.setProperty('--delay', index * 0.15 + 's');
});

document.querySelectorAll('.testimonials-grid .testimonial-card').forEach((card, index) => {
  card.style.setProperty('--delay', index * 0.15 + 's');
});

document.querySelectorAll('.tech-grid .tech-item').forEach((item, index) => {
  item.style.setProperty('--delay', index * 0.08 + 's');
});


// ── 5. GLITCH EFFECT ON HERO TITLE ──────────────────────────
// This creates a subtle random glitch on the hero title.
// It rapidly replaces random characters with symbols, then
// restores the original text — creating a "corrupted data" look.

// ── 5. GLITCH EFFECT ON HERO TITLE ──────────────────────────
// We target only the plain text lines, not the span.
// This avoids corrupting HTML tags.

// ── 5. GLITCH EFFECT ON HERO TITLE ──────────────────────────

const glitchChars = '!<>-_\\/[]{}—=+*^?#@$%&';
const heroTitle = document.querySelector('.hero-title');
const goldSpan = heroTitle ? heroTitle.querySelector('.hero-title-gold') : null;

// Store originals ONCE at the very start — never change these
const goldOriginal = goldSpan ? goldSpan.textContent : '';

// Store original text nodes ONCE
const textNodes = [];
const textOriginals = [];

if (heroTitle) {
  heroTitle.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      textNodes.push(node);
      textOriginals.push(node.textContent); // frozen original
    }
  });
}

// Track if a glitch is already running — prevents overlapping glitches
let glitchRunning = false;

function restoreAll() {
  if (!heroTitle) return;

  textNodes.forEach((node, index) => {
    node.textContent = textOriginals[index];
  });

  if (goldSpan) {
    goldSpan.textContent = goldOriginal;
  }

  glitchRunning = false;
}

function randomGlitchText(text) {
  return text.split('').map(char => {
    return Math.random() < 0.25 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char;
  }).join('');
}

function runGlitch() {
  if (!heroTitle || glitchRunning) return;
  glitchRunning = true;

  textNodes.forEach((node, index) => {
    const original = textOriginals[index];
    node.textContent = randomGlitchText(original);
  });

  if (goldSpan) {
    goldSpan.textContent = randomGlitchText(goldOriginal);
  }

  setTimeout(() => {
    restoreAll();
  }, 120);
}

if (heroTitle) {
  setInterval(runGlitch, 3800);
}

// ── 6. MOBILE HAMBURGER MENU ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
const navCta    = document.querySelector('.nav-cta-btn');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    navCta.classList.toggle('mobile-open');
  });
}


// ── 7. ANIMATED STAT COUNTER ────────────────────────────────
// When the stats bar scrolls into view, the numbers count up
// from 0 to their final value. This draws attention and feels
// dynamic and data-driven.

function animateCounter(element, target, duration = 1500) {
  // Some stats have non-numeric parts — handle them
  const isNumeric = !isNaN(parseFloat(target));
  if (!isNumeric) return; // skip "Series VII" etc.

  const numericValue = parseFloat(target.replace(/,/g, ''));
  const hasComma     = target.includes(',');
  const hasDot       = target.includes('.');
  const suffix       = target.replace(/[\d,\.]/g, ''); // e.g. '%'
  const startTime    = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutQuart — starts fast, decelerates at end
    const eased    = 1 - Math.pow(1 - progress, 4);
    const current  = numericValue * eased;

    if (hasComma) {
      element.textContent = Math.floor(current).toLocaleString() + suffix;
    } else if (hasDot) {
      element.textContent = current.toFixed(1) + suffix;
    } else {
      element.textContent = Math.floor(current) + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
    else element.textContent = target; // snap to exact final value
  }

  requestAnimationFrame(update);
}

// Use IntersectionObserver to trigger counters when stats bar is visible
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-number').forEach(el => {
          animateCounter(el, el.textContent.trim());
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statsObserver.observe(statsBar);
}