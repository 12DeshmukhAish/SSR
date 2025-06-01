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
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const MeasurementTable = ({ itemId, token, unitLabel = "Cu.M.", multifloor = false, itemsFromParent = [], onMeasurementDrop }) => {
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
  const [clipboardStatus, setClipboardStatus] = useState({ hasData: false, count: 0, source: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  
  const contextMenuRef = useRef(null);
  const tableRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  
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
  const CLIPBOARD_KEY = 'measurementClipboard_v2';
  
  // Show notification helper
  const showNotification = (message, type = 'success') => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setNotification({ show: true, message, type });
    
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Enhanced clipboard status check
  const checkClipboardStatus = () => {
    try {
      const clipboardData = localStorage.getItem(CLIPBOARD_KEY);
      if (clipboardData) {
        const data = JSON.parse(clipboardData);
        if (data.type === 'measurement_reference' && data.measurements && Array.isArray(data.measurements)) {
          // Check if data is not too old (24 hours)
          const isRecent = (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000;
          if (isRecent) {
            setClipboardStatus({
              hasData: true,
              count: data.measurements.length,
              source: data.sourceItemName || `Item ${data.sourceItemId}`,
              timestamp: data.timestamp
            });
            return;
          } else {
            // Clean up old data
            localStorage.removeItem(CLIPBOARD_KEY);
          }
        }
      }
    } catch (error) {
      console.warn('Error checking clipboard:', error);
      localStorage.removeItem(CLIPBOARD_KEY);
    }
    
    setClipboardStatus({ hasData: false, count: 0, source: null });
  };

  // Enhanced clipboard monitoring
  useEffect(() => {
    checkClipboardStatus();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === CLIPBOARD_KEY) {
        checkClipboardStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for same-tab updates
    const interval = setInterval(checkClipboardStatus, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu({ show: false, x: 0, y: 0 });
      }
    };

    if (contextMenu.show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.show]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // Only handle shortcuts when focused on table area
      if (!tableRef.current?.contains(document.activeElement) && document.activeElement?.tagName !== 'BODY') {
        return;
      }

      // Ctrl+C - Copy selected measurements
      if (e.ctrlKey && e.key === 'c' && selectedMeasurements.size > 0) {
        e.preventDefault();
        handleCopyAsReference();
      }
      
      // Ctrl+V - Paste measurements
      if (e.ctrlKey && e.key === 'v' && clipboardStatus.hasData) {
        e.preventDefault();
        handlePaste();
      }
      
      // Ctrl+A - Select all measurements
      if (e.ctrlKey && e.key === 'a' && measurements.length > 0) {
        e.preventDefault();
        const allIds = new Set(measurements.map(m => m.id));
        setSelectedMeasurements(allIds);
      }
      
      // Delete - Delete selected measurements
      if (e.key === 'Delete' && selectedMeasurements.size > 0) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape - Clear selection and close menus
      if (e.key === 'Escape') {
        setSelectedMeasurements(new Set());
        setContextMenu({ show: false, x: 0, y: 0 });
        setLastSelectedIndex(null);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [selectedMeasurements, clipboardStatus.hasData, measurements]);

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

  // Group measurements by floor
  const groupedMeasurements = measurements.reduce((acc, record) => {
    const floor = record.floorLiftRise?.trim() || "";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(record);
    return acc;
  }, {});

  // FIXED: Enhanced selection handlers with proper multi-select logic
  const handleSelectMeasurement = (measurementId, event) => {
    event.stopPropagation();
    
    const measurementIds = measurements.map(m => m.id);
    const currentIndex = measurementIds.indexOf(measurementId);
    const newSelected = new Set(selectedMeasurements);
    
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+Click: Toggle individual selection
      if (newSelected.has(measurementId)) {
        newSelected.delete(measurementId);
      } else {
        newSelected.add(measurementId);
      }
      setLastSelectedIndex(currentIndex);
    } else if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift+Click: Select range
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      
      for (let i = start; i <= end; i++) {
        newSelected.add(measurementIds[i]);
      }
    } else {
      // Regular click: Select only this item
      newSelected.clear();
      newSelected.add(measurementId);
      setLastSelectedIndex(currentIndex);
    }
    
    setSelectedMeasurements(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMeasurements.size === measurements.length) {
      setSelectedMeasurements(new Set());
      setLastSelectedIndex(null);
    } else {
      setSelectedMeasurements(new Set(measurements.map(m => m.id)));
      setLastSelectedIndex(measurements.length - 1);
    }
  };

  // Enhanced context menu
  const handleContextMenu = (event) => {
    event.preventDefault();
    
    if (selectedMeasurements.size > 0) {
      setContextMenu({
        show: true,
        x: Math.min(event.clientX, window.innerWidth - 200),
        y: Math.min(event.clientY, window.innerHeight - 150)
      });
    }
  };

  // Enhanced copy as text
  const handleCopyAsText = async () => {
    try {
      const selectedData = measurements.filter(m => selectedMeasurements.has(m.id));
      
      const textContent = selectedData.map((m, index) => {
        const dimensions = [m.length, m.width, m.height].filter(d => d && d > 0).join(' × ');
        const multiplier = m.multiplyNumber && m.multiplyNumber !== 1 ? ` × ${m.multiplyNumber}` : '';
        
        return [
          `${index + 1}. ${m.description}`,
          `   No: ${m.number}${multiplier}`,
          dimensions ? `   Dimensions: ${dimensions}` : '',
          `   Quantity: ${m.quantity} ${m.unit || unitLabel}`,
          m.floorLiftRise ? `   Floor: ${m.floorLiftRise}` : ''
        ].filter(line => line).join('\n');
      }).join('\n\n');

      const finalText = `Measurement Details (${selectedData.length} items)\n${'='.repeat(50)}\n\n${textContent}`;

      await navigator.clipboard.writeText(finalText);
      showNotification(`Copied ${selectedData.length} measurements as text`, 'success');
      
    } catch (err) {
      console.error('Copy failed:', err);
      showNotification('Failed to copy to clipboard', 'error');
    }

    setContextMenu({ show: false, x: 0, y: 0 });
    setSelectedMeasurements(new Set());
    setLastSelectedIndex(null);
  };

  // Enhanced copy as reference
  const handleCopyAsReference = async () => {
    try {
      const selectedData = measurements.filter(m => selectedMeasurements.has(m.id));
      
      const clipboardData = {
        type: 'measurement_reference',
        version: '2.0',
        sourceItemId: itemId,
        sourceItemName: `Item ${itemId}`, // You can pass this as prop if available
        timestamp: Date.now(),
        unitLabel,
        measurements: selectedData.map(m => ({
          description: m.description,
          number: m.number,
          multiplyNumber: m.multiplyNumber || 1,
          length: m.length || 0,
          width: m.width || 0,
          height: m.height || 0,
          quantity: m.quantity,
          unit: m.unit,
          floorLiftRise: m.floorLiftRise || null
        }))
      };

      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
      
      // Also copy as text for external use
      const textData = selectedData.map(m => 
        `${m.description} | ${m.number}${m.multiplyNumber && m.multiplyNumber !== 1 ? `×${m.multiplyNumber}` : ''} | ${[m.length, m.width, m.height].filter(d => d).join('×') || '-'} | ${m.quantity} ${m.unit || unitLabel}`
      ).join('\n');

      await navigator.clipboard.writeText(textData);
      
      checkClipboardStatus();
      showNotification(`Copied ${selectedData.length} measurements for reuse`, 'success');
      
    } catch (err) {
      console.error('Copy failed:', err);
      showNotification('Failed to copy measurements', 'error');
    }

    setContextMenu({ show: false, x: 0, y: 0 });
    setSelectedMeasurements(new Set());
    setLastSelectedIndex(null);
  };

  // Enhanced paste function
  const handlePaste = async () => {
    try {
      const clipboardData = localStorage.getItem(CLIPBOARD_KEY);
      if (!clipboardData) {
        showNotification('No measurements found in clipboard', 'error');
        return;
      }

      const data = JSON.parse(clipboardData);
      if (data.type !== 'measurement_reference' || !data.measurements) {
        showNotification('Invalid clipboard data', 'error');
        return;
      }

      if (data.sourceItemId === itemId) {
        showNotification('Cannot paste to the same item', 'error');
        return;
      }

      setSaving(true);
      const results = [];
      
      for (const measurement of data.measurements) {
        try {
          // Check for duplicate descriptions and auto-rename
          let description = measurement.description;
          let counter = 1;
          while (measurements.some(m => m.description.toLowerCase() === description.toLowerCase())) {
            description = `${measurement.description} (${counter})`;
            counter++;
          }

          const payload = {
            id: 0,
            description,
            number: parseFloat(measurement.number) || 0,
            multiplyNumber: parseFloat(measurement.multiplyNumber) || 1,
            length: parseFloat(measurement.length) || 0,
            width: parseFloat(measurement.width) || 0,
            height: parseFloat(measurement.height) || 0,
            quantity: parseFloat(measurement.quantity) || 0,
            unit: measurement.unit || unitLabel,
            fkTxnItemId: parseInt(itemId),
            floorLiftRise: measurement.floorLiftRise || null
          };

          const response = await fetch('https://24.101.103.87:8082/api/txn-items-mts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            results.push({ success: true, description });
          } else {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            results.push({ success: false, description, error: 'API Error' });
          }
        } catch (err) {
          console.error('Paste error:', err);
          results.push({ success: false, description: measurement.description, error: err.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        fetchMeasurements();
        showNotification(
          failCount > 0 
            ? `Pasted ${successCount} measurements, ${failCount} failed`
            : `Successfully pasted ${successCount} measurements`,
          failCount > 0 ? 'warning' : 'success'
        );

        // Clear clipboard after successful paste
        if (failCount === 0) {
          localStorage.removeItem(CLIPBOARD_KEY);
          checkClipboardStatus();
        }
      } else {
        showNotification('Failed to paste any measurements', 'error');
      }

    } catch (err) {
      console.error('Paste failed:', err);
      showNotification('Paste operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Clear clipboard
  const handleClearClipboard = () => {
    localStorage.removeItem(CLIPBOARD_KEY);
    checkClipboardStatus();
    showNotification('Clipboard cleared', 'success');
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedMeasurements.size === 0) return;
    
    const count = selectedMeasurements.size;
    if (!window.confirm(`Are you sure you want to delete ${count} selected measurement${count > 1 ? 's' : ''}?`)) {
      return;
    }

    setSaving(true);
    const results = [];

    for (const id of selectedMeasurements) {
      try {
        const response = await fetch(`https://24.101.103.87:8082/api/txn-items-mts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        results.push({ id, success: response.ok });
      } catch (err) {
        results.push({ id, success: false });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      fetchMeasurements();
      setSelectedMeasurements(new Set());
      setLastSelectedIndex(null);
      showNotification(
        failCount > 0 
          ? `Deleted ${successCount} measurements, ${failCount} failed`
          : `Deleted ${successCount} measurements`,
        failCount > 0 ? 'warning' : 'success'
      );
    } else {
      showNotification('Failed to delete measurements', 'error');
    }

    setSaving(false);
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
      setMeasurements(Array.isArray(data) ? data : []);
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

  // FIXED: Form handling functions with better validation and error handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(name)) {
        updated.quantity = calculateQuantity(updated);
      }
      return updated;
    });
    setFormError("");
  };

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

  const isFieldRequired = (fieldName) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    
    switch (unitType) {
      case 'NOS':
        return fieldName === 'number';
      case 'RMT':
        return ['number', 'length'].includes(fieldName);
      case 'SQM':
        if (fieldName === 'number' || fieldName === 'length') return true;
        if (fieldName === 'width' || fieldName === 'height') {
          return !formData.width && !formData.height;
        }
        return false;
      case 'CUM':
      default:
        return ['number', 'length', 'width', 'height'].includes(fieldName);
    }
  };

  // FIXED: Enhanced validation with better error messages
  const validate = () => {
    if (!formData.description.trim()) return "Description is required.";
    
    const unitType = getUnitType(formData.unit || unitLabel);
    
    const number = parseFloat(formData.number);
    if (!formData.number || isNaN(number) || number <= 0) {
      return "Number must be a positive value.";
    }
    
    const multiplyNumber = parseFloat(formData.multiplyNumber);
    if (formData.multiplyNumber && (isNaN(multiplyNumber) || multiplyNumber <= 0)) {
      return "Multiply number must be a positive value.";
    }
    
    if (unitType !== 'NOS') {
      const length = parseFloat(formData.length);
      if (!formData.length || isNaN(length) || length <= 0) {
        return "Length must be a positive value.";
      }
    }
    
    if (unitType === 'SQM') {
      const width = parseFloat(formData.width);
      const height = parseFloat(formData.height);
      if ((!formData.width || isNaN(width) || width <= 0) && 
          (!formData.height || isNaN(height) || height <= 0)) {
        return "Either Width or Height must be a positive value for square measurement.";
      }
    } else if (unitType === 'CUM') {
      const width = parseFloat(formData.width);
      const height = parseFloat(formData.height);
      if (!formData.width || isNaN(width) || width <= 0) {
        return "Width must be a positive value for cubic measurement.";
      }
      if (!formData.height || isNaN(height) || height <= 0) {
        return "Height must be a positive value for cubic measurement.";
      }
    }
    
    if (multifloor && !formData.floorLiftRise) return "Floor is required.";
    
    if (
      measurements.some(
        m => m.description.trim().toLowerCase() === formData.description.trim().toLowerCase() &&
             m.id !== editId
      )
    ) return "Duplicate measurement description is not allowed.";
    
    return "";
  };

  // FIXED: Enhanced save function with better error handling
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    
    setSaving(true);
    setFormError("");
    
    // FIXED: Ensure all numeric values are properly parsed and validated
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
      fkTxnItemId: parseInt(itemId), // FIXED: Ensure itemId is an integer
      floorLiftRise: formData.floorLiftRise || null
    };
    
    const method = editId ? 'PUT' : 'POST';
    const url = `https://24.101.103.87:8082/api/txn-items-mts${editId ? '/' + editId : ''}`;
    
    try {
      console.log('Sending payload:', payload); // Debug log
      
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
        console.error('API Error Response:', errorText);
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
      const errorMessage = err.message.includes('API responded') ? 
        `Server error: ${err.message}` : 
        "Failed to save measurement. Please check your data and try again.";
      setFormError(errorMessage);
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

  const handleCancel = () => {
    resetForm();
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

  const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

  const getFieldLabel = (field) => {
    const labels = {
      number: 'No.',
      multiplyNumber: 'Multiply',
      length: 'Length',
      width: 'Width',
      height: 'Height'
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    const base = getFieldLabel(field);
    
    if (field === 'number') return `Enter ${base}`;
    if (field === 'multiplyNumber') return 'Default: 1';
    
    if (unitType === 'NOS') return `${base} (not used)`;
    if (unitType === 'RMT' && field !== 'length') return `${base} (not used)`;
    if (unitType === 'SQM' && !['length', 'width', 'height'].includes(field)) return `${base} (not used)`;
    
    return `Enter ${base}`;
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
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200" ref={tableRef}>
      {/* Header with controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Measurements ({measurements.length})
            </h3>
            <div className="text-sm text-gray-600">
              Total: <span className="font-medium">{totalQuantity.toFixed(2)} {unitLabel}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Selection controls */}
            {measurements.length > 0 && (
              <>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border"
                  title={selectedMeasurements.size === measurements.length ? 'Deselect All' : 'Select All'}
                >
                  {selectedMeasurements.size === measurements.length ? 'Deselect All' : 'Select All'}
                </button>
                
                {selectedMeasurements.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">
                      {selectedMeasurements.size} selected
                    </span>
                    <button
                      onClick={handleCopyAsReference}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md border"
                      title="Copy selected measurements for reuse"
                    >
                      <FontAwesomeIcon icon={faCopy} className="mr-1" />
                      Copy
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md border"
                      title="Delete selected measurements"
                      disabled={saving}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </>
            )}
            
            {/* Clipboard controls */}
            {clipboardStatus.hasData && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                <FontAwesomeIcon icon={faClipboard} className="text-green-600" />
                <span className="text-sm text-green-700">
                  {clipboardStatus.count} items from {clipboardStatus.source}
                </span>
                <button
                  onClick={handlePaste}
                  className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded"
                  disabled={saving}
                >
                  Paste
                </button>
                <button
                  onClick={handleClearClipboard}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
                  title="Clear clipboard"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Add button */}
            <button
              onClick={() => setShowInput(!showInput)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Measurement
            </button>
          </div>
        </div>
      </div>

      {/* Input form */}
      {showInput && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter measurement description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

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
                disabled={saving || !isFieldEnabled('number')}
                step="0.01"
                min="0"
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
                disabled={saving || !isFieldEnabled('multiplyNumber')}
                step="0.01"
                min="0"
              />
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getFieldLabel('length')} {isFieldRequired('length') ? '*' : ''}
              </label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder={getFieldPlaceholder('length')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving || !isFieldEnabled('length')}
                step="0.01"
                min="0"
              />
            </div>

            {/* Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getFieldLabel('width')} {isFieldRequired('width') ? '*' : ''}
              </label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                placeholder={getFieldPlaceholder('width')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving || !isFieldEnabled('width')}
                step="0.01"
                min="0"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {getFieldLabel('height')} {isFieldRequired('height') ? '*' : ''}
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={getFieldPlaceholder('height')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving || !isFieldEnabled('height')}
                step="0.01"
                min="0"
              />
            </div>

            {/* Floor (if multifloor is enabled) */}
            {multifloor && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor *
                </label>
                <select
                  name="floorLiftRise"
                  value={formData.floorLiftRise}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={saving}
                >
                  <option value="">Select Floor</option>
                  {floors.map((floor) => (
                    <option key={floor.id} value={floor.floorLiftRise}>
                      {floor.floorLiftRise}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="Unit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
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
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                placeholder="Auto-calculated"
              />
            </div>
          </div>

          {/* Form error */}
          {formError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{formError}</span>
              </div>
            </div>
          )}

          {/* Form buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              disabled={saving}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {editId ? 'Update' : 'Save'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Measurements table */}
      <div className="overflow-x-auto">
        {measurements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📏</div>
            <p className="text-gray-500">No measurements added yet</p>
            <p className="text-gray-400 text-sm">Click "Add Measurement" to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMeasurements.size === measurements.length && measurements.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Multiply
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Length
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Width
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Height
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                {multifloor && (
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor
                  </th>
                )}
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(multifloor ? Object.entries(groupedMeasurements) : [['', measurements]]).map(([floor, floorMeasurements]) => (
                <React.Fragment key={floor}>
                  {multifloor && floor && (
                    <tr className="bg-blue-50">
                      <td colSpan="12" className="px-3 py-2 text-sm font-medium text-blue-800">
                        Floor: {floor}
                      </td>
                    </tr>
                  )}
                  {floorMeasurements.map((m, index) => (
                    <tr
                      key={m.id}
                      className={`
                        hover:bg-gray-50 cursor-pointer
                        ${selectedMeasurements.has(m.id) ? 'bg-blue-50 border-blue-200' : ''}
                        ${deletingId === m.id ? 'opacity-50' : ''}
                      `}
                      onClick={(e) => handleSelectMeasurement(m.id, e)}
                      onContextMenu={handleContextMenu}
                    >
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedMeasurements.has(m.id)}
                          onChange={(e) => handleSelectMeasurement(m.id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {multifloor ? 
                          floorMeasurements.indexOf(m) + 1 : 
                          measurements.indexOf(m) + 1
                        }
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 font-medium">
                        {m.description}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.number}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.multiplyNumber || 1}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.length || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.width || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.height || '-'}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900 font-medium">
                        {parseFloat(m.quantity).toFixed(2)}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-900">
                        {m.unit}
                      </td>
                      {multifloor && (
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {m.floorLiftRise || '-'}
                        </td>
                      )}
                      <td className="px-3 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(m);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit measurement"
                            disabled={saving}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(m.id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete measurement"
                            disabled={saving || deletingId === m.id}
                          >
                            {deletingId === m.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context menu */}
      {contextMenu.show && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleCopyAsText}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faCopy} className="mr-2" />
            Copy as Text
          </button>
          <button
            onClick={handleCopyAsReference}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faClipboard} className="mr-2" />
            Copy for Reuse
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleBulkDelete}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`
            px-4 py-3 rounded-lg shadow-lg border max-w-sm
            ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
          `}>
            <div className="flex items-center">
              <FontAwesomeIcon 
                icon={
                  notification.type === 'success' ? faCheckCircle :
                  notification.type === 'error' ? faExclamationTriangle :
                  faExclamationTriangle
                } 
                className="mr-2" 
              />
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex flex-wrap gap-4">
          <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+C</kbd> Copy selected</span>
          <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+V</kbd> Paste</span>
          <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl+A</kbd> Select all</span>
          <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">Delete</kbd> Delete selected</span>
          <span><kbd className="px-1 py-0.5 bg-gray-200 rounded">Esc</kbd> Clear selection</span>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTable;