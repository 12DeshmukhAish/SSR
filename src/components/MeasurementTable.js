import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const MeasurementTable = ({ itemId, token, unitLabel = "Cu.M." }) => {
  const [measurements, setMeasurements] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    number: '',
    multiplyNumber: '',
    length: '',
    width: '',
    height: '',
    quantity: '',
    unit: unitLabel
  });
  const [editId, setEditId] = useState(null);

  const fetchMeasurements = async () => {
    if (!itemId || !token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      
      const data = await res.json();
      // Ensure data is always an array
      const measurementsArray = Array.isArray(data) ? data : [];
      setMeasurements(measurementsArray);
    } catch (err) {
      console.error('Error loading measurements:', err);
      setError('Failed to load measurements. Please try again.');
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [itemId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };
      
      // Only recalculate quantity if one of the calculation fields changed
      if (['number', 'multiplyNumber', 'length', 'width', 'height'].includes(name)) {
        updatedData.quantity = calculateQuantity(updatedData);
      }
      
      return updatedData;
    });
  };

  const calculateQuantity = (data) => {
    const number = parseFloat(data.number || 0);
    const multiplyNumber = parseFloat(data.multiplyNumber || 1);
    const length = parseFloat(data.length || 1);
    const width = parseFloat(data.width || 1);
    const height = parseFloat(data.height || 1);
    return (number * multiplyNumber * length * width * height).toFixed(2);
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      alert('❌ Description is required.');
      return;
    }
    
    const isDuplicate = measurements.some(
      m => m.description.toLowerCase() === formData.description.toLowerCase() && m.id !== editId
    );
    if (isDuplicate) {
      alert('❌ This measurement already exists.');
      return;
    }

    const payload = {
      id: editId || 0,
      srNo: 0,
      description: formData.description,
      number: parseFloat(formData.number || 0),
      multiplyNumber: parseFloat(formData.multiplyNumber || 1),
      length: parseFloat(formData.length || 1),
      width: parseFloat(formData.width || 1),
      height: parseFloat(formData.height || 1),
      quantity: parseFloat(formData.quantity || 0),
      unit: unitLabel,
      fkTxnItemId: itemId
    };

    const method = editId ? 'PUT' : 'POST';
    const url = `http://24.101.103.87:8082/api/txn-items-mts${editId ? '/' + editId : ''}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Clear form and reset state
      setFormData({
        description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: unitLabel
      });
      setEditId(null);
      setShowInput(false);
      
      // After save, refresh measurements to get updated data
      fetchMeasurements();
    } catch (err) {
      alert('❌ Failed to save measurement.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) return;
    try {
      const response = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      // Refresh measurements after deletion
      fetchMeasurements();
    } catch (err) {
      alert('❌ Delete failed');
      console.error(err);
    }
  };

  const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

  return (
    <div className="mt-2">
      <h6 className="text-sm font-semibold mb-2 px-4">Measurement Details</h6>
      
      {loading && <div className="text-center py-4">Loading measurements...</div>}
      
      {error && <div className="text-red-600 py-2 px-4">{error}</div>}
      
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
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
              {measurements.length > 0 ? (
                measurements.map((m, i) => (
                  <tr key={m.id} className="text-center">
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1 text-left">{m.description}</td>
                    <td className="border px-2 py-1">{m.number} × {m.multiplyNumber}</td>
                    <td className="border px-2 py-1">{m.length}</td>
                    <td className="border px-2 py-1">{m.width}</td>
                    <td className="border px-2 py-1">{m.height}</td>
                    <td className="border px-2 py-1 font-semibold">{m.quantity}</td>
                    <td className="border px-2 py-1">{unitLabel}</td>
                    <td className="border px-2 py-1">
                      <button className="text-blue-600 mr-2" onClick={() => {
                        setFormData(m);
                        setEditId(m.id);
                        setShowInput(true);
                      }}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-red-600" onClick={() => handleDelete(m.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">No measurements found. Add one below.</td>
                </tr>
              )}

              {showInput && (
                <tr className="text-center bg-gray-50">
                  <td className="border px-2 py-1">-</td>
                  <td className="border px-2 py-1">
                    <input className="w-full text-sm p-1 border rounded" name="description" value={formData.description} onChange={handleChange} />
                  </td>
                  <td className="border px-2 py-1 flex items-center justify-center gap-1">
                    <input className="w-12 text-sm p-1 border rounded" name="number" value={formData.number} onChange={handleChange} /> ×
                    <input className="w-12 text-sm p-1 border rounded" name="multiplyNumber" value={formData.multiplyNumber} onChange={handleChange} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-12 text-sm p-1 border rounded" name="length" value={formData.length} onChange={handleChange} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-12 text-sm p-1 border rounded" name="width" value={formData.width} onChange={handleChange} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-12 text-sm p-1 border rounded" name="height" value={formData.height} onChange={handleChange} />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-16 text-sm p-1 border rounded" name="quantity" value={formData.quantity} readOnly />
                  </td>
                  <td className="border px-2 py-1">
                    <input className="w-full text-sm p-1 border rounded" name="unit" value={unitLabel} readOnly />
                  </td>
                  <td className="border px-2 py-1">
                    <button onClick={handleSave} className="text-green-600">
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6" className="text-right pr-4 font-semibold border px-2 py-1">Total Quantity:</td>
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
        setFormData({
          description: '',
          number: '',
          multiplyNumber: '',
          length: '',
          width: '',
          height: '',
          quantity: '',
          unit: unitLabel
        });
        setEditId(null);
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