import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { IoIosPhonePortrait } from "react-icons/io";
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  // State management
  const [loginStep, setLoginStep] = useState('initial'); // initial, email, email-password, mobile, mobile-password, otp-verification
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState(''); // 'email' or 'mobile'
  
  // OTP related states
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [userId, setUserId] = useState('');
  
  // API URLs - Updated to match the correct API endpoints
  const API_BASE_URL = 'https://24.101.103.87:8082/api';
  const SIGNIN_URL = `${API_BASE_URL}/auth/signin`;
  const USER_DETAILS_URL = `${API_BASE_URL}/auth/user`;
  const OTP_PHONE_SEND_URL = `${API_BASE_URL}/otp/phone/send`;
  const OTP_EMAIL_SEND_URL = `${API_BASE_URL}/otp/emailOtp/send`;
  const OTP_VERIFY_URL = `${API_BASE_URL}/otp/verify`;

  // Timer effect for OTP countdown
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

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Check user OTP status
  const checkUserOtpStatus = async (token, userIdFromLogin) => {
    try {
      const response = await axios.get(`${USER_DETAILS_URL}/${userIdFromLogin}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      });

      const userData = response.data;
      console.log('User data:', userData);

      // Check if OTP is already used/verified
      if (userData.otp_used_flg === true) {
        // OTP already verified, proceed to mywork
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', token);
        localStorage.setItem('jwt', token);
        localStorage.setItem('Id', userIdFromLogin.toString());
        localStorage.setItem('id', userIdFromLogin.toString());
        
        if (userData.fullName) {
          localStorage.setItem('fullName', userData.fullName);
        }
        if (userData.mobile) {
          localStorage.setItem('mobile', userData.mobile);
        }

        toast.success('Login successful! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });
        
        setTimeout(() => {
          navigate('/mywork');
        }, 2000);
      } else {
        // OTP not verified, show OTP verification step
        setAuthToken(token);
        setUserId(userIdFromLogin);
        setLoginStep('otp-verification');
        
        // Send OTP automatically
        await sendOtp(token, userData);
      }
    } catch (error) {
      console.error('Error checking user OTP status:', error);
      setError('Failed to verify user status. Please try again.');
      toast.error('Failed to verify user status. Please try again.');
    }
  };

  // Send OTP function - Updated with correct API integration
  const sendOtp = async (token, userData = null) => {
    try {
      setOtpLoading(true);
      setError('');
      
      let otpResponse;
      if (loginMethod === 'email') {
        // Send OTP to email using the correct API endpoint
        otpResponse = await axios.post(`${OTP_EMAIL_SEND_URL}?email=${encodeURIComponent(email)}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
      } else {
        // Send OTP to mobile using the correct API endpoint
        otpResponse = await axios.post(`${OTP_PHONE_SEND_URL}?phone=${mobileNumber}`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
      }

      console.log('OTP send response:', otpResponse.data);
      
      if (otpResponse.status === 200) {
        toast.success(`OTP sent successfully to your ${loginMethod === 'email' ? 'email' : 'mobile number'}!`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Reset timer to 10 minutes
        setTimeLeft(600);
        setCanResend(false);
      } else {
        throw new Error('Failed to send OTP');
      }
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = `Failed to send OTP to ${loginMethod === 'email' ? 'email' : 'mobile'}. Please try again.`;
      
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        switch (statusCode) {
          case 400:
            errorMessage = responseData?.message || 'Invalid request. Please check your details.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please login again.';
            break;
          case 404:
            errorMessage = 'Service not available. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = responseData?.message || `Failed to send OTP (Error: ${statusCode})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      await sendOtp(authToken);
      toast.info('OTP resent successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Handle OTP verification - Updated with correct API integration
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      // Use the correct parameter name 'phoneOrEmail' as per API documentation
      const phoneOrEmail = loginMethod === 'email' ? email : mobileNumber;
      
      const verifyResponse = await axios.post(
        `${OTP_VERIFY_URL}?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}&otp=${otp}`, 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': '*/*'
          }
        }
      );

      console.log('OTP verification response:', verifyResponse.data);

      if (verifyResponse.status === 200) {
        toast.success('OTP verified successfully! Redirecting...', {
          position: "top-right",
          autoClose: 2000,
        });
        
        // Get updated user data after successful OTP verification
        const userResponse = await axios.get(`${USER_DETAILS_URL}/${userId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': '*/*'
          }
        });

        const userData = userResponse.data;
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('jwt', authToken);
        localStorage.setItem('Id', userId.toString());
        localStorage.setItem('id', userId.toString());
        
        if (userData.fullName) {
          localStorage.setItem('fullName', userData.fullName);
        }
        if (userData.mobile) {
          localStorage.setItem('mobile', userData.mobile);
        }
        
        // Redirect to mywork page after successful verification
        setTimeout(() => {
          navigate('/mywork');
        }, 2000);
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      
      let errorMessage = 'OTP verification failed. Please try again.';
      
      if (error.response) {
        const statusCode = error.response.status;
        const responseData = error.response.data;
        
        switch (statusCode) {
          case 400:
            errorMessage = 'Invalid OTP. Please check and try again.';
            break;
          case 401:
            errorMessage = 'OTP expired or invalid. Please resend OTP.';
            break;
          case 404:
            errorMessage = 'Verification service not found. Please try again.';
            break;
          case 500:
            errorMessage = 'Server error during verification. Please try again.';
            break;
          default:
            errorMessage = responseData?.message || `Verification failed (Error: ${statusCode})`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle password submit
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
        timeout: 10000
      });

      console.log('API Response:', response.data);
      
      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;
        
        // Get token and user ID
        const token = responseData.jwt || 
                     responseData.token || 
                     responseData.accessToken || 
                     responseData.authToken || 
                     responseData.access_token;

        const userIdFromResponse = responseData.id;

        if (token && userIdFromResponse) {
          // Check user OTP status
          await checkUserOtpStatus(token, userIdFromResponse);
        } else {
          setError('Login response missing required authentication data');
          toast.error('Login response missing required authentication data');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
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
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    toast.info('Google Sign-in functionality to be implemented');
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
 // Render OTP verification step
 const renderOtpVerificationStep = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setLoginStep(loginMethod === 'email' ? 'email-password' : 'mobile-password')}
          className="text-blue-500 hover:text-blue-700 font-medium transition-all"
          whileHover={{ scale: 1.05 }}
        >
          ← Back
        </motion.button>
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-semibold text-gray-700 text-center mb-6"
        variants={itemVariants}
      >
        Verify OTP
      </motion.h2>

      <form onSubmit={handleOtpVerification}>
        {/* Display verification method */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            {loginMethod === 'email' 
              ? `OTP sent to: ${email}` 
              : `OTP sent to: +91 ${mobileNumber}`
            }
          </div>
        </motion.div>
        
        {/* OTP Input */}
        <motion.div variants={itemVariants} className="mb-6">
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200 text-center text-lg font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
          </div>
        </motion.div>

        {/* Timer and Resend */}
        <motion.div variants={itemVariants} className="mb-4 text-center">
          {timeLeft > 0 ? (
            <p className="text-gray-500 text-sm">
              OTP expires in: <span className="font-mono font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-red-500 text-sm font-semibold">OTP expired</p>
          )}
          
          <motion.button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || resendLoading}
            className={`mt-2 text-sm font-medium transition-all duration-200 ${
              canResend && !resendLoading
                ? 'text-blue-500 hover:text-blue-700 cursor-pointer hover:underline'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            whileHover={canResend && !resendLoading ? { scale: 1.05 } : {}}
            whileTap={canResend && !resendLoading ? { scale: 0.95 } : {}}
          >
            {resendLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
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
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          variants={buttonVariants}
          whileHover={!otpLoading && otp.length === 6 ? "hover" : {}}
          whileTap={!otpLoading && otp.length === 6 ? "tap" : {}}
        >
          {otpLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : 'Verify OTP'}
        </motion.button>
      </form>
      
      {/* Additional help text */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-xs text-gray-400">
          Didn't receive the OTP? Check your spam folder or wait for the timer to expire to resend.
        </p>
      </motion.div>
    </motion.div>
  );
 
  // Render the initial/email login step
  const renderInitialStep = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.h2 
        className="text-3xl font-semibold text-gray-700 text-center mb-6"
        variants={itemVariants}
      >
        Login with Email
      </motion.h2>

      <form onSubmit={handleEmailContinue}>
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <motion.input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter your email address"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
          </div>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
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
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Continue
        </motion.button>
      </form>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <motion.button
        type="button"
        onClick={() => setLoginStep('mobile')}
        className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <IoIosPhonePortrait className="mr-2" />
        Continue with Mobile
      </motion.button>

      <motion.button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium mt-3"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
       <FcGoogle className="mr-2 text-red-500" />
        Continue with Google
      </motion.button>

      <motion.div 
        className="text-center mt-4"
        variants={itemVariants}
      >
        <p className="text-gray-500">
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
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setLoginStep('initial')}
          className="text-blue-500 hover:text-blue-700 font-medium transition-all"
          whileHover={{ scale: 1.05 }}
        >
          ← Back
        </motion.button>
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-semibold text-gray-700 text-center mb-6"
        variants={itemVariants}
      >
        Continue with Mobile
      </motion.h2>

      <form onSubmit={handleMobileContinue}>
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-600 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoIosPhonePortrait className="text-gray-500 text-xl" />
            </div>
            <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">+91</span>
            </div>
            <motion.input
              id="mobileNumber"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full pl-20 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter 10-digit mobile number"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
          </div>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
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
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
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
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setLoginStep(loginMethod === 'email' ? 'initial' : 'mobile')}
          className="text-blue-500 hover:text-blue-700 font-medium transition-all"
          whileHover={{ scale: 1.05 }}
        >
          ← Back
        </motion.button>
      </motion.div>
      
      <motion.h2 
        className="text-3xl font-semibold text-gray-700 text-center mb-6"
        variants={itemVariants}
      >
        Enter Password
      </motion.h2>

      <form onSubmit={handlePasswordSubmit}>
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            {loginMethod === 'email' 
              ? `Signing in with email: ${email}` 
              : `Signing in with mobile: +91 ${mobileNumber}`
            }
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <motion.input
              id="password"
             type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter your password"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </motion.button>
          </div>
        </motion.div>

        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
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
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
          variants={buttonVariants}
          whileHover={!loading ? "hover" : {}}
          whileTap={!loading ? "tap" : {}}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : 'Sign In'}
        </motion.button>

        <motion.div 
          className="text-center mt-4"
          variants={itemVariants}
        >
          <motion.button
            type="button"
            onClick={() => navigate('/forgotpwd')}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-all hover:underline"
            whileHover={{ scale: 1.05 }}
          >
            Forgot Password?
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
  return (
      <div>
     <header className="w-full bg-white shadow-sm border-b border-gray-100">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center">
      <img 
        src="/logo.png" 
        alt="myBOQ Logo" 
        className="h-10 w-auto mr-3"
      />
      <span className="text-2xl font-bold text-gray-800">myBOQ</span>
    </div>
  </div>
</header>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
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
        theme="colored" // Makes toasts more visually appealing
      />

      <motion.div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left Side - Gradient with animation */}
        <div className="bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center p-12 relative overflow-hidden">
          <motion.div 
            className="text-center z-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-4xl font-bold text-white mb-6"
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

        {/* Right Side - Login Form with animations */}
        <div className="flex items-center justify-center p-12">
{loginStep === 'initial' && renderInitialStep()}
        {loginStep === 'mobile' && renderMobileStep()}
        {(loginStep === 'email-password' || loginStep === 'mobile-password') && renderPasswordStep()}
        {loginStep === 'otp-verification' && renderOtpVerificationStep()}
        </div>
      </motion.div>
    </div>
        <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-center text-gray-600 text-sm">
          © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </footer>
    </div>
  );
};

export default LoginPage;


// import React, { useState } from 'react';
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

//   // API URLs
//   const API_BASE_URL = 'https://24.101.103.87:8082/api/auth';
//   const SIGNIN_URL = `${API_BASE_URL}/signin`;

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
//     e.preventDefault();
//     if (!password.trim() || password.length < 8) {
//       setError('Password must be at least 8 characters');
//       toast.error('Password must be at least 8 characters');
//       return;
//     }
    
//     setLoading(true);
//     setError('');

//     try {
//       // Create login payload
//       const payload = {
//         userName: loginMethod === 'email' ? email : mobileNumber,
//         password: password
//       };

//       console.log('Login payload:', payload); // Debug log

//       // Call sign-in API with proper headers
//       const response = await axios.post(SIGNIN_URL, payload, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         timeout: 10000 // 10 second timeout
//       });

//       console.log('API Response:', response.data); // Debug log
      
//       // Handle different response scenarios
     
// if (response.status >= 200 && response.status < 300) {
//   const responseData = response.data;
  
//   // Check for JWT token in the response
//   const token = responseData.jwt || 
//                responseData.token || 
//                responseData.accessToken || 
//                responseData.authToken || 
//                responseData.access_token;

//   if (token || responseData.id) {
//     // Store the complete user object (this is what your MyWork page expects)
//     localStorage.setItem('user', JSON.stringify(responseData));
    
//     // Also store individual items for backward compatibility
//     if (token) {
//       localStorage.setItem('authToken', token);
//       localStorage.setItem('jwt', token);
//     }
    
//     // Store user ID
//     if (responseData.id) {
//       localStorage.setItem('Id', responseData.id.toString());
//       localStorage.setItem('id', responseData.id.toString());
//     }
    
//     // Store other user info
//     if (responseData.fullName) {
//       localStorage.setItem('fullName', responseData.fullName);
//     }
    
//     if (responseData.mobile) {
//       localStorage.setItem('mobile', responseData.mobile);
//     }
    
//     toast.success('Login successful! Redirecting...', {
//       position: "top-right",
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//     });
    
//     setTimeout(() => {
//       navigate('/mywork');
//     }, 2000);
//   } else {
//     // Handle case where we have a successful response but no clear token/id
//     setError('Login response missing required authentication data');
//     toast.error('Login response missing required authentication data');
//   }
// } else {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error('Login error:', error);
      
//       let errorMessage = 'Login failed. Please try again.';
      
//       if (error.response) {
//         // Server responded with error status
//         const statusCode = error.response.status;
//         const responseData = error.response.data;
        
//         switch (statusCode) {
//           case 400:
//             errorMessage = responseData?.message || 'Invalid request. Please check your input.';
//             break;
//           case 401:
//             errorMessage = responseData?.message || 'Invalid credentials. Please check your username and password.';
//             break;
//           case 403:
//             errorMessage = responseData?.message || 'Access forbidden. Please contact support.';
//             break;
//           case 404:
//             errorMessage = 'Login service not found. Please try again later.';
//             break;
//           case 500:
//             errorMessage = 'Server error. Please try again later.';
//             break;
//           default:
//             errorMessage = responseData?.message || `Server error (${statusCode}). Please try again.`;
//         }
        
//         console.log('Server error response:', responseData);
//       } else if (error.request) {
//         // Network error
//         errorMessage = 'Network error. Please check your internet connection.';
//       } else if (error.code === 'ECONNABORTED') {
//         // Timeout error
//         errorMessage = 'Request timeout. Please try again.';
//       } else {
//         errorMessage = error.message || 'An unexpected error occurred.';
//       }
      
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

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
//         onClick={handleGoogleSignIn}
//         className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium mt-3"
//         variants={buttonVariants}
//         whileHover="hover"
//         whileTap="tap"
//       >
//        <FcGoogle className="mr-2 text-red-500" />
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

//   return (
//       <div>
//      <header className="w-full bg-white shadow-sm border-b border-gray-100">
//   <div className="max-w-7xl mx-auto px-6 py-4">
//     <div className="flex items-center">
//       <img 
//         src="/logo.png" 
//         alt="myBOQ Logo" 
//         className="h-10 w-auto mr-3"
//       />
//       <span className="text-2xl font-bold text-gray-800">myBOQ</span>
//     </div>
//   </div>
// </header>
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
//       {/* Toast Container */}
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored" // Makes toasts more visually appealing
//       />
      
//       <motion.div 
//         className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//       >
//         {/* Left Side - Gradient with animation */}
//         <div className="bg-gradient-to-br from-blue-300 to-indigo-400 flex items-center justify-center p-12 relative overflow-hidden">
//           <motion.div 
//             className="text-center z-10"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             <motion.h1 
//               className="text-4xl font-bold text-white mb-6"
//               variants={itemVariants}
//             >
//               Welcome Back To myBOQ
//             </motion.h1>
//             <motion.div
//               variants={floatVariants}
//               animate="float"
//             >
//               <img 
//                 src="/login.svg" 
//                 alt="WorkSpace Logo" 
//                 className="w-full max-w-xs mx-auto" 
//               />
//             </motion.div>
//           </motion.div>
          
//           {/* Background Animation Elements */}
//           <div className="absolute top-0 left-0 w-full h-full">
//             <motion.div 
//               className="absolute w-40 h-40 bg-white opacity-5 rounded-full -top-10 -left-10"
//               variants={blobVariants}
//               animate="animate"
//             ></motion.div>
//             <motion.div 
//               className="absolute w-32 h-32 bg-white opacity-5 rounded-full top-1/2 -right-10"
//               variants={blobVariants}
//               animate="animate"
//               transition={{ delay: 2 }}
//             ></motion.div>
//             <motion.div 
//               className="absolute w-36 h-36 bg-white opacity-5 rounded-full -bottom-10 left-1/4"
//               variants={blobVariants}
//               animate="animate"
//               transition={{ delay: 4 }}
//             ></motion.div>
//           </div>
//         </div>

//         {/* Right Side - Login Form with animations */}
//         <div className="flex items-center justify-center p-12">
//           {loginStep === 'initial' && renderInitialStep()}
//           {loginStep === 'mobile' && renderMobileStep()}
//           {loginStep === 'email-password' && renderPasswordStep()}
//           {loginStep === 'mobile-password' && renderPasswordStep()}
//         </div>
//       </motion.div>
//     </div>
//         <footer className="w-full bg-gray-100 border-t border-gray-200">
//       <div className="max-w-7xl mx-auto px-6 py-4">
//         <div className="text-center text-gray-600 text-sm">
//           © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
//         </div>
//       </div>
//     </footer>
//     </div>
//   );
// };

// export default LoginPage;