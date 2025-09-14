import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Download, AlertTriangle, Loader, Eye, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { LuLoaderCircle } from "react-icons/lu";
const MaterialSummaryComponent = () => {
  const [items, setItems] = useState([]);
  const [materialData, setMaterialData] = useState({});
  const [materialSummary, setMaterialSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemOptions, setItemOptions] = useState([]);
  const [workName, setWorkName] = useState('');
  const [signatures, setSignatures] = useState({
    preparedBy: '',
    checkedBy: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [ssrYear, setSsrYear] = useState('');
  const [loadingRoyalty, setLoadingRoyalty] = useState(false);
const [loadingMts, setLoadingMts] = useState(false);
const [mtsData, setMtsData] = useState({});
const [totalCost, setTotalCost] = useState(0);
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Load work name and SSR data from localStorage
  const loadWorkName = () => {
    const storedWorkName = localStorage.getItem('nameOfWork');
    if (storedWorkName) {
      setWorkName(storedWorkName);
    }
    
    const storedSsr = localStorage.getItem('ssr');
    if (storedSsr) {
      setSsrYear(storedSsr);
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
        quantity: 0, // Will be updated from MTS data
        unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
        rate: parseFloat(item.completedRate) || 0,
        amount: 0, // Will be calculated after quantity is fetched
        rawItem: item,
        materials: []
      }));
    } catch (error) {
      console.error("Error loading items from cache:", error);
      return [];
    }
  };
  const storePageNumberForItem = (itemNo, pageNo) => {
    try {
      const pageNumbersKey = 'itemPageNumbers';
      let pageNumbers = {};
      
      const existing = localStorage.getItem(pageNumbersKey);
      if (existing) {
        pageNumbers = JSON.parse(existing);
      }
      
      pageNumbers[itemNo] = pageNo;
      localStorage.setItem(pageNumbersKey, JSON.stringify(pageNumbers));
      console.log(`✓ Stored page number ${pageNo} for item ${itemNo}`);
    } catch (error) {
      console.error('Error storing page number:', error);
    }
  };

  // Function to preload consumption materials
  const preloadConsumptionMaterials = async () => {
    if (!jwtToken) {
      console.warn('No JWT token available for preloading');
      return;
    }

    try {
      console.log('Preloading consumption materials...');
      
      // First load itemOptions if not already loaded
      if (!itemOptions || itemOptions.length === 0) {
        await loadItemOptions();
      }

      // Process a batch of items to preload their consumption materials
      const cachedItems = loadItemsFromCache();
      const batchSize = 10;
      
      for (let i = 0; i < Math.min(cachedItems.length, batchSize); i++) {
        const item = cachedItems[i];
        
        // Check if already cached
        const cached = getConsumptionMaterialsFromCache(item.itemNo);
        if (!cached) {
          // Find detailed item and fetch consumption materials
          const detailedItem = itemOptions.find(opt => opt.ssrItemId === item.itemNo);
          
          if (detailedItem && detailedItem.detailedItemId) {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/master/consumptionMaterialAndRoad/getDetailedItemId?detailedItemId=${detailedItem.detailedItemId}`,
                {
                  headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Accept": "*/*"
                  }
                }
              );
              
              if (response.ok) {
                const materialsData = await response.json();
                const validMaterials = Array.isArray(materialsData) ? 
                  materialsData.filter(mat => mat.materialName && mat.fkMaterialId && mat.fkMaterialId > 0) : [];
                
                if (validMaterials.length > 0) {
                  storeConsumptionMaterialsInCache(item.itemNo, detailedItem.detailedItemId, validMaterials);
                }
              }
            } catch (error) {
              console.warn(`Failed to preload materials for ${item.itemNo}:`, error);
            }
          }
        }
        
        // Small delay between requests
        if (i < batchSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log('✓ Preloading completed');
    } catch (error) {
      console.error('Error preloading consumption materials:', error);
    }
  };

  // Function to load item options (master data)
  const loadItemOptions = async () => {
    if (!jwtToken) {
      console.warn('No JWT token available for loading item options');
      return;
    }

    try {
      // Try to get from localStorage first
      const cachedOptions = localStorage.getItem('itemOptions');
      if (cachedOptions) {
        const parsed = JSON.parse(cachedOptions);
        setItemOptions(parsed);
        console.log(`✓ Loaded ${parsed.length} item options from cache`);
        return;
      }

      // Fetch from API if not cached
      console.log('Fetching item options from API...');
      const response = await fetch(`${API_BASE_URL}/api/master/items`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const itemsArray = Array.isArray(data) ? data : [];
        
        setItemOptions(itemsArray);
        
        // Cache for future use
        localStorage.setItem('itemOptions', JSON.stringify(itemsArray));
        console.log(`✓ Loaded and cached ${itemsArray.length} item options from API`);
      } else {
        console.warn('Failed to fetch item options:', response.status);
        setItemOptions([]);
      }
    } catch (error) {
      console.error('Error loading item options:', error);
      setItemOptions([]);
    }
  };
  // Calculate total quantity from MTS data
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
    
    return parseFloat(total.toFixed(2));
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


  // Fetch material details with royalty information
 // Updated function to fetch material details with better error handling
const fetchMaterialDetails = async (materialId) => {
  if (!jwtToken) {
    console.warn('No JWT token available for fetching material details');
    return { royalty: 'NO', royaltyValue: '-' };
  }
  
  if (!materialId || materialId <= 0) {
    console.warn(`Invalid materialId: ${materialId}`);
    return { royalty: 'NO', royaltyValue: '-' };
  }

  try {
    console.log(`Fetching material details for ID: ${materialId}`);
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const materialDetails = await response.json();
      const royalty = materialDetails?.royalty || 'NO';
      console.log(`✓ Royalty for material ID ${materialId}:`, royalty, materialDetails);
      
      return { 
        royalty: royalty,
        royaltyValue: royalty,
        materialDetails: materialDetails // Include full details for debugging
      };
    } else {
      const errorText = await response.text();
      console.warn(`HTTP ${response.status} error for material ID ${materialId}:`, errorText);
      return { royalty: 'NO', royaltyValue: '-', error: `HTTP ${response.status}` };
    }

  } catch (error) {
    console.error(`Network/fetch error for material ID ${materialId}:`, error.message);
    return { royalty: 'NO', royaltyValue: '-', error: error.message };
  }
};
  // Fetch item details including properties/materials
  const fetchItemDetails = async (item) => {
    if (!jwtToken) {
      console.error('No auth token available');
      return { itemProperties: [], consumptionMaterials: [] };
    }

    try {
      console.log(`\n=== Fetching details for item: ${item.itemNo} (ID: ${item.id}) ===`);
      
      const apiCalls = [];
      let detailedItemId = null;
      let cachedConsumptionMaterials = null;
      
      // Try to get consumption materials from cache first
      cachedConsumptionMaterials = getConsumptionMaterialsFromCache(item.itemNo);
      
      // Get existing item properties
      apiCalls.push(
        fetch(`${API_BASE_URL}/api/txn-item-properties/serchByTxnItemId/${item.id}`, {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }).then(response => ({ type: 'properties', response }))
      );
      
      // Find detailed item and fetch consumption materials if not cached
      try {
        // Ensure itemOptions is loaded
        if (!itemOptions || itemOptions.length === 0) {
          await loadItemOptions();
        }

        if (itemOptions && Array.isArray(itemOptions)) {
          const detailedItem = itemOptions.find(opt => opt.ssrItemId === item.itemNo);
          
          if (detailedItem && detailedItem.detailedItemId) {
            detailedItemId = detailedItem.detailedItemId;
            console.log(`Found detailed item for ${item.itemNo}: detailedItemId = ${detailedItemId}`);
            
            // Check cache with detailedItemId if not found by itemNo
            if (!cachedConsumptionMaterials) {
              cachedConsumptionMaterials = getConsumptionMaterialsFromCache(item.itemNo, detailedItemId);
            }
            
            // Fetch from API if not in cache
            if (!cachedConsumptionMaterials) {
              console.log(`No cached data found, fetching from API for detailedItemId: ${detailedItemId}`);
              apiCalls.push(
                fetch(`${API_BASE_URL}/api/master/consumptionMaterialAndRoad/getDetailedItemId?detailedItemId=${detailedItemId}`, {
                  headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Accept": "*/*"
                  }
                }).then(response => ({ type: 'materials', response, detailedItemId }))
              );
            } else {
              console.log(`✓ Using cached consumption materials for ${item.itemNo}:`, cachedConsumptionMaterials.length, 'materials');
            }
          } else {
            console.log(`No detailed item found for itemNo: ${item.itemNo} in itemOptions`);
          }
        } else {
          console.warn('itemOptions is not available or not an array');
        }
      } catch (error) {
        console.warn('Error finding detailed item for consumption materials:', error);
      }

      // Execute all API calls in parallel
      const results = await Promise.allSettled(apiCalls);
      
      let itemProperties = [];
      let consumptionMaterials = cachedConsumptionMaterials || [];
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { type, response, detailedItemId: apiDetailedItemId } = result.value;
          
          try {
            if (response.ok) {
              const data = await response.json();
              
              switch (type) {
                case 'properties':
                  console.log(`✓ Properties for item ${item.itemNo}:`, data);
                  itemProperties = Array.isArray(data) ? data : [];
                  break;
                  
                case 'materials':
                  console.log(`✓ Fresh consumption materials for item ${item.itemNo}:`, data);
                  const freshMaterials = Array.isArray(data) ? data : [];
                  
                  // Validate and filter materials
                  const validMaterials = freshMaterials.filter(mat => 
                    mat.materialName && mat.fkMaterialId && mat.fkMaterialId > 0
                  );
                  
                  if (validMaterials.length > 0) {
                    consumptionMaterials = validMaterials;
                    // Cache the fresh data
                    storeConsumptionMaterialsInCache(item.itemNo, apiDetailedItemId, validMaterials);
                    console.log(`✓ Cached ${validMaterials.length} valid consumption materials`);
                  } else {
                    console.warn('No valid consumption materials found in API response');
                  }
                  break;
              }
            } else {
              const errorText = await response.text();
              console.warn(`API call failed for ${type} (status: ${response.status}):`, errorText);
            }
          } catch (parseError) {
            console.warn(`Error parsing ${type} response:`, parseError);
          }
        } else {
          console.warn(`API call rejected:`, result.reason);
        }
      }
      
      console.log(`Final result for item ${item.itemNo}: ${itemProperties.length} properties, ${consumptionMaterials.length} consumption materials`);
      
      return { 
        itemProperties,
        consumptionMaterials
      };
      
    } catch (error) {
      console.error(`Error fetching item details for ${item.id}:`, error);
      return { itemProperties: [], consumptionMaterials: [] };
    }
  };

  // Get all unique materials with their IDs
 
const getAllUniqueMaterials = (itemsWithMaterials) => {
  const materialsMap = new Map();
  
  console.log('Processing items for unique materials:', itemsWithMaterials.length);
  
  itemsWithMaterials.forEach((item, itemIndex) => {
    console.log(`\n=== Processing Item ${itemIndex + 1}: ${item.itemNo} ===`);
    
    // Priority 1: Check consumption materials data first
    if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
      console.log(`Found ${item.consumptionMaterials.length} consumption materials:`, item.consumptionMaterials);
      
      item.consumptionMaterials.forEach((material, matIndex) => {
        if (material.materialName && material.fkMaterialId && material.fkMaterialId > 0) {
          const materialName = material.materialName.trim();
          const materialId = parseInt(material.fkMaterialId);
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: materialId,
              unit: material.materialUnit || 'Unit',
              source: 'consumption',
              constant: material.constant
            });
            console.log(`    ✓ Added material: ${materialName} with ID: ${materialId}`);
          }
        }
      });
    }
    
    // Priority 2: Check transaction item properties
    if (item.materials && Array.isArray(item.materials)) {
      console.log(`Found ${item.materials.length} transaction item properties`);
      
      item.materials.forEach((material, matIndex) => {
        if (material.material) {
          const materialName = material.material.trim();
          
          if (!materialsMap.has(materialName)) {
            // Try to get material ID from cache first
            const cachedMaterialInfo = getMaterialIdFromCache(materialName);
            
            let materialId = null;
            let source = 'transaction';
            
            if (cachedMaterialInfo && cachedMaterialInfo.fkMaterialId) {
              materialId = cachedMaterialInfo.fkMaterialId;
              source = 'transaction_cached';
              console.log(`    ✓ Found cached ID for ${materialName}: ${materialId}`);
            } else if (material.materialId && parseInt(material.materialId) > 0) {
              materialId = parseInt(material.materialId);
              console.log(`    ✓ Using transaction materialId for ${materialName}: ${materialId}`);
            } else {
              console.log(`    ⚠️ No valid ID found for ${materialName}`);
            }
            
            materialsMap.set(materialName, {
              name: materialName,
              id: materialId,
              unit: material.materialUnit || 'Unit',
              source: source,
              constant: material.materialConstant
            });
            
            console.log(`    ✓ Added material: ${materialName} with ID: ${materialId} (source: ${source})`);
          }
        }
      });
    }
  });
  
  // Convert to array and filter out original sand materials when split versions exist
  const allMaterials = Array.from(materialsMap.values());
  const filteredMaterials = filterOutOriginalSandMaterials(allMaterials);
  
  const uniqueMaterials = filteredMaterials.sort((a, b) => a.name.localeCompare(b.name));
  
  console.log('\n=== FINAL UNIQUE MATERIALS MAP (After Filtering) ===');
  uniqueMaterials.forEach((material, index) => {
    console.log(`${index + 1}. ${material.name} - ID: ${material.id} - Source: ${material.source}`);
  });
  
  // Log materials without valid IDs
  const materialsWithoutIds = uniqueMaterials.filter(m => !m.id || m.id <= 0);
  if (materialsWithoutIds.length > 0) {
    console.warn('\n⚠️ Materials without valid fkMaterialId:');
    materialsWithoutIds.forEach(m => {
      console.warn(`  - ${m.name} (Source: ${m.source})`);
    });
  }
  
  return uniqueMaterials;
};

const filterOutOriginalSandMaterials = (materials) => {
  const filteredMaterials = [];
  const splitMaterialsFound = new Set();
  
  // First pass: identify all split materials and their base materials
  materials.forEach(material => {
    const materialName = material.name.toLowerCase();
    
    // Check if this is a split sand material
    if (materialName.includes('(crushed -') || materialName.includes('(regular -')) {
      // Extract the base material name
      let baseMaterialName = '';
      
      if (materialName.includes('crushed sand (crushed -')) {
        baseMaterialName = 'CRUSHED SAND';
      } else if (materialName.includes('sand (regular -')) {
        baseMaterialName = 'SAND';
      }
      
      if (baseMaterialName) {
        splitMaterialsFound.add(baseMaterialName);
        console.log(`Found split material: ${material.name}, marking base material "${baseMaterialName}" for exclusion`);
      }
    }
  });
  
  // Second pass: include materials, but exclude original sand materials if their split versions exist
  materials.forEach(material => {
    const materialName = material.name.trim().toUpperCase();
    
    // Check if this is an original sand material that has been split
    const isOriginalSandMaterial = (materialName === 'SAND' || materialName === 'CRUSHED SAND');
    const hasBeenSplit = splitMaterialsFound.has(materialName);
    
    if (isOriginalSandMaterial && hasBeenSplit) {
      console.log(`Excluding original material "${material.name}" because split versions exist`);
    } else {
      filteredMaterials.push(material);
      console.log(`Including material: ${material.name}`);
    }
  });
  
  console.log(`\nFiltering result: ${materials.length} → ${filteredMaterials.length} materials`);
  console.log(`Excluded ${materials.length - filteredMaterials.length} original sand materials with split versions`);
  
  return filteredMaterials;
};

const calculateMaterialSummary = async (itemsWithQuantities, materials) => {
  setLoadingRoyalty(true);
  const summary = [];
  
  console.log(`\n=== CALCULATING MATERIAL SUMMARY ===`);
  console.log(`Processing ${materials.length} materials with ${itemsWithQuantities.length} items`);
  console.log('Items with quantities:', itemsWithQuantities.map(i => `${i.itemNo}: ${i.quantity}`));
  
  try {
    // Process materials in batches to avoid overwhelming the server
    const batchSize = 5;
    
    for (let i = 0; i < materials.length; i += batchSize) {
      const batch = materials.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(materials.length / batchSize)}`);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (material, batchIndex) => {
        const materialIndex = i + batchIndex;
        
        console.log(`\n--- Processing Material ${materialIndex + 1}: ${material.name} (ID: ${material.id}) ---`);
        
        // Calculate total quantity for this material across all items
        let totalQuantity = 0;
        const itemCalculations = [];
        
        itemsWithQuantities.forEach(item => {
          console.log(`  Checking item ${item.itemNo} (quantity: ${item.quantity})`);
          
          if (!item.quantity || item.quantity <= 0) {
            console.log(`    Skipping - no quantity`);
            return;
          }
          
          let materialFound = false;
          let materialConstant = 0;
          let source = '';
          
          // First check consumption materials data (priority)
          if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
            const materialMatch = item.consumptionMaterials.find(mat => {
              const matchName = mat.materialName && mat.materialName.trim().toLowerCase();
              const targetName = material.name.trim().toLowerCase();
              return matchName === targetName;
            });
            
            if (materialMatch) {
              materialConstant = parseFloat(materialMatch.constant) || 0;
              materialFound = true;
              source = 'consumption';
              console.log(`    ✓ Found in consumption materials - constant: ${materialConstant}`);
            }
          }
          
          // Check item materials (transaction properties) - with enhanced filtering
          if (!materialFound && item.materials && Array.isArray(item.materials)) {
            const materialMatch = item.materials.find(mat => {
              const matchName = mat.material && mat.material.trim().toLowerCase();
              const targetName = material.name.trim().toLowerCase();
              
              // Exact match for split materials
              if (targetName.includes('(crushed -') || targetName.includes('(regular -')) {
                return matchName === targetName;
              }
              
              // For other materials, use standard matching
              return matchName === targetName;
            });
            
            if (materialMatch) {
              materialConstant = parseFloat(materialMatch.materialConstant) || 0;
              materialFound = true;
              source = 'transaction';
              console.log(`    ✓ Found in transaction materials - constant: ${materialConstant}`);
            }
          }
          
          if (materialFound) {
            const itemQuantity = parseFloat(item.quantity) || 0;
            const materialTotal = materialConstant * itemQuantity;
            totalQuantity += materialTotal;
            
            itemCalculations.push({
              itemNo: item.itemNo,
              itemQuantity,
              materialConstant,
              materialTotal,
              source
            });
            
            console.log(`    Calculation: ${materialConstant} × ${itemQuantity} = ${materialTotal}`);
          } else {
            console.log(`    Material not found in item`);
          }
        });

        console.log(`  Total quantity for ${material.name}: ${totalQuantity}`);
        if (itemCalculations.length > 0) {
          console.log(`  Breakdown:`, itemCalculations);
        }

        // Fetch royalty information using fkMaterialId
        let royaltyFlag = 'NO';
        let royaltyValue = '-';
        let royaltyQuantity = '-';
        let remarks = '-';
        
        console.log(`  Fetching royalty for material ID: ${material.id}`);
        
        if (material.id && material.id > 0) {
          try {
            const materialDetails = await fetchMaterialDetails(material.id);
            royaltyFlag = materialDetails.royalty;
            royaltyValue = materialDetails.royaltyValue;
            
            console.log(`  Royalty response:`, { royaltyFlag, royaltyValue });
            
            // Only show quantity if royalty flag is 'YES'
            if (royaltyFlag === 'YES') {
              royaltyQuantity = totalQuantity > 0 ? totalQuantity.toFixed(3) : '0.000';
              remarks = '-';
              console.log(`  ✓ Royalty YES - quantity: ${royaltyQuantity}`);
            } else {
              royaltyQuantity = '-';
              remarks = '-';
              console.log(`  ✗ Royalty NO - no quantity shown`);
            }
            
            // Log error if present
            if (materialDetails.error) {
              console.warn(`  ⚠️ Error fetching royalty: ${materialDetails.error}`);
              remarks = `Error: ${materialDetails.error}`;
            }
            
          } catch (error) {
            console.error(`  Error fetching royalty for material ${material.name}:`, error);
            royaltyFlag = 'NO';
            royaltyValue = '-';
            royaltyQuantity = '-';
            remarks = `Fetch error: ${error.message}`;
          }
        } else {
          console.log(`  ⚠️ No valid material ID (${material.id}) - setting royalty to NO`);
          royaltyFlag = 'NO';
          royaltyValue = '-';
          royaltyQuantity = '-';
          remarks = '-';
        }

        const result = {
          srNo: materialIndex + 1,
          materialName: material.name,
          totalQuantity: totalQuantity.toFixed(3),
          royaltyQuantity: royaltyQuantity,
          unit: material.unit,
          remarks: remarks,
          royaltyFlag: royaltyFlag,
          royaltyValue: royaltyValue,
          materialId: material.id, // Include for debugging
          source: material.source // Include source for debugging
        };
        
        console.log(`  Final result for ${material.name}:`, result);
        return result;
      });

      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises);
      summary.push(...batchResults);
      
      // Add small delay between batches to avoid overwhelming server
      if (i + batchSize < materials.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`\n=== MATERIAL SUMMARY COMPLETED ===`);
    console.log(`Processed ${summary.length} materials`);
    
    // Log summary statistics
    const withRoyalty = summary.filter(s => s.royaltyFlag === 'YES').length;
    const withoutIds = summary.filter(s => !s.materialId || s.materialId <= 0).length;
    const splitMaterials = summary.filter(s => s.materialName.includes('(crushed -') || s.materialName.includes('(regular -')).length;
    
    console.log(`Materials with royalty: ${withRoyalty}`);
    console.log(`Materials without valid IDs: ${withoutIds}`);
    console.log(`Split materials: ${splitMaterials}`);
    
    if (withoutIds > 0) {
      console.warn('Materials without IDs:', 
        summary.filter(s => !s.materialId || s.materialId <= 0).map(s => s.materialName)
      );
    }
    
  } catch (error) {
    console.error('Error calculating material summary:', error);
    
    // Return partial results if available, otherwise create basic summary
    if (summary.length === 0) {
      console.log('Creating fallback summary without royalty data');
      materials.forEach((material, index) => {
        let totalQuantity = 0;
        
        // Calculate basic quantity without royalty
        itemsWithQuantities.forEach(item => {
          if (!item.quantity || item.quantity <= 0) return;
          
          // Check consumption materials first
          if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
            const materialMatch = item.consumptionMaterials.find(mat => 
              mat.materialName && mat.materialName.trim().toLowerCase() === material.name.trim().toLowerCase()
            );
            
            if (materialMatch) {
              const constant = parseFloat(materialMatch.constant) || 0;
              const itemQuantity = parseFloat(item.quantity) || 0;
              totalQuantity += constant * itemQuantity;
              return;
            }
          }
          
          // Fallback to item materials
          if (item.materials && Array.isArray(item.materials)) {
            const materialMatch = item.materials.find(mat => 
              mat.material && mat.material.trim().toLowerCase() === material.name.trim().toLowerCase()
            );
            
            if (materialMatch) {
              const constant = parseFloat(materialMatch.materialConstant) || 0;
              const itemQuantity = parseFloat(item.quantity) || 0;
              totalQuantity += constant * itemQuantity;
            }
          }
        });

        summary.push({
          srNo: index + 1,
          materialName: material.name,
          totalQuantity: totalQuantity.toFixed(3),
          royaltyQuantity: '-',
          unit: material.unit,
          remarks: 'Royalty data unavailable due to error',
          royaltyFlag: 'NO',
          royaltyValue: '-',
          materialId: material.id,
          source: material.source
        });
      });
    }
  } finally {
    setLoadingRoyalty(false);
  }

  return summary;
};
  // Fetch all MTS data for items
  const fetchAllMtsData = async (itemsList) => {
    if (!jwtToken) {
      console.error('No auth token available for MTS fetch');
      return itemsList; // Return original items if no token
    }

    setLoadingMts(true);
    const mtsPromises = [];
    const newMtsData = {};
    let newTotalAmount = 0;

    console.log(`Starting MTS fetch for ${itemsList.length} items`);

    try {
      // Create promises for all MTS data fetches
      itemsList.forEach(item => {
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
              
              console.log(`Fetched MTS for item ${item.itemNo}: quantity=${totalQuantity}, amount=${amount}`);
              
              return { itemId: item.id, mtsDataArray, totalQuantity, amount };
            }).catch(error => {
              console.error(`Failed to fetch MTS for item ${item.itemNo}:`, error);
              // Return default values on error
              newMtsData[item.id] = {
                measurements: [],
                totalQuantity: 0,
                unit: item.unit || item.rawItem?.smallUnit || 'Nos',
                amount: 0
              };
              return { itemId: item.id, mtsDataArray: [], totalQuantity: 0, amount: 0 };
            })
          );
        }
      });

      // Wait for all MTS data to be fetched
      await Promise.all(mtsPromises);
      
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

      console.log(`Successfully fetched MTS data for ${itemsList.length} items. Total cost: ${newTotalAmount}`);
      return updatedItems;

    } catch (error) {
      console.error('Error fetching all MTS data:', error);
      return itemsList; // Return original items on error
    } finally {
      setLoadingMts(false);
    }
  };

  // Main data loading 
  const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    console.log('\n=== STARTING MATERIAL SUMMARY DATA LOAD ===');
    
    // Load basic data
    loadWorkName();
    loadSignatureData();
    
    // Load items from cache
    const cachedItems = loadItemsFromCache();
    if (cachedItems.length === 0) {
      setItems([]);
      setMaterialSummary([]);
      setMaterialData({});
      setLoading(false);
      return;
    }

    console.log(`Loaded ${cachedItems.length} items from cache`);

    // Show cache statistics
    getConsumptionMaterialsCacheStats();

    // Fetch detailed information for each item with cache optimization
    const itemDetailsPromises = cachedItems.map(async (item) => {
      console.log(`\nProcessing item ${item.itemNo}...`);
      
      // Try to get cached consumption materials first
      let cachedConsumptionMaterials = getConsumptionMaterialsFromCache(item.itemNo);
      
      if (cachedConsumptionMaterials && cachedConsumptionMaterials.length > 0) {
        console.log(`✓ Using cached consumption materials for ${item.itemNo}: ${cachedConsumptionMaterials.length} materials`);
        
        // Still fetch item properties from API
        const propertiesDetails = await fetchItemProperties(item.id);
        
        return {
          itemProperties: propertiesDetails || [],
          consumptionMaterials: cachedConsumptionMaterials
        };
      } else {
        console.log(`No cache found for ${item.itemNo}, fetching from API...`);
        // Fetch from API if not cached
        const details = await fetchItemDetails(item);
        return details;
      }
    });
    
    const itemDetailsResults = await Promise.all(itemDetailsPromises);
    
    // Combine items with their detailed information
    const itemsWithDetails = cachedItems.map((item, index) => ({
      ...item,
      materials: itemDetailsResults[index].itemProperties || [],
      consumptionMaterials: itemDetailsResults[index].consumptionMaterials || []
    }));

    // Filter items that have materials
    const itemsWithMaterials = itemsWithDetails.filter(item => 
      (item.materials && Array.isArray(item.materials) && item.materials.length > 0) ||
      (item.consumptionMaterials && Array.isArray(item.consumptionMaterials) && item.consumptionMaterials.length > 0)
    );

    console.log(`Found ${itemsWithMaterials.length} items with materials`);

    // Log detailed breakdown
    itemsWithMaterials.forEach((item, index) => {
      const consumptionCount = item.consumptionMaterials?.length || 0;
      const propertiesCount = item.materials?.length || 0;
      console.log(`  ${index + 1}. ${item.itemNo}: ${consumptionCount} consumption + ${propertiesCount} properties`);
    });

    // Get all unique materials with enhanced cache lookup
    const uniqueMaterials = getAllUniqueMaterials(itemsWithMaterials);
    console.log(`Found ${uniqueMaterials.length} unique materials`);
    
    // Log material sources
    const sourceCounts = uniqueMaterials.reduce((acc, material) => {
      acc[material.source] = (acc[material.source] || 0) + 1;
      return acc;
    }, {});
    console.log('Material sources:', sourceCounts);
    
    // Fetch MTS data first
    console.log('\nFetching MTS data for all items...');
    const itemsWithQuantities = await fetchAllMtsData(itemsWithMaterials);
    
    // Calculate material summary
    console.log('\nCalculating material summary with quantities...');
    const summary = await calculateMaterialSummary(itemsWithQuantities, uniqueMaterials);
    setMaterialSummary(summary);

    // Log final summary statistics
    const summaryStats = summary.reduce((acc, item) => {
      if (item.royaltyFlag === 'YES') acc.withRoyalty++;
      if (!item.materialId || item.materialId <= 0) acc.withoutIds++;
      if (item.source === 'consumption') acc.fromConsumption++;
      if (item.source === 'transaction_cached') acc.fromCache++;
      return acc;
    }, { withRoyalty: 0, withoutIds: 0, fromConsumption: 0, fromCache: 0 });
    
    console.log('\n=== FINAL SUMMARY STATISTICS ===');
    console.log(`Total materials: ${summary.length}`);
    console.log(`With royalty: ${summaryStats.withRoyalty}`);
    console.log(`Without valid IDs: ${summaryStats.withoutIds}`);
    console.log(`From consumption data: ${summaryStats.fromConsumption}`);
    console.log(`From cache: ${summaryStats.fromCache}`);

    console.log('\n✓ Data loading completed successfully');

  } catch (error) {
    console.error('Error loading data:', error);
    setError('Failed to load material summary data');
  } finally {
    setLoading(false);
  }
};

const fetchItemProperties = async (itemId) => {
  if (!jwtToken || !itemId) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/txn-item-properties/serchByTxnItemId/${itemId}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } else {
      console.warn(`Failed to fetch properties for item ${itemId}:`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching properties for item ${itemId}:`, error);
    return [];
  }
}; const createMaterialsForItem = async (itemId, itemData) => {
    try {
      console.log('Starting material creation for item:', itemId);

      let detailedItemId = null;
      let consumptionMaterials = [];

      // Try to get from cache first
      consumptionMaterials = getConsumptionMaterialsFromCache(itemData.itemNo);

      if (consumptionMaterials && consumptionMaterials.length > 0) {
        console.log("✓ Using cached consumption materials for material creation:", consumptionMaterials.length);
      } else {
        // Ensure itemOptions is loaded
        if (!itemOptions || itemOptions.length === 0) {
          await loadItemOptions();
        }

        // Find detailed item from master data
        try {
          const detailedItem = itemOptions.find(opt => opt.ssrItemId === itemData.itemNo);
          
          if (detailedItem) {
            console.log("Found detailed master item:", detailedItem);
            detailedItemId = detailedItem.detailedItemId;
            
            // Store page number in localStorage when found
            if (detailedItem.pageNo) {
              storePageNumberForItem(itemData.itemNo, detailedItem.pageNo);
            }
            
            // Fetch consumption materials if we have detailedItemId
            if (detailedItemId) {
              const materialsResponse = await fetch(
                `${API_BASE_URL}/api/master/consumptionMaterialAndRoad/getDetailedItemId?detailedItemId=${detailedItemId}`, 
                {
                  headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Accept": "*/*"
                  }
                }
              );
              
              if (materialsResponse.ok) {
                const materialsData = await materialsResponse.json();
                const validMaterials = Array.isArray(materialsData) ? 
                  materialsData.filter(mat => mat.materialName && mat.fkMaterialId && mat.fkMaterialId > 0) : [];
                
                if (validMaterials.length > 0) {
                  consumptionMaterials = validMaterials;
                  // Cache the materials for future use
                  storeConsumptionMaterialsInCache(itemData.itemNo, detailedItemId, validMaterials);
                  console.log("✓ Fetched and cached consumption materials:", validMaterials.length);
                }
              } else {
                console.warn("Failed to fetch consumption materials:", materialsResponse.status);
              }
            }
          } else {
            console.warn(`No detailed item found for itemNo: ${itemData.itemNo}`);
            return;
          }
        } catch (detailError) {
          console.warn("Error finding detailed item:", detailError);
          return;
        }
      }

      // Create transaction item properties from consumption materials
      if (consumptionMaterials.length > 0) {
        console.log("Creating transaction item properties from consumption materials...");
        
        const propertyCreationPromises = consumptionMaterials.map(async (material, index) => {
          // Validate material data before creating property
          if (!material.materialName || material.constant === null || material.constant === undefined) {
            console.warn(`Invalid material data at index ${index}:`, material);
            return { error: true, material: material.materialName || `Material ${index + 1}`, errorDetails: 'Invalid material data' };
          }
          
          const propertyData = {
            txnItemId: itemId,
            material: material.materialName.trim(),
            materialConstant: parseFloat(material.constant) || 0,
            materialUnit: material.materialUnit ? material.materialUnit.trim() : "Unit"
          };
          
          console.log(`Creating property ${index + 1}:`, propertyData);
          
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
              const createdProperty = await createResponse.json();
              console.log(`Successfully created property ${index + 1}:`, createdProperty);
              return createdProperty;
            } else {
              // Get detailed error information
              let errorDetails = '';
              try {
                const errorResponse = await createResponse.json();
                errorDetails = errorResponse.message || errorResponse.error || createResponse.statusText;
              } catch {
                errorDetails = await createResponse.text() || createResponse.statusText;
              }
              
              console.error(`Failed to create property for material ${material.materialName}:`, {
                status: createResponse.status,
                statusText: createResponse.statusText,
                errorDetails: errorDetails,
                requestData: propertyData
              });
              
              return {
                error: true,
                material: material.materialName,
                errorDetails: errorDetails,
                status: createResponse.status
              };
            }
          } catch (createError) {
            console.error(`Network error creating property for material ${material.materialName}:`, createError);
            return {
              error: true,
              material: material.materialName,
              errorDetails: createError.message,
              networkError: true
            };
          }
        });
        
        const createdPropertiesResults = await Promise.allSettled(propertyCreationPromises);
        const successfulProperties = [];
        const failedProperties = [];
        
        createdPropertiesResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value !== null) {
            if (result.value.error) {
              failedProperties.push({
                material: result.value.material,
                error: result.value.errorDetails,
                index: index + 1
              });
            } else {
              successfulProperties.push(result.value);
            }
          } else {
            failedProperties.push({
              material: consumptionMaterials[index]?.materialName || `Material ${index + 1}`,
              error: result.reason?.message || 'Unknown error',
              index: index + 1
            });
          }
        });
        
        // Log results
        if (successfulProperties.length > 0) {
          console.log(`Successfully created ${successfulProperties.length} material properties for item ${itemId}`);
          
          if (failedProperties.length > 0) {
            console.warn(`Failed to create ${failedProperties.length} properties:`, failedProperties);
          }
        } else {
          console.error("Failed to create any material properties for item:", itemId);
          if (failedProperties.length > 0) {
            const errorSummary = failedProperties.map(f => `${f.material}: ${f.error}`).join('; ');
            console.error("Creation failures summary:", errorSummary);
          }
        }
      } else {
        console.log("No consumption materials found for item:", itemId);
      }
      
    } catch (error) {
      console.error("Error in createMaterialsForItem:", error);
    }
  };

const initializeMaterialCache = async () => {
  try {
    console.log("Initializing material cache...");
    
    // Check if we need to preload
    const stats = getConsumptionMaterialsCacheStats();
    
    if (stats && stats.materialMappings > 50) {
      console.log("✓ Material cache already has sufficient data");
    } else {
      console.log("Preloading consumption materials...");
      await preloadConsumptionMaterials();
    }
    
  } catch (error) {
    console.error("Error initializing material cache:", error);
  }
};
const storeConsumptionMaterialsInCache = (itemNo, detailedItemId, consumptionMaterials) => {
  try {
    const cacheKey = 'consumptionMaterialsCache';
    let cache = {};
    
    // Try to get existing cache
    const existingCache = localStorage.getItem(cacheKey);
    if (existingCache) {
      cache = JSON.parse(existingCache);
    }
    
    // Store by both itemNo and detailedItemId for flexible lookup
    const materialData = {
      itemNo,
      detailedItemId,
      consumptionMaterials: Array.isArray(consumptionMaterials) ? consumptionMaterials : [],
      timestamp: Date.now(),
      version: '1.0'
    };
    
    cache[itemNo] = materialData;
    if (detailedItemId) {
      cache[`detailed_${detailedItemId}`] = materialData;
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    console.log(`✓ Cached consumption materials for ${itemNo}:`, consumptionMaterials.length, 'materials');
    
    // Also create a material name to fkMaterialId mapping cache
    updateMaterialIdMappingCache(consumptionMaterials);
    
  } catch (error) {
    console.error('Error storing consumption materials in cache:', error);
  }
};

// Function to update material name to ID mapping cache
const updateMaterialIdMappingCache = (consumptionMaterials) => {
  try {
    const mappingCacheKey = 'materialIdMappingCache';
    let mappingCache = {};
    
    // Get existing mapping cache
    const existingMapping = localStorage.getItem(mappingCacheKey);
    if (existingMapping) {
      mappingCache = JSON.parse(existingMapping);
    }
    
    // Add new mappings
    consumptionMaterials.forEach(material => {
      if (material.materialName && material.fkMaterialId && material.fkMaterialId > 0) {
        const materialKey = material.materialName.trim().toUpperCase();
        mappingCache[materialKey] = {
          fkMaterialId: material.fkMaterialId,
          materialName: material.materialName,
          materialUnit: material.materialUnit,
          constant: material.constant,
          lastUpdated: Date.now()
        };
      }
    });
    
    localStorage.setItem(mappingCacheKey, JSON.stringify(mappingCache));
    console.log(`✓ Updated material ID mapping cache with ${consumptionMaterials.length} materials`);
    
  } catch (error) {
    console.error('Error updating material ID mapping cache:', error);
  }
};

// Function to get consumption materials from cache
const getConsumptionMaterialsFromCache = (itemNo, detailedItemId = null) => {
  try {
    const cacheKey = 'consumptionMaterialsCache';
    const cache = localStorage.getItem(cacheKey);
    
    if (!cache) {
      return null;
    }
    
    const parsedCache = JSON.parse(cache);
    
    // Try to find by itemNo first
    if (parsedCache[itemNo]) {
      console.log(`✓ Found cached consumption materials for itemNo: ${itemNo}`);
      return parsedCache[itemNo].consumptionMaterials;
    }
    
    // Try to find by detailedItemId
    if (detailedItemId && parsedCache[`detailed_${detailedItemId}`]) {
      console.log(`✓ Found cached consumption materials for detailedItemId: ${detailedItemId}`);
      return parsedCache[`detailed_${detailedItemId}`].consumptionMaterials;
    }
    
    console.log(`No cached consumption materials found for ${itemNo}/${detailedItemId}`);
    return null;
    
  } catch (error) {
    console.error('Error getting consumption materials from cache:', error);
    return null;
  }
};

// Function to get material ID from mapping cache
const getMaterialIdFromCache = (materialName) => {
  try {
    const mappingCacheKey = 'materialIdMappingCache';
    const cache = localStorage.getItem(mappingCacheKey);
    
    if (!cache) {
      return null;
    }
    
    const parsedCache = JSON.parse(cache);
    const materialKey = materialName.trim().toUpperCase();
    
    if (parsedCache[materialKey]) {
      console.log(`✓ Found cached material ID for ${materialName}: ${parsedCache[materialKey].fkMaterialId}`);
      return parsedCache[materialKey];
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting material ID from cache:', error);
    return null;
  }
};

// Function to clear consumption materials cache (call this when needed)
const clearConsumptionMaterialsCache = () => {
  try {
    localStorage.removeItem('consumptionMaterialsCache');
    localStorage.removeItem('materialIdMappingCache');
    console.log('✓ Cleared consumption materials cache');
  } catch (error) {
    console.error('Error clearing consumption materials cache:', error);
  }
};

// Function to get cache statistics
const getConsumptionMaterialsCacheStats = () => {
  try {
    const cacheKey = 'consumptionMaterialsCache';
    const mappingCacheKey = 'materialIdMappingCache';
    
    const cache = localStorage.getItem(cacheKey);
    const mappingCache = localStorage.getItem(mappingCacheKey);
    
    const stats = {
      itemsCached: 0,
      materialMappings: 0,
      cacheSize: 0,
      mappingCacheSize: 0
    };
    
    if (cache) {
      const parsedCache = JSON.parse(cache);
      stats.itemsCached = Object.keys(parsedCache).length;
      stats.cacheSize = cache.length;
    }
    
    if (mappingCache) {
      const parsedMappingCache = JSON.parse(mappingCache);
      stats.materialMappings = Object.keys(parsedMappingCache).length;
      stats.mappingCacheSize = mappingCache.length;
    }
    
    console.log('Cache statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error getting cache statistics:', error);
    return null;
  }
};
  useEffect(() => {
    loadItemOptions();
  }, [jwtToken]);
useEffect(() => {
  initializeMaterialCache();
}, []);
const refreshMaterialData = async () => {
  console.log("Refreshing material data...");
  
  // Clear cache
  clearConsumptionMaterialsCache();
  
  // Preload fresh data
  await preloadConsumptionMaterials();
  
  // Reload material summary
  await loadData();
  
  console.log("✓ Material data refreshed");
};

 const updateMaterialTotals = (updatedItems) => {
  const updatedMaterialData = { ...materialData };
  
  updatedItems.forEach(item => {
    if (item.materials && Array.isArray(item.materials)) {
      if (!updatedMaterialData[item.id]) {
        updatedMaterialData[item.id] = {};
      }
      
      item.materials.forEach(material => {
        if (material.material) {
          const constant = parseFloat(material.materialConstant) || 0;
          const newTotal = constant * parseFloat(item.quantity || 0);
          
          updatedMaterialData[item.id][material.material] = {
            constant: constant,
            unit: material.materialUnit || 'Unit',
            total: newTotal
          };
          
          console.log(`Updated material total for item ${item.itemNo}, material ${material.material}: constant=${constant}, quantity=${item.quantity}, total=${newTotal}`);
        }
      });
    }
  });
  
  setMaterialData(updatedMaterialData);
  return updatedMaterialData;
};
  // Handle manual refresh
 const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  };
  // Material Summary Preview Modal
  const MaterialSummaryPreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Material Summary Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <X size={16} /> Close Preview
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
              
              {/* Header */}
              <div className="text-center mb-6 relative" style={{zIndex: 10}}>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  NAME OF WORK- {workName.toUpperCase()}
                </h1>
                <h2 className="text-xl font-semibold text-gray-700">
                  MATERIAL SUMMARY
                </h2>
              </div>

              {/* Main Table */}
              <div className="overflow-x-auto relative" style={{zIndex: 10}}>
                <table className="w-full border-collapse border border-gray-300 mb-6" style={{backgroundColor: 'white'}}>
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-3 text-center" style={{backgroundColor: '#f3f4f6'}}>SR.NO.</th>
                      <th className="border border-gray-300 p-3 text-center" style={{backgroundColor: '#f3f4f6'}}>MATERIAL</th>
                      <th className="border border-gray-300 p-3 text-center" style={{backgroundColor: '#f3f4f6'}}>TOTAL QUANTITY</th>
                      <th className="border border-gray-300 p-3 text-center" style={{backgroundColor: '#f3f4f6'}}>QUANTITY OF ROYALTY</th>
                      <th className="border border-gray-300 p-3 text-center" style={{backgroundColor: '#f3f4f6'}}>REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialSummary.length > 0 ? (
  materialSummary.map((material) => (
    <tr key={material.srNo} className="hover:bg-gray-50">
      <td className="border border-gray-300 p-3 text-center font-medium">
        {material.srNo}
      </td>
      <td className="border border-gray-300 p-3 font-medium">
        {material.materialName.toUpperCase()}
      </td>
         <td className="border border-gray-300 p-3 text-center font-mono" style={{backgroundColor: 'white'}}>
                            {loadingMts ? (
                              <Loader className="animate-spin h-4 w-4 mx-auto" />
                            ) : (
                              `${material.totalQuantity} ${material.unit}`
                            )}
                          </td>
      <td className="border border-gray-300 p-3 text-center font-mono">
        {loadingRoyalty ? (
          <Loader className="animate-spin h-4 w-4 mx-auto" />
        ) : (
          material.royaltyQuantity
        )}
      </td>
      <td className="border border-gray-300 p-3 text-center">
        {material.remarks || '-'}
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="5" className="border border-gray-300 p-8 text-center text-gray-500">
      <div className="flex flex-col items-center gap-2">
        {loadingMts ? (
          <>
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
            <span>Loading material quantities...</span>
          </>
        ) : (
          <>
            <FileText className="h-8 w-8 text-gray-400" />
            <span>No materials found. Please ensure items have material properties configured.</span>
          </>
        )}
      </div>
    </td>
  </tr>
)}
                  </tbody>
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-center">
             <LuLoaderCircle className="animate-spin h-10 w-10 text-orange-600 mr-3" />
              <span className="text-lg">Loading material summary data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                NAME OF WORK- {workName.toUpperCase()}
              </h1>
              <h2 className="text-xl font-semibold text-gray-700">
                MATERIAL SUMMARY
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
             
            </div>
          </div>
        </div>

        {/* Main Material Summary Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
  {(loadingRoyalty || loadingMts) && (
    <div className="bg-blue-50 border-b border-blue-200 p-3">
      <div className="flex items-center gap-2 text-blue-700">
        <Loader className="animate-spin h-4 w-4" />
        <span className="text-sm">
          {loadingMts && loadingRoyalty 
            ? "Loading quantities and royalty information..." 
            : loadingMts 
            ? "Loading material quantities..." 
            : "Fetching royalty information..."}
        </span>
      </div>
    </div>
  )}
          
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-center font-semibold">SR.NO.</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">MATERIAL</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">TOTAL QUANTITY</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">QUANTITY OF ROYALTY</th>
                <th className="border border-gray-300 p-3 text-center font-semibold">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {materialSummary.length > 0 ? (
  materialSummary.map((material) => (
    <tr key={material.srNo} className="hover:bg-gray-50">
      <td className="border border-gray-300 p-3 text-center font-medium">
        {material.srNo}
      </td>
      <td className="border border-gray-300 p-3 font-medium">
        {material.materialName.toUpperCase()}
      </td>
      <td className="border border-gray-300 p-3 text-center font-mono" style={{backgroundColor: 'white'}}>
                            {loadingMts ? (
                              <Loader className="animate-spin h-4 w-4 mx-auto" />
                            ) : (
                              `${material.totalQuantity} ${material.unit}`
                            )}
                          </td>
      <td className="border border-gray-300 p-3 text-center font-mono">
        {loadingRoyalty ? (
          <Loader className="animate-spin h-4 w-4 mx-auto" />
        ) : (
          material.royaltyQuantity
        )}
      </td>
      <td className="border border-gray-300 p-3 text-center">
        {material.remarks || '-'}
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="5" className="border border-gray-300 p-8 text-center text-gray-500">
      <div className="flex flex-col items-center gap-2">
        {loadingMts ? (
          <>
            <Loader className="animate-spin h-8 w-8 text-blue-500" />
            <span>Loading material quantities...</span>
          </>
        ) : (
          <>
            <FileText className="h-8 w-8 text-gray-400" />
            <span>No materials found. Please ensure items have material properties configured.</span>
          </>
        )}
      </div>
    </td>
  </tr>
)}
            </tbody>
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
      
      <MaterialSummaryPreviewModal />
    </div>
  );
};

export default MaterialSummaryComponent;