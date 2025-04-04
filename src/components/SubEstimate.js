// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';

// const SubEstimatePage = () => {
//   const { reviseId, wid } = useParams();
//   const [workOrderData, setWorkOrderData] = useState({});
//   const [subWorks, setSubWorks] = useState([]);
//   const [newSubWorkName, setNewSubWorkName] = useState('');
//   const [expandedSubWorks, setExpandedSubWorks] = useState({});
//   const [itemDetails, setItemDetails] = useState({});
//   const [measurementDetails, setMeasurementDetails] = useState({});
//   const [itemOptions, setItemOptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzMzIxODgzLCJleHAiOjE3NDM0MDgyODN9.ns3EnxpWNjzyMsYKoZIkIi9Vu9KsVsvrtSYsx8-WuRg";

//   const chapter = localStorage.getItem('chapter');

//   useEffect(() => {
//     // Fetch work order data
//     fetchWorkOrderData();
//     // Fetch subworks
//     fetchSubWorks();
//     // Fetch item options based on chapter
//     fetchItemOptions();
//   }, [reviseId, wid]);

//   const fetchWorkOrderData = async () => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/workorders/${wid}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setWorkOrderData(data);
//       } else {
//         console.error("Failed to fetch work order data");
//       }
//     } catch (error) {
//       console.error("Error fetching work order data:", error);
//     }
//   };

//   const fetchSubWorks = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`http://24.101.103.87:8082/api/subwork/${reviseId}/${wid}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setSubWorks(data);
        
//         // Initialize expanded state for each subwork
//         const expandedState = {};
//         data.forEach(subwork => {
//           expandedState[subwork.id] = false;
//           // Fetch items for each subwork
//           fetchItemDetails(subwork.id);
//         });
//         setExpandedSubWorks(expandedState);
//       } else {
//         console.error("Failed to fetch subworks");
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching subworks:", error);
//       setLoading(false);
//     }
//   };

//   const fetchItemDetails = async (subworkId) => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items/BySubwork/${subworkId}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setItemDetails(prevState => ({
//           ...prevState,
//           [subworkId]: data
//         }));
        
//         // Fetch measurements for each item
//         data.forEach(item => {
//           fetchMeasurements(item.id);
//         });
//       } else {
//         console.error(`Failed to fetch items for subwork ${subworkId}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching items for subwork ${subworkId}:`, error);
//     }
//   };

//   const fetchMeasurements = async (itemId) => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItem/${itemId}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setMeasurementDetails(prevState => ({
//           ...prevState,
//           [itemId]: data
//         }));
//       } else {
//         console.error(`Failed to fetch measurements for item ${itemId}`);
//       }
//     } catch (error) {
//       console.error(`Error fetching measurements for item ${itemId}:`, error);
//     }
//   };

//   const fetchItemOptions = async () => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/master/detailedItems/ByChapter/${chapter}`, {
//         method: "GET",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setItemOptions(data);
//       } else {
//         console.error("Failed to fetch item options");
//       }
//     } catch (error) {
//       console.error("Error fetching item options:", error);
//     }
//   };

//   const createSubWork = async () => {
//     if (!newSubWorkName.trim()) {
//       alert("Please enter a subwork name");
//       return;
//     }
    
//     try {
//       const response = await fetch("http://24.101.103.87:8082/api/subwork", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           name: newSubWorkName,
//           workOrderId: wid,
//           revisionId: reviseId
//         })
//       });
      
//       if (response.ok) {
//         const newSubWork = await response.json();
//         setSubWorks([...subWorks, newSubWork]);
//         setNewSubWorkName('');
//         // Initialize expanded state for new subwork
//         setExpandedSubWorks({
//           ...expandedSubWorks,
//           [newSubWork.id]: false
//         });
//       } else {
//         alert("Failed to create subwork");
//       }
//     } catch (error) {
//       console.error("Error creating subwork:", error);
//       alert("An error occurred while creating the subwork");
//     }
//   };

//   const toggleSubWork = (subworkId) => {
//     setExpandedSubWorks({
//       ...expandedSubWorks,
//       [subworkId]: !expandedSubWorks[subworkId]
//     });
//   };

//   const deleteSubWork = async (subworkId) => {
//     if (!window.confirm("Are you sure you want to delete this subwork?")) {
//       return;
//     }
    
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/subwork/${subworkId}`, {
//         method: "DELETE",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         setSubWorks(subWorks.filter(subwork => subwork.id !== subworkId));
//         // Remove from expanded state
//         const newExpandedState = { ...expandedSubWorks };
//         delete newExpandedState[subworkId];
//         setExpandedSubWorks(newExpandedState);
//       } else {
//         alert("Failed to delete subwork");
//       }
//     } catch (error) {
//       console.error("Error deleting subwork:", error);
//       alert("An error occurred while deleting the subwork");
//     }
//   };

//   const addNewItem = async (subworkId) => {
//     try {
//       const newItem = {
//         subworkId: subworkId,
//         itemNo: '',
//         category: '',
//         descriptionOfItem: '',
//         floorLiftRise: '',
//         completedRate: 0,
//         labourRate: 0,
//         scadaFlag: false,
//         smallUnit: '',
//         fullUnit: '',
//         additionalSpecification: '',
//         detailedItemId: 0
//       };
      
//       const response = await fetch("http://24.101.103.87:8082/api/txn-items", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newItem)
//       });
      
//       if (response.ok) {
//         const addedItem = await response.json();
//         setItemDetails(prevState => ({
//           ...prevState,
//           [subworkId]: [...(prevState[subworkId] || []), addedItem]
//         }));
//       } else {
//         alert("Failed to add new item");
//       }
//     } catch (error) {
//       console.error("Error adding new item:", error);
//       alert("An error occurred while adding the new item");
//     }
//   };

//   const updateItem = async (itemId, updatedData) => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items/${itemId}`, {
//         method: "PUT",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedData)
//       });
      
//       if (response.ok) {
//         const updatedItem = await response.json();
//         // Update the item in the state
//         setItemDetails(prevState => {
//           const newState = { ...prevState };
//           Object.keys(newState).forEach(subworkId => {
//             newState[subworkId] = newState[subworkId].map(item => 
//               item.id === itemId ? updatedItem : item
//             );
//           });
//           return newState;
//         });
//       } else {
//         alert("Failed to update item");
//       }
//     } catch (error) {
//       console.error("Error updating item:", error);
//       alert("An error occurred while updating the item");
//     }
//   };

//   const deleteItem = async (itemId, subworkId) => {
//     if (!window.confirm("Are you sure you want to delete this item?")) {
//       return;
//     }
    
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items/${itemId}`, {
//         method: "DELETE",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         // Remove item from state
//         setItemDetails(prevState => ({
//           ...prevState,
//           [subworkId]: prevState[subworkId].filter(item => item.id !== itemId)
//         }));
        
//         // Remove measurements for this item
//         const newMeasurementDetails = { ...measurementDetails };
//         delete newMeasurementDetails[itemId];
//         setMeasurementDetails(newMeasurementDetails);
//       } else {
//         alert("Failed to delete item");
//       }
//     } catch (error) {
//       console.error("Error deleting item:", error);
//       alert("An error occurred while deleting the item");
//     }
//   };

//   const addMeasurement = async (itemId) => {
//     try {
//       const newMeasurement = {
//         itemId: itemId,
//         descOfMeasurement: '',
//         number: 0,
//         length: 0,
//         width: 0,
//         height: 0
//       };
      
//       const response = await fetch("http://24.101.103.87:8082/api/txn-items-mts", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(newMeasurement)
//       });
      
//       if (response.ok) {
//         const addedMeasurement = await response.json();
//         setMeasurementDetails(prevState => ({
//           ...prevState,
//           [itemId]: [...(prevState[itemId] || []), addedMeasurement]
//         }));
//       } else {
//         alert("Failed to add measurement");
//       }
//     } catch (error) {
//       console.error("Error adding measurement:", error);
//       alert("An error occurred while adding the measurement");
//     }
//   };

//   const updateMeasurement = async (measurementId, updatedData) => {
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/${measurementId}`, {
//         method: "PUT",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify(updatedData)
//       });
      
//       if (response.ok) {
//         const updatedMeasurement = await response.json();
//         // Update the measurement in the state
//         setMeasurementDetails(prevState => {
//           const newState = { ...prevState };
//           Object.keys(newState).forEach(itemId => {
//             if (newState[itemId]) {
//               newState[itemId] = newState[itemId].map(measurement => 
//                 measurement.id === measurementId ? updatedMeasurement : measurement
//               );
//             }
//           });
//           return newState;
//         });
//       } else {
//         alert("Failed to update measurement");
//       }
//     } catch (error) {
//       console.error("Error updating measurement:", error);
//       alert("An error occurred while updating the measurement");
//     }
//   };

//   const deleteMeasurement = async (measurementId, itemId) => {
//     if (!window.confirm("Are you sure you want to delete this measurement?")) {
//       return;
//     }
//     try {
//       const response = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/${measurementId}`, {
//         method: "DELETE",
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       });
      
//       if (response.ok) {
//         // Remove measurement from state
//         setMeasurementDetails(prevState => ({
//           ...prevState,
//           [itemId]: prevState[itemId].filter(m => m.id !== measurementId)
//         }));
//       } else {
//         alert("Failed to delete measurement");
//       }
//     } catch (error) {
//       console.error("Error deleting measurement:", error);
//       alert("An error occurred while deleting the measurement");
//     }
//   };

//   const handleItemChange = async (itemId, field, value, subworkId) => {
//     const currentItem = itemDetails[subworkId].find(item => item.id === itemId);
    
//     if (field === 'itemNo') {
//       // Find item details from options
//       const selectedItem = itemOptions.find(item => item.itemNo === value);
//       if (selectedItem) {
//         const updatedItem = {
//           ...currentItem,
//           [field]: value,
//           category: selectedItem.category,
//           descriptionOfItem: selectedItem.description,
//           detailedItemId: selectedItem.id
//         };
//         updateItem(itemId, updatedItem);
//       } else {
//         const updatedItem = {
//           ...currentItem,
//           [field]: value
//         };
//         updateItem(itemId, updatedItem);
//       }
//     } else {
//       const updatedItem = {
//         ...currentItem,
//         [field]: value
//       };
//       updateItem(itemId, updatedItem);
//     }
//   };

