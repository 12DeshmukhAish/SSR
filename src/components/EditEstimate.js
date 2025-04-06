import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stepper from './Stepper';

const EditEstimatePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    workname: '',
    state: '',
    department: '',
    workOrderId: '',
    chapter: '',
    ssr: '',
    area: '',
    preparedBy: '',
    checkedBy: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [workOrderStatus, setWorkOrderStatus] = useState('started');
  
  const navigate = useNavigate();
  const { workorderId } = useParams();

  // Simulated data for dropdowns
  const states = [
    { value: "demo1", label: "demo1" },
    { value: "MH", label: "MH" },
    { value: "demo2", label: "demo2" }
  ];
  
  const departments = [
    { value: "PWD", label: "PWD" }
  ];
  
  const chapters = [
    { value: "1", label: "Accoustic" },
    { value: "18", label: "Road Works" },
    { value: "3", label: "Building Works" },
    { value: "9", label: "Geosynthetic" },
    { value: "4", label: "Bridge Works" },
    { value: "6", label: "Drone survey" },
    { value: "2", label: "bambusa bamboos item" },
    { value: "19", label: "Coastal" },
    { value: "5", label: "Cross Drainage Works" },
    { value: "7", label: "Fire Safety" },
    { value: "8", label: "Furniture" },
    { value: "10", label: "Green Building" }
  ];
  
  const ssrOptions = [
    { value: "demo2", label: "demo2" },
    { value: "SSR 2022-23", label: "SSR 2022-23" }
  ];
  
  const areas = [
    { value: "", label: "Select Area", percentage: "0" },
    { value: "Corporation Area", label: "Corporation Area", percentage: "0" },
    { value: "Muncipal Council Area", label: "Muncipal Council Area", percentage: "0" },
    { value: "For Mumbai/Brahan Mumbai", label: "For Mumbai/Brahan Mumbai", percentage: "0" },
    { value: "Sugarcane Factory Area (Within 10 KM radius)", label: "Sugarcane Factory Area (Within 10 KM radius)", percentage: "5" },
    { value: "Notified Tribal Areas", label: "Notified Tribal Areas", percentage: "0" },
    { value: "Hilly Areas", label: "Hilly Areas", percentage: "0" },
    { value: "Inaccessible Areas", label: "Inaccessible Areas", percentage: "0" },
    { value: "Inside Premises of Central Jail", label: "Inside Premises of Central Jail", percentage: "0" },
    { value: "Mental Hospital", label: "Mental Hospital", percentage: "0" },
    { value: "Raj Bhawan", label: "Raj Bhawan", percentage: "0" },
    { value: "Yerawada Printing Presses", label: "Yerawada Printing Presses", percentage: "15" },
    { value: "Tiger Project Area in Maleghat", label: "Tiger Project Area in Maleghat", percentage: "20" },
    { value: "Coal / Lime Mining Area", label: "Coal / Lime Mining Area", percentage: "0" },
    { value: "Naxelite Affected Area", label: "Naxelite Affected Area", percentage: "10" },
    { value: "Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas", label: "Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas", percentage: "0" },
    { value: "General Area", label: "General Area", percentage: "0" },
    { value: "abcs", label: "abcs", percentage: "5" }
  ];

  useEffect(() => {
    // Check for workorderId in localStorage
    const storedWorkorderId = localStorage.getItem("workorderId");
    
    if (storedWorkorderId) {
      console.log("✅ Work Order ID:", storedWorkorderId);
      
      // Load data for the work order
      fetchWorkOrderData(storedWorkorderId);
    } else {
      console.error("❌ Work Order ID is missing from localStorage!");
    }
  }, []);

  const fetchWorkOrderData = async (id) => {
    setIsLoading(true);
    
    try {
      // Replace with your actual API endpoint
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzNTAzMzc5LCJleHAiOjE3NDM1ODk3Nzl9.WRRn3kk9_4o3PcF920pTY_NmEBAyQZi9qL5DqmtPpQE";
      const response = await fetch(`http://24.101.103.87:8082/api/workorders/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        setFormData({
          workname: data.nameOfWork || '',
          state: data.state || '',
          department: data.department || '',
          workOrderId: data.workOrderID || '27WO2025032721044992',
          chapter: data.chapterId || '',
          ssr: data.ssr || '',
          area: data.area || '',
          preparedBy: data.preparedBySignature || '',
          checkedBy: data.checkedBySignature || ''
        });
        
        setWorkOrderStatus(data.status || 'started');
      } else {
        console.error("Failed to fetch work order data");
      }
    } catch (error) {
      console.error("Error fetching work order data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.workname.trim()) {
      alert("❌ Please enter the 'Name of Work' before proceeding!");
      return false;
    }
    if (!formData.state.trim()) {
      alert("❌ Please select the 'State' before proceeding!");
      return false;
    }
    if (!formData.department.trim()) {
      alert("❌ Please select the 'Department' before proceeding!");
      return false;
    }
    return true;
  };


  const handleNextStep = (stepId) => {
    if (stepId === 2 && !validateStep1()) {
      return;
    }
    setCurrentStep(stepId);
  };
  
  const prevStep = () => {
    setCurrentStep(1);
  };
  const nextStep = () => {
    if (!validateStep1()) return;
    setCurrentStep(2);
  };
  
  const getFormattedDate = () => {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async () => {
    // Validation for Step 2
    if (!formData.ssr || !formData.chapter || !formData.area || 
        !formData.preparedBy || !formData.checkedBy) {
      alert("❌ Please fill in all required fields before proceeding!");
      return;
    }

    setIsLoading(true);
    
    try {
      const wids = localStorage.getItem("workorderId");
      const url = `http://24.101.103.87:8082/api/workorders/${wids}`;
      
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzNTAzMzc5LCJleHAiOjE3NDM1ODk3Nzl9.WRRn3kk9_4o3PcF920pTY_NmEBAyQZi9qL5DqmtPpQE";
      if (!token) {
        alert("❌ Authentication failed! Token not found.");
        setIsLoading(false);
        return;
      }
      
      const payload = {
        workOrderID: formData.workOrderId,
        nameOfWork: formData.workname,
        state: formData.state,
        ssr: formData.ssr,
        chapterId: formData.chapter,
        area: formData.area,
        createdBy: "92", // This appears to be hardcoded in the original
        preparedBySignature: formData.preparedBy,
        checkedBySignature: formData.checkedBy,
        createdDate: getFormattedDate(),
        department: formData.department,
        deletedFlag: 0,
        status: "started"
      };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Store values in localStorage
        localStorage.setItem("nameOfWork", formData.workname);
        localStorage.setItem("workorderId", data.id);
        localStorage.setItem("chapter", formData.chapter);
        localStorage.setItem("ssr", formData.ssr);
        localStorage.setItem("area", formData.area);

        console.log("🟢 Work Order ID stored:", localStorage.getItem("workorderId"));
        
        // Redirect to measurement page
        console.log("🔄 Redirecting to tmeasurement page...");
        navigate("/subestimate");
      } else {
        alert(data.message || "❌ Failed to update work order. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldDisabled = workOrderStatus !== 'started';

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="h-1 bg-gray-200 w-full mt-4">
      <Stepper 
  currentStep={currentStep} 
  onStepClick={(stepId) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId); // Go back freely
    } else {
      handleNextStep(stepId); // Apply forward step validation
    }
  }} 
/>

      
      </div>

      {/* Form Container */}
      <div className="container mx-auto border border-gray-300 rounded-md p-4 mt-8 bg-white shadow-sm">
        <h6 className="text-lg font-medium mb-4">Create New Estimate</h6>
        
        {/* Step 1 */}
        <div className={`${currentStep === 1 ? 'block' : 'hidden'}`}>
          <div className="mb-4">
            <label htmlFor="workname" className="block text-sm font-medium text-gray-700 mb-1">
              Name Of Work:
            </label>
            <textarea
              id="workname"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.workname}
              onChange={handleInputChange}
              disabled={isFieldDisabled}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State:
              </label>
              <select
                id="state"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.state}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              >
                <option value="">Select State</option>
                {states.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department:
              </label>
              <select
                id="department"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.department}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              >
                <option value="">Select Department</option>
                {departments.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={nextStep}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
        
        {/* Step 2 */}
        <div className={`${currentStep === 2 ? 'block' : 'hidden'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="workOrderId" className="block text-sm font-medium text-gray-700 mb-1">
                Work order ID:
              </label>
              <input
                type="text"
                id="workOrderId"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                value={formData.workOrderId}
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
                Chapter:
              </label>
              <select
                id="chapter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.chapter}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              >
                <option value="">Select Chapter</option>
                {chapters.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="ssr" className="block text-sm font-medium text-gray-700 mb-1">
                SSR:
              </label>
              <select
                id="ssr"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.ssr}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              >
                <option value="">Select SSR</option>
                {ssrOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area:
              </label>
              <select
                id="area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.area}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              >
                <option value="">Select Area</option>
                {areas.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="preparedBy" className="block text-sm font-medium text-gray-700 mb-1">
                Prepared By:
              </label>
              <textarea
                id="preparedBy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="5"
                placeholder="Prepared BY..."
                value={formData.preparedBy}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              />
            </div>
            
            <div>
              <label htmlFor="checkedBy" className="block text-sm font-medium text-gray-700 mb-1">
                Checked By:
              </label>
              <textarea
                id="checkedBy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="5"
                placeholder="Checked By ..."
                value={formData.checkedBy}
                onChange={handleInputChange}
                disabled={isFieldDisabled}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={prevStep}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Previous
            </button>
            
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button 
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 relative group"
          title="Create New Estimate"
        >
          <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Create New Estimate
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <button 
          className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 relative group"
          title="Contact"
        >
          <span className="absolute right-full mr-3 whitespace-nowrap bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Contact
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditEstimatePage;