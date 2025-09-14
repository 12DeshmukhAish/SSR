import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { VscBellDot } from "react-icons/vsc";
import { HiMiniUserCircle } from "react-icons/hi2";
import { FaBell, FaWallet, FaSpinner, FaCrown } from "react-icons/fa";
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import AboutUsModal from './AboutUs';

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
const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('');
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
const navigateToAbout = () => {
  setShowAboutModal(true);
  setShowDropdown(false);
};
const handleAboutModalClose = () => {
  setShowAboutModal(false);
};

  // Check if current page is credits/history page
  const isCreditsPage = location.pathname === '/history' || location.pathname === '/credits';

  // Function to get current user ID from localStorage or JWT token
  const getCurrentUserId = () => {
    try {
      // First try to get the numeric user ID (not username)
      const storedUid = localStorage.getItem('uid');
      if (storedUid && storedUid !== localStorage.getItem('username')) {
        console.log('Found uid in localStorage:', storedUid);
        return storedUid;
      }

      // Try other possible user ID keys
      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('id');
      if (storedUserId && storedUserId !== localStorage.getItem('username')) {
        console.log('Found userId in localStorage:', storedUserId);
        return storedUserId;
      }

      // Decode JWT token to get user ID
      const jwtToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          console.log('JWT Payload:', payload);
          
          // Look for numeric ID fields in the JWT payload
          const possibleIds = [
            payload.userId, 
            payload.id, 
            payload.uid,
            payload.sub
          ];
          
          for (const id of possibleIds) {
            if (id && id !== payload.username && !isNaN(id)) {
              console.log('Found numeric ID in JWT:', id);
              return id.toString();
            }
          }
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
      }

      // If we still don't have a numeric ID, try to find it from stored user data
      const storedUserData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.id && userData.id !== userData.username) {
            console.log('Found ID in stored user data:', userData.id);
            return userData.id.toString();
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }

      console.error('No valid numeric user ID found');
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Enhanced Clear All User Data Function (same as sidebar)
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
        'uid',
        'username',
        'userName',
        
        // User profile information
        'fullName',
        'userFullName',
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
        'userPlan',
        'currentPlan',
        
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

  // Handle Sign Out function with comprehensive cleanup (same as sidebar)
 const handleSignOut = async (isAutoLogout = false) => {
  try {
    // Close the dialogs first
    setShowLogoutDialog(false);
    setShowDropdown(false);
    
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
 const handleAutoLogout = useCallback(() => {
    handleSignOut(true); // Pass true to indicate auto-logout
  }, []);
  useAutoLogout(handleAutoLogout, 30);
  // Handle logout click - show dialog instead of direct logout
    const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setShowDropdown(false); // Close dropdown when opening logout dialog
  };
const handleManualLogout = () => {
    handleSignOut(false); // Pass false to indicate manual logout
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setShowLogoutDialog(false);
  };

  // Fetch current subscription/plan
const fetchCurrentPlan = async () => {
  setIsLoadingPlan(true);
  try {
    const uid = getCurrentUserId();
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!uid || !token) {
      setCurrentPlan('Free');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/user-subscriptions/searchByUsrId?userId=${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const subscriptionArray = await response.json();
      
      if (Array.isArray(subscriptionArray) && subscriptionArray.length > 0) {
        const activeSubscription = subscriptionArray.find(sub => 
          sub.status && sub.status.toLowerCase() === 'active'
        ) || subscriptionArray[subscriptionArray.length - 1];

        if (activeSubscription) {
          const planName = activeSubscription.planName || 'Basic';
          const billingCycle = activeSubscription.billingCycle || 
                              activeSubscription.subscriptionType || 
                              activeSubscription.planType || 'Monthly';
          
          // Create compact display format
          const compactPlan = planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
          let compactCycle = '';
          
          if (billingCycle.toLowerCase().includes('month')) {
            compactCycle = 'Monthly';
          } else if (billingCycle.toLowerCase().includes('year') || billingCycle.toLowerCase().includes('annual')) {
            compactCycle = 'Annual';
          } else {
            compactCycle = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1).toLowerCase();
          }
          
          setCurrentPlan(`${compactPlan}, ${compactCycle}`);
        } else {
          setCurrentPlan('Active');
        }
      } else {
        setCurrentPlan('Free');
      }
    } else {
      setCurrentPlan('Free');
    }

  } catch (err) {
    console.error('Failed to fetch current plan:', err);
    setCurrentPlan('Free');
  } finally {
    setIsLoadingPlan(false);
  }
};

  // Get work order status function
  const getWorkOrderStatusQuick = async (workorderId, token) => {
    if (!token) return 'started';

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/workorder-revisions/ByWorkorderId/${workorderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) return 'started';

      const revisions = await response.json();
      const filtered = (revisions || [])
        .filter(r =>
          r.deletedFlag !== undefined &&
          String(r.deletedFlag).toLowerCase() !== "yes" &&
          !isNaN(parseFloat(r.reviseNumber))
        );

      // Quick status logic
      if (filtered.length === 0) return 'started';

      const allCompleted = filtered.every(revision => revision.pdfLocation);
      if (allCompleted) return 'completed';

      const anyInProgress = filtered.some(revision =>
        !revision.pdfLocation && (revision.revisionStage === 'in-progress' || revision.revisionStage === 'started')
      );
      if (anyInProgress) return 'in-progress';

      return 'started';
    } catch (err) {
      return 'started';
    }
  };
 // Get estimate ID for work order (estimateId = workorderId)
const getEstimateId = async (workorderId, token) => {
  // Since estimateId is the same as workorderId, just return the workorderId
  return workorderId;
};
  // Fetch notifications (work orders)
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const uid = getCurrentUserId();
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!uid || !token) {
        setNotifications([]);
        setNotificationCount(0);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/workorders/ByUser/${uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Expected array but received: ' + JSON.stringify(data));
      }

      // Filter and sort by createdDate (newest first)
      const sorted = data
        .filter(item => item.deletedFlag === 0)
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
     // Get status and estimate ID for work orders and create notifications
const notificationPromises = sorted.slice(0, 5).map(async (record) => {
  const [status, estimateId] = await Promise.all([
    getWorkOrderStatusQuick(record.id, token),
    getEstimateId(record.id, token) // This will return the workorderId (same as estimateId)
  ]);
  
  return {
    id: record.id,
    workOrderID: record.workOrderID, // Add this line - the actual workorder display ID
    title: record.workOrderTitle || `Estimate ${record.workOrderID}`,
    status: status,
    estimateId: estimateId, // This is the workorderId
    createdDate: record.createdDate,
    customerName: record.customerName || 'Unknown Customer',
    message: getNotificationMessage(status, record.workOrderTitle || `Estimate ${record.workOrderID}`, estimateId)
  };
});


      const notificationData = await Promise.all(notificationPromises);
      
      // Count pending notifications (not completed)
      const pendingCount = notificationData.filter(n => n.status !== 'completed').length;
      
      setNotifications(notificationData);
      setNotificationCount(pendingCount);

    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };


 // Generate notification message based on status and estimate ID
const getNotificationMessage = (status, title, estimateId) => {
  const estimateText = estimateId ;
  
  switch (status) {
    case 'started':
      return `${title}${estimateText} - Ready to begin estimate`;
    case 'in-progress':
      return `${title}${estimateText} - In progress, complete your estimate`;
    case 'completed':
      return `${title}${estimateText} - Estimate completed`;
    default:
      return `${title}${estimateText} - Status update available`;
  }
};

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'started':
        return 'text-blue-600 bg-blue-50';
      case 'in-progress':
        return 'text-orange-600 bg-orange-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'started':
        return 'Not Started';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

 
const handleNotificationClick = (notification) => {
  // Navigate to MyWork page with workorder ID as query parameter
  navigate(`/mywork?search=${notification.workOrderID || notification.id}`);
  setShowNotifications(false);
};

  // Toggle notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  };
 useEffect(() => {
    const handleSidebarHover = (e) => {
      if (e.detail?.expanded !== undefined) {
        setSidebarExpanded(e.detail.expanded);
      }
    };

    window.addEventListener('sidebarHover', handleSidebarHover);
    return () => window.removeEventListener('sidebarHover', handleSidebarHover);
  }, []);
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user ID
        const userId = getCurrentUserId();
        console.log('Retrieved User ID:', userId);
        
        // Get JWT token - try multiple possible keys
        const jwtToken = localStorage.getItem('authToken') || 
                         localStorage.getItem('token') || 
                         localStorage.getItem('accessToken');
        
        console.log('JWT Token exists:', !!jwtToken);
        
        if (!jwtToken) {
          // If no token, fallback to localStorage and show warning
          const storedUserName = localStorage.getItem('userName') || localStorage.getItem('username');
          const storedUserEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
          const storedFullName = localStorage.getItem('fullName') || localStorage.getItem('userFullName');
          
          if (storedUserName) setUserName(storedUserName);
          if (storedUserEmail) setUserEmail(storedUserEmail);
          if (storedFullName) setUserFullName(storedFullName);
          
          setIsLoading(false);
          
          toast.warn('Session may have expired. Please login again for updated information.', {
            position: "top-right",
            autoClose: 5000,
            theme: "colored"
          });
          return;
        }

        let response;
        let apiUrl;
        
        // Try different API endpoints in order of preference
        const endpointsToTry = [];
        
        if (userId && userId !== localStorage.getItem('username')) {
          // Try with numeric user ID first
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${userId}`);
        }
        
        // Fallback to username-based endpoints
        const username = localStorage.getItem('username') || localStorage.getItem('userName');
        if (username) {
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/username/${username}`);
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${username}`);
        }
        
        // Try current user endpoint
        endpointsToTry.push(`${API_BASE_URL}/api/auth/user/current`);
        endpointsToTry.push(`${API_BASE_URL}/api/auth/me`);
        
        let lastError;
        
        for (const endpoint of endpointsToTry) {
          try {
            console.log('Trying API URL:', endpoint);
            
            response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log('API Response Status:', response.status);
            
            if (response.ok) {
              apiUrl = endpoint;
              break; // Success, exit the loop
            } else if (response.status === 401) {
              lastError = new Error('Authentication failed. Please login again.');
            } else if (response.status === 403) {
              lastError = new Error('Access forbidden. You do not have permission to view this profile.');
            } else if (response.status === 404) {
              lastError = new Error('User not found.');
              continue; // Try next endpoint
            } else {
              lastError = new Error(`API error: ${response.status}`);
            }
          } catch (fetchError) {
            console.error('Fetch error for endpoint:', endpoint, fetchError);
            lastError = fetchError;
            continue; // Try next endpoint
          }
        }
        
        if (!response || !response.ok) {
          throw lastError || new Error('All API endpoints failed');
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        
        // Store the correct user ID for future use
        if (data.id && data.id !== data.username) {
          localStorage.setItem('uid', data.id.toString());
        }
        
        // Update state with fetched data - prioritize fullName over username
        setUserFullName(data.fullName || data.name || '');
        setUserName(data.username || '');
        setUserEmail(data.email || '');
        
        // Update localStorage with fresh data from API
        if (data.fullName) localStorage.setItem('fullName', data.fullName);
        if (data.username) localStorage.setItem('userName', data.username);
        if (data.email) localStorage.setItem('userEmail', data.email);
        
        setIsLoading(false);
        
      } catch (err) {
        console.error("Error fetching user data:", err);
        setIsLoading(false);
        
        // Use fallback data from localStorage
        const storedUserName = localStorage.getItem('userName') || localStorage.getItem('username');
        const storedUserEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
        const storedFullName = localStorage.getItem('fullName') || localStorage.getItem('userFullName');
        
        setUserName(storedUserName || '');
        setUserEmail(storedUserEmail || '');
        setUserFullName(storedFullName || '');
        
        // Show toast for API error but don't redirect immediately
        if (err.message.includes('Authentication') || err.message.includes('login')) {
          toast.error('Session expired. Please login again for updated information.', {
            position: "top-right",
            autoClose: 5000,
            theme: "colored"
          });
        } else {
          toast.error('Failed to fetch user data. Using cached information.', {
            position: "top-right",
            autoClose: 3000,
            theme: "colored"
          });
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch plan data when on credits page
 useEffect(() => {
  if (isCreditsPage) {
    fetchCurrentPlan();
  }
  
  // Also fetch plan data on component mount for better UX
  if (!currentPlan || currentPlan === '') {
    const timer = setTimeout(() => {
      fetchCurrentPlan();
    }, 1000); // Small delay to ensure user data is loaded first
    
    return () => clearTimeout(timer);
  }
}, [isCreditsPage, userFullName]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up interval to refresh notifications every 5 minutes
    const interval = setInterval(() => {
      fetchNotifications();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Navigate to settings page
  const navigateToSettings = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  // Navigate to credits page
  const navigateToCredits = () => {
    navigate('/history');
    setShowDropdown(false);
  };

  // Function to get display name - prioritize fullName, fallback to username
  const getDisplayName = () => {
    if (isLoading) return 'Loading...';
    
    // Priority: fullName > username > 'User'
    if (userFullName && userFullName.trim() !== '') {
      return userFullName;
    } else if (userName && userName.trim() !== '') {
      return userName;
    } else {
      return 'User';
    }
  };

  // Get plan color based on plan name
  const getPlanColor = (planName) => {
  const lowerPlan = planName.toLowerCase();
  
  // Check for premium/pro plans
  if (lowerPlan.includes('premium') || lowerPlan.includes('pro') || lowerPlan.includes('professional')) {
    return 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
  } 
  // Check for standard/plus plans
  else if (lowerPlan.includes('standard') || lowerPlan.includes('plus')) {
    return 'text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200';
  } 
  // Check for basic/starter plans
  else if (lowerPlan.includes('basic') || lowerPlan.includes('starter')) {
    return 'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200';
  } 
  // Check for free/trial plans
  else if (lowerPlan.includes('free') || lowerPlan.includes('trial')) {
    return 'text-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
  } 
  // Check for enterprise/business plans
  else if (lowerPlan.includes('enterprise') || lowerPlan.includes('business')) {
    return 'text-purple-600 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200';
  }
  // Check for yearly plans (special styling for annual subscriptions)
  else if (lowerPlan.includes('yearly') || lowerPlan.includes('annual')) {
    return 'text-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200';
  }
  // Default styling
  else {
    return 'text-orange-600 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
  }
};


 // Updated Header component - only the return statement needs modification
 return (
    <>
      <header 
        className={`flex items-center justify-between w-full bg-white px-4 py-4 shadow-sm border-b border-gray-200 h-20 fixed top-0 right-0 z-20 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'ml-64' : 'ml-20'
        }`}
        style={{ 
          width: sidebarExpanded ? 'calc(100% - 16rem)' : 'calc(100% - 5rem)'
        }}
      >
        <div className="min-w-0 flex-1">
          <h1 className={`font-medium truncate transition-all duration-300 ${
            sidebarExpanded ? 'text-lg' : 'text-xl'
          }`}>
            Welcome {getDisplayName()}
          </h1>
          {/* Show current plan only on credits page */}
          {isCreditsPage && (
            <div className="mt-1">
              {isLoadingPlan ? (
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getPlanColor(currentPlan)}`}>
                  <FaCrown className="w-3 h-3" />
                  <span className="font-semibold truncate">{currentPlan}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="flex items-center">
            <div className={`bg-gray-100 rounded-md flex items-center gap-2 transition-all duration-300 ${
              sidebarExpanded ? 'px-2 py-1' : 'px-3 py-1'
            }`}>
              <FaWallet className={`text-gray-800 transition-all duration-300 ${
                sidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'
              }`} />
              {/* <span className="font-medium">₹11,225</span> */}
            </div>
            
            {/* Notification Bell */}
            <div className="mr-2 relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaBell className={`text-gray-800 transition-all duration-300 ${
                  sidebarExpanded ? 'w-5 h-5' : 'w-6 h-6'
                }`}/>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown - same as before */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Notifications</h3>
                  </div>
                  
                  {isLoadingNotifications ? (
                    <div className="p-4 text-center">
                      <FaSpinner className="animate-spin mx-auto mb-2 text-gray-500" />
                      <p className="text-gray-500">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications available
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              {notification.estimateId && (
                                <p className="text-xs text-blue-600 font-medium">
                                  Estimate {notification.workOrderID}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                  {getStatusText(notification.status)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(notification.createdDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              className="hover:bg-gray-100 rounded-full flex items-center"
              onClick={toggleDropdown}
            >
              <HiMiniUserCircle className={`text-gray-800 transition-all duration-300 ${
                sidebarExpanded ? 'w-7 h-7' : 'w-8 h-8'
              }`} />
            </button>

            {/* Dropdown menu - same as before */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {(userFullName || userName) && (
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      Signed in as <span className="font-medium">{userFullName || userName}</span>
                    </div>
                  )}
                  <button 
                    onClick={navigateToSettings}
                    className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </button>
                 <button
  onClick={navigateToCredits}
  disabled={true} // or just `disabled`
  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
>
  Credits
</button>
                  <button 
                    onClick={navigateToAbout}
                    className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    About MyBOQ
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button 
                    onClick={handleLogoutClick}
                    className="w-full text-left block px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        onClose={handleDialogClose}
         onConfirm={handleManualLogout} 
      />
      <AboutUsModal
        isOpen={showAboutModal}
        onClose={handleAboutModalClose}
      />
    </>
  );
};

export default Header;