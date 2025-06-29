import React, { useState, useEffect ,useRef} from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, FileText, Copy, Edit } from 'lucide-react';
import DuplicateModal from "./DuplicateModal"; 
import { MdDelete, MdAdd } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { FaFlagCheckered, FaCheck, FaTrash, FaPlus, FaWhatsapp, FaFilePdf } from "react-icons/fa";
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const MyWork = () => {
  const [dateRange, setDateRange] = useState('1M');
  const [selectedWorkorderId, setSelectedWorkorderId] = useState(null);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [subRecords, setSubRecords] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  // Add missing loadFromLocalStorage function
  const loadFromLocalStorage = (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  // Add saveToLocalStorage function for completeness
  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };
// Enhanced handleRowClick function with comprehensive data mapping
const handleRowClick = async (record, event) => {
  // Prevent row click when clicking on action buttons or expand button
  if (event.target.closest('button') || event.target.closest('.action-buttons')) {
    return;
  }

  // Show loading toast
  const loadingToast = toast.loading('Opening work order for editing...');

  try {
    // Get current user data BEFORE clearing localStorage
    const userData = getUserData();
    
    if (!userData.token || !userData.uid) {
      toast.dismiss(loadingToast);
      toast.error('Authentication data missing. Please login again.');
      navigate('/signin');
      return;
    }

    // Validate token before proceeding
    try {
      const testResponse = await fetch('https://24.101.103.87:8082/api/chapters', {
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Connection error. Please check your network.');
      return;
    }

    // Store critical auth data first
    const authData = {
      token: userData.token,
      uid: userData.uid,
      jwt: userData.token,
      Id: userData.uid,
      userId: userData.uid,
       userToken: userData.token,
    authToken: userData.token 
    };

    // Store the complete user object as well (if it exists)
    const userObject = localStorage.getItem('user');
    
    // Clear localStorage but preserve auth data
    localStorage.clear();
    
    // Restore auth data immediately
    Object.entries(authData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // Restore user object if it existed
    if (userObject) {
      localStorage.setItem('user', userObject);
    }
    
    // Set up localStorage for editing the work order
    localStorage.setItem('recordId', record.id.toString());
    localStorage.setItem('workorderId', record.id.toString());
    localStorage.setItem('editMode', 'true');
    localStorage.setItem('isEditing', 'true'); // Additional flag
    
    // Store workorder data with ALL possible field name variations
    // The Estimate page might be looking for different field names
    
    // Name of Work variations
    const nameOfWork = record.nameOfWork || record.name || record.workName || "";
    localStorage.setItem("nameOfWork", nameOfWork);
    localStorage.setItem("edit_nameOfWork", nameOfWork);
    localStorage.setItem("workName", nameOfWork);
    localStorage.setItem("name", nameOfWork);
    
    // State variations
    const state = record.state || record.stateName || "";
    localStorage.setItem("state", state);
    localStorage.setItem("edit_state", state);
    localStorage.setItem("stateName", state);
    
    // Department variations
    const department = record.department || record.dept || "";
    localStorage.setItem("department", department);
    localStorage.setItem("edit_department", department);
    localStorage.setItem("dept", department);
    
    // SSR variations
    const ssr = record.ssr || record.SSR || "";
    localStorage.setItem("ssr", ssr);
    localStorage.setItem("edit_ssr", ssr);
    localStorage.setItem("SSR", ssr);
    
    // Area variations
    const area = record.area || record.areaName || "";
    localStorage.setItem("area", area);
    localStorage.setItem("edit_area", area);
    localStorage.setItem("areaName", area);
    
    // Prepared By variations
    const preparedBy = record.preparedBySignature || record.preparedBy || record.prepared_by || "";
    localStorage.setItem("preparedBy", preparedBy);
    localStorage.setItem("edit_preparedBy", preparedBy);
    localStorage.setItem("preparedBySignature", preparedBy);
    localStorage.setItem("prepared_by", preparedBy);
    
    // Checked By variations
    const checkedBy = record.checkedBySignature || record.checkedBy || record.checked_by || "";
    localStorage.setItem("checkedBy", checkedBy);
    localStorage.setItem("edit_checkedBy", checkedBy);
    localStorage.setItem("checkedBySignature", checkedBy);
    localStorage.setItem("checked_by", checkedBy);
    
    // Chapter variations
    const chapter = record.chapterId?.toString() || record.chapter?.toString() || "";
    localStorage.setItem("chapter", chapter);
    localStorage.setItem("edit_chapter", chapter);
    localStorage.setItem("chapterId", chapter);
    localStorage.setItem("selectedChapter", chapter);
    
    // Work Order ID variations
    const workOrderId = record.workOrderID || record.workOrderId || record.workorder_id || "";
    localStorage.setItem("autogenerated", workOrderId);
    localStorage.setItem("workOrderID", workOrderId);
    localStorage.setItem("workOrderId", workOrderId);
    localStorage.setItem("workorder_id", workOrderId);
    
    // Status variations
    const status = record.status || record.workStatus || "";
    localStorage.setItem("status", status);
    localStorage.setItem("workStatus", status);
    
    // Clear any duplicate flags
    localStorage.removeItem('duplicateRevision');
    localStorage.removeItem('reviseId');
    localStorage.removeItem('reviseno');
    localStorage.removeItem('duplicateMode');
    localStorage.removeItem('isDuplicating');
    
    // Store additional metadata
    localStorage.setItem("workOrderCreatedDate", record.createdDate || "");
    localStorage.setItem("workOrderCreatedBy", record.createdBy?.toString() || "");
    localStorage.setItem("createdDate", record.createdDate || "");
    localStorage.setItem("createdBy", record.createdBy?.toString() || "");
    
    // Store the complete record object as JSON for fallback
    localStorage.setItem("selectedWorkOrder", JSON.stringify(record));
    localStorage.setItem("workOrderData", JSON.stringify(record));
    localStorage.setItem("editingWorkOrder", JSON.stringify(record));
    
    // Store edit flags with different names the Estimate page might check
    localStorage.setItem("mode", "edit");
    localStorage.setItem("editingMode", "true");
    localStorage.setItem("isEditMode", "true");
    
    // Debug logs
    console.log('Stored work order data for editing:', {
      recordId: record.id,
      nameOfWork: nameOfWork,
      state: state,
      department: department,
      chapter: chapter,
      editMode: localStorage.getItem('editMode'),
      token: userData.token ? `${userData.token.substring(0, 10)}...` : 'No token'
    });
    
    toast.dismiss(loadingToast);
    toast.success('Work order data loaded for editing');
    
    // Add a small delay to ensure localStorage is written
    setTimeout(() => {
      navigate('/estimate');
    }, 100);
    
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Failed to open work order: ' + error.message);
    console.error('Error in handleRowClick:', error);
  }
};
 const handleVisibilityChange = () => {
  if (!document.hidden) {
    // Page became visible, check for updates
    const updated = localStorage.getItem("estimateUpdated");
    if (updated === "true") {
      localStorage.removeItem("estimateUpdated");
      fetchData();
    }
  }
};

  useEffect(() => {
    // Check authentication status on component mount
    if (!checkAuthAndRedirect()) {
      return; // Don't continue if not authenticated
    }
    
    // Log current auth status for debugging
    const { token, uid } = getUserData();
    console.log('Auth Status:', { 
      hasToken: !!token, 
      hasUid: !!uid,
      token: token ? `${token.substring(0, 10)}...` : 'None',
      uid: uid 
    });
    // Ensure token consistency across all storage keys
  ensureTokenConsistency(); // ADD THIS LINE
  


    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); 

  useEffect(() => {
    const { token, uid } = getUserData();
    
    if (token && uid) {
      fetchData();
    } else if (!checkAuthAndRedirect()) {
      return;
    }
    
    const updated = localStorage.getItem("estimateUpdated");
    if (updated === "true") {
      localStorage.removeItem("estimateUpdated");
      fetchData();
    }
  }, []); 

  const getUserData = () => {
  try {
    // Try to get the complete user object first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const token = userData.jwt || userData.token || userData.authToken;
      const uid = userData.id?.toString() || userData.uid?.toString();
      
      // IMPORTANT: Store authToken for SubEstimate compatibility
      if (token && !localStorage.getItem('authToken')) {
        localStorage.setItem('authToken', token);
      }
      
      return { token, uid };
    }
    
    // Fallback to individual items - ENHANCED
    const token = localStorage.getItem('jwt') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('userToken') ||
                  localStorage.getItem('token');
    
    const uid = localStorage.getItem('Id') || 
                localStorage.getItem('id') || 
                localStorage.getItem('uid');
    
    // IMPORTANT: Ensure authToken is always available for SubEstimate
    if (token && !localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', token);
    }
    
    return { 
      token: token, 
      uid: uid?.toString() 
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    
    // Last resort fallback
    const fallbackToken = localStorage.getItem('authToken') || 
                         localStorage.getItem('jwt') || 
                         localStorage.getItem('userToken');
    const fallbackUid = localStorage.getItem('Id') || localStorage.getItem('id');
    
    return {
      token: fallbackToken,
      uid: fallbackUid
    };
  }
};


  // Add this function to check if user is properly authenticated
  const checkAuthAndRedirect = () => {
    const { token, uid } = getUserData();
    
    if (!token || !uid) {
      toast.error('Authentication required. Please login again.');
      // Clear any incomplete auth data
      localStorage.clear();
      // Redirect to login
      navigate('/signin');
      return false;
    }
    
    return true;
  };

  const { token, uid } = getUserData();

  useEffect(() => {
    applyDateRange();
  }, [dateRange]);

  const fetchData = async () => {
    if (!token || !uid) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://24.101.103.87:8082/api/workorders/ByUser/${uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return;
        }
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        throw new Error('Expected array but received: ' + JSON.stringify(data));
      }
  
      // Filter and sort by createdDate (newest first)
       const sorted = data
    .filter(item => item.deletedFlag === 0)
    .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

  // Add an absoluteIndex property to each record (descending order)
  const indexedRecords = sorted.map((record, index) => ({
    ...record,
    absoluteIndex: sorted.length - index // This will give descending serial numbers
  }));
  
      setRecords(indexedRecords);
    } catch (err) {
      console.error('fetchData failed:', err.message);
      toast.error('Failed to load work orders');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Add New button click
  const handleAddNew = () => {
  // Clear specific edit mode data but preserve template data
  localStorage.removeItem('editMode');
  localStorage.removeItem('recordId');
  localStorage.removeItem('reviseId');
  localStorage.removeItem('duplicateRevision');
  localStorage.removeItem('revisionToCopyId');
  
  // Get template data from localStorage (all fields except name of work and chapter)
  const templateData = {
    // Customer/Client Information
    customerName: localStorage.getItem('template_customerName') || '',
    customerAddress: localStorage.getItem('template_customerAddress') || '',
    customerPhone: localStorage.getItem('template_customerPhone') || '',
    customerEmail: localStorage.getItem('template_customerEmail') || '',
    
    // Project Information
    projectLocation: localStorage.getItem('template_projectLocation') || '',
    projectType: localStorage.getItem('template_projectType') || '',
    estimateDate: localStorage.getItem('template_estimateDate') || new Date().toISOString().split('T')[0],
    validUntil: localStorage.getItem('template_validUntil') || '',
    
    // Financial Information
    laborRate: localStorage.getItem('template_laborRate') || '',
    materialMarkup: localStorage.getItem('template_materialMarkup') || '',
    taxRate: localStorage.getItem('template_taxRate') || '',
    
    // Terms and Conditions
    paymentTerms: localStorage.getItem('template_paymentTerms') || '',
    warrantyInfo: localStorage.getItem('template_warrantyInfo') || '',
    additionalNotes: localStorage.getItem('template_additionalNotes') || '',
    
    // Company Information
    companyName: localStorage.getItem('template_companyName') || '',
    companyAddress: localStorage.getItem('template_companyAddress') || '',
    companyPhone: localStorage.getItem('template_companyPhone') || '',
    companyEmail: localStorage.getItem('template_companyEmail') || '',
    companyLicense: localStorage.getItem('template_companyLicense') || '',
    
    // Exclude these fields - they should be empty for new estimates
    workName: '', // This should be empty
    chapter: '', // This should be empty
    
    // Set template mode flag
    isTemplate: true
  };
  
  // Store the template data for the new estimate
  localStorage.setItem('newEstimateTemplate', JSON.stringify(templateData));
  
  navigate('/estimate');
};

  // Handle WhatsApp button click
  const handleWhatsApp = () => {
    if (records.length === 0) {
      toast.error('No records available to share');
      return;
    }
    
    const shareText = records.map(item => 
      `Work ID: ${item.id}\nName: ${item.nameOfWork}\nStatus: ${item.status}`
    ).join('\n\n');
  
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const fetchSubRecords = async (workorderId) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${workorderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return;
        }
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected array in subRecords');
      }
      
      const filtered = data.filter(rec => rec.deletedFlag.toLowerCase() === 'no');
      setSubRecords(prev => ({ ...prev, [workorderId]: filtered }));
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to load revisions');
    }
  };

  const applyDateRange = () => {
    const today = new Date();
    let start = new Date();
    if (dateRange === '1M') start.setMonth(today.getMonth() - 1);
    else if (dateRange === '3M') start.setMonth(today.getMonth() - 3);
    else if (dateRange === '1Y') start.setFullYear(today.getFullYear() - 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const toggleRow = async (id) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    setExpandedRows(prev => {
      // Toggle the current row only
      const expanded = { ...prev, [id]: !prev[id] };
      return expanded;
    });
  
    // If expanding (true), always fetch the latest revisions from API
    if (!expandedRows[id]) {
      setSubRecords(prev => ({ ...prev, [id]: undefined })); // Clear old data while loading
      try {
        const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Session expired. Please login again.');
            localStorage.clear();
            navigate('/signin');
            return;
          }
          throw new Error(`Error fetching revisions for workorder ${id}`);
        }
        const data = await response.json();
        // Only include revisions where deletedFlag === 'no'
        const filtered = (data || []).filter(rec => String(rec.deletedFlag).toLowerCase() === 'no');
        setSubRecords(prev => ({ ...prev, [id]: filtered }));
      } catch (err) {
        setSubRecords(prev => ({ ...prev, [id]: [] }));
        toast.error('Failed to load revisions');
      }
    }
  };
  
const handleDelete = async (id, event) => {
  // Prevent row click when clicking delete button
  event.stopPropagation();
  
  if (!token) {
    toast.error('Authentication required. Please login again.');
    return;
  }

  // Show confirmation dialog
  const confirmed = window.confirm('Are you sure you want to delete this work order? This action cannot be undone.');
  if (!confirmed) return;

  const loadingToast = toast.loading('Deleting work order...');

  try {
    const response = await fetch(`https://24.101.103.87:8082/api/workorders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletedFlag: 1 }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      if (response.status === 404) {
        toast.dismiss(loadingToast);
        toast.error('Work order not found.');
        return;
      }
      if (response.status === 403) {
        toast.dismiss(loadingToast);
        toast.error('You do not have permission to delete this work order.');
        return;
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    toast.dismiss(loadingToast);
    toast.success('Work order deleted successfully!');
    
    // Refresh records after successful deletion
    await fetchData();
    
  } catch (err) {
    toast.dismiss(loadingToast);
    console.error('Delete error:', err);
    toast.error('Failed to delete work order. Please try again.');
  }
};
const handleDuplicate = async (workorderId, revisionToCopy, workorderRecord) => {
  // Check if PDF exists for this revision
  if (revisionToCopy && revisionToCopy.pdfLocation) {
    // If PDF exists, download it instead of duplicating
    downloadPDF(revisionToCopy.pdfLocation);
    return;
  }

  try {
    // Show loading toast
    const loadingToast = toast.loading('Duplicating workorder with all content...');

    // Check authentication first
    if (!token) {
      toast.dismiss(loadingToast);
      toast.error('Authentication required. Please login again.');
      return;
    }

    const API_BASE_URL = "https://24.101.103.87:8082/api";
    const states = [
      { value: "", label: "Select State", tin: "" },
      { value: "demo1", label: "demo1", tin: "23" },
      { value: "MH", label: "MH", tin: "27" },
      { value: "demo2", label: "demo2", tin: "34" }
    ];

    // Generate new work order ID
    const newWorkOrderID = generateCustomWorkOrderID(workorderRecord.state, states);

    // 1. Create new workorder with duplicated data
    const originalName = workorderRecord.nameOfWork || 'Untitled Work';
    const newWorkorderPayload = {
      workOrderID: newWorkOrderID,
      nameOfWork: ` ${originalName}`,
      state: workorderRecord.state || '',
      department: workorderRecord.department || '',
      ssr: workorderRecord.ssr || '',
      area: workorderRecord.area || '',
      preparedBySignature: workorderRecord.preparedBySignature || '',
      checkedBySignature: workorderRecord.checkedBySignature || '',
      chapterId: workorderRecord.chapterId || null,
      status: "started", 
      createdBy: parseInt(uid) || 1,
      updatedBy: parseInt(uid) || 1,
      deletedFlag: 0,
      multifloor: workorderRecord.multifloor || 0,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    console.log('New workorder payload:', newWorkorderPayload);

    const newWorkorderResponse = await fetch(`${API_BASE_URL}/workorders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newWorkorderPayload)
    });

    if (!newWorkorderResponse.ok) {
      const errorText = await newWorkorderResponse.text();
      console.error('Workorder creation error:', errorText);
      
      if (newWorkorderResponse.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      throw new Error(`Failed to create new workorder: ${newWorkorderResponse.status} - ${errorText}`);
    }

    const newWorkorderData = await newWorkorderResponse.json();
    const newWorkorderId = newWorkorderData.id;
    console.log('New workorder created:', newWorkorderData);

    // 2. Create initial revision for the new workorder with revision number "1.0"
    const revisionPayload = {
      workorderId: parseInt(newWorkorderId),
      reviseNumber: "1.0", // Changed from "1" to "1.0"
      createdBy: parseInt(uid) || 1,
      updatedBy: parseInt(uid) || 1,
      currentFlag: true,
      deletedFlag: "no",
      pdfLocation: "",
      revisionStage: "in-progress",
      revisionStatus: "pending",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    const revisionResponse = await fetch(`${API_BASE_URL}/workorder-revisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(revisionPayload)
    });

    if (!revisionResponse.ok) {
      const errorText = await revisionResponse.text();
      console.error('Revision creation error:', errorText);
      
      if (revisionResponse.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      throw new Error(`Failed to create revision: ${revisionResponse.status} - ${errorText}`);
    }

    const newRevisionData = await revisionResponse.json();
    const newRevisionId = newRevisionData.id;
    console.log('New revision created:', newRevisionData);

    // 3. Clear localStorage to avoid conflicts
    const keysToRemove = [
      'recordId', 'workorderId', 'reviseId', 'editMode', 'reviseno', 
      'revisionNumber', 'currentRevisionNumber', 'duplicateRevision',
      'edit_nameOfWork', 'edit_state', 'edit_department', 'edit_ssr', 
      'edit_area', 'edit_preparedBy', 'edit_checkedBy', 'edit_chapter',
      'nameOfWork', 'state', 'department', 'ssr', 'area', 'preparedBy', 
      'checkedBy', 'chapter', 'autogenerated', 'status',
      'revisionStage', 'revisionStatus', 'isEditMode', 'editingRevision', 
      'currentRevisionId', 'originalRevisionData', 'subworkData',
      'revisionItems', 'revisionMeasurements', 'revisionDataBySubwork',
      'totalSubworks', 'totalItems', 'totalMeasurements', 'isDuplicatingRevision',
      'sourceSubworkData', 'sourceRevisionItems', 'sourceRevisionMeasurements',
      'sourceDataBySubwork', 'needsDuplication', 'chapterName', 'chapterDetails',
      'estimateData', 'estimateItems', 'estimateMeasurements'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // 4. Set localStorage data for the new workorder and revision
    localStorage.setItem("editMode", "true");
    localStorage.setItem("isEditMode", "true");
    localStorage.setItem("workorderId", newWorkorderId.toString());
    localStorage.setItem("recordId", newWorkorderId.toString());
    localStorage.setItem("reviseId", newRevisionId.toString());
    localStorage.setItem("reviseno", "1.0"); // Changed from "1" to "1.0"
    localStorage.setItem("revisionNumber", "1.0"); // Changed from "1" to "1.0"
    localStorage.setItem("currentRevisionNumber", "1.0"); // Changed from "1" to "1.0"
    localStorage.setItem("currentRevisionId", newRevisionId.toString());
    localStorage.setItem("duplicateRevision", "true");
    localStorage.setItem("isDuplicatingRevision", "true");

    // 5. Store workorder data (both with and without edit_ prefix)
    localStorage.setItem("edit_nameOfWork", newWorkorderData.nameOfWork || "");
    localStorage.setItem("edit_state", newWorkorderData.state || "");
    localStorage.setItem("edit_department", newWorkorderData.department || "");
    localStorage.setItem("edit_ssr", newWorkorderData.ssr || "");
    localStorage.setItem("edit_area", newWorkorderData.area || "");
    localStorage.setItem("edit_preparedBy", newWorkorderData.preparedBySignature || "");
    localStorage.setItem("edit_checkedBy", newWorkorderData.checkedBySignature || "");
    localStorage.setItem("edit_chapter", (newWorkorderData.chapterId)?.toString() || "");
    
    localStorage.setItem("nameOfWork", newWorkorderData.nameOfWork || "");
    localStorage.setItem("state", newWorkorderData.state || "");
    localStorage.setItem("department", newWorkorderData.department || "");
    localStorage.setItem("ssr", newWorkorderData.ssr || "");
    localStorage.setItem("area", newWorkorderData.area || "");
    localStorage.setItem("preparedBy", newWorkorderData.preparedBySignature || "");
    localStorage.setItem("checkedBy", newWorkorderData.checkedBySignature || "");
    localStorage.setItem("chapter", (newWorkorderData.chapterId)?.toString() || "");
    localStorage.setItem("autogenerated", newWorkorderData.workOrderID || newWorkOrderID);
    localStorage.setItem("status", newWorkorderData.status || "draft");

    // 6. Store revision data
    localStorage.setItem("revisionStage", "in-progress");
    localStorage.setItem("revisionStatus", "pending");

    // 7. Store user data
    const userData = getUserData();
    const currentToken = token;
    
    if (!localStorage.getItem("userId")) localStorage.setItem("userId", userData?.uid || "");
    if (!localStorage.getItem("userToken")) localStorage.setItem("userToken", currentToken);
    if (!localStorage.getItem("jwt")) localStorage.setItem("jwt", currentToken);
    if (!localStorage.getItem("Id")) localStorage.setItem("Id", userData?.uid || "");
    if (!localStorage.getItem("authToken")) localStorage.setItem("authToken", currentToken);
    if (!localStorage.getItem("token")) localStorage.setItem("token", currentToken);

    // 8. Fetch and store chapter information if available
    if (workorderRecord.chapterId) {
      try {
        const chapterResponse = await fetch(`${API_BASE_URL}/chapters/${workorderRecord.chapterId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (chapterResponse.ok) {
          const chapterData = await chapterResponse.json();
          localStorage.setItem("chapterName", chapterData.chapterName || '');
          localStorage.setItem("chapterDetails", JSON.stringify(chapterData));
        }
      } catch (error) {
        console.error('Error fetching chapter data:', error);
      }
    }

    // 9. DUPLICATE THE REVISION DATA - IMPROVED VERSION
    if (revisionToCopy) {
      console.log('Starting data duplication from revision:', revisionToCopy.id);
      
      // Store source revision reference
      localStorage.setItem("sourceRevisionId", revisionToCopy.id.toString());
      localStorage.setItem("originalRevisionData", JSON.stringify({
        id: revisionToCopy.id,
        reviseNumber: revisionToCopy.reviseNumber,
        revisionStage: revisionToCopy.revisionStage || "started",
        revisionStatus: revisionToCopy.revisionStatus || "pending"
      }));
      
      try {
        // Fetch source subwork data using the original workorder ID
        const subworkResponse = await fetch(`${API_BASE_URL}/subwork/${revisionToCopy.id}/${workorderId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!subworkResponse.ok) {
          if (subworkResponse.status === 401) {
            toast.dismiss(loadingToast);
            toast.error('Session expired. Please login again.');
            localStorage.clear();
            navigate('/signin');
            return;
          }
          throw new Error(`Failed to fetch source subwork data: ${subworkResponse.status}`);
        }
        
        const sourceSubworkData = await subworkResponse.json();
        console.log('Source subwork data:', sourceSubworkData);
        
        if (sourceSubworkData.length === 0) {
          console.log('No subwork data found in source revision');
          toast.dismiss(loadingToast);
          toast.success(`New workorder created successfully! No data to duplicate from source revision.`);
          navigate("/estimate");
          return;
        }
        
        // Initialize arrays to store all source data
        const allSourceItems = [];
        const allSourceMeasurements = [];
        
        // Update toast to show fetching progress
        toast.dismiss(loadingToast);
        const fetchingToast = toast.loading('Fetching source revision data...');
        
        // For each subwork in source revision, fetch its items and measurements
        for (const subwork of sourceSubworkData) {
          try {
            // Fetch items for this subwork from source revision
            const itemsResponse = await fetch(`${API_BASE_URL}/txn-items/BySubwork/${subwork.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
              }
            });
            
            if (itemsResponse.ok) {
              const itemsData = await itemsResponse.json();
              console.log(`Source items for subwork ${subwork.id}:`, itemsData);
              
              // Add subwork reference to each item and prepare for duplication
              const itemsWithSubwork = itemsData.map(item => ({
                ...item,
                originalId: item.id,
                id: null,
                subworkId: null,
                originalSubworkId: subwork.id,
                subworkName: subwork.subworkName,
                revisionId: newRevisionId,
                createdDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
                createdBy: parseInt(uid),
                updatedBy: parseInt(uid)
              }));
              
              allSourceItems.push(...itemsWithSubwork);
              
              // For each item, fetch its measurements
              for (const item of itemsData) {
                try {
                  const measurementsResponse = await fetch(`${API_BASE_URL}/txn-items-mts/ByItemId/${item.id}`, {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${currentToken}`,
                      'Content-Type': 'application/json',
                    }
                  });
                  
                  if (measurementsResponse.ok) {
                    const measurementsData = await measurementsResponse.json();
                    console.log(`Source measurements for item ${item.id}:`, measurementsData);
                    
                    // Add item and subwork reference to each measurement
                    const measurementsWithRef = measurementsData.map(measurement => ({
                      ...measurement,
                      originalId: measurement.id,
                      id: null,
                      itemId: null,
                      originalItemId: item.id,
                      itemNo: item.itemNo,
                      subworkId: null,
                      originalSubworkId: subwork.id,
                      subworkName: subwork.subworkName,
                      createdDate: new Date().toISOString(),
                      updatedDate: new Date().toISOString(),
                      createdBy: parseInt(uid),
                      updatedBy: parseInt(uid)
                    }));
                    
                    allSourceMeasurements.push(...measurementsWithRef);
                  } else if (measurementsResponse.status === 401) {
                    toast.dismiss(fetchingToast);
                    toast.error('Session expired. Please login again.');
                    localStorage.clear();
                    navigate('/signin');
                    return;
                  } else {
                    console.warn(`Failed to fetch measurements for item ${item.id}:`, measurementsResponse.status);
                  }
                } catch (error) {
                  console.error(`Error fetching measurements for item ${item.id}:`, error);
                }
              }
            } else if (itemsResponse.status === 401) {
              toast.dismiss(fetchingToast);
              toast.error('Session expired. Please login again.');
              localStorage.clear();
              navigate('/signin');
              return;
            } else {
              console.warn(`Failed to fetch items for subwork ${subwork.id}:`, itemsResponse.status);
            }
          } catch (error) {
            console.error(`Error fetching items for subwork ${subwork.id}:`, error);
          }
        }

        // NOW DUPLICATE ALL DATA TO NEW REVISION
        console.log('Starting duplication process...');
        toast.dismiss(fetchingToast);
        const duplicatingToast = toast.loading('Duplicating subwork data...');
        
        // Track created records for mapping relationships
        const subworkMapping = {};
        const itemMapping = {};
        
        const duplicatedSubworks = [];
        const duplicatedItems = [];
        const duplicatedMeasurements = [];
        
        // Step 1: Create duplicate subworks
        for (const sourceSubwork of sourceSubworkData) {
          try {
            const newSubworkPayload = {
              id: 0,
              reviseId: newRevisionId,
              workorderId: parseInt(newWorkorderId), // Use new workorder ID
              subworkName: sourceSubwork.subworkName,
              createdDate: new Date().toISOString(),
              createdBy: parseInt(uid),
              updatedDate: new Date().toISOString(),
              updatedBy: parseInt(uid)
            };

            const createSubworkResponse = await fetch(`${API_BASE_URL}/subwork`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
              },
              body: JSON.stringify(newSubworkPayload)
            });

            if (!createSubworkResponse.ok) {
              if (createSubworkResponse.status === 401) {
                toast.dismiss(duplicatingToast);
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                navigate('/signin');
                return;
              }
              throw new Error(`Failed to create subwork: ${createSubworkResponse.status}`);
            }

            const newSubworkData = await createSubworkResponse.json();
            subworkMapping[sourceSubwork.id] = newSubworkData.id;
            duplicatedSubworks.push(newSubworkData);
            console.log(`Created subwork: ${sourceSubwork.subworkName} (ID: ${newSubworkData.id})`);
            
          } catch (error) {
            console.error(`Error creating subwork ${sourceSubwork.subworkName}:`, error);
            toast.dismiss(duplicatingToast);
            toast.error(`Failed to duplicate subwork: ${sourceSubwork.subworkName}`);
            return;
          }
        }

        // Step 2: Create duplicate items
        toast.dismiss(duplicatingToast);
        const itemsToast = toast.loading('Duplicating items data...');

        for (const sourceItem of allSourceItems) {
          try {
            const newSubworkId = subworkMapping[sourceItem.originalSubworkId];
            if (!newSubworkId) {
              console.warn(`No mapping found for subwork ID ${sourceItem.originalSubworkId}`);
              continue;
            }

            // Use the correct field names based on your API structure
            const newItemPayload = {
              id: 0,
              srNo: sourceItem.srNo || 0,
              itemNo: sourceItem.itemNo || "",
              category: sourceItem.category || "",
              descriptionOfItem: sourceItem.description || sourceItem.descriptionOfItem || "",
              floorLiftRise: sourceItem.floorLiftRise || "",
              fkSubworkId: newSubworkId,
              fkWorkorderId: parseInt(newWorkorderId),
              completedRate: sourceItem.completedRate || sourceItem.rate || 0,
              labourRate: sourceItem.labourRate || 0,
              scadaFlag: sourceItem.scadaFlag || false,
              smallUnit: sourceItem.smallUnit || sourceItem.unit || "",
              fullUnit: sourceItem.fullUnit || sourceItem.unit || "",
              additionalSpecification: sourceItem.additionalSpecification || ""
            };

            console.log('Creating item with payload:', newItemPayload);

            const createItemResponse = await fetch(`${API_BASE_URL}/txn-items`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
              },
              body: JSON.stringify(newItemPayload)
            });

            if (!createItemResponse.ok) {
              if (createItemResponse.status === 401) {
                toast.dismiss(itemsToast);
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                navigate('/signin');
                return;
              }
              
              const errorText = await createItemResponse.text();
              console.error(`Failed to create item ${sourceItem.itemNo}:`, {
                status: createItemResponse.status,
                error: errorText,
                payload: newItemPayload
              });
              
              throw new Error(`Failed to create item: ${createItemResponse.status} - ${errorText}`);
            }

            const newItemData = await createItemResponse.json();
            itemMapping[sourceItem.originalId] = newItemData.id;
            duplicatedItems.push(newItemData);
            console.log(`Created item: ${sourceItem.itemNo} (ID: ${newItemData.id})`);
            
          } catch (error) {
            console.error(`Error creating item ${sourceItem.itemNo}:`, error);
            toast.dismiss(itemsToast);
            toast.error(`Failed to duplicate item: ${sourceItem.itemNo} - ${error.message}`);
            return;
          }
        }

        // Step 3: Create duplicate measurements
        toast.dismiss(itemsToast);
        const measurementsToast = toast.loading('Duplicating measurements data...');
        
        for (const sourceMeasurement of allSourceMeasurements) {
          try {
            const newItemId = itemMapping[sourceMeasurement.originalItemId];
            if (!newItemId) {
              console.warn(`No mapping found for item ID ${sourceMeasurement.originalItemId}`);
              continue;
            }

            const newMeasurementPayload = {
              itemId: newItemId,
              sNo: sourceMeasurement.sNo,
              description: sourceMeasurement.description,
              nos: sourceMeasurement.nos,
              length: sourceMeasurement.length,
              breadth: sourceMeasurement.breadth,
              height: sourceMeasurement.height,
              quantity: sourceMeasurement.quantity,
              createdDate: new Date().toISOString(),
              createdBy: parseInt(uid),
              updatedDate: new Date().toISOString(),
              updatedBy: parseInt(uid)
            };

            const createMeasurementResponse = await fetch(`${API_BASE_URL}/txn-items-mts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
              },
              body: JSON.stringify(newMeasurementPayload)
            });

            if (!createMeasurementResponse.ok) {
              if (createMeasurementResponse.status === 401) {
                toast.dismiss(measurementsToast);
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                navigate('/signin');
                return;
              }
              console.warn(`Failed to create measurement: ${createMeasurementResponse.status}`);
              continue;
            }

            const newMeasurementData = await createMeasurementResponse.json();
            duplicatedMeasurements.push(newMeasurementData);
            console.log(`Created measurement: S.No ${sourceMeasurement.sNo} (ID: ${newMeasurementData.id})`);
            
          } catch (error) {
            console.error(`Error creating measurement ${sourceMeasurement.sNo}:`, error);
            continue;
          }
        }

        // Store the duplicated data in localStorage for the estimate page
        localStorage.setItem('subworkData', JSON.stringify(duplicatedSubworks));
        localStorage.setItem('revisionItems', JSON.stringify(duplicatedItems));
        localStorage.setItem('revisionMeasurements', JSON.stringify(duplicatedMeasurements));
        localStorage.setItem('estimateData', JSON.stringify(duplicatedSubworks));
        localStorage.setItem('estimateItems', JSON.stringify(duplicatedItems));
        localStorage.setItem('estimateMeasurements', JSON.stringify(duplicatedMeasurements));
        
        // Store organized data by subwork
        const dataBySubwork = {};
        duplicatedSubworks.forEach(subwork => {
          const subworkItems = duplicatedItems.filter(item => item.fkSubworkId === subwork.id);
          const subworkMeasurements = duplicatedMeasurements.filter(measurement => 
            subworkItems.some(item => item.id === measurement.itemId)
          );
          
          dataBySubwork[subwork.id] = {
            subwork: subwork,
            items: subworkItems,
            measurements: subworkMeasurements
          };
        });
        
        localStorage.setItem('revisionDataBySubwork', JSON.stringify(dataBySubwork));
        
        // Store summary counts
        localStorage.setItem('totalSubworks', duplicatedSubworks.length.toString());
        localStorage.setItem('totalItems', duplicatedItems.length.toString());
        localStorage.setItem('totalMeasurements', duplicatedMeasurements.length.toString());
        
        // Store duplication summary
        const duplicationSummary = {
          sourceRevisionId: revisionToCopy.id,
          sourceRevisionNumber: revisionToCopy.reviseNumber,
          newRevisionId: newRevisionId,
          newRevisionNumber: "1.0",
          newWorkorderId: newWorkorderId,
          duplicatedSubworks: duplicatedSubworks.length,
          duplicatedItems: duplicatedItems.length,
          duplicatedMeasurements: duplicatedMeasurements.length,
          duplicationDate: new Date().toISOString()
        };
        
        localStorage.setItem("duplicationSummary", JSON.stringify(duplicationSummary));
        
        toast.dismiss(measurementsToast);
        toast.success(`Workorder duplicated successfully! Created revision 1.0 with ${duplicatedSubworks.length} subworks, ${duplicatedItems.length} items, and ${duplicatedMeasurements.length} measurements.`);
        
        console.log(`Successfully duplicated: ${duplicatedSubworks.length} subworks, ${duplicatedItems.length} items, ${duplicatedMeasurements.length} measurements`);
        
      } catch (error) {
        console.error('Error duplicating revision data:', error);
        toast.dismiss(loadingToast);
        toast.error('Failed to duplicate revision data: ' + error.message);
        return;
      }
    } else {
      // No revision to copy from
      toast.dismiss(loadingToast);
      toast.success('New workorder created successfully with revision 1.0!');
    }

    // 11. Navigate to estimate page
    navigate("/estimate");
    
  } catch (err) {
    console.error('Failed to duplicate workorder:', err);
    toast.error("Failed to duplicate workorder: " + err.message);
    
    // Clean up on error
  //   const keysToRemove = [
  //     'recordId', 'workorderId', 'reviseId', 'editMode', 'reviseno', 
  //     'revisionNumber', 'currentRevisionNumber', 'duplicateRevision',
  //     'isDuplicatingRevision', 'sourceRevisionId', 'originalRevisionData',
  //     'duplicationSummary'
  //   ];
    
  //   keysToRemove.forEach(key => {
  //     localStorage.removeItem(key);
  //   });
}
};
const generateCustomWorkOrderID = (selectedState, states) => {
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
  const userId = localStorage.getItem("Id") || "1";
  
  const finalID = `${tin}${wo}${year}${month}${day}${hours}${minutes}${seconds}${userId}`;
  return finalID;
};

