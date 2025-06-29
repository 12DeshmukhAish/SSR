
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { IoIosPhonePortrait } from "react-icons/io";
import { Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  // State management
  const [resetStep, setResetStep] = useState('initial'); // initial, email, mobile, reset-password
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMethod, setResetMethod] = useState(''); // 'email' or 'mobile'
  const [userValidationBypass, setUserValidationBypass] = useState(false);

  // API URLs
  const API_BASE_URL = 'https://24.101.103.87:8082';
  const USER_VALIDATION_URL = `${API_BASE_URL}/api/auth/isValidUser`;
  const UPDATE_PASSWORD_URL = `${API_BASE_URL}/api/auth/update-password`;

  // Validate user exists
  // Validate user exists
const validateUser = async (userName) => {
  try {
    const response = await axios.get(`${USER_VALIDATION_URL}?userName=${encodeURIComponent(userName)}`);
    
    console.log('User validation API Response:', response.data);
    
    // Check if response has the success message indicating user exists
    if (response.data && 
        response.data.message && 
        response.data.message.toLowerCase().includes('user name already registered')) {
      // User exists, proceed to password reset
      return true;
    } 
    // Legacy support for numeric response
    else if (response.data === 1) {
      // User exists, proceed to password reset
      return true;
    } 
    else if (response.data === 0) {
      // User does not exist
      const errorMsg = 'This email or mobile is not registered.';
      setError(errorMsg);
      toast.error('Account not found. Please check your email/mobile or sign up first.', {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#EF4444", color: "#fff" }
      });
      return false;
    } 
    else {
      // Unexpected response - check if it's an error message about user not found
      const responseMessage = response.data?.message || response.data || '';
      if (responseMessage.toLowerCase().includes('not found') || 
          responseMessage.toLowerCase().includes('not registered') ||
          responseMessage.toLowerCase().includes('does not exist')) {
        const errorMsg = 'This email or mobile is not registered.';
        setError(errorMsg);
        toast.error('Account not found. Please check your email/mobile or sign up first.', {
          position: "top-right",
          autoClose: 4000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      } else {
        // Other unexpected response
        toast.warning('Unable to verify user. Please try again.', {
          position: "top-right",
          autoClose: 4000,
          style: { background: "#F59E0B", color: "#fff" }
        });
        return false;
      }
    }
  } catch (err) {
    console.log('User validation API Error:', err.response?.status, err.response?.data);
    
    if (err.response?.status === 400) {
      const errorMessage = err.response?.data?.message || err.response?.data || '';
      
      if (errorMessage.toLowerCase().includes('username is not present') || 
          errorMessage.toLowerCase().includes('not present') ||
          errorMessage.toLowerCase().includes('user not found') ||
          errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('not registered')) {
        // Username not present means user doesn't exist
        setError('This email or mobile is not registered.');
        toast.error('Account not found. Please check your email/mobile or sign up first.', {
          position: "top-right",
          autoClose: 4000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      } else {
        setError(errorMessage || 'Error validating user');
        toast.error(errorMessage || 'Error checking user. Please try again.', {
          position: "top-right",
          autoClose: 4000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      }
    } else if (err.response?.status === 404) {
      // 404 means user not found
      setError('This email or mobile is not registered.');
      toast.error('Account not found. Please check your email/mobile or sign up first.', {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#EF4444", color: "#fff" }
      });
      return false;
    } else {
      // Network errors
      const errorType = err.code === 'ECONNABORTED' || err.message.includes('timeout') ? 'timeout' : 'network';
      const errorMsg = errorType === 'timeout' ? 
        'Request timeout. Please check your connection.' : 
        'Network error. Please check your connection.';
      
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#EF4444", color: "#fff" }
      });
      return false;
    }
  }
};

  // Handle continue with mobile
  const handleMobileContinue = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim() || !/^[0-9]{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    const isValidUser = await validateUser(mobileNumber);
    if (isValidUser) {
      setResetMethod('mobile');
      setResetStep('reset-password');
    }
    setLoading(false);
  };

  const handleEmailContinue = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const isValidUser = await validateUser(email);
    if (isValidUser) {
      setResetMethod('email');
      setResetStep('reset-password');
    }
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      setError('Please enter your current password');
      toast.error('Please enter your current password');
      return;
    }
    
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
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        username: resetMethod === 'email' ? email : mobileNumber,
        currentPassword: currentPassword,
        newPassword: newPassword
      };

      const response = await axios.post(UPDATE_PASSWORD_URL, payload);
      
      if (response.data) {
        toast.success('Password updated successfully! Redirecting to login...', {
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
      console.error('Password update error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to update password. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#EF4444", color: "#fff" }
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    toast.info('Google password reset functionality to be implemented');
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

  // Render the initial step
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
        onClick={() => setResetStep('mobile')}
        className="w-full flex items-center justify-center bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <IoIosPhonePortrait className="mr-2 text-xl" />
        Reset with Mobile Number
      </motion.button>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <motion.button
        type="button"
        onClick={() => setResetStep('email')}
        className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <FaEnvelope className="mr-2" />
        Reset with Email
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
        Reset with Google
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
        Reset with Mobile
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
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          ) : 'Continue'}
        </motion.button>
      </form>
    </motion.div>
  );

  // Render the email step
  const renderEmailStep = () => (
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
        Reset with Email
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
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          ) : 'Continue'}
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
          onClick={() => setResetStep(resetMethod === 'email' ? 'email' : 'mobile')}
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
        Update Password
      </motion.h2>

      <form onSubmit={handlePasswordReset}>
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            {resetMethod === 'email' 
              ? `Updating password for: ${email}` 
              : `Updating password for: +91 ${mobileNumber}`
            }
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600 mb-2">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <motion.input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter your current password"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
              {showCurrentPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
            </div>
          </div>
        </motion.div>

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
              Updating Password...
            </span>
          ) : 'Update Password'}
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
          <div className="bg-gradient-to-br from-blue-300 to-blue-400 flex items-center justify-center p-12 relative overflow-hidden">
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
                Reset Your Password
              </motion.h1>
              <motion.p 
                className="text-white text-lg mb-6 opacity-90"
                variants={itemVariants}
              >
                Update your password with your current credentials
</motion.p>
              <motion.div 
                className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border border-white/30"
                variants={itemVariants}
              >
                <p className="text-white text-sm">
                  Don't worry, we'll help you get back to your account safely and securely.
                </p>
              </motion.div>
            </motion.div>

            {/* Animated background elements */}
            <motion.div 
              className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
              variants={floatVariants}
              animate="float"
            />
            <motion.div 
              className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full"
              variants={floatVariants}
              animate="float"
              style={{ animationDelay: '2s' }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full"
              variants={floatVariants}
              animate="float"
              style={{ animationDelay: '4s' }}
            />
            
            {/* Animated blob */}
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl"
              variants={blobVariants}
              animate="animate"
            />
            <motion.div 
              className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-xl"
              variants={blobVariants}
              animate="animate"
              style={{ animationDelay: '3s' }}
            />
          </div>

          {/* Right Side - Form */}
          <div className="flex items-center justify-center p-12">
            {resetStep === 'initial' && renderInitialStep()}
            {resetStep === 'mobile' && renderMobileStep()}
            {resetStep === 'email' && renderEmailStep()}
            {resetStep === 'reset-password' && renderPasswordResetStep()}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {currentYear} myBOQ. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;