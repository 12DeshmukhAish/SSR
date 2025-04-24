import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
// import toast from 'react-hot-toast'; // Uncomment if using react-hot-toast

const MeasurementTable = ({ itemId, token, unitLabel = "Cu.M." }) => {
  const [measurements, setMeasurements] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [apiError, setApiError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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

  useEffect(() => {
    if (itemId && token) fetchMeasurements();
    // eslint-disable-next-line
  }, [itemId, token]);

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
    const length = parseFloat(data.length) || 1;
    const width = parseFloat(data.width) || 1;
    const height = parseFloat(data.height) || 1;
    return number * multiplyNumber * length * width * height ? (number * multiplyNumber * length * width * height).toFixed(2) : '';
  };

  // Validation: all fields required except quantity/unit
  const validate = () => {
    if (!formData.description.trim()) return "Description is required.";
    if (formData.number === '') return "Number is required.";
    if (formData.length === '') return "Length is required.";
    if (formData.width === '') return "Width is required.";
    if (formData.height === '') return "Height is required.";
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
      // toast.error(validationError);
      return;
    }
    setSaving(true);
    setFormError("");
    const payload = {
      id: editId || 0,
      srNo: 0,
      description: formData.description.trim(),
      number: parseFloat(formData.number) || 0,
      multiplyNumber: parseFloat(formData.multiplyNumber) || 1,
      length: parseFloat(formData.length) || 1,
      width: parseFloat(formData.width) || 1,
      height: parseFloat(formData.height) || 1,
      quantity: parseFloat(formData.quantity) || 0,
      unit: unitLabel,
      fkTxnItemId: itemId,
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
      setShowInput(false);
      setFormData({ description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: unitLabel });
      setEditId(null);
      fetchMeasurements();
      // toast.success(editId ? "Measurement updated." : "Measurement added.");
    } catch (err) {
      setFormError("Failed to save measurement. Try again.");
      // toast.error("Failed to save measurement.");
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
      multiplyNumber: m.multiplyNumber,
      length: m.length,
      width: m.width,
      height: m.height,
      quantity: m.quantity,
      unit: m.unit || unitLabel
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
      // toast.success("Measurement deleted.");
    } catch {
      // toast.error("Delete failed");
      setApiError("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Reset/cancel input
  const handleCancel = () => {
    setShowInput(false);
    setEditId(null);
    setFormData({ description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: unitLabel });
    setFormError("");
  };

  // Total Quantity
  const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

  return (
    <div className="mt-2">
      <h6 className="text-sm font-semibold mb-2 px-4">Measurement Details</h6>
      {loading && <div className="text-center py-4">Loading measurements...</div>}
      {apiError && <div className="text-red-600 py-2 px-4">{apiError}</div>}
      {!loading && !apiError && (
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
                <th className="border px-2 py-1"></th>
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
                      <button className="text-blue-600 mr-2" onClick={() => handleEdit(m)}>
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-red-600" disabled={deletingId === m.id} onClick={() => handleDelete(m.id)}>
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
                    <input className="w-full text-sm p-1 border rounded" name="description" value={formData.description} onChange={handleChange} autoFocus />
                  </td>
                  <td className="border px-2 py-1 flex items-center justify-center gap-1">
                    <input className="w-12 text-sm p-1 border rounded" name="number" value={formData.number} onChange={handleChange} />
                    ×
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
                  <td className="border px-2 py-1 flex gap-1 justify-center">
                    <button onClick={handleSave} className="text-green-600" disabled={saving}>
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                    <button onClick={handleCancel} className="text-red-600" disabled={saving}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </td>
                </tr>
              )}
              {formError && (
                <tr>
                  <td colSpan={9} className="text-red-600 bg-yellow-100 text-center">{formError}</td>
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
              setFormData({ description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: unitLabel });
              setEditId(null);
              setShowInput(true);
              setFormError("");
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
