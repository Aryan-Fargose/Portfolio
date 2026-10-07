/**
 * ARYAN FARGOSE — CINEMATIC DEVELOPER PORTFOLIO
 * Architecture:
 * - Embedded Lightweight Anime.js v3.2.1 Core
 * - 60fps GPU-Composited Kinetic 3D Wireframe Canvas Visualizer
 * - Scrollfolio Chapter Rail & Navigation System
 * - Interactive Anime.js Playground Modules & Stagger Physics
 * - Full Mobile Dock & Drawer Controller
 * - Interactive Resume Modal Controller
 */

/* ==========================================================================
   ANIME.JS v3.2.1 ENGINE (Embedded Core — Zero External Network Overhead)
   ========================================================================== */
var anime = (function() {
  'use strict';

  var defaultInstanceSettings = {
    update: null,
    begin: null,
    loopBegin: null,
    changeBegin: null,
    change: null,
    changeComplete: null,
    loopComplete: null,
    complete: null,
    loop: 1,
    direction: 'normal',
    autoplay: true,
    timelineOffset: 0
  };

  var defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0
  };

  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];

  function minMax(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function stringContains(str, text) {
    return str.indexOf(text) > -1;
  }

  var is = {
    arr: function(a) { return Array.isArray(a); },
    obj: function(a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
    pth: function(a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
    svg: function(a) { return a instanceof SVGElement; },
    inp: function(a) { return a instanceof HTMLInputElement; },
    dom: function(a) { return a.nodeType || is.svg(a); },
    str: function(a) { return typeof a === 'string'; },
    fnc: function(a) { return typeof a === 'function'; },
    und: function(a) { return typeof a === 'undefined'; },
    nil: function(a) { return is.und(a) || a === null; },
    hex: function(a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
    rgb: function(a) { return /^rgb/.test(a); },
    hsl: function(a) { return /^hsl/.test(a); },
    col: function(a) { return is.hex(a) || is.rgb(a) || is.hsl(a); },
    key: function(a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
  };

  // Easing Functions
  function parseEasingParameters(string) {
    var match = /\(([^)]+)\)/.exec(string);
    return match ? match[1].split(',').map(function(p) { return parseFloat(p); }) : [];
  }

  function spring(string, duration) {
    var params = parseEasingParameters(string);
    var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity = minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      var progress = duration ? (duration * t) / 1000 : t;
      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }
      if (t === 0 || t === 1) { return t; }
      return 1 - progress;
    }
    return solver;
  }

  var penner = (function() {
    var eases = { linear: function() { return function(t) { return t; }; } };
    var functionEasings = {
      Sine: function() { return function(t) { return 1 - Math.cos(t * Math.PI / 2); }; },
      Circ: function() { return function(t) { return 1 - Math.sqrt(1 - t * t); }; },
      Back: function() { return function(t) { return t * t * (3 * t - 2); }; },
      Bounce: function() {
        return function(t) {
          for (var a = 4, b = (4 - 1) / 11; t < ((a = Math.pow(2, --a)) - 1) / 11;);
          return 1 / Math.pow(4, 3 - a) - 7.5625 * Math.pow((a * 3 - 2) / 22 - t, 2);
        };
      },
      Elastic: function(amplitude, period) {
        if (amplitude === void 0) amplitude = 1;
        if (period === void 0) period = .5;
        var a = minMax(amplitude, 1, 10);
        var p = minMax(period, .1, 2);
        return function(t) {
          return (t === 0 || t === 1) ? t :
            -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        };
      }
    };

    ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'].forEach(function(name, i) {
      functionEasings[name] = function() { return function(t) { return Math.pow(t, i + 2); }; };
    });

    Object.keys(functionEasings).forEach(function(name) {
      var easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = function(a, b) { return function(t) { return 1 - easeIn(a, b)(1 - t); }; };
      eases['easeInOut' + name] = function(a, b) {
        return function(t) {
          return t < 0.5 ? easeIn(a, b)(t * 2) / 2 :
            1 - easeIn(a, b)(t * -2 + 2) / 2;
        };
      };
    });
    return eases;
  })();

  function parseEasings(name, duration) {
    if (is.fnc(name)) { return name; }
    var nameString = name.split('(')[0];
    var ease = penner[nameString];
    var args = parseEasingParameters(name);
    if (nameString === 'spring') { return spring(name, duration); }
    return ease ? ease.apply(null, args) : penner.linear();
  }

  function getTargets(target) {
    if (is.arr(target)) {
      return target.reduce(function(a, b) { return a.concat(getTargets(b)); }, []);
    }
    if (is.str(target)) {
      return Array.prototype.slice.call(document.querySelectorAll(target));
    }
    if (target instanceof NodeList || target instanceof HTMLCollection) {
      return Array.prototype.slice.call(target);
    }
    return [target];
  }

  function getAnimatables(targets) {
    return getTargets(targets).map(function(t, i) {
      return { target: t, id: i, transforms: { list: new Map() } };
    });
  }

  // Stagger Utility
  function stagger(val, params) {
    if (params === void 0) params = {};
    var direction = params.direction || 'normal';
    var easing = params.easing ? parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var from = params.from || 0;
    var isRange = is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var start = params.start || 0 + (isRange ? val1 : 0);

    return function(el, i, total) {
      if (from === 'center') from = (total - 1) / 2;
      if (from === 'last') from = total - 1;
      var diff = Math.abs(from - i);
      var progress = total <= 1 ? 0 : diff / (total - 1);
      var calculated = isRange ? (val2 - val1) * progress + val1 : val1 * diff;
      return start + calculated;
    };
  }

  // Core Animation Engine Runner
  function anime(params) {
    if (params === void 0) params = {};
    var animatables = getAnimatables(params.targets);
    var duration = params.duration || defaultTweenSettings.duration;
    var delay = params.delay || 0;
    var easing = parseEasings(params.easing || defaultTweenSettings.easing, duration);
    var properties = {};

    Object.keys(params).forEach(function(key) {
      if (is.key(key)) {
        properties[key] = params[key];
      }
    });

    var startTime = null;
    var completed = false;

    function tick(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;

      if (elapsed < (is.fnc(delay) ? 0 : delay)) {
        requestAnimationFrame(tick);
        return;
      }

      var progress = minMax((elapsed - (is.fnc(delay) ? 0 : delay)) / duration, 0, 1);
      var eased = easing(progress);

      animatables.forEach(function(animatable, i) {
        var el = animatable.target;
        if (!el || !el.style) return;

        var elDelay = is.fnc(delay) ? delay(el, i, animatables.length) : delay;
        if (elapsed < elDelay) return;
        var elProgress = minMax((elapsed - elDelay) / duration, 0, 1);
        var elEased = easing(elProgress);

        Object.keys(properties).forEach(function(prop) {
          var val = properties[prop];
          var fromVal = 0;
          var toVal = 1;

          if (is.arr(val)) {
            fromVal = val[0];
            toVal = val[1];
          } else {
            toVal = val;
          }

          var current = fromVal + (toVal - fromVal) * elEased;

          if (prop === 'opacity') {
            el.style.opacity = current;
          } else if (prop === 'translateY') {
            el.style.transform = 'translate3d(0, ' + current + 'px, 0)';
          } else if (prop === 'scale') {
            el.style.transform = 'scale(' + current + ')';
          } else if (prop === 'rotate') {
            el.style.transform = 'rotate(' + current + 'deg)';
          }
        });
      });

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        if (!completed && is.fnc(params.complete)) {
          completed = true;
          params.complete();
        }
      }
    }

    requestAnimationFrame(tick);
    return {
      pause: function() {},
      play: function() {}
    };
  }

  anime.stagger = stagger;
  anime.penner = penner;
  return anime;
})();


/* ==========================================================================
   INTERACTIVE 60FPS KINETIC WIREFRAME CANVAS (Pure GPU Canvas Engine)
   ========================================================================== */
class KineticCanvasVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.scrollProgress = 0;
    this.targetProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.nodes = [];
    this.edges = [];
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;

    this.initGeometry();
    this.resize();
    this.bindEvents();
    this.render();
  }

  initGeometry() {
    // Generate an exquisite icosahedron + orbital constellation wireframe
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [0, -1,  phi], [0,  1,  phi], [0, -1, -phi], [0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ];

    // Normalize and scale
    this.nodes = rawVertices.map(([x, y, z]) => {
      const len = Math.sqrt(x*x + y*y + z*z);
      return {
        x: (x / len) * 160,
        y: (y / len) * 160,
        z: (z / len) * 160,
        baseX: (x / len) * 160,
        baseY: (y / len) * 160,
        baseZ: (z / len) * 160
      };
    });

    // Outer orbital ring nodes (simplified on mobile)
    const isMobile = window.innerWidth <= 768;
    const ringCount = isMobile ? 6 : 16;
    for (let i = 0; i < ringCount; i++) {
      const theta = (i / ringCount) * Math.PI * 2;
      const r = isMobile ? 180 : 230;
      this.nodes.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r * 0.4,
        z: Math.sin(theta) * r * 0.8,
        baseX: Math.cos(theta) * r,
        baseY: Math.sin(theta) * r * 0.4,
        baseZ: Math.sin(theta) * r * 0.8,
        isRing: true
      });
    }

    // Connect edges based on distance
    this.edges = [];
    const maxDist = isMobile ? 160 : 185;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dz = this.nodes[i].z - this.nodes[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < maxDist) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.dpr = w <= 768 ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.scale(this.dpr, this.dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initGeometry();
      this.resize();
    }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Pause animation when tab or window is hidden to conserve resources
    this.isPaused = false;
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused) {
        requestAnimationFrame(() => this.render());
      }
    });
  }

  setProgress(p) {
    this.targetProgress = p;
  }

  render() {
    if (this.isPaused) return;

    // Smooth interpolation (lerp)
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.08;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const ctx = this.ctx;

    ctx.fillStyle = '#090C0E';
    ctx.fillRect(0, 0, w, h);

    // Dynamic rotation derived from scroll progress + gentle continuous spin + mouse
    this.angleX = this.scrollProgress * Math.PI * 3 + this.mouseY * 0.35;
    this.angleY = this.scrollProgress * Math.PI * 4 + Date.now() * 0.00025 + this.mouseX * 0.5;
    this.angleZ = this.scrollProgress * Math.PI * 1.5;

    // Center offset shifts dynamically according to active chapter (Scrollfolio storytelling)
    let centerX = w * 0.5;
    let centerY = h * 0.5;
    let scaleMultiplier = 1;

    if (w > 1024) {
      if (this.scrollProgress > 0.12 && this.scrollProgress < 0.25) {
        // About Section: shift core to the right
        centerX = w * 0.72;
        centerY = h * 0.48;
        scaleMultiplier = 1.15;
      } else if (this.scrollProgress >= 0.25 && this.scrollProgress < 0.38) {
        // Education Section: shift core to the left
        centerX = w * 0.28;
        centerY = h * 0.52;
        scaleMultiplier = 1.2;
      } else if (this.scrollProgress >= 0.52 && this.scrollProgress < 0.66) {
        // Skills Section: expand scale
        scaleMultiplier = 1.35;
      }
    } else {
      // Mobile: center and scale down gracefully
      scaleMultiplier = 0.65;
      centerY = h * 0.34;
    }

    // 3D Matrix Projection
    const cosX = Math.cos(this.angleX), sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY), sinY = Math.sin(this.angleY);
    const cosZ = Math.cos(this.angleZ), sinZ = Math.sin(this.angleZ);

    const projected = this.nodes.map(n => {
      // Rotate Y
      let x1 = n.baseX * cosY - n.baseZ * sinY;
      let y1 = n.baseY;
      let z1 = n.baseX * sinY + n.baseZ * cosY;

      // Rotate X
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Rotate Z
      let x3 = x2 * cosZ - y2 * sinZ;
      let y3 = x2 * sinZ + y2 * cosZ;
      let z3 = z2;

      // Perspective divide
      const fov = 450;
      const depth = fov / (fov + z3 + 180);
      const px = centerX + x3 * depth * scaleMultiplier;
      const py = centerY + y3 * depth * scaleMultiplier;

      return { x: px, y: py, z: z3, depth };
    });

    // Draw connecting delicate wireframe edges
    ctx.lineWidth = 0.75;
    for (let e = 0; e < this.edges.length; e++) {
      const [i, j] = this.edges[e];
      const p1 = projected[i];
      const p2 = projected[j];

      const avgZ = (p1.z + p2.z) / 2;
      const alpha = Math.max(0.02, Math.min(0.24, (avgZ + 180) / 450));

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      // Controlled, non-neon palette: restrained cyan & subtle charcoal tone
      if (e % 3 === 0) {
        ctx.strokeStyle = `rgba(107, 119, 133, ${alpha * 0.4})`;
      } else {
        ctx.strokeStyle = `rgba(56, 163, 216, ${alpha * 0.55})`;
      }
      ctx.stroke();
    }

    // Draw small refined geometric nodes (not loud glowing points)
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];
      const r = Math.max(1, p.depth * 2);
      const alpha = Math.max(0.08, (p.z + 180) / 500);

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 
        ? `rgba(107, 119, 133, ${alpha * 0.45})` 
        : `rgba(56, 163, 216, ${alpha * 0.6})`;
      ctx.fill();
    }

    requestAnimationFrame(() => this.render());
  }
}

