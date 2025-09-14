import React, { useEffect, useState, useRef ,useMemo} from 'react';
import { Copy } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faSave, 
  faEdit, 
  faTimes, 
  faCheck, 
  faCopy, 
  faClipboard,
  faCheckCircle,
  
  
  faQuestionCircle,
  faKeyboard,
  
  faChevronDown,
  faChevronRight,
  faCalculator,
  faRupeeSign,
   faCheckSquare, 
  faInfoCircle, 
  faPaste, 
  faHashtag, 
  faRuler, 
 
  faBuilding, 

  faCog,
  faFileText,

  faMouse,
  faExclamationTriangle,
  faSpinner
  
} from '@fortawesome/free-solid-svg-icons';

import { API_BASE_URL } from '../config';
const MeasurementTable = ({ 
  itemId, 
  token, 
  unitLabel = "Cu.M.", 
  multifloor = false, 
   fkSsrId = 0,
  itemsFromParent = [], 
  onMeasurementDrop,
   completedRate,
  onQuantityUpdate,
   onCollapseChange ,
    onMeasurementAdded,
      currentSubworkItems = [], // Items from current subwork
  onSameAsAboveSubmit, // Callback to parent component
 
}) => {
  const [measurements, setMeasurements] = useState([]);
const [showInput, setShowInput] = useState(true); 
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
   const [floors, setFloors] = useState([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(''); 
    const [isFormDirty, setIsFormDirty] = useState(false);
  const [selectedMeasurements, setSelectedMeasurements] = useState(new Set());
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [clipboardStatus, setClipboardStatus] = useState({ hasData: false, count: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showPasteGuide, setShowPasteGuide] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inlineEditId, setInlineEditId] = useState(null);
const [inlineEditData, setInlineEditData] = useState({});
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
const [inlineEditSaving, setInlineEditSaving] = useState(false);
const [autoSaveStatus, setAutoSaveStatus] = useState({ saving: false, saved: false, error: false });
  const [lastPasteTimestamp, setLastPasteTimestamp] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const contextMenuRef = useRef(null);
  const tableRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
const pasteGuideRef = useRef(null);
  const prevTotalRef = useRef(0);
    const [showSameAsAboveForm, setShowSameAsAboveForm] = useState(false);
  const [sameAsAboveForm, setSameAsAboveForm] = useState({
    selectedItemId: '',
    percentage: ''
  });
  const [sameAsAboveErrors, setSameAsAboveErrors] = useState({});
  const [formData, setFormData] = useState({
    description: '',
    number: '',
    multiplyNumber: '1',
    length: '',
    width: '',
    height: '',
    quantity: '',
    unit: unitLabel,
    floorLiftRise: ''
  });
  const [editId, setEditId] = useState(null);

  // Enhanced clipboard management
  const CLIPBOARD_KEY = 'measurementClipboard_v4';
 const totalQuantity = useMemo(() => {
    return measurements.reduce((sum, measurement) => {
      const quantity = parseFloat(measurement.quantity) || 0;
      return sum + quantity;
    }, 0);
  }, [measurements]);

  // Enhanced RA calculation with proper formatting
  const currentCompletedRate = parseFloat(completedRate) ;
  const totalRA = totalQuantity * currentCompletedRate;
   
// Store the callback in a ref so it doesn't cause dependency changes
const onQuantityUpdateRef = useRef(onQuantityUpdate);
onQuantityUpdateRef.current = onQuantityUpdate;

useEffect(() => {
  if (prevTotalRef.current !== totalQuantity) {
    prevTotalRef.current = totalQuantity;
    if (onQuantityUpdateRef.current) {
      onQuantityUpdateRef.current(totalQuantity);
    }
  }
}, [totalQuantity]); // Only depends on totalQuantity, not the callback


  // Show notification helper - only show one at a time
  const showNotification = (message, type = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setNotification({ show: true, message, type });
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 2500);
  };
 const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Notify parent component about collapse state change
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };
const autoSave = async (data) => {
  // Only auto-save for new measurements (not editing)
  if (editId || inlineEditId) return;
  
  // Clear any existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  const timeout = setTimeout(async () => {
    const quantity = parseFloat(data.quantity);
    if (!quantity || quantity <= 0) return;

    setAutoSaveStatus({ saving: true, saved: false, error: false });

    try {
      const selectedFloorData = floors.find(f => f.id === parseInt(selectedFloor));
      const floorName = selectedFloorData ? selectedFloorData.floorLevel : null;
      
      const payload = {
        id: 0,
        description: data.description.trim() || '',
        number: parseFloat(data.number) || 0,
        multiplyNumber: parseFloat(data.multiplyNumber) || 1,
        length: parseFloat(data.length) || 0,
        width: parseFloat(data.width) || 0,
        height: parseFloat(data.height) || 0,
        quantity: quantity,
        unit: data.unit || unitLabel,
        fkTxnItemId: parseInt(itemId),
        floorLiftRise: floorName
      };

      const response = await fetch(`${API_BASE_URL}/api/txn-items-mts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Clear form and refresh measurements
      resetForm();
      fetchMeasurements();
      
      setAutoSaveStatus({ saving: false, saved: true, error: false });
      
      // Hide saved status after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus(prev => ({ ...prev, saved: false }));
      }, 2000);

    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus({ saving: false, saved: false, error: true });
      
      setTimeout(() => {
        setAutoSaveStatus(prev => ({ ...prev, error: false }));
      }, 3000);
    }
  }, 1500);

  setAutoSaveTimeout(timeout);
};



const handleSameAsAboveSubmit = async () => {
    // Validation
    const errors = {};
    if (!sameAsAboveForm.selectedItemId) {
      errors.selectedItemId = 'Please select an item';
    }
    if (!sameAsAboveForm.percentage || parseFloat(sameAsAboveForm.percentage) <= 0 || parseFloat(sameAsAboveForm.percentage) > 100) {
      errors.percentage = 'Please enter a valid percentage (1-100)';
    }

    if (Object.keys(errors).length > 0) {
      setSameAsAboveErrors(errors);
      return;
    }

    setSaving(true);
    setSameAsAboveErrors({});

    try {
      // Find the selected item details
      const selectedItem = currentSubworkItems.find(
        item => item.id === parseInt(sameAsAboveForm.selectedItemId)
      );

      if (!selectedItem) {
        throw new Error('Selected item not found');
      }

      // Calculate the quantity based on percentage
      const baseQuantity = selectedItem.totalQuantity || 0;
      const percentageAmount = parseFloat(sameAsAboveForm.percentage);
      const calculatedQuantity = (baseQuantity * percentageAmount) / 100;

      // Create measurement payload - set fields to null/undefined for display as "-"
      const measurementPayload = {
        id: 0,
        description: `Same as above (${percentageAmount}% of Item ${selectedItem.itemNo})`,
        number: null,           // Will display as "-"
        multiplyNumber: null,   // Will display as "-"
        length: null,          // Will display as "-"
        width: null,           // Will display as "-"
        height: null,          // Will display as "-"
        quantity: calculatedQuantity,
        unit: unitLabel,
        fkTxnItemId: parseInt(itemId),
        floorLiftRise: null
      };

      const response = await fetch(`${API_BASE_URL}/api/txn-items-mts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(measurementPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create measurement: ${errorData}`);
      }

      // Reset form and refresh measurements
      setSameAsAboveForm({ selectedItemId: '', percentage: '' });
      setSameAsAboveErrors({});
      setShowSameAsAboveForm(false);
      
      fetchMeasurements();
      
      if (showNotification) {
        showNotification(`Successfully added "Same as above" measurement with ${percentageAmount}% quantity (${calculatedQuantity.toFixed(2)} ${unitLabel})`, 'success');
      }

      // Call parent callback if provided
      if (onSameAsAboveSubmit) {
        onSameAsAboveSubmit(selectedItem, percentageAmount, calculatedQuantity);
      }

    } catch (error) {
      console.error('Error creating same as above measurement:', error);
      setSameAsAboveErrors({ submit: error.message || 'Failed to create measurement' });
      if (showNotification) {
        showNotification('Failed to create "Same as above" measurement', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

// Helper function to display measurement values
const displayMeasurementValue = (value) => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return '-';
  }
  return value;
};

  // Enhanced clipboard status check
  const checkClipboardStatus = () => {
    try {
      const clipboardData = localStorage.getItem(CLIPBOARD_KEY);
      if (clipboardData) {
        const data = JSON.parse(clipboardData);
        if (data.type === 'measurement_data' && data.measurements && Array.isArray(data.measurements)) {
          const isRecent = (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000;
          if (isRecent && data.timestamp !== lastPasteTimestamp) {
            setClipboardStatus({
              hasData: true,
              count: data.measurements.length
            });
            return;
          } else if (!isRecent) {
            localStorage.removeItem(CLIPBOARD_KEY);
          }
        }
      }
    } catch (error) {
      console.warn('Error checking clipboard:', error);
      localStorage.removeItem(CLIPBOARD_KEY);
    }
    
    setClipboardStatus({ hasData: false, count: 0 });
  };

  // Enhanced clipboard monitoring
  useEffect(() => {
    checkClipboardStatus();

    const handleStorageChange = (e) => {
      if (e.key === CLIPBOARD_KEY) {
        checkClipboardStatus();
      }
    };
{measurements.map((m) => {
  // Calculate RA for this specific measurement
  const measurementQuantity = parseFloat(m.quantity) || 0;
  const measurementRA = measurementQuantity * currentCompletedRate;
  
  return (
    <tr 
      key={m.id}
      className={`hover:bg-gray-50 ${selectedMeasurements.has(m.id) ? 'bg-blue-50' : ''}`}
    >
      <td className="px-3 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={selectedMeasurements.has(m.id)}
          onChange={(e) => handleSelectMeasurement(m.id, e)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate" title={m.description}>
        {m.description}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
        {m.number}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
        {m.multiplyNumber || 1}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
        {m.length || '-'}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
        {m.width || '-'}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
        {m.height || '-'}
      </td>
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {measurementQuantity.toFixed(2)}
      </td>
      {multifloor && (
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {m.floorLiftRise || '-'}
        </td>
      )}
      {currentCompletedRate > 0 && (
        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
          {formatCurrency(measurementRA)}
        </td>
      )}
      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(m)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDelete(m.id)}
            className="text-red-600 hover:text-red-900"
            disabled={deletingId === m.id}
            title="Delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </td>
    </tr>
  );
})}
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardStatus.hasData) {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          e.preventDefault();
          handlePasteFromClipboard();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('keydown', handleKeyDown);
    const interval = setInterval(checkClipboardStatus, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [clipboardStatus.hasData, lastPasteTimestamp]);

  // Close context menu and paste guide when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0 });
      }
      if (pasteGuideRef.current && !pasteGuideRef.current.contains(event.target)) {
        setShowPasteGuide(false);
      }
    };

    if (contextMenu.show || showPasteGuide) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.show, showPasteGuide]);

  // Helper function to get unit type
  const getUnitType = (unit = unitLabel) => {
    const normalizedUnit = unit.trim().toUpperCase().replace(/[^A-Z]/g, '');
    
    if (['CUM', 'CUBICMETER', 'CUBICMETRE', 'CM'].includes(normalizedUnit)) return 'CUM';
    if (['SQM', 'SQUAREMETER', 'SQUAREMETRE', 'SM'].includes(normalizedUnit)) return 'SQM';
    if (['RMT', 'RUNNINGMETER', 'RUNNINGMETRE', 'RM'].includes(normalizedUnit)) return 'RMT';
    if (['NOS', 'NO', 'NUMBER', 'NUMBERS', 'PIECE', 'PIECES', 'PCS'].includes(normalizedUnit)) return 'NOS';
    
    if (normalizedUnit.includes('CU')) return 'CUM';
    if (normalizedUnit.includes('SQ')) return 'SQM';
    if (normalizedUnit.includes('RMT') || normalizedUnit.includes('RUNNING')) return 'RMT';
    if (normalizedUnit.includes('NO')) return 'NOS';
    
    return 'CUM';
  };

  // Real-time quantity calculation
 const calculateQuantity = (data) => {
  // Parse values with proper decimal handling - allow zero but not empty/null/undefined
  const number = data.number !== '' && data.number !== null && data.number !== undefined ? parseFloat(data.number) : 0;
  const multiplyNumber = data.multiplyNumber !== '' && data.multiplyNumber !== null && data.multiplyNumber !== undefined ? parseFloat(data.multiplyNumber) : 1;
  const length = data.length !== '' && data.length !== null && data.length !== undefined ? parseFloat(data.length) : 0;
  const width = data.width !== '' && data.width !== null && data.width !== undefined ? parseFloat(data.width) : 0;
  const height = data.height !== '' && data.height !== null && data.height !== undefined ? parseFloat(data.height) : 0;
  
  const unitType = getUnitType(data.unit || unitLabel);
  let result = 0;
  
  switch (unitType) {
    case 'NOS':
      // For NOS: only number and multiply needed
      if (number > 0) {
        result = number * multiplyNumber;
      }
      break;
      
    case 'RMT':
      // For RMT: Need number and at least one dimension
      if (number > 0) {
        const runningMeasurement = length > 0 ? length : (width > 0 ? width : (height > 0 ? height : 0));
        if (runningMeasurement > 0) {
          result = number * multiplyNumber * runningMeasurement;
        }
      }
      break;
      
    case 'SQM':
      // For SQM: Need number, length, and one more dimension
      if (number > 0 && length > 0) {
        const breadthOrHeight = width > 0 ? width : (height > 0 ? height : 0);
        if (breadthOrHeight > 0) {
          result = number * multiplyNumber * length * breadthOrHeight;
        }
      }
      break;
      
    case 'CUM':
    default:
      // For CUM: Need all dimensions to be greater than 0
      if (number > 0 && length > 0 && width > 0 && height > 0) {
        result = number * multiplyNumber * length * width * height;
      }
      break;
  }
  
  // Return formatted result with proper decimal precision
  return result > 0 ? Number(result.toFixed(6)).toString() : '';
};


  // Check which fields should be enabled based on unit type
 const isFieldEnabled = (fieldName) => {
  const unitType = getUnitType(formData.unit || unitLabel);
  
  switch (unitType) {
    case 'NOS':
      return fieldName === 'number' || fieldName === 'multiplyNumber';
    case 'RMT':
      // For RMT: number, multiplyNumber are required; length, width, height are all optional (but at least one needed)
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
    case 'SQM':
      // For SQM: number, multiplyNumber, length are required; width and height are optional
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
    case 'CUM':
    default:
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
  }
};

  // Get fields that should be copied based on unit type
 const getFieldsForUnit = (unit) => {
  const unitType = getUnitType(unit);
  const baseFields = ['description', 'number', 'multiplyNumber'];
  
  switch (unitType) {
    case 'NOS':
      return [...baseFields];
    case 'RMT':
      return [...baseFields, 'length', 'width', 'height']; // Include all measurement fields
    case 'SQM':
      return [...baseFields, 'length', 'width', 'height']; // Include both width and height
    case 'CUM':
    default:
      return [...baseFields, 'length', 'width', 'height'];
  }
};
const handleChange = (e) => {
  const { name, value } = e.target;
  
  if (name === 'floorLiftRise') {
    setSelectedFloor(value);
    const selectedFloorData = floors.find(f => f.id === parseInt(value));
    const floorName = selectedFloorData ? selectedFloorData.floorLevel : '';
    
    setFormData(prev => {
      const updated = { ...prev, [name]: floorName };
      return updated;
    });
  } else {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Recalculate quantity if numeric fields change
      if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(name)) {
        updated.quantity = calculateQuantity(updated);
      }
      
      return updated;
    });
  }
  setFormError("");
};

useEffect(() => {
  // Only auto-save for new measurements (not editing) and when there's a valid quantity
  const quantity = parseFloat(formData.quantity);
  
  if (!editId && !inlineEditId && autoSaveEnabled && quantity > 0) {
    // Clear any existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      setAutoSaveStatus({ saving: true, saved: false, error: false });

      try {
        const selectedFloorData = floors.find(f => f.id === parseInt(selectedFloor));
        const floorName = selectedFloorData ? selectedFloorData.floorLevel : null;
        
        const payload = {
          id: 0,
          description: formData.description.trim() || '',
          number: parseFloat(formData.number) || 0,
          multiplyNumber: parseFloat(formData.multiplyNumber) || 1,
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          quantity: quantity,
          unit: formData.unit || unitLabel,
          fkTxnItemId: parseInt(itemId),
          floorLiftRise: floorName
        };

        const response = await fetch(`${API_BASE_URL}/api/txn-items-mts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }
        
        // Clear form and refresh measurements
        resetForm();
        fetchMeasurements();
        
        setAutoSaveStatus({ saving: false, saved: true, error: false });
        
        // Hide saved status after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus(prev => ({ ...prev, saved: false }));
        }, 2000);

      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus({ saving: false, saved: false, error: true });
        
        setTimeout(() => {
          setAutoSaveStatus(prev => ({ ...prev, error: false }));
        }, 3000);
      }
    }, 1500);

    setAutoSaveTimeout(timeout);
  }
}, [formData.quantity, editId, inlineEditId, autoSaveEnabled]); // Only depend on quantity and editing states

const handleSelectAllAndCopy = () => {
  // First select all measurements
  const allIds = new Set(measurements.map(m => m.id));
  setSelectedMeasurements(allIds);
  
  // Then immediately copy them
  const selectedData = measurements;
  const currentUnitType = getUnitType(unitLabel);
  const allowedFields = getFieldsForUnit(unitLabel);
  
  // Filter data to include only relevant fields for current unit type
  const filteredData = selectedData.map(measurement => {
    // Check if this is a "Same as Above" measurement based on description
    const isSameAsAbove = isSameAsAboveMeasurement(measurement);
    
    const filtered = {
      description: measurement.description,
      floorLiftRise: measurement.floorLiftRise,
      isSameAsAbove: isSameAsAbove, // Mark as special measurement
      originalQuantity: isSameAsAbove ? measurement.quantity : null // Preserve original quantity
    };
    
    // For "Same as Above" measurements, store the actual values but mark them as special
    // For regular measurements, process normally
    if (allowedFields.includes('number')) {
      filtered.number = measurement.number;
    }
    if (allowedFields.includes('multiplyNumber')) {
      filtered.multiplyNumber = measurement.multiplyNumber;
    }
    if (allowedFields.includes('length')) {
      filtered.length = measurement.length;
    }
    if (allowedFields.includes('width')) {
      filtered.width = measurement.width;
    }
    if (allowedFields.includes('height')) {
      filtered.height = measurement.height;
    }
    
    return filtered;
  });
  
  const clipboardData = {
    type: 'measurement_data',
    measurements: filteredData,
    sourceUnit: unitLabel,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
    showNotification(`Copied all ${selectedData.length} measurements (${currentUnitType} fields only)`, 'success');
    checkClipboardStatus();
    setContextMenu({ show: false, x: 0, y: 0 });
  } catch (error) {
    console.error('Copy failed:', error);
    showNotification('Failed to copy measurements', 'error');
  }
};
const isSameAsAboveMeasurement = (measurement) => {
  // Check if description contains "Same as above" (case insensitive)
  const description = (measurement.description || '').toLowerCase();
  return description.includes('same as above');
};
  // Fetch measurements from API
  const fetchMeasurements = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(
  `${API_BASE_URL}/api/txn-items-mts/ByItemId/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      const data = await res.json();
      const measurementData = Array.isArray(data) ? data : [];
      setMeasurements(measurementData);
    } catch (err) {
      console.error('Fetch measurements error:', err);
      setApiError("Failed to load measurements. Please try again.");
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch floors if multifloor is enabled
    const fetchFloors = async () => {
    if (!multifloor || fkSsrId === 0) return;
    
    try {
      const res = await fetch(
  `${API_BASE_URL}/api/v1/building-floor-adjustments/BySsrId/${fkSsrId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Floor data received:', data);
      
      const floorOptions = Array.isArray(data) ? data.map(item => ({
        id: item.floorAdjustmetId,
        floorLevel: item.floorLevel,
        percentageIncrease: item.percentageIncrease
      })) : [];
      
      setFloors(floorOptions);
      console.log('Floors set:', floorOptions);
    } catch (err) {
      console.error("Failed to load floors:", err);
      setFloors([]);
    }
  };

  useEffect(() => {
    if (itemId && token) {
      fetchMeasurements();
      if (multifloor && fkSsrId > 0) {
        fetchFloors();
      }
    }
  }, [itemId, token, multifloor, fkSsrId]); 
//  // Add fkSsrId here
//    useEffect(() => {
//     fetchFloors();
//   }, [multifloor, fkSsrId, token]);


  // Open inline form
  const handleOpenInlineForm = () => {
    setShowInput(true);
  };

  // Validation
  const validate = () => {
    // if (!formData.description.trim()) return "Description is required.";
    
  //   if (
  //     measurements.some(
  //       m => m.description.trim().toLowerCase() === formData.description.trim().toLowerCase() &&
  //            m.id !== editId
  //     )
  //   ) return "Duplicate measurement description is not allowed.";
    
    return "";
  };

// const handleSave = async () => {
//   const validationError = validate();
//   if (validationError) {
//     setFormError(validationError);
//     return;
//   }
  
//   // Check if auto-save is currently running
//   if (autoSaveStatus.saving) {
//     showNotification('Auto-save in progress, please wait...', 'info');
//     return;
//   }
  
//   // Disable auto-save during manual save
//   setAutoSaveEnabled(false);
//   setSaving(true);
//   setFormError("");
  
//   // Clear any pending autosave to prevent conflict
//   if (autoSaveTimeout) {
//     clearTimeout(autoSaveTimeout);
//     setAutoSaveTimeout(null);
//   }
  
//   // Clear auto-save status
//   setAutoSaveStatus({ saving: false, saved: false, error: false });
  
