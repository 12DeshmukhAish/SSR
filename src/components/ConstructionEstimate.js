import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, RefreshCw, Download, Check, X, Eye } from 'lucide-react';

const ConstructionEstimateComponent = () => {
  const [items, setItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [auxiliaryWorks, setAuxiliaryWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Predefined options for auxiliary works dropdown
  const auxiliaryOptions = [
    'Electrical Works',
    'Add for Supervision',
    'Add For Bore Well',
    'Add for Plumbing Works',
    'Other'
  ];

  // JWT Token (Note: In production, avoid localStorage for tokens)
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // API base URL
  const API_BASE_URL = "https://24.101.103.87:8082/api";

  // Function to load abstract data
  const loadAbstractData = () => {
    try {
      const abstractItems = typeof window !== 'undefined' ? localStorage.getItem("abstractItems") : null;
      
      if (!abstractItems) {
        console.log("No abstract data found in localStorage");
        return false;
      }
      
      const parsedItems = JSON.parse(abstractItems);
      
      if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
        console.log("Invalid or empty abstract data");
        return false;
      }
      
      const formattedItems = parsedItems.map((item, index) => {
        return {
          id: item.id || `local-${index}`,
          srNo: index + 1,
          itemNo: item.itemNo,
          description: item.descriptionOfItem,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.completedRate) || 0,
          unit: item.fullUnit || item.smallUnit || "",
          amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.completedRate) || 0),
        };
      });
      
      setItems(formattedItems);
      
      const total = formattedItems.reduce((sum, item) => sum + item.amount, 0);
      setTotalCost(total);
      
      return true;
    } catch (error) {
      console.error("Error loading abstract data:", error);
      return false;
    }
  };

  // Safe JSON parsing function with error handling
  const safeJsonParse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON response:", text.substring(0, 100) + "...");
      throw new Error(`Invalid JSON response from server. Received: ${text.substring(0, 100)}...`);
    }
  };

  // Fetch items from API
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const itemsResponse = await fetch(`${API_BASE_URL}/txn-items`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!itemsResponse.ok) {
        throw new Error(`Failed to fetch items: ${itemsResponse.status} ${itemsResponse.statusText}`);
      }
      
      const itemsData = await safeJsonParse(itemsResponse);
      
      const processedItems = itemsData.map((item, index) => {
        return {
          id: item.id,
          srNo: index + 1,
          itemNo: item.itemNo,
          description: item.descriptionOfItem,
          quantity: parseFloat(item.quantity) || 0,
          rate: parseFloat(item.completedRate) || 0,
          unit: item.fullUnit || item.smallUnit || "",
          amount: (parseFloat(item.quantity) || 0) * (parseFloat(item.completedRate) || 0),
        };
      });
      
      setItems(processedItems);
      
      const total = processedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalCost(total);
      
      setLoading(false);
      setIsOfflineMode(false);
      
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      setLoading(false);
      
      if (window.confirm("Failed to load data from server. Would you like to continue in offline mode?")) {
        setIsOfflineMode(true);
        if (!loadAbstractData()) {
          setItems([]);
          setTotalCost(0);
          setAuxiliaryWorks([]);
        }
      }
    }
  };
  
  useEffect(() => {
    const abstractLoaded = loadAbstractData();
    
    if (!abstractLoaded) {
      fetchItems();
    } else {
      setLoading(false);
      setIsOfflineMode(false);
    }
  }, []);
  
  // Handle auxiliary description change
  const handleAuxiliaryDescriptionChange = (index, value) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].description = value;
    setAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary custom description change
  const handleAuxiliaryCustomDescriptionChange = (index, value) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].customDescription = value;
    setAuxiliaryWorks(newAuxWorks);
  };
  
  // Handle auxiliary percentage change
  const handleAuxiliaryPercentageChange = (index, value) => {
    const newPercentage = parseFloat(value) || 0;
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].percentage = newPercentage;
    newAuxWorks[index].amount = totalCost * (newPercentage / 100);
    newAuxWorks[index].isPercentage = true;
    setAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary fixed amount change
  const handleAuxiliaryAmountChange = (index, value) => {
    const newAmount = parseFloat(value) || 0;
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].amount = newAmount;
    newAuxWorks[index].percentage = 0;
    newAuxWorks[index].isPercentage = false;
    setAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary type change (percentage vs fixed amount)
  const handleAuxiliaryTypeChange = (index, isPercentage) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].isPercentage = isPercentage;
    if (isPercentage) {
      newAuxWorks[index].amount = totalCost * (newAuxWorks[index].percentage / 100);
    } else {
      newAuxWorks[index].percentage = 0;
    }
    setAuxiliaryWorks(newAuxWorks);
  };
  
  // Add new auxiliary work
  const addAuxiliaryWork = () => {
    setAuxiliaryWorks([
      ...auxiliaryWorks,
      { 
        description: auxiliaryOptions[0], 
        customDescription: '', 
        percentage: 0, 
        amount: 0, 
        isPercentage: true 
      }
    ]);
  };
  
  // Remove auxiliary work
  const removeAuxiliaryWork = (index) => {
    const newAuxWorks = auxiliaryWorks.filter((_, i) => i !== index);
    setAuxiliaryWorks(newAuxWorks);
  };

  // Save auxiliary work
  const saveAuxiliaryWork = (index) => {
    console.log('Auxiliary work saved:', auxiliaryWorks[index]);
  };
  
  // Calculate subtotal (main items + auxiliary works)
  const subtotal = totalCost + auxiliaryWorks.reduce((sum, aux) => sum + aux.amount, 0);
  
  // Calculate GST amount on subtotal
  const gstAmount = subtotal * (gstPercentage / 100);
  
  // Calculate grand total (subtotal + GST)
  const grandTotal = subtotal + gstAmount;
  
  // Generate and download PDF
  const generatePDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow pop-ups to generate PDF');
        return;
      }
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Construction Estimate</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
              }
              h1 {
                text-align: center;
                margin-bottom: 20px;
              }
              .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .text-right {
                text-align: right;
              }
              .text-center {
                text-align: center;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
              .grand-total {
                font-weight: bold;
                font-size: 16px;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 15px;
                }
                button {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #4CAF50; color: white; border: none; cursor: pointer; float: right; margin-bottom: 20px;">Print / Save as PDF</button>
            
            <h1>CONSTRUCTION ESTIMATE</h1>
            
            <div class="info-section">
              <div>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Grand Total:</strong> Rs. ${grandTotal.toFixed(2)}</p>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Item No.</th>
                  <th>Item of work</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Unit</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((item, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${item.itemNo}</td>
                    <td>${item.description}</td>
                    <td class="text-right">${parseFloat(item.quantity).toFixed(2)}</td>
                    <td class="text-right">${parseFloat(item.rate).toFixed(2)}</td>
                    <td class="text-center">${item.unit}</td>
                    <td class="text-right">${(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right"><strong>Main Items Total:</strong></td>
                  <td class="text-right"><strong>${totalCost.toFixed(2)}</strong></td>
                </tr>
                ${auxiliaryWorks.map((aux, index) => `
                  <tr>
                    <td colspan="6" class="text-right">
                      ${aux.description === 'Other' ? aux.customDescription : aux.description}${aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
                    </td>
                    <td class="text-right">${aux.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="6" class="text-right"><strong>Subtotal:</strong></td>
                  <td class="text-right"><strong>${subtotal.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colspan="6" class="text-right">GST (${gstPercentage}%):</td>
                  <td class="text-right">${gstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-right grand-total">Grand Total:</td>
                  <td class="text-right grand-total">Rs. ${grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div class="footer">
              This is a computer-generated document. No signature required.
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };
  
  // Handle save estimate
  const handleSaveEstimate = async () => {
    try {
      setError(null);
      
      if (isOfflineMode) {
        const estimateData = {
          items: items,
          totalCost: totalCost,
          auxiliaryWorks: auxiliaryWorks,
          gstPercentage: gstPercentage,
          gstAmount: gstAmount,
          subtotal: subtotal,
          grandTotal: grandTotal,
          savedAt: new Date().toISOString()
        };
        
        alert('Estimate saved locally (offline mode). Connect to server to sync data.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/save-estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            itemNo: item.itemNo,
            descriptionOfItem: item.description,
            quantity: item.quantity,
            completedRate: item.rate,
            fullUnit: item.unit
          })),
          totalCost: totalCost,
          auxiliaryWorks: auxiliaryWorks,
          gstPercentage: gstPercentage,
          gstAmount: gstAmount,
          subtotal: subtotal,
          grandTotal: grandTotal
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save estimate: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      alert('Estimate saved successfully!');
    } catch (err) {
      console.error("Error saving estimate:", err);
      setError(err.message);
      
      if (window.confirm("Failed to save to server. Would you like to save locally instead?")) {
        alert('Estimate saved locally. Connect to server to sync data.');
      }
    }
  };

  // Preview Modal Component
  const PreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Estimate Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close Preview
              </button>
            </div>
            
            <div className="border border-gray-300 p-6 bg-white" style={{minHeight: '600px'}}>
              <h1 className="text-2xl font-bold text-center mb-6">CONSTRUCTION ESTIMATE</h1>
              
              <div className="flex justify-between mb-6">
                <div>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p><strong>Grand Total:</strong> Rs. {grandTotal.toFixed(2)}</p>
                </div>
              </div>
              
              <table className="w-full border-collapse border border-gray-300 mb-6">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2">Sr. No.</th>
                    <th className="border border-gray-300 p-2">Item No.</th>
                    <th className="border border-gray-300 p-2">Item of work</th>
                    <th className="border border-gray-300 p-2">Qty</th>
                    <th className="border border-gray-300 p-2">Rate</th>
                    <th className="border border-gray-300 p-2">Unit</th>
                    <th className="border border-gray-300 p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.itemNo}</td>
                      <td className="border border-gray-300 p-2">{item.description}</td>
                      <td className="border border-gray-300 p-2 text-right">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">{parseFloat(item.rate).toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                      <td className="border border-gray-300 p-2 text-right">{(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Main Items Total:</td>
                    <td className="border border-gray-300 p-2 text-right font-bold">{totalCost.toFixed(2)}</td>
                  </tr>
                  {auxiliaryWorks.map((aux, index) => (
                    <tr key={`aux-preview-${index}`}>
                      <td colSpan="6" className="border border-gray-300 p-2 text-right">
                        {aux.description === 'Other' ? aux.customDescription : aux.description}
                        {aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
                      </td>
                      <td className="border border-gray-300 p-2 text-right">{aux.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Subtotal:</td>
                    <td className="border border-gray-300 p-2 text-right font-bold">{subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="border border-gray-300 p-2 text-right">GST ({gstPercentage}%):</td>
                    <td className="border border-gray-300 p-2 text-right">{gstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold text-lg">Grand Total:</td>
                    <td className="border border-gray-300 p-2 text-right font-bold text-lg">Rs. {grandTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="text-center text-sm text-gray-600 mt-8">
                This is a computer-generated document. No signature required.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-lg">Loading estimate data...</div>
      </div>
    );
  }

  if (error && !isOfflineMode) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center">
        <AlertTriangle size={36} className="text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-700 mb-2">Error Loading Data</h2>
        <p className="text-red-600 mb-4 text-center max-w-2xl">{error}</p>
        <div className="flex gap-4">
          <button 
            onClick={fetchItems}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
          <button 
            onClick={() => {
              setIsOfflineMode(true);
              loadAbstractData();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Continue in Offline Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full p-4">
      {isOfflineMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle size={20} />
            <span className="font-semibold">Offline Mode</span>
          </div>
          <p className="text-yellow-600 text-sm mt-1">
            You're working offline. Your changes will be saved locally until you reconnect.
          </p>
          <button 
            onClick={fetchItems}
            className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            <RefreshCw size={14} /> Try to reconnect
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-4">CONSTRUCTION ESTIMATE</h1>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <Eye size={16} /> PDF Preview
            </button>
           
           
          </div>
          <div className="font-semibold text-lg">Grand Total: Rs. {grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Sr. No.</th>
              <th className="border border-gray-300 p-2">Item No.</th>
              <th className="border border-gray-300 p-2 w-1/3">Item of work</th>
              <th className="border border-gray-300 p-2">Qty</th>
              <th className="border border-gray-300 p-2">Rate</th>
              <th className="border border-gray-300 p-2">Unit</th>
              <th className="border border-gray-300 p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.itemNo}</td>
                  <td className="border border-gray-300 p-2">{item.description}</td>
                  <td className="border border-gray-300 p-2 text-right">{parseFloat(item.quantity).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">{parseFloat(item.rate).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                  <td className="border border-gray-300 p-2 text-right">{(parseFloat(item.quantity) * parseFloat(item.rate)).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="border border-gray-300 p-4 text-center">
                  No items available. {isOfflineMode ? 
                    "Please add items manually or try to reconnect to server." : 
                    "Please check your connection and try again."}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Main Items Total:</td>
              <td className="border border-gray-300 p-2 text-right font-bold">{totalCost.toFixed(2)}</td>
            </tr>
            {auxiliaryWorks.map((aux, index) => (
              <tr key={`aux-display-${index}`}>
                <td colSpan="6" className="border border-gray-300 p-2 text-right">
                  {aux.description === 'Other' ? aux.customDescription : aux.description} 
                  {aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
                </td>
                <td className="border border-gray-300 p-2 text-right">{aux.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Subtotal:</td>
              <td className="border border-gray-300 p-2 text-right font-bold">{subtotal.toFixed(2)}</td>
            </tr>
            
            {/* Add Item Button Row */}
            <tr>
              <td colSpan="7" className="border border-gray-300 p-2">
                <div className="flex justify-start">
                  <button
                    onClick={addAuxiliaryWork}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Add Auxiliary Work
                  </button>
                </div>
              </td>
            </tr>
            
            {/* Auxiliary Works Input Fields */}
            {auxiliaryWorks.map((aux, index) => (
              <tr key={`aux-input-${index}`}>
                <td colSpan="7" className="border border-gray-300 p-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-3 mb-2">
                      <select
                        value={aux.description}
                        onChange={(e) => handleAuxiliaryDescriptionChange(index, e.target.value)}
                        className="flex-grow border border-gray-300 rounded p-2"
                      >
                        {auxiliaryOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      
<div className="flex items-center gap-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`auxType-${index}`}
                            checked={aux.isPercentage}
                            onChange={() => handleAuxiliaryTypeChange(index, true)}
                            className="mr-1"
                          />
                          %
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name={`auxType-${index}`}
                            checked={!aux.isPercentage}
                            onChange={() => handleAuxiliaryTypeChange(index, false)}
                            className="mr-1"
                          />
                          Fixed
                        </label>
                      </div>
                      
                      <button
                        onClick={() => removeAuxiliaryWork(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                        title="Remove Auxiliary Work"
                      >
                        <X size={16} />
                      </button>
                      
                      <button
                        onClick={() => saveAuxiliaryWork(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                        title="Save Auxiliary Work"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                    
                    {aux.description === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter custom description"
                        value={aux.customDescription}
                        onChange={(e) => handleAuxiliaryCustomDescriptionChange(index, e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 mb-2"
                      />
                    )}
                    
                    <div className="flex items-center gap-3">
                      {aux.isPercentage ? (
                        <div className="flex items-center gap-2">
                          <label>Percentage:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={aux.percentage}
                            onChange={(e) => handleAuxiliaryPercentageChange(index, e.target.value)}
                            className="border border-gray-300 rounded p-2 w-24"
                            placeholder="%"
                          />
                          <span>%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label>Fixed Amount:</label>
                          <input
                            type="number"
                            step="0.01"
                            value={aux.amount}
                            onChange={(e) => handleAuxiliaryAmountChange(index, e.target.value)}
                            className="border border-gray-300 rounded p-2 w-32"
                            placeholder="Amount"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <label>Amount: Rs.</label>
                        <span className="font-semibold">{aux.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* GST Row */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <label>GST:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                    className="border border-gray-300 rounded p-1 w-20 text-center"
                    placeholder="0"
                  />
                  <span>%</span>
                </div>
              </td>
              <td className="border border-gray-300 p-2 text-right">{gstAmount.toFixed(2)}</td>
            </tr>
            
            {/* Grand Total Row */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold text-lg">Grand Total:</td>
              <td className="border border-gray-300 p-2 text-right font-bold text-lg">Rs. {grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <span className="font-semibold">Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <PreviewModal />
    </div>
  );
};

export default ConstructionEstimateComponent;