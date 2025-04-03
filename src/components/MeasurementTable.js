// MeasurementTable.jsx
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const MeasurementTable = ({ itemId, token }) => {
  const [measurements, setMeasurements] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    number: '',
    multiplyNumber: '',
    length: '',
    width: '',
    height: '',
    quantity: '',
    unit: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setMeasurements(data);
    } catch (err) {
      console.error('Error loading measurements:', err);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      quantity: calculateQuantity({
        ...prev,
        [name]: value
      })
    }));
  };

  const calculateQuantity = (data) => {
    const number = parseFloat(data.number || 0);
    const multiplyNumber = parseFloat(data.multiplyNumber || 1);
    const length = parseFloat(data.length || 1);
    const width = parseFloat(data.width || 1);
    const height = parseFloat(data.height || 1);
    return (number * multiplyNumber * length * width * height).toFixed(2);
  };

  const getDisplayUnit = (unit) => {
    const normalized = unit.toLowerCase();
    if (["m", "rmt", "rm"].includes(normalized)) return "Cu.M.";
    if (["ft", "feet", "ft.", "rft"].includes(normalized)) return "Cu.Ft.";
    if (["cm"].includes(normalized)) return "Cu.Cm.";
    return unit;
  };

  const handleSave = async () => {
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
      unit: formData.unit,
      fkTxnItemId: itemId
    };

    const method = editId ? 'PUT' : 'POST';
    const url = `http://24.101.103.87:8082/api/txn-items-mts${editId ? '/' + editId : ''}`;

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      setFormData({
        description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: ''
      });
      setEditId(null);
      setShowInput(false);
      fetchMeasurements();
    } catch (err) {
      alert('❌ Failed to save measurement.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this measurement?')) return;
    try {
      await fetch(`http://24.101.103.87:8082/api/txn-items-mts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchMeasurements();
    } catch (err) {
      alert('❌ Delete failed');
    }
  };

  const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

  return (
    <div className="mt-4">
      <h6 className="text-sm font-semibold mb-2">Measurement for Item {itemId}</h6>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2">SR NO</th>
            <th className="border px-2">Desc of Measurement</th>
            <th className="border px-2">Number</th>
            <th className="border px-2">L</th>
            <th className="border px-2">W/B</th>
            <th className="border px-2">H/D</th>
            <th className="border px-2">Quantity</th>
            <th className="border px-2">Unit</th>
            <th className="border px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m, i) => (
            <tr key={m.id} className="text-center">
              <td className="border px-2">{i + 1}</td>
              <td className="border px-2">{m.description}</td>
              <td className="border px-2">{m.number} x {m.multiplyNumber} = {m.number * m.multiplyNumber}</td>
              <td className="border px-2">{m.length}</td>
              <td className="border px-2">{m.width}</td>
              <td className="border px-2">{m.height}</td>
              <td className="border px-2 font-semibold">{m.quantity}</td>
              <td className="border px-2">{getDisplayUnit(m.unit)}</td>
              <td className="border px-2">
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
          ))}

          {showInput && (
            <tr className="text-center bg-gray-50">
              <td className="border px-2">-</td>
              <td className="border px-2">
                <input className="w-full text-sm p-1 border rounded" name="description" value={formData.description} onChange={handleChange} />
              </td>
              <td className="border px-2 flex items-center justify-center gap-1">
                <input className="w-12 text-sm p-1 border rounded" name="number" value={formData.number} onChange={handleChange} /> x
                <input className="w-12 text-sm p-1 border rounded" name="multiplyNumber" value={formData.multiplyNumber} onChange={handleChange} />
              </td>
              <td className="border px-2">
                <input className="w-12 text-sm p-1 border rounded" name="length" value={formData.length} onChange={handleChange} />
              </td>
              <td className="border px-2">
                <input className="w-12 text-sm p-1 border rounded" name="width" value={formData.width} onChange={handleChange} />
              </td>
              <td className="border px-2">
                <input className="w-12 text-sm p-1 border rounded" name="height" value={formData.height} onChange={handleChange} />
              </td>
              <td className="border px-2">
                <input className="w-16 text-sm p-1 border rounded" name="quantity" value={formData.quantity} readOnly />
              </td>
              <td className="border px-2">
                <input className="w-full text-sm p-1 border rounded" name="unit" value={formData.unit} onChange={handleChange} />
              </td>
              <td className="border px-2">
                <button onClick={handleSave} className="text-green-600">
                  <FontAwesomeIcon icon={faSave} />
                </button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="6" className="text-right pr-4 font-semibold">Total Quantity:</td>
            <td className="text-center font-bold">{totalQuantity.toFixed(2)}</td>
            <td className="text-left font-bold">Cu.M.</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      <div className="mt-2">
        <button className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700" onClick={() => {
          setFormData({
            description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: ''
          });
          setEditId(null);
          setShowInput(true);
        }}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Measurement
        </button>
      </div>
    </div>
  );
};

export default MeasurementTable;

// MeasurementTable.jsx
// import React, { useEffect, useState } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPlus, faTrash, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

// const MeasurementTable = ({ itemId, token }) => {
//   const [measurements, setMeasurements] = useState([]);
//   const [showInput, setShowInput] = useState(false);
//   const [formData, setFormData] = useState({
//     description: '',
//     number: '',
//     multiplyNumber: '',
//     length: '',
//     width: '',
//     height: '',
//     quantity: '',
//     unit: ''
//   });
//   const [editId, setEditId] = useState(null);

//   const fetchMeasurements = async () => {
//     try {
//       const res = await fetch('http://24.101.103.87:8082/api/txn-items-mts', {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       const data = await res.json();
//       const filtered = data.filter(m => m.fkTxnItemId === itemId);
//       setMeasurements(filtered);
//     } catch (err) {
//       console.error('Error loading measurements:', err);
//     }
//   };

//   useEffect(() => {
//     fetchMeasurements();
//   }, []);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSave = async () => {
//     const isDuplicate = measurements.some(
//       m => m.description.toLowerCase() === formData.description.toLowerCase() && m.id !== editId
//     );
//     if (isDuplicate) {
//       alert('❌ This measurement already exists.');
//       return;
//     }

//     const payload = {
//       ...formData,
//       id: editId || 0,
//       srNo: 0,
//       number: parseFloat(formData.number || 0),
//       multiplyNumber: parseFloat(formData.multiplyNumber || 1),
//       length: parseFloat(formData.length || 0),
//       width: parseFloat(formData.width || 0),
//       height: parseFloat(formData.height || 0),
//       quantity: parseFloat(formData.quantity || 0),
//       fkTxnItemId: itemId
//     };

//     const method = editId ? 'PUT' : 'POST';
//     const url = `http://24.101.103.87:8082/api/txn-items-mts${editId ? '/' + editId : ''}`;

//     try {
//       await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });
//       setFormData({
//         description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: ''
//       });
//       setEditId(null);
//       setShowInput(false);
//       fetchMeasurements();
//     } catch (err) {
//       alert('❌ Failed to save measurement.');
//       console.error(err);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this measurement?')) return;
//     try {
//       await fetch(`http://24.101.103.87:8082/api/txn-items-mts/${id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       fetchMeasurements();
//     } catch (err) {
//       alert('❌ Delete failed');
//     }
//   };

//   const totalQuantity = measurements.reduce((sum, m) => sum + (parseFloat(m.quantity) || 0), 0);

//   return (
//     <div className="mt-4">
//       <h6 className="text-sm font-semibold mb-2">Measurement for Item {itemId}</h6>
//       <table className="w-full text-sm border">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border px-2">SR NO</th>
//             <th className="border px-2">Desc of Measurement</th>
//             <th className="border px-2">Number</th>
//             <th className="border px-2">L</th>
//             <th className="border px-2">W/B</th>
//             <th className="border px-2">H/D</th>
//             <th className="border px-2">Quantity</th>
//             <th className="border px-2">Unit</th>
//             <th className="border px-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {measurements.map((m, i) => (
//             <tr key={m.id} className="text-center">
//               <td className="border px-2">{i + 1}</td>
//               <td className="border px-2">{m.description}</td>
//               <td className="border px-2">{m.number} x {m.multiplyNumber} = {m.number * m.multiplyNumber}</td>
//               <td className="border px-2">{m.length}</td>
//               <td className="border px-2">{m.width}</td>
//               <td className="border px-2">{m.height}</td>
//               <td className="border px-2 font-semibold">{m.quantity}</td>
//               <td className="border px-2">{m.unit}</td>
//               <td className="border px-2">
//                 <button className="text-blue-600 mr-2" onClick={() => {
//                   setFormData(m);
//                   setEditId(m.id);
//                   setShowInput(true);
//                 }}>
//                   <FontAwesomeIcon icon={faEdit} />
//                 </button>
//                 <button className="text-red-600" onClick={() => handleDelete(m.id)}>
//                   <FontAwesomeIcon icon={faTrash} />
//                 </button>
//               </td>
//             </tr>
//           ))}

//           {showInput && (
//             <tr className="text-center bg-gray-50">
//               <td className="border px-2">-</td>
//               <td className="border px-2">
//                 <input className="w-full text-sm p-1 border rounded" name="description" value={formData.description} onChange={handleChange} />
//               </td>
//               <td className="border px-2 flex items-center justify-center gap-1">
//                 <input className="w-12 text-sm p-1 border rounded" name="number" value={formData.number} onChange={handleChange} /> x
//                 <input className="w-12 text-sm p-1 border rounded" name="multiplyNumber" value={formData.multiplyNumber} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <input className="w-12 text-sm p-1 border rounded" name="length" value={formData.length} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <input className="w-12 text-sm p-1 border rounded" name="width" value={formData.width} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <input className="w-12 text-sm p-1 border rounded" name="height" value={formData.height} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <input className="w-16 text-sm p-1 border rounded" name="quantity" value={formData.quantity} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <input className="w-full text-sm p-1 border rounded" name="unit" value={formData.unit} onChange={handleChange} />
//               </td>
//               <td className="border px-2">
//                 <button onClick={handleSave} className="text-green-600">
//                   <FontAwesomeIcon icon={faSave} />
//                 </button>
//               </td>
//             </tr>
//           )}
//         </tbody>
//         <tfoot>
//           <tr>
//             <td colSpan="6" className="text-right pr-4 font-semibold">Total Quantity:</td>
//             <td className="text-center font-bold">{totalQuantity}</td>
//             <td className="text-left font-bold">Cu.M.</td>
//             <td></td>
//           </tr>
//         </tfoot>
//       </table>
//       <div className="mt-2">
//         <button className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700" onClick={() => {
//           setFormData({
//             description: '', number: '', multiplyNumber: '', length: '', width: '', height: '', quantity: '', unit: ''
//           });
//           setEditId(null);
//           setShowInput(true);
//         }}>
//           <FontAwesomeIcon icon={faPlus} className="mr-1" /> Add Measurement
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MeasurementTable;