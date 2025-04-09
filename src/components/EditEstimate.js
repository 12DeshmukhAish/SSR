import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stepper from './Stepper';


const EditEstimatePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [workOrderStatus, setWorkOrderStatus] = useState('started');
  const navigate = useNavigate();
  const { workorderId: urlWorkorderId } = useParams();

  const [formData, setFormData] = useState({
    workname: localStorage.getItem("edit_nameOfWork") || '',
    state: localStorage.getItem("edit_state") || '',
    department: localStorage.getItem("edit_department") || '',
    workOrderId: localStorage.getItem("recordId") || '',
    chapter: localStorage.getItem("edit_chapter") || '',
    ssr: localStorage.getItem("edit_ssr") || '',
    area: localStorage.getItem("edit_area") || '',
    preparedBy: localStorage.getItem("edit_preparedBy") || '',
    checkedBy: localStorage.getItem("edit_checkedBy") || ''
  });

  const states = [{ value: 'MH', label: 'Maharashtra' }, { value: 'GJ', label: 'Gujarat' }];
  const departments = [{ value: 'PWD', label: 'PWD' }, { value: 'WRD', label: 'WRD' }];
  const chapters = [
    { value: '1', label: 'Accoustic' },
    { value: '3', label: 'Building Works' },
    { value: '4', label: 'Bridge Works' }
  ];
  const ssrOptions = [{ value: 'SSR 2022-23', label: 'SSR 2022-23' }];
  const areas = [
    { value: 'Corporation Area', label: 'Corporation Area' },
    { value: 'Sugarcane Factory Area', label: 'Sugarcane Factory Area' },
    { value: 'General Area', label: 'General Area' }
  ];

  useEffect(() => {
    const idToUse = localStorage.getItem('recordId');
    if (idToUse) {
      fetchWorkOrderData(idToUse);
    }
  }, []);

  const fetchWorkOrderData = async (id) => {
    setIsLoading(true);
    try {
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0MjAyNDEzLCJleHAiOjE3NDQyODg4MTN9.cxCaFHJsjjmwxjCOSHwov6xVsxaZsn9AWTDqnSwhXK0";
      const res = await fetch(`http://24.101.103.87:8082/api/workorders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkOrderStatus(data.status || 'started');
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateStep1 = () => {
    if (!formData.workname || !formData.state || !formData.department) {
      alert('Please fill required Step 1 fields');
      return false;
    }
    return true;
  };

  const handleNextStep = (step) => {
    if (step === 2 && !validateStep1()) return;
    setCurrentStep(step);
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19);
  };

  const handleSubmit = async () => {
    if (!formData.chapter || !formData.ssr || !formData.area || !formData.preparedBy || !formData.checkedBy) {
      alert('Please fill required Step 2 fields');
      return;
    }

    setIsLoading(true);
    try {
      const id = localStorage.getItem('recordId');
      const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0MjAyNDEzLCJleHAiOjE3NDQyODg4MTN9.cxCaFHJsjjmwxjCOSHwov6xVsxaZsn9AWTDqnSwhXK0";
      const payload = {
        workOrderID: formData.workOrderId,
        nameOfWork: formData.workname,
        state: formData.state,
        ssr: formData.ssr,
        chapterId: formData.chapter,
        area: formData.area,
        createdBy: "92",
        preparedBySignature: formData.preparedBy,
        checkedBySignature: formData.checkedBy,
        createdDate: getFormattedDate(),
        department: formData.department,
        deletedFlag: 0,
        status: "started"
      };

      const res = await fetch(`http://24.101.103.87:8082/api/workorders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nameOfWork", formData.workname);
        localStorage.setItem("workorderId", data.id);
        localStorage.setItem("chapter", formData.chapter);
        localStorage.setItem("ssr", formData.ssr);
        localStorage.setItem("area", formData.area);
        navigate('/editsubestimate');
      } else {
        alert(data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to submit");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Stepper currentStep={currentStep} onStepClick={handleNextStep} />

      <div className="bg-white rounded shadow p-6 mt-4">
        <h1 className="text-xl font-semibold mb-4">Edit Estimate</h1>

        {currentStep === 1 && (
          <>
            <textarea id="workname" className="w-full mb-4 p-2 border rounded" placeholder="Name of Work" value={formData.workname} onChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select id="state" value={formData.state} onChange={handleInputChange} className="p-2 border rounded">
                <option value="">Select State</option>
                {states.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select id="department" value={formData.department} onChange={handleInputChange} className="p-2 border rounded">
                <option value="">Select Department</option>
                {departments.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button onClick={() => handleNextStep(2)} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="p-2 border rounded bg-gray-100" value={formData.workOrderId} readOnly />
              <select id="chapter" value={formData.chapter} onChange={handleInputChange} className="p-2 border rounded">
                <option value="">Select Chapter</option>
                {chapters.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select id="ssr" value={formData.ssr} onChange={handleInputChange} className="p-2 border rounded">
                <option value="">Select SSR</option>
                {ssrOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <select id="area" value={formData.area} onChange={handleInputChange} className="p-2 border rounded">
                <option value="">Select Area</option>
                {areas.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <textarea id="preparedBy" className="w-full p-2 mb-4 border rounded" placeholder="Prepared By" value={formData.preparedBy} onChange={handleInputChange} />
            <textarea id="checkedBy" className="w-full p-2 mb-4 border rounded" placeholder="Checked By" value={formData.checkedBy} onChange={handleInputChange} />
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Previous</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                {isLoading ? "Saving..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditEstimatePage;
