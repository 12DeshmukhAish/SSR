// import React, { useState } from 'react';

// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { motion, AnimatePresence } from 'framer-motion';
// import TermsAndConditions from './TermandCondition';
// import PrivacyPolicy from './Privacy';
// import { API_BASE_URL} from '../config';
// import SSLCertificateInstallation from './SSL_Certificate';
// // Create a custom axios instance with base configuration
// const apiClient = axios.create({
//   baseURL: API_BASE_URL, // Base URL for all requests
//   timeout: 30000, // 10 seconds timeout
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: false // Disable credentials if not needed
// });

// const currentYear = new Date().getFullYear();

// // Modal Component for Terms and Privacy Policy
// const PolicyModal = ({ isOpen, onClose, type }) => {
//   if (!isOpen) return null;

//   const termsContent = (
//     <div className="space-y-4">
//       <h3 className="text-xl font-semibold text-gray-800">Terms of Service</h3>
//       <div className="text-sm text-gray-600 space-y-3 max-h-96 overflow-y-auto">
//         <p><strong>1. Acceptance of Terms</strong></p>
//         <p>By accessing and using myBOQ services, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
//         <p><strong>2. Service Description</strong></p>
//         <p>myBOQ provides construction estimation and billing services including BOQ preparation, rate analysis, and project management tools.</p>
        
//         <p><strong>3. User Responsibilities</strong></p>
//         <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
        
//         <p><strong>4. Payment Terms</strong></p>
//         <p>Subscription fees are charged based on the selected plan. All payments are processed securely through our payment partners.</p>
        
//         <p><strong>5. Data Usage</strong></p>
//         <p>We collect and use your data as described in our Privacy Policy to provide and improve our services.</p>
        
//         <p><strong>6. Service Availability</strong></p>
//         <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service availability.</p>
        
//         <p><strong>7. Termination</strong></p>
//         <p>Either party may terminate this agreement at any time with appropriate notice as specified in your subscription terms.</p>
        
//         <p><strong>8. Limitation of Liability</strong></p>
//         <p>myBOQ shall not be liable for any indirect, incidental, special, or consequential damages.</p>
//       </div>
//     </div>
//   );

 
//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           transition={{ type: "spring", damping: 25, stiffness: 300 }}
//           className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="p-6">
//             {type === 'terms' }
//             <div className="mt-6 flex justify-end">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={onClose}
//                 className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
//               >
//                 Close
//               </motion.button>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// const SignupPage = () => {
//   const [formData, setFormData] = useState({
//     userName: '',
//     email: '',
//     mobile: '',
//     password: '',
//     confirmPassword: ''
//   });
  
//    // Track registration step
//   const [step, setStep] = useState(0); // 0: initial, 1: contact info, 2: password, 3: verification sent
//   const [contactMethod, setContactMethod] = useState('mobile'); // 'email' or 'mobile'
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({}); // Changed to object for multiple field errors
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [acceptTerms, setAcceptTerms] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [otp, setOtp] = useState(['', '', '', '', '', '']); // For 6-digit OTP
//   const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
//   const [canResendOtp, setCanResendOtp] = useState(false);
//   const [showSSLModal, setShowSSLModal] = useState(false);
// const [sslError, setSSLError] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [modalContent, setModalContent] = useState(null);
//   const [modalType, setModalType] = useState('');
//   const [userValidationBypass, setUserValidationBypass] = useState(false); // Track if we bypassed validation
//   const navigate = useNavigate();


//   // Handle input changes with immediate validation
//     const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear specific field error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };
//  useEffect(() => {
//     let interval = null;
//     if (step === 3 && otpTimer > 0) {
//       interval = setInterval(() => {
//         setOtpTimer(timer => {
//           if (timer <= 1) {
//             setCanResendOtp(true);
//             return 0;
//           }
//           return timer - 1;
//         });
//       }, 1000);
//     } else if (otpTimer === 0) {
//       setCanResendOtp(true);
//     }
//     return () => clearInterval(interval);
//   }, [step, otpTimer]);
//   // Handle field blur for immediate validation
//  const handleBlur = (e) => {
//     const { name, value } = e.target;
//     validateField(name, value);
//   };

//   // Validate individual field
//   const validateField = (fieldName, value) => {
//     let fieldError = '';

//     switch (fieldName) {
//       case 'userName':
//         if (!value.trim()) {
//           fieldError = 'Full Name is required';
//         }
//         break;
      
//       case 'email':
//         if (contactMethod === 'email') {
//           if (!value.trim()) {
//             fieldError = 'Email is required';
//           } else {
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(value)) {
//               fieldError = 'Invalid email format';
//             }
//           }
//         }
//         break;
      
//       case 'mobile':
//         if (contactMethod === 'mobile') {
//           if (!value.trim()) {
//             fieldError = 'Mobile number is required';
//           } else {
//             const phoneRegex = /^\d{10}$/;
//             if (!phoneRegex.test(value)) {
//               fieldError = 'Please enter a valid 10-digit mobile number';
//             }
//           }
//         }
//         break;
      
//       case 'password':
//         const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
//         if (!passwordPattern.test(value)) {
//           fieldError = 'Password must be at least 8 characters and include letters, numbers, and a special character';
//         }
//         break;
      
//       case 'confirmPassword':
//         if (value !== formData.password) {
//           fieldError = 'Passwords do not match';
//         }
//         break;
//     }

//     setErrors(prev => ({
//       ...prev,
//       [fieldName]: fieldError
//     }));

//     return fieldError === '';
//   };
// const isSSLError = (error) => {
//   return (
//     error.code === 'CERT_AUTHORITY_INVALID' || 
//     error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
//     error.code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
//     error.message?.includes('certificate') ||
//     error.message?.includes('SSL') ||
//     error.message?.includes('TLS') ||
//     error.message?.includes('CERT_') ||
//     (error.request && !error.response)
//   );
// };
// const handleSSLError = (context = 'operation') => {
//   setSSLError(true);
//   setShowSSLModal(true);
//   setErrors(prev => ({
//     ...prev,
//     ssl: 'SSL Certificate required for secure connection'
//   }));
  
//   toast.error(`SSL Certificate installation required for ${context}`, {
//     position: "top-right",
//     autoClose: 5000,
//     style: { background: "#EF4444", color: "#fff" }
//   });
// };
//     // Handle contact method selection
//     const handleContactMethod = (method) => {
//     setContactMethod(method);
//     setStep(1);
//     setErrors({}); // Clear all errors when changing method
//     setUserValidationBypass(false); // Reset bypass flag
//   };


  
  
//     // Validate current step
//   const validateStep = () => {
//     let isValid = true;
//     const newErrors = {};

//     if (step === 1) {
//       if (!formData.userName.trim()) {
//         newErrors.userName = 'Full Name is required';
//         isValid = false;
//       }

//       if (contactMethod === 'email') {
//         if (!formData.email.trim()) {
//           newErrors.email = 'Email is required';
//           isValid = false;
//         } else {
//           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//           if (!emailRegex.test(formData.email)) {
//             newErrors.email = 'Invalid email format';
//             isValid = false;
//           }
//         }
//       }

//        if (contactMethod === 'mobile') {
//         if (!formData.mobile.trim()) {
//           newErrors.mobile = 'Mobile number is required';
//           isValid = false;
//         } else {
//           const phoneRegex = /^\d{10}$/;
//           if (!phoneRegex.test(formData.mobile)) {
//             newErrors.mobile = 'Please enter a valid 10-digit mobile number';
//             isValid = false;
//           }
//         }
//       }
//     } else if (step === 2) {
//       const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
//       if (!passwordPattern.test(formData.password)) {
//         newErrors.password = 'Password must be at least 8 characters and include letters, numbers, and a special character';
//         isValid = false;
//       }
//       if (formData.password !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match';
//         isValid = false;
//       }
//       if (!acceptTerms) {
//         newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
//         isValid = false;
//       }
//     }

//     setErrors(newErrors);

//     // Show toast for first error found
//        if (!isValid) {
//       const firstError = Object.values(newErrors)[0];
//       toast.error(firstError, {
//         position: "top-right",
//         autoClose: 3000,
//         style: { background: "#EF4444", color: "#fff" }
//       });
//     }

//     return isValid;
//   };

// // Handle continue button click
// const handleContinue = async () => {
//   if (!validateStep()) return;

//   if (step === 1) {
//     const userName = contactMethod === 'email' ? formData.email : formData.mobile;
//     setLoading(true);

//     try {
//       // Use GET request with query parameter
//       const response = await apiClient.get(`/api/auth/isValidUser?userName=${encodeURIComponent(userName)}`);
      
//       console.log('User validation API Response:', response.data);
      
//       // Check response data value - handle both number and object responses
//       if (response.data === 1 || 
//           (response.data?.message && response.data.message.toLowerCase().includes('already registered'))) {
//         // User already exists - this is a definitive block
//         const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
//         const errorMsg = `This ${contactType} is already registered.`;
        
//         setErrors({ [contactMethod]: errorMsg });
        
//         // Show toast with redirect option
//         toast.error(
//           `This ${contactType} is already registered. Redirecting to sign-in page...`, 
//           {
//             position: "top-right",
//             autoClose: 3000,
//             style: { background: "#EF4444", color: "#fff" }
//           }
//         );
        
//         // Redirect to sign-in page after 3 seconds
//         setTimeout(() => {
//           navigate('/signin', { 
//             state: { 
//               prefillData: {
//                 userName: userName,
//                 contactMethod: contactMethod
//               }
//             }
//           });
//         }, 3000);
        
//         setUserValidationBypass(false);
//         return; // Exit early to prevent further processing
        
//       } else if (response.data === 0 || 
//                  (response.data?.message && response.data.message.toLowerCase().includes('user not found'))) {
//         // User does not exist, proceed to next step
//         setStep(step + 1);
//         setErrors({});
//         setUserValidationBypass(false);
//       } else {
//         // Unexpected response - don't proceed, show error
//         console.log('Unexpected response:', response.data);
//         const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
//         setErrors({ [contactMethod]: `Unable to verify ${contactType}. Please try again.` });
        
//         toast.error(`Unable to verify ${contactType}. Please try again.`, {
//           position: "top-right",
//           autoClose: 4000,
//           style: { background: "#EF4444", color: "#fff" }
//         });
        
//         setUserValidationBypass(false);
//         return; // Don't proceed to next step
//       }
      
//     } catch (err) {
//       console.log('User validation API Error:', err.response?.status, err.response?.data);
//         // Check for SSL certificate errors FIRST
//       if (isSSLError(err)) {
//         handleSSLError('user validation');
//         setLoading(false);
//         return;
//       }
      
//       // Handle different error scenarios more conservatively
//       if (err.response?.status === 400) {
//         const errorMessage = err.response?.data?.message || err.response?.data || '';
        
//         // Check if error message indicates user already exists
//         if (errorMessage.toLowerCase().includes('already exists') || 
//             errorMessage.toLowerCase().includes('already registered') ||
//             errorMessage.toLowerCase().includes('user exists')) {
          
//           const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
//           setErrors({ [contactMethod]: `This ${contactType} is already registered.` });
          
//           toast.error(
//             `This ${contactType} is already registered. Redirecting to sign-in page...`, 
//             {
//               position: "top-right",
//               autoClose: 3000,
//               style: { background: "#EF4444", color: "#fff" }
//             }
//           );
          
//           // Redirect to sign-in page after 3 seconds
//           setTimeout(() => {
//             navigate('/signin', { 
//               state: { 
//                 prefillData: {
//                   userName: userName,
//                   contactMethod: contactMethod
//                 }
//               }
//             });
//           }, 3000);
          
//           setUserValidationBypass(false);
//           return; // Exit early
//         }
        
//         if (errorMessage.toLowerCase().includes('username is not present') || 
//             errorMessage.toLowerCase().includes('not present') ||
//             errorMessage.toLowerCase().includes('user not found') ||
//             errorMessage.toLowerCase().includes('not found')) {
//           // Username not present means user doesn't exist
//           console.log('Username not present, proceeding to next step');
//           setStep(step + 1);
//           setErrors({});
//           setUserValidationBypass(false);
//         } else {
//           // Other 400 error - show error but allow bypass after delay
//           setErrors({ [contactMethod]: errorMessage || 'Error validating user' });
//           toast.error(errorMessage || 'Error checking user availability. You can still proceed.', {
//             position: "top-right",
//             autoClose: 4000,
//             style: { background: "#EF4444", color: "#fff" }
//           });
//           // Allow bypass after showing error
//           setTimeout(() => {
//             if (errors[contactMethod]) {
//               setStep(step + 1);
//               setErrors({});
//               setUserValidationBypass(true);
//             }
//           }, 3000);
//         }
//       } else if (err.response?.status === 404) {
//         // 404 means user not found
//         console.log('User not found (404), proceeding to next step');
//         setStep(step + 1);
//         setErrors({});
//         setUserValidationBypass(false);
//       } else if (err.response?.status === 409) {
//         // 409 typically means conflict/user already exists
//         const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
//         setErrors({ [contactMethod]: `This ${contactType} is already registered.` });
        
//         toast.error(
//           `This ${contactType} is already registered. Redirecting to sign-in page...`, 
//           {
//             position: "top-right",
//             autoClose: 3000,
//             style: { background: "#EF4444", color: "#fff" }
//           }
//         );
        
//         // Redirect to sign-in page after 3 seconds
//         setTimeout(() => {
//           navigate('/signin', { 
//             state: { 
//               prefillData: {
//                 userName: userName,
//                 contactMethod: contactMethod
//               }
//             }
//           });
//         }, 3000);
        
//         setUserValidationBypass(false);
//         return; // Exit early
//       } else {
//         // For network errors or other issues, allow to proceed after showing warning
//         const errorType = err.code === 'ECONNABORTED' || err.message.includes('timeout') ? 'timeout' : 'network';
//         const errorMsg = errorType === 'timeout' ? 
//           'Request timeout. Please check your connection.' : 
//           'Network error. Please check your connection.';
        
//         toast.warning(`${errorMsg} Proceeding with signup...`, {
//           position: "top-right",
//           autoClose: 4000,
//           style: { background: "#F59E0B", color: "#fff" }
//         });
        
//         // Proceed after brief delay
//         setTimeout(() => {
//           setStep(step + 1);
//           setErrors({});
//           setUserValidationBypass(true);
//         }, 2000);
//       }
//     } finally {
//       setLoading(false);
//     }
//   } else {
//     // For other steps, just proceed
//     setStep(step + 1);
//   }
// };
  
  
  
//    const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate final step
//     if (!validateStep()) return;
    
//     setLoading(true);
//     setErrors({});
    
//     try {
//       const requestPayload = {
//         userName: contactMethod === 'email' ? formData.email : formData.mobile,
//         fullName: formData.userName,
//         password: formData.password,
//         role: ["user"]
//       };
      
//       // Add email or mobile based on contact method
//       if (contactMethod === 'email') {
//         requestPayload.email = formData.email;
//         requestPayload.mobile = formData.mobile || "";
//       } else {
//         requestPayload.mobile = formData.mobile;
//         requestPayload.email = formData.email || "";
//       }
      
//       // Only add optional fields if they have meaningful values
//       if (formData.referralCode && formData.referralCode.trim()) {
//         requestPayload.referralCode = formData.referralCode.trim();
//       }
      
//       console.log('Sending signup request with payload:', requestPayload);
      
//       const response = await apiClient.post(`${API_BASE_URL}/api/auth/signup`, requestPayload);
      
//       // Successful signup
//       if (response.status === 201 || response.status === 200) {
//         toast.success('Account created successfully! OTP has been sent.', {
//           position: "top-right",
//           autoClose: 3000,
//           style: { background: "#10B981", color: "#fff" }
//         });
        
//         // Move to OTP verification step
//         setStep(3);
//         setOtpTimer(600);
//         setCanResendOtp(false);
//         setOtpSent(true);
//       }
//     } catch (err) {
//       console.error('Signup Error:', err);
//        if (isSSLError(err)) {
//       handleSSLError('registration');
//       setLoading(false);
//       return;
//     }
//       if (err.response) {
//         const { status, data } = err.response;
//         let errorMessage = 'Signup failed. Please try again.';
        
//         console.error('Error response status:', status);
//         console.error('Error response data:', data);
        
//         switch (status) {
//           case 400:
//             if (typeof data === 'string') {
//               errorMessage = data;
//             } else if (data?.message) {
//               errorMessage = data.message;
//             } else if (data?.error) {
//               errorMessage = data.error;
//             } else {
//               errorMessage = 'Invalid data provided. Please check your information.';
//             }
//             break;
            
//           case 409:
//             errorMessage = 'An account with this email or mobile already exists.';
//             // If we get 409, go back to step 1 to re-validate
//             setStep(1);
//             break;
            
//           case 422:
//             errorMessage = 'Please check your input data and try again.';
//             break;
            
//           case 500:
//             errorMessage = 'Server error occurred. Please try again later.';
//             break;
            
//           default:
//             if (typeof data === 'string') {
//               errorMessage = data;
//             } else if (data?.message) {
//               errorMessage = data.message;
//             }
//         }
        
//         setErrors({ general: errorMessage });
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 5000,
//           style: { background: "#EF4444", color: "#fff" }
//         });
        
//       } else if (err.request) {
//         const errorMessage = 'No response from server. Please check your network connection.';
//         setErrors({ general: errorMessage });
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 5000,
//           style: { background: "#EF4444", color: "#fff" }
//         });
//       } else {
//         const errorMessage = 'Network error occurred. Please try again.';
//         setErrors({ general: errorMessage });
//         toast.error(errorMessage, {
//           position: "top-right",
//           autoClose: 5000,
//           style: { background: "#EF4444", color: "#fff" }
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Modal handlers
//   const openModal = (type) => {
//     setModalContent(type);
//   };

//   const closeModal = (e) => {
//   if (e) {
//     e.preventDefault();
//     e.stopPropagation();
//   }
//   setModalContent(null);
// };


//  const verifyOTP = async () => {
//     const otpString = otp.join('');
    
//     if (otpString.length !== 6) {
//       toast.error('Please enter all 6 digits of the OTP', {
//         position: "top-right",
//         autoClose: 3000,
//         style: { background: "#EF4444", color: "#fff" }
//       });
//       return;
//     }

//     setLoading(true);
    
//     try {
//       // Use the unified phoneOrEmail parameter for both email and mobile
//       const phoneOrEmail = contactMethod === 'email' ? formData.email : formData.mobile;
      
//       // Use POST request with query parameters as per API documentation
//       const response = await apiClient.post(`/api/otp/verify?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}&otp=${otpString}`, {});

//       console.log('OTP verification response:', response.data);

//       // Success response
//       toast.success('OTP verified successfully!', {
//         position: "top-right",
//         autoClose: 3000,
//         style: { background: "#10B981", color: "#fff" }
//       });
      
//       // Redirect to login after successful verification
//       setTimeout(() => {
//         navigate('/signin');
//       }, 2000);

//     } catch (err) {
//       console.error('OTP verification error:', err);
      
//       let errorMessage = 'Invalid OTP. Please try again.';
//        if (isSSLError(err)) {
//       handleSSLError('OTP resending');
//       setLoading(false);
//       return;
//     }
//       // Handle specific error responses
//       if (err.response) {
//         const { status, data } = err.response;
        
//         switch (status) {
//           case 400:
//             errorMessage = 'Invalid OTP format or expired OTP.';
//             break;
//           case 404:
//             errorMessage = 'OTP not found. Please request a new OTP.';
//             break;
//           case 429:
//             errorMessage = 'Too many attempts. Please try again later.';
//             break;
//           case 401:
//             errorMessage = 'OTP has expired. Please request a new one.';
//             break;
//           case 422:
//             errorMessage = 'Invalid OTP. Please check and try again.';
//             break;
//           default:
//             if (typeof data === 'string') {
//               errorMessage = data;
//             } else if (data?.message) {
//               errorMessage = data.message;
//             }
//         }
//       } else if (err.request) {
//         errorMessage = 'Network error. Please check your connection and try again.';
//       } else {
//         errorMessage = 'An unexpected error occurred. Please try again.';
//       }
      
//       toast.error(errorMessage, {
//         position: "top-right",
//         autoClose: 4000,
//         style: { background: "#EF4444", color: "#fff" }
//       });
      
//       // Clear OTP input on error to allow re-entry
//       setOtp(['', '', '', '', '', '']);
      
//       // Focus on first OTP input for convenience
//       const firstOtpInput = document.getElementById('otp-0');
//       if (firstOtpInput) {
//         setTimeout(() => firstOtpInput.focus(), 100);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpChange = (index, value) => {
//     // Only allow numbers
//     if (!/^\d*$/.test(value)) return;
    
//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);
    
//     // Auto-focus next input
//     if (value && index < 5) {
//       const nextInput = document.getElementById(`otp-${index + 1}`);
//       if (nextInput) nextInput.focus();
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       const prevInput = document.getElementById(`otp-${index - 1}`);
//       if (prevInput) prevInput.focus();
//     }
//   };

//   // FIXED: Updated resend OTP function using correct API endpoints
//   const handleResendOtp = async () => {
//     if (!canResendOtp) return;
    
//     setLoading(true);
//     try {
//       if (contactMethod === 'email') {
//         // Use POST request for email OTP as per API documentation
//         const response = await apiClient.post(`/api/otp/emailOtp/send?email=${encodeURIComponent(formData.email)}`, {});
        
//         console.log('Email OTP Response:', response.data);
//         toast.success('OTP sent to your email!', {
//           position: "top-right",
//           autoClose: 3000,
//           style: { background: "#10B981", color: "#fff" }
//         });
//       } else {
//         // Use POST request for phone OTP as per API documentation
//         const response = await apiClient.post(`/api/otp/phone/send?phone=${formData.mobile}`, {});
        
//         console.log('Phone OTP Response:', response.data);
//         toast.success('OTP sent to your mobile number!', {
//           position: "top-right",
//           autoClose: 3000,
//           style: { background: "#10B981", color: "#fff" }
//         });
//       }

//       // Reset timer and clear OTP
//       setOtpTimer(600);
//       setCanResendOtp(false);
//       setOtp(['', '', '', '', '', '']);
      
//     } catch (err) {
//       console.error('Resend OTP error:', err);
      
//       let errorMessage = 'Failed to resend OTP. Please try again.';
//        if (isSSLError(err)) {
//       handleSSLError('OTP resending');
//       setLoading(false);
//       return;
//     }
//       // Handle specific error cases
//       if (err.response?.status === 429) {
//         errorMessage = 'Too many requests. Please wait before requesting another OTP.';
//       } else if (err.response?.status === 400) {
//         errorMessage = 'Invalid request. Please check your information.';
//       } else if (err.response?.status === 404) {
//         errorMessage = 'Service not found. Please try again later.';
//       } else if (err.response?.status >= 500) {
//         errorMessage = 'Server error. Please try again later.';
//       }
      
//       toast.error(errorMessage, {
//         position: "top-right",
//         autoClose: 3000,
//         style: { background: "#EF4444", color: "#fff" }
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const renderModalContent = () => {
//   switch (modalContent) {
//     case 'termsandconditions':
//       return <TermsAndConditions onClose={closeModal} />;
//     case 'policy':
//       return <PrivacyPolicy onClose={closeModal} />;
//     default:
//       return null;
//   }
// };

//   // Handle Google signup
//   const handleGoogleSignup = () => {
//     toast.info('Google signup integration coming soon!', {
//       position: "top-right",
//       autoClose: 3000,
//       style: { background: "#3B82F6", color: "#fff" }
//     });
//   };
// const handleSSLModalClose = () => {
//   setShowSSLModal(false);
// };
  
// const handleSSLRetry = () => {
//   setShowSSLModal(false);
//   setSSLError(false);
//   setErrors(prev => {
//     const { ssl, ...rest } = prev;
//     return rest;
//   });
  
//   // Retry the last attempted action based on current step
//   if (step === 1) {
//     // Retry user validation
//     handleContinue();
//   } else if (step === 2) {
//     // Retry registration
//     const fakeEvent = { preventDefault: () => {} };
//     handleSubmit(fakeEvent);
//   } else if (step === 3) {
//     // Retry OTP verification if OTP is complete
//     if (otp.join('').length === 6) {
//       verifyOTP();
//     } else {
//       // Or retry OTP resend if available
//       if (canResendOtp) {
//         handleResendOtp();
//       }
//     }
//   }
// };
  

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         duration: 0.5,
//         when: "beforeChildren",
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: { 
//         duration: 0.5 
//       }
//     }
//   };

//   const slideVariants = {
//     hidden: { x: 50, opacity: 0 },
//     visible: { 
//       x: 0, 
//       opacity: 1,
//       transition: { 
//         type: "spring",
//         stiffness: 300,
//         damping: 24
//       }
//     },
//     exit: {
//       x: -50,
//       opacity: 0,
//       transition: {
//         duration: 0.3
//       }
//     }
//   };

//   const imageVariants = {
//     hidden: { scale: 0.8, opacity: 0 },
//     visible: { 
//       scale: 1, 
//       opacity: 1,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut"
//       }
//     },
//     hover: {
//       y: [-10, 0, -10],
//       transition: {
//         y: {
//           duration: 2,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }
//       }
//     }
//   };

//   const buttonVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         delay: 0.2,
//         duration: 0.5 
//       }
//     },
//     hover: { 
//       scale: 1.05,
//       backgroundColor: "#4338CA",
//       boxShadow: "0px 5px 15px rgba(79, 70, 229, 0.4)",
//       transition: { 
//         duration: 0.3 
//       }
//     },
//     tap: { 
//       scale: 0.95 
//     }
//   };

//   const featureItemVariants = {
//     hidden: { x: -20, opacity: 0 },
//     visible: (i) => ({ 
//       x: 0, 
//       opacity: 1,
//       transition: { 
//         delay: i * 0.2,
//         duration: 0.5 
//       }
//     })
//   };

//   return (
//     <div>
// <header className="w-full bg-white shadow-sm border-b border-gray-100">
//   <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
//     <div className="flex items-center justify-start">
//       <img
//         src="/logo.png"
//         alt="myBOQ Logo"
//         className="h-8 sm:h-10 w-auto mr-3 sm:mr-4 ml-0"
//       />
//       <span className="text-xl sm:text-2xl font-bold text-gray-800">myBOQ</span>
//     </div>
//   </div>
// </header>

      
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
//   <ToastContainer />
  
//   {/* Policy Modal */}
//   <PolicyModal 
//     isOpen={modalOpen} 
//     onClose={() => setModalOpen(false)} 
//     type={modalType} 
//   />
        
//          <motion.div 
//     initial="hidden"
//     animate="visible"
//     variants={containerVariants}
//     className="w-full max-w-5xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2"
//   >
//     {/* Left Side - Welcome Image and Text - Hidden on Mobile */}
//     <motion.div 
//       variants={containerVariants}
//       className="bg-gradient-to-br from-blue-50 to-indigo-50 flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-hidden hidden lg:flex"
//     >
//       <div className="text-center">
//         <motion.h2 
//           variants={itemVariants}
//           className="text-3xl xl:text-4xl font-bold text-gray-800 mb-4"
//         >
//           Welcome to myBOQ
//         </motion.h2>
        
//         <motion.p 
//           variants={itemVariants}
//           className="text-lg xl:text-xl text-gray-600 mb-8"
//         >
//           Join us and Prepare accurate estimates, tenders, and bills faster—without missing any compliance details.
//         </motion.p>
        
//         <motion.img 
//           variants={imageVariants}
//           whileHover="hover"
//           src="/register.svg" 
//           alt="Register Illustration"
//           className="w-full max-w-md mx-auto mb-6"
//         />
        
//         <motion.div 
//           variants={containerVariants}
//           className="mt-6 space-y-2"
//         >
//           {[
//             "Fast & Accurate Estimations",
//             "Subscription = Flexibility + Savings",
//             "SSR & Non-SSR Item Support",
//             "Auto Rate Analysis",
//             "Duplicate Revision & Estimates",
//             "Export to PDF"
//           ].map((text, index) => (
//             <motion.div 
//               key={index}
//               custom={index}
//               variants={featureItemVariants}
//               className="flex items-center space-x-2"
//             >
//               <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <span className="text-gray-700 text-sm xl:text-base">{text}</span>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </motion.div>

//           {/* Right Side - Form */}
//          <motion.div 
//       variants={containerVariants}
//       className="flex items-center justify-center p-6 sm:p-8 lg:p-12"
//     >
//       <div className="w-full max-w-md">
//         {/* Mobile Header - Only visible on mobile */}
//         <div className="lg:hidden text-center mb-8">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
//             Welcome to myBOQ
//           </h1>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Create accurate estimates and tenders faster
//           </p>
//         </div>

//         <motion.h2 
//           variants={itemVariants}
//           className="text-2xl sm:text-3xl font-semibold text-gray-800 text-center mb-6"
//         >
//           {step === 0 && 'Create Your Account'}
//           {step === 1 && 'Enter Your Details'}
//           {step === 2 && 'Complete Registration'}
//           {step === 3 && 'Verify Your Email'}
//         </motion.h2>


// {step === 0 && (
//   <motion.div
//     key="step0"
//     initial="hidden"
//     animate="visible"
//     exit="exit"
//     variants={slideVariants}
//     className="space-y-4 sm:space-y-6"
//   >
//     <motion.button
//       variants={buttonVariants}
//       whileHover="hover"
//       whileTap="tap"
//       onClick={() => handleContactMethod('email')}
//       className="w-full bg-indigo-400 text-white py-3 sm:py-3 px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
//     >
//       Continue with Email
//     </motion.button>
    
//     <motion.button
//       variants={buttonVariants}
//       whileHover="hover"
//       whileTap="tap"
//       onClick={() => handleContactMethod('mobile')}
//       className="w-full bg-gray-100 text-gray-800 py-3 sm:py-3 px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
//     >
//       Continue with Mobile
//     </motion.button>
    
//     <div className="flex items-center justify-center space-x-4">
//       <div className="flex-1 h-px bg-gray-300"></div>
//       <div className="text-gray-500 text-xs sm:text-sm">OR</div>
//       <div className="flex-1 h-px bg-gray-300"></div>
//     </div>
    
//     <motion.button
//       variants={buttonVariants}
//       whileHover="hover"
//       whileTap="tap"
//       disabled={true}
//       onClick={handleGoogleSignup}
//       className="w-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 py-3 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base"
//     >
//       <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
//         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//       </svg>
//       Continue with Google
//     </motion.button>
    
//     <motion.p 
//       variants={itemVariants}
//       className="text-center text-xs sm:text-sm text-gray-600"
//     >
//       Already have an account?{' '}
//       <button 
//         onClick={() => navigate('/signin')}
//         className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
//       >
//         Sign In
//       </button>
//     </motion.p>
//   </motion.div>
// )}


// {step === 1 && (
//   <motion.form
//     key="step1"
//     initial="hidden"
//     animate="visible"
//     exit="exit"
//     variants={slideVariants}
//     className="space-y-4 sm:space-y-6"
//     onSubmit={(e) => {
//       e.preventDefault();
//       handleContinue();
//     }}
//   >
//     <div>
//       <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
//         Full Name <span className="text-red-500">*</span>
//       </label>
//       <motion.input
//         whileFocus={{ scale: 1.02 }}
//         type="text"
//         id="userName"
//         name="userName"
//         value={formData.userName}
//         onChange={handleChange}
//         onBlur={handleBlur}
//         className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
//           errors.userName 
//             ? 'border-red-500 focus:ring-red-500' 
//             : 'border-gray-300 focus:ring-indigo-500'
//         }`}
//         placeholder="Enter your full name"
//       />
//       {errors.userName && (
//         <motion.p 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-1 text-xs sm:text-sm text-red-600"
//         >
//           {errors.userName}
//         </motion.p>
//       )}
//     </div>

//     {/* Email Field - Only show if contactMethod is 'email' */}
//     {contactMethod === 'email' && (
//       <div>
//         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//           Email Address <span className="text-red-500">*</span>
//         </label>
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           type="email"
//           id="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           onBlur={handleBlur}
//           className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
//             errors.email 
//               ? 'border-red-500 focus:ring-red-500' 
//               : 'border-gray-300 focus:ring-indigo-500'
//           }`}
//           placeholder="Enter your email address"
//         />
//         {errors.email && (
//           <motion.p 
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-1 text-xs sm:text-sm text-red-600"
//           >
//             {errors.email}
//           </motion.p>
//         )}
//       </div>
//     )}

//     {/* Mobile Field - Only show if contactMethod is 'mobile' */}
//     {contactMethod === 'mobile' && (
//       <div>
//         <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
//           Mobile Number <span className="text-red-500">*</span>
//         </label>
//         <motion.input
//           whileFocus={{ scale: 1.02 }}
//           type="tel"
//           id="mobile"
//           name="mobile"
//           value={formData.mobile}
//           onChange={handleChange}
//           onBlur={handleBlur}
//           className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition duration-200 ${
//             errors.mobile 
//               ? 'border-red-500 focus:ring-red-500' 
//               : 'border-gray-300 focus:ring-indigo-500'
//           }`}
//           placeholder="Enter your 10-digit mobile number"
//           maxLength="10"
//         />
//         {errors.mobile && (
//           <motion.p 
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mt-1 text-xs sm:text-sm text-red-600"
//           >
//             {errors.mobile}
//           </motion.p>
//         )}
//       </div>
//     )}
    
//     <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         type="button"
//         onClick={() => setStep(0)}
//         className="w-full sm:flex-1 bg-gray-100 text-gray-800 py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
//       >
//         Back
//       </motion.button>
      
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         type="submit"
//         disabled={loading}
//         className="w-full sm:flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Checking...
//           </div>
//         ) : (
//           'Continue'
//         )}
//       </motion.button>
//     </div>
//   </motion.form>
// )}

// {step === 3 && (
//   <motion.div
//     key="step3"
//     initial="hidden"
//     animate="visible"
//     exit="exit"
//     variants={slideVariants}
//     className="text-center space-y-4 sm:space-y-6"
//   >
//     <div className="mb-6 sm:mb-8">
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: 0.2 }}
//         className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
//       >
//         <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//         </svg>
//       </motion.div>
      
//       <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
//         Verify Your Account
//       </h3>
      
//       <p className="text-gray-600 text-sm sm:text-base px-4">
//         We've sent a 6-digit OTP to your {contactMethod === 'email' ? 'email' : 'mobile number'}
//       </p>
      
//       <p className="text-xs sm:text-sm font-medium text-gray-800 mt-2 break-all px-4">
//         {contactMethod === 'email' ? formData.email : formData.mobile}
//       </p>
//     </div>

//     {/* Mobile-Responsive OTP Input Fields */}
//     <div className="flex justify-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 px-4">
//       {otp.map((digit, index) => (
//         <motion.input
//           key={index}
//           id={`otp-${index}`}
//           type="text"
//           maxLength="1"
//           value={digit}
//           onChange={(e) => handleOtpChange(index, e.target.value)}
//           onKeyDown={(e) => handleOtpKeyDown(index, e)}
//           className="w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
//           initial={{ scale: 0, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: index * 0.1 }}
//         />
//       ))}
//     </div>

//     {/* Timer Display */}
//     <div className="mb-4 sm:mb-6">
//       {otpTimer > 0 ? (
//         <p className="text-xs sm:text-sm text-gray-600">
//           OTP expires in: <span className="font-semibold text-indigo-600">{formatTime(otpTimer)}</span>
//         </p>
//       ) : (
//         <p className="text-xs sm:text-sm text-red-600">
//           OTP has expired. Please request a new one.
//         </p>
//       )}
//     </div>

//     {/* Action Buttons */}
//     <div className="space-y-3 sm:space-y-4 px-4">
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={verifyOTP}
//         disabled={loading || otp.join('').length !== 6}
//         className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {loading ? (
//           <div className="flex items-center justify-center">
//             <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Verifying...
//           </div>
//         ) : (
//           'Verify OTP'
//         )}
//       </motion.button>

//       {/* Resend OTP Button */}
//       <div className="text-center">
//         <span className="text-xs sm:text-sm text-gray-600">Didn't receive the OTP? </span>
//         <button
//           onClick={handleResendOtp}
//           disabled={!canResendOtp || loading}
//           className={`text-xs sm:text-sm font-medium transition duration-200 ${
//             canResendOtp && !loading
//               ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer'
//               : 'text-gray-400 cursor-not-allowed'
//           }`}
//         >
//           Resend OTP
//         </button>
//       </div>
//     </div>

//     {/* Back Button */}
//     <div className="pt-4">
//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         type="button"
//         onClick={() => {
//           setStep(2);
//           setOtp(['', '', '', '', '', '']);
//           setOtpTimer(0);
//           setCanResendOtp(false);
//         }}
//         className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition duration-200"
//       >
//         ← Back to registration
//       </motion.button>
//     </div>

//     {/* Error Display */}
//     {errors.general && (
//       <motion.div
//         initial={{ opacity: 0, y: -10 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-red-50 border border-red-200 rounded-lg p-3 mx-4"
//       >
//         <p className="text-xs sm:text-sm text-red-600">{errors.general}</p>
//       </motion.div>
//     )}
//   </motion.div>
// )}


// <AnimatePresence>
//   {modalContent && (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
//       onClick={(e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         closeModal();
//       }}
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Header */}
//         <div className="flex justify-between items-center p-4 sm:p-6 border-b">
//           <h2 className="text-lg sm:text-xl font-semibold">
//             {modalContent === 'termsandconditions' ? 'Terms and Conditions' : 'Privacy Policy'}
//           </h2>
//           <button
//             type="button"
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               closeModal();
//             }}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             ×
//           </button>
//         </div>
        
//         {/* Modal Content */}
//         <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh] text-sm sm:text-base">
//           {renderModalContent()}
//         </div>
        
//         {/* Modal Footer */}
//         <div className="flex justify-end p-4 sm:p-6 border-t">
//           <button
//             type="button"
//             onClick={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               closeModal();
//             }}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 text-sm sm:text-base"
//           >
//             Close
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   )}
// </AnimatePresence>
              
//             </div>
//           </motion.div>
//         </motion.div>
        
       
//       </div>
//      {/* <footer className="w-full bg-gray-100 border-t border-gray-200">
//       <div className="max-w-7xl mx-auto px-6 py-4">
//         <div className="text-center text-gray-600 text-sm">
//           © {currentYear} SiliconMount Tech Services Pvt. Ltd. All rights reserved.
//         </div>
//       </div>
//     </footer> */}
//     <SSLCertificateInstallation
//   isOpen={showSSLModal}
//   onClose={handleSSLModalClose}
//   onRetry={handleSSLRetry}
//   certificateUrl="/rootCA.crt" // Make sure this path is correct for your setup
// />
//     </div>
//   );
// };

// export default SignupPage;

import React, { useState } from 'react';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import TermsAndConditions from './TermandCondition';
import PrivacyPolicy from './Privacy';
import { API_BASE_URL} from '../config';
// Create a custom axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Base URL for all requests
  timeout: 30000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Disable credentials if not needed
});

const currentYear = new Date().getFullYear();

// Modal Component for Terms and Privacy Policy
const PolicyModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const termsContent = (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Terms of Service</h3>
      <div className="text-sm text-gray-600 space-y-3 max-h-96 overflow-y-auto">
        <p><strong>1. Acceptance of Terms</strong></p>
        <p>By accessing and using myBOQ services, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <p><strong>2. Service Description</strong></p>
        <p>myBOQ provides construction estimation and billing services including BOQ preparation, rate analysis, and project management tools.</p>
        
        <p><strong>3. User Responsibilities</strong></p>
        <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
        
        <p><strong>4. Payment Terms</strong></p>
        <p>Subscription fees are charged based on the selected plan. All payments are processed securely through our payment partners.</p>
        
        <p><strong>5. Data Usage</strong></p>
        <p>We collect and use your data as described in our Privacy Policy to provide and improve our services.</p>
        
        <p><strong>6. Service Availability</strong></p>
        <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service availability.</p>
        
        <p><strong>7. Termination</strong></p>
        <p>Either party may terminate this agreement at any time with appropriate notice as specified in your subscription terms.</p>
        
        <p><strong>8. Limitation of Liability</strong></p>
        <p>myBOQ shall not be liable for any indirect, incidental, special, or consequential damages.</p>
      </div>
    </div>
  );

 
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {type === 'terms' }
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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
  const [errors, setErrors] = useState({}); // Changed to object for multiple field errors
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // For 6-digit OTP
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes in seconds
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState('');
  const [isCheckingUser, setIsCheckingUser] = useState(false);
