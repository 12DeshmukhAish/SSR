import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, Shield, Calendar, Phone, Mail, CheckCircle, XCircle, Loader2, Key } from 'lucide-react';

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

  // Function to get current user ID from localStorage or JWT token
  const getCurrentUserId = () => {
    try {
      // Option 1: Check if user ID is stored directly in localStorage
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        return storedUserId;
      }

      // Option 2: Decode JWT token to get user ID
      const jwtToken = localStorage.getItem('authToken');
      if (jwtToken) {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        return payload.userId || payload.sub || payload.id;
      }

      // Option 3: Return null if no user ID found
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
        
        // Get current user ID
        const userId = getCurrentUserId();
        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }
        
        setCurrentUserId(userId);
        const jwtToken = localStorage.getItem('authToken');
        
        const response = await fetch(`https://24.101.103.87:8082/api/auth/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format data to match our component needs
        const formattedData = {
          id: data.id || 'N/A',
          userName: data.username || 'N/A',
          email: data.email || 'N/A',
          mobile: data.mobile || 'N/A',
          role: data.authorities ? data.authorities.map(auth => auth.authority.replace('ROLE_', '')) : ['N/A'],
          createdAt: data.createdAt || 'N/A',
          fullName: data.fullName || 'N/A',
          active: data.active !== undefined ? data.active : 'N/A'
        };
        
        setUserData(formattedData);
        setEditData({...formattedData});
        setIsLoading(false);
        
        // Start animations after data is loaded
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
        
        // Use fallback data if API fails - all N/A
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
        
        // Start animations even with fallback data
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

  const handleSaveChanges = async () => {
    setSaveAnimation(true);
    
    try {
      const jwtToken = localStorage.getItem('authToken');
      
      // Make API call to update profile
      const response = await fetch(`https://24.101.103.87:8082/api/auth/user/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: editData.fullName,
          email: editData.email,
          mobile: editData.mobile,
          username: editData.userName
        })
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      // Update successful
      setUserData(editData);
      setIsEditMode(false);
      setSaveAnimation(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveAnimation(false);
      setError('Failed to update profile. Please try again.');
      
      // Reset error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
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

  const handleResetPassword = () => {
    // Navigate to reset password page
    window.location.href = '/reset-password';
  };

  // Format date to be more readable
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
          <Loader2 size={48} className="text-indigo-600 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 transition-all duration-500 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {saveSuccess && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md flex items-center animate-fadeIn">
            <CheckCircle size={20} className="mr-2" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md flex items-center animate-fadeIn">
            <XCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-700 transform ${animateProfile ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Profile Header with Gradient */}
          <div className="relative p-8 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className={`w-24 h-24 rounded-full bg-white p-1 flex items-center justify-center shadow-lg transition-all duration-700 transform ${animateProfile ? 'scale-100' : 'scale-90'}`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white">
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
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-800 bg-opacity-30 text-white border border-indigo-300 transition-all duration-300 hover:bg-indigo-700 mr-2 mb-2">
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
                <div className="mt-2 text-indigo-100 flex items-center justify-center sm:justify-start">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-sm">Joined: {formatDate(userData?.createdAt)}</span>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="absolute top-6 right-6 flex gap-2">
                {!isEditMode ? (
                  <>
                    <button 
                      onClick={handleEditClick}
                      className={`p-2 text-white hover:text-indigo-200 transition-all duration-300 hover:bg-indigo-700 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                      aria-label="Edit profile"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={handleResetPassword}
                      className={`p-2 text-white hover:text-yellow-200 transition-all duration-300 hover:bg-yellow-600 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                      aria-label="Reset password"
                    >
                      <Key size={20} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleCloseEdit}
                    className="p-2 text-white hover:text-red-200 transition-all duration-300 hover:bg-red-500 rounded-full transform hover:scale-110"
                    aria-label="Cancel edit"
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
                      ? 'border-indigo-500 text-indigo-600'
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
              {!isEditMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <User size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Full Name</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.fullName || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Mail size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Email</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.email || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Phone size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Mobile</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.mobile || "N/A"}</p>
                  </div>
                  
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-300 transform hover:translate-y-1">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={editData?.fullName === 'N/A' ? '' : editData?.fullName || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="transition-all duration-300 transform hover:translate-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="your@email.com"
                          value={editData?.email === 'N/A' ? '' : editData?.email || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="transition-all duration-300 transform hover:translate-y-1">
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="mobile"
                          id="mobile"
                          value={editData?.mobile === 'N/A' ? '' : editData?.mobile || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={saveAnimation}
                      className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 ${saveAnimation ? 'opacity-80' : ''}`}
                    >
                      {saveAnimation ? (
                        <>
                          <Loader2 className="mr-2 -ml-1 h-5 w-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 -ml-1 h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Additional card with meta information */}
        <div className={`mt-6 bg-white rounded-xl shadow-lg p-6 transition-all duration-700 delay-300 transform ${animateProfile ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                User ID: {userData?.id || 'N/A'}
              </span> */}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                Member since {formatDate(userData?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;