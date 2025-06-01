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

const LoginPage = () => {
  const navigate = useNavigate();
   const currentYear = new Date().getFullYear();
  
  // State management
  const [loginStep, setLoginStep] = useState('initial'); // initial, email, email-password, mobile-password
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState(''); // 'email' or 'mobile'

  // API URLs
  const API_BASE_URL = 'https://24.101.103.87:8082/api/auth';
  const SIGNIN_URL = `${API_BASE_URL}/signin`;

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

      console.log('Login payload:', payload); // Debug log

      // Call sign-in API with proper headers
      const response = await axios.post(SIGNIN_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('API Response:', response.data); // Debug log
      
      // Handle different response scenarios
      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;
        
        // Check for various possible token fields
        const token = responseData.token || 
                     responseData.accessToken || 
                     responseData.authToken || 
                     responseData.access_token ||
                     responseData.jwt;

        if (token) {
          // Store token in localStorage for future authenticated requests
          localStorage.setItem('authToken', token);
          
          // Store user data if available
          if (responseData.user) {
            localStorage.setItem('userData', JSON.stringify(responseData.user));
          }
          
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
        } else if (responseData.success === true || responseData.status === 'success') {
          // Handle successful login without explicit token
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
        } else {
          // Handle cases where login might be successful but structure is different
          const errorMessage = responseData.message || 
                              responseData.error || 
                              'Login successful but unexpected response format';
          
          if (responseData.message && responseData.message.toLowerCase().includes('success')) {
            toast.success('Login successful! Redirecting...', {
              position: "top-right",
              autoClose: 2000,
            });
            setTimeout(() => {
              navigate('/mywork');
            }, 2000);
          } else {
            setError(errorMessage);
            toast.error(errorMessage);
          }
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
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
        
        console.log('Server error response:', responseData);
      } else if (error.request) {
        // Network error
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
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

  // Render the mobile/initial login step
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
        Login with Mobile
      </motion.h2>

      <form onSubmit={handleMobileContinue}>
        <motion.div variants={itemVariants} className="mb-6">
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-600 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            {/* Country code prefix */}
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

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <motion.button
        type="button"
        onClick={() => setLoginStep('email')}
        className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-all duration-300 font-medium"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <FaEnvelope className="mr-2" />
        Continue with Email
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
        Continue with Email
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
          onClick={() => setLoginStep(loginMethod === 'email' ? 'email' : 'initial')}
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
        {/* Display which method is being used */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-600 px-4 py-3 rounded-lg text-sm">
            {loginMethod === 'email' 
              ? `Signing in with email: ${email}` 
              : `Signing in with mobile: +91 ${mobileNumber}`
            }
          </div>
        </motion.div>
        
        {/* Password Input */}
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
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all hover:border-blue-200"
              placeholder="Enter password (min 8 characters)"
              whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
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
        
        <motion.div className="text-right mb-4">
          <Link
            to="/forgotpwd"
            className="text-blue-500 hover:text-blue-700 font-medium transition-all"
          >
            Forgot Password?
          </Link>
        </motion.div>

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
              Signing In...
            </span>
          ) : 'Sign In'}
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
          {loginStep === 'email' && renderEmailStep()}
          {loginStep === 'email-password' && renderPasswordStep()}
          {loginStep === 'mobile-password' && renderPasswordStep()}
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