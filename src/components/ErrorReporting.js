import React, { useState, useCallback, useEffect } from 'react';
import { Bug, Camera, Send, X, AlertTriangle, Monitor, User, Globe, Clock, Smartphone, AlertCircle, Zap, ZoomIn, Download, Eye } from 'lucide-react';

const ErrorReportingSystem = ({ onClose }) => {  // Add onClose prop support
  const [isReportModalOpen, setIsReportModalOpen] = useState(true); // Set to true by default when component loads
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [detectedErrors, setDetectedErrors] = useState([]);
  const [reportData, setReportData] = useState({
    errorType: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    userEmail: '',
    userName: '',
    severity: 'medium',
    autoDetected: false
  });
  const [reportStatus, setReportStatus] = useState(null);
  const [lastError, setLastError] = useState(null);

  // EmailJS Configuration
  const EMAILJS_CONFIG = {
    publicKey: 'UHRY4qzQjBqLIfc1g', // Replace with your actual public key
    serviceId: 'service_myboq_titan',
    templateId: 'template_myboq_error_report'
  };

  // Auto error detection
  useEffect(() => {
    // Global error handler
    const handleError = (event) => {
      const error = {
        type: 'JavaScript Error',
        message: event.message || 'Unknown error',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        stack: event.error?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      setLastError(error);
      setDetectedErrors(prev => [error, ...prev.slice(0, 9)]);
      
      if (!isReportModalOpen) {
        setReportData(prev => ({
          ...prev,
          errorType: 'Runtime Error',
          description: `JavaScript Error: ${error.message}\n\nFile: ${error.filename}\nLine: ${error.lineno}:${error.colno}`,
          severity: 'high',
          autoDetected: true
        }));
      }
    };

    // Promise rejection handler
    const handleUnhandledRejection = (event) => {
      const error = {
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason || 'Unknown promise rejection',
        stack: event.reason?.stack || 'No stack trace',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      setLastError(error);
      setDetectedErrors(prev => [error, ...prev.slice(0, 9)]);
      
      if (!isReportModalOpen) {
        setReportData(prev => ({
          ...prev,
          errorType: 'Runtime Error',
          description: `Promise Rejection: ${error.message}`,
          severity: 'high',
          autoDetected: true
        }));
      }
    };

    // Network error detection
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const error = {
            type: 'Network Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          };

          setLastError(error);
          setDetectedErrors(prev => [error, ...prev.slice(0, 9)]);
          
          if (!isReportModalOpen && response.status >= 500) {
            setReportData(prev => ({
              ...prev,
              errorType: `Server Error (${response.status})`,
              description: `${response.status} ${response.statusText} error occurred while accessing: ${args[0]}`,
              severity: response.status >= 500 ? 'high' : 'medium',
              autoDetected: true
            }));
          }
        }
        
        return response;
      } catch (error) {
        const errorInfo = {
          type: 'Network Connection Error',
          message: error.message,
          url: args[0],
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        };

        setLastError(errorInfo);
        setDetectedErrors(prev => [errorInfo, ...prev.slice(0, 9)]);
        
        if (!isReportModalOpen) {
          setReportData(prev => ({
            ...prev,
            errorType: 'Network Connection Error',
            description: `Failed to connect to server: ${error.message}\n\nURL: ${args[0]}`,
            severity: 'high',
            autoDetected: true
          }));
        }
        
        throw error;
      }
    };

    // Console error detection
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const error = {
        type: 'Console Error',
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      setLastError(error);
      setDetectedErrors(prev => [error, ...prev.slice(0, 9)]);
      
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch;
      console.error = originalConsoleError;
    };
  }, [isReportModalOpen]);

  // Enhanced screenshot capture for full window
 // Enhanced screenshot capture with proper image handling
const captureScreenshot = useCallback(async () => {
  setIsCapturing(true);
  
  try {
    // Function to load html2canvas as a script
    const loadHtml2Canvas = () => {
      return new Promise((resolve, reject) => {
        if (window.html2canvas) {
          resolve(window.html2canvas);
          return;
        }

        const existingScript = document.querySelector('script[src*="html2canvas"]');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          if (window.html2canvas) {
            resolve(window.html2canvas);
          } else {
            reject(new Error('html2canvas not found after loading'));
          }
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load html2canvas script'));
        };
        
        document.head.appendChild(script);
        
        setTimeout(() => {
          if (window.html2canvas) {
            resolve(window.html2canvas);
          } else {
            reject(new Error('html2canvas loading timeout'));
          }
        }, 5000);
      });
    };

    // Function to preload and fix images for CORS
    const fixImagesForCapture = async () => {
      const images = document.querySelectorAll('img');
      const imagePromises = [];
      
      images.forEach((img, index) => {
        if (!img.src || img.src.startsWith('data:')) return;
        
        const promise = new Promise((resolve) => {
          try {
            // Create a new image element
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            
            newImg.onload = () => {
              try {
                // Create canvas to convert image to data URL
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = newImg.naturalWidth || newImg.width;
                canvas.height = newImg.naturalHeight || newImg.height;
                
                // Draw image to canvas
                ctx.drawImage(newImg, 0, 0);
                
                // Convert to data URL
                const dataURL = canvas.toDataURL('image/png');
                
                // Replace original image src with data URL
                img.setAttribute('data-original-src', img.src);
                img.src = dataURL;
                
                resolve();
              } catch (canvasError) {
                console.warn('Canvas conversion failed for image:', img.src, canvasError);
                resolve(); // Continue even if this image fails
              }
            };
            
            newImg.onerror = () => {
              console.warn('Failed to load image for CORS fix:', img.src);
              resolve(); // Continue even if image fails to load
            };
            
            // Set source to trigger loading
            newImg.src = img.src;
            
          } catch (error) {
            console.warn('Error processing image:', img.src, error);
            resolve();
          }
        });
        
        imagePromises.push(promise);
      });
      
      // Wait for all images to be processed (with timeout)
      const timeout = new Promise(resolve => setTimeout(resolve, 3000));
      await Promise.race([Promise.all(imagePromises), timeout]);
    };

    // Function to restore original image sources
    const restoreImages = () => {
      const images = document.querySelectorAll('img[data-original-src]');
      images.forEach(img => {
        img.src = img.getAttribute('data-original-src');
        img.removeAttribute('data-original-src');
      });
    };

    console.log('Loading html2canvas...');
    const html2canvas = await loadHtml2Canvas();
    console.log('html2canvas loaded successfully');

    // Store elements to restore later
    const elementsToRestore = [];
    
    // Hide capturing overlay
    const capturingOverlays = document.querySelectorAll('[data-capturing="true"]');
    capturingOverlays.forEach(el => {
      elementsToRestore.push({ element: el, originalDisplay: el.style.display });
      el.style.display = 'none';
    });

    // Hide modal
    const mainModal = document.querySelector('[data-modal="error-report"]');
    if (mainModal) {
      elementsToRestore.push({ element: mainModal, originalDisplay: mainModal.style.display });
      mainModal.style.display = 'none';
    }

    // Hide other interfering elements
    const interfering = document.querySelectorAll(
      '.fixed.inset-0, .fixed.z-40, .fixed.z-50, [data-modal]:not([data-modal="error-report"])'
    );
    
    interfering.forEach(el => {
      if (el.style.display !== 'none') {
        elementsToRestore.push({ element: el, originalDisplay: el.style.display });
        el.style.display = 'none';
      }
    });

    console.log('Processing images for CORS...');
    // Fix images for CORS before capture
    await fixImagesForCapture();

    // Let DOM settle after image processing
    await new Promise(resolve => {
      requestAnimationFrame(() => setTimeout(resolve, 500));
    });
    
    console.log('Starting html2canvas capture...');
    
    // Capture with enhanced options for images
    const canvas = await html2canvas(document.body, {
      // Full page capture
      height: Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        window.innerHeight
      ),
      width: Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        window.innerWidth
      ),
      scrollX: 0,
      scrollY: 0,
      
      // CORS and image settings
      useCORS: true,          // Enable CORS
      allowTaint: true,       // Allow tainted images
      foreignObjectRendering: true, // Better rendering
      
      // Quality settings
      scale: 1,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,    // Longer timeout for images
      
      // Element filtering
      ignoreElements: (element) => {
        return (
          element.hasAttribute('data-capturing') ||
          element.hasAttribute('data-modal') ||
          element.classList.contains('animate-spin') ||
          element.classList.contains('animate-pulse') ||
          (element.style.position === 'fixed' && parseInt(element.style.zIndex || '0') > 1000)
        );
      },
      
      // Callback to modify cloned document
      onclone: (clonedDoc, element) => {
        // Remove problematic elements from clone
        const modalsInClone = clonedDoc.querySelectorAll(
          '[data-modal], [data-capturing], .animate-spin, .animate-pulse'
        );
        modalsInClone.forEach(el => el.remove());
        
        // Ensure all images in clone have proper sources
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach(img => {
          if (img.src && !img.src.startsWith('data:')) {
            // Force reload with crossorigin
            img.crossOrigin = 'anonymous';
            img.loading = 'eager';
          }
        });
      }
    });
    
    console.log('Canvas created, converting to image...');
    
    // Convert to high-quality JPEG
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    setScreenshot(dataURL);
    
    console.log('Screenshot captured successfully');
    
    // Restore original image sources
    restoreImages();
    
    // Restore all hidden elements
    elementsToRestore.forEach(({ element, originalDisplay }) => {
      element.style.display = originalDisplay || '';
    });
    
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    
    // Restore images on error
    const images = document.querySelectorAll('img[data-original-src]');
    images.forEach(img => {
      img.src = img.getAttribute('data-original-src');
      img.removeAttribute('data-original-src');
    });
    
    // Restore elements on error
    const allHiddenElements = document.querySelectorAll('[style*="display: none"]');
    allHiddenElements.forEach(el => {
      if (el.hasAttribute('data-capturing') || el.hasAttribute('data-modal')) {
        el.style.display = '';
      }
    });
    
    // User friendly error message
    let errorMsg = 'Screenshot capture failed. ';
    if (error.message.includes('html2canvas')) {
      errorMsg += 'Could not load screenshot library.';
    } else if (error.message.includes('CORS') || error.message.includes('tainted')) {
      errorMsg += 'Some images could not be captured due to security restrictions.';
    } else {
      errorMsg += error.message;
    }
    errorMsg += ' You can still submit the report.';
    
    alert(errorMsg);
    
  } finally {
    setIsCapturing(false);
  }
}, []);

