import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, Download, AlertTriangle, Loader, Eye, X,ArrowRight  } from 'lucide-react';
import { API_BASE_URL } from '../config';
import StepperPage from './Stepper';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
const RoyaltyComponent = () => {
  const [items, setItems] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [materialData, setMaterialData] = useState({});
  const [royaltyMaterials, setRoyaltyMaterials] = useState([]);
  const [naturalSandMaterials, setNaturalSandMaterials] = useState([]);
  const [otherMineralMaterials, setOtherMineralMaterials] = useState([]);
  const [mtsData, setMtsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [workName, setWorkName] = useState('');
  const [signatures, setSignatures] = useState({
    preparedBy: '',
    checkedBy: ''
  });
  const [ssrOptions, setSSROptions] = useState([]);
  const [currentStep, setCurrentStep] = useState(4); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [loadingMts, setLoadingMts] = useState(false);
  const [loadingRoyalty, setLoadingRoyalty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [ssrYear, setSsrYear] = useState('');
const NATURAL_SAND_RATE = 237.37; // Rate inclusive of surcharges 2% + Mineral Foundation 10%
const OTHER_MINERALS_RATE = 216.18; 
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
const handleStepNavigation = (stepId) => {
  const stepRoutes = {
    1: '/estimate',
    2: '/subestimate', 
    3: '/lead',
    4: '/royalty',
    5: '/mat',
    6: '/cmt-qty',
    7: '/pdf-preview'
  };

  // Navigate to the corresponding route
  if (stepRoutes[stepId]) {
    navigate(stepRoutes[stepId]);
  }
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
  const fetchMaterialDetails = async (materialId) => {
    if (!jwtToken) {
      console.warn('No JWT token available for fetching material details');
      return { royalty: 'NO', royaltyValue: '-', materialName: '', materialType: 'OTHER' };
    }
    
    if (!materialId || materialId <= 0) {
      console.warn(`Invalid materialId: ${materialId}`);
      return { royalty: 'NO', royaltyValue: '-', materialName: '', materialType: 'OTHER' };
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
        const materialName = materialDetails?.materialName || '';
        
        // Determine material type based on name
        const materialType = determineMaterialType(materialName);
        
        console.log(`✓ Material details for ID ${materialId}:`, { royalty, materialName, materialType });
        
        return { 
          royalty: royalty,
          royaltyValue: royalty,
          materialName: materialName,
          materialType: materialType,
          materialDetails: materialDetails
        };
      } else {
        const errorText = await response.text();
        console.warn(`HTTP ${response.status} error for material ID ${materialId}:`, errorText);
        return { royalty: 'NO', royaltyValue: '-', materialName: '', materialType: 'OTHER', error: `HTTP ${response.status}` };
      }

    } catch (error) {
      console.error(`Network/fetch error for material ID ${materialId}:`, error.message);
      return { royalty: 'NO', royaltyValue: '-', materialName: '', materialType: 'OTHER', error: error.message };
    }
  };

  // Determine if material is sand or other mineral
  const determineMaterialType = (materialName) => {
    if (!materialName) return 'OTHER';
    
    const lowerName = materialName.toLowerCase();
    
    // Check for sand-related keywords
    const sandKeywords = ['sand', 'natural sand', 'river sand', 'fine sand', 'coarse sand', 'manufactured sand', 'm-sand'];
    
    if (sandKeywords.some(keyword => lowerName.includes(keyword))) {
      return 'NATURAL_SAND';
    }
    
    return 'OTHER';
  };

  // Bulk fetch all item properties at once
  const fetchAllItemProperties = async (itemIds) => {
    if (!jwtToken || !itemIds.length) return {};
    
    try {
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

  // Get consumption materials from cache
  const getConsumptionMaterialsFromCache = (itemNo) => {
    try {
      const cacheKey = 'consumptionMaterialsCache';
      const cache = localStorage.getItem(cacheKey);
      
      if (!cache) return null;
      
      const parsedCache = JSON.parse(cache);
      
      if (parsedCache[itemNo]) {
        console.log(`✓ Found cached consumption materials for itemNo: ${itemNo}`);
        return parsedCache[itemNo].consumptionMaterials;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting consumption materials from cache:', error);
      return null;
    }
  };

  // Get all unique materials with their IDs from items with materials
  const getAllUniqueMaterials = (itemsWithMaterials) => {
    const materialsMap = new Map();
    
    console.log('Processing items for unique materials:', itemsWithMaterials.length);
    
    itemsWithMaterials.forEach((item, itemIndex) => {
      console.log(`\n=== Processing Item ${itemIndex + 1}: ${item.itemNo} ===`);
      
      // Check consumption materials data first
      if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
        console.log(`Found ${item.consumptionMaterials.length} consumption materials`);
        
        item.consumptionMaterials.forEach((material) => {
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
            }
          }
        });
      }
      
      // Check transaction item properties
      if (item.materials && Array.isArray(item.materials)) {
        console.log(`Found ${item.materials.length} transaction item properties`);
        
        item.materials.forEach((material) => {
          if (material.material) {
            const materialName = material.material.trim();
            
            if (!materialsMap.has(materialName)) {
              materialsMap.set(materialName, {
                name: materialName,
                id: null, // Will need to be fetched
                unit: material.materialUnit || 'Unit',
                source: 'transaction',
                constant: material.materialConstant
              });
            }
          }
        });
      }
    });
    
    const uniqueMaterials = Array.from(materialsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    return uniqueMaterials;
  };

  // Filter and categorize royalty materials
const processRoyaltyMaterials = async (itemsWithQuantities, materials) => {
  setLoadingRoyalty(true);
  console.log(`\n=== PROCESSING ROYALTY MATERIALS ===`);
  console.log(`Processing ${materials.length} materials for royalty`);
  
  try {
    const royaltyMaterialsList = [];
    const naturalSandList = [];
    const otherMineralsList = [];
    
    const batchSize = 5;
    
    for (let i = 0; i < materials.length; i += batchSize) {
      const batch = materials.slice(i, i + batchSize);
      console.log(`\nProcessing royalty batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(materials.length / batchSize)}`);
      
      const batchPromises = batch.map(async (material, batchIndex) => {
        const materialIndex = i + batchIndex;
        
        console.log(`\n--- Processing Material ${materialIndex + 1}: ${material.name} (ID: ${material.id}) ---`);
        
        let totalQuantity = 0;
        const itemCalculations = [];
        let materialConstant = 0; // Store the constant for header display
        
        itemsWithQuantities.forEach(item => {
          if (!item.quantity || item.quantity <= 0) return;
          
          let materialFound = false;
          let currentConstant = 0;
          let source = '';
          
          // Check consumption materials data first
          if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
            const materialMatch = item.consumptionMaterials.find(mat => {
              const matchName = mat.materialName && mat.materialName.trim().toLowerCase();
              const targetName = material.name.trim().toLowerCase();
              return matchName === targetName;
            });
            
            if (materialMatch) {
              currentConstant = parseFloat(materialMatch.constant) || 0;
              materialFound = true;
              source = 'consumption';
              materialConstant = currentConstant; // Store for header
            }
          }
          
          // Fallback to item materials
          if (!materialFound && item.materials && Array.isArray(item.materials)) {
            const materialMatch = item.materials.find(mat => {
              const matchName = mat.material && mat.material.trim().toLowerCase();
              const targetName = material.name.trim().toLowerCase();
              return matchName === targetName;
            });
            
            if (materialMatch) {
              currentConstant = parseFloat(materialMatch.materialConstant) || 0;
              materialFound = true;
              source = 'transaction';
              materialConstant = currentConstant; // Store for header
            }
          }
          
          if (materialFound) {
            const itemQuantity = parseFloat(item.quantity) || 0;
            const materialTotal = currentConstant * itemQuantity;
            totalQuantity += materialTotal;
            
            itemCalculations.push({
              itemNo: item.itemNo,
              itemQuantity,
              materialConstant: currentConstant,
              materialTotal,
              source
            });
          }
        });

        console.log(`  Total quantity for ${material.name}: ${totalQuantity}`);

        // Fetch royalty information
        let materialDetails = null;
        if (material.id && material.id > 0) {
          materialDetails = await fetchMaterialDetails(material.id);
        }

        // Only include materials with royalty flag = YES
        if (materialDetails && materialDetails.royalty === 'YES') {
          const royaltyMaterial = {
            srNo: royaltyMaterialsList.length + 1,
            materialName: material.name,
            totalQuantity: totalQuantity,
            unit: material.unit,
            royaltyFlag: materialDetails.royalty,
            royaltyValue: materialDetails.royaltyValue,
            materialType: materialDetails.materialType,
            materialId: material.id,
            itemCalculations: itemCalculations,
            materialConstant: materialConstant // Add this for header display
          };
          
          royaltyMaterialsList.push(royaltyMaterial);
          
          // Categorize into Natural Sand or Other Minerals
          if (materialDetails.materialType === 'NATURAL_SAND') {
            naturalSandList.push(royaltyMaterial);
          } else {
            otherMineralsList.push(royaltyMaterial);
          }
          
          console.log(`  ✓ Added to royalty materials: ${material.name} (Type: ${materialDetails.materialType}, Constant: ${materialConstant})`);
        } else {
          console.log(`  ✗ Skipped (no royalty): ${material.name}`);
        }

        return null;
      });

      await Promise.all(batchPromises);
      
      if (i + batchSize < materials.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Update state with categorized materials
    setRoyaltyMaterials(royaltyMaterialsList);
    setNaturalSandMaterials(naturalSandList);
    setOtherMineralMaterials(otherMineralsList);
    
    console.log(`\n=== ROYALTY PROCESSING COMPLETED ===`);
    console.log(`Total royalty materials: ${royaltyMaterialsList.length}`);
    console.log(`Natural Sand materials: ${naturalSandList.length}`);
    console.log(`Other Mineral materials: ${otherMineralsList.length}`);
    
  } catch (error) {
    console.error('Error processing royalty materials:', error);
  } finally {
    setLoadingRoyalty(false);
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

    const itemsWithMaterials = itemsList.filter(item => 
      item.materials && Array.isArray(item.materials) && item.materials.length > 0
    );

    try {
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

      await Promise.all(mtsPromises);
      
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

  // Main data loading function
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('\n=== STARTING ROYALTY DATA LOAD ===');
      
      // Load basic data
      loadWorkName();
      loadSignatureData();
      
      // Load items from cache
      const cachedItems = loadItemsFromCache();
      if (cachedItems.length === 0) {
        setItems([]);
        setRoyaltyMaterials([]);
        setNaturalSandMaterials([]);
        setOtherMineralMaterials([]);
        setMaterialData({});
        setMtsData({});
        setLoading(false);
        return;
      }

      console.log(`Loaded ${cachedItems.length} items from cache`);

      // Get page numbers from localStorage
      const itemPageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
      
      // Add page numbers to items
      const itemsWithDetails = cachedItems.map(item => {
        const pageNo = itemPageNumbers[item.itemNo] || 'N/A';
        return {
          ...item,
          pageNo,
          materials: []
        };
      });

      // Bulk fetch all existing item properties
      const itemIds = itemsWithDetails.map(item => item.id);
      console.log('Fetching properties for', itemIds.length, 'items in parallel...');
      const existingPropertiesMap = await fetchAllItemProperties(itemIds);

      // Add properties and consumption materials to items
      const itemsWithMaterials = [];
      
      itemsWithDetails.forEach(item => {
        const existingProperties = existingPropertiesMap[item.id] || [];
        const cachedConsumptionMaterials = getConsumptionMaterialsFromCache(item.itemNo) || [];
        
        if (existingProperties.length > 0 || cachedConsumptionMaterials.length > 0) {
          itemsWithMaterials.push({
            ...item,
            materials: existingProperties,
            consumptionMaterials: cachedConsumptionMaterials
          });
        }
      });

      console.log(`Found ${itemsWithMaterials.length} items with materials`);

      // Get all unique materials
      const uniqueMaterials = getAllUniqueMaterials(itemsWithMaterials);
      console.log(`Found ${uniqueMaterials.length} unique materials`);
      
      // Fetch MTS data first
      console.log('\nFetching MTS data for all items...');
      await fetchAllMtsData(itemsWithMaterials);
      
      // Get updated items with quantities for royalty processing
      const itemsWithQuantities = items.length > 0 ? items : itemsWithMaterials;
      
      // Process royalty materials
      console.log('\nProcessing royalty materials...');
      await processRoyaltyMaterials(itemsWithQuantities, uniqueMaterials);

      console.log('\n✓ Royalty data loading completed successfully');

    } catch (error) {
      console.error('Error loading royalty data:', error);
      setError('Failed to load royalty data');
    } finally {
      setLoading(false);
    }
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
 const navigateToMAT = async () => {
  // const allSubworkIds = Object.keys(items);
  
  // if (allSubworkIds.length === 0) {
  //   toast.error("No subworks or items found to proceed to royalty");
  //   return;
  // }

  // const allItemsWithMeasurements = await Promise.all(
  //   allSubworkIds.flatMap(subworkId =>
  //     (items[subworkId] || []).map(async (item) => {
  //       try {
  //         const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${item.id}`, {
  //           headers: {
  //             Authorization: `Bearer ${jwtToken}`,
  //             "Content-Type": "application/json",
  //           },
  //         });
  //         const measurements = await response.json();
  //         return { ...item, measurements: Array.isArray(measurements) ? measurements : [] };
  //       } catch (err) {
  //         console.error("Error fetching measurements for item", item.id, err);
  //         return { ...item, measurements: [] };
  //       }
  //     })
  //   )
  // );

  // localStorage.setItem("subRecordCache", JSON.stringify(allItemsWithMeasurements));
  // localStorage.setItem("pdfWorkName", workOrderInfo.nameOfWork);
  // localStorage.setItem("pdfWorkOrderId", workOrderInfo.autogenerated);
  // localStorage.setItem("pdfRevisionNumber", workOrderInfo.reviseno);

  // toast.success("Preparing mts data...");
  navigate("/mat");
};
  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get material data for an item

const getItemCombinedMaterialData = (item, materialType) => {
  const materialsToCheck = materialType === 'NATURAL_SAND' ? naturalSandMaterials : otherMineralMaterials;
  
  if (materialType === 'NATURAL_SAND') {
    // Keep existing logic for Natural Sand (separate columns per material)
    const itemMaterialData = [];
    materialsToCheck.forEach((material, materialIndex) => {
      let materialConstant = 0;
      let materialFound = false;

      // Check consumption materials first
      if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
        const materialMatch = item.consumptionMaterials.find(mat => {
          const matchName = mat.materialName && mat.materialName.trim().toLowerCase();
          const targetName = material.materialName.trim().toLowerCase();
          return matchName === targetName;
        });
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.constant) || 0;
          materialFound = true;
        }
      }
      
      // Fallback to transaction item properties
      if (!materialFound && item.materials && Array.isArray(item.materials)) {
        const materialMatch = item.materials.find(mat => {
          const matchName = mat.material && mat.material.trim().toLowerCase();
          const targetName = material.materialName.trim().toLowerCase();
          return matchName === targetName;
        });
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.materialConstant) || 0;
          materialFound = true;
        }
      }

      const calculatedQuantity = materialFound ? (materialConstant * parseFloat(item.quantity || 0)) : 0;
      
      itemMaterialData.push({
        materialIndex: materialIndex,
        materialName: material.materialName,
        factor: materialFound ? materialConstant : 0,
        quantity: calculatedQuantity,
        unit: material.unit,
        found: materialFound
      });
    });

    return itemMaterialData;
  } else {
    // NEW LOGIC: For Other Minerals, combine all materials into single factor/quantity
    let combinedFactor = 0;
    let combinedQuantity = 0;
    let materialsFound = 0;

    materialsToCheck.forEach((material) => {
      let materialConstant = 0;
      let materialFound = false;

      // Check consumption materials first
      if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
        const materialMatch = item.consumptionMaterials.find(mat => {
          const matchName = mat.materialName && mat.materialName.trim().toLowerCase();
          const targetName = material.materialName.trim().toLowerCase();
          return matchName === targetName;
        });
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.constant) || 0;
          materialFound = true;
        }
      }
      
      // Fallback to transaction item properties
      if (!materialFound && item.materials && Array.isArray(item.materials)) {
        const materialMatch = item.materials.find(mat => {
          const matchName = mat.material && mat.material.trim().toLowerCase();
          const targetName = material.materialName.trim().toLowerCase();
          return matchName === targetName;
        });
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.materialConstant) || 0;
          materialFound = true;
        }
      }

      if (materialFound) {
        combinedFactor += materialConstant;
        combinedQuantity += (materialConstant * parseFloat(item.quantity || 0));
        materialsFound++;
      }
    });

    // Return single combined result for Other Minerals
    return {
      combinedFactor: combinedFactor,
      combinedQuantity: combinedQuantity,
      materialsFound: materialsFound,
      hasData: materialsFound > 0
    };
  }
};
  // Calculate column spans
  const naturalSandColumns = naturalSandMaterials.length;
  const otherMaterialColumns = otherMineralMaterials.length;

 

const RoyaltyTable = ({ isPreview = false }) => (
  <div className={`overflow-x-auto ${isPreview ? 'relative' : ''}`}>
    <table className="w-full border-collapse border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border border-gray-300 p-2 text-center" rowSpan="2">Sr. No.</th>
          <th className="border border-gray-300 p-2 text-center" rowSpan="2">Item Of Work</th>
          <th className="border border-gray-300 p-2 text-center" rowSpan="2">Quantity</th>
          <th className="border border-gray-300 p-2 text-center" rowSpan="2">UNIT</th>
          
          {/* Natural Sand Section */}
          {naturalSandColumns > 0 && (
            <th className="border border-gray-300 p-2 text-center bg-blue-50" colSpan={naturalSandColumns * 2}>
              NATURAL SAND
            </th>
          )}
          
          {/* Other Minerals Section - UPDATED: Only 2 columns total */}
          {otherMaterialColumns > 0 && (
            <th className="border border-gray-300 p-2 text-center bg-orange-50" colSpan="2">
              OTHER MINERALS
            </th>
          )}
        </tr>
        <tr>
          {/* Natural Sand Factor/Qty headers */}
          {naturalSandMaterials.map((_, index) => (
            <React.Fragment key={`ns-headers-${index}`}>
              <th className="border border-gray-300 p-1 text-center text-xs bg-blue-50">Factor</th>
              <th className="border border-gray-300 p-1 text-center text-xs bg-blue-50">Qty.</th>
            </React.Fragment>
          ))}
          
          {/* Other Materials Factor/Qty headers - UPDATED: Only one pair */}
          {otherMaterialColumns > 0 && (
            <React.Fragment>
              <th className="border border-gray-300 p-1 text-center text-xs bg-orange-50">Factor</th>
              <th className="border border-gray-300 p-1 text-center text-xs bg-orange-50">Qty.</th>
            </React.Fragment>
          )}
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item, index) => {
            const naturalSandData = getItemCombinedMaterialData(item, 'NATURAL_SAND');
            const otherMaterialData = getItemCombinedMaterialData(item, 'OTHER');

            return (
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
                      SSR OF {ssrYear || 'N/A'} ITEM NO. {item.itemNo} PAGE NO. {item.pageNo || 'N/A'} 
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 p-2 text-center font-mono">
                  {item.quantity.toFixed(3)} 
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.unit}
                </td>
                
                {/* Natural Sand columns - keep separate columns per material */}
                {naturalSandMaterials.map((material, materialIndex) => {
                  const materialData = naturalSandData.find(data => 
                    data.materialName === material.materialName
                  );
                  
                  return (
                    <React.Fragment key={`ns-data-${materialIndex}`}>
                      <td className="border border-gray-300 p-2 text-center font-mono bg-blue-25">
                        {materialData ? materialData.factor.toFixed(5) : ''}
                      </td>
                      <td className="border border-gray-300 p-2 text-center font-mono bg-blue-25">
                        {materialData ? materialData.quantity.toFixed(3) : ''}
                      </td>
                    </React.Fragment>
                  );
                })}
                
                {/* Other Materials columns - UPDATED: Single combined column pair */}
                {otherMaterialColumns > 0 && (
                  <React.Fragment>
                    <td className="border border-gray-300 p-2 text-center font-mono bg-orange-25">
                      {otherMaterialData.hasData ? otherMaterialData.combinedFactor.toFixed(5) : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-mono bg-orange-25">
                      {otherMaterialData.hasData ? otherMaterialData.combinedQuantity.toFixed(3) : ''}
                    </td>
                  </React.Fragment>
                )}
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={4 + (naturalSandColumns * 2) + (otherMaterialColumns > 0 ? 2 : 0)} 
                className="border border-gray-300 p-8 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-gray-400" />
                <span>No items found with royalty materials.</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
      
      {/* Updated Totals section */}
      {items.length > 0 && (naturalSandColumns > 0 || otherMaterialColumns > 0) && (
        <tfoot className="bg-gray-100 font-bold">
          {/* Total Quantity Row */}
          <tr>
            <td colSpan="4" className="border border-gray-300 p-2 text-center">
              Total Qty. in Cubic Metre:
            </td>
            
            {/* Natural Sand quantity totals */}
            {naturalSandMaterials.map((material, index) => (
              <React.Fragment key={`ns-total-${index}`}>
                <td className="border border-gray-300 p-2 text-center bg-blue-50"></td>
                <td className="border border-gray-300 p-2 text-center font-mono bg-blue-50">
                  {material.totalQuantity.toFixed(3)}
                </td>
              </React.Fragment>
            ))}
            
            {/* Other Materials combined quantity total */}
            {otherMaterialColumns > 0 && (
              <React.Fragment>
                <td className="border border-gray-300 p-2 text-center bg-orange-50"></td>
                <td className="border border-gray-300 p-2 text-center font-mono bg-orange-50">
                  {otherMineralMaterials.reduce((total, material) => total + material.totalQuantity, 0).toFixed(3)}
                </td>
              </React.Fragment>
            )}
          </tr>
          
          {/* Rate Row */}
          <tr>
            <td colSpan="4" className="border border-gray-300 p-2 text-center">
              Rate INR.:
            </td>
            
            {/* Natural Sand rates */}
            {naturalSandMaterials.map(() => (
              <React.Fragment key={`ns-rate`}>
                <td className="border border-gray-300 p-2 text-center bg-blue-50"></td>
                <td className="border border-gray-300 p-2 text-center font-mono bg-blue-50">
                  {NATURAL_SAND_RATE.toFixed(3)}
                </td>
              </React.Fragment>
            ))}
            
            {/* Other Materials combined rate */}
            {otherMaterialColumns > 0 && (
              <React.Fragment>
                <td className="border border-gray-300 p-2 text-center bg-orange-50"></td>
                <td className="border border-gray-300 p-2 text-center font-mono bg-orange-50">
                  {OTHER_MINERALS_RATE.toFixed(3)}
                </td>
              </React.Fragment>
            )}
          </tr>
          
          {/* Total Amount Row */}
          <tr>
            <td colSpan="4" className="border border-gray-300 p-2 text-center">
              Total Amount INR.:
            </td>
            
            {/* Natural Sand amounts */}
            {naturalSandMaterials.map((material, index) => {
              const totalAmount = material.totalQuantity * NATURAL_SAND_RATE;
              return (
                <React.Fragment key={`ns-amount-${index}`}>
                  <td className="border border-gray-300 p-2 text-center bg-blue-50"></td>
                  <td className="border border-gray-300 p-2 text-center font-mono bg-blue-50">
                    {totalAmount.toFixed(3)}
                  </td>
                </React.Fragment>
              );
            })}
            
            {/* Other Materials combined amount */}
            {otherMaterialColumns > 0 && (
              <React.Fragment>
                <td className="border border-gray-300 p-2 text-center bg-orange-50"></td>
                <td className="border border-gray-300 p-2 text-center font-mono bg-orange-50">
                  {(otherMineralMaterials.reduce((total, material) => total + material.totalQuantity, 0) * OTHER_MINERALS_RATE).toFixed(3)}
                </td>
              </React.Fragment>
            )}
          </tr>
          
          {/* Grand Total Amount Row */}
          <tr className="bg-yellow-100">
            <td colSpan="4" className="border border-gray-300 p-2 text-center font-bold">
              Grand Total Amount INR.:
            </td>
            
            {(() => {
              const naturalSandGrandTotal = naturalSandMaterials.reduce((sum, material) => 
                sum + (material.totalQuantity * NATURAL_SAND_RATE), 0
              );
              const otherMineralsGrandTotal = otherMineralMaterials.reduce((sum, material) => 
                sum + (material.totalQuantity * OTHER_MINERALS_RATE), 0
              );
              const overallGrandTotal = naturalSandGrandTotal + otherMineralsGrandTotal;
              
              return (
                <td colSpan={`${(naturalSandColumns * 2) + (otherMaterialColumns > 0 ? 2 : 0)}`} 
                    className="border border-gray-300 p-2 text-center font-mono font-bold bg-yellow-100">
                  {overallGrandTotal.toFixed(3)}
                </td>
              );
            })()}
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);
const generatePDF = async () => {
  try {
    // Create a temporary container for the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Create the PDF content HTML
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1a1a1a;">
          ROYALTY STATEMENT
        </h1>
        <h2 style="font-size: 18px; font-weight: 600; margin: 0; color: #4a4a4a;">
          NAME OF WORK- ${workName.toUpperCase()}
        </h2>
      </div>
      
      <div style="overflow-x: auto; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #333; font-size: 10px;">
          <thead style="background-color: #f5f5f5;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px; text-align: center;" rowspan="2">Sr. No.</th>
              <th style="border: 1px solid #333; padding: 8px; text-align: center;" rowspan="2">Item Of Work</th>
              <th style="border: 1px solid #333; padding: 8px; text-align: center;" rowspan="2">Quantity</th>
              <th style="border: 1px solid #333; padding: 8px; text-align: center;" rowspan="2">UNIT</th>
              ${naturalSandMaterials.length > 0 ? `
                <th style="border: 1px solid #333; padding: 8px; text-align: center; background-color: #e3f2fd;" colspan="${naturalSandMaterials.length * 2}">
                  NATURAL SAND
                </th>
              ` : ''}
             ${otherMineralMaterials.length > 0 ? `
    <th style="border: 1px solid #333; padding: 8px; text-align: center; background-color: #fff3e0;" colspan="2">
      OTHER MINERALS
    </th>
  ` : ''}
            </tr>
            <tr>
              ${naturalSandMaterials.map(() => `
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; background-color: #e3f2fd;">Factor</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; background-color: #e3f2fd;">Qty.</th>
              `).join('')}
               ${otherMineralMaterials.length > 0 ? `
    <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; background-color: #fff3e0;">Factor</th>
    <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; background-color: #fff3e0;">Qty.</th>
  ` : ''}
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => {
              const naturalSandData = getItemCombinedMaterialData(item, 'NATURAL_SAND');
              const otherMaterialData = getItemCombinedMaterialData(item, 'OTHER');
              
              return `
                <tr>
                  <td style="border: 1px solid #333; padding: 6px; text-align: center; font-weight: 600;">
                    ${index + 1}
                  </td>
                  <td style="border: 1px solid #333; padding: 6px;">
                    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">
                      ${item.description}
                    </div>
                    <div style="font-size: 8px; color: #666;">
                      SSR OF ${ssrYear || 'N/A'} ITEM NO. ${item.itemNo} PAGE NO. ${item.pageNo || 'N/A'}
                    </div>
                  </td>
                  <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace;">
                    ${item.quantity.toFixed(3)}
                  </td>
                  <td style="border: 1px solid #333; padding: 6px; text-align: center;">
                    ${item.unit}
                  </td>
                  ${naturalSandMaterials.map((material) => {
                    const materialData = naturalSandData.find ? naturalSandData.find(data => 
                      data.materialName === material.materialName
                    ) : null;
                    return `
                      <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #f8fbff;">
                        ${materialData ? materialData.factor.toFixed(5) : ''}
                      </td>
                      <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #f8fbff;">
                        ${materialData ? materialData.quantity.toFixed(3) : ''}
                      </td>
                    `;
                  }).join('')}
                  ${otherMineralMaterials.length > 0 ? `
      <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #fefbf0;">
        ${otherMaterialData.hasData ? otherMaterialData.combinedFactor.toFixed(5) : ''}
      </td>
      <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #fefbf0;">
        ${otherMaterialData.hasData ? otherMaterialData.combinedQuantity.toFixed(3) : ''}
      </td>
  ` : ''}
                </tr>
              `;
            }).join('')}
          </tbody>
          
          ${items.length > 0 && (naturalSandMaterials.length > 0 || otherMineralMaterials.length > 0) ? `
          <tfoot style="background-color: #f5f5f5; font-weight: bold;">
            <!-- Total Quantity Row -->
            <tr>
              <td colspan="4" style="border: 1px solid #333; padding: 6px; text-align: center;">
                Total Qty. in Cubic Metre:
              </td>
              ${naturalSandMaterials.map((material) => `
                <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #e3f2fd;"></td>
                <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #e3f2fd;">
                  ${material.totalQuantity.toFixed(3)}
                </td>
              `).join('')}
${otherMineralMaterials.length > 0 ? `
    <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #fff3e0;"></td>
    <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #fff3e0;">
      ${otherMineralMaterials.reduce((total, material) => total + material.totalQuantity, 0).toFixed(3)}
    </td>
  ` : ''}
            </tr>
            
            <!-- Rate Row -->
            <tr>
              <td colspan="4" style="border: 1px solid #333; padding: 6px; text-align: center;">
                Rate INR.:
              </td>
              ${naturalSandMaterials.map(() => `
                <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #e3f2fd;"></td>
                <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #e3f2fd;">
                  ${NATURAL_SAND_RATE.toFixed(3)}
                </td>
              `).join('')}
              ${otherMineralMaterials.length > 0 ? `
                <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #fff3e0;"></td>
                <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #fff3e0;">
                  ${OTHER_MINERALS_RATE.toFixed(3)}
                </td>
              ` : ''}
            </tr>
            
            <!-- Total Amount Row -->
            <tr>
              <td colspan="4" style="border: 1px solid #333; padding: 6px; text-align: center;">
                Total Amount INR.:
              </td>
              ${naturalSandMaterials.map((material) => {
                const totalAmount = material.totalQuantity * NATURAL_SAND_RATE;
                return `
                  <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #e3f2fd;"></td>
                  <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #e3f2fd;">
                    ${totalAmount.toFixed(3)}
                  </td>
                `;
              }).join('')}
              ${otherMineralMaterials.length > 0 ? `
                <td style="border: 1px solid #333; padding: 6px; text-align: center; background-color: #fff3e0;"></td>
                <td style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; background-color: #fff3e0;">
                  ${(otherMineralMaterials.reduce((total, material) => total + material.totalQuantity, 0) * OTHER_MINERALS_RATE).toFixed(3)}
                </td>
              ` : ''}
            </tr>
            
            <!-- Grand Total Amount Row -->
            <tr style="background-color: #fff9c4;">
              <td colspan="4" style="border: 1px solid #333; padding: 6px; text-align: center; font-weight: bold;">
                Grand Total Amount INR.:
              </td>
              ${(() => {
                const naturalSandGrandTotal = naturalSandMaterials.reduce((sum, material) => 
                  sum + (material.totalQuantity * NATURAL_SAND_RATE), 0
                );
                const otherMineralsGrandTotal = otherMineralMaterials.reduce((sum, material) => 
                  sum + (material.totalQuantity * OTHER_MINERALS_RATE), 0
                );
                const overallGrandTotal = naturalSandGrandTotal + otherMineralsGrandTotal;
                
                return `
                  <td colspan="${(naturalSandMaterials.length * 2) + (otherMineralMaterials.length > 0 ? 2 : 0)}" 
                      style="border: 1px solid #333; padding: 6px; text-align: center; font-family: monospace; font-weight: bold; background-color: #fff9c4;">
                    ${overallGrandTotal.toFixed(3)}
                  </td>
                `;
              })()}
            </tr>
          </tfoot>
          ` : ''}
        </table>
      </div>
      
      <div style="margin: 30px 0;">
        <div style="font-size: 12px;">
          <p style="font-weight: bold; margin-bottom: 8px;">Notes:</p>
          <p style="margin-bottom: 4px;">1] Royalty charges for Natural Sand. Rate inclusive of surcharges of 2% + Mineral Foundation 10% [211.94 + 4.24 + 21.19 = 237.37]</p>
          <p>2] Royalty charges for Other Minerals. Rate inclusive of surcharges of 2% = [211.94 + 4.24 = 216.18]</p>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="text-align: center; min-width: 200px;">
          <div style="border-bottom: 1px solid #666; height: 60px; margin-bottom: 8px;"></div>
          <p style="font-weight: bold; margin-bottom: 8px;">Prepared By</p>
          <span style="color: #666;">${signatures.preparedBy}</span>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <div style="border-bottom: 1px solid #666; height: 60px; margin-bottom: 8px;"></div>
          <p style="font-weight: bold; margin-bottom: 8px;">Checked By</p>
          <span style="color: #666;">${signatures.checkedBy}</span>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    // Convert to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      backgroundColor: 'white',
      width: tempDiv.scrollWidth,
      height: tempDiv.scrollHeight
    });
    
    // Remove temporary element
    document.body.removeChild(tempDiv);
    
    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    const pdf = new jsPDF('p', 'mm');
    let position = 0;
    
    // Add first page
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download the PDF
    const workNameForFile = workName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    pdf.save(`royalty_statement_${workNameForFile}.pdf`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};
  const RoyaltyPreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-7xl max-h-full overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Royalty Statement Preview</h2>
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
                  ROYALTY STATEMENT
                </h1>
                <h2 className="text-lg font-semibold text-gray-700">
                  NAME OF WORK- {workName.toUpperCase()}
                </h2>
              </div>

              {/* Main Table */}
              <div className="relative" style={{zIndex: 10}}>
                <RoyaltyTable isPreview={true} />
              </div>

              {/* Notes Section */}
              <div className="mt-8 relative" style={{zIndex: 10}}>
                <div className="text-sm">
                  <p className="font-bold mb-2">Notes:</p>
                  <p className="mb-1">1] Royalty charges for Natural Sand. Rate inclusive of surcharges of 2% + Mineral Foundation 10% [211.94 + 4.24 + 21.19 = 237.37]</p>
                  <p>2] Royalty charges for Other Minerals. Rate inclusive of surcharges of 2% = [211.94 + 4.24 = 216.18]</p>
                </div>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Loading Royalty Data</h3>
              <p className="text-sm text-gray-600">Processing materials and royalty information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-4 text-red-600">
            <AlertTriangle className="h-8 w-8" />
            <div>
              <h3 className="text-lg font-medium">Error Loading Data</h3>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
         <div className="mb-6 mt-2 p-4 border border-gray-300 rounded bg-white shadow-md">
  <StepperPage 
    currentStep={currentStep}
    onStepClick={handleStepNavigation}
  />
</div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Royalty Statement</h1>
              <p className="text-sm text-gray-600 mt-1">
                Work: {workName} | Materials with royalty requirements: {royaltyMaterials.length}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
  <button
    onClick={handleRefresh}
    disabled={isRefreshing}
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
  >
    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    <span>Refresh</span>
  </button>
  <button
    onClick={() => setShowPreview(true)}
    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
  >
    <Eye className="h-4 w-4" />
    <span>Preview</span>
  </button>
  <button
    onClick={generatePDF}
    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
  >
    <Download className="h-4 w-4" />
    <span>Download PDF</span>
  </button>
</div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{items.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{royaltyMaterials.length}</div>
            <div className="text-sm text-gray-600">Royalty Materials</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-amber-600">{naturalSandMaterials.length}</div>
            <div className="text-sm text-gray-600">Natural Sand</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{otherMineralMaterials.length}</div>
            <div className="text-sm text-gray-600">Other Minerals</div>
          </div>
        </div>

        {/* Main Royalty Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Royalty Statement Table</h2>
            <div className="text-sm text-gray-600">
              SSR: {ssrYear || 'N/A'}
            </div>
          </div>
          <RoyaltyTable />
        </div>
<div className="mt-8 relative" style={{zIndex: 10}}>
  <div className="text-sm">
    <p className="font-bold mb-2">Notes:</p>
    <p className="mb-1">1] Royalty charges for Natural Sand. Rate inclusive of surcharges of 2% + Mineral Foundation 10% [211.94 + 4.24 + 21.19 = 237.37]</p>
    <p>2] Royalty charges for Other Minerals. Rate inclusive of surcharges of 2% = [211.94 + 4.24 = 216.18]</p>
  </div>
</div>
        {/* Material Details Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Material Details Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Natural Sand Materials */}
            {naturalSandMaterials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-3">Natural Sand Materials</h3>
                <div className="space-y-2">
                  {naturalSandMaterials.map((material, index) => (
                    <div key={index} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <div className="font-medium">{material.materialName}</div>
                      <div className="text-sm text-gray-600">
                        Total Quantity: {material.totalQuantity.toFixed(3)} {material.unit}
                      </div>
                      <div className="text-sm text-gray-600">
                        Used in: {material.itemCalculations.length} item(s)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Mineral Materials */}
            {otherMineralMaterials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-3">Other Mineral Materials</h3>
                <div className="space-y-2">
                  {otherMineralMaterials.map((material, index) => (
                    <div key={index} className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                      <div className="font-medium">{material.materialName}</div>
                      <div className="text-sm text-gray-600">
                        Total Quantity: {material.totalQuantity.toFixed(3)} {material.unit}
                      </div>
                      <div className="text-sm text-gray-600">
                        Used in: {material.itemCalculations.length} item(s)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading States */}
        {(loadingMts || loadingRoyalty) && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-4">
              <Loader className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {loadingMts && 'Fetching measurement data...'}
                  {loadingRoyalty && 'Processing royalty information...'}
                </p>
              </div>
            </div>
          </div>
        )}
<div className="flex justify-center">
  <button
    onClick={navigateToMAT}
    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
  >
    <span>Next</span>
    <ArrowRight className="h-4 w-4" />
  </button>
</div>
    
        {/* Preview Modal */}
        <RoyaltyPreviewModal />
      </div>
      
    </div>
  );
};

export default RoyaltyComponent;