import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Download, AlertTriangle, Loader,Eye, X  } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { LuLoaderCircle } from "react-icons/lu";
const MeasurementComponent = () => {
  const [items, setItems] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [materialData, setMaterialData] = useState({});
  const [mtsData, setMtsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workName, setWorkName] = useState('');
  const [signatures, setSignatures] = useState({
    preparedBy: '',
    checkedBy: ''
  });
  const [ssrOptions, setSSROptions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [loadingMts, setLoadingMts] = useState(false);
const [showPreview, setShowPreview] = useState(false);
const [ssrYear, setSsrYear] = useState('');
 
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Load work name from localStorage
 const loadWorkName = () => {
  const storedWorkName = localStorage.getItem('nameOfWork');
  if (storedWorkName) {
    setWorkName(storedWorkName);
  }
  
  // Load SSR name from localStorage first (if available)
  const storedSsrName = localStorage.getItem('ssrName');
  if (storedSsrName) {
    setSsrYear(storedSsrName);
  } else {
    // Fallback to ID if name not available
    const storedSsr = localStorage.getItem('ssr');
    if (storedSsr) {
      setSsrYear(storedSsr);
    }
  }
};

useEffect(() => {
  const updateSSRName = async () => {
    if (ssrOptions.length > 0) {
      const storedSsr = localStorage.getItem('ssr');
      if (storedSsr) {
        const ssrName = getSSRNameById(storedSsr);
        if (ssrName) {
          setSsrYear(ssrName);
          localStorage.setItem('ssrName', ssrName);
        }
      }
      
      // Also fetch fresh work order details now that we have SSR options
      await fetchWorkOrderDetails();
    }
  };
  
  updateSSRName();
}, [ssrOptions]);
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
const getSSRNameById = (ssrId) => {
  if (!ssrId || !ssrOptions.length) return '';
  const ssrOption = ssrOptions.find(option => option.id === parseInt(ssrId));
  return ssrOption ? ssrOption.name : '';
};
useEffect(() => {
  const fetchSSROptions = async () => {
    try {
      const jwtToken = localStorage.getItem('jwtToken'); // Fixed: removed duplicate line
      
      if (!jwtToken) {
        console.log('No JWT token available for SSR fetch');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/ssr`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSSROptions(data);
    } catch (err) {
      console.error('Error fetching SSR options:', err);
    }
  };

  const jwtToken = localStorage.getItem('jwtToken');
  if (jwtToken) {
    fetchSSROptions();
  }
}, []);
  // Load items from cache
  const loadItemsFromCache = () => {
    try {
      const storedItems = localStorage.getItem("subRecordCache");
      if (!storedItems) return [];
      
      const itemsObject = JSON.parse(storedItems);
      const itemsArray = Object.values(itemsObject).flat();
      
      return itemsArray.map((item, index) => ({
        id: item.id || `local-${index}`,
        srNo: index + 1,
        itemNo: item.itemNo || item.itemNumber || 'N/A',
        description: item.descriptionOfItem || item.description || 'No description',
        quantity: 0,
        unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
        rate: parseFloat(item.completedRate) || 0,
        amount: 0,
        rawItem: item,
        materials: []
      }));
    } catch (error) {
      console.error("Error loading items from cache:", error);
      return [];
    }
  };

  // Calculate total quantity from MTS data
  const calculateTotalQuantity = (mtsDataArray) => {
    if (!Array.isArray(mtsDataArray) || mtsDataArray.length === 0) return 0;
    
    return mtsDataArray.reduce((total, measurement) => {
      const quantity = parseFloat(measurement.quantity || measurement.totalQuantity || 0);
      return total + quantity;
    }, 0);
  };

  // Fetch MTS data for a single item
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
const fetchWorkOrderDetails = async () => {
  const workOrderId = localStorage.getItem('workorderId') || localStorage.getItem('workOrderId');
  const jwtToken = localStorage.getItem('jwtToken');

  if (!workOrderId || !jwtToken) {
    console.log('Missing workOrderId or jwtToken');
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/workorders/${workOrderId}`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "*/*"
      }
    });
         
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
         
    const data = await response.json();
    
    // Get SSR name using the function (this is the key fix)
    const ssrName = getSSRNameById(data.ssr);
    
    // Update localStorage with fresh data
    localStorage.setItem('nameOfWork', data.nameOfWork || '');
    localStorage.setItem('ssr', data.ssr || '');
    
    // Store both SSR name and set state
    if (ssrName) {
      localStorage.setItem('ssrName', ssrName);
      setSsrYear(ssrName); // Set the name, not the ID
    } else {
      setSsrYear(data.ssr || ''); // Fallback to ID if name not found
    }
    
    localStorage.setItem('preparedBySignature', data.preparedBySignature || '');
    
    return {
      nameOfWork: data.nameOfWork || '',
      ssr: data.ssr || '',
      ssrName: ssrName,
      preparedBySignature: data.preparedBySignature || ''
    };
  } catch (error) {
    console.error("Error fetching work order details:", error);
    return null;
  }
};
  
// 1. BULK FETCH ALL ITEM PROPERTIES AT ONCE
const fetchAllItemProperties = async (itemIds) => {
  if (!jwtToken || !itemIds.length) return {};
  
  try {
    // Fetch all item properties in parallel
    const propertiesPromises = itemIds.map(async (itemId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/txn-item-properties/serchByTxnItemId/${itemId}`,
          {
            method: 'GET',
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }
        );
        
        if (response.ok) {
          const properties = await response.json();
          return { itemId, properties: Array.isArray(properties) ? properties : [] };
        }
        return { itemId, properties: [] };
      } catch (error) {
        console.error(`Error fetching properties for item ${itemId}:`, error);
        return { itemId, properties: [] };
      }
    });
    
    const results = await Promise.all(propertiesPromises);
    
    // Convert to object map for easy lookup
    const propertiesMap = {};
    results.forEach(({ itemId, properties }) => {
      propertiesMap[itemId] = properties;
    });
    
    return propertiesMap;
  } catch (error) {
    console.error('Error fetching all item properties:', error);
    return {};
  }
};

// 2. BULK FETCH ALL CONSUMPTION MATERIALS AT ONCE
const fetchAllConsumptionMaterials = async (detailedItemIds) => {
  if (!jwtToken || !detailedItemIds.length) return {};
  
  try {
    // Remove duplicates and filter valid IDs
    const uniqueDetailedItemIds = [...new Set(detailedItemIds)].filter(id => id && id > 0);
    
    // Fetch all consumption materials in parallel
    const materialsPromises = uniqueDetailedItemIds.map(async (detailedItemId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/master/consumptionMaterialAndRoad/getDetailedItemId?detailedItemId=${detailedItemId}`,
          {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Accept": "*/*"
            }
          }
        );
        
        if (response.ok) {
          const materials = await response.json();
          return { detailedItemId, materials: Array.isArray(materials) ? materials : [] };
        }
        return { detailedItemId, materials: [] };
      } catch (error) {
        console.error(`Error fetching materials for detailedItemId ${detailedItemId}:`, error);
        return { detailedItemId, materials: [] };
      }
    });
    
    const results = await Promise.all(materialsPromises);
    
    // Convert to object map for easy lookup
    const materialsMap = {};
    results.forEach(({ detailedItemId, materials }) => {
      materialsMap[detailedItemId] = materials;
    });
    
    return materialsMap;
  } catch (error) {
    console.error('Error fetching all consumption materials:', error);
    return {};
  }
};

// 3. BULK CREATE MISSING PROPERTIES
const bulkCreateMissingProperties = async (itemsNeedingProperties, consumptionMaterialsMap) => {
  if (!jwtToken || !itemsNeedingProperties.length) return {};
  
  try {
    const createdPropertiesMap = {};
    
    // Process all items in parallel
    const creationPromises = itemsNeedingProperties.map(async (item) => {
      try {
        const detailedItemId = item.detailedItemId;
        const consumptionMaterials = consumptionMaterialsMap[detailedItemId] || [];
        
        if (consumptionMaterials.length === 0) {
          return { itemId: item.id, properties: [] };
        }
        
        // Create properties for this item
        const propertyPromises = consumptionMaterials.map(async (material) => {
          if (!material.materialName || material.constant === null || material.constant === undefined) {
            return null;
          }
          
          const propertyData = {
            txnItemId: item.id,
            material: material.materialName.trim(),
            materialConstant: parseFloat(material.constant) || 0,
            materialUnit: material.materialUnit ? material.materialUnit.trim() : "Unit"
          };
          
          try {
            const createResponse = await fetch(`${API_BASE_URL}/api/txn-item-properties`, {
              method: 'POST',
              headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Accept": "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify(propertyData)
            });
            
            if (createResponse.ok) {
              return await createResponse.json();
            }
          } catch (error) {
            console.error(`Error creating property for ${material.materialName}:`, error);
          }
          return null;
        });
        
        const createdProperties = await Promise.all(propertyPromises);
        const validProperties = createdProperties.filter(prop => prop !== null);
        
        return { itemId: item.id, properties: validProperties };
      } catch (error) {
        console.error(`Error creating properties for item ${item.id}:`, error);
        return { itemId: item.id, properties: [] };
      }
    });
    
    const results = await Promise.all(creationPromises);
    
    // Convert to object map
    results.forEach(({ itemId, properties }) => {
      createdPropertiesMap[itemId] = properties;
    });
    
    return createdPropertiesMap;
  } catch (error) {
    console.error('Error bulk creating properties:', error);
    return {};
  }
};

  // Fetch all MTS data for items
  const fetchAllMtsData = async (itemsList) => {
  if (!jwtToken) {
    console.error('No auth token available for MTS fetch');
    return;
  }

  setLoadingMts(true);
  const mtsPromises = [];
  const newMtsData = {};
  let newTotalAmount = 0;

  // Filter items that have materials
  const itemsWithMaterials = itemsList.filter(item => 
    item.materials && Array.isArray(item.materials) && item.materials.length > 0
  );

  try {
    // Create promises for all MTS data fetches (only for items with materials)
    itemsWithMaterials.forEach(item => {
      const itemId = item.rawItem?.id || item.id;
      if (itemId) {
        mtsPromises.push(
          fetchMtsForItem(itemId, jwtToken).then(mtsDataArray => {
            const totalQuantity = calculateTotalQuantity(mtsDataArray);
            const amount = totalQuantity * (parseFloat(item.rate) || 0);
            
            newMtsData[item.id] = {
              measurements: mtsDataArray,
              totalQuantity: parseFloat(totalQuantity),
              unit: item.unit || item.rawItem?.smallUnit || 'Nos',
              amount: amount
            };
            
            newTotalAmount += amount;
            return { itemId: item.id, mtsDataArray, totalQuantity, amount };
          })
        );
      }
    });

    // Wait for all MTS data to be fetched
    await Promise.all(mtsPromises);
    
    // Update items with MTS quantities and amounts (only items with materials)
    const updatedItems = itemsWithMaterials.map(item => {
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

  } catch (error) {
    console.error('Error fetching all MTS data:', error);
  } finally {
    setLoadingMts(false);
  }
};


  // Get all unique materials across all items
  const getAllUniqueMaterials = (itemsWithMaterials) => {
    const materialsSet = new Set();
    itemsWithMaterials.forEach(item => {
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach(material => {
          if (material.material) {
            materialsSet.add(material.material);
          }
        });
      }
    });
    return Array.from(materialsSet).sort();
  };

  // Calculate material totals
  const calculateMaterialTotals = (items, materials) => {
  const totals = {};
  
  materials.forEach(material => {
    totals[material] = items.reduce((sum, item) => {
      const materialInfo = materialData[item.id]?.[material];
      if (materialInfo) {
        return sum + materialInfo.total;
      }
      return sum;
    }, 0);
  });
  
  return totals;
};

  // Main data loading function
const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    // Load basic data
    loadWorkName();
    loadSignatureData();
       if (ssrOptions.length > 0) {
      await fetchWorkOrderDetails();
    }
    
    // Load items from cache
    const cachedItems = loadItemsFromCache();
    if (cachedItems.length === 0) {
      setItems([]);
      setAllMaterials([]);
      setMaterialData({});
      setMtsData({});
      setLoading(false);
      return;
    }

    console.log('Starting optimized data loading for', cachedItems.length, 'items');

    // Step 1: Get page numbers from localStorage (this is fast and needed)
    const itemPageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
    const itemOptions = JSON.parse(localStorage.getItem('itemOptions') || '[]');
    
    // Step 2: Add page numbers and detailedItemIds to items
    const itemsWithDetails = cachedItems.map(item => {
      const pageNo = itemPageNumbers[item.itemNo] || 'N/A';
      const detailedItem = itemOptions.find(opt => opt.ssrItemId === item.itemNo);
      const detailedItemId = detailedItem?.detailedItemId;
      
      return {
        ...item,
        pageNo,
        detailedItemId,
        materials: [] // Will be populated below
      };
    });

    // Step 3: Bulk fetch all existing item properties at once
    const itemIds = itemsWithDetails.map(item => item.id);
    console.log('Fetching properties for', itemIds.length, 'items in parallel...');
    const existingPropertiesMap = await fetchAllItemProperties(itemIds);

    // Step 4: Identify items that need properties created
    const itemsWithProperties = [];
    const itemsNeedingProperties = [];
    
    itemsWithDetails.forEach(item => {
      const existingProperties = existingPropertiesMap[item.id] || [];
      if (existingProperties.length > 0) {
        itemsWithProperties.push({
          ...item,
          materials: existingProperties
        });
      } else if (item.detailedItemId) {
        itemsNeedingProperties.push(item);
      } else {
        // Item without detailedItemId, add with empty materials
        itemsWithProperties.push({
          ...item,
          materials: []
        });
      }
    });

    console.log(`Found ${itemsWithProperties.length} items with existing properties`);
    console.log(`Found ${itemsNeedingProperties.length} items needing properties`);

    // Step 5: If there are items needing properties, bulk fetch consumption materials and create them
    if (itemsNeedingProperties.length > 0) {
      const detailedItemIds = itemsNeedingProperties.map(item => item.detailedItemId);
      console.log('Fetching consumption materials for', detailedItemIds.length, 'detailed items...');
      
      const consumptionMaterialsMap = await fetchAllConsumptionMaterials(detailedItemIds);
      console.log('Creating missing properties in bulk...');
      
      const createdPropertiesMap = await bulkCreateMissingProperties(itemsNeedingProperties, consumptionMaterialsMap);
      
      // Add created properties to items
      itemsNeedingProperties.forEach(item => {
        const createdProperties = createdPropertiesMap[item.id] || [];
        itemsWithProperties.push({
          ...item,
          materials: createdProperties
        });
      });
    }

    console.log('All items processed with materials:', itemsWithProperties.length);

    // Step 6: Filter items that have materials and calculate unique materials
    const itemsWithMaterials = itemsWithProperties.filter(item => 
      item.materials && Array.isArray(item.materials) && item.materials.length > 0
    );

    const uniqueMaterials = getAllUniqueMaterials(itemsWithMaterials);
    
    // Calculate material data
    const materialDataMap = {};
    itemsWithMaterials.forEach(item => {
      materialDataMap[item.id] = {};
      item.materials.forEach(material => {
        if (material.material) {
          materialDataMap[item.id][material.material] = {
            constant: material.materialConstant || 0,
            unit: material.materialUnit || 'Unit',
            total: 0
          };
        }
      });
    });

    setAllMaterials(uniqueMaterials);
    setMaterialData(materialDataMap);
    
    // Step 7: Fetch MTS data
    console.log('Fetching MTS data for items with materials...');
    await fetchAllMtsData(itemsWithMaterials);

    console.log('Data loading completed successfully!');

  } catch (error) {
    console.error('Error loading data:', error);
    setError('Failed to load measurement data');
  } finally {
    setLoading(false);
  }
};
  // Update material totals when items or MTS data changes
  useEffect(() => {
    if (items.length > 0 && Object.keys(materialData).length > 0) {
      const updatedMaterialData = { ...materialData };
      
      items.forEach(item => {
        if (updatedMaterialData[item.id]) {
          Object.keys(updatedMaterialData[item.id]).forEach(materialName => {
            const constant = updatedMaterialData[item.id][materialName].constant;
            updatedMaterialData[item.id][materialName].total = constant * item.quantity;
          });
        }
      });
      
      setMaterialData(updatedMaterialData);
    }
  }, [items, mtsData]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };
const MeasurementPreviewModal = () => {
  if (!showPreview) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl max-h-full overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Material Components Preview</h2>
            <div className="flex gap-2">
              {/* Uncomment when PDF generation is ready */}
              {/* <button
                onClick={generatePDF}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Download size={16} /> Generate PDF
              </button> */}
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <X size={16} /> Close Preview
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
            
            {/* Header */}
            <div className="text-center mb-6 relative" style={{zIndex: 10}}>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                NAME OF WORK- {workName.toUpperCase()}
              </h1>
              <h2 className="text-xl font-semibold text-gray-700">
                OTHER MATERIAL COMPONENTS
              </h2>
            </div>

            {/* Date and Info */}
            <div className="flex justify-between mb-6 relative" style={{zIndex: 10}}>
              <div>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p><strong>Total Items:</strong> {items.length}</p>
              </div>
            </div>
            
            {/* Main Table */}
            <div className="overflow-x-auto relative" style={{zIndex: 10}}>
              <table className="w-full border-collapse border border-gray-300 mb-6" style={{backgroundColor: 'white'}}>
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>Sr No.</th>
                    <th className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>Item Of Work</th>
                    <th className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>Quantity</th>
                    
                    {/* Material columns */}
                    {allMaterials.map((material) => (
                      <th key={material} className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>
                        <div className="font-bold">{material.toUpperCase()}</div>
                        <div className="grid grid-cols-2 gap-1 mt-1">
                          <div className="text-xs font-medium bg-gray-200 p-1 rounded">Cons.</div>
                          <div className="text-xs font-medium bg-gray-200 p-1 rounded">Qty.</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2 text-center font-medium" style={{backgroundColor: 'white'}}>
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 p-2" style={{backgroundColor: 'white'}}>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {item.description}
                            </div>
                            <div className="text-xs text-gray-500">
                                     SSR OF {ssrYear || 'N/A'} ITEM NO. {item.itemNo} PAGE NO. {item.pageNo || 'N/A'} 
                            </div>
                          </div>
                        </td>
                       <td className="border border-gray-300 p-2 text-center font-mono" style={{backgroundColor: 'white'}}>
  {item.quantity.toFixed(2)} 
</td>
                        
                        {/* Material data columns */}
                        {allMaterials.map((material) => {
                          const materialInfo = materialData[item.id]?.[material];
                          return (
                            <td key={`${item.id}-${material}`} className="border border-gray-300 p-1" style={{backgroundColor: 'white'}}>
                              {materialInfo ? (
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className="text-center font-mono bg-gray-50 p-1 rounded">
                                    {materialInfo.constant.toFixed(5)}
                                  </div>
                                  <div className="text-center font-mono bg-blue-50 p-1 rounded">
                                    {materialInfo.total.toFixed(3)}
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div className="text-center p-1">-</div>
                                  <div className="text-center p-1">-</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3 + allMaterials.length} className="border border-gray-300 p-8 text-center text-gray-500" style={{backgroundColor: 'white'}}>
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <span>No items found. Please add items to generate measurements.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                
                {/* Totals row */}
                {items.length > 0 && (
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td colSpan="3" className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>
                        TOTAL:
                      </td>
                      {allMaterials.map((material) => (
                        <td key={`total-${material}`} className="border border-gray-300 p-2 text-center" style={{backgroundColor: '#f3f4f6'}}>
                          {materialTotals[material].toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end mt-12 mb-8 relative" style={{zIndex: 10}}>
  <div className="text-center min-w-48 p-2 rounded" style={{backgroundColor: 'white'}}>
    <div className="border-b border-gray-400 h-16 mb-2"></div>
    <p className="font-bold mb-2">Prepared By</p>
    <span className="text-gray-600">{signatures.preparedBy}</span>
  </div>
  <div className="text-center min-w-48 p-2 rounded" style={{backgroundColor: 'white'}}>
    <div className="border-b border-gray-400 h-16 mb-2"></div>
    <p className="font-bold mb-2">Checked By</p>
    <span className="text-gray-600">{signatures.checkedBy}</span>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-center">
             <LuLoaderCircle className="animate-spin h-10 w-10 text-orange-600 mr-3" />
              <span className="text-lg">Loading measurement data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const materialTotals = calculateMaterialTotals(items, allMaterials);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                NAME OF WORK- {workName.toUpperCase()}
              </h1>
              <h2 className="text-xl font-semibold text-gray-700">
                OTHER MATERIAL COMPONENTS
              </h2>
            </div>
            <div className="flex gap-2">
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
        {/* <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button> */}
      </div>
          </div>
        </div>

        {/* Main Measurement Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-center min-w-16">Sr No.</th>
                <th className="border border-gray-300 p-2 text-center min-w-48">Item Of Work</th>
                <th className="border border-gray-300 p-2 text-center min-w-20">Quantity</th>
                
                {/* Material columns */}
                {allMaterials.map((material) => (
                  <th key={material} className="border border-gray-300 p-2 text-center min-w-24">
                    <div className="font-bold">{material.toUpperCase()}</div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="text-xs font-medium bg-gray-200 p-1 rounded">Cons.</div>
                      <div className="text-xs font-medium bg-gray-200 p-1 rounded">Qty.</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-500">
                             SSR OF {ssrYear} ITEM NO. {item.itemNo} PAGE NO. {item.pageNo}
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-mono">
                      {loadingMts ? (
                        <Loader className="animate-spin h-4 w-4 mx-auto" />
                      ) : (
                        item.quantity.toFixed(3)
                      )}
                    </td>
                    
                    {/* Material data columns */}
                    {allMaterials.map((material) => {
                      const materialInfo = materialData[item.id]?.[material];
                      return (
                        <td key={`${item.id}-${material}`} className="border border-gray-300 p-1">
                          {materialInfo ? (
  <div className="grid grid-cols-2 gap-1 text-xs">
    <div className="text-center font-mono bg-gray-50 p-1 rounded">
      {materialInfo.constant.toFixed(3)} 
    </div>
    <div className="text-center font-mono bg-blue-50 p-1 rounded">
      {materialInfo.total.toFixed(2)} 
    </div>
  </div>
) : (
  <div className="grid grid-cols-2 gap-1 text-xs">
    <div className="text-center p-1">-</div>
    <div className="text-center p-1">-</div>
  </div>
)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3 + allMaterials.length} className="border border-gray-300 p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <span>No items found. Please add items to generate measurements.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            
            {/* Totals row */}
            {items.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="3" className="border border-gray-300 p-2 text-center">
                    TOTAL:
                  </td>
                 {allMaterials.map((material) => (
  <td key={`total-${material}`} className="border border-gray-300 p-2 text-center">
    {materialTotals[material].toFixed(2)} 
  </td>
))}

                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Signatures Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <div className="grid grid-cols-2 gap-8">
             <div className="text-center">
      <div className="h-16 border-b border-gray-300 mb-2"></div>
      <div className="font-medium mb-2">Prepared By</div>
      <div className="text-gray-600">{signatures.preparedBy}</div>
    </div>
            <div className="text-center">
      <div className="h-16 border-b border-gray-300 mb-2"></div>
      <div className="font-medium mb-2">Checked By</div>
      <div className="text-gray-600">{signatures.checkedBy}</div>
    </div>

          </div>
        </div>
      </div>
       <MeasurementPreviewModal/>
    </div>
   
  );
};

export default MeasurementComponent;