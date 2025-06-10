import React, { useEffect, useState, useRef } from 'react';
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
  faExclamationTriangle,
  faFileText,
  faQuestionCircle,
  faKeyboard,
  faMouse,
  faChevronDown,
  faChevronRight,
  faCalculator,
  faRupeeSign
} from '@fortawesome/free-solid-svg-icons';

const MeasurementTable = ({ 
  itemId, 
  token, 
  unitLabel = "Cu.M.", 
  multifloor = false, 
  itemsFromParent = [], 
  onMeasurementDrop,
  
  completedRate = 0 // Add completedRate prop
}) => {
  const [measurements, setMeasurements] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedMeasurements, setSelectedMeasurements] = useState(new Set());
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [clipboardStatus, setClipboardStatus] = useState({ hasData: false, count: 0 });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showPasteGuide, setShowPasteGuide] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastPasteTimestamp, setLastPasteTimestamp] = useState(null);
  
  const contextMenuRef = useRef(null);
  const tableRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const pasteGuideRef = useRef(null);
  
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

  // Auto-save function with delay
  const autoSave = (data) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      if (editId && data.description.trim()) {
        try {
          const payload = {
            id: editId,
            description: data.description.trim(),
            number: parseFloat(data.number) || 0,
            multiplyNumber: parseFloat(data.multiplyNumber) || 1,
            length: parseFloat(data.length) || 0,
            width: parseFloat(data.width) || 0,
            height: parseFloat(data.height) || 0,
            quantity: parseFloat(data.quantity) || 0,
            unit: data.unit || unitLabel,
            fkTxnItemId: parseInt(itemId),
            floorLiftRise: data.floorLiftRise || null
          };

          await fetch(`https://24.101.103.87:8082/api/txn-items-mts/${editId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          
          if (!notification.show) {
            showNotification('Auto-saved', 'success');
          }
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }
    }, 2000);

    setAutoSaveTimeout(timeout);
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
    const number = parseFloat(data.number) || 0;
    const multiplyNumber = parseFloat(data.multiplyNumber) || 1;
    const length = parseFloat(data.length) || 0;
    const width = parseFloat(data.width) || 0;
    const height = parseFloat(data.height) || 0;
    
    const unitType = getUnitType(data.unit || unitLabel);
    
    switch (unitType) {
      case 'NOS':
        return number > 0 ? (number * multiplyNumber).toFixed(2) : '';
      case 'RMT':
        return (number > 0 && length > 0) ? (number * multiplyNumber * length).toFixed(2) : '';
      case 'SQM':
        const area = width > 0 ? width : height;
        return (number > 0 && length > 0 && area > 0) ? (number * multiplyNumber * length * area).toFixed(2) : '';
      case 'CUM':
      default:
        return (number > 0 && length > 0 && width > 0 && height > 0) ? 
          (number * multiplyNumber * length * width * height).toFixed(2) : '';
    }
  };

  // Check which fields should be enabled based on unit type
  const isFieldEnabled = (fieldName) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    
    switch (unitType) {
      case 'NOS':
        return fieldName === 'number' || fieldName === 'multiplyNumber';
      case 'RMT':
        return ['number', 'multiplyNumber', 'length'].includes(fieldName);
      case 'SQM':
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
        return [...baseFields, 'length'];
      case 'SQM':
        return [...baseFields, 'length', 'width', 'height'];
      case 'CUM':
      default:
        return [...baseFields, 'length', 'width', 'height'];
    }
  };

  // Form handling with auto-save
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(name)) {
        updated.quantity = calculateQuantity(updated);
      }
      
      if (editId) {
        autoSave(updated);
      }
      
      return updated;
    });
    setFormError("");
  };

  // Fetch measurements from API
  const fetchMeasurements = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(
        `https://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`,
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
    if (!multifloor) return;
    
    try {
      const res = await fetch(
        "https://24.101.103.87:8082/api/v1/building-floor-adjustments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error(`API responded with status ${res.status}`);
      const data = await res.json();
      setFloors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load floors:", err);
    }
  };

  useEffect(() => {
    if (itemId && token) {
      fetchMeasurements();
      fetchFloors();
    }
  }, [itemId, token, multifloor]);

  // Open inline form
  const handleOpenInlineForm = () => {
    setShowInput(true);
  };

  // Validation
  const validate = () => {
    if (!formData.description.trim()) return "Description is required.";
    
    if (
      measurements.some(
        m => m.description.trim().toLowerCase() === formData.description.trim().toLowerCase() &&
             m.id !== editId
      )
    ) return "Duplicate measurement description is not allowed.";
    
    return "";
  };

  // Save function
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    setSaving(true);
    setFormError("");
    
    const payload = {
      id: editId || 0,
      description: formData.description.trim(),
      number: parseFloat(formData.number) || 0,
      multiplyNumber: parseFloat(formData.multiplyNumber) || 1,
      length: parseFloat(formData.length) || 0,
      width: parseFloat(formData.width) || 0,
      height: parseFloat(formData.height) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      unit: formData.unit || unitLabel,
      fkTxnItemId: parseInt(itemId),
      floorLiftRise: formData.floorLiftRise || null
    };
    
    const method = editId ? 'PUT' : 'POST';
    const url = `https://24.101.103.87:8082/api/txn-items-mts${editId ? '/' + editId : ''}`;
    
    try {
      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`API responded with status ${resp.status}: ${errorText}`);
      }
      
      resetForm();
      fetchMeasurements();
      showNotification(
        editId ? 'Measurement updated successfully' : 'Measurement added successfully',
        'success'
      );
    } catch (err) {
      console.error('Save error:', err);
      setFormError("Failed to save measurement. Please check your data and try again.");
      showNotification('Failed to save measurement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setShowInput(true);
    setFormError("");
    
    setFormData({
      description: m.description,
      number: m.number,
      multiplyNumber: m.multiplyNumber || 1,
      length: m.length,
      width: m.width,
      height: m.height,
      quantity: m.quantity,
      unit: m.unit || unitLabel,
      floorLiftRise: m.floorLiftRise || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) return;
    
    setDeletingId(id);
    try {
      const resp = await fetch(`https://24.101.103.87:8082/api/txn-items-mts/${id}`, {
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
    setShowInput(false);
    setEditId(null);
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

  // ENHANCED PASTE FUNCTION - Unit-wise field filtering
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
      
      // Create paste payload for each measurement with unit-wise field filtering
      const pastePromises = data.measurements.map(measurement => {
        // Get current unit type and determine which fields to use
        const currentUnitType = getUnitType(unitLabel);
        const allowedFields = getFieldsForUnit(unitLabel);
        
        // Create payload with only allowed fields for current unit
        const payload = {
          id: 0,
          description: measurement.description,
          number: allowedFields.includes('number') ? (parseFloat(measurement.number) || 0) : 0,
          multiplyNumber: allowedFields.includes('multiplyNumber') ? (parseFloat(measurement.multiplyNumber) || 1) : 1,
          length: allowedFields.includes('length') ? (parseFloat(measurement.length) || 0) : 0,
          width: allowedFields.includes('width') ? (parseFloat(measurement.width) || 0) : 0,
          height: allowedFields.includes('height') ? (parseFloat(measurement.height) || 0) : 0,
          quantity: 0, // Will be calculated on server side
          unit: unitLabel, // Use current unit, not the copied unit
          fkTxnItemId: parseInt(itemId),
          floorLiftRise: measurement.floorLiftRise || null
        };
        
        // Recalculate quantity based on current unit type
        payload.quantity = parseFloat(calculateQuantity(payload)) || 0;

        return fetch('https://24.101.103.87:8082/api/txn-items-mts', {
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

  // ENHANCED COPY FUNCTION - Unit-wise field filtering
  const handleCopySelected = () => {
    if (selectedMeasurements.size === 0) return;
    
    const selectedData = measurements.filter(m => selectedMeasurements.has(m.id));
    const currentUnitType = getUnitType(unitLabel);
    const allowedFields = getFieldsForUnit(unitLabel);
    
    // Filter data to include only relevant fields for current unit type
    const filteredData = selectedData.map(measurement => {
      const filtered = {
        description: measurement.description,
        floorLiftRise: measurement.floorLiftRise
      };
      
      // Only include fields that are relevant for the current unit type
      if (allowedFields.includes('number')) filtered.number = measurement.number;
      if (allowedFields.includes('multiplyNumber')) filtered.multiplyNumber = measurement.multiplyNumber;
      if (allowedFields.includes('length')) filtered.length = measurement.length;
      if (allowedFields.includes('width')) filtered.width = measurement.width;
      if (allowedFields.includes('height')) filtered.height = measurement.height;
      
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
      fetch(`https://24.101.103.87:8082/api/txn-items-mts/${id}`, {
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
  const totalQuantity = measurements.reduce((sum, m) => {
    const quantity = parseFloat(m.quantity) ;
    return sum + quantity;
  }, 0);

  // Enhanced RA calculation with proper formatting
  const currentCompletedRate = parseFloat(completedRate) ;
  const totalRA = totalQuantity * currentCompletedRate;

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
      width: unitType === 'SQM' ? 'Width (m)' : unitType === 'CUM' ? 'Width (m)' : 'Width/Breadth (m)',
      height: unitType === 'SQM' ? 'Height (m)' : unitType === 'CUM' ? 'Height (m)' : 'Height/Depth (m)'
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
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-800 p-1"
            title={isCollapsed ? "Expand measurements" : "Collapse measurements"}
          >
            <FontAwesomeIcon 
              icon={isCollapsed ? faChevronRight : faChevronDown} 
              className="text-lg"
            />
          </button>
         <h3 className="text-lg font-semibold text-gray-800">
            Measurements ({measurements.length})
          </h3>
          
          {/* Summary Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1 text-blue-600">
              <FontAwesomeIcon icon={faCalculator} className="text-xs" />
              <span>Total: {totalQuantity.toFixed(2)} {unitLabel}</span>
            </div>
            {currentCompletedRate > 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <FontAwesomeIcon icon={faRupeeSign} className="text-xs" />
                <span>RA: {formatCurrency(totalRA)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Clipboard Status */}
          {clipboardStatus.hasData && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
              <FontAwesomeIcon icon={faClipboard} />
              <span>{clipboardStatus.count} copied</span>
              <button
                onClick={handleClearClipboard}
                className="ml-1 text-blue-500 hover:text-blue-700"
                title="Clear clipboard"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xs" />
              </button>
            </div>
          )}
          
          {/* Paste Guide Toggle */}
          {clipboardStatus.hasData && (
            <button
              onClick={() => setShowPasteGuide(!showPasteGuide)}
              className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100"
              title="Show paste guide"
            >
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-1" />
              Guide
            </button>
          )}
          
          <button
            onClick={handleOpenInlineForm}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center space-x-1 text-sm"
            disabled={saving}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Paste Guide */}
      {showPasteGuide && clipboardStatus.hasData && (
        <div ref={pasteGuideRef} className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-start space-x-2">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Quick Paste Guide:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faKeyboard} className="text-blue-500" />
                  <span>Press <kbd className="px-1 py-0.5 bg-white rounded border">Ctrl+V</kbd> anywhere to paste</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faMouse} className="text-blue-500" />
                  <span>Right-click on table for context menu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faFileText} className="text-blue-500" />
                  <span>{clipboardStatus.count} measurements ready to paste</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <>
          {/* Inline Form */}
          {showInput && (
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter measurement description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
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

                  {/* Floor/Lift/Rise (if multifloor) */}
                  {multifloor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor/Lift/Rise
                      </label>
                      <select
                        name="floorLiftRise"
                        value={formData.floorLiftRise}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={saving}
                      >
                        <option value="">Select Floor</option>
                        {floors.map(floor => (
                          <option key={floor.id} value={floor.floorName}>
                            {floor.floorName}
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
                      required={isFieldEnabled('length')}
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
                      required={isFieldEnabled('width')}
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
                      required={isFieldEnabled('height')}
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
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={saving ? faCheck : faSave} />
                    <span>{saving ? 'Saving...' : (editId ? 'Update' : 'Save')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Measurements Table */}
          <div className="overflow-x-auto" ref={tableRef} onContextMenu={handleContextMenu}>
            {measurements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faFileText} className="text-4xl mb-2" />
                <p>No measurements added yet</p>
                <p className="text-sm">Click "Add" button to create your first measurement</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
  <tr>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <input
        type="checkbox"
        onChange={handleSelectAll}
        checked={selectedMeasurements.size === measurements.length && measurements.length > 0}
        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Description
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      No.
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      ×
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      L
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      W
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      H
    </th>
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Qty ({unitLabel})
    </th>
    {multifloor && (
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Floor
      </th>
    )}
    {currentCompletedRate > 0 && (
      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        RA Amount (₹)
      </th>
    )}
    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      Actions
    </th>
  </tr>
</thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {measurements.map((m) => {
                    const measurementRA = (parseFloat(m.quantity) || 0) * currentCompletedRate;
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
                          {parseFloat(m.quantity).toFixed(2)}
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
                </tbody>
                {/* Table Footer with Totals */}
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={multifloor ? 8 : 7} className="px-3 py-3 text-right font-semibold text-gray-900">
                      Total:
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                      {totalQuantity.toFixed(2)} {unitLabel}
                    </td>
                    {multifloor && <td></td>}
                    {currentCompletedRate > 0 && (
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(totalRA)}
                      </td>
                    )}
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {selectedMeasurements.size > 0 && (
            <>
              <button
                onClick={handleCopySelected}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faCopy} />
                <span>Copy Selected ({selectedMeasurements.size})</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete Selected ({selectedMeasurements.size})</span>
              </button>
              <div className="border-t border-gray-200 my-1"></div>
            </>
          )}
          {clipboardStatus.hasData && (
            <button
              onClick={handlePasteFromClipboard}
              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faClipboard} />
              <span>Paste ({clipboardStatus.count}) measurements</span>
            </button>
          )}
          {clipboardStatus.hasData && (
            <button
              onClick={handleClearClipboard}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faTimes} />
              <span>Clear Clipboard</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementTable;