// // import React, { useState, useEffect } from 'react';
// // import { LucideSearch, LucideChevronDown } from 'lucide-react';

// // const MyWork = () => {
// //   const [dateRange, setDateRange] = useState('1M');
// //   const [startDate, setStartDate] = useState('');
// //   const [endDate, setEndDate] = useState('');
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [tableData, setTableData] = useState([]);
// //   const [mainRecords, setMainRecords] = useState([]);
// //   const [selectedRecord, setSelectedRecord] = useState(null);
// //   const [subRecords, setSubRecords] = useState({});
// //   const [showDuplicateModal, setShowDuplicateModal] = useState(false);
// //   const [selectedRevision, setSelectedRevision] = useState(null);

// //   // Authentication and token management (you'd typically get these from context or login state)
// //   const token = localStorage.getItem('authToken');
// //   const uid = localStorage.getItem('id');

// //   // Fetch main records
// //   useEffect(() => {
// //     fetchMainRecords();
// //   }, []);

// //   // Update date range when dateRange changes
// //   useEffect(() => {
// //     updateDateInputs();
// //   }, [dateRange]);

// //   const fetchMainRecords = async () => {
// //     try {
// //       const response = await fetch(`http://24.101.103.87:8082/api/workorders/ByUser/${uid}`, {
// //         method: 'GET',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });
      
// //       if (!response.ok) {
// //         throw new Error('Failed to fetch records');
// //       }
      
// //       const data = await response.json();
// //       const filteredRecords = data.filter(record => record.deletedFlag === 0);
// //       setMainRecords(filteredRecords);
// //       updateDateInputs();
// //     } catch (error) {
// //       console.error('Error fetching main records:', error);
// //     }
// //   };

// //   const updateDateInputs = () => {
// //     const today = new Date();
// //     const start = new Date();

// //     switch(dateRange) {
// //       case '1M':
// //         start.setMonth(today.getMonth() - 1);
// //         break;
// //       case '3M':
// //         start.setMonth(today.getMonth() - 3);
// //         break;
// //       case '1Y':
// //         start.setFullYear(today.getFullYear() - 1);
// //         break;
// //       default:
// //         return;
// //     }

// //     setStartDate(start.toISOString().split('T')[0]);
// //     setEndDate(today.toISOString().split('T')[0]);
// //   };

// //   const filterAndDisplayData = () => {
// //     if (!startDate || !endDate) return;

// //     const start = new Date(startDate);
// //     const end = new Date(endDate);
// //     end.setHours(23, 59, 59, 999);

// //     const filteredData = mainRecords.filter(record => {
// //       const recordDate = new Date(record.createdDate);
// //       return recordDate >= start && recordDate <= end;
// //     });

// //     setTableData(filteredData);
// //   };

// //   const fetchSubRecords = async (mainId) => {
// //     try {
// //       const response = await fetch(`http://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${mainId}`, {
// //         method: 'GET',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });
      
// //       if (!response.ok) {
// //         throw new Error('Failed to fetch sub records');
// //       }
      
// //       const data = await response.json();
// //       const filteredSubRecords = data.filter(sub => sub.deletedFlag === 'no');
      
// //       setSubRecords(prev => ({
// //         ...prev,
// //         [mainId]: filteredSubRecords
// //       }));
// //     } catch (error) {
// //       console.error('Error fetching sub records:', error);
// //     }
// //   };

// //   const toggleSubRecords = (record) => {
// //     setSelectedRecord(selectedRecord?.id === record.id ? null : record);
// //     if (!subRecords[record.id]) {
// //       fetchSubRecords(record.id);
// //     }
// //   };

// //   const openDuplicateModal = (record) => {
// //     setSelectedRecord(record);
// //     setShowDuplicateModal(true);
// //   };

// //   const handleDuplicateConfirm = () => {
// //     if (selectedRecord && selectedRevision) {
// //       // Implement duplicate logic
// //       localStorage.setItem('recordId', selectedRecord.id);
// //       localStorage.setItem('revisionId', selectedRevision);
      
