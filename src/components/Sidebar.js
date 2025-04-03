import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { FaCalculator, FaCreditCard } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";
import { GoGraph } from "react-icons/go";
import { MdHome } from "react-icons/md";

const MenuItem = ({ icon: Icon, label, path, isActive, isCollapsed }) => {
  const itemClasses = `
    flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 cursor-pointer
    ${isActive ? 'text-white bg-blue-600' : 'text-white hover:bg-gray-700'}
    transition-colors duration-200 rounded-md mx-2
  `;
  return (
    <Link to={path} className={itemClasses}>
      <Icon size={24} />
      {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isPathActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <>
      {/* Fixed Sidebar */}
      <div
        className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col fixed top-0 left-0 z-30 shadow-lg`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        {/* Logo Section */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-4 mb-2 border-b border-gray-700`}>
          <img src="/logo.png" alt="SSR Logo" className="w-12 h-12" />
          {!isCollapsed && <span className="text-xl font-bold">SSR</span>}
        </div>
        
        {/* Navigation Menu - with scrollable area */}
        <div className="flex-1 flex flex-col overflow-y-auto py-2 space-y-1">
          <MenuItem
            icon={MdHome}
            label="Dashboard"
            path="/dashboard"
            isActive={isPathActive('/dashboard')}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            icon={FaCalculator}
            label="My Work"
            path="/mywork"
            isActive={isPathActive('/mywork')}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            icon={FaCalculator}
            label="Estimate"
            path="/estimate"
            isActive={isPathActive('/estimate')}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            icon={IoIosDocument}
            label="My Template"
            path="/my-template"
            isActive={isPathActive('/my-template')}
            isCollapsed={isCollapsed}
          />
          <MenuItem
            icon={GoGraph}
            label="Market Place"
            path="/market-place"
            isActive={isPathActive('/market-place')}
            isCollapsed={isCollapsed}
          />
          
          {/* Credit Section - now part of the menu */}
          <div className={`${isCollapsed ? 'mx-2 items-center' : 'mx-2'} mt-4 py-3 rounded-md bg-gray-700 flex flex-col ${isCollapsed ? 'items-center' : 'px-4'}`}>
            {!isCollapsed ? (
              <>
                <div className="font-medium text-sm text-gray-300">Available Credit</div>
                <div className="text-lg font-bold">₹1,00,000</div>
                <button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2">
                  <span>Buy Credit</span>
                </button>
              </>
            ) : (
              <FaCreditCard size={24} className="mb-1 text-gray-300" />
            )}
          </div>
          
          {/* Logout - now part of the menu */}
          <MenuItem
            icon={LogOut}
            label="Logout"
            path="/logout"
            isActive={isPathActive('/logout')}
            isCollapsed={isCollapsed}
          />
        </div>
      </div>
      
      {/* This div creates space for the main content */}
      <div className={`${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Your main content will go here */}
      </div>
    </>
  );
};

export default Sidebar;