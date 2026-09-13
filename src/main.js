/**
 * Application Entry Point - Aryan Fargose Portfolio
 * 
 * Orchestrates:
 * - High-Performance Canvas Image-Sequence Engine
 * - Scroll Controller & 8-Chapter Narrative System
 * - Loading Splash Screen & Progressive Asset Hydration
 * - Interactive UI Micro-interactions (Anime.js)
 * - Copy-to-clipboard utilities
 */

import { profile } from './profile.js';
import { CanvasRenderer } from './canvas-renderer.js';
import { ScrollController } from './scroll-controller.js';
import anime from 'animejs';

// DOM Elements
const canvasElement = document.getElementById('animation-canvas');
const loadingScreen = document.getElementById('loading-screen');
const loadingStatus = document.getElementById('loading-status');
const loadingBarFill = document.getElementById('loading-bar-fill');
const loadingPercent = document.getElementById('loading-percent');
const loadingEnterBtn = document.getElementById('loading-enter-btn');
const btnStartExploring = document.getElementById('btn-start-exploring');
const btnCopyEmail = document.getElementById('btn-copy-email');
const copyEmailText = document.getElementById('copy-email-text');

// State
let isInitialDismissed = false;

// 1. Initialize Canvas Renderer for 300 sequential frames
const renderer = new CanvasRenderer(canvasElement, {
  totalFrames: 300,
  framePathPattern: (index) => {
    const pad = String(index + 1).padStart(3, '0');
    return `/frames/ezgif-frame-${pad}.jpg`;
  },
  onProgress: (loaded, total, percent) => {
    if (loadingBarFill) {
      loadingBarFill.style.width = `${percent}%`;
    }
    if (loadingStatus) {
      loadingStatus.textContent = `INITIALIZING SYSTEM // ${percent}%`;
    }
    if (loadingPercent) {
      loadingPercent.textContent = `HYDRATING INITIAL FRAMES [${String(loaded).padStart(2, '0')} / ${String(total).padStart(2, '0')}]`;
    }
  },
  onInitialReady: () => {
    // Initial critical frames are ready - unlock interaction
    if (loadingEnterBtn) {
      loadingEnterBtn.classList.add('ready');
    }

    // Auto-dismiss after brief moment or on user intent
    setTimeout(() => {
      dismissLoadingScreen();
    }, 400);
  },
  onAllLoaded: () => {
    if (loadingStatus) {
      loadingStatus.textContent = 'SYSTEM OPTIMIZED // 100%';
    }
  }
});

// 2. Initialize Scroll Controller
const scrollController = new ScrollController(renderer);

// Start preloading frames
renderer.startPreloading();

// Dismiss Loading Screen
function dismissLoadingScreen() {
  if (isInitialDismissed) return;
  isInitialDismissed = true;

  if (loadingScreen) {
    loadingScreen.classList.add('dismissed');
  }

  // Trigger hero entrance animation with Anime.js
  animateHeroEntrance();
}

// User interaction dismiss triggers
if (btnStartExploring) {
  btnStartExploring.addEventListener('click', () => {
    dismissLoadingScreen();
    scrollController.scrollToChapter('about');
  });
}

window.addEventListener('wheel', () => {
  dismissLoadingScreen();
}, { once: true, passive: true });

window.addEventListener('touchmove', () => {
  dismissLoadingScreen();
}, { once: true, passive: true });

if (loadingScreen) {
  loadingScreen.addEventListener('click', () => {
    dismissLoadingScreen();
  });
  loadingScreen.addEventListener('touchend', () => {
    dismissLoadingScreen();
  }, { passive: true });
}

window.addEventListener('keydown', (e) => {
  if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
    dismissLoadingScreen();
  }
}, { once: true });

// Hero UI Entrance Animation using Anime.js
function animateHeroEntrance() {
  try {
    anime({
      targets: '.hero-portrait-wrap',
      opacity: [0, 1],
      scale: [0.8, 1],
      translateY: [-20, 0],
      duration: 1000,
      easing: 'easeOutBack'
    });

    anime({
      targets: '.kicker',
      opacity: [0, 1],
      translateY: [-15, 0],
      duration: 800,
      delay: 100,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.hero-title span',
      opacity: [0, 1],
      translateY: [25, 0],
      duration: 1000,
      delay: 150,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 800,
      delay: 300,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.hero-pill',
      opacity: [0, 1],
      translateY: [15, 0],
      delay: anime.stagger(80, { start: 450 }),
      duration: 600,
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.hero-scroll-prompt',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 800,
      delay: 800,
      easing: 'easeOutExpo'
    });
  } catch (err) {
    // Fallback gracefully if anime fails
    console.warn('Anime.js entrance notice:', err);
  }
}

// Copy Email Utility
if (btnCopyEmail && copyEmailText) {
  btnCopyEmail.addEventListener('click', async () => {
    const email = profile.socials.email;
    try {
      await navigator.clipboard.writeText(email);
      const originalText = copyEmailText.textContent;
      copyEmailText.textContent = 'Copied to Clipboard!';
      btnCopyEmail.style.borderColor = 'var(--accent-cyan)';
      btnCopyEmail.style.color = 'var(--accent-cyan)';

      setTimeout(() => {
        copyEmailText.textContent = originalText;
        btnCopyEmail.style.borderColor = '';
        btnCopyEmail.style.color = '';
      }, 2000);
    } catch (e) {
      // Fallback
      window.location.href = `mailto:${email}`;
    }
  });
}

// Resume Quick View Modal Controls
const resumeModal = document.getElementById('resume-modal');
const btnOpenResumeModal = document.getElementById('btn-open-resume-modal');
const btnCloseResumeModal = document.getElementById('btn-close-resume-modal');

function openResumeModal() {
  if (!resumeModal) return;
  resumeModal.classList.add('open');
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  if (!resumeModal) return;
  resumeModal.classList.remove('open');
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (btnOpenResumeModal) {
  btnOpenResumeModal.addEventListener('click', openResumeModal);
}

if (btnCloseResumeModal) {
  btnCloseResumeModal.addEventListener('click', closeResumeModal);
}

if (resumeModal) {
  resumeModal.addEventListener('click', (e) => {
    if (e.target === resumeModal) {
      closeResumeModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && resumeModal.classList.contains('open')) {
      closeResumeModal();
    }
  });
}

// Console branding
console.log(
  `%c ${profile.personal.fullName} %c ${profile.personal.tagline} `,
  'background: #38bdf8; color: #080c10; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #0f172a; color: #94a3b8; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);
console.log('Explore source on GitHub: https://github.com/Aryan-Fargose');
