import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faHourglassHalf, faFlagCheckered, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import Stepper from './Stepper'; // adjust the path based on your folder structure
import toast, { Toaster } from 'react-hot-toast';

const EstimateForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workName, setWorkName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSSR, setSelectedSSR] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedArea, setSelectedArea] = useState('General Area');
  const [areaPercentage, setAreaPercentage] = useState('0');
  const [workOrderId, setWorkOrderId] = useState('');
  const [preparedBySignature, setPreparedBySignature] = useState('');
  const [checkedBySignature, setCheckedBySignature] = useState('');
  const [chapters, setChapters] = useState([]);
  const [isMultipleFloor, setIsMultipleFloor] = useState(false);
  const [showMultipleFloorCheckbox, setShowMultipleFloorCheckbox] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);


  
  // JWT Token - In production, store this securely and not hard-coded
  const jwtToken =  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0MjAyNDEzLCJleHAiOjE3NDQyODg4MTN9.cxCaFHJsjjmwxjCOSHwov6xVsxaZsn9AWTDqnSwhXK0";
  
  // API base URL - should be in environment variable in production
  const API_BASE_URL = "http://24.101.103.87:8082/api";
  
  // States data
  const states = [
    { value: "", label: "Select State", tin: "" },
    { value: "demo1", label: "demo1", tin: "23" },
    { value: "MH", label: "MH", tin: "27" },
    { value: "demo2", label: "demo2", tin: "34" }
  ];
  
  // Departments data
  const departments = [
    { value: "", label: "Select Department" },
    { value: "PWD", label: "PWD" }
  ];
  
  // SSR options
  const ssrOptions = [
    { value: "", label: "Select SSR" },
    { value: "demo2", label: "demo2" },
    { value: "SSR 2022-23", label: "SSR 2022-23" }
  ];
  
  // Areas data with percentage
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
  
  // Progress bar calculation
  const calculateProgress = () => {
    return ((currentStep - 1) / 2) * 100;
  };
  
  // Generate custom ID when state changes
  useEffect(() => {
    if (selectedState) {
      generateCustomID();
    }
  }, [selectedState]);
  useEffect(() => {
    setWorkName(localStorage.getItem("form_workName") || "");
    setSelectedState(localStorage.getItem("form_selectedState") || "");
    setSelectedDept(localStorage.getItem("form_selectedDept") || "");
    setSelectedSSR(localStorage.getItem("form_selectedSSR") || "");
    setSelectedChapter(localStorage.getItem("form_selectedChapter") || "");
    setSelectedArea(localStorage.getItem("form_selectedArea") || "General Area");
    setPreparedBySignature(localStorage.getItem("form_preparedBySignature") || "");
    setCheckedBySignature(localStorage.getItem("form_checkedBySignature") || "");
  }, []);
  
  
  // Handle area change
  const handleAreaChange = (e) => {
    const selectedAreaValue = e.target.value;
    setSelectedArea(selectedAreaValue);
    const areaObj = areas.find(area => area.value === selectedAreaValue);
    setAreaPercentage(areaObj ? areaObj.percentage : '0');
    toast.success(`Area percentage set to ${areaObj ? areaObj.percentage : '0'}%`);
  };
  
  // Fetch chapters on component mount
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        toast.loading('Fetching chapters...', { id: 'chapters' });
        const response = await fetch(`${API_BASE_URL}/chapters`, {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Accept": "*/*"
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setChapters(data);
        toast.success('Chapters loaded successfully!', { id: 'chapters' });
      } catch (error) {
        console.error("Error fetching chapters:", error);
        toast.error(`Failed to fetch chapters: ${error.message}`, { id: 'chapters' });
      }
    };
    
    fetchChapters();
  }, [jwtToken]);
  
  // Generate custom ID function
  const generateCustomID = () => {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const selectedStateObj = states.find(state => state.value === selectedState);
    const tin = selectedStateObj ? selectedStateObj.tin : "00";
    
    const wo = "WO";
    
    // Get userId from localStorage or use default
    const userId = localStorage.getItem("Id") || "92";
    
    const finalID = `${tin}${wo}${year}${month}${day}${hours}${minutes}${seconds}${userId}`;
    setWorkOrderId(finalID);
    toast.success('Work Order ID generated');
  };
  
  // Handle next step with validation
  const handleNextStep = (step) => {
    if (currentStep === 1) {
      if (!workName.trim()) {
        toast.error("Please enter the 'Name of Work' before proceeding!");
        return;
      }
      if (!selectedState.trim()) {
        toast.error("Please Select the 'State' before proceeding!");
        return;
      }
      if (!selectedDept.trim()) {
        toast.error("Please Select the 'Department' before proceeding!");
        return;
      }
      toast.success("Step 1 completed successfully!");
    }
    
    setCurrentStep(step);
  };
  
  // Handle previous step
  const handlePrevStep = (step) => {
    setCurrentStep(step);
    toast.info("Going back to previous step");
  };
  
  // Format date for API calls
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
  
  // Add work function (API call)
  const addWork = async () => {
    // Validation
    if (!selectedSSR || !selectedChapter || !selectedArea || !preparedBySignature || !checkedBySignature) {
      toast.error("Please fill in all required fields before proceeding!");
      return;
    }
    
    const loadingToast = toast.loading('Creating work order...');
    const createdDate = getFormattedDate();
    
    // Get the user ID from localStorage or use default
    const userId = localStorage.getItem("Id") || "92";
    
    try {
      // First, create work order - ensure proper type conversions
      const workOrderPayload = {
        workOrderID: workOrderId,
        nameOfWork: workName,
        state: selectedState,
        ssr: selectedSSR,
        chapterId: parseInt(selectedChapter, 10), // Ensure it's a number with proper parsing
        area: selectedArea,
        createdBy: parseInt(userId, 10), // Ensure it's a number with proper parsing
        preparedBySignature: preparedBySignature,
        checkedBySignature: checkedBySignature,
        createdDate: createdDate,
        department: selectedDept,
        deletedFlag: 0,
        status: "started"
      };
      
      console.log("Sending Work Order Payload:", workOrderPayload);
      
      // Add error handling for network issues
      const workOrderResponse = await fetch(`${API_BASE_URL}/workorders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(workOrderPayload)
      });
      
      // Detailed error handling to debug server issues
      if (!workOrderResponse.ok) {
        const errorText = await workOrderResponse.text();
        console.error("Work Order API Error Response:", errorText);
        
        // Try to parse the error response for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Parsed Error:", errorJson);
          throw new Error(`Server error: ${errorJson.message || errorJson.error || workOrderResponse.statusText}`);
        } catch (parseError) {
          throw new Error(`Failed to create work order: ${workOrderResponse.status} ${workOrderResponse.statusText}`);
        }
      }
      
      const workOrderData = await workOrderResponse.json();
      console.log("Work Order Created Successfully:", workOrderData);
      
      // Store relevant data in localStorage
      localStorage.setItem("nameOfWork", workName);
      localStorage.setItem("workorderId", workOrderData.id);
      localStorage.setItem("chapter", selectedChapter);
      localStorage.setItem("autogenerated", workOrderId);
      localStorage.setItem("status", "started");
      localStorage.setItem("ssr", selectedSSR);
      localStorage.setItem("area", selectedArea);
      localStorage.setItem("revisionStage", "started");
      
      // Now create work order revision
      await sendToAnotherAPI(workOrderData.id);
      
      toast.dismiss(loadingToast);
      toast.success("Work Order Added Successfully!");
      
      // Redirect to measurement page
      setTimeout(() => {
        window.location.href = "/subestimate";
      }, 1500);
      
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to add work order: ${error.message}`);
    }
  };
  
  // Function to send data to another API (workorder-revisions)
  const sendToAnotherAPI = async (workorderId) => {
    try {
      const revisionToast = toast.loading('Creating work order revision...');
      const userId = localStorage.getItem("Id") || "92";
      const currentDate = getFormattedDate();
      
      const revisionPayload = {
        workorderId: Number(workorderId),
        reviseNumber: "1.0",
        createdDate: currentDate,
        createdBy: Number(userId),
        updatedDate: currentDate,
        updatedBy: Number(userId),
        currentFlag: false,
        pdfLocation: "",
        revisionStage: "started",
        revisionStatus: "pending",
        deletedFlag: "no"
      };
      
      console.log("Sending Revision Payload:", revisionPayload);
      
      const revisionResponse = await fetch(`${API_BASE_URL}/workorder-revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(revisionPayload)
      });
      
      if (!revisionResponse.ok) {
        const errorText = await revisionResponse.text();
        console.error("Revision API Error Response:", errorText);
        throw new Error(`Failed to create revision: ${revisionResponse.status} ${revisionResponse.statusText}`);
      }
      
      const revisionData = await revisionResponse.json();
      console.log("Revision Created Successfully:", revisionData);
      
      // Store revision data in localStorage
      localStorage.setItem("reviseId", revisionData.id);
      localStorage.setItem("reviseno", revisionData.reviseNumber);
      
      toast.dismiss(revisionToast);
      toast.success("Work order revision created successfully!");
      
    } catch (error) {
      console.error("Error creating work order revision:", error);
      toast.error(`Failed to create revision: ${error.message}`);
    }
  };
  
  return (
    <div className="bg-white min-h-screen">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      
      <div className="container mx-auto p-4">
        <div className="main-content">
          
          <div className="mb-6">
            <div className="mb-6 mt-2 p-4 border border-gray-300 rounded bg-white shadow">
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
          </div>
          
          {/* Form Container */}
          <div className="border border-gray-300 rounded-lg p-6 mt-4 shadow-sm">
            <h6 className="text-base font-medium mb-4">Create New Estimate</h6>
            
            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h5 className="text-lg font-medium mb-4">Step 1: WorkName</h5>
                
                <div className="mb-4">
                  <label htmlFor="workname" className="block mb-1 font-medium">Name of Work:</label>
                  <textarea 
                    id="workname" 
                    className="w-full p-2 border border-gray-300 rounded-md" 
                    value={workName}
                    onChange={(e) => {
                      setWorkName(e.target.value);
                      localStorage.setItem("form_workName", e.target.value);
                    }}
                    
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block mb-1 font-medium">State:</label>
                    <select 
                      id="state" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        localStorage.setItem("form_selectedState", e.target.value);
                      }}
                      
                    >
                      {states.map((state) => (
                        <option key={state.value} value={state.value} data-tin={state.tin}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dept" className="block mb-1 font-medium">Department:</label>
                    <select 
                      id="dept" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedDept}
                      onChange={(e) => {
                        setSelectedDept(e.target.value);
                        localStorage.setItem("form_selectedDept", e.target.value);
                      }}
                      
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button 
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  onClick={() => handleNextStep(2)}
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h5 className="text-lg font-medium mb-4">Step 2: Select SSR Area And Signature</h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="WorkOrder" className="block mb-1 font-medium">Estimate ID:</label>
              
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                      id="WorkOrder" 
                      value={workOrderId} 
                      readOnly 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="ssr" className="block mb-1 font-medium">SSR:</label>
                    <select 
                      id="ssr" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedSSR}
                      onChange={(e) => {
                        setSelectedSSR(e.target.value);
                        localStorage.setItem("form_selectedSSR", e.target.value);
                      }}
                      
                    >
                      {ssrOptions.map((ssr) => (
                        <option key={ssr.value} value={ssr.value}>
                          {ssr.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="chapters" className="block mb-1 font-medium">Chapter:</label>
                    <Select
  key={formResetKey}

                      options={chapters.map(ch => ({
                        value: ch.chapterId.toString(),
                        label: ch.chapterCategory
                      }))}
                      value={
                        selectedChapter ? 
                        {
                          value: selectedChapter,
                          label: chapters.find(ch => ch.chapterId.toString() === selectedChapter)?.chapterCategory || ''
                        } : null
                      }
                      onChange={(option) => {
                        const value = option ? option.value : '';
                        setSelectedChapter(value);
                        localStorage.setItem("form_selectedChapter", value);
                      
                        if (option) {
                          toast.success(`Selected chapter: ${option.label}`);
                      
                          const selectedLabel = option.label.toLowerCase();
                          if (selectedLabel === "building work") {
                            setShowMultipleFloorCheckbox(true);
                            setIsMultipleFloor(true); // default selected for building work
                          } else {
                            setShowMultipleFloorCheckbox(false);
                            setIsMultipleFloor(false);
                          }
                        } else {
                          setShowMultipleFloorCheckbox(false);
                          setIsMultipleFloor(false);
                        }
                      }}
                      
                      placeholder="Search Chapter..."
                      classNamePrefix="select"
                      className="basic-single"
                      isClearable
                    />
                    
                    {/* Multiple Floor Checkbox - positioned directly below the Chapter select */}
                    {showMultipleFloorCheckbox && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <input
                            id="multipleFloor"
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={isMultipleFloor}
                            onChange={() => setIsMultipleFloor(prev => !prev)}
                          />
                          <label htmlFor="multipleFloor" className="text-sm font-medium text-gray-700">
                            Multiple Floor
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="area" className="block mb-1 font-medium">Specified Area</label>
                    <select 
                      id="area" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedArea}
                      onChange={(e) => {
                        setSelectedArea(e.target.value);
                        localStorage.setItem("form_selectedArea", e.target.value);
                        const areaObj = areas.find(area => area.value === e.target.value);
                        setAreaPercentage(areaObj ? areaObj.percentage : '0');
                      }}
                      
                    >
                      {areas.map((area) => (
                        <option 
                          key={area.value} 
                          value={area.value}
                        >
                          {area.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 font-bold">
                      Selected Area Percentage: <span>{areaPercentage}%</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="preparedBySignature" className="block mb-1 font-medium">Prepared By:</label>
                    <textarea 
                      placeholder="Prepared By..." 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      rows="5" 
                      id="preparedBySignature"
                      value={preparedBySignature}
                      onChange={(e) => {
                        setPreparedBySignature(e.target.value);
                        localStorage.setItem("form_preparedBySignature", e.target.value);
                      }}
                      
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="checkedBySignature" className="block mb-1 font-medium">Checked By:</label>
                    <textarea 
                      placeholder="Checked By ..." 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      rows="5" 
                      id="checkedBySignature"
                      value={checkedBySignature}
                      onChange={(e) => {
                        setCheckedBySignature(e.target.value);
                        localStorage.setItem("form_checkedBySignature", e.target.value);
                      }}
                      
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button 
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                    onClick={() => handlePrevStep(1)}
                  >
                    Previous
                  </button>
                  
                  <button 
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={addWork}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Floating Button */}
          <div className="fixed right-6 bottom-6 flex flex-col space-y-4">
            <button 
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 group relative"
              onClick={() => {
                [
                  "form_workName",
                  "form_selectedState",
                  "form_selectedDept",
                  "form_selectedSSR",
                  "form_selectedChapter",
                  "form_selectedArea",
                  "form_preparedBySignature",
                  "form_checkedBySignature"
                ].forEach(key => localStorage.removeItem(key));
              
                toast.success('Form cleared for new estimate!');
                
                // Reset local state
                setCurrentStep(1);
                setWorkName("");
                setSelectedState("");
                setSelectedDept("");
                setSelectedSSR("");
                setSelectedChapter("");
                setSelectedArea("General Area");
                setPreparedBySignature("");
                setCheckedBySignature("");
              
                // Trigger Select reset
                setFormResetKey(prev => prev + 1);
              }}
              
            >
              <FontAwesomeIcon icon={faPlus} />
              <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Create New Estimate
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;