/**
 * High-Performance Canvas Image-Sequence Renderer
 * 
 * Features:
 * - Intelligent sliding-window frame hydration (loads only 5-8 frames on initial load)
 * - Directional lookahead buffer with priority queue (cancels/deprioritizes off-scroll requests)
 * - Concurrency-limited network scheduler (prevents edge request flooding)
 * - requestIdleCallback non-critical lookahead prefetching
 * - Mobile-optimized lightweight buffer sizing
 * - requestAnimationFrame render loop with smooth lerping
 * - High-DPI / Retina display support
 * - Aspect-ratio contain logic with seamless dark background matching
 * - Nearest-frame fallback during high-speed scrubbing (zero blank frames)
 * - Native browser HTTP/disk caching preservation
 */

export class CanvasRenderer {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { alpha: false });
    this.totalFrames = options.totalFrames || 300;
    this.framePathPattern = options.framePathPattern || ((index) => {
      const pad = String(index + 1).padStart(3, '0');
      return `/frames/ezgif-frame-${pad}.jpg`;
    });

    this.onProgress = options.onProgress || (() => {});
    this.onInitialReady = options.onInitialReady || (() => {});
    this.onAllLoaded = options.onAllLoaded || (() => {});

    // Cache & Loading State
    this.images = new Array(this.totalFrames).fill(null);
    this.loadedStatus = new Array(this.totalFrames).fill(false);
    this.inFlight = new Set();
    this.inFlightPromises = new Map();
    this.pendingQueue = [];
    this.loadedCount = 0;
    this.targetFrame = 0;
    this.currentFrame = 0;
    this.scrollDirection = 1; // 1 = forward/down, -1 = backward/up
    this.isRendering = false;
    this.lastRenderedIndex = -1;
    this.initialHydrationDone = false;
    this.idleCallbackId = null;

    // Smoothness tuning (0.32 = rapid responsive snap, yet buttery smooth)
    this.lerpFactor = 0.32;

    // Dimensions
    this.nativeWidth = 720;
    this.nativeHeight = 1280;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.initCanvas();
    this.bindEvents();
  }

  initCanvas() {
    this.resize();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.renderCurrentFrame(true);
    }, { passive: true });
  }

  getDeviceConfig() {
    const isMobile = window.innerWidth <= 768;
    return {
      isMobile,
      // Maximum concurrent image downloads (prevents edge flooding and queue bloat)
      maxConcurrent: isMobile ? 2 : 4,
      // Initial critical frames loaded before unlocking UI (prevents 300-frame burst on load)
      initialBatchSize: isMobile ? 5 : 8,
      // Lookahead frames ahead of scroll position
      forwardLookahead: isMobile ? 8 : 14,
      // Trailing buffer frames for quick scroll reversals
      backwardLookahead: isMobile ? 3 : 5,
      // Stationary buffer when user stops scrolling
      stationaryBuffer: isMobile ? 4 : 6,
      // Non-critical lookahead depth during idle
      idlePrefetchCount: isMobile ? 4 : 8
    };
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width <= 768;

    // On mobile, clamp DPR to 1.5 to prevent memory pressure & dropped frames
    this.dpr = isMobile
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Scaling quality & lerp responsiveness
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = isMobile ? 'medium' : 'high';
    this.lerpFactor = isMobile ? 0.48 : 0.32;
  }

  /**
   * Phase 1: Rapid Initial Hydration
   * Loads ONLY the initial/nearby frames required for the first viewport (5-8 frames).
   * Unlocks interaction immediately, reducing initial edge requests by >97%.
   */
  async startPreloading() {
    const config = this.getDeviceConfig();

    // Check starting position (handles page refresh or direct anchor links)
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const initialProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
    const startCenterFrame = Math.round(initialProgress * (this.totalFrames - 1));

    const initialBatchCount = config.initialBatchSize;
    const initialIndices = [];

    for (let i = 0; i < initialBatchCount; i++) {
      const idx = Math.min(this.totalFrames - 1, Math.max(0, startCenterFrame + i));
      if (!initialIndices.includes(idx)) {
        initialIndices.push(idx);
      }
    }

    let initialLoaded = 0;
    const criticalPromises = initialIndices.map(index => {
      return this.fetchFrame(index).then(() => {
        initialLoaded++;
        const percent = Math.round((initialLoaded / initialIndices.length) * 100);
        this.onProgress(initialLoaded, initialIndices.length, percent);
      });
    });

    await Promise.all(criticalPromises);

    this.initialHydrationDone = true;
    this.targetFrame = startCenterFrame;
    this.currentFrame = startCenterFrame;

    // Draw initial frame
    this.renderCurrentFrame(true);
    this.onInitialReady();

    // Schedule gentle idle lookahead only if user remains idle
    this.scheduleIdlePreload();
  }

  /**
   * Fetch a single frame, taking advantage of standard browser caching
   */
  fetchFrame(index) {
    if (this.loadedStatus[index] && this.images[index]) {
      return Promise.resolve(this.images[index]);
    }
    if (this.inFlight.has(index)) {
      return this.inFlightPromises.get(index) || Promise.resolve(null);
    }

    this.inFlight.add(index);

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = this.framePathPattern(index);

      img.onload = () => {
        this.inFlight.delete(index);
        this.inFlightPromises.delete(index);
        this.images[index] = img;

        if (!this.loadedStatus[index]) {
          this.loadedStatus[index] = true;
          this.loadedCount++;
        }

        // If the newly loaded frame is the active target or immediate neighbor, refresh canvas
        const currentRounded = Math.round(this.currentFrame);
        if (Math.abs(index - currentRounded) <= 1) {
          this.renderCurrentFrame(true);
        }

        // Keep pumping queue
        this.processQueue();
        resolve(img);
      };

      img.onerror = () => {
        this.inFlight.delete(index);
        this.inFlightPromises.delete(index);
        this.processQueue();
        resolve(null);
      };
    });

    this.inFlightPromises.set(index, promise);
    return promise;
  }

  /**
   * Updates sliding window buffer around current scroll position.
   * Cancels/deprioritizes unneeded requests on direction reversal.
   */
  updateFrameWindow() {
    const config = this.getDeviceConfig();
    const F = Math.round(this.targetFrame);

    let minFrame, maxFrame;
    if (this.scrollDirection === 1) {
      // Forward scroll: look ahead forward, keep small trailing buffer
      minFrame = Math.max(0, F - config.backwardLookahead);
      maxFrame = Math.min(this.totalFrames - 1, F + config.forwardLookahead);
    } else if (this.scrollDirection === -1) {
      // Backward scroll: look ahead backward, keep small forward buffer
      minFrame = Math.max(0, F - config.forwardLookahead);
      maxFrame = Math.min(this.totalFrames - 1, F + config.backwardLookahead);
    } else {
      // Stationary: balanced buffer
      minFrame = Math.max(0, F - config.stationaryBuffer);
      maxFrame = Math.min(this.totalFrames - 1, F + config.stationaryBuffer);
    }

    // 1. Purge unstarted queue items outside the active window (cancellation)
    this.pendingQueue = this.pendingQueue.filter(idx => idx >= minFrame && idx <= maxFrame);

    // 2. Discover frames within the window that need loading
    const framesToQueue = [];
    for (let i = minFrame; i <= maxFrame; i++) {
      if (!this.loadedStatus[i] && !this.inFlight.has(i) && !this.pendingQueue.includes(i)) {
        framesToQueue.push(i);
      }
    }

    // 3. Priority Sort: target frame F first, then immediate path of travel
    this.pendingQueue.push(...framesToQueue);
    this.pendingQueue.sort((a, b) => {
      const distA = Math.abs(a - F);
      const distB = Math.abs(b - F);

      const isAheadA = (this.scrollDirection === 1 && a >= F) || (this.scrollDirection === -1 && a <= F);
      const isAheadB = (this.scrollDirection === 1 && b >= F) || (this.scrollDirection === -1 && b <= F);

      const scoreA = distA + (isAheadA ? 0 : 8);
      const scoreB = distB + (isAheadB ? 0 : 8);

      return scoreA - scoreB;
    });

    this.processQueue();
    this.scheduleIdlePreload();
  }

  /**
   * Concurrency-governed queue processor
   */
  processQueue() {
    const config = this.getDeviceConfig();
    while (this.inFlight.size < config.maxConcurrent && this.pendingQueue.length > 0) {
      const nextIndex = this.pendingQueue.shift();
      if (this.loadedStatus[nextIndex] || this.inFlight.has(nextIndex)) {
        continue;
      }
      this.fetchFrame(nextIndex);
    }
  }

  /**
   * Non-critical lookahead preloading via requestIdleCallback
   */
  scheduleIdlePreload() {
    if (this.idleCallbackId) {
      if (typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(this.idleCallbackId);
      } else {
        clearTimeout(this.idleCallbackId);
      }
      this.idleCallbackId = null;
    }

    const runIdle = (deadline) => {
      this.idleCallbackId = null;
      if (!this.initialHydrationDone) return;

      const config = this.getDeviceConfig();
      const F = Math.round(this.targetFrame);
      const step = this.scrollDirection || 1;

      for (let i = 1; i <= config.idlePrefetchCount; i++) {
        if (deadline && typeof deadline.timeRemaining === 'function' && deadline.timeRemaining() < 4) {
          break;
        }
        const targetIdx = F + (i * step);
        if (targetIdx >= 0 && targetIdx < this.totalFrames) {
          if (!this.loadedStatus[targetIdx] && !this.inFlight.has(targetIdx) && !this.pendingQueue.includes(targetIdx)) {
            this.pendingQueue.push(targetIdx);
          }
        }
      }

      this.processQueue();
    };

    if (typeof requestIdleCallback === 'function') {
      this.idleCallbackId = requestIdleCallback(runIdle, { timeout: 1200 });
    } else {
      this.idleCallbackId = setTimeout(() => runIdle(null), 120);
    }
  }

  /**
   * Set target frame from scroll progress (0.0 -> 1.0)
   */
  setScrollProgress(progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const newTargetFrame = clampedProgress * (this.totalFrames - 1);
    
    // Detect scroll direction
    const delta = newTargetFrame - this.targetFrame;
    if (Math.abs(delta) > 0.05) {
      this.scrollDirection = delta > 0 ? 1 : -1;
    }

    this.targetFrame = newTargetFrame;

    if (this.initialHydrationDone) {
      this.updateFrameWindow();
    }
    
    if (!this.isRendering) {
      this.startRenderLoop();
    }
  }

  startRenderLoop() {
    this.isRendering = true;
    const loop = () => {
      const diff = this.targetFrame - this.currentFrame;

      if (Math.abs(diff) > 0.005) {
        this.currentFrame += diff * this.lerpFactor;
        this.renderCurrentFrame();
        requestAnimationFrame(loop);
      } else {
        this.currentFrame = this.targetFrame;
        this.renderCurrentFrame();
        this.isRendering = false;
        this.scheduleIdlePreload();
      }
    };

    requestAnimationFrame(loop);
  }

  /**
   * Find nearest loaded frame if current frame is not yet in cache.
   * Searches outwards symmetrically to guarantee zero blank frames during rapid scrubbing.
   */
  getNearestLoadedFrame(idealIndex) {
    const rounded = Math.round(idealIndex);
    if (this.images[rounded]) return this.images[rounded];

    // Outward search from closest to furthest
    for (let offset = 1; offset < this.totalFrames; offset++) {
      if (rounded - offset >= 0 && this.images[rounded - offset]) {
        return this.images[rounded - offset];
      }
      if (rounded + offset < this.totalFrames && this.images[rounded + offset]) {
        return this.images[rounded + offset];
      }
    }
    // Fallback to any loaded frame
    return this.images.find(img => img !== null) || null;
  }

  renderCurrentFrame(force = false) {
    const frameIndex = Math.max(0, Math.min(this.totalFrames - 1, Math.round(this.currentFrame)));

    if (!force && frameIndex === this.lastRenderedIndex) {
      return;
    }

    const img = this.getNearestLoadedFrame(frameIndex);
    if (!img) return;

    this.lastRenderedIndex = frameIndex;

    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Fill background with exact deep space dark color matching frame edge
    ctx.fillStyle = '#080c10';
    ctx.fillRect(0, 0, cw, ch);

    // Calculate aspect fit (contain) logic
    const imgAspect = this.nativeWidth / this.nativeHeight;
    const canvasAspect = cw / ch;

    let drawW, drawH, drawX, drawY;

    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      if (canvasAspect > imgAspect) {
        // Screen is wider than 9:16 (Desktop)
        // Scaled up by ~28% for cinematic prominence
        const scaleMultiplier = window.innerWidth < 1024 ? 0.98 : 1.18;
        drawH = ch * scaleMultiplier;
        drawW = drawH * imgAspect;
        drawX = (cw - drawW) / 2;
        drawY = (ch - drawH) / 2;
      } else {
        // Desktop portrait orientation fallback
        const scaleMultiplier = 0.98;
        drawW = cw * scaleMultiplier;
        drawH = drawW / imgAspect;
        drawX = (cw - drawW) / 2;
        drawY = (ch - drawH) / 2;
      }
    } else {
      // Mobile / Phone Portrait: Framed in upper visual stage
      const maxStageH = ch * 0.46;
      drawH = Math.min(maxStageH, (cw * 0.88) / imgAspect);
      drawW = drawH * imgAspect;
      drawX = (cw - drawW) / 2;

      // In chapter 1 (intro), smoothly glide from center to top stage
      const heroShiftRatio = Math.max(0, 1 - (this.currentFrame / (this.totalFrames * 0.12)));
      const heroCenterY = (ch - drawH) / 2 * 0.7;
      const topStageY = Math.max(16, ch * 0.04);
      drawY = topStageY + (heroCenterY - topStageY) * heroShiftRatio;
    }

    // Draw the active image frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Subtle edge vignette to blend effortlessly on ultra-wide screens
    this.renderSubtleEdgeBlend(cw, ch);
  }

  renderSubtleEdgeBlend(cw, ch) {
    if (window.innerWidth <= 768) return;

    const gradient = this.ctx.createRadialGradient(
      cw / 2, ch / 2, Math.min(cw, ch) * 0.35,
      cw / 2, ch / 2, Math.max(cw, ch) * 0.75
    );
    gradient.addColorStop(0, 'rgba(8, 12, 16, 0)');
    gradient.addColorStop(0.85, 'rgba(8, 12, 16, 0.4)');
    gradient.addColorStop(1, 'rgba(8, 12, 16, 0.95)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, cw, ch);
  }

  getCurrentFrameIndex() {
    return Math.round(this.currentFrame);
  }
}

