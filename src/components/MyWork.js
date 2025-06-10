import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, FileText, Copy, Edit } from 'lucide-react';
import DuplicateModal from "./DuplicateModal"; 
import { MdDelete, MdAdd } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { FaFlagCheckered, FaCheck, FaTrash, FaPlus, FaWhatsapp, FaFilePdf } from "react-icons/fa";
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { prefillRevisionDuplicateLocalStorage } from './revisionDuplicateUtils';

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
    // Try to get the complete user object first (this is what we're now storing)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        token: userData.jwt || userData.token,
        uid: userData.id?.toString() || userData.uid?.toString()
      };
    }
    
    // Fallback to individual items if user object doesn't exist
    const token = localStorage.getItem('jwt') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token');
    
    const uid = localStorage.getItem('Id') || 
                localStorage.getItem('id') || 
                localStorage.getItem('uid');
    
    return { 
      token: token, 
      uid: uid?.toString() 
    };
  } catch (error) {
    console.error('Error getting user data:', error);
    
    // Last resort fallback
    return {
      token: localStorage.getItem('authToken') || localStorage.getItem('jwt'),
      uid: localStorage.getItem('Id') || localStorage.getItem('id')
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

  const isEditMode = localStorage.getItem("editMode") === "true";
  const isDuplicateRevision = localStorage.getItem("duplicateRevision") === "true";
  const existingRevisionId = localStorage.getItem("reviseId");

  useEffect(() => {
    const isEditMode = localStorage.getItem("editMode") === "true";
    const isDuplicateRevision = localStorage.getItem("duplicateRevision") === "true";

    const createDuplicateRevision = async () => {
      const existingRevisionId = localStorage.getItem("reviseId");
      const API_BASE_URL = "https://24.101.103.87:8082/api";

      if (isEditMode && isDuplicateRevision) {
        const revisionPayload = {
          workorderId: parseInt(localStorage.getItem("recordId")),
          reviseNumber: localStorage.getItem("reviseno") || "1.1",
          createdDate: new Date().toISOString(),
          createdBy: parseInt(uid),
          updatedBy: parseInt(uid),
          updatedDate: new Date().toISOString(),
          currentFlag: true,
          deletedFlag: "no",
          pdfLocation: "",
          revisionStage: "started",
          revisionStatus: "pending"
        };

        try {
          const res = await fetch(`${API_BASE_URL}/workorder-revisions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(revisionPayload)
          });

          const newRevData = await res.json();
          localStorage.setItem("reviseId", newRevData.id);
          toast.success("Revision duplicated successfully!");
          setTimeout(() => {
            window.location.href = "/subestimate";
          }, 1000);
        } catch (err) {
          toast.error("Failed to duplicate revision");
        }

        localStorage.removeItem("duplicateRevision");
      }
    };

    createDuplicateRevision();
  }, [token, uid]);

  useEffect(() => {
    if (token && uid) {
      fetchData();
    } else {
      toast.error('Authentication required. Please login again.');
      // You might want to redirect to login page here
    }
    
    const updated = localStorage.getItem("estimateUpdated");
    if (updated === "true") {
      localStorage.removeItem("estimateUpdated");
      fetchData();
    }
  }, [token, uid]);

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
  
      // Add an absoluteIndex property to each record
      const indexedRecords = sorted.map((record, index) => ({
        ...record,
        absoluteIndex: index + 1
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
        if (!response.ok) throw new Error(`Error fetching revisions for workorder ${id}`);
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
  
  const handleDelete = async (id) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Show confirmation toast
    toast(
      (t) => (
        <div className="flex flex-col gap-2 bg-white p-2 rounded-lg">
          <p>Are you sure you want to delete this work order?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                
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
                    const errorData = await response.json().catch(() => null);
                    console.error('Error response:', errorData);
                    throw new Error(`Server error: ${response.status}`);
                  }
                  
                  toast.success('Record deleted successfully!');
                  fetchData(); // Refresh records
                } catch (err) {
                  console.error(err);
                  toast.error('Failed to delete record');
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: 10000 }
    );
  };

  const handleDeleteRevision = async (mainId, revisionId) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Show confirmation toast
    toast((t) => (
      <div className="flex flex-col p-2 bg-white rounded-lg">
        <p className="mb-2 font-medium">Are you sure you want to delete this revision?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
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
                  throw new Error(`Server error: ${response.status}`);
                }
                
                toast.success('Revision deleted successfully!');
                fetchSubRecords(mainId); // Refresh sub-records
              } catch (err) {
                console.error(err);
                toast.error('Failed to delete revision');
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
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
      if (!response.ok) throw new Error("Failed to fetch revisions");
  
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
        throw new Error(`Failed to fetch revision with id ${revisionId}`);
      }
  
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (err) {
      toast.error('Error fetching revision');
      return null;
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
    // 1. Fetch all current revisions for the workorder
    const allRevisions = await fetchRevisions(workorderId);
    // 2. Get next available number
    const nextRevNumber = getNextRevisionNumberFromList(allRevisions);
  
    // 3. Prefill localStorage (copy all fields)
    localStorage.setItem("editMode", "true");
    localStorage.setItem("recordId", workorderId);
    localStorage.setItem("reviseId", ""); // Always blank for new
    localStorage.setItem("reviseno", nextRevNumber);
    localStorage.setItem("duplicateRevision", "true");
    localStorage.setItem("edit_nameOfWork", workorderRecord.nameOfWork || "");
    localStorage.setItem("edit_state", workorderRecord.state || "");
    localStorage.setItem("edit_department", workorderRecord.department || "");
    localStorage.setItem("edit_ssr", workorderRecord.ssr || "");
    localStorage.setItem("edit_area", workorderRecord.area || "");
    localStorage.setItem("edit_preparedBy", workorderRecord.preparedBySignature || "");
    localStorage.setItem("edit_checkedBy", workorderRecord.checkedBySignature || "");
    localStorage.setItem("edit_chapter", workorderRecord.chapterId?.toString() || "");
    localStorage.setItem("autogenerated", workorderRecord.workOrderID);
    localStorage.setItem("status", workorderRecord.status);
    localStorage.setItem("revisionStage", "started");
  
    toast.success(`Duplicating revision as ${nextRevNumber}`);
    navigate("/subestimate");
  };
  
  // Add above handleEdit
  const handleDuplicate = (id) => {
    setSelectedWorkorderId(id);
  };

  // Updated Edit function with confirmation toast
  const handleEdit = (id, record) => {
    // Show confirmation toast
    toast((t) => (
      <div className="flex flex-col p-2 bg-white rounded-lg">
        <p className="mb-2 font-medium">Are you sure you want to edit this estimate?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              
              // Store the record ID for the estimate page
              localStorage.setItem('recordId', id);
              localStorage.setItem('editMode', 'true');
              
              // Store any additional data needed for the edit page
              if (record) {
                localStorage.setItem('recordId', id); // workorderId
                localStorage.setItem('editMode', 'true'); // flag for edit mode
                localStorage.setItem("edit_nameOfWork", record.nameOfWork || "");
                localStorage.setItem("edit_state", record.state || "");
                localStorage.setItem("edit_department", record.department || "");
                localStorage.setItem("edit_ssr", record.ssr || "");
                localStorage.setItem("edit_area", record.area || "");
                localStorage.setItem("edit_preparedBy", record.preparedBySignature || "");
                localStorage.setItem("edit_checkedBy", record.checkedBySignature || "");
                localStorage.setItem("edit_chapter", record.chapterId?.toString() || "");
              }
              
              // Use React Router's navigate for better SPA navigation
              navigate('/estimate');
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  const prefillRevisionDuplicateLocalStorage = (record, latestRevision) => {
    const getNextRevisionNumber = (current) => {
      try {
        let [major, minor] = current.split('.').map(num => parseInt(num, 10));
        if (isNaN(major)) major = 1;
        if (isNaN(minor)) minor = 0;
        return `${major}.${minor + 1}`;
      } catch (err) {
        return "1.0"; // fallback if something goes wrong
      }
    };
  
    const newRevNo = getNextRevisionNumber(latestRevision.reviseNumber || "1.0");
  
    localStorage.setItem("editMode", "true");
    localStorage.setItem("recordId", record.id);
    localStorage.setItem("reviseId", "");
    localStorage.setItem("reviseno", newRevNo);
    localStorage.setItem("duplicateRevision", "true");
  
    localStorage.setItem("edit_nameOfWork", record.nameOfWork || "");
    localStorage.setItem("edit_state", record.state || "");
    localStorage.setItem("edit_department", record.department || "");
    localStorage.setItem("edit_ssr", record.ssr || "");
    localStorage.setItem("edit_area", record.area || "");
    localStorage.setItem("edit_preparedBy", record.preparedBySignature || "");
    localStorage.setItem("edit_checkedBy", record.checkedBySignature || "");
    localStorage.setItem("edit_chapter", record.chapterId?.toString() || "");
    localStorage.setItem("autogenerated", record.workOrderID);
    localStorage.setItem("status", record.status);
    localStorage.setItem("revisionStage", "started");
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
            onClick={() => window.location.href = '/login'} 
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
                <th className="p-2 w-10"></th>
                <th className="p-2">Sr No.</th>
                <th className="p-2">Estimate Id</th>
                <th className="p-2">Name of Work</th>
                <th className="p-2">SSR</th>
                <th className="p-2">Specified Area</th>
                <th className="p-2">Department</th>
                <th className="p-2">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords().map((record, idx) => (
                <React.Fragment key={record.id}>
                  {/* Main Row */}
                  <motion.tr
                    className="border-b hover:bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    <td className="text-center">
                      <button 
                        onClick={() => toggleRow(record.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        {expandedRows[record.id] ? 
                          <ChevronUp size={18} className="text-blue-500" /> : 
                          <ChevronDown size={18} />
                        }
                      </button>
                    </td>
                    <td className="p-2 text-center">{records.length - record.absoluteIndex + 1}</td>
                    <td className="p-2">{record.workOrderID}</td>
                    <td className="p-2" title={record.nameOfWork}>
                      <div className="max-w-xs truncate">{record.nameOfWork}</div>
                    </td>
                    <td className="p-2">{record.ssr}</td>
                    <td className="p-2">{record.area}</td>
                    <td className="p-2">{record.department}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status?.toLowerCase() === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status?.toLowerCase() === 'started'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2 items-center">
                        {/* Duplicate button is always visible */}
                        <button 
                          onClick={() => handleDuplicate(record.id)} 
                          title="Duplicate"
                          className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                        >
                          <Copy size={18} />
                        </button>
                        
                        {/* Show Edit button only for "started" workorders */}
                        {/* {record.status?.toLowerCase() === 'started' && subRecords[record.id]?.[0] && (
  <button
    title="Duplicate Latest Revision"
    onClick={() => handleDuplicateRevision(record.id, subRecords[record.id][0].id, { ...record, reviseNumber: subRecords[record.id][0].reviseNumber })}
    className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
  >
    <Copy size={16} />
  </button>
)} */}

{/* <button 
  onClick={() => handleEdit(record.id, record)}
  title="Edit"
  className="p-1 hover:bg-green-100 rounded transition-colors text-green-600"
>
  <Edit size={18} />
</button>        */}
                        {/* Show active PDF button only for "completed" workorders with pdfLocation */}
                        {record.status?.toLowerCase() === '	Progress' && record.pdfLocation ? (
                          <button 
                            // onClick={() => handlePDF(record.pdfLocation)} 
                            title="View PDF"
                            className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-700"
                          >
                            <FaFilePdf size={18} className="text-purple-700" />
                          </button>
                        ) : (
                          /* Show disabled PDF icon for all other cases */
                          <div 
                            className="p-1 text-gray-400 opacity-50 cursor-not-allowed"
                            title="PDF not available"
                          >
                            <FaFilePdf size={18} />
                          </div>
                        )}
                        
                        {/* Delete button is always visible */}
                        <button 
                          onClick={() => handleDelete(record.id)} 
                          title="Delete"
                          className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  
                  {/* Expanded Row with Revisions */}
                {expandedRows[record.id] && (
  <tr>
    <td colSpan="9" className="bg-gray-50 p-4">
      {subRecords[record.id] === undefined ? (
        <div className="text-center py-4 text-blue-400">Loading revisions...</div>
      ) : subRecords[record.id].length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No revisions found for this work order
        </div>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Revision #</th>
              <th className="p-2">Revision Name</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subRecords[record.id].map((sub) => (
              <tr key={sub.id} className="border-t hover:bg-gray-100">
                <td className="p-2 text-center">{sub.reviseNumber}</td>
                <td className="p-2">Revision of {record.nameOfWork}</td>
                <td className="p-2">{new Date(sub.createdDate).toLocaleString()}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sub.revisionStatus?.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : sub.revisionStatus?.toLowerCase() === 'started'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sub.revisionStatus}
                  </span>
                </td>
                <td className="p-3 flex gap-3 items-center">
                <button
  onClick={() => handleDuplicateRevision(record.id, sub, record)}
  className="text-blue-600 hover:underline"
  title="Duplicate Revision"
>
  <Copy size={16} />
</button>

                  <button
                    onClick={() => {
                      localStorage.setItem('recordId', record.id);
                      localStorage.setItem('editMode', 'true');
                      localStorage.setItem("reviseId", "");
                      localStorage.setItem("reviseno", "1.0");
                      navigate('/subestimate');
                    }}
                    className="text-green-600 hover:underline"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  {sub.pdfLocation
                    ? (
                      <button
                        onClick={() => window.open(sub.pdfLocation, "_blank")}
                        className="text-purple-700 hover:underline"
                        title="View PDF"
                      >
                        <FaFilePdf size={16} />
                      </button>
                    ) : (
                      <span className="text-gray-400 opacity-50 cursor-not-allowed" title="PDF not available">
                        <FaFilePdf size={16} />
                      </span>
                    )}
                  <button
                    onClick={() => handleDeleteRevision(record.id, sub.id)}
                    className="text-red-600 hover:underline"
                    title="Delete Revision"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
        <div className="flex flex-wrap justify-between items-center mt-4">
          <div>
            <label className="text-sm mr-2">Rows per page:</label>
            <select
              className="border rounded p-1"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Prev
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed right-6 bottom-12 flex flex-col space-y-6 z-10">
        <div className="relative group">
          <button 
            onClick={handleAddNew}
            className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors focus:outline-none"
          >
            <MdAdd className="text-2xl" />
          </button>
          <span className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            Create Estimate
          </span>
        </div>

        <div className="relative group">
          <button 
            onClick={handleWhatsApp}
            className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors focus:outline-none"
          >
            <FaWhatsapp className="text-2xl" />
          </button>
          <span className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            Share via WhatsApp
          </span>
        </div>
      </div>
      
      {/* Duplicate Modal */}
      {selectedWorkorderId && (
        <DuplicateModal 
          workorderId={selectedWorkorderId} 
          onClose={() => {
            setSelectedWorkorderId(null);
            toast.success('Closed duplicate modal');
          }} 
        />
      )}
    </motion.div>
  );
};

export default MyWork;