import React, { useState, useEffect, useMemo } from 'react';

import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner, faHourglassHalf, faFlagCheckered, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import Stepper from './Stepper';
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

  const [preparedBySignature, setPreparedBySignature] = useState("");
  const [checkedBySignature, setCheckedBySignature] = useState("");
  const [showPreparedBySuggestions, setShowPreparedBySuggestions] = useState(false);
  const [showCheckedBySuggestions, setShowCheckedBySuggestions] = useState(false);
  const [preparedBySuggestions, setPreparedBySuggestions] = useState([]);
  const [checkedBySuggestions, setCheckedBySuggestions] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [isMultipleFloor, setIsMultipleFloor] = useState(false);
  const [showMultipleFloorCheckbox, setShowMultipleFloorCheckbox] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const isEditMode = localStorage.getItem("editMode") === "true";
  const isDuplicateMode = localStorage.getItem("duplicateMode") === "true";
  const existingRevisionId = localStorage.getItem("reviseId");
  const currentWorkorderId = localStorage.getItem("workorderId");
  // Inside generateCustomID
const userId = localStorage.getItem("Id") || "92";

  



   const jwtToken = localStorage.getItem('authToken');
  const API_BASE_URL = "https://24.101.103.87:8082/api";

  const states = [
    { value: "", label: "Select State", tin: "" },
    { value: "demo1", label: "demo1", tin: "23" },
    { value: "MH", label: "MH", tin: "27" },
    { value: "demo2", label: "demo2", tin: "34" }
  ];

  const departments = [
    { value: "", label: "Select Department" },
    { value: "PWD", label: "PWD" }
  ];

  const ssrOptions = [
    { value: "", label: "Select SSR" },
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
    if (selectedState) {
      generateCustomID();
    }
  }, [selectedState]);

  useEffect(() => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    if (isEditMode) {
      setWorkName(localStorage.getItem("edit_nameOfWork") || "");
      setSelectedState(localStorage.getItem("edit_state") || "");
      setSelectedDept(localStorage.getItem("edit_department") || "");
      setSelectedSSR(localStorage.getItem("edit_ssr") || "");


      setSelectedArea(localStorage.getItem("edit_area") || "General Area");
      setPreparedBySignature(localStorage.getItem("edit_preparedBy") || "");
      setCheckedBySignature(localStorage.getItem("edit_checkedBy") || "");
      const chapterVal = localStorage.getItem("edit_chapter") || "";
setSelectedChapter(chapterVal);

const chapterObj = chapters.find(ch => ch.chapterId.toString() === chapterVal);
if (chapterObj && chapterObj.chapterCategory.toLowerCase().includes("building work")) {
  setShowMultipleFloorCheckbox(true);
  setIsMultipleFloor(true); // Or retrieve this from storage if needed
}

      setWorkOrderId(localStorage.getItem("autogenerated") || "");
    } else {
      // ✅ REMOVED workName and selectedChapter from localStorage retrieval for new estimates
      // setWorkName(localStorage.getItem("form_workName") || ""); // REMOVED
      setWorkName(""); // Always start blank for new estimates
      setSelectedState(localStorage.getItem("form_selectedState") || "");
      setSelectedDept(localStorage.getItem("form_selectedDept") || "");
      setSelectedSSR(localStorage.getItem("form_selectedSSR") || "");
      setSelectedArea(localStorage.getItem("form_selectedArea") || "General Area");
      setPreparedBySignature(localStorage.getItem("form_preparedBySignature") || "");
      setCheckedBySignature(localStorage.getItem("form_checkedBySignature") || "");
      // setSelectedChapter(localStorage.getItem("form_selectedChapter") || ""); // REMOVED
      setSelectedChapter(""); // Always start blank for new estimates
    }
  }, []);
  localStorage.setItem("estimateUpdated", "true");
  useEffect(() => {
    // Load signature history from localStorage
    const savedPreparedBy = JSON.parse(localStorage.getItem("signatureHistory_preparedBy") || "[]");
    const savedCheckedBy = JSON.parse(localStorage.getItem("signatureHistory_checkedBy") || "[]");
    
    setPreparedBySuggestions(savedPreparedBy);
    setCheckedBySuggestions(savedCheckedBy);
    
    // Also load the current values if in edit mode
    const isEditMode = localStorage.getItem("editMode") === "true";
    if (isEditMode) {
      setPreparedBySignature(localStorage.getItem("edit_preparedBy") || "");
      setCheckedBySignature(localStorage.getItem("edit_checkedBy") || "");
    } else {
      setPreparedBySignature(localStorage.getItem("form_preparedBySignature") || "");
      setCheckedBySignature(localStorage.getItem("form_checkedBySignature") || "");
    }
  }, []);
  useEffect(() => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    const chapterVal = localStorage.getItem("edit_chapter") || "";
  
    if (isEditMode && chapters.length > 0) {
      setSelectedChapter(chapterVal);
  
      const chapterObj = chapters.find(ch => ch.chapterId.toString() === chapterVal);
      if (chapterObj && chapterObj.chapterCategory.toLowerCase().includes("building work")) {
        setShowMultipleFloorCheckbox(true);
        setIsMultipleFloor(false);
      }
    }
  }, [chapters]);
  
  
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
  const handleManualRedirect = () => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    const reviseId = localStorage.getItem("reviseId");
    if (isEditMode && reviseId) {
      window.location.href = "/subestimate";
    }
  };
  const uniqueChapters = useMemo(() => {
    return chapters.reduce((acc, current) => {
      const exists = acc.find(item => item.chapterCategory === current.chapterCategory);
      if (!exists) acc.push(current);
      return acc;
    }, []);
  }, [chapters]);
  
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

  const updateRevision = async (revisionId, updateFields) => {
    toast.loading('Updating revision...');
    try {
      const payload = {
        ...updateFields, // fields you want to update
        updatedDate: getFormattedDate(),
        updatedBy: Number(userId)
      };
      const response = await fetch(`${API_BASE_URL}/workorder-revisions/${revisionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to update revision");
      toast.dismiss();
      toast.success("Revision updated!");
      // Optionally: redirect or update local state
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "Failed to update revision");
    }
  };
  
  const getNextRevisionNumber = async (workorderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/workorder-revisions/ByWorkorderId/${workorderId}`, {
        headers: { "Authorization": `Bearer ${jwtToken}` }
      });
      const revisions = await response.json();
      const valid = revisions.filter(r => r.deletedFlag?.toLowerCase() !== "yes" && r.reviseNumber);
      const maxRev = valid.map(r => parseFloat(r.reviseNumber)).sort((a, b) => b - a)[0] || 1.0;
      return `${Math.floor(maxRev + 1)}.0`;
    } catch (err) {
      console.error("Failed to get next revision number", err);
      return "1.0";
    }
  };
  
  // Check for duplicate revision number (excluding current revision being edited)
  const saveSignatureToHistory = (type, value) => {
    if (!value.trim()) return;
    
    // Get current history array
    const historyKey = `signatureHistory_${type}`;
    const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    
    // Only add if it's not already in the list
    if (!currentHistory.includes(value)) {
      // Add to beginning of the array (most recent first)
      const updatedHistory = [value, ...currentHistory];
      
      // Limit to 10 items to prevent localStorage from growing too large
      const limitedHistory = updatedHistory.slice(0, 10);
      
      // Save updated history
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      
      // Update state
      if (type === "preparedBy") {
        setPreparedBySuggestions(limitedHistory);
      } else {
        setCheckedBySuggestions(limitedHistory);
      }
    }
  };
  
  // ✅ FIXED: Handle signature selection - removed setTimeout delay
  const handleSelectSignature = (type, value) => {
    if (type === "preparedBy") {
      setPreparedBySignature(value);
      setShowPreparedBySuggestions(false);
      localStorage.setItem("form_preparedBySignature", value);
    } else {
      setCheckedBySignature(value);
      setShowCheckedBySuggestions(false);
      localStorage.setItem("form_checkedBySignature", value);
    }
  };

  const createInitialRevision = async (workorderId) => {
    const revisionPayload = {
      workorderId: Number(workorderId),
      reviseNumber: "1.0", // Always start new work order with 1.0 revision
      createdDate: getFormattedDate(),
      createdBy: Number(userId),
      updatedDate: getFormattedDate(),
      updatedBy: Number(userId),
      currentFlag: false,
      pdfLocation: "",
      revisionStage: "started",
      revisionStatus: "pending",
      deletedFlag: "no"
    };
    const response = await fetch(`${API_BASE_URL}/workorder-revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` },
      body: JSON.stringify(revisionPayload)
    });
    if (!response.ok) throw new Error("Failed to create revision");
    const data = await response.json();
    localStorage.setItem("reviseId", data.id);
    localStorage.setItem("reviseno", data.reviseNumber);
    return data;
  };
  

  const duplicateRevision = async (workorderId, prevRevisionId) => {
    toast.loading('Duplicating revision...');
    try {
      const nextRev = await getNextRevisionNumber(workorderId);
  
      const payload = {
        workorderId: Number(workorderId),
        reviseNumber: nextRev,
        createdDate: getFormattedDate(),
        createdBy: Number(userId),
        updatedDate: getFormattedDate(),
        updatedBy: Number(userId),
        currentFlag: false,
        pdfLocation: "",
        revisionStage: "started",
        revisionStatus: "pending",
        deletedFlag: "no"
        // Optionally copy data from previous revision (fetch with prevRevisionId if you want)
      };
      const response = await fetch(`${API_BASE_URL}/workorder-revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtToken}` },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to duplicate revision");
      const data = await response.json();
      // Save as "active" revision
      localStorage.setItem("reviseId", data.id);
      localStorage.setItem("reviseno", data.reviseNumber);
      toast.dismiss();
      toast.success(`Revision ${nextRev} created`);
      window.location.href = "/subestimate"; // or wherever your edit form is
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || "Failed to duplicate revision");
    }
  };
  
  
  
  // Add work function (API call)
// --- Place this in your component, replacing your addWork ---
const addWork = async () => {
  if (!selectedSSR || !selectedChapter || !selectedArea || !preparedBySignature.trim() || !checkedBySignature.trim()) {
    toast.error("Fill all required fields before proceeding!");
    return;
  }

  const createdDate = getFormattedDate();
  const userIdNum = Number(userId);

  try {
    if (isEditMode && existingRevisionId) {
      // ✅ Edit mode: Update the current revision via PUT
      toast.loading('Updating revision...');
      const updatePayload = {
        id: Number(existingRevisionId),
        workorderId: Number(currentWorkorderId),
        reviseNumber: localStorage.getItem("reviseno") || "1.0",
        updatedDate: createdDate,
        updatedBy: userIdNum,
        createdBy: userIdNum,
        createdDate: createdDate,
        currentFlag: true,
        deletedFlag: "no",
        pdfLocation: "",
        revisionStage: "started",
        revisionStatus: "pending"
      };

      const response = await fetch(`${API_BASE_URL}/workorder-revisions/${existingRevisionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) throw new Error("Failed to update revision");
      toast.dismiss();
      toast.success("Revision updated successfully!");
      localStorage.removeItem("editMode");
      setTimeout(() => window.location.href = "/subestimate", 1000);
      return;
    }

    if (isDuplicateMode) {
      // ✅ Duplicate Mode: Create a new revision for existing work order
      toast.loading("Creating duplicated revision...");
      const nextRev = await getNextRevisionNumber(currentWorkorderId);

      const dupPayload = {
        workorderId: Number(currentWorkorderId),
        reviseNumber: nextRev,
        createdDate,
        updatedDate: createdDate,
        createdBy: userIdNum,
        updatedBy: userIdNum,
        currentFlag: false,
        pdfLocation: "",
        revisionStage: "started",
        revisionStatus: "pending",
        deletedFlag: "no"
      };

      const response = await fetch(`${API_BASE_URL}/workorder-revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(dupPayload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to duplicate revision");

      localStorage.setItem("reviseId", data.id);
      localStorage.setItem("reviseno", data.reviseNumber);
      localStorage.removeItem("duplicateMode");

      toast.dismiss();
      toast.success(`Revision ${data.reviseNumber} created`);
      setTimeout(() => window.location.href = "/subestimate", 1000);
      return;
    }

    // ✅ New Mode: Create WorkOrder and Initial Revision (1.0)
    toast.loading('Creating new estimate...');
    const workOrderPayload = {
      workOrderID: workOrderId,
      nameOfWork: workName,
      state: selectedState,
      ssr: selectedSSR,
      chapterId: parseInt(selectedChapter, 10),
      area: selectedArea,
      createdBy: userIdNum,
      preparedBySignature,
      checkedBySignature,
      createdDate,
      department: selectedDept,
      deletedFlag: 0,
      status: "started",
      multifloor: showMultipleFloorCheckbox ? (isMultipleFloor ? "1" : "0") : "0"
    };

    const workRes = await fetch(`${API_BASE_URL}/workorders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      body: JSON.stringify(workOrderPayload)
    });

    const workData = await workRes.json();
    if (!workRes.ok) throw new Error(workData.message || "Work order creation failed");

    localStorage.setItem("workorderId", workData.id);
    localStorage.setItem("autogenerated", workOrderId);
    localStorage.setItem("status", "started");
    localStorage.setItem("chapter", selectedChapter);
    localStorage.setItem("ssr", selectedSSR);
    localStorage.setItem("area", selectedArea);
    localStorage.setItem("revisionStage", "started");

    // Now create revision 1.0
    const revPayload = {
      workorderId: Number(workData.id),
      reviseNumber: "1.0",
      createdDate,
      updatedDate: createdDate,
      createdBy: userIdNum,
      updatedBy: userIdNum,
      currentFlag: false,
      pdfLocation: "",
      revisionStage: "started",
      revisionStatus: "pending",
      deletedFlag: "no"
    };

    const revRes = await fetch(`${API_BASE_URL}/workorder-revisions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      body: JSON.stringify(revPayload)
    });

    const revData = await revRes.json();
    if (!revRes.ok) throw new Error(revData.message || "Failed to create revision");

    localStorage.setItem("reviseId", revData.id);
    localStorage.setItem("reviseno", revData.reviseNumber);

    toast.dismiss();
    toast.success("Work Order & Revision Created!");
    setTimeout(() => window.location.href = "/subestimate", 1000);
  } catch (error) {
    toast.dismiss();
    toast.error(error.message || "Something went wrong.");
  }
};


  // Function to send data to another API (workorder-revisions)
  const sendToAnotherAPI = async (workorderId, forcedRevision = null) => {
    try {
      const revisionToast = toast.loading('Creating work order revision...');
      const userId = localStorage.getItem("Id") || "92";
      const currentDate = getFormattedDate();
  
      const reviseNumber = forcedRevision || await getNextRevisionNumber(workorderId);
  
      const revisionPayload = {
        workorderId: Number(workorderId),
        reviseNumber: reviseNumber,
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
        throw new Error(`Failed to create revision: ${revisionResponse.status} ${errorText}`);
      }
  
      const revisionData = await revisionResponse.json();
      localStorage.setItem("reviseId", revisionData.id);
      localStorage.setItem("reviseno", revisionData.reviseNumber);
  
      toast.dismiss(revisionToast);
      toast.success("Work order revision created successfully!");
    } catch (error) {
      console.error("Error creating revision:", error);
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
  <Select
    id="ssr"
    options={ssrOptions}
    value={ssrOptions.find(opt => opt.value === selectedSSR)}
    onChange={(selectedOption) => {
      if (selectedOption) {
        setSelectedSSR(selectedOption.value);
        localStorage.setItem("form_selectedSSR", selectedOption.value);
      } else {
        setSelectedSSR("");
        localStorage.setItem("form_selectedSSR", "");
      }
    }}
    placeholder="Select SSR"
    className="react-select-container"
    classNamePrefix="react-select"
    isClearable
  />
</div>

                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
  <label htmlFor="chapters" className="block mb-1 font-medium">Chapter:</label>

  {chapters.length > 0 ? (
    <>
      <select
        key={formResetKey}
        id="chapters"
        className="w-full p-2 border border-gray-300 rounded-md"
        value={selectedChapter}
        onChange={(e) => {
          const selectedValue = e.target.value;
          setSelectedChapter(selectedValue);
          localStorage.setItem("form_selectedChapter", selectedValue);
          const selectedChapterObj = uniqueChapters.find(
            ch => ch.chapterId.toString() === selectedValue
          );
          
          if (selectedChapterObj) {
            const label = selectedChapterObj.chapterCategory.trim().toLowerCase();
            if (label.includes("building work")) {
              setShowMultipleFloorCheckbox(true);
              setIsMultipleFloor(true); // Default to checked
              toast.success("Chapter 'Building Work' selected. Multiple Floor enabled.");
            } else {
              setShowMultipleFloorCheckbox(false);
              setIsMultipleFloor(false);
            }
          }
          
        }}
      >
        <option value="">Select Chapter</option>
        {uniqueChapters.map((chapter) => (
          <option key={chapter.chapterId} value={chapter.chapterId}>
            {chapter.chapterCategory}
          </option>
        ))}
      </select>

      {/* Multiple Floor Checkbox - shown only if chapter is Building Work */}
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
    </>
  ) : (
    <p className="text-sm text-red-500">Loading chapters...</p>
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
    <div className="relative">
      <label htmlFor="preparedBySignature" className="block mb-1 font-medium">
        Prepared By:
      </label>
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
        onFocus={() => setShowPreparedBySuggestions(true)}
         onBlur={() => {
                          // Save to history when field loses focus
                          saveSignatureToHistory("preparedBy", preparedBySignature);
                          // Delay hiding suggestions to allow clicking
                          setTimeout(() => setShowPreparedBySuggestions(false), 400);
                        }}
      ></textarea>
      
      {/* Suggestions dropdown for Prepared By */}
      {showPreparedBySuggestions && preparedBySuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {preparedBySuggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectSignature("preparedBy", suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
                  
    <div className="relative">
      <label htmlFor="checkedBySignature" className="block mb-1 font-medium">
        Checked By:
      </label>
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
        onFocus={() => setShowCheckedBySuggestions(true)}
         onBlur={() => {
                          // Save to history when field loses focus
                          saveSignatureToHistory("checkedBy", checkedBySignature);
                          // Delay hiding suggestions to allow clicking
                          setTimeout(() => setShowCheckedBySuggestions(false), 400);
                        }}
      ></textarea>
      
      {/* Suggestions dropdown for Checked By */}
      {showCheckedBySuggestions && checkedBySuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {checkedBySuggestions.map((suggestion, index) => (
            <div 
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectSignature("checkedBy", suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
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