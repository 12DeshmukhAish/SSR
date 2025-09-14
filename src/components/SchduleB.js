import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, FileText, X, AlertTriangle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { LuLoaderCircle } from "react-icons/lu";
import { API_BASE_URL } from '../config';
const ScheduleB = () => {
  const [items, setItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workName, setWorkName] = useState('');
  const [mtsData, setMtsData] = useState({});
  const [loadingMts, setLoadingMts] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [tempRate, setTempRate] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can make this configurable
  
  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  // JWT Token 
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
 

  // Number to words conversion
  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';
    if (num < 0) return 'Minus ' + numberToWords(-num);

    let result = '';
    let place = 0;
    
    while (num > 0) {
      let chunk = 0;
      if (place === 0) {
        chunk = num % 1000;
        num = Math.floor(num / 1000);
      } else if (place === 1) {
        chunk = num % 100;
        num = Math.floor(num / 100);
      } else {
        chunk = num % 100;
        num = Math.floor(num / 100);
      }

      if (chunk !== 0) {
        let chunkText = '';
        
        if (chunk >= 100) {
          chunkText += ones[Math.floor(chunk / 100)] + ' Hundred ';
          chunk %= 100;
        }
        
        if (chunk >= 20) {
          chunkText += tens[Math.floor(chunk / 10)];
          if (chunk % 10 !== 0) {
            chunkText += ' ' + ones[chunk % 10];
          }
        } else if (chunk >= 10) {
          chunkText += teens[chunk - 10];
        } else if (chunk > 0) {
          chunkText += ones[chunk];
        }
        
        result = chunkText + ' ' + thousands[place] + ' ' + result;
      }
      place++;
    }
    
    return result.trim();
  };

  const formatIndianCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `₹${formatted}`;
  };

  const fetchSubworkNames = async (subworkIds) => {
    if (!jwtToken || !subworkIds.length) {
      return {};
    }

    try {
      const subworkNames = {};
      
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
            const subwork = Array.isArray(subworkData) ? subworkData[0] : subworkData;
            subworkNames[subworkId] = subwork?.subworkName || `SubWork ${subworkId}`;
          } else {
            subworkNames[subworkId] = `SubWork ${subworkId}`;
          }
        } catch (error) {
          subworkNames[subworkId] = `SubWork ${subworkId}`;
        }
      });

      await Promise.all(subworkPromises);
      return subworkNames;
      
    } catch (error) {
      console.error('Error fetching subwork names:', error);
      return {};
    }
  };

  const loadItemsFromCache = async () => {
    try {
      const storedItems = localStorage.getItem("subRecordCache");
      
      if (!storedItems) {
        console.log("No cached items found");
        return false;
      }
      
      const itemsObject = JSON.parse(storedItems);
      let itemsArray = Object.values(itemsObject).flat();
      
      if (!Array.isArray(itemsArray) || itemsArray.length === 0) {
        return false;
      }

      const subworkIds = [...new Set(
        itemsArray
          .map(item => item.fkSubworkId)
          .filter(id => id !== undefined && id !== null)
      )];

      const subworkNames = await fetchSubworkNames(subworkIds);
      
      const formattedItems = itemsArray.map((item, index) => ({
        id: item.id || `local-${index}`,
        srNo: index + 1,
        itemNo: item.itemNo || item.itemNumber || 'N/A',
        description: item.descriptionOfItem || item.description || 'No description',
        specification: item.specification || '',
        pageNo: item.pageNo || '',
        quantity: 0,
        rate: parseFloat(item.completedRate || item.rate) || 0,
        unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
        amount: 0,
        rawItem: {
          ...item,
          subworkName: subworkNames[item.fkSubworkId] || `SubWork ${item.fkSubworkId}`
        }
      }));
      
      setItems(formattedItems);
      fetchAllMtsData(formattedItems);
      return true;
      
    } catch (error) {
      console.error("Error loading items from cache:", error);
      return false;
    }
  };

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
        throw new Error(`Failed to fetch MTS for item ${itemId}`);
      }
      
      const mtsData = await response.json();
      return mtsData;
      
    } catch (error) {
      console.error(`Error fetching MTS for item ${itemId}:`, error);
      return [];
    }
  };

  const calculateTotalQuantity = (measurements) => {
    if (!measurements || measurements.length === 0) return 0;
    
    const total = measurements.reduce((sum, measurement) => {
      const qty = measurement.quantity || 
                  measurement.totalQuantity || 
                  measurement.qty || 
                  measurement.calculatedQuantity || 
                  0;
      return sum + (parseFloat(qty) || 0);
    }, 0);
    
    return total.toFixed(2);
  };

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

      await Promise.all(mtsPromises);
      
      const updatedItems = itemsList.map(item => {
        const mtsResult = newMtsData[item.id];
        return {
          ...item,
          quantity: mtsResult ? mtsResult.totalQuantity : 0,
          amount: mtsResult ? mtsResult.amount : 0
        };
      });
      
      setItems(updatedItems);
      setMtsData(newMtsData);
      setTotalCost(newTotalAmount);
      
    } catch (error) {
      console.error('Error fetching MTS data:', error);
      setError('Failed to fetch measurement data');
    } finally {
      setLoadingMts(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const itemsLoaded = await loadItemsFromCache();
      
      if (itemsLoaded) {
        const storedWorkName = localStorage.getItem('nameOfWork');
        if (storedWorkName) {
          setWorkName(storedWorkName);
        }
        return true;
      } else {
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

  const handleRateDoubleClick = (itemId, currentRate) => {
    setEditingCell(itemId);
    setTempRate(currentRate.toString());
  };

  const handleRateChange = (e) => {
    setTempRate(e.target.value);
  };

  const handleRateSubmit = (itemId) => {
    const newRate = parseFloat(tempRate) || 0;
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newAmount = item.quantity * newRate;
        return { ...item, rate: newRate, amount: newAmount };
      }
      return item;
    });
    
    setItems(updatedItems);
    
    // Recalculate total cost
    const newTotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalCost(newTotal);
    
    setEditingCell(null);
    setTempRate('');
  };

  const handleRateKeyPress = (e, itemId) => {
    if (e.key === 'Enter') {
      handleRateSubmit(itemId);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setTempRate('');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (loading && !loadingMts) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <LuLoaderCircle className="animate-spin mx-auto mb-4 h-10 w-10 text-orange-600" />
          <p className="text-lg text-gray-600">Loading Schedule-B data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">SCHEDULE - B</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>
          </div>
          
          {workName && (
            <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
              NAME OF WORK:- {workName.toUpperCase()}
            </h2>
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
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 w-16">Quantity</th>
                <th className="border border-gray-300 p-2 w-1/3">Description of Item</th>
                <th className="border border-gray-300 p-2 w-32">
                  Specification<br />& Page No.
                </th>
                <th className="border border-gray-300 p-2" colSpan="2">Rate</th>
                <th className="border border-gray-300 p-2 w-24">Unit</th>
                <th className="border border-gray-300 p-2 w-32">Amount</th>
              </tr>
              <tr>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50"></th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50"></th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50"></th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50 w-24">In Figures</th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50 w-48">In words</th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50"></th>
                <th className="border border-gray-300 p-1 text-xs bg-gray-50"></th>
              </tr>
            </thead>
            
            <tbody>
              {currentItems.length > 0 ? (
                (() => {
                  // Group items by subwork for current page
                  const groupedItems = {};
                  const subworkNames = {};
                  
                  currentItems.forEach(item => {
                    const subworkId = item.rawItem?.fkSubworkId || 'unknown';
                    const subworkName = item.rawItem?.subworkName || `SubWork ${subworkId}`;
                    
                    if (!groupedItems[subworkId]) {
                      groupedItems[subworkId] = [];
                      subworkNames[subworkId] = subworkName;
                    }
                    groupedItems[subworkId].push(item);
                  });

                  let serialNumber = startIndex + 1;
                  
                  return Object.entries(groupedItems).map(([subworkId, subworkItems]) => (
                    <React.Fragment key={`subwork-${subworkId}`}>
                      {/* Subwork Header Row */}
                      <tr className="bg-blue-50 border-b-2 border-blue-200">
                        <td colSpan="7" className="border border-gray-300 p-3 font-semibold text-gray-800 text-left">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              SubWork
                            </span>
                            <span>{subworkNames[subworkId]}</span>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Items for this subwork */}
                      {subworkItems.map((item, index) => {
                        const quantity = item.quantity || (mtsData[item.id]?.totalQuantity) || 0;
                        const rate = item.rate || parseFloat(item.rawItem?.completedRate) || 0;
                        const unit = item.unit || item.rawItem?.smallUnit || 'Nos';
                        const amount = quantity * rate;
                        const rateInWords = rate > 0 ? numberToWords(Math.floor(rate)) + ` Rupees And Paise ${((rate % 1) * 100).toFixed(0)} Only` : '';
                        
                        return (
                          <tr key={item.id || `${subworkId}-${index}`} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-center">
                              <span className={`${loadingMts ? 'text-blue-500' : 'text-gray-900'}`}>
                                {loadingMts ? 'Loading...' : parseFloat(quantity).toFixed(3)}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="text-sm">
                                <div className="font-medium">
                                  ITEM No.{serialNumber++}: {item.description}
                                </div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {item.specification || item.rawItem?.specification || 'As directed by Engineer in charge.'}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              {editingCell === item.id ? (
                                <input
                                  type="number"
                                  value={tempRate}
                                  onChange={handleRateChange}
                                  onBlur={() => handleRateSubmit(item.id)}
                                  onKeyPress={(e) => handleRateKeyPress(e, item.id)}
                                  className="w-full p-1 border rounded text-right"
                                  autoFocus
                                  step="0.01"
                                />
                              ) : (
                                <span
                                  className="cursor-pointer hover:bg-yellow-100 p-1 rounded"
                                  onDoubleClick={() => handleRateDoubleClick(item.id, rate)}
                                  title="Double-click to edit"
                                >
                                  Rs. {parseFloat(rate).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="border border-gray-300 p-2 text-sm">
                              {rateInWords.length > 50 ? rateInWords.substring(0, 47) + '...' : rateInWords}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {unit}
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                              <span className={`${loadingMts ? 'text-blue-500' : 'text-gray-900'}`}>
                                {amount.toFixed(2)}
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
                      <span>No items found in Schedule-B</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="6" className="border border-gray-300 p-2 text-right font-bold">
                  [A] TOTAL FOR WORK PORTION Rs.
                </td>
                <td className="border border-gray-300 p-2 text-right font-bold">
                  {totalCost.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, items.length)} of {items.length} items
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-3 py-1 rounded ${
                        currentPage === index + 1
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleB;