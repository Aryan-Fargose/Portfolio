/**
 * High-Performance Canvas Image-Sequence Renderer
 * 
 * Features:
 * - 300-frame sequential animation scrubbing
 * - Smart progressive preloading (critical frames first, then progressive batches)
 * - requestAnimationFrame render loop with smooth lerping
 * - High-DPI / Retina display support
 * - Aspect-ratio contain logic with seamless dark background matching
 * - Nearest-frame fallback during high-speed scrubbing (zero blank frames)
 * - Memory-efficient Image caching
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

    // State
    this.images = new Array(this.totalFrames).fill(null);
    this.loadedStatus = new Array(this.totalFrames).fill(false);
    this.loadedCount = 0;
    this.targetFrame = 0;
    this.currentFrame = 0;
    this.isRendering = false;
    this.lastRenderedIndex = -1;

    // Smoothness tuning (0.3 = rapid responsive snap, yet buttery smooth)
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

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // High quality scaling
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Two-phase loading:
   * Phase 1: Load first 25 frames immediately so user can view & interact instantly.
   * Phase 2: Progressively preload remaining frames in staggered batches.
   */
  async startPreloading() {
    const criticalBatchCount = Math.min(25, this.totalFrames);
    const criticalPromises = [];

    // 1. Critical first frames
    for (let i = 0; i < criticalBatchCount; i++) {
      criticalPromises.push(this.loadFrame(i));
    }

    await Promise.all(criticalPromises);
    
    // Draw initial frame
    this.renderCurrentFrame(true);
    this.onInitialReady();

    // 2. Progressive background preload for remainder
    this.preloadRemainder(criticalBatchCount);
  }

  loadFrame(index) {
    return new Promise((resolve) => {
      if (this.images[index]) {
        resolve(this.images[index]);
        return;
      }

      const img = new Image();
      img.decoding = 'async';
      img.src = this.framePathPattern(index);

      img.onload = () => {
        this.images[index] = img;
        if (!this.loadedStatus[index]) {
          this.loadedStatus[index] = true;
          this.loadedCount++;
          const percent = Math.floor((this.loadedCount / this.totalFrames) * 100);
          this.onProgress(this.loadedCount, this.totalFrames, percent);
        }
        resolve(img);
      };

      img.onerror = () => {
        // Fallback or retry
        resolve(null);
      };
    });
  }

  async preloadRemainder(startIndex) {
    const batchSize = 6;
    for (let i = startIndex; i < this.totalFrames; i += batchSize) {
      const batchPromises = [];
      for (let j = i; j < i + batchSize && j < this.totalFrames; j++) {
        batchPromises.push(this.loadFrame(j));
      }
      await Promise.all(batchPromises);

      // Yield briefly to main thread to maintain 60-120fps scrolling
      await new Promise(r => setTimeout(r, 16));
    }

    this.onAllLoaded();
  }

  /**
   * Set target frame from scroll progress (0.0 -> 1.0)
   */
  setScrollProgress(progress) {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    this.targetFrame = clampedProgress * (this.totalFrames - 1);
    
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
      }
    };

    requestAnimationFrame(loop);
  }

  /**
   * Find nearest loaded frame if current frame is not yet in cache
   */
  getNearestLoadedFrame(idealIndex) {
    const rounded = Math.round(idealIndex);
    if (this.images[rounded]) return this.images[rounded];

    // Search outwards
    for (let offset = 1; offset < 30; offset++) {
      if (rounded - offset >= 0 && this.images[rounded - offset]) {
        return this.images[rounded - offset];
      }
      if (rounded + offset < this.totalFrames && this.images[rounded + offset]) {
        return this.images[rounded + offset];
      }
    }
    // Return first loaded frame if any
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

    if (canvasAspect > imgAspect) {
      // Screen is wider than 9:16 (Desktop)
      // Scaled up by ~28% (within the 30% broader boundary) for cinematic prominence
      const scaleMultiplier = window.innerWidth < 1024 ? 0.98 : 1.18;
      drawH = ch * scaleMultiplier;
      drawW = drawH * imgAspect;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    } else {
      // Screen is narrower (Mobile / portrait)
      const scaleMultiplier = 0.98;
      drawW = cw * scaleMultiplier;
      drawH = drawW / imgAspect;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2;
    }

    // Draw the active image frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Subtle edge vignette to blend effortlessly on ultra-wide screens
    this.renderSubtleEdgeBlend(cw, ch);
  }

  renderSubtleEdgeBlend(cw, ch) {
    // Subtle radial gradient overlay to eliminate any hard seam at frame edges
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
