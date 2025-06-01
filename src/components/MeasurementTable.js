import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faEdit, faTimes, faGripVertical } from '@fortawesome/free-solid-svg-icons';

const MeasurementTable = ({ itemId, token, unitLabel = "Cu.M.", multifloor = false, itemsFromParent = [], onMeasurementDrop }) => {
  const [measurements, setMeasurements] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [floors, setFloors] = useState([]);
  const [draggedMeasurement, setDraggedMeasurement] = useState(null);
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

  // Helper function to get unit type
  const getUnitType = (unit = unitLabel) => {
    const normalizedUnit = unit.trim().toUpperCase().replace(/[^A-Z]/g, '');
    
    if (['CUM', 'CUBICMETER', 'CUBICMETRE', 'CM'].includes(normalizedUnit)) return 'CUM';
    if (['SQM', 'SQUAREMETER', 'SQUAREMETRE', 'SM'].includes(normalizedUnit)) return 'SQM';
    if (['RMT', 'RUNNINGMETER', 'RUNNINGMETRE', 'RM'].includes(normalizedUnit)) return 'RMT';
    if (['NOS', 'NO', 'NUMBER', 'NUMBERS', 'PIECE', 'PIECES', 'PCS'].includes(normalizedUnit)) return 'NOS';
    
    // Default fallback - if unit contains cubic/cu, square/sq, running/rmt, or no/nos
    if (normalizedUnit.includes('CU')) return 'CUM';
    if (normalizedUnit.includes('SQ')) return 'SQM';
    if (normalizedUnit.includes('RMT') || normalizedUnit.includes('RUNNING')) return 'RMT';
    if (normalizedUnit.includes('NO')) return 'NOS';
    
    return 'CUM'; // Default to CUM if unable to determine
  };

  // Group measurements by floor
  const groupedMeasurements = measurements.reduce((acc, record) => {
    const floor = record.floorLiftRise?.trim() || "";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(record);
    return acc;
  }, {});

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

  // Recompute quantity on form data change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Update quantity if numeric fields change
      if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(name)) {
        updated.quantity = calculateQuantity(updated);
      }
      return updated;
    });
    setFormError(""); // Clear errors on any field change
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
        // For NOS: Only use number
        return number > 0 ? (number * multiplyNumber).toFixed(2) : '';
        
      case 'RMT':
        // For RMT: Use number × length
        return (number > 0 && length > 0) ? (number * multiplyNumber * length).toFixed(2) : '';
        
      case 'SQM':
        // For SQM: Use number × length × width (or height if width not provided)
        const area = width > 0 ? width : height;
        return (number > 0 && length > 0 && area > 0) ? (number * multiplyNumber * length * area).toFixed(2) : '';
        
      case 'CUM':
      default:
        // For CUM: Use full calculation number × length × width × height
        return (number > 0 && length > 0 && width > 0 && height > 0) ? 
          (number * multiplyNumber * length * width * height).toFixed(2) : '';
    }
  };

  // Field enabling logic based on unit type
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

  // Field requirement logic based on unit type (made more flexible)
  const isFieldRequired = (fieldName) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    
    switch (unitType) {
      case 'NOS':
        return fieldName === 'number';
        
      case 'RMT':
        return ['number', 'length'].includes(fieldName);
        
      case 'SQM':
        // For SQM, require number, length, and at least one of width or height
        if (fieldName === 'number' || fieldName === 'length') return true;
        if (fieldName === 'width' || fieldName === 'height') {
          // At least one of width or height should be provided
          return !formData.width && !formData.height;
        }
        return false;
        
      case 'CUM':
      default:
        return ['number', 'length', 'width', 'height'].includes(fieldName);
    }
  };

  // Validation with flexible requirements
  const validate = () => {
    if (!formData.description.trim()) return "Description is required.";
    
    const unitType = getUnitType(formData.unit || unitLabel);
    
    // Check required fields based on unit type
    if (!formData.number) return "Number is required.";
    
    if (unitType !== 'NOS' && !formData.length) return "Length is required.";
    
    if (unitType === 'SQM') {
      // For SQM, require at least width or height
      if (!formData.width && !formData.height) {
        return "Either Width or Height is required for square measurement.";
      }
    } else if (unitType === 'CUM') {
      // For CUM, require all dimensions
      if (!formData.width) return "Width is required for cubic measurement.";
      if (!formData.height) return "Height is required for cubic measurement.";
    }
    
    if (multifloor && !formData.floorLiftRise) return "Floor is required.";
    
    // Prevent duplicate (except when editing the same record)
    if (
      measurements.some(
        m => m.description.trim().toLowerCase() === formData.description.trim().toLowerCase() &&
             m.id !== editId
      )
    ) return "Duplicate measurement description is not allowed.";
    
    return "";
  };

  // Save (add or update)
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
      fkTxnItemId: itemId,
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
      
      if (!resp.ok) throw new Error(`API responded with status ${resp.status}`);
      
      resetForm();
      fetchMeasurements();
    } catch (err) {
      setFormError("Failed to save measurement. Try again.");
    } finally {
      setSaving(false);
    }
  };

  // Edit measurement
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

  // Delete measurement
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
    } catch {
      setApiError("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Reset/cancel input
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

  // Drag and Drop handlers
  const handleDragStart = (e, measurement) => {
    setDraggedMeasurement(measurement);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      measurement,
      sourceItemId: itemId
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedMeasurement(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { measurement, sourceItemId } = data;
      
      // If dropping on the same item, do nothing
      if (sourceItemId === itemId) {
        return;
      }

      // Create new measurement in current item
      const payload = {
        id: 0,
        description: measurement.description,
        number: measurement.number,
        multiplyNumber: measurement.multiplyNumber || 1,
        length: measurement.length,
        width: measurement.width,
        height: measurement.height,
        quantity: measurement.quantity,
        unit: measurement.unit,
        fkTxnItemId: itemId,
        floorLiftRise: measurement.floorLiftRise || null
      };

      const resp = await fetch('https://24.101.103.87:8082/api/txn-items-mts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Failed to copy measurement");

      // Delete from source item
      const deleteResp = await fetch(`https://24.101.103.87:8082/api/txn-items-mts/${measurement.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!deleteResp.ok) throw new Error("Failed to remove from source");

      // Refresh measurements
      fetchMeasurements();
      
      // Notify parent component if callback provided
      if (onMeasurementDrop) {
        onMeasurementDrop(sourceItemId, itemId, measurement);
      }

    } catch (err) {
      console.error("Drop failed:", err);
      setApiError("Failed to move measurement. Please try again.");
    }
  };

  // Total Quantity
  const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

  // Get placeholder text for fields
  const getFieldPlaceholder = (fieldName) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    
    if (!isFieldEnabled(fieldName)) return '';
    
    const placeholders = {
      number: 'No',
      length: 'L',
      width: unitType === 'SQM' ? 'W/B' : 'W',
      height: unitType === 'SQM' ? 'H/D' : 'H'
    };
    
    return placeholders[fieldName] || '';
  };

  // Get field label with requirement indicator
  const getFieldLabel = (fieldName) => {
    const unitType = getUnitType(formData.unit || unitLabel);
    const labels = {
      number: 'Number',
      length: 'Length',
      width: 'Width/Breadth',
      height: 'Height/Depth'
    };
    
    const baseLabel = labels[fieldName] || fieldName;
    const isRequired = isFieldRequired(fieldName);
    
    return isRequired ? `${baseLabel} *` : baseLabel;
  };

  return (
    <div 
      className="mt-2"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h6 className="text-sm font-semibold mb-2 px-4">
        Measurement Details - {unitLabel} ({getUnitType().toUpperCase()})
        <span className="text-xs text-gray-500 ml-2">(Drag measurements between items)</span>
      </h6>
      {loading && <div className="text-center py-4">Loading measurements...</div>}
      {apiError && <div className="text-red-600 py-2 px-4">{apiError}</div>}
      {!loading && !apiError && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1 w-8"></th>
                <th className="border px-2 py-1">SR NO</th>
                <th className="border px-2 py-1">Desc of Measurement</th>
                <th className="border px-2 py-1">Number</th>
                <th className="border px-2 py-1">L</th>
                <th className="border px-2 py-1">W/B</th>
                <th className="border px-2 py-1">H/D</th>
                <th className="border px-2 py-1">Quantity</th>
                <th className="border px-2 py-1">Unit</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedMeasurements).length > 0 ? (
                Object.entries(groupedMeasurements).map(([floor, floorRecords]) => {
                  let localSerial = 0;
                  
                  return (
                    <React.Fragment key={floor || 'default'}>
                      {/* Floor Header Row (if there's a floor) */}
                      {floor && (
                        <tr className="bg-cyan-50 font-semibold">
                          <td colSpan={10} className="border px-2 py-1">{floor}</td>
                        </tr>
                      )}
                      
                      {/* Floor Records */}
                      {floorRecords.map((m) => {
                        localSerial++;
                        return (
                          <tr 
                            key={m.id} 
                            className={`text-center cursor-move hover:bg-gray-50 ${draggedMeasurement?.id === m.id ? 'opacity-50' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, m)}
                            onDragEnd={handleDragEnd}
                          >
                            <td className="border px-2 py-1">
                              <FontAwesomeIcon 
                                icon={faGripVertical} 
                                className="text-gray-400 cursor-move"
                                title="Drag to move to another item"
                              />
                            </td>
                            <td className="border px-2 py-1">{localSerial}</td>
                            <td className="border px-2 py-1 text-left">{m.description}</td>
                            <td className="border px-2 py-1">
                              {m.number}
                              {m.multiplyNumber && m.multiplyNumber !== 1 && ` × ${m.multiplyNumber}`}
                            </td>
                            <td className="border px-2 py-1">{m.length || '-'}</td>
                            <td className="border px-2 py-1">{m.width || '-'}</td>
                            <td className="border px-2 py-1">{m.height || '-'}</td>
                            <td className="border px-2 py-1 font-semibold">{m.quantity}</td>
                            <td className="border px-2 py-1">{m.unit || unitLabel}</td>
                            <td className="border px-2 py-1">
                              <button className="text-blue-600 mr-2" onClick={() => handleEdit(m)}>
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button className="text-red-600" disabled={deletingId === m.id} onClick={() => handleDelete(m.id)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-4">No measurements found. Add one below.</td>
                </tr>
              )}
              
              {showInput && (
                <>
                  {/* Input Row */}
                  <tr className="text-center bg-gray-50">
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">-</td>
                    <td className="border px-2 py-1">
                      <input 
                        className="w-full text-sm p-1 border rounded" 
                        name="description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        autoFocus 
                        placeholder="Description *"
                      />
                    </td>
                    <td className="border px-2 py-1 flex items-center justify-center gap-1">
                      <input 
                        className={`w-12 text-sm p-1 border rounded ${!isFieldEnabled('number') ? 'bg-gray-200' : ''}`}
                        name="number" 
                        value={formData.number} 
                        onChange={handleChange} 
                        disabled={!isFieldEnabled('number')}
                        placeholder={getFieldPlaceholder('number')}
                        title={getFieldLabel('number')}
                      />
                      ×
                      <input 
                        className={`w-12 text-sm p-1 border rounded ${!isFieldEnabled('multiplyNumber') ? 'bg-gray-200' : ''}`}
                        name="multiplyNumber" 
                        value={formData.multiplyNumber} 
                        onChange={handleChange} 
                        disabled={!isFieldEnabled('multiplyNumber')}
                        title="Multiply Factor"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input 
                        className={`w-12 text-sm p-1 border rounded ${!isFieldEnabled('length') ? 'bg-gray-200' : ''}`}
                        name="length" 
                        value={formData.length} 
                        onChange={handleChange} 
                        disabled={!isFieldEnabled('length')}
                        placeholder={getFieldPlaceholder('length')}
                        title={getFieldLabel('length')}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input 
                        className={`w-12 text-sm p-1 border rounded ${!isFieldEnabled('width') ? 'bg-gray-200' : ''}`}
                        name="width" 
                        value={formData.width} 
                        onChange={handleChange} 
                        disabled={!isFieldEnabled('width')}
                        placeholder={getFieldPlaceholder('width')}
                        title={getFieldLabel('width')}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input 
                        className={`w-12 text-sm p-1 border rounded ${!isFieldEnabled('height') ? 'bg-gray-200' : ''}`}
                        name="height" 
                        value={formData.height} 
                        onChange={handleChange} 
                        disabled={!isFieldEnabled('height')}
                        placeholder={getFieldPlaceholder('height')}
                        title={getFieldLabel('height')}
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input 
                        className="w-16 text-sm p-1 border rounded bg-gray-100" 
                        name="quantity" 
                        value={formData.quantity} 
                        readOnly
                        title="Auto-calculated quantity"
                      />
                    </td>
                    <td className="border px-2 py-1">
                      <input 
                        className="w-full text-sm p-1 border rounded bg-gray-100" 
                        name="unit" 
                        value={unitLabel} 
                        readOnly
                        title="Unit from item"
                      />
                    </td>
                    <td className="border px-2 py-1 flex gap-1 justify-center">
                      <button onClick={handleSave} className="text-green-600" disabled={saving} title="Save">
                        <FontAwesomeIcon icon={faSave} />
                      </button>
                      <button onClick={handleCancel} className="text-red-600" disabled={saving} title="Cancel">
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Floor Selection Row (if multifloor is enabled) */}
                  {multifloor && (
                    <tr className="text-center bg-gray-50">
                      <td colSpan={3} className="border px-2 py-1 text-left">Floor/Level:</td>
                      <td colSpan={7} className="border px-2 py-1 text-left">
                        <select 
                          className="w-full text-sm p-1 border rounded"
                          name="floorLiftRise"
                          value={formData.floorLiftRise}
                          onChange={handleChange}
                        >
                          <option value="">Select Floor</option>
                          {floors.map(floor => (
                            <option key={floor.id} value={floor.floorLevel}>
                              {floor.floorLevel}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )}
                  
                  {/* Help Text Row */}
                  <tr className="bg-blue-50">
                    <td colSpan={10} className="border px-2 py-1 text-xs text-blue-700">
                      <strong>Unit Guide:</strong> 
                      <span className="ml-2">
                        {getUnitType() === 'NOS' && 'NOS: Only Number is required'}
                        {getUnitType() === 'RMT' && 'RMT: Number and Length are required'}
                        {getUnitType() === 'SQM' && 'SQM: Number, Length, and either Width or Height are required'}
                        {getUnitType() === 'CUM' && 'CUM: Number, Length, Width, and Height are required'}
                      </span>
                      <span className="ml-4 text-red-600">* Required fields</span>
                    </td>
                  </tr>
                </>
              )}
              
              {formError && (
                <tr>
                  <td colSpan={10} className="text-red-600 bg-yellow-100 text-center py-2">{formError}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="7" className="text-right pr-4 font-semibold border px-2 py-1">Total Quantity:</td>
                <td className="text-center font-bold border px-2 py-1">{totalQuantity.toFixed(2)}</td>
                <td className="text-left font-bold border px-2 py-1">{unitLabel}</td>
                <td className="border px-2 py-1"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <div className="mt-2 px-4 pb-4">
        {!showInput && (
          <button
            className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
            onClick={() => {
              resetForm();
              setShowInput(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" />
            Add Measurement
          </button>
        )}
      </div>
    </div>
  );
};

export default MeasurementTable;