// //       // You might want to redirect or perform an action here
// //       console.log('Duplicating record:', selectedRecord.id, 'with revision:', selectedRevision);
      
// //       setShowDuplicateModal(false);
// //     } else {
// //       alert('Please select a revision!');
// //     }
// //   };

// //   return (
// //     <div className="p-4 bg-white">
// //       {/* Date Range Section */}
// //       <div className="bg-gray-100 border rounded-lg p-4 mb-4">
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           {/* Date Range Selection */}
// //           <div>
// //             <label htmlFor="dateRange" className="block mb-2 text-sm font-medium">
// //               Select Range
// //             </label>
// //             <select 
// //               id="dateRange" 
// //               value={dateRange}
// //               onChange={(e) => setDateRange(e.target.value)}
// //               className="w-full p-2 border rounded-md"
// //             >
// //               <option value="1M">Last 30 Days</option>
// //               <option value="3M">Three Months</option>
// //               <option value="1Y">One Year</option>
// //               <option value="custom">Custom Date</option>
// //             </select>
// //           </div>

// //           {/* Start Date */}
// //           <div>
// //             <label htmlFor="startDate" className="block mb-2 text-sm font-medium">
// //               Start Date
// //             </label>
// //             <input 
// //               type="date" 
// //               id="startDate"
// //               value={startDate}
// //               onChange={(e) => setStartDate(e.target.value)}
// //               className="w-full p-2 border rounded-md"
// //             />
// //           </div>

// //           {/* End Date */}
// //           <div>
// //             <label htmlFor="endDate" className="block mb-2 text-sm font-medium">
// //               End Date
// //             </label>
// //             <input 
// //               type="date" 
// //               id="endDate"
// //               value={endDate}
// //               onChange={(e) => setEndDate(e.target.value)}
// //               className="w-full p-2 border rounded-md"
// //             />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Table Section */}
// //       <div className="mb-4 flex justify-between items-center">
// //         <h5 className="text-lg font-semibold">My Work</h5>
// //         <div className="relative w-64">
// //           <input 
// //             type="text"
// //             placeholder="Search..."
// //             value={searchTerm}
// //             onChange={(e) => setSearchTerm(e.target.value)}
// //             className="w-full pl-10 pr-4 py-2 border rounded-md"
// //           />
// //           <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
// //         </div>
// //       </div>

// //       {/* Table */}
// //       <div className="overflow-x-auto">
// //         <table className="w-full table-auto">
// //           <thead className="bg-gray-100">
// //             <tr>
// //               <th className="p-2 text-left"></th>
// //               {['Sr No.', 'Workorder Id', 'Name of Work', 'SSR', 'Area', 'Department', 'Status'].map((header, index) => (
// //                 <th 
// //                   key={header}
// //                   className="p-2 text-left cursor-pointer hover:bg-gray-200"
// //                   onClick={() => {/* Sorting logic */}}
// //                 >
// //                   <div className="flex items-center">
// //                     {header}
// //                     <LucideChevronDown className="ml-1 w-4 h-4" />
// //                   </div>
// //                 </th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {mainRecords.map((record, index) => (
// //               <>
// //                 <tr 
// //                   key={record.id} 
// //                   className="hover:bg-gray-50 border-b cursor-pointer"
// //                   onClick={() => toggleSubRecords(record)}
// //                 >
// //                   <td className="p-2">
// //                     <i className={`fas ${selectedRecord?.id === record.id ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
// //                   </td>
// //                   <td className="p-2">{index + 1}</td>
// //                   <td className="p-2">{record.workOrderID}</td>
// //                   <td className="p-2">{record.nameOfWork}</td>
// //                   <td className="p-2">{record.ssr}</td>
// //                   <td className="p-2">{record.area}</td>
// //                   <td className="p-2">{record.department}</td>
// //                   <td className="p-2">
// //                     <span className={`px-2 py-1 rounded-full text-xs ${
// //                       record.status.toLowerCase() === 'active' 
// //                       ? 'bg-green-100 text-green-800' 
// //                       : 'bg-gray-100 text-gray-800'
// //                     }`}>
// //                       {record.status}
// //                     </span>
// //                   </td>
// //                   <td className="p-2">
// //                     <div className="flex space-x-2">
// //                       <button 
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           openDuplicateModal(record);
// //                         }} 
// //                         className="text-blue-500 hover:text-blue-700"
// //                       >
// //                         <i className="fas fa-clone"></i>
// //                       </button>
// //                       {record.pdfLocation && (
// //                         <button 
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             window.open(record.pdfLocation, '_blank');
// //                           }} 
// //                           className="text-red-500 hover:text-red-700"
// //                         >
// //                           <i className="fas fa-file-pdf"></i>
// //                         </button>
// //                       )}
// //                     </div>
// //                   </td>
// //                 </tr>
// //                 {selectedRecord?.id === record.id && (
// //                   <tr>
// //                     <td colSpan={9}>
// //                       <div className="bg-gray-50 p-4">
// //                         <table className="w-full">
// //                           <thead>
// //                             <tr>
// //                               <th>Revision No</th>
// //                               <th>Revision Name</th>
// //                               <th>Revision Date</th>
// //                               <th>Status</th>
// //                               <th>Actions</th>
// //                             </tr>
// //                           </thead>
// //                           <tbody>
// //                             {subRecords[record.id]?.map((sub) => (
// //                               <tr key={sub.id} className="border-b">
// //                                 <td>{sub.reviseNumber}</td>
// //                                 <td>Revision of {record.nameOfWork}</td>
// //                                 <td>{new Date(sub.createdDate).toLocaleString()}</td>
// //                                 <td>{sub.revisionStage}</td>
// //                                 <td>
// //                                   <div className="flex space-x-2">
// //                                     <button 
// //                                       onClick={() => {/* View details */}}
// //                                       className="text-blue-500 hover:text-blue-700"
// //                                     >
// //                                       <i className="fas fa-eye"></i>
// //                                     </button>
// //                                     {sub.pdfLocation && (
// //                                       <button 
// //                                         onClick={() => window.open(sub.pdfLocation, '_blank')}
// //                                         className="text-red-500 hover:text-red-700"
// //                                       >
// //                                         <i className="fas fa-file-pdf"></i>
// //                                       </button>
// //                                     )}
// //                                   </div>
// //                                 </td>
// //                               </tr>
// //                             ))}
// //                           </tbody>
// //                         </table>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 )}
// //               </>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Duplicate Modal */}
// //       {showDuplicateModal && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
// //           <div className="bg-white rounded-lg p-6 w-96">
// //             <div className="flex justify-between items-center mb-4">
// //               <h2 className="text-xl font-bold">Duplicate Workorder</h2>
// //               <button 
// //                 onClick={() => setShowDuplicateModal(false)}
// //                 className="text-gray-500 hover:text-gray-700"
// //               >
// //                 &times;
// //               </button>
// //             </div>
            
// //             <p className="mb-4">
// //               <strong>Record ID:</strong> {selectedRecord?.id}
// //             </p>

// //             <div className="max-h-48 overflow-y-auto border rounded-md p-2 mb-4">
// //               {subRecords[selectedRecord?.id]?.map((revision) => (
// //                 <div 
// //                   key={revision.id} 
// //                   className="flex items-center mb-2"
// //                 >
// //                   <input 
// //                     type="radio"
// //                     id={`rev-${revision.id}`}
// //                     name="revision"
// //                     value={revision.id}
// //                     checked={selectedRevision === revision.id}
// //                     onChange={() => setSelectedRevision(revision.id)}
// //                     className="mr-2"
// //                   />
// //                   <label htmlFor={`rev-${revision.id}`}>
// //                     Revision {revision.reviseNumber}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="flex justify-end space-x-2">
// //               <button 
// //                 onClick={handleDuplicateConfirm}
// //                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
// //               >
// //                 Confirm
// //               </button>
// //               <button 
// //                 onClick={() => setShowDuplicateModal(false)}
// //                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default MyWork;




// import React, { useState, useEffect } from 'react';
// import { LucideSearch, LucideChevronDown } from 'lucide-react';

// const DashboardContent = () => {
//   const [dateRange, setDateRange] = useState('1M');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [tableData, setTableData] = useState([]);
//   const [mainRecords, setMainRecords] = useState([]);
//   const [selectedRecord, setSelectedRecord] = useState(null);
//   const [subRecords, setSubRecords] = useState({});
//   const [showDuplicateModal, setShowDuplicateModal] = useState(false);
//   const [selectedRevision, setSelectedRevision] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [progress, setProgress] = useState(0);

//   // Authentication and token management (you'd typically get these from context or login state)
//   const token = localStorage.getItem('authToken');
//   const uid = localStorage.getItem('id');

//   // Fetch main records
//   useEffect(() => {
//     fetchMainRecords();
//   }, []);

//   // Update date range when dateRange changes
//   useEffect(() => {
//     updateDateInputs();
//   }, [dateRange]);

//   const fetchMainRecords = async () => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/workorders/ByUser/${uid}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch records');
//       }
      
//       const data = await response.json();
//       const filteredRecords = data.filter(record => record.deletedFlag === 0);
//       setMainRecords(filteredRecords);
//       updateDateInputs();
//     } catch (error) {
//       console.error('Error fetching main records:', error);
//     }
//   };

//   const updateDateInputs = () => {
//     const today = new Date();
//     const start = new Date();

//     switch(dateRange) {
//       case '1M':
//         start.setMonth(today.getMonth() - 1);
//         break;
//       case '3M':
//         start.setMonth(today.getMonth() - 3);
//         break;
//       case '1Y':
//         start.setFullYear(today.getFullYear() - 1);
//         break;
//       default:
//         return;
//     }

//     setStartDate(start.toISOString().split('T')[0]);
//     setEndDate(today.toISOString().split('T')[0]);
//   };

//   const fetchSubRecords = async (mainId) => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${mainId}`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch sub records');
//       }
      
//       const data = await response.json();
//       const filteredSubRecords = data.filter(sub => sub.deletedFlag === 'no');
      
//       setSubRecords(prev => ({
//         ...prev,
//         [mainId]: filteredSubRecords
//       }));
//     } catch (error) {
//       console.error('Error fetching sub records:', error);
//     }
//   };

//   const downloadPDF = (pdfLocation) => {
//     if (pdfLocation) {
//       window.open(pdfLocation, '_blank');
//     } else {
//       alert("PDF not available!");
//     }
//   };

//   const handleDuplicateSub = async (subRecord, mainRecord) => {
//     setIsLoading(true);
//     setProgress(0);

//     // Start progress
//     const progressInterval = setInterval(() => {
//       setProgress(prevProgress => 
//         prevProgress < 90 ? prevProgress + 2 : prevProgress
//       );
//     }, 300);

//     try {
//       // Prepare new sub record
//       const udate = new Date().toISOString();
//       const lastReviseNumber = subRecords[mainRecord.id]?.length 
//         ? Math.max(...subRecords[mainRecord.id].map(r => parseFloat(r.reviseNumber))) 
//         : 0;
//       const newReviseNumber = (lastReviseNumber + 0.1).toFixed(1);

//       const newSubRecord = {
//         workorderId: mainRecord.id,
//         reviseNumber: newReviseNumber,
//         nameOfWork: `Revision Of ${mainRecord.nameOfWork}`,
//         createdDate: udate,
//         createdBy: uid,
//         updatedBy: uid,
//         currentFlag: 'false',
//         deletedFlag: 'no',
//         revisionStage: subRecord.revisionStage,
//         updatedDate: udate
//       };

//       // First, create the new sub record
//       const subResponse = await fetch("http://24.101.103.87:8082/api/workorder-revisions", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newSubRecord)
//       });

