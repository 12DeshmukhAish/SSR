import React, { useState, useEffect } from 'react';
import { Mail, User, ArrowRight, ArrowLeft, Key, Lock } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [animateIn, setAnimateIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Initial animation on load
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // Handle form submission for requesting password reset
  const handleRequestReset = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setAnimateIn(false);
      
      // After animation out, move to next step
      setTimeout(() => {
        setStep(2);
        setAnimateIn(true);
      }, 500);
    }, 1500);
  };

  // Handle form submission for verification code and new password
  const handleSetNewPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Password validation
    if (password !== confirmPassword) {
      setLoading(false);
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setLoading(false);
      setError('Password must be at least 8 characters long');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirect to login page after showing success message
      setTimeout(() => {
        window.location.href = '/signin'; 
      }, 2000);
    }, 1500);
  };

  // Go back to first step
  const handleBack = () => {
    setAnimateIn(false);
    setError('');
    
    setTimeout(() => {
      setStep(1);
      setAnimateIn(true);
    }, 500);
  };

  // Navigate to login page
  const goToLogin = () => {
    window.location.href = '/signin'; // Replace with your login route
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-5xl flex overflow-hidden rounded-xl shadow-2xl bg-white">
        {/* Left side - Image with text overlay */}
        <div className="hidden md:block md:w-1/2 bg-blue-600 relative overflow-hidden">
          <div className={`absolute inset-0 transition-all duration-1000 transform ${animateIn ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
            <img 
              src="/forgot.png" 
              alt="Password reset" 
              className="object-cover w-full h-full mix-blend-overlay opacity-25"
            />
          </div>
          <div className={`absolute inset-0 flex flex-col justify-center p-12 text-white transition-all duration-1000 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-md z-10">
              <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Reset Your Password</h2>
              <p className="text-lg mb-8 drop-shadow-sm">
                Don't worry, we'll help you recover access to your account in just a few steps.
              </p>
              <div className="h-1 w-20 bg-white opacity-80 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-10">
          <div className="w-full max-w-md mx-auto">
            {/* Logo or brand */}
            <div className={`text-center mb-8 transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Lock size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Account Recovery</h1>
            </div>

            {step === 1 && (
              <div className={`transition-all duration-500 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-6">Forgot Password</h2>
                  <form onSubmit={handleRequestReset}>
                    <div className="space-y-5">
                      <div className="relative">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <div className="relative rounded-md">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder="Enter your username"
                            required
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative rounded-md">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                          </div>
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {loading ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            Continue
                            <ArrowRight size={18} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={`text-center transition-all duration-700 delay-300 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300"
                    onClick={goToLogin}
                  >
                    Return to Login
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={`transition-all duration-500 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Set New Password</h2>
                  <p className="text-gray-500 mb-6">Please enter your verification code and create a new password.</p>
                  
                  {success ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700 mb-6 animate-pulse">
                      Password reset successful! Redirecting to login page...
                    </div>
                  ) : (
                    <form onSubmit={handleSetNewPassword}>
                      {error && (
                        <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                          <div className="relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Key size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="code"
                              type="text"
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                              placeholder="Enter the 6-digit code"
                              required
                            />
                          </div>
                        </div>

                        <div className="relative">
                          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                          <div className="relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                              placeholder="Create a new password"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>

                        <div className="relative">
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                          <div className="relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                              placeholder="Confirm your new password"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          {loading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              Reset Password
                              <ArrowRight size={18} className="ml-2" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className={`text-center transition-all duration-700 delay-300 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                  <button
                    type="button"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-300"
                    onClick={handleBack}
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;