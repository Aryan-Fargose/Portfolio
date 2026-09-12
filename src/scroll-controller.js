/**
 * Scroll Orchestrator & Chapter Director
 * 
 * Manages:
 * - Scroll progress calculation (0.0 -> 1.0)
 * - 8 Cinematic Chapters matching the 300-frame laptop animation narrative
 * - Corner chapter indicator transitions
 * - Active navigation dock synchronizer
 * - Component callouts and IDEA CORE highlights
 * - Keyboard navigation (Arrows, PageUp/Down, Home/End)
 */

export class ScrollController {
  constructor(canvasRenderer, options = {}) {
    this.renderer = canvasRenderer;
    this.container = options.container || document.querySelector('.scroll-container');
    this.cornerIndicator = options.cornerIndicator || document.querySelector('.corner-indicator');
    this.cornerNumber = options.cornerNumber || document.querySelector('.corner-number');
    this.cornerTitle = options.cornerTitle || document.querySelector('.corner-title');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.railLinks = document.querySelectorAll('.rail-label-item');
    this.railLineFill = document.getElementById('rail-line-fill');
    this.brandMark = document.querySelector('.brand-mark');
    this.chapterPanels = document.querySelectorAll('.chapter-panel');
    this.hardwareHUD = document.querySelector('.hardware-hud');
    this.ideaCoreBadge = document.querySelector('.idea-core-highlight');

    // 8 Narrative Chapters
    this.chapters = [
      { id: 'intro', num: '01 / 08', title: 'INTRO', start: 0.00, end: 0.12, target: 0.00 },
      { id: 'about', num: '02 / 08', title: 'ABOUT', start: 0.12, end: 0.24, target: 0.18 },
      { id: 'education', num: '03 / 08', title: 'EDUCATION', start: 0.24, end: 0.36, target: 0.30 },
      { id: 'projects', num: '04 / 08', title: 'PROJECTS', start: 0.36, end: 0.52, target: 0.44 },
      { id: 'skills', num: '05 / 08', title: 'SKILLS & HARDWARE', start: 0.52, end: 0.66, target: 0.59 },
      { id: 'interests', num: '06 / 08', title: 'INTERESTS & CINEMA', start: 0.66, end: 0.78, target: 0.72 },
      { id: 'aspirations', num: '07 / 08', title: 'WHAT\'S NEXT', start: 0.78, end: 0.88, target: 0.83 },
      { id: 'contact', num: '08 / 08', title: 'CONTACT', start: 0.88, end: 1.00, target: 0.95 }
    ];

    this.currentChapterIndex = 0;
    this.ticking = false;

    this.init();
  }

  init() {
    this.bindScroll();
    this.bindNav();
    this.bindKeyboard();
    this.update(); // Initial frame update
  }

  bindScroll() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          this.update();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }, { passive: true });
  }

  bindNav() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        this.scrollToChapter(targetId);
      });
    });

    // Support clicking on the vertical chapter rail labels
    this.railLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        this.scrollToChapter(targetId);
      });
    });

    // Brand mark click returns to top
    if (this.brandMark) {
      this.brandMark.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToChapter('intro');
      });
    }

    // Scroll Down Prompt Click
    const scrollPrompt = document.querySelector('.hero-scroll-prompt');
    if (scrollPrompt) {
      scrollPrompt.addEventListener('click', () => {
        this.scrollToChapter('about');
      });
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent interfering with input elements if any
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const step = window.innerHeight * 0.4;

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault();
          window.scrollBy({ top: step, behavior: 'smooth' });
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          window.scrollBy({ top: -step, behavior: 'smooth' });
          break;
        case 'Home':
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          window.scrollTo({ top: maxScroll, behavior: 'smooth' });
          break;
      }
    });
  }

  getProgress() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(1, scrollY / maxScroll));
  }

  update() {
    const progress = this.getProgress();
    
    // Scrub canvas animation
    this.renderer.setScrollProgress(progress);

    // Update chapter rail fill height
    if (this.railLineFill) {
      this.railLineFill.style.height = `${(progress * 100).toFixed(1)}%`;
    }

    // Determine current chapter
    let chapterIndex = 0;
    for (let i = 0; i < this.chapters.length; i++) {
      if (progress >= this.chapters[i].start && progress <= this.chapters[i].end) {
        chapterIndex = i;
        break;
      }
      if (progress > this.chapters[this.chapters.length - 1].end) {
        chapterIndex = this.chapters.length - 1;
      }
    }

    if (chapterIndex !== this.currentChapterIndex) {
      this.currentChapterIndex = chapterIndex;
      this.onChapterChange(this.chapters[chapterIndex]);
    }

    // Update overlay opacities and visibility
    this.updateChapterOverlays(progress);

    // Update hardware HUD & IDEA CORE during exploded view (frames 150 - 240, progress ~0.50 - 0.80)
    this.updateHardwareHUD(progress);
  }

  onChapterChange(chapter) {
    // Elegant corner HUD animation: blur + translateY
    if (this.cornerIndicator) {
      this.cornerIndicator.classList.add('transitioning');
      setTimeout(() => {
        if (this.cornerNumber) this.cornerNumber.textContent = chapter.num;
        if (this.cornerTitle) this.cornerTitle.textContent = chapter.title;
        this.cornerIndicator.classList.remove('transitioning');
      }, 150);
    }

    // Sync floating nav dock
    this.navLinks.forEach(link => {
      const target = link.getAttribute('data-target');
      if (target === chapter.id) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Sync vertical chapter rail labels
    this.railLinks.forEach(link => {
      const target = link.getAttribute('data-target');
      if (target === chapter.id) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  updateChapterOverlays(progress) {
    this.chapters.forEach(chap => {
      const el = document.getElementById(`panel-${chap.id}`);
      if (!el) return;

      // Special handling for Chapter 01 (Intro): Full opacity on open, fades away as user scrolls
      if (chap.id === 'intro') {
        if (progress <= chap.end) {
          const fadeProgress = progress / chap.end; // 0.0 -> 1.0
          const opacity = Math.max(0, Math.min(1, 1 - Math.pow(fadeProgress, 1.2) * 1.15));
          el.style.opacity = opacity.toFixed(3);
          el.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
          el.classList.add('active');
          el.classList.remove('hidden');
          const translateY = progress * -80;
          el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        } else {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.classList.remove('active');
          el.classList.add('hidden');
        }
        return;
      }

      // Special handling for Chapter 08 (Contact): Stays visible as progress reaches 1.0
      if (chap.id === 'contact') {
        if (progress >= chap.start) {
          const fadeProgress = (progress - chap.start) / (chap.end - chap.start); // 0.0 -> 1.0
          const opacity = Math.max(0, Math.min(1, fadeProgress * 1.4));
          el.style.opacity = opacity.toFixed(3);
          el.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
          el.classList.add('active');
          el.classList.remove('hidden');
          const translateY = (1 - fadeProgress) * 40;
          el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        } else {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          el.classList.remove('active');
          el.classList.add('hidden');
        }
        return;
      }

      // Middle chapters: Smooth arc fade-in and fade-out
      const mid = (chap.start + chap.end) / 2;
      const span = (chap.end - chap.start) / 2;
      const dist = Math.abs(progress - mid);

      if (progress >= chap.start && progress <= chap.end) {
        // Active chapter: calculate smooth fade-in and peak
        const normalized = 1 - Math.min(1, dist / span);
        const opacity = Math.max(0, Math.min(1, normalized * 1.6 - 0.15));
        
        el.style.opacity = opacity.toFixed(3);
        el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
        el.classList.add('active');
        el.classList.remove('hidden');

        // Micro-parallax
        const translateY = (progress - mid) * -40;
        el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      } else {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.classList.remove('active');
        el.classList.add('hidden');
      }
    });
  }

  updateHardwareHUD(progress) {
    // Hardware exploded view is active in frames 160 to 245 (~ progress 0.53 to 0.80)
    const hudActive = progress >= 0.52 && progress <= 0.78;
    if (this.hardwareHUD) {
      if (hudActive) {
        this.hardwareHUD.classList.add('visible');
      } else {
        this.hardwareHUD.classList.remove('visible');
      }
    }

    // IDEA CORE glows bright around frames 200 - 245 (progress ~ 0.65 - 0.79)
    const ideaCoreActive = progress >= 0.64 && progress <= 0.80;
    if (this.ideaCoreBadge) {
      if (ideaCoreActive) {
        this.ideaCoreBadge.classList.add('active');
      } else {
        this.ideaCoreBadge.classList.remove('active');
      }
    }
  }

  scrollToChapter(chapterId) {
    const chap = this.chapters.find(c => c.id === chapterId);
    if (!chap) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScrollY = chap.target * maxScroll;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }
}