//       const newSubRecordData = await subResponse.json();

//       // Fetch and duplicate subworks
//       const subworksResponse = await fetch(`http://24.101.103.87:8082/api/subwork/${subRecord.id}/${mainRecord.id}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });

//       const subworks = await subworksResponse.json();

//       // Duplicate each subwork
//       for (const subwork of subworks) {
//         const newSubworkResponse = await fetch("http://24.101.103.87:8082/api/subwork", {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify({ 
//             ...subwork, 
//             id: undefined,  
//             workorder_id: mainRecord.id, 
//             reviseId: newSubRecordData.id 
//           })
//         });

//         const newSubwork = await newSubworkResponse.json();

//         // Fetch and duplicate txn_items for this subwork
//         const itemsResponse = await fetch(`http://24.101.103.87:8082/api/txn-items/BySubwork/${subwork.id}`, {
//           method: "GET",
//           headers: { 
//             "Authorization": `Bearer ${token}` 
//           }
//         });

//         const items = await itemsResponse.json();

//         for (const item of items) {
//           await fetch("http://24.101.103.87:8082/api/txn-items", {
//             method: "POST",
//             headers: {
//               "Authorization": `Bearer ${token}`,
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               ...item,
//               id: undefined,
//               subwork_id: newSubwork.id
//             })
//           });
//         }
//       }

//       // Complete progress
//       clearInterval(progressInterval);
//       setProgress(100);

//       // Redirect or refresh as needed
//       window.location.href = "tmeasurement.php";
//     } catch (error) {
//       console.error("Error duplicating record:", error);
//       clearInterval(progressInterval);
//       setIsLoading(false);
//       alert("Failed to duplicate record");
//     }
//   };

//   // Rest of the existing component code remains the same...

//   // Add loading progress modal
//   const LoadingModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
//       <div className="bg-white rounded-lg p-6 w-96">
//         <h2 className="text-xl font-bold mb-4">Duplicating Record</h2>
//         <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
//           <div 
//             className="bg-blue-600 h-2.5 rounded-full" 
//             style={{width: `${progress}%`}}
//           ></div>
//         </div>
//         <p className="text-center">{progress}% Complete</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="p-4 bg-white">
//       {/* Existing component JSX remains the same */}
      
//       {/* Add action buttons for each sub-record */}
//       {selectedRecord && subRecords[selectedRecord.id] && (
//         <div className="bg-gray-50 p-4">
//           <table className="w-full">
//             <thead>
//               <tr>
//                 <th>Revision No</th>
//                 <th>Revision Name</th>
//                 <th>Revision Date</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subRecords[selectedRecord.id].map((sub) => (
//                 <tr key={sub.id} className="border-b">
//                   <td>{sub.reviseNumber}</td>
//                   <td>Revision of {selectedRecord.nameOfWork}</td>
//                   <td>{new Date(sub.createdDate).toLocaleString()}</td>
//                   <td>{sub.revisionStage}</td>
//                   <td>
//                     <div className="flex space-x-2">
//                       {/* Duplicate Button */}
//                       <button 
//                         onClick={() => handleDuplicateSub(sub, selectedRecord)}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         <i className="fas fa-clone"></i>
//                       </button>
                      
//                       {/* PDF View Button */}
//                       <button 
//                         onClick={() => downloadPDF(sub.pdfLocation)}
//                         disabled={!sub.pdfLocation}
//                         className={`${sub.pdfLocation ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}
//                       >
//                         <i className="fas fa-file-pdf"></i>
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Loading Modal */}
//       {isLoading && <LoadingModal />}
//     </div>
//   );
// };

// export default DashboardContent;
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

  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzNTk5NzEwLCJleHAiOjE3NDM2ODYxMTB9.eE7zAbpk536w3O_kdm13YlP6_YRmIzmGtemC2GlWv60";
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
      setRecords(data.filter(item => item.deletedFlag === 0));
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