/* ==========================================================================
   SCROLLFOLIO CHAPTER & NAVIGATION CONTROLLER
   ========================================================================== */
class ChapterController {
  constructor(visualizer) {
    this.visualizer = visualizer;
    this.container = document.querySelector('.scroll-container');
    this.cornerNumber = document.getElementById('corner-number');
    this.cornerTitle = document.getElementById('corner-title');
    this.cornerIndicator = document.getElementById('corner-indicator');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.drawerLinks = document.querySelectorAll('.mobile-drawer-item');
    this.mobileNavNum = document.getElementById('mobile-nav-num');
    this.mobileNavTitle = document.getElementById('mobile-nav-title');
    this.coordsLive = document.getElementById('tech-coords-live');
    this.ideaCoreBadge = document.getElementById('idea-core-highlight');

    this.chapters = [
      { id: 'intro', num: '01 / 08', title: 'INTRO', start: 0, end: 0.12, target: 0 },
      { id: 'about', num: '02 / 08', title: 'ABOUT', start: 0.12, end: 0.24, target: 0.18 },
      { id: 'education', num: '03 / 08', title: 'EDUCATION', start: 0.24, end: 0.36, target: 0.30 },
      { id: 'projects', num: '04 / 08', title: 'PROJECTS', start: 0.36, end: 0.52, target: 0.44 },
      { id: 'skills', num: '05 / 08', title: 'SKILLS & HARDWARE', start: 0.52, end: 0.66, target: 0.59 },
      { id: 'interests', num: '06 / 08', title: 'INTERESTS & CINEMA', start: 0.66, end: 0.78, target: 0.72 },
      { id: 'aspirations', num: '07 / 08', title: 'WHAT\'S NEXT', start: 0.78, end: 0.88, target: 0.83 },
      { id: 'contact', num: '08 / 08', title: 'CONTACT', start: 0.88, end: 1.0, target: 0.95 }
    ];

    this.currentChapterIndex = 0;
    this.ticking = false;

    this.init();
  }

  init() {
    this.bindScroll();
    this.bindNavClicks();
    this.bindKeyboard();
    this.bindMobileDock();
    this.update();
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

    // Ensure effortless scrolling from the 1st page (Intro)
    window.addEventListener('wheel', (e) => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY <= 25 && e.deltaY > 15) {
        this.scrollToChapter('about');
      }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      if (scrollY <= 25 && e.changedTouches && e.changedTouches.length > 0) {
        const diffY = touchStartY - e.changedTouches[0].clientY;
        if (diffY > 45) {
          this.scrollToChapter('about');
        }
      }
    }, { passive: true });
  }

  getProgress() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(1, scrollY / maxScroll));
  }

  update() {
    const p = this.getProgress();
    this.visualizer.setProgress(p);

    // Update live coordinate readouts (Anime.js technical detail)
    if (this.coordsLive) {
      const coordVal = (p * 100).toFixed(2);
      this.coordsLive.textContent = `MUMBAI, IN [19.1075° N, 72.8372° E] · SYNC [${coordVal}%]`;
    }

    // Determine Active Chapter
    let activeIndex = 0;
    for (let i = 0; i < this.chapters.length; i++) {
      if (p >= this.chapters[i].start && p <= this.chapters[i].end) {
        activeIndex = i;
        break;
      }
      if (p > this.chapters[this.chapters.length - 1].end) {
        activeIndex = this.chapters.length - 1;
      }
    }

    if (activeIndex !== this.currentChapterIndex) {
      this.currentChapterIndex = activeIndex;
      this.onChapterChange(this.chapters[activeIndex]);
    }

    this.updatePanelTransforms(p);
    this.updateIdeaCoreHighlight(p);
  }

  onChapterChange(chapter) {
    // Corner Indicator smooth blur-shift animation
    if (this.cornerIndicator) {
      this.cornerIndicator.classList.add('transitioning');
      setTimeout(() => {
        if (this.cornerNumber) this.cornerNumber.textContent = chapter.num;
        if (this.cornerTitle) this.cornerTitle.textContent = chapter.title;
        this.cornerIndicator.classList.remove('transitioning');
      }, 150);
    }

    // Update Desktop Nav Links
    this.navLinks.forEach(link => {
      const matches = link.getAttribute('data-target') === chapter.id;
      link.classList.toggle('active', matches);
      if (matches) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    // Update Mobile Dock & Drawer Labels
    if (this.mobileNavNum) this.mobileNavNum.textContent = chapter.num;
    if (this.mobileNavTitle) this.mobileNavTitle.textContent = chapter.title;

    this.drawerLinks.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-target') === chapter.id);
    });
  }

  updatePanelTransforms(progress) {
    const isMobile = window.innerWidth <= 768;

    this.chapters.forEach(ch => {
      const panel = document.getElementById(`panel-${ch.id}`);
      if (!panel) return;

      // Special handling for Intro
      if (ch.id === 'intro') {
        if (progress <= ch.end) {
          const ratio = progress / ch.end;
          const opacity = Math.max(0, Math.min(1, 1 - Math.pow(ratio, 1.2) * 1.15));
          panel.style.opacity = opacity.toFixed(3);
          panel.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
          panel.classList.add('active');
          // Intro gently fades without translating upward into the fixed header safe zone
          const transY = isMobile ? 0 : Math.min(15, progress * 30);
          panel.style.transform = `translate3d(0, ${transY.toFixed(1)}px, 0)`;
        } else {
          panel.style.opacity = '0';
          panel.style.pointerEvents = 'none';
          panel.classList.remove('active');
        }
        return;
      }

      // Special handling for Contact
      if (ch.id === 'contact') {
        if (progress >= ch.start) {
          const ratio = (progress - ch.start) / (ch.end - ch.start);
          const opacity = Math.max(0, Math.min(1, ratio * 1.4));
          panel.style.opacity = opacity.toFixed(3);
          panel.style.pointerEvents = opacity > 0.2 ? 'auto' : 'none';
          panel.classList.add('active');
          // Gently settles at 0px from a subtle lower entry offset
          const transY = Math.max(0, (1 - ratio) * 16);
          panel.style.transform = `translate3d(0, ${transY.toFixed(1)}px, 0)`;
        } else {
          panel.style.opacity = '0';
          panel.style.pointerEvents = 'none';
          panel.classList.remove('active');
        }
        return;
      }

      // Standard chapter center fade window
      const mid = (ch.start + ch.end) / 2;
      const radius = (ch.end - ch.start) / 2;
      const dist = Math.abs(progress - mid);

      if (progress >= ch.start && progress <= ch.end) {
        const factor = 1 - Math.min(1, dist / radius);
        const opacity = Math.max(0, Math.min(1, factor * 1.6 - 0.15));
        panel.style.opacity = opacity.toFixed(3);
        panel.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';
        panel.classList.add('active');
        // Settles softly at 0px; never translates negative (upwards into the header clearance)
        const transY = Math.max(0, (1 - factor) * 12);
        panel.style.transform = `translate3d(0, ${transY.toFixed(1)}px, 0)`;
      } else {
        panel.style.opacity = '0';
        panel.style.pointerEvents = 'none';
        panel.classList.remove('active');
      }
    });
  }

  updateIdeaCoreHighlight(progress) {
    const isVisible = progress >= 0.64 && progress <= 0.82;
    if (this.ideaCoreBadge) {
      this.ideaCoreBadge.classList.toggle('active', isVisible);
    }
  }

  scrollToChapter(id) {
    const chapter = this.chapters.find(c => c.id === id);
    if (!chapter) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = chapter.target * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }

  bindNavClicks() {
    // Top Nav Links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        this.scrollToChapter(target);
      });
    });


    // Brand Mark
    const brandMark = document.querySelector('.brand-mark');
    if (brandMark) {
      brandMark.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToChapter('intro');
      });
    }

    // Hero Scroll Prompt
    const heroPrompt = document.getElementById('hero-scroll-prompt');
    if (heroPrompt) {
      heroPrompt.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToChapter('about');
      });
      heroPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToChapter('about');
        }
      });
    }
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      const step = window.innerHeight * 0.45;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        window.scrollBy({ top: step, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        window.scrollBy({ top: -step, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  bindMobileDock() {
    const prevBtn = document.getElementById('btn-mobile-prev');
    const nextBtn = document.getElementById('btn-mobile-next');
    const drawerToggle = document.getElementById('btn-mobile-drawer-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const drawerClose = document.getElementById('btn-mobile-drawer-close');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentChapterIndex > 0) {
          this.scrollToChapter(this.chapters[this.currentChapterIndex - 1].id);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentChapterIndex < this.chapters.length - 1) {
          this.scrollToChapter(this.chapters[this.currentChapterIndex + 1].id);
        }
      });
    }

    const headerToggle = document.getElementById('btn-header-drawer-toggle');

    const openDrawer = () => {
      if (drawer) {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        if (drawerToggle) drawerToggle.setAttribute('aria-expanded', 'true');
        if (headerToggle) headerToggle.setAttribute('aria-expanded', 'true');
      }
    };

    const closeDrawer = () => {
      if (drawer) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        if (drawerToggle) drawerToggle.setAttribute('aria-expanded', 'false');
        if (headerToggle) headerToggle.setAttribute('aria-expanded', 'false');
      }
    };

    if (drawerToggle) {
      drawerToggle.addEventListener('click', () => {
        drawer && drawer.classList.contains('open') ? closeDrawer() : openDrawer();
      });
    }

    if (headerToggle) {
      headerToggle.addEventListener('click', () => {
        drawer && drawer.classList.contains('open') ? closeDrawer() : openDrawer();
      });
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) closeDrawer();
      });
    }

    this.drawerLinks.forEach(item => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        closeDrawer();
        this.scrollToChapter(target);
      });
    });

    // Mobile Projects Switcher
    const projTabs = document.querySelectorAll('.mobile-proj-tab');
    const projCards = document.querySelectorAll('[data-proj-card]');
    projTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetProj = tab.getAttribute('data-proj-target');
        projTabs.forEach(t => {
          const isSelected = t === tab;
          t.classList.toggle('active', isSelected);
          t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
        projCards.forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-proj-card') === targetProj);
        });
      });
    });

    // Mobile Skills Switcher
    const skillTabs = document.querySelectorAll('.mobile-skill-tab');
    const matrixCol = document.getElementById('skills-matrix-col');
    const hudCol = document.getElementById('hardware-hud-col');
    skillTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.getAttribute('data-skill-target');
        skillTabs.forEach(t => {
          const isSelected = t === tab;
          t.classList.toggle('active', isSelected);
          t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
        if (matrixCol) matrixCol.classList.toggle('active', targetView === 'matrix');
        if (hudCol) hudCol.classList.toggle('active', targetView === 'hardware');
      });
    });
  }
}

/* ==========================================================================
   ANIME.JS INTERACTIVE DEMONSTRATION MODULES
   ========================================================================== */
function setupAnimeDemonstrations() {
  const skillTags = document.querySelectorAll('.cat-skill-tag');

  // Interactive Click Animation on Individual Skill Tags
  skillTags.forEach(tag => {
    tag.addEventListener('click', () => {
      anime({
        targets: tag,
        scale: [1, 1.3, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .4)'
      });
    });
  });

  // Entrance Stagger for Intro Section
  anime({
    targets: '.hero-portrait-wrap',
    opacity: [0, 1],
    scale: [0.85, 1],
    translateY: [-15, 0],
    duration: 900,
    easing: 'easeOutBack'
  });

  anime({
    targets: '.hero-pill',
    opacity: [0, 1],
    translateY: [15, 0],
    delay: anime.stagger(80, { start: 400 }),
    duration: 600,
    easing: 'easeOutExpo'
  });
}

/* ==========================================================================
   HERO DYNAMIC TYPEWRITER & BLINKING CURSOR (PARVATI IYER STYLE)
   ========================================================================== */
function setupHeroTypewriter() {
  const nameEl = document.getElementById('typed-hero-name');
  const cursorEl = document.getElementById('hero-cursor');
  const roleEl = document.getElementById('typed-hero-role');

  if (!nameEl) return;

  const fullName = "ARYAN FARGOSE";
  const roles = [
    "Systems & Interfaces Developer",
    "B.Tech IT · Dwarkadas J. Sanghvi College of Engineering",
    "Creative Technologist & Coder",
    "Building digital systems with intent."
  ];

  // 1. Blinking cursor effect (every 500ms like Parvati Iyer site)
  let cursorVisible = true;
  setInterval(() => {
    cursorVisible = !cursorVisible;
    if (cursorEl) {
      cursorEl.classList.toggle('blink-off', !cursorVisible);
    }
  }, 500);

  // 2. Typewriter for Name: types out character-by-character
  let charIndex = 0;
  const nameInterval = setInterval(() => {
    charIndex++;
    nameEl.textContent = fullName.slice(0, charIndex);
    if (charIndex >= fullName.length) {
      clearInterval(nameInterval);
      // Once the name completes, start rotating role typing
      setTimeout(startRoleTyping, 400);
    }
  }, 75);

  // 3. Rotating role typewriter
  let roleIndex = 0;
  function startRoleTyping() {
    if (!roleEl) return;

    function typeCurrentRole() {
      const currentRole = roles[roleIndex];
      let charPos = 0;

      const typeInterval = setInterval(() => {
        charPos++;
        roleEl.textContent = currentRole.slice(0, charPos);

        if (charPos >= currentRole.length) {
          clearInterval(typeInterval);
          // Pause 2.2 seconds before erasing and switching to next role
          setTimeout(() => {
            eraseCurrentRole(currentRole);
          }, 2200);
        }
      }, 45);
    }

    function eraseCurrentRole(roleText) {
      let charPos = roleText.length;
      const eraseInterval = setInterval(() => {
        charPos--;
        roleEl.textContent = roleText.slice(0, charPos);

        if (charPos <= 0) {
          clearInterval(eraseInterval);
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(typeCurrentRole, 300);
        }
      }, 25);
    }

    typeCurrentRole();
  }
}

/* ==========================================================================
   INTERACTIVE RESUME MODAL HANDLER
   ========================================================================== */
function setupResumeModal() {
  const modal = document.getElementById('resume-modal');
  const openHero = document.getElementById('btn-hero-view-resume');
  const openNav = document.getElementById('btn-nav-resume-view');
  const openContact = document.getElementById('btn-open-resume-modal');
  const closeBtn = document.getElementById('btn-close-resume-modal');

  const openModal = () => {
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (openHero) openHero.addEventListener('click', openModal);
  if (openNav) openNav.addEventListener('click', openModal);
  if (openContact) openContact.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   CLIPBOARD & CONTACT INTERACTIONS
   ========================================================================== */
function setupContactInteractions() {
  const copyBtn = document.getElementById('btn-copy-email');
  const copyText = document.getElementById('copy-email-text');
  const email = 'aryanfargose@gmail.com';

  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        const originalText = copyText.textContent;
        copyText.textContent = 'Copied to Clipboard! ✓';
        copyBtn.style.borderColor = 'var(--accent-lime)';
        copyBtn.style.color = 'var(--accent-lime)';
        copyBtn.style.background = 'rgba(216, 243, 107, 0.12)';

        setTimeout(() => {
          copyText.textContent = originalText;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
          copyBtn.style.background = '';
        }, 2200);
      } catch (err) {
        window.location.href = `mailto:${email}`;
      }
    });
  }
}

/* ==========================================================================
   SYSTEM BOOT / INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('animation-canvas');
  const loadingScreen = document.getElementById('loading-screen');
  const loadingBar = document.getElementById('loading-bar-fill');
  const loadingStatus = document.getElementById('loading-status');
  const startBtn = document.getElementById('btn-start-exploring');
  const enterBtnWrap = document.getElementById('loading-enter-btn');

  // Initialize Canvas Visualizer
  const visualizer = new KineticCanvasVisualizer(canvasEl);

  // Initialize Chapter Navigation System
  const controller = new ChapterController(visualizer);

  // Initialize Interactive Demonstration Modules
  setupAnimeDemonstrations();
  setupHeroTypewriter();
  setupResumeModal();
  setupContactInteractions();

  // Simulated rapid calibration progress
  let progress = 0;
  let dismissed = false;

  const dismissLoader = () => {
    if (dismissed) return;
    dismissed = true;
    if (loadingScreen) {
      loadingScreen.classList.add('dismissed');
    }
  };

  const timer = setInterval(() => {
    progress += 25;
    if (loadingBar) loadingBar.style.width = `${progress}%`;
    if (loadingStatus) loadingStatus.textContent = `PORTFOLIO READY · ${progress}%`;

    if (progress >= 100) {
      clearInterval(timer);
      if (enterBtnWrap) enterBtnWrap.classList.add('ready');
      setTimeout(dismissLoader, 400);
    }
  }, 100);

  if (startBtn) {
    startBtn.addEventListener('click', dismissLoader);
  }

  // Dismiss instantly on user intent
  window.addEventListener('wheel', dismissLoader, { once: true, passive: true });
  window.addEventListener('touchmove', dismissLoader, { once: true, passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', 'Space'].includes(e.code)) dismissLoader();
  }, { once: true });
});

// Editorial console signature
console.log(
  '%c ARYAN FARGOSE %c B.TECH IT · DJSCE MUMBAI · SYSTEMS & CODE ',
  'background: #38A3D8; color: #090C0E; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #0E1216; color: #B8DB42; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);
console.log('Explore source on GitHub: https://github.com/Aryan-Fargose');