const [userCheckDebounce, setUserCheckDebounce] = useState(null);
  const [userValidationBypass, setUserValidationBypass] = useState(false); // Track if we bypassed validation
  const navigate = useNavigate();


  // Handle input changes with immediate validation
 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  
  // Clear specific field error when user starts typing
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

 useEffect(() => {
    let interval = null;
    if (step === 3 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => {
          if (timer <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);
 useEffect(() => {
  const checkUserExists = async (userName) => {
    if (!userName.trim()) {
      setErrors(prev => ({ ...prev, [contactMethod]: '' }));
      return;
    }

    if (contactMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userName)) return;
    } else if (contactMethod === 'mobile') {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(userName)) return;
    }

    setIsCheckingUser(true);

    try {
      const response = await apiClient.get(`/api/auth/isValidUser?userName=${encodeURIComponent(userName)}`);
      
      if (response.data === 1 || 
          (response.data?.message && response.data.message.toLowerCase().includes('already registered'))) {
        const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
        setErrors(prev => ({
          ...prev,
          [contactMethod]: `This ${contactType} is already registered.`
        }));
        
        setTimeout(() => {
          navigate('/signin', { 
            state: { 
              prefillData: {
                userName: userName,
                contactMethod: contactMethod
              }
            }
          });
        }, 2000);
        
      } else if (response.data === 0 || 
                 (response.data?.message && response.data.message.toLowerCase().includes('user not found'))) {
        setErrors(prev => ({
          ...prev,
          [contactMethod]: ''
        }));
      }
    } catch (err) {
      if (err.response?.status === 409) {
        const contactType = contactMethod === 'email' ? 'email' : 'mobile number';
        setErrors(prev => ({
          ...prev,
          [contactMethod]: `This ${contactType} is already registered.`
        }));
        
        setTimeout(() => {
          navigate('/signin', { 
            state: { 
              prefillData: {
                userName: userName,
                contactMethod: contactMethod
              }
            }
          });
        }, 2000);
      } else if (err.response?.status === 404) {
        setErrors(prev => ({
          ...prev,
          [contactMethod]: ''
        }));
      }
    } finally {
      setIsCheckingUser(false);
    }
  };

  if (step === 1) {
    const userName = contactMethod === 'email' ? formData.email : formData.mobile;
    
    if (userCheckDebounce) {
      clearTimeout(userCheckDebounce);
    }

    const timeoutId = setTimeout(() => {
      checkUserExists(userName);
    }, 1000);

    setUserCheckDebounce(timeoutId);

    return () => clearTimeout(timeoutId);
  }
}, [formData.email, formData.mobile, contactMethod, step, navigate]);
  // Handle field blur for immediate validation
   const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Validate individual field
  const validateField = (fieldName, value) => {
    let fieldError = '';

    switch (fieldName) {
      case 'userName':
        if (!value.trim()) {
          fieldError = 'Full Name is required';
        }
        break;
      
      case 'email':
        if (contactMethod === 'email') {
          if (!value.trim()) {
            fieldError = 'Email is required';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              fieldError = 'Invalid email format';
            }
          }
        }
        break;
      
      case 'mobile':
        if (contactMethod === 'mobile') {
          if (!value.trim()) {
            fieldError = 'Mobile number is required';
          } else {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(value)) {
              fieldError = 'Please enter a valid 10-digit mobile number';
            }
          }
        }
        break;
      
      case 'password':
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordPattern.test(value)) {
          fieldError = 'Password must be at least 8 characters and include letters, numbers, and a special character';
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          fieldError = 'Passwords do not match';
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError
    }));

    return fieldError === '';
  };

    // Handle contact method selection
    const handleContactMethod = (method) => {
    setContactMethod(method);
    setStep(1);
    setErrors({}); // Clear all errors when changing method
    setUserValidationBypass(false); // Reset bypass flag
  };


  
   // Validate current step
  const validateStep = () => {
    let isValid = true;
    const newErrors = {};

    if (step === 1) {
      if (!formData.userName.trim()) {
        newErrors.userName = 'Full Name is required';
        isValid = false;
      }

      if (contactMethod === 'email') {
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
          isValid = false;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
          }
        }
      }

       if (contactMethod === 'mobile') {
        if (!formData.mobile.trim()) {
          newErrors.mobile = 'Mobile number is required';
          isValid = false;
        } else {
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(formData.mobile)) {
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';
            isValid = false;
          }
        }
      }
    } else if (step === 2) {
      const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordPattern.test(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and include letters, numbers, and a special character';
        isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
      if (!acceptTerms) {
        newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
        isValid = false;
      }
    }

    setErrors(newErrors);

    // Show toast for first error found
       if (!isValid) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError, {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#EF4444", color: "#fff" }
      });
    }

    return isValid;
  };
  

// Handle continue button click
const handleContinue = async () => {
  if (!validateStep()) return;

  if (step === 1) {
    if (errors[contactMethod] && errors[contactMethod].includes('already registered')) {
      return;
    }
    setStep(step + 1);
    setErrors({});
  } else {
    setStep(step + 1);
  }
};
  
  
   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate final step
    if (!validateStep()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const requestPayload = {
        userName: contactMethod === 'email' ? formData.email : formData.mobile,
        fullName: formData.userName,
        password: formData.password,
        role: ["user"]
      };
      
      // Add email or mobile based on contact method
      if (contactMethod === 'email') {
        requestPayload.email = formData.email;
        requestPayload.mobile = formData.mobile || "";
      } else {
        requestPayload.mobile = formData.mobile;
        requestPayload.email = formData.email || "";
      }
      
      // Only add optional fields if they have meaningful values
      if (formData.referralCode && formData.referralCode.trim()) {
        requestPayload.referralCode = formData.referralCode.trim();
      }
      
      console.log('Sending signup request with payload:', requestPayload);
      
      const response = await apiClient.post(`${API_BASE_URL}/api/auth/signup`, requestPayload);
      
      // Successful signup
      if (response.status === 201 || response.status === 200) {
        toast.success('Account created successfully! OTP has been sent.', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#10B981", color: "#fff" }
        });
        
        // Move to OTP verification step
        setStep(3);
        setOtpTimer(600);
        setCanResendOtp(false);
        setOtpSent(true);
      }
    } catch (err) {
      console.error('Signup Error:', err);
      
      if (err.response) {
        const { status, data } = err.response;
        let errorMessage = 'Signup failed. Please try again.';
        
        console.error('Error response status:', status);
        console.error('Error response data:', data);
        
        switch (status) {
          case 400:
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data?.message) {
              errorMessage = data.message;
            } else if (data?.error) {
              errorMessage = data.error;
            } else {
              errorMessage = 'Invalid data provided. Please check your information.';
            }
            break;
            
          case 409:
            errorMessage = 'An account with this email or mobile already exists.';
            // If we get 409, go back to step 1 to re-validate
            setStep(1);
            break;
            
          case 422:
            errorMessage = 'Please check your input data and try again.';
            break;
            
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
            
          default:
            if (typeof data === 'string') {
              errorMessage = data;
            } else if (data?.message) {
              errorMessage = data.message;
            }
        }
        
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: { background: "#EF4444", color: "#fff" }
        });
        
      } else if (err.request) {
        const errorMessage = 'No response from server. Please check your network connection.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: { background: "#EF4444", color: "#fff" }
        });
      } else {
        const errorMessage = 'Network error occurred. Please try again.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          style: { background: "#EF4444", color: "#fff" }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = (type) => {
    setModalContent(type);
  };

  const closeModal = (e) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  setModalContent(null);
};
const handleAutoLogin = async (credentials) => {
  try {
    console.log('Attempting auto-login with:', credentials);
    
    const loginResponse = await apiClient.post(`/api/auth/signin`, credentials);
    
    if (loginResponse.status === 200) {
      const userData = loginResponse.data;
      console.log('Auto-login successful:', userData);
      
      // Store authentication data with comprehensive fallbacks
      localStorage.setItem('user', JSON.stringify(userData));
      
      const token = userData.jwt || userData.token || userData.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('jwt', token);
      }
      
      // Store all relevant user data
      const userDataMapping = {
        'Id': userData.id,
        'id': userData.id,
        'fullName': userData.fullName || formData.userName,
        'mobile': userData.mobile || formData.mobile,
        'email': userData.email || formData.email,
        'userRole': userData.role
      };
      
      Object.entries(userDataMapping).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
          } else {
            localStorage.setItem(key, value.toString());
          }
        }
      });
      
      return { success: true, userData };
    }
    
    return { success: false, error: 'Invalid response status' };
    
  } catch (error) {
    console.error('Auto-login error:', error);
    return { success: false, error: error.message || 'Auto-login failed' };
  }
};
const verifyOTP = async () => {
  const otpString = otp.join('');
  
  if (otpString.length !== 6) {
    toast.error('Please enter all 6 digits of the OTP', {
      position: "top-right",
      autoClose: 3000,
      style: { background: "#EF4444", color: "#fff" }
    });
    return;
  }

  setLoading(true);
  
  try {
    // Use the unified phoneOrEmail parameter for both email and mobile
    const phoneOrEmail = contactMethod === 'email' ? formData.email : formData.mobile;
    
    // Use POST request with query parameters as per API documentation
    const response = await apiClient.post(`/api/otp/verify?phoneOrEmail=${encodeURIComponent(phoneOrEmail)}&otp=${otpString}`, {});

    console.log('OTP verification response:', response.data);

    // Success response
    toast.success('OTP verified successfully!', {
      position: "top-right",
      autoClose: 3000,
      style: { background: "#10B981", color: "#fff" }
    });
    
    // CORRECTED: Auto-login after successful verification
    try {
      // Call login API with stored credentials
      const loginPayload = {
        userName: contactMethod === 'email' ? formData.email : formData.mobile,
        password: formData.password
      };

      console.log('Attempting auto-login with payload:', loginPayload);

      const loginResponse = await apiClient.post(`/api/auth/signin`, loginPayload);
      
      if (loginResponse.status === 200) {
        const userData = loginResponse.data;
        console.log('Auto-login successful:', userData);
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Store authentication token with multiple fallback keys
        const token = userData.jwt || userData.token || userData.accessToken;
        if (token) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('jwt', token);
        }
        
        // Store user details with fallbacks
        if (userData.id) {
          localStorage.setItem('Id', userData.id.toString());
          localStorage.setItem('id', userData.id.toString());
        }
        
        if (userData.fullName || formData.userName) {
          localStorage.setItem('fullName', userData.fullName || formData.userName);
        }
        
        if (userData.mobile || formData.mobile) {
          localStorage.setItem('mobile', userData.mobile || formData.mobile);
        }

        // Store email if available
        if (userData.email || formData.email) {
          localStorage.setItem('email', userData.email || formData.email);
        }

        // Store any additional user properties that might be useful
        if (userData.role) {
          localStorage.setItem('userRole', JSON.stringify(userData.role));
        }
        
        toast.success('Welcome to myBOQ! Redirecting to your dashboard...', {
          position: "top-right",
          autoClose: 2000,
          style: { background: "#10B981", color: "#fff" }
        });
        
        // CORRECTED: Proper redirect timing and error handling
        setTimeout(() => {
          try {
            navigate('/mywork');
          } catch (navigationError) {
            console.error('Navigation error:', navigationError);
            // Fallback: use window.location if navigate fails
            window.location.href = '/mywork';
          }
        }, 2000);
        
      } else {
        throw new Error('Login response was not successful');
      }
      
    } catch (loginError) {
      console.error('Auto-login failed:', loginError);
      
      // Handle different auto-login error scenarios
      let fallbackMessage = 'Registration successful! Please login with your credentials.';
      
      if (loginError.response) {
        const { status } = loginError.response;
        switch (status) {
          case 401:
            fallbackMessage = 'Registration successful! Please login with your credentials.';
            break;
          case 404:
            fallbackMessage = 'Account created but login service unavailable. Please try logging in manually.';
            break;
          case 500:
            fallbackMessage = 'Account created successfully! Login service temporarily unavailable.';
            break;
          default:
            fallbackMessage = 'Registration successful! Please login with your credentials.';
        }
      } else if (loginError.request) {
        fallbackMessage = 'Registration successful! Network issue prevented auto-login. Please login manually.';
      }
      
      toast.info(fallbackMessage, {
        position: "top-right",
        autoClose: 4000,
        style: { background: "#3B82F6", color: "#fff" }
      });
      
      // Redirect to login page with prefilled data
      setTimeout(() => {
        try {
          navigate('/signin', {
            state: {
              prefillData: {
                userName: contactMethod === 'email' ? formData.email : formData.mobile,
                contactMethod: contactMethod
              },
              message: 'Registration successful! Please login with your credentials.'
            }
          });
        } catch (navigationError) {
          console.error('Navigation to signin failed:', navigationError);
          // Fallback: use window.location if navigate fails
          window.location.href = '/signin';
        }
      }, 2000);
    }

  } catch (err) {
    console.error('OTP verification error:', err);
    
    let errorMessage = 'Invalid OTP. Please try again.';
    
    // Handle specific error responses
    if (err.response) {
      const { status, data } = err.response;
      
      switch (status) {
        case 400:
          errorMessage = 'Invalid OTP format or expired OTP.';
          break;
        case 404:
          errorMessage = 'OTP not found. Please request a new OTP.';
          break;
        case 429:
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 401:
          errorMessage = 'OTP has expired. Please request a new one.';
          break;
        case 422:
          errorMessage = 'Invalid OTP. Please check and try again.';
          break;
        default:
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data?.message) {
            errorMessage = data.message;
          }
      }
    } else if (err.request) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else {
      errorMessage = 'An unexpected error occurred. Please try again.';
    }
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      style: { background: "#EF4444", color: "#fff" }
    });
    
    // Clear OTP input on error to allow re-entry
    setOtp(['', '', '', '', '', '']);
    
    // Focus on first OTP input for convenience
    const firstOtpInput = document.getElementById('otp-0');
    if (firstOtpInput) {
      setTimeout(() => firstOtpInput.focus(), 100);
    }
  } finally {
    setLoading(false);
  }
};

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // FIXED: Updated resend OTP function using correct API endpoints
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setLoading(true);
    try {
      if (contactMethod === 'email') {
        // Use POST request for email OTP as per API documentation
        const response = await apiClient.post(`/api/otp/emailOtp/send?email=${encodeURIComponent(formData.email)}`, {});
        
        console.log('Email OTP Response:', response.data);
        toast.success('OTP sent to your email!', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#10B981", color: "#fff" }
        });
      } else {
        // Use POST request for phone OTP as per API documentation
        const response = await apiClient.post(`/api/otp/phone/send?phone=${formData.mobile}`, {});
        
        console.log('Phone OTP Response:', response.data);
        toast.success('OTP sent to your mobile number!', {
          position: "top-right",
          autoClose: 3000,
          style: { background: "#10B981", color: "#fff" }
        });
      }

      // Reset timer and clear OTP
      setOtpTimer(600);
      setCanResendOtp(false);
      setOtp(['', '', '', '', '', '']);
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      // Handle specific error cases
      if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait before requesting another OTP.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your information.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Service not found. Please try again later.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        style: { background: "#EF4444", color: "#fff" }
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderModalContent = () => {
  switch (modalContent) {
    case 'termsandconditions':
      return <TermsAndConditions onClose={closeModal} />;
    case 'policy':
      return <PrivacyPolicy onClose={closeModal} />;
    default:
      return null;
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
     
 <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
  <div className="w-full px-4 py-4">
    <div className="flex items-center justify-start">
      <img
        src="/logo.png"
        alt="myBOQ Logo"
        className="h-10 w-auto mr-4 ml-0"
      />
      <span className="text-2xl font-bold text-gray-800">myBOQ</span>
    </div>
  </div>
</header>

      
<div className="flex-1 flex items-start justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 lg:p-6 min-h-screen overflow-y-auto">
  <ToastContainer />
        
  {/* Policy Modal */}
  <PolicyModal 
    isOpen={modalOpen} 
    onClose={() => setModalOpen(false)} 
    type={modalType} 
  />
        
  <motion.div 
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px] my-4 sm:my-8"
  >

          {/* Left Side - Welcome Image and Text */}
      <motion.div 
  variants={containerVariants}
  className="bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden min-h-[300px] sm:min-h-[400px]"
>
  <div className="text-center w-full">
    <motion.h2 
      variants={itemVariants}
      className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4"
    >
      Welcome to myBOQ
    </motion.h2>

    <motion.p 
      variants={itemVariants}
      className="text-xs sm:text-base lg:text-lg xl:text-xl text-gray-600 mb-2 sm:mb-3 lg:mb-4 px-2 leading-tight"
    >
      Join us and Prepare accurate estimates, tenders, and bills faster—without missing any compliance details.
    </motion.p>
                  
    <motion.img 
      variants={imageVariants}
      whileHover="hover"
      src="/register.svg" 
      alt="Register Illustration"
      className="w-full max-w-[120px] sm:max-w-[180px] lg:max-w-[220px] mx-auto mb-2 sm:mb-3 lg:mb-4 hidden sm:block"
    />
                
    <motion.div 
      variants={containerVariants}
      className="mt-2 sm:mt-4 space-y-1 sm:space-y-2 hidden lg:block w-full max-w-sm mx-auto"
    >
      {[
        "Fast & Accurate Estimations",
        "Subscription = Flexibility + Savings",
        "SSR & Non-SSR Item Support",
        "Auto Rate Analysis",
        "Duplicate Revision & Estimates",
        // "Export to PDF"
      ].map((text, index) => (
        <motion.div 
          key={index}
          custom={index}
          variants={featureItemVariants}
          className="flex items-center space-x-2 text-xs sm:text-sm lg:text-base w-full"
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 lg:h-4 lg:w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-gray-700 flex-1 leading-tight">{text}</span>
        </motion.div>
      ))}
    </motion.div>
  </div>
</motion.div>


          {/* Right Side - Form */}
        <motion.div 
  variants={containerVariants}
  className="flex items-start justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-[400px] max-h-[90vh] sm:max-h-none"
>
  <div className="w-full max-w-md mx-auto py-2 sm:py-4">
    <motion.h2 
      variants={itemVariants}
      className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-800 text-center mb-4 sm:mb-6"
    >
      {step === 0 && 'Create Your Account'}
      {step === 1 && 'Enter Your Details'}
      {step === 2 && 'Complete Registration'}
      {step === 3 && 'Verify Your Email'}
    </motion.h2>

        {/* Your existing AnimatePresence content remains the same, just update button spacing */}
        <AnimatePresence mode="wait">
          {/* Step 0: Initial Options - UPDATED button spacing */}
          {step === 0 && (
  <motion.div
    key="step0"
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={slideVariants}
    className="space-y-4 sm:space-y-6"
  >
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => handleContactMethod('email')}
      className="w-full bg-indigo-400 text-white py-3 sm:py-4 px-4 rounded-lg text-sm sm:text-base font-medium transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
    >
      Continue with Email
    </motion.button>
    
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => handleContactMethod('mobile')}
      className="w-full bg-gray-100 text-gray-800 py-3 sm:py-4 px-4 rounded-lg text-sm sm:text-base font-medium transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
    >
      Continue with Mobile
    </motion.button>
    
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-4">
      <div className="flex-1 h-px bg-gray-300"></div>
      <div className="text-gray-500 text-xs sm:text-sm px-2">OR</div>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>
    
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      disabled={true}
      onClick={handleGoogleSignup}
      className="w-full flex items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 py-3 sm:py-4 rounded-lg cursor-not-allowed font-medium text-sm sm:text-base"
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Continue with Google
    </motion.button>
    
    <motion.p 
      variants={itemVariants}
      className="text-center text-xs sm:text-sm text-gray-600 mt-4"
    >
      Already have an account?{' '}
      <button 
        onClick={() => navigate('/signin')}
        className="text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
      >
        Sign In
      </button>
    </motion.p>
  </motion.div>
)}

                {/* Step 1: Contact Information */}
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={slideVariants}
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleContinue();
                    }}
                  >
                    <div>
                      <label htmlFor="userName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base ${
                          errors.userName 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {errors.userName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.userName}
                        </motion.p>
                      )}
                    </div>

                  {contactMethod === 'email' && (
  <div>
    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      Email Address <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base ${
          errors.email 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
        placeholder="Enter your email address"
      />
      {isCheckingUser && contactMethod === 'email' && formData.email && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
    {errors.email && (
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm text-red-600"
      >
        {errors.email}
        {errors.email.includes('already registered') && (
          <span className="block text-xs text-blue-600 mt-1">Redirecting to login page...</span>
        )}
      </motion.p>
    )}
  </div>
)}
                  {contactMethod === 'mobile' && (
  <div>
    <label htmlFor="mobile" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
      Mobile Number <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="tel"
        id="mobile"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base ${
          errors.mobile 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-indigo-500'
        }`}
        placeholder="Enter your 10-digit mobile number"
        maxLength="10"
      />
      {isCheckingUser && contactMethod === 'mobile' && formData.mobile && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg className="animate-spin h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
    {errors.mobile && (
      <motion.p 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm text-red-600"
      >
        {errors.mobile}
        {errors.mobile.includes('already registered') && (
          <span className="block text-xs text-blue-600 mt-1">Redirecting to login page...</span>
        )}
      </motion.p>
    )}
  </div>
)}
                    <div className="flex space-x-2 sm:space-x-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 bg-gray-100 text-gray-800 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
              >
                Back
              </motion.button>
<motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </div>
                ) : (
                  'Continue'
                )}
              </motion.button>
                 </div>
               </motion.form>
         
          )}
 
                {/* Step 2: Password and Terms */}
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
                    <div>
                      <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base ${
                            errors.password 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500'
                          }`}
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-200 text-sm sm:text-base${
                            errors.confirmPassword 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-300 focus:ring-indigo-500'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>

                   
                      <label className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span className="text-sm text-gray-600">
          I agree to the{' '}
          <button
            type="button"
            onClick={() => openModal('termsandconditions')}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Terms of Service
          </button>
          {' '}and{' '}
          <button
            type="button"
            onClick={() => openModal('policy')}
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Privacy Policy
          </button>
        </span>
      </label>

      {errors.terms && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs sm:text-sm text-red-600"
        >
          {errors.terms}
        </motion.p>
      )}

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3"
        >
          <p className="text-sm text-red-600">{errors.general}</p>
        </motion.div>
      )}

                    <div className="flex space-x-4">
                    <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setStep(1)}
          className="flex-1 bg-gray-100 text-gray-800 py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
        >
          Back
        </motion.button>
        <AnimatePresence>
        {modalContent && (
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  }}
>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-2 sm:mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {modalContent === 'termsandconditions' ? 'Terms and Conditions' : 'Privacy Policy'}
                </h2>
                <button
  type="button"  // Add this to prevent form submission
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  }}
  className="text-gray-500 hover:text-gray-700 text-2xl"
>
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {renderModalContent()}
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t">
               <button
  type="button"  // Add this to prevent form submission
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  }}
  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
>
  Close
</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </motion.button>
                    </div>
                  </motion.form>
                )}

             
  {step === 3 && (
  <motion.div
    key="step3"
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={slideVariants}
    className="text-center space-y-4 sm:space-y-6"
  >
    <div className="mb-4 sm:mb-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </motion.div>
      
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
        Verify Your Account
      </h3>
      
      <p className="text-sm sm:text-base text-gray-600 px-2">
        We've sent a 6-digit OTP to your {contactMethod === 'email' ? 'email' : 'mobile number'}
      </p>
      
      <p className="text-xs sm:text-sm font-medium text-gray-800 mt-2 break-all">
        {contactMethod === 'email' ? formData.email : formData.mobile}
      </p>
    </div>

    {/* OTP Input Fields - Updated for mobile */}
    <div className="flex justify-center space-x-1 sm:space-x-3 mb-4 sm:mb-6">
      {otp.map((digit, index) => (
        <motion.input
          key={index}
          id={`otp-${index}`}
          type="text"
          maxLength="1"
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          className="w-8 h-8 sm:w-12 sm:h-12 text-center text-sm sm:text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </div>

    {/* Timer Display */}
    <div className="mb-4 sm:mb-6">
      {otpTimer > 0 ? (
        <p className="text-xs sm:text-sm text-gray-600">
          OTP expires in: <span className="font-semibold text-indigo-600">{formatTime(otpTimer)}</span>
        </p>
      ) : (
        <p className="text-xs sm:text-sm text-red-600">
          OTP has expired. Please request a new one.
        </p>
      )}
    </div>

    {/* Action Buttons */}
    <div className="space-y-3 sm:space-y-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={verifyOTP}
        disabled={loading || otp.join('').length !== 6}
        className="w-full bg-indigo-600 text-white py-3 sm:py-4 px-4 rounded-lg text-sm sm:text-base font-medium transition duration-300 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </div>
        ) : (
          'Verify OTP'
        )}
      </motion.button>

      {/* Resend OTP Button */}
      <div className="text-center">
        <span className="text-xs sm:text-sm text-gray-600">Didn't receive the OTP? </span>
        <button
          onClick={handleResendOtp}
          disabled={!canResendOtp || loading}
          className={`text-xs sm:text-sm font-medium transition duration-200 ${
            canResendOtp && !loading
              ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          Resend OTP
        </button>
      </div>
    </div>

    {/* Back Button */}
    <div className="pt-2 sm:pt-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={() => {
          setStep(2);
          setOtp(['', '', '', '', '', '']);
          setOtpTimer(0);
          setCanResendOtp(false);
        }}
        className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition duration-200"
      >
        ← Back to registration
      </motion.button>
    </div>

    {/* Error Display */}
    {errors.general && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-3"
      >
        <p className="text-xs sm:text-sm text-red-600">{errors.general}</p>
      </motion.div>
    )}
  </motion.div>
)}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
        
       
      </div>
    
    </div>
  );
};

export default SignupPage;