import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  AlertTriangle, 
  Server, 
  RefreshCw, 
  Home,
  ArrowLeft,
  Bug
} from 'lucide-react';

// Import your existing ERROR_TYPES (keeping your existing configuration)
const ERROR_TYPES = {
  NO_INTERNET: {
    title: 'No Internet Connection',
    message: 'Please check your internet connection and try again.',
    imagePath: '/no-internet.jpg', 
    icon: WifiOff,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    buttonText: 'Retry Connection'
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'Our servers are experiencing some issues. Please try again later.',
    imagePath: '/serverError.svg', 
    icon: Server,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    buttonText: 'Try Again'
  },
  PAGE_NOT_FOUND: {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has been moved.',
    imagePath: '/404.svg',
    icon: AlertTriangle,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    buttonText: 'Go Home'
  },
  API_ERROR: {
    title: 'Service Unavailable',
    message: 'Unable to connect to our services. Please try again in a moment.',
    imagePath: '/service.jpg', 
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    buttonText: 'Retry'
  },
  GENERAL_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please refresh the page or try again later.',
    imagePath: '/serverError.svg', 
    icon: AlertTriangle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    buttonText: 'Refresh Page'
  }
};

// Enhanced Error Display Component with Report Bug Button
const ErrorDisplay = ({ 
  errorType = 'GENERAL_ERROR', 
  customMessage = null,
  onRetry = null,
  onGoHome = null,
  onGoBack = null,
  onReportBug = null,
  showBackButton = true,
  showHomeButton = true,
  showReportButton = true,
  errorDetails = null
}) => {
  const error = ERROR_TYPES[errorType];
  const IconComponent = error.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  const handleReportBug = () => {
    if (onReportBug) {
      onReportBug({
        errorType: errorType.replace('_', ' '),
        description: customMessage || error.message,
        technicalDetails: errorDetails,
        severity: errorType === 'SERVER_ERROR' ? 'high' : 'medium'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Error Illustration */}
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto mb-6"
          >
            {/* Try to load custom illustration, fallback to icon */}
            <img 
              src={error.imagePath}
              alt={error.title}
              className="w-64 h-64 mx-auto object-contain"
              onError={(e) => {
                // If image fails to load, hide it and show icon instead
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback Icon */}
            <div 
              className={`w-32 h-32 mx-auto ${error.bgColor} rounded-full items-center justify-center hidden`}
            >
              <IconComponent className={`w-16 h-16 ${error.color}`} />
            </div>
          </motion.div>
        </div>

        {/* Error Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {error.title}
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {customMessage || error.message}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Primary Action Button */}
          <button
            onClick={handleRetry}
            className={`w-full ${error.color.replace('text-', 'bg-').replace('-500', '-500')} bg-opacity-90 hover:bg-opacity-100 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
          >
            <RefreshCw className="w-5 h-5" />
            <span>{error.buttonText}</span>
          </button>

          {/* Secondary Action Buttons */}
          <div className="flex space-x-3">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
            
            {showHomeButton && (
              <button
                onClick={handleGoHome}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>MyWork</span>
              </button>
            )}
          </div>

          {/* Report Bug Button */}
          {showReportButton && onReportBug && (
            <button
              onClick={handleReportBug}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 border border-red-200"
            >
              <Bug className="w-4 h-4" />
              <span>Report This Issue</span>
            </button>
          )}
        </motion.div>

        {/* Additional Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-sm text-gray-500 mt-8"
        >
          If the problem persists, please contact our support team at support@myboq.in
        </motion.p>
      </motion.div>
    </div>
  );
};

// Enhanced React Error Boundary Class Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: 'GENERAL_ERROR'
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Determine error type based on error message or type
    let errorType = 'GENERAL_ERROR';
    
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      errorType = 'NO_INTERNET';
    } else if (error.message.includes('500') || error.message.includes('server')) {
      errorType = 'SERVER_ERROR';
    } else if (error.message.includes('404')) {
      errorType = 'PAGE_NOT_FOUND';
    } else if (error.message.includes('API') || error.message.includes('service')) {
      errorType = 'API_ERROR';
    }

    this.setState({
      error,
      errorInfo,
      errorType
    });

    // If error reporting system is available, prepare error data
    if (this.props.errorReportingRef && this.props.errorReportingRef.current) {
      // Don't auto-open, just prepare the data
      console.log('Error boundary caught error, data ready for reporting');
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: 'GENERAL_ERROR'
    });
  };

  handleReportBug = (errorData) => {
    if (this.props.errorReportingRef && this.props.errorReportingRef.current) {
      const technicalDetails = {
        error: {
          name: this.state.error?.name,
          message: this.state.error?.message,
          stack: this.state.error?.stack
        },
        errorInfo: this.state.errorInfo,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      this.props.errorReportingRef.current.openReportModal({
        ...errorData,
        technicalDetails
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay 
          errorType={this.state.errorType}
          onRetry={this.handleRetry}
          onReportBug={this.handleReportBug}
          customMessage={this.props.customMessage}
          errorDetails={{
            error: this.state.error,
            errorInfo: this.state.errorInfo
          }}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling network status (keeping your existing implementation)
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Enhanced Network Status Component
const NetworkStatusHandler = ({ children, errorReportingRef }) => {
  const isOnline = useNetworkStatus();

  const handleReportBug = (errorData) => {
    if (errorReportingRef && errorReportingRef.current) {
      errorReportingRef.current.openReportModal(errorData);
    }
  };

  if (!isOnline) {
    return (
      <ErrorDisplay 
        errorType="NO_INTERNET" 
        onReportBug={handleReportBug}
      />
    );
  }

  return children;
};

// Utility function for API error handling (keeping your existing implementation)
const handleApiError = (error) => {
  let errorType = 'API_ERROR';
  
  if (!navigator.onLine) {
    errorType = 'NO_INTERNET';
  } else if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    if (status >= 500) {
      errorType = 'SERVER_ERROR';
    } else if (status === 404) {
      errorType = 'PAGE_NOT_FOUND';
    }
  } else if (error.request) {
    // Request was made but no response
    errorType = 'NO_INTERNET';
  }
  
  return errorType;
};

// Export everything (keeping your existing exports + enhanced versions)
export {
  ErrorBoundary,
  ErrorDisplay,
  NetworkStatusHandler,
  useNetworkStatus,
  handleApiError,
  ERROR_TYPES
};

// For backward compatibility, also export as default
export default ErrorBoundary;