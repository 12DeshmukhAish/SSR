import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, Shield, Calendar, Phone, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
   const jwtToken = localStorage.getItem('authToken');
        
        const response = await fetch('https://24.101.103.87:8082/api/auth/user/92', {
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
          id: data.id,
          userName: data.username,
          email: data.email,
          mobile: data.mobile,
          role: data.authorities.map(auth => auth.authority.replace('ROLE_', '')),
          createdAt: data.createdAt,
          fullName: data.fullName,
          active: data.active
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
        
        // Use fallback data if API fails
        const fallbackData = {
          id: 92,
          userName: "9209160612",
          email: "",
          mobile: "9209160612",
          role: ["USER"],
          createdAt: "2025-03-24T00:35:38",
          fullName: "Aishwarya",
          active: 1
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

  const handleSaveChanges = () => {
    setSaveAnimation(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setUserData(editData);
      setIsEditMode(false);
      setSaveAnimation(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
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

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  // Error state
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-center mb-4">
            <XCircle size={48} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-all duration-300"
          >
            Try Again
          </button>
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
        
        <div className={`bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-700 transform ${animateProfile ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Profile Header with Gradient */}
          <div className="relative p-8 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className={`w-24 h-24 rounded-full bg-white p-1 flex items-center justify-center shadow-lg transition-all duration-700 transform ${animateProfile ? 'scale-100' : 'scale-90'}`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-indigo-500 flex items-center justify-center overflow-hidden border-4 border-white">
                    {userData?.fullName ? (
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{userData?.fullName}</h1>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start">
                  {userData?.role?.map((role, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-800 bg-opacity-30 text-white border border-indigo-300 transition-all duration-300 hover:bg-indigo-700 mr-2 mb-2">
                      <Shield size={14} className="mr-1" />
                      {role}
                    </span>
                  ))}
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
                </div>
                <div className="mt-2 text-indigo-100 flex items-center justify-center sm:justify-start">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-sm">Joined: {formatDate(userData?.createdAt)}</span>
                </div>
              </div>
              {!isEditMode ? (
                <button 
                  onClick={handleEditClick}
                  className={`absolute top-6 right-6 p-2 text-white hover:text-indigo-200 transition-all duration-300 hover:bg-indigo-700 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                  aria-label="Edit profile"
                >
                  <Edit2 size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleCloseEdit}
                  className="absolute top-6 right-6 p-2 text-white hover:text-red-200 transition-all duration-300 hover:bg-red-500 rounded-full transform hover:scale-110"
                  aria-label="Cancel edit"
                >
                  <X size={20} />
                </button>
              )}
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
                    <p className="text-gray-700 font-medium">{userData?.fullName || "Not Provided"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Mail size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Email</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.email || "Not Provided"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Phone size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Mobile</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.mobile || "Not Provided"}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <User size={20} className="text-indigo-600" />
                      </div>
                      <h3 className="ml-3 text-lg font-medium text-gray-800">Username</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{userData?.userName || "Not Provided"}</p>
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
                          value={editData?.fullName || ''}
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
                          value={editData?.email || ''}
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
                          value={editData?.mobile || ''}
                          onChange={handleInputChange}
                          className="pl-10 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-300"
                        />
                      </div>
                    </div>
                    
                    <div className="transition-all duration-300 transform hover:translate-y-1">
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="userName"
                          id="userName"
                          value={editData?.userName || ''}
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                User ID: {userData?.id}
              </span>
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