// Enhanced CSS styles for better capture
const captureStyles = `
  .screenshot-capturing {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(0, 0, 0, 0.8) !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    pointer-events: none !important;
  }
  
  .screenshot-capturing .capture-modal {
    pointer-events: auto !important;
    background: white !important;
    padding: 24px !important;
    border-radius: 12px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
    max-width: 320px !important;
    text-align: center !important;
  }

  /* Ensure images are visible during capture */
  img {
    image-rendering: auto !important;
    image-rendering: crisp-edges !important;
    image-rendering: pixelated !important;
  }

  /* Hide problematic elements during capture */
  .screenshot-hide {
    display: none !important;
    visibility: hidden !important;
  }
  
  /* Ensure proper image loading */
  img[crossorigin] {
    opacity: 1 !important;
  }
`;

// Add styles to document head
React.useEffect(() => {
  const styleElement = document.createElement('style');
  styleElement.textContent = captureStyles;
  document.head.appendChild(styleElement);
  
  return () => {
    if (document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
    }
  };
}, []);

  // Download screenshot
  const downloadScreenshot = () => {
    if (!screenshot) return;
    
    const link = document.createElement('a');
    link.download = `error-screenshot-${Date.now()}.jpg`;
    link.href = screenshot;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get system information
 const getSystemInfo = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages?.join(', ') || navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`, // Fixed: window.screen instead of screen
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: window.screen.colorDepth,   // Fixed: window.screen instead of screen
    pixelDepth: window.screen.pixelDepth,   // Fixed: window.screen instead of screen
    url: window.location.href,
    protocol: window.location.protocol,
    host: window.location.host,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    referrer: document.referrer || 'Direct access',
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    connectionType: connection?.effectiveType || 'Unknown',
    connectionSpeed: connection?.downlink ? `${connection.downlink} Mbps` : 'Unknown',
    memoryUsage: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    } : 'Not available'
  };
};


  // Get user info from storage
  const getUserInfo = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = localStorage.getItem('userEmail') || localStorage.getItem('email') || user.email;
      const userName = localStorage.getItem('fullName') || localStorage.getItem('userName') || user.name || user.fullName;
      const userId = localStorage.getItem('Id') || localStorage.getItem('id') || user.id;
      
      return {
        user,
        email: userEmail || '',
        name: userName || '',
        id: userId || ''
      };
    } catch (error) {
      return { user: {}, email: '', name: '', id: '' };
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate error report ID
  const generateReportId = () => {
    return 'ERR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  // Send error report
  const sendErrorReport = async () => {
    setIsSending(true);
    setReportStatus(null);

    try {
      // Initialize EmailJS
      const emailjs = await import('@emailjs/browser');
      
      const systemInfo = getSystemInfo();
      const userInfo = getUserInfo();
      const reportId = generateReportId();

      // Prepare comprehensive email data matching template
      const emailData = {
        // Basic Info
        report_id: reportId,
        auto_detected: reportData.autoDetected ? 'YES' : 'NO',
        auto_detected_text: reportData.autoDetected ? 'This error was automatically detected by the system' : 'This error was manually reported by the user',
        severity: reportData.severity.toUpperCase(),
        local_time: systemInfo.localTime,
        
        // User Information
        user_name: reportData.userName || userInfo.name || 'Not provided',
        user_email: reportData.userEmail || userInfo.email || 'Not provided',
        user_id: userInfo.id || 'Not available',
        
        // Error Details
        error_type: reportData.errorType,
        description: reportData.description,
        steps_to_reproduce: reportData.stepsToReproduce || '',
        expected_behavior: reportData.expectedBehavior || '',
        actual_behavior: reportData.actualBehavior || '',
        
        // Screenshot
        has_screenshot: screenshot ? true : false,
        screenshot_data: screenshot || '',
        
        // System Information
        current_url: systemInfo.url,
        browser_info: systemInfo.userAgent,
        platform: systemInfo.platform,
        screen_resolution: systemInfo.screenResolution,
        window_size: systemInfo.windowSize,
        languages: systemInfo.languages,
        timezone: systemInfo.timezone,
        connection_type: systemInfo.connectionType,
        connection_speed: systemInfo.connectionSpeed,
        memory_usage: typeof systemInfo.memoryUsage === 'object' 
          ? JSON.stringify(systemInfo.memoryUsage) 
          : systemInfo.memoryUsage,
        
        // Error History
        recent_errors: detectedErrors.length > 0 ? JSON.stringify(detectedErrors.slice(0, 3), null, 2) : '',
        
        // Technical Details
        localStorage_keys: Object.keys(localStorage).join(', '),
        sessionStorage_keys: Object.keys(sessionStorage).join(', '),
        current_path: systemInfo.pathname,
        referrer: systemInfo.referrer,
        protocol: systemInfo.protocol,
        host: systemInfo.host,
        
        // Email subject
        subject: `${reportData.autoDetected ? '[AUTO-DETECTED] ' : ''}Bug Report: ${reportData.errorType} - ${reportId}`
      };

      console.log('Sending error report...', reportId);
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        emailData,
        EMAILJS_CONFIG.publicKey
      );

      console.log('Error report sent successfully:', response);
      setReportStatus('success');
      
      // Clear detected errors after successful submission
      setDetectedErrors([]);
      setLastError(null);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        closeReportModal();
      }, 3000);

    } catch (error) {
      console.error('Failed to send error report:', error);
      
      // Enhanced error handling with specific messages
      if (error.status === 400) {
        setReportStatus('template_error');
      } else if (error.status === 401) {
        setReportStatus('auth_error');
      } else if (error.text?.includes('template')) {
        setReportStatus('template_error');
      } else {
        setReportStatus('error');
      }
    } finally {
      setIsSending(false);
    }
  };
 useEffect(() => {
    const userInfo = getUserInfo();
    setReportData(prev => ({
      ...prev,
      userEmail: userInfo.email || '',
      userName: userInfo.name || ''
    }));
  }, []);
  // Open report modal
  const openReportModal = useCallback(() => {
    const userInfo = getUserInfo();
    
    if (!reportData.autoDetected) {
      setReportData({
        errorType: '',
        description: '',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: '',
        userEmail: userInfo.email || '',
        userName: userInfo.name || '',
        severity: 'medium',
        autoDetected: false
      });
    } else {
      setReportData(prev => ({
        ...prev,
        userEmail: userInfo.email || '',
        userName: userInfo.name || ''
      }));
    }
    
    setIsReportModalOpen(true);
  }, [reportData.autoDetected]);

  // Close report modal
 const closeReportModal = () => {
    setIsReportModalOpen(false);
    setScreenshot(null);
    setReportStatus(null);
    setReportData({
      errorType: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      userEmail: '',
      userName: '',
      severity: 'medium',
      autoDetected: false
    });
   if (onClose) {
      onClose();
    }
  };
  // Use last detected error
  const useLastError = () => {
    if (lastError) {
      setReportData(prev => ({
        ...prev,
        errorType: lastError.type === 'Network Error' 
          ? `Server Error (${lastError.status})` 
          : lastError.type,
        description: lastError.message + (lastError.stack ? `\n\nStack Trace:\n${lastError.stack}` : ''),
        severity: lastError.type.includes('Network') && lastError.status >= 500 ? 'high' : 'medium',
        autoDetected: true
      }));
    }
  };

  return (
    <>
      {/* Floating Report Bug Button with Error Count */}
     

      {/* Capture Screenshot Overlay */}
     {isCapturing && (
  <div className="screenshot-capturing" data-capturing="true">
    <div className="capture-modal">
      <div className="flex justify-center mb-4">
        <Camera className="text-blue-600 animate-pulse" size={48} />
      </div>
      <p className="text-lg font-semibold mb-2 text-gray-800">Capturing Screenshot...</p>
      <p className="text-gray-600 mb-4 text-sm">Please wait while we capture the page</p>
      <div className="flex items-center justify-center mb-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <p className="text-xs text-gray-500">This may take a few seconds</p>
    </div>
  </div>
)}


      {/* Screenshot Preview Modal */}
      {isScreenshotModalOpen && screenshot && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center p-4"
    style={{ zIndex: 9998 }} // High z-index but below capture overlay
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setIsScreenshotModalOpen(false);
      }
    }}
  >
    <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold flex items-center text-gray-800">
          <Eye className="mr-2 text-blue-600" size={20} />
          Screenshot Preview
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadScreenshot}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center transition-colors"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
          <button
            onClick={() => setIsScreenshotModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="flex justify-center">
          <img 
            src={screenshot} 
            alt="Full Screenshot" 
            className="max-w-none h-auto border border-gray-300 rounded shadow-lg bg-white"
            style={{ maxWidth: 'none', minWidth: '100%' }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 border-t border-gray-200 p-3 flex-shrink-0">
        <p className="text-xs text-gray-600 text-center">
          💡 Click outside this modal or use the X button to close • 
          Use Download button to save the screenshot
        </p>
      </div>
    </div>
  </div>
)}

      {/* Error Report Modal */}
      {isReportModalOpen && (
    <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    style={{ zIndex: 9990 }} // Lower than screenshot modals
    data-modal="error-report"
  >
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className={`${reportData.autoDetected ? 'bg-orange-600' : 'bg-red-600'} text-white p-6 rounded-t-xl flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {reportData.autoDetected ? (
                      <Zap size={24} className="animate-pulse" />
                    ) : (
                      <Bug size={24} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {reportData.autoDetected ? 'Auto-Detected Error' : 'Report Bug / Error'}
                    </h2>
                    <p className={`${reportData.autoDetected ? 'text-orange-100' : 'text-red-100'} text-sm`}>
                      {reportData.autoDetected 
                        ? 'System automatically detected an issue' 
                        : 'Help us improve myBOQ by reporting issues'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeReportModal}
                  className="text-white hover:text-red-200 p-2 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Error Detection Status */}
              {detectedErrors.length > 0 && (
                <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      📊 {detectedErrors.length} error(s) detected recently
                    </span>
                    {lastError && !reportData.autoDetected && (
                      <button
                        onClick={useLastError}
                        className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition-all"
                      >
                        Use Last Error
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {reportStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    Bug Report Sent Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for helping us improve myBOQ. Our team will investigate the issue.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      {reportData.autoDetected 
                        ? 'Auto-detected error report submitted. You should receive a confirmation email shortly.'
                        : 'You should receive a confirmation email shortly.'
                      }
                      <br />This window will close automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Auto-detected Error Info */}
                  {reportData.autoDetected && lastError && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-800 flex items-center mb-2">
                        <AlertTriangle size={18} className="mr-2" />
                        Auto-Detected Error Details
                      </h3>
                      <div className="text-sm text-orange-700 space-y-1">
                        <div><strong>Type:</strong> {lastError.type}</div>
                        <div><strong>Time:</strong> {new Date(lastError.timestamp).toLocaleString()}</div>
                        {lastError.filename && <div><strong>File:</strong> {lastError.filename}</div>}
                        {lastError.lineno && <div><strong>Line:</strong> {lastError.lineno}:{lastError.colno}</div>}
                        {lastError.status && <div><strong>Status:</strong> {lastError.status}</div>}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Screenshot Section */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <Camera size={18} className="mr-2" />
                        Full Window Screenshot
                      </h3>
                      <button
                        onClick={captureScreenshot}
                        disabled={isCapturing}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                      >
                        <Camera size={16} className="mr-2" />
                        {isCapturing ? 'Capturing...' : 'Capture Full Screen'}
                      </button>
                    </div>
                    
                    {screenshot ? (
                      <div className="relative">
                        <div className="relative group">
                          <img 
                            src={screenshot} 
                            alt="Screenshot Preview" 
                            className="w-full h-48 object-contain bg-gray-100 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setIsScreenshotModalOpen(true)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white bg-opacity-90 px-3 py-2 rounded-full flex items-center">
                              <ZoomIn size={16} className="mr-1" />
                              <span className="text-sm font-medium">Click to view full size</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button
                            onClick={() => setIsScreenshotModalOpen(true)}
                            className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 shadow-lg"
                            title="View full size"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={downloadScreenshot}
                            className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 shadow-lg"
                            title="Download screenshot"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={() => setScreenshot(null)}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
                            title="Remove screenshot"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                          <span>📱 Full window captured</span>
                          <span>🖱️ Click image to view full size</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Monitor className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500 text-sm">No screenshot captured</p>
                        <p className="text-gray-400 text-xs mt-1">Click "Capture Full Screen" to include a complete page screenshot</p>
                      </div>
                    )}
                  </div>

                 
                  {/* Error Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Error Type
                      </label>
                      <select
                        name="errorType"
                        value={reportData.errorType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select error type</option>
                        <option value="Page Not Found (404)">Page Not Found (404)</option>
                        <option value="Server Error (500)">Server Error (500)</option>
                        <option value="Bad Request (400)">Bad Request (400)</option>
                        <option value="Unauthorized (401)">Unauthorized (401)</option>
                        <option value="Runtime Error">Runtime Error</option>
                        <option value="JavaScript Error">JavaScript Error</option>
                        <option value="Network Error">Network Error</option>
                        <option value="Network Connection Error">Network Connection Error</option>
                        <option value="Console Error">Console Error</option>
                        <option value="Unhandled Promise Rejection">Unhandled Promise Rejection</option>
                        <option value="UI/UX Issue">UI/UX Issue</option>
                        <option value="Performance Issue">Performance Issue</option>
                        <option value="Feature Not Working">Feature Not Working</option>
                        <option value="Data Loss">Data Loss</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Severity
                      </label>
                      <select
                        name="severity"
                        value={reportData.severity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="low">Low - Minor inconvenience</option>
                        <option value="medium">Medium - Affects functionality</option>
                        <option value="high">High - Major impact</option>
                        <option value="critical">Critical - System unusable</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        name="userName"
                        value={reportData.userName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        name="userEmail"
                        value={reportData.userEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Error Description
                    </label>
                    <textarea
                      name="description"
                      value={reportData.description}
                      onChange={handleInputChange}
                      rows={reportData.autoDetected ? 6 : 3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Briefly describe what went wrong..."
                    />
                    {reportData.autoDetected && (
                      <p className="text-xs text-orange-600 mt-1">
                        ✨ Auto-populated based on detected error. You can modify this description.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Steps to Reproduce
                      </label>
                      <textarea
                        name="stepsToReproduce"
                        value={reportData.stepsToReproduce}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="1. Go to...&#10;2. Click on...&#10;3. Enter...&#10;4. Error occurs..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expected vs Actual Behavior
                      </label>
                      <textarea
                        name="expectedBehavior"
                        value={reportData.expectedBehavior}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                        placeholder="What should have happened?"
                      />
                      <textarea
                        name="actualBehavior"
                        value={reportData.actualBehavior}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="What actually happened?"
                      />
                    </div>
                  </div>

                  {/* Recent Errors Section */}
                  {detectedErrors.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        Recent Detected Errors ({detectedErrors.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {detectedErrors.slice(0, 3).map((error, index) => (
                          <div key={index} className="text-xs bg-white p-2 rounded border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-red-600">{error.type}</span>
                              <span className="text-gray-500">
                                {new Date(error.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-gray-700 mt-1 truncate">{error.message}</div>
                            {error.filename && (
                              <div className="text-gray-500 mt-1">
                                📄 {error.filename}:{error.lineno}
                              </div>
                            )}
                          </div>
                        ))}
                        {detectedErrors.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-1">
                            ... and {detectedErrors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enhanced System Info Preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
  <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
    <Smartphone size={16} className="mr-2" />
    System Information (Auto-collected)
  </h4>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
    <div>🌐 Browser: {navigator.userAgent.split(' ')[0]}</div>
    <div>💻 Platform: {navigator.platform}</div>
    <div>📱 Screen: {window.screen.width}x{window.screen.height}</div> {/* Fixed: window.screen instead of screen */}
    <div>🗣️ Language: {navigator.language}</div>
    <div>📡 Online: {navigator.onLine ? 'Yes' : 'No'}</div>
    <div>📍 Page: {window.location.pathname}</div>
    <div>🕐 Time: {new Date().toLocaleTimeString()}</div>
    <div>🔗 Connection: {navigator.connection?.effectiveType || 'Unknown'}</div>
    <div>💾 Memory: {performance.memory ? 
      `${Math.round(performance.memory.usedJSHeapSize / 1048576)}MB` : 
      'Unknown'
    }</div>
  </div>
</div>
                  

                  {/* Error Status Messages */}
                  {reportStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center text-red-600">
                        <AlertCircle size={18} className="mr-2" />
                        <p className="font-medium">Failed to send bug report</p>
                      </div>
                      <p className="text-red-600 text-sm mt-1">
                        Please check your internet connection and try again, or contact support@myboq.in directly
                      </p>
                    </div>
                  )}

                  {reportStatus === 'template_error' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle size={18} className="mr-2" />
                        <p className="font-medium">Email Template Configuration Issue</p>
                      </div>
                      <p className="text-yellow-600 text-sm mt-1">
                        The EmailJS template "template_myboq_error_report" was not found. Please create the template with the provided structure.
                      </p>
                    </div>
                  )}

                  {reportStatus === 'auth_error' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center text-orange-600">
                        <AlertCircle size={18} className="mr-2" />
                        <p className="font-medium">Authentication Error</p>
                      </div>
                      <p className="text-orange-600 text-sm mt-1">
                        EmailJS public key or service configuration issue. Please verify your EmailJS settings.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {reportStatus !== 'success' && (
              <div className="flex-shrink-0 p-6 pt-0 border-t border-gray-200">
               <button
                  onClick={sendErrorReport}
                  disabled={isSending}
                  className={`w-full ${
                    reportData.autoDetected 
                      ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400' 
                      : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                  } text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center`}
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending Report...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      {reportData.autoDetected 
                        ? 'Send Auto-Detected Error Report' 
                        : 'Send Bug Report to Support'
                      }
                    </>
                  )}
                </button>
                
                <div className="text-center mt-3">
                  <p className="text-xs text-gray-500">
                    🔒 All data is sent securely to our support team
                    {reportData.autoDetected && (
                      <span className="block mt-1">
                        ✨ Enhanced with automatic error detection
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorReportingSystem;