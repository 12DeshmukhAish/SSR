import React, { useState, useEffect } from 'react';
import { FaDownload, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaCopy, FaRocket, FaPlay } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { BsWindows, BsApple, BsGlobe } from 'react-icons/bs';

const SSLCertificateInstallation = ({ 
  isOpen = true, 
  onClose = () => {}, 
  onRetry = () => {}
}) => {
  const [selectedOS, setSelectedOS] = useState('windows');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [showCertContent, setShowCertContent] = useState(false);
  const [autoInstallMode, setAutoInstallMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoInstalling, setIsAutoInstalling] = useState(false);

  // Your actual certificate content
  const certificateContent = `-----BEGIN CERTIFICATE-----
MIID3zCCAsegAwIBAgIUVDG2GWJbpcwWvUwengCrCgXOFTcwDQYJKoZIhvcNAQEL
BQAwfzELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcM
DVNhbiBGcmFuY2lzY28xHTAbBgNVBAoMFFNpbGljb25tb3VudC5wdnQubHRkMQww
CgYDVQQLDANzc3IxFjAUBgNVBAMMDTI0LjEwMS4xMDMuODcwHhcNMjUwNDE2MTYz
NjI5WhcNMjcwNDE2MTYzNjI5WjB/MQswCQYDVQQGEwJVUzETMBEGA1UECAwKQ2Fs
aWZvcm5pYTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzEdMBsGA1UECgwUU2lsaWNv
bm1vdW50LnB2dC5sdGQxDDAKBgNVBAsMA3NzcjEWMBQGA1UEAwwNMjQuMTAxLjEw
My44NzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALkDbR86jwkAv7SV
BeMPAyE5IBQx0R+wW9oJXJN2C8lkUopFoRyYGD10ob0fWPIm6K6/paNMUBXBO1WV
wNRog1TSICq12od52MDs784P4I05c+OhK3K8NmZh714v/mbF79HUodiDScPc/NFY
Zpx5RfnyGe1xMs4aTjebIyJQNHgOnMUvdno6p/sII4w9jWefqg+xSjqwg35ojTyc
yUcBD50L5YPQVwRa9pLy09O84t5TW3o4ANkb6DqYTTZPasYnZPfCrsw24dU5NQr5
nfoqgiB1+rkO09/g6KXmtiNS8AS5HtNqpdD+2RS7BStM2QXP6YyMr1K8GG2B5EGN
JFD1Tp8CAwEAAaNTMFEwHQYDVR0OBBYEFNnGMvbVj7Zkh6mXitZ3kjtGtAl0MB8G
A1UdIwQYMBaAFNnGMvbVj7Zkh6mXitZ3kjtGtAl0MA8GA1UdEwEB/wQFMAMBAf8w
DQYJKoZIhvcNAQELBQADggEBAF7ljz46U5BngbHZtRnJTwP9q4cy57v3gyJlZy07
FMNettnB4YfjtWmv9QuH4MW9nc2f6PvlgruA4NAXetwKJodWzXL1JnM/MAPpXVRq
8fR6/aKfvpzyds6/reS+0bhkQ+BIqKXsCfwGtmENc7b15n64jjwbBZkenWXrnYV/
VV0m2Nat72DZhuFo7iteNuJrjEt+S0oD3cK3B+vMmvMYmpk4l0mHRZr55q7M9FIr
gQCUa7aAJqxg2Mpoa+ezXsMMxlFoXv1SCe2FoF0AmFfvIvxNYb0oQXYYrRiRJ0+Z
XFvjfbyFyIFMP5mUewE2XSXNLdpeQnlv26j6ykRp2zEY1RQ=
-----END CERTIFICATE-----`;

  const handleDownloadCertificate = async () => {
    setIsDownloading(true);
    setDownloadStatus('Preparing download...');
    
    try {
      // Create blob from certificate content
      const blob = new Blob([certificateContent], { 
        type: 'application/x-x509-ca-cert' 
      });
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rootCA.crt';
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
      setDownloadStatus('Certificate downloaded successfully!');
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setDownloadStatus('');
      }, 3000);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setDownloadStatus('Download failed. Please try again.');
      
      setTimeout(() => {
        setDownloadStatus('');
      }, 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAutoInstall = async () => {
    setIsAutoInstalling(true);
    setAutoInstallMode(true);
    setCurrentStep(0);
    
    // First download the certificate
    await handleDownloadCertificate();
    
    // Start automated steps
    setTimeout(() => {
      executeAutoSteps();
    }, 1000);
  };

  const executeAutoSteps = async () => {
    const steps = autoInstallSteps[selectedOS];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between steps
      
      try {
        await executeStep(steps[i], i);
      } catch (error) {
        console.log(`Step ${i + 1} requires manual action:`, error.message);
      }
    }
    
    setIsAutoInstalling(false);
    setDownloadStatus('Auto-installation completed! Please restart your browser.');
  };

  const executeStep = async (step, index) => {
    switch (selectedOS) {
      case 'windows':
        return executeWindowsStep(step, index);
      case 'chrome':
        return executeChromeStep(step, index);
      case 'mac':
        return executeMacStep(step, index);
      default:
        throw new Error('Manual action required');
    }
  };

  const executeWindowsStep = async (step, index) => {
    switch (index) {
      case 0:
        // Try to open certificate file
        setDownloadStatus('🔍 Looking for downloaded certificate...');
        break;
      case 1:
        // Open Windows Certificate Manager
        try {
          setDownloadStatus('🔧 Opening Certificate Manager...');
          window.open('ms-settings:privacy-security', '_blank');
          throw new Error('Please continue manually from Certificate Manager');
        } catch (error) {
          throw new Error('Opening Certificate Manager - manual action required');
        }
      default:
        throw new Error('Manual action required');
    }
  };

  const executeChromeStep = async (step, index) => {
    switch (index) {
      case 0:
        // Open Chrome settings
        setDownloadStatus('⚙️ Opening Chrome Settings...');
        window.open('chrome://settings/', '_blank');
        break;
      case 1:
        // Navigate to security settings
        setDownloadStatus('🔒 Navigating to Security Settings...');
        window.open('chrome://settings/security', '_blank');
        break;
      case 2:
        // Open certificate management
        setDownloadStatus('📜 Opening Certificate Management...');
        window.open('chrome://settings/certificates', '_blank');
        break;
      default:
        throw new Error('Manual action required for certificate import');
    }
  };

  const executeMacStep = async (step, index) => {
    switch (index) {
      case 0:
        setDownloadStatus('🔍 Looking for downloaded certificate...');
        break;
      case 1:
        // Try to open Keychain Access
        setDownloadStatus('🔑 Opening Keychain Access...');
        try {
          // This won't work due to security restrictions, but we'll show the attempt
          window.open('keychain://system', '_blank');
        } catch (error) {
          throw new Error('Please open Keychain Access manually');
        }
        break;
      default:
        throw new Error('Manual action required');
    }
  };

  const autoInstallSteps = {
    windows: [
      { action: 'locate', text: 'Locating downloaded certificate file', automated: true },
      { action: 'open_certmgr', text: 'Opening Windows Certificate Manager', automated: true },
      { action: 'manual', text: 'Double-click rootCA.crt to open Certificate Import Wizard', automated: false },
      { action: 'manual', text: 'Click "Install Certificate" and choose "Local Machine"', automated: false },
      { action: 'manual', text: 'Select "Trusted Root Certification Authorities" store', automated: false },
      { action: 'manual', text: 'Complete the wizard and restart browser', automated: false }
    ],
    chrome: [
      { action: 'open_settings', text: 'Opening Chrome Settings', automated: true },
      { action: 'navigate_security', text: 'Navigating to Security Settings', automated: true },
      { action: 'open_certificates', text: 'Opening Certificate Management', automated: true },
      { action: 'manual', text: 'Click "Manage certificates" in the security section', automated: false },
      { action: 'manual', text: 'Go to "Trusted Root Certification Authorities" tab', automated: false },
      { action: 'manual', text: 'Click "Import" and select the downloaded rootCA.crt', automated: false }
    ],
    mac: [
      { action: 'locate', text: 'Locating downloaded certificate file', automated: true },
      { action: 'open_keychain', text: 'Opening Keychain Access', automated: true },
      { action: 'manual', text: 'Drag certificate to System keychain', automated: false },
      { action: 'manual', text: 'Double-click certificate and expand Trust section', automated: false },
      { action: 'manual', text: 'Set "When using this certificate" to "Always Trust"', automated: false },
      { action: 'manual', text: 'Enter admin password and restart browser', automated: false }
    ]
  };

  const handleCopyCertificate = async () => {
    try {
      await navigator.clipboard.writeText(certificateContent);
      setDownloadStatus('Certificate content copied to clipboard!');
      
      setTimeout(() => {
        setDownloadStatus('');
      }, 3000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setDownloadStatus('Failed to copy to clipboard');
      
      setTimeout(() => {
        setDownloadStatus('');
      }, 3000);
    }
  };

  const instructionSteps = {
    windows: [
      { step: 1, text: 'Double-click the downloaded', highlight: 'rootCA.crt', icon: '📁' },
      { step: 2, text: 'Click', highlight: '"Install Certificate"', icon: '🔧' },
      { step: 3, text: 'Choose', highlight: '"Local Machine"', then: 'click Next', icon: '💻' },
      { step: 4, text: 'Select', highlight: '"Place all certificates in the following store"', icon: '📋' },
      { step: 5, text: 'Click Browse and choose', highlight: '"Trusted Root Certification Authorities"', icon: '🔐' },
      { step: 6, text: 'Click Next, then Finish, and', highlight: 'restart your browser', icon: '🔄' }
    ],
    mac: [
      { step: 1, text: 'Double-click the downloaded', highlight: 'rootCA.crt', icon: '📁' },
      { step: 2, text: 'Open', highlight: 'Keychain Access', icon: '🔑' },
      { step: 3, text: 'Drag certificate to', highlight: 'System keychain', icon: '🖱️' },
      { step: 4, text: 'Double-click the certificate and expand', highlight: 'Trust section', icon: '🔍' },
      { step: 5, text: 'Set "When using this certificate" to', highlight: '"Always Trust"', icon: '✅' },
      { step: 6, text: 'Enter admin password and', highlight: 'restart your browser', icon: '🔄' }
    ],
    chrome: [
      { step: 1, text: 'Open Chrome Settings', highlight: '(chrome://settings/)', icon: '⚙️' },
      { step: 2, text: 'Go to', highlight: '"Privacy and security"', icon: '🔒' },
      { step: 3, text: 'Click', highlight: '"Security"', icon: '🛡️' },
      { step: 4, text: 'Click', highlight: '"Manage certificates"', icon: '📜' },
      { step: 5, text: 'Go to', highlight: '"Trusted Root Certification Authorities"', tab: true, icon: '🏛️' },
      { step: 6, text: 'Click', highlight: '"Import"', then: 'select downloaded rootCA.crt', icon: '📥' }
    ]
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">SSL Certificate Required</h2>
                <p className="text-gray-600 text-sm">Security certificate installation needed to continue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <IoMdClose className="text-gray-600 text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Explanation */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaShieldAlt className="text-yellow-600 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Why do you see this error?</h3>
                <p className="text-yellow-700 text-sm leading-relaxed">
                  Our application uses a secure HTTPS connection with a custom SSL certificate from Siliconmount.pvt.ltd. 
                  To establish a trusted connection, you need to install our root certificate authority (CA) 
                  certificate on your device. This is a one-time setup that ensures secure communication.
                </p>
              </div>
            </div>
          </div>

          {/* Download Status */}
          {downloadStatus && (
            <div className={`p-3 rounded-lg text-center font-medium ${
              downloadStatus.includes('successfully') || downloadStatus.includes('copied') || downloadStatus.includes('completed')
                ? 'bg-green-100 text-green-800' 
                : downloadStatus.includes('failed') || downloadStatus.includes('Failed')
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {downloadStatus}
            </div>
          )}

          {/* Auto Installation Progress */}
          {autoInstallMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <FaRocket className="mr-2" />
                Auto-Installation Progress
              </h4>
              <div className="space-y-2">
                {autoInstallSteps[selectedOS].map((step, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-2 rounded ${
                    index < currentStep ? 'bg-green-100 text-green-800' :
                    index === currentStep ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < currentStep ? 'bg-green-500 text-white' :
                      index === currentStep ? 'bg-yellow-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className="text-sm">
                      {step.text}
                      {!step.automated && ' (Manual action required)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OS Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Choose your operating system:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setSelectedOS('windows')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOS === 'windows' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BsWindows className="text-2xl mx-auto mb-2" />
                <span className="block font-medium">Windows</span>
              </button>
              <button
                onClick={() => setSelectedOS('mac')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOS === 'mac' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BsApple className="text-2xl mx-auto mb-2" />
                <span className="block font-medium">macOS</span>
              </button>
              <button
                onClick={() => setSelectedOS('chrome')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedOS === 'chrome' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BsGlobe className="text-2xl mx-auto mb-2" />
                <span className="block font-medium">Chrome Browser</span>
              </button>
            </div>
          </div>

          {/* Download and Auto-Install Section */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDownloadCertificate}
                disabled={isDownloading || isAutoInstalling}
                className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaDownload className={`${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Downloading...' : 'Download Only'}</span>
              </button>
              
              <button
                onClick={handleAutoInstall}
                disabled={isDownloading || isAutoInstalling}
                className="inline-flex items-center space-x-3 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaRocket className={`${isAutoInstalling ? 'animate-spin' : ''}`} />
                <span>{isAutoInstalling ? 'Auto-Installing...' : 'Download & Auto-Install'}</span>
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              {/* <span>File: rootCA.crt</span>
              <span>•</span> */}
              {/* <button
                onClick={handleCopyCertificate}
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <FaCopy />
                <span>Copy to Clipboard</span>
              </button> */}
            </div>

            {/* Certificate Content Toggle */}
            {/* <div className="text-center">
              <button
                onClick={() => setShowCertContent(!showCertContent)}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {showCertContent ? 'Hide' : 'Show'} Certificate Content
              </button>
            </div> */}

            {showCertContent && (
              <div className="bg-gray-100 p-4 rounded-lg text-left">
                <pre className="text-xs font-mono whitespace-pre-wrap break-all text-gray-700">
                  {certificateContent}
                </pre>
              </div>
            )}
          </div>

          {/* Installation Instructions */}
          {!autoInstallMode && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">Manual Installation Steps</span>
                {selectedOS === 'windows' && <BsWindows className="text-blue-600" />}
                {selectedOS === 'mac' && <BsApple className="text-gray-600" />}
                {selectedOS === 'chrome' && <BsGlobe className="text-green-600" />}
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {instructionSteps[selectedOS].map((instruction, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 bg-white rounded-lg border"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {instruction.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">
                          <span className="mr-2">{instruction.icon}</span>
                          {instruction.text} <strong className="text-blue-600">{instruction.highlight}</strong>
                          {instruction.then && <span> → {instruction.then}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-green-600 text-lg mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Important Notes:</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• This is a one-time setup process</li>
                  <li>• You may need administrator privileges</li>
                  <li>• Auto-install will open necessary system dialogs, but some steps require manual completion</li>
                  <li>• Restart your browser after installation</li>
                  <li>• The certificate ensures secure communication with our servers</li>
                  <li>• Certificate issued by Siliconmount.pvt.ltd for IP: 24.101.103.87</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onRetry}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
            >
              I've Installed the Certificate - Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-lg font-semibold transition-all duration-200"
            >
              I'll Install Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSLCertificateInstallation;