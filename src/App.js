import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MdPhone, MdBugReport } from "react-icons/md";
import { FiPhone, FiAlertTriangle } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

// Import Error Handling Components
import ErrorBoundary, { 
  ErrorDisplay, 
  NetworkStatusHandler, 
  useNetworkStatus 
} from "./components/ErrorBoundary";

// Import all your existing components
import SignupForm from "./components/Signup";
import SignInPage from "./components/SignIn";
import MyWork from "./components/MyWork";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import EstimateForm from "./components/Estimate";
import SubEstimate from "./components/SubEstimate";
import StepperPage from "./components/Stepper";
import ProfilePage from "./components/Profile";
import ForgotPasswordPage from "./components/ForgotPassword";
import PDFGenerator from "./components/PDFGenerator";
import PDFPage from "./components/PDFPage";
import DuplicateEstimate from "./components/DuplicateModal";
import CoverPageGenerator from "./components/Cover";
import ConstructionEstimateComponent from "./components/ConstructionEstimate";
import TermsAndConditions from "./components/TermandCondition";
import PrivacyPolicy from "./components/Privacy";
import ResetPasswordPage from "./components/ResetPassword";
import ContactModal from './components/Contact';
import MeasurementComponent from "./components/MeasurementComponent";
import MaterialSummaryComponent from "./components/MaterialSummary";
import SSLCertificateInstallation from "./components/SSL_Certificate";
import PaymentPage from "./components/PaymentPage";
import SubscriptionPage from "./components/SubscriptionPage";
import PlanDetailsPage from "./components/PlanDetails";
import CreditPage from "./components/Credit";
import UpgradePlanPage from "./components/UpgradePlan";
import ModifySubscriptionPage from "./components/ModifyPlan";
import BuyExtraCreditsPage from "./components/ExtraCredit";
import RenewPlanPage from "./components/RenewPlan";
import LeadQuarryManagement from "./components/Lead";
import ErrorReportingSystem from "./components/ErrorReporting";
import RoyaltyComponent from "./components/Royalty";
import MaterialTestingPage from "./components/MaterialTesting";
import MTSCoverPageGenerator from "./components/MTSCover";
import ScheduleB from "./components/SchduleB";

// Global Error Detection Hook
const useGlobalErrorDetection = () => {
  const [hasErrors, setHasErrors] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    let detectedErrors = [];

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

      detectedErrors = [error, ...detectedErrors.slice(0, 9)];
      setLastError(error);
      setErrorCount(detectedErrors.length);
      setHasErrors(true);
      
      console.error('Global error detected:', error);
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

      detectedErrors = [error, ...detectedErrors.slice(0, 9)];
      setLastError(error);
      setErrorCount(detectedErrors.length);
      setHasErrors(true);
      
      console.error('Unhandled rejection detected:', error);
    };

    // Network error detection
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok && response.status >= 400) {
          const error = {
            type: 'Network Error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            url: args[0],
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          };

          detectedErrors = [error, ...detectedErrors.slice(0, 9)];
          setLastError(error);
          setErrorCount(detectedErrors.length);
          setHasErrors(true);
          
          console.error('Network error detected:', error);
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

        detectedErrors = [errorInfo, ...detectedErrors.slice(0, 9)];
        setLastError(errorInfo);
        setErrorCount(detectedErrors.length);
        setHasErrors(true);
        
        console.error('Network connection error detected:', errorInfo);
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

      detectedErrors = [error, ...detectedErrors.slice(0, 9)];
      setLastError(error);
      setErrorCount(detectedErrors.length);
      setHasErrors(true);
      
      originalConsoleError.apply(console, args);
    };

    // Method to clear errors (for testing or manual reset)
    const clearErrors = () => {
      detectedErrors = [];
      setHasErrors(false);
      setErrorCount(0);
      setLastError(null);
    };

    // Expose clearErrors globally for testing
    window.clearDetectedErrors = clearErrors;
    
    // Make error data available globally for the error reporting component
    window.getDetectedErrors = () => ({
      hasErrors,
      errorCount,
      errors: detectedErrors,
      lastError
    });

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch;
      console.error = originalConsoleError;
      delete window.clearDetectedErrors;
      delete window.getDetectedErrors;
    };
  }, []);

  return { hasErrors, errorCount, lastError };
};

// Authentication Helper Functions
const isUserAuthenticated = () => {
  try {
    const user = localStorage.getItem('user');
    const authToken = localStorage.getItem('authToken');
    const jwt = localStorage.getItem('jwt');
    const userId = localStorage.getItem('Id') || localStorage.getItem('id');
    
    return user && (authToken || jwt || userId);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

const clearAllUserData = () => {
  try {
    const keysToRemove = [
      'user', 'authToken', 'jwt', 'token', 'accessToken', 'refreshToken',
      'Id', 'id', 'userId', 'fullName', 'userName', 'userEmail', 'userRole',
      'mobile', 'email', 'phone', 'userProfile', 'userData', 'loginTime',
      'sessionData', 'userPreferences', 'userSettings'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

// Enhanced Protected Route Component with Error Handling
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isOnline = useNetworkStatus();
  
  // Check network status first
  if (!isOnline) {
    return <ErrorDisplay errorType="NO_INTERNET" />;
  }
  
  if (!isUserAuthenticated()) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Enhanced Public Route Component
const PublicRoute = ({ children }) => {
  if (isUserAuthenticated()) {
    return <Navigate to="/mywork" replace />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Footer Component
function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-center text-gray-600 text-sm">
          © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser scroll restoration
    if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
    
    // Reset scroll position to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }, [pathname]);

  return null;
}

// Route Tracker Component - This will track route changes
function RouteTracker({ onRouteChange }) {
  const location = useLocation();

  useEffect(() => {
    onRouteChange(location.pathname);
    
    // Reset scroll position on route change
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location.pathname, onRouteChange]);

  return null;
}

// Updated Global Floating Buttons Component - Now receives currentPath as prop
function GlobalFloatingButtons({ onContactClick, onErrorReportClick, errorCount, currentPath, onAddNewClick }) {
  const [showTooltip, setShowTooltip] = useState({ add: false, contact: false, report: false });

  // Check if current page is MyWork
  const isMyWorkPage = currentPath === '/mywork';

  // For MyWork page - show 3 buttons in a column
  if (isMyWorkPage) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Add New Estimate Button - Only on MyWork */}
        <div className="relative group">
          <motion.button
            onClick={onAddNewClick}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ring-2 ring-orange-200 hover:ring-orange-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaPlus size={20} />
          </motion.button>
          
          {/* Enhanced Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
              Add New Estimate
              <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="relative group">
          <motion.button
            onClick={onContactClick}
            onMouseEnter={() => setShowTooltip(prev => ({ ...prev, contact: true }))}
            onMouseLeave={() => setShowTooltip(prev => ({ ...prev, contact: false }))}
            className="bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition-all duration-300 hover:shadow-2xl ring-2 ring-orange-200 hover:ring-orange-300"
            title="Contact Us"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiPhone size={20} />
          </motion.button>
          
          {showTooltip.contact && (
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
              Contact Us
              <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>
          )}
        </div>

        {/* Error Reporting Button */}
       <div className="relative group">
          <motion.button
            onClick={onErrorReportClick}
            onMouseEnter={() => setShowTooltip(prev => ({ ...prev, report: true }))}
            onMouseLeave={() => setShowTooltip(prev => ({ ...prev, report: false }))}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl ring-2 ring-red-200 hover:ring-red-300"
            title="Report Issues"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            <MdBugReport size={20} />
          </motion.button>
          
          {showTooltip.report && (
            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
              Report Issues
              <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                <div className="w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For other pages - show only Contact and Error Reporting buttons
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* Contact Button */}
      <div className="relative group">
        <motion.button
          onClick={onContactClick}
          onMouseEnter={() => setShowTooltip(prev => ({ ...prev, contact: true }))}
          onMouseLeave={() => setShowTooltip(prev => ({ ...prev, contact: false }))}
          className="bg-orange-500 text-white p-4 rounded-full shadow-xl hover:bg-orange-600 transition-all duration-300 hover:shadow-2xl ring-2 ring-orange-200 hover:ring-orange-300"
          title="Contact Us"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiPhone size={20} />
        </motion.button>
        
        {showTooltip.contact && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            Contact Us
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Error Reporting Button */}
      <div className="relative group">
        <motion.button
          onClick={onErrorReportClick}
          onMouseEnter={() => setShowTooltip(prev => ({ ...prev, report: true }))}
          onMouseLeave={() => setShowTooltip(prev => ({ ...prev, report: false }))}
          className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl ring-2 ring-red-200 hover:ring-red-300"
          title="Report Issues"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdBugReport size={20} />
        </motion.button>
        
        {showTooltip.report && (
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
            Report Issues
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Error Reporting Modal Component
function ErrorReportingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] m-4">
        <div className="overflow-auto max-h-[calc(90vh-0px)]">
          <ErrorReportingSystem onClose={onClose} />
        </div>
      </div>
    </div>
  );
}

// Enhanced Layout with Error Boundary
function Layout({ children }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-20">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function SignInLayout({ children }) {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

function SignUpLayout({ children }) {
  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        <main className="flex-1 min-h-0">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

// Enhanced Simple Layout with Error Boundary
function SimpleLayout({ children }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

// Custom 404 Component using ErrorDisplay
const NotFoundPage = () => {
  const isAuthenticated = isUserAuthenticated();
  
  return (
    <ErrorDisplay 
      errorType="PAGE_NOT_FOUND"
      onGoHome={() => {
        window.location.href = isAuthenticated ? '/mywork' : '/signin';
      }}
      showBackButton={true}
      showHomeButton={true}
    />
  );
};

// Loading Component with Error Handling
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <motion.div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p 
          className="mt-4 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
};

// Updated MyWork component wrapper to handle Add New functionality
function MyWorkPage() {
  const handleAddNew = () => {
    // Navigate to estimate creation
    window.location.href = '/estimate';
  };

  return <MyWork onAddNew={handleAddNew} />;
}

function App() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isErrorReportModalOpen, setIsErrorReportModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState(null);
  const [currentPath, setCurrentPath] = useState('');

  // Use global error detection hook
  const { hasErrors, errorCount, lastError } = useGlobalErrorDetection();

  // Handle route changes
  const handleRouteChange = (newPath) => {
    setCurrentPath(newPath);
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Simulate a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const authStatus = isUserAuthenticated();
        setIsAuthenticated(authStatus);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAppError('GENERAL_ERROR');
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'authToken' || e.key === 'jwt') {
        try {
          const newAuthStatus = isUserAuthenticated();
          setIsAuthenticated(newAuthStatus);
        } catch (error) {
          console.error('Error updating auth status:', error);
          setAppError('GENERAL_ERROR');
        }
      }
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setAppError(null);
      // Recheck authentication when coming back online
      const authStatus = isUserAuthenticated();
      setIsAuthenticated(authStatus);
    };

    const handleOffline = () => {
      setAppError('NO_INTERNET');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle contact button click
  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Handle error report button click - Direct modal open
  const handleErrorReportClick = () => {
    setIsErrorReportModalOpen(true);
  };

  // Handle Add New button click (for MyWork page)
  const handleAddNewClick = () => {
    window.location.href = '/estimate';
  };

  // Handle modal close
  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
  };

  const handleCloseErrorReportModal = () => {
    setIsErrorReportModalOpen(false);
  };

  // Handle app-level errors
  const handleAppError = (error) => {
    console.error('App-level error:', error);
    setAppError('GENERAL_ERROR');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show app-level error if any
  if (appError) {
    return (
      <ErrorDisplay 
        errorType={appError}
        onRetry={() => {
          setAppError(null);
          window.location.reload();
        }}
        customMessage="Something went wrong with the application. Please try again."
      />
    );
  }

  return (
    <ErrorBoundary>
      <NetworkStatusHandler>
        <Router>
           <ScrollToTop />
          <div className="App">
            {/* Route Tracker - This will update currentPath whenever route changes */}
  <RouteTracker onRouteChange={handleRouteChange} />
            
            <ErrorBoundary>
              <Routes>
                {/* Public Routes - Accessible without authentication */}
                <Route 
                  path="/signin" 
                  element={
                    <PublicRoute>
                      <SignInLayout>
                        <SignInPage />
                      </SignInLayout>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <PublicRoute>
                      <SignUpLayout>
                        <SignupForm />
                      </SignUpLayout>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/forgotpwd" 
                  element={
                    <PublicRoute>
                      <SimpleLayout>
                        <ForgotPasswordPage />
                      </SimpleLayout>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <PublicRoute>
                      <SimpleLayout>
                        <ResetPasswordPage />
                      </SimpleLayout>
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/termsandconditions" 
                  element={
                    <ErrorBoundary>
                      <SimpleLayout>
                        <TermsAndConditions />
                      </SimpleLayout>
                    </ErrorBoundary>
                  }
                />
                <Route 
                  path="/policy" 
                  element={
                    <ErrorBoundary>
                      <SimpleLayout>
                        <PrivacyPolicy />
                      </SimpleLayout>
                    </ErrorBoundary>
                  }
                />
                <Route 
                  path="/ssl" 
                  element={
                    <ErrorBoundary>
                      <SimpleLayout>
                        <SSLCertificateInstallation />
                      </SimpleLayout>
                    </ErrorBoundary>
                  }
                />

                {/* Protected Routes - Require authentication */}
                <Route 
                  path="/mywork" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MyWorkPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/history" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CreditPage/>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/estimate" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EstimateForm />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/upgradeplan" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UpgradePlanPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/modifyplan" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ModifySubscriptionPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/subestimate" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SubEstimate />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/stepper" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <StepperPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/pdf-preview" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PDFGenerator />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/report" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PDFPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/duplicateestimate" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DuplicateEstimate />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/cover" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CoverPageGenerator />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                   <Route 
                  path="/royalty" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                      <RoyaltyComponent />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/abstract" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ConstructionEstimateComponent />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/schedule_b" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ScheduleB />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/measurementcomponent" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MeasurementComponent />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/error-report" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ErrorReportingSystem />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/matsum" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MaterialSummaryComponent />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/lead" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <LeadQuarryManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/mat" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MaterialTestingPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                 <Route 
                  path="/mtscover" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <MTSCoverPageGenerator />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/payment" 
                  element={
                    <ProtectedRoute>
                      <SimpleLayout>
                        <PaymentPage />
                      </SimpleLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/renew-plan" 
                  element={
                    <ProtectedRoute>
                      <SimpleLayout>
                        <RenewPlanPage />
                      </SimpleLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/subscription" 
                  element={
                    <ProtectedRoute>
                      <SimpleLayout>
                        <SubscriptionPage />
                      </SimpleLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/plandetails" 
                  element={
                    <ProtectedRoute>
                      <SimpleLayout>
                        <PlanDetailsPage />
                      </SimpleLayout>
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/buy-extra-credits" 
                  element={
                    <ProtectedRoute>
                      <SimpleLayout>
                        <BuyExtraCreditsPage />
                      </SimpleLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Default route - redirect based on authentication */}
                <Route 
                  path="/" 
                  element={
                    isAuthenticated ? 
                      <Navigate to="/mywork" replace /> : 
                      <Navigate to="/signin" replace />
                  }
                />

                {/* 404 - Catch-all route with custom error display */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>

            {/* Global Floating Buttons - Now uses currentPath instead of isMyWorkPage */}
            <GlobalFloatingButtons
              onContactClick={handleContactClick}
              onErrorReportClick={handleErrorReportClick}
              onAddNewClick={handleAddNewClick}
           
              currentPath={currentPath}
            />

            {/* Contact Modal */}
            {isContactModalOpen && (
              <ErrorBoundary>
                <ContactModal 
                  isOpen={isContactModalOpen} 
                  onClose={handleCloseContactModal} 
                />
              </ErrorBoundary>
            )}

            {/* Error Reporting Modal - Opens directly when button is clicked */}
            <ErrorReportingModal 
              isOpen={isErrorReportModalOpen} 
              onClose={handleCloseErrorReportModal} 
            />
          </div>
        </Router>
      </NetworkStatusHandler>
    </ErrorBoundary>
  );
}

export default App;