//   const handleMeasurementChange = (measurementId, field, value, itemId) => {
//     const currentMeasurement = measurementDetails[itemId].find(m => m.id === measurementId);
    
//     const updatedMeasurement = {
//       ...currentMeasurement,
//       [field]: value
//     };
    
//     updateMeasurement(measurementId, updatedMeasurement);
//   };

//   // Calculate total quantity for an item
//   const calculateTotalQuantity = (itemId) => {
//     if (!measurementDetails[itemId]) return 0;
    
//     return measurementDetails[itemId].reduce((total, measurement) => {
//       const quantity = (measurement.number || 0) * 
//                       (measurement.length || 0) * 
//                       (measurement.width || 0) * 
//                       (measurement.height || 0);
//       return total + quantity;
//     }, 0);
//   };

//   // Helper function to get measurement unit based on the item
//   const getMeasurementUnit = (itemId) => {
//     // Find which subwork contains this item
//     for (const subworkId in itemDetails) {
//       const item = itemDetails[subworkId]?.find(item => item.id === itemId);
//       if (item) {
//         return item.fullUnit || 'Cu.M.';
//       }
//     }
//     return 'Cu.M.';
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       {/* Stepper */}
//       <div className="flex justify-between mb-8">
//         <div className="flex space-x-1">
//           <div className="bg-green-500 text-white px-4 py-2 rounded-l-lg flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//             </svg>
//             ESTIMATE
//           </div>
//           <div className="bg-orange-500 text-white px-4 py-2 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//             </svg>
//             SUB-ESTIMATE
//           </div>
//           <div className="bg-gray-300 text-gray-700 px-4 py-2 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
//             </svg>
//             LEAD
//           </div>
//           <div className="bg-gray-300 text-gray-700 px-4 py-2 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
//             </svg>
//             ROYALTY
//           </div>
//           <div className="bg-gray-300 text-gray-700 px-4 py-2 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
//             </svg>
//             MAT
//           </div>
//           <div className="bg-gray-300 text-gray-700 px-4 py-2 flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
//             </svg>
//             CMT/QTY
//           </div>
//           <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded-r-lg flex items-center">
//             <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
//             </svg>
//             REVIEW
//           </div>
//         </div>
//       </div>

//       {/* Work Order Details */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <div className="grid grid-cols-2 gap-6">
//           <div>
//             <p className="text-gray-600 mb-1">Work Order Id:</p>
//             <p className="font-medium">{workOrderData.workOrderNo || wid}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 mb-1">Revision No:</p>
//             <p className="font-medium">{workOrderData.revisionNo || '1.0'}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 mb-1">Name Of Work:</p>
//             <p className="font-medium">{workOrderData.nameOfWork || '-'}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 mb-1">SSR:</p>
//             <p className="font-medium">{workOrderData.ssr || '-'}</p>
//           </div>
//           <div>
//             <p className="text-gray-600 mb-1">AREA:</p>
//             <p className="font-medium">{workOrderData.area || 'General Area'}</p>
//           </div>
//         </div>
//       </div>

//       {/* Create Subwork */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Create Subwork</h2>
//         <div className="flex">
//           <input
//             type="text"
//             className="border rounded-l px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter subwork name"
//             value={newSubWorkName}
//             onChange={(e) => setNewSubWorkName(e.target.value)}
//           />
//           <button
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
//             onClick={createSubWork}
//           >
//             Add Subwork
//           </button>
//         </div>
//       </div>

//       {/* Subwork List */}
//       {subWorks.length > 0 ? (
//         subWorks.map((subwork) => (
//           <div key={subwork.id} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
//             {/* Subwork Header */}
//             <div 
//               className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer"
//               onClick={() => toggleSubWork(subwork.id)}
//             >
//               <div className="flex items-center">
//                 <span className={`transform transition-transform duration-200 ${expandedSubWorks[subwork.id] ? 'rotate-90' : ''}`}>
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   </svg>
//                 </span>
//                 <h3 className="text-lg font-medium ml-2">{subwork.name}</h3>
//               </div>
//               <button 
//                 className="text-red-500 hover:text-red-700"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   deleteSubWork(subwork.id);
//                 }}
//               >
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
            
//             {/* Subwork Content (Items) */}
//             {expandedSubWorks[subwork.id] && (
//               <div className="p-4">
//                 <h4 className="text-md font-medium mb-2">Item For sub-estimate: {subwork.name}</h4>
                
//                 {/* Item Table */}
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full border">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="p-2 border text-left">#</th>
//                         <th className="p-2 border text-left">Sr. No</th>
//                         <th className="p-2 border text-left">Item No</th>
//                         <th className="p-2 border text-left">Category</th>
//                         <th className="p-2 border text-left">Description</th>
//                         <th className="p-2 border text-left">Floor Rise/Lift</th>
//                         <th className="p-2 border text-left">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {itemDetails[subwork.id]?.map((item, index) => (
//                         <React.Fragment key={item.id}>
//                           <tr className="hover:bg-gray-50">
//                             <td className="p-2 border">
//                               <button
//                                 className="text-blue-500 hover:text-blue-700"
//                                 onClick={() => {
//                                   // Toggle item details/measurements
//                                   const currentItem = document.getElementById(`item-details-${item.id}`);
//                                   if (currentItem) {
//                                     currentItem.classList.toggle('hidden');
//                                   }
//                                 }}
//                               >
//                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                                 </svg>
//                               </button>
//                             </td>
//                             <td className="p-2 border">{index + 1}</td>
//                             <td className="p-2 border">
//                               <input
//                                 type="text"
//                                 className="border rounded px-2 py-1 w-24"
//                                 value={item.itemNo || ''}
//                                 onChange={(e) => handleItemChange(item.id, 'itemNo', e.target.value, subwork.id)}
//                                 list={`items-list-${subwork.id}`}
//                               />
//                               <datalist id={`items-list-${subwork.id}`}>
//                                 {itemOptions.map(option => (
//                                   <option key={option.id} value={option.itemNo} />
//                                 ))}
//                               </datalist>
//                             </td>
//                             <td className="p-2 border">
//                               <input
//                                 type="text"
//                                 className="border rounded px-2 py-1 w-24"
//                                 value={item.category || ''}
//                                 onChange={(e) => handleItemChange(item.id, 'category', e.target.value, subwork.id)}
//                               />
//                             </td>
//                             <td className="p-2 border">
//                               <input
//                                 type="text"
//                                 className="border rounded px-2 py-1 w-64"
//                                 value={item.descriptionOfItem || ''}
//                                 onChange={(e) => handleItemChange(item.id, 'descriptionOfItem', e.target.value, subwork.id)}
//                               />
//                             </td>
//                             <td className="p-2 border">
//                               <input
//                                 type="text"
//                                 className="border rounded px-2 py-1 w-24"
//                                 value={item.floorLiftRise || ''}
//                                 onChange={(e) => handleItemChange(item.id, 'floorLiftRise', e.target.value, subwork.id)}
//                               />
//                             </td>
//                             <td className="p-2 border">
//                               <div className="flex space-x-2">
//                                 <button
//                                   className="text-red-500 hover:text-red-700"
                                
//                                     onClick={() => deleteItem(item.id, subwork.id)}
//                                 >
//                                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                     <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                                   </svg>
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
                          
//                           {/* Item Measurements Section (Hidden by default) */}
//                           <tr id={`item-details-${item.id}`} className="hidden">
//                             <td colSpan="7" className="p-2 border">
//                               <div className="bg-gray-50 p-3 rounded">
//                                 <div className="flex justify-between items-center mb-2">
//                                   <h5 className="font-medium">Measurements</h5>
//                                   <button
//                                     className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
//                                     onClick={() => addMeasurement(item.id)}
//                                   >
//                                     Add Measurement
//                                   </button>
//                                 </div>
                                
//                                 {/* Measurement Table */}
//                                 <table className="min-w-full border">
//                                   <thead>
//                                     <tr className="bg-gray-100">
//                                       <th className="p-2 border text-left">Sr. No</th>
//                                       <th className="p-2 border text-left">Description</th>
//                                       <th className="p-2 border text-left">No.</th>
//                                       <th className="p-2 border text-left">Length</th>
//                                       <th className="p-2 border text-left">Width</th>
//                                       <th className="p-2 border text-left">Height</th>
//                                       <th className="p-2 border text-left">Quantity</th>
//                                       <th className="p-2 border text-left">Actions</th>
//                                     </tr>
//                                   </thead>
//                                   <tbody>
//                                     {measurementDetails[item.id]?.map((measurement, idx) => (
//                                       <tr key={measurement.id} className="hover:bg-gray-50">
//                                         <td className="p-2 border">{idx + 1}</td>
//                                         <td className="p-2 border">
//                                           <input
//                                             type="text"
//                                             className="border rounded px-2 py-1 w-48"
//                                             value={measurement.descOfMeasurement || ''}
//                                             onChange={(e) => handleMeasurementChange(measurement.id, 'descOfMeasurement', e.target.value, item.id)}
//                                           />
//                                         </td>
//                                         <td className="p-2 border">
//                                           <input
//                                             type="number"
//                                             className="border rounded px-2 py-1 w-16"
//                                             value={measurement.number || 0}
//                                             onChange={(e) => handleMeasurementChange(measurement.id, 'number', parseFloat(e.target.value), item.id)}
//                                           />
//                                         </td>
//                                         <td className="p-2 border">
//                                           <input
//                                             type="number"
//                                             className="border rounded px-2 py-1 w-20"
//                                             value={measurement.length || 0}
//                                             onChange={(e) => handleMeasurementChange(measurement.id, 'length', parseFloat(e.target.value), item.id)}
//                                           />
//                                         </td>
//                                         <td className="p-2 border">
//                                           <input
//                                             type="number"
//                                             className="border rounded px-2 py-1 w-20"
//                                             value={measurement.width || 0}
//                                             onChange={(e) => handleMeasurementChange(measurement.id, 'width', parseFloat(e.target.value), item.id)}
//                                           />
//                                         </td>
//                                         <td className="p-2 border">
//                                           <input
//                                             type="number"
//                                             className="border rounded px-2 py-1 w-20"
//                                             value={measurement.height || 0}
//                                             onChange={(e) => handleMeasurementChange(measurement.id, 'height', parseFloat(e.target.value), item.id)}
//                                           />
//                                         </td>
//                                         <td className="p-2 border">
//                                           {(measurement.number || 0) * 
//                                            (measurement.length || 0) * 
//                                            (measurement.width || 0) * 
//                                            (measurement.height || 0)}
//                                         </td>
//                                         <td className="p-2 border">
//                                           <button
//                                             className="text-red-500 hover:text-red-700"
//                                             onClick={() => deleteMeasurement(measurement.id, item.id)}
//                                           >
//                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                                               <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                                             </svg>
//                                           </button>
//                                         </td>
//                                       </tr>
//                                     ))}
//                                   </tbody>
//                                   <tfoot>
//                                     <tr className="bg-gray-100">
//                                       <td colSpan="6" className="p-2 border text-right font-medium">Total Quantity:</td>
//                                       <td className="p-2 border font-medium">{calculateTotalQuantity(item.id)} {getMeasurementUnit(item.id)}</td>
//                                       <td className="p-2 border"></td>
//                                     </tr>
//                                   </tfoot>
//                                 </table>
//                               </div>
//                             </td>
//                           </tr>
//                         </React.Fragment>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
                
