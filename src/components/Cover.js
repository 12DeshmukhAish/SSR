import React, { useState, useRef, useEffect } from 'react';
import { X, Download, ArrowLeft, Edit2, Save, Plus } from 'lucide-react';

const CoverPageGenerator = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyLogo: null,
    companyName: '',
    address: '',
    workName: '',
    clientName: '',
    propertyNo: '',
    propertyAddress: '',
    estimateCost: '',
    year: ''
  });
  const [previewLogo, setPreviewLogo] = useState(null);
  const [pageGenerated, setPageGenerated] = useState(false);
  const coverPageRef = useRef(null);
  const [originalEstimateCost, setOriginalEstimateCost] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
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

      // If no saved cover page data, load from estimate data
      const constructionEstimate = localStorage.getItem('constructionEstimate');
      const abstractWorkName = localStorage.getItem('abstractWorkName');
      const ssrData = localStorage.getItem('ssr'); // Get SSR data properly
      
      // Calculate estimate cost
      let grandTotal = '';
      
      if (constructionEstimate) {
        const parsedEstimateData = JSON.parse(constructionEstimate);
        if (parsedEstimateData && parsedEstimateData.grandTotal) {
          grandTotal = parsedEstimateData.grandTotal.toFixed(2);
        }
      }
      
      // If no grandTotal from constructionEstimate, try calculating from items
      if (!grandTotal) {
        const abstractItems = localStorage.getItem('abstractItems');
        const auxiliaryWorks = localStorage.getItem('auxiliaryWorks');
        
        if (abstractItems) {
          const parsedItems = JSON.parse(abstractItems);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            const baseTotal = parsedItems.reduce((sum, item) => {
              const quantity = parseFloat(item.quantity) || 0;
              const rate = parseFloat(item.labourRate) || 0;
              return sum + (quantity * rate);
            }, 0);
            
            let totalWithAux = baseTotal;
            if (auxiliaryWorks) {
              const parsedAux = JSON.parse(auxiliaryWorks);
              if (Array.isArray(parsedAux)) {
                parsedAux.forEach(aux => {
                  const percentage = parseFloat(aux.percentage) || 0;
                  totalWithAux += baseTotal * (percentage / 100);
                });
              }
            }
            
            grandTotal = totalWithAux.toFixed(2);
          }
        }
      }
      
      setOriginalEstimateCost(grandTotal);
      
      // Get SSR year from localStorage with proper parsing
      let ssrYear = '';
      if (ssrData) {
        // If SSR data contains year format like "2023-24" or "2023", use it
        ssrYear = ssrData;
      } else {
        // Fallback to current year format
        const currentYear = new Date().getFullYear();
        ssrYear = `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}`;
      }
      
      // Update form data with estimate data
      const newFormData = {
        ...formData,
        workName: abstractWorkName || '',
        estimateCost: grandTotal,
        year: ssrYear
      };
      
      setFormData(newFormData);

    } catch (error) {
      console.error("Error loading data:", error);
      // Show a simple alert instead of toast
      alert("Failed to load saved estimate data");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    // Validate required fields
    const requiredFields = ['companyName', 'address', 'workName', 'clientName', 'propertyNo', 'propertyAddress', 'estimateCost', 'year'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Save to localStorage with all necessary keys for PDF generation
    localStorage.setItem('coverPageData', JSON.stringify(formData));
    localStorage.setItem('coverPageGenerated', 'true');
    
    // Also save individual items for PDF generation compatibility
    localStorage.setItem('abstractWorkName', formData.workName);
    localStorage.setItem('abstractWorkOrderId', localStorage.getItem('workOrderId') || 'WO-001');
    localStorage.setItem('abstractArea', localStorage.getItem('area') || '900');
    localStorage.setItem('abstractSSR', formData.year);
    
    // Ensure construction estimate is available for PDF
    const existingEstimate = localStorage.getItem('constructionEstimate');
    if (!existingEstimate) {
      const constructionEstimate = {
        grandTotal: parseFloat(formData.estimateCost) || 0,
        workOrderId: localStorage.getItem('workOrderId') || 'WO-001',
        workName: formData.workName,
        area: localStorage.getItem('area') || '900',
        ssr: formData.year,
        items: 0,
        revisionNumber: localStorage.getItem('revisionNumber') || '1'
      };
      localStorage.setItem('constructionEstimate', JSON.stringify(constructionEstimate));
    }
    
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
  };

  // NEW FUNCTION: Handle creating a new cover page
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
    
    // Reset form data to initial state
    const initialFormData = {
      companyLogo: null,
      companyName: '',
      address: '',
      workName: '',
      clientName: '',
      propertyNo: '',
      propertyAddress: '',
      estimateCost: '',
      year: ''
    };
    setFormData(initialFormData);
    
    // Load fresh data from estimate
    loadDataFromEstimate();
  };

  // NEW FUNCTION: Load data specifically from estimate (not from saved cover page)
  const loadDataFromEstimate = () => {
    try {
      const constructionEstimate = localStorage.getItem('constructionEstimate');
      const abstractWorkName = localStorage.getItem('abstractWorkName');
      const ssrData = localStorage.getItem('ssr');
      
      // Calculate estimate cost
      let grandTotal = '';
      
      if (constructionEstimate) {
        const parsedEstimateData = JSON.parse(constructionEstimate);
        if (parsedEstimateData && parsedEstimateData.grandTotal) {
          grandTotal = parsedEstimateData.grandTotal.toFixed(2);
        }
      }
      
      // If no grandTotal from constructionEstimate, try calculating from items
      if (!grandTotal) {
        const abstractItems = localStorage.getItem('abstractItems');
        const auxiliaryWorks = localStorage.getItem('auxiliaryWorks');
        
        if (abstractItems) {
          const parsedItems = JSON.parse(abstractItems);
          if (Array.isArray(parsedItems) && parsedItems.length > 0) {
            const baseTotal = parsedItems.reduce((sum, item) => {
              const quantity = parseFloat(item.quantity) || 0;
              const rate = parseFloat(item.labourRate) || 0;
              return sum + (quantity * rate);
            }, 0);
            
            let totalWithAux = baseTotal;
            if (auxiliaryWorks) {
              const parsedAux = JSON.parse(auxiliaryWorks);
              if (Array.isArray(parsedAux)) {
                parsedAux.forEach(aux => {
                  const percentage = parseFloat(aux.percentage) || 0;
                  totalWithAux += baseTotal * (percentage / 100);
                });
              }
            }
            
            grandTotal = totalWithAux.toFixed(2);
          }
        }
      }
      
      setOriginalEstimateCost(grandTotal);
      
      // Get SSR year from localStorage with proper parsing
      let ssrYear = '';
      if (ssrData) {
        ssrYear = ssrData;
      } else {
        const currentYear = new Date().getFullYear();
        ssrYear = `${currentYear}-${(currentYear + 1).toString().substr(2, 2)}`;
      }
      
      // Update form data with estimate data only
      setFormData(prev => ({
        ...prev,
        workName: abstractWorkName || '',
        estimateCost: grandTotal,
        year: ssrYear
      }));

    } catch (error) {
      console.error("Error loading estimate data:", error);
      alert("Failed to load estimate data");
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

  const handleBackToEstimate = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
      if (!confirmLeave) return;
    }
    
    // In a real app, you would use navigate('/estimate')
    // For this demo, we'll just show an alert
    alert("Navigating back to estimate page...");
  };

  const handleQuickEdit = (field) => {
    const newValue = prompt(`Edit ${field}`, formData[field]);
    if (newValue !== null) {
      const updatedData = { ...formData, [field]: newValue };
      setFormData(updatedData);
      setHasUnsavedChanges(true);
      
      // Auto-save the change
      localStorage.setItem('coverPageData', JSON.stringify(updatedData));
      
      // Update related localStorage items for PDF compatibility
      if (field === 'workName') {
        localStorage.setItem('abstractWorkName', newValue);
      }
      if (field === 'year') {
        localStorage.setItem('abstractSSR', newValue);
      }
      if (field === 'estimateCost') {
        // Update construction estimate
        const existingEstimate = localStorage.getItem('constructionEstimate');
        if (existingEstimate) {
          const parsedEstimate = JSON.parse(existingEstimate);
          parsedEstimate.grandTotal = parseFloat(newValue) || 0;
          localStorage.setItem('constructionEstimate', JSON.stringify(parsedEstimate));
        }
      }
    }
  };

  // Format the estimate cost with commas for Indian number format
  const formatIndianCurrency = (amount) => {
    if (!amount) return '';
    
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

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {!pageGenerated ? (
        <div className="w-full max-w-4xl">
          <div className="mb-4 flex justify-between items-center">
            <button 
              onClick={handleBackToEstimate}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} /> Back to Estimate
            </button>
            <h2 className="text-2xl font-bold">Cover Page Generator</h2>
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white py-2 px-6 rounded-md shadow-md hover:bg-blue-700 transition-colors"
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
              {/* NEW BUTTON: Create New Cover Page */}
              <button 
                onClick={handleCreateNew}
                className="bg-orange-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-orange-700 transition-colors"
              >
                <Plus size={18} /> Create New
              </button>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Edit Current
              </button>
              <button 
                onClick={handleDownload}
                className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Download size={18} /> Download
              </button>
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
                  <div className="flex flex-col items-center mb-8 md:mb-12 relative group">
                    <button 
                      onClick={() => handleQuickEdit('companyName')}
                      className="absolute -right-4 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                      title="Edit Company Name"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
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
                      <p className="text-lg md:text-xl text-gray-700 mt-2 relative group">
                        {formData.address.toUpperCase()}
                        <button 
                          onClick={() => handleQuickEdit('address')}
                          className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                          title="Edit Address"
                        >
                          <Edit2 size={14} className="text-blue-600" />
                        </button>
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
                    <div className="mb-6 md:mb-10 relative group">
                      <button 
                        onClick={() => handleQuickEdit('workName')}
                        className="absolute -right-4 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                        title="Edit Work Name"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <p className="text-xl md:text-2xl text-red-600 font-bold mb-2">NAME OF WORK </p>
                      <p className="text-xl md:text-2xl text-red-600 font-bold uppercase mb-6 md:mb-8">
                        {formData.workName.toUpperCase()} FOR<br/>
                        <span className="relative group inline-block">
                          {formData.clientName.toUpperCase()}
                          <button 
                            onClick={() => handleQuickEdit('clientName')}
                            className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                            title="Edit Client Name"
                          >
                            <Edit2 size={14} className="text-blue-600" />
                          </button>
                        </span>
                      </p>
                    </div>
                    
                    <p className="text-lg md:text-2xl mb-6 md:mb-10 relative group">
                      PROPERTY NO {formData.propertyNo.toUpperCase()}, {formData.propertyAddress.toUpperCase()}
                      <button 
                        onClick={() => handleQuickEdit('propertyAddress')}
                        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                        title="Edit Property Address"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                    </p>
                    
                    <div className="mb-8 md:mb-12 text-center relative group">
                      <button 
                        onClick={() => handleQuickEdit('estimateCost')}
                        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                        title="Edit Estimate Cost"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                      <p className="text-lg md:text-2xl font-bold inline-flex items-center">
                        <span>ESTIMATE COST : </span>
                        <span className="mx-2">Rs. {formatIndianCurrency(formData.estimateCost)}</span>
                      </p>
                    </div>
                    
                    <p className="text-lg md:text-xl text-gray-700 relative group">
                      ADOPTED SOR OF {formData.year.toUpperCase()}
                      <button 
                        onClick={() => handleQuickEdit('year')}
                        className="absolute -right-6 top-0 opacity-0 group-hover:opacity-100 bg-blue-100 p-1 rounded-full"
                        title="Edit SOR Year"
                      >
                        <Edit2 size={14} className="text-blue-600" />
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick edit button overlay */}
            <div className="absolute top-2 right-2 z-10 opacity-70 hover:opacity-100">
              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white p-2 rounded-full"
                title="Edit All Details"
              >
                <Edit2 size={14} />
              </button>
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
                      placeholder="e.g. Miss. Aishwarya Deshmukh"
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
                        value={formData.estimateCost} 
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-1.5 text-sm"
                        placeholder="e.g. 1234567.89"
                        required
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save & Generate
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