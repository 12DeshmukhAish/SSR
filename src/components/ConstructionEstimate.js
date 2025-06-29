
import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2, Download, FileText, X, Check, AlertTriangle, RotateCcw } from 'lucide-react';
const ConstructionEstimateComponent = () => {
  const [items, setItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [auxiliaryWorks, setAuxiliaryWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);
 const [signatures, setSignatures] = useState({
  preparedBy: '',
  checkedBy: ''
});
  const [workName, setWorkName] = useState('');
  const [mtsData, setMtsData] = useState({});
  const [loadingMts, setLoadingMts] = useState(false);
 const [showClearModal, setShowClearModal] = useState(false);
  const [clearOptions, setClearOptions] = useState({
    items: false,
    auxiliaryWorks: false,
    gstPercentage: false,
    workName: false,
    signatures: false,
    mtsData: false,
    all: false
  });
  // Predefined options for auxiliary works dropdown
  const auxiliaryOptions = [
    'Electrical Works',
    'Supervision', 
    'Bore Well',
    'Plumbing Works',
    'Other'
  ];

  // JWT Token 
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  // API base URL
  const API_BASE_URL = "https://24.101.103.87:8082/api";
// Clear data functions
   const clearItemsData = () => {
    // Clear abstract items from localStorage but keep subRecordCache
    localStorage.removeItem('abstractItems');
    localStorage.removeItem('selectedItems'); 
    localStorage.removeItem('itemSelections');
    localStorage.removeItem('processedItems');
    localStorage.removeItem('tempItems');
    localStorage.removeItem('draftItems');
    
    // Keep subRecordCache but reload items only from it
    const subRecordCache = localStorage.getItem('subRecordCache');
    if (subRecordCache) {
      try {
        const itemsObject = JSON.parse(subRecordCache);
        let itemsArray = Object.values(itemsObject).flat();
        
        const formattedItems = itemsArray.map((item, index) => ({
          id: item.id || `cache-${index}`,
          srNo: index + 1,
          itemNo: item.itemNo,
          description: item.descriptionOfItem,
          quantity: 0,
          rate: parseFloat(item.completedRate) || 0,
          unit: item.fullUnit || item.smallUnit || "",
          amount: 0,
          rawItem: item
        }));
        
        setItems(formattedItems);
        setTotalCost(0);
        setMtsData({});
        console.log('Abstract items cleared, items reloaded from subRecordCache only');
      } catch (error) {
        console.error('Error reloading from subRecordCache:', error);
        setItems([]);
        setTotalCost(0);
        setMtsData({});
      }
    } else {
      setItems([]);
      setTotalCost(0);
      setMtsData({});
      console.log('No subRecordCache found, items cleared completely');
    }
  };
  const clearAuxiliaryWorksData = () => {
    localStorage.removeItem('dynamicAdditions');
    setAuxiliaryWorks([]);
    console.log('Auxiliary works data cleared');
  };

  const clearGstData = () => {
    localStorage.removeItem('gstPercentage');
    setGstPercentage(0);
    console.log('GST percentage cleared');
  };

  const clearWorkNameData = () => {
    localStorage.removeItem('nameOfWork');
    setWorkName('');
    console.log('Work name cleared');
  };

  const clearSignaturesData = () => {
    localStorage.removeItem('preparedBySignature');
    localStorage.removeItem('preparedBy');
    localStorage.removeItem('checkedBySignature');
    localStorage.removeItem('checkedBy');
    setSignatures({ preparedBy: '', checkedBy: '' });
    console.log('Signatures data cleared');
  };

  const clearMtsDataCache = () => {
    // Clear any MTS-related cache if exists
    setMtsData({});
    console.log('MTS data cache cleared');
  };

  const clearAllData = () => {
    clearItemsData();
    clearAuxiliaryWorksData();
    clearGstData();
    clearWorkNameData();
    clearSignaturesData();
    clearMtsDataCache();
    console.log('All estimate data cleared');
  };

  // Handle clear options change
  const handleClearOptionChange = (option) => {
    if (option === 'all') {
      const newAllState = !clearOptions.all;
      setClearOptions({
        items: newAllState,
        auxiliaryWorks: newAllState,
        gstPercentage: newAllState,
        workName: newAllState,
        signatures: newAllState,
        mtsData: newAllState,
        all: newAllState
      });
    } else {
      const newOptions = {
        ...clearOptions,
        [option]: !clearOptions[option],
        all: false
      };
      setClearOptions(newOptions);
    }
  };

  // Execute clear operation
  const executeClearOperation = () => {
    let clearedItems = [];
    
    if (clearOptions.all) {
      clearAllData();
      clearedItems = ['All data'];
    } else {
      if (clearOptions.items) {
        clearItemsData();
        clearedItems.push('Abstract items (subRecordCache preserved)');
      }
      if (clearOptions.auxiliaryWorks) {
        clearAuxiliaryWorksData();
        clearedItems.push('Auxiliary works');
      }
      if (clearOptions.gstPercentage) {
        clearGstData();
        clearedItems.push('GST percentage');
      }
      if (clearOptions.workName) {
        clearWorkNameData();
        clearedItems.push('Work name');
      }
      if (clearOptions.signatures) {
        clearSignaturesData();
        clearedItems.push('Signatures');
      }
      if (clearOptions.mtsData) {
        clearMtsDataCache();
        clearedItems.push('MTS cache');
      }
    }

    // Reset clear options
    setClearOptions({
      items: false,
      auxiliaryWorks: false,
      gstPercentage: false,
      workName: false,
      signatures: false,
      mtsData: false,
      all: false
    });

    setShowClearModal(false);
    
    // Show success message
    if (clearedItems.length > 0) {
      alert(`Successfully cleared: ${clearedItems.join(', ')}`);
    }
  };
  // Load auxiliary works from localStorage
  const loadAuxiliaryWorks = () => {
    try {
      const storedAuxWorks = localStorage.getItem('dynamicAdditions');
      if (storedAuxWorks) {
        const parsedAuxWorks = JSON.parse(storedAuxWorks);
        const formattedAuxWorks = Object.entries(parsedAuxWorks).map(([key, value]) => ({
          id: key,
          description: value.label,
          customDescription: '',
          percentage: value.percent || 0,
          amount: (totalCost * (value.percent || 0)) / 100,
          isPercentage: true
        }));
        setAuxiliaryWorks(formattedAuxWorks);
      }
    } catch (error) {
      console.error('Error loading auxiliary works:', error);
    }
  };
// Handle GST percentage change
const handleGstPercentageChange = (value) => {
  const newGstPercentage = parseFloat(value) || 0;
  setGstPercentage(newGstPercentage);
  saveGstPercentage(newGstPercentage); // Save to localStorage
};
// Save GST percentage to localStorage
const saveGstPercentage = (gstValue) => {
  try {
    localStorage.setItem('gstPercentage', gstValue.toString());
  } catch (error) {
    console.error('Error saving GST percentage:', error);
  }
};

// Load GST percentage from localStorage
const loadGstPercentage = () => {
  try {
    const storedGst = localStorage.getItem('gstPercentage');
    if (storedGst) {
      setGstPercentage(parseFloat(storedGst) || 0);
    }
  } catch (error) {
    console.error('Error loading GST percentage:', error);
  }
};

// Alternative helper function if you want more control over formatting
const formatIndianCurrencyCustom = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `₹ ${formatter.format(amount)}`;
};
const formatIndianCurrency = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '₹0.00';
  
  // Convert to Indian numbering system (lakhs, crores)
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `₹${formatted}`;
};

// Updated PDF Generation Function
const generatePDF = () => {
  try {
    const totals = calculateTotals();
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
            @page {
              size: A4;
              margin: 15mm;
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10px;
              color: #333;
              font-size: 11px;
              line-height: 1.3;
              background-color: white;
            }
            
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            h1 {
              text-align: center;
              margin: 0 0 15px 0;
              font-size: 20px;
              font-weight: bold;
              page-break-after: avoid;
            }
            
            .work-name {
              text-align: center;
              margin: 0 0 15px 0;
              font-size: 16px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              page-break-after: avoid;
            }
            
            .header-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              font-weight: bold;
              page-break-after: avoid;
            }
            
            .main-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0;
              font-size: 10px;
              background-color: white;
              page-break-inside: auto;
            }
            
            .main-table th,
            .main-table td {
              border: 1px solid #000;
              padding: 4px;
              text-align: left;
              vertical-align: top;
              background-color: white;
            }
            
            .main-table th {
              background-color: #f5f5f5 !important;
              font-weight: bold;
              text-align: center;
              page-break-after: avoid;
            }
            
            .main-table tbody tr {
              page-break-inside: avoid;
            }
            
            .main-table tbody td {
              background-color: white !important;
            }
            
            .main-table tfoot td {
              background-color: #f9fafb !important;
              font-weight: bold;
            }
            
            .main-table tfoot tr {
              page-break-inside: avoid;
            }
            
            .text-center {
              text-align: center !important;
            }
            
            .text-right {
              text-align: right !important;
            }
            
            .col-sr { width: 5%; }
            .col-item { width: 8%; }
            .col-desc { width: 45%; }
            .col-qty { width: 10%; }
            .col-rate { width: 10%; }
            .col-unit { width: 10%; }
            .col-amount { width: 12%; }
            
            .grand-total-row {
              font-weight: bold !important;
              font-size: 12px !important;
              background-color: #e5e7eb !important;
            }
            
            .grand-total-row td {
              background-color: #e5e7eb !important;
              font-weight: bold !important;
              font-size: 12px !important;
            }
            
            .signature-section {
              margin-top: 30px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              page-break-inside: avoid;
              page-break-before: avoid;
            }
            
            .signature-box {
              text-align: center;
              min-width: 180px;
              background-color: white;
              padding: 6px;
            }
            
            .signature-line {
              border-bottom: 1px solid #9ca3af;
              height: 50px;
              display: flex;
              align-items: flex-end;
              justify-content: center;
              padding-bottom: 6px;
              margin-bottom: 6px;
            }
            
            .signature-label {
              font-weight: bold;
              margin-bottom: 3px;
              font-size: 10px;
            }
            
            .signature-name {
              font-weight: bold;
              font-size: 10px;
            }
            
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 9px;
              color: #666;
              page-break-inside: avoid;
            }
            
            /* Ensure content fits on page */
            .page-content {
              min-height: calc(100vh - 60px);
              display: flex;
              flex-direction: column;
            }
            
            .main-content {
              flex: 1;
            }
            
            @media print {
              @page {
                size: A4;
                margin: 10mm;
              }
              
              body {
                margin: 0;
                padding: 5px;
                font-size: 10px;
                line-height: 1.2;
              }
              
              button {
                display: none !important;
              }
              
              .no-print {
                display: none !important;
              }
              
              h1 {
                font-size: 18px;
                margin: 0 0 10px 0;
              }
              
              .work-name {
                font-size: 14px;
                margin: 0 0 10px 0;
              }
              
              .header-info {
                margin-bottom: 10px;
              }
              
              .main-table {
                font-size: 9px;
              }
              
              .main-table th,
              .main-table td {
                padding: 3px;
              }
              
              .signature-section {
                margin-top: 20px;
                margin-bottom: 10px;
              }
              
              .signature-box {
                min-width: 150px;
              }
              
              .signature-line {
                height: 40px;
              }
              
              /* Force content to fit on one page if possible */
              .container {
                max-height: 95vh;
                overflow: hidden;
              }
              
              /* Reduce spacing for print */
              .main-table tfoot tr td {
                padding: 2px 4px;
              }
            }
          </style>
        </head>
        <body>
          <button onclick="window.print()" class="no-print" style="padding: 6px 12px; background-color: #4CAF50; color: white; border: none; cursor: pointer; float: right; margin-bottom: 15px; border-radius: 3px; font-size: 12px;">Print / Save as PDF</button>
          
          <div class="container">
            <div class="page-content">
              <div class="main-content">
                <h1>CONSTRUCTION ESTIMATE</h1>
                
                ${workName ? `<div class="work-name">Work: ${workName.toUpperCase()}</div>` : ''}
                
                <div class="header-info">
                  <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
                  <div>Grand Total: ${totals.grandTotal.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 2
                  })}</div>
                </div>
                
                <table class="main-table">
                  <thead>
                    <tr>
                      <th class="col-sr">Sr. No.</th>
                      <th class="col-desc">Item of work</th>
                      <th class="col-item">SSRItem No.</th>
                      
                      <th class="col-qty">Qty</th>
                      <th class="col-rate">Rate</th>
                      <th class="col-unit">Unit</th>
                      <th class="col-amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.map((item) => `
                      <tr>
                        <td class="text-center">${item.srNo}</td>
                         <td>${item.description}</td>
                        <td class="text-center">${item.itemNo}</td>
                       
                        <td class="text-right">${parseFloat(item.quantity).toFixed(2)}</td>
                        <td class="text-right">${parseFloat(item.rate).toFixed(2)}</td>
                        <td class="text-center">${item.unit}</td>
                        <td class="text-right">${item.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="6" class="text-right">Main Items Total:</td>
                      <td class="text-right">${totals.itemsTotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2
                      }).replace('₹', '₹')}</td>
                    </tr>
                    ${auxiliaryWorks.map((aux) => `
                      <tr>
                        <td colspan="6" class="text-right">
                          ${aux.description === 'Other' ? aux.customDescription : aux.description}${aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
                        </td>
                        <td class="text-right">${aux.amount.toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 2
                        }).replace('₹', '₹')}</td>
                      </tr>
                    `).join('')}
                    <tr>
                      <td colspan="6" class="text-right">Subtotal:</td>
                      <td class="text-right">${totals.subtotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2
                      }).replace('₹', '₹')}</td>
                    </tr>
                    <tr>
                      <td colspan="6" class="text-right">GST (${gstPercentage}%):</td>
                      <td class="text-right">${totals.gstAmount.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2
                      }).replace('₹', '₹')}</td>
                    </tr>
                    <tr class="grand-total-row">
                      <td colspan="6" class="text-right">Grand Total:</td>
                      <td class="text-right">${totals.grandTotal.toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 2
                      })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div class="signature-section">
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <p class="signature-label">Prepared By</p>
                  <span class="signature-name">${signatures.preparedBy || ''}</span>
                </div>
                
                <div class="signature-box">
                  <div class="signature-line"></div>
                  <p class="signature-label">Checked By</p>
                  <span class="signature-name">${signatures.checkedBy || ''}</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Give the document time to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 1000);
    
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert(`Failed to generate PDF: ${err.message}`);
  }
};
  // Save auxiliary works to localStorage
  const saveAuxiliaryWorks = (auxWorks) => {
    try {
      const formattedForStorage = {};
      auxWorks.forEach(work => {
        if (work.description && (work.percentage > 0 || work.amount > 0)) {
          const key = work.id || work.description.toLowerCase().replace(/\s+/g, '');
          formattedForStorage[key] = {
            label: work.customDescription || work.description,
            percent: work.isPercentage ? work.percentage : (work.amount / totalCost) * 100
          };
        }
      });
      localStorage.setItem('dynamicAdditions', JSON.stringify(formattedForStorage));
    } catch (error) {
      console.error('Error saving auxiliary works:', error);
    }
  };

  // Load work name from localStorage
  const loadWorkName = () => {
    const storedWorkName = localStorage.getItem('nameOfWork');
    if (storedWorkName) {
      setWorkName(storedWorkName);
    }
  };

  // Load signature data from localStorage
  const loadSignatureData = () => {
  try {
    const preparedBy = localStorage.getItem('preparedBySignature') || 
                      localStorage.getItem('preparedBy') || '';
    const checkedBy = localStorage.getItem('checkedBySignature') || 
                     localStorage.getItem('checkedBy') || '';
    
    setSignatures({
      preparedBy,
      checkedBy
    });
  } catch (error) {
    console.error("Error loading signature data:", error);
  }
};

  // Function to load items from localStorage (subRecordCache)
  const loadItemsFromCache = () => {
    try {
      console.log('Loading items from localStorage...');
      
      const storedItems = localStorage.getItem("subRecordCache");
      
      if (!storedItems) {
        console.log("No cached items found in localStorage");
        return false;
      }
      
      const itemsObject = JSON.parse(storedItems);
      
      // Convert object values into a single array (following your original logic)
      let itemsArray = Object.values(itemsObject).flat();
      
      if (!Array.isArray(itemsArray)) {
        console.error("Converted data is not an array!", itemsArray);
        itemsArray = [];
      }
      
      if (itemsArray.length === 0) {
        console.log("No items in cached data");
        return false;
      }
      
      const formattedItems = itemsArray.map((item, index) => ({
        id: item.id || `local-${index}`,
        srNo: index + 1,
        itemNo: item.itemNo,
        description: item.descriptionOfItem,
        quantity: 0, // Will be calculated from MTS data
        rate: parseFloat(item.completedRate) || 0,
        unit: item.fullUnit || item.smallUnit || "",
        amount: 0, // Will be calculated after MTS fetch
        rawItem: item // Keep original item for MTS fetching
      }));
      
      setItems(formattedItems);
      console.log(`Successfully loaded ${formattedItems.length} items from localStorage`);
      
      // Fetch MTS data for all items
      fetchAllMtsData(formattedItems);
      
      return true;
      
    } catch (error) {
      console.error("Error loading items from cache:", error);
      return false;
    }
  };

  // Fetch MTS data for a single item (following your original logic)
  const fetchMtsForItem = async (itemId, authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/txn-items-mts/ByItemId/${itemId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch MTS for item ${itemId}: ${response.status}`);
      }
      
      const mtsData = await response.json();
      return mtsData;
      
    } catch (error) {
      console.error(`Error fetching MTS for item ${itemId}:`, error);
      return [];
    }
  };

  // Fetch MTS data for all items
  const fetchAllMtsData = async (itemsList) => {
    if (!jwtToken) {
      console.error('No auth token available for MTS fetch');
      return;
    }

    setLoadingMts(true);
    const mtsPromises = [];
    const newMtsData = {};
    let newTotalAmount = 0;

    try {
      // Create promises for all MTS fetches
      itemsList.forEach(item => {
        const promise = fetchMtsForItem(item.id, jwtToken)
          .then(mtsData => {
            // Calculate total quantity from MTS data (following your logic)
            let totalMTSQuantity = 0;
            let unit = mtsData.length > 0 ? mtsData[0].unit || "" : item.unit;
            
            mtsData.forEach(mts => {
              totalMTSQuantity += mts.quantity || 0;
            });
            
            const itemTotal = item.rate * totalMTSQuantity;
            newTotalAmount += itemTotal;
            
            newMtsData[item.id] = {
              mtsData,
              totalQuantity: totalMTSQuantity,
              unit,
              amount: itemTotal
            };
            
            return { itemId: item.id, totalQuantity: totalMTSQuantity, unit, amount: itemTotal };
          });
        
        mtsPromises.push(promise);
      });

      // Wait for all MTS data to be fetched
      const results = await Promise.all(mtsPromises);
      
      // Update items with MTS quantities and amounts
      const updatedItems = itemsList.map(item => {
        const mtsResult = newMtsData[item.id];
        return {
          ...item,
          quantity: mtsResult ? mtsResult.totalQuantity : 0,
          unit: mtsResult ? mtsResult.unit : item.unit,
          amount: mtsResult ? mtsResult.amount : 0
        };
      });
      
      setItems(updatedItems);
      setMtsData(newMtsData);
      setTotalCost(newTotalAmount);
      
      console.log(`Successfully fetched MTS data for ${results.length} items. Total amount: ${newTotalAmount}`);
      
    } catch (error) {
      console.error('Error fetching MTS data:', error);
      setError('Failed to fetch measurement data');
    } finally {
      setLoadingMts(false);
    }
  };

  // Main data loading function
  const refreshData = async () => {
    console.log('Refreshing estimate data...');
    setLoading(true);
    setError(null);
    
    try {
      // Load items from cache first
      const itemsLoaded = loadItemsFromCache();
      
      if (itemsLoaded) {
        loadAuxiliaryWorks();
        loadWorkName();
        loadSignatureData();
         loadGstPercentage(); 
        console.log('Data refreshed from localStorage');
        return true;
      } else {
        console.log('No cached data available');
        setItems([]);
        setTotalCost(0);
        return false;
      }
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to load data');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle auxiliary description change
  const handleAuxiliaryDescriptionChange = (index, value) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].description = value;
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary custom description change
  const handleAuxiliaryCustomDescriptionChange = (index, value) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].customDescription = value;
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };
  
  // Handle auxiliary percentage change
  const handleAuxiliaryPercentageChange = (index, value) => {
    const newPercentage = parseFloat(value) || 0;
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].percentage = newPercentage;
    newAuxWorks[index].amount = totalCost * (newPercentage / 100);
    newAuxWorks[index].isPercentage = true;
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary fixed amount change
  const handleAuxiliaryAmountChange = (index, value) => {
    const newAmount = parseFloat(value) || 0;
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].amount = newAmount;
    newAuxWorks[index].percentage = totalCost > 0 ? (newAmount / totalCost) * 100 : 0;
    newAuxWorks[index].isPercentage = false;
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };

  // Handle auxiliary type change (percentage vs fixed amount)
  const handleAuxiliaryTypeChange = (index, isPercentage) => {
    const newAuxWorks = [...auxiliaryWorks];
    newAuxWorks[index].isPercentage = isPercentage;
    if (isPercentage) {
      newAuxWorks[index].amount = totalCost * (newAuxWorks[index].percentage / 100);
    } else {
      newAuxWorks[index].percentage = totalCost > 0 ? (newAuxWorks[index].amount / totalCost) * 100 : 0;
    }
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };
  
  // Add new auxiliary work
  const addAuxiliaryWork = () => {
    const newWork = {
      id: `aux_${Date.now()}`,
      description: auxiliaryOptions[0],
      customDescription: '',
      percentage: 0,
      amount: 0,
      isPercentage: true
    };
    const newAuxWorks = [...auxiliaryWorks, newWork];
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };

  // Remove auxiliary work
  const removeAuxiliaryWork = (index) => {
    const newAuxWorks = auxiliaryWorks.filter((_, i) => i !== index);
    setAuxiliaryWorks(newAuxWorks);
    saveAuxiliaryWorks(newAuxWorks);
  };

  // Calculate totals including auxiliary works and GST
  const calculateTotals = () => {
    const auxiliaryTotal = auxiliaryWorks.reduce((sum, work) => sum + (work.amount || 0), 0);
    const subtotal = totalCost + auxiliaryTotal;
    const gstAmount = subtotal * (gstPercentage / 100);
    const grandTotal = subtotal + gstAmount;
    
    return {
      itemsTotal: totalCost,
      auxiliaryTotal,
      subtotal,
      gstAmount,
      grandTotal
    };
  };

const PreviewModal = () => {
  if (!showPreview) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl max-h-full overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Abstract Preview</h2>
            <div className="flex gap-2">
             <button
  onClick={generatePDF}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
>
  <Download size={16} /> Generate PDF
</button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close Preview
              </button>
            </div>
          </div>
          
          <div className="border border-gray-300 p-6 bg-white relative" style={{minHeight: '600px'}}>
            {/* Demo Watermark - Properly centered and visible over content */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{zIndex: 999}}
            >
              <div 
                style={{
                  transform: 'rotate(-45deg)',
                  fontSize: '120px',
                  fontWeight: 'bold',
                  color: 'rgba(255, 0, 0, 0.15)',
                  userSelect: 'none',
                  fontFamily: 'Arial, sans-serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '8px'
                }}
              >
                DEMO
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-6 relative" style={{zIndex: 10}}>
              ABSTRACT
            </h1>
            
            {workName && (
              <h2 className="text-xl font-semibold text-center text-gray-700 mb-4 relative" style={{zIndex: 10}}>
                Work: {workName.toUpperCase()}
              </h2>
            )}
            
            <div className="flex justify-between mb-6 relative" style={{zIndex: 10}}>
              <div>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p><strong>Grand Total:</strong> {formatIndianCurrency(totals.grandTotal)}</p>
              </div>
            </div>
            
            <table className="w-full border-collapse border border-gray-300 mb-6 relative" style={{zIndex: 10, backgroundColor: 'white'}}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Sr. No.</th>
                  
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Item of work</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>SSRItem No.</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Qty</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Rate</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Unit</th>
                  <th className="border border-gray-300 p-2" style={{backgroundColor: '#f3f4f6'}}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>{item.srNo}</td>
   
                    <td className="border border-gray-300 p-2" style={{backgroundColor: 'white'}}>{item.description}</td>
                                     <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>{item.itemNo}</td>
                    <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>{parseFloat(item.quantity).toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>{parseFloat(item.rate).toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>{item.unit}</td>
                    <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>Main Items Total:</td>
                  <td className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(totals.itemsTotal)}</td>
                </tr>
                {auxiliaryWorks.map((aux, index) => (
                  <tr key={`aux-preview-${index}`}>
                    <td colSpan="6" className="border border-gray-300 p-2 text-right" style={{backgroundColor: '#f9fafb'}}>
                      {aux.description === 'Other' ? aux.customDescription : aux.description}
                      {aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
                    </td>
                    <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(aux.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>Subtotal:</td>
                  <td className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(totals.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right" style={{backgroundColor: '#f9fafb'}}>GST ({gstPercentage}%):</td>
                  <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(totals.gstAmount)}</td>
                </tr>
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold text-lg" style={{backgroundColor: '#f9fafb'}}>Grand Total:</td>
                  <td className="border border-gray-300 p-2 text-right font-bold text-lg" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(totals.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
            
            {/* Signature Section in Preview */}
            <div className="flex justify-between items-end mt-12 mb-8 relative" style={{zIndex: 10}}>
              <div className="text-center min-w-48 p-2 rounded" style={{backgroundColor: 'white'}}>
                <div className="border-b border-gray-400 h-16 flex items-end justify-center pb-2 mb-2">
                </div>
                <p className="font-bold">Prepared By</p>
                <span className="font-bold">{signatures.preparedBy}</span> 
              </div>
              <div className="text-center min-w-48 p-2 rounded" style={{backgroundColor: 'white'}}>
                <div className="border-b border-gray-400 h-16 flex items-end justify-center pb-2 mb-2">
                </div>
                <p className="font-bold">Checked By</p>
                <span className="font-bold">{signatures.checkedBy}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Initial data load
  useEffect(() => {
    console.log('Initializing Construction Estimate Component...');
    refreshData();
  }, []);

  // Update auxiliary amounts when total cost changes
  useEffect(() => {
    if (totalCost > 0) {
      const updatedAuxWorks = auxiliaryWorks.map(work => ({
        ...work,
        amount: work.isPercentage ? totalCost * (work.percentage / 100) : work.amount
      }));
      setAuxiliaryWorks(updatedAuxWorks);
      saveAuxiliaryWorks(updatedAuxWorks);
    }
  }, [totalCost]);

  const totals = calculateTotals();

  if (loading && !loadingMts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 h-12 w-12 text-blue-600" />
          <p className="text-lg text-gray-600">Loading estimate data...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">ABSTRACT</h1>
          <div className="flex gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || loadingMts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
             <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={16} />
            Clear Data
          </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FileText className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>
        
        {workName && (
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Work: {workName.toUpperCase()}
          </h2>
        )}
        
        {isOfflineMode && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Running in offline mode. Data may not be current.
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loadingMts && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="animate-spin h-4 w-4" />
              Loading measurement data...
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <div className="font-semibold text-lg">Grand Total: ₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Sr. No.</th>
              
              <th className="border border-gray-300 p-2 w-1/3">Item of work</th>
              <th className="border border-gray-300 p-2">SSRItem No.</th>
              <th className="border border-gray-300 p-2">Qty</th>
              <th className="border border-gray-300 p-2">Rate</th>
              <th className="border border-gray-300 p-2">Unit</th>
              <th className="border border-gray-300 p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">{item.srNo}</td>
                 
                  <td className="border border-gray-300 p-2">{item.description}</td>
                   <td className="border border-gray-300 p-2 text-center">{item.itemNo}</td>
                  <td className="border border-gray-300 p-2 text-right">{item.quantity.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                  <td className="border border-gray-300 p-2 text-right">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
            {/* Main Items Total */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Total (A):</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{totals.itemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            
            {/* Display existing auxiliary works */}
            {auxiliaryWorks.map((aux, index) => (
              <tr key={`aux-display-${index}`}>
                <td colSpan="6" className="border border-gray-300 p-2 text-right">
                  {aux.description === 'Other' ? aux.customDescription : aux.description} 
                  {aux.isPercentage ? ` (${aux.percentage}%)` : ' ( Amount)'}:
                </td>
                <td className="border border-gray-300 p-2 text-right">₹{aux.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}

            {/* Subtotal */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Total (A+B):</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            
            {/* Add Auxiliary Work Button Row */}
            <tr>
              <td colSpan="7" className="border border-gray-300 p-2">
                <div className="flex justify-start">
                  <button
                    onClick={addAuxiliaryWork}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Auxiliary Work(B)
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
                          Amount
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
                        onClick={() => saveAuxiliaryWork && saveAuxiliaryWork(index)}
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
                          <label> Amount:</label>
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
                        <label>Amount: ₹</label>
                        <span className="font-semibold">{aux.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
  onChange={(e) => handleGstPercentageChange(e.target.value)}
                    className="border border-gray-300 rounded p-1 w-20 text-center"
                    placeholder="0"
                  />
                  <span>%</span>
                </div>
              </td>
              <td className="border border-gray-300 p-2 text-right">₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            
            {/* Grand Total Row */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold text-lg">Grand Total:</td>
              <td className="border border-gray-300 p-2 text-right font-bold text-lg">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Section (Optional - can be kept for additional reference) */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Items Total:</span>
            <span>₹{totals.itemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>Additional Works Total:</span>
            <span>₹{totals.auxiliaryTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Subtotal:</span>
            <span>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>GST ({gstPercentage}%):</span>
            <span>₹{totals.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Grand Total:</span>
            <span>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Clear Data</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Select what data you want to clear. This action cannot be undone.
            </p>
            
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearOptions.all}
                  onChange={() => handleClearOptionChange('all')}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="font-medium text-red-600">Clear All Data</span>
              </label>
              
              {!clearOptions.all && (
                <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                   <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.items}
                      onChange={() => handleClearOptionChange('items')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Abstract Items (Keep subRecordCache)</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.auxiliaryWorks}
                      onChange={() => handleClearOptionChange('auxiliaryWorks')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Auxiliary Works</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.gstPercentage}
                      onChange={() => handleClearOptionChange('gstPercentage')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>GST Percentage</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.workName}
                      onChange={() => handleClearOptionChange('workName')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Work Name</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.signatures}
                      onChange={() => handleClearOptionChange('signatures')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Signatures</span>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearOptions.mtsData}
                      onChange={() => handleClearOptionChange('mtsData')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>MTS Cache</span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeClearOperation}
                disabled={!Object.values(clearOptions).some(val => val)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      
        <PreviewModal />  
    </div>
  </div>
  );
};

export default ConstructionEstimateComponent;