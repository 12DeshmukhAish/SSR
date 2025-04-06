// import React, { useState, useEffect } from 'react';
// import { FaFlagCheckered, FaCheck, FaTrash, FaPlus, FaWhatsapp } from "react-icons/fa";

// import { GiSandsOfTime } from "react-icons/gi";
// import axios from 'axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { MdDelete, MdAdd } from "react-icons/md";
// import { useNavigate } from 'react-router-dom';


// const EstimateForm = () => {
//   // Step 1 state
//   const [workName, setWorkName] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
//   const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  
//   // Step 2 state
//   const [workOrderId, setWorkOrderId] = useState('');
//   const [selectedSSR, setSelectedSSR] = useState('');
//   const [isSSRDropdownOpen, setIsSSRDropdownOpen] = useState(false);
//   const [selectedChapter, setSelectedChapter] = useState('');
//   const [isChapterDropdownOpen, setIsChapterDropdownOpen] = useState(false);
//   const [selectedArea, setSelectedArea] = useState('');
//   const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
//   const [areaPercentage, setAreaPercentage] = useState('0%');
//   const [preparedBy, setPreparedBy] = useState('');
//   const [checkedBy, setCheckedBy] = useState('');
//   const [revisionNo, setRevisionNo] = useState('1.0');
//   const navigate = useNavigate();


//   // Subwork state
//   const [subworkName, setSubworkName] = useState('');
//   const [workItems, setWorkItems] = useState([]);

//   const [subworks, setSubworks] = useState([]);
//   const [selectedSubwork, setSelectedSubwork] = useState(null);
//   const [subworkItems, setSubworkItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Item state
//   const [newItem, setNewItem] = useState({
//     itemNo: '',
//     description: '',
//     category: '',
//     floorRise: ''
//   });

//   // Current step state
//   const [currentStep, setCurrentStep] = useState('ESTIMATE');
//   const [completedSteps, setCompletedSteps] = useState([]);
//   const [showSubEstimateScreen, setShowSubEstimateScreen] = useState(false);

//   const steps = [
//     { id: 'ESTIMATE', label: 'ESTIMATE', icon: <FaCheck /> },
//     { id: 'SUB-ESTIMATE', label: 'SUB-ESTIMATE', icon: '•••' },
//     { id: 'LEAD', label: 'LEAD', icon: <GiSandsOfTime /> },
//     { id: 'ROYALTY', label: 'ROYALTY', icon: <FaFlagCheckered /> },
//     { id: 'MAT', label: 'MAT', icon: '★' },
//     { id: 'CMT/QTY', label: 'CMT/QTY', icon: '★' },
//     { id: 'REVIEW', label: 'REVIEW', icon: '★' },
//   ];

//   const ssrOptions = [
//     { id: 'select', name: 'Select SSR' },
//     { id: 'demo2', name: 'demo2' },
//     { id: 'ssr2022-23', name: 'SSR 2022-23' }
//   ];
//   const chapterOptions = [
//     "Accoustic",
//     "Road Works",
//     "Building Works",
//     "Geosynthetic",
//     "Bridge Works",
//     "Drone Survey",
//     "Electrical Works",
//     "Drainage Works",
//     "PHE (Public Health Engineering)",
//     "Water Supply",
//     "Sewerage System",
//     "Environmental Works",
//     "Miscellaneous Works"
//   ];
  
//   const areaOptions = [
//     "Yerawada Printing Presses",
//     "Tiger Project Area in Maleghat",
//     "Sugarcane Factory Area (Within 10 KM radius)",
//     "Raj Bhawan",
//     "Notified Tribal Areas",
//     "Naxelite Affected Area",
//     "Municipal Council Area",
//     "Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas",
//     "Mental Hospital",
//     "Inside Premises of Central Jail",
//     "Inaccessible Areas",
//     "Hilly Areas",
//     "General Area",
//     "For Mumbai/Brahan Mumbai",
//     "Corporation Area",
//     "Coal / Lime Mining Area"
//   ];
  

//   // Fetch subworks on component mount
//   useEffect(() => {
//     if (showSubEstimateScreen) {
//       fetchSubworks();
//     }
//   }, [showSubEstimateScreen]);

//   // Fetch subworks
//   const fetchSubworks = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`http://24.101.103.87:8082/api/subwork?workOrderId=${workOrderId}`);
//       setSubworks(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching subworks:', error);
//       toast.error('Failed to load subworks');
//       setLoading(false);
//     }
//   };

//   // Fetch subwork items
//   const fetchSubworkItems = async (subworkId) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`http://24.101.103.87:8082/api/subwork/${subworkId}/items`);
//       setSubworkItems(response.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching subwork items:', error);
//       toast.error('Failed to load subwork items');
//       setLoading(false);
//     }
//   };

//   const handleStateSelect = (state) => {
//     setSelectedState(state);
//     setIsStateDropdownOpen(false);
//   };

//   const handleDepartmentSelect = (dept) => {
//     setSelectedDepartment(dept);
//     setIsDepartmentDropdownOpen(false);
//   };

//   const handleSSRSelect = (ssr) => {
//     setSelectedSSR(ssr);
//     setIsSSRDropdownOpen(false);
//   };

//   const handleNextStep = async () => {
//     // Save the current step data
//     await saveEstimateData();
    
//     if (currentStep === 'ESTIMATE') {
//       setCurrentStep('SUB-ESTIMATE');
//       setCompletedSteps([...completedSteps, 'ESTIMATE']);
//     } else if (currentStep === 'SUB-ESTIMATE') {
//       setShowSubEstimateScreen(true);
//       setCompletedSteps([...completedSteps, 'SUB-ESTIMATE']);
//     }
//   };

//   const handlePreviousStep = () => {
//     if (currentStep === 'SUB-ESTIMATE') {
//       setCurrentStep('ESTIMATE');
//     }
//   };

//   const saveEstimateData = async () => {
//     try {
//       // Create the data object based on current step
//       let requestData = {};
      
//       if (currentStep === 'ESTIMATE') {
//         requestData = {
//           workName,
//           state: selectedState,
//           department: selectedDepartment
//         };
//       } else if (currentStep === 'SUB-ESTIMATE') {
//         requestData = {
//           workOrderId,
//           ssr: selectedSSR,
//           chapter: selectedChapter,
//           area: selectedArea,
//           areaPercentage,
//           preparedBy,
//           checkedBy
//         };
//       }
      
//       // Add step info
//       requestData.currentStep = currentStep;
      
//       // Send data to API
//       const response = await axios.post('http://24.101.103.87:8082/api/workorders', requestData);
//       console.log('Data saved successfully:', response.data);
//       toast.success('Data saved successfully');
      
//       // You can handle the response here if needed
//     } catch (error) {
//       console.error('Error saving data:', error);
//       toast.error('Error saving data');
//       // Handle error appropriately
//     }
//   };

//   const createSubwork = async () => {
//     if (!subworkName.trim()) {
//       toast.warning('Please enter a subwork name');
//       return;
//     }

//     setLoading(true);
//     try {
//       const requestData = {
//         workOrderId,
//         subworkName,
//         ssrId: selectedSSR || 'demo2'
//       };
      
//       const response = await axios.post('http://24.101.103.87:8082/api/subwork', requestData);
//       console.log('Subwork created successfully:', response.data);
      
//       // Clear subwork name and refresh the list
//       setSubworkName('');
//       fetchSubworks();
//       toast.success('Subwork created successfully');
//     } catch (error) {
//       console.error('Error creating subwork:', error);
//       toast.error('Failed to create subwork');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectSubwork = (subwork) => {
//     setSelectedSubwork(subwork);
//     fetchSubworkItems(subwork.id);
//   };

//   const deleteSubwork = async (subworkId, event) => {
//     event.stopPropagation();
    
//     if (window.confirm('Are you sure you want to delete this subwork?')) {
//       setLoading(true);
//       try {
//         await axios.delete(`http://24.101.103.87:8082/api/subwork/${subworkId}`);
//         fetchSubworks();
//         if (selectedSubwork && selectedSubwork.id === subworkId) {
//           setSelectedSubwork(null);
//           setSubworkItems([]);
//         }
//         toast.success('Subwork deleted successfully');
//       } catch (error) {
//         console.error('Error deleting subwork:', error);
//         toast.error('Failed to delete subwork');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const handleAddItem = async () => {
//     if (!selectedSubwork) {
//       toast.warning('Please select a subwork first');
//       return;
//     }

//     if (!newItem.description || !newItem.itemNo) {
//       toast.warning('Please fill in the required fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`http://24.101.103.87:8082/api/subwork/${selectedSubwork.id}/items`, {
//         itemNo: newItem.itemNo,
//         description: newItem.description,
//         category: newItem.category,
//         floorRise: newItem.floorRise
//       });

//       // Reset the form and refresh items
//       setNewItem({
//         itemNo: '',
//         description: '',
//         category: '',
//         floorRise: ''
//       });
      
//       fetchSubworkItems(selectedSubwork.id);
//       toast.success('Item added successfully');
//     } catch (error) {
//       console.error('Error adding item:', error);
//       toast.error('Failed to add item');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Add New button click
//   const handleAddNew = () => {
//     navigate('/estimate');
//   };

//   // Handle WhatsApp button click
//   const handleWhatsApp = () => {
//     const shareText = workItems.map(item => 
//       `Work ID: ${item.id}\nName: ${item.nameOfWork}\nStatus: ${item.status}`
//     ).join('\n\n');
    
//     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   const handleAddCustomItem = () => {
//     // Implementation for custom item if needed
//     toast.info('Custom item functionality to be implemented');
//   };

//   const deleteItem = async (itemId) => {
//     if (window.confirm('Are you sure you want to delete this item?')) {
//       setLoading(true);
//       try {
//         await axios.delete(`http://24.101.103.87:8082/api/subwork/items/${itemId}`);
//         fetchSubworkItems(selectedSubwork.id);
//         toast.success('Item deleted successfully');
//       } catch (error) {
//         console.error('Error deleting item:', error);
//         toast.error('Failed to delete item');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // Step 2 SSR Form
//   const renderStep2Form = () => (
//     <>
//       <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
//         <h2 className="font-medium mb-4">Create New Estimate</h2>
//         <h3 className="text-xl font-medium mb-6">Step 2: Select SSR Area And Signature</h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2">Work order ID:</label>
//             <input 
//               type="text" 
//               className="w-full border border-gray-300 rounded-md p-2"
//               value={workOrderId}
//               readOnly
//             />
//           </div>
          
//           <div>
//             <label className="block mb-2">SSR:</label>
//             <div className="relative">
//               <button 
//                 className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
//                 onClick={() => setIsSSRDropdownOpen(!isSSRDropdownOpen)}
//               >
//                 {selectedSSR || 'Select SSR'}
//                 <span>▼</span>
//               </button>
              
//               {isSSRDropdownOpen && (
//                 <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                   <ul>
//                     {ssrOptions.map((option) => (
//                       <li 
//                         key={option.id}
//                         className={`px-3 py-2 cursor-pointer ${option.id === 'demo2' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
//                         onClick={() => handleSSRSelect(option.name)}
//                       >
//                         {option.name}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        

        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div>
//   <label className="block mb-2">Chapter:</label>
//   <div className="relative">
//     <button 
//       className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
//       onClick={() => setIsChapterDropdownOpen(!isChapterDropdownOpen)}
//     >
//       {selectedChapter || 'Search Chapter'}
//       <span>▼</span>
//     </button>
//     {isChapterDropdownOpen && (
//       <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
//         <ul>
//           {chapterOptions.map((chapter, index) => (
//             <li 
//               key={index}
//               className={`px-3 py-2 cursor-pointer ${selectedChapter === chapter ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
//               onClick={() => {
//                 setSelectedChapter(chapter);
//                 setIsChapterDropdownOpen(false);
//               }}
//             >
//               {chapter}
//             </li>
//           ))}
//         </ul>
//       </div>
//     )}
//   </div>
// </div>

//           <div>
//   <label className="block mb-2">Area:</label>
//   <div className="relative">
//     <button 
//       className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
//       onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
//     >
//       {selectedArea || 'Select Area'}
//       <span>▼</span>
//     </button>
//     {isAreaDropdownOpen && (
//       <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
//         <ul>
//           {areaOptions.map((area, index) => (
//             <li
//               key={index}
//               className={`px-3 py-2 cursor-pointer ${selectedArea === area ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
//               onClick={() => {
//                 setSelectedArea(area);
//                 setIsAreaDropdownOpen(false);
//               }}
//             >
//               {area}
//             </li>
//           ))}
//         </ul>
//       </div>
//     )}
//   </div>

          
//           <div>
//             <p className="block mb-2">Selected Area Percentage: {areaPercentage}</p>
//           </div>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <label className="block mb-2">Prepared By:</label>
//             <textarea 
//               className="w-full border border-gray-300 rounded-md p-2 h-24"
//               value={preparedBy}
//               onChange={(e) => setPreparedBy(e.target.value)}
//             ></textarea>
//           </div>
          
//           <div>
//             <label className="block mb-2">Checked By:</label>
//             <textarea 
//               className="w-full border border-gray-300 rounded-md p-2 h-24"
//               value={checkedBy}
//               onChange={(e) => setCheckedBy(e.target.value)}
//             ></textarea>
//           </div>
//         </div>
        
//         <div className="flex space-x-4">
//           <button 
//             className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
//             onClick={handlePreviousStep}
//           >
//             Previous
//           </button>
//           <button 
//             className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
//             onClick={handleNextStep}
//             disabled={loading}
//           >
//             {loading ? 'Loading...' : 'Continue'}
//           </button>
//         </div>
//       </div>
//     </>
//   );

//   // Subwork Creation Screen
//   const renderSubworkScreen = () => (
//     <>
//       <div className="mt-4">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <p className="font-medium">Work Order Id: {workOrderId}</p>
//             <p className="font-medium mt-4">Name Of Work: {workName || 'fg'}</p>
//           </div>
//           <div>
//             <p className="font-medium">Revison No : {revisionNo}</p>
//             <p className="font-medium mt-4">SSR: {selectedSSR || 'demo2'} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;AREA: {selectedArea || 'Inaccessible Areas'}</p>
//           </div>
//         </div>
        
//         {/* Create Subwork section */}
//         <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
//           <div className="flex items-center">
//             <input 
//               type="text" 
//               placeholder="Enter Subwork Here"
//               className="flex-grow border border-gray-300 rounded-md p-2 mr-4"
//               value={subworkName}
//               onChange={(e) => setSubworkName(e.target.value)}
//             />
//             <button 
//               className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
//               onClick={createSubwork}
//               disabled={loading}
//             >
//               <FaPlus className="mr-2" />
//               {loading ? 'Creating...' : 'Create Subwork'}
//             </button>
//           </div>
//         </div>

//         {/* Display Subworks */}
//         <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
//           <h3 className="text-lg font-medium mb-4">Subworks</h3>
          
//           {loading && !subworks.length ? (
//             <p className="text-gray-500">Loading subworks...</p>
//           ) : subworks.length > 0 ? (
//             <div className="space-y-2 mb-6">
//               {subworks.map((subwork) => (
//                 <div 
//                   key={subwork.id} 
//                   className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
//                     selectedSubwork && selectedSubwork.id === subwork.id 
//                       ? 'bg-blue-50 border-blue-500' 
//                       : 'hover:bg-gray-50'
//                   }`}
//                   onClick={() => selectSubwork(subwork)}
//                 >
//                   <span>{subwork.subworkName}</span>
//                   <button 
//                     className="text-red-500 hover:text-red-700"
//                     onClick={(e) => deleteSubwork(subwork.id, e)}
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500">No subworks available. Create one above.</p>
//           )}
//         </div>

//         {/* Display Subwork Items when a subwork is selected */}
//         {selectedSubwork && (
//           <div className="bg-white border border-gray-200 rounded-md p-6">
//             <h3 className="text-lg font-medium mb-4">
//               Item For sub-estimate: {selectedSubwork.subworkName}
//             </h3>
            
//             <div className="overflow-x-auto mb-6">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item No</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor Rise/Lift</th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {loading ? (
//                     <tr>
//                       <td colSpan="7" className="px-6 py-4 text-center">Loading items...</td>
//                     </tr>
//                   ) : subworkItems.length > 0 ? (
//                     subworkItems.map((item, index) => (
//                       <tr key={item.id}>
//                         <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{item.srNo || '-'}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{item.itemNo}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
//                         <td className="px-6 py-4">{item.description}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">{item.floorRise}</td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <button 
//                             className="text-red-500 hover:text-red-700"
//                             onClick={() => deleteItem(item.id)}
//                           >
//                             <FaTrash />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="px-6 py-4 text-center">No items found. Add new items below.</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Add new item form */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
//               <input 
//                 type="text" 
//                 placeholder="Item No"
//                 className="border border-gray-300 rounded-md p-2"
//                 value={newItem.itemNo}
//                 onChange={(e) => setNewItem({...newItem, itemNo: e.target.value})}
//               />
//               <input 
//                 type="text" 
//                 placeholder="Category"
//                 className="border border-gray-300 rounded-md p-2"
//                 value={newItem.category}
//                 onChange={(e) => setNewItem({...newItem, category: e.target.value})}
//               />
//               <input 
//                 type="text" 
//                 placeholder="Description"
//                 className="border border-gray-300 rounded-md p-2"
//                 value={newItem.description}
//                 onChange={(e) => setNewItem({...newItem, description: e.target.value})}
//               />
//               <input 
//                 type="text" 
//                 placeholder="Floor Rise/Lift"
//                 className="border border-gray-300 rounded-md p-2"
//                 value={newItem.floorRise}
//                 onChange={(e) => setNewItem({...newItem, floorRise: e.target.value})}
//               />
//             </div>

//             <div className="flex space-x-2">
//               <button 
//                 className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
//                 onClick={handleAddItem}
//                 disabled={loading}
//               >
//                 <FaPlus className="mr-2" />
//                 {loading ? 'Adding...' : 'Add Item'}
//               </button>
//               <button 
//                 className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
//                 onClick={handleAddCustomItem}
//                 disabled={loading}
//               >
//                 <FaPlus className="mr-2" />
//                 Add Custom Item
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );

//   return (
//     <div className="bg-white min-h-screen p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Toast Container for notifications */}
//         <ToastContainer position="top-right" autoClose={3000} />
        
      
        
//         {/* Progress Steps */}
//         <div className="flex w-full mb-8 overflow-x-auto">
//           {steps.map((step, index) => (
//             <div key={step.id} className="flex-shrink-0 relative" style={{ zIndex: steps.length - index }}>
//               <div 
//                 className={`py-2 px-6 flex items-center ${
//                   currentStep === step.id 
//                     ? 'bg-orange-500 text-white' 
//                     : completedSteps.includes(step.id) 
//                       ? 'bg-green-500 text-white' 
//                       : 'bg-gray-300 text-gray-700'
//                 }`}
//                 style={{ clipPath: 'polygon(85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%, 0% 0%)' }}
//               >
//                 <span className="mr-2">{step.icon}</span>
//                 {step.label}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Step Indicator */}
//         {!showSubEstimateScreen && currentStep === 'ESTIMATE' && (
//           <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-sm inline-block mb-6">
//             Step 1
//           </div>
//         )}
        
//         {!showSubEstimateScreen && currentStep === 'SUB-ESTIMATE' && (
//           <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-sm inline-block mb-6">
//             Step 2
//           </div>
//         )}

//         {/* Step Content */}
//         {!showSubEstimateScreen && currentStep === 'ESTIMATE' && (
//           <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
//             <h2 className="font-medium mb-4">Create New Estimate</h2>
//             <h3 className="text-xl font-medium mb-6">Step 1: WorkName</h3>
            
//             <div className="mb-6">
//               <label htmlFor="workName" className="block mb-2">Name of Work:</label>
//               <textarea 
//                 id="workName"
//                 className="w-full border border-gray-300 rounded-md p-2 h-24"
//                 value={workName}
//                 onChange={(e) => setWorkName(e.target.value)}
//               ></textarea>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//               <div>
//                 <label className="block mb-2">State:</label>
//                 <div className="relative">
//                   <button 
//                     className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
//                     onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
//                   >
//                     {selectedState || 'Select State'}
//                     <span>▼</span>
//                   </button>
                  
//                   {isStateDropdownOpen && (
//                     <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <ul>
//                         <li 
//                           className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                           onClick={() => handleStateSelect('MH')}
//                         >
//                           MH
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               </div>
              
//               <div>
//                 <label className="block mb-2">Department:</label>
//                 <div className="relative">
//                   <button 
//                     className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white flex justify-between items-center"
//                     onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
//                   >
//                     {selectedDepartment || 'Select Department'}
//                     <span>▼</span>
//                   </button>
                  
//                   {isDepartmentDropdownOpen && (
//                     <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
//                       <ul>
//                         <li 
//                           className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                           onClick={() => handleDepartmentSelect('PWD')}
//                         >
//                           PWD
//                         </li>
//                       </ul>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             <div>
//               <button 
//                 className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
//                 onClick={handleNextStep}
//                 disabled={loading}
//               >
//                 {loading ? 'Processing...' : 'Next'}
//               </button>
//             </div>
//           </div>
//         )}
        
//         {!showSubEstimateScreen && currentStep === 'SUB-ESTIMATE' && renderStep2Form()}
//         {showSubEstimateScreen && renderSubworkScreen()}
//       </div>
//       <div className="fixed right-6 bottom-12 flex flex-col space-y-6 z-10">
//   <div className="relative group">
//     <button 
//       onClick={handleAddNew}
//       className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors focus:outline-none"
//     >
//       <MdAdd className="text-2xl" />
//     </button>
//     <span className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
//       Create Estimate
//     </span>
//   </div>

//   <div className="relative group">
//     <button 
//       onClick={handleWhatsApp}
//       className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors focus:outline-none"
//     >
//       <FaWhatsapp className="text-2xl" />
//     </button>
//     <span className="absolute right-20 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
//       Contact 
//     </span>
//   </div>
// </div>


//     </div>
//   );
// };

// export default EstimateForm;
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
  
  // JWT Token - In production, store this securely and not hard-coded
  const jwtToken =  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzODUzNjgyLCJleHAiOjE3NDM5NDAwODJ9.sqUaOTWlqjybtP5c4VZwRPgQfPapwx88VVRSMFgp9b0";
  
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
                    onChange={(e) => setWorkName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block mb-1 font-medium">State:</label>
                    <select 
                      id="state" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      required
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
                      onChange={(e) => setSelectedDept(e.target.value)}
                      required
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
                    <label htmlFor="WorkOrder" className="block mb-1 font-medium">Work order ID:</label>
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
                      onChange={(e) => setSelectedSSR(e.target.value)}
                      required
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
                        setSelectedChapter(option ? option.value : '');
                        if (option) {
                          toast.success(`Selected chapter: ${option.label}`);
                        }
                      }}
                      placeholder="Search Chapter..."
                      classNamePrefix="select"
                      className="basic-single"
                      isClearable
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="area" className="block mb-1 font-medium">Area:</label>
                    <select 
                      id="area" 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedArea}
                      onChange={handleAreaChange}
                      required
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
                      onChange={(e) => setPreparedBySignature(e.target.value)}
                      required
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
                      onChange={(e) => setCheckedBySignature(e.target.value)}
                      required
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
                toast.success('Creating new estimate form');
                // Reset form logic can be added here if needed
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




// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCheck, faSpinner, faHourglassHalf, faFlagCheckered, faStar, faPlus, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
// import Stepper from './Stepper'; // adjust the path based on your folder structure
// import toast, { Toaster } from 'react-hot-toast';
// import { motion } from 'framer-motion';

// const EstimateForm = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [workName, setWorkName] = useState('');
//   const [selectedState, setSelectedState] = useState('');
//   const [selectedDept, setSelectedDept] = useState('');
//   const [selectedSSR, setSelectedSSR] = useState('');
//   const [selectedChapter, setSelectedChapter] = useState('');
//   const [selectedArea, setSelectedArea] = useState('General Area');
//   const [areaPercentage, setAreaPercentage] = useState('0');
//   const [workOrderId, setWorkOrderId] = useState('');
//   const [preparedBySignature, setPreparedBySignature] = useState('');
//   const [checkedBySignature, setCheckedBySignature] = useState('');
//   const [chapters, setChapters] = useState([]);
  
//   // Form validation states
//   const [touched, setTouched] = useState({
//     workName: false,
//     selectedState: false,
//     selectedDept: false,
//     selectedSSR: false,
//     selectedChapter: false,
//     selectedArea: false,
//     preparedBySignature: false,
//     checkedBySignature: false
//   });
  
//   // JWT Token - In production, store this securely and not hard-coded
//   const jwtToken =  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzNTk5NzEwLCJleHAiOjE3NDM2ODYxMTB9.eE7zAbpk536w3O_kdm13YlP6_YRmIzmGtemC2GlWv60";
  
//   // API base URL - should be in environment variable in production
//   const API_BASE_URL = "http://24.101.103.87:8082/api";
  
//   // States data
//   const states = [
//     { value: "", label: "Select State", tin: "" },
//     { value: "demo1", label: "demo1", tin: "23" },
//     { value: "MH", label: "MH", tin: "27" },
//     { value: "demo2", label: "demo2", tin: "34" }
//   ];
  
//   // Departments data
//   const departments = [
//     { value: "", label: "Select Department" },
//     { value: "PWD", label: "PWD" }
//   ];
  
//   // SSR options
//   const ssrOptions = [
//     { value: "", label: "Select SSR" },
//     { value: "demo2", label: "demo2" },
//     { value: "SSR 2022-23", label: "SSR 2022-23" }
//   ];
  
//   // Areas data with percentage
//   const areas = [
//     { value: "", label: "Select Area", percentage: "0" },
//     { value: "Corporation Area", label: "Corporation Area", percentage: "0" },
//     { value: "Muncipal Council Area", label: "Muncipal Council Area", percentage: "0" },
//     { value: "For Mumbai/Brahan Mumbai", label: "For Mumbai/Brahan Mumbai", percentage: "0" },
//     { value: "Sugarcane Factory Area (Within 10 KM radius)", label: "Sugarcane Factory Area (Within 10 KM radius)", percentage: "5" },
//     { value: "Notified Tribal Areas", label: "Notified Tribal Areas", percentage: "0" },
//     { value: "Hilly Areas", label: "Hilly Areas", percentage: "0" },
//     { value: "Inaccessible Areas", label: "Inaccessible Areas", percentage: "0" },
//     { value: "Inside Premises of Central Jail", label: "Inside Premises of Central Jail", percentage: "0" },
//     { value: "Mental Hospital", label: "Mental Hospital", percentage: "0" },
//     { value: "Raj Bhawan", label: "Raj Bhawan", percentage: "0" },
//     { value: "Yerawada Printing Presses", label: "Yerawada Printing Presses", percentage: "15" },
//     { value: "Tiger Project Area in Maleghat", label: "Tiger Project Area in Maleghat", percentage: "20" },
//     { value: "Coal / Lime Mining Area", label: "Coal / Lime Mining Area", percentage: "0" },
//     { value: "Naxelite Affected Area", label: "Naxelite Affected Area", percentage: "10" },
//     { value: "Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas", label: "Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas", percentage: "0" },
//     { value: "General Area", label: "General Area", percentage: "0" },
//     { value: "abcs", label: "abcs", percentage: "5" }
//   ];
  
//   // Progress bar calculation
//   const calculateProgress = () => {
//     return ((currentStep - 1) / 2) * 100;
//   };
  
//   // Helper function to get validation status for form fields
//   const getValidationStatus = (field, value) => {
//     if (!touched[field]) return '';
    
//     // Different validation rules based on field
//     switch(field) {
//       case 'workName':
//         return value.trim() ? 'valid' : 'invalid';
//       case 'selectedState':
//         return value && value !== '' ? 'valid' : 'invalid';
//       case 'selectedDept':
//         return value && value !== '' ? 'valid' : 'invalid';
//       case 'selectedSSR':
//         return value && value !== '' ? 'valid' : 'invalid';
//       case 'selectedChapter':
//         return value && value !== '' ? 'valid' : 'invalid';
//       case 'selectedArea':
//         return value && value !== '' && value !== 'General Area' ? 'valid' : 'invalid';
//       case 'preparedBySignature':
//         return value.trim() ? 'valid' : 'invalid';
//       case 'checkedBySignature':
//         return value.trim() ? 'valid' : 'invalid';
//       default:
//         return '';
//     }
//   };
  
//   // Function to get border class based on validation status
//   const getBorderClass = (field, value) => {
//     const status = getValidationStatus(field, value);
//     if (status === 'valid') return 'border-green-500 ring-1 ring-green-500';
//     if (status === 'invalid') return 'border-red-500 ring-1 ring-red-500';
//     return 'border-gray-300';
//   };
  
//   // Function to mark a field as touched
//   const markTouched = (field) => {
//     setTouched(prev => ({ ...prev, [field]: true }));
//   };
  
//   // Generate custom ID when state changes
//   useEffect(() => {
//     if (selectedState) {
//       generateCustomID();
//     }
//   }, [selectedState]);
  
//   // Handle area change
//   const handleAreaChange = (e) => {
//     const selectedAreaValue = e.target.value;
//     setSelectedArea(selectedAreaValue);
//     markTouched('selectedArea');
//     const areaObj = areas.find(area => area.value === selectedAreaValue);
//     setAreaPercentage(areaObj ? areaObj.percentage : '0');
//     toast.success(`Area percentage set to ${areaObj ? areaObj.percentage : '0'}%`);
//   };
  
//   // Fetch chapters on component mount
//   useEffect(() => {
//     const fetchChapters = async () => {
//       try {
//         toast.loading('Fetching chapters...', { id: 'chapters' });
//         const response = await fetch(`${API_BASE_URL}/chapters`, {
//           headers: {
//             "Authorization": `Bearer ${jwtToken}`,
//             "Accept": "*/*"
//           }
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         setChapters(data);
//         toast.success('Chapters loaded successfully!', { id: 'chapters' });
//       } catch (error) {
//         console.error("Error fetching chapters:", error);
//         toast.error(`Failed to fetch chapters: ${error.message}`, { id: 'chapters' });
//       }
//     };
    
//     fetchChapters();
//   }, [jwtToken]);
  
//   // Generate custom ID function
//   const generateCustomID = () => {
//     const now = new Date();
    
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const day = String(now.getDate()).padStart(2, '0');
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
    
//     const selectedStateObj = states.find(state => state.value === selectedState);
//     const tin = selectedStateObj ? selectedStateObj.tin : "00";
    
//     const wo = "WO";
    
//     // Get userId from localStorage or use default
//     const userId = localStorage.getItem("Id") || "92";
    
//     const finalID = `${tin}${wo}${year}${month}${day}${hours}${minutes}${seconds}${userId}`;
//     setWorkOrderId(finalID);
//     toast.success('Work Order ID generated');
//   };
  
//   // Validate step 1
//   const validateStep1 = () => {
//     // Mark all fields in step 1 as touched
//     setTouched(prev => ({
//       ...prev,
//       workName: true,
//       selectedState: true,
//       selectedDept: true
//     }));
    
//     return workName.trim() !== '' && 
//            selectedState !== '' && 
//            selectedDept !== '';
//   };
  
//   // Validate step 2
//   const validateStep2 = () => {
//     // Mark all fields in step 2 as touched
//     setTouched(prev => ({
//       ...prev,
//       selectedSSR: true,
//       selectedChapter: true,
//       selectedArea: true,
//       preparedBySignature: true,
//       checkedBySignature: true
//     }));
    
//     return selectedSSR !== '' && 
//            selectedChapter !== '' && 
//            selectedArea !== '' && 
//            preparedBySignature.trim() !== '' && 
//            checkedBySignature.trim() !== '';
//   };
  
//   // Handle next step with validation
//   const handleNextStep = (step) => {
//     if (currentStep === 1) {
//       if (!validateStep1()) {
//         animateInvalidFields();
//         toast.error("Please fill in all required fields before proceeding!");
//         return;
//       }
//       toast.success("Step 1 completed successfully!");
//     }
    
//     setCurrentStep(step);
//   };
  
//   // Handle previous step
//   const handlePrevStep = (step) => {
//     setCurrentStep(step);
//     toast.info("Going back to previous step");
//   };
  
//   // Format date for API calls
//   const getFormattedDate = () => {
//     const now = new Date();
    
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const day = String(now.getDate()).padStart(2, '0');
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
    
//     return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
//   };
  
//   // Animation for invalid fields
//   const animateInvalidFields = () => {
//     // Use document.querySelectorAll to find all elements with invalid class and animate them
//     const invalidFields = document.querySelectorAll('.border-red-500');
//     invalidFields.forEach(field => {
//       field.classList.add('shake-animation');
//       setTimeout(() => {
//         field.classList.remove('shake-animation');
//       }, 500);
//     });
//   };
  
//   // Add work function (API call)
//   const addWork = async () => {
//     // Validation
//     if (!validateStep2()) {
//       animateInvalidFields();
//       toast.error("Please fill in all required fields before proceeding!");
//       return;
//     }
    
//     const loadingToast = toast.loading('Creating work order...');
//     const createdDate = getFormattedDate();
    
//     // Get the user ID from localStorage or use default
//     const userId = localStorage.getItem("Id") || "92";
    
//     try {
//       // First, create work order - ensure proper type conversions
//       const workOrderPayload = {
//         workOrderID: workOrderId,
//         nameOfWork: workName,
//         state: selectedState,
//         ssr: selectedSSR,
//         chapterId: parseInt(selectedChapter, 10), // Ensure it's a number with proper parsing
//         area: selectedArea,
//         createdBy: parseInt(userId, 10), // Ensure it's a number with proper parsing
//         preparedBySignature: preparedBySignature,
//         checkedBySignature: checkedBySignature,
//         createdDate: createdDate,
//         department: selectedDept,
//         deletedFlag: 0,
//         status: "started"
//       };
      
//       console.log("Sending Work Order Payload:", workOrderPayload);
      
//       // Add error handling for network issues
//       const workOrderResponse = await fetch(`${API_BASE_URL}/workorders`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${jwtToken}`
//         },
//         body: JSON.stringify(workOrderPayload)
//       });
      
//       // Detailed error handling to debug server issues
//       if (!workOrderResponse.ok) {
//         const errorText = await workOrderResponse.text();
//         console.error("Work Order API Error Response:", errorText);
        
//         // Try to parse the error response for more details
//         try {
//           const errorJson = JSON.parse(errorText);
//           console.error("Parsed Error:", errorJson);
//           throw new Error(`Server error: ${errorJson.message || errorJson.error || workOrderResponse.statusText}`);
//         } catch (parseError) {
//           throw new Error(`Failed to create work order: ${workOrderResponse.status} ${workOrderResponse.statusText}`);
//         }
//       }
      
//       const workOrderData = await workOrderResponse.json();
//       console.log("Work Order Created Successfully:", workOrderData);
      
//       // Store relevant data in localStorage
//       localStorage.setItem("nameOfWork", workName);
//       localStorage.setItem("workorderId", workOrderData.id);
//       localStorage.setItem("chapter", selectedChapter);
//       localStorage.setItem("autogenerated", workOrderId);
//       localStorage.setItem("status", "started");
//       localStorage.setItem("ssr", selectedSSR);
//       localStorage.setItem("area", selectedArea);
//       localStorage.setItem("revisionStage", "started");
      
//       // Now create work order revision
//       await sendToAnotherAPI(workOrderData.id);
      
//       toast.dismiss(loadingToast);
//       toast.success("Work Order Added Successfully!");
      
//       // Redirect to measurement page
//       setTimeout(() => {
//         window.location.href = "/subestimate";
//       }, 1500);
      
//     } catch (error) {
//       console.error("Error creating work order:", error);
//       toast.dismiss(loadingToast);
//       toast.error(`Failed to add work order: ${error.message}`);
//     }
//   };
  
//   // Function to send data to another API (workorder-revisions)
//   const sendToAnotherAPI = async (workorderId) => {
//     try {
//       const revisionToast = toast.loading('Creating work order revision...');
//       const userId = localStorage.getItem("Id") || "92";
//       const currentDate = getFormattedDate();
      
//       const revisionPayload = {
//         workorderId: Number(workorderId),
//         reviseNumber: "1.0",
//         createdDate: currentDate,
//         createdBy: Number(userId),
//         updatedDate: currentDate,
//         updatedBy: Number(userId),
//         currentFlag: false,
//         pdfLocation: "",
//         revisionStage: "started",
//         revisionStatus: "pending",
//         deletedFlag: "no"
//       };
      
//       console.log("Sending Revision Payload:", revisionPayload);
      
//       const revisionResponse = await fetch(`${API_BASE_URL}/workorder-revisions`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${jwtToken}`
//         },
//         body: JSON.stringify(revisionPayload)
//       });
      
//       if (!revisionResponse.ok) {
//         const errorText = await revisionResponse.text();
//         console.error("Revision API Error Response:", errorText);
//         throw new Error(`Failed to create revision: ${revisionResponse.status} ${revisionResponse.statusText}`);
//       }
      
//       const revisionData = await revisionResponse.json();
//       console.log("Revision Created Successfully:", revisionData);
      
//       // Store revision data in localStorage
//       localStorage.setItem("reviseId", revisionData.id);
//       localStorage.setItem("reviseno", revisionData.reviseNumber);
      
//       toast.dismiss(revisionToast);
//       toast.success("Work order revision created successfully!");
      
//     } catch (error) {
//       console.error("Error creating work order revision:", error);
//       toast.error(`Failed to create revision: ${error.message}`);
//     }
//   };
  
//   // Custom styles for React-Select
//   const customSelectStyles = {
//     control: (provided, state) => ({
//       ...provided,
//       borderColor: touched.selectedChapter 
//         ? selectedChapter 
//           ? '#10B981' 
//           : '#EF4444' 
//         : provided.borderColor,
//       boxShadow: touched.selectedChapter 
//         ? selectedChapter 
//           ? '0 0 0 1px #10B981' 
//           : '0 0 0 1px #EF4444' 
//         : provided.boxShadow,
//       '&:hover': {
//         borderColor: touched.selectedChapter 
//           ? selectedChapter 
//             ? '#10B981' 
//             : '#EF4444' 
//           : provided.borderColor,
//       },
//       transition: 'all 0.3s ease'
//     })
//   };
  
//   return (
//     <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
//       {/* Toast Container */}
//       <Toaster 
//         position="top-right"
//         toastOptions={{
//           duration: 3000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//           },
//           success: {
//             duration: 3000,
//             iconTheme: {
//               primary: '#10B981',
//               secondary: 'white',
//             },
//           },
//           error: {
//             duration: 4000,
//             iconTheme: {
//               primary: '#EF4444',
//               secondary: 'white',
//             },
//           },
//         }}
//       />
      
//       {/* Animation styles */}
//       <style jsx global>{`
//         .shake-animation {
//           animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
//         }
        
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
//           20%, 40%, 60%, 80% { transform: translateX(5px); }
//         }
        
//         .fade-in {
//           animation: fadeIn 0.5s ease-in;
//         }
        
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         .slide-in {
//           animation: slideIn 0.5s ease-out;
//         }
        
//         @keyframes slideIn {
//           from { transform: translateY(20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
        
//         .form-control-transition {
//           transition: all 0.3s ease;
//         }
        
//         .input-icon {
//           position: absolute;
//           right: 10px;
//           top: 50%;
//           transform: translateY(-50%);
//         }
//       `}</style>
      
//       <div className="container mx-auto p-4">
//         <motion.div 
//           className="main-content"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="mb-6">
//             <motion.div 
//               className="mb-6 mt-2 p-4 border border-gray-300 rounded-lg bg-white shadow-lg"
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.5 }}
//             >
//               <Stepper 
//                 currentStep={currentStep} 
//                 onStepClick={(stepId) => {
//                   if (stepId < currentStep) {
//                     setCurrentStep(stepId); // Go back freely
//                   } else {
//                     handleNextStep(stepId); // Apply forward step validation
//                   }
//                 }} 
//               />
//             </motion.div>
//           </div>
          
//           {/* Form Container */}
//           <motion.div 
//             className="border border-gray-300 rounded-lg p-6 mt-4 shadow-lg bg-white"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <h6 className="text-base font-medium mb-4 text-blue-700">Create New Estimate</h6>
            
//             {/* Step 1 */}
//             {currentStep === 1 && (
//               <motion.div 
//                 className="space-y-4"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <h5 className="text-lg font-medium mb-4 text-blue-800">Step 1: Work Details</h5>
                
//                 <div className="mb-4">
//                   <label htmlFor="workname" className="block mb-1 font-medium">Name of Work:</label>
//                   <div className="relative">
//                     <textarea 
//                       id="workname" 
//                       className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('workName', workName)}`}
//                       value={workName}
//                       onChange={(e) => setWorkName(e.target.value)}
//                       onBlur={() => markTouched('workName')}
//                       required
//                     />
//                     {touched.workName && workName.trim() !== '' && (
//                       <FontAwesomeIcon 
//                         icon={faCheck} 
//                         className="text-green-500 absolute right-3 bottom-3" 
//                       />
//                     )}
//                     {touched.workName && workName.trim() === '' && (
//                       <FontAwesomeIcon 
//                         icon={faExclamationCircle} 
//                         className="text-red-500 absolute right-3 bottom-3" 
//                       />
//                     )}
//                   </div>
//                   {touched.workName && workName.trim() === '' && (
//                     <p className="text-red-500 text-sm mt-1">Name of work is required</p>
//                   )}
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="state" className="block mb-1 font-medium">State:</label>
//                     <div className="relative">
//                       <select 
//                         id="state" 
//                         className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('selectedState', selectedState)}`}
//                         value={selectedState}
//                         onChange={(e) => setSelectedState(e.target.value)}
//                         onBlur={() => markTouched('selectedState')}
//                         required
//                       >
//                         {states.map((state) => (
//                           <option key={state.value} value={state.value} data-tin={state.tin}>
//                             {state.label}
//                           </option>
//                         ))}
//                       </select>
//                       {touched.selectedState && selectedState !== '' && (
//                         <FontAwesomeIcon 
//                           icon={faCheck} 
//                           className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                       {touched.selectedState && selectedState === '' && (
//                         <FontAwesomeIcon 
//                           icon={faExclamationCircle} 
//                           className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                     </div>
//                     {touched.selectedState && selectedState === '' && (
//                       <p className="text-red-500 text-sm mt-1">State is required</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label htmlFor="dept" className="block mb-1 font-medium">Department:</label>
//                     <div className="relative">
//                       <select 
//                         id="dept" 
//                         className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('selectedDept', selectedDept)}`}
//                         value={selectedDept}
//                         onChange={(e) => setSelectedDept(e.target.value)}
//                         onBlur={() => markTouched('selectedDept')}
//                         required
//                       >
//                         {departments.map((dept) => (
//                           <option key={dept.value} value={dept.value}>
//                             {dept.label}
//                           </option>
//                         ))}
//                       </select>
//                       {touched.selectedDept && selectedDept !== '' && (
//                         <FontAwesomeIcon 
//                           icon={faCheck} 
//                           className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                       {touched.selectedDept && selectedDept === '' && (
//                         <FontAwesomeIcon 
//                           icon={faExclamationCircle} 
//                           className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                     </div>
//                     {touched.selectedDept && selectedDept === '' && (
//                       <p className="text-red-500 text-sm mt-1">Department is required</p>
//                     )}
//                   </div>
//                 </div>
                
//                 <motion.button 
//                   className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md transform hover:scale-105 hover:shadow-lg"
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => handleNextStep(2)}
//                 >
//                   Next
//                 </motion.button>
//               </motion.div>
//             )}
            
