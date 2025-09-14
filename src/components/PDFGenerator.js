import React, { useEffect, useState } from 'react';
import Stepper from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FileText, Check, Download, ChevronDown, X, Eye, FileCheck,Bookmark,ChevronLeft,ChevronRight } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink, 
  Font,
  pdf ,
  Image
} from '@react-pdf/renderer';
import { MeasurementPDF } from './PDFComponent/MeasurementPDF';
import { AbstractPDF } from './PDFComponent/AbstractPDF';
import { CoverPagePDF } from './PDFComponent/CoverPagePDF';
import { blobToBase64 } from '../utils/fileUtils';
import { PDFViewer } from '@react-pdf/renderer';
import CoverPageGenerator from './Cover';
import StepperPage from '../components/Stepper'; 
import ConstructionEstimateComponent from './ConstructionEstimate';
import { API_BASE_URL} from '../config';
import MeasurementComponent from './MeasurementComponent';
import { MeasurementComponentPDF } from './ComponentPDF';
import MaterialSummaryComponent from './MaterialSummary';
import MTSCoverPageGenerator from './MTSCover';
import { MaterialSummaryPDF } from './SummaryPDF';
import ScheduleB from './SchduleB';
const BackEstimate = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState('bankEstimate');
    // Add state for active component view
    const [activeComponent, setActiveComponent] = useState(null);

    // Get the first selected component as default active (this works with your existing useEffect)
   
  // Updated selectedComponents state to include componentPage
const [selectedComponents, setSelectedComponents] = useState({
  abstract: true,
  coverPage: true,
  componentPage: true,
  materialPage :true,
});
const [selectedMTSComponents, setSelectedMTSComponents] = useState({
mtscoverPage:true,
 mtsSheet:true,
  componentPage: true,
  materialPage :true
});
const [selectedScheduleBComponents, setSelectedScheduleBComponents] = useState({
schdeule: true
});
  const [measurementData, setMeasurementData] = useState({
  items: [],
  allMaterials: [],
  materialData: {},
  materialTotals: {}
});
const [materialSummaryData, setMaterialSummaryData] = useState({
  materials: [],
  totals: {},
  summary: {}
});
  const [abstractItems, setAbstractItems] = useState([]);
  const [workName, setWorkName] = useState('');
const [selectedState, setSelectedState] = useState('');
const [selectedDept, setSelectedDept] = useState('');
  const [currentStep, setCurrentStep] = useState(7);
   const [uploadedFiles, setUploadedFiles] = useState([]);
 const [showScheduleBConfirmDialog, setShowScheduleBConfirmDialog] = useState(false);
const [scheduleBData, setScheduleBData] = useState([]);
const [scheduleBLoading, setScheduleBLoading] = useState(false);
const [scheduleBError, setScheduleBError] = useState(null);
   const [isUploading, setIsUploading] = useState(false); // Upload state
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [showBankEstimateConfirmDialog, setShowBankEstimateConfirmDialog] = useState(false);
  const [constructionEstimate, setConstructionEstimate] = useState(null);
  const [workInfo, setWorkInfo] = useState({
    nameOfWork: '',
    workOrderId: '',
    revisionNumber: '',
    area: '',
    ssr: ''
  });
  const [signatures, setSignatures] = useState({
  preparedBy: '',
  checkedBy: ''
});
   const jwtToken = localStorage.getItem('authToken');

 const documentOptions = [
  { value: 'bankEstimate', label: 'Bank Estimate', icon: FileCheck },
  { value: 'mts', label: 'Measurement Sheet (MTS)', icon: FileText },
     {
    value: 'scheduleB',
    label: 'Schedule B',
    icon: FileText
  }

];
useEffect(() => {
    const defaultComponent = localStorage.getItem("defaultActiveComponent");
    const selectedKeys = Object.keys(selectedComponents).filter(key => selectedComponents[key]);
    
    if (defaultComponent && selectedKeys.includes(defaultComponent)) {
        setActiveComponent(defaultComponent);
        localStorage.removeItem("defaultActiveComponent"); // Clean up after use
    } else if (selectedKeys.length > 0 && !activeComponent) {
        // Set coverPage as default if available, otherwise use the first available
        const defaultOrder = ['abstract','coverPage','componentPage', 'materialPage'];
        const preferredComponent = defaultOrder.find(comp => selectedKeys.includes(comp));
        setActiveComponent(preferredComponent || selectedKeys[0]);
    }
}, [selectedComponents, activeComponent]);

  useEffect(() => {
  const loadWorkInfo = () => {
    const nameOfWork = localStorage.getItem('pdfWorkName') || localStorage.getItem('nameOfWork') || 'Measurement Sheet';
    const state = localStorage.getItem('state') || '';
    const department = localStorage.getItem('department') || '';
    setWorkInfo({
      nameOfWork: localStorage.getItem('pdfWorkName') || localStorage.getItem('nameOfWork') || 'Measurement Sheet',
      workOrderId: localStorage.getItem('pdfWorkOrderId') || localStorage.getItem('autogenerated') || '',
      revisionNumber: localStorage.getItem('pdfRevisionNumber') || localStorage.getItem('reviseno') || '1.0',
      area: localStorage.getItem('abstractArea') || '900',
      ssr: localStorage.getItem('abstractSSR') || ''
    });
     setWorkName(nameOfWork);
    setSelectedState(state);
    setSelectedDept(department);
  };

    const loadConstructionEstimate = () => {
    try {
      const ceData = localStorage.getItem('constructionEstimate');
      if (ceData) {
        setConstructionEstimate(JSON.parse(ceData));
      }
    } catch (err) {
      console.error('Error loading construction estimate:', err);
    }
  };

       const loadAbstractItems = () => {
    try {
      const abstractData = localStorage.getItem('abstractItems');
      if (abstractData) {
        setAbstractItems(JSON.parse(abstractData));
      }
    } catch (err) {
      console.error('Error loading abstract items:', err);
    }
  };
   
   const loadMaterialSummaryData = async () => {
  try {
    console.log('Loading material summary data...');
    
    // Load items from cache
    const storedItems = localStorage.getItem("subRecordCache");
    if (!storedItems) {
      console.log('No stored items found');
      setMaterialSummaryData({
        materials: [],
        totals: {},
        summary: {}
      });
      return;
    }
    
    const itemsObject = JSON.parse(storedItems);
    const itemsArray = Object.values(itemsObject).flat();
    
    // Process items with material details
    const itemsWithDetails = await Promise.all(
      itemsArray.map(async (item, index) => {
        const processedItem = {
          id: item.id || `local-${index}`,
          itemNo: item.itemNo || item.itemNumber || 'N/A',
          description: item.descriptionOfItem || item.description || 'No description',
          quantity: 0,
          unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
          rate: parseFloat(item.completedRate) || 0,
          rawItem: item
        };
        
        // Fetch item details
        const details = await fetchItemDetails(processedItem);
        return {
          ...processedItem,
          materials: details.itemProperties || [],
          consumptionMaterials: details.consumptionMaterials || []
        };
      })
    );

    // Get unique materials with IDs
    const uniqueMaterials = getAllUniqueMaterialsForSummary(itemsWithDetails);
    
    // Fetch MTS data for quantities
    const itemsWithQuantities = await Promise.all(
      itemsWithDetails.map(async (item) => {
        const itemId = item.rawItem?.id || item.id;
        if (itemId) {
          const mtsData = await fetchMtsForItem(itemId);
          const totalQuantity = calculateTotalQuantity(mtsData);
          return {
            ...item,
            quantity: totalQuantity,
            amount: totalQuantity * item.rate
          };
        }
        return item;
      })
    );

    // Calculate material summary
    const summary = await calculateMaterialSummary(itemsWithQuantities, uniqueMaterials);
    
    setMaterialSummaryData({
      materials: uniqueMaterials,
      totals: {},
      summary: summary
    });

    console.log('Material summary data loaded:', {
      materials: uniqueMaterials.length,
      summary: summary.length
    });
    
  } catch (error) {
    console.error('Error loading material summary data:', error);
    setMaterialSummaryData({
      materials: [],
      totals: {},
      summary: {}
    });
  }
};




const getAllUniqueMaterials = (itemsWithMaterials) => {
  const materialsMap = new Map();
  
  itemsWithMaterials.forEach((item) => {
    // Check consumption materials first (priority)
    if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
      item.consumptionMaterials.forEach((material) => {
        if (material.materialName && material.fkMaterialId) {
          const materialName = material.materialName.trim();
          const materialId = parseInt(material.fkMaterialId);
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: materialId,
              unit: material.materialUnit || 'Unit',
              source: 'consumption'
            });
          }
        }
      });
    }
    
    // Check transaction materials as fallback
    if (item.materials && Array.isArray(item.materials)) {
      item.materials.forEach((material) => {
        if (material.material) {
          const materialName = material.material.trim();
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: material.materialId || null,
              unit: material.materialUnit || 'Unit',
              source: 'transaction'
            });
          }
        }
      });
    }
  });
  
  return Array.from(materialsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};




 
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

     loadWorkInfo();
    loadConstructionEstimate();
    loadAbstractItems();
    loadSignatureData(); 
    loadMeasurementData(); 
    loadMaterialSummaryData();
    fetchItems();
  }, []);
  
const handleMTSComponentToggle = async (componentName) => {
  setSelectedMTSComponents(prev => {
    const newState = {
      ...prev,
      [componentName]: !prev[componentName]
    };
    
    // If materialPage is being selected, ensure data is loaded
    if (componentName === 'materialPage' && !prev[componentName]) {
      setTimeout(async () => {
        try {
          await ensureMaterialSummaryData(false); // false for MTS
        } catch (error) {
          console.error('Error loading material summary data on MTS toggle:', error);
        }
      }, 100);
    }
    
    return newState;
  });
};
const prepareScheduleBData = async () => {
  try {
    setScheduleBLoading(true);
    setScheduleBError(null);
    console.log('Preparing Schedule B data...');
    
    const storedItems = localStorage.getItem("subRecordCache");
    
    if (!storedItems) {
      console.log("No cached items found for Schedule B");
      setScheduleBError("No measurement data found. Please complete measurements first.");
      return false;
    }
    
    const itemsObject = JSON.parse(storedItems);
    let itemsArray = Object.values(itemsObject).flat();
    
    if (!Array.isArray(itemsArray)) {
      console.error("Schedule B data is not an array!", itemsArray);
      itemsArray = [];
    }
    
    if (itemsArray.length === 0) {
      console.log("No items in cached data for Schedule B");
      setScheduleBError("No measurement items found.");
      return false;
    }

    // Format items for Schedule B
    const formattedItems = itemsArray.map((item, index) => ({
      id: item.id || `schedule-${index}`,
      srNo: index + 1,
      itemNo: item.itemNo || item.itemNumber || 'N/A',
      description: item.descriptionOfItem || item.description || 'No description',
      specification: item.specification || 'As directed by Engineer in Charge',
      quantity: parseFloat(item.quantity) || 230.000,
      rateInFigures: parseFloat(item.completedRate || item.rate) || 0,
      unit: item.smallUnit || item.fullUnit || item.unit || 'One Running Metre',
      rawItem: item
    }));
    
    // Calculate amounts and add rate in words
    const updatedItems = formattedItems.map(item => {
      const amount = item.quantity * item.rateInFigures;
      return {
        ...item,
        amount,
        rateInWords: convertNumberToWords(item.rateInFigures)
      };
    });
    
    setScheduleBData(updatedItems);
    console.log(`Successfully prepared ${updatedItems.length} items for Schedule B`);
    return true;
    
  } catch (error) {
    console.error("Error preparing Schedule B data:", error);
    setScheduleBError("Failed to prepare Schedule B data");
    return false;
  } finally {
    setScheduleBLoading(false);
  }
};
const convertNumberToWords = (number) => {
  if (number === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const convertHundreds = (num) => {
    let result = '';
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      result += teens[num - 10] + ' ';
      return result.trim();
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
    return result.trim();
  };
  
  if (number < 100) {
    return convertHundreds(number);
  } else if (number < 1000) {
    return convertHundreds(number);
  } else if (number < 100000) {
    return convertHundreds(Math.floor(number / 1000)) + ' Thousand ' + convertHundreds(number % 1000);
  } else if (number < 10000000) {
    return convertHundreds(Math.floor(number / 100000)) + ' Lakh ' + convertHundreds(number % 100000);
  } else {
    return convertHundreds(Math.floor(number / 10000000)) + ' Crore ' + convertHundreds(number % 10000000);
  }
};
const fetchMaterialDetails = async (materialId) => {
  if (!jwtToken || !materialId || materialId <= 0) {
    return { royalty: 'NO' };
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json"
      }
    });
    
    if (response.ok) {
      const materialDetails = await response.json();
      return { 
        royalty: materialDetails?.royalty || 'NO'
      };
    } else {
      return { royalty: 'NO' };
    }
  } catch (error) {
    console.error(`Error fetching material details for ID ${materialId}:`, error);
    return { royalty: 'NO' };
  }
};
const getAllUniqueMaterialsForSummary = (itemsWithMaterials) => {
  const materialsMap = new Map();
  
  itemsWithMaterials.forEach((item) => {
    // Check consumption materials first (priority)
    if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
      item.consumptionMaterials.forEach((material) => {
        if (material.materialName && material.fkMaterialId) {
          const materialName = material.materialName.trim();
          const materialId = parseInt(material.fkMaterialId);
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: materialId,
              unit: material.materialUnit || 'Unit',
              source: 'consumption'
            });
          }
        }
      });
    }
    
    // Check transaction materials as fallback
    if (item.materials && Array.isArray(item.materials)) {
      item.materials.forEach((material) => {
        if (material.material) {
          const materialName = material.material.trim();
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: material.materialId || null,
              unit: material.materialUnit || 'Unit',
              source: 'transaction'
            });
          }
        }
      });
    }
  });
  
  return Array.from(materialsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
const calculateMaterialSummary = async (itemsWithQuantities, materials) => {
  const summary = [];
  
  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    let totalQuantity = 0;
    
    // Calculate total quantity for this material
    itemsWithQuantities.forEach(item => {
      if (!item.quantity || item.quantity <= 0) return;
      
      let materialConstant = 0;
      
      // Check consumption materials first
      if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
        const materialMatch = item.consumptionMaterials.find(mat => 
          mat.materialName && mat.materialName.trim().toLowerCase() === material.name.trim().toLowerCase()
        );
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.constant) || 0;
        }
      }
      
      // Fallback to item materials
      if (materialConstant === 0 && item.materials && Array.isArray(item.materials)) {
        const materialMatch = item.materials.find(mat => 
          mat.material && mat.material.trim().toLowerCase() === material.name.trim().toLowerCase()
        );
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.materialConstant) || 0;
        }
      }
      
      if (materialConstant > 0) {
        totalQuantity += materialConstant * item.quantity;
      }
    });

    // Fetch royalty information if material ID exists
    let royaltyFlag = 'NO';
    let royaltyQuantity = '-';
    
    if (material.id && material.id > 0) {
      try {
        const materialDetails = await fetchMaterialDetails(material.id);
        royaltyFlag = materialDetails.royalty;
        
        if (royaltyFlag === 'YES') {
          royaltyQuantity = totalQuantity > 0 ? totalQuantity.toFixed(3) : '0.000';
        }
      } catch (error) {
        console.error(`Error fetching royalty for material ${material.name}:`, error);
      }
    }

    summary.push({
      srNo: i + 1,
      materialName: material.name,
      totalQuantity: totalQuantity.toFixed(3),
      royaltyQuantity: royaltyQuantity,
      unit: material.unit,
      remarks: '-',
      royaltyFlag: royaltyFlag,
      materialId: material.id
    });
  }
  
  return summary;
};

  const base64ToArrayBuffer = (base64) => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Convert base64 to binary string
    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting base64 to ArrayBuffer:', error);
    return null;
  }
};

  const handleNextStep = (step) => {
  if (currentStep === 1) {
    if (!workName.trim()) {
      toast.error("Please enter the 'Name of Work' before proceeding!");
      return;
    }
    if (!selectedState.trim()) {
      toast.error("Please Select the 'State' before proceeding!");
      return;
    }
    if (!selectedDept.trim()) {
      toast.error("Please Select the 'Department' before proceeding!");
      return;
    }
    toast.success("Step 1 completed successfully!");
  }
  
  setCurrentStep(step);
};

const generateMTSCombinedPDF = async () => {
  let loadingToast;
  
  try {
    // First, refresh all data to ensure we have the latest items
    await refreshAllData();
    
    if (selectedMTSComponents.componentPage) {
      await loadMeasurementData();
    }
    
    if (selectedMTSComponents.materialPage) {
      await loadMaterialSummaryData();
    }
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate selections
    if (!selectedMTSComponents.mtsSheet && !selectedMTSComponents.componentPage && !selectedMTSComponents.materialPage) {
      toast.error("Please select at least one component to include in the PDF");
      return;
    }

    // Validate required data
    if (!workInfo || !workInfo.workOrderId) {
      toast.error("Missing work order information");
      return;
    }

    const { nameOfWork, workOrderId, revisionNumber } = workInfo;
    loadingToast = toast.loading('Generating MTS PDF...');
    
    console.log('Starting MTS PDF generation...', {
      mtsSheet: selectedMTSComponents.mtsSheet,
      componentPage: selectedMTSComponents.componentPage,
      materialPage: selectedMTSComponents.materialPage,
      workOrderId,
      revisionNumber,
      itemsCount: items.length
    });

    let finalBlob;
    let fileName = `${workOrderId}_${revisionNumber || '1'}.pdf`;
    const pdfBlobs = [];

    try {
      // Generate MTS sheet if selected
      if (selectedMTSComponents.mtsSheet) {
        console.log('Generating MTS sheet PDF...');
        try {
          const mtsBlob = await generateMTSPDFBlob();
          if (mtsBlob && mtsBlob.size > 0) {
            pdfBlobs.push(mtsBlob);
            console.log(`MTS sheet generated (${mtsBlob.size} bytes)`);
          } else {
            throw new Error('MTS sheet blob is empty');
          }
        } catch (mtsError) {
          console.error('MTS sheet generation failed:', mtsError);
          toast.error(`MTS sheet generation failed: ${mtsError.message}`);
          throw mtsError;
        }
      }

      // Generate measurement component if selected
      if (selectedMTSComponents.componentPage) {
        console.log('Generating measurement component PDF...');
        try {
          const measurementBlob = await generateMeasurementPDFBlob();
          if (measurementBlob && measurementBlob.size > 0) {
            pdfBlobs.push(measurementBlob);
            console.log(`Measurement component generated (${measurementBlob.size} bytes)`);
          } else {
            throw new Error('Measurement component blob is empty');
          }
        } catch (measurementError) {
          console.error('Measurement component generation failed:', measurementError);
          toast.error(`Measurement component generation failed: ${measurementError.message}`);
          throw measurementError;
        }
      }

      // Generate material summary if selected
      if (selectedMTSComponents.materialPage) {
        console.log('Generating material summary PDF...');
        try {
          const materialSummaryBlob = await generateMaterialSummaryPDFBlob();
          if (materialSummaryBlob && materialSummaryBlob.size > 0) {
            pdfBlobs.push(materialSummaryBlob);
            console.log(`Material summary generated (${materialSummaryBlob.size} bytes)`);
          } else {
            throw new Error('Material summary blob is empty');
          }
        } catch (materialError) {
          console.error('Material summary generation failed:', materialError);
          toast.error(`Material summary generation failed: ${materialError.message}`);
          throw materialError;
        }
      }

      // Check if we have any PDFs to work with
      if (pdfBlobs.length === 0) {
        throw new Error('No PDF components were successfully generated');
      }

      // Merge or use single PDF
      if (pdfBlobs.length > 1) {
        console.log('Merging PDFs...');
        finalBlob = await mergePDFs(pdfBlobs);
      } else {
        finalBlob = pdfBlobs[0];
      }

      // Validate final blob
      if (!finalBlob || finalBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      toast.dismiss(loadingToast);
      console.log(`PDF generated successfully (${finalBlob.size} bytes), attempting upload...`);

      // Try to upload to server
      try {
        const uploadResult = await uploadPDFToServer(finalBlob, fileName);
        console.log('PDF uploaded successfully:', uploadResult);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        throw uploadError;
      }

    } catch (generationError) {
      toast.dismiss(loadingToast);
      console.error("PDF generation error:", generationError);
      toast.error(`Failed to generate PDF: ${generationError.message}`);
      throw generationError;
    }
    
  } catch (error) {
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    console.error("Error in generateMTSCombinedPDF:", error);
    
    if (error.name === 'QuotaExceededError') {
      toast.error('Storage quota exceeded. Please clear your browser cache and try again.');
    } else if (error.message.includes('Buffer.isBuffer')) {
      toast.error('PDF generation failed due to browser compatibility. Please try refreshing the page.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      toast.error('Network error during PDF upload. Please check your connection.');
    } else {
      toast.error(`PDF generation failed: ${error.message}`);
    }
  }
};

const generateMTSPDFBlob = async () => {
  try {
    const MTSDocument = () => (
      <Document>
        <MeasurementPDF
          workOrderId={workInfo.workOrderId || 'WO-001'}
          nameOfWork={workInfo.nameOfWork || 'Construction Work'}
          items={items}
          signatures={signatures}
          showWatermark={false}
        />
      </Document>
    );
    
    return await pdf(<MTSDocument />).toBlob();
  } catch (error) {
    console.error('Error generating MTS PDF blob:', error);
    throw error;
  }
};



const loadMaterialSummaryData = async () => {
  try {
    console.log('Loading material summary data...');
    
    // Use the existing measurementData to calculate material summary
    if (measurementData && measurementData.materialTotals) {
      const materialsArray = Object.entries(measurementData.materialTotals).map(([material, total]) => ({
        name: material,
        total: total,
        unit: 'Unit' // You might want to get this from materialData if available
      }));

      const summary = {
        totalMaterials: materialsArray.length,
        totalQuantity: materialsArray.reduce((sum, mat) => sum + mat.total, 0)
      };

      setMaterialSummaryData({
        materials: materialsArray,
        totals: measurementData.materialTotals,
        summary
      });

      console.log('Material summary data loaded:', {
        materials: materialsArray.length,
        summary
      });
    }
  } catch (error) {
    console.error('Error loading material summary data:', error);
    setMaterialSummaryData({
      materials: [],
      totals: {},
      summary: {}
    });
  }
};
const generateMaterialSummaryPDFBlob = async () => {
  try {
    console.log('Generating material summary PDF...');
    
    // ALWAYS reload material summary data before generating PDF
    await loadMaterialSummaryData();
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the latest material summary data from state
    const currentMaterialSummaryData = materialSummaryData;
    
    // Fix: Check if materialSummaryData.summary exists and is an array
    let summaryData = currentMaterialSummaryData.summary || [];
    
    // If summaryData is empty, try to regenerate it
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
      console.log('Material summary data is empty, regenerating...');
      
      // Try to get fresh data from localStorage
      const storedItems = localStorage.getItem("subRecordCache");
      if (storedItems) {
        const itemsObject = JSON.parse(storedItems);
        const itemsArray = Object.values(itemsObject).flat();
        
        // Process items with material details
        const itemsWithDetails = await Promise.all(
          itemsArray.map(async (item, index) => {
            const processedItem = {
              id: item.id || `local-${index}`,
              itemNo: item.itemNo || item.itemNumber || 'N/A',
              description: item.descriptionOfItem || item.description || 'No description',
              quantity: 0,
              unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
              rate: parseFloat(item.completedRate) || 0,
              rawItem: item
            };
            
            const details = await fetchItemDetails(processedItem);
            return {
              ...processedItem,
              materials: details.itemProperties || [],
              consumptionMaterials: details.consumptionMaterials || []
            };
          })
        );

        // Get unique materials
        const uniqueMaterials = getAllUniqueMaterialsForSummary(itemsWithDetails);
        
        // Get items with quantities
        const itemsWithQuantities = await Promise.all(
          itemsWithDetails.map(async (item) => {
            const itemId = item.rawItem?.id || item.id;
            if (itemId) {
              const mtsData = await fetchMtsForItem(itemId);
              const totalQuantity = calculateTotalQuantity(mtsData);
              return {
                ...item,
                quantity: totalQuantity,
                amount: totalQuantity * item.rate
              };
            }
            return item;
          })
        );

        // Calculate material summary
        summaryData = await calculateMaterialSummary(itemsWithQuantities, uniqueMaterials);
      }
    }
    
    // If it's not an array, try to convert it or use empty array
    if (!Array.isArray(summaryData)) {
      console.warn('summaryData is not an array:', typeof summaryData, summaryData);
      
      if (typeof summaryData === 'object' && summaryData !== null) {
        if (Array.isArray(summaryData.items)) {
          summaryData = summaryData.items;
        } else if (Array.isArray(summaryData.data)) {
          summaryData = summaryData.data;
        } else if (Array.isArray(summaryData.summary)) {
          summaryData = summaryData.summary;
        } else {
          const values = Object.values(summaryData);
          if (values.length > 0 && typeof values[0] === 'object') {
            summaryData = values;
          } else {
            summaryData = [];
          }
        }
      } else {
        summaryData = [];
      }
    }
    
    console.log('Final material summary data for PDF:', {
      summaryLength: summaryData.length,
      summaryType: Array.isArray(summaryData) ? 'array' : typeof summaryData,
      sampleData: Array.isArray(summaryData) ? summaryData.slice(0, 2) : 'Not an array',
      fullData: summaryData
    });
    
    // Ensure summaryData is an array before passing to PDF component
    const finalSummaryData = Array.isArray(summaryData) ? summaryData : [];
    
    const materialSummaryPDF = (
      <MaterialSummaryPDF
        workName={workName || workInfo.nameOfWork || 'Material Summary'}
        materialSummary={finalSummaryData}
        signatures={signatures}
        ssrYear={workInfo.ssr || ''}
        loadingRoyalty={false}
        loadingMts={false}
      />
    );

    const blob = await pdf(materialSummaryPDF).toBlob();
    console.log(`Material summary PDF generated: ${blob.size} bytes with ${finalSummaryData.length} materials`);
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated material summary PDF is empty');
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating material summary PDF:', error);
    throw new Error(`Material summary PDF generation failed: ${error.message}`);
  }
};

const fetchItemDetails = async (item) => {
  if (!jwtToken) {
    console.error('No auth token available');
    return { itemProperties: [], consumptionMaterials: [] };
  }

  try {
    // Get item properties
    const propertiesResponse = await fetch(
      `${API_BASE_URL}/api/txn-item-properties/serchByTxnItemId/${item.id}`,
      {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json"
        }
      }
    );

    let itemProperties = [];
    if (propertiesResponse.ok) {
      const properties = await propertiesResponse.json();
      itemProperties = Array.isArray(properties) ? properties : [];
    }

    // Get consumption materials from cache or API
    let consumptionMaterials = getConsumptionMaterialsFromCache(item.itemNo);
    
    return { 
      itemProperties,
      consumptionMaterials: consumptionMaterials || []
    };
  } catch (error) {
    console.error(`Error fetching item details for ${item.id}:`, error);
    return { itemProperties: [], consumptionMaterials: [] };
  }
};
const getConsumptionMaterialsFromCache = (itemNo) => {
  try {
    const cacheKey = 'consumptionMaterialsCache';
    const cache = localStorage.getItem(cacheKey);
    
    if (!cache) return null;
    
    const parsedCache = JSON.parse(cache);
    if (parsedCache[itemNo]) {
      return parsedCache[itemNo].consumptionMaterials;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting consumption materials from cache:', error);
    return null;
  }
};
const fetchMtsForItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${itemId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) return [];
    
    const mtsData = await response.json();
    return mtsData;
  } catch (error) {
    console.error(`Error fetching MTS for item ${itemId}:`, error);
    return [];
  }
};
// Function to fetch MTS data for all items
const fetchAllMtsData = async (itemsList, materialDataMap) => {
  if (!jwtToken) return itemsList;

  try {
    const mtsPromises = itemsList.map(async (item) => {
      const itemId = item.rawItem?.id || item.id;
      if (!itemId) return item;

      try {
        const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${itemId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) return item;
        
        const mtsData = await response.json();
        const totalQuantity = Array.isArray(mtsData) ? mtsData.reduce((total, measurement) => {
          return total + (parseFloat(measurement.quantity || measurement.totalQuantity || 0));
        }, 0) : 0;

        // Update material totals
        if (materialDataMap[item.id]) {
          Object.keys(materialDataMap[item.id]).forEach(materialName => {
            const constant = materialDataMap[item.id][materialName].constant;
            materialDataMap[item.id][materialName].total = constant * totalQuantity;
          });
        }

        return {
          ...item,
          quantity: totalQuantity,
          amount: totalQuantity * (parseFloat(item.rate) || 0),
          pageNumber: item.pageNumber // Preserve page number
        };
      } catch (error) {
        console.error(`Error fetching MTS for item ${itemId}:`, error);
        return {
          ...item,
          pageNumber: item.pageNumber // Preserve page number even on error
        };
      }
    });

    const updatedItems = await Promise.all(mtsPromises);
    return updatedItems;
  } catch (error) {
    console.error('Error fetching all MTS data:', error);
    return itemsList;
  }
};
const getPageNumberForItem = (itemNo) => {
  try {
    const pageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers')) || {};
    return pageNumbers[itemNo] || null;
  } catch (error) {
    console.warn("Error retrieving page number:", error);
    return null;
  }
};
// Updated loadMeasurementData function
const loadMeasurementData = async () => {
  try {
    console.log('Starting to load measurement data...');
    
    const storedItems = localStorage.getItem("subRecordCache");
    if (!storedItems) {
      console.log('No stored items found in subRecordCache');
      return;
    }
    
    const itemsObject = JSON.parse(storedItems);
    const itemsArray = Object.values(itemsObject).flat();
    
    console.log(`Found ${itemsArray.length} items in cache`);
    
    const processedItems = itemsArray.map((item, index) => ({
      id: item.id || `local-${index}`,
      srNo: index + 1,
      itemNo: item.itemNo || item.itemNumber || 'N/A',
      description: item.descriptionOfItem || item.description || 'No description',
      quantity: 0,
      unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
      rate: parseFloat(item.completedRate) || 0,
      amount: 0,
      rawItem: item,
      materials: [],
      pageNumber: getPageNumberForItem(item.itemNo || item.itemNumber) // Add page number here
    }));

    console.log('Fetching detailed information for each item...');
    
    // Fetch detailed information for each item
    const itemsWithDetails = await Promise.all(
      processedItems.map(async (item) => {
        try {
          const itemDetails = await fetchItemDetails(item);
          return {
            ...item,
            materials: itemDetails.itemProperties || [],
            pageNumber: item.pageNumber // Preserve page number
          };
        } catch (error) {
          console.error(`Error fetching details for item ${item.id}:`, error);
          return {
            ...item,
            materials: [],
            pageNumber: item.pageNumber // Preserve page number even on error
          };
        }
      })
    );

    // Rest of the function remains the same...
    console.log('Getting unique materials...');
    
    // Get all unique materials
    const uniqueMaterials = getAllUniqueMaterials(itemsWithDetails);
    
    console.log(`Found ${uniqueMaterials.length} unique materials:`, uniqueMaterials);
    
    // Calculate material data
    const materialDataMap = {};
    itemsWithDetails.forEach(item => {
      materialDataMap[item.id] = {};
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach(material => {
          if (material.material) {
            materialDataMap[item.id][material.material] = {
              constant: material.materialConstant || 0,
              unit: material.materialUnit || 'Unit',
              total: 0
            };
          }
        });
      }
    });

    console.log('Fetching MTS data for all items...');
    
    // Fetch MTS data for all items
    const updatedItems = await fetchAllMtsData(itemsWithDetails, materialDataMap);

    console.log('Calculating material totals...');
    
    // Calculate material totals
    const materialTotals = {};
    uniqueMaterials.forEach(material => {
      materialTotals[material] = updatedItems.reduce((sum, item) => {
        const materialInfo = materialDataMap[item.id]?.[material];
        if (materialInfo) {
          return sum + materialInfo.total;
        }
        return sum;
      }, 0);
    });

    console.log('Setting measurement data state...');
    
    setMeasurementData({
      items: updatedItems,
      allMaterials: uniqueMaterials,
      materialData: materialDataMap,
      materialTotals
    });

    console.log('Measurement data loaded successfully!');

  } catch (error) {
    console.error('Error loading measurement data:', error);
    // Set empty state on error
    setMeasurementData({
      items: [],
      allMaterials: [],
      materialData: {},
      materialTotals: {}
    });
  }
};

