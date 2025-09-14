import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone, FaKey } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { IoIosPhonePortrait } from "react-icons/io";
import { Link } from 'react-router-dom';
import { API_BASE_URL} from '../config';
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  // State management
  const [resetStep, setResetStep] = useState('initial'); // initial, username-input, otp-verification, reset-password
  const [selectedMethod, setSelectedMethod] = useState(''); // 'email', 'mobile', 'google'
  const [username, setUsername] = useState(''); // email or mobile number
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // API URLs
  // const API_BASE_URL = 'https://24.101.103.87:8082/api';
  
  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    } else if (otpTimer === 0 && otpSent) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer, otpSent]);

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate username based on selected method
  const validateUsername = () => {
    if (selectedMethod === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
    } else if (selectedMethod === 'mobile') {
      return /^[0-9]{10}$/.test(username);
    }
    return false;
  };

  // Handle method selection and proceed to username input
  const handleMethodSelection = (method) => {
    setSelectedMethod(method);
    setUsername('');
    setError('');
    
    if (method === 'google') {
      toast.info('Google password reset functionality to be implemented');
      return;
    }
    
    setResetStep('username-input');
  };

  // Handle username validation and OTP sending
  // Replace the handleUsernameContinue function with this fixed version

const handleUsernameContinue = async (e) => {
  e.preventDefault();
  
  if (!validateUsername()) {
    const errorMsg = selectedMethod === 'email' 
      ? 'Please enter a valid email address'
      : 'Please enter a valid 10-digit mobile number';
    setError(errorMsg);
    toast.error(errorMsg);
    return;
  }

  setLoading(true);
  setError('');

  try {
    // First check if user exists
    const userValidationResponse = await axios.get(
      `${API_BASE_URL}/api/auth/isValidUser?userName=${encodeURIComponent(username)}`
    );
    
    console.log('User validation response:', userValidationResponse.data);
    
    // Check if the response indicates user exists
    // The API returns an object with message: "Success: User name already registered. Please log in."
    const isUserValid = userValidationResponse.data === 1 || 
                       (userValidationResponse.data && 
                        userValidationResponse.data.message && 
                        userValidationResponse.data.message.includes('already registered'));
    
    if (!isUserValid) {
      setError('This account does not exist. Please check your details or create a new account.');
      toast.error('This account does not exist. Please check your details or create a new account.');
      setLoading(false);
      return;
    }

    // User exists, now send OTP
    let otpResponse;
    if (selectedMethod === 'email') {
      otpResponse = await axios.post(
        `${API_BASE_URL}/api/otp/emailOtp/send?email=${encodeURIComponent(username)}`
      );
    } else {
      otpResponse = await axios.post(
        `${API_BASE_URL}/api/otp/phone/send?phone=${encodeURIComponent(username)}`
      );
    }
    
    if (otpResponse.status === 200) {
      setOtpSent(true);
      setOtpTimer(600); // 10 minutes = 600 seconds
      setCanResendOtp(false);
      setResetStep('otp-verification');
      toast.success(`OTP sent to your ${selectedMethod} successfully!`);
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error.response?.data?.message || 
      `Failed to process request. Please try again.`;
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Handle OTP verification
  const handleOtpVerification = async (e) => {
    e.preventDefault();
    
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP');
      toast.error('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/otp/verify?phoneOrEmail=${encodeURIComponent(username)}&otp=${encodeURIComponent(otp)}`
      );
      
      if (response.status === 200) {
        setResetStep('reset-password');
        toast.success('OTP verified successfully!');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword.trim() || newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    
    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      toast.error('Password must be stronger. Include uppercase, lowercase, number and special character.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password?userName=${encodeURIComponent(username)}&password=${encodeURIComponent(newPassword)}`
      );
      
      if (response.status === 200) {
        toast.success('Password reset successful! Redirecting to login...', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setLoading(true);
    try {
      let response;
      if (selectedMethod === 'email') {
        response = await axios.post(
          `${API_BASE_URL}/api/otp/emailOtp/send?email=${encodeURIComponent(username)}`
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/otp/phone/send?phone=${encodeURIComponent(username)}`
        );
      }
      
      if (response.status === 200) {
        setOtpTimer(600); // Reset timer to 10 minutes
        setCanResendOtp(false);
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Render the initial step - method selection
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
        Reset Password
      </motion.h2>

      <motion.p 
        className="text-gray-600 text-center mb-8"
        variants={itemVariants}
      >
        Choose how you'd like to reset your password
      </motion.p>

      <motion.button
        type="button"
        onClick={() => handleMethodSelection('email')}
        className="w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <FaEnvelope className="mr-2" />
        Continue with Email
      </motion.button>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <motion.button
        type="button"
        onClick={() => handleMethodSelection('mobile')}
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
        onClick={() => handleMethodSelection('google')}
        className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium mt-3"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
       <FcGoogle className="mr-2 text-red-500" />
        Continue with Google
      </motion.button>

      <motion.div 
        className="text-center mt-6"
        variants={itemVariants}
      >
        <p className="text-gray-500">
          Remember your password?{' '}
          <motion.button
            type="button"
            onClick={() => navigate('/signin')}
            className="text-blue-500 hover:text-blue-700 font-semibold transition-all hover:underline"
            whileHover={{ scale: 1.05 }}
          >
            Back to Login
          </motion.button>
        </p>
      </motion.div>
    </motion.div>
  );

  // Render the username input step
  const renderUsernameInputStep = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setResetStep('initial')}
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
        {selectedMethod === 'email' ? 'Reset with Email' : 'Reset with Mobile'}
      </motion.h2>

      <form onSubmit={handleUsernameContinue}>
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-2">
            {selectedMethod === 'email' ? 'Email Address' : 'Mobile Number'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {selectedMethod === 'email' ? (
                <FaEnvelope className="text-gray-400" />
              ) : (
                <>
                  <IoIosPhonePortrait className="text-gray-500 text-xl" />
                </>
              )}
            </div>
            {selectedMethod === 'mobile' && (
              <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">+91</span>
              </div>
            )}
            <motion.input
              id="username"
              type={selectedMethod === 'email' ? 'email' : 'tel'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full ${selectedMethod === 'mobile' ? 'pl-20' : 'pl-10'} pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200`}
              placeholder={selectedMethod === 'email' ? 'Enter your email address' : 'Enter 10-digit mobile number'}
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
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending OTP...
            </span>
          ) : 'Send OTP'}
        </motion.button>
      </form>
    </motion.div>
  );

  // Render OTP verification step
  const renderOtpStep = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setResetStep('username-input')}
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
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            OTP sent to: {selectedMethod === 'email' ? username : `+91 ${username}`}
            {otpTimer > 0 && (
              <div className="mt-1 text-blue-500 font-medium">
                Time remaining: {formatTimer(otpTimer)}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="otp" className="block text-sm font-medium text-gray-600 mb-2">
            Enter OTP
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaKey className="text-gray-400" />
            </div>
            <motion.input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter the OTP"
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

        <motion.div className="text-center mb-4">
          <span className="text-gray-500">Didn't receive OTP? </span>
          <motion.button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || !canResendOtp}
            className={`font-medium transition-all ${
              canResendOtp 
                ? 'text-blue-500 hover:text-blue-700 cursor-pointer' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            whileHover={canResendOtp ? { scale: 1.05 } : {}}
          >
            {canResendOtp ? 'Resend OTP' : `Resend in ${formatTimer(otpTimer)}`}
          </motion.button>
        </motion.div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </motion.button>
      </form>
    </motion.div>
  );

  // Render password reset step
  const renderPasswordResetStep = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6"
    >
      <motion.div className="flex items-center mb-4">
        <motion.button
          type="button"
          onClick={() => setResetStep('otp-verification')}
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
        Set New Password
      </motion.h2>

      <form onSubmit={handlePasswordReset}>
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <motion.input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter new password (min 8 characters)"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Password must contain uppercase, lowercase, number and special character
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <motion.input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Confirm your new password"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
            </div>
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
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting Password...
            </span>
          ) : 'Reset Password'}
        </motion.button>
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
        />
        
        <motion.div 
          className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
         {/* Left Side - Gradient with animation */}
          <div className="bg-gradient-to-br from-blue-400 to-indigo-600 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
            {/* Animated background blobs */}
            <motion.div 
              className="absolute top-10 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full"
              variants={blobVariants}
              animate="animate"
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"
              variants={blobVariants}
              animate="animate"
              style={{ animationDelay: '2s' }}
            />
            <motion.div 
              className="absolute top-1/2 left-5 w-12 h-12 bg-white bg-opacity-10 rounded-full"
              variants={blobVariants}
              animate="animate"
              style={{ animationDelay: '4s' }}
            />
            
            {/* Main content */}
            <motion.div 
              className="text-center z-10"
              variants={floatVariants}
              animate="float"
            >
              
              
              <motion.h1 
                className="text-3xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Secure Password Reset
              </motion.h1>
              
              <motion.p 
                className="text-white text-lg mb-6 opacity-90"
                variants={itemVariants}
              >
                Don't worry, we'll help you get back into your account
              </motion.p>
              <motion.div
                variants={floatVariants}
                animate="float"
              >
                <img 
                  src="/forgot.png" 
                  alt="Forgot Password Illustration" 
                  className="w-full max-w-xs mx-auto" 
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Right side - Form content */}
          <div className="p-8 flex flex-col justify-center">
            {resetStep === 'initial' && renderInitialStep()}
            {resetStep === 'username-input' && renderUsernameInputStep()}
            {resetStep === 'otp-verification' && renderOtpStep()}
            {resetStep === 'reset-password' && renderPasswordResetStep()}
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
     {/* <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="text-center text-gray-600 text-sm">
          © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
        </div>
      </div>
    </footer> */}
    </div>
  );
};

export default ForgotPasswordPage;