import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaPhone, FaKey } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { IoIosPhonePortrait } from "react-icons/io";
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
   const currentYear = new Date().getFullYear();
  
  // State management
  const [resetStep, setResetStep] = useState('initial'); // initial, email, mobile, otp-verification, reset-password
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMethod, setResetMethod] = useState(''); // 'email' or 'mobile'
  const [otpSent, setOtpSent] = useState(false);

  // API URLs
  const API_BASE_URL = 'https://api-ssrpro.siliconmount.com/api/auth';
  const FORGOT_PASSWORD_URL = `${API_BASE_URL}/forgot-password`;
  const RESET_PASSWORD_URL = `${API_BASE_URL}/reset-password`;

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

    try {
      const payload = {
        additionalProp1: mobileNumber, // username/phone
        additionalProp2: "mobile", // method type
        additionalProp3: "forgot-password" // action type
      };

      const response = await axios.post(FORGOT_PASSWORD_URL, payload);
      
      if (response.data) {
        setResetMethod('mobile');
        setOtpSent(true);
        setResetStep('otp-verification');
        toast.success('OTP sent to your mobile number successfully!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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

    try {
      const payload = {
        additionalProp1: email, // username/email
        additionalProp2: "email", // method type
        additionalProp3: "forgot-password" // action type
      };

      const response = await axios.post(FORGOT_PASSWORD_URL, payload);
      
      if (response.data) {
        setResetMethod('email');
        setOtpSent(true);
        setResetStep('otp-verification');
        toast.success('OTP sent to your email successfully!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 4) {
      setError('Please enter a valid OTP');
      toast.error('Please enter a valid OTP');
      return;
    }
    
    setError('');
    setResetStep('reset-password');
    toast.success('OTP verified successfully!');
  };

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
    
    setLoading(true);
    setError('');

    try {
      const payload = {
        additionalProp1: resetMethod === 'email' ? email : mobileNumber, // username
        additionalProp2: otp, // OTP as current password verification
        additionalProp3: newPassword // new password
      };

      const response = await axios.post(RESET_PASSWORD_URL, payload);
      
      if (response.data) {
        toast.success('Password reset successful! Redirecting to login...', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = () => {
    toast.info('Google password reset functionality to be implemented');
    // Implement Google sign-in logic here
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const payload = {
        additionalProp1: resetMethod === 'email' ? email : mobileNumber,
        additionalProp2: resetMethod,
        additionalProp3: "resend-otp"
      };

      await axios.post(FORGOT_PASSWORD_URL, payload);
      toast.success('OTP resent successfully!');
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
              Sending OTP...
            </span>
          ) : 'Send OTP'}
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
        Verify OTP
      </motion.h2>

      <form onSubmit={handleOtpVerification}>
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            {resetMethod === 'email' 
              ? `OTP sent to: ${email}` 
              : `OTP sent to: +91 ${mobileNumber}`
            }
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
            disabled={loading}
            className="text-blue-500 hover:text-blue-700 font-medium transition-all"
            whileHover={{ scale: 1.05 }}
          >
            Resend OTP
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
          Verify OTP
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

          {/* Right Side - Reset Form with animations */}
          <div className="flex items-center justify-center p-12">
            {resetStep === 'initial' && renderInitialStep()}
            {resetStep === 'mobile' && renderMobileStep()}
            {resetStep === 'email' && renderEmailStep()}
            {resetStep === 'otp-verification' && renderOtpStep()}
            {resetStep === 'reset-password' && renderPasswordResetStep()}
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

export default ForgotPasswordPage;