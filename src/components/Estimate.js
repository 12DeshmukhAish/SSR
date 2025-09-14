import React, { useState, useEffect, useMemo } from 'react';

import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPlus } from '@fortawesome/free-solid-svg-icons';
import { FaWhatsapp } from "react-icons/fa";
import Stepper from './Stepper';
import toast, { Toaster } from 'react-hot-toast';
import { API_BASE_URL} from '../config';
import ContactModal from './Contact';

const EstimateForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [workName, setWorkName] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSSR, setSelectedSSR] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [areaPercentage, setAreaPercentage] = useState('0');
  const [areas, setAreas] = useState([
    { value: "", label: "Select Area", percentage: "0" }
  ]);
  const [states, setStates] = useState([{ value: "", label: "Select State", tin: "" }]);
  const [departments, setDepartments] = useState([{ value: "", label: "Select Department" }]);
  const [ssrOptions, setSSROptions] = useState([{ value: "", label: "Select SSR" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [workOrderId, setWorkOrderId] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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
  const userId = localStorage.getItem("Id") ;
  const jwtToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/master/state`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const transformedStates = [
          { value: "", label: "Select State", tin: "" },
          ...data.map(item => ({
            value: item.state,
            label: item.state,
            tin: item.stateTin.toString(),
            id: item.id
          }))
        ];

        setStates(transformedStates);
        
        const currentSelectedState = localStorage.getItem("form_selectedState") || localStorage.getItem("edit_state") || "";
        const isEditMode = localStorage.getItem("editMode") === "true";
        
        if (currentSelectedState && !isEditMode) {
          const stateObj = transformedStates.find(s => s.value === currentSelectedState);
          if (stateObj && stateObj.tin && stateObj.tin !== "") {
            setSelectedState(currentSelectedState);
          }
        }
        
      } catch (err) {
        console.error('Error fetching states:', err);
        toast.error('Failed to load states. Please try again.');
        setStates([{ value: "", label: "Select State", tin: "" }]);
      }
    };

    if (jwtToken) {
      fetchStates();
    }
  }, [jwtToken]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/departments`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const uniqueDepartments = [...new Set(data.map(item => item.departmentName))];
        
        const transformedDepartments = [
          { value: "", label: "Select Department" },
          ...uniqueDepartments.map(deptName => ({
            value: deptName,
            label: deptName
          }))
        ];

        setDepartments(transformedDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        toast.error('Failed to load departments. Please try again.');
        setDepartments([{ value: "", label: "Select Department" }]);
      }
    };

    if (jwtToken) {
      fetchDepartments();
    }
  }, [jwtToken]);

  useEffect(() => {
    const fetchSSROptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ssr`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const transformedSSROptions = [
          { value: "", label: "Select SSR", ssrId: null },
          ...data.map(item => ({
            value: item.ssrId.toString(),
            label: item.ssrName,
            ssrId: item.ssrId,
            ssrName: item.ssrName,
            createdDate: item.createdDate,
            createdBy: item.createdBy
          }))
        ];

        setSSROptions(transformedSSROptions);
      } catch (err) {
        console.error('Error fetching SSR options:', err);
        toast.error('Failed to load SSR options. Please try again.');
        setSSROptions([{ value: "", label: "Select SSR", ssrId: null }]);
      }
    };

    if (jwtToken) {
      fetchSSROptions();
    }
  }, [jwtToken]);

  useEffect(() => {
    const fetchAreas = async () => {
      if (!selectedSSR || !ssrOptions.length) {
        setAreas([{ value: "", label: "Select Area", percentage: "0" }]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const selectedSSRObj = ssrOptions.find(ssr => ssr.value === selectedSSR);
        if (!selectedSSRObj) {
          setAreas([{ value: "", label: "Select Area", percentage: "0" }]);
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/geo-specific-areas/BySsrId/${selectedSSRObj.ssrId}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const transformedAreas = [
          { value: "", label: "Select Area", percentage: "0" },
          ...data.map(item => ({
            value: item.areaDescription,
            label: item.areaDescription,
            percentage: item.percentageRate.toString(),
            areaId: item.areaId,
            ssrId: item.ssrId
          }))
        ];

        setAreas(transformedAreas);
        setError(null);
      } catch (err) {
        console.error('Error fetching areas:', err);
        setError('Failed to load areas. Please try again.');
        setAreas([{ value: "", label: "Select Area", percentage: "0" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [selectedSSR, ssrOptions, jwtToken]);

  useEffect(() => {
    const savedArea = localStorage.getItem("form_selectedArea");
    if (savedArea && areas.length > 1) {
      setSelectedArea(savedArea);
      const areaObj = areas.find(area => area.value === savedArea);
      setAreaPercentage(areaObj ? areaObj.percentage : '0');
    }
  }, [areas]);

  const handleAreaChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedArea(selectedValue);
    localStorage.setItem("form_selectedArea", selectedValue);
    
    const areaObj = areas.find(area => area.value === selectedValue);
    setAreaPercentage(areaObj ? areaObj.percentage : '0');
  };

  // Updated ID generation useEffect
  useEffect(() => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    const isDuplicateMode = localStorage.getItem("duplicateMode") === "true";
    
    if (isEditMode) {
      // Edit mode - load existing work order ID, never generate new one
      const existingWorkOrderId = localStorage.getItem("autogenerated") || "";
      if (existingWorkOrderId) {
        setWorkOrderId(existingWorkOrderId);
      }
      return; // Exit early for edit mode
    }
    
    // For both new form mode AND duplicate mode - generate fresh ID
    if (selectedState && states.length > 1) {
      const selectedStateObj = states.find(state => state.value === selectedState);
      if (selectedStateObj && selectedStateObj.tin && selectedStateObj.tin !== "") {
        // Always generate fresh ID for new forms and duplicated work orders
        generateCustomID();
      }
    }
  }, [selectedState, states]);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedSSR || selectedSSR === "" || !ssrOptions.length) {
        setChapters([]);
        setShowMultipleFloorCheckbox(false);
        setIsMultipleFloor(false);
        return;
      }

      try {
        toast.loading('Fetching chapters...', { id: 'chapters' });
        
        const ssrId = selectedSSR;
        
        const response = await fetch(`${API_BASE_URL}/api/chapters/BySsrId/${ssrId}`, {
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
        
        const isEditMode = localStorage.getItem("editMode") === "true";
        if (!isEditMode) {
          setSelectedChapter("");
          localStorage.removeItem("form_selectedChapter");
          setShowMultipleFloorCheckbox(false);
          setIsMultipleFloor(false);
        }
        
        toast.success('Chapters loaded successfully!', { id: 'chapters' });
      } catch (error) {
        console.error("Error fetching chapters:", error);
        toast.error(`Failed to fetch chapters: ${error.message}`, { id: 'chapters' });
        setChapters([]);
        setShowMultipleFloorCheckbox(false);
        setIsMultipleFloor(false);
      }
    };

    fetchChapters();
  }, [selectedSSR, ssrOptions, jwtToken]); 

  // Updated form loading useEffect with proper edit/duplicate/new mode handling
  useEffect(() => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    const isDuplicateMode = localStorage.getItem("duplicateMode") === "true";
    
    if (isEditMode) {
      // Edit mode - load from edit_ prefixed localStorage
      setWorkName(localStorage.getItem("edit_nameOfWork") || "");
      
      const savedState = localStorage.getItem("edit_state") || "";
      if (savedState) {
        setSelectedState(savedState);
      }
      
      setSelectedDept(localStorage.getItem("edit_department") || "");
      setSelectedSSR(localStorage.getItem("edit_ssr") || "");
      setSelectedArea(localStorage.getItem("edit_area") || "General Area");
      setPreparedBySignature(localStorage.getItem("edit_preparedBy") || "");
      setCheckedBySignature(localStorage.getItem("edit_checkedBy") || "");
      
      const chapterVal = localStorage.getItem("edit_chapter") || "";
      const savedMultifloor = localStorage.getItem("edit_multifloor");
      setSelectedChapter(chapterVal);
      
      if (chapterVal && chapters.length > 0) {
        const chapterObj = chapters.find(ch => ch.chapterId.toString() === chapterVal);
        if (chapterObj && chapterObj.chapterCategory.toLowerCase().includes("building work")) {
          setShowMultipleFloorCheckbox(true);
          setIsMultipleFloor(savedMultifloor === "1" || savedMultifloor === "true");
        } else {
          setShowMultipleFloorCheckbox(false);
          setIsMultipleFloor(false);
        }
      }
      
      // ONLY in edit mode - load existing work order ID
      const existingWorkOrderId = localStorage.getItem("autogenerated") || "";
      if (existingWorkOrderId) {
        setWorkOrderId(existingWorkOrderId);
      }
    } else if (isDuplicateMode) {
      // Duplicate mode - load data but generate NEW estimate ID
      setWorkName(localStorage.getItem("edit_nameOfWork") || "");
      
      const savedState = localStorage.getItem("edit_state") || "";
      if (savedState) {
        setSelectedState(savedState);
      }
      
      setSelectedDept(localStorage.getItem("edit_department") || "");
      setSelectedSSR(localStorage.getItem("edit_ssr") || "");
      setSelectedArea(localStorage.getItem("edit_area") || "General Area");
      setPreparedBySignature(localStorage.getItem("edit_preparedBy") || "");
      setCheckedBySignature(localStorage.getItem("edit_checkedBy") || "");
      
      const chapterVal = localStorage.getItem("edit_chapter") || "";
      const savedMultifloor = localStorage.getItem("edit_multifloor");
      setSelectedChapter(chapterVal);
      
      if (chapterVal && chapters.length > 0) {
        const chapterObj = chapters.find(ch => ch.chapterId.toString() === chapterVal);
        if (chapterObj && chapterObj.chapterCategory.toLowerCase().includes("building work")) {
          setShowMultipleFloorCheckbox(true);
          setIsMultipleFloor(savedMultifloor === "1" || savedMultifloor === "true");
        } else {
          setShowMultipleFloorCheckbox(false);
          setIsMultipleFloor(false);
        }
      }
      
      // DON'T load workOrderId - let it generate fresh in duplicate mode
    } else {
      // New form mode - load from form_ prefixed localStorage
      setWorkName(localStorage.getItem("form_workName") || "");
      
      const savedState = localStorage.getItem("form_selectedState") || "";
      if (savedState) {
        setSelectedState(savedState);
      }
      
      setSelectedDept(localStorage.getItem("form_selectedDept") || "");
      setSelectedSSR(localStorage.getItem("form_selectedSSR") || "");
      setSelectedArea(localStorage.getItem("form_selectedArea") || "General Area");
      setPreparedBySignature(localStorage.getItem("form_preparedBySignature") || "");
      setCheckedBySignature(localStorage.getItem("form_checkedBySignature") || "");
      
      const chapterVal = localStorage.getItem("form_selectedChapter") || "";
      setSelectedChapter(chapterVal);
      
      if (chapterVal && chapters.length > 0) {
        const chapterObj = chapters.find(ch => ch.chapterId.toString() === chapterVal);
        if (chapterObj && chapterObj.chapterCategory.toLowerCase().includes("building work")) {
          setShowMultipleFloorCheckbox(true);
          setIsMultipleFloor(false);
        } else {
          setShowMultipleFloorCheckbox(false);
          setIsMultipleFloor(false);
        }
      }
      
      // DON'T load workOrderId from localStorage for new forms - let it generate fresh
    }
  }, [chapters]);

  useEffect(() => {
    const savedPreparedBy = JSON.parse(localStorage.getItem("signatureHistory_preparedBy") || "[]");
    const savedCheckedBy = JSON.parse(localStorage.getItem("signatureHistory_checkedBy") || "[]");
    
    setPreparedBySuggestions(savedPreparedBy);
    setCheckedBySuggestions(savedCheckedBy);
  }, []);

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

  const isEstimateComplete = () => {
    return workName.trim() && 
           selectedState.trim() && 
           selectedDept.trim() && 
           selectedSSR.trim() && 
           selectedChapter.trim() && 
           selectedArea.trim() && 
           preparedBySignature.trim() && 
           checkedBySignature.trim();
  };

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
  
  const handlePrevStep = (step) => {
    setCurrentStep(step);
    toast('Previous step', {
      icon: 'ℹ️',
      style: {
        background: '#e3f2fd',
        color: '#1976d2',
      },
    });
  };

  const handleWhatsApp = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsContactModalOpen(false);
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

 
 // Updated generateCustomID function without duplicate checking
const generateCustomID = () => {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const selectedStateObj = states.find(state => state.value === selectedState);
  const tin = selectedStateObj && selectedStateObj.tin ? selectedStateObj.tin : "00";
  
  if (!selectedStateObj || !selectedStateObj.tin || selectedStateObj.tin === "") {
    console.warn("State not properly loaded or TIN missing. Skipping ID generation.");
    return;
  }
  
  const wo = "WO";
  const userId = localStorage.getItem("Id") || "01";
  
  const finalID = `${tin}${wo}${year}${month}${day}${hours}${minutes}${seconds}${userId}`;
  
  setWorkOrderId(finalID);
  
  console.log("Generated ID:", finalID);
};

  const getNextRevisionNumber = async (workorderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/workorder-revisions/ByWorkorderId/${workorderId}`, {
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
  
  const saveSignatureToHistory = (type, value) => {
    if (!value.trim()) return;
    
    const historyKey = `signatureHistory_${type}`;
    const currentHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
    
    if (!currentHistory.includes(value)) {
      const updatedHistory = [value, ...currentHistory];
      const limitedHistory = updatedHistory.slice(0, 10);
      
      localStorage.setItem(historyKey, JSON.stringify(limitedHistory));
      
      if (type === "preparedBy") {
        setPreparedBySuggestions(limitedHistory);
      } else {
        setCheckedBySuggestions(limitedHistory);
      }
    }
  };
  
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
const addWork = async () => {
  if (!selectedSSR || !selectedChapter || !selectedArea || !preparedBySignature.trim() || !checkedBySignature.trim()) {
    toast.error("Fill all required fields before proceeding!");
    return;
  }

  const createdDate = getFormattedDate();
  const userIdNum = Number(userId);

  console.log("DEBUG - Form Values:", {
    workName,
    selectedState,
    selectedDept,
    selectedSSR,
    selectedChapter,
    selectedArea,
    preparedBySignature,
    checkedBySignature,
    workOrderId,
    currentWorkorderId,
    userIdNum,
    isEditMode,
    isDuplicateMode
  });

  try {
    if (isEditMode && existingRevisionId) {
      toast.loading('Updating workorder and revision...');
      
      // Get the existing workorder data first to see what's required
      console.log("DEBUG - Fetching existing workorder:", currentWorkorderId);
      
      const existingWorkorderResponse = await fetch(`${API_BASE_URL}/api/workorders/${currentWorkorderId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Content-Type": "application/json"
        }
      });

      if (!existingWorkorderResponse.ok) {
        throw new Error(`Failed to fetch existing workorder: ${existingWorkorderResponse.status}`);
      }

      const existingWorkorder = await existingWorkorderResponse.json();
      console.log("DEBUG - Existing workorder:", existingWorkorder);

      // Create update payload with all existing fields + updates
      const workorderUpdatePayload = {
        ...existingWorkorder, // Keep all existing fields
        // Override only the fields we want to update
        nameOfWork: workName || existingWorkorder.nameOfWork,
        state: selectedState || existingWorkorder.state,
        department: selectedDept || existingWorkorder.department,
        ssr: selectedSSR || existingWorkorder.ssr,
        area: selectedArea || existingWorkorder.area,
        preparedBySignature: preparedBySignature || existingWorkorder.preparedBySignature,
        checkedBySignature: checkedBySignature || existingWorkorder.checkedBySignature,
        chapterId: selectedChapter ? parseInt(selectedChapter, 10) : existingWorkorder.chapterId,
        updatedBy: userIdNum,
        updatedDate: createdDate,
        multifloor: showMultipleFloorCheckbox ? (isMultipleFloor ? 1 : 0) : (existingWorkorder.multifloor || 0)
      };

      console.log("DEBUG - Update payload:", workorderUpdatePayload);

      const workorderResponse = await fetch(`${API_BASE_URL}/api/workorders/${currentWorkorderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(workorderUpdatePayload)
      });

      console.log("DEBUG - Response status:", workorderResponse.status);
      
      if (!workorderResponse.ok) {
        const errorText = await workorderResponse.text();
        console.error("DEBUG - Error response:", errorText);
        
        // Try to parse error details
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
          console.error("DEBUG - Parsed error:", errorDetails);
        } catch (e) {
          console.error("DEBUG - Raw error text:", errorText);
        }
        
        throw new Error(`Failed to update workorder (${workorderResponse.status}): ${errorText}`);
      }

      const updatedWorkorder = await workorderResponse.json();
      console.log("DEBUG - Updated workorder:", updatedWorkorder);

      // Update localStorage only after successful API call
      localStorage.setItem("nameOfWork", workName);
      localStorage.setItem("edit_nameOfWork", workName);
      localStorage.setItem("state", selectedState);
      localStorage.setItem("edit_state", selectedState);
      localStorage.setItem("department", selectedDept);
      localStorage.setItem("edit_department", selectedDept);
      localStorage.setItem("ssr", selectedSSR);
      localStorage.setItem("edit_ssr", selectedSSR);
      localStorage.setItem("area", selectedArea);
      localStorage.setItem("edit_area", selectedArea);
      localStorage.setItem("preparedBy", preparedBySignature);
      localStorage.setItem("edit_preparedBy", preparedBySignature);
      localStorage.setItem("checkedBy", checkedBySignature);
      localStorage.setItem("edit_checkedBy", checkedBySignature);
      localStorage.setItem("chapter", selectedChapter);
      localStorage.setItem("edit_chapter", selectedChapter);

      // Update revision
      const revisionUpdatePayload = {
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

      console.log("DEBUG - Revision update payload:", revisionUpdatePayload);

      const revisionResponse = await fetch(`${API_BASE_URL}/api/workorder-revisions/${existingRevisionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(revisionUpdatePayload)
      });

      if (!revisionResponse.ok) {
        const revisionError = await revisionResponse.text();
        console.error("DEBUG - Revision update error:", revisionError);
        throw new Error(`Failed to update revision: ${revisionError}`);
      }
      
      toast.dismiss();
      toast.success("Workorder and revision updated successfully!");
      localStorage.removeItem("editMode");
      setTimeout(() => window.location.href = "/subestimate", 1000);
      return;
    }

    // Handle duplicate mode (creates new workorder)
    if (isDuplicateMode) {
      toast.loading("Creating new duplicated workorder...");
      
      const newWorkorderPayload = {
        workOrderID: workOrderId,
        nameOfWork: workName,
        state: selectedState,
        department: selectedDept,
        ssr: selectedSSR,
        area: selectedArea,
        preparedBySignature: preparedBySignature,
        checkedBySignature: checkedBySignature,
        chapterId: parseInt(selectedChapter, 10),
        createdBy: userIdNum,
        updatedBy: userIdNum,
        createdDate: createdDate,
        updatedDate: createdDate,
        status: "started",
        deletedFlag: 0,
        multifloor: showMultipleFloorCheckbox ? (isMultipleFloor ? 1 : 0) : 0
      };

      console.log("DEBUG - New workorder payload:", newWorkorderPayload);

      const newWorkorderResponse = await fetch(`${API_BASE_URL}/api/workorders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(newWorkorderPayload)
      });

      if (!newWorkorderResponse.ok) {
        const errorText = await newWorkorderResponse.text();
        console.error("DEBUG - New workorder error:", errorText);
        throw new Error(`Failed to create new workorder: ${errorText}`);
      }

      const newWorkorderData = await newWorkorderResponse.json();
      console.log("DEBUG - New workorder created:", newWorkorderData);
      
      // Update localStorage and continue with revision creation...
      localStorage.setItem("workorderId", newWorkorderData.id.toString());
      localStorage.setItem("recordId", newWorkorderData.id.toString());
      localStorage.setItem("autogenerated", workOrderId);
      localStorage.setItem("nameOfWork", workName);
      localStorage.setItem("edit_nameOfWork", workName);
      
      // Create revision for new workorder...
      const revisionPayload = {
        workorderId: newWorkorderData.id,
        reviseNumber: "1.0",
        createdDate,
        updatedDate: createdDate,
        createdBy: userIdNum,
        updatedBy: userIdNum,
        currentFlag: true,
        pdfLocation: "",
        revisionStage: "started",
        revisionStatus: "pending",
        deletedFlag: "no"
      };

      const revisionResponse = await fetch(`${API_BASE_URL}/api/workorder-revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(revisionPayload)
      });

      if (!revisionResponse.ok) {
        const revisionError = await revisionResponse.text();
        console.error("DEBUG - Revision creation error:", revisionError);
        throw new Error(`Failed to create revision: ${revisionError}`);
      }

      const newRevisionData = await revisionResponse.json();
      localStorage.setItem("reviseId", newRevisionData.id.toString());
      localStorage.setItem("reviseno", "1.0");
      localStorage.removeItem("duplicateMode");

      toast.dismiss();
      toast.success("New workorder created successfully!");
      setTimeout(() => window.location.href = "/subestimate", 1000);
      return;
    }


    // New workorder creation (unchanged)
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
      multifloor: showMultipleFloorCheckbox ? (isMultipleFloor ? 1 : 0) : 0
    };

    const workRes = await fetch(`${API_BASE_URL}/api/workorders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      body: JSON.stringify(workOrderPayload)
    });

    const workData = await workRes.json();
    if (!workRes.ok) throw new Error(workData.message || "Estimate creation failed");

    // Save to localStorage
    localStorage.setItem("workorderId", workData.id);
    localStorage.setItem("autogenerated", workOrderId);
    localStorage.setItem("nameOfWork", workName);
    localStorage.setItem("status", "started");
    localStorage.setItem("chapter", selectedChapter);
    localStorage.setItem("ssr", selectedSSR);
    localStorage.setItem("area", selectedArea);
    localStorage.setItem("state", selectedState);
    localStorage.setItem("department", selectedDept);
    localStorage.setItem("preparedBy", preparedBySignature);
    localStorage.setItem("checkedBy", checkedBySignature);
    localStorage.setItem("revisionStage", "started");

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

    const revRes = await fetch(`${API_BASE_URL}/api/workorder-revisions`, {
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
    toast.success("Estimate & Revision Created!");
    setTimeout(() => window.location.href = "/subestimate", 1000);
  } catch (error) {
    toast.dismiss();
    toast.error(error.message || "Something went wrong.");
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
      background: '#fff',
      color: '#363636',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    success: {
      duration: 3000,
      style: {
        border: '1px solid #10B981',
      },
      iconTheme: {
        primary: '#10B981',
        secondary: 'white',
      },
    },
    error: {
      duration: 4000,
      style: {
        border: '1px solid #EF4444',
      },
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
  currentStep={1} // Always show as step 1 when on estimate page
  onStepClick={(stepId) => {
    // Handle internal form step navigation
    if (stepId < currentStep) {
      setCurrentStep(stepId); // Go back freely
    } else if (stepId > currentStep) {
      // Check if estimate is complete before allowing forward navigation
      if (currentStep === 2 && !isEstimateComplete()) {
        toast.error("Please complete all estimate fields before proceeding to the next step!");
        return;
      }
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
        <option key={state.value || state.id} value={state.value} data-tin={state.tin}>
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
        <option key={dept.value || dept.id} value={dept.value}>
          {dept.label}
        </option>
      ))}
    </select>
  </div>
</div>      
                
                <button 
                  className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
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
    value={workOrderId || ''} 
    readOnly 
    placeholder={workOrderId ? '' : 'ID will generate when state is selected...'}
  />
  {!workOrderId && selectedState && (
    <p className="text-sm text-blue-500 mt-1">Generating estimate ID...</p>
  )}
  {workOrderId && (
    <p className="text-sm text-green-600 mt-1">
      {isEditMode ?'': 
       isDuplicateMode ? '' : 
       ''}
    </p>
  )}
</div>
                  
                              

<div>
  <label htmlFor="ssr" className="block mb-1 font-medium">SSR:</label>
 <Select
  id="ssr"
  options={ssrOptions}
  value={ssrOptions.find(opt => opt.value === selectedSSR) || null}
  onChange={(selectedOption) => {
    if (selectedOption && selectedOption.value !== "") {
      setSelectedSSR(selectedOption.value); // This is ssrId
      
      // ✅ FIXED: Use consistent localStorage keys
      const isEditMode = localStorage.getItem("editMode") === "true";
      
      if (isEditMode) {
        localStorage.setItem("edit_ssr", selectedOption.value); // Store ID
        localStorage.setItem("edit_ssrName", selectedOption.label); // Store Name
      } else {
        localStorage.setItem("form_selectedSSR", selectedOption.value); // ✅ FIXED: Use form_selectedSSR
        localStorage.setItem("form_ssrName", selectedOption.label); // Store Name
      }
      
      // Reset dependent selections for new forms
      if (!isEditMode) {
        setSelectedChapter("");
        localStorage.removeItem("form_selectedChapter");
        setShowMultipleFloorCheckbox(false);
        setIsMultipleFloor(false);
      }
    } else {
      setSelectedSSR("");
      const isEditMode = localStorage.getItem("editMode") === "true";
      
      if (isEditMode) {
        localStorage.removeItem("edit_ssr");
        localStorage.removeItem("edit_ssrName");
        setSelectedChapter("");
        localStorage.removeItem("edit_selectedChapter");
      } else {
        localStorage.removeItem("form_selectedSSR"); // ✅ FIXED: Use form_selectedSSR
        localStorage.removeItem("form_ssrName");
        setSelectedChapter("");
        localStorage.removeItem("form_selectedChapter");
      }
      
      setShowMultipleFloorCheckbox(false);
      setIsMultipleFloor(false);
    }
  }}
  placeholder="Select SSR"
  className="react-select-container"
  classNamePrefix="react-select"
  isClearable
  isSearchable
/>
</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <div>
  <label htmlFor="chapters" className="block mb-1 font-medium">Chapter:</label>

  {chapters.length > 0 ? (
    <>
      <select
        key={`chapter-${selectedSSR}-${formResetKey}`} // Better key for reset
        id="chapters"
        className="w-full p-2 border border-gray-300 rounded-md"
        value={selectedChapter}
        onChange={(e) => {
          const selectedValue = e.target.value;
          setSelectedChapter(selectedValue);
          
          if (selectedValue) {
            localStorage.setItem("form_selectedChapter", selectedValue);
            
            // Find selected chapter object
            const selectedChapterObj = uniqueChapters.find(
              ch => ch.chapterId.toString() === selectedValue
            );
            
            if (selectedChapterObj) {
              const categoryLower = selectedChapterObj.chapterCategory.trim().toLowerCase();
              
              if (categoryLower.includes("building work")) {
                setShowMultipleFloorCheckbox(true);
                
                // ✅ FIXED: Check for edit mode multifloor value
                const savedMultifloor = localStorage.getItem("edit_multifloor");
                if (savedMultifloor) {
                  setIsMultipleFloor(savedMultifloor === "1" || savedMultifloor === "true");
                } else {
                  setIsMultipleFloor(false); // Default for new entries
                }
                
                toast.success("Chapter 'Building Work' selected. Multiple Floor checkbox available.");
              } else {
                setShowMultipleFloorCheckbox(false);
                setIsMultipleFloor(false);
                localStorage.removeItem("edit_multifloor");
              }
            }
          } else {
            localStorage.removeItem("form_selectedChapter");
            setShowMultipleFloorCheckbox(false);
            setIsMultipleFloor(false);
            localStorage.removeItem("edit_multifloor");
          }
        }}
      >
        <option value="">Select Chapter</option>
        {uniqueChapters.map((chapter) => (
          <option key={`${chapter.chapterId}-${chapter.chapterCategory}`} value={chapter.chapterId}>
            {chapter.chapterCategory}
          </option>
        ))}
      </select>

      {/* ✅ FIXED: Multiple Floor Checkbox with proper state management */}
      {showMultipleFloorCheckbox && (
        <div className="mt-2">
          <div className="flex items-center">
            <input
              id="multipleFloor"
              type="checkbox"
              className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={isMultipleFloor}
              onChange={(e) => {
                const newValue = e.target.checked;
                setIsMultipleFloor(newValue);
                
                // Save to localStorage for form persistence
                localStorage.setItem("edit_multifloor", newValue ? "1" : "0");
              }}
            />
            <label htmlFor="multipleFloor" className="text-sm font-medium text-gray-700">
              Multiple Floor
            </label>
          </div>
        </div>
      )}
    </>
  ) : selectedSSR ? (
    <p className="text-sm text-blue-500">Loading chapters...</p>
  ) : (
    <p className="text-sm text-gray-500">Please select an SSR first</p>
  )}
</div>

                  
                   <div>
      <label htmlFor="area" className="block mb-1 font-medium">
        Specified Area
      </label>
      
      {loading ? (
        <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
          Loading areas...
        </div>
      ) : error ? (
        <div>
          <select
            id="area"
            className="w-full p-2 border border-red-300 rounded-md"
            value={selectedArea}
            onChange={handleAreaChange}
            disabled
          >
            <option value="">Error loading areas</option>
          </select>
          <p className="mt-1 text-red-500 text-sm">{error}</p>
        </div>
      ) : (
        <select
          id="area"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedArea}
          onChange={handleAreaChange}
        >
          {areas.map((area, index) => (
            <option
              key={area.areaId || index}
              value={area.value}
            >
              {area.label}
            </option>
          ))}
        </select>
      )}
      
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
        // Save to history when field loses focus (only if has content)
        if (preparedBySignature.trim()) {
          saveSignatureToHistory("preparedBy", preparedBySignature.trim());
        }
        // Delay hiding suggestions to allow clicking
        setTimeout(() => setShowPreparedBySuggestions(false), 200);
      }}
    ></textarea>
      
      {/* Suggestions dropdown for Prepared By */}
   {showPreparedBySuggestions && preparedBySuggestions.length > 0 && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {preparedBySuggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur
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
        // Save to history when field loses focus (only if has content)
        if (checkedBySignature.trim()) {
          saveSignatureToHistory("checkedBy", checkedBySignature.trim());
        }
        // Delay hiding suggestions to allow clicking
        setTimeout(() => setShowCheckedBySuggestions(false), 200);
      }}
    ></textarea>
    
    {/* Suggestions dropdown for Checked By */}
    {showCheckedBySuggestions && checkedBySuggestions.length > 0 && (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
        {checkedBySuggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            onMouseDown={(e) => e.preventDefault()} // Prevent blur
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
                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
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
            
              
                 
            
                  {/* Contact Modal */}
                  {isContactModalOpen && (
                    <ContactModal 
                      isOpen={isContactModalOpen}
                      onClose={handleCloseModal}
                    />
                  )}
                </div>
          
        </div>
      </div>
    </div>
  );
};

export default EstimateForm;