import React, { useState } from 'react';
import { X, Phone, CheckCircle, AlertCircle, Mail, Send, Upload, FileText, Image, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

// JWT Token helper function (optional for this endpoint)
const getJwtToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('jwt') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('jwtToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('jwt') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('jwtToken');
};

const ContactModal = ({ isOpen = false, onClose, apiEndpoint = '/submit' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external isOpen prop or internal state
  const modalIsOpen = isOpen || internalIsOpen;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setAttachment(null);
      return;
    }

    // Check file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 2MB');
      e.target.value = '';
      return;
    }

    // Check file type (images and PDFs only)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only image files (JPEG, PNG, GIF, WebP) and PDF files are allowed');
      e.target.value = '';
      return;
    }

    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    const fileInput = document.getElementById('attachment');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image size={20} className="text-blue-600" />;
    } else if (file.type === 'application/pdf') {
      return <FileText size={20} className="text-red-600" />;
    }
    return <FileText size={20} className="text-gray-600" />;
  };

  const validateForm = () => {
    const { name, email, message } = formData;

    if (!name.trim()) {
      alert('Please enter your name');
      return false;
    }

    if (!email.trim()) {
      alert('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!message.trim()) {
      alert('Please enter your message');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);
    setApiResponse(null);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      
      // Add attachment if present (FormData handles this)
      if (attachment) {
        formDataToSend.append('attachment', attachment);
      }

      // Build query string for URL parameters
      const queryParams = new URLSearchParams({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'Contact Form Submission',
        message: formData.message.trim()
      });

      // Construct the full API URL
      let fullApiUrl;
      if (apiEndpoint.startsWith('http')) {
        fullApiUrl = `${apiEndpoint}?${queryParams.toString()}`;
      } else {
        const baseUrl = API_BASE_URL || 'https://24.101.103.87:8082';
        const cleanEndpoint = apiEndpoint.startsWith('/') ? apiEndpoint : `/${apiEndpoint}`;
        fullApiUrl = `${baseUrl}${cleanEndpoint}?${queryParams.toString()}`;
      }

      console.log('Making API call to:', fullApiUrl);

      // Prepare headers - Remove JWT and credentials for CORS compatibility
      const headers = {
        'Accept': 'application/json, text/plain, */*'
        // Don't set Content-Type for FormData - browser will set it with boundary
        // Don't include Authorization header unless specifically required
      };

      // Optional: Include JWT token only if available and needed
      const jwtToken = getJwtToken();
      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const response = await fetch(fullApiUrl, {
        method: 'POST',
        headers: headers,
        body: formDataToSend,
        // Remove credentials: 'include' to fix CORS issue
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle different response scenarios
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (response.status === 403) {
        throw new Error('Access forbidden. You don\'t have permission to perform this action.');
      }

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage += ` - ${errorText}`;
          }
        } catch (e) {
          console.warn('Could not read error response text');
        }
        throw new Error(errorMessage);
      }

      // Parse response
      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Handle non-JSON responses (plain text, HTML, etc.)
        const textResponse = await response.text();
        console.log('Non-JSON response received:', textResponse);
        
        // Create a success object for non-JSON responses
        result = {
          success: true,
          message: textResponse || 'Form submitted successfully!',
          timestamp: new Date().toISOString()
        };
      }

      console.log('API Response:', result);
      
      // Handle successful submission
      if (result.success !== false) {
        setApiResponse({
          ...result,
          message: result.message || 'Thank you for contacting myBOQ. Your request has been submitted successfully.',
          timestamp: result.timestamp || new Date().toISOString()
        });
        setSubmitStatus('success');
        
        // Clear form data
        setFormData({ name: '', email: '', subject: '', message: '' });
        setAttachment(null);
        
        // Clear file input
        const fileInput = document.getElementById('attachment');
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Auto-close modal after 5 seconds
        setTimeout(() => {
          closeModal();
        }, 5000);
      } else {
        throw new Error(result.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = error.message;
      let errorAction = null;

      // Determine error type and provide specific guidance
      if (error.message.includes('Authentication') || error.message.includes('401')) {
        errorAction = 'LOGIN_REQUIRED';
        errorMessage = 'Authentication may be required. Please try logging in first.';
      } else if (error.message.includes('CORS') || error.message.includes('Access to fetch')) {
        errorAction = 'CORS_ERROR';
        errorMessage = 'Network configuration issue. The server may need to update CORS settings.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorAction = 'NETWORK_ERROR';
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        errorAction = 'PERMISSION_DENIED';
        errorMessage = 'You don\'t have permission to submit this form.';
      } else if (error.message.includes('500')) {
        errorAction = 'SERVER_ERROR';
        errorMessage = 'Server error occurred. Please try again later.';
      }

      setSubmitStatus('error');
      setApiResponse({ 
        message: errorMessage,
        action: errorAction,
        originalError: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }

    setSubmitStatus(null);
    setApiResponse(null);
  };

  const openModal = () => {
    setInternalIsOpen(true);
  };

  return (
    <div className="relative">
      {/* Floating Contact Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
            title="Contact Support"
          >
            <div className="relative">
              <Phone size={24} className="group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-auto max-h-[95vh] flex flex-col transform transition-all duration-300 animate-slideUp">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Contact myBOQ Support</h2>
                    <p className="text-blue-100 text-sm">We're here to help you!</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-8 animate-fadeIn">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 mb-2">
                    Request Submitted Successfully!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {apiResponse?.message || 'Thank you for contacting myBOQ. Your request has been submitted successfully.'}
                  </p>
                  
                  {apiResponse?.ticketId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-green-800 font-medium">Ticket ID:</span>
                        <span className="font-mono text-green-900 font-bold text-lg">{apiResponse.ticketId}</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Please save this ticket ID for future reference
                      </p>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <Send size={16} className="mr-2" />
                      What happens next:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">📧</span>
                        {apiResponse?.emailStatus?.userEmailSent ? 
                          'Confirmation email sent to your inbox' : 
                          'Confirmation email will be sent shortly'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">🔔</span>
                        {apiResponse?.emailStatus?.adminEmailSent ? 
                          'Our support team has been notified' : 
                          'Our support team will be notified'
                        }
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">👩‍💼</span>
                        We'll review your inquiry shortly
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">📞</span>
                        Response within 24-48 hours
                      </li>
                    </ul>
                  </div>

                  {apiResponse?.timestamp && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <p>📅 Submitted at: {new Date(apiResponse.timestamp).toLocaleString()}</p>
                      <p className="mt-1">This window will close automatically in a few seconds...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Connection Status Indicator */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-blue-800">
                        Ready to submit to: {API_BASE_URL || 'https://24.101.103.87:8082'}{apiEndpoint}
                      </span>
                    </div>
                    {getJwtToken() && (
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-green-800">Authentication token available</span>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Brief subject of your inquiry (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      placeholder="Tell us about your requirements, questions, or how we can help you with BOQ estimations..."
                      required
                    />
                  </div>

                  {/* File Attachment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attachment <span className="text-gray-500">(Optional - Max 2MB)</span>
                    </label>
                    
                    {!attachment ? (
                      <div className="relative">
                        <input
                          type="file"
                          id="attachment"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            Images (JPEG, PNG, GIF, WebP) or PDF files only
                          </p>
                          <p className="text-xs text-gray-500">Maximum file size: 2MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(attachment)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove attachment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Message */}
                  {submitStatus === 'error' && (
                    <div className="flex items-center text-red-600 text-sm bg-red-50 border border-red-200 p-4 rounded-lg">
                      <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">Failed to submit your request</p>
                        <p className="text-xs mt-1">
                          {apiResponse?.message || 'Please try again or contact us directly at support@myboq.in'}
                        </p>
                        
                        {/* Technical Details for debugging */}
                        {(apiResponse?.action === 'CORS_ERROR' || apiResponse?.action === 'NETWORK_ERROR') && (
                          <div className="mt-2 text-xs text-gray-600">
                            <p>🔧 Technical Details:</p>
                            <ul className="list-disc list-inside ml-2">
                              <li>API URL: {API_BASE_URL || 'https://24.101.103.87:8082'}{apiEndpoint}</li>
                              <li>Request Method: POST with FormData</li>
                              <li>CORS Mode: Enabled</li>
                              <li>Credentials: Not included (fixed CORS issue)</li>
                            </ul>
                          </div>
                        )}
                        
                        {apiResponse?.originalError && (
                          <div className="mt-2 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer">Technical Details</summary>
                              <p className="mt-1 font-mono bg-gray-100 p-2 rounded text-xs">
                                {apiResponse.originalError}
                              </p>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer - Fixed at bottom */}
            {submitStatus !== 'success' && (
              <div className="flex-shrink-0 p-6 pt-0">
                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} className="mr-2" />
                      Send to Support Team
                    </>
                  )}
                </button>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-gray-200 mt-4">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p className="flex items-center justify-center">
                      <span className="mr-2">🔒</span>
                      Your information is secure and confidential
                    </p>
                    <p className="flex items-center justify-center">
                      <span className="mr-2">📧</span>
                      You'll receive a confirmation email instantly
                    </p>
                    <p className="flex items-center justify-center">
                      <span className="mr-2">📎</span>
                      Attachments limited to 2MB • Public contact form
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        /* Custom scrollbar for modal body */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default ContactModal;