// Helper functions for measurement data
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
const generateMeasurementPDFBlob = async () => {
  try {
    console.log('Generating measurement PDF...');
    
    // Validate measurement data
    if (!measurementData || !measurementData.items || measurementData.items.length === 0) {
      console.warn('No measurement data available, using empty data');
    }
    
    // Get SSR name with improved logic
    let ssrName = '';
    
    try {
      // Method 1: Direct from localStorage ssrName
      ssrName = localStorage.getItem('ssrName');
      console.log('Found SSR name from localStorage ssrName:', ssrName);
      
      if (!ssrName || ssrName.trim() === '' || ssrName === 'null' || ssrName === 'undefined') {
        // Method 2: Get from SSR options using ID
        const ssrId = localStorage.getItem('ssr');
        const ssrOptionsStr = localStorage.getItem('ssrOptions');
        
        if (ssrId && ssrOptionsStr) {
          try {
            const ssrOptions = JSON.parse(ssrOptionsStr);
            const ssrOption = ssrOptions.find(option => 
              option.id === parseInt(ssrId) || option.id.toString() === ssrId.toString()
            );
            
            if (ssrOption) {
              ssrName = ssrOption.name || ssrOption.ssrName || ssrOption.description || '';
              console.log('Found SSR name from options:', ssrName);
              
              // Store it for future use
              if (ssrName) {
                localStorage.setItem('ssrName', ssrName);
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSR options:', parseError);
          }
        }
        
        // Method 3: Try from workInfo
        if (!ssrName && workInfo?.ssr) {
          ssrName = workInfo.ssr;
        }
      }
    } catch (error) {
      console.error('Error getting SSR name:', error);
    }
    
    // Final fallback - set a meaningful default
    if (!ssrName || ssrName.trim() === '') {
      ssrName = 'SSR 2024'; // Better default than 'N/A'
    }
    
    // Get page numbers from localStorage
    const itemPageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
    
    // Ensure items have page numbers
    const itemsWithPageNumbers = (measurementData.items || []).map(item => {
      const pageNo = itemPageNumbers[item.itemNo] || 
                   itemPageNumbers[item.rawItem?.itemNo] || 
                   item.pageNo || 
                   'N/A';
      
      return {
        ...item,
        pageNo: pageNo
      };
    });
    
    console.log('=== FINAL DATA FOR PDF ===');
    console.log('SSR Name:', ssrName);
    console.log('Items with page numbers:', itemsWithPageNumbers);
    console.log('Sample item page numbers:', itemsWithPageNumbers.slice(0, 3).map(item => ({
      itemNo: item.itemNo,
      pageNo: item.pageNo
    })));
    
    const measurementPDF = (
      <MeasurementComponentPDF
        workName={workName || workInfo.nameOfWork || 'Measurement Sheet'}
        items={itemsWithPageNumbers} // Use items with page numbers
        allMaterials={measurementData.allMaterials || []}
        materialData={measurementData.materialData || {}}
        materialTotals={measurementData.materialTotals || {}}
        signatures={signatures}
        ssrName={ssrName} // Pass the SSR name
      />
    );

    const blob = await pdf(measurementPDF).toBlob();
    console.log(`Measurement PDF generated: ${blob.size} bytes`);
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated measurement PDF is empty');
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating measurement PDF:', error);
    throw new Error(`Measurement PDF generation failed: ${error.message}`);
  }
};

// 2. ADD THIS FUNCTION TO ENSURE PAGE NUMBERS ARE AVAILABLE
const ensurePageNumbersAvailable = () => {
  try {
    // Check if page numbers exist in localStorage
    const itemPageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
    const itemOptions = JSON.parse(localStorage.getItem('itemOptions') || '[]');
    
    if (Object.keys(itemPageNumbers).length === 0 && itemOptions.length > 0) {
      // Try to rebuild page numbers from itemOptions if they're missing
      const pageNumbers = {};
      itemOptions.forEach(option => {
        if (option.ssrItemId && option.pageNo) {
          pageNumbers[option.ssrItemId] = option.pageNo;
        }
      });
      
      if (Object.keys(pageNumbers).length > 0) {
        localStorage.setItem('itemPageNumbers', JSON.stringify(pageNumbers));
        console.log('Rebuilt page numbers from item options:', pageNumbers);
      }
    }
    
    return JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
  } catch (error) {
    console.error('Error ensuring page numbers:', error);
    return {};
  }
};

// 3. ADD THIS FUNCTION TO ENSURE SSR OPTIONS ARE AVAILABLE
const ensureSSROptionsAvailable = async () => {
  try {
    let ssrOptions = localStorage.getItem('ssrOptions');
    
    if (!ssrOptions) {
      // Fetch SSR options if not available
      const jwtToken = localStorage.getItem('jwtToken');
      if (jwtToken) {
        const response = await fetch(`${API_BASE_URL}/api/ssr`, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('ssrOptions', JSON.stringify(data));
          console.log('Fetched and stored SSR options:', data);
          return data;
        }
      }
    } else {
      return JSON.parse(ssrOptions);
    }
  } catch (error) {
    console.error('Error ensuring SSR options:', error);
  }
  return [];
};

// 4. UPDATED MAIN FUNCTION TO CALL BEFORE PDF GENERATION
const generatePDFWithAllData = async () => {
  try {
    // Ensure all required data is available
    console.log('Ensuring all data is available...');
    
    // 1. Ensure SSR options are available
    await ensureSSROptionsAvailable();
    
    // 2. Ensure page numbers are available
    ensurePageNumbersAvailable();
    
    // 3. Generate the PDF
    const blob = await generateMeasurementPDFBlob();
    
    return blob;
  } catch (error) {
    console.error('Error in complete PDF generation:', error);
    throw error;
  }
};

// 5. IF YOU NEED TO DEBUG THE CURRENT STATE, ADD THIS FUNCTION
const debugCurrentData = () => {
  console.log('=== CURRENT DATA DEBUG ===');
  console.log('localStorage ssrName:', localStorage.getItem('ssrName'));
  console.log('localStorage ssr:', localStorage.getItem('ssr'));
  console.log('localStorage ssrOptions:', localStorage.getItem('ssrOptions'));
  console.log('localStorage itemPageNumbers:', localStorage.getItem('itemPageNumbers'));
  console.log('localStorage itemOptions (first 2):', JSON.parse(localStorage.getItem('itemOptions') || '[]').slice(0, 2));
  console.log('measurementData.items (first 2):', measurementData?.items?.slice(0, 2));
  console.log('========================');
};

const loadAuxiliaryWorks = () => {
  try {
    const stored = localStorage.getItem('dynamicAdditions');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.keys(parsed).map(key => ({
        description: parsed[key].label,
        percentage: parsed[key].percent,
        isPercentage: true,
        amount: 0,
        customDescription: parsed[key].label
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading auxiliary works:', error);
    return [];
  }
};
 const saveAuxiliaryWork = (auxiliaryWorksData) => {
  try {
    // Save to localStorage as dynamicAdditions (based on your loadAuxiliaryWorks function)
    const formattedData = {};
    
    auxiliaryWorksData.forEach((work, index) => {
      const key = `aux_${index}`;
      formattedData[key] = {
        label: work.description || work.customDescription || `Auxiliary Work ${index + 1}`,
        percent: work.percentage || 0,
        amount: work.amount || 0,
        isPercentage: work.isPercentage !== undefined ? work.isPercentage : true
      };
    });
    
    localStorage.setItem('dynamicAdditions', JSON.stringify(formattedData));
    console.log('Auxiliary works saved successfully:', formattedData);
    
    // Optional: Show success message
    toast.success('Auxiliary works saved successfully');
    
  } catch (error) {
    console.error('Error saving auxiliary works:', error);
    toast.error('Failed to save auxiliary works');
  }
};
const loadGstPercentage = () => {
  try {
    const storedGst = localStorage.getItem('gstPercentage');
    return storedGst ? parseFloat(storedGst) : 0;
  } catch (error) {
    console.error('Error loading GST percentage:', error);
    return 0;
  }
};


const createPropertiesFromConsumption = async (item) => {
  try {
    if (!jwtToken) {
      console.error('No auth token available for consumption fetch');
      return { itemProperties: [] };
    }

    // Try to fetch consumption materials for the item
    const consumptionResponse = await fetch(
      `${API_BASE_URL}/api/consumption-materials/item/${item.id}`,
      {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json"
        }
      }
    );

    if (consumptionResponse.ok) {
      const consumptionData = await consumptionResponse.json();
      
      // Convert consumption data to properties format
      const properties = Array.isArray(consumptionData) 
        ? consumptionData.map(material => ({
            material: material.materialName || material.name,
            materialConstant: material.constant || material.quantity || 0,
            materialUnit: material.unit || 'Unit'
          }))
        : [];

      return { itemProperties: properties };
    } else {
      console.warn(`No consumption data found for item ${item.id}`);
      return { itemProperties: [] };
    }
  } catch (error) {
    console.error(`Error creating properties from consumption for item ${item.id}:`, error);
    return { itemProperties: [] };
  }
};

const loadMeasurementDataForBankEstimate = async () => {
  try {
    console.log('Loading measurement data for Bank Estimate...');
    
    const storedItems = localStorage.getItem("subRecordCache");
    if (!storedItems) {
      console.log('No stored items found in subRecordCache');
      return;
    }
    
    const itemsObject = JSON.parse(storedItems);
    const itemsArray = Object.values(itemsObject).flat();
    
    console.log(`Found ${itemsArray.length} items in cache for Bank Estimate`);
    
    const processedItems = itemsArray.map((item, index) => ({
      id: item.id || `local-${index}`,
      srNo: index + 1,
      itemNo: item.itemNo || item.itemNumber || 'N/A',
      description: item.descriptionOfItem || item.description || 'No description',
      quantity: 0,
      unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
      rate: parseFloat(item.completedRate) || 0,
      amount: 0,
      rawItem: item,
      materials: [],
      pageNumber: getPageNumberForItem(item.itemNo || item.itemNumber)
    }));

    // Fetch detailed information for each item
    const itemsWithDetails = await Promise.all(
      processedItems.map(async (item) => {
        try {
          const itemDetails = await fetchItemDetails(item);
          return {
            ...item,
            materials: itemDetails.itemProperties || [],
            pageNumber: item.pageNumber
          };
        } catch (error) {
          console.error(`Error fetching details for item ${item.id}:`, error);
          return {
            ...item,
            materials: [],
            pageNumber: item.pageNumber
          };
        }
      })
    );

    // Get all unique materials
    const uniqueMaterials = getAllUniqueMaterials(itemsWithDetails);
    
    // Calculate material data
    const materialDataMap = {};
    itemsWithDetails.forEach(item => {
      materialDataMap[item.id] = {};
      if (item.materials && Array.isArray(item.materials)) {
        item.materials.forEach(material => {
          if (material.material) {
            materialDataMap[item.id][material.material] = {
              constant: material.materialConstant || 0,
              unit: material.materialUnit || 'Unit',
              total: 0
            };
          }
        });
      }
    });

    // Fetch MTS data for all items
    const updatedItems = await fetchAllMtsData(itemsWithDetails, materialDataMap);

    // Calculate material totals
    const materialTotals = {};
    uniqueMaterials.forEach(material => {
      materialTotals[material] = updatedItems.reduce((sum, item) => {
        const materialInfo = materialDataMap[item.id]?.[material];
        if (materialInfo) {
          return sum + materialInfo.total;
        }
        return sum;
      }, 0);
    });

    setMeasurementData({
      items: updatedItems,
      allMaterials: uniqueMaterials,
      materialData: materialDataMap,
      materialTotals
    });

    console.log('Bank Estimate measurement data loaded successfully!');

  } catch (error) {
    console.error('Error loading Bank Estimate measurement data:', error);
    setMeasurementData({
      items: [],
      allMaterials: [],
      materialData: {},
      materialTotals: {}
    });
  }
};const loadMaterialSummaryDataForBankEstimate = async () => {
  try {
    console.log('Loading material summary data for Bank Estimate...');
    
    const storedItems = localStorage.getItem("subRecordCache");
    if (!storedItems) {
      console.log('No stored items found');
      setMaterialSummaryData({
        materials: [],
        totals: {},
        summary: []
      });
      return;
    }
    
    const itemsObject = JSON.parse(storedItems);
    const itemsArray = Object.values(itemsObject).flat();
    
    // Process items with material details for Bank Estimate
    const itemsWithDetails = await Promise.all(
      itemsArray.map(async (item, index) => {
        const processedItem = {
          id: item.id || `local-${index}`,
          itemNo: item.itemNo || item.itemNumber || 'N/A',
          description: item.descriptionOfItem || item.description || 'No description',
          quantity: 0,
          unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
          rate: parseFloat(item.completedRate) || 0,
          rawItem: item
        };
        
        // Fetch item details including both types of materials
        const details = await fetchItemDetails(processedItem);
        return {
          ...processedItem,
          materials: details.itemProperties || [],
          consumptionMaterials: details.consumptionMaterials || []
        };
      })
    );

    // Get unique materials using Bank Estimate specific logic
    const uniqueMaterials = getAllUniqueMaterialsForBankEstimate(itemsWithDetails);
    
    // Get items with actual quantities from MTS data
    const itemsWithQuantities = await Promise.all(
      itemsWithDetails.map(async (item) => {
        const itemId = item.rawItem?.id || item.id;
        if (itemId) {
          const mtsData = await fetchMtsForItem(itemId);
          const totalQuantity = calculateTotalQuantity(mtsData);
          return {
            ...item,
            quantity: totalQuantity,
            amount: totalQuantity * item.rate
          };
        }
        return item;
      })
    );

    // Calculate material summary for Bank Estimate
    const summary = await calculateMaterialSummaryForBankEstimate(itemsWithQuantities, uniqueMaterials);
    
    // Ensure summary is an array
    const finalSummary = Array.isArray(summary) ? summary : [];
    
    setMaterialSummaryData({
      materials: uniqueMaterials,
      totals: {},
      summary: finalSummary
    });

    console.log('Bank Estimate material summary data loaded:', {
      materials: uniqueMaterials.length,
      summary: finalSummary.length,
      sampleSummary: finalSummary.slice(0, 3)
    });
    
  } catch (error) {
    console.error('Error loading Bank Estimate material summary data:', error);
    setMaterialSummaryData({
      materials: [],
      totals: {},
      summary: []
    });
  }
};
const getAllUniqueMaterialsForBankEstimate = (itemsWithMaterials) => {
  const materialsMap = new Map();
  
  itemsWithMaterials.forEach((item) => {
    // Priority 1: Check consumption materials first
    if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
      item.consumptionMaterials.forEach((material) => {
        if (material.materialName && material.fkMaterialId) {
          const materialName = material.materialName.trim();
          const materialId = parseInt(material.fkMaterialId);
          
          if (!materialsMap.has(materialName)) {
            materialsMap.set(materialName, {
              name: materialName,
              id: materialId,
              unit: material.materialUnit || 'Unit',
              source: 'consumption'
            });
          }
        }
      });
    }
    
    // Priority 2: Check item properties/transaction materials
    if (item.materials && Array.isArray(item.materials)) {
      item.materials.forEach((material) => {
        const materialName = material.material ? material.material.trim() : '';
        if (materialName && !materialsMap.has(materialName)) {
          materialsMap.set(materialName, {
            name: materialName,
            id: material.materialId || null,
            unit: material.materialUnit || 'Unit',
            source: 'properties'
          });
        }
      });
    }
  });
  
  return Array.from(materialsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
const calculateMaterialSummaryForBankEstimate = async (itemsWithQuantities, materials) => {
  const summary = [];
  
  for (let i = 0; i < materials.length; i++) {
    const material = materials[i];
    let totalQuantity = 0;
    
    // Calculate total quantity for this material across all items
    itemsWithQuantities.forEach(item => {
      if (!item.quantity || item.quantity <= 0) return;
      
      let materialConstant = 0;
      
      // Check consumption materials first (higher priority)
      if (item.consumptionMaterials && Array.isArray(item.consumptionMaterials)) {
        const materialMatch = item.consumptionMaterials.find(mat => 
          mat.materialName && 
          mat.materialName.trim().toLowerCase() === material.name.trim().toLowerCase()
        );
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.constant) || 0;
          console.log(`Found consumption material ${material.name} with constant ${materialConstant} for item ${item.itemNo}`);
        }
      }
      
      // Fallback to item properties if not found in consumption materials
      if (materialConstant === 0 && item.materials && Array.isArray(item.materials)) {
        const materialMatch = item.materials.find(mat => 
          mat.material && 
          mat.material.trim().toLowerCase() === material.name.trim().toLowerCase()
        );
        
        if (materialMatch) {
          materialConstant = parseFloat(materialMatch.materialConstant) || 0;
          console.log(`Found properties material ${material.name} with constant ${materialConstant} for item ${item.itemNo}`);
        }
      }
      
      if (materialConstant > 0) {
        const itemMaterialQuantity = materialConstant * item.quantity;
        totalQuantity += itemMaterialQuantity;
        console.log(`Item ${item.itemNo}: ${material.name} = ${materialConstant} * ${item.quantity} = ${itemMaterialQuantity}`);
      }
    });

    // Fetch royalty information if material ID exists
    let royaltyFlag = 'NO';
    let royaltyQuantity = '-';
    
    if (material.id && material.id > 0) {
      try {
        const materialDetails = await fetchMaterialDetails(material.id);
        royaltyFlag = materialDetails.royalty;
        
        if (royaltyFlag === 'YES') {
          royaltyQuantity = totalQuantity > 0 ? totalQuantity.toFixed(3) : '0.000';
        }
      } catch (error) {
        console.error(`Error fetching royalty for material ${material.name}:`, error);
      }
    }

    console.log(`Material summary for ${material.name}: Total Quantity = ${totalQuantity.toFixed(3)}, Royalty = ${royaltyFlag}`);

    summary.push({
      srNo: i + 1,
      materialName: material.name,
      totalQuantity: totalQuantity.toFixed(3),
      royaltyQuantity: royaltyQuantity,
      unit: material.unit,
      remarks: '-',
      royaltyFlag: royaltyFlag,
      materialId: material.id
    });
  }
  
  console.log('Final Bank Estimate material summary:', summary);
  return summary;
};
const generateMeasurementPDFBlobForBankEstimate = async () => {
  try {
    console.log('Generating measurement PDF for Bank Estimate...');
    
    // Validate measurement data
    if (!measurementData || !measurementData.items || measurementData.items.length === 0) {
      console.warn('No measurement data available for Bank Estimate, using empty data');
    }
    
    // *** KEY FIXES: Get SSR name and ensure page numbers ***
    let ssrName = '';
    
    try {
      // Method 1: Direct from localStorage ssrName
      ssrName = localStorage.getItem('ssrName');
      console.log('Found SSR name from localStorage ssrName:', ssrName);
      
      if (!ssrName || ssrName.trim() === '' || ssrName === 'null' || ssrName === 'undefined') {
        // Method 2: Get from SSR options using ID
        const ssrId = localStorage.getItem('ssr');
        const ssrOptionsStr = localStorage.getItem('ssrOptions');
        
        if (ssrId && ssrOptionsStr) {
          try {
            const ssrOptions = JSON.parse(ssrOptionsStr);
            const ssrOption = ssrOptions.find(option => 
              option.id === parseInt(ssrId) || option.id.toString() === ssrId.toString()
            );
            
            if (ssrOption) {
              ssrName = ssrOption.name || ssrOption.ssrName || ssrOption.description || '';
              console.log('Found SSR name from options:', ssrName);
              
              // Store it for future use
              if (ssrName) {
                localStorage.setItem('ssrName', ssrName);
              }
            }
          } catch (parseError) {
            console.error('Error parsing SSR options:', parseError);
          }
        }
        
        // Method 3: Try from workInfo
        if (!ssrName && workInfo?.ssr) {
          ssrName = workInfo.ssr;
        }
      }
    } catch (error) {
      console.error('Error getting SSR name:', error);
    }
    
    // Final fallback - set a meaningful default
    if (!ssrName || ssrName.trim() === '') {
      ssrName = 'N/A';
    }
    
    // *** ENSURE ITEMS HAVE PAGE NUMBERS ***
    const itemPageNumbers = JSON.parse(localStorage.getItem('itemPageNumbers') || '{}');
    
    // Prepare items with page numbers and SSR info
    const itemsWithPageNumbers = (measurementData.items || []).map(item => {
      // Try multiple ways to get page number
      let pageNo = 'N/A';
      
      // Try direct pageNo from item
      if (item.pageNo && item.pageNo !== 'N/A') {
        pageNo = item.pageNo;
      }
      // Try from itemPageNumbers using itemNo
      else if (item.itemNo && itemPageNumbers[item.itemNo]) {
        pageNo = itemPageNumbers[item.itemNo];
      }
      // Try from rawItem
      else if (item.rawItem?.itemNo && itemPageNumbers[item.rawItem.itemNo]) {
        pageNo = itemPageNumbers[item.rawItem.itemNo];
      }
      // Try direct from item pageNumber property
      else if (item.pageNumber) {
        pageNo = item.pageNumber;
      }
      
      return {
        ...item,
        pageNo: pageNo,
        pageNumber: pageNo, // Add both for compatibility
        ssrYear: ssrName
      };
    });
    
    console.log('=== BANK ESTIMATE MEASUREMENT PDF DATA ===');
    console.log('SSR Name:', ssrName);
    console.log('Items with page numbers:', itemsWithPageNumbers.slice(0, 3).map(item => ({
      itemNo: item.itemNo,
      pageNo: item.pageNo,
      description: item.description?.substring(0, 30) + '...'
    })));
    console.log('===============================================');
    
    const measurementPDF = (
      <MeasurementComponentPDF
        workName={workName || workInfo?.nameOfWork || 'Bank Estimate Measurement Sheet'}
        items={itemsWithPageNumbers} // *** Use items with page numbers ***
        allMaterials={measurementData.allMaterials || []}
        materialData={measurementData.materialData || {}}
        materialTotals={measurementData.materialTotals || {}}
        signatures={signatures || { preparedBy: '', checkedBy: '' }}
        ssrName={ssrName} // *** Pass SSR name ***
        ssrYear={ssrName} // *** Also pass as ssrYear for compatibility ***
      />
    );

    const blob = await pdf(measurementPDF).toBlob();
    console.log(`Bank Estimate Measurement PDF generated: ${blob.size} bytes`);
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated Bank Estimate measurement PDF is empty');
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating Bank Estimate measurement PDF:', error);
    throw new Error(`Bank Estimate Measurement PDF generation failed: ${error.message}`);
  }
};

const generateMaterialSummaryPDFBlobForBankEstimate = async () => {
  try {
    console.log('Generating material summary PDF for Bank Estimate...');
    
    // ALWAYS reload material summary data before generating PDF
    await loadMaterialSummaryDataForBankEstimate();
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the latest material summary data
    const currentMaterialSummaryData = materialSummaryData;
    let summaryData = currentMaterialSummaryData.summary || [];
    
    // If summaryData is empty, try to regenerate it
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
      console.log('Bank Estimate material summary data is empty, regenerating...');
      
      // Try to get fresh data from localStorage
      const storedItems = localStorage.getItem("subRecordCache");
      if (storedItems) {
        const itemsObject = JSON.parse(storedItems);
        const itemsArray = Object.values(itemsObject).flat();
        
        // Process items with material details for Bank Estimate
        const itemsWithDetails = await Promise.all(
          itemsArray.map(async (item, index) => {
            const processedItem = {
              id: item.id || `local-${index}`,
              itemNo: item.itemNo || item.itemNumber || 'N/A',
              description: item.descriptionOfItem || item.description || 'No description',
              quantity: 0,
              unit: item.smallUnit || item.fullUnit || item.unit || 'Nos',
              rate: parseFloat(item.completedRate) || 0,
              rawItem: item
            };
            
            const details = await fetchItemDetails(processedItem);
            return {
              ...processedItem,
              materials: details.itemProperties || [],
              consumptionMaterials: details.consumptionMaterials || []
            };
          })
        );

        // Get unique materials for Bank Estimate
        const uniqueMaterials = getAllUniqueMaterialsForBankEstimate(itemsWithDetails);
        
        // Get items with actual quantities from MTS data
        const itemsWithQuantities = await Promise.all(
          itemsWithDetails.map(async (item) => {
            const itemId = item.rawItem?.id || item.id;
            if (itemId) {
              const mtsData = await fetchMtsForItem(itemId);
              const totalQuantity = calculateTotalQuantity(mtsData);
              return {
                ...item,
                quantity: totalQuantity,
                amount: totalQuantity * item.rate
              };
            }
            return item;
          })
        );

        // Calculate material summary for Bank Estimate
        summaryData = await calculateMaterialSummaryForBankEstimate(itemsWithQuantities, uniqueMaterials);
      }
    }
    
    // Additional validation and conversion
    if (!Array.isArray(summaryData)) {
      console.warn('summaryData is not an array for Bank Estimate:', typeof summaryData, summaryData);
      
      if (typeof summaryData === 'object' && summaryData !== null) {
        if (Array.isArray(summaryData.items)) {
          summaryData = summaryData.items;
        } else if (Array.isArray(summaryData.data)) {
          summaryData = summaryData.data;
        } else if (Array.isArray(summaryData.summary)) {
          summaryData = summaryData.summary;
        } else {
          const values = Object.values(summaryData);
          if (values.length > 0 && typeof values[0] === 'object') {
            summaryData = values;
          } else {
            summaryData = [];
          }
        }
      } else {
        summaryData = [];
      }
    }
    
    console.log('Bank Estimate Material summary data for PDF:', {
      summaryLength: summaryData.length,
      summaryType: Array.isArray(summaryData) ? 'array' : typeof summaryData,
      sampleData: Array.isArray(summaryData) ? summaryData.slice(0, 2) : 'Not an array',
      fullSummaryData: summaryData
    });
    
    // If still no data, create a meaningful message
    if (!Array.isArray(summaryData) || summaryData.length === 0) {
      console.warn('No material summary data available for Bank Estimate, creating placeholder');
      summaryData = [{
        srNo: 1,
        materialName: 'No materials found',
        totalQuantity: '0.000',
        royaltyQuantity: '-',
        unit: '-',
        remarks: 'No material data available',
        royaltyFlag: 'NO',
        materialId: null
      }];
    }
    
    const materialSummaryPDF = (
      <MaterialSummaryPDF
        workName={workName || workInfo.nameOfWork || 'Material Summary'}
        materialSummary={summaryData}
        signatures={signatures}
        ssrYear={workInfo.ssr || ''}
        loadingRoyalty={false}
        loadingMts={false}
      />
    );

    const blob = await pdf(materialSummaryPDF).toBlob();
    console.log(`Bank Estimate Material summary PDF generated: ${blob.size} bytes with ${summaryData.length} materials`);
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated Bank Estimate material summary PDF is empty');
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating Bank Estimate material summary PDF:', error);
    throw new Error(`Bank Estimate Material summary PDF generation failed: ${error.message}`);
  }
};

const extractEssentialData = (key, value) => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  switch (key) {
    case 'constructionEstimate':
      return {
        grandTotal: value.grandTotal || 0,
        workOrderId: value.workOrderId,
        workName: value.workName,
        area: value.area,
        ssr: value.ssr,
        items: value.items ? value.items.slice(0, 50) : [], // Limit items
        revisionNumber: value.revisionNumber,
        auxiliaryWorks: value.auxiliaryWorks ? value.auxiliaryWorks.slice(0, 10) : [],
        gstPercentage: value.gstPercentage || 0
      };
    
    case 'coverPageData':
      return {
        workName: value.workName,
        workOrderId: value.workOrderId,
        revisionNumber: value.revisionNumber,
        area: value.area,
        ssr: value.ssr,
        // Remove large data like company logo
        companyLogo: null,
        companyName: value.companyName,
        department: value.department,
        state: value.state
      };
    
    case 'measurementData':
      return {
        items: value.items ? value.items.slice(0, 100) : [], // Limit items
        allMaterials: value.allMaterials ? value.allMaterials.slice(0, 50) : [],
        materialTotals: value.materialTotals || {},
        // Skip heavy materialData object
        materialData: {}
      };
       case 'materialSummaryData':
      return {
        materials: value.materials ? value.materials.slice(0, 100) : [],
        totals: value.totals || {},
        summary: value.summary || {}
      };
       
    
    case 'abstractItems':
      return Array.isArray(value) ? value.slice(0, 50) : value; // Limit array size
    
    default:
      // For unknown keys, try to reduce the data size
      if (Array.isArray(value)) {
        return value.slice(0, 20); // Limit arrays to 20 items
      }
      
      // For objects, keep only essential string/number properties
      const essential = {};
      Object.keys(value).forEach(prop => {
        const propValue = value[prop];
        if (typeof propValue === 'string' || typeof propValue === 'number' || typeof propValue === 'boolean') {
          essential[prop] = propValue;
        }
      });
      
      return essential;
  }
};
const safeLocalStorageSet = (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    
    // Check if the value is too large (roughly 4MB limit to be safe)
    if (stringValue.length > 4 * 1024 * 1024) {
      console.warn(`Data for key '${key}' is too large for localStorage (${stringValue.length} bytes)`);
      
      // If it's coverPageData, try to compress by removing/reducing the logo
      if (key === 'coverPageData' && value.companyLogo) {
        const compressedValue = {
          ...value,
          companyLogo: null // Remove logo to save space
        };
        const compressedString = JSON.stringify(compressedValue);
        
        if (compressedString.length <= 4 * 1024 * 1024) {
          localStorage.setItem(key, compressedString);
          console.log(`Stored compressed data for key '${key}' (logo removed)`);
          return true;
        }
      }
      
      // If still too large, store only essential data
      if (key === 'constructionEstimate') {
        const essentialData = {
          grandTotal: value.grandTotal || 0,
          workOrderId: value.workOrderId,
          workName: value.workName,
          area: value.area,
          ssr: value.ssr,
          items: value.items,
          revisionNumber: value.revisionNumber
        };
        localStorage.setItem(key, JSON.stringify(essentialData));
        console.log(`Stored essential data for key '${key}'`);
        return true;
      }
      
      return false;
    }
    
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.warn(`localStorage quota exceeded for key '${key}'. Attempting cleanup...`);
      
      // Try to free up space by removing old or less important data
      const keysToClean = ['tempData', 'cache', 'logs', 'oldMeasurements'];
      keysToClean.forEach(cleanKey => {
        if (localStorage.getItem(cleanKey)) {
          localStorage.removeItem(cleanKey);
          console.log(`Removed ${cleanKey} from localStorage`);
        }
      });
      
      // Try storing again with essential data only
      try {
        if (typeof value === 'object' && value !== null) {
          const essentialValue = extractEssentialData(key, value);
          localStorage.setItem(key, JSON.stringify(essentialValue));
          console.log(`Stored essential data for key '${key}' after cleanup`);
          return true;
        }
      } catch (retryError) {
        console.error(`Failed to store even essential data for key '${key}':`, retryError);
        return false;
      }
    } else {
      console.error(`Error storing data for key '${key}':`, error);
      return false;
    }
  }
};
const safeLocalStorageGet = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.error(`Error parsing localStorage data for key '${key}':`, error);
    return defaultValue;
  }
};
const uploadPDFToServer = async (pdfBlob, fileName) => {
  try {
    setIsUploading(true);
    const loadingToast = toast.loading('Uploading PDF to server...');

    // Get reviseId and workOrderId from localStorage
    const reviseId = localStorage.getItem("reviseId");
    const workOrderId = localStorage.getItem("workOrderId") || workInfo.workOrderId;
    
    // Validate blob
    if (!pdfBlob || !(pdfBlob instanceof Blob)) {
      throw new Error('Invalid PDF blob provided');
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    
    // Include ID in form data if available
    if (reviseId) {
      formData.append("id", reviseId);
    }

    console.log(`Uploading ${fileName} (${pdfBlob.size} bytes) to server...`);

    const uploadResponse = await fetch(`${API_BASE_URL}/api/file/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`
        // No Content-Type header needed for FormData
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Upload failed with status: ${uploadResponse.status}. ${errorText}`);
    }

    // Handle both JSON and text responses
    const contentType = uploadResponse.headers.get("content-type");
    let uploadResult;
    
    if (contentType && contentType.includes("application/json")) {
      uploadResult = await uploadResponse.json();
      console.log("Upload success (JSON):", uploadResult);
    } else {
      const textResult = await uploadResponse.text();
      console.log("Upload success (text):", textResult);
      uploadResult = { fileName: fileName, message: textResult };
    }
    
    toast.dismiss(loadingToast);
    toast.success('PDF uploaded to server successfully!');
    
    const fileInfo = {
      fileName: fileName,
      serverFileName: uploadResult.fileName || fileName,
      uploadTime: new Date().toISOString(),
      downloadUrl: `${API_BASE_URL}/api/file/download/${uploadResult.fileName || fileName}`
    };
    
    setUploadedFiles(prev => [...prev, fileInfo]);

    // Update workorder status to 'completed' if workOrderId exists
    if (workOrderId) {
      try {
        console.log(`Attempting to update work order status for: ${workOrderId}`);
        
        const statusUpdateResponse = await fetch(`${API_BASE_URL}/api/workorders/${workOrderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${jwtToken}`
          },
          body: JSON.stringify({ 
            status: "completed",
            // Add any other required fields that might be missing
            updatedAt: new Date().toISOString()
          })
        });

        if (statusUpdateResponse.ok) {
          const updateData = await statusUpdateResponse.json();
          console.log("Work order updated successfully:", updateData);
          toast.success("Work order marked as completed!");
          
          // Show success message with delay before redirect
          toast.success("PDF generated and uploaded successfully! Redirecting...", {
            duration: 2000
          });
          
          // Redirect after a delay to ensure the status update is processed
          setTimeout(() => {
            navigate('/mywork');
          }, 2500);
        } else {
          const errorText = await statusUpdateResponse.text();
          console.warn("Failed to update work order status:", errorText);
          
        
          // Still provide download option and redirect after delay
          triggerDownload(pdfBlob, fileName);
          setTimeout(() => {
            navigate('/mywork');
          }, 2000);
        }
      } catch (statusError) {
        console.error("Error updating work order status:", statusError);
      
        // Still provide download option and redirect after delay
        triggerDownload(pdfBlob, fileName);
        setTimeout(() => {
          navigate('/mywork');
        }, 2000);
      }
    } else {
      // If no workOrderId, just provide download and redirect
      triggerDownload(pdfBlob, fileName);
      setTimeout(() => {
        navigate('/mywork');
      }, 1500);
    }
    
    return fileInfo;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    
    // Provide fallback download if upload fails
    if (pdfBlob && fileName) {
      try {
        triggerDownload(pdfBlob, fileName);
        // toast.success('PDF downloaded locally (upload failed)');
      } catch (downloadError) {
        console.error('Fallback download also failed:', downloadError);
        // toast.error(`Upload failed and download fallback failed: ${error.message}`);
      }
    } else {
      // toast.error(`Failed to upload PDF: ${error.message}`);
    }
    
    throw error;
  } finally {
    setIsUploading(false);
  }
};
// Helper function to trigger download
const triggerDownload = (blob, fileName) => {
  try {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    console.log(`Download triggered for: ${fileName}`);
  } catch (error) {
    console.error('Error triggering download:', error);
    throw error;
  }
};
const fetchSubworkNamesForPDF = async (subworkIds) => {
  if (!jwtToken || !subworkIds.length) {
    return {};
  }

  try {
    console.log('Fetching subwork names for PDF:', subworkIds);
    
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
          const subwork = Array.isArray(subworkData) ? subworkData[0] : subworkData;
          subworkNames[subworkId] = subwork?.subworkName || `SubWork ${subworkId}`;
        } else {
          subworkNames[subworkId] = `SubWork ${subworkId}`;
        }
      } catch (error) {
        console.error(`Error fetching subwork ${subworkId}:`, error);
        subworkNames[subworkId] = `SubWork ${subworkId}`;
      }
    });

    await Promise.all(subworkPromises);
    console.log('Fetched subwork names for PDF:', subworkNames);
    return subworkNames;
    
  } catch (error) {
    console.error('Error fetching subwork names for PDF:', error);
    return {};
  }
};
const generateAbstractPDFBlob = async () => {
  try {
    // Load auxiliary works and GST from localStorage
    const auxiliaryWorks = loadAuxiliaryWorks();
    const gstPercentage = loadGstPercentage();
    
    // Get subwork IDs from abstractItems and fetch their names
    const subworkIds = [...new Set(
      abstractItems
        .map(item => item.fkSubworkId)
        .filter(id => id !== undefined && id !== null)
    )];
    
    console.log('Found subwork IDs for PDF:', subworkIds);
    
    // Fetch subwork names
    const subworkNames = await fetchSubworkNamesForPDF(subworkIds);
    
    // Group items by subwork
    const groupedItems = {};
    abstractItems.forEach(item => {
      const subworkId = item.fkSubworkId || 'unknown';
      const subworkName = subworkNames[subworkId] || `SubWork ${subworkId}`;
      
      if (!groupedItems[subworkId]) {
        groupedItems[subworkId] = {
          name: subworkName,
          items: []
        };
      }
      groupedItems[subworkId].items.push(item);
    });

    // Create flat array with subwork info for PDF
    const pdfItems = [];
    let serialNumber = 1;
    
    Object.entries(groupedItems).forEach(([subworkId, subworkData]) => {
      // Add subwork header
      pdfItems.push({
        isSubworkHeader: true,
        subworkName: subworkData.name,
        itemCount: subworkData.items.length
      });
      
      // Add items for this subwork
      subworkData.items.forEach(item => {
        pdfItems.push({
          isSubworkHeader: false,
          srNo: serialNumber++,
          description: item.descriptionOfItem || item.description || 'No description',
          itemNo: item.itemNo || item.itemNumber || 'N/A',
          quantity: item.quantity || 0,
          rate: item.completedRate || item.rate || 0,
          unit: item.smallUnit || 'Nos',
          amount: (item.quantity || 0) * (item.completedRate || item.rate || 0)
        });
      });
    });

    // Calculate totals (only from non-header items)
    const calculateTotals = () => {
      const itemsTotal = pdfItems
        .filter(item => !item.isSubworkHeader)
        .reduce((sum, item) => sum + item.amount, 0);
      
      // Process auxiliary works - keep original amounts for fixed amounts
      const processedAuxWorks = auxiliaryWorks.map(aux => ({
        ...aux,
        amount: aux.isPercentage ? (itemsTotal * aux.percentage) / 100 : aux.amount
      }));
      const auxTotal = processedAuxWorks.reduce((sum, aux) => sum + aux.amount, 0);
      const subtotal = itemsTotal + auxTotal;
      const gstAmount = (subtotal * gstPercentage) / 100;
      const grandTotal = subtotal + gstAmount;
      
      return {
        itemsTotal,
        auxTotal,
        subtotal,
        gstAmount,
        grandTotal,
        processedAuxWorks
      };
    };

    // Helper function to format currency properly
    const formatCurrency = (amount) => {
      const formattedAmount = amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return `Rs.${formattedAmount}`;
    };

    // Helper function to format percentage with 2 decimal places
    const formatPercentage = (percentage) => {
      return parseFloat(percentage).toFixed(2);
    };
    
    const totals = calculateTotals();
    const { nameOfWork, workOrderId, revisionNumber } = workInfo;

    // Function to chunk items for better page management
    const chunkItemsForPages = (items, maxItemsPerPage = 25) => {
      const chunks = [];
      let currentChunk = [];
      let currentCount = 0;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // If this is a subwork header, check if we can fit it with at least 2 items
        if (item.isSubworkHeader) {
          const remainingItems = items.slice(i + 1);
          const nextTwoItems = remainingItems.slice(0, 2).filter(item => !item.isSubworkHeader);
          
          // If adding header + 2 items would exceed limit, start new chunk
          if (currentCount > 0 && currentCount + 1 + nextTwoItems.length > maxItemsPerPage) {
            chunks.push([...currentChunk]);
            currentChunk = [];
            currentCount = 0;
          }
        }
        // If this is a regular item and would exceed limit, start new chunk
        else if (currentCount >= maxItemsPerPage) {
          chunks.push([...currentChunk]);
          currentChunk = [];
          currentCount = 0;
        }
        
        currentChunk.push(item);
        currentCount++;
      }
      
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }
      
      return chunks;
    };

    // Chunk items for better page management
    const itemChunks = chunkItemsForPages(pdfItems);
    
    // Create Abstract PDF using react-pdf
    const AbstractDocument = () => (
      <Document>
        {itemChunks.map((chunk, pageIndex) => (
          <Page key={pageIndex} size="A4" style={{ 
            padding: 30, 
            fontSize: 10, 
            fontFamily: 'Helvetica',
            flexDirection: 'column'
          }}>
            {/* Header - Only on first page */}
            {pageIndex === 0 && (
              <>
                <View style={{ 
                  textAlign: 'center', 
                  marginBottom: 20,
                  flexShrink: 0
                }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ABSTRACT </Text>
                  {nameOfWork && (
                    <Text style={{ 
                      fontSize: 14, 
                      marginTop: 10,
                      textTransform: 'uppercase' 
                    }}>
                      Work: {nameOfWork}
                    </Text>
                  )}
                </View>
                
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  marginBottom: 15,
                  flexShrink: 0
                }}>
                  <Text>Date: {new Date().toLocaleDateString('en-IN')}</Text>
                </View>
              </>
            )}
            
            {/* Page continuation header for subsequent pages */}
            {pageIndex > 0 && (
              <View style={{ 
                textAlign: 'center', 
                marginBottom: 20,
                flexShrink: 0
              }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold' }}>ABSTRACT (Continued...)</Text>
                {nameOfWork && (
                  <Text style={{ fontSize: 12, marginTop: 5 }}>
                    Work: {nameOfWork}
                  </Text>
                )}
              </View>
            )}
            
            {/* Table Header */}
            <View style={{ 
              flexDirection: 'row', 
              backgroundColor: '#f5f5f5', 
              borderTop: '1pt solid #000',
              borderLeft: '1pt solid #000',
              borderRight: '1pt solid #000',
              borderBottom: '1pt solid #000',
              flexShrink: 0
            }}>
              <Text style={{ 
                width: '6%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>Sr. No.</Text>
              <Text style={{ 
                width: '32%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>Item of work</Text>
              <Text style={{ 
                width: '10%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>SSR Item No.</Text>
              <Text style={{ 
                width: '9%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>Qty</Text>
              <Text style={{ 
                width: '11%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>Rate</Text>
              <Text style={{ 
                width: '7%', 
                padding: 4,
                textAlign: 'center', 
                borderRight: '1pt solid #000' 
              }}>Unit</Text>
              <Text style={{ 
                width: '25%', 
                padding: 4,
                textAlign: 'center' 
              }}>Amount</Text>
            </View>
            
            {/* Table Body Items for this chunk */}
            {chunk.map((item, index) => {
              if (item.isSubworkHeader) {
                // Subwork Header Row
                return (
                  <View key={`subwork-${pageIndex}-${index}`} style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#e5e7eb',
                    borderLeft: '1pt solid #000',
                    borderRight: '1pt solid #000',
                    borderBottom: '1pt solid #000',
                    minHeight: 24 // Ensure consistent height
                  }}>
                    <Text style={{ 
                      width: '100%', 
                      padding: 6,
                      textAlign: 'left',
                      fontWeight: 'bold',
                      fontSize: 11
                    }}>
                      SubEstimate: {item.subworkName} 
                    </Text>
                  </View>
                );
              } else {
                // Regular Item Row
                return (
                  <View key={`item-${pageIndex}-${index}`} style={{ 
                    flexDirection: 'row', 
                    borderLeft: '1pt solid #000',
                    borderRight: '1pt solid #000',
                    borderBottom: '1pt solid #000',
                    minHeight: 20 // Ensure consistent row height
                  }}>
                    <Text style={{ 
                      width: '6%', 
                      padding: 4,
                      textAlign: 'center', 
                      borderRight: '1pt solid #000' 
                    }}>{item.srNo}</Text>
                    <Text style={{ 
                      width: '32%', 
                      padding: 4,
                      borderRight: '1pt solid #000' 
                    }}>{item.description}</Text>
                    <Text style={{ 
                      width: '10%', 
                      padding: 4,
                      textAlign: 'center', 
                      borderRight: '1pt solid #000' 
                    }}>{item.itemNo}</Text>
                    <Text style={{ 
                      width: '9%', 
                      padding: 4,
                      textAlign: 'right', 
                      borderRight: '1pt solid #000' 
                    }}>{parseFloat(item.quantity).toFixed(2)}</Text>
                    <Text style={{ 
                      width: '11%', 
                      padding: 4,
                      textAlign: 'right', 
                      borderRight: '1pt solid #000' 
                    }}>{parseFloat(item.rate).toFixed(2)}</Text>
                    <Text style={{ 
                      width: '7%', 
                      padding: 4,
                      textAlign: 'center', 
                      borderRight: '1pt solid #000' 
                    }}>{item.unit}</Text>
                    <Text style={{ 
                      width: '25%', 
                      padding: 4,
                      textAlign: 'right' 
                    }}>{formatCurrency(item.amount)}</Text>
                  </View>
                );
              }
            })}
            
            {/* Show totals only on the last page */}
            {pageIndex === itemChunks.length - 1 && (
              <>
                {/* Table Footer - Totals Section */}
                <View style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#f9fafb', 
                  borderLeft: '1pt solid #000',
                  borderRight: '1pt solid #000',
                  borderBottom: '1pt solid #000',
                  flexShrink: 0,
                  marginTop: 10
                }}>
                  <Text style={{ 
                    width: '75%', 
                    padding: 4,
                    textAlign: 'right',
                    fontWeight: 'bold',  
                    borderRight: '1pt solid #000' 
                  }}>Total (A):</Text>
                  <Text style={{ 
                    width: '25%', 
                    padding: 4,
                    textAlign: 'right',
                    fontWeight: 'bold'
                  }}>{formatCurrency(totals.itemsTotal)}</Text>
                </View>
                
                {/* Auxiliary Works (B) - Only show if there are auxiliary works */}
                {totals.processedAuxWorks.length > 0 && (
                  <>
                    <View style={{ 
                      flexDirection: 'row', 
                      backgroundColor: '#f0f9ff', 
                      borderLeft: '1pt solid #000',
                      borderRight: '1pt solid #000',
                      borderBottom: '1pt solid #000',
                      flexShrink: 0 
                    }}>
                      <Text style={{ 
                        width: '75%', 
                        padding: 6, 
                        textAlign: 'right', 
                        borderRight: '1pt solid #000',
                        fontWeight: 'bold',
                        fontSize: 11
                      }}>Auxiliary Works (B)</Text>
                      <Text style={{ 
                        width: '25%', 
                        padding: 6, 
                        textAlign: 'right',
                        fontWeight: 'bold',
                        fontSize: 11
                      }}></Text>
                    </View>
                    
                    {/* Auxiliary Works Items */}
                    {totals.processedAuxWorks.map((aux, auxIndex) => (
                      <View key={auxIndex} style={{ 
                        flexDirection: 'row', 
                        backgroundColor: '#f9fafb', 
                        borderLeft: '1pt solid #000',
                        borderRight: '1pt solid #000',
                        borderBottom: '1pt solid #000',
                        flexShrink: 0 
                      }}>
                        <Text style={{ 
                          width: '75%', 
                          padding: 4,
                          textAlign: 'right', 
                          borderRight: '1pt solid #000' 
                        }}>
                          {aux.description}{aux.isPercentage ? ` (${formatPercentage(aux.percentage)}%)` : ' (Fixed Amount)'}:
                        </Text>
                        <Text style={{ 
                          width: '25%', 
                          padding: 4,
                          textAlign: 'right' 
                        }}>{formatCurrency(aux.amount)}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                {/* Final Totals Section */}
                {/* Subtotal */}
                <View style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#f9fafb', 
                  borderLeft: '1pt solid #000',
                  borderRight: '1pt solid #000',
                  borderBottom: '1pt solid #000',
                  flexShrink: 0 
                }}>
                  <Text style={{ 
                    width: '75%', 
                    padding: 4,
                    textAlign: 'right',
                    fontWeight: 'bold',  
                    borderRight: '1pt solid #000' 
                  }}>Total(A+B):</Text>
                  <Text style={{ 
                    width: '25%', 
                    padding: 4,
                    textAlign: 'right',
                    fontWeight: 'bold'
                  }}>{formatCurrency(totals.subtotal)}</Text>
                </View>
                
                {/* GST */}
                <View style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#f9fafb', 
                  borderLeft: '1pt solid #000',
                  borderRight: '1pt solid #000',
                  borderBottom: '1pt solid #000',
                  flexShrink: 0 
                }}>
                  <Text style={{ 
                    width: '75%', 
                    padding: 4,
                    textAlign: 'right', 
                    borderRight: '1pt solid #000' 
                  }}>GST ({gstPercentage}%):</Text>
                  <Text style={{ 
                    width: '25%', 
                    padding: 4,
                    textAlign: 'right' 
                  }}>{formatCurrency(totals.gstAmount)}</Text>
                </View>
                
                {/* Grand Total */}
                <View style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#e5e7eb',
                  borderLeft: '1pt solid #000',
                  borderRight: '1pt solid #000',
                  borderBottom: '1pt solid #000',
                  flexShrink: 0,
                  marginBottom: 20
                }}>
                  <Text style={{ 
                    width: '75%', 
                    padding: 6, 
                    textAlign: 'right', 
                    borderRight: '1pt solid #000', 
                    fontWeight: 'bold', 
                    fontSize: 12 
                  }}>Grand Total:</Text>
                  <Text style={{ 
                    width: '25%', 
                    padding: 6, 
                    textAlign: 'right', 
                    fontWeight: 'bold', 
                    fontSize: 12
                  }}>{formatCurrency(totals.grandTotal)}</Text>
                </View>
                
                {/* Signature section - Only on last page */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  marginTop: 30,
                  paddingHorizontal: 20,
                  position: 'absolute',
                  bottom: 30,
                  left: 30,
                  right: 30
                }}>
                  <View style={{ 
                    alignItems: 'center',
                    width: '45%'
                  }}>
                    <View style={{ 
                      borderBottom: '1pt solid #000', 
                      height: 40,
                      width: '100%',
                      marginBottom: 8
                    }}></View>
                    <Text style={{ 
                      fontWeight: 'bold', 
                      fontSize: 10,
                      textAlign: 'center'
                    }}>Prepared By</Text>
                    {signatures.preparedBy && (
                      <Text style={{ 
                        fontSize: 9,
                        textAlign: 'center',
                        marginTop: 3
                      }}>{signatures.preparedBy}</Text>
                    )}
                  </View>
                  
                  <View style={{ 
                    alignItems: 'center',
                    width: '45%'
                  }}>
                    <View style={{ 
                      borderBottom: '1pt solid #000', 
                      height: 40,
                      width: '100%',
                      marginBottom: 8
                    }}></View>
                    <Text style={{ 
                      fontWeight: 'bold', 
                      fontSize: 10,
                      textAlign: 'center'
                    }}>Checked By</Text>
                    {signatures.checkedBy && (
                      <Text style={{ 
                        fontSize: 8,
                        textAlign: 'center',
                        marginTop: 2
                      }}>{signatures.checkedBy}</Text>
                    )}
                  </View>
                </View>
              </>
            )}
          </Page>
        ))}
      </Document>
    );
    
    return await pdf(<AbstractDocument />).toBlob();
    
  } catch (err) {
    console.error("Error generating Abstract PDF:", err);
    throw err;
  }
};
const BufferPolyfill = {
  isBuffer: (obj) => {
    return obj instanceof Uint8Array || 
           (obj && typeof obj === 'object' && obj.constructor === Uint8Array) ||
           (obj && typeof obj === 'object' && obj.type === 'Buffer');
  },
  
  from: (data, encoding) => {
    if (typeof data === 'string') {
      if (encoding === 'base64') {
        try {
          const binaryString = atob(data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        } catch (error) {
          console.error('Error decoding base64:', error);
          return new Uint8Array(0);
        }
      }
      // For other encodings, convert string to Uint8Array
      const encoder = new TextEncoder();
      return encoder.encode(data);
    }
    
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    
    if (data instanceof Uint8Array) {
      return data;
    }
    
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }
    
    return new Uint8Array(0);
  },
  
  alloc: (size, fill = 0) => {
    const buffer = new Uint8Array(size);
    if (fill !== 0) {
      buffer.fill(fill);
    }
    return buffer;
  },
  
  concat: (buffers, totalLength) => {
    if (!Array.isArray(buffers)) {
      throw new TypeError('First argument must be an array');
    }
    
    if (buffers.length === 0) {
      return new Uint8Array(0);
    }
    
    let length = totalLength;
    if (length === undefined) {
      length = buffers.reduce((acc, buf) => acc + buf.length, 0);
    }
    
    const result = new Uint8Array(length);
    let offset = 0;
    
    for (const buf of buffers) {
      if (offset + buf.length > length) {
        result.set(buf.slice(0, length - offset), offset);
        break;
      }
      result.set(buf, offset);
      offset += buf.length;
    }
    
    return result;
  }
};

// Set global Buffer if not available
if (typeof Buffer === 'undefined') {
  window.Buffer = BufferPolyfill;
}

// Also add isBuffer as a standalone function
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = BufferPolyfill;
}
// Fixed processImageData function
const processImageData = (imageData) => {
  if (!imageData || typeof imageData !== 'string') {
    return null;
  }
  
  try {
    // Check if it's a valid data URL
    if (imageData.startsWith('data:image/')) {
      // Validate the base64 part
      const base64Part = imageData.split('base64,')[1];
      if (base64Part) {
        // Test if base64 is valid
        atob(base64Part);
        return imageData;
      }
    }
    
    // If it's base64 without data URL prefix, add it
    if (imageData.match(/^[A-Za-z0-9+/=]+$/)) {
      // Test if base64 is valid
      atob(imageData);
      return `data:image/png;base64,${imageData}`;
    }
  } catch (error) {
    console.warn('Invalid image data:', error);
  }
  
  return null;
};

const calculateTotalQuantity = (measurements) => {
  if (!measurements || measurements.length === 0) return 0;
  
  const total = measurements.reduce((sum, measurement) => {
    const qty = measurement.quantity || measurement.totalQuantity || measurement.qty || 0;
    return sum + (parseFloat(qty) || 0);
  }, 0);
  
  return parseFloat(total.toFixed(2));
};

// 6. Function to merge 
const mergePDFs = async (pdfBlobs) => {
  try {
    console.log(`Merging ${pdfBlobs.length} PDF(s) with page numbering...`);
    
    // Validate input
    if (!Array.isArray(pdfBlobs) || pdfBlobs.length === 0) {
      throw new Error('No PDFs provided for merging');
    }
    
    // If only one PDF, add page numbers and return
    if (pdfBlobs.length === 1) {
      return await addPageNumbersToSinglePDF(pdfBlobs[0]);
    }
    
    const mergedPdf = await PDFDocument.create();
    let currentPageNumber = 1;
    
    // Track which component each page belongs to
    const pageComponentMap = [];
    
    // Determine if we actually have a cover page based on the PDFs we received
    // If cover page was selected but not generated, it won't be in pdfBlobs
    let actuallyHasCoverPage = false;
    let expectedPdfIndex = 0;
    
    // Check if first PDF should be cover page based on selected components and actual PDFs received
    if (selectedComponents.coverPage && pdfBlobs.length > 0) {
      // We need to check if the first PDF is actually a cover page or if it was skipped
      // Since cover page returns null when not generated, if we have PDFs but cover was selected,
      // the first PDF might actually be abstract or other component
      
      // Simple heuristic: if cover page was selected and we have the expected number of PDFs,
      // then first PDF is likely the cover page
      const expectedPdfCount = Object.values(selectedComponents).filter(Boolean).length;
      actuallyHasCoverPage = (pdfBlobs.length === expectedPdfCount);
    }
    
    console.log(`Actually has cover page: ${actuallyHasCoverPage}`);
    
    for (let i = 0; i < pdfBlobs.length; i++) {
      const blob = pdfBlobs[i];
      console.log(`Processing PDF ${i + 1}/${pdfBlobs.length} (${blob.size} bytes)`);
      
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        // Determine component type based on actual PDFs received, not selected components
        let componentType = 'other';
        
        if (i === 0 && actuallyHasCoverPage) {
          componentType = 'coverPage';
        } else if (selectedComponents.abstract) {
          // Abstract is either first PDF (if no actual cover page) or second PDF (if cover page exists)
          const abstractPdfIndex = actuallyHasCoverPage ? 1 : 0;
          if (i === abstractPdfIndex) {
            componentType = 'abstract';
          }
        }
        
        copiedPages.forEach((page, pageIndex) => {
          mergedPdf.addPage(page);
          pageComponentMap.push({
            componentType,
            pageIndex: pageIndex,
            pdfIndex: i
          });
        });
        
        console.log(`Added ${copiedPages.length} pages from PDF ${i + 1} (${componentType})`);
      } catch (pdfError) {
        console.error(`Error processing PDF ${i + 1}:`, pdfError);
        throw new Error(`Failed to process PDF ${i + 1}: ${pdfError.message}`);
      }
    }
    
    // Add page numbers to merged PDF
    const pages = mergedPdf.getPages();
    
    pages.forEach((page, index) => {
      const pageInfo = pageComponentMap[index];
      
      // Skip page numbering only for actual cover pages
      if (pageInfo && pageInfo.componentType === 'coverPage' && actuallyHasCoverPage) {
        console.log(`Skipping page number for cover page (page ${index + 1})`);
        return;
      }
      
      // Add page number for all other pages
      try {
        const { width, height } = page.getSize();
        
        // Updated positioning - moved to far right edge and slightly higher
        const fontSize = 10;
        const rightMargin = 15; // Reduced margin from right edge
        const bottomMargin = 20; // Slightly higher from bottom
        
        // Position at the very right edge, outside content area
        const xPosition = width - rightMargin;
        const yPosition = bottomMargin;
        
        // Get text width to ensure proper alignment
        const pageNumberText = `${currentPageNumber}`;
        
        page.drawText(pageNumberText, {
          x: xPosition - (pageNumberText.length * 3), // Adjust for text width
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0), // Black color
        });
        
        console.log(`Added page number ${currentPageNumber} to page ${index + 1} at position (${xPosition - (pageNumberText.length * 3)}, ${yPosition})`);
        currentPageNumber++;
      } catch (pageError) {
        console.warn(`Failed to add page number to page ${index + 1}:`, pageError);
      }
    });
    
    const pdfBytes = await mergedPdf.save();
    const finalBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    console.log(`Merged PDF with page numbers created (${finalBlob.size} bytes)`);
    
    return finalBlob;
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error(`PDF merge failed: ${error.message}`);
  }
};

const addPageNumbersToSinglePDF = async (pdfBlob) => {
  try {
    console.log('Adding page numbers to single PDF...');
    
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    
    // Determine if this single PDF is actually a cover page
    // If cover page was selected and we only have 1 PDF, and other components were also selected,
    // then this might not be a cover page (cover page was skipped due to no data)
    const totalSelectedComponents = Object.values(selectedComponents).filter(Boolean).length;
    const isActuallyCoverPage = selectedComponents.coverPage && 
                                totalSelectedComponents === 1; // Only cover page selected
    
    // If we have only one PDF but multiple components were selected,
    // it means cover page was skipped and this is not a cover page
    const shouldTreatAsCoverPage = isActuallyCoverPage;
    
    if (shouldTreatAsCoverPage) {
      console.log('Single PDF is cover page only - no page numbers added');
      return pdfBlob; // Return as-is for cover page only
    }
    
    let pageNumber = 1;
    
    pages.forEach((page, index) => {
      // Don't skip any pages since we've already determined this is not a cover-page-only scenario
      try {
        const { width, height } = page.getSize();
        
        // Updated positioning - moved to far right edge and slightly higher
        const fontSize = 10;
        const rightMargin = 15; // Reduced margin from right edge
        const bottomMargin = 20; // Slightly higher from bottom
        
        // Position at the very right edge, outside content area
        const xPosition = width - rightMargin;
        const yPosition = bottomMargin;
        
        // Get text width to ensure proper alignment
        const pageNumberText = `${pageNumber}`;
        
        page.drawText(pageNumberText, {
          x: xPosition - (pageNumberText.length * 3), // Adjust for text width
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        
        console.log(`Added page number ${pageNumber} to single PDF page ${index + 1} at position (${xPosition - (pageNumberText.length * 3)}, ${yPosition})`);
        pageNumber++;
      } catch (pageError) {
        console.warn(`Failed to add page number to single PDF page ${index + 1}:`, pageError);
      }
    });
    
    const pdfBytes = await pdf.save();
    const finalBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    console.log(`Single PDF with page numbers created (${finalBlob.size} bytes)`);
    
    return finalBlob;
  } catch (error) {
    console.error('Error adding page numbers to single PDF:', error);
    throw new Error(`Single PDF page numbering failed: ${error.message}`);
  }
};
// // Add the handlePrevStep function
// const handlePrevStep = (step) => {
//   setCurrentStep(step);
//   toast.info("Going back to previous step");
// };
// New function to refresh all data from localStorage
const refreshAllData = async () => {
  try {
    console.log("Refreshing all data from localStorage...");
    
    // Refresh items from subRecordCache
    await fetchItems();
    
    // Refresh abstract items
    await prepareAbstractData();
    
    // Refresh construction estimate
    await ensureCoverPageData();
    
    // Refresh auxiliary works and GST
    const auxiliaryWorks = loadAuxiliaryWorks();
    const gstPercentage = loadGstPercentage();
    
    console.log("Data refresh completed", {
      itemsCount: items.length,
      abstractItemsCount: abstractItems.length,
      auxiliaryWorksCount: auxiliaryWorks.length,
      gstPercentage
    });
    
    toast.success("Data refreshed successfully");
  } catch (error) {
    console.error("Error refreshing data:", error);
    toast.error("Failed to refresh data");
  }
};

 const fetchMeasurements = async (itemId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch measurements. Status: ${res.status}`);
      }
      
      return await res.json();
    } catch (err) {
      console.error(`Error fetching measurements for item ${itemId}:`, err);
      return [];
    }
  };
 
  const fetchItems = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const subRecordCache = localStorage.getItem('subRecordCache');
    
    if (!subRecordCache) {
      setError("No measurement data found in local storage");
      setLoading(false);
      return;
    }
    
    let parsedItems;
    try {
      const itemsObject = JSON.parse(subRecordCache);
      
      if (Array.isArray(itemsObject)) {
        parsedItems = itemsObject;
      } else if (typeof itemsObject === 'object') {
        parsedItems = Object.values(itemsObject).flat();
      } else {
        throw new Error("Invalid data format in subRecordCache");
      }
    } catch (parseErr) {
      console.error("Error parsing subRecordCache:", parseErr);
      setError("Invalid measurement data format in local storage");
      setLoading(false);
      return;
    }
    
    console.log(`Found ${parsedItems.length} items in subRecordCache`);
    
    const detailedItems = await Promise.all(
      parsedItems.map(async (item) => {
        if (item.measurements && Array.isArray(item.measurements)) {
          return item;
        }
        const measurements = await fetchMeasurements(item.id);
        return { ...item, measurements };
      })
    );
    
    setItems(detailedItems);
    
    // Auto-refresh abstract items if they exist
    if (abstractItems.length > 0) {
      await prepareAbstractData();
    }
    
    console.log(`Successfully loaded ${detailedItems.length} detailed items`);
    
  } catch (err) {
    console.error("Error fetching item details:", err);
    setError("Failed to load measurement data");
  } finally {
    setLoading(false);
  }
};


 const handleComponentToggle = async (component) => {
  setSelectedComponents(prev => {
    const newState = {
      ...prev,
      [component]: !prev[component]
    };
    
    // If materialPage is being selected, ensure data is loaded
    if (component === 'materialPage' && !prev[component]) {
      setTimeout(async () => {
        try {
          await ensureMaterialSummaryData(true); // true for Bank Estimate
        } catch (error) {
          console.error('Error loading material summary data on toggle:', error);
        }
      }, 100);
    }
    
    return newState;
  });
};

  const ensureCoverPageData = async () => {
  try {
    // First, always fetch the latest grand total
    const latestGrandTotal = fetchLatestGrandTotal();
    console.log("Latest grand total fetched:", latestGrandTotal);
    
    const savedCoverPageData = safeLocalStorageGet('coverPageData');
    if (savedCoverPageData) {
      if (savedCoverPageData.estimateCost && savedCoverPageData.workName) {
        console.log("Using saved cover page data:", savedCoverPageData);
        
        // Handle company logo if it exists (but don't store it if it's too large)
        let processedLogo = savedCoverPageData.companyLogo;
        if (processedLogo && typeof processedLogo === 'string' && processedLogo.startsWith('data:')) {
          // Check if logo is reasonable size (under 1MB)
          if (processedLogo.length > 1024 * 1024) {
            console.warn('Company logo is too large, removing from storage');
            processedLogo = null;
          }
        }
        
        const constructionEstimateData = {
          grandTotal: latestGrandTotal || parseFloat(savedCoverPageData.estimateCost) || 0,
          workOrderId: workInfo.workOrderId,
          workName: savedCoverPageData.workName,
          area: workInfo.area || '900',
          ssr: savedCoverPageData.year || workInfo.ssr || '',
          items: items.length,
          revisionNumber: workInfo.revisionNumber,
          coverPageData: {
            ...savedCoverPageData,
            companyLogo: processedLogo,
            estimateCost: latestGrandTotal || parseFloat(savedCoverPageData.estimateCost) || 0
          }
        };
        
        setConstructionEstimate(constructionEstimateData);
        
        // Use safe storage method
        const storedSuccessfully = safeLocalStorageSet("constructionEstimate", constructionEstimateData);
        if (!storedSuccessfully) {
          console.warn("Failed to store construction estimate data, but continuing with in-memory data");
        }
        
        // Update the coverPageData with latest grand total (without logo if too large)
        const updatedCoverPageData = {
          ...savedCoverPageData,
          companyLogo: processedLogo,
          estimateCost: latestGrandTotal || parseFloat(savedCoverPageData.estimateCost) || 0
        };
        
        safeLocalStorageSet('coverPageData', updatedCoverPageData);
        
        // Store minimal required data
        safeLocalStorageSet("abstractWorkName", savedCoverPageData.workName);
        safeLocalStorageSet("abstractWorkOrderId", workInfo.workOrderId);
        safeLocalStorageSet("abstractArea", workInfo.area || "900");
        safeLocalStorageSet("abstractSSR", savedCoverPageData.year || workInfo.ssr || "");
        
        return constructionEstimateData;
      }
    }
    
    if (constructionEstimate && constructionEstimate.grandTotal !== undefined) {
      // Update with latest grand total
      if (latestGrandTotal && latestGrandTotal !== constructionEstimate.grandTotal) {
        const updatedEstimate = {
          ...constructionEstimate,
          grandTotal: latestGrandTotal
        };
        setConstructionEstimate(updatedEstimate);
        safeLocalStorageSet("constructionEstimate", updatedEstimate);
        return updatedEstimate;
      }
      return constructionEstimate;
    }
    
    let grandTotal = latestGrandTotal;
    
    // If no grand total found, calculate from items
    if (grandTotal === 0) {
      for (const item of items) {
        const quantity = Array.isArray(item.measurements) 
          ? item.measurements.reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0) 
          : 0;
        
        const amount = quantity * (parseFloat(item.labourRate) || 0);
        grandTotal += amount;
      }
    }
    
    const newConstructionEstimate = {
      grandTotal: grandTotal || 0,
      workOrderId: workInfo.workOrderId,
      workName: workInfo.nameOfWork,
      area: workInfo.area || '900',
      ssr: workInfo.ssr || '',
      items: items.length,
      revisionNumber: workInfo.revisionNumber
    };
    
    setConstructionEstimate(newConstructionEstimate);
    safeLocalStorageSet("constructionEstimate", newConstructionEstimate);
    
    // Store minimal required data
    safeLocalStorageSet("abstractWorkName", workInfo.nameOfWork);
    safeLocalStorageSet("abstractWorkOrderId", workInfo.workOrderId);
    safeLocalStorageSet("abstractArea", workInfo.area || "900");
    safeLocalStorageSet("abstractSSR", workInfo.ssr || "");
    
    return newConstructionEstimate;
  } catch (error) {
    console.error("Error ensuring cover page data:", error);
    
    // If localStorage is completely full, try to work with in-memory data only
    if (error.name === 'QuotaExceededError') {
      console.warn("localStorage quota exceeded, working with in-memory data only");
      
      const latestGrandTotal = fetchLatestGrandTotal();
      const inMemoryEstimate = {
        grandTotal: latestGrandTotal || 0,
        workOrderId: workInfo.workOrderId,
        workName: workInfo.nameOfWork,
        area: workInfo.area || '900',
        ssr: workInfo.ssr || '',
        items: items.length,
        revisionNumber: workInfo.revisionNumber
      };
      
      setConstructionEstimate(inMemoryEstimate);
      return inMemoryEstimate;
    }
    
    throw new Error(`Failed to prepare cover page data: ${error.message}`);
  }
};

