import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User } from 'lucide-react';

const ProfilePage = () => {
  // User data from JWT
  const initialUserData = {
    id: 92,
    userName: "9209160713",
    email: "",
    mobile: "9209160713",
    role: ["USER"],
    createdAt: "2025-03-24T00:35:38",
    fullName: "Supriya Deshmukh",
    active: 0,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({...initialUserData});
  const [activeTab, setActiveTab] = useState('Profile Details');
  const [animateProfile, setAnimateProfile] = useState(false);
  const [animateForm, setAnimateForm] = useState(false);
  const [saveAnimation, setSaveAnimation] = useState(false);

  // Initial load animation
  useEffect(() => {
    setAnimateProfile(true);
    const timer = setTimeout(() => {
      setAnimateForm(true);
    }, 300);
    return () => clearTimeout(timer);
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
    setTimeout(() => {
      setUserData(editData);
      setIsEditMode(false);
      setSaveAnimation(false);
    }, 600);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-500">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 transform ${animateProfile ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {/* Profile Header */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-500 shadow-md transition-all duration-500 transform ${animateProfile ? 'scale-100' : 'scale-90'}`}>
                  <img 
                    src={`/profile.avif`} 
                    alt="Profile"
                    className="rounded-full"
                    onError={(e) => {
                      e.target.onError = null; 
                      e.target.src = null;
                      e.target.parentNode.innerHTML = '<User size={36} className="text-indigo-600" />';
                    }}
                  />
                </div>
              </div>
              <div className={`ml-6 flex-1 transition-all duration-500 delay-100 transform ${animateProfile ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}>
                <h1 className="text-2xl font-bold text-gray-900">{userData.fullName}</h1>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-pink-800 transition-all duration-300 hover:bg-pink-200">
                    {userData.role[0]}
                  </span>
                </div>
              </div>
              {!isEditMode ? (
                <button 
                  onClick={handleEditClick}
                  className={`absolute top-6 right-6 p-2 text-gray-500 hover:text-indigo-600 transition-all duration-300 hover:bg-indigo-50 rounded-full transform hover:scale-110 ${animateProfile ? 'opacity-100' : 'opacity-0'}`}
                  aria-label="Edit profile"
                >
                  <Edit2 size={20} />
                </button>
              ) : (
                <button 
                  onClick={handleCloseEdit}
                  className="absolute top-6 right-6 p-2 text-gray-500 hover:text-red-600 transition-all duration-300 hover:bg-red-50 rounded-full transform hover:scale-110"
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
                  onClick={() => setActiveTab('Profile Details')}
                  className={`${
                    activeTab === 'Profile Details'
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
          {activeTab === 'Profile Details' && (
            <div className={`p-6 transition-all duration-500 ${animateForm ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
              {!isEditMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transition-all duration-300 delay-100 hover:bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="mt-1 text-sm text-gray-900">{userData.fullName}</p>
                  </div>
                  <div className="transition-all duration-300 delay-200 hover:bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900">{userData.email || "Not Provided"}</p>
                  </div>
                  <div className="transition-all duration-300 delay-300 hover:bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                    <p className="mt-1 text-sm text-gray-900">{userData.mobile}</p>
                  </div>
                  <div className="transition-all duration-300 delay-400 hover:bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                    <p className="mt-1 text-sm text-gray-900">{userData.userName}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-300 delay-100 transform hover:translate-y-1">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        value={editData.fullName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 delay-200 transform hover:translate-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 delay-300 transform hover:translate-y-1">
                      <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
                      <input
                        type="text"
                        name="mobile"
                        id="mobile"
                        value={editData.mobile}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                      />
                    </div>
                    <div className="transition-all duration-300 delay-400 transform hover:translate-y-1">
                      <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        name="userName"
                        id="userName"
                        value={editData.userName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleSaveChanges}
                      disabled={saveAnimation}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 ${saveAnimation ? 'animate-pulse' : ''}`}
                    >
                      <Save className={`mr-2 -ml-1 h-4 w-4 transition-transform duration-500 ${saveAnimation ? 'rotate-180' : ''}`} />
                      {saveAnimation ? 'Saving...' : 'Save Changes'}
                    </button>
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