//             {/* Step 2 */}
//             {currentStep === 2 && (
//               <motion.div 
//                 className="space-y-4"
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <h5 className="text-lg font-medium mb-4 text-blue-800">Step 2: Select SSR Area And Signature</h5>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label htmlFor="WorkOrder" className="block mb-1 font-medium">Work order ID:</label>
//                     <div className="relative">
//                       <input 
//                         type="text" 
//                         className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
//                         id="WorkOrder" 
//                         value={workOrderId} 
//                         readOnly 
//                       />
//                     </div>
//                   </div>
                  
                  
//                   <div>
//                     <label htmlFor="ssr" className="block mb-1 font-medium">SSR:</label>
//                     <select 
//                       id="ssr" 
//                       className="w-full p-2 border border-gray-300 rounded-md"
//                       value={selectedSSR}
//                       onChange={(e) => setSelectedSSR(e.target.value)}
//                       required
//                     >
//                       {ssrOptions.map((ssr) => (
//                         <option key={ssr.value} value={ssr.value}>
//                           {ssr.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//   <div>
//     <label htmlFor="chapters" className="block mb-1 font-medium">Chapter:</label>
//     <div className="relative">
//       <Select
//         id="chapters"
//         className={`w-full ${touched.selectedChapter && !selectedChapter ? 'react-select-error' : ''}`}
//         options={chapters.map(ch => ({ value: ch.chapterId.toString(), label: ch.chapterCategory }))}
//         placeholder="Select Chapter"
//         value={selectedChapter ? 
//           chapters.find(ch => ch.chapterId.toString() === selectedChapter) 
//             ? { value: selectedChapter, label: chapters.find(ch => ch.chapterId.toString() === selectedChapter).chapterCategory } 
//             : null 
//           : null}
//         onChange={(selected) => {
//           setSelectedChapter(selected ? selected.value.toString() : '');
//           markTouched('selectedChapter');
//         }}
//         onBlur={() => markTouched('selectedChapter')}
//         styles={customSelectStyles}
//       />
//       {touched.selectedChapter && selectedChapter && (
//         <FontAwesomeIcon 
//           icon={faCheck} 
//           className="text-green-500 absolute right-8 top-1/2 transform -translate-y-1/2" 
//         />
//       )}
//       {touched.selectedChapter && !selectedChapter && (
//         <FontAwesomeIcon 
//           icon={faExclamationCircle} 
//           className="text-red-500 absolute right-8 top-1/2 transform -translate-y-1/2" 
//         />
//       )}
//     </div>
//     {touched.selectedChapter && !selectedChapter && (
//       <p className="text-red-500 text-sm mt-1">Chapter selection is required</p>
//     )}
//   </div>


//                   <div>
//                     <label htmlFor="area" className="block mb-1 font-medium">Area:</label>
//                     <div className="relative">
//                       <select 
//                         id="area" 
//                         className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('selectedArea', selectedArea)}`}
//                         value={selectedArea}
//                         onChange={handleAreaChange}
//                         onBlur={() => markTouched('selectedArea')}
//                         required
//                       >
//                         {areas.map((area) => (
//                           <option key={area.value} value={area.value}>
//                             {area.label}
//                           </option>
//                         ))}
//                       </select>
//                       {touched.selectedArea && selectedArea !== '' && selectedArea !== 'General Area' && (
//                         <FontAwesomeIcon 
//                           icon={faCheck} 
//                           className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                       {touched.selectedArea && (selectedArea === '' || selectedArea === 'General Area') && (
//                         <FontAwesomeIcon 
//                           icon={faExclamationCircle} 
//                           className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                     </div>
//                     {touched.selectedArea && (selectedArea === '' || selectedArea === 'General Area') && (
//                       <p className="text-red-500 text-sm mt-1">Area selection is required</p>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label htmlFor="prepared-by" className="block mb-1 font-medium">Prepared By:</label>
//                     <div className="relative">
//                       <input 
//                         type="text" 
//                         id="prepared-by" 
//                         className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('preparedBySignature', preparedBySignature)}`}
//                         value={preparedBySignature}
//                         onChange={(e) => setPreparedBySignature(e.target.value)}
//                         onBlur={() => markTouched('preparedBySignature')}
//                         placeholder="Enter preparer's name"
//                         required
//                       />
//                       {touched.preparedBySignature && preparedBySignature.trim() !== '' && (
//                         <FontAwesomeIcon 
//                           icon={faCheck} 
//                           className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                       {touched.preparedBySignature && preparedBySignature.trim() === '' && (
//                         <FontAwesomeIcon 
//                           icon={faExclamationCircle} 
//                           className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                     </div>
//                     {touched.preparedBySignature && preparedBySignature.trim() === '' && (
//                       <p className="text-red-500 text-sm mt-1">Preparer's name is required</p>
//                     )}
//                   </div>
                  
//                   <div>
//                     <label htmlFor="checked-by" className="block mb-1 font-medium">Checked By:</label>
//                     <div className="relative">
//                       <input 
//                         type="text" 
//                         id="checked-by" 
//                         className={`w-full p-2 rounded-md form-control-transition ${getBorderClass('checkedBySignature', checkedBySignature)}`}
//                         value={checkedBySignature}
//                         onChange={(e) => setCheckedBySignature(e.target.value)}
//                         onBlur={() => markTouched('checkedBySignature')}
//                         placeholder="Enter checker's name"
//                         required
//                       />
//                       {touched.checkedBySignature && checkedBySignature.trim() !== '' && (
//                         <FontAwesomeIcon 
//                           icon={faCheck} 
//                           className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                       {touched.checkedBySignature && checkedBySignature.trim() === '' && (
//                         <FontAwesomeIcon 
//                           icon={faExclamationCircle} 
//                           className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" 
//                         />
//                       )}
//                     </div>
//                     {touched.checkedBySignature && checkedBySignature.trim() === '' && (
//                       <p className="text-red-500 text-sm mt-1">Checker's name is required</p>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="mt-4">
//                   <label className="block mb-1 font-medium">Area Percentage:</label>
//                   <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
//                     {areaPercentage}%
//                   </div>
//                 </div>
                
//                 <div className="flex space-x-4 mt-6">
//                   <motion.button 
//                     className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition shadow-md transform hover:scale-105 hover:shadow-lg"
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => handlePrevStep(1)}
//                   >
//                     Back
//                   </motion.button>
                  
//                   <motion.button 
//                     className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition shadow-md transform hover:scale-105 hover:shadow-lg flex items-center"
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={addWork}
//                   >
//                     <FontAwesomeIcon icon={faPlus} className="mr-2" />
//                     Create Work Order
//                   </motion.button>
//                 </div>
//               </motion.div>
//             )}
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default EstimateForm;