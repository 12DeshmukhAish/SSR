// import React, { useState, useRef, useEffect } from 'react';
// import { X, Download, ArrowLeft, Edit2, Save, Plus, Check, Camera } from 'lucide-react';
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { LuLoaderCircle } from "react-icons/lu";
// import { API_BASE_URL } from '../config';

// const CoverPageGenerator = () => {
//   const [userEditableData, setUserEditableData] = useState({
//     companyLogo: null,
//     companyName: '',
//     address: '',
//     contactNo: ''
//   });
  
//   const [autoPopulatedData, setAutoPopulatedData] = useState({
//     workName: '',
//     clientName: '',
//     propertyNo: '',
//     propertyAddress: '',
//     estimateCost: '',
//     year: '',
//     preparedBy: ''
//   });

//   const [previewLogo, setPreviewLogo] = useState(null);
//   const coverPageRef = useRef(null);
//   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
//   const [isLoadingWorkOrder, setIsLoadingWorkOrder] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [ssrOptions, setSSROptions] = useState([]);
//   const [grandTotal, setGrandTotal] = useState(0);
//   const [validationErrors, setValidationErrors] = useState({});
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [isGrandTotalLoading, setIsGrandTotalLoading] = useState(false);

//   // Load data on component mount
//   useEffect(() => {
//     loadAllData();
//   }, []);

//   const loadAllData = async () => {
//     try {
//       // Load saved user data
//       const savedUserData = localStorage.getItem('coverPageUserData');
//       if (savedUserData) {
//         const parsedUserData = JSON.parse(savedUserData);
//         setUserEditableData(parsedUserData);
//         if (parsedUserData.companyLogo) {
//           setPreviewLogo(parsedUserData.companyLogo);
//         }
//       }

//       // Load auto-populated data
//       await loadAutoPopulatedData();

//     } catch (error) {
//       console.error("Error loading data:", error);
//     }
//   };

//   const getSSRNameById = (ssrId) => {
//     if (!ssrId || !ssrOptions.length) return '';
//     const ssrOption = ssrOptions.find(option => option.id === parseInt(ssrId));
//     return ssrOption ? ssrOption.name : '';
//   };

//   // Fetch SSR options
//   useEffect(() => {
//     const fetchSSROptions = async () => {
//       try {
//         const jwtToken = localStorage.getItem('jwtToken');
        
//         const response = await fetch(`${API_BASE_URL}/api/ssr`, {
//           method: 'GET',
//           headers: {
//             'Accept': '*/*',
//             'Authorization': `Bearer ${jwtToken}`
//           }
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         setSSROptions(data);
//       } catch (err) {
//         console.error('Error fetching SSR options:', err);
//       }
//     };

//     const jwtToken = localStorage.getItem('jwtToken');
//     if (jwtToken) {
//       fetchSSROptions();
//     }
//   }, []);

//   const fetchWorkOrderDetails = async () => {
//     const workOrderId = localStorage.getItem('workorderId') || localStorage.getItem('workOrderId');
//     const jwtToken = localStorage.getItem('jwtToken');

//     if (!workOrderId || !jwtToken) {
//       console.log('Missing workOrderId or jwtToken');
//       return null;
//     }

//     setIsLoadingWorkOrder(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/workorders/${workOrderId}`, {
//         headers: {
//           "Authorization": `Bearer ${jwtToken}`,
//           "Accept": "*/*"
//         }
//       });
           
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
           
//       const data = await response.json();
//       const ssrName = getSSRNameById(data.ssr);
      
//       // Update localStorage with fresh data
//       localStorage.setItem('nameOfWork', data.nameOfWork || '');
//       localStorage.setItem('ssr', data.ssr || '');
//       localStorage.setItem('ssrName', ssrName);
//       localStorage.setItem('preparedBySignature', data.preparedBySignature || '');
      
//       return {
//         nameOfWork: data.nameOfWork || '',
//         ssr: data.ssr || '',
//         ssrName: ssrName,
//         preparedBySignature: data.preparedBySignature || ''
//       };
//     } catch (error) {
//       console.error("Error fetching work order details:", error);
//       return null;
//     } finally {
//       setIsLoadingWorkOrder(false);
//     }
//   };

//   const loadAutoPopulatedData = async () => {
//     try {
//       setIsLoadingWorkOrder(true);
      
//       // First try to get work order data from localStorage
//       let workName = localStorage.getItem('abstractWorkName') || localStorage.getItem('nameOfWork') || '';
//       let ssrYear = localStorage.getItem('ssr') || '';
//       let ssrName = localStorage.getItem('ssrName') || '';
//       let preparedBy = localStorage.getItem('preparedBySignature') || localStorage.getItem('preparedBy') || '';
      
//       // If essential data is missing, fetch from API
//       if (!workName || !ssrYear || !ssrName) {
//         console.log('Missing essential work order data, fetching from API...');
//         const apiData = await fetchWorkOrderDetails();
        
//         if (apiData) {
//           workName = apiData.nameOfWork || workName;
//           ssrYear = apiData.ssr || ssrYear;
//           ssrName = apiData.ssrName || ssrName;
//           preparedBy = apiData.preparedBySignature || preparedBy;
//         }
//       }

//       // Load construction estimate and calculate grand total
//       const grandTotalAmount = await fetchGrandTotalFromStorage();
      
//       // Format SSR year if needed
//       if (ssrYear && !ssrYear.includes('-')) {
//         const currentYear = new Date().getFullYear();
//         ssrYear = `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}`;
//       }
      
//       // Update auto-populated data
//       setAutoPopulatedData({
//         workName: workName,
//         clientName: '', // This will be filled by user
//         propertyNo: '', // This will be filled by user
//         propertyAddress: '', // This will be filled by user
//         estimateCost: grandTotalAmount.toString(),
//         year: ssrName || ssrYear,
//         preparedBy: preparedBy
//       });

//     } catch (error) {
//       console.error("Error loading auto-populated data:", error);
//     } finally {
//       setIsLoadingWorkOrder(false);
//     }
//   };

//   const fetchGrandTotalFromStorage = () => {
//     try {
//       const storedGrandTotal = localStorage.getItem('grandTotal');
//       if (storedGrandTotal) {
//         const grandTotalData = JSON.parse(storedGrandTotal);
//         const amount = grandTotalData.amount || 0;
//         setGrandTotal(amount);
//         setLastUpdated(grandTotalData.timestamp || null);
//         console.log('Grand total fetched from localStorage:', amount);
//         return amount;
//       } else {
//         setGrandTotal(0);
//         setLastUpdated(null);
//         console.log('No grand total found in localStorage');
//         return 0;
//       }
//     } catch (error) {
//       console.error('Error fetching grand total from localStorage:', error);
//       setGrandTotal(0);
//       setLastUpdated(null);
//       return 0;
//     }
//   };

//   // Auto-refresh grand total
//   useEffect(() => {
//     fetchGrandTotalFromStorage();
    
//     const interval = setInterval(() => {
//       const storedGrandTotal = localStorage.getItem('grandTotal');
//       if (storedGrandTotal) {
//         try {
//           const grandTotalData = JSON.parse(storedGrandTotal);
//           const currentTimestamp = grandTotalData.timestamp;
          
//           if (currentTimestamp !== lastUpdated) {
//             setGrandTotal(grandTotalData.amount || 0);
//             setLastUpdated(currentTimestamp);
//             setAutoPopulatedData(prev => ({
//               ...prev,
//               estimateCost: (grandTotalData.amount || 0).toString()
//             }));
//           }
//         } catch (error) {
//           console.error('Error checking grand total update:', error);
//         }
//       }
//     }, 2000);
    
//     return () => clearInterval(interval);
//   }, [lastUpdated]);

//   // Handle user editable field changes
//   const handleUserFieldChange = (field, value) => {
//     setUserEditableData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     setHasUnsavedChanges(true);
//   };

//   const handleAutoFieldChange = (field, value) => {
//     setAutoPopulatedData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//     setHasUnsavedChanges(true);
//   };

//   const handleLogoChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setPreviewLogo(e.target.result);
//         handleUserFieldChange('companyLogo', e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const validateContactNumber = (contactNo) => {
//     const digitsOnly = contactNo.replace(/\D/g, '');
    
//     if (!contactNo.trim()) {
//       return "Contact number is required";
//     }
    
//     if (digitsOnly.length !== 10) {
//       return "Contact number must be exactly 10 digits";
//     }
    
//     if (!/^[6-9]/.test(digitsOnly)) {
//       return "Contact number must start with 6, 7, 8, or 9";
//     }
    
//     return null;
//   };

//   const handleSaveUserData = () => {
//     // Validate contact number
//     const contactError = validateContactNumber(userEditableData.contactNo);
//     if (contactError) {
//       setValidationErrors(prev => ({ ...prev, contactNo: contactError }));
//       alert(`Contact Number Error: ${contactError}`);
//       return;
//     }

//     // Validate required user fields
//     const requiredUserFields = ['companyName', 'address', 'contactNo'];
//     const missingUserFields = requiredUserFields.filter(field => 
//       !userEditableData[field] || userEditableData[field].toString().trim() === ''
//     );
    
//     if (missingUserFields.length > 0) {
//       alert(`Please fill in: ${missingUserFields.join(', ')}`);
//       return;
//     }

//     setValidationErrors({});
    
//     // Save user data to localStorage
//     localStorage.setItem('coverPageUserData', JSON.stringify(userEditableData));
    
//     // Also save combined data for PDF generation
//     const combinedData = { ...userEditableData, ...autoPopulatedData };
//     localStorage.setItem('coverPageData', JSON.stringify(combinedData));
//     localStorage.setItem('coverPageGenerated', 'true');
    
//     setHasUnsavedChanges(false);
//     setIsEditMode(false);
//     alert("Cover page information saved successfully!");
//   };

//   const formatGrandTotal = (amount) => {
//     if (amount === undefined || amount === null || amount === '') return '₹0.00';
//     const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
//     if (isNaN(numAmount)) return '₹0.00';
//     if (numAmount === 0) return '₹0.00';
    
//     return `₹${numAmount.toLocaleString('en-IN', { 
//       minimumFractionDigits: 2, 
//       maximumFractionDigits: 2 
//     })}`;
//   };

//   const EditableField = ({ value, onChange, placeholder, className = "", type = "text", multiline = false }) => {
//     if (!isEditMode) {
//       return <span className={className}>{value || placeholder}</span>;
//     }

//     if (multiline) {
//       return (
//         <textarea
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder={placeholder}
//           className={`${className} border-2 border-blue-300 rounded px-2 py-1 bg-blue-50 min-h-[2rem] resize-none`}
//           rows="2"
//         />
//       );
//     }

//     return (
//       <input
//         type={type}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder={placeholder}
//         className={`${className} border-2 border-blue-300 rounded px-2 py-1 bg-blue-50 min-w-[200px]`}
//       />
//     );
//   };

//   return (
//     <div className="w-full h-full flex flex-col items-center justify-center p-4">
//       <div className="w-full max-w-4xl">
//         {/* Header with controls */}
//         <div className="mb-4 flex justify-between items-center">
//           <h2 className="text-2xl font-bold">Cover Page Generator</h2>
//           <div className="flex gap-4">
//             {!isEditMode ? (
//               <button 
//                 onClick={() => setIsEditMode(true)}
//                 className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
//               >
//                 <Edit2 size={18} /> Edit Details
//               </button>
//             ) : (
//               <div className="flex gap-2">
//                 <button 
//                   onClick={() => {
//                     setIsEditMode(false);
//                     setHasUnsavedChanges(false);
//                     // Reload user data from localStorage to discard changes
//                     const savedUserData = localStorage.getItem('coverPageUserData');
//                     if (savedUserData) {
//                       const parsedUserData = JSON.parse(savedUserData);
//                       setUserEditableData(parsedUserData);
//                       if (parsedUserData.companyLogo) {
//                         setPreviewLogo(parsedUserData.companyLogo);
//                       }
//                     }
//                   }}
//                   className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   onClick={handleSaveUserData}
//                   disabled={isSaving}
//                   className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {isSaving ? (
//                     <LuLoaderCircle className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Save size={18} />
//                   )}
//                   Save
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Edit Mode Instructions */}
//         {isEditMode && (
//           <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md">
//             <p className="text-blue-800 text-sm">
//               <strong>Edit Mode:</strong> Click on the highlighted fields to edit company information. 
//               Auto-populated fields (work details, costs) update automatically.
//             </p>
//           </div>
//         )}
        
//         {/* Cover Page Preview */}
//         <div 
//           ref={coverPageRef} 
//           className="w-full aspect-[1/1.414] border-2 border-gray-300 bg-white shadow-lg relative" 
//           style={{ maxWidth: '794px', maxHeight: '1123px' }}
//         >
//           <div className="w-full h-full border-8 border-white p-2">
//             <div className="w-full h-full border-4 border-gray-800 p-1">
//               <div className="w-full h-full border-4 border-gray-800 flex flex-col items-center p-4 md:p-8">
                
//                 {/* Company Logo and Name Section */}
//                 <div className="flex flex-col items-center mb-8 md:mb-12">
//                   {/* Logo Upload Area */}
//                   <div className="h-24 md:h-32 mb-4 flex items-center justify-center">
//                     {isEditMode && !previewLogo ? (
//                       <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50">
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleLogoChange}
//                           className="hidden"
//                           id="logo-upload"
//                         />
//                         <label htmlFor="logo-upload" className="cursor-pointer">
//                           <Camera size={32} className="text-blue-400 mx-auto mb-2" />
//                           <p className="text-sm text-blue-600">Upload Logo</p>
//                         </label>
//                       </div>
//                     ) : previewLogo ? (
//                       <div className="relative">
//                         <img 
//                           src={previewLogo} 
//                           alt="Company Logo" 
//                           className="h-24 md:h-32 object-contain"
//                         />
//                         {isEditMode && (
//                           <button
//                             onClick={() => document.getElementById('logo-upload').click()}
//                             className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
//                           >
//                             <Edit2 size={12} />
//                           </button>
//                         )}
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleLogoChange}
//                           className="hidden"
//                           id="logo-upload"
//                         />
//                       </div>
//                     ) : (
//                       <div className="h-24 md:h-32 flex items-center text-gray-400">
//                         [Company Logo]
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="text-center w-full">
//                     <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide mb-2">
//                       <EditableField
//                         value={userEditableData.companyName}
//                         onChange={(value) => handleUserFieldChange('companyName', value)}
//                         placeholder="COMPANY NAME"
//                         className="text-center"
//                       />
//                     </h1>
                    
//                     <p className="text-lg md:text-xl text-gray-700 mt-2">
//                       <EditableField
//                         value={userEditableData.address}
//                         onChange={(value) => handleUserFieldChange('address', value)}
//                         placeholder="Company Address"
//                         className="text-center"
//                       />
//                     </p>
                    
//                     <p className="text-lg md:text-xl text-gray-700 mt-1">
//                       Contact: <EditableField
//                         value={userEditableData.contactNo}
//                         onChange={(value) => handleUserFieldChange('contactNo', value)}
//                         placeholder="Contact Number"
//                         className="text-center"
//                         type="tel"
//                       />
//                       {isEditMode && validationErrors.contactNo && (
//                         <div className="text-red-500 text-sm mt-1">{validationErrors.contactNo}</div>
//                       )}
//                     </p>
//                   </div>
//                 </div>
                
//                 {/* Estimate Title */}
//                 <div className="mb-10 md:mb-16">
//                   <div className="border-2 border-gray-800 px-12 py-5 inline-block">
//                     <h2 className="text-3xl md:text-5xl font-bold text-blue-600">ESTIMATE</h2>
//                   </div>
//                 </div>
                
//                 {/* Work Details */}
//                 <div className="w-full flex-grow flex flex-col justify-center text-center">
//                   <div className="mb-6 md:mb-10">
//                     <p className="text-xl md:text-2xl text-red-600 font-bold mb-2">NAME OF WORK</p>
//                     <p className="text-xl md:text-2xl text-red-600 font-bold uppercase mb-6 md:mb-8">
//                       "{autoPopulatedData.workName || 'WORK NAME'}" FOR<br/>
//                       <EditableField
//                         value={autoPopulatedData.clientName}
//                         onChange={(value) => handleAutoFieldChange('clientName', value)}
//                         placeholder="CLIENT NAME"
//                         className="font-bold text-red-600 text-xl md:text-2xl"
//                       />
//                     </p>
//                   </div>
                  
//                   <p className="text-lg md:text-2xl mb-6 md:mb-10">
//                     PROPERTY NO <EditableField
//                       value={autoPopulatedData.propertyNo}
//                       onChange={(value) => handleAutoFieldChange('propertyNo', value)}
//                       placeholder="Property No"
//                       className="font-normal"
//                     />, <EditableField
//                       value={autoPopulatedData.propertyAddress}
//                       onChange={(value) => handleAutoFieldChange('propertyAddress', value)}
//                       placeholder="Property Address"
//                       className="font-normal"
//                     />
//                   </p>
                  
//                   <div className="mb-8 md:mb-12 text-center">
//                     <p className="text-lg md:text-2xl font-bold">
//                       <span>ESTIMATE COST : Rs. {formatGrandTotal(grandTotal).replace('₹', '')}</span>
//                       {isLoadingWorkOrder && (
//                         <LuLoaderCircle className="inline-block ml-2 w-5 h-5 animate-spin" />
//                       )}
//                     </p>
//                   </div>
                  
//                   <p className="text-lg md:text-xl text-gray-700">
//                     ADOPTED SOR OF {autoPopulatedData.year || 'YEAR'}
//                   </p>
                  
//                   <div className="mt-auto pt-8">
//                     <div className="text-center">
//                       <p className="text-lg md:text-xl font-bold text-gray-800">
//                         Prepared By: {autoPopulatedData.preparedBy || 'Not specified'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Status and Actions */}
//         <div className="mt-4 flex justify-between items-center">
//           <div className="text-sm text-gray-600">
//             {hasUnsavedChanges && (
//               <span className="text-orange-600">• Unsaved changes</span>
//             )}
//             {grandTotal > 0 && (
//               <span className="ml-4">
//                 Last updated: {new Date(lastUpdated).toLocaleTimeString()}
//               </span>
//             )}
//           </div>
          
//           <div className="flex gap-2">
//             {/* Add download buttons here if needed */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CoverPageGenerator;




import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ArrowLeft, Edit2, Save, Plus } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { LuLoaderCircle } from "react-icons/lu";
import { API_BASE_URL } from '../config';
const CoverPageGenerator = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyLogo: null,
    companyName: '',
    address: '',
    contactNo: '',
    workName: '',
    clientName: '',
    propertyNo: '',
    propertyAddress: '',
    estimateCost: '',
    year: '',
    preparedBy: ''
  });
  const [previewLogo, setPreviewLogo] = useState(null);
  const [pageGenerated, setPageGenerated] = useState(false);
  const coverPageRef = useRef(null);
  const [originalEstimateCost, setOriginalEstimateCost] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoadingWorkOrder, setIsLoadingWorkOrder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const [ssrOptions, setSSROptions] = useState([]);
const [grandTotal, setGrandTotal] = useState(0); 
const [validationErrors, setValidationErrors] = useState({});
const [lastUpdated, setLastUpdated] = useState(null);
const [isGrandTotalLoading, setIsGrandTotalLoading] = useState(false);
  // Load data from localStorage on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    // First, try to load saved cover page data
    const savedCoverPageData = localStorage.getItem('coverPageData');
    
    if (savedCoverPageData) {
      const parsedCoverData = JSON.parse(savedCoverPageData);
      setFormData(parsedCoverData);
      
      // Set preview logo if exists
      if (parsedCoverData.companyLogo) {
        setPreviewLogo(parsedCoverData.companyLogo);
      }
      
      // Set original estimate cost
      setOriginalEstimateCost(parsedCoverData.estimateCost || '');
      
      // Check if page was previously generated
      const wasGenerated = localStorage.getItem('coverPageGenerated') === 'true';
      setPageGenerated(wasGenerated);
      
      return; // Exit early if we have saved data
    }

    // If no saved cover page data, load from estimate data and API
    await loadDataFromEstimate();

  } catch (error) {
    console.error("Error loading data:", error);
    alert("Failed to load saved estimate data");
  }
};
  const getSSRNameById = (ssrId) => {
  if (!ssrId || !ssrOptions.length) return '';
  const ssrOption = ssrOptions.find(option => option.id === parseInt(ssrId));
  return ssrOption ? ssrOption.name : '';
};
useEffect(() => {
  const fetchSSROptions = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken'); // Adjust based on your token storage

      
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
      setSSROptions(data);
    } catch (err) {
      console.error('Error fetching SSR options:', err);
    }
  };

  const jwtToken = localStorage.getItem('jwtToken');
  if (jwtToken) {
    fetchSSROptions();
  }
}, []);
const fetchWorkOrderDetails = async () => {
  const workOrderId = localStorage.getItem('workorderId') || localStorage.getItem('workOrderId');
  const jwtToken = localStorage.getItem('jwtToken');

  
  if (!workOrderId || !jwtToken) {
    console.log('Missing workOrderId or jwtToken');
    return null;
  }

  setIsLoadingWorkOrder(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/workorders/${workOrderId}`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "*/*"
      }
    });
         
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
         
    const data = await response.json();
    const ssrName = getSSRNameById(data.ssr);
    
    // Update localStorage with fresh data
    localStorage.setItem('nameOfWork', data.nameOfWork || '');
    localStorage.setItem('ssr', data.ssr || '');
    localStorage.setItem('ssrName', ssrName);
    localStorage.setItem('preparedBySignature', data.preparedBySignature || '');
    
    return {
      nameOfWork: data.nameOfWork || '',
      ssr: data.ssr || '',
      ssrName: ssrName,
      preparedBySignature: data.preparedBySignature || ''
    };
  } catch (error) {
    console.error("Error fetching work order details:", error);
    return null;
  } finally {
    setIsLoadingWorkOrder(false);
  }
};


// Remove the loadSheetJSLibrary function entirely and replace handleDownloadExcel with this:

// Updated Excel download function with centered logo
const handleDownloadExcel = async () => {
  try {
    console.log('Creating Excel file with centered logo...');
    
    // Create a new workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cover Page');
    
    // Set column width for better layout - make it wider for centering
    worksheet.getColumn(1).width = 100; // Increased width for better centering
    
    // Add logo if present
    let logoRowOffset = 0;
    if (formData.companyLogo) {
      try {
        console.log('Adding centered logo to Excel...');
        
        // Convert base64 to buffer
        const logoBuffer = base64ToBuffer(formData.companyLogo);
        
        // Add image to workbook
        const logoImageId = workbook.addImage({
          buffer: logoBuffer,
          extension: 'png', // or 'jpeg' based on your image
        });
        
        // Calculate center position for logo
        // Excel column width is approximately 7 pixels per unit
        // So for column width 100, we have ~700 pixels
        // Center a 200px wide image: (700 - 200) / 2 = 250 pixels offset
        const logoWidth = 200;
        const logoHeight = 100;
        const columnWidthInPixels = 700; // Approximate pixel width for column width 100
        const centerOffsetX = (columnWidthInPixels - logoWidth) / 2;
        
        // Insert image at centered position
        worksheet.addImage(logoImageId, {
          tl: { 
            col: 0, 
            row: 1,
            colOff: centerOffsetX, // Horizontal offset to center the image
            rowOff: 10 // Small vertical padding from top
          },
          ext: { 
            width: logoWidth, 
            height: logoHeight 
          },
          editAs: 'oneCell'
        });
        
        logoRowOffset = 8; // More space for larger centered logo
      } catch (logoError) {
        console.error('Error adding logo:', logoError);
        logoRowOffset = 2; // Still add some space even if logo fails
      }
    }
    
    // Define row positions with logo offset
    const rowPos = {
      companyName: 5 + logoRowOffset,
      address: 6 + logoRowOffset,
      contact: 7 + logoRowOffset,
      estimateTitle: 10 + logoRowOffset,
      nameOfWork: 13 + logoRowOffset,
      workName: 14 + logoRowOffset,
      clientName: 15 + logoRowOffset,
      property: 17 + logoRowOffset,
      estimateCost: 19 + logoRowOffset,
      sorDetails: 21 + logoRowOffset,
      preparedBy: 25 + logoRowOffset
    };
    
    // Company Name - Centered
    const companyNameCell = worksheet.getCell(`A${rowPos.companyName}`);
    companyNameCell.value = (formData.companyName || '').toUpperCase();
    companyNameCell.font = { bold: true, size: 24, color: { argb: 'FF000000' } };
    companyNameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    companyNameCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    worksheet.getRow(rowPos.companyName).height = 35;
    
    // Company Address - Centered
    const addressCell = worksheet.getCell(`A${rowPos.address}`);
    addressCell.value = (formData.address || '').toUpperCase();
    addressCell.font = { size: 14, color: { argb: 'FF000000' } };
    addressCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.address).height = 25;
    
    // Contact Number - Centered
    const contactCell = worksheet.getCell(`A${rowPos.contact}`);
    contactCell.value = `Contact: ${formatContactNumber(formData.contactNo || '')}`;
    contactCell.font = { size: 14, color: { argb: 'FF000000' } };
    contactCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.contact).height = 25;
    
    // Add empty row for spacing
    worksheet.getRow(rowPos.contact + 1).height = 20;
    
    // ESTIMATE Title with border - Centered
    const estimateCell = worksheet.getCell(`A${rowPos.estimateTitle}`);
    estimateCell.value = 'ESTIMATE';
    estimateCell.font = { bold: true, size: 28, color: { argb: 'FF0000FF' } };
    estimateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    estimateCell.border = {
      top: { style: 'thick', color: { argb: 'FF000000' } },
      left: { style: 'thick', color: { argb: 'FF000000' } },
      bottom: { style: 'thick', color: { argb: 'FF000000' } },
      right: { style: 'thick', color: { argb: 'FF000000' } }
    };
    estimateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    worksheet.getRow(rowPos.estimateTitle).height = 50;
    
    // Add empty rows for spacing
    worksheet.getRow(rowPos.estimateTitle + 1).height = 20;
    worksheet.getRow(rowPos.estimateTitle + 2).height = 20;
    
    // NAME OF WORK - Centered
    const nameOfWorkCell = worksheet.getCell(`A${rowPos.nameOfWork}`);
    nameOfWorkCell.value = 'NAME OF WORK';
    nameOfWorkCell.font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    nameOfWorkCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.nameOfWork).height = 30;
    
    // Work Name - Centered
    const workNameForExcel = formData.workName || localStorage.getItem('abstractWorkName') || localStorage.getItem('nameOfWork') || '';
    const workNameCell = worksheet.getCell(`A${rowPos.workName}`);
    workNameCell.value = `"${workNameForExcel.toUpperCase()}" FOR`;
    workNameCell.font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    workNameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.workName).height = 30;
    
    // Client Name - Centered
    const clientNameCell = worksheet.getCell(`A${rowPos.clientName}`);
    clientNameCell.value = (formData.clientName || '').toUpperCase();
    clientNameCell.font = { bold: true, size: 16, color: { argb: 'FFFF0000' } };
    clientNameCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.clientName).height = 35;
    
    // Add empty row for spacing
    worksheet.getRow(rowPos.clientName + 1).height = 20;
    
    // Property Details - Centered
    const propertyCell = worksheet.getCell(`A${rowPos.property}`);
    propertyCell.value = `PROPERTY NO ${(formData.propertyNo || '').toUpperCase()}, ${(formData.propertyAddress || '').toUpperCase()}`;
    propertyCell.font = { size: 14, color: { argb: 'FF000000' } };
    propertyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.property).height = 30;
    
    // Add empty row for spacing
    worksheet.getRow(rowPos.property + 1).height = 20;
    
    // Estimate Cost - Centered
    const formattedCost = grandTotal ? 
      `Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
      'Rs. 0.00';
    const costCell = worksheet.getCell(`A${rowPos.estimateCost}`);
    costCell.value = `ESTIMATE COST : ${formattedCost}`;
    costCell.font = { bold: true, size: 18, color: { argb: 'FF000000' } };
    costCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.estimateCost).height = 35;
    
    // Add empty row for spacing
    worksheet.getRow(rowPos.estimateCost + 1).height = 20;
    
    // SOR Details - Centered
    const ssrName = localStorage.getItem('ssrName') || '';
    const ssrText = ssrName ? ssrName.toUpperCase() : (formData.year || '').toUpperCase();
    const sorCell = worksheet.getCell(`A${rowPos.sorDetails}`);
    sorCell.value = `ADOPTED SOR OF ${ssrText}`;
    sorCell.font = { size: 14, color: { argb: 'FF000000' } };
    sorCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.sorDetails).height = 25;
    
    // Add empty rows for spacing
    worksheet.getRow(rowPos.sorDetails + 1).height = 20;
    worksheet.getRow(rowPos.sorDetails + 2).height = 20;
    worksheet.getRow(rowPos.sorDetails + 3).height = 20;
    
    // Prepared By - Centered
    const preparedByCell = worksheet.getCell(`A${rowPos.preparedBy}`);
    preparedByCell.value = `Prepared By: ${formData.preparedBy || ''}`;
    preparedByCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
    preparedByCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(rowPos.preparedBy).height = 30;
    
    // Set page setup for better printing
    worksheet.pageSetup = {
      orientation: 'portrait',
      paperSize: 9, // A4
      fitToPage: true,
      fitToHeight: 1,
      fitToWidth: 1,
      margins: {
        left: 0.75,
        right: 0.75,
        top: 1.0,
        bottom: 1.0,
        header: 0.3,
        footer: 0.3
      }
    };
    
    // Generate filename
    const workNameForFile = formData.workName || 'CoverPage';
    const sanitizedWorkName = workNameForFile.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedWorkName}_CoverPage_${timestamp}.xlsx`;
    
    console.log('Writing Excel file with centered logo...');
    
    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Create blob and download
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Use the imported saveAs function
    saveAs(blob, filename);
    
    alert('Professional Excel file with centered logo downloaded successfully!');
    
  } catch (error) {
    console.error('Excel export error:', error);
    alert(`Failed to generate Excel file: ${error.message}\n\nPlease make sure the exceljs and file-saver packages are installed.`);
  }
};

const base64ToBuffer = (base64String) => {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
  // Convert base64 to binary string
  const binaryString = atob(base64Data);
  // Create buffer
  const buffer = new ArrayBuffer(binaryString.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binaryString.length; i++) {
    view[i] = binaryString.charCodeAt(i);
  }
  return buffer;
};

  const validateContactNumber = (contactNo) => {
  // Remove all non-digit characters for validation
  const digitsOnly = contactNo.replace(/\D/g, '');
  
  if (!contactNo.trim()) {
    return "Contact number is required";
  }
  
  if (digitsOnly.length !== 10) {
    return "Contact number must be exactly 10 digits";
  }
  
  if (!/^[6-9]/.test(digitsOnly)) {
    return "Contact number must start with 6, 7, 8, or 9";
  }
  
  return null; // No error
};
const formatContactNumber = (contactNo) => {
  if (!contactNo) return '';
  
  // Remove all non-digit characters and return only digits
  const digitsOnly = contactNo.replace(/\D/g, '');
  
  // Return only the 10-digit number without any formatting
  if (digitsOnly.length === 10) {
    return digitsOnly;
  }
  
  return contactNo; // Return as-is if not 10 digits
};
const fetchGrandTotalFromStorage = () => {
  try {
    const storedGrandTotal = localStorage.getItem('grandTotal');
    if (storedGrandTotal) {
      const grandTotalData = JSON.parse(storedGrandTotal);
      const amount = grandTotalData.amount || 0;
      setGrandTotal(amount);
      setLastUpdated(grandTotalData.timestamp || null);
      console.log('Grand total fetched from localStorage:', amount);
      return amount;
    } else {
      setGrandTotal(0);
      setLastUpdated(null);
      console.log('No grand total found in localStorage');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching grand total from localStorage:', error);
    setGrandTotal(0);
    setLastUpdated(null);
    return 0;
  }
};

const checkGrandTotalUpdate = () => {
  try {
    const storedGrandTotal = localStorage.getItem('grandTotal');
    if (storedGrandTotal) {
      const grandTotalData = JSON.parse(storedGrandTotal);
      const currentTimestamp = grandTotalData.timestamp;
      
      // Check if timestamp is different from last known timestamp
      if (currentTimestamp !== lastUpdated) {
        setGrandTotal(grandTotalData.amount || 0);
        setLastUpdated(currentTimestamp);
        console.log('Grand total updated:', grandTotalData.amount);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking grand total update:', error);
    return false;
  }
};
useEffect(() => {
  if (grandTotal && grandTotal > 0) {
    setFormData(prev => ({
      ...prev,
      estimateCost: grandTotal.toString()
    }));
  }
}, [grandTotal]);
useEffect(() => {
  // Initial load
  fetchGrandTotalFromStorage();
  
  // Set up interval for auto-refresh
  const interval = setInterval(() => {
    checkGrandTotalUpdate();
  }, 2000); // Check every 2 seconds
  
  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, [lastUpdated]);
useEffect(() => {
  const handleStorageChange = (event) => {
    if (event.key === 'grandTotal' && event.newValue) {
      try {
        const grandTotalData = JSON.parse(event.newValue);
        setGrandTotal(grandTotalData.amount || 0);
        setLastUpdated(grandTotalData.timestamp || null);
        console.log('Grand total updated from another tab:', grandTotalData.amount);
      } catch (error) {
        console.error('Error parsing grand total from storage event:', error);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      console.log('Page became visible, checking for grand total updates...');
      fetchGrandTotalFromStorage();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);

// Listen for window focus events
useEffect(() => {
  const handleFocus = () => {
    console.log('Page focused, checking for grand total updates...');
    fetchGrandTotalFromStorage();
  };
  
  window.addEventListener('focus', handleFocus);
  
  return () => {
    window.removeEventListener('focus', handleFocus);
  };
}, []);
  const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Special handling for contact number
  if (name === 'contactNo') {
    // Allow only numbers, spaces, hyphens, and + sign
    const sanitizedValue = value.replace(/[^0-9\s\-\+]/g, '');
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate contact number
    const error = validateContactNumber(sanitizedValue);
    setValidationErrors(prev => ({
      ...prev,
      contactNo: error
    }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for other fields when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }
  
  setHasUnsavedChanges(true);
};

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target.result);
        setFormData(prev => ({ ...prev, companyLogo: e.target.result }));
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };
const handleSave = () => {
  const contactError = validateContactNumber(formData.contactNo);
  if (contactError) {
    setValidationErrors(prev => ({
      ...prev,
      contactNo: contactError
    }));
    alert(`Contact Number Error: ${contactError}`);
    return;
  }

  // Create a copy of formData with the current grandTotal as estimateCost
  const dataToValidate = {
    ...formData,
    estimateCost: grandTotal ? grandTotal.toString() : formData.estimateCost
  };

  // Validate required fields
  const requiredFields = ['companyName', 'address', 'contactNo','workName', 'clientName', 'propertyNo', 'propertyAddress', 'estimateCost', 'year','preparedBy'];
  const missingFields = requiredFields.filter(field => !dataToValidate[field] || dataToValidate[field].toString().trim() === '');
  
  if (missingFields.length > 0) {
    alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
    return;
  }
  setValidationErrors({});

  // Update formData with current grandTotal before saving
  const finalFormData = {
    ...formData,
    estimateCost: grandTotal ? grandTotal.toString() : formData.estimateCost
  };

  // Save to localStorage with all necessary keys for PDF generation
  localStorage.setItem('coverPageData', JSON.stringify(finalFormData));
  localStorage.setItem('coverPageGenerated', 'true');
  
  // Also save individual items for PDF generation compatibility
  localStorage.setItem('abstractWorkName', finalFormData.workName);
  localStorage.setItem('abstractWorkOrderId', localStorage.getItem('workOrderId') );
  localStorage.setItem('abstractArea', localStorage.getItem('area') );
  localStorage.setItem('abstractSSR', finalFormData.year);
  
  // Ensure construction estimate is available for PDF
  const existingEstimate = localStorage.getItem('constructionEstimate');
  if (!existingEstimate) {
    const constructionEstimate = {
      grandTotal: parseFloat(finalFormData.estimateCost) || 0,
      workOrderId: localStorage.getItem('workOrderId'),
      workName: finalFormData.workName,
      area: localStorage.getItem('area') ,
      ssr: finalFormData.year,
      items: 0,
      revisionNumber: localStorage.getItem('revisionNumber') 
    };
    localStorage.setItem('constructionEstimate', JSON.stringify(constructionEstimate));
  }
  
  // Update the component state with final data
  setFormData(finalFormData);
  setPageGenerated(true);
  setShowModal(false);
  setHasUnsavedChanges(false);
  alert("Cover page saved successfully!");
};
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmCancel) return;
    }
    
    // Reset to last saved state
    loadData();
    setShowModal(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  // Handle creating a new cover page
  const handleCreateNew = () => {
    const confirmCreate = window.confirm("This will clear the current cover page and create a new one. Are you sure?");
    if (!confirmCreate) return;
    
    // Clear localStorage cover page data
    localStorage.removeItem('coverPageData');
    localStorage.removeItem('coverPageGenerated');
    
    // Reset component state
    setPageGenerated(false);
    setHasUnsavedChanges(false);
    setPreviewLogo(null);
     setValidationErrors({});
    // Reset form data to initial state
    const initialFormData = {
      companyLogo: null,
      companyName: '',
      address: '',
        contactNo: '',
      workName: '',
      clientName: '',
      propertyNo: '',
      propertyAddress: '',
      estimateCost: '',
      year: '',
       preparedBy: ''
    };
    setFormData(initialFormData);
    
    // Load fresh data from estimate
    loadDataFromEstimate();
  };

  // Load data specifically from estimate (not from saved cover page)
  const loadDataFromEstimate = async () => {
  try {
    setIsLoadingWorkOrder(true);
    
    // First try to get work order data from localStorage
    let workName = localStorage.getItem('abstractWorkName') || localStorage.getItem('nameOfWork') || '';
    let ssrYear = localStorage.getItem('ssr') || '';
    let ssrName = localStorage.getItem('ssrName') || '';
    let preparedBy = localStorage.getItem('preparedBySignature') || localStorage.getItem('preparedBy') || '';
    
    // If essential data is missing, fetch from API
    if (!workName || !ssrYear || !ssrName) {
      console.log('Missing essential work order data, fetching from API...');
      const apiData = await fetchWorkOrderDetails();
      
      if (apiData) {
        workName = apiData.nameOfWork || workName;
        ssrYear = apiData.ssr || ssrYear;
        ssrName = apiData.ssrName || ssrName;
        preparedBy = apiData.preparedBySignature || preparedBy;
        
        console.log('API data loaded:', apiData);
      } else {
        console.warn('Failed to fetch work order data from API');
      }
    }

    // Load construction estimate and calculate grand total
    const constructionEstimate = localStorage.getItem('constructionEstimate');
    let grandTotalAmount = 0;
    
    if (constructionEstimate) {
      try {
        const parsedEstimateData = JSON.parse(constructionEstimate);
        if (parsedEstimateData && parsedEstimateData.grandTotal) {
          grandTotalAmount = parseFloat(parsedEstimateData.grandTotal);
        }
      } catch (parseError) {
        console.error('Error parsing construction estimate:', parseError);
      }
    }
    
    // If no grandTotal from constructionEstimate, try calculating from items
    if (!grandTotalAmount) {
      grandTotalAmount = await calculateGrandTotalFromItems();
    }
    
    // Update grand total state
    setGrandTotal(grandTotalAmount);
    setOriginalEstimateCost(grandTotalAmount.toString());
    
    // Format SSR year if needed
    if (ssrYear && !ssrYear.includes('-')) {
      const currentYear = new Date().getFullYear();
      ssrYear = `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}`;
    }
    
    // Update form data with estimate data and API data
    setFormData(prev => ({
      ...prev,
      workName: workName,
      estimateCost: grandTotalAmount.toString(),
      year: ssrName || ssrYear, // Use SSR name if available, otherwise use year
      preparedBy: preparedBy
    }));

    console.log('Data loaded successfully:', {
      workName,
      grandTotal: grandTotalAmount,
      ssrName: ssrName || ssrYear,
      preparedBy
    });

  } catch (error) {
    console.error("Error loading estimate data:", error);
    alert("Failed to load estimate data. Please check your connection and try again.");
  } finally {
    setIsLoadingWorkOrder(false);
  }
};
  const handleDownload = () => {
    if (!coverPageRef.current) return;
    
    try {
      alert('Generating PDF...');
      
      // Create scripts for PDF generation
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script1.async = true;
      
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script2.async = true;
      
      script1.onload = () => {
        document.body.appendChild(script2);
      };
      
      script2.onload = () => {
        generatePDF();
      };
      
      document.body.appendChild(script1);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
  
  const generatePDF = () => {
    const html2canvas = window.html2canvas;
    const { jsPDF } = window.jspdf;
    
    html2canvas(coverPageRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${formData.workName.replace(/\s+/g, '_')}_Cover_Page.pdf`);
      alert('PDF downloaded successfully');
    }).catch(err => {
      console.error("Error in PDF generation:", err);
      alert("PDF generation failed. Please try again.");
    });
  };

const calculateGrandTotalFromItems = async () => {
  try {
    const abstractItems = localStorage.getItem('abstractItems');
    const auxiliaryWorks = localStorage.getItem('auxiliaryWorks');
    
    if (!abstractItems) {
      console.log('No abstract items found');
      return 0;
    }
    
    const parsedItems = JSON.parse(abstractItems);
    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      console.log('No valid items found');
      return 0;
    }
    
    // Calculate base total from items
    const baseTotal = parsedItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.completedRate) || parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);
    
    console.log('Base total calculated:', baseTotal);
    
    // Add auxiliary works if available
    let totalWithAux = baseTotal;
    if (auxiliaryWorks) {
      try {
        const parsedAux = JSON.parse(auxiliaryWorks);
        if (Array.isArray(parsedAux)) {
          parsedAux.forEach(aux => {
            const percentage = parseFloat(aux.percentage) || 0;
            const auxAmount = baseTotal * (percentage / 100);
            totalWithAux += auxAmount;
            console.log(`Added auxiliary work: ${aux.name} (${percentage}%) = ${auxAmount}`);
          });
        }
      } catch (auxError) {
        console.error('Error parsing auxiliary works:', auxError);
      }
    }
    
    console.log('Total with auxiliary works:', totalWithAux);
    return totalWithAux;
    
  } catch (error) {
    console.error('Error calculating grand total from items:', error);
    return 0;
  }
};
  const handleBackToEstimate = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    
    // In a real app, you would use navigate('/estimate')
    // For this demo, we'll just show an alert
    alert("Navigating back to estimate page...");
  };

  // Format the estimate cost with commas for Indian number format
 const formatIndianCurrency = (amount) => {
  // Handle undefined, null, or empty values
  if (!amount || amount === undefined || amount === null) return '';
  
  const [wholePart, decimalPart = ''] = amount.toString().split('.');
  
  let formattedWholePart = '';
  let count = 0;
  
  for (let i = wholePart.length - 1; i >= 0; i--) {
    count++;
    formattedWholePart = wholePart[i] + formattedWholePart;
    
    if (i !== 0 && count === 3) {
      formattedWholePart = ',' + formattedWholePart;
    } else if (i !== 0 && count > 3 && (count - 3) % 2 === 0) {
      formattedWholePart = ',' + formattedWholePart;
    }
  }
  
  return decimalPart ? `${formattedWholePart}.${decimalPart}` : formattedWholePart;
};

const formatGrandTotal = (amount) => {
  // Handle undefined, null, or empty values
  if (amount === undefined || amount === null || amount === '') return '₹0.00';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN or invalid numbers
  if (isNaN(numAmount)) return '₹0.00';
  
  if (numAmount === 0) return '₹0.00';
  
  return `₹${numAmount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};


// Get relative time for last updated
const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never updated';
  
  const now = new Date();
  const updateTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - updateTime) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return updateTime.toLocaleDateString('en-IN') + ' ' + updateTime.toLocaleTimeString('en-IN');
  }
};
const GrandTotalDisplay = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Estimate</h3>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-green-600">
            {formatGrandTotal(grandTotal)}
          </span>
          {isGrandTotalLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Last updated: {getRelativeTime(lastUpdated)}
        </p>
      </div>
      
      {/* Optional: Show update indicator */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Auto-updating</span>
      </div>
    </div>
  </div>
);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {!pageGenerated ? (
        <div className="w-full max-w-4xl">
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-orange-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-orange-700 transition-colors"
            >
              Create Cover Page
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Generated Cover Page</h2>
            <div className="flex gap-4">
              <button 
                onClick={handleCreateNew}
                className="bg-orange-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-orange-700 transition-colors"
              >
                <Plus size={18} /> Reset
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Edit 
              </button>
              {/* <button 
    onClick={handleDownloadExcel}
    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
    title="Download as professional Excel format"
  >
    <Download size={18} /> 
    Excel
  </button> */}
            </div>
          </div>
          
          {/* Generated Cover Page */}
          <div 
            ref={coverPageRef} 
            className="w-full aspect-[1/1.414] border-2 border-gray-300 bg-white shadow-lg relative" 
            style={{ maxWidth: '794px', maxHeight: '1123px' }}
          >
            <div className="w-full h-full border-8 border-white p-2">
              <div className="w-full h-full border-4 border-gray-800 p-1">
                <div className="w-full h-full border-4 border-gray-800 flex flex-col items-center p-4 md:p-8">
                  {/* Company Logo and Name */}
                  <div className="flex flex-col items-center mb-8 md:mb-12">
                    {formData.companyLogo ? (
                      <img 
                        src={formData.companyLogo} 
                        alt="Company Logo" 
                        className="h-24 md:h-32 mb-4 object-contain"
                      />
                    ) : (
                      <div className="h-24 md:h-32 mb-4"></div>
                    )}
                    <div className="text-center">
                      <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide">
                        {formData.companyName.toUpperCase()}
                      </h1>
                      <p className="text-lg md:text-xl text-gray-700 mt-2">
                        {formData.address.toUpperCase()}
                      </p>
                     <p className="text-lg md:text-xl text-gray-700 mt-1">
  Contact: {formData.contactNo.replace(/\D/g, '')}
</p>

                    </div>
                  </div>
                  
                  {/* Estimate Title */}
                  <div className="mb-10 md:mb-16">
                    <div className="border-2 border-gray-800 px-12 py-5 inline-block">
                      <h2 className="text-3xl md:text-5xl font-bold text-blue-600">ESTIMATE</h2>
                    </div>
                  </div>
                  
                  {/* Work Details */}
                  <div className="w-full flex-grow flex flex-col justify-center text-center">
  <div className="mb-6 md:mb-10">
    <p className="text-xl md:text-2xl text-red-600 font-bold mb-2">NAME OF WORK</p>
    <p className="text-xl md:text-2xl text-red-600 font-bold uppercase mb-6 md:mb-8">
      {(() => {
        // Get work name from multiple sources with fallback
        const workName = formData.workName || 
                        localStorage.getItem('abstractWorkName') || 
                        localStorage.getItem('nameOfWork') || 
                        'WORK NAME NOT AVAILABLE';
        
        const clientName = formData.clientName || 'CLIENT NAME NOT AVAILABLE';
        
        return (
          <>
            {workName.toUpperCase()} FOR<br/>
            {clientName.toUpperCase()}
          </>
        );
      })()}
    </p>
  </div>
                    
                     <p className="text-lg md:text-2xl mb-6 md:mb-10">
    PROPERTY NO {formData.propertyNo.toUpperCase()}, {formData.propertyAddress.toUpperCase()}
  </p>
  
  <div className="mb-8 md:mb-12 text-center">
    <p className="text-lg md:text-2xl font-bold inline-flex items-center">
      <span>ESTIMATE COST : </span>
      <span className="mx-2">Rs. {grandTotal ? formatGrandTotal(grandTotal) : '₹0.00'}</span>
    </p>
  </div>
                    
                    <p className="text-lg md:text-xl text-gray-700">
  ADOPTED SOR OF {(() => {
    // Get SSR name from localStorage or formData
    const ssrName = localStorage.getItem('ssrName') || '';
    const ssrYear = formData.year || '';
    
    // If we have SSR name, use it; otherwise use the year
    if (ssrName && ssrName.trim() !== '') {
      return ssrName.toUpperCase();
    } else if (ssrYear && ssrYear.trim() !== '') {
      return ssrYear.toUpperCase();
    } else {
      return 'N/A';
    }
  })()}
</p>
                    <div className="mt-auto pt-8">
      <div className="text-center">
        <p className="text-lg md:text-xl font-bold text-gray-800">
          Prepared By: {formData.preparedBy}
        </p>
      </div>
    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form with Save/Cancel */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="text-lg font-bold">Cover Page Details</h2>
              <button 
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Company Logo */}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Company Logo (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="w-full text-sm"
                  />
                  {previewLogo && (
                    <div className="mt-1 flex justify-center">
                      <img src={previewLogo} alt="Logo Preview" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
                
                {/* Company Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Company Name *</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. ITAS"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Company Address *</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. Pune"
                      required
                    />
                  </div>
                </div>
                <div>
  <label className="block text-sm text-gray-700 mb-1">Contact Number *</label>
  <input 
    type="text" 
    name="contactNo"  // FIXED: Removed the asterisk from name
    value={formData.contactNo} 
    onChange={handleInputChange}
    className={`w-full border rounded-md p-1.5 text-sm ${
      validationErrors.contactNo 
        ? 'border-red-500 bg-red-50' 
        : 'border-gray-300'
    }`}
    placeholder="e.g. 9876543210 "
    required
    maxLength="10" // Allow for formatting characters
  />
  {validationErrors.contactNo && (
    <p className="text-red-500 text-xs mt-1">{validationErrors.contactNo}</p>
  )}
  <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number</p>
</div>
                {/* Work & Client Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Name of Work *</label>
                    <input 
                      type="text" 
                      name="workName" 
                      value={formData.workName} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. CONSTRUCTION OF RESIDENCE"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-populated from estimate</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Client Name *</label>
                    <input 
                      type="text" 
                      name="clientName" 
                      value={formData.clientName} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder=" e.g. MR.PRAVIN MUNDHE"
                      required
                    />
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Property No. *</label>
                    <input 
                      type="text" 
                      name="propertyNo" 
                      value={formData.propertyNo} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. 13456"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Property Address *</label>
                    <input 
                      type="text" 
                      name="propertyAddress" 
                      value={formData.propertyAddress} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. Pune"
                      required
                    />
                  </div>
                </div>
                
                {/* Cost & Year */}
                <div className="grid grid-cols-2 gap-3">
<div>
  <label className="block text-sm text-gray-700 mb-1">Estimate Cost *</label>
  <div className="flex items-center">
    <span className="text-sm text-gray-600 mr-1">Rs.</span>
    <input 
      type="text" 
      name="estimateCost" 
      value={grandTotal ? formatGrandTotal(grandTotal) : '₹0.00'}
      onChange={handleInputChange}
      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
      placeholder="e.g. 1234567.89"
      required
      readOnly // Make it read-only since it's auto-populated
    />
  </div>
  <p className="text-xs text-gray-500 mt-1">Auto-populated from estimate</p>
</div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">SOR Year *</label>
                    <input 
                      type="text" 
                      name="year" 
                      value={formData.year} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                      placeholder="e.g. 2023-24"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-populated from estimate</p>
                  </div>
                  <div>
  <label className="block text-sm text-gray-700 mb-1">Prepared By *</label>
  <input 
    type="text" 
    name="preparedBy" 
    value={formData.preparedBy} 
    onChange={handleInputChange}
    className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
    placeholder="e.g.MR.PRAVIN MUNDHE"
    required
  />
  <p className="text-xs text-gray-500 mt-1">Auto-populated from saved signature</p>
</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
               <button 
  onClick={handleSave}
  disabled={isSaving}
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
>
  {isSaving ? (
    <>
      <LuLoaderCircle className="w-4 h-4 text-white animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save size={16} />
      Save & Generate
    </>
  )}
</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverPageGenerator;