const generateCombinedPDF = async () => {
  let loadingToast;
  
  try {
    // First, refresh all data to ensure we have the latest items
    await refreshAllData();
    
    // Load measurement data for Bank Estimate components
    if (selectedComponents.componentPage) {
      await loadMeasurementDataForBankEstimate();
    }
    
    if (selectedComponents.materialPage) {
      await loadMaterialSummaryDataForBankEstimate();
    }
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // IMPORTANT: Ensure cover page data is updated with latest grand total
    console.log('Ensuring cover page data is updated...');
    
    let coverPageData;
    try {
      coverPageData = await ensureCoverPageData();
    } catch (coverError) {
      console.warn('Cover page data preparation failed, using fallback:', coverError);
      
      // Fallback: use minimal data from workInfo
      const latestGrandTotal = fetchLatestGrandTotal();
      coverPageData = {
        grandTotal: latestGrandTotal || 0,
        workOrderId: workInfo.workOrderId,
        workName: workInfo.nameOfWork,
        area: workInfo.area || '900',
        ssr: workInfo.ssr || '',
        items: items.length,
        revisionNumber: workInfo.revisionNumber
      };
      setConstructionEstimate(coverPageData);
    }
    
    // Wait for state updates to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Validate selections
    if (!selectedComponents.abstract && !selectedComponents.coverPage && !selectedComponents.componentPage && !selectedComponents.materialPage) {
      toast.error("Please select at least one component to include in the PDF");
      return;
    }

    // Validate required data
    if (!workInfo || !workInfo.workOrderId) {
      toast.error("Missing work order information");
      return;
    }

    const { nameOfWork, workOrderId, revisionNumber } = workInfo;
    loadingToast = toast.loading('Generating Bank Estimate PDF...');
    
    console.log('Starting Bank Estimate PDF generation with refreshed data...', {
      abstract: selectedComponents.abstract,
      coverPage: selectedComponents.coverPage,
      componentPage: selectedComponents.componentPage,
      materialPage: selectedComponents.materialPage,
      workOrderId,
      revisionNumber,
      itemsCount: items.length,
      abstractItemsCount: abstractItems.length,
      measurementItemsCount: measurementData.items.length,
      currentGrandTotal: fetchLatestGrandTotal()
    });

    let finalBlob;
    let fileName = `${workOrderId}_${revisionNumber || '1'}.pdf`;
    const pdfBlobs = [];

    try {
      // Generate cover page first if selected
      if (selectedComponents.coverPage) {
        console.log('Generating cover page PDF...');
        try {
          const coverPageBlob = await generateCoverPageBlob();
          if (coverPageBlob && coverPageBlob.size > 0) {
            pdfBlobs.push(coverPageBlob);
            console.log(`Cover page generated (${coverPageBlob.size} bytes)`);
          } else {
            throw new Error('Cover page blob is empty');
          }
        } catch (coverError) {
          console.error('Cover page generation failed:', coverError);
          toast.error('Cover page generation failed, skipping...');
        }
      }

      // Generate abstract if selected
      if (selectedComponents.abstract) {
        console.log('Generating abstract PDF...');
        try {
          const abstractBlob = await generateAbstractPDFBlob();
          if (abstractBlob && abstractBlob.size > 0) {
            pdfBlobs.push(abstractBlob);
            console.log(`Abstract generated (${abstractBlob.size} bytes)`);
          } else {
            throw new Error('Abstract blob is empty');
          }
        } catch (abstractError) {
          console.error('Abstract generation failed:', abstractError);
          toast.error(`Abstract generation failed: ${abstractError.message}`);
          throw abstractError;
        }
      }

      // Generate measurement component if selected for Bank Estimate
      if (selectedComponents.componentPage) {
        console.log('Generating measurement component PDF for Bank Estimate...');
        try {
          const measurementBlob = await generateMeasurementPDFBlobForBankEstimate();
          if (measurementBlob && measurementBlob.size > 0) {
            pdfBlobs.push(measurementBlob);
            console.log(`Measurement component generated (${measurementBlob.size} bytes)`);
          } else {
            throw new Error('Measurement component blob is empty');
          }
        } catch (measurementError) {
          console.error('Measurement component generation failed:', measurementError);
          toast.error(`Measurement component generation failed: ${measurementError.message}`);
          throw measurementError;
        }
      }

      // Generate material summary if selected for Bank Estimate
      if (selectedComponents.materialPage) {
        console.log('Generating material summary PDF for Bank Estimate...');
        try {
          const materialSummaryBlob = await generateMaterialSummaryPDFBlobForBankEstimate();
          if (materialSummaryBlob && materialSummaryBlob.size > 0) {
            pdfBlobs.push(materialSummaryBlob);
            console.log(`Material summary generated (${materialSummaryBlob.size} bytes)`);
          } else {
            throw new Error('Material summary blob is empty');
          }
        } catch (materialError) {
          console.error('Material summary generation failed:', materialError);
          toast.error(`Material summary generation failed: ${materialError.message}`);
          throw materialError;
        }
      }

      // Check if we have any PDFs to work with
      if (pdfBlobs.length === 0) {
        throw new Error('No PDF components were successfully generated');
      }

      // Merge or use single PDF
      if (pdfBlobs.length > 1) {
        console.log('Merging Bank Estimate PDFs...');
        finalBlob = await mergePDFs(pdfBlobs);
      } else {
        finalBlob = pdfBlobs[0];
      }

      // Validate final blob
      if (!finalBlob || finalBlob.size === 0) {
        throw new Error('Generated PDF is empty');
      }

      toast.dismiss(loadingToast);
      console.log(`Bank Estimate PDF generated successfully (${finalBlob.size} bytes), attempting upload...`);

      // Try to upload to server
      try {
        const uploadResult = await uploadPDFToServer(finalBlob, fileName);
        console.log('Bank Estimate PDF uploaded successfully:', uploadResult);
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        throw uploadError;
      }

    } catch (generationError) {
      toast.dismiss(loadingToast);
      console.error("Bank Estimate PDF generation error:", generationError);
      toast.error(`Failed to generate Bank Estimate PDF: ${generationError.message}`);
      throw generationError;
    }
    
  } catch (error) {
    if (loadingToast) {
      toast.dismiss(loadingToast);
    }
    console.error("Error in generateCombinedPDF:", error);
    
    if (error.name === 'QuotaExceededError') {
      toast.error('Storage quota exceeded. Please clear your browser cache and try again.');
    } else if (error.message.includes('Buffer.isBuffer')) {
      toast.error('PDF generation failed due to browser compatibility. Please try refreshing the page.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      toast.error('Network error during PDF upload. Please check your connection.');
    } else {
      toast.error(`Bank Estimate PDF generation failed: ${error.message}`);
    }
  }
};

const downloadMeasurementComponentPDF = async () => {
  try {
    const loadingToast = toast.loading('Generating Measurement Component PDF...');
    
    // Ensure measurement data is loaded
    await loadMeasurementData();
    
    // Generate the PDF
    const measurementBlob = await generateMeasurementPDFBlob();
    
    // Create filename
    const fileName = `${workInfo.workOrderId || 'measurement'}_component_${workInfo.revisionNumber || '1'}.pdf`;
    
    toast.dismiss(loadingToast);
    
    // Try to upload to server first
    try {
      await uploadPDFToServer(measurementBlob, fileName);
    } catch (uploadError) {
      console.error('Upload failed, providing download fallback:', uploadError);
      // Fallback to direct download
      triggerDownload(measurementBlob, fileName);
      toast.success('Measurement Component PDF downloaded locally');
    }
    
  } catch (error) {
    console.error('Error downloading measurement component PDF:', error);
    toast.error(`Failed to generate measurement component PDF: ${error.message}`);
  }
};
const clearLocalStorageIfNeeded = () => {
  try {
    // Calculate approximate localStorage usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }
    
    // If usage is > 4MB, clear non-essential data
    if (totalSize > 4 * 1024 * 1024) {
      console.log('localStorage usage high, clearing non-essential data...');
      
      const nonEssentialKeys = ['tempData', 'cache', 'logs', 'oldMeasurements', 'backup'];
      nonEssentialKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed ${key} from localStorage`);
        }
      });
      
      toast.info('Cleared cache to free up storage space');
    }
  } catch (error) {
    console.error('Error checking localStorage usage:', error);
  }
};
const prepareForPDFGeneration = async () => {
  try {
    // Clear localStorage if needed
    clearLocalStorageIfNeeded();
    
    // Refresh data
    await refreshAllData();
    
    // Ensure cover page data is ready
    await ensureCoverPageData();
    
    return true;
  } catch (error) {
    console.error('Error preparing for PDF generation:', error);
    return false;
  }
};
const generateSimpleCoverPageBlob = async () => {
  try {
    const { nameOfWork, workOrderId, revisionNumber } = workInfo;
    
    const SimpleDocument = () => (
      <Document>
        <Page size="A4" style={{ padding: 40, fontFamily: 'Helvetica' }}>
          <View style={{ textAlign: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 30 }}>
              ESTIMATE COVER PAGE
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 15 }}>
              Work: {nameOfWork || 'Work Name Not Available'}
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>
              Work Order ID: {workOrderId || 'WO-001'}
            </Text>
            <Text style={{ fontSize: 14, marginBottom: 10 }}>
              Revision: {revisionNumber || '1'}
            </Text>
            <Text style={{ fontSize: 14 }}>
              Date: {new Date().toLocaleDateString('en-IN')}
            </Text>
          </View>
        </Page>
      </Document>
    );
    
    return await pdf(<SimpleDocument />).toBlob();
  } catch (error) {
    console.error('Simple cover page generation failed:', error);
    throw error;
  }
}; 
const syncAuxiliaryWorksWithCache = () => {
  try {
    const subRecordCache = localStorage.getItem('subRecordCache');
    if (!subRecordCache) return;
    
    const cachedItems = JSON.parse(subRecordCache);
    const auxiliaryWorks = loadAuxiliaryWorks();
    
    // Check if we need to update auxiliary works based on new items
    const currentAuxWorksStr = JSON.stringify(auxiliaryWorks);
    const storedAuxWorksStr = localStorage.getItem('lastAuxiliaryWorksState');
    
    if (currentAuxWorksStr !== storedAuxWorksStr) {
      localStorage.setItem('lastAuxiliaryWorksState', currentAuxWorksStr);
      console.log('Auxiliary works synced with cache');
    }
    
  } catch (error) {
    console.error('Error syncing auxiliary works with cache:', error);
  }
};
useEffect(() => {
  if (currentStep === 7) {
    syncAuxiliaryWorksWithCache();
  }
}, [currentStep]);
const fetchLatestGrandTotal = () => {
  try {
    // First try to get from grandTotal storage (real-time updates)
    const storedGrandTotal = localStorage.getItem('grandTotal');
    if (storedGrandTotal) {
      const grandTotalData = JSON.parse(storedGrandTotal);
      console.log('Using real-time grand total:', grandTotalData.amount);
      return parseFloat(grandTotalData.amount) || 0;
    }
    
    // Fallback to coverPageData
    const savedCoverPageData = localStorage.getItem('coverPageData');
    if (savedCoverPageData) {
      const coverPageData = JSON.parse(savedCoverPageData);
      if (coverPageData.estimateCost) {
        console.log('Using cover page estimate cost:', coverPageData.estimateCost);
        return parseFloat(coverPageData.estimateCost) || 0;
      }
    }
    
    // Fallback to constructionEstimate
    const constructionEstimate = localStorage.getItem('constructionEstimate');
    if (constructionEstimate) {
      const estimateData = JSON.parse(constructionEstimate);
      if (estimateData.grandTotal) {
        console.log('Using construction estimate grand total:', estimateData.grandTotal);
        return parseFloat(estimateData.grandTotal) || 0;
      }
    }
    
    console.log('No grand total found in storage, returning 0');
    return 0;
  } catch (error) {
    console.error('Error fetching latest grand total:', error);
    return 0;
  }
};

const ensureMaterialSummaryData = async (isBankEstimate = false) => {
  try {
    console.log(`Ensuring material summary data is fresh for ${isBankEstimate ? 'Bank Estimate' : 'MTS'}...`);
    
    if (isBankEstimate) {
      await loadMaterialSummaryDataForBankEstimate();
    } else {
      await loadMaterialSummaryData();
    }
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate that we have data
    const currentData = materialSummaryData.summary || [];
    if (!Array.isArray(currentData) || currentData.length === 0) {
      console.warn('Material summary data is still empty after reload, forcing regeneration...');
      
      // Force regeneration by clearing cache and reloading
      if (isBankEstimate) {
        await loadMaterialSummaryDataForBankEstimate();
      } else {
        await loadMaterialSummaryData();
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Material summary data ensured:', {
      dataLength: materialSummaryData.summary?.length || 0,
      dataType: Array.isArray(materialSummaryData.summary) ? 'array' : typeof materialSummaryData.summary
    });
    
  } catch (error) {
    console.error('Error ensuring material summary data:', error);
    throw error;
  }
};// Simple Centered Cover Page Generator (matching the image format)
const generateCoverPageBlob = async () => {
  try {
    // Check if cover page data has been properly generated/saved
    const savedCoverPageData = localStorage.getItem('coverPageData');
    let coverPageData = {};
    let hasGeneratedData = false;
    
    if (savedCoverPageData) {
      try {
        coverPageData = JSON.parse(savedCoverPageData);
        // Check if the cover page has actual user-generated content
        hasGeneratedData = !!(
          coverPageData.companyName && 
          coverPageData.companyName !== 'Company Name Not Set' &&
          coverPageData.clientName && 
          coverPageData.clientName !== 'Client Name Not Set' &&
          coverPageData.workName && 
          coverPageData.workName !== 'Work Name Not Set'
        );
      } catch (parseError) {
        console.error("Error parsing cover page data:", parseError);
        coverPageData = {};
        hasGeneratedData = false;
      }
    }

    // If cover page is selected but not generated, return null (don't generate anything)
    if (!hasGeneratedData) {
      console.log('Cover page selected but not generated - skipping generation');
      return null;
    }

    // Get the absolute latest grand total at the moment of generation
    const currentGrandTotal = fetchLatestGrandTotal();
    console.log('Current grand total for cover page:', currentGrandTotal);
    
    // Update the estimate cost with current grand total
    coverPageData.estimateCost = currentGrandTotal;

    // Use the current grand total as the primary estimate cost
    let estimateCost = currentGrandTotal;
    
    // Only fall back to stored values if current grand total is 0
    if (estimateCost === 0) {
      if (coverPageData.estimateCost) {
        estimateCost = parseFloat(coverPageData.estimateCost) || 0;
      } else if (constructionEstimate && constructionEstimate.grandTotal) {
        estimateCost = constructionEstimate.grandTotal;
      } else {
        // Calculate from items as last resort
        for (const item of items) {
          const quantity = Array.isArray(item.measurements) 
            ? item.measurements.reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0) 
            : 0;
          const amount = quantity * (parseFloat(item.labourRate) || 0);
          estimateCost += amount;
        }
      }
    }

    console.log('Final estimate cost for cover page PDF:', estimateCost);

    // Safely process company logo with additional validation
    let processedLogo = null;
    if (coverPageData.companyLogo && typeof coverPageData.companyLogo === 'string') {
      try {
        if (coverPageData.companyLogo.startsWith('data:image/') && 
            coverPageData.companyLogo.includes('base64,')) {
          const base64Data = coverPageData.companyLogo.split('base64,')[1];
          if (base64Data && base64Data.length > 0 && base64Data.length < 1000000) { // Limit size
            try {
              atob(base64Data);
              processedLogo = coverPageData.companyLogo;
              console.log('Logo processed successfully');
            } catch (base64Error) {
              console.warn("Invalid base64 image data, skipping logo");
              processedLogo = null;
            }
          } else {
            console.warn("Logo data too large or empty, skipping");
            processedLogo = null;
          }
        }
      } catch (logoError) {
        console.warn("Error processing company logo:", logoError);
        processedLogo = null;
      }
    }

    // Clean and prepare cover page props with the current grand total
    const cleanString = (str) => {
      if (!str) return '';
      // Remove excessive quotes and escape characters
      return String(str)
        .replace(/\\+/g, '') // Remove backslashes
        .replace(/"+/g, '') // Remove excessive quotes
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
    };

    const coverPageProps = {
      companyLogo: processedLogo,
      companyName: cleanString(coverPageData.companyName || 'Company Name Not Set'),
      companyAddress: cleanString(coverPageData.address || coverPageData.companyAddress || 'Address Not Set'),
      contactNo: cleanString(coverPageData.contactNo || 'Contact Not Set'),
      workName: cleanString(coverPageData.workName || workInfo.nameOfWork || 'Work Name Not Set'),
      workOrderId: cleanString(workInfo.workOrderId || 'WO-001'),
      revisionNumber: cleanString(workInfo.revisionNumber || '1'),
      clientName: cleanString(coverPageData.clientName || 'Client Name Not Set'),
      propertyNo: cleanString(coverPageData.propertyNo || 'Property No Not Set'),
      propertyAddress: cleanString(coverPageData.propertyAddress || 'Property Address Not Set'),
      estimateCost: parseFloat(estimateCost) || 0,
      sorYear: cleanString(coverPageData.year || coverPageData.sorYear || new Date().getFullYear()),
      area: cleanString(workInfo.area || coverPageData.area || '900'),
      ssr: cleanString(coverPageData.year || coverPageData.ssr || workInfo.ssr || ''),
      preparedBy: cleanString(coverPageData.preparedBy || 'Not Set')
    };

    // Import the necessary components from react-pdf
    const { Document, Page, View, Text, Image, pdf } = require('@react-pdf/renderer');
    const React = require('react');

    // Improved Centered Cover Page Component with proper alignment and matching logo size
    const SimpleCoverPagePDF = ({ 
      companyLogo,
      companyName, 
      companyAddress, 
      contactNo,
      workName, 
      workOrderId, 
      revisionNumber, 
      clientName, 
      propertyNo, 
      propertyAddress, 
      estimateCost, 
      sorYear, 
      area, 
      ssr,
      preparedBy 
    }) => (
      <Page size="A4" style={{ 
        padding: 20, 
        fontFamily: 'Helvetica'
      }}>
        
        {/* Double Border - Outer */}
        <View style={{
          border: '2pt solid #000',
          height: '100%',
          padding: 5
        }}>
          
          {/* Double Border - Inner */}
          <View style={{
            border: '1pt solid #000',
            height: '100%',
            padding: 30,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          
          {/* Header Section */}
          <View style={{ 
            alignItems: 'center', 
            textAlign: 'center',
            width: '100%',
            marginBottom: 20
          }}>
            {/* Company Logo - Updated Size to match HTML (h-24 md:h-32 = 96px to 128px) */}
            {companyLogo && (
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <Image 
                  style={{ 
                    width: 128,  // Updated from 80 to 128 to match md:h-32 (128px)
                    height: 128, // Updated from 80 to 128 to match md:h-32 (128px)
                    objectFit: 'contain' // Maintains aspect ratio within fixed dimensions
                  }}
                  src={companyLogo}
                />
              </View>
            )}
            
            {/* Company Name */}
            <Text style={{ 
              fontSize: 32, 
              fontWeight: 'bold', 
              marginBottom: 10,
              color: '#000',
              textAlign: 'center',
              letterSpacing: 1
            }}>
              {companyName}
            </Text>
            
            {/* Company Address */}
            <Text style={{ 
              fontSize: 16, 
              marginBottom: 6,
              color: '#000',
              textAlign: 'center'
            }}>
              {companyAddress}
            </Text>
            
            {/* Contact */}
            <Text style={{ 
              fontSize: 16, 
              marginBottom: 0,
              color: '#000',
              textAlign: 'center'
            }}>
              Contact: {contactNo}
            </Text>
          </View>

          {/* Middle Content */}
          <View style={{ 
            alignItems: 'center', 
            textAlign: 'center',
            width: '100%',
            flex: 1,
            justifyContent: 'center'
          }}>
            {/* ESTIMATE Title in Box */}
            <View style={{
              border: '2pt solid #000',
              padding: '12 40',
              marginBottom: 40,
              alignSelf: 'center'
            }}>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: 'bold',
                color: '#0066cc',
                textAlign: 'center'
              }}>
                ESTIMATE
              </Text>
            </View>

            {/* Work Details */}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 20,
                color: '#cc0000',
                textAlign: 'center'
              }}>
                NAME OF WORK
              </Text>
              
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 12,
                color: '#cc0000',
                textAlign: 'center'
              }}>
                {workName}
              </Text>
              
              <Text style={{ 
                fontSize: 16, 
                marginBottom: 8,
                color: '#cc0000',
                textAlign: 'center'
              }}>
                FOR
              </Text>
              
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: '#cc0000',
                textAlign: 'center'
              }}>
                {clientName}
              </Text>
            </View>

            {/* Property Details */}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'center'
              }}>
                PROPERTY NO {propertyNo}, {propertyAddress}
              </Text>
            </View>

            {/* Estimate Cost */}
            <View style={{ marginBottom: 30, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: '#000',
                textAlign: 'center'
              }}>
                ESTIMATE COST : Rs. {typeof estimateCost === 'number' ? 
                  estimateCost.toLocaleString('en-IN', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : '0.00'}
              </Text>
            </View>

            {/* SOR Details */}
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 14,
                color: '#666',
                textAlign: 'center'
              }}>
                ADOPTED SOR OF {ssr || `SSR ${sorYear}`}
              </Text>
            </View>
          </View>

          {/* Prepared By - Bottom */}
          <View style={{ 
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            marginTop: 20
          }}>
            <Text style={{ 
              fontSize: 14,
              color: '#000',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              Prepared By: {preparedBy}
            </Text>
          </View>
          
        </View>
        </View>
      </Page>
    );

    // Always use the simple centered cover page - no complex component
    const CoverPageDocument = () => (
      <Document>
        <SimpleCoverPagePDF {...coverPageProps} />
      </Document>
    );
    
    const blob = await pdf(<CoverPageDocument />).toBlob();
    
    if (!blob || blob.size === 0) {
      throw new Error('Generated PDF blob is empty');
    }
    
    console.log(`Cover page PDF generated successfully (${blob.size} bytes) with estimate cost: ${estimateCost}`);
    return blob;
    
  } catch (error) {
    console.error("Error generating cover page:", error);
    
    // Ultimate fallback - create a blank page
    try {
      const { Document, Page, pdf } = require('@react-pdf/renderer');
      const React = require('react');
      
      const BlankFallbackDocument = () => {
        return React.createElement(Document, null,
          React.createElement(Page, { 
            size: "A4", 
            style: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' } 
          },
            React.createElement('div', { style: { height: '100%', width: '100%' } })
          )
        );
      };
      
      return await pdf(React.createElement(BlankFallbackDocument)).toBlob();
    } catch (fallbackError) {
      console.error("Blank page generation also failed:", fallbackError);
      throw new Error(`Cover page generation failed: ${fallbackError.message}`);
    }
  }
};
const handleStepperClick = (stepId) => {
  if (stepId < currentStep) {
    setCurrentStep(stepId); // Go back freely
    toast.info("Going back to previous step");
  } else {
    handleNextStep(stepId); // Apply forward step validation
  }
};

// Updated handlePrevStep function with data refresh
const handlePrevStep = (step) => {
  setCurrentStep(step);
  toast.info("Going back to previous step");
  
  // Refresh data when going back to ensure latest items are loaded
  if (step === 7) { // If coming back to PDF generation step
    refreshAllData();
  }
};

  const prepareAbstractData = async () => {
  try {
    let itemsToProcess = [];
    
    // First, try to get latest items from subRecordCache
    const subRecordCache = localStorage.getItem('subRecordCache');
    if (subRecordCache) {
      try {
        const cachedItems = JSON.parse(subRecordCache);
        if (Array.isArray(cachedItems)) {
          itemsToProcess = cachedItems;
        } else if (typeof cachedItems === 'object') {
          itemsToProcess = Object.values(cachedItems).flat();
        }
      } catch (parseErr) {
        console.error("Error parsing subRecordCache in prepareAbstractData:", parseErr);
      }
    }
    
    // Fallback to items state if cache is empty
    if (itemsToProcess.length === 0) {
      if (Array.isArray(items)) {
        itemsToProcess = items;
      } else if (typeof items === 'object' && items !== null) {
        const allSubworkIds = Object.keys(items);
        itemsToProcess = allSubworkIds.flatMap(subworkId => items[subworkId] || []);
      }
    }
    
    if (itemsToProcess.length === 0) {
      throw new Error("No items found to generate abstract");
    }
    
    console.log(`Preparing abstract data for ${itemsToProcess.length} items`);
    
    const processedItems = await Promise.all(
      itemsToProcess.map(async (item) => {
        let measurements = item.measurements;
        
        if (!measurements || !Array.isArray(measurements)) {
          try {
            measurements = await fetchMeasurements(item.id);
          } catch (err) {
            console.error(`Error fetching measurements for item ${item.id}:`, err);
            measurements = [];
          }
        }
        
        const quantity = Array.isArray(measurements) 
          ? measurements.reduce((sum, m) => sum + parseFloat(m.quantity || 0), 0) 
          : 0;
        
        return { 
          ...item, 
          id: item.id || Math.random().toString(36).substr(2, 9),
          itemNo: item.itemNo || item.itemNumber || 'N/A',
          descriptionOfItem: item.descriptionOfItem || item.description || 'No description',
          unit: item.unit || 'Nos',
          smallUnit: item.smallUnit || item.unit || 'Nos', // Ensure smallUnit is available
          labourRate: item.labourRate || item.rate || 0,
          measurements: Array.isArray(measurements) ? measurements : [],
          quantity: quantity,
          amount: quantity * (parseFloat(item.labourRate || item.rate) || 0)
        };
      })
    );
    
    setAbstractItems(processedItems);
    localStorage.setItem("abstractItems", JSON.stringify(processedItems));
    
    // Update work info in localStorage
    localStorage.setItem("abstractWorkName", workInfo.nameOfWork);
    localStorage.setItem("abstractWorkOrderId", workInfo.workOrderId);
    localStorage.setItem("abstractArea", workInfo.area || "900");
    localStorage.setItem("abstractSSR", workInfo.ssr || "");
    
    console.log(`Abstract data prepared for ${processedItems.length} items`);
    
    return processedItems;
  } catch (error) {
    console.error("Error preparing abstract data:", error);
    throw error;
  }
};
const handleScheduleBComponentToggle = (component) => {
  setSelectedScheduleBComponents(prev => ({
    ...prev,
    [component]: !prev[component]
  }));
};
const generateScheduleBPDF = async () => {
  try {
    console.log('Generating Schedule B PDF...');
    // Add your PDF generation logic here
    // This should be similar to your existing PDF generation functions
  } catch (error) {
    console.error('Error generating Schedule B PDF:', error);
  }
};

  // Auto-prepare data when components are selected
useEffect(() => {
  const prepareData = async () => {
    if (items.length > 0) {
      try {
        // Bank Estimate auto-prepare data
        if (selectedComponents.abstract) {
          await prepareAbstractData();
        }
        
        if (selectedComponents.coverPage && !constructionEstimate) {
          await ensureCoverPageData();
        }
        
        if (selectedComponents.componentPage) {
          await loadMeasurementData();
        }
         
        if (selectedComponents.materialPage) {
          console.log('Auto-preparing material summary data for Bank Estimate...');
          await loadMaterialSummaryDataForBankEstimate();
        }

        // MTS auto-prepare data
        if (selectedMTSComponents.componentPage) {
          await loadMeasurementData();
        }
        
        if (selectedMTSComponents.materialPage) {
          console.log('Auto-preparing material summary data for MTS...');
          await loadMaterialSummaryData();
        }
          if (selectedScheduleBComponents.schedule) {
          console.log('Auto-preparing data for Schedule B...');
          await prepareScheduleBData();
        }
        
      } catch (error) {
        console.error('Error in auto-prepare data:', error);
      }
    }
  };

  prepareData();
}, [selectedComponents, selectedMTSComponents, selectedScheduleBComponents,items, currentStep]);
const renderBankEstimateContent = () => {
  
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading measurement data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-red-600 mb-4">
                        <X className="mx-auto mb-2" size={32} />
                        <p className="font-medium">{error}</p>
                    </div>
                    <button 
                        onClick={fetchItems} 
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Get selected components for navigation
    const selectedComponentsList = [
       
        { key: 'abstract', label: 'Abstract', icon: FileText, color: 'orange' },
         { key: 'coverPage', label: 'Cover Page', icon: FileCheck, color: 'orange' },
        { key: 'componentPage', label: 'Material Component', icon: FileCheck, color: 'orange' },
        { key: 'materialPage', label: 'Material Summary', icon: FileCheck, color: 'orange' }
    ].filter(comp => selectedComponents[comp.key]);

    // Get current active component index
    const currentIndex = selectedComponentsList.findIndex(comp => comp.key === activeComponent);
    const canGoPrevious = currentIndex > 0;
    const canGoNext = currentIndex < selectedComponentsList.length - 1;
    
    // Navigation functions
    const goToPrevious = () => {
        if (canGoPrevious) {
            setActiveComponent(selectedComponentsList[currentIndex - 1].key);
        }
    };
    
    const goToNext = () => {
        if (canGoNext) {
            setActiveComponent(selectedComponentsList[currentIndex + 1].key);
        }
    };

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'coverPage':
                return <CoverPageGenerator />;
            case 'abstract':
                return <ConstructionEstimateComponent />;
            case 'componentPage':
                return <MeasurementComponent />;
            case 'materialPage':
                return <MaterialSummaryComponent />;
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-gray-600">Select a component from the navigation to view its preview.</p>
                    </div>
                );
        }
    };

    const getComponentTitle = () => {
        const componentTitles = {
            'coverPage': 'Cover Page Preview',
            'abstract': 'Abstract Preview',
            'componentPage': 'Material Component Preview',
            'materialPage': 'Material Summary Preview'
        };
        return componentTitles[activeComponent] || 'Component Preview';
    };

    const getComponentGradient = () => {
        const gradients = {
            'coverPage': 'from-orange-50 to-orange-50 border-orange-200',
            'abstract': 'from-orange-50 to-orange-50 border-orange-200',
            'componentPage': 'from-orange-50 to-emerald-50 border-orange-200',
            'materialPage': 'from-orange-50 to-teal-50 border-orange-200'
        };
        return gradients[activeComponent] || 'from-gray-50 to-gray-100 border-gray-200';
    };

    return (
        <div className="space-y-8">
            {/* Component Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cover Page Card */}
                <div 
                    className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedComponents.coverPage 
                            ? 'border-orange-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                    onClick={() => handleComponentToggle('coverPage')}
                >
                    <div className="p-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-md ${selectedComponents.coverPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
                                    <FileCheck className={`${selectedComponents.coverPage ? 'text-white' : 'text-gray-600'}`} size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Cover Page</h3>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                selectedComponents.coverPage ? 'bg-orange-500' : 'bg-gray-300'
                            }`}>
                                {selectedComponents.coverPage && <Check size={14} className="text-white" />}
                            </div>
                        </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Company information</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Project details</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Cost estimate</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                    
                    {selectedComponents.coverPage && (
                        <div className="absolute top-1 right-1">
                            <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        </div>
                    )}
                </div>

                {/* Abstract Card */}
                <div 
                    className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedComponents.abstract 
                            ? 'border-orange-500 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                    onClick={() => handleComponentToggle('abstract')}
                >
                    <div className="p-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-md ${selectedComponents.abstract ? 'bg-orange-500' : 'bg-gray-100'}`}>
                                    <FileText className={`${selectedComponents.abstract ? 'text-white' : 'text-gray-600'}`} size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Abstract</h3>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                selectedComponents.abstract ? 'bg-orange-500' : 'bg-gray-300'
                            }`}>
                                {selectedComponents.abstract && <Check size={14} className="text-white" />}
                            </div>
                        </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Item-wise costs</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Quantity analysis</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Total estimation</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                    
                    {selectedComponents.abstract && (
                        <div className="absolute top-1 right-1">
                            <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        </div>
                    )}
                </div>

                {/* Component Page Card */}
                <div 
                    className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedComponents.componentPage 
                            ? 'border-orange-500 bg-green-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                    onClick={() => handleComponentToggle('componentPage')}
                >
                    <div className="p-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-md ${selectedComponents.componentPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
                                    <FileCheck className={`${selectedComponents.componentPage ? 'text-white' : 'text-gray-600'}`} size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Material Component Page</h3>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                selectedComponents.componentPage ? 'bg-orange-500' : 'bg-gray-300'
                            }`}>
                                {selectedComponents.componentPage && <Check size={14} className="text-white" />}
                            </div>
                        </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Measurement details</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Component breakdown</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Technical specifications</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                    
                    {selectedComponents.componentPage && (
                        <div className="absolute top-1 right-1">
                            <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        </div>
                    )}
                </div>

                {/* Material Summary Page Card */}
                <div 
                    className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                        selectedComponents.materialPage
                            ? 'border-orange-500 bg-green-50 shadow-lg' 
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                    onClick={() => handleComponentToggle('materialPage')}
                >
                    <div className="p-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div className={`p-2 rounded-md ${selectedComponents.materialPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
                                    <FileCheck className={`${selectedComponents.materialPage ? 'text-white' : 'text-gray-600'}`} size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Material Summary Page</h3>
                                </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                selectedComponents.materialPage ? 'bg-orange-500' : 'bg-gray-300'
                            }`}>
                                {selectedComponents.materialPage && <Check size={14} className="text-white" />}
                            </div>
                        </div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                        <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Material Summary Details</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Component breakdown</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                                    <span>Technical specifications</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                    
                    {selectedComponents.materialPage && (
                        <div className="absolute top-1 right-1">
                            <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                Selected
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation and Preview Section */}
            {selectedComponentsList.length > 0 && (
                <div className="flex gap-6">
                    {/* Left Navigation Bookmark - Collapsible */}
                    <div className="w-16 hover:w-64 flex-shrink-0 transition-all duration-300 group">
                        <div className="sticky top-4">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-fit">
                                {/* Header - Always Visible */}
                                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-4">
                                    <div className="flex items-center">
                                        <Bookmark className="text-white flex-shrink-0" size={20} />
                                        <h3 className="text-white font-semibold text-lg ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                                            Components
                                        </h3>
                                    </div>
                                </div>
                                
                                {/* Navigation Items - Expandable */}
                                <div className="divide-y divide-gray-200">
                                    {selectedComponentsList.map((component) => {
                                        const IconComponent = component.icon;
                                        return (
                                            <button
                                                key={component.key}
                                                onClick={() => setActiveComponent(component.key)}
                                                className={`w-full p-4 text-left transition-all duration-200 flex items-center space-x-3 ${
                                                    activeComponent === component.key
                                                        ? `bg-${component.color}-50 border-r-4 border-${component.color}-500 text-${component.color}-700`
                                                        : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                    activeComponent === component.key
                                                        ? `bg-${component.color}-100`
                                                        : 'bg-gray-100'
                                                }`}>
                                                    <IconComponent 
                                                        size={18} 
                                                        className={
                                                            activeComponent === component.key
                                                                ? `text-${component.color}-600`
                                                                : 'text-gray-600'
                                                        }
                                                    />
                                                </div>
                                                <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="font-medium whitespace-nowrap">{component.label}</div>
                                                    {activeComponent === component.key && (
                                                        <div className="text-xs text-gray-500 mt-1">Currently viewing</div>
                                                    )}
                                                </div>
                                                {activeComponent === component.key && (
                                                    <ChevronRight size={16} className={`text-${component.color}-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                              
                               
                            </div>
                        </div>
                    </div>

                    {/* Main Preview Area */}
                    <div className="flex-1 min-w-0">
                        <div className={`bg-gradient-to-r ${getComponentGradient()} rounded-xl border overflow-hidden`}>
                            <div className="bg-white border-b p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Eye className="text-blue-600" size={20} />
                                        <h3 className="font-semibold text-gray-800">{getComponentTitle()}</h3>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {selectedComponentsList.findIndex(comp => comp.key === activeComponent) + 1} of {selectedComponentsList.length}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {renderActiveComponent()}
                            </div>
                            
                            {/* Navigation Buttons at Bottom of Preview */}
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    {/* Previous Button - Left Side */}
                                    <div className="relative group/nav">
                                        <button
                                            onClick={goToPrevious}
                                            disabled={!canGoPrevious}
                                            className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                                                canGoPrevious 
                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <ChevronLeft size={18} />
                                            <span>Previous</span>
                                        </button>
                                        {/* Previous Tooltip */}
                                        {canGoPrevious && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                                                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                                    {selectedComponentsList[currentIndex - 1]?.label}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Page Indicator - Center */}
                                    <div className="flex items-center px-4 py-3 bg-white border border-gray-200 rounded-lg">
                                        <span className="text-sm text-gray-600">
                                            {currentIndex + 1} of {selectedComponentsList.length}
                                        </span>
                                    </div>
                                    
                                    {/* Next Button - Right Side */}
                                    <div className="relative group/nav">
                                        <button
                                            onClick={goToNext}
                                            disabled={!canGoNext}
                                            className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                                                canGoNext 
                                                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <span>Next</span>
                                            <ChevronRight size={18} />
                                        </button>
                                        {/* Next Tooltip */}
                                        {canGoNext && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover/nav:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                                                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                                    {selectedComponentsList[currentIndex + 1]?.label}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center pt-6">
                <button 
                    onClick={() => setShowBankEstimateConfirmDialog(true)}
                    className="group relative bg-gradient-to-r from-orange-600 to-orange-600 text-white py-4 px-8 rounded-xl hover:from-orange-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    disabled={loading || (!selectedComponents.coverPage && !selectedComponents.abstract && !selectedComponents.componentPage && !selectedComponents.materialPage)}
                >
                    <Download className="mr-3 group-hover:animate-bounce" size={20} />
                    <span className="font-semibold">Generate Bank Estimate PDF</span>
                    <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>

                {/* Bank Estimate Confirmation Dialog */}
                {showBankEstimateConfirmDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Confirm Download
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to generate the Bank Estimate PDF?
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowBankEstimateConfirmDialog(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowBankEstimateConfirmDialog(false);
                                        try {
                                            await generateCombinedPDF();
                                        } catch (error) {
                                            console.error('Bank Estimate PDF generation failed:', error);
                                        }
                                    }}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Yes, Generate
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
const renderMTSContent = () => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading measurement data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <X className="mx-auto mb-2" size={32} />
            <p className="font-medium">{error}</p>
          </div>
          <button 
            onClick={fetchItems} 
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* MTS Component Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         <div 
    className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
      selectedComponents.mtsCoverPage 
        ? 'border-orange-500 bg-blue-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
    }`}
    onClick={() => handleComponentToggle('mtsCoverPage')}
  >
    <div className="p-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-md ${selectedComponents.mtsCoverPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
            <FileText className={`${selectedComponents.mtsCoverPage ? 'text-white' : 'text-gray-600'}`} size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">MTS Cover</h3>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
          selectedComponents.mtsCoverPage ? 'bg-orange-500' : 'bg-gray-300'
        }`}>
          {selectedComponents.mtsCoverPage && <Check size={14} className="text-white" />}
        </div>
      </div>
    </div>
    
    {/* Tooltip */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
      <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
            <span>MTS header information</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
            <span>Work order details</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
            <span>Technical specifications</span>
          </div>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
    
    {selectedComponents.mtsCoverPage && (
      <div className="absolute top-1 right-1">
        <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
          Selected
        </div>
      </div>
    )}
  </div>
        {/* MTS Sheet Card */}
        <div 
          className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
            selectedMTSComponents.mtsSheet 
              ? 'border-orange-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
          }`}
          onClick={() => handleMTSComponentToggle('mtsSheet')}
        >
          <div className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-md ${selectedMTSComponents.mtsSheet ? 'bg-orange-500' : 'bg-gray-100'}`}>
                  <FileText className={`${selectedMTSComponents.mtsSheet ? 'text-white' : 'text-gray-600'}`} size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">MTS Sheet</h3>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                selectedMTSComponents.mtsSheet ? 'bg-orange-500' : 'bg-gray-300'
              }`}>
                {selectedMTSComponents.mtsSheet && <Check size={14} className="text-white" />}
              </div>
            </div>
          </div>
          
          {selectedMTSComponents.mtsSheet && (
            <div className="absolute top-1 right-1">
              <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </div>
            </div>
          )}
        </div>

        {/* Material Component Card */}
        <div 
          className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
            selectedMTSComponents.componentPage 
              ? 'border-orange-500 bg-green-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
          }`}
          onClick={() => handleMTSComponentToggle('componentPage')}
        >
          <div className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-md ${selectedMTSComponents.componentPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
                  <FileCheck className={`${selectedMTSComponents.componentPage ? 'text-white' : 'text-gray-600'}`} size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Material Component</h3>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                selectedMTSComponents.componentPage ? 'bg-orange-500' : 'bg-gray-300'
              }`}>
                {selectedMTSComponents.componentPage && <Check size={14} className="text-white" />}
              </div>
            </div>
          </div>
          
          {selectedMTSComponents.componentPage && (
            <div className="absolute top-1 right-1">
              <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </div>
            </div>
          )}
        </div>

        {/* Material Summary Card */}
        <div 
          className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
            selectedMTSComponents.materialPage 
              ? 'border-orange-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
          }`}
          onClick={() => handleMTSComponentToggle('materialPage')}
        >
          <div className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-md ${selectedMTSComponents.materialPage ? 'bg-orange-500' : 'bg-gray-100'}`}>
                  <FileCheck className={`${selectedMTSComponents.materialPage ? 'text-white' : 'text-gray-600'}`} size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Material Summary</h3>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                selectedMTSComponents.materialPage ? 'bg-orange-500' : 'bg-gray-300'
              }`}>
                {selectedMTSComponents.materialPage && <Check size={14} className="text-white" />}
              </div>
            </div>
          </div>
          
          {selectedMTSComponents.materialPage && (
            <div className="absolute top-1 right-1">
              <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Sections */}
      <div className="space-y-6">
      {selectedComponents.mtsCoverPage && (
  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 overflow-hidden">
    <div className="bg-white border-b border-indigo-200 p-4">
      <div className="flex items-center space-x-2">
        <Eye className="text-blue-600" size={20} />
        <h3 className="font-semibold text-gray-800">MTS Cover Page Preview</h3>
      </div>
    </div>
    <div className="p-6">
      <MTSCoverPageGenerator />
    </div>
  </div>
)}

        {selectedMTSComponents.mtsSheet && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 overflow-hidden">
            <div className="bg-white border-b border-indigo-200 p-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-orange-600" size={20} />
                <h3 className="font-semibold text-gray-800">MTS Sheet Preview</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="h-[600px] rounded-lg overflow-hidden border border-gray-300 bg-white shadow-inner">
                <PDFViewer 
                  width="100%" 
                  height="100%" 
                  style={{ 
                    border: 'none', 
                    borderRadius: '8px',
                    backgroundColor: '#ffffff'
                  }}
                  showToolbar={false}
                >
                  <Document>
                    <MeasurementPDF 
                      workOrderId={workInfo.workOrderId} 
                      nameOfWork={workInfo.nameOfWork} 
                      items={items} 
                      signatures={signatures}
                      showWatermark={true}
                    />
                  </Document>
                </PDFViewer>
              </div>
            </div>
          </div>
        )}

        {selectedMTSComponents.componentPage && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 overflow-hidden">
            <div className="bg-white border-b border-green-200 p-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-orange-600" size={20} />
                <h3 className="font-semibold text-gray-800">Material Component Preview</h3>
              </div>
            </div>
            <div className="p-6">
              <MeasurementComponent />
            </div>
          </div>
        )}

        {selectedMTSComponents.materialPage && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden">
            <div className="bg-white border-b border-purple-200 p-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-orange-600" size={20} />
                <h3 className="font-semibold text-gray-800">Material Summary Preview</h3>
              </div>
            </div>
            <div className="p-6">
              <MaterialSummaryComponent />
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => setShowConfirmDialog(true)}
          className="group relative bg-gradient-to-r from-orange-600 to-orange-600 text-white py-4 px-8 rounded-xl hover:from-orange-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          disabled={loading || (!selectedMTSComponents.mtsSheet && !selectedMTSComponents.componentPage && !selectedMTSComponents.materialPage)}
        >
          <Download className="mr-3 group-hover:animate-bounce" size={20} />
          <span className="font-semibold">Generate MTS PDF</span>
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>
      </div>

      {/* MTS Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Download
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to generate the MTS PDF?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmDialog(false);
                  await generateMTSCombinedPDF();
                  window.location.href = '/mywork';
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const renderScheduleBContent = () => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Schedule B data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <X className="mx-auto mb-2" size={32} />
            <p className="font-medium">{error}</p>
          </div>
          <button 
            onClick={fetchItems} 
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Schedule B Component Selection Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          className={`group relative overflow-visible rounded-lg border-2 transition-all duration-300 cursor-pointer ${
            selectedScheduleBComponents.schedule 
              ? 'border-blue-500 bg-blue-50 shadow-lg' 
              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
          }`}
          onClick={() => handleScheduleBComponentToggle('schedule')}
        >
          <div className="p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-md ${selectedScheduleBComponents.schedule ? 'bg-blue-500' : 'bg-gray-100'}`}>
                  <FileText className={`${selectedScheduleBComponents.schedule ? 'text-white' : 'text-gray-600'}`} size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Schedule B</h3>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                selectedScheduleBComponents.schedule ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                {selectedScheduleBComponents.schedule && <Check size={14} className="text-white" />}
              </div>
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
            <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl min-w-max">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>Rate analysis schedule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>Item descriptions & rates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span>Work portion totals</span>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          
          {selectedScheduleBComponents.schedule && (
            <div className="absolute top-1 right-1">
              <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                Selected
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        {selectedScheduleBComponents.schedule && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
            <div className="bg-white border-b border-blue-200 p-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-800">Schedule B Preview</h3>
              </div>
            </div>
            <div className="p-6">
              <ScheduleB />
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => setShowScheduleBConfirmDialog(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-blue-600 text-white py-4 px-8 rounded-xl hover:from-blue-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-base shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          disabled={loading || !selectedScheduleBComponents.schedule}
        >
          <Download className="mr-3 group-hover:animate-bounce" size={20} />
          <span className="font-semibold">Generate Schedule B PDF</span>
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </button>
      </div>

      {/* Schedule B Confirmation Dialog */}
      {showScheduleBConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Download
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to generate the Schedule B PDF?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowScheduleBConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowScheduleBConfirmDialog(false);
                  await generateScheduleBPDF();
                  window.location.href = '/mywork';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes, Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <StepperPage
            currentStep={currentStep}
            onStepClick={handleStepperClick}
          />
        </div>
      </div>

      {/* Document Type Selector */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Document Type</h2>
          <div className="flex flex-wrap gap-4">
            {documentOptions.map((option) => {
              const IconComponent = option.icon;
              const isMTS = option.value === 'mts'; // Check if this is MTS option
              const isDisabled = isMTS; // Disable MTS button
              
              return (
                <div key={option.value} className="relative group">
                  <button
                    onClick={() => !isDisabled && setSelectedDocument(option.value)}
                    disabled={isDisabled}
                    className={`flex items-center space-x-3 px-6 py-4 rounded-lg border-2 transition-all duration-300 ${
                      isDisabled
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                        : selectedDocument === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <IconComponent size={24} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                  
                  {/* Tooltip for disabled MTS button */}
                  {isDisabled && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Coming Soon
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-lg p-8">
  {selectedDocument === 'bankEstimate' 
    ? renderBankEstimateContent() 
    : selectedDocument === 'scheduleB'
    ? renderScheduleBContent()
    : renderMTSContent()
  }      </div>
    </div>
  </div>
);
};

export default BackEstimate;
