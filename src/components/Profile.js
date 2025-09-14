import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, Shield, Calendar, Phone, Mail, CheckCircle, XCircle, Loader2, Key, Eye, EyeOff, Lock } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [animateProfile, setAnimateProfile] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Reset Password States
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Za-z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Function to get current user ID from localStorage or JWT token
  const getCurrentUserId = () => {
    try {
      const storedUid = localStorage.getItem('uid');
      if (storedUid && storedUid !== localStorage.getItem('username')) {
        console.log('Found uid in localStorage:', storedUid);
        return storedUid;
      }

      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('id');
      if (storedUserId && storedUserId !== localStorage.getItem('username')) {
        console.log('Found userId in localStorage:', storedUserId);
        return storedUserId;
      }

      const jwtToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          console.log('JWT Payload:', payload);
          
          const possibleIds = [
            payload.userId, 
            payload.id, 
            payload.uid,
            payload.sub
          ];
          
          for (const id of possibleIds) {
            if (id && id !== payload.username && !isNaN(id)) {
              console.log('Found numeric ID in JWT:', id);
              return id.toString();
            }
          }
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
      }

      const storedUserData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.id && userData.id !== userData.username) {
            console.log('Found ID in stored user data:', userData.id);
            return userData.id.toString();
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }

      console.error('No valid numeric user ID found');
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        const userId = getCurrentUserId();
        console.log('Retrieved User ID:', userId);
        
        const jwtToken = localStorage.getItem('authToken') || 
                         localStorage.getItem('token') || 
                         localStorage.getItem('accessToken');
        
        console.log('JWT Token exists:', !!jwtToken);
        
        if (!jwtToken) {
          throw new Error('Authentication token not found. Please login again.');
        }

        let response;
        let apiUrl;
        
        const endpointsToTry = [];
        
        if (userId && userId !== localStorage.getItem('username')) {
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${userId}`);
        }
        
        const username = localStorage.getItem('username') || userData?.userName;
        if (username) {
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/username/${username}`);
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${username}`);
        }
        
        endpointsToTry.push(`${API_BASE_URL}/api/auth/user/current`);
        endpointsToTry.push(`${API_BASE_URL}/api/auth/me`);
        
        let lastError;
        
        for (const endpoint of endpointsToTry) {
          try {
            console.log('Trying API URL:', endpoint);
            
            response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log('API Response Status:', response.status);
            
            if (response.ok) {
              apiUrl = endpoint;
              break;
            } else if (response.status === 401) {
              lastError = new Error('Authentication failed. Please login again.');
            } else if (response.status === 403) {
              lastError = new Error('Access forbidden. You do not have permission to view this profile.');
            } else if (response.status === 404) {
              lastError = new Error('User not found.');
              continue;
            } else {
              lastError = new Error(`API error: ${response.status}`);
            }
          } catch (fetchError) {
            console.error('Fetch error for endpoint:', endpoint, fetchError);
            lastError = fetchError;
            continue;
          }
        }
        
        if (!response || !response.ok) {
          throw lastError || new Error('All API endpoints failed');
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (data.id && data.id !== data.username) {
          setCurrentUserId(data.id.toString());
          localStorage.setItem('uid', data.id.toString());
        }
        
        const formattedData = {
          id: data.id || 'N/A',
          userName: data.username || 'N/A',
          email: data.email || 'N/A',
          mobile: data.mobile || 'N/A',
          role: data.authorities ? data.authorities.map(auth => auth.authority.replace('ROLE_', '')) : ['N/A'],
          createdAt: data.createdAt || 'N/A',
          fullName: data.fullName || 'N/A',
          active: data.active !== undefined ? (data.active === 1 || data.active === true) : 'N/A'
        };
        
        console.log('Formatted User Data:', formattedData);
        
        setUserData(formattedData);
        setEditData({...formattedData});
        setIsLoading(false);
        
        setTimeout(() => {
          setAnimateProfile(true);
          setTimeout(() => {
            setAnimateForm(true);
          }, 300);
        }, 100);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
        setIsLoading(false);
        
        if (err.message.includes('Authentication') || err.message.includes('login')) {
          return;
        }
        
        const fallbackData = {
          id: 'N/A',
          userName: 'N/A',
          email: 'N/A',
          mobile: 'N/A',
          role: ['N/A'],
          createdAt: 'N/A',
          fullName: 'N/A',
          active: 'N/A'
        };
        
        setUserData(fallbackData);
        setEditData({...fallbackData});
        
        setTimeout(() => {
          setAnimateProfile(true);
          setTimeout(() => {
            setAnimateForm(true);
          }, 300);
        }, 100);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData({
      ...resetPasswordData,
      [name]: value
    });

    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: null
      });
    }

    if (name === 'newPassword') {
      const errors = validatePassword(value);
      setPasswordErrors({
        ...passwordErrors,
        newPassword: errors.length > 0 ? errors : null
      });
    }

    if (name === 'confirmPassword') {
      if (value !== resetPasswordData.newPassword) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: ['Passwords do not match']
        });
      } else {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: null
        });
      }
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const handleSaveChanges = async () => {
    setSaveAnimation(true);
    
    try {
      const jwtToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('token') || 
                       localStorage.getItem('accessToken');
      
      if (!jwtToken) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          fullName: editData.fullName,
          email: editData.email,
          mobile: editData.mobile
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access forbidden. You do not have permission to update this profile.');
        } else {
          throw new Error(`Update failed: ${response.status}`);
        }
      }
      
      setUserData(editData);
      setIsEditMode(false);
      setSaveAnimation(false);
      showToast('Profile updated successfully!', 'success');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveAnimation(false);
      showToast(error.message, 'error');
    }
  };

  const handleEditClick = () => {
    setAnimateForm(false);
    setTimeout(() => {
      setEditData({...userData});
      setIsEditMode(true);
      setAnimateForm(true);
    }, 300);
  };

  const handleCloseEdit = () => {
    setAnimateForm(false);
    setTimeout(() => {
      setIsEditMode(false);
      setAnimateForm(true);
    }, 300);
  };

  const handleResetPasswordClick = () => {
    setShowResetPassword(true);
    setResetPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handleCloseResetPassword = () => {
    setShowResetPassword(false);
    setResetPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleResetPassword = async () => {
    const errors = {};
    
    if (!resetPasswordData.currentPassword) {
      errors.currentPassword = ['Current password is required'];
    }
    
    const newPasswordErrors = validatePassword(resetPasswordData.newPassword);
    if (newPasswordErrors.length > 0) {
      errors.newPassword = newPasswordErrors;
    }
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }
    
    if (!resetPasswordData.confirmPassword) {
      errors.confirmPassword = ['Please confirm your new password'];
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsResettingPassword(true);
    
    try {
      const jwtToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('token') || 
                       localStorage.getItem('accessToken');
      
      if (!jwtToken) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: userData.userName,
          currentPassword: resetPasswordData.currentPassword,
          newPassword: resetPasswordData.newPassword
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed or current password is incorrect.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update password');
        }
      }
      
      setIsResettingPassword(false);
      setShowResetPassword(false);
      showToast('Password updated successfully!', 'success');
      
      setResetPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
      
    } catch (error) {
      console.error('Error updating password:', error);
      setIsResettingPassword(false);
      
      if (error.message.includes('current password') || error.message.includes('Authentication')) {
        setPasswordErrors({
          currentPassword: ['Current password is incorrect']
        });
      } else {
        showToast(error.message, 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <Loader2 size={48} className="text-orange-600 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 transition-all duration-500 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${toast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`rounded-lg shadow-lg p-4 flex items-center space-x-3 ${
              toast.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-400' 
                : 'bg-red-50 border-l-4 border-red-400'
            }`}>
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className={`ml-auto flex-shrink-0 rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  toast.type === 'success' 
                    ? 'text-green-500 hover:bg-green-200 focus:ring-green-600' 
                    : 'text-red-500 hover:bg-red-200 focus:ring-red-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center animate-fadeIn">
            <XCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-700 transform ${animateProfile ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Profile Header with Orange Gradient */}
          <div className="relative p-8 bg-gradient-to-r from-orange-500 to-red-500">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className={`w-24 h-24 rounded-full bg-white p-1 flex items-center justify-center shadow-lg transition-all duration-700 transform ${animateProfile ? 'scale-100' : 'scale-90'}`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center overflow-hidden border-4 border-white">
                    {userData?.fullName && userData.fullName !== 'N/A' ? (
                      <span className="text-white text-2xl font-bold">
                        {userData.fullName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User size={32} className="text-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className={`sm:ml-6 flex-1 text-center sm:text-left transition-all duration-700 delay-200 transform ${animateProfile ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{userData?.fullName || 'N/A'}</h1>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start">
                  {userData?.role?.map((role, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-800 bg-opacity-30 text-white border border-orange-300 transition-all duration-300 hover:bg-orange-700 mr-2 mb-2">
                      <Shield size={14} className="mr-1" />
                      {role}
                    </span>
                  ))}
                  {userData?.active !== 'N/A' && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 transition-all duration-300 ${userData?.active ? 'bg-green-500 bg-opacity-30 text-white border border-green-300 hover:bg-green-400' : 'bg-red-500 bg-opacity-30 text-white border border-red-300 hover:bg-red-400'}`}>
                      {userData?.active ? (
                        <>
                          <CheckCircle size={14} className="mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-orange-100 flex items-center justify-center sm:justify-start">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-sm">Joined: {formatDate(userData?.createdAt)}</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="absolute top-6 right-6 flex gap-2">
                {!isEditMode && !showResetPassword ? (
                  <>
                    {/* <button 
                      onClick={handleEditClick}
                      className={`p-2 text-white hover:text-orange-200 transition-all duration-300 hover:bg-orange-700 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                      aria-label="Edit profile"
                    >
                      <Edit2 size={20} />
                    </button> */}
                    <button 
                      onClick={handleResetPasswordClick}
                      className={`p-2 text-white hover:text-yellow-200 transition-all duration-300 hover:bg-yellow-600 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                      aria-label="Reset password"
                    >
                      <Key size={20} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={showResetPassword ? handleCloseResetPassword : handleCloseEdit}
                    className="p-2 text-white hover:text-red-200 transition-all duration-300 hover:bg-red-500 rounded-full transform hover:scale-110"
                    aria-label="Cancel"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('Profile')}
                  className={`${
                    activeTab === 'Profile'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300`}
                >
                  Profile Details
                </button>
              </nav>
            </div>
          </div>

          {/* Profile Content */}
          {activeTab === 'Profile' && (
            <div className={`p-8 transition-all duration-700 ${animateForm ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              {showResetPassword ? (
                // Reset Password Form
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Lock size={24} className="text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-600 mt-2">Update your account password</p>
                  </div>

                  <div className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          id="currentPassword"
                          value={resetPasswordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className={`pl-10 pr-10 block w-full border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300 ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.current ? (
                            <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <div className="mt-1 text-sm text-red-600">
                          {passwordErrors.currentPassword.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          id="newPassword"
                          value={resetPasswordData.newPassword}
                          onChange={handlePasswordInputChange}
                          className={`pl-10 pr-10 block w-full border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300 ${passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.new ? (
                            <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <div className="mt-1 text-sm text-red-600">
                          {passwordErrors.newPassword.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Password must be at least 8 characters with letters, numbers, and special characters.
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          id="confirmPassword"
                          value={resetPasswordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className={`pl-10 pr-10 block w-full border rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300 ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye size={16} className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <div className="mt-1 text-sm text-red-600">
                          {passwordErrors.confirmPassword.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseResetPassword}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={isResettingPassword}
                        className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105 ${isResettingPassword ? 'opacity-80' : ''}`}
                      >
                        {isResettingPassword ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Key className="mr-2 h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : !isEditMode ? (
                // Profile Display Mode
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <User size={20} className="text-orange-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Full Name</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.fullName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Mail size={20} className="text-orange-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Email</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.email || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Phone size={20} className="text-orange-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Mobile</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.mobile || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-sm border border-orange-100 transition-all duration-300 hover:shadow-md hover:border-orange-200">
                    <div className="flex items-center mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar size={20} className="text-orange-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Member Since</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{formatDate(userData?.createdAt)}</p>
                  </div>
                </div>
              ) : (
                // Profile Edit Mode
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Edit2 size={24} className="text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                    <p className="text-gray-600 mt-2">Update your profile information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={editData?.fullName || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={editData?.email || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div>
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          id="mobile"
                          value={editData?.mobile || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all duration-300"
                          placeholder="Enter your mobile number"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                      <button
                        type="button"
                        onClick={handleCloseEdit}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveChanges}
                        disabled={saveAnimation}
                        className={`flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 transform hover:scale-105 ${saveAnimation ? 'opacity-80' : ''}`}
                      >
                        {saveAnimation ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;