
import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { IoIosPhonePortrait } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import SSLCertificateInstallation from './SSL_Certificate';
import { API_BASE_URL } from '../config';
  const LAST_LOGIN_KEY = 'lastLoginInfo';
const LOGIN_PREFERENCES_KEY = 'loginPreferences';
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation()
   const currentYear = new Date().getFullYear();

  // State management
  const [loginStep, setLoginStep] = useState('initial'); // initial, email, email-password, mobile, mobile-password
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoginInfo, setLastLoginInfo] = useState(null);
const [showClearLastLogin, setShowClearLastLogin] = useState(false);
  const [loginMethod, setLoginMethod] = useState(''); // 'email' or 'mobile'
const [otp, setOtp] = useState('');
const [otpLoading, setOtpLoading] = useState(false);
const [resendLoading, setResendLoading] = useState(false);
const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
const [canResend, setCanResend] = useState(false);
const [userId, setUserId] = useState(null);
const [showSSLModal, setShowSSLModal] = useState(false);
const [sslError, setSSLError] = useState(false);

const SIGNIN_URL = `${API_BASE_URL}/api/auth/signin`;
const USER_CHECK_URL = `${API_BASE_URL}/api/auth/user`;
const SEND_PHONE_OTP_URL = `${API_BASE_URL}/api/otp/phone/send`;
const SEND_EMAIL_OTP_URL = `${API_BASE_URL}/api/otp/emailOtp/send`;
const VERIFY_OTP_URL = `${API_BASE_URL}/api/otp/verify`;

useEffect(() => {
  let interval = null;
  if (loginStep === 'otp-verification' && timeLeft > 0) {
    interval = setInterval(() => {
      setTimeLeft(timeLeft => {
        if (timeLeft <= 1) {
          setCanResend(true);
          return 0;
        }
        return timeLeft - 1;
      });
    }, 1000);
  } else if (timeLeft === 0) {
    setCanResend(true);
  }
  return () => clearInterval(interval);
}, [loginStep, timeLeft]);
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
useEffect(() => {
  // Handle both navigation state and saved login info
  const { state } = location || {};
  const savedLoginInfo = localStorage.getItem(LAST_LOGIN_KEY);
  
  // Priority 1: Check for prefill data from signup redirect
  if (state?.prefillData) {
    const { userName, contactMethod } = state.prefillData;
    
    if (contactMethod === 'email') {
      setEmail(userName);
      setLoginMethod('email');
      setLoginStep('email-password');
    } else if (contactMethod === 'mobile') {
      setMobileNumber(userName);
      setLoginMethod('mobile');
      setLoginStep('mobile-password');
    }
    
    // Clear the state to prevent persistence on page refresh
    navigate(location.pathname, { replace: true });
    return; // Exit early, don't load saved login info when prefill exists
  }
  
  // Priority 2: Load saved login information only if no prefill data
  if (savedLoginInfo) {
    try {
      const loginData = JSON.parse(savedLoginInfo);
      setLastLoginInfo(loginData);
      
      // Auto-redirect to password screen for returning users
      if (loginData.method === 'email') {
        setEmail(loginData.username);
        setLoginMethod('email');
        setLoginStep('email-password');
        setShowClearLastLogin(true);
      } else if (loginData.method === 'mobile') {
        setMobileNumber(loginData.username);
        setLoginMethod('mobile');
        setLoginStep('mobile-password');
        setShowClearLastLogin(true);
      }
    } catch (error) {
      console.error('Error parsing saved login info:', error);
      localStorage.removeItem(LAST_LOGIN_KEY);
    }
  }
}, [location, navigate]);
// useEffect(() => {
//   // Load last login information on component mount
//   const savedLoginInfo = localStorage.getItem(LAST_LOGIN_KEY);
//   const loginPrefs = localStorage.getItem(LOGIN_PREFERENCES_KEY);
  
//   if (savedLoginInfo) {
//     try {
//       const loginData = JSON.parse(savedLoginInfo);
//       setLastLoginInfo(loginData);
      
//       // Auto-redirect to password screen if user was previously logged in
//       // and no prefill data from signup
//       const { state } = location || {};
//       if (!state?.prefillData) {
//         if (loginData.method === 'email') {
//           setEmail(loginData.username);
//           setLoginMethod('email');
//           setLoginStep('email-password');
//           setShowClearLastLogin(true);
//         } else if (loginData.method === 'mobile') {
//           setMobileNumber(loginData.username);
//           setLoginMethod('mobile');
//           setLoginStep('mobile-password');
//           setShowClearLastLogin(true);
//         }
//       }
//     } catch (error) {
//       console.error('Error parsing saved login info:', error);
//       localStorage.removeItem(LAST_LOGIN_KEY);
//     }
//   }
// }, [location]);
useEffect(() => {
  // Check for session expiry message from navigation state OR URL parameters
  const { state } = location || {};
  const urlParams = new URLSearchParams(location.search);
  
  if (state?.sessionExpired || urlParams.get('sessionExpired') === 'true') {
    toast.warn(state?.message || 'Your session has expired. Please login again.');
    // Clear the state and URL parameters
    navigate(location.pathname, { replace: true });
  }
}, [location, navigate]);
  // Handle continue with email
  const handleEmailContinue = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setLoginMethod('email');
    setError('');
    setLoginStep('email-password');
  };

  // Handle continue with mobile
  const handleMobileContinue = (e) => {
    e.preventDefault();
    if (!mobileNumber.trim() || !/^[0-9]{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoginMethod('mobile');
    setError('');
    setLoginStep('mobile-password');
  };

const handleManualSSLInstall = () => {
  setShowSSLModal(true);
};
  const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  if (!password.trim() || password.length < 8) {
    setError('Password must be at least 8 characters');
    toast.error('Password must be at least 8 characters');
    return;
  }
  
  setLoading(true);
  setError('');

  try {
    // Create login payload
    const payload = {
      userName: loginMethod === 'email' ? email : mobileNumber,
      password: password
    };

    console.log('Login payload:', payload);

    // Call sign-in API
    const response = await axios.post(SIGNIN_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('API Response:', response.data);
    
    // Check if we got a successful response
    if (response.status >= 200 && response.status < 300) {
      const responseData = response.data;
      
      // Check if user ID is available in the response
      if (responseData.id) {
        setUserId(responseData.id);
        
        try {
          // Check user status using the user check API
          console.log('Making user check call for ID:', responseData.id);
          const userCheckResponse = await axios.get(`${USER_CHECK_URL}/${responseData.id}`, {
            headers: {
              'Accept': '*/*'
            },
            timeout: 30000 
          });

          console.log('User check response:', userCheckResponse.data);
          
          const userData = userCheckResponse.data;
          
          // Check if user is verified
          // If 'active' field exists and is 1, user is verified
          // If 'active' field doesn't exist or is not 1, user needs verification
          if (userData.hasOwnProperty('active') && userData.active === 1) {
            // User is already verified, proceed with login
            console.log('User is verified (active: 1), proceeding with login');
            handleSuccessfulLogin(responseData);
          } else {
            // User needs OTP verification (either active field missing or not equal to 1)
            console.log('User needs verification - active field:', userData.active);
            toast.info('Account verification required. Please verify your OTP.');
            setLoginStep('otp-verification');
            await sendOTP();
          }
        } catch (userCheckError) {
          console.error('User check error:', userCheckError);
          
          // Check if the error is due to user not found (404) or other issues
          if (userCheckError.response && userCheckError.response.status === 404) {
            setError('User not found. Please contact support.');
            toast.error('User not found. Please contact support.');
          } else {
            // If user check fails for other reasons, assume user needs verification
            console.log('User check failed, assuming verification needed');
            toast.info('Account verification required. Please verify your OTP.');
            setLoginStep('otp-verification');
            await sendOTP();
          }
        }
      } else {
        // If no user ID in response, but login was successful, 
        // try to extract user info or proceed to OTP verification
        console.warn('Login successful but no user ID in response');
        
        // Check if we have userName from payload to use as userId or create a temporary one
        if (responseData.userName || payload.userName) {
          const tempUserId = responseData.userName || payload.userName;
          setUserId(tempUserId);
          
          toast.info('Account verification required. Please verify your OTP.');
          setLoginStep('otp-verification');
          await sendOTP();
        } else {
          setError('Login response missing user information');
          toast.error('Login response missing user information');
        }
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // When we get an error, we need to check if the user exists but needs verification
    // We'll try to make a user check call using different approaches
    
    if (error.response) {
      const statusCode = error.response.status;
      const responseData = error.response.data;
      
      console.log('Error response data:', responseData);
      
      // Try to extract user ID from error response if available
      let userIdToCheck = null;
      
      if (responseData && responseData.id) {
        userIdToCheck = responseData.id;
      } else if (responseData && responseData.userId) {
        userIdToCheck = responseData.userId;
      } else if (responseData && responseData.user && responseData.user.id) {
        userIdToCheck = responseData.user.id;
      }
      
      // If we found a user ID in the error response, try to check user status
      if (userIdToCheck) {
        console.log('Found user ID in error response:', userIdToCheck);
        setUserId(userIdToCheck);
        
        try {
          const userCheckResponse = await axios.get(`${USER_CHECK_URL}/${userIdToCheck}`, {
            headers: {
              'Accept': '*/*'
            },
            timeout: 30000 
          });
          
          console.log('User check response from error path:', userCheckResponse.data);
          
          const userData = userCheckResponse.data;
          
          if (userData.hasOwnProperty('active') && userData.active === 1) {
            // User is verified but there's some other issue
            const errorMsg = responseData?.message || `Server error (${statusCode}). Please try again.`;
            setError(errorMsg);
            toast.error(errorMsg);
          } else {
            // User exists but needs verification
            console.log('User found but needs verification');
            toast.info('Account verification required. Please verify your OTP.');
            setLoginStep('otp-verification');
            await sendOTP();
            return; // Exit early
          }
        } catch (userCheckError) {
          console.error('User check failed in error path:', userCheckError);
          // If user check also fails, treat as needing verification
          toast.info('Account verification required. Please verify your OTP.');
          setLoginStep('otp-verification');
          await sendOTP();
          return; // Exit early
        }
      } else {
        // No user ID found, try an alternative approach
        // For some APIs, we might need to find the user by username first
        console.log('No user ID in error response, trying username-based lookup');
        
        // You can add a call here to find user by username if your API supports it
        // For now, let's assume the user might need verification based on error type
        
        if (statusCode === 500 || statusCode === 403) {
          // These errors might indicate user exists but has issues
          const errorMessage = responseData?.message?.toLowerCase() || '';
          
          if (errorMessage.includes('verification') || 
              errorMessage.includes('otp') || 
              errorMessage.includes('not verified') ||
              errorMessage.includes('inactive') ||
              errorMessage.includes('not active')) {
            
            // Set userId as the username for OTP purposes
            const userIdentifier = loginMethod === 'email' ? email : mobileNumber;
            setUserId(userIdentifier);
            
            toast.info('Account verification required. Please verify your OTP.');
            setLoginStep('otp-verification');
            await sendOTP();
            return; // Exit early
          }
        }
        
        // Handle standard error cases
        switch (statusCode) {
          case 400:
            const badRequestMsg = responseData?.message || 'Invalid request. Please check your input.';
            setError(badRequestMsg);
            toast.error(badRequestMsg);
            break;
         case 401:
  const unauthorizedMsg = responseData?.message || 'Invalid credentials. Please check your username and password.';
  setError(unauthorizedMsg);
  toast.error(unauthorizedMsg);
  handleFailedLoginAttempt(); // ADD THIS LINE
  break;
          case 403:
            const forbiddenMsg = responseData?.message || 'Access forbidden. Please contact support.';
            setError(forbiddenMsg);
            toast.error(forbiddenMsg);
            break;
          case 404:
            setError('User not found. Please check your credentials or sign up.');
            toast.error('User not found. Please check your credentials or sign up.');
            break;
          case 500:
            // For 500 errors, assume user might need verification
            const userIdentifier = loginMethod === 'email' ? email : mobileNumber;
            setUserId(userIdentifier);
            toast.info('Account verification required. Please verify your OTP.');
            setLoginStep('otp-verification');
            await sendOTP();
            return; // Exit early
          default:
            const defaultMsg = responseData?.message || `Server error (${statusCode}). Please try again.`;
            setError(defaultMsg);
            toast.error(defaultMsg);
        }
      }
    } else {
      // Handle other types of errors (network, timeout, etc.)
      handleLoginError(error);
    }
  } finally {
    setLoading(false);
  }
};
const handleSuccessfulLogin = (responseData) => {
  // Store the complete user object
  localStorage.setItem('user', JSON.stringify(responseData));
  
  // Store individual items for backward compatibility
  const token = responseData.jwt || responseData.token || responseData.accessToken || responseData.authToken || responseData.access_token;
  if (token) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('jwt', token);
  }
  
  if (responseData.id) {
    localStorage.setItem('Id', responseData.id.toString());
    localStorage.setItem('id', responseData.id.toString());
  }
  
  if (responseData.fullName) {
    localStorage.setItem('fullName', responseData.fullName);
  }
  
  if (responseData.mobile) {
    localStorage.setItem('mobile', responseData.mobile);
  }
  
  // Fix: Properly increment login count based on existing data
  const previousLoginCount = lastLoginInfo?.username === (loginMethod === 'email' ? email : mobileNumber) 
    ? (lastLoginInfo.loginCount || 0) 
    : 0;
  
  const loginInfo = {
    username: loginMethod === 'email' ? email : mobileNumber,
    method: loginMethod,
    timestamp: new Date().toISOString(),
    loginCount: previousLoginCount + 1,
    lastSuccessfulLogin: new Date().toISOString()
  };
  
  localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(loginInfo));
  
  // Save login preferences
  const preferences = {
    preferredMethod: loginMethod,
    lastLoginDate: new Date().toISOString(),
    consecutiveLogins: loginInfo.loginCount
  };
  
  localStorage.setItem(LOGIN_PREFERENCES_KEY, JSON.stringify(preferences));
   clearFailedAttempts();
  toast.success('Login successful! Redirecting...', {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  setTimeout(() => {
    navigate('/mywork');
  }, 2000);
};

// Add this new function to clear saved login information
const handleClearLastLogin = () => {
  localStorage.removeItem(LAST_LOGIN_KEY);
  localStorage.removeItem(LOGIN_PREFERENCES_KEY);
  setLastLoginInfo(null);
  setShowClearLastLogin(false);
  
  // Reset to initial state
  setEmail('');
  setMobileNumber('');
  setPassword('');
  setLoginMethod('');
  setLoginStep('initial');
  setError('');
  
  toast.info('Login history cleared');
};
const handleSessionExpiredRedirect = (expiredUserData) => {
  // This function can be called when session expires
  const loginInfo = {
    username: expiredUserData.email || expiredUserData.mobile || expiredUserData.userName,
    method: expiredUserData.email ? 'email' : 'mobile',
    timestamp: new Date().toISOString(),
    sessionExpired: true
  };
  
  localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(loginInfo));
  
  // Navigate to login with session expired message
  navigate('/login', { 
    state: { 
      sessionExpired: true,
      message: 'Your session has expired. Please login again.' 
    }
  });
};
const handleLoginError = (error) => {
  let errorMessage = 'Login failed. Please try again.';
  
  // Check for SSL/TLS certificate errors
  if (error.code === 'CERT_AUTHORITY_INVALID' || 
      error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
      error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
      error.message?.includes('certificate') ||
      error.message?.includes('SSL') ||
      error.message?.includes('TLS') ||
      error.message?.includes('CERT_') ||
      (error.request && !error.response)) {
    
    setSSLError(true);
    setShowSSLModal(true);
    setError('SSL Certificate required for secure connection');
    toast.error('SSL Certificate installation required');
    return;
  }
  
  if (error.response) {
    const statusCode = error.response.status;
    const responseData = error.response.data;
    
    switch (statusCode) {
      case 400:
        errorMessage = responseData?.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = responseData?.message || 'Invalid credentials. Please check your username and password.';
        break;
      case 403:
        errorMessage = responseData?.message || 'Access forbidden. Please contact support.';
        break;
      case 404:
        errorMessage = 'Login service not found. Please try again later.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = responseData?.message || `Server error (${statusCode}). Please try again.`;
    }
  } else if (error.request) {
    // This could also be a certificate issue
    setSSLError(true);
    setShowSSLModal(true);
    errorMessage = 'Connection error. SSL certificate may be required.';
    toast.error('Connection failed - SSL certificate may be required');
    return;
  } else if (error.code === 'ECONNABORTED') {
    errorMessage = 'Request timeout. Please try again.';
  } else {
    errorMessage = error.message || 'An unexpected error occurred.';
  }
  
  setError(errorMessage);
  toast.error(errorMessage);
};
const handleSSLModalClose = () => {
  setShowSSLModal(false);
};

const handleSSLRetry = () => {
  setShowSSLModal(false);
  setSSLError(false);
  setError('');
  
  // Retry the last attempted action based on current step
  if (loginStep === 'email-password' || loginStep === 'mobile-password') {
    // Create a fake event to retry password submission
    const fakeEvent = { preventDefault: () => {} };
    handlePasswordSubmit(fakeEvent);
  } else if (loginStep === 'otp-verification') {
    const fakeEvent = { preventDefault: () => {} };
    handleOtpVerification(fakeEvent);
  }
};
const handleFailedLoginAttempt = () => {
  const currentUsername = loginMethod === 'email' ? email : mobileNumber;
  const attemptKey = `loginAttempts_${currentUsername}`;
  const attempts = parseInt(localStorage.getItem(attemptKey) || '0') + 1;
  
  localStorage.setItem(attemptKey, attempts.toString());
  localStorage.setItem(`${attemptKey}_timestamp`, new Date().toISOString());
  
  // Clear attempts after successful login
  if (attempts >= 3) {
    toast.warn(`Multiple failed attempts detected for ${currentUsername}`);
  }
};
const clearFailedAttempts = () => {
  const currentUsername = loginMethod === 'email' ? email : mobileNumber;
  const attemptKey = `loginAttempts_${currentUsername}`;
  localStorage.removeItem(attemptKey);
  localStorage.removeItem(`${attemptKey}_timestamp`);
};
const sendOTP = async () => {
  try {
    if (loginMethod === 'email') {
      // Send email OTP
      const response = await axios.post(`${SEND_EMAIL_OTP_URL}?email=${encodeURIComponent(email)}`, {}, {
        headers: {
          'Accept': '*/*'
        },
        timeout: 10000
      });
      
      if (response.status === 200) {
        toast.success('OTP sent to your email!');
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
      }
    } else {
      // Send phone OTP
      const response = await axios.post(`${SEND_PHONE_OTP_URL}?phone=${mobileNumber}`, {}, {
        headers: {
          'Accept': '*/*'
        },
        timeout: 30000
      });
      
      if (response.status === 200) {
        toast.success('OTP sent to your mobile!');
        setTimeLeft(600); // Reset timer to 10 minutes
        setCanResend(false);
      }
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    
    // Check for SSL certificate errors
    if (error.code === 'CERT_AUTHORITY_INVALID' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
        error.message?.includes('certificate') ||
        (error.request && !error.response)) {
      
      setSSLError(true);
      setShowSSLModal(true);
      toast.error('SSL Certificate required to send OTP');
      return;
    }
    
    toast.error('Failed to send OTP. Please try again.');
  }
};
const handleOtpVerification = async (e) => {
  e.preventDefault();
  
  if (otp.length !== 6) {
    setError('Please enter a valid 6-digit OTP');
    toast.error('Please enter a valid 6-digit OTP');
    return;
  }
  
  setOtpLoading(true);
  setError('');

  try {
    const phoneOrEmail = loginMethod === 'email' ? email : mobileNumber;
    
    const response = await axios.post(`${VERIFY_OTP_URL}?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}&otp=${otp}`, {}, {
      headers: {
        'Accept': '*/*'
      }, timeout: 30000
    });

    console.log('OTP verification response:', response.data);

    if (response.status === 200) {
      toast.success('OTP verified successfully!');
      
      // Get user data again and proceed with login
      const userResponse = await axios.get(`${USER_CHECK_URL}/${userId}`, {
        headers: {
          'Accept': '*/*'
        },
        timeout: 30000
      });

      handleSuccessfulLogin(userResponse.data);
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    
    // Check for SSL certificate errors
    if (error.code === 'CERT_AUTHORITY_INVALID' || 
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
        error.message?.includes('certificate') ||
        (error.request && !error.response)) {
      
      setSSLError(true);
      setShowSSLModal(true);
      setError('SSL Certificate required for verification');
      toast.error('SSL Certificate required for OTP verification');
      setOtpLoading(false);
      return;
    }
    
    let errorMessage = 'OTP verification failed. Please try again.';
    
    if (error.response) {
      const responseData = error.response.data;
      errorMessage = responseData?.message || 'Invalid OTP. Please check and try again.';
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setOtpLoading(false);
  }
};


// Function to handle resend OTP
const handleResendOtp = async () => {
  if (!canResend || resendLoading) return;
  
  setResendLoading(true);
  setError('');
  
  try {
    await sendOTP();
    toast.success('New OTP sent successfully!');
  } catch (error) {
    console.error('Resend OTP error:', error);
    toast.error('Failed to resend OTP. Please try again.');
  } finally {
    setResendLoading(false);
  }
};


  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    toast.info('Google Sign-in functionality to be implemented');
    // Implement Google sign-in logic here
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    hover: { 
      scale: 1.02, 
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      y: -2
    },
    tap: { scale: 0.98 }
  };

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const blobVariants = {
    animate: {
      scale: [1, 1.05, 1, 0.95, 1],
      x: [0, 5, 0, -5, 0],
      y: [0, 5, 10, 5, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const errorVariants = {
    initial: { x: 0 },
    animate: { 
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  // Render the initial/email login step (now showing email first)
  const renderInitialStep = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
  >
    {/* Show back button if user came from signup */}
    {window.history.length > 1 && (
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => navigate('/signup')}
          className="text-blue-500 hover:text-blue-700 font-medium transition-all text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
        >
          ← Back to Sign Up
        </motion.button>
      </motion.div>
    )}
    
    <motion.h2 
      className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center mb-4 sm:mb-6"
      variants={itemVariants}
    >
      Login with Email
    </motion.h2>

    <form onSubmit={handleEmailContinue}>
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className="text-gray-400 text-sm sm:text-base" />
          </div>
          <motion.input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
            placeholder="Enter your email address"
            whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
          />
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm mb-4"
          variants={errorVariants}
          initial="initial"
          animate="animate"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Continue
      </motion.button>
    </form>

    <div className="relative flex py-3 sm:py-4 items-center">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="flex-shrink mx-3 sm:mx-4 text-gray-400 text-sm">OR</span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>

    <motion.button
      type="button"
      onClick={() => setLoginStep('mobile')}
      className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 text-sm sm:text-base rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
    >
      <IoIosPhonePortrait className="mr-2 text-lg" />
      Continue with Mobile
    </motion.button>

    <motion.button
      type="button"
      disabled={true}
      className="w-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 py-3 text-sm sm:text-base rounded-lg cursor-not-allowed font-medium mt-3"
      variants={buttonVariants}
    >
      <FcGoogle className="mr-2 text-gray-400 text-lg" />
      Continue with Google
    </motion.button>

    <motion.div 
      className="text-center mt-4"
      variants={itemVariants}
    >
      <p className="text-gray-500 text-sm">
        Don't have an account?{' '}
        <motion.button
          type="button"
          onClick={() => navigate('/signup')}
          className="text-blue-500 hover:text-blue-700 font-semibold transition-all hover:underline"
          whileHover={{ scale: 1.05 }}
        >
          Sign Up
        </motion.button>
      </p>
    </motion.div>
  </motion.div>
);


  // Render the mobile step
  const renderMobileStep = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
  >
    <motion.div className="flex items-center mb-4">
      <motion.button
        type="button"
        onClick={() => {
          // If user has history, go back to initial step, otherwise go to signup
          if (window.history.length > 1) {
            setLoginStep('initial');
          } else {
            navigate('/signup');
          }
        }}
        className="text-blue-500 hover:text-blue-700 font-medium transition-all text-sm sm:text-base"
        whileHover={{ scale: 1.05 }}
      >
        ← Back
      </motion.button>
    </motion.div>
    
    <motion.h2 
      className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center mb-4 sm:mb-6"
      variants={itemVariants}
    >
      Continue with Mobile
    </motion.h2>

    <form onSubmit={handleMobileContinue}>
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
        <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-600 mb-2">
          Mobile Number
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoIosPhonePortrait className="text-gray-500 text-lg sm:text-xl" />
          </div>
          <div className="absolute inset-y-0 left-8 sm:left-9 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium text-sm sm:text-base">+91</span>
          </div>
          <motion.input
            id="mobileNumber"
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className="w-full pl-18 sm:pl-20 pr-4 py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
            placeholder="Enter 10-digit mobile number"
            whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
          />
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm mb-4"
          variants={errorVariants}
          initial="initial"
          animate="animate"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Continue
      </motion.button>
    </form>
  </motion.div>
);


  // Render the password step (common for both email and mobile)
 const renderPasswordStep = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
  >
    <motion.div className="flex items-center justify-between mb-4">
      <motion.button
        type="button"
        onClick={() => {
          // Clear the password when going back
          setPassword('');
          setError('');
          
          // Go to appropriate previous step
          if (loginMethod === 'email') {
            setLoginStep('initial');
          } else {
            setLoginStep('mobile');
          }
        }}
        className="text-blue-500 hover:text-blue-700 font-medium transition-all text-sm sm:text-base"
        whileHover={{ scale: 1.05 }}
      >
        ← Back
      </motion.button>
      
      {/* Fix: Move Clear History button here and improve styling */}
      {showClearLastLogin && (
        <motion.button
          type="button"
          onClick={handleClearLastLogin}
          className="text-red-500 hover:text-red-700 font-medium transition-all text-xs sm:text-sm px-2 py-1 rounded border border-red-200 hover:bg-red-50"
          whileHover={{ scale: 1.05 }}
          title="Clear saved login information"
        >
          Clear History
        </motion.button>
      )}
    </motion.div>
    
    <motion.h2 
      className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center mb-4 sm:mb-6"
      variants={itemVariants}
    >
      Enter Password
    </motion.h2>

    <form onSubmit={handlePasswordSubmit}>
      <motion.div variants={itemVariants} className="mb-4">
        <div className={`${lastLoginInfo?.sessionExpired ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-blue-50 border-blue-100 text-blue-600'} px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm`}>
          {lastLoginInfo?.sessionExpired && (
            <div className="mb-2 font-medium">Your session has expired. Please login again.</div>
          )}
          {loginMethod === 'email' 
            ? (
              <div>
                <span>Welcome back! Signing in with email: </span>
                <span className="font-medium">{email}</span>
                {lastLoginInfo?.loginCount && (
                  <span className="ml-2 text-xs opacity-75">
                    {/* ({lastLoginInfo.loginCount} previous logins) */}
                  </span>
                )}
              </div>
            )
            : (
              <div>
                <span>Welcome back! Signing in with mobile: </span>
                <span className="font-medium">+91 {mobileNumber}</span>
                {lastLoginInfo?.loginCount && (
                  <span className="ml-2 text-xs opacity-75">
                    ({lastLoginInfo.loginCount} previous logins)
                  </span>
                )}
              </div>
            )
          }
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400 text-sm sm:text-base" />
          </div>
          <motion.input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-10 py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
            placeholder="Enter password (min 8 characters)"
            whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash className="text-gray-400 text-sm sm:text-base" /> : <FaEye className="text-gray-400 text-sm sm:text-base" />}
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm mb-4"
          variants={errorVariants}
          initial="initial"
          animate="animate"
        >
          {error}
        </motion.div>
      )}
      
      <motion.div className="text-right mb-4">
        <Link
          to="/forgotpwd"
          className="text-blue-500 hover:text-blue-700 font-medium transition-all text-sm"
        >
          Forgot Password?
        </Link>
      </motion.div>

      <motion.button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing In...
          </span>
        ) : 'Sign In'}
      </motion.button>
    </form>
  </motion.div>
);
const renderOtpVerificationStep = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="w-full max-w-md mx-auto space-y-4 sm:space-y-6"
  >
    <motion.div className="flex items-center mb-4">
      <motion.button
        type="button"
        onClick={() => setLoginStep(loginMethod === 'email' ? 'email-password' : 'mobile-password')}
        className="text-blue-500 hover:text-blue-700 font-medium transition-all text-sm sm:text-base"
        whileHover={{ scale: 1.05 }}
      >
        ← Back
      </motion.button>
    </motion.div>
    
    <motion.h2 
      className="text-2xl sm:text-3xl font-semibold text-gray-700 text-center mb-4 sm:mb-6"
      variants={itemVariants}
    >
      Verify OTP
    </motion.h2>

    <form onSubmit={handleOtpVerification}>
      <motion.div variants={itemVariants} className="mb-4">
        <div className="bg-blue-50 border border-blue-100 text-blue-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
          {loginMethod === 'email' 
            ? `OTP sent to: ${email}` 
            : `OTP sent to: +91 ${mobileNumber}`
          }
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
        <label htmlFor="otp" className="block text-sm font-medium text-gray-600 mb-2">
          Enter 6-digit OTP
        </label>
        <div className="relative">
          <motion.input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
            }}
            className="w-full px-4 py-3 text-base sm:text-lg border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200 text-center font-mono tracking-wider sm:tracking-widest"
            placeholder="000000"
            maxLength={6}
            whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-4 text-center">
        {timeLeft > 0 ? (
          <p className="text-gray-500 text-xs sm:text-sm">
            OTP expires in: <span className="font-mono font-semibold text-blue-600">{formatTime(timeLeft)}</span>
          </p>
        ) : (
          <p className="text-red-500 text-xs sm:text-sm font-semibold">OTP expired</p>
        )}
        
        <motion.button
          type="button"
          onClick={handleResendOtp}
          disabled={!canResend || resendLoading}
          className={`mt-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
            canResend && !resendLoading
              ? 'text-blue-500 hover:text-blue-700 cursor-pointer hover:underline'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          whileHover={canResend && !resendLoading ? { scale: 1.05 } : {}}
          whileTap={canResend && !resendLoading ? { scale: 0.95 } : {}}
        >
          {resendLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-3 sm:h-4 w-3 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : 'Resend OTP'}
        </motion.button>
      </motion.div>

      {error && (
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm mb-4"
          variants={errorVariants}
          initial="initial"
          animate="animate"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={otpLoading || otp.length !== 6}
        className="w-full bg-blue-500 text-white py-3 text-sm sm:text-base rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover={!otpLoading && otp.length === 6 ? "hover" : {}}
        whileTap={!otpLoading && otp.length === 6 ? "tap" : {}}
      >
        {otpLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 sm:h-5 w-4 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        ) : 'Verify OTP'}
      </motion.button>
    </form>
    
    <motion.div variants={itemVariants} className="text-center">
      <p className="text-xs text-gray-400">
        Didn't receive the OTP? Check your spam folder or wait for the timer to expire to resend.
      </p>
    </motion.div>
  </motion.div>
);
return (
  <div className="min-h-screen flex flex-col">
    {/* Header - Updated for mobile */}
    <header className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-start">
          <img
            src="/logo.png"
            alt="myBOQ Logo"
            className="h-8 sm:h-10 w-auto mr-3 sm:mr-4 ml-0"
          />
          <span className="text-xl sm:text-2xl font-bold text-gray-800">myBOQ</span>
        </div>
      </div>
    </header>
    
    {/* Main Content Area - Updated for mobile */}
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-6 overflow-auto">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="!text-sm"
      />
      
      <motion.div 
        className="w-full max-w-6xl bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[500px] sm:min-h-[600px] max-h-[90vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Hidden on mobile, visible on tablets and desktop */}
        <div className="hidden lg:flex bg-gradient-to-br from-blue-300 to-indigo-400 items-center justify-center p-8 xl:p-12 relative overflow-hidden">
          <motion.div 
            className="text-center z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-3xl xl:text-4xl font-bold text-white mb-6"
              variants={itemVariants}
            >
              Welcome Back To myBOQ
            </motion.h1>
            <motion.div
              variants={floatVariants}
              animate="float"
            >
              <img 
                src="/login.svg" 
                alt="WorkSpace Logo" 
                className="w-full max-w-xs mx-auto" 
              />
            </motion.div>
          </motion.div>
          
          {/* Background Animation Elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <motion.div 
              className="absolute w-40 h-40 bg-white opacity-5 rounded-full -top-10 -left-10"
              variants={blobVariants}
              animate="animate"
            ></motion.div>
            <motion.div 
              className="absolute w-32 h-32 bg-white opacity-5 rounded-full top-1/2 -right-10"
              variants={blobVariants}
              animate="animate"
              transition={{ delay: 2 }}
            ></motion.div>
            <motion.div 
              className="absolute w-36 h-36 bg-white opacity-5 rounded-full -bottom-10 left-1/4"
              variants={blobVariants}
              animate="animate"
              transition={{ delay: 4 }}
            ></motion.div>
          </div>
        </div>

        {/* Right Side - Full width on mobile, half width on desktop */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
          {/* Mobile header - Only visible on mobile, now properly positioned */}
          <div className="lg:hidden w-full text-center mb-6 flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">Sign in to continue to myBOQ</p>
          </div>
          {/* <button
  onClick={handleManualSSLInstall}
  className="text-blue-500 hover:text-blue-700 text-sm underline"
>
  SSL Certificate Setup
</button> */}
          <div className="w-full flex-1 flex flex-col justify-center">
            {loginStep === 'initial' && renderInitialStep()}
            {loginStep === 'mobile' && renderMobileStep()}
            {loginStep === 'email-password' && renderPasswordStep()}
            {loginStep === 'mobile-password' && renderPasswordStep()}
            {loginStep === 'otp-verification' && renderOtpVerificationStep()}
          </div>
        </div>
      </motion.div>
    </div>
    <SSLCertificateInstallation
  isOpen={showSSLModal}
  onClose={handleSSLModalClose}
  onRetry={handleSSLRetry}
  certificateUrl="/rootCA.crt" // Make sure this path is correct for your setup
/>
  </div>
);
};
export const clearUserSession = () => {
  // Clear all user session data but keep login history
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('jwt');
  localStorage.removeItem('Id');
  localStorage.removeItem('id');
  localStorage.removeItem('fullName');
  localStorage.removeItem('mobile');
  // Keep LAST_LOGIN_KEY and LOGIN_PREFERENCES_KEY for next login
};
export const handleSessionExpiry = (expiredUserData = null) => {
  let loginInfo = null;
  
  try {
    // Try to get current user data
    const currentUser = expiredUserData || JSON.parse(localStorage.getItem('user') || '{}');
    
    if (currentUser && (currentUser.email || currentUser.mobile || currentUser.userName)) {
      // Get existing login info to preserve count
      const existingInfo = JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) || '{}');
      
      loginInfo = {
        username: currentUser.email || currentUser.mobile || currentUser.userName,
        method: currentUser.email ? 'email' : 'mobile',
        timestamp: new Date().toISOString(),
        sessionExpired: true,
        logoutReason: 'Session expired',
        loginCount: existingInfo.loginCount || 0 // Preserve login count
      };
    }
  } catch (error) {
    console.error('Error handling session expiry:', error);
  }
  
  // Clear session data but keep login history
  clearUserSession();
  
  // Save login info with session expired flag
  if (loginInfo) {
    localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(loginInfo));
  }
  
  // Navigate to login with session expired state
  if (typeof window !== 'undefined') {
    window.location.href = '/login?sessionExpired=true';
  }
};
// Function for forced logout with reason
export const handleForceLogout = (reason = 'Logged out') => {
  let loginInfo = null;
  
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (currentUser && (currentUser.email || currentUser.mobile || currentUser.userName)) {
      // FIX: Get existing login info to preserve count
      const existingInfo = JSON.parse(localStorage.getItem(LAST_LOGIN_KEY) || '{}');
      
      loginInfo = {
        username: currentUser.email || currentUser.mobile || currentUser.userName,
        method: currentUser.email ? 'email' : 'mobile',
        timestamp: new Date().toISOString(),
        sessionExpired: reason.toLowerCase().includes('session') || reason.toLowerCase().includes('expired'),
        logoutReason: reason,
        loginCount: existingInfo.loginCount || 0 // ADD THIS LINE
      };
    }
  } catch (error) {
    console.error('Error during force logout:', error);
  }
  
  // Clear session data
  clearUserSession();
  
  // Save login info
  if (loginInfo) {
    localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify(loginInfo));
  }
  
  // Navigate to login
  window.location.href = '/login';
};
export default LoginPage;




// import React, { useState,useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone } from 'react-icons/fa';
// import { FcGoogle } from "react-icons/fc";
// import { IoIosPhonePortrait } from "react-icons/io";
// import { Link } from 'react-router-dom';

// const LoginPage = () => {
//   const navigate = useNavigate();
//    const currentYear = new Date().getFullYear();
  
//   // State management
//   const [loginStep, setLoginStep] = useState('initial'); // initial, email, email-password, mobile, mobile-password
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [loginMethod, setLoginMethod] = useState(''); // 'email' or 'mobile'
// const [otp, setOtp] = useState('');
// const [otpLoading, setOtpLoading] = useState(false);
// const [resendLoading, setResendLoading] = useState(false);
// const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
// const [canResend, setCanResend] = useState(false);
// const [userId, setUserId] = useState(null);

//   // API URLs
//   const API_BASE_URL = 'https://24.101.103.87:8082/api';
// const SIGNIN_URL = `${API_BASE_URL}/auth/signin`;
// const USER_CHECK_URL = `${API_BASE_URL}/auth/user`;
// const SEND_PHONE_OTP_URL = `${API_BASE_URL}/otp/phone/send`;
// const SEND_EMAIL_OTP_URL = `${API_BASE_URL}/otp/emailOtp/send`;
// const VERIFY_OTP_URL = `${API_BASE_URL}/otp/verify`;
// useEffect(() => {
//   let interval = null;
//   if (loginStep === 'otp-verification' && timeLeft > 0) {
//     interval = setInterval(() => {
//       setTimeLeft(timeLeft => {
//         if (timeLeft <= 1) {
//           setCanResend(true);
//           return 0;
//         }
//         return timeLeft - 1;
//       });
//     }, 1000);
//   } else if (timeLeft === 0) {
//     setCanResend(true);
//   }
//   return () => clearInterval(interval);
// }, [loginStep, timeLeft]);
// const formatTime = (seconds) => {
//   const minutes = Math.floor(seconds / 60);
//   const remainingSeconds = seconds % 60;
//   return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
// };

//   // Handle continue with email
//   const handleEmailContinue = (e) => {
//     e.preventDefault();
//     if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       setError('Please enter a valid email address');
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     setLoginMethod('email');
//     setError('');
//     setLoginStep('email-password');
//   };

//   // Handle continue with mobile
//   const handleMobileContinue = (e) => {
//     e.preventDefault();
//     if (!mobileNumber.trim() || !/^[0-9]{10}$/.test(mobileNumber)) {
//       setError('Please enter a valid 10-digit mobile number');
//       toast.error('Please enter a valid 10-digit mobile number');
//       return;
//     }

//     setLoginMethod('mobile');
//     setError('');
//     setLoginStep('mobile-password');
//   };

//   const handlePasswordSubmit = async (e) => {
//   e.preventDefault();
//   if (!password.trim() || password.length < 8) {
//     setError('Password must be at least 8 characters');
//     toast.error('Password must be at least 8 characters');
//     return;
//   }
  
//   setLoading(true);
//   setError('');

//   try {
//     // Create login payload
//     const payload = {
//       userName: loginMethod === 'email' ? email : mobileNumber,
//       password: password
//     };

//     console.log('Login payload:', payload);

//     // Call sign-in API
//     const response = await axios.post(SIGNIN_URL, payload, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       timeout: 30000
//     });

//     console.log('API Response:', response.data);
    
//     if (response.status >= 200 && response.status < 300) {
//       const responseData = response.data;
      
//       // Check if user ID is available
//       if (responseData.id) {
//         setUserId(responseData.id);
        
//         // Check user status using the user check API
//         const userCheckResponse = await axios.get(`${USER_CHECK_URL}/${responseData.id}`, {
//           headers: {
//             'Accept': '*/*'
//           },
//          timeout: 30000 
//         });

//         console.log('User check response:', userCheckResponse.data);

//         if (userCheckResponse.data.active === 1) {
//           // User is already verified, proceed with login
//           handleSuccessfulLogin(responseData);
//         } else {
//           // User needs OTP verification
//           setLoginStep('otp-verification');
//           await sendOTP();
//         }
//       } else {
//         setError('Login response missing user ID');
//         toast.error('Login response missing user ID');
//       }
//     } else {
//       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//     }
//   } catch (error) {
//     console.error('Login error:', error);
//     handleLoginError(error);
//   } finally {
//     setLoading(false);
//   }
// };
// const handleSuccessfulLogin = (responseData) => {
//   // Store the complete user object
//   localStorage.setItem('user', JSON.stringify(responseData));
  
//   // Store individual items for backward compatibility
//   const token = responseData.jwt || responseData.token || responseData.accessToken || responseData.authToken || responseData.access_token;
//   if (token) {
//     localStorage.setItem('authToken', token);
//     localStorage.setItem('jwt', token);
//   }
  
//   if (responseData.id) {
//     localStorage.setItem('Id', responseData.id.toString());
//     localStorage.setItem('id', responseData.id.toString());
//   }
  
//   if (responseData.fullName) {
//     localStorage.setItem('fullName', responseData.fullName);
//   }
  
//   if (responseData.mobile) {
//     localStorage.setItem('mobile', responseData.mobile);
//   }
  
//   toast.success('Login successful! Redirecting...', {
//     position: "top-right",
//     autoClose: 2000,
//     hideProgressBar: false,
//     closeOnClick: true,
//     pauseOnHover: true,
//     draggable: true,
//   });
  
//   setTimeout(() => {
//     navigate('/mywork');
//   }, 2000);
// };
// const handleLoginError = (error) => {
//   let errorMessage = 'Login failed. Please try again.';
  
//   if (error.response) {
//     const statusCode = error.response.status;
//     const responseData = error.response.data;
    
//     switch (statusCode) {
//       case 400:
//         errorMessage = responseData?.message || 'Invalid request. Please check your input.';
//         break;
//       case 401:
//         errorMessage = responseData?.message || 'Invalid credentials. Please check your username and password.';
//         break;
//       case 403:
//         errorMessage = responseData?.message || 'Access forbidden. Please contact support.';
//         break;
//       case 404:
//         errorMessage = 'Login service not found. Please try again later.';
//         break;
//       case 500:
//         errorMessage = 'Server error. Please try again later.';
//         break;
//       default:
//         errorMessage = responseData?.message || `Server error (${statusCode}). Please try again.`;
//     }
//   } else if (error.request) {
//     errorMessage = 'Network error. Please check your internet connection.';
//   } else if (error.code === 'ECONNABORTED') {
//     errorMessage = 'Request timeout. Please try again.';
//   } else {
//     errorMessage = error.message || 'An unexpected error occurred.';
//   }
  
//   setError(errorMessage);
//   toast.error(errorMessage);
// };
// const sendOTP = async () => {
//   try {
//     if (loginMethod === 'email') {
//       // Send email OTP
//       const response = await axios.post(`${SEND_EMAIL_OTP_URL}?email=${encodeURIComponent(email)}`, {}, {
//         headers: {
//           'Accept': '*/*'
//         },
//         timeout: 10000
//       });
      
//       if (response.status === 200) {
//         toast.success('OTP sent to your email!');
//         setTimeLeft(600); // Reset timer to 10 minutes
//         setCanResend(false);
//       }
//     } else {
//       // Send phone OTP
//       const response = await axios.post(`${SEND_PHONE_OTP_URL}?phone=${mobileNumber}`, {}, {
//         headers: {
//           'Accept': '*/*'
//         },
//         timeout: 30000
//       });
      
//       if (response.status === 200) {
//         toast.success('OTP sent to your mobile!');
//         setTimeLeft(600); // Reset timer to 10 minutes
//         setCanResend(false);
//       }
//     }
//   } catch (error) {
//     console.error('Send OTP error:', error);
//     toast.error('Failed to send OTP. Please try again.');
//   }
// };
// const handleOtpVerification = async (e) => {
//   e.preventDefault();
  
//   if (otp.length !== 6) {
//     setError('Please enter a valid 6-digit OTP');
//     toast.error('Please enter a valid 6-digit OTP');
//     return;
//   }
  
//   setOtpLoading(true);
//   setError('');

//   try {
//     const phoneOrEmail = loginMethod === 'email' ? email : mobileNumber;
    
//     const response = await axios.post(`${VERIFY_OTP_URL}?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}&otp=${otp}`, {}, {
//       headers: {
//         'Accept': '*/*'
//       }, timeout: 30000
//     });

//     console.log('OTP verification response:', response.data);

//     if (response.status === 200) {
//       toast.success('OTP verified successfully!');
      
//       // Get user data again and proceed with login
//       const userResponse = await axios.get(`${USER_CHECK_URL}/${userId}`, {
//         headers: {
//           'Accept': '*/*'
//         },
//         timeout: 30000
//       });

//       handleSuccessfulLogin(userResponse.data);
//     }
//   } catch (error) {
//     console.error('OTP verification error:', error);
//     let errorMessage = 'OTP verification failed. Please try again.';
    
//     if (error.response) {
//       const responseData = error.response.data;
//       errorMessage = responseData?.message || 'Invalid OTP. Please check and try again.';
//     }
    
//     setError(errorMessage);
//     toast.error(errorMessage);
//   } finally {
//     setOtpLoading(false);
//   }
// };

// // Function to handle resend OTP
// const handleResendOtp = async () => {
//   if (!canResend || resendLoading) return;
  
//   setResendLoading(true);
//   setError('');
  
//   try {
//     await sendOTP();
//     toast.success('New OTP sent successfully!');
//   } catch (error) {
//     console.error('Resend OTP error:', error);
//     toast.error('Failed to resend OTP. Please try again.');
//   } finally {
//     setResendLoading(false);
//   }
// };


//   // Handle Google sign-in
//   const handleGoogleSignIn = () => {
//     toast.info('Google Sign-in functionality to be implemented');
//     // Implement Google sign-in logic here
//   };

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         when: "beforeChildren",
//         staggerChildren: 0.2,
//         duration: 0.5
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: { duration: 0.5 }
//     }
//   };

//   const buttonVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1 },
//     hover: { 
//       scale: 1.02, 
//       boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//       y: -2
//     },
//     tap: { scale: 0.98 }
//   };

//   const floatVariants = {
//     float: {
//       y: [0, -10, 0],
//       transition: {
//         duration: 6,
//         repeat: Infinity,
//         ease: "easeInOut"
//       }
//     }
//   };

//   const blobVariants = {
//     animate: {
//       scale: [1, 1.05, 1, 0.95, 1],
//       x: [0, 5, 0, -5, 0],
//       y: [0, 5, 10, 5, 0],
//       transition: {
//         duration: 10,
//         repeat: Infinity,
//         ease: "easeInOut"
//       }
//     }
//   };

//   const errorVariants = {
//     initial: { x: 0 },
//     animate: { 
//       x: [0, -5, 5, -5, 5, 0],
//       transition: { duration: 0.5 }
//     }
//   };

//   // Render the initial/email login step (now showing email first)
//   const renderInitialStep = () => (
//     <motion.div 
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="w-full max-w-md space-y-6"
//     >
//       <motion.h2 
//         className="text-3xl font-semibold text-gray-700 text-center mb-6"
//         variants={itemVariants}
//       >
//         Login with Email
//       </motion.h2>

//       <form onSubmit={handleEmailContinue}>
//         <motion.div variants={itemVariants} className="mb-6">
//           <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
//             Email Address
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaEnvelope className="text-gray-400" />
//             </div>
//             <motion.input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
//               placeholder="Enter your email address"
//               whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
//             />
//           </div>
//         </motion.div>

//         {error && (
//           <motion.div 
//             className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
//             variants={errorVariants}
//             initial="initial"
//             animate="animate"
//           >
//             {error}
//           </motion.div>
//         )}

//         <motion.button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//         >
//           Continue
//         </motion.button>
//       </form>

//       <div className="relative flex py-4 items-center">
//         <div className="flex-grow border-t border-gray-200"></div>
//         <span className="flex-shrink mx-4 text-gray-400">OR</span>
//         <div className="flex-grow border-t border-gray-200"></div>
//       </div>

//       <motion.button
//         type="button"
//         onClick={() => setLoginStep('mobile')}
//         className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
//         variants={buttonVariants}
//         whileHover="hover"
//         whileTap="tap"
//       >
//         <IoIosPhonePortrait className="mr-2" />
//         Continue with Mobile
//       </motion.button>

//       <motion.button
//         type="button"
//         disabled={true}
//         className="w-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 py-3 rounded-lg cursor-not-allowed font-medium mt-3"
//         variants={buttonVariants}
//       >
//         <FcGoogle className="mr-2 text-gray-400" />
//         Continue with Google
//       </motion.button>

//       <motion.div 
//         className="text-center mt-4"
//         variants={itemVariants}
//       >
//         <p className="text-gray-500">
//           Don't have an account?{' '}
//           <motion.button
//             type="button"
//             onClick={() => navigate('/signup')}
//             className="text-blue-500 hover:text-blue-700 font-semibold transition-all hover:underline"
//             whileHover={{ scale: 1.05 }}
//           >
//             Sign Up
//           </motion.button>
//         </p>
//       </motion.div>
//     </motion.div>
//   );

//   // Render the mobile step
//   const renderMobileStep = () => (
//     <motion.div 
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="w-full max-w-md space-y-6"
//     >
//       <motion.div className="flex items-center mb-4">
//         <motion.button
//           type="button"
//           onClick={() => setLoginStep('initial')}
//           className="text-blue-500 hover:text-blue-700 font-medium transition-all"
//           whileHover={{ scale: 1.05 }}
//         >
//           ← Back
//         </motion.button>
//       </motion.div>
      
//       <motion.h2 
//         className="text-3xl font-semibold text-gray-700 text-center mb-6"
//         variants={itemVariants}
//       >
//         Continue with Mobile
//       </motion.h2>

//       <form onSubmit={handleMobileContinue}>
//         <motion.div variants={itemVariants} className="mb-6">
//           <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-600 mb-2">
//             Mobile Number
//           </label>
//           <div className="relative">
//             {/* Country code prefix */}
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <IoIosPhonePortrait className="text-gray-500 text-xl" />
//             </div>
//             <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
//               <span className="text-gray-500 font-medium">+91</span>
//             </div>
//             <motion.input
//               id="mobileNumber"
//               type="tel"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               className="w-full pl-20 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
//               placeholder="Enter 10-digit mobile number"
//               whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
//             />
//           </div>
//         </motion.div>

//         {error && (
//           <motion.div 
//             className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
//             variants={errorVariants}
//             initial="initial"
//             animate="animate"
//           >
//             {error}
//           </motion.div>
//         )}

//         <motion.button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//         >
//           Continue
//         </motion.button>
//       </form>
//     </motion.div>
//   );

//   // Render the password step (common for both email and mobile)
//   const renderPasswordStep = () => (
//     <motion.div 
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//       className="w-full max-w-md space-y-6"
//     >
//       <motion.div className="flex items-center mb-4">
//         <motion.button
//           type="button"
//           onClick={() => setLoginStep(loginMethod === 'email' ? 'initial' : 'mobile')}
//           className="text-blue-500 hover:text-blue-700 font-medium transition-all"
//           whileHover={{ scale: 1.05 }}
//         >
//           ← Back
//         </motion.button>
//       </motion.div>
      
//       <motion.h2 
//         className="text-3xl font-semibold text-gray-700 text-center mb-6"
//         variants={itemVariants}
//       >
//         Enter Password
//       </motion.h2>

//       <form onSubmit={handlePasswordSubmit}>
//         {/* Display which method is being used */}
//         <motion.div variants={itemVariants} className="mb-4">
//           <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
//             {loginMethod === 'email' 
//               ? `Signing in with email: ${email}` 
//               : `Signing in with mobile: +91 ${mobileNumber}`
//             }
//           </div>
//         </motion.div>
        
//         {/* Password Input */}
//         <motion.div variants={itemVariants} className="mb-6">
//           <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <FaLock className="text-gray-400" />
//             </div>
//             <motion.input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
//               placeholder="Enter password (min 8 characters)"
//               whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
//               {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
//             </div>
//           </div>
//         </motion.div>

//         {error && (
//           <motion.div 
//             className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
//             variants={errorVariants}
//             initial="initial"
//             animate="animate"
//           >
//             {error}
//           </motion.div>
//         )}
        
//         <motion.div className="text-right mb-4">
//           <Link
//             to="/forgotpwd"
//             className="text-blue-500 hover:text-blue-700 font-medium transition-all"
//           >
//             Forgot Password?
//           </Link>
//         </motion.div>

//         <motion.button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//         >
//           {loading ? (
//             <span className="flex items-center justify-center">
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Signing In...
//             </span>
//           ) : 'Sign In'}
//         </motion.button>
//       </form>
//     </motion.div>
//   );
// const renderOtpVerificationStep = () => (
//   <motion.div 
//     variants={containerVariants}
//     initial="hidden"
//     animate="visible"
//     className="w-full max-w-md space-y-6"
//   >
//     <motion.div className="flex items-center mb-4">
//       <motion.button
//         type="button"
//         onClick={() => setLoginStep(loginMethod === 'email' ? 'email-password' : 'mobile-password')}
//         className="text-blue-500 hover:text-blue-700 font-medium transition-all"
//         whileHover={{ scale: 1.05 }}
//       >
//         ← Back
//       </motion.button>
//     </motion.div>
    
//     <motion.h2 
//       className="text-3xl font-semibold text-gray-700 text-center mb-6"
//       variants={itemVariants}
//     >
//       Verify OTP
//     </motion.h2>

//     <form onSubmit={handleOtpVerification}>
//       {/* Display verification method */}
//       <motion.div variants={itemVariants} className="mb-4">
//         <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
//           {loginMethod === 'email' 
//             ? `OTP sent to: ${email}` 
//             : `OTP sent to: +91 ${mobileNumber}`
//           }
//         </div>
//       </motion.div>
      
//       {/* OTP Input */}
//       <motion.div variants={itemVariants} className="mb-6">
//         <label htmlFor="otp" className="block text-sm font-medium text-gray-600 mb-2">
//           Enter 6-digit OTP
//         </label>
//         <div className="relative">
//           <motion.input
//             id="otp"
//             type="text"
//             value={otp}
//             onChange={(e) => {
//               const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//               setOtp(value);
//             }}
//             className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200 text-center text-lg font-mono tracking-widest"
//             placeholder="000000"
//             maxLength={6}
//             whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
//           />
//         </div>
//       </motion.div>

//       {/* Timer and Resend */}
//       <motion.div variants={itemVariants} className="mb-4 text-center">
//         {timeLeft > 0 ? (
//           <p className="text-gray-500 text-sm">
//             OTP expires in: <span className="font-mono font-semibold text-blue-600">{formatTime(timeLeft)}</span>
//           </p>
//         ) : (
//           <p className="text-red-500 text-sm font-semibold">OTP expired</p>
//         )}
        
//         <motion.button
//           type="button"
//           onClick={handleResendOtp}
//           disabled={!canResend || resendLoading}
//           className={`mt-2 text-sm font-medium transition-all duration-200 ${
//             canResend && !resendLoading
//               ? 'text-blue-500 hover:text-blue-700 cursor-pointer hover:underline'
//               : 'text-gray-400 cursor-not-allowed'
//           }`}
//           whileHover={canResend && !resendLoading ? { scale: 1.05 } : {}}
//           whileTap={canResend && !resendLoading ? { scale: 0.95 } : {}}
//         >
//           {resendLoading ? (
//             <span className="flex items-center justify-center">
//               <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Sending...
//             </span>
//           ) : 'Resend OTP'}
//         </motion.button>
//       </motion.div>

//       {error && (
//         <motion.div 
//           className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
//           variants={errorVariants}
//           initial="initial"
//           animate="animate"
//         >
//           {error}
//         </motion.div>
//       )}

//       <motion.button
//         type="submit"
//         disabled={otpLoading || otp.length !== 6}
//         className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
//         variants={buttonVariants}
//         whileHover={!otpLoading && otp.length === 6 ? "hover" : {}}
//         whileTap={!otpLoading && otp.length === 6 ? "tap" : {}}
//       >
//         {otpLoading ? (
//           <span className="flex items-center justify-center">
//             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Verifying...
//           </span>
//         ) : 'Verify OTP'}
//       </motion.button>
//     </form>
    
//     {/* Additional help text */}
//     <motion.div variants={itemVariants} className="text-center">
//       <p className="text-xs text-gray-400">
//         Didn't receive the OTP? Check your spam folder or wait for the timer to expire to resend.
//       </p>
//     </motion.div>
//   </motion.div>
// );

//  return (
//     <div className="h-screen flex flex-col overflow-hidden">
//       <header className="w-full bg-white shadow-sm border-b border-gray-100 flex-shrink-0">
//         <div className="w-full px-4 py-4">
//           <div className="flex items-center justify-start">
//             <img
//               src="/logo.png"
//               alt="myBOQ Logo"
//               className="h-10 w-auto mr-4 ml-0"
//             />
//             <span className="text-2xl font-bold text-gray-800">myBOQ</span>
//           </div>
//         </div>
//       </header>
      
//       <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 overflow-hidden">
//         {/* Toast Container */}
//         <ToastContainer
//           position="top-right"
//           autoClose={5000}
//           hideProgressBar={false}
//           newestOnTop
//           closeOnClick
//           rtl={false}
//           pauseOnFocusLoss
//           draggable
//           pauseOnHover
//           theme="colored"
//         />
        
//         <motion.div 
//           className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-full"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//         >
//           {/* Left Side - Gradient with animation */}
//           <div className="bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center p-12 relative overflow-hidden">
//             <motion.div 
//               className="text-center z-10"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <motion.h1 
//                 className="text-4xl font-bold text-white mb-6"
//                 variants={itemVariants}
//               >
//                 Welcome Back To myBOQ
//               </motion.h1>
//               <motion.div
//                 variants={floatVariants}
//                 animate="float"
//               >
//                 <img 
//                   src="/login.svg" 
//                   alt="WorkSpace Logo" 
//                   className="w-full max-w-xs mx-auto" 
//                 />
//               </motion.div>
//             </motion.div>
            
//             {/* Background Animation Elements */}
//             <div className="absolute top-0 left-0 w-full h-full">
//               <motion.div 
//                 className="absolute w-40 h-40 bg-white opacity-5 rounded-full -top-10 -left-10"
//                 variants={blobVariants}
//                 animate="animate"
//               ></motion.div>
//               <motion.div 
//                 className="absolute w-32 h-32 bg-white opacity-5 rounded-full top-1/2 -right-10"
//                 variants={blobVariants}
//                 animate="animate"
//                 transition={{ delay: 2 }}
//               ></motion.div>
//               <motion.div 
//                 className="absolute w-36 h-36 bg-white opacity-5 rounded-full -bottom-10 left-1/4"
//                 variants={blobVariants}
//                 animate="animate"
//                 transition={{ delay: 4 }}
//               ></motion.div>
//             </div>
//           </div>

//           {/* Right Side - Login Form with animations */}
//           <div className="flex items-center justify-center p-8 overflow-y-auto max-h-full">
//             {loginStep === 'initial' && renderInitialStep()}
//             {loginStep === 'mobile' && renderMobileStep()}
//             {loginStep === 'email-password' && renderPasswordStep()}
//             {loginStep === 'mobile-password' && renderPasswordStep()}
//             {loginStep === 'otp-verification' && renderOtpVerificationStep()}
//           </div>
//         </motion.div>
//       </div>
      
//       {/* <footer className="w-full bg-gray-100 border-t border-gray-200 flex-shrink-0">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="text-center text-gray-600 text-sm">
//             © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
//           </div>
//         </div>
//       </footer> */}
//     </div>
//   );
// };

// export default LoginPage;