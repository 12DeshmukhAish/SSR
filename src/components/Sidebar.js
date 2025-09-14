import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { FaCalculator, FaCreditCard } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";
import { GoGraph } from "react-icons/go";
import { MdHome } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';

// Auto-logout hook for inactivity detection
const useAutoLogout = (onLogout, timeoutMinutes = 30) => {
  const timeoutDuration = timeoutMinutes * 60 * 1000; // Convert to milliseconds
  const warningTime = 5 * 60 * 1000; // Show warning 5 minutes before logout

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (window.inactivityTimer) {
      clearTimeout(window.inactivityTimer);
    }
    if (window.warningTimer) {
      clearTimeout(window.warningTimer);
    }

    // Set warning timer (25 minutes)
    window.warningTimer = setTimeout(() => {
      toast.warning('You will be logged out in 5 minutes due to inactivity!', {
        position: "top-center",
        autoClose: 10000,
        theme: "colored"
      });
    }, timeoutDuration - warningTime);

    // Set logout timer (30 minutes)
    window.inactivityTimer = setTimeout(() => {
      toast.error('Logging out due to inactivity...', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      onLogout();
    }, timeoutDuration);
  }, [onLogout, timeoutDuration, warningTime]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Activity handler
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      // Clear timers
      if (window.inactivityTimer) {
        clearTimeout(window.inactivityTimer);
      }
      if (window.warningTimer) {
        clearTimeout(window.warningTimer);
      }
    };
  }, [resetTimer]);
};

// Custom Logout Confirmation Dialog Component
const LogoutDialog = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-900">Confirm Logout</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <LogOut className="text-red-600" size={16} />
            </div>
            <div>
              <p className="text-gray-900 text-sm font-medium">Are you sure you want to logout?</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200 flex items-center gap-1.5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({ icon: Icon, label, path, isActive, isCollapsed, isDisabled = false, onClick }) => {
  const itemClasses = `
    flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 cursor-pointer
    ${isActive ? 'text-white bg-blue-600 shadow-md' : 
      isDisabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'}
    transition-all duration-200 rounded-lg mx-2 relative
  `;

  // Tooltip content for collapsed state
  const tooltipContent = isCollapsed && (
    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
      {label}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
    </div>
  );

  if (isDisabled) {
    return (
      <div className={`${itemClasses} group`} title={isCollapsed ? "" : "This feature is not available"}>
        <Icon size={24} />
        {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {label} (Not Available)
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
          </div>
        )}
      </div>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={`${itemClasses} group`}>
        <Icon size={24} />
        {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
        {tooltipContent}
      </div>
    );
  }

  return (
    <Link to={path} className={`${itemClasses} group`}>
      <Icon size={24} />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
      {tooltipContent}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Always start collapsed, only expand on hover
  const isCollapsed = !isHovered;
  
  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Enhanced Clear All User Data Function
  const clearAllUserData = () => {
    try {
      // Clear all possible authentication and user data from localStorage
      const keysToRemove = [
        // User authentication data
        'user',
        'authToken',
        'jwt',
        'token',
        'accessToken',
        'refreshToken',
        'bearerToken',
        
        // User identification
        'Id',
        'id',
        'userId',
        'user_id',
        'userID',
        
        // User profile information
        'fullName',
        'userName',
        'userEmail',
        'userRole',
        'mobile',
        'email',
        'phone',
        'userProfile',
        'userData',
        'userInfo',
        
        // Session and preferences
        'loginTime',
        'sessionData',
        'sessionId',
        'userPreferences',
        'userSettings',
        'appSettings',
        
        // Application specific data
        'workData',
        'estimates',
        'projects',
        'drafts',
        'templates',
        'recentWork',
        'savedWork',
        'appCache',
        'lastActivity',
        'permissions',
        'subscription',
        'planData',
        
        // Any other custom keys your app might use
        'rememberMe',
        'autoLogin',
        'isLoggedIn',
        'loginStatus',
        'currentUser'
      ];
      
      // Remove from localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove localStorage key: ${key}`, error);
        }
      });
      
      // Remove from sessionStorage as well
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove sessionStorage key: ${key}`, error);
        }
      });
      
      console.log('All user data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  };

  // Handle Sign Out function with comprehensive cleanup
  const handleSignOut = async (isAutoLogout = false) => {
    try {
      // Close the dialog first
      setShowLogoutDialog(false);
      
      // Show loading state
      const toastId = toast.loading(
        isAutoLogout ? 'Auto-logout in progress...' : 'Signing out...', 
        { position: "top-right" }
      );

      // Clear all user data
      const cleared = clearAllUserData();
      
      if (!cleared) {
        throw new Error('Failed to clear user data');
      }

      // Add a small delay to ensure all cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update toast to success
      toast.update(toastId, {
        render: isAutoLogout ? 'Logged out due to inactivity!' : 'Signed out successfully!',
        type: isAutoLogout ? 'warning' : 'success',
        isLoading: false,
        autoClose: 2000,
        theme: "colored"
      });
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        // Clear any remaining data and navigate
        window.location.href = '/signin';
      }, 1000);
      
    } catch (error) {
      // Handle any errors during sign out
      console.error('Sign out error:', error);
      toast.error('Error during sign out. Clearing data and redirecting...', {
        position: "top-right",
        autoClose: 2000,
        theme: "colored"
      });
      
      // Force clear and redirect even if there's an error
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
      
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1500);
    }
  };

  // Auto-logout function for inactivity
  const handleAutoLogout = useCallback(() => {
    handleSignOut(true); // Pass true to indicate auto-logout
  }, []);

  // Initialize auto-logout hook (30 minutes inactivity)
  useAutoLogout(handleAutoLogout, 30);

  // Handle logout click - show dialog instead of direct logout
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Emit custom event for header to listen
    window.dispatchEvent(new CustomEvent('sidebarHover', {
      detail: { expanded: true }
    }));
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    // Emit custom event for header to listen
    window.dispatchEvent(new CustomEvent('sidebarHover', {
      detail: { expanded: false }
    }));
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowLogoutDialog(false);
  };

  // Handle manual logout confirmation
  const handleManualLogout = () => {
    handleSignOut(false); // Pass false to indicate manual logout
  };
  
  // Updated Sidebar component - only the return statement needs to change
  return (
    <>
      {/* Fixed Sidebar */}
      <div
        className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col fixed top-0 left-0 z-30 shadow-lg`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Logo Section */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-4 mb-2 border-b border-gray-200 bg-white group relative h-20`}>
          <img src="/logo.png" alt="SSR Logo" className="w-12 h-12" />
          {!isCollapsed && <span className="text-xl font-bold text-gray-800">myBOQ</span>}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              MYBOQ
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
            </div>
          )}
        </div>
        
        {/* Navigation Menu - with scrollable area */}
        <div className="flex-1 flex flex-col overflow-y-auto py-2 space-y-1">
          {/* Disabled menu items */}
          <MenuItem
            icon={MdHome}
            label="Dashboard"
            path="/dashboard"
            isActive={isPathActive('/dashboard')}
            isCollapsed={isCollapsed}
            isDisabled={true}
          />
          
          {/* Active menu items */}
          <MenuItem
            icon={FaCalculator}
            label="My Work"
            path="/mywork"
            isActive={isPathActive('/mywork')}
            isCollapsed={isCollapsed}
          />
          
          {/* Disabled menu items */}
          <MenuItem
            icon={FaCalculator}
            label="Estimate"
            path="/estimate"
            isActive={isPathActive('/estimate')}
            isCollapsed={isCollapsed}
            isDisabled={true}
          />
          
          <MenuItem
            icon={IoIosDocument}
            label="My Template"
            path="/my-template"
            isActive={isPathActive('/my-template')}
            isCollapsed={isCollapsed}
            isDisabled={true}
          />
          <MenuItem
            icon={GoGraph}
            label="Market Place"
            path="/market-place"
            isActive={isPathActive('/market-place')}
            isCollapsed={isCollapsed}
            isDisabled={true}
          />
          
          {/* Active menu items */}
          <MenuItem
            icon={FaTrash}
            label="Trash"
            path="/trash"
            isActive={isPathActive('/trash')}
            isCollapsed={isCollapsed}
            isDisabled={true}
          />
          
          {/* Credit Section - shows disabled state initially */}
          <div className={`${isCollapsed ? 'mx-2 items-center' : 'mx-2'} mt-4 py-3 rounded-lg bg-white border border-gray-200 flex flex-col ${isCollapsed ? 'items-center' : 'px-4'} group relative`}>
            {!isCollapsed ? (
              <>
                <div className="font-medium text-sm text-gray-500">Available Credit</div>
                <button 
                  className="w-full mt-2 bg-gray-100 text-gray-400 cursor-not-allowed py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-200"
                  onClick={(e) => e.preventDefault()}
                  title="This feature is not available"
                  disabled
                >
                  <span>Buy Credit</span>
                </button>
              </>
            ) : (
              <>
                <FaCreditCard size={24} className="mb-1 text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  Buy Credit (Not Available)
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                </div>
              </>
            )}
          </div>
          
          {/* Logout - Now opens dialog */}
          <MenuItem
            icon={LogOut}
            label="Logout"
            isActive={false}
            isCollapsed={isCollapsed}
            onClick={handleLogoutClick}
          />
        </div>
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={handleDialogClose}
        onConfirm={handleManualLogout}
      />
      
      {/* This div creates space for the main content */}
      <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Your main content will go here */}
      </div>
    </>
  );
};

export default Sidebar;