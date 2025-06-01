import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

// Create a custom axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'https://24.101.103.87:8082/api', // Base URL for all requests
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Disable credentials if not needed
});
 const currentYear = new Date().getFullYear();
const SignupPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  // Track registration step
  const [step, setStep] = useState(0); // 0: initial, 1: contact info, 2: password, 3: verification sent
  const [contactMethod, setContactMethod] = useState('mobile'); // 'email' or 'mobile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous errors when user starts typing
    setError('');
  };

  // Handle contact method selection
  const handleContactMethod = (method) => {
    setContactMethod(method);
    setStep(1);
  };

  // Validate current step
  const validateStep = () => {
    if (step === 1) {
      if (!formData.userName.trim()) {
        setError('Full Name is required');
        toast.error('Please enter your full name', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      }
  
      if (contactMethod === 'email') {
        if (!formData.email.trim()) {
          setError('Email is required');
          toast.error('Please enter your email', {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#EF4444", color: "#fff" }
          });
          return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Invalid email format');
          toast.error('Invalid email address', {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#EF4444", color: "#fff" }
          });
          return false;
        }
      }
  
      if (contactMethod === 'mobile') {
        if (!formData.mobile.trim()) {
          setError('Mobile number is required');
          toast.error('Please enter your mobile number', {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#EF4444", color: "#fff" }
          });
          return false;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.mobile)) {
          setError('Invalid mobile number');
          toast.error('Please enter a valid 10-digit mobile number', {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#EF4444", color: "#fff" }
          });
          return false;
        }
      }
    } else if (step === 2) {
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordPattern.test(formData.password)) {
        setError('Password must be at least 8 characters and include letters, numbers, and a special character');
        toast.error('Weak password. Include letters, numbers, and special characters.', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      }
      if (!acceptTerms) {
        setError('Please accept the Terms of Service and Privacy Policy');
        toast.error('Please accept the Terms of Service and Privacy Policy', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return false;
      }
    }
  
    return true;
  };
  
  // Handle continue button click
  const handleContinue = async () => {
    if (!validateStep()) return;

    if (step === 1) {
      const userName = contactMethod === 'email' ? formData.email : formData.mobile;
      setLoading(true);

      try {
        // Use GET request with query parameter
        const response = await apiClient.get(`/auth/isValidUser?userName=${encodeURIComponent(userName)}`);
        
        console.log('User validation API Response:', response.data);
        
        // Check response data value
        if (response.data === 1) {
          // User already exists
          setError('This email or mobile is already registered.');
          toast.error('This account already exists. Please try signing in instead.', {
            position: "top-right",
            autoClose: 4000,
            style: { background: "#EF4444", color: "#fff" }
          });
        } else if (response.data === 0) {
          // User does not exist, proceed to next step
          setStep(step + 1);
          setError(''); // Clear any previous errors
        } else {
          // Unexpected response, but proceed anyway
          console.log('Unexpected response, proceeding to next step');
          setStep(step + 1);
          setError('');
        }
        
      } catch (err) {
        console.log('User validation API Error:', err.response?.status, err.response?.data);
        
        // Handle different error scenarios
        if (err.response?.status === 400) {
          // 400 error - check the error message
          const errorMessage = err.response?.data?.message || err.response?.data || '';
          
          if (errorMessage.toLowerCase().includes('username is not present') || 
              errorMessage.toLowerCase().includes('not present') ||
              errorMessage.toLowerCase().includes('user not found') ||
              errorMessage.toLowerCase().includes('not found')) {
            // Username not present means user doesn't exist, proceed to next step
            console.log('Username not present, proceeding to next step');
            setStep(step + 1);
            setError('');
          } else {
            // Other 400 error
            setError(errorMessage || 'Error validating user');
            toast.error(errorMessage || 'Error checking user availability', {
              position: "top-right",
              autoClose: 4000,
              style: { background: "#EF4444", color: "#fff" }
            });
          }
        } else if (err.response?.status === 404) {
          // 404 means user not found, proceed to next step
          console.log('User not found (404), proceeding to next step');
          setStep(step + 1);
          setError('');
        } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          // Timeout error
          setError('Request timeout. Please try again.');
          toast.error('Request timeout. Please check your connection and try again.', {
            position: "top-right",
            autoClose: 4000,
            style: { background: "#EF4444", color: "#fff" }
          });
        } else if (err.code === 'ERR_NETWORK') {
          // Network error
          setError('Network error. Please check your connection.');
          toast.error('Network error. Please check your internet connection.', {
            position: "top-right",
            autoClose: 4000,
            style: { background: "#EF4444", color: "#fff" }
          });
        } else {
          // For any other error, assume user doesn't exist and proceed
          console.log('Unknown error, assuming user is new and proceeding');
          setStep(step + 1);
          setError('');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // For other steps, just proceed
      setStep(step + 1);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate final step
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      // Prepare the request payload according to API schema
      const requestPayload = {
        userName: contactMethod === 'email' ? formData.email : formData.mobile,
        fullName: formData.userName,
        password: formData.password,
        role: ["user"], // Array of strings as expected by API
        userId: 0, // Default value
        isActive: 0, // Default value
        createdAt: new Date().toISOString(), // Current timestamp
        referredBy: 0, // Default value
      };

      // Add email or mobile based on contact method
      if (contactMethod === 'email') {
        requestPayload.email = formData.email;
        // Don't include mobile field if registering with email
      } else {
        requestPayload.mobile = formData.mobile;
        // Don't include email field if registering with mobile
      }

      console.log('Sending signup request with payload:', requestPayload);

      const response = await apiClient.post('/auth/signup', requestPayload);
      
      // Successful signup
      if (response.status === 201 || response.status === 200) {
        if (contactMethod === 'email') {
          // For email signup - show verification message
          setStep(3); // Move to verification step
          toast.success('Account created successfully!', {
            position: "top-right",
            autoClose: 3000,
            style: {
              background: "#10B981",
              color: "#fff"
            }
          });
          
          // Show email verification toast after a delay
          setTimeout(() => {
            toast.info('📧 Please check your email and verify your account within 10 minutes to complete registration.', {
              position: "top-center",
              autoClose: 8000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: {
                background: "#3B82F6",
                color: "#fff",
                fontSize: "14px"
              }
            });
          }, 1000);
        } else {
          // For mobile signup - direct success and redirect
          toast.success('Account created successfully!', {
            position: "top-right",
            autoClose: 3000,
            style: {
              background: "#10B981",
              color: "#fff"
            }
          });
          
          // Redirect to login for mobile users
          setTimeout(() => {
            navigate('/signin');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Signup Error:', err);
      console.error('Error response data:', err.response?.data);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorData = err.response.data;
        let errorMessage = 'Signup failed. Please try again.';
        
        // Handle different error response formats
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorMessage = errorData.errors.join(', ');
        }
        
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: {
            background: "#EF4444",
            color: "#fff"
          }
        });
      } else if (err.request) {
        // The request was made but no response was received
        const errorMessage = 'No response from server. Check your network connection.';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: {
            background: "#EF4444",
            color: "#fff"
          }
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        const errorMessage = 'Error setting up the request';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: {
            background: "#EF4444",
            color: "#fff"
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signup
  const handleGoogleSignup = () => {
    toast.info('Google signup integration coming soon!', {
      position: "top-right",
      autoClose: 3000,
      style: { background: "#3B82F6", color: "#fff" }
    });
  };

  // Handle resend email
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      // Add your resend email API call here
      // await apiClient.post('/auth/resend-verification', { email: formData.email });
      
      toast.success('Verification email resent successfully!', {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#10B981", color: "#fff" }
      });
    } catch (err) {
      toast.error('Failed to resend email. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#EF4444", color: "#fff" }
      });
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
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5 
      }
    }
  };

  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    hover: {
      y: [-10, 0, -10],
      transition: {
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.2,
        duration: 0.5 
      }
    },
    hover: { 
      scale: 1.05,
      backgroundColor: "#4338CA",
      boxShadow: "0px 5px 15px rgba(79, 70, 229, 0.4)",
      transition: { 
        duration: 0.3 
      }
    },
    tap: { 
      scale: 0.95 
    }
  };

  const featureItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: (i) => ({ 
      x: 0, 
      opacity: 1,
      transition: { 
        delay: i * 0.2,
        duration: 0.5 
      }
    })
  };

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      
      <ToastContainer />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* Left Side - Welcome Image and Text */}
        <motion.div 
          variants={containerVariants}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-12 relative overflow-hidden"
        >
          <div className="text-center">
            <motion.h2 
              variants={itemVariants}
              className="text-4xl font-bold text-gray-800 mb-4"
            >
              Welcome to myBOQ
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Join us and Prepare accurate estimates, tenders, and bills faster—without missing any compliance details.
            </motion.p>
            
            <motion.img 
              variants={imageVariants}
              whileHover="hover"
              src="/register.svg" 
              alt="Register Illustration"
              className="w-full max-w-md mx-auto mb-6"
            />
            
            <motion.div 
              variants={containerVariants}
              className="mt-6 space-y-2"
            >
              {[
                "Fast & Accurate Estimations",
                "Subscription = Flexibility + Savings",
                "SSR & Non-SSR Item Support",
                "Auto Rate Analysis",
                "Duplicate Revision & Estimates",
                "Export to PDF"
              ].map((text, index) => (
                <motion.div 
                  key={index}
                  custom={index}
                  variants={featureItemVariants}
                  className="flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div 
          variants={containerVariants}
          className="flex items-center justify-center p-12"
        >
          <div className="w-full max-w-md">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-semibold text-gray-800 text-center mb-6"
            >
              {step === 0 && 'Create Your Account'}
              {step === 1 && 'Enter Your Details'}
              {step === 2 && 'Complete Registration'}
              {step === 3 && 'Verify Your Email'}
            </motion.h2>
            
            <AnimatePresence mode="wait">
              {/* Step 0: Initial Options */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideVariants}
                  className="space-y-6"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleContactMethod('email')}
                    className="w-full bg-indigo-400 text-white py-3 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                  >
                    Continue with Email
                  </motion.button>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleContactMethod('mobile')}
                    className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                  >
                    Continue with Mobile
                  </motion.button>
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <div className="text-gray-500 text-sm">OR</div>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:shadow-md space-x-2"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
                      <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
                      <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3037 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
                      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
                    </svg>
                    <span>Continue with Google</span>
                  </motion.button>
               
                  <motion.div 
                    variants={itemVariants}
                    className="text-center mt-4"
                  >
                    <p className="text-gray-600">
                      Already have an account?{' '}
                      <motion.button 
                        whileHover={{ scale: 1.05, color: "#4F46E5" }}
                        type="button"
                        onClick={() => navigate('/signin')}
                        className="text-blue-600 hover:text-blue-500 font-semibold transition"
                      >
                        Sign In
                      </motion.button>
                    </p>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Step 1: Username and Email/Mobile Input */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideVariants}
                  className="space-y-6"
                >
                  <motion.div 
                    variants={itemVariants}
                  >
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02, borderColor: "#6366F1" }}
                      transition={{ duration: 0.2 }}
                      id="userName"
                      name="userName"
                      type="text"
                      value={formData.userName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
                      placeholder="Enter your full name"
                      required
                    />
                  </motion.div>
                  
                  {contactMethod === 'email' ? (
                    <motion.div 
                      variants={itemVariants}
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#6366F1" }}
                        transition={{ duration: 0.2 }}
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
                        placeholder="Enter your email address"
                        required
                      />
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={itemVariants}
                    >
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#6366F1" }}
                        transition={{ duration: 0.2 }}
                        id="mobile"
                        name="mobile"
                        type="tel"
                        pattern="[0-9]{10}"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
                        placeholder="Enter 10-digit mobile number"
                        required
                      />
                    </motion.div>
                  )}
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300,
                        damping: 20 
                      }}
                      className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="space-y-3">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={handleContinue}
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          /><span>Checking...</span>
                        </div>
                      ) : (
                        'Continue'
                      )}
                    </motion.button>
                    
                    <motion.button
                      variants={buttonVariants}
                      whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                      whileTap="tap"
                      type="button"
                      onClick={() => setStep(0)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    >
                      Back
                    </motion.button>
                  </div>
                </motion.form>
              )}
              
              {/* Step 2: Password Setup */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideVariants}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <motion.div 
                    variants={itemVariants}
                  >
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#6366F1" }}
                        transition={{ duration: 0.2 }}
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
                        placeholder="Create a strong password"
                        required
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800 transition"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 text-xs text-gray-500"
                    >
                      Password must contain at least 8 characters, including letters, numbers, and special characters
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                  >
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <motion.input
                        whileFocus={{ scale: 1.02, borderColor: "#6366F1" }}
                        transition={{ duration: 0.2 }}
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
                        placeholder="Confirm your password"
                        required
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800 transition"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-start space-x-3"
                  >
                    <motion.input
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition"
                      required
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <motion.a 
                        whileHover={{ color: "#4F46E5", textDecoration: "underline" }}
                        href="/termsandconditions" 
                        className="text-indigo-600 hover:text-indigo-500 transition"
                      >
                        Terms of Service
                      </motion.a>{' '}
                      and{' '}
                      <motion.a 
                        whileHover={{ color: "#4F46E5", textDecoration: "underline" }}
                        href="/policy" 
                        className="text-indigo-600 hover:text-indigo-500 transition"
                      >
                        Privacy Policy
                      </motion.a>
                    </label>
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300,
                        damping: 20 
                      }}
                      className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="space-y-3">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-70"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                    
                    <motion.button
                      variants={buttonVariants}
                      whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                      whileTap="tap"
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    >
                      Back
                    </motion.button>
                  </div>
                </motion.form>
              )}
              
              {/* Step 3: Email Verification */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={slideVariants}
                  className="text-center space-y-6"
                >
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        delay: 0.2 
                      }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                    >
                      <motion.svg 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="w-10 h-10 text-green-600" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <motion.path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                      Check Your Email
                    </h3>
                    <p className="text-gray-600 mb-2">
                      We've sent a verification link to:
                    </p>
                    <p className="text-indigo-600 font-semibold">
                      {formData.email}
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Important:</p>
                        <p>Please verify your email within 10 minutes to complete your registration. Don't forget to check your spam folder!</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="space-y-3"
                  >
                    <motion.button
                      variants={buttonVariants}
                      whileHover={{ scale: 1.02, color: "#4F46E5" }}
                      whileTap="tap"
                      type="button"
                      onClick={() => navigate('/signin')}
                      className="w-full text-indigo-600 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                      Go to Sign In
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
        
          </div>
        </motion.div>
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

export default SignupPage;