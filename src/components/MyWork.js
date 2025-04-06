
import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, FileText, Copy, Edit } from 'lucide-react';
import DuplicateModal from "./DuplicateModal"; 
import { MdDelete, MdAdd } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { FaFlagCheckered, FaCheck, FaTrash, FaPlus, FaWhatsapp } from "react-icons/fa";
import { motion } from 'framer-motion';

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

  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzODUzNjgyLCJleHAiOjE3NDM5NDAwODJ9.sqUaOTWlqjybtP5c4VZwRPgQfPapwx88VVRSMFgp9b0";
  const uid = 92;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyDateRange();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://24.101.103.87:8082/api/workorders/ByUser/${uid}`, {
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
  
      // ✅ Filter and sort by createdDate (newest first)
      const sorted = data
        .filter(item => item.deletedFlag === 0)
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  
      setRecords(sorted);
    } catch (err) {
      console.error('fetchData failed:', err.message);
      alert('Failed to fetch data: ' + err.message);
    }
  };
  
  
  // Handle Add New button click
  const handleAddNew = () => {
    navigate('/estimate');
  };

  // Handle WhatsApp button click
  const handleWhatsApp = () => {
    const shareText = records.map(item => 
      `Work ID: ${item.id}\nName: ${item.nameOfWork}\nStatus: ${item.status}`
    ).join('\n\n');
  
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const fetchSubRecords = async (workorderId) => {
    try {
      const response = await fetch(`http://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${workorderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Expected array in subRecords');
      }
      const filtered = data.filter(rec => rec.deletedFlag.toLowerCase() === 'no');
      setSubRecords(prev => ({ ...prev, [workorderId]: filtered }));
    } catch (err) {
      console.error(err);
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

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const expanded = { ...prev, [id]: !prev[id] };
      if (expanded[id] && !subRecords[id]) fetchSubRecords(id);
      return expanded;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await fetch(`http://24.101.103.87:8082/api/workorders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deletedFlag: 1 }),
      });
      alert('Record deleted successfully!');
      fetchData(); // Refresh records
    } catch (err) {
      console.error(err);
      alert('Failed to delete record');
    }
  };

  const handleDeleteRevision = async (mainId, revisionId) => {
    if (!window.confirm('Delete this revision?')) return;
    try {
      await fetch(`http://24.101.103.87:8082/api/workorder-revisions/${revisionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deletedFlag: 'YES' }),
      });
      alert('Revision deleted!');
      fetchSubRecords(mainId); // Refresh sub-records
    } catch (err) {
      console.error(err);
      alert('Failed to delete revision');
    }
  };
  
  const handleDuplicateRevision = (mainId, revisionId, record) => {
    localStorage.setItem("recordId", mainId);
    localStorage.setItem("revisionId", revisionId);
  
    // Store pre-fill fields
    localStorage.setItem("prefill_nameOfWork", record.nameOfWork);
    localStorage.setItem("prefill_state", record.state);
    localStorage.setItem("prefill_department", record.department);
    localStorage.setItem("prefill_ssr", record.ssr);
    localStorage.setItem("prefill_area", record.area);
    localStorage.setItem("prefill_preparedBy", record.preparedBySignature || "");
    localStorage.setItem("prefill_checkedBy", record.checkedBySignature || "");
    localStorage.setItem("prefill_chapter", record.chapterId?.toString());
  
    // Redirect to duplicate page
    window.location.href = "/duplicateestimate";
  };
  
  
  // Updated Edit function with proper navigation and data handling
  const handleEdit = (id, record) => {
    // Store the record ID for the estimate page
    localStorage.setItem('recordId', id);
    localStorage.setItem('editMode', 'true');
    
    // Store any additional data needed for the edit page
    if (record) {
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
    navigate('/editestimate');
  };


  const handlePDF = (pdfLocation) => {
    if (pdfLocation) window.open(pdfLocation, '_blank');
    else alert('PDF not available');
  };
  
  const handleDuplicate = (id) => setSelectedWorkorderId(id);
  
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
    return filtered.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredRecords().length / rowsPerPage);
  
  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Filter and Search Section */}
      <div className="flex items-center gap-4 mb-4">
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
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search work orders..."
            className="border p-2 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 w-10"></th>
            <th className="p-2">Sr No.</th>
            <th className="p-2">Workorder Id</th>
            <th className="p-2">Name of Work</th>
            <th className="p-2">SSR</th>
            <th className="p-2">Area</th>
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
                <td className="p-2 text-center">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
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
                    <button 
                      onClick={() => handleDuplicate(record.id)} 
                      title="Duplicate"
                      className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                    >
                      <Copy size={18} />
                    </button>
                    
                    {record.status?.toLowerCase() === 'started' && (
                      <button 
                        onClick={() => handleEdit(record.id)} 
                        title="Edit"
                        className="p-1 hover:bg-amber-100 rounded transition-colors text-amber-600"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    
                    {record.status?.toLowerCase() === 'completed' && record.pdfLocation ? (
                      <button 
                        onClick={() => handlePDF(record.pdfLocation)} 
                        title="View PDF"
                        className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-600"
                      >
                        <FileText size={18} />
                      </button>
                    ) : (
                      <FileText size={18} className="opacity-30 cursor-not-allowed p-1" title="PDF not available" />
                    )}
                    
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
                    <table className="w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2">Revision #</th>
                          <th className="p-2">Revision Name</th>
                          <th className="p-2">Date</th>
                          <th className="p-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(subRecords[record.id] || []).map((sub) => (
                          <tr key={sub.id} className="border-t hover:bg-gray-100">
                            <td className="p-2 text-center">{sub.reviseNumber}</td>
                            <td className="p-2">Revision of {record.nameOfWork}</td>
                            <td className="p-2">{new Date(sub.createdDate).toLocaleString()}</td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                  {sub.revisionStage}
                                </span>
                                
                                {record.status?.toLowerCase() === 'completed' && record.pdfLocation ? (
                                  <button 
                                    onClick={() => handlePDF(record.pdfLocation)} 
                                    title="View PDF"
                                    className="p-1 hover:bg-purple-100 rounded transition-colors text-purple-600"
                                  >
                                    <FileText size={16} />
                                  </button>
                                ) : (
                                  <FileText size={16} className="opacity-30 cursor-not-allowed p-1" title="PDF not available" />
                                )}
                                
                                <button
                                  title="Duplicate Revision"
                                  onClick={() => handleDuplicateRevision(record.id, sub.id, record)}
                                  className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                >
                                  <Copy size={16} />
                                </button>
                                
                                <button
                                  title="Delete Revision"
                                  onClick={() => handleDeleteRevision(record.id, sub.id)}
                                  className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
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

        <div className="flex items-center gap-2">
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
          onClose={() => setSelectedWorkorderId(null)} 
        />
      )}
    </motion.div>
  );
};

export default MyWork;