/**
 * GIF Exporter
 * Captures animation frames and exports as animated GIF
 */
import GIF from 'gif.js';
import html2canvas from 'html2canvas';

export class GifExporter {
  constructor(animationController, map) {
    this.animationController = animationController;
    this.map = map;
    this.isExporting = false;
    this.onProgress = null;
    this.onComplete = null;
  }

  /**
   * Export animation as GIF
   */
  async export(options = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }

    const {
      startDate,
      endDate,
      duration = 10, // seconds
      width = 1200,
      height = 800,
      fps = 15,
      quality = 10 // 1-30, lower is better quality but slower
    } = options;

    console.log('Starting export with options:', { startDate, endDate, duration, width, height, fps, quality });

    this.isExporting = true;

    try {
      // Calculate frame count
      const frameCount = Math.floor(duration * fps);
      const frames = [];

      console.log(`Will capture ${frameCount} frames`);

      // Update progress
      this._updateProgress(0, `Capturing ${frameCount} frames...`);

      // Save current animation state
      const wasPlaying = this.animationController.isPlaying;
      this.animationController.pause();

      // Hide controls temporarily
      const controls = document.getElementById('controls');
      const originalControlsDisplay = controls.style.display;
      controls.style.display = 'none';

      // Calculate time step between frames
      const totalTime = endDate - startDate;
      const timeStep = totalTime / frameCount;

      // Capture frames
      for (let i = 0; i < frameCount; i++) {
        // Calculate current time for this frame
        const currentTime = new Date(startDate.getTime() + (timeStep * i));

        // Seek animation to this time
        this.animationController.seek(currentTime);

        // Wait for map to render
        await this._waitForMapRender();

        // Capture frame
        const canvas = await this._captureMapCanvas(width, height);
        frames.push(canvas);

        // Update progress
        const progress = ((i + 1) / frameCount) * 50; // First 50% is frame capture
        this._updateProgress(progress, `Captured frame ${i + 1}/${frameCount}`);
      }

      // Restore controls
      controls.style.display = originalControlsDisplay;

      // Restore animation state
      if (wasPlaying) {
        this.animationController.play();
      }

      // Create GIF
      this._updateProgress(50, 'Encoding GIF...');
      const gifBlob = await this._encodeGif(frames, fps, quality, width, height);

      // Complete
      this._updateProgress(100, 'Complete!');
      this.isExporting = false;

      if (this.onComplete) {
        this.onComplete(gifBlob);
      }

      return gifBlob;

    } catch (error) {
      this.isExporting = false;
      throw error;
    }
  }

  /**
   * Capture map as canvas
   */
  async _captureMapCanvas(width, height) {
    const mapContainer = document.getElementById('map');

    const canvas = await html2canvas(mapContainer, {
      width: width,
      height: height,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#f0f0f0',
      scale: 1,
      logging: false
    });

    return canvas;
  }

  /**
   * Wait for map tiles to load
   */
  _waitForMapRender() {
    return new Promise(resolve => {
      // Give map time to render tiles
      setTimeout(resolve, 100);
    });
  }

  /**
   * Encode frames as GIF
   */
  _encodeGif(canvases, fps, quality, width, height) {
    return new Promise((resolve, reject) => {
      try {
        const gif = new GIF({
          workers: 2,
          quality: quality,
          width: width,
          height: height,
          workerScript: new URL('/node_modules/gif.js/dist/gif.worker.js', import.meta.url).href
        });

        console.log('GIF encoder created, adding frames...');

        // Add frames to GIF
        const frameDelay = 1000 / fps; // ms between frames
        canvases.forEach((canvas, index) => {
          console.log(`Adding frame ${index + 1}/${canvases.length}`);
          gif.addFrame(canvas, { delay: frameDelay, copy: true });
        });

        console.log('All frames added, starting render...');

        // Handle encoding progress
        gif.on('progress', (progress) => {
          const totalProgress = 50 + (progress * 50); // Second 50% is encoding
          this._updateProgress(totalProgress, `Encoding GIF... ${Math.round(progress * 100)}%`);
        });

        // Handle completion
        gif.on('finished', (blob) => {
          console.log('GIF encoding complete!', blob);
          resolve(blob);
        });

        // Handle errors
        gif.on('error', (error) => {
          console.error('GIF encoding error:', error);
          reject(error);
        });

        // Start encoding
        gif.render();
      } catch (error) {
        console.error('Error creating GIF encoder:', error);
        reject(error);
      }
    });
  }

  /**
   * Update progress callback
   */
  _updateProgress(percent, message) {
    if (this.onProgress) {
      this.onProgress(percent, message);
    }
  }

  /**
   * Download blob as file
   */
  static download(blob, filename = 'strava-animation.gif') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
