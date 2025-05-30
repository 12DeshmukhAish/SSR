
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
  faInfoCircle,
  faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import MeasurementTable from './MeasurementTable';
import Stepper from '../components/Stepper';

const SubEstimateForm = () => {
  // State for work order information
  const [itemSearchQuery, setItemSearchQuery] = useState("");
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
  const [expandedSubworks, setExpandedSubworks] = useState([]);

  const [searchQueries, setSearchQueries] = useState({});


  
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
  const API_BASE_URL = "https://24.101.103.87:8082/api";
  
  // JWT Token from localStorage
  const jwtToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ1NDIzNjczLCJleHAiOjE3NDU1MTAwNzN9.4cfviErztGCET2mb3Wg34JnFbm24Y8EPIfHAMN84XIQ";

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
    const fetchRevisions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/workorder-revisions/ByWorkorderId/${workOrderInfo.workOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              Accept: '*/*',
            },
          }
        );
  
        if (!response.ok) throw new Error(`Error: ${response.status}`);
  
        const allRevisions = await response.json();
  
        const uniqueSorted = [...new Set(
          allRevisions
            .filter((rev) => rev.deletedFlag.toLowerCase() !== 'yes')
            .map((rev) => rev.reviseNumber)
        )].sort((a, b) => parseFloat(a) - parseFloat(b));
  
        console.log("Valid revisions:", uniqueSorted);
toast.success(`Revision List: ${uniqueSorted.join(', ')}`);

      } catch (err) {
        console.error('Failed to fetch revisions:', err);
        toast.error('Error loading revision history.');
      }
    };
  
    if (workOrderInfo.workOrderId) {
      fetchRevisions();
    }
  }, [workOrderInfo.workOrderId]);

  useEffect(() => {
    const workOrderId = localStorage.getItem('workorderId');
    const reviseId = localStorage.getItem('reviseId');
  
    if (workOrderId && reviseId) {
      fetchSubworks(reviseId, workOrderId);
    }
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
  const handleSearchChange = (subworkId, query) => {
    setSearchQueries((prev) => ({
      ...prev,
      [subworkId]: query.toLowerCase(),
    }));
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
  const [visibleMeasurements, setVisibleMeasurements] = useState({});

  // Function to ensure measurement table is shown for item
  const showMeasurementTable = (itemId) => {
    setVisibleMeasurements((prev) => ({
      ...prev,
      [itemId]: true
    }));
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
          setExpandedSubworks(prev => [...prev, responseData.id]);

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
    if (!window.confirm('Delete this subwork?')) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/subwork/${subworkId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${jwtToken}` }
      });
      if (!resp.ok) throw new Error('Delete failed');
      fetchSubworks(workOrderInfo.reviseId, workOrderInfo.workOrderId);
      toast.success('Deleted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Toggle subwork expansion
  const toggleSubwork = (subworkId) => {
    setExpandedSubworks(prev => {
      const isAlreadyExpanded = prev.includes(subworkId);
      const newExpanded = isAlreadyExpanded
        ? prev.filter(id => id !== subworkId)
        : [...prev, subworkId];
      if (!isAlreadyExpanded) {
        loadSubworkItems(subworkId);
      }
      return newExpanded;
    });
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
        // floorLiftRise: selectedItemObj.floorLiftRise || "Ground floor",
        smallUnit: selectedItemObj.smallUnit,
        fullUnit: selectedItemObj.fullUnit,
        // additionalSpecification: selectedItemObj.additionalSpecification
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

    const existingItems = items[currentSubworkId] || [];
    const isDuplicate = existingItems.some(item =>
      item.itemNo === itemForm.itemNo && item.id !== editingItemId
    );

    if (isDuplicate) {
      toast.error(`Item "${itemForm.itemNo}" already exists in this subwork`);
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

      await loadSubworkItems(currentSubworkId);

      setShowAddItemModal(false);
      setItemForm({
        id: 0,
        srNo: 0,
        itemNo: "",
        category: "",
        descriptionOfItem: "",
        // floorLiftRise: "Ground floor",
        fkSubworkId: 0,
        fkWorkorderId: 0,
        completedRate: 0,
        labourRate: 0,
        scadaFlag: false,
        smallUnit: "",
        fullUnit: "",
        // additionalSpecification: ""
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
  // const [visibleMeasurements, setVisibleMeasurements] = useState({});
  // const toggleMeasurementVisibility = (itemId) => {
  //   setVisibleMeasurements((prev) => ({
  //     ...prev,
  //     [itemId]: !prev[itemId],
  //   }));
  // };

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
  const navigateToPdfPreview = async () => {
    const allSubworkIds = Object.keys(items);
    
    if (allSubworkIds.length === 0) {
      toast.error("No subworks or items found to generate PDF");
      return;
    }
  
    const allItemsWithMeasurements = await Promise.all(
      allSubworkIds.flatMap(subworkId =>
        (items[subworkId] || []).map(async (item) => {
          try {
            const response = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${item.id}`, {
              headers: {
                Authorization: `Bearer ${jwtToken}`,
                "Content-Type": "application/json",
              },
            });
            const measurements = await response.json();
            return { ...item, measurements: Array.isArray(measurements) ? measurements : [] };
          } catch (err) {
            console.error("Error fetching measurements for item", item.id, err);
            return { ...item, measurements: [] };
          }
        })
      )
    );
  
    localStorage.setItem("subRecordCache", JSON.stringify(allItemsWithMeasurements));
    localStorage.setItem("pdfWorkName", workOrderInfo.nameOfWork);
    localStorage.setItem("pdfWorkOrderId", workOrderInfo.autogenerated);
    localStorage.setItem("pdfRevisionNumber", workOrderInfo.reviseno);
  
    toast.success("Preparing full PDF...");
    navigate("/pdf-preview");
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
            <span className="text-gray-600 text-sm">Estimate ID</span>
            <span className="font-semibold text-lg">{workOrderInfo.autogenerated || 'N/A'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">Revision No</span>
            <span className="font-semibold text-lg">{workOrderInfo.reviseno || 'N/A'}</span>

          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm"> Specified Area</span>
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

<motion.div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden" variants={itemVariants}>
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
                  className={`py-4 px-6 cursor-pointer transition-colors duration-200 ${expandedSubworks.includes(subwork.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleSubwork(subwork.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${expandedSubworks.includes(subwork.id) ? 'bg-blue-600 text-white' : 'bg-gray-200'} mr-3 transition-colors duration-200`}>
                        <FontAwesomeIcon icon={expandedSubworks.includes(subwork.id) ? faChevronDown : faChevronRight} className="text-xs" />
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
                  {expandedSubworks.includes(subwork.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden bg-gray-50"
                    >
                      <div className="p-6 border-t border-gray-200">
                        {isItemLoading ? (
                          <div className="text-center py-6">
                            <FontAwesomeIcon icon={faSpinner} spin className="text-blue-600 text-xl mb-2" />
                            <p className="text-gray-600">Loading items...</p>
                          </div>
  ) : (
    <>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-semibold text-gray-700">
          Items for: {subwork.subworkName}
        </h4>

        <div className="mb-4 mt-1">
          <input
            type="text"
            placeholder="Search item by name, number, or category..."
            value={searchQueries[subwork.id] || ""}
            onChange={(e) => handleSearchChange(subwork.id, e.target.value)}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
        </div>
      </div> 
       {/* <th className="p-3 border-b">Floor Rise/Lift</th> */}

                        <table className="w-full text-sm text-left border border-gray-300 mb-6 rounded overflow-hidden shadow-sm">
    <thead className="bg-gray-100 text-gray-700">
      <tr>
        <th className="p-3 border-b">Sr. No</th>
        <th className="p-3 border-b">Item No</th>
        <th className="p-3 border-b">Category</th>
        <th className="p-3 border-b">Description</th>
      
        <th className="p-3 border-b text-center"></th>
      </tr>
    </thead>
    <tbody>
    {(items[subwork.id] || [])
  .filter(item => {
    const query = searchQueries[subwork.id] || '';
    return (
      item.itemNo?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.descriptionOfItem?.toLowerCase().includes(query)
    );
  })
  .map((item, index) => (
    <React.Fragment key={item.id}>
        <tr className="border-t hover:bg-gray-50 transition-all">
          <td className="p-3 align-top">{index + 1}</td>
          <td className="p-3 align-top">{item.itemNo}</td>
          <td className="p-3 align-top">{item.category}</td>
          <td className="p-3 align-top">{item.descriptionOfItem}</td>
          {/* <td className="p-3 align-top">{item.floorLiftRise}</td> */}
          <td className="p-3 text-center align-top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                editItem(item);
              }}
              className="text-blue-600 hover:text-blue-800 mr-3"
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <FontAwesomeIcon icon={faTrash} /> 
            </button>
          </td>
        </tr>
        <tr>
        <td colSpan="6" className="bg-white px-6 py-3 border-t text-right">
        {!visibleMeasurements[item.id] && (
  <button
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
    onClick={() => setVisibleMeasurements(prev => ({
      ...prev,
      [item.id]: true
    }))}
  >
    <FontAwesomeIcon icon={faPlus} className="mr-1" />
    Add Measurement
  </button>
)}

  </td>
        </tr>
        {visibleMeasurements[item.id] || item.hasMeasurements ? (
   <tr>
   <td colSpan="6">
     <div className="p-4 bg-gray-50 border-t">
       <MeasurementTable itemId={item.id} token={jwtToken} unitLabel={item.smallUnit} />
     </div>
   </td>
 </tr>
 
  ) : null}
      </React.Fragment>
    ))}
  </tbody>

  </table>


  </>         
                  )}        
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          
        )}
        {/* Final PDF Button at Bottom of Page */}
