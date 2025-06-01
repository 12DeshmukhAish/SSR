import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, RefreshCw, Download, Check, X } from 'lucide-react';

const ConstructionEstimateComponent = () => {
  const [items, setItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [auxiliaryWorks, setAuxiliaryWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);

  // Predefined options for auxiliary works dropdown
  const auxiliaryOptions = [
    'Electrical Works',
    'Add for Supervision',
    'Add For Bore Well',
    'Add for Plumbing Works',
    'Other'
  ];

  // JWT Token
   const jwtToken = localStorage.getItem('authToken');
  
  // API base URL
  const API_BASE_URL = "https://24.101.103.87:8082/api";

  // Function to load abstract data
  const loadAbstractData = () => {
    try {
      const abstractItems = localStorage.getItem("abstractItems");
      
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
    setAuxiliaryWorks(newAuxWorks);
  };
  
  // Add new auxiliary work
  const addAuxiliaryWork = () => {
    setAuxiliaryWorks([
      ...auxiliaryWorks,
      { description: auxiliaryOptions[0], customDescription: '', percentage: 0, amount: 0 }
    ]);
  };
  
  // Remove auxiliary work
  const removeAuxiliaryWork = (index) => {
    const newAuxWorks = auxiliaryWorks.filter((_, i) => i !== index);
    setAuxiliaryWorks(newAuxWorks);
    
    // Recalculate amounts for remaining auxiliary works
    const updatedAuxWorks = newAuxWorks.map(aux => ({
      ...aux,
      amount: totalCost * (aux.percentage / 100)
    }));
    setAuxiliaryWorks(updatedAuxWorks);
  };

  // Save auxiliary work
  const saveAuxiliaryWork = (index) => {
    // You can add any validation or API call here if needed
    console.log('Auxiliary work saved:', auxiliaryWorks[index]);
  };
  
  // Calculate subtotal (main items + auxiliary works)
  const subtotal = totalCost + auxiliaryWorks.reduce((sum, aux) => sum + aux.amount, 0);
  
  // Calculate GST amount
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
                <p><strong>Total Cost:</strong> Rs. ${grandTotal.toFixed(2)}</p>
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
                  <td colspan="6" class="text-right"><strong>Total:</strong></td>
                  <td class="text-right"><strong>${totalCost.toFixed(2)}</strong></td>
                </tr>
                ${auxiliaryWorks.map((aux, index) => `
                  <tr>
                    <td colspan="6" class="text-right">
                      ${aux.description === 'Other' ? aux.customDescription : aux.description} (${aux.percentage}%):
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
          grandTotal: grandTotal,
          savedAt: new Date().toISOString()
        };
        
        // Save to memory (using state variables)
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
        <div className="flex justify-end mb-4">
          <div className="font-semibold text-lg">Total Cost: Rs. {grandTotal.toFixed(2)}</div>
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
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Total:</td>
              <td className="border border-gray-300 p-2 text-right font-bold">{totalCost.toFixed(2)}</td>
            </tr>
            {auxiliaryWorks.map((aux, index) => (
              <tr key={`aux-display-${index}`}>
                <td colSpan="6" className="border border-gray-300 p-2 text-right">
                  {aux.description === 'Other' ? aux.customDescription : aux.description} ({aux.percentage}%):
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
                    Add Item
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
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={aux.percentage}
                          onChange={(e) => handleAuxiliaryPercentageChange(index, e.target.value)}
                          className="w-20 border border-gray-300 rounded p-2"
                          placeholder="%"
                          step="0.1"
                          min="0"
                        />
                        <span className="mx-2">%</span>
                      </div>
                      <div className="w-32 text-right font-semibold">Rs. {aux.amount.toFixed(2)}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAuxiliaryWork(index)}
                          className="bg-green-500 hover:bg-green-600 text-white rounded p-2"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => removeAuxiliaryWork(index)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded p-2"
                          title="Cancel/Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    {aux.description === 'Other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={aux.customDescription || ''}
                          onChange={(e) => handleAuxiliaryCustomDescriptionChange(index, e.target.value)}
                          className="w-full border border-gray-300 rounded p-2"
                          placeholder="Enter custom description"
                        />
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            
            <tr>
              <td colSpan="5" className="border border-gray-300 p-2 text-right">
                GST:
              </td>
              <td className="border border-gray-300 p-2 text-center">
                <input
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                  className="w-16 text-center border-0 bg-transparent"
                  step="0.1"
                  min="0"
                />%
              </td>
              <td className="border border-gray-300 p-2 text-right">{gstAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold text-lg">Grand Total:</td>
              <td className="border border-gray-300 p-2 text-right font-bold text-lg">Rs. {grandTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Save/Submit buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={generatePDF}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded flex items-center gap-2"
        >
          <Download size={16} /> Download PDF
        </button>
        <button
          onClick={handleSaveEstimate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center gap-2"
        >
          <Save size={16} /> Save Estimate
        </button>
      </div>
    </div>
  );
};

export default ConstructionEstimateComponent;