//                 {/* Add Item Button */}
//                 <div className="mt-4">
//                   <button
//                     className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//                     onClick={() => addNewItem(subwork.id)}
//                   >
//                     Add New Item
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))
//       ) : (
//         <div className="bg-white rounded-lg shadow-md p-6 text-center">
//           <p className="text-gray-500">No subworks found. Create a new subwork to get started.</p>
//         </div>
//       )}
      
//       {/* Navigation Buttons */}
//       <div className="flex justify-between mt-6">
//         <button
//           className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
//           onClick={() => window.history.back()}
//         >
//           Back
//         </button>
//         <button
//           className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
//           onClick={() => {
//             // Navigate to next step
//             // This could be implemented based on your routing setup
//             alert("Navigating to next step");
//           }}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SubEstimatePage;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronRight, 
  faChevronDown, 
  faTrash, 
  faSpinner, 
  faPlus, 
  faSave, 
  faPencilAlt,
  faFileAlt,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import MeasurementTable from './MeasurementTable';
import Stepper from '../components/Stepper';

const SubEstimateForm = () => {
  // State for work order information
  const [workOrderInfo, setWorkOrderInfo] = useState({
    workOrderId: '',
    nameOfWork: '',
    ssr: '',
    area: '',
    status: '',
    revisionStage: '',
    reviseId: '',
    reviseno: '',
    autogenerated: ''
  });

  // State for subwork management
  const [subworkName, setSubworkName] = useState('');
  const [subworkNameError, setSubworkNameError] = useState(false);
  const [subworks, setSubworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSubwork, setExpandedSubwork] = useState(null);
  
  // State for item management
  const [items, setItems] = useState({});
  const [itemOptions, setItemOptions] = useState([]);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [currentSubworkId, setCurrentSubworkId] = useState(null);
  const [isItemLoading, setIsItemLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemFormErrors, setItemFormErrors] = useState({});
  const [itemForm, setItemForm] = useState({
    id: 0,
    srNo: 0,
    itemNo: "",
    category: "",
    descriptionOfItem: "",
    floorLiftRise: "Ground floor",
    fkSubworkId: 0,
    fkWorkorderId: 0,
    completedRate: 0,
    labourRate: 0,
    scadaFlag: false,
    smallUnit: "",
    fullUnit: "",
    additionalSpecification: ""
  });
  const [editingItemId, setEditingItemId] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // API base URL
  const API_BASE_URL = "http://24.101.103.87:8082/api";
  
  // JWT Token from localStorage
  const jwtToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzNTk5NzEwLCJleHAiOjE3NDM2ODYxMTB9.eE7zAbpk536w3O_kdm13YlP6_YRmIzmGtemC2GlWv60";

  const navigate = useNavigate();
  const subworkInputRef = useRef(null);

  // Load work order information from localStorage on component mount
  useEffect(() => {
    const workOrderId = localStorage.getItem('workorderId') || '';
    const nameOfWork = localStorage.getItem('nameOfWork') || '';
    const ssr = localStorage.getItem('ssr') || '';
    const area = localStorage.getItem('area') || '';
    const status = localStorage.getItem('status') || '';
    const revisionStage = localStorage.getItem('revisionStage') || '';
    const reviseId = localStorage.getItem('reviseId') || '';
    const reviseno = localStorage.getItem('reviseno') || '';
    const autogenerated = localStorage.getItem('autogenerated') || '';

    setWorkOrderInfo({
      workOrderId,
      nameOfWork,
      ssr,
      area,
      status,
      revisionStage,
      reviseId,
      reviseno,
      autogenerated
    });

    // Fetch existing subworks for this work order
    if (workOrderId && reviseId) {
      fetchSubworks(reviseId, workOrderId);
    }
    
    // Fetch item options for dropdown
    fetchItemOptions();
  }, []);

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

  // Fetch existing subworks
  const fetchSubworks = async (reviseId, workOrderId) => {
    if (!reviseId || !workOrderId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subwork/${reviseId}/${workOrderId}`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "*/*"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubworks(data);
        toast.success('Subworks loaded successfully', { 
          icon: '📋', 
          duration: 3000 
        });
      } else {
        console.error("Unexpected response format. Expected an array but got:", data);
        toast.error('Failed to load subworks data');
      }
    } catch (error) {
      console.error("Error fetching subworks:", error);
      toast.error(`Error loading subworks: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch item options for dropdown
  const fetchItemOptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/txn-items`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "*/*"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      if (Array.isArray(data)) {
        // Extract unique item numbers for dropdown
        const uniqueItems = [...new Map(data.map(item => [item.itemNo, item])).values()];
        setItemOptions(uniqueItems);
      } else {
        console.error("Unexpected response format for item options. Expected an array but got:", data);
        toast.error('Failed to load item options');
      }
    } catch (error) {
      console.error("Error fetching item options:", error);
      toast.error(`Error loading item options: ${error.message}`);
    }
  };

  // Handle subwork name change
  const handleSubworkNameChange = (e) => {
    const value = e.target.value;
    setSubworkName(value);
    if (value.trim()) {
      setSubworkNameError(false);
    }
  };

  // Add new subwork
  const addSubwork = async () => {
    // Validation
    if (!subworkName.trim()) {
      setSubworkNameError(true);
      toast.error('Please enter a subwork name', {
        icon: '⚠️',
      });
      subworkInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating subwork...');
    
    try {
      const userId = localStorage.getItem("id") || "92"; // Default ID if not found
      const currentDate = getFormattedDate();
      
      const subworkPayload = {
        reviseId: parseInt(workOrderInfo.reviseId, 10),
        workorderId: parseInt(workOrderInfo.workOrderId, 10),
        subworkName: subworkName,
        createdDate: currentDate,
        createdBy: userId,
        updatedDate: currentDate,
        updatedBy: userId
      };
      
      const response = await fetch(`${API_BASE_URL}/subwork`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(subworkPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Subwork API Error Response:", errorText);
        throw new Error(`Failed to create subwork: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log("Subwork Created Successfully:", responseData);
      
      // Update work order status if needed
      if (workOrderInfo.status === "started") {
        updateWorkOrderStatus();
      }
      
      // Update revision status if needed
      if (workOrderInfo.revisionStage === "started") {
        updateRevisionStatus();
      }
      
      // Reset form field
      setSubworkName('');
      
      // Refresh the subworks list
      fetchSubworks(workOrderInfo.reviseId, workOrderInfo.workOrderId);
      
      // Expand the newly added subwork after a short delay
      if (responseData.id) {
        setTimeout(() => {
          setExpandedSubwork(responseData.id);
        }, 500);
      }
      
      toast.dismiss(loadingToast);
      toast.success('Subwork created successfully!', {
        icon: '✅',
        duration: 3000,
      });
      
    } catch (error) {
      console.error("Error creating subwork:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to add subwork: ${error.message}`, {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete subwork
  const deleteSubwork = async (subworkId) => {
    // Show confirmation toast
    toast((t) => (
      <div className="flex flex-col p-2">
        <p className="mb-2 font-medium">Are you sure you want to delete this subwork?</p>
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
              confirmDeleteSubwork(subworkId);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };
  
  const confirmDeleteSubwork = async (subworkId) => {
    const loadingToast = toast.loading('Deleting subwork...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/subwork/${subworkId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${jwtToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh the subworks list
      fetchSubworks(workOrderInfo.reviseId, workOrderInfo.workOrderId);
      
      toast.dismiss(loadingToast);
      toast.success('Subwork deleted successfully!');
    } catch (error) {
      console.error("Error deleting subwork:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to delete subwork: ${error.message}`);
    }
  };

  // Toggle subwork expansion
  const toggleSubwork = (subworkId) => {
    setExpandedSubwork(expandedSubwork === subworkId ? null : subworkId);
    
    // Load items for this subwork when expanded
    if (expandedSubwork !== subworkId) {
      loadSubworkItems(subworkId);
    }
  };

  // Load items for a subwork
  const loadSubworkItems = async (subworkId) => {
    setIsItemLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/txn-items`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "*/*"
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const allItems = await response.json();
      
      // Filter items that belong to this subwork
      const subworkItems = allItems.filter(item => item.fkSubworkId === subworkId);
      
      // Update items state
      setItems(prevItems => ({
        ...prevItems,
        [subworkId]: subworkItems
      }));
      
    } catch (error) {
      console.error(`Error loading items for subwork ${subworkId}:`, error);
      toast.error(`Failed to load items for this subwork`);
    } finally {
      setIsItemLoading(false);
    }
  };

  // Add item to a subwork
  const addItemToSubwork = (subworkId) => {
    setCurrentSubworkId(subworkId);
    setItemForm({
      ...itemForm,
      fkSubworkId: subworkId,
      fkWorkorderId: parseInt(workOrderInfo.workOrderId, 10)
    });
    setEditingItemId(null);
    setItemFormErrors({});
    setShowAddItemModal(true);
  };

  // Handle item selection change
  const handleItemChange = (e) => {
    const selectedItemNo = e.target.value;
    const selectedItemObj = itemOptions.find(item => item.itemNo === selectedItemNo);
    
    setItemFormErrors({
      ...itemFormErrors,
      itemNo: false
    });
    
    if (selectedItemObj) {
      setSelectedItem(selectedItemObj);
      setItemForm({
        ...itemForm,
        itemNo: selectedItemObj.itemNo,
        category: selectedItemObj.category,
        descriptionOfItem: selectedItemObj.descriptionOfItem,
        floorLiftRise: selectedItemObj.floorLiftRise || "Ground floor",
        smallUnit: selectedItemObj.smallUnit,
        fullUnit: selectedItemObj.fullUnit,
        additionalSpecification: selectedItemObj.additionalSpecification
      });
    } else {
      setSelectedItem(null);
    }
  };

  // Handle form input changes
  const handleItemFormChange = (e) => {
    const { name, value } = e.target;
    setItemForm({
      ...itemForm,
      [name]: value
    });
    
    if (itemFormErrors[name]) {
      setItemFormErrors({
        ...itemFormErrors,
        [name]: false
      });
    }
  };

  // Validate item form
  const validateItemForm = () => {
    const errors = {};
    
    if (!itemForm.itemNo) {
      errors.itemNo = true;
    }
    
    setItemFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save item
  const saveItem = async () => {
    if (!validateItemForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsItemLoading(true);
    const loadingToast = toast.loading(editingItemId ? 'Updating item...' : 'Adding item...');
    
    try {
      const method = editingItemId ? "PUT" : "POST";
      const url = editingItemId 
        ? `${API_BASE_URL}/txn-items/${editingItemId}` 
        : `${API_BASE_URL}/txn-items`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        body: JSON.stringify(itemForm)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Reload items for the current subwork
      loadSubworkItems(currentSubworkId);
      
      // Close modal and reset form
      setShowAddItemModal(false);
      setItemForm({
        id: 0,
        srNo: 0,
        itemNo: "",
        category: "",
        descriptionOfItem: "",
        floorLiftRise: "Ground floor",
        fkSubworkId: 0,
        fkWorkorderId: 0,
        completedRate: 0,
        labourRate: 0,
        scadaFlag: false,
        smallUnit: "",
        fullUnit: "",
        additionalSpecification: ""
      });
      setSelectedItem(null);
      
      toast.dismiss(loadingToast);
      toast.success(`Item ${editingItemId ? "updated" : "added"} successfully!`, {
        icon: '✅'
      });
      
    } catch (error) {
      console.error("Error saving item:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to ${editingItemId ? "update" : "add"} item: ${error.message}`);
    } finally {
      setIsItemLoading(false);
    }
  };

  // Edit item
  const editItem = (item) => {
    setCurrentSubworkId(item.fkSubworkId);
    setItemForm({
      ...item
    });
    setEditingItemId(item.id);
    setItemFormErrors({});
    setShowAddItemModal(true);
  };

  // Delete item
  const deleteItem = async (itemId) => {
    // Show confirmation toast
    toast((t) => (
      <div className="flex flex-col p-2">
        <p className="mb-2 font-medium">Are you sure you want to delete this item?</p>
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
              confirmDeleteItem(itemId);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };
  
  const confirmDeleteItem = async (itemId) => {
    const loadingToast = toast.loading('Deleting item...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/txn-items/${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${jwtToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Reload items for the current subwork
      const subworkId = Object.keys(items).find(key => 
        items[key].some(item => item.id === itemId)
      );
      
      if (subworkId) {
        loadSubworkItems(parseInt(subworkId, 10));
      }
      
      toast.dismiss(loadingToast);
      toast.success('Item deleted successfully!');
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to delete item: ${error.message}`);
    }
  };

  // Update work order status
  const updateWorkOrderStatus = () => {
    console.log("Updating work order status...");
    // This would be an API call to update the work order status
  };

  // Update revision status
  const updateRevisionStatus = () => {
    console.log("Updating revision status...");
    // This would be an API call to update the revision status
  };

  // Navigate to PDF preview
  const navigateToPdfPreview = () => {
    // Optional: store current item data before redirecting
    localStorage.setItem("subRecordCache", JSON.stringify(items));
    
    toast.success('Redirecting to PDF Preview...', {
      icon: '📄',
      duration: 2000,
    });
    
    setTimeout(() => {
      navigate('/pdf-preview');
    }, 1000);
  };

  return (
    <motion.div 
      className="container mx-auto p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            style: {
              border: '1px solid #10B981',
            },
          },
          error: {
            style: {
              border: '1px solid #EF4444',
            },
          },
        }}
      />
      
      {/* Stepper Component */}
      <motion.div 
        className="mb-6 mt-2 p-4 border border-gray-300 rounded bg-white shadow-md"
        variants={itemVariants}
      >
        <Stepper currentStep={2} />
      </motion.div>
      
      {/* Work Order Information Card */}
      <motion.div 
        className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-md"
        variants={itemVariants}
      >
        <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">Work Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Work Order ID</span>
            <span className="font-semibold text-lg">{workOrderInfo.autogenerated || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Revision No</span>
            <span className="font-semibold text-lg">{workOrderInfo.reviseno || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Area</span>
            <span className="font-semibold text-lg">{workOrderInfo.area || 'N/A'}</span>
          </div>
          <div className="col-span-2 flex flex-col">
            <span className="text-gray-600 text-sm">Name Of Work</span>
            <span className="font-semibold text-lg">{workOrderInfo.nameOfWork || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">SSR</span>
            <span className="font-semibold text-lg">{workOrderInfo.ssr || 'N/A'}</span>
          </div>
        </div>
      </motion.div>

      {/* Add Subwork Form */}
      <motion.div 
        className="mb-6 p-6 border border-gray-300 rounded-lg bg-white shadow-md"
        variants={itemVariants}
      >
        <h2 className="text-lg font-bold mb-4 text-blue-700">Add New Subwork</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full md:w-1/2 lg:w-2/3">
            <div className="relative">
              <input
                type="text"
                value={subworkName}
                onChange={handleSubworkNameChange}
                className={`w-full p-3 border ${subworkNameError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder="Enter Subwork Name"
                ref={subworkInputRef}
              />
              {subworkNameError && (
                <p className="text-red-500 text-sm mt-1 absolute">Subwork name is required</p>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/3 lg:w-1/4">
            <button
              className={`w-full ${subworkName.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'} text-white py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center font-medium shadow-md`}
              onClick={addSubwork}
              disabled={isLoading || !subworkName.trim()}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              ) : (
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
              )}
              Create Subwork
            </button>
          </div>
        </div>
      </motion.div>

      {/* Subworks Section */}
      <motion.div 
        className="mb-6 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
        variants={itemVariants}
      >
        <div className="bg-blue-700 text-white py-3 px-6 flex justify-between items-center">
          <h2 className="text-lg font-bold">Subworks</h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {subworks.length} {subworks.length === 1 ? 'Subwork' : 'Subworks'}
          </span>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-3xl mb-2" />
            <p className="text-gray-600">Loading subworks...</p>
          </div>
        ) : subworks.length === 0 ? (
          <div className="p-8 text-center">
            <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500">No subworks added yet. Create one using the form above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {subworks.map(subwork => (
              <div key={subwork.id} className="border-b border-gray-200 last:border-b-0">
                <div 
                  className={`py-4 px-6 cursor-pointer transition-colors duration-200 ${expandedSubwork === subwork.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleSubwork(subwork.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${expandedSubwork === subwork.id ? 'bg-blue-600 text-white' : 'bg-gray-200'} mr-3 transition-colors duration-200`}>
                        <FontAwesomeIcon 
                          icon={expandedSubwork === subwork.id ? faChevronDown : faChevronRight} 
                          className="text-xs"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800">{subwork.subworkName}</h3>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSubwork(subwork.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSubwork === subwork.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-gray-50"
                    >
                      <div className="p-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-700">
                            Items for: {subwork.subworkName}
                          </h4>
                          <div className="flex gap-2">
                            <button 
                              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addItemToSubwork(subwork.id);
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} className="mr-2" />
                              Add Item
                            </button>
                            <button
                              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToPdfPreview();
                              }}
                            >
                              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                              View PDF
                            </button>
                          </div>
                        </div>

                        <MeasurementTable
                          items={items[subwork.id] || []}
                          onEditItem={editItem}
                          onDeleteItem={deleteItem}
                          isLoading={isItemLoading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingItemId ? 'Edit Item' : 'Add Item'}
            </h3>

            {/* Item Selection Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item No
              </label>
              <select
                name="itemNo"
                value={itemForm.itemNo}
                onChange={handleItemChange}
                className={`w-full p-2 border ${itemFormErrors.itemNo ? 'border-red-500' : 'border-gray-300'} rounded`}
              >
                <option value="">Select Item</option>
                {itemOptions.map((item, index) => (
                  <option key={index} value={item.itemNo}>
                    {item.itemNo} - {item.descriptionOfItem}
                  </option>
                ))}
              </select>
              {itemFormErrors.itemNo && (
                <p className="text-red-500 text-sm mt-1">Item No is required</p>
              )}
            </div>

            {/* Additional Item Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <input
                  name="category"
                  value={itemForm.category}
                  onChange={handleItemFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Floor Lift Rise</label>
                <input
                  name="floorLiftRise"
                  value={itemForm.floorLiftRise}
                  onChange={handleItemFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea
                  name="descriptionOfItem"
                  value={itemForm.descriptionOfItem}
                  onChange={handleItemFormChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setSelectedItem(null);
                  setItemFormErrors({});
                  setItemForm({
                    id: 0,
                    srNo: 0,
                    itemNo: "",
                    category: "",
                    descriptionOfItem: "",
                    floorLiftRise: "Ground floor",
                    fkSubworkId: 0,
                    fkWorkorderId: 0,
                    completedRate: 0,
                    labourRate: 0,
                    scadaFlag: false,
                    smallUnit: "",
                    fullUnit: "",
                    additionalSpecification: ""
                  });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {editingItemId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SubEstimateForm;
