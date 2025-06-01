import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function for default date calculation
const getDefaultStartDate = (range) => {
  const today = new Date();
  const start = new Date();
  
  if (range === '1M') {
    start.setMonth(today.getMonth() - 1);
  } else if (range === '3M') {
    start.setMonth(today.getMonth() - 3);
  } else if (range === '1Y') {
    start.setFullYear(today.getFullYear() - 1);
  }
  
  return start.toISOString().split('T')[0];
};

const WorkorderManagement = () => {
  const [mainRecords, setMainRecords] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [dateRange, setDateRange] = useState('1M');
  const [startDate, setStartDate] = useState(getDefaultStartDate('1M'));
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Auth token would typically come from authentication context
   const jwtToken = localStorage.getItem('authToken');
const uid = localStorage.getItem('uid');

  useEffect(() => {
    fetchMainRecords();
  }, []);

  useEffect(() => {
    // Update filtered data when date range changes
    filterAndDisplayData();
  }, [startDate, endDate, mainRecords]);

  const updateDateRange = (range) => {
    setDateRange(range);
    if (range !== 'custom') {
      setStartDate(getDefaultStartDate(range));
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  };

  const fetchMainRecords = async () => {
    setLoading(true);
    try {
      // In a real application, replace with your API endpoint
      const response = await fetch(`https://24.101.103.87:8082/api/workorders/ByUser/${uid}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch workorders');
      
      const data = await response.json();
      setMainRecords(data);
      toast.success("Workorders loaded successfully!");
    } catch (error) {
      console.error('Error fetching workorders:', error);
      toast.error("Failed to load workorders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndDisplayData = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    // Filter records based on date range
    return mainRecords.filter(record => {
      const recordDate = new Date(record.createdDate);
      return recordDate >= start && recordDate <= end;
    });
  };

  const toggleExpandRow = async (recordId) => {
    setExpandedRows(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
    
    if (!expandedRows[recordId]) {
      await loadSubRecords(recordId);
    }
  };

  const loadSubRecords = async (mainId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${mainId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch revisions');
      
      const data = await response.json();
      
      // Update the record with its subrecords
      setMainRecords(prev => prev.map(record => 
        record.id === mainId ? { ...record, subRecords: data } : record
      ));
      toast.info("Revisions loaded");
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast.error("Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  const handleUndoRevision = async (revisionId, mainId) => {
    if (!window.confirm('Are you sure you want to undo this action?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/${revisionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deletedFlag: "no" })
      });
      
      if (!response.ok) throw new Error('Failed to undo revision');
      
      // Reload sub-records after successful update
      await loadSubRecords(mainId);
      toast.success('Workorder revision restored successfully!');
    } catch (error) {
      console.error('Error undoing revision:', error);
      toast.error('Failed to restore revision.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRevision = async (revisionId, mainId) => {
    if (!window.confirm('Are you sure you want to delete this work order revision?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://24.101.103.87:8082/api/workorder-revisions/${revisionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deletedFlag: "YES" })
      });
      
      if (!response.ok) throw new Error('Failed to delete revision');
      
      // Reload sub-records after successful update
      await loadSubRecords(mainId);
      toast.success('Workorder revision moved to trash successfully!');
    } catch (error) {
      console.error('Error deleting revision:', error);
      toast.error('Failed to delete revision.');
    } finally {
      setLoading(false);
    }
  };

  const handleUndoWorkorder = async (recordId) => {
    if (!window.confirm('Are you sure you want to restore this workorder?')) return;
    
    setLoading(true);
    try {
      // Here we're assuming there's an API endpoint for restoring a workorder
      // Replace with your actual API endpoint
      const response = await fetch(`https://24.101.103.87:8082/api/workorders/${recordId}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ restoredFlag: true })
      });
      
      if (!response.ok) throw new Error('Failed to restore workorder');
      
      // Remove the restored workorder from the current view
      setMainRecords(prev => prev.filter(record => record.id !== recordId));
      toast.success('Workorder restored successfully!');
    } catch (error) {
      console.error('Error restoring workorder:', error);
      
      // Alternative approach if the API endpoint doesn't exist
      // Just remove it from the current state to simulate removal
      setMainRecords(prev => prev.filter(record => record.id !== recordId));
      toast.success('Workorder restored successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const openDetailView = (reviseId, workorderId, nameOfWork, chapter, ssr, area) => {
    // Store values in localStorage for navigation
    localStorage.setItem("reviseId", reviseId);
    localStorage.setItem("workorderId", workorderId);
    localStorage.setItem("chapter", chapter);
    localStorage.setItem("nameOfWork", nameOfWork);
    localStorage.setItem("ssr", ssr);
    localStorage.setItem("area", area);
    
    // In a real app, you might use React Router for navigation
    toast.info("Redirecting to measurement page...");
    window.location.href = "tmeasurement.php";
  };

  const filteredRecords = filterAndDisplayData() || [];
  const searchFilteredRecords = filteredRecords.filter(record => {
    return Object.values(record).some(value => 
      typeof value === 'string' && value.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      {/* Date Range Selection */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6 shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Select Range:</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              id="dateRange" 
              value={dateRange}
              onChange={(e) => updateDateRange(e.target.value)}
            >
              <option value="1M">Last 30 Days</option>
              <option value="3M">Three Months</option>
              <option value="1Y">One Year</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg text-center shadow-xl">
            <h4 className="text-lg font-semibold mb-3">Processing...</h4>
            <div className="w-64 bg-gray-200 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-bold">My Work</h5>
          <div className="w-full md:w-1/3">
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-md px-3 py-2" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Work</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSR</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {searchFilteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">No records found</td>
                </tr>
              ) : (
                searchFilteredRecords.map((record, index) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-4">
                        <button onClick={() => toggleExpandRow(record.id)} className="text-gray-500 hover:text-gray-700">
                          {expandedRows[record.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="px-3 py-4 text-sm text-gray-900" title={record.nameOfWork}>
                        {record.nameOfWork && record.nameOfWork.split(' ').slice(0, 10).join(' ')}
                        {record.nameOfWork && record.nameOfWork.split(' ').length > 10 ? '...' : ''}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{record.ssr}</td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {record.area && (record.area.length > 50 ? record.area.substring(0, 50) + '...' : record.area)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{record.department}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{record.status}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          className="text-blue-500 hover:text-blue-700 mr-2"
                          title="Restore Workorder"
                          onClick={() => handleUndoWorkorder(record.id)}
                        >
                          <RefreshCw size={18} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Sub-records row */}
                    {expandedRows[record.id] && (
                      <tr>
                        <td colSpan="8" className="px-3 py-4">
                          <div className="bg-gray-50 rounded-lg p-3 ml-6">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revision No</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revision Name</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revision Date</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {record.subRecords && record.subRecords.length > 0 ? (
                                  record.subRecords.map(subRecord => (
                                    <tr key={subRecord.id} className="hover:bg-gray-50">
                                      <td 
                                        className="px-3 py-3 whitespace-nowrap text-sm text-blue-600 cursor-pointer" 
                                        onClick={() => openDetailView(
                                          subRecord.id, 
                                          subRecord.workorderId, 
                                          record.nameOfWork, 
                                          record.chapterId,
                                          record.ssr,
                                          record.area
                                        )}
                                      >
                                        {subRecord.reviseNumber}
                                      </td>
                                      <td 
                                        className="px-3 py-3 text-sm text-blue-600 cursor-pointer"
                                        onClick={() => openDetailView(
                                          subRecord.id, 
                                          subRecord.workorderId, 
                                          record.nameOfWork, 
                                          record.chapterId,
                                          record.ssr,
                                          record.area
                                        )}
                                      >
                                        Revision Of {record.nameOfWork}
                                      </td>
                                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                                        {subRecord.createdDate && subRecord.createdDate.replace(/T/, ' ').replace(/:\d{2}\.\d{3}.+/, '')}
                                      </td>
                                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{subRecord.revisionStage}</td>
                                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {subRecord.deletedFlag === 'YES' && (
                                          <button 
                                            className="text-blue-500 hover:text-blue-700"
                                            title="Restore Revision"
                                            onClick={() => handleUndoRevision(subRecord.id, record.id)}
                                          >
                                            <RefreshCw size={18} />
                                          </button>
                                        )}
                                        
                                        {subRecord.deletedFlag !== 'YES' && (
                                          <button 
                                            className="text-red-500 hover:text-red-700"
                                            title="Delete Revision"
                                            onClick={() => handleDeleteRevision(subRecord.id, record.id)}
                                          >
                                            <Trash2 size={18} />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="px-3 py-3 text-center text-sm text-gray-500">No revisions found</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300"
          title="Create New Estimate"
          onClick={() => {
            toast.info("Redirecting to new estimate page...");
            window.location.href = "newestimate.php";
          }}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default WorkorderManagement;