import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

// Create a custom axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://24.101.103.87:8082/api', // Base URL for all requests
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    // You can add any default headers here
  },
  withCredentials: false // Disable credentials if not needed
});

const SignupPage = () => {
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  
  // Track registration step
  const [step, setStep] = useState(0); // 0: initial, 1: contact info, 2: password
  const [contactMethod, setContactMethod] = useState('mobile'); // 'email' or 'mobile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    }
  
    return true;
  };
  
  // Handle continue button click
  const handleContinue = async () => {
    if (!validateStep()) return;
  
    if (step === 1) {
      const userName = contactMethod === 'email' ? formData.email : formData.mobile;
  
      try {
        const response = await apiClient.post('/auth/isValidUser', { userName });
  
        if (response.status === 200 && response.data === true) {
          // 200 OK - user already exists
          setError('This email or mobile is already registered.');
          toast.error('This account already exists.', {
            position: "top-right",
            autoClose: 3000,
            style: { background: "#EF4444", color: "#fff" }
          });
          return;
        }
      } catch (err) {
        if (err.response?.status === 400) {
          // 400 Bad Request - user does not exist, proceed to next step
          setStep(step + 1);
          return;
        }
  
        // General error
        const errMsg = err.response?.data?.message || 'Error checking user';
        setError(errMsg);
        toast.error(errMsg, {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#EF4444", color: "#fff" }
        });
        return;
      }
    } else {
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
      const response = await apiClient.post('/auth/signup', {
        userName: contactMethod === 'email' ? formData.email : formData.mobile,
        fullName: formData.userName,
        email: contactMethod === 'email' ? formData.email : null,
        mobile: contactMethod === 'mobile' ? formData.mobile : null,
        password: formData.password,
        referredBy: 0,
        referralCode: null,
        role: ['user'],
        isActive: 0,
      });
      
      // Successful signup
      if (response.status === 201) {
        toast.success('Account created successfully!', {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: "#10B981",
            color: "#fff"
          }
        });
        
        // Redirect to login or dashboard
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup Error:', err);
      
      // More detailed error handling
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(err.response.data.message || 'Signup failed. Please try again.');
        toast.error(err.response.data.message || 'Signup failed', {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: "#EF4444",
            color: "#fff"
          }
        });
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Check your network connection.');
        toast.error('No response from server. Check your network connection.', {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: "#EF4444",
            color: "#fff"
          }
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error setting up the request');
        toast.error('Error setting up the request', {
          position: "top-right",
          autoClose: 3000,
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
              Welcome to SSR
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Join us and explore a world of innovation and possibilities
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
                "Easy integration with your workflow",
                "Seamless collaboration tools",
                "Secure and reliable platform"
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
                    onClick={() => {}}
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
                      placeholder="Enter your username"
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
                        placeholder="Enter your email "
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
                        placeholder="Enter 10-digit mobile number "
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
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
                    >
                      Continue
                    </motion.button>
                    
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => setStep(0)}
                      className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none"
                    >
                      Back
                    </motion.button>
                  </div>
                </motion.form>
              )}
              
              {/* Step 2: Complete Registration */}
              {step === 2 && (
  <motion.form
    key="step2"
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={slideVariants}
    className="space-y-6"
    onSubmit={handleSubmit}
  >
    {/* Password Field */}
    <motion.div variants={itemVariants}>

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
      required
      pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
      title="Must contain at least 8 characters with letters and numbers"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
      placeholder="At least 8 chars, with letters & numbers"
    />
    <button 
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.543-7z" />
        </svg>
      )}
    </button>
  </div>
</motion.div>

{/* Confirm Password Field */}
<motion.div variants={itemVariants}>
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
      required
      minLength="8"
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:shadow-md"
      placeholder="Confirm your password"
    />
    <button 
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center"
    >
      {showConfirmPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.543-7z" />
        </svg>
      )}
    </button>
  </div>

  {/* Password Match Feedback */}
  {formData.confirmPassword && formData.password && (
    formData.password === formData.confirmPassword ? (
      <p className="text-sm text-green-600 mt-1">Passwords match ✅</p>
    ) : (
      <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
    )
  )}
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
    className="w-full bg-indigo-600 text-white py-3 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
    animate={loading ? { scale: [1, 1.02, 1], opacity: [1, 0.8, 1] } : {}}
    transition={loading ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}}
  >
    {loading ? (
      <motion.div 
        className="flex justify-center items-center space-x-2"
      >
        <motion.span 
          className="w-3 h-3 bg-white rounded-full"
          animate={{ y: [-5, 0, -5] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span 
          className="w-3 h-3 bg-white rounded-full"
          animate={{ y: [-5, 0, -5] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.span 
          className="w-3 h-3 bg-white rounded-full"
          animate={{ y: [-5, 0, -5] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <span className="ml-2">Creating Account...</span>
      </motion.div>
    ) : (
      'Create Account'
    )}
  </motion.button>


                    
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none"
                    >
                      Back
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;






// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { motion, AnimatePresence } from 'framer-motion';

// // Create a custom axios instance with base configuration
// const api = axios.create({
//   baseURL: 'http://24.101.103.87:8082/api',
//   headers: {
//     'Content-Type': 'application/json',
//   }
// });

// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     contactValue: '',
//     password: '',
//     confirmPassword: ''
//   });
  
//   // Track registration step
//   const [step, setStep] = useState(0); // 0: initial, 1: contact info, 2: password
//   const [contactMethod, setContactMethod] = useState('mobile'); // 'email' or 'mobile'
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const navigate = useNavigate();

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     // Clear any previous errors when user starts typing
//     setError('');
//   };

//   // Handle contact method selection
//   const handleContactMethod = (method) => {
//     setContactMethod(method);
//     setStep(1);
//   };

//   // Validate current step
//   const validateStep = () => {
//     if (step === 1) {
//       // Validate full name
//       if (!formData.fullName.trim()) {
//         setError('Full Name is required');
//         toast.error('Please enter your full name', {
//           position: "top-right",
//           autoClose: 3000,
//           style: {
//             background: "#EF4444",
//             color: "#fff"
//           }
//         });
//         return false;
//       }

//       // Validate contact value based on method
//       if (!formData.contactValue.trim()) {
//         const errorMessage = contactMethod === 'email' 
//           ? 'Email is required' 
//           : 'Mobile number is required';
        
//         setError(errorMessage);
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 3000,
//           style: {
//             background: "#EF4444",
//             color: "#fff"
//           }
//         });
//         return false;
//       }

//       // Validate email or mobile based on contact method
//       if (contactMethod === 'email') {
//         if (!/\S+@\S+\.\S+/.test(formData.contactValue)) {
//           setError('Please enter a valid email address');
//           toast.error('Invalid email address', {
//             position: "top-right",
//             autoClose: 3000,
//             style: {
//               background: "#EF4444",
//               color: "#fff"
//             }
//           });
//           return false;
//         }
//       } else {
//         // Mobile validation (10 digit number)
//         if (!/^\d{10}$/.test(formData.contactValue)) {
//           setError('Please enter a valid 10-digit mobile number');
//           toast.error('Invalid mobile number', {
//             position: "top-right",
//             autoClose: 3000,
//             style: {
//               background: "#EF4444",
//               color: "#fff"
//             }
//           });
//           return false;
//         }
//       }
//     } else if (step === 2) {
//       // Password validation
//       const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//       if (!passwordPattern.test(formData.password)) {
//         setError('Password must be at least 8 characters long and contain letters, numbers, and special characters');
//         toast.error('Weak password: Must contain letters, numbers & special characters', {
//           position: "top-right",
//           autoClose: 3000,
//           style: {
//             background: "#EF4444",
//             color: "#fff"
//           }
//         });
//         return false;
//       }
      
//       if (formData.password !== formData.confirmPassword) {
//         setError('Passwords do not match');
//         toast.error('Passwords do not match', {
//           position: "top-right",
//           autoClose: 3000,
//           style: {
//             background: "#EF4444",
//             color: "#fff"
//           }
//         });
//         return false;
//       }
//     }
//     return true;
//   };
  
//   // Handle continue button click
//   const handleContinue = async () => {
//     if (!validateStep()) return;
  
//     if (step === 1) {
//       try {
//         // Use axios for the validation request with proper configuration
//         const response = await api.get('/auth/isValidUser', {
//           params: { 
//             userName: formData.contactValue 
//           }
//         });
  
//         // If user doesn't exist or validation succeeds, move to next step
//         setError('');
//         setStep(step + 1);
  
//       } catch (err) {
//         console.error("Validation error:", err.response || err);
        
//         // More detailed error handling
//         if (err.response && err.response.status === 400) {
//           // Specific handling for 400 Bad Request - treat as non-blocking
//           // This allows user to continue to the next step
//           setError('');
//           setStep(step + 1);
//         } else if (err.response) {
//           // Other server response errors
//           const errorMessage = err.response.data?.message || 'Validation failed';
//           setError(errorMessage);
//           toast.error(errorMessage, {
//             position: "top-right",
//             autoClose: 3000,
//             style: {
//               background: "#EF4444",
//               color: "#fff"
//             }
//           });
//         } else if (err.request) {
//           // No response from server
//           setError('No response from server');
//           toast.error('No response from server', {
//             position: "top-right",
//             autoClose: 3000,
//             style: {
//               background: "#EF4444",
//               color: "#fff"
//             }
//           });
//         } else {
//           // Error setting up request
//           setError('Error setting up validation request');
//           toast.error('Error setting up validation request', {
//             position: "top-right",
//             autoClose: 3000,
//             style: {
//               background: "#EF4444",
//               color: "#fff"
//             }
//           });
//         }
//       }
//     }
//   };
  
//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validate final step
//     if (!validateStep()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const response = await api.post('/auth/signup', {
//         userName: formData.contactValue, // Use contact value as userName
//         fullName: formData.fullName, // Directly use full name
//         email: contactMethod === 'email' ? formData.contactValue : null,
//         mobile: contactMethod === 'mobile' ? formData.contactValue : null,
//         password: formData.password,
//         referredBy: 0,
//         referralCode: null,
//         role: ['user'],
//         isActive: 0,
//       });
      
//       // Successful signup
//       if (response.status === 201) {
//         toast.success('Account created successfully!', {
//           position: "top-right",
//           autoClose: 3000,
//           style: {
//             background: "#10B981",
//             color: "#fff"
//           }
//         });
        
//         // Redirect to login or dashboard
//         setTimeout(() => {
//           navigate('/signin');
//         }, 2000);
//       }
//     } catch (err) {
//       console.error('Signup Error:', err);
      
//       // More comprehensive error handling
//       let errorMessage = 'Signup failed. Please try again.';
      
//       if (err.response) {
//         // The request was made and the server responded with a status code
//         // that falls out of the range of 2xx
//         switch (err.response.status) {
//           case 500:
//             errorMessage = 'Server error. Please try again later.';
//             break;
//           case 400:
//             errorMessage = err.response.data?.message || 'Invalid signup information.';
//             break;
//           case 409:
//             errorMessage = 'User already exists.';
//             break;
//           default:
//             errorMessage = err.response.data?.message || 'Signup failed. Please try again.';
//         }
//       } else if (err.request) {
//         // The request was made but no response was received
//         errorMessage = 'No response from server. Please check your connection.';
//       }
      
//       // Set and display error
//       setError(errorMessage);
      
//       toast.error(errorMessage, {
//         position: "top-right",
//         autoClose: 3000,
//         style: {
//           background: "#EF4444",
//           color: "#fff"
//         }
//       });

//       // Optional: Log detailed error for debugging
//       console.error('Detailed Signup Error:', {
//         status: err.response?.status,
//         data: err.response?.data,
//         message: errorMessage
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="signup-container">
//       {/* Multistep signup form */}
//       {step === 0 && (
//         <div className="contact-method-selection">
//           <h2>Choose Signup Method</h2>
//           <button onClick={() => handleContactMethod('mobile')}>
//             Signup with Mobile
//           </button>
//           <button onClick={() => handleContactMethod('email')}>
//             Signup with Email
//           </button>
//         </div>
//       )}

//       {step === 1 && (
//         <div className="contact-info-step">
//           <h2>
//             {contactMethod === 'mobile' 
//               ? 'Enter Mobile Number' 
//               : 'Enter Email Address'}
//           </h2>
//           <input
//             type="text"
//             name="fullName"
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChange={handleChange}
//           />
//           <input
//             type={contactMethod === 'mobile' ? 'tel' : 'email'}
//             name="contactValue"
//             placeholder={contactMethod === 'mobile' ? 'Mobile Number' : 'Email Address'}
//             value={formData.contactValue}
//             onChange={handleChange}
//           />
//           <button onClick={handleContinue}>Continue</button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="password-step">
//           <h2>Create Password</h2>
//           <input
//             type={showPassword ? 'text' : 'password'}
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//           />
//           <button 
//             type="button" 
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? 'Hide' : 'Show'}
//           </button>
          
//           <input
//             type={showConfirmPassword ? 'text' : 'password'}
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//           />
//           <button 
//             type="button" 
//             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             {showConfirmPassword ? 'Hide' : 'Show'}
//           </button>
          
//           <button onClick={handleSubmit} disabled={loading}>
//             {loading ? 'Creating Account...' : 'Create Account'}
//           </button>
//         </div>
//       )}

//       {/* Error display */}
//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       <ToastContainer />
//     </div>
//   );
// };

// export default SignupPage;