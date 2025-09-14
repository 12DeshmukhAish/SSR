import React from 'react';
import { X, Info } from 'lucide-react';

const AboutUsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white hover:text-orange-100 transition-colors duration-200 p-1 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Info size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">About myBOQ</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <h2 className="font-semibold text-gray-800 mb-3">myBOQ Version: 1.1.0 (August 2025) 64-bit Windows</h2>
              <p className="text-sm text-gray-600">©2025 myBOQ Software, Incorporated and its licensors. All rights reserved.</p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsModal;