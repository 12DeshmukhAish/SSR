import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { VscBellDot } from "react-icons/vsc";
import { HiMiniUserCircle } from "react-icons/hi2";
import { FaBell,FaWallet  } from "react-icons/fa";
import { toast } from 'react-toastify';


const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user information on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserName) {
      setUserName(storedUserName);
    }
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle Sign Out - updated to match login implementation
  const handleSignOut = () => {
    try {
      // Clear all authentication data stored during login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      
      // Show success toast
      toast.success('Signed out successfully!', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
      
      // Redirect to sign-in page
      navigate('/signin');
    } catch (error) {
      // Handle any errors during sign out
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: "colored"
      });
    }
  };

  // Navigate to settings page
  const navigateToSettings = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  // Navigate to credits page
  const navigateToCredits = () => {
    navigate('/credits');
    setShowDropdown(false);
  };

  return (
    <header className="flex items-center justify-between w-full bg-white px-4 py-2 shadow-sm">
      <div>
        <h1 className="text-xl font-medium">Welcome {userEmail || 'User'}</h1>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3">
        <div className="flex items-center">
        <div className="bg-gray-100 px-3 py-1 rounded-md flex items-center gap-2">
  <FaWallet className="w-6 h-6 text-gray-800" />
  {/* <span className="font-medium">₹11,225</span> */}
</div>
          <div className="mr-2">
            <div className="relative">
              <FaBell className="w-6 h-6 text-gray-800"/>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </div>
          </div>
        

        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            className="hover:bg-gray-100 rounded-full flex items-center"
            onClick={toggleDropdown}
          >
            <HiMiniUserCircle className="w-8 h-8 text-gray-800" />
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {userName && (
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                    Signed in as <span className="font-medium">{userName}</span>
                  </div>
                )}
                <button 
                  onClick={navigateToSettings}
                  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <button 
                  onClick={navigateToCredits}
                  className="w-full text-left block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Credits
                </button>
                <div className="border-t border-gray-200"></div>
                <button 
                  onClick={handleSignOut}
                  className="w-full text-left block px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;