// Updated handleDuplicateClick function
const handleDuplicateClick = (workorderId, event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  setSelectedWorkorderId(workorderId);
};
// Also update your setSelectedWorkorderId if needed
// const handleDuplicateClick = (workorderId, event) => {
//   setSelectedWorkorderId(workorderId);
//   handleDuplicate(workorderId, event);
// };
// 3. Updated handleDeleteRevision function with proper toast messages
const handleDeleteRevision = async (mainId, revisionId, event) => {
  // Prevent row click when clicking delete button
  event.stopPropagation();
  
  if (!token) {
    toast.error('Authentication required. Please login again.');
    return;
  }

  // Show confirmation dialog
  const confirmed = window.confirm('Are you sure you want to delete this revision? This action cannot be undone.');
  if (!confirmed) return;

  const loadingToast = toast.loading('Deleting revision...');

  try {
    const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/${revisionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletedFlag: 'YES' }),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      if (response.status === 404) {
        toast.dismiss(loadingToast);
        toast.error('Revision not found.');
        return;
      }
      if (response.status === 403) {
        toast.dismiss(loadingToast);
        toast.error('You do not have permission to delete this revision.');
        return;
      }
      throw new Error(`Server error: ${response.status}`);
    }
    
    toast.dismiss(loadingToast);
    toast.success('Revision deleted successfully!');
    
    // Refresh sub-records for this workorder
    const updatedResponse = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${mainId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (updatedResponse.ok) {
      const updatedData = await updatedResponse.json();
      const filtered = (updatedData || []).filter(rec => String(rec.deletedFlag).toLowerCase() === 'no');
      setSubRecords(prev => ({ ...prev, [mainId]: filtered }));
    } else {
      toast.warning('Revision deleted but failed to refresh list. Please refresh the page.');
    }
    
  } catch (err) {
    toast.dismiss(loadingToast);
    console.error('Delete revision error:', err);
    toast.error('Failed to delete revision. Please try again.');
  }
};


  const fetchRevisions = async (workorderId) => {
    if (!token) {
      toast.error('Authentication required');
      return [];
    }

    try {
      const response = await fetch(
        `https://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${workorderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return [];
        }
        throw new Error("Failed to fetch revisions");
      }
  
      const revisions = await response.json();
      const filtered = (revisions || [])
        .filter(r =>
          r.deletedFlag !== undefined &&
          String(r.deletedFlag).toLowerCase() !== "yes" &&
          !isNaN(parseFloat(r.reviseNumber))
        )
        .sort((a, b) => parseFloat(a.reviseNumber) - parseFloat(b.reviseNumber));
  
      return filtered;
    } catch (err) {
      toast.error("Error loading revisions");
      return [];
    }
  };

  const fetchRevisionById = async (revisionId) => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    try {
      const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/${revisionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return null;
        }
        throw new Error(`Failed to fetch revision with id ${revisionId}`);
      }
  
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      toast.error('Error fetching revision');
      return null;
    }
  };
    const downloadPDF = async (pdfLocations) => {
    if (!pdfLocations || !token) {
      toast.error("PDF location or authentication token missing!");
      return;
    }

    const loadingToast = toast.loading('Downloading PDF...');
    
    try {
      const filename = pdfLocations.split(/(\\|\/)/g).pop();
      const pdfLocation = `https://24.101.103.87:8082/api/file/download/${filename}`;
      
      const response = await fetch(pdfLocation, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch the PDF. Status: ' + response.status);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Try to extract filename from Content-Disposition header
      let downloadFilename = 'downloaded.pdf';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.includes('filename=')) {
        const filenameRegex = /filename[^;=\n]*((['"]).?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          downloadFilename = matches[1].replace(/['"]/g, '');
        }
      } else {
        downloadFilename = filename || 'downloaded.pdf';
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded successfully!');
      
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error downloading PDF:', error);
      toast.error('Could not download PDF! ' + error.message);
    }
  };
  function getNextRevisionNumberFromList(revisions) {
    // Filter only valid revision numbers, get max, then +0.1
    const nums = (revisions || [])
      .map(r => parseFloat(r.reviseNumber))
      .filter(n => !isNaN(n));
    if (nums.length === 0) return "1.0";
    const max = Math.max(...nums);
    return (Math.round((max + 0.1) * 10) / 10).toFixed(1); // Always increments to next .1
  }
const handleDuplicateRevision = async (workorderId, revisionToCopy, workorderRecord) => {
  if (revisionToCopy.pdfLocation) {
    // If PDF exists, download it instead of duplicating
    downloadPDF(revisionToCopy.pdfLocation);
    return;
  }

  try {
    // Show loading toast
    const loadingToast = toast.loading('Creating duplicate revision with all content...');

    // Check authentication first
    if (!token) {
      toast.dismiss(loadingToast);
      toast.error('Authentication required. Please login again.');
      return;
    }

    // 1. Fetch all current revisions for the workorder
    const allRevisions = await fetchRevisions(workorderId);
    
    // 2. Get next available number
    const nextRevNumber = getNextRevisionNumberFromList(allRevisions);
    
    // 3. Create the new revision via API first
    const API_BASE_URL = "https://24.101.103.87:8082/api";
    const revisionPayload = {
      workorderId: parseInt(workorderId),
      reviseNumber: nextRevNumber,
      createdDate: new Date().toISOString(),
      createdBy: parseInt(uid),
      updatedBy: parseInt(uid),
      updatedDate: new Date().toISOString(),
      currentFlag: true,
      deletedFlag: "no",
      pdfLocation: "",
      revisionStage: "in-progress", 
      revisionStatus: "pending"
    };

    const response = await fetch(`${API_BASE_URL}/workorder-revisions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(revisionPayload)
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      throw new Error(`Failed to create revision: ${response.status}`);
    }

    const newRevData = await response.json();
    
    // 4. Clear only specific localStorage keys to avoid conflicts
    const keysToRemove = [
      'recordId', 'workorderId', 'reviseId', 'editMode', 'reviseno', 
      'revisionNumber', 'currentRevisionNumber', 'duplicateRevision',
      'edit_nameOfWork', 'edit_state', 'edit_department', 'edit_ssr', 
      'edit_area', 'edit_preparedBy', 'edit_checkedBy', 'edit_chapter',
      'nameOfWork', 'state', 'department', 'ssr', 'area', 'preparedBy', 
      'checkedBy', 'chapter', 'autogenerated', 'status',
      'revisionStage', 'revisionStatus', 'isEditMode', 'editingRevision', 
      'currentRevisionId', 'originalRevisionData', 'subworkData',
      'revisionItems', 'revisionMeasurements', 'revisionDataBySubwork',
      'totalSubworks', 'totalItems', 'totalMeasurements', 'isDuplicatingRevision'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // 5. Set basic localStorage data for the new revision
    localStorage.setItem("editMode", "true");
    localStorage.setItem("workorderId", workorderId.toString());
    localStorage.setItem("recordId", workorderId.toString());
    localStorage.setItem("reviseId", newRevData.id.toString()); 
    localStorage.setItem("reviseno", nextRevNumber);
    localStorage.setItem("revisionNumber", nextRevNumber);
    localStorage.setItem("currentRevisionNumber", nextRevNumber);
    localStorage.setItem("duplicateRevision", "true");
    localStorage.setItem("isDuplicatingRevision", "true");
    localStorage.setItem("sourceRevisionId", revisionToCopy.id.toString());
    
    // 6. Store workorder data (both with and without edit_ prefix)
    if (workorderRecord) {
      // With edit_ prefix (for form fields)
      localStorage.setItem("edit_nameOfWork", workorderRecord.nameOfWork || "");
      localStorage.setItem("edit_state", workorderRecord.state || "");
      localStorage.setItem("edit_department", workorderRecord.department || "");
      localStorage.setItem("edit_ssr", workorderRecord.ssr || "");
      localStorage.setItem("edit_area", workorderRecord.area || "");
      localStorage.setItem("edit_preparedBy", workorderRecord.preparedBySignature || "");
      localStorage.setItem("edit_checkedBy", workorderRecord.checkedBySignature || "");
      localStorage.setItem("edit_chapter", workorderRecord.chapterId?.toString() || "");
      
      // Without edit_ prefix (for display/logic)
      localStorage.setItem("nameOfWork", workorderRecord.nameOfWork || "");
      localStorage.setItem("state", workorderRecord.state || "");
      localStorage.setItem("department", workorderRecord.department || "");
      localStorage.setItem("ssr", workorderRecord.ssr || "");
      localStorage.setItem("area", workorderRecord.area || "");
      localStorage.setItem("preparedBy", workorderRecord.preparedBySignature || "");
      localStorage.setItem("checkedBy", workorderRecord.checkedBySignature || "");
      localStorage.setItem("chapter", workorderRecord.chapterId?.toString() || "");
      localStorage.setItem("autogenerated", workorderRecord.workOrderID || "");
      localStorage.setItem("status", workorderRecord.status || "");
    }
    
    // 7. Store revision data
    localStorage.setItem("revisionStage", "started");
    localStorage.setItem("revisionStatus", "pending");
    
    // 8. Store user data - ensure token consistency
    const userData = getUserData();
    const currentToken = token;
    
    if (!localStorage.getItem("userId")) localStorage.setItem("userId", userData?.uid || "");
    if (!localStorage.getItem("userToken")) localStorage.setItem("userToken", currentToken);
    if (!localStorage.getItem("jwt")) localStorage.setItem("jwt", currentToken);
    if (!localStorage.getItem("Id")) localStorage.setItem("Id", userData?.uid || "");
    if (!localStorage.getItem("authToken")) localStorage.setItem("authToken", currentToken);
    if (!localStorage.getItem("token")) localStorage.setItem("token", currentToken);
    
    // 9. Store duplicate metadata
    localStorage.setItem("originalRevisionData", JSON.stringify({
      id: revisionToCopy.id,
      reviseNumber: revisionToCopy.reviseNumber,
      revisionStage: revisionToCopy.revisionStage || "started",
      revisionStatus: revisionToCopy.revisionStatus || "pending"
    }));
    
    localStorage.setItem("newRevisionData", JSON.stringify({
      id: newRevData.id,
      reviseNumber: nextRevNumber,
      revisionStage: "started",
      revisionStatus: "pending"
    }));

    // 10. FETCH SOURCE REVISION DATA VIA API
    console.log('Fetching source revision data via API...');
    
    // Fetch subwork data from source revision
    const subworkResponse = await fetch(`${API_BASE_URL}/subwork/${revisionToCopy.id}/${workorderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!subworkResponse.ok) {
      if (subworkResponse.status === 401) {
        toast.dismiss(loadingToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      throw new Error(`Failed to fetch source subwork data: ${subworkResponse.status}`);
    }
    
    const sourceSubworkData = await subworkResponse.json();
    console.log('Source subwork data:', sourceSubworkData);
    
    // Initialize arrays to store all source data
    const allSourceItems = [];
    const allSourceMeasurements = [];
    
    // For each subwork in source revision, fetch its items and measurements
    for (const subwork of sourceSubworkData) {
      try {
        // Fetch items for this subwork from source revision
        const itemsResponse = await fetch(`${API_BASE_URL}/txn-items/BySubwork/${subwork.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          console.log(`Source items for subwork ${subwork.id}:`, itemsData);
          
          // Add subwork reference to each item and prepare for duplication
          const itemsWithSubwork = itemsData.map(item => ({
            ...item,
            originalId: item.id, // Keep original ID for reference
            id: null, // Reset ID so new ones will be generated
            subworkId: null, // Will be set to new subwork ID after subwork duplication
            originalSubworkId: subwork.id, // Keep reference to original subwork
            subworkName: subwork.subworkName,
            revisionId: newRevData.id, // Set to new revision ID
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            createdBy: parseInt(uid),
            updatedBy: parseInt(uid)
          }));
          
          allSourceItems.push(...itemsWithSubwork);
          
          // For each item, fetch its measurements
          for (const item of itemsData) {
            try {
              const measurementsResponse = await fetch(`${API_BASE_URL}/txn-items-mts/ByItemId/${item.id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${currentToken}`,
                  'Content-Type': 'application/json',
                }
              });
              
              if (measurementsResponse.ok) {
                const measurementsData = await measurementsResponse.json();
                console.log(`Source measurements for item ${item.id}:`, measurementsData);
                
                // Add item and subwork reference to each measurement and prepare for duplication
                const measurementsWithRef = measurementsData.map(measurement => ({
                  ...measurement,
                  originalId: measurement.id, // Keep original ID for reference
                  id: null, // Reset ID so new ones will be generated
                  itemId: null, // Will be set to new item ID after item duplication
                  originalItemId: item.id, // Keep reference to original item
                  itemNo: item.itemNo,
                  subworkId: null, // Will be set to new subwork ID
                  originalSubworkId: subwork.id, // Keep reference to original subwork
                  subworkName: subwork.subworkName,
                  createdDate: new Date().toISOString(),
                  updatedDate: new Date().toISOString(),
                  createdBy: parseInt(uid),
                  updatedBy: parseInt(uid)
                }));
                
                allSourceMeasurements.push(...measurementsWithRef);
              } else if (measurementsResponse.status === 401) {
                toast.dismiss(loadingToast);
                toast.error('Session expired. Please login again.');
                localStorage.clear();
                navigate('/signin');
                return;
              } else {
                console.warn(`Failed to fetch measurements for item ${item.id}:`, measurementsResponse.status);
              }
            } catch (error) {
              console.error(`Error fetching measurements for item ${item.id}:`, error);
            }
          }
        } else if (itemsResponse.status === 401) {
          toast.dismiss(loadingToast);
          toast.error('Session expired. Please login again.');
          localStorage.clear();
          navigate('/signin');
          return;
        } else {
          console.warn(`Failed to fetch items for subwork ${subwork.id}:`, itemsResponse.status);
        }
      } catch (error) {
        console.error(`Error fetching items for subwork ${subwork.id}:`, error);
      }
    }

    // 11. NOW DUPLICATE ALL DATA - POST TO NEW REVISION
    console.log('Starting duplication process...');
    toast.dismiss(loadingToast);
    const subworkToast = toast.loading('Duplicating subwork data...');
    
    // Track created records for mapping relationships
    const subworkMapping = {}; // originalSubworkId -> newSubworkId
    const itemMapping = {}; // originalItemId -> newItemId
    
    // Step 1: Create duplicate subworks
    for (const sourceSubwork of sourceSubworkData) {
      try {
        const newSubworkPayload = {
          id: 0, // API will generate new ID
          reviseId: newRevData.id, // New revision ID
          workorderId: parseInt(workorderId),
          subworkName: sourceSubwork.subworkName,
          createdDate: new Date().toISOString(),
          createdBy: parseInt(uid),
          updatedDate: new Date().toISOString(),
          updatedBy: parseInt(uid)
        };

        const createSubworkResponse = await fetch(`${API_BASE_URL}/subwork`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(newSubworkPayload)
        });

        if (!createSubworkResponse.ok) {
          if (createSubworkResponse.status === 401) {
            toast.dismiss(loadingToast);
            toast.error('Session expired. Please login again.');
            localStorage.clear();
            navigate('/signin');
            return;
          }
          throw new Error(`Failed to create subwork: ${createSubworkResponse.status}`);
        }

        const newSubworkData = await createSubworkResponse.json();
        subworkMapping[sourceSubwork.id] = newSubworkData.id;
        console.log(`Created subwork: ${sourceSubwork.subworkName} (ID: ${newSubworkData.id})`);
        
      } catch (error) {
        console.error(`Error creating subwork ${sourceSubwork.subworkName}:`, error);
        toast.dismiss(loadingToast);
        toast.error(`Failed to duplicate subwork: ${sourceSubwork.subworkName}`);
        return;
      }
    }

    // Step 2: Create duplicate items - FIXED VERSION
toast.dismiss(subworkToast);
const itemsToast = toast.loading('Duplicating items data...');

for (const sourceItem of allSourceItems) {
  try {
    const newSubworkId = subworkMapping[sourceItem.originalSubworkId];
    if (!newSubworkId) {
      console.warn(`No mapping found for subwork ID ${sourceItem.originalSubworkId}`);
      continue;
    }

    // CORRECTED: Match the API's expected field structure
    const newItemPayload = {
      id: 0, // API will generate new ID
      srNo: sourceItem.srNo || 0,
      itemNo: sourceItem.itemNo || "",
      category: sourceItem.category || "",
      descriptionOfItem: sourceItem.description || sourceItem.descriptionOfItem || "", // Fixed field name
      floorLiftRise: sourceItem.floorLiftRise || "",
      fkSubworkId: newSubworkId, // Fixed field name
      fkWorkorderId: parseInt(workorderId), // Fixed field name
      completedRate: sourceItem.completedRate || sourceItem.rate || 0,
      labourRate: sourceItem.labourRate || 0,
      scadaFlag: sourceItem.scadaFlag || false,
      smallUnit: sourceItem.smallUnit || sourceItem.unit || "",
      fullUnit: sourceItem.fullUnit || sourceItem.unit || "",
      additionalSpecification: sourceItem.additionalSpecification || ""
    };

    console.log('Creating item with payload:', newItemPayload); // Debug log

    const createItemResponse = await fetch(`${API_BASE_URL}/txn-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(newItemPayload)
    });

    if (!createItemResponse.ok) {
      if (createItemResponse.status === 401) {
        toast.dismiss(itemsToast);
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return;
      }
      
      // Get error details for debugging
      const errorText = await createItemResponse.text();
      console.error(`Failed to create item ${sourceItem.itemNo}:`, {
        status: createItemResponse.status,
        error: errorText,
        payload: newItemPayload
      });
      
      throw new Error(`Failed to create item: ${createItemResponse.status} - ${errorText}`);
    }

    const newItemData = await createItemResponse.json();
    itemMapping[sourceItem.originalId] = newItemData.id;
    console.log(`Created item: ${sourceItem.itemNo} (ID: ${newItemData.id})`);
    
  } catch (error) {
    console.error(`Error creating item ${sourceItem.itemNo}:`, error);
    toast.dismiss(itemsToast);
    toast.error(`Failed to duplicate item: ${sourceItem.itemNo} - ${error.message}`);
    return;
  }
}

    // Step 3: Create duplicate measurements
    toast.dismiss(itemsToast);
    const measurementsToast = toast.loading('Duplicating measurements data...');
    
    for (const sourceMeasurement of allSourceMeasurements) {
      try {
        const newItemId = itemMapping[sourceMeasurement.originalItemId];
        if (!newItemId) {
          console.warn(`No mapping found for item ID ${sourceMeasurement.originalItemId}`);
          continue;
        }

        const newMeasurementPayload = {
          // Remove id and other fields that should not be copied
          itemId: newItemId,
          sNo: sourceMeasurement.sNo,
          description: sourceMeasurement.description,
          nos: sourceMeasurement.nos,
          length: sourceMeasurement.length,
          breadth: sourceMeasurement.breadth,
          height: sourceMeasurement.height,
          quantity: sourceMeasurement.quantity,
          createdDate: new Date().toISOString(),
          createdBy: parseInt(uid),
          updatedDate: new Date().toISOString(),
          updatedBy: parseInt(uid)
          // Add any other relevant fields from your measurement structure
        };

        const createMeasurementResponse = await fetch(`${API_BASE_URL}/txn-items-mts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(newMeasurementPayload)
        });

        if (!createMeasurementResponse.ok) {
          if (createMeasurementResponse.status === 401) {
            toast.dismiss(measurementsToast);
            toast.error('Session expired. Please login again.');
            localStorage.clear();
            navigate('/signin');
            return;
          }
          console.warn(`Failed to create measurement: ${createMeasurementResponse.status}`);
          // Continue with other measurements instead of stopping
          continue;
        }

        const newMeasurementData = await createMeasurementResponse.json();
        console.log(`Created measurement: S.No ${sourceMeasurement.sNo} (ID: ${newMeasurementData.id})`);
        
      } catch (error) {
        console.error(`Error creating measurement ${sourceMeasurement.sNo}:`, error);
        // Continue with other measurements instead of stopping
        continue;
      }
    }

    // 12. Store duplication summary in localStorage
    const duplicationSummary = {
      sourceRevisionId: revisionToCopy.id,
      sourceRevisionNumber: revisionToCopy.reviseNumber,
      newRevisionId: newRevData.id,
      newRevisionNumber: nextRevNumber,
      duplicatedSubworks: Object.keys(subworkMapping).length,
      duplicatedItems: Object.keys(itemMapping).length,
      duplicatedMeasurements: allSourceMeasurements.length,
      duplicationDate: new Date().toISOString()
    };
    
    localStorage.setItem("duplicationSummary", JSON.stringify(duplicationSummary));
    
    // 13. Success notification
    toast.dismiss(measurementsToast);
    toast.success(`Revision ${nextRevNumber} created successfully with ${duplicationSummary.duplicatedSubworks} subworks, ${duplicationSummary.duplicatedItems} items, and ${duplicationSummary.duplicatedMeasurements} measurements!`);
    
    console.log('Duplication completed successfully:', duplicationSummary);

    // 14. Navigate to subestimate page
    navigate("/subestimate");
    
  } catch (error) {
    console.error('Error in handleDuplicateRevision:', error);
    toast.error(`Failed to duplicate revision: ${error.message}`);
    
    // Clean up on error
    const keysToRemove = [
      'recordId', 'workorderId', 'reviseId', 'editMode', 'reviseno', 
      'revisionNumber', 'currentRevisionNumber', 'duplicateRevision',
      'isDuplicatingRevision', 'sourceRevisionId', 'originalRevisionData',
      'newRevisionData', 'duplicationSummary'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
const ensureTokenConsistency = () => {
  const userData = getUserData();
  if (userData.token) {
    // Ensure all token keys have the same value for compatibility
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('jwt', userData.token);
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('token', userData.token);
  }
};
// Add this function to your MyWork component
const fetchRevisionDetails = async (revisionId) => {
  if (!token) {
    toast.error('Authentication required');
    return null;
  }

  try {
    const API_BASE_URL = "https://24.101.103.87:8082/api";
    
    // Fetch revision basic data
    const revisionResponse = await fetch(`${API_BASE_URL}/workorder-revisions/${revisionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!revisionResponse.ok) {
      if (revisionResponse.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/signin');
        return null;
      }
      throw new Error(`Failed to fetch revision details: ${revisionResponse.status}`);
    }

    const revisionData = await revisionResponse.json();
    const revision = Array.isArray(revisionData) ? revisionData[0] : revisionData;

    // Fetch related data
    const [subestimatesResponse, itemsResponse, measurementsResponse] = await Promise.allSettled([
      fetch(`${API_BASE_URL}/subestimates/ByRevisionId/${revisionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/items/ByRevisionId/${revisionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/measurements/ByRevisionId/${revisionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    // Process subestimates
    let subestimates = [];
    if (subestimatesResponse.status === 'fulfilled' && subestimatesResponse.value.ok) {
      const subestimatesData = await subestimatesResponse.value.json();
      subestimates = Array.isArray(subestimatesData) ? subestimatesData : [];
    }

    // Process items
    let items = [];
    if (itemsResponse.status === 'fulfilled' && itemsResponse.value.ok) {
      const itemsData = await itemsResponse.value.json();
      items = Array.isArray(itemsData) ? itemsData : [];
    }

    // Process measurements
    let measurements = [];
    if (measurementsResponse.status === 'fulfilled' && measurementsResponse.value.ok) {
      const measurementsData = await measurementsResponse.value.json();
      measurements = Array.isArray(measurementsData) ? measurementsData : [];
    }

    // Return complete revision data
    return {
      ...revision,
      subestimates,
      items,
      measurements,
      totalAmount: revision.totalAmount || 0,
      contingency: revision.contingency || 0,
      labourComponent: revision.labourComponent || 0
    };

  } catch (err) {
    console.error('Error fetching revision details:', err);
    toast.error('Failed to fetch revision details');
    return null;
  }
};
// Keep your existing handleDuplicate function
// const handleDuplicate = (id, event) => {
//   // Prevent row click when clicking duplicate button
//   event.stopPropagation();
//   setSelectedWorkorderId(id);
// };
const handleEditRevision = async (workorderId, revisionId, record, revision, event) => {
  // Prevent row click when clicking edit button
  event.stopPropagation();
  
  // Show confirmation dialog
  const confirmed = window.confirm('Are you sure you want to edit this revision?');
  if (!confirmed) return;

  // Check authentication first - following your reference pattern
  if (!token) {
    toast.error('Authentication required. Please login again.');
    return;
  }

  try {
    // Show loading toast
    const loadingToast = toast.loading('Loading revision data...');
    
    // Clear only specific localStorage keys to avoid conflicts (NOT localStorage.clear())
    const keysToRemove = [
      'recordId', 'workorderId', 'reviseId', 'editMode', 'reviseno', 
      'revisionNumber', 'currentRevisionNumber', 'duplicateRevision',
      'edit_nameOfWork', 'edit_state', 'edit_department', 'edit_ssr', 
      'edit_area', 'edit_preparedBy', 'edit_checkedBy', 'edit_chapter',
      'nameOfWork', 'state', 'department', 'ssr', 'area', 'preparedBy', 
      'checkedBy', 'chapter', 'autogenerated', 'status',
      'revisionStage', 'revisionStatus', 'isEditMode', 'editingRevision', 
      'currentRevisionId', 'originalRevisionData', 'subworkData',
      'revisionItems', 'revisionMeasurements', 'revisionDataBySubwork',
      'totalSubworks', 'totalItems', 'totalMeasurements'
    ];
    
    // Remove only the specific keys, preserving authentication and other important data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Store basic revision data first
    localStorage.setItem('recordId', workorderId.toString());
    localStorage.setItem('workorderId', workorderId.toString());
    localStorage.setItem('reviseId', revisionId.toString());
    localStorage.setItem('editMode', 'true');
    localStorage.setItem('reviseno', revision.reviseNumber);
    localStorage.setItem('revisionNumber', revision.reviseNumber);
    localStorage.setItem('currentRevisionNumber', revision.reviseNumber);
    localStorage.removeItem('duplicateRevision');
    
    // Store workorder data (both with and without edit_ prefix)
    if (record) {
      // With edit_ prefix (for form fields)
      localStorage.setItem("edit_nameOfWork", record.nameOfWork || "");
      localStorage.setItem("edit_state", record.state || "");
      localStorage.setItem("edit_department", record.department || "");
      localStorage.setItem("edit_ssr", record.ssr || "");
      localStorage.setItem("edit_area", record.area || "");
      localStorage.setItem("edit_preparedBy", record.preparedBySignature || "");
      localStorage.setItem("edit_checkedBy", record.checkedBySignature || "");
      localStorage.setItem("edit_chapter", record.chapterId?.toString() || "");
      
      // Without edit_ prefix (for display/logic)
      localStorage.setItem("nameOfWork", record.nameOfWork || "");
      localStorage.setItem("state", record.state || "");
      localStorage.setItem("department", record.department || "");
      localStorage.setItem("ssr", record.ssr || "");
      localStorage.setItem("area", record.area || "");
      localStorage.setItem("preparedBy", record.preparedBySignature || "");
      localStorage.setItem("checkedBy", record.checkedBySignature || "");
      localStorage.setItem("chapter", record.chapterId?.toString() || "");
      localStorage.setItem("autogenerated", record.workOrderID || "");
      localStorage.setItem("status", record.status || "");
    }
    
    // Store revision data
    localStorage.setItem("revisionStage", revision.revisionStage || "started");
    localStorage.setItem("revisionStatus", revision.revisionStatus || "pending");
    
    // Store user data - get fresh userData and store token consistently
    const userData = getUserData();
    const currentToken = token; // Use the token variable directly like your reference function
    
    // Store all token variations for compatibility (only if they don't already exist)
    if (!localStorage.getItem("userId")) localStorage.setItem("userId", userData?.uid || "");
    if (!localStorage.getItem("userToken")) localStorage.setItem("userToken", currentToken);
    if (!localStorage.getItem("jwt")) localStorage.setItem("jwt", currentToken);
    if (!localStorage.getItem("Id")) localStorage.setItem("Id", userData?.uid || "");
    if (!localStorage.getItem("authToken")) localStorage.setItem("authToken", currentToken);
    if (!localStorage.getItem("token")) localStorage.setItem("token", currentToken);
    
    // Store edit mode flags
    localStorage.setItem("isEditMode", "true");
    localStorage.setItem("editingRevision", "true");
    localStorage.setItem("currentRevisionId", revisionId.toString());
    
    // Store additional metadata
    localStorage.setItem("originalRevisionData", JSON.stringify({
      id: revisionId,
      reviseNumber: revision.reviseNumber,
      revisionStage: revision.revisionStage,
      revisionStatus: revision.revisionStatus,
      createdDate: revision.createdDate,
      pdfLocation: revision.pdfLocation || ""
    }));
    
    // Debug token
    console.log('Using token for API calls:', currentToken ? 'Token exists' : 'No token found');
    
    // API Base URL
    const API_BASE_URL = "https://24.101.103.87:8082/api";
    
    // Fetch subwork data using the same pattern as your reference function
    const subworkResponse = await fetch(`${API_BASE_URL}/subwork/${revisionId}/${workorderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!subworkResponse.ok) {
      if (subworkResponse.status === 401) {
        toast.error('Session expired. Please login again.');
        // Don't clear all localStorage here either
        const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
        authKeysToRemove.forEach(key => localStorage.removeItem(key));
        navigate('/signin');
        return;
      }
      throw new Error(`Failed to fetch subwork data: ${subworkResponse.status}`);
    }
    
    const subworkData = await subworkResponse.json();
    console.log('Subwork data:', subworkData);
    
    // Store subwork data in localStorage
    localStorage.setItem('subworkData', JSON.stringify(subworkData));
    
    // Initialize arrays to store all items and measurements
    const allItems = [];
    const allMeasurements = [];
    
    // For each subwork, fetch its items and measurements
    for (const subwork of subworkData) {
      try {
        // Fetch items for this subwork
        const itemsResponse = await fetch(`${API_BASE_URL}/txn-items/BySubwork/${subwork.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          console.log(`Items for subwork ${subwork.id}:`, itemsData);
          
          // Add subwork reference to each item
          const itemsWithSubwork = itemsData.map(item => ({
            ...item,
            subworkId: subwork.id,
            subworkName: subwork.subworkName
          }));
          
          allItems.push(...itemsWithSubwork);
          
          // For each item, fetch its measurements
          for (const item of itemsData) {
            try {
              const measurementsResponse = await fetch(`${API_BASE_URL}/txn-items-mts/ByItemId/${item.id}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${currentToken}`,
                  'Content-Type': 'application/json',
                }
              });
              
              if (measurementsResponse.ok) {
                const measurementsData = await measurementsResponse.json();
                console.log(`Measurements for item ${item.id}:`, measurementsData);
                
                // Add item and subwork reference to each measurement
                const measurementsWithRef = measurementsData.map(measurement => ({
                  ...measurement,
                  itemId: item.id,
                  itemNo: item.itemNo,
                  subworkId: subwork.id,
                  subworkName: subwork.subworkName
                }));
                
                allMeasurements.push(...measurementsWithRef);
              } else if (measurementsResponse.status === 401) {
                toast.error('Session expired. Please login again.');
                const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
                authKeysToRemove.forEach(key => localStorage.removeItem(key));
                navigate('/signin');
                return;
              } else {
                console.warn(`Failed to fetch measurements for item ${item.id}:`, measurementsResponse.status);
              }
            } catch (error) {
              console.error(`Error fetching measurements for item ${item.id}:`, error);
            }
          }
        } else if (itemsResponse.status === 401) {
          toast.error('Session expired. Please login again.');
          const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
          authKeysToRemove.forEach(key => localStorage.removeItem(key));
          navigate('/signin');
          return;
        } else {
          console.warn(`Failed to fetch items for subwork ${subwork.id}:`, itemsResponse.status);
        }
      } catch (error) {
        console.error(`Error fetching items for subwork ${subwork.id}:`, error);
      }
    }
    
    // Store all fetched data in localStorage
    localStorage.setItem('revisionItems', JSON.stringify(allItems));
    localStorage.setItem('revisionMeasurements', JSON.stringify(allMeasurements));
    
    // Store organized data by subwork for easier access
    const dataBySubwork = {};
    subworkData.forEach(subwork => {
      const subworkItems = allItems.filter(item => item.subworkId === subwork.id);
      const subworkMeasurements = allMeasurements.filter(measurement => measurement.subworkId === subwork.id);
      
      dataBySubwork[subwork.id] = {
        subwork: subwork,
        items: subworkItems,
        measurements: subworkMeasurements
      };
    });
    
    localStorage.setItem('revisionDataBySubwork', JSON.stringify(dataBySubwork));
    
    // Store summary counts
    localStorage.setItem('totalSubworks', subworkData.length.toString());
    localStorage.setItem('totalItems', allItems.length.toString());
    localStorage.setItem('totalMeasurements', allMeasurements.length.toString());
    
    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success(`Loaded revision data: ${subworkData.length} subworks, ${allItems.length} items, ${allMeasurements.length} measurements`);
    
    // Navigate to subestimate page for revision editing
    navigate('/subestimate');
    
  } catch (error) {
    console.error('Error loading revision data:', error);
    
    // Handle specific error cases
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      toast.error('Session expired. Please login again.');
      const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
      authKeysToRemove.forEach(key => localStorage.removeItem(key));
      navigate('/signin');
    } else {
      toast.error('Failed to load revision data. Please try again.');
    }
  }
};
{/* Editable Name of Work Component */}
const EditableNameOfWork = ({ record, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(record.nameOfWork);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(record.nameOfWork);
  };

  const handleSave = async () => {
    if (editValue.trim() === '' || editValue === record.nameOfWork) {
      setIsEditing(false);
      setEditValue(record.nameOfWork);
      return;
    }

    setIsSaving(true);
    try {
      const success = await onUpdate(record.id, editValue.trim());
      if (success) {
        setIsEditing(false);
      } else {
        // Reset to original value if update failed
        setEditValue(record.nameOfWork);
      }
    } catch (error) {
      console.error('Error updating name of work:', error);
      setEditValue(record.nameOfWork);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(record.nameOfWork);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="flex-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSaving}
        />
        {isSaving && (
          <div className="text-blue-500 text-xs">Saving...</div>
        )}
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors"
      title={`${record.nameOfWork} (Double-click to edit)`}
    >
      {record.nameOfWork.split(' ').slice(0, 10).join(' ')}
      {record.nameOfWork.split(' ').length > 10 ? '...' : ''}
    </div>
  );
};

{/* Update function to be added to your component */}
const updateNameOfWork = async (recordId, newNameOfWork) => {
  // Check authentication first - following your reference pattern
  if (!token) {
    toast.error('Authentication required. Please login again.');
    return false;
  }

  try {
    // Get the current record to preserve all other fields
    const currentRecord = records.find(r => r.id === recordId);
    if (!currentRecord) {
      throw new Error('Record not found');
    }

    // Debug token and current record
    console.log('Using token for API calls:', token ? 'Token exists' : 'No token found');
    console.log('Current record for update:', currentRecord);

    // First, let's get the fresh data from the API to ensure we have all required fields
    const getResponse = await fetch(`https://24.101.103.87:8082/api/workorders/${recordId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
        'Content-Type': 'application/json',
      }
    });

    if (!getResponse.ok) {
      if (getResponse.status === 401) {
        toast.error('Session expired. Please login again.');
        const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
        authKeysToRemove.forEach(key => localStorage.removeItem(key));
        navigate('/signin');
        return false;
      }
      throw new Error(`Failed to fetch current record: ${getResponse.status}`);
    }

    const freshRecord = await getResponse.json();
    console.log('Fresh record from API:', freshRecord);

    // Prepare the update payload with fresh data and only update nameOfWork
    const updatePayload = {
      id: freshRecord.id,
      workOrderID: freshRecord.workOrderID,
      createdDate: freshRecord.createdDate,
      createdBy: freshRecord.createdBy,
      state: freshRecord.state,
      nameOfWork: newNameOfWork, // Only this field changes
      ssr: freshRecord.ssr,
      area: freshRecord.area,
      chapterId: freshRecord.chapterId,
      preparedBySignature: freshRecord.preparedBySignature,
      checkedBySignature: freshRecord.checkedBySignature,
      status: freshRecord.status,
      department: freshRecord.department,
      deletedFlag: freshRecord.deletedFlag,
      multifloor: freshRecord.multifloor,
      fkSsrId: freshRecord.fkSsrId
    };

    console.log('Update payload:', updatePayload);

    const response = await fetch(`https://24.101.103.87:8082/api/workorders/${recordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });

    if (!response.ok) {
      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
        authKeysToRemove.forEach(key => localStorage.removeItem(key));
        navigate('/signin');
        return false;
      }
      
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorResponse = await response.text();
        errorDetails = errorResponse;
        console.error('Server error response:', errorDetails);
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      throw new Error(`HTTP error! status: ${response.status}. Details: ${errorDetails}`);
    }

    // Update the local state
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === recordId 
          ? { ...record, nameOfWork: newNameOfWork }
          : record
      )
    );

    // Show success message
    toast.success('Name of work updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating name of work:', error);
    
    // Handle specific error cases
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      toast.error('Session expired. Please login again.');
      const authKeysToRemove = ['userId', 'userToken', 'jwt', 'Id', 'authToken', 'token'];
      authKeysToRemove.forEach(key => localStorage.removeItem(key));
      navigate('/signin');
    } else if (error.message.includes('500')) {
      toast.error('Server error. Please check the data and try again.');
    } else {
      toast.error('Failed to update name of work. Please try again.');
    }
    return false;
  }
};

  const getFilteredRecords = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return records.filter(rec => {
      const recDate = new Date(rec.createdDate);
      return (
        (!searchTerm || rec.nameOfWork.toLowerCase().includes(searchTerm.toLowerCase())) &&
        recDate >= start && recDate <= end
      );
    });
  };
  
  const paginatedRecords = () => {
    const filtered = getFilteredRecords();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
  
    return filtered
      .slice(startIndex, endIndex);
  };
  
  const totalPages = Math.ceil(getFilteredRecords().length / rowsPerPage);

  // Show loading or authentication error
  if (!token || !uid) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Authentication required</p>
          <button 
            onClick={() => navigate('/signin')} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              background: 'white',
              color: '#059669',
              border: '1px solid #10b981',
            },
          },
          error: {
            style: {
              background: 'white',
              color: '#dc2626',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      
      {/* Filter and Search Section */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="1M">Last 30 Days</option>
          <option value="3M">Last 3 Months</option>
          <option value="1Y">Last Year</option>
          <option value="custom">Custom</option>
        </select>
        <input 
          type="date" 
          className="border p-2 rounded" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          type="date" 
          className="border p-2 rounded" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
        <div className="flex items-center ml-auto">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search work orders..."
              className="border pl-10 pr-3 py-2 rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
{isLoading && (
  <div className="flex justify-center my-8">
    <div className="animate-pulse text-blue-500">Loading work orders...</div>
  </div>
)}

      {/* Empty State */}
{!isLoading && records.length === 0 && (
  <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
    <FileText size={48} className="mx-auto text-gray-400 mb-3" />
    <h3 className="text-xl font-semibold text-gray-700">No work orders found</h3>
    <p className="text-gray-500 mt-2">Create your first work order by clicking the + button</p>
  </div>
)}

      {/* Main Table */}
      {!isLoading && records.length > 0 && (
  <div className="overflow-x-auto">
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-2"></th>
          <th className="p-2">Sr No.</th>
          <th className="p-2">Estimate ID</th>
          <th className="p-2">Name of Work</th>
          <th className="p-2">SSR</th>
          <th className="p-2">Specified Area</th>
          <th className="p-2">Department</th>
          <th className="p-2">Status</th>
          <th className="p-2">Created Date</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
 {paginatedRecords().map((record, index) => (
          <React.Fragment key={record.id}>
            {/* Main Row */}
            <tr className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-2 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(record.id);
                  }}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  {expandedRows[record.id] ? (
                    <span className="font-bold text-lg">▼</span>
                  ) : (
                    <span className="font-bold text-lg">▶</span>
                  )}
                </button>
       </td>
   <td className="p-2 text-center">{records.length - index}</td>
              <td className="p-2">{record.workOrderID}</td>
              <td className="p-2">
                <EditableNameOfWork 
                  record={record}
                  onUpdate={updateNameOfWork}
                />
              </td>
              <td className="p-2">{record.ssr}</td>
              <td className="p-2">
                {record.area.length > 50 ? record.area.substring(0, 50) + '...' : record.area}
              </td>
              <td className="p-2">{record.department}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  record.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : record.status === 'in-progress' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {record.status}
                </span>
              </td>
              <td className="p-2">
                {new Date(record.createdDate).toLocaleDateString()}
              </td>
              <td className="p-2">
                <div className="flex gap-2 action-buttons">
                  {record.pdfLocation ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPDF(record.pdfLocation);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Download PDF"
                    >
                      <FaFilePdf size={16} />
                    </button>
                  ) : (
                 <button                       
  onClick={(e) => handleDuplicateClick(record.id, e)}                       
  className="text-blue-500 hover:text-blue-700 transition-colors"                       
  title="Duplicate"                     
>                       
  <Copy size={16} />                     
</button>
                  )}
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>



                  {/* Expanded Sub-rows for Revisions */}
{expandedRows[record.id] && (
  <tr>
    <td colSpan="9" className="p-0">
      <div className="bg-gray-50 border-t">
        {subRecords[record.id] === undefined ? (
          <div className="p-4 text-center text-gray-500">
            Loading revisions...
          </div>
        ) : subRecords[record.id]?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No revisions found for this work order.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Revision No.</th>
                <th className="p-2 text-left">Name of Work</th>
                <th className="p-2 text-left">Created Date</th>
                <th className="p-2 text-left">Stage</th>
                <th className="p-2 text-left">PDF</th>
                <th className="p-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {subRecords[record.id]?.map((revision) => (
                <tr key={revision.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{revision.reviseNumber}</td>
                  <td className="p-2">Revision Of {record.nameOfWork}</td>
                  <td className="p-2">
                    {new Date(revision.createdDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      revision.revisionStage === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : revision.revisionStage === 'in-progress' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {revision.revisionStage || 'started'}
                    </span>
                  </td>
                  <td className="p-2">
                    {revision.pdfLocation ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPDF(revision.pdfLocation);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Download PDF"
                      >
                        <FaFilePdf size={16} />
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2 action-buttons">
                      {/* Show PDF icon if PDF exists, otherwise show Edit icon */}
                      {revision.pdfLocation ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadPDF(revision.pdfLocation);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Download PDF"
                        >
                          <FaFilePdf size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleEditRevision(
                            record.id, 
                            revision.id, 
                            record, 
                            revision,
                            e
                          )}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit Revision"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      
                      {/* Always show Duplicate icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateRevision(
                            record.id, 
                            revision, 
                            record
                          );
                        }}
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="Duplicate Revision"
                      >
                        <Copy size={14} />
                      </button>
                      
                      <button
                        onClick={(e) => handleDeleteRevision(
                          record.id, 
                          revision.id,
                          e
                        )}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Revision"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </td>
  </tr>
)}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && records.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, getFilteredRecords().length)} of {getFilteredRecords().length} entries
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="border p-1 rounded text-sm"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span className="px-3 py-1 bg-blue-500 text-white rounded">
              {currentPage}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <motion.button
          onClick={handleAddNew}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="Add New Work Order"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaPlus size={20} />
        </motion.button>
        
        <motion.button
          onClick={handleWhatsApp}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
          title="Share via WhatsApp"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaWhatsapp size={20} />
        </motion.button>
      </div>

     
      {/* Duplicate Modal */}
{selectedWorkorderId && (
  <DuplicateModal
    workorderId={selectedWorkorderId}
    onClose={() => setSelectedWorkorderId(null)}
    onDuplicate={handleDuplicate}
    fetchRevisions={fetchRevisions}
    token={token}
   workorderRecord={records.find(r => r.id === selectedWorkorderId)}  // Add this prop
  />
)}
    </motion.div>
  );
};

export default MyWork;