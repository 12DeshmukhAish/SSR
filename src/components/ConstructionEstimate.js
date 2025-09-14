import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus,  FileText, X, AlertTriangle, Eye } from 'lucide-react';
import { API_BASE_URL} from '../config';
import { LuLoaderCircle } from "react-icons/lu";
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
  // const API_BASE_URL = "https://24.101.103.87:8082/api";
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
          quantity: item.quantity,
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
  try {
    if (clearOptions.all) {
      // Clear everything including grand total
      localStorage.removeItem('subRecordCache');
      localStorage.removeItem('dynamicAdditions');
      localStorage.removeItem('gstPercentage');
      localStorage.removeItem('nameOfWork');
      localStorage.removeItem('preparedBySignature');
      localStorage.removeItem('checkedBySignature');
      localStorage.removeItem('preparedBy');
      localStorage.removeItem('checkedBy');
      localStorage.removeItem('grandTotal'); // Clear grand total
      
      // Reset all state
      setItems([]);
      setAuxiliaryWorks([]);
      setGstPercentage(18);
      setWorkName('');
      setSignatures({ preparedBy: '', checkedBy: '' });
      setTotalCost(0);
      setMtsData({});
      
    } else {
      // Selective clearing
      if (clearOptions.items) {
        setItems([]);
        setTotalCost(0);
        setMtsData({});
      }
      
      if (clearOptions.auxiliaryWorks) {
        localStorage.removeItem('dynamicAdditions');
        setAuxiliaryWorks([]);
      }
      
      if (clearOptions.gstPercentage) {
        localStorage.removeItem('gstPercentage');
        setGstPercentage(18);
      }
      
      if (clearOptions.workName) {
        localStorage.removeItem('nameOfWork');
        setWorkName('');
      }
      
      if (clearOptions.signatures) {
        localStorage.removeItem('preparedBySignature');
        localStorage.removeItem('checkedBySignature');
        localStorage.removeItem('preparedBy');
        localStorage.removeItem('checkedBy');
        setSignatures({ preparedBy: '', checkedBy: '' });
      }
      
      if (clearOptions.mtsData) {
        setMtsData({});
      }
      
      // If items or auxiliary works are cleared, update grand total
      if (clearOptions.items || clearOptions.auxiliaryWorks) {
        // Grand total will be recalculated and saved automatically via useEffect
        console.log('Grand total will be recalculated due to data changes');
      }
    }
    
    setShowClearModal(false);
    setClearOptions({
      all: false,
      items: false,
      auxiliaryWorks: false,
      gstPercentage: false,
      workName: false,
      signatures: false,
      mtsData: false
    });
    
    console.log('Clear operation completed');
    
  } catch (error) {
    console.error('Error during clear operation:', error);
  }
};
  // Load auxiliary works from localStorage
  const loadAuxiliaryWorks = (currentTotalCost = null) => {
  try {
    const storedAuxWorks = localStorage.getItem('dynamicAdditions');
    if (storedAuxWorks) {
      const parsedAuxWorks = JSON.parse(storedAuxWorks);
      const totalCostForCalculation = currentTotalCost !== null ? currentTotalCost : totalCost;
      
      const formattedAuxWorks = Object.entries(parsedAuxWorks).map(([key, value]) => ({
        id: key,
        description: value.label,
        customDescription: value.customDescription || '',
        percentage: value.percent || 0,
        amount: value.isPercentage !== false ? 
          (totalCostForCalculation * (value.percent || 0)) / 100 : 
          (value.amount || 0),
        isPercentage: value.isPercentage !== undefined ? value.isPercentage : true
      }));
      
      setAuxiliaryWorks(formattedAuxWorks);
      console.log('Auxiliary works loaded and recalculated. Total cost used:', totalCostForCalculation);
      return formattedAuxWorks;
    }
    return [];
  } catch (error) {
    console.error('Error loading auxiliary works:', error);
    return [];
  }
};
// Add this useEffect to recalculate auxiliary works when totalCost changes
useEffect(() => {
  if (totalCost >= 0 && auxiliaryWorks.length > 0) {
    const updatedAuxWorks = auxiliaryWorks.map(work => ({
      ...work,
      amount: work.isPercentage ? (totalCost * work.percentage) / 100 : work.amount
    }));
    setAuxiliaryWorks(updatedAuxWorks);
    
    // Save the updated auxiliary works
    saveAuxiliaryWorks(updatedAuxWorks);
  }
}, [totalCost]);
// Handle GST percentage change
const handleGstPercentageChange = (value) => {
  const newGstPercentage = parseFloat(value) || 0;
  setGstPercentage(newGstPercentage);
  
  // Save GST percentage to localStorage
  try {
    localStorage.setItem('gstPercentage', newGstPercentage.toString());
  } catch (error) {
    console.error('Error saving GST percentage:', error);
  }
  
  // Grand total will be automatically saved via useEffect
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
          percent: work.isPercentage ? work.percentage : (totalCost > 0 ? (work.amount / totalCost) * 100 : 0),
          customDescription: work.customDescription || '',
          isPercentage: work.isPercentage !== undefined ? work.isPercentage : true,
          amount: work.amount || 0
        };
      }
    });
    localStorage.setItem('dynamicAdditions', JSON.stringify(formattedForStorage));
    console.log('Auxiliary works saved:', formattedForStorage);
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
 const fetchSubworkNames = async (subworkIds) => {
  if (!jwtToken || !subworkIds.length) {
    return {};
  }

  try {
    console.log('Fetching subwork names for IDs:', subworkIds);
    
    // Create a map to store subwork names
    const subworkNames = {};
    
    // Fetch each subwork's details
    const subworkPromises = subworkIds.map(async (subworkId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subwork/${subworkId}`, {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Accept": "*/*"
          }
        });

        if (response.ok) {
          const subworkData = await response.json();
          // Handle both single object and array responses
          const subwork = Array.isArray(subworkData) ? subworkData[0] : subworkData;
          subworkNames[subworkId] = subwork?.subworkName || `SubWork ${subworkId}`;
        } else {
          console.warn(`Failed to fetch subwork ${subworkId}: ${response.status}`);
          subworkNames[subworkId] = `SubWork ${subworkId}`;
        }
      } catch (error) {
        console.error(`Error fetching subwork ${subworkId}:`, error);
        subworkNames[subworkId] = `SubWork ${subworkId}`;
      }
    });

    await Promise.all(subworkPromises);
    console.log('Fetched subwork names:', subworkNames);
    return subworkNames;
    
  } catch (error) {
    console.error('Error fetching subwork names:', error);
    return {};
  }
};

// Updated loadItemsFromCache function to include subwork names
const loadItemsFromCacheWithSubworks = async () => {
  try {
    console.log('Loading items from localStorage with subwork names...');
    
    const storedItems = localStorage.getItem("subRecordCache");
    
    if (!storedItems) {
      console.log("No cached items found in localStorage");
      return false;
    }
    
    const itemsObject = JSON.parse(storedItems);
    
    // Convert object values into a single array
    let itemsArray = Object.values(itemsObject).flat();
    
    if (!Array.isArray(itemsArray)) {
      console.error("Converted data is not an array!", itemsArray);
      itemsArray = [];
    }
    
    if (itemsArray.length === 0) {
      console.log("No items in cached data");
      return false;
    }

    // Extract unique subwork IDs from items
    const subworkIds = [...new Set(
      itemsArray
        .map(item => item.fkSubworkId)
        .filter(id => id !== undefined && id !== null)
    )];

    console.log('Found subwork IDs in items:', subworkIds);

    // Fetch subwork names
    const subworkNames = await fetchSubworkNames(subworkIds);
    
    const formattedItems = itemsArray.map((item, index) => ({
      id: item.id || `local-${index}`,
      srNo: index + 1,
      itemNo: item.itemNo || item.itemNumber || 'N/A',
      description: item.descriptionOfItem || item.description || 'No description',
      quantity: 0, // Will be calculated from MTS data
      rate: parseFloat(item.completedRate || item.rate) || 0,
      unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
      amount: 0, // Will be calculated after MTS fetch
      rawItem: {
        ...item,
        subworkName: subworkNames[item.fkSubworkId] || `SubWork ${item.fkSubworkId}` // Add subwork name
      }
    }));
    
    setItems(formattedItems);
    console.log(`Successfully loaded ${formattedItems.length} items with subwork names from localStorage`);
    
    // Fetch MTS data for all items
    fetchAllMtsData(formattedItems);
    
    return true;
    
  } catch (error) {
    console.error("Error loading items from cache with subworks:", error);
    return false;
  }
};
  // Fetch MTS data for a single item (following your original logic)
  const fetchMtsForItem = async (itemId, authToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${itemId}`, {
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
    // Create promises for all MTS data fetches
    itemsList.forEach(item => {
      const itemId = item.rawItem?.id || item.id;
      if (itemId) {
        mtsPromises.push(
          fetchMtsForItem(itemId, jwtToken).then(mtsData => {
            const totalQuantity = calculateTotalQuantity(mtsData);
            const amount = totalQuantity * (parseFloat(item.rate) || 0);
            
            newMtsData[item.id] = {
              measurements: mtsData,
              totalQuantity: parseFloat(totalQuantity),
              unit: item.unit || item.rawItem?.smallUnit || 'Nos',
              amount: amount
            };
            
            newTotalAmount += amount;
            return { itemId: item.id, mtsData, totalQuantity, amount };
          })
        );
      }
    });

    // Wait for all MTS data to be fetched
    const results = await Promise.all(mtsPromises);
    
    // Update items with MTS quantities and amounts
    const updatedItems = itemsList.map(item => {
      const mtsResult = newMtsData[item.id];
      return {
        ...item,
        quantity: mtsResult ? mtsResult.totalQuantity : 0,
        unit: mtsResult ? mtsResult.unit : (item.unit || item.rawItem?.smallUnit || 'Nos'),
        amount: mtsResult ? mtsResult.amount : 0
      };
    });
    
    setItems(updatedItems);
    setMtsData(newMtsData);
    setTotalCost(newTotalAmount);
    
    // UPDATED: Load auxiliary works with the new total cost immediately
    loadAuxiliaryWorks(newTotalAmount);
    
    console.log(`Successfully fetched MTS data for ${results.length} items. Total amount: ${newTotalAmount}`);
    
  } catch (error) {
    console.error('Error fetching MTS data:', error);
    setError('Failed to fetch measurement data');
  } finally {
    setLoadingMts(false);
  }
};
// Updated refreshData function to use the new loading method
const refreshDataWithSubworks = async () => {
  console.log('Refreshing estimate data with subwork names...');
  setLoading(true);
  setError(null);
  
  try {
    // Load items from cache with subwork names
    const itemsLoaded = await loadItemsFromCacheWithSubworks();
    
    if (itemsLoaded) {
      loadGstPercentage();
      loadWorkName();
      loadSignatureData();
      
      // Load grand total from localStorage
      const storedGrandTotal = loadGrandTotal();
      if (storedGrandTotal) {
        console.log('Previous grand total loaded:', storedGrandTotal);
      }
      
      console.log('Data refreshed from localStorage with subwork names');
      return true;
    } else {
      console.log('No cached data available');
      setItems([]);
      setTotalCost(0);
      setAuxiliaryWorks([]);
      
      // Clear grand total if no items
      try {
        localStorage.removeItem('grandTotal');
      } catch (error) {
        console.error('Error clearing grand total:', error);
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('Error refreshing data with subworks:', error);
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
      await refreshDataWithSubworks();
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
  // Add this useEffect after your existing useEffect hooks
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      console.log('Page became visible, refreshing data...');
      refreshDataWithSubworks();
    }
  };

  const handleFocus = () => {
    console.log('Page focused, refreshing data...');
    refreshDataWithSubworks();
  };

  // Listen for visibility changes and focus events
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
}, []);
  // Handle auxiliary percentage change
  const handleAuxiliaryPercentageChange = (index, value) => {
  const newPercentage = parseFloat(value) || 0;
  const newAuxWorks = [...auxiliaryWorks];
  newAuxWorks[index].percentage = newPercentage;
  newAuxWorks[index].amount = totalCost * (newPercentage / 100);
  newAuxWorks[index].isPercentage = true;
  setAuxiliaryWorks(newAuxWorks);
  saveAuxiliaryWorks(newAuxWorks);
  
  // Grand total will be automatically saved via useEffect
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
  
  // Grand total will be automatically saved via useEffect
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
  const saveGrandTotal = (grandTotal) => {
  try {
    const grandTotalData = {
      amount: grandTotal,
      timestamp: new Date().toISOString(),
      lastUpdated: Date.now()
    };
    localStorage.setItem('grandTotal', JSON.stringify(grandTotalData));
    console.log('Grand total saved to localStorage:', grandTotal);
  } catch (error) {
    console.error('Error saving grand total:', error);
  }
};
const loadGrandTotal = () => {
  try {
    const storedGrandTotal = localStorage.getItem('grandTotal');
    if (storedGrandTotal) {
      const grandTotalData = JSON.parse(storedGrandTotal);
      console.log('Loaded grand total from localStorage:', grandTotalData);
      return grandTotalData;
    }
  } catch (error) {
    console.error('Error loading grand total:', error);
  }
  return null;
};

const calculateTotalQuantity = (measurements) => {
  if (!measurements || measurements.length === 0) return 0;
  
  const total = measurements.reduce((sum, measurement) => {
    // Handle different possible quantity field names
    const qty = measurement.quantity || 
                measurement.totalQuantity || 
                measurement.qty || 
                measurement.calculatedQuantity || 
                0;
    return sum + (parseFloat(qty) || 0);
  }, 0);
  
  return total.toFixed(2);
};
  // Calculate totals including auxiliary works and GST
 const calculateTotals = () => {
  const auxiliaryTotal = auxiliaryWorks.reduce((sum, work) => sum + (work.amount || 0), 0);
  const subtotal = totalCost + auxiliaryTotal;
  const gstAmount = subtotal * (gstPercentage / 100);
  const grandTotal = subtotal + gstAmount;
  
  // Save grand total to localStorage whenever it's calculated
  saveGrandTotal(grandTotal);
  
  return {
    itemsTotal: totalCost,
    auxiliaryTotal,
    subtotal,
    gstAmount,
    grandTotal
  };
};
useEffect(() => {
  if (totalCost > 0 || auxiliaryWorks.length > 0) {
    const totals = calculateTotals();
    
    // Check if grand total has changed significantly (to avoid unnecessary saves)
    const storedData = loadGrandTotal();
    const hasChanged = !storedData || Math.abs(storedData.amount - totals.grandTotal) > 0.01;
    
    if (hasChanged) {
      saveGrandTotal(totals.grandTotal);
      console.log('Grand total updated in localStorage:', totals.grandTotal);
    }
  }
}, [totalCost, auxiliaryWorks, gstPercentage]);
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
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close Preview
              </button>
            </div>
          </div>
          
          <div className="border border-gray-300 p-6 bg-white relative" style={{minHeight: '600px'}}>
            {/* Demo Watermark */}
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
                {(() => {
                  // Group items by subwork (same logic as main table)
                  const groupedItems = {};
                  const subworkNames = {};
                  
                  items.forEach(item => {
                    const subworkId = item.rawItem?.fkSubworkId || 'unknown';
                    const subworkName = item.rawItem?.subworkName || `SubWork ${subworkId}`;
                    
                    if (!groupedItems[subworkId]) {
                      groupedItems[subworkId] = [];
                      subworkNames[subworkId] = subworkName;
                    }
                    groupedItems[subworkId].push(item);
                  });

                  let serialNumber = 1;
                  
                  return Object.entries(groupedItems).map(([subworkId, subworkItems]) => (
                    <React.Fragment key={`preview-subwork-${subworkId}`}>
                      {/* Subwork Header Row */}
                      <tr className="bg-blue-50 border-b-2 border-blue-200">
                        <td colSpan="7" className="border border-gray-300 p-3 font-semibold text-black-800 text-left" style={{backgroundColor: '#f3f4f6'}}>
                          <div className="flex items-center gap-2">
                            <span className=" text-black-800 px-2 py-1 text-base">
                              SubEstimate
                            </span>
                            <span>{subworkNames[subworkId]}</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Items for this subwork */}
                      {subworkItems.map((item, index) => {
                        const quantity = item.quantity || (mtsData[item.id]?.totalQuantity) || 0;
                        const rate = item.rate || parseFloat(item.rawItem?.completedRate) || 0;
                        const unit = item.unit || item.rawItem?.smallUnit || item.rawItem?.fullUnit || 'Nos';
                        const amount = quantity * rate;
                        
                        return (
                          <tr key={`preview-${item.id || `${subworkId}-${index}`}`}>
                            <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>
                              {serialNumber++}
                            </td>
                            <td className="border border-gray-300 p-2" style={{backgroundColor: 'white'}}>
                              {item.description || item.rawItem?.descriptionOfItem || 'No description'}
                            </td>
                            <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>
                              {item.itemNo || item.rawItem?.itemNo || 'N/A'}
                            </td>
                            <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>
                              {parseFloat(quantity).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>
                              {parseFloat(rate).toFixed(2)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center" style={{backgroundColor: 'white'}}>
                              {unit}
                            </td>
                            <td className="border border-gray-300 p-2 text-right" style={{backgroundColor: 'white'}}>
                              {amount.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>Total (A):</td>
                  <td className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>{formatIndianCurrency(totals.itemsTotal)}</td>
                </tr>
               {/* Only show Auxiliary Work section if there are auxiliary works */}
{auxiliaryWorks.length > 0 && (
  <>
   
    {/* Display existing auxiliary works */}
    {auxiliaryWorks.length > 0 && (
      <tr>
        <td colSpan="7" className="border border-gray-300 p-2 text-right font-bold">
          Auxiliary Work (B):
        </td>
      </tr>
    )}
    {auxiliaryWorks.map((aux, index) => (
      <tr key={`aux-display-${index}`}>
        <td colSpan="6" className="border border-gray-300 p-2 text-right">
          {aux.description === 'Other' ? aux.customDescription : aux.description} 
          {aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)'}:
        </td>
        <td className="border border-gray-300 p-2 text-right">
          {formatIndianCurrency(aux.amount)}
        </td>
      </tr>
    ))}
  </>
)}
                <tr>
                  <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold" style={{backgroundColor: '#f9fafb'}}>Total(A+B):</td>
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
            
            {/* Signature Section */}
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
    refreshDataWithSubworks();
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
       <LuLoaderCircle className="animate-spin mx-auto mb-4 h-10 w-10 text-orange-600" />
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
            {/* <button
              onClick={handleManualRefresh}
              disabled={isRefreshing || loadingMts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button> */}
             {/* <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw size={16} />
            Clear Data
          </button> */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
                              <Eye className="h-4 w-4" />
              {showPreview ? ' Preview' : ' Preview'}
            </button>
             {/* <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >

                Preview
              </button> */}
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
    (() => {
      // Group items by subwork
      const groupedItems = {};
      const subworkNames = {}; // Store subwork names
      
      items.forEach(item => {
        const subworkId = item.rawItem?.fkSubworkId || 'unknown';
        const subworkName = item.rawItem?.subworkName || `SubWork ${subworkId}`;
        
        if (!groupedItems[subworkId]) {
          groupedItems[subworkId] = [];
          subworkNames[subworkId] = subworkName;
        }
        groupedItems[subworkId].push(item);
      });

      let serialNumber = 1;
      
      return Object.entries(groupedItems).map(([subworkId, subworkItems]) => (
        <React.Fragment key={`subwork-${subworkId}`}>
          {/* Subwork Header Row */}
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <td colSpan="7" className="border border-gray-300 p-3 font-semibold text-black-800 text-left">
              <div className="flex items-center gap-2">
                <span className="border-gray-300 text-black px-2 py-1 rounded text-base">
                  SubEstimate
                </span>
                <span className="text-base text-black-600 ">{subworkNames[subworkId]}</span>
                <span className="text-sm text-black-600 ml-auto">
                  {/* ({subworkItems.length} items) */}
                </span>
              </div>
            </td>
          </tr>
          
          {/* Items for this subwork */}
          {subworkItems.map((item, index) => {
            // Get quantity from different possible sources
            const quantity = item.quantity || 
                            (mtsData[item.id]?.totalQuantity) || 
                            0;
            
            const rate = item.rate || 
                        parseFloat(item.rawItem?.completedRate) || 
                        0;
            
            const unit = item.unit || 
                        item.rawItem?.smallUnit || 
                        item.rawItem?.fullUnit || 
                        'Nos';
            
            const amount = quantity * rate;
            
            return (
              <tr key={item.id || `${subworkId}-${index}`} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2 text-center">
                  {serialNumber++}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.description || item.rawItem?.descriptionOfItem || 'No description'}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.itemNo || item.rawItem?.itemNo || 'N/A'}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  <span className={`${loadingMts ? 'text-blue-500' : 'text-gray-900'}`}>
                    {loadingMts ? 'Loading...' : parseFloat(quantity).toFixed(2)}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  ₹{parseFloat(rate).toLocaleString('en-IN', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {unit}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  <span className={`${loadingMts ? 'text-blue-500' : 'text-gray-900'}`}>
                    ₹{amount.toLocaleString('en-IN', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </React.Fragment>
      ));
    })()
  ) : (
    <tr>
      <td colSpan="7" className="border border-gray-300 p-8 text-center text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-8 w-8 text-gray-400" />
          <span>No items found. Please add items to your estimate.</span>
        </div>
      </td>
    </tr>
  )}
</tbody> <tfoot className="bg-gray-50">
            {/* Main Items Total */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Total (A):</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{totals.itemsTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
             {auxiliaryWorks.length > 0 && (
  <>
    <tr>
      <td colSpan="7" className="border border-gray-300 p-2 text-right font-bold">
        Auxiliary Work (B):
      </td>
    </tr>
    {/* Display existing auxiliary works */}
    {auxiliaryWorks.map((aux, index) => (
      <tr key={`aux-display-${index}`}>
        <td colSpan="6" className="border border-gray-300 p-2 text-right">
          {aux.description === 'Other' ? aux.customDescription : aux.description} 
          {aux.isPercentage ? ` (${aux.percentage}%)` : ' (Amount)'}:
        </td>
        <td className="border border-gray-300 p-2 text-right">
          ₹{aux.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    ))}
  </>
)}

            {/* Subtotal */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">Total (A+B):</td>
              <td className="border border-gray-300 p-2 text-right font-bold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            
           
            {/* Auxiliary Works Input Fields */}
              {auxiliaryWorks.map((aux, index) => (
  <tr key={`aux-input-${index}`}>
    <td colSpan="7" className="border border-gray-300 p-2">
      <div className="bg-gray-50 p-3 rounded">
        <div className="flex items-center gap-3 mb-2">
          <select
            value={aux.description}
            onChange={(e) => {
              handleAuxiliaryDescriptionChange(index, e.target.value);
              // Auto-save when description changes
              if (saveAuxiliaryWorks) {
                // Small delay to ensure state is updated
                setTimeout(() => {
                  saveAuxiliaryWorks(auxiliaryWorks);
                }, 100);
              }
            }}
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
                onChange={() => {
                  handleAuxiliaryTypeChange(index, true);
                  // Auto-save when type changes
                  if (saveAuxiliaryWorks) {
                    setTimeout(() => {
                      saveAuxiliaryWorks(auxiliaryWorks);
                    }, 100);
                  }
                }}
                className="mr-1"
              />
              %
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`auxType-${index}`}
                checked={!aux.isPercentage}
                onChange={() => {
                  handleAuxiliaryTypeChange(index, false);
                  // Auto-save when type changes
                  if (saveAuxiliaryWorks) {
                    setTimeout(() => {
                      saveAuxiliaryWorks(auxiliaryWorks);
                    }, 100);
                  }
                }}
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
        </div>
        
         {aux.description === 'Other' && (
          <input
            type="text"
            placeholder="Enter custom description"
            value={aux.customDescription}
            onChange={(e) => {
              handleAuxiliaryCustomDescriptionChange(index, e.target.value);
              // Auto-save when custom description changes
              if (saveAuxiliaryWorks) {
                setTimeout(() => {
                  saveAuxiliaryWorks(auxiliaryWorks);
                }, 100);
              }
            }}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        )}
        
        <div className="flex items-center gap-3">
          {aux.isPercentage ? (
            <div className="flex items-center gap-2">
              <label>Percentage:</label>
              <input
                type="number"
                // step="0.01"
                value={aux.percentage || ''}
                onChange={(e) => {
                  handleAuxiliaryPercentageChange(index, e.target.value);
                  // Auto-save when percentage changes
                  if (saveAuxiliaryWorks) {
                    setTimeout(() => {
                      saveAuxiliaryWorks(auxiliaryWorks);
                    }, 100);
                  }
                }}
                className="border border-gray-300 rounded p-2 w-24"
                placeholder="Enter %"
              />
              <span>%</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <label>Amount:</label>
              <input
                type="number"
                step="0.01"
                value={aux.amount || ''}
                onChange={(e) => {
                  handleAuxiliaryAmountChange(index, e.target.value);
                  // Auto-save when amount changes
                  if (saveAuxiliaryWorks) {
                    setTimeout(() => {
                      saveAuxiliaryWorks(auxiliaryWorks);
                    }, 100);
                  }
                }}
                className="border border-gray-300 rounded p-2 w-32"
                placeholder="Enter Amount"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <label>Amount: ₹</label>
            <span className="font-semibold">
              {aux.amount.toLocaleString('en-IN', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </span>
          </div>
        </div>
      </div>
    </td>
  </tr>
))}
<tr>
              <td colSpan="7" className="border border-gray-300 p-2">
                <div className="flex justify-start">
                  <button
                    onClick={addAuxiliaryWork}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Auxiliary Work(B)
                  </button>
                </div>
              </td>
            </tr>
            {/* GST Row */}
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <label>GST:</label>
                  <input
  type="number"
  // step="0.01"
  value={gstPercentage || ''}
  onChange={(e) => handleGstPercentageChange(e.target.value)}
  className="border border-gray-300 rounded p-1 w-20 text-center"
  placeholder=" GST %"
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