//   const selectedFloorData = floors.find(f => f.id === parseInt(selectedFloor));
//   const floorName = selectedFloorData ? selectedFloorData.floorLevel : null;
  
//   const payload = {
//     id: 0, // Always 0 for new measurements
//     description: formData.description.trim() || '',
//     number: parseFloat(formData.number) || 0,
//     multiplyNumber: parseFloat(formData.multiplyNumber) || 1,
//     length: parseFloat(formData.length) || 0,
//     width: parseFloat(formData.width) || 0,
//     height: parseFloat(formData.height) || 0,
//     quantity: parseFloat(formData.quantity) || 0,
//     unit: formData.unit || unitLabel,
//     fkTxnItemId: parseInt(itemId),
//     floorLiftRise: floorName
//   };
  
//   try {
//     const resp = await fetch(`${API_BASE_URL}/api/txn-items-mts`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     });
    
//     if (!resp.ok) {
//       const errorText = await resp.text();
//       throw new Error(`API responded with status ${resp.status}: ${errorText}`);
//     }
    
//     // Clear form after successful save
//     resetForm();
//     fetchMeasurements();
//     setIsCollapsed(true);
    
//     showNotification('Measurement added successfully', 'success');
//   } catch (err) {
//     console.error('Save error:', err);
//     setFormError("Failed to save measurement. Please check your data and try again.");
//     showNotification('Failed to save measurement', 'error');
//   } finally {
//     setSaving(false);
//     // Re-enable auto-save after manual save completes
//     setAutoSaveEnabled(true);
//   }
// };
const handleEdit = (m) => {
  // Clear any pending auto-save
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    setAutoSaveTimeout(null);
  }
  
  // Disable auto-save during editing
  setAutoSaveEnabled(false);
  
  // Set inline editing state
  setInlineEditId(m.id);
  
  // Find the floor ID from the floor name
  const floorData = floors.find(f => f.floorLevel === m.floorLiftRise);
  const floorId = floorData ? floorData.id.toString() : '';
  
  setInlineEditData({
    description: m.description,
    number: m.number,
    multiplyNumber: m.multiplyNumber || 1,
    length: m.length,
    width: m.width,
    height: m.height,
    quantity: m.quantity,
    unit: m.unit || unitLabel,
    floorLiftRise: floorId
  });
  
  // Clear auto-save status when editing
  setAutoSaveStatus({ saving: false, saved: false, error: false });
};
const handleInlineEditChange = (field, value) => {
  setInlineEditData(prev => {
    const updated = { ...prev, [field]: value };
    
    // Auto-calculate quantity based on unit type
    if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(field)) {
      const number = parseFloat(updated.number) || 0;
      const multiply = parseFloat(updated.multiplyNumber) || 1;
      const length = parseFloat(updated.length) || 0;
      const width = parseFloat(updated.width) || 0;
      const height = parseFloat(updated.height) || 0;
      
      const currentUnitType = getUnitType(updated.unit || unitLabel);
      let quantity = 0;
      
      switch (currentUnitType) {
        case 'NOS':
          if (number > 0) {
            quantity = number * multiply;
          }
          break;
          
        case 'RMT':
          if (number > 0) {
            const runningMeasurement = length > 0 ? length : (width > 0 ? width : (height > 0 ? height : 0));
            if (runningMeasurement > 0) {
              quantity = number * multiply * runningMeasurement;
            }
          }
          break;
          
        case 'SQM':
          if (number > 0 && length > 0) {
            const breadthOrHeight = width > 0 ? width : (height > 0 ? height : 0);
            if (breadthOrHeight > 0) {
              quantity = number * multiply * length * breadthOrHeight;
            }
          }
          break;
          
        case 'CUM':
        default:
          if (number > 0 && length > 0 && width > 0 && height > 0) {
            quantity = number * multiply * length * width * height;
          }
          break;
      }
      
      // Format with proper precision
      updated.quantity = quantity > 0 ? parseFloat(quantity.toFixed(6)).toString() : '';
    }
    
    return updated;
  });
};
const validateRMTFields = (data) => {
  const unitType = getUnitType(data.unit || unitLabel);
  
  if (unitType === 'RMT') {
    const number = parseFloat(data.number) || 0;
    const length = parseFloat(data.length) || 0;
    const width = parseFloat(data.width) || 0;
    const height = parseFloat(data.height) || 0;
    
    if (number <= 0) {
      return "Number is required for RMT unit";
    }
    
    if (length <= 0 && width <= 0 && height <= 0) {
      return "At least one measurement (Length, Width, or Height) is required for RMT unit";
    }
  }
  
  return "";
};
const isInlineFieldEnabled = (fieldName, unit) => {
  const currentUnitType = getUnitType(unit || unitLabel);
       
  switch (currentUnitType) {
    case 'NOS':
      return fieldName === 'number' || fieldName === 'multiplyNumber';
    case 'RMT':
      // For RMT: all fields are enabled (number required, length/width/height at least one required)
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
    case 'SQM':
      // For SQM: all fields are enabled (number, multiply, length required; width, height optional)
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
    case 'CUM':
    default:
      return ['number', 'multiplyNumber', 'length', 'width', 'height'].includes(fieldName);
  }
};

// New function to save inline edit
const handleInlineEditSave = async (measurementId) => {
  setInlineEditSaving(true);
  
  try {
    const selectedFloorData = floors.find(f => f.id === parseInt(inlineEditData.floorLiftRise));
    const floorName = selectedFloorData ? selectedFloorData.floorLevel : null;
    
    const payload = {
      id: measurementId,
      description: inlineEditData.description.trim() || '',
      number: parseFloat(inlineEditData.number) || 0,
      multiplyNumber: parseFloat(inlineEditData.multiplyNumber) || 1,
      length: parseFloat(inlineEditData.length) || 0,
      width: parseFloat(inlineEditData.width) || 0,
      height: parseFloat(inlineEditData.height) || 0,
      quantity: parseFloat(inlineEditData.quantity) || 0,
      unit: inlineEditData.unit || unitLabel,
      fkTxnItemId: parseInt(itemId),
      floorLiftRise: floorName
    };
    
    const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/${measurementId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    // Cancel inline edit and refresh data
    setInlineEditId(null);
    setInlineEditData({});
    // Re-enable auto-save after successful edit
    setAutoSaveEnabled(true);
    fetchMeasurements();
    
    showNotification('Measurement updated successfully', 'success');
    
  } catch (err) {
    console.error('Inline edit save error:', err);
    showNotification('Failed to update measurement', 'error');
  } finally {
    setInlineEditSaving(false);
  }
};

// New function to cancel inline edit
const handleInlineEditCancel = () => {
  setInlineEditId(null);
  setInlineEditData({});
  // Re-enable auto-save when canceling edit
  setAutoSaveEnabled(true);
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) return;
    
    setDeletingId(id);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/txn-items-mts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!resp.ok) throw new Error("Delete failed");
      
      fetchMeasurements();
      showNotification('Measurement deleted successfully', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      setApiError("Delete failed");
      showNotification('Failed to delete measurement', 'error');
    } finally {
      setDeletingId(null);
    }
  };
const resetForm = () => {
  setEditId(null);
  setInlineEditId(null);
  setSelectedFloor('');
  setFormData({
    description: '',
    number: '',
    multiplyNumber: '1',
    length: '',
    width: '',
    height: '',
    quantity: '',
    unit: unitLabel,
    floorLiftRise: ''
  });
  setFormError("");
  setAutoSaveStatus({ saving: false, saved: false, error: false });
  setAutoSaveEnabled(true); // Re-enable auto-save for new measurements
  
  // Clear any pending autosave
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    setAutoSaveTimeout(null);
  }
};


  // Helper functions for selection and context menu
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedMeasurements(new Set(measurements.map(m => m.id)));
    } else {
      setSelectedMeasurements(new Set());
    }
  };

  const handleSelectMeasurement = (id, e) => {
    const newSelected = new Set(selectedMeasurements);
    if (e.target.checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedMeasurements(newSelected);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY
    });
  };
 
const handlePasteFromClipboard = async () => {
  try {
    const clipboardData = localStorage.getItem(CLIPBOARD_KEY);
    if (!clipboardData) {
      showNotification('No clipboard data found', 'error');
      return;
    }

    const data = JSON.parse(clipboardData);
    if (data.type !== 'measurement_data' || !Array.isArray(data.measurements)) {
      showNotification('Invalid clipboard data format', 'error');
      return;
    }

    if (data.timestamp === lastPasteTimestamp) {
      return;
    }

    setSaving(true);
    
    // Create paste payload for each measurement
    const pastePromises = data.measurements.map(measurement => {
      // Get current unit type and determine which fields to use
      const currentUnitType = getUnitType(unitLabel);
      const allowedFields = getFieldsForUnit(unitLabel);
      
      // Check if this is a "Same as Above" measurement that needs special handling
      const isSameAsAbove = measurement.isSameAsAbove && measurement.originalQuantity !== null;
      
      // Create payload
      const payload = {
        id: 0,
        description: measurement.description || '',
        unit: unitLabel, // Use current unit, not the copied unit
        fkTxnItemId: parseInt(itemId),
        floorLiftRise: measurement.floorLiftRise || null
      };
      
      if (isSameAsAbove) {
        // For "Same as Above" measurements, preserve the original quantity and actual field values
        payload.number = measurement.number;
        payload.multiplyNumber = measurement.multiplyNumber;
        payload.length = measurement.length;
        payload.width = measurement.width;
        payload.height = measurement.height;
        payload.quantity = parseFloat(measurement.originalQuantity);
      } else {
        // For regular measurements, process normally with null checking
        payload.number = allowedFields.includes('number') ? 
          (measurement.number !== null && measurement.number !== undefined ? parseFloat(measurement.number) || 0 : 0) : 0;
        payload.multiplyNumber = allowedFields.includes('multiplyNumber') ? 
          (measurement.multiplyNumber !== null && measurement.multiplyNumber !== undefined ? parseFloat(measurement.multiplyNumber) || 1 : 1) : 1;
        payload.length = allowedFields.includes('length') ? 
          (measurement.length !== null && measurement.length !== undefined ? parseFloat(measurement.length) || 0 : 0) : 0;
        payload.width = allowedFields.includes('width') ? 
          (measurement.width !== null && measurement.width !== undefined ? parseFloat(measurement.width) || 0 : 0) : 0;
        payload.height = allowedFields.includes('height') ? 
          (measurement.height !== null && measurement.height !== undefined ? parseFloat(measurement.height) || 0 : 0) : 0;
        
        // Recalculate quantity based on current unit type
        payload.quantity = parseFloat(calculateQuantity(payload)) || 0;
      }

      return fetch(`${API_BASE_URL}/api/txn-items-mts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    });

    await Promise.all(pastePromises);
    
    setLastPasteTimestamp(data.timestamp);
    
    fetchMeasurements();
    showNotification(`Successfully pasted ${data.measurements.length} measurements`, 'success');
    setContextMenu({ show: false, x: 0, y: 0 });
    
    setClipboardStatus({ hasData: false, count: 0 });
    
  } catch (error) {
    console.error('Paste failed:', error);
    showNotification('Failed to paste measurements', 'error');
  } finally {
    setSaving(false);
  }
};
  const handleClearClipboard = () => {
    localStorage.removeItem(CLIPBOARD_KEY);
    setClipboardStatus({ hasData: false, count: 0 });
    setLastPasteTimestamp(null);
    showNotification('Clipboard cleared', 'success');
  };

 const handleCopySelected = () => {
  if (selectedMeasurements.size === 0) return;
  
  const selectedData = measurements.filter(m => selectedMeasurements.has(m.id));
  const currentUnitType = getUnitType(unitLabel);
  const allowedFields = getFieldsForUnit(unitLabel);
  
  // Filter data to include only relevant fields for current unit type
  const filteredData = selectedData.map(measurement => {
    // Check if this is a "Same as Above" measurement based on description
    const isSameAsAbove = isSameAsAboveMeasurement(measurement);
    
    const filtered = {
      description: measurement.description,
      floorLiftRise: measurement.floorLiftRise,
      isSameAsAbove: isSameAsAbove, // Mark as special measurement
      originalQuantity: isSameAsAbove ? measurement.quantity : null // Preserve original quantity
    };
    
    // For "Same as Above" measurements, store the actual values but mark them as special
    // For regular measurements, process normally
    if (allowedFields.includes('number')) {
      filtered.number = measurement.number;
    }
    if (allowedFields.includes('multiplyNumber')) {
      filtered.multiplyNumber = measurement.multiplyNumber;
    }
    if (allowedFields.includes('length')) {
      filtered.length = measurement.length;
    }
    if (allowedFields.includes('width')) {
      filtered.width = measurement.width;
    }
    if (allowedFields.includes('height')) {
      filtered.height = measurement.height;
    }
    
    return filtered;
  });
  
  const clipboardData = {
    type: 'measurement_data',
    measurements: filteredData,
    sourceUnit: unitLabel,
    timestamp: Date.now()
  };

  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
    showNotification(`Copied ${selectedData.length} measurements (${currentUnitType} fields only)`, 'success');
    checkClipboardStatus();
    setContextMenu({ show: false, x: 0, y: 0 });
  } catch (error) {
    console.error('Copy failed:', error);
    showNotification('Failed to copy measurements', 'error');
  }
};

  const handleDeleteSelected = () => {
    if (selectedMeasurements.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedMeasurements.size} selected measurements?`)) {
      return;
    }
    
    const deletePromises = Array.from(selectedMeasurements).map(id => 
  fetch(`${API_BASE_URL}/api/txn-items-mts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    Promise.all(deletePromises)
      .then(() => {
        fetchMeasurements();
        setSelectedMeasurements(new Set());
        showNotification(`Deleted ${selectedMeasurements.size} measurements`, 'success');
      })
      .catch(err => {
        console.error('Bulk delete failed:', err);
        showNotification('Failed to delete some measurements', 'error');
      });
    
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  // Enhanced calculations with proper error handling
 
  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Enhanced field labels based on unit type
 const getFieldLabel = (field) => {
  const unitType = getUnitType(formData.unit || unitLabel);
  
  const labels = {
    number: 'Number',
    multiplyNumber: 'Multiply',
    length: unitType === 'RMT' ? 'Length (m)' : unitType === 'SQM' ? 'Length (m)' : 'Length (m)',
    width: unitType === 'RMT' ? 'Width (m)' : unitType === 'SQM' ? 'Width/Breadth (m)' : unitType === 'CUM' ? 'Width (m)' : 'Width/Breadth (m)',
    height: unitType === 'RMT' ? 'Height (m)' : unitType === 'SQM' ? 'Height/Depth (m)' : unitType === 'CUM' ? 'Height (m)' : 'Height/Depth (m)'
  };
  
  return labels[field] || field;
};

  const getFieldPlaceholder = (field) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    
    if (field === 'number') return 'Enter number';
    if (field === 'multiplyNumber') return 'Default: 1';
    
    if (!isFieldEnabled(field)) {
      return `Not required for ${unitType}`;
    }
    
    const placeholders = {
      length: 'Length in meters',
      width: 'Width in meters',
      height: 'Height in meters'
    };
    
    return placeholders[field] || `Enter ${field}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading measurements...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Measurements</h3>
            <p className="text-red-600 text-sm mt-1">{apiError}</p>
            <button
              onClick={fetchMeasurements}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Single Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-yellow-500 text-white'
        }`}>
          <div className="flex items-center">
            <FontAwesomeIcon 
              icon={notification.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="mr-2" 
            />
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
     <div className="flex justify-between items-center p-4 border-b border-gray-200">
  <div className="flex items-center space-x-4">
    
   
    <h3 className="text-lg font-semibold text-gray-800">
      Measurements ({measurements.length})
    </h3>
    
    {/* Enhanced Selection Indicator */}
    {selectedMeasurements.size > 0 && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <FontAwesomeIcon icon={faCheckSquare} />
              <span>{selectedMeasurements.size} selected</span>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={handleCopySelected}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Copy selected measurements (Ctrl+C)"
                >
                  <FontAwesomeIcon icon={faCopy} className="text-sm" />
                </button>
                {/* <button
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-800 p-1 rounded"
                  title="Delete selected measurements"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-sm" />
                </button> */}
              </div>
            </div>
          )}
          
          {/* Summary Stats */}
            <div className="flex items-center space-x-6 text-sm">
      
    </div>
  </div>
  
  <div className="flex items-center space-x-2">
          {/* Clipboard Status */}
         {clipboardStatus.hasData && (
      <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
        <FontAwesomeIcon icon={faClipboard} />
        <span className="font-medium">{clipboardStatus.count} ready to paste</span>
        <button
          onClick={handlePasteFromClipboard}
          className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          title="Paste measurements (Ctrl+V)"
        >
          <FontAwesomeIcon icon={faPaste} className="mr-1" />
          Paste
        </button>
        <button
          onClick={handleClearClipboard}
          className="text-green-500 hover:text-green-700 p-1"
          title="Clear clipboard"
        >
          <FontAwesomeIcon icon={faTimes} className="text-xs" />
        </button>
      </div>
    )}{!showInput && (
      <button
        onClick={handleOpenInlineForm}
        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm flex items-center space-x-1"
        title="Add New Measurement"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Add</span>
      </button>
    )}
    
    {/* Same as Above Button - Only show if there are items in current subwork */}
    {currentSubworkItems.length > 0 && (
      <button
        onClick={() => setShowSameAsAboveForm(!showSameAsAboveForm)}
        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm flex items-center space-x-1"
        title="Same as Above"
      >
        <FontAwesomeIcon icon={faCopy} />
        <span>Same as Above</span>
      </button>
    )}
 
         {/* Help/Instructions Button */}
    <button
      onClick={() => setShowInstructions(!showInstructions)}
      className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm"
      title="Show copy-paste instructions"
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="mr-1" />
      Help
    </button>
          
          {/* Paste Guide Toggle */}
         {clipboardStatus.hasData && (
      <button
        onClick={() => setShowPasteGuide(!showPasteGuide)}
        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 border border-blue-200"
        title="Show paste guide"
      >
        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
        Paste Guide
      </button>
    )}
  </div>
</div>
{showInstructions && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
    <div className="flex items-start space-x-3">
      <div className="bg-blue-100 p-2 rounded-full">
        <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 text-lg" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-blue-900 mb-3">How to Copy & Paste Measurements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium text-blue-800">Select measurements to copy:</p>
                <p className="text-blue-700">✓ Click checkboxes next to measurements</p>
                <p className="text-blue-700">✓ Use "Select All" checkbox in header</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium text-blue-800">Copy selected measurements:</p>
                <p className="text-blue-700">✓ Right-click table → "Copy Selected"</p>
                <p className="text-blue-700">✓ Use quick copy button when selected</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium text-green-800">Paste measurements:</p>
                <p className="text-green-700">✓ Right-click table → "Paste"</p>
                <p className="text-green-700">✓ Use green "Paste" button</p>
                <p className="text-green-700">✓ Press Ctrl+V anywhere</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <p className="text-yellow-800 text-xs">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                Note: Measurements adapt to current unit type when pasted
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setShowInstructions(false)}
        className="text-blue-500 hover:text-blue-700 p-1"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </div>
)}

      {/* Paste Guide */}
      {showPasteGuide && clipboardStatus.hasData && (
  <div ref={pasteGuideRef} className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 p-4">
    <div className="flex items-start space-x-3">
      <div className="bg-green-100 p-2 rounded-full">
        <FontAwesomeIcon icon={faClipboard} className="text-green-600 text-lg" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-green-900 mb-2">Ready to Paste!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <FontAwesomeIcon icon={faKeyboard} className="text-blue-500" />
            <span>Press <kbd className="px-2 py-1 bg-gray-100 rounded border text-xs">Ctrl+V</kbd></span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <FontAwesomeIcon icon={faMouse} className="text-green-500" />
            <span>Right-click → Paste</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            <FontAwesomeIcon icon={faClipboard} className="text-purple-500" />
            <span>{clipboardStatus.count} measurements</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    {showSameAsAboveForm && (
  <div className="border-b border-gray-200 bg-blue-50 p-4">
    <div className="mb-3">
      <h4 className="text-md font-semibold text-blue-800 flex items-center">
        <FontAwesomeIcon icon={faCopy} className="mr-2" />
        Create "Same as Above" Measurement
      </h4>
      <p className="text-sm text-blue-600 mt-1">
        Create a measurement based on percentage of existing item's total quantity
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Select Item */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Item <span className="text-red-500">*</span>
        </label>
        <select
          value={sameAsAboveForm.selectedItemId}
          onChange={(e) => {
            setSameAsAboveForm(prev => ({ ...prev, selectedItemId: e.target.value }));
            setSameAsAboveErrors(prev => ({ ...prev, selectedItemId: '' }));
          }}
          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            sameAsAboveErrors.selectedItemId ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={saving}
        >
          <option value="">Select Item No.</option>
          {currentSubworkItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.itemNo} (Total Qty: {(item.totalQuantity || 0).toFixed(2)} {item.smallUnit || unitLabel})
            </option>
          ))}
        </select>
        {sameAsAboveErrors.selectedItemId && (
          <p className="text-red-500 text-xs mt-1">{sameAsAboveErrors.selectedItemId}</p>
        )}
      </div>

      {/* Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Percentage (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={sameAsAboveForm.percentage}
          onChange={(e) => {
            setSameAsAboveForm(prev => ({ ...prev, percentage: e.target.value }));
            setSameAsAboveErrors(prev => ({ ...prev, percentage: '' }));
          }}
          placeholder="Enter percentage (1-100)"
          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            sameAsAboveErrors.percentage ? 'border-red-500' : 'border-gray-300'
          }`}
          min="0.01"
          max="100"
          step="0.01"
          disabled={saving}
        />
        {sameAsAboveErrors.percentage && (
          <p className="text-red-500 text-xs mt-1">{sameAsAboveErrors.percentage}</p>
        )}
      </div>

      {/* Preview & Actions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preview & Actions</label>
        <div className="space-y-2">
          {sameAsAboveForm.selectedItemId && sameAsAboveForm.percentage ? (
            <div className="text-sm bg-white p-2 rounded border">
              <div className="text-gray-600">
                Base Qty: {(currentSubworkItems.find(item => item.id === parseInt(sameAsAboveForm.selectedItemId))?.totalQuantity || 0).toFixed(2)}
              </div>
              <div className="font-semibold text-blue-600">
                New Qty: {(
                  (currentSubworkItems.find(item => item.id === parseInt(sameAsAboveForm.selectedItemId))?.totalQuantity || 0) * 
                  (parseFloat(sameAsAboveForm.percentage) || 0) / 100
                ).toFixed(2)} {unitLabel}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic bg-white p-2 rounded border">
              Select item and enter percentage to see preview
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={handleSameAsAboveSubmit}
              disabled={saving || !sameAsAboveForm.selectedItemId || !sameAsAboveForm.percentage || parseFloat(sameAsAboveForm.percentage) <= 0}
              className="flex-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
                  Creating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="mr-1" />
                  Create
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setShowSameAsAboveForm(false);
                setSameAsAboveForm({ selectedItemId: '', percentage: '' });
                setSameAsAboveErrors({});
              }}
              disabled={saving}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Error Message */}
    {sameAsAboveErrors.submit && (
      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
        {sameAsAboveErrors.submit}
      </div>
    )}
  </div>
)}  
        <>
         <div className="overflow-x-auto" ref={tableRef} onContextMenu={handleContextMenu}>
  {measurements.length === 0 ? (
    null
  ) : (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="flex items-center space-x-2">
              {selectedMeasurements.size === 0 ? (
                <button
                  onClick={handleSelectAllAndCopy}
                  className="flex items-center space-x-1 p-1 rounded hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-800"
                  title="Select all measurements and copy"
                >
                  <Copy size={16} />
                  <span className="text-xs font-medium">Copy All</span>
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center space-x-1 p-1 rounded hover:bg-gray-100 transition-colors"
                    title={selectedMeasurements.size === measurements.length ? "Deselect all" : "Select all"}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMeasurements.size === measurements.length && measurements.length > 0}
                      onChange={() => {}} // Handled by onClick
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </button>
                  <button
                    onClick={handleCopySelected}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                    title="Copy selected measurements"
                  >
                    <Copy size={14} />
                    <span>Copy ({selectedMeasurements.size})</span>
                  </button>
                </div>
              )}
              {measurements.length > 0 && selectedMeasurements.size === 0 && (
                <span className="text-xs text-gray-400">
                  ({measurements.length} total)
                </span>
              )}
            </div>
          </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
       
        <span>Description</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        
        <span>No.</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        
        <span>×</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        
        <span>L</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
       
        <span>W</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        
        <span>H</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
       
        <span>Qty ({unitLabel})</span>
      </div>
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        
        <span>Floor Level</span>
      </div>
    </th>
    {currentCompletedRate > 0 && (
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="flex items-center space-x-1">
          
          <span>Amount (₹)</span>
        </div>
      </th>
    )}
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <div className="flex items-center space-x-1">
        <FontAwesomeIcon icon={faCog} />
        <span></span>
      </div>
    </th>
  </tr>
</thead>
               
<tbody className="bg-white divide-y divide-gray-200">
  {measurements.map((m) => {
    const measurementRA = (parseFloat(m.quantity) || 0) * currentCompletedRate;
    const isEditing = inlineEditId === m.id;
    
    return (
      <tr 
        key={m.id}
        className={`hover:bg-gray-50 ${selectedMeasurements.has(m.id) ? 'bg-blue-50' : ''} ${isEditing ? 'bg-yellow-50 border-2 border-yellow-200' : ''}`}
        onDoubleClick={() => !isEditing && handleEdit(m)}
      >
        <td className="px-3 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={selectedMeasurements.has(m.id)}
            onChange={(e) => handleSelectMeasurement(m.id, e)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isEditing}
          />
        </td>
        
        {/* Description */}
        <td className="px-3 py-4 text-sm text-gray-900 max-w-xs">
          {isEditing ? (
           <input
  type="text"
  name="description"
  value={formData.description}
  onChange={handleChange}
  placeholder="Enter measurement description (optional)" // Updated placeholder
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  disabled={saving}
  // Remove the 'required' attribute if it exists
/>
          ) : (
            <span className="truncate" title={m.description}>{m.description}</span>
          )}
        </td>
        
        {/* Number */}
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing ? (
            <input
              type="number"
              value={inlineEditData.number || ''}
              onChange={(e) => handleInlineEditChange('number', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
              min="0"
              disabled={inlineEditSaving}
            />
          ) : (
              displayMeasurementValue(m.number)
          )}
        </td>
        
        {/* Multiply Number */}
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing ? (
            <input
              type="number"
              value={inlineEditData.multiplyNumber || ''}
              onChange={(e) => handleInlineEditChange('multiplyNumber', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
              min="0"
              disabled={inlineEditSaving}
            />
          ) : (
        displayMeasurementValue(m.multiplyNumber)
          )}
        </td>
        
        {/* Length */}
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing ? (
            <input
              type="number"
              value={inlineEditData.length || ''}
              onChange={(e) => handleInlineEditChange('length', e.target.value)}
              className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isInlineFieldEnabled('length', inlineEditData.unit) ? 'bg-gray-100 text-gray-500' : ''
              }`}
              step="any"
              min="0"
              disabled={inlineEditSaving || !isInlineFieldEnabled('length', inlineEditData.unit)}
            />
          ) : (
         displayMeasurementValue(m.length)
          )}
        </td>
        
        {/* Width */}
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing ? (
            <input
              type="number"
              value={inlineEditData.width || ''}
              onChange={(e) => handleInlineEditChange('width', e.target.value)}
              className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isInlineFieldEnabled('width', inlineEditData.unit) ? 'bg-gray-100 text-gray-500' : ''
              }`}
              step="any"
              min="0"
              disabled={inlineEditSaving || !isInlineFieldEnabled('width', inlineEditData.unit)}
            />
          ) : (
             displayMeasurementValue(m.width)
          )}
        </td>
        
        
        {/* Height */}
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing ? (
            <input
              type="number"
              value={inlineEditData.height || ''}
              onChange={(e) => handleInlineEditChange('height', e.target.value)}
              className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !isInlineFieldEnabled('height', inlineEditData.unit) ? 'bg-gray-100 text-gray-500' : ''
              }`}
              step="any"
              min="0"
              disabled={inlineEditSaving || !isInlineFieldEnabled('height', inlineEditData.unit)}
            />
          ) : (
           displayMeasurementValue(m.height)
          )}
        </td>
        
        {/* Quantity */}
         <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {isEditing ? (
            <input
              type="text"
              value={inlineEditData.quantity || ''}
              className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-gray-600"
              readOnly
            />
          ) : (
            parseFloat(m.quantity).toFixed(2)
          )}
        </td>
        
        {/* Floor Level */} <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
          {isEditing && multifloor ? (
            <select
              value={inlineEditData.floorLiftRise || ''}
              onChange={(e) => handleInlineEditChange('floorLiftRise', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={inlineEditSaving}
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.floorLevel}
                </option>
              ))}
            </select>
          ) : isEditing && !multifloor ? (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
              {m.floorLiftRise || '-'}
            </span>
          ) : (
            m.floorLiftRise || '-'
          )}
        </td>
        
        {/* Amount Column */}
        {currentCompletedRate > 0 && (
          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-green-600">
            {formatCurrency(measurementRA)}
          </td>
        )}
        
        {/* Actions */}
        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleInlineEditSave(m.id)}
                  className="text-green-600 hover:text-green-900 px-2 py-1 bg-green-100 rounded text-xs"
                  disabled={inlineEditSaving}
                  title="Save changes"
                >
                  {inlineEditSaving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-1"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="mr-1" />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleInlineEditCancel}
                  className="text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-100 rounded text-xs"
                  disabled={inlineEditSaving}
                  title="Cancel editing"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(m)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit (or double-click row)"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-600 hover:text-red-900"
                  disabled={deletingId === m.id}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
                {/* Table Footer with Totals */}
                <tfoot className="bg-gray-50">
  <tr>
    <td colSpan="7" className="px-3 py-3 text-right font-semibold text-gray-900">
      Total:
    </td>
    <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
      {totalQuantity.toFixed(2)} {unitLabel}
    </td>
    <td className="px-3 py-3"></td> {/* Floor Level column */}
    {currentCompletedRate > 0 && (
      <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-green-600">
        {formatCurrency(totalRA)}
      </td>
    )}
    <td className="px-3 py-3"></td> {/* Actions column */}
  </tr>
</tfoot>
              </table>
            )}
          </div>
          {/* Inline Form */}
          {showInput && (
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <form onSubmit={(e) => { e.preventDefault(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description 
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter measurement description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      
                      disabled={saving}
                    />
                  </div>

                  {/* Unit Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={unitLabel}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      readOnly
                    />
                  </div>

              {multifloor && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Floor Level {multifloor === 1 && '*'}
    </label>
    <select
      name="floorLiftRise"
      value={selectedFloor}
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required={multifloor === 1}
      disabled={saving}
    >
      <option value="">Select Floor Level</option>
      {floors.map((floor) => (
        <option key={floor.id} value={floor.id}>
          {floor.floorLevel}
        </option>
      ))}
    </select>
  </div>
)}
                </div>

                {/* Measurement Fields */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  {/* Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('number')} *
                    </label>
                    <input
                      type="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder={getFieldPlaceholder('number')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="any"
                      min="0"
                      disabled={saving}
                      required
                    />
                  </div>

                  {/* Multiply Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('multiplyNumber')}
                    </label>
                    <input
                      type="number"
                      name="multiplyNumber"
                      value={formData.multiplyNumber}
                      onChange={handleChange}
                      placeholder={getFieldPlaceholder('multiplyNumber')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="any"
                      min="0"
                      disabled={saving}
                    />
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('length')}
                      {isFieldEnabled('length') && ' *'}
                    </label>
                   <input
  type="number"
  name="length"
  value={formData.length}
  onChange={handleChange}
  placeholder={getFieldPlaceholder('length')}
  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    !isFieldEnabled('length') ? 'bg-gray-100 text-gray-500' : ''
  }`}
  step="any"
  min="0"
  disabled={saving || !isFieldEnabled('length')}
  required={getUnitType(formData.unit || unitLabel) === 'SQM'} // Only required for SQM
/>
                  </div>

                  {/* Width */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('width')}
                      {isFieldEnabled('width') && ' *'}
                    </label>
                    <input
  type="number"
  name="width"
  value={formData.width}
  onChange={handleChange}
  placeholder={getFieldPlaceholder('width')}
  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    !isFieldEnabled('width') ? 'bg-gray-100 text-gray-500' : ''
  }`}
  step="any"
  min="0"
  disabled={saving || !isFieldEnabled('width')}
  required={false} // Not individually required for RMT/SQM, but at least one dimension needed
/>

                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {getFieldLabel('height')}
                      {isFieldEnabled('height') && ' *'}
                    </label>
                    <input
  type="number"
  name="height"
  value={formData.height}
  onChange={handleChange}
  placeholder={getFieldPlaceholder('height')}
  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    !isFieldEnabled('height') ? 'bg-gray-100 text-gray-500' : ''
  }`}
  step="any"
  min="0"
  disabled={saving || !isFieldEnabled('height')}
  required={getUnitType(formData.unit || unitLabel) === 'CUM'} // Required for CUM
/>
                  </div>

                  {/* Calculated Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      value={formData.quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                      readOnly
                    />
                  </div>
                </div>

                {/* Error Message */}
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">{formError}</span>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
               <div className="flex items-center justify-between">
  {/* Autosave status display */}
  <div className="flex items-center space-x-2">
    {autoSaveStatus.saving && (
      <div className="flex items-center text-blue-600 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b border-blue-600 mr-2"></div>
        <span>Auto-saving...</span>
      </div>
    )}
    {autoSaveStatus.saved && (
      <div className="flex items-center text-green-600 text-sm">
        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
        <span>Auto-saved successfully</span>
      </div>
    )}
    {autoSaveStatus.error && (
      <div className="flex items-center text-red-600 text-sm">
        <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
        <span>Auto-save failed</span>
      </div>
    )}
    {!autoSaveStatus.saving && !autoSaveStatus.saved && !autoSaveStatus.error && (
      <div className="flex items-center text-gray-500 text-sm">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        <span>Changes auto-save when quantity is calculated</span>
      </div>
    )}
  </div>
</div>

      </form>
    </div>
          )}

          {/* Measurements Table */}
        
        </>
      

      {/* Context Menu */}
      {contextMenu.show && (
  <div
    ref={contextMenuRef}
    className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 min-w-48"
    style={{ left: contextMenu.x, top: contextMenu.y }}
  >
    {selectedMeasurements.size > 0 && (
      <>
        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Selected Actions
        </div>
        <button
          onClick={handleCopySelected}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3"
        >
          <FontAwesomeIcon icon={faCopy} className="text-blue-500" />
          <span>Copy Selected</span>
          <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
            {selectedMeasurements.size}
          </span>
        </button>
        <button
          onClick={handleDeleteSelected}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center space-x-3"
        >
          <FontAwesomeIcon icon={faTrash} className="text-red-500" />
          <span>Delete Selected</span>
          <span className="ml-auto bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
            {selectedMeasurements.size}
          </span>
        </button>
        <div className="border-t border-gray-200 my-1"></div>
      </>
    )}
    
    {clipboardStatus.hasData && (
      <>
        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
          Clipboard Actions
        </div>
        <button
          onClick={handlePasteFromClipboard}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center space-x-3"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faPaste} className="text-green-500" />
          <span>Paste Measurements</span>
          <span className="ml-auto bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
            {clipboardStatus.count}
          </span>
        </button>
        <button
          onClick={handleClearClipboard}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-3"
        >
          <FontAwesomeIcon icon={faTimes} className="text-gray-500" />
          <span>Clear Clipboard</span>
        </button>
      </>
    )}
    
    {selectedMeasurements.size === 0 && !clipboardStatus.hasData && (
      <div className="px-4 py-3 text-sm text-gray-500 text-center">
        <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
        Select measurements to see copy options
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default MeasurementTable;