<div className="flex justify-center mt-8">
  <button
    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center text-base shadow-md"
    onClick={navigateToPdfPreview}
  >
    <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
    Save and Review
  </button>
</div>

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
            {/* Search + Filtered Item Dropdown */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Search Item</label>
  <div className="relative mb-3">
    <input
      type="text"
      placeholder="Search by Item No"
      value={itemSearchQuery}
      onChange={(e) => setItemSearchQuery(e.target.value)}
      className="w-full p-2 pl-10 border border-gray-300 rounded"
    />
    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
  </div>

  <label className="block text-sm font-medium text-gray-700 mb-1">Item No</label>
  <select
    name="itemNo"
    value={itemForm.itemNo}
    onChange={handleItemChange}
    className={`w-full p-2 border ${itemFormErrors.itemNo ? 'border-red-500' : 'border-gray-300'} rounded`}
  >
    <option value="">Select Item</option>
    {itemOptions
      .filter(item =>
        item.itemNo.toLowerCase().includes(itemSearchQuery.toLowerCase())
      )
      .sort((a, b) => a.itemNo.localeCompare(b.itemNo, undefined, { numeric: true }))
      .map((item, index) => (
        <option key={index} value={item.itemNo}>
          {item.itemNo}
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
              {/* <div>
  <label className="block text-sm text-gray-700 mb-1">Floor Lift Rise</label>
  <select
    name="floorLiftRise"
    value={itemForm.floorLiftRise}
    onChange={handleItemFormChange}
    className="w-full p-2 border border-gray-300 rounded"
  >
    <option value="Ground floor">Ground floor</option>
    <option value="First floor">First floor</option>
    <option value="Second floor">Second floor</option>
    <option value="Third floor">Third floor</option>
  </select>
</div> */}

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
                    // floorLiftRise: "Ground floor",
                    fkSubworkId: 0,
                    fkWorkorderId: 0,
                    completedRate: 0,
                    labourRate: 0,
                    scadaFlag: false,
                    smallUnit: "",
                    fullUnit: "",
                    // additionalSpecification: ""
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