import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Edit2, Save, FileText } from 'lucide-react';

const MTSCoverPageGenerator = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    companyLogo: null,
    companyName: 'GOVERNMENT OF MAHARASHTRA',
    addressLine1: 'PUBLIC WORKS REGION,',
    addressLine2: 'PUBLIC WORKS CIRCLE,',
    addressLine3: 'P.W.DIVISION.',
    contactNo: '',
    workName: '',
    estimateCost: '',
    year: '',
    preparedBy: '',
    workOrderId: '',
    mtsDate: new Date().toISOString().split('T')[0]
  });
  const [previewLogo, setPreviewLogo] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const coverPageRef = useRef(null);

  // Government logo path
  const governmentLogo = "/gov.png";

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Fetch grand total from localStorage
  const fetchGrandTotalFromStorage = () => {
    try {
      const storedGrandTotal = localStorage.getItem('grandTotal');
      if (storedGrandTotal) {
        const grandTotalData = JSON.parse(storedGrandTotal);
        const amount = grandTotalData.amount || 0;
        setGrandTotal(amount);
        return amount;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching grand total:', error);
      return 0;
    }
  };

  const loadData = async () => {
    try {
      const savedMTSData = localStorage.getItem('mtsCoverPageData');
      
      if (savedMTSData) {
        const parsedData = JSON.parse(savedMTSData);
        setFormData({
          ...formData,
          ...parsedData,
          companyLogo: parsedData.companyLogo || governmentLogo,
        });
        
        if (parsedData.companyLogo) {
          setPreviewLogo(parsedData.companyLogo);
        }
      } else {
        await loadDataFromEstimate();
      }
    } catch (error) {
      console.error("Error loading MTS data:", error);
    }
  };

  const loadDataFromEstimate = async () => {
    try {
      const workName = localStorage.getItem('abstractWorkName') || 
                      localStorage.getItem('nameOfWork') || 
                      'CONSTRUCTION OF BT ROAD';
      
      const ssrName = localStorage.getItem('ssrName') || '';
      const ssrYear = localStorage.getItem('ssr') || '';
      const preparedBySignature = localStorage.getItem('preparedBySignature') || 
                                localStorage.getItem('preparedBy') || '';
      
      // Get grand total from localStorage
      const grandTotalAmount = fetchGrandTotalFromStorage();
      
      setFormData(prev => ({
        ...prev,
        companyLogo: governmentLogo,
        workName: workName,
        estimateCost: grandTotalAmount.toString(),
        year: ssrName || ssrYear || '2022-23',
        preparedBy: preparedBySignature,
        workOrderId: `WO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`
      }));

      setPreviewLogo(governmentLogo);
      
    } catch (error) {
      console.error("Error loading estimate data:", error);
    }
  };

  // Listen for grand total updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentGrandTotal = fetchGrandTotalFromStorage();
      if (currentGrandTotal !== grandTotal) {
        setGrandTotal(currentGrandTotal);
        setFormData(prev => ({
          ...prev,
          estimateCost: currentGrandTotal.toString()
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [grandTotal]);

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
    const finalFormData = {
      ...formData,
      estimateCost: grandTotal ? grandTotal.toString() : formData.estimateCost
    };

    localStorage.setItem('mtsCoverPageData', JSON.stringify(finalFormData));
    
    setFormData(finalFormData);
    setShowModal(false);
    setHasUnsavedChanges(false);
    alert("MTS Cover page updated successfully!");
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmCancel) return;
    }
    
    loadData();
    setShowModal(false);
    setHasUnsavedChanges(false);
  };

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const generatePDF = async () => {
    setIsDownloading(true);
    
    try {
      const printWindow = window.open('', '_blank');
      
      const coverPageHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>MTS Cover Page - ${formData.workName}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 0.5in;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', serif;
              font-size: 16px;
              line-height: 1.4;
              color: black;
              background: white;
            }
            
            .page-container {
              width: 100%;
              min-height: 100vh;
              border: 4px solid black;
              position: relative;
            }
            
            .inner-border {
              border: 2px solid black;
              height: calc(100vh - 8px);
              margin: 2px;
              padding: 40px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
            }
            
            .header-section {
              text-align: center;
              width: 100%;
              margin-bottom: 40px;
            }
            
            .logo {
              height: 120px;
              width: 120px;
              object-fit: contain;
              margin-bottom: 25px;
            }
            
            .company-name {
              font-size: 32px;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 25px;
              letter-spacing: 1px;
            }
            
            .address-line {
              font-size: 20px;
              margin-bottom: 18px;
            }
            
            .address-line-red {
              font-size: 20px;
              margin-bottom: 18px;
              color: #dc2626;
              font-weight: 600;
            }
            
            .contact-info {
              font-size: 18px;
              margin-top: 15px;
            }
            
            .middle-content {
              text-align: center;
              width: 100%;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .mts-title-box {
              border: 2px solid black;
              padding: 20px 50px;
              display: inline-block;
              margin: 0 auto 40px auto;
            }
            
            .mts-title {
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            
            .work-details {
              margin-bottom: 35px;
            }
            
            .work-label {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #dc2626;
            }
            
            .work-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #dc2626;
              text-transform: uppercase;
            }
            
            .estimate-cost {
              margin-bottom: 25px;
            }
            
            .cost-text {
              font-size: 20px;
              font-weight: bold;
            }
            
            .sor-details {
              margin-bottom: 25px;
            }
            
            .sor-text {
              font-size: 16px;
              color: #666;
            }
            
            .prepared-by {
              text-align: center;
              width: 100%;
              margin-top: 30px;
            }
            
            .prepared-text {
              font-size: 16px;
              font-weight: bold;
            }
            
            @media print {
              body { print-color-adjust: exact; }
              .page-container { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <div class="inner-border">
              <!-- Header Section -->
              <div class="header-section">
                <img src="${formData.companyLogo || governmentLogo}" alt="Government Logo" class="logo" />
                
                <h1 class="company-name">${formData.companyName}</h1>
                
                <div class="address-line">${formData.addressLine1}</div>
                <div class="address-line">${formData.addressLine2}</div>
                <div class="address-line-red">${formData.addressLine3}</div>
                
                ${formData.contactNo ? `<div class="contact-info">Contact: ${formData.contactNo}</div>` : ''}
              </div>
              
              <!-- Middle Content -->
              <div class="middle-content">
                <!-- MTS Title in Box -->
                <div class="mts-title-box">
                  <div class="mts-title">ESTIMATE</div>
                </div>
                
                <!-- Work Details -->
                <div class="work-details">
                  <p class="work-label">NAME OF WORK</p>
                  <p class="work-name">${formData.workName || 'CONSTRUCTION OF BT ROAD'}</p>
                </div>
                
                <!-- Estimate Cost -->
                <div class="estimate-cost">
                  <p class="cost-text">ESTIMATE COST : Rs. ${formatCurrency(grandTotal || formData.estimateCost || 0)}</p>
                </div>
                
                <!-- SOR Details -->
                <div class="sor-details">
                  <p class="sor-text">ADOPTED SOR OF ${formData.year || '2022-23'}</p>
                </div>
              </div>
              
              <!-- Prepared By -->
              ${formData.preparedBy ? `
                <div class="prepared-by">
                  <p class="prepared-text">Prepared By: ${formData.preparedBy}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(coverPageHTML);
      printWindow.document.close();
      
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsDownloading(false);
        }, 500);
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      setIsDownloading(false);
    }
  };

  const handleDownload = () => {
    generatePDF();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">MTS COVER PAGE</h2>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Edit2 size={18} /> Edit Details
            </button>
            {/* <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={18} /> 
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </button> */}
          </div>
        </div>
        
        {/* MTS Cover Page Display */}
        <div 
          ref={coverPageRef} 
          className="w-full aspect-[1/1.414] border-4 border-black bg-white shadow-lg relative" 
          style={{ maxWidth: '794px', maxHeight: '1123px' }}
        >
          <div className="border-2 border-black h-full m-1">
            <div className="w-full h-full p-8 flex flex-col justify-between items-center">
              
              {/* Header Section */}
              <div className="text-center w-full mb-12">
                <div className="flex justify-center mb-6">
                  <img 
                    src={formData.companyLogo || governmentLogo} 
                    alt="Government Logo" 
                    className="h-24 md:h-32 w-24 md:w-32 object-contain"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzAwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+R292dCBMb2dvPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>
                
                <h1 className="text-2xl md:text-4xl font-bold uppercase mb-4 text-black tracking-wide">
                  {formData.companyName}
                </h1>
                
                <div className="text-xl md:text-2xl mb-6 text-black space-y-4">
                  <p className="mb-4">{formData.addressLine1}</p>
                  <p className="mb-4">{formData.addressLine2}</p>
                  <p className="mb-4 text-red-600 font-semibold">{formData.addressLine3}</p>
                </div>
                
                {/* {formData.contactNo && (
                  <div className="text-xl md:text-2xl text-black">
                    <p>Contact: {formData.contactNo}</p>
                  </div>
                )} */}
              </div>
              
            
             {/* Middle Content */}
              <div className="text-center mb-10 md:mb-16">
                <div className="border-2 border-gray-800 px-12 py-4 md:py-5 inline-block mb-8">
                  <h2 className="text-3xl md:text-5xl font-bold text-blue-600">ESTIMATE</h2>
                </div>
                
                <div className="mb-6 md:mb-10">
                  <p className="text-xl md:text-2xl text-red-600 font-bold mb-4">NAME OF WORK</p>
                  
                  <p className="text-xl md:text-2xl text-red-600 font-bold uppercase mb-6 md:mb-8">
                    {formData.workName || 'CONSTRUCTION OF BT ROAD'}
                  </p>
                </div>
                
                 <div className="mb-6 md:mb-8">
                  <p className="text-lg md:text-2xl font-bold">
                    ESTIMATE COST : Rs. {formatCurrency(grandTotal || formData.estimateCost || '₹0.00')}
                  </p>
                </div>
                 
                <div className="mb-5">
                  <p className="text-base md:text-lg text-gray-600">
                    ADOPTED SOR OF {formData.year || '2022-23'}
                  </p>
                </div>
              </div>
              
              {formData.preparedBy && (
                <div className="text-center">
        <p className="text-lg md:text-xl font-bold text-gray-800">
                    Prepared By: {formData.preparedBy}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto m-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Edit MTS Cover Page Details</h2>
              <button 
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Government Logo</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="w-full text-sm border border-gray-300 rounded-md p-2"
                    />
                    {previewLogo && (
                      <div className="mt-2 flex justify-center">
                        <img src={previewLogo} alt="Logo Preview" className="h-20 object-contain border rounded" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="GOVERNMENT OF MAHARASHTRA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                    <input 
                      type="text" 
                      name="addressLine1" 
                      value={formData.addressLine1} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="PUBLIC WORKS REGION,"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                    <input 
                      type="text" 
                      name="addressLine2" 
                      value={formData.addressLine2} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="PUBLIC WORKS CIRCLE,"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 3</label>
                    <input 
                      type="text" 
                      name="addressLine3" 
                      value={formData.addressLine3} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="P.W.DIVISION."
                    />
                  </div>
                  
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                    <input 
                      type="text" 
                      name="contactNo" 
                      value={formData.contactNo} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="Contact number"
                    />
                  </div> */}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name of Work</label>
                    <textarea 
                      name="workName" 
                      value={formData.workName} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      rows={3}
                      placeholder="Auto-populated from estimate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimate Cost (₹)</label>
                    <input 
                      type="text" 
                      name="estimateCost" 
                      value={`₹${formatCurrency(grandTotal || formData.estimateCost || 0)}`}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-updated from your estimate calculations</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SOR Year</label>
                    <input 
                      type="text" 
                      name="year" 
                      value={formData.year} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="Auto-populated from estimate"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prepared By</label>
                    <input 
                      type="text" 
                      name="preparedBy" 
                      value={formData.preparedBy} 
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md p-3 text-sm"
                      placeholder="Auto-populated from saved signature"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MTSCoverPageGenerator;