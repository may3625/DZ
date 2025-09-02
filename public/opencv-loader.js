// OpenCV.js Loader and Initialization
console.log('📸 OpenCV.js loader initialized');

// Global OpenCV state
window.__OPENCV_STATE__ = {
  isLoading: false,
  isLoaded: false,
  error: null,
  version: null
};

// Mock OpenCV object to prevent undefined errors
window.cv = window.cv || {
  Mat: function() {
    console.warn('⚠️ OpenCV not loaded, using mock Mat');
    return { delete: function() {} };
  },
  imread: function() {
    console.warn('⚠️ OpenCV not loaded, using mock imread');
    return window.cv.Mat();
  },
  cvtColor: function() {
    console.warn('⚠️ OpenCV not loaded, using mock cvtColor');
  },
  HoughLinesP: function() {
    console.warn('⚠️ OpenCV not loaded, using mock HoughLinesP');
  },
  COLOR_BGR2GRAY: 6,
  COLOR_RGB2GRAY: 7,
  onRuntimeInitialized: function() {
    console.log('📸 OpenCV runtime initialized (mock)');
  }
};

// Function to load OpenCV.js
window.loadOpenCV = function() {
  return new Promise((resolve, reject) => {
    if (window.__OPENCV_STATE__.isLoaded) {
      resolve(window.cv);
      return;
    }

    if (window.__OPENCV_STATE__.isLoading) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (window.__OPENCV_STATE__.isLoaded) {
          clearInterval(checkInterval);
          resolve(window.cv);
        } else if (window.__OPENCV_STATE__.error) {
          clearInterval(checkInterval);
          reject(window.__OPENCV_STATE__.error);
        }
      }, 100);
      return;
    }

    window.__OPENCV_STATE__.isLoading = true;

    try {
      // Load OpenCV.js strictly from local file
      const script = document.createElement('script');
      script.async = true;
      script.src = '/opencv/opencv.js';
      
      script.onload = () => {
        // Wait for OpenCV to initialize
        if (window.cv && typeof window.cv.Mat === 'function') {
          window.__OPENCV_STATE__.isLoaded = true;
          window.__OPENCV_STATE__.isLoading = false;
          window.__OPENCV_STATE__.version = 'local';
          console.log('✅ OpenCV.js loaded from local');
          resolve(window.cv);
        } else {
          // OpenCV not ready, wait for it
          window.cv.onRuntimeInitialized = () => {
            window.__OPENCV_STATE__.isLoaded = true;
            window.__OPENCV_STATE__.isLoading = false;
            window.__OPENCV_STATE__.version = 'local';
            console.log('✅ OpenCV.js runtime initialized (local)');
            resolve(window.cv);
          };
        }
      };

      script.onerror = () => {
        window.__OPENCV_STATE__.isLoading = false;
        window.__OPENCV_STATE__.error = new Error('Failed to load OpenCV.js from local file');
        console.warn('⚠️ Failed to load OpenCV.js locally, using mock implementation');
        
        // Enhance mock implementation
        window.cv.Mat = class MockMat {
          constructor(rows, cols, type, scalar) {
            this.rows = rows || 0;
            this.cols = cols || 0;
            this.type = type || 0;
            this.data = new Uint8Array(this.rows * this.cols * 4);
          }
          delete() {}
          clone() { return new MockMat(this.rows, this.cols, this.type); }
        };

        resolve(window.cv);
      };

      document.head.appendChild(script);
    } catch (error) {
      window.__OPENCV_STATE__.isLoading = false;
      window.__OPENCV_STATE__.error = error;
      reject(error);
    }
  });
};

// Auto-load OpenCV when ready
document.addEventListener('DOMContentLoaded', () => {
  // Only auto-load if not in an iframe to avoid issues
  if (window === window.top) {
    window.loadOpenCV().catch(error => {
      console.warn('⚠️ OpenCV auto-load failed:', error.message);
    });
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { loadOpenCV: window.loadOpenCV };
}