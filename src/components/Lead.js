import React, { useState, useRef, useEffect } from 'react';

import { Search, Plus, Edit, Trash2, MapPin, Calculator, AlertCircle, ChevronLeft, ChevronRight, X, Save, Square, Circle, Type, Minus, MousePointer, Move, RotateCcw, RotateCw, Grid, Eye, Loader,  Check,ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import StepperPage from './Stepper';
import toast, { Toaster } from 'react-hot-toast';
import { Download, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const LeadChargesManagement = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState('pointer');
  const [currentPath, setCurrentPath] = useState([]);
  const [drawings, setDrawings] = useState([]);
   const [items, setItems] = useState({});
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
const [showSignatureModal, setShowSignatureModal] = useState(false);
const [signatures, setSignatures] = useState({ preparedBy: '', checkedBy: '' });
  // Lead data state
  const [leadData, setLeadData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   const navigate = useNavigate();
const [availableMaterials, setAvailableMaterials] = useState([]); // For dropdown
const [workOrderId, setWorkOrderId] = useState(null);
const [reviseId, setReviseId] = useState(null);
const [savingRows, setSavingRows] = useState(new Set());
  const [workName, setWorkName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showQueryChart, setShowQueryChart] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [locationMappings, setLocationMappings] = useState(new Map());
const [editingRowId, setEditingRowId] = useState(null);
const [updatingRows, setUpdatingRows] = useState(new Set());
const [pan, setPan] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
const [showAllMaterials, setShowAllMaterials] = useState(false);
const [doubleClickTimer, setDoubleClickTimer] = useState(null);
  const jwtToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const currentStep = 3;
 const totalItems = leadData.length;
  const tools = [
    // { id: 'pointer', icon: MousePointer, label: 'Select' },
    // { id: 'pen', icon: Edit, label: 'Pen' },
    // { id: 'line', icon: Minus, label: 'Line' },
    // { id: 'rectangle', icon: Square, label: 'Rectangle' },
    // { id: 'circle', icon: Circle, label: 'Circle' },
    // { id: 'text', icon: Type, label: 'Text' },
    { id: 'move', icon: Move, label: 'Move' }
  ];

  // Load work name from localStorage
  const loadWorkName = () => {
    const storedWorkName = localStorage.getItem('nameOfWork');
    if (storedWorkName) {
      setWorkName(storedWorkName);
    }
  };
const loadWorkOrderDetails = () => {
  const storedWorkOrderId = localStorage.getItem('workOrderId') || 
                     localStorage.getItem('workorderId') || 
                     localStorage.getItem('workOrderID') || 
                     localStorage.getItem('workorder_id');
  const storedReviseId = localStorage.getItem('reviseId') || 
                  localStorage.getItem('revisionId');
  
  if (storedWorkOrderId) {
    setWorkOrderId(parseInt(storedWorkOrderId));
  }
  if (storedReviseId) {
    setReviseId(parseInt(storedReviseId));
  }
};
const loadSignatures = () => {
  try {
    const storedSignatures = localStorage.getItem('pdfSignatures');
    if (storedSignatures) {
      const parsedSignatures = JSON.parse(storedSignatures);
      setSignatures(parsedSignatures);
    }
  } catch (error) {
    console.error('Error loading signatures:', error);
  }
};

const saveSignatures = (newSignatures) => {
  try {
    localStorage.setItem('pdfSignatures', JSON.stringify(newSignatures));
    setSignatures(newSignatures);
    addNotification('Signatures saved successfully', 'success');
  } catch (error) {
    console.error('Error saving signatures:', error);
    addNotification('Failed to save signatures', 'error');
  }
};

const handleSignatureSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newSignatures = {
    preparedBy: formData.get('preparedBy').trim(),
    checkedBy: formData.get('checkedBy').trim()
  };
  saveSignatures(newSignatures);
  setShowSignatureModal(false);
};
useEffect(() => {
  loadSignatures();
}, []);
const fetchMaterialsForDropdown = async () => {
  if (!jwtToken) {
    console.warn('No JWT token available');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/materials`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const materialsData = await response.json();
      return materialsData.map(material => ({
        id: material.materialId,
        name: material.materialName,
        leadFactor: material.leadFactor || 0,
        leadType: material.leadType || '',
        royalty: material.royalty || '',
        ssrRate: material.masterSsr?.ssrName || 0,
        unit: 'Per Cu.M.' // Default unit
      }));
    } else {
      console.error('Failed to fetch materials:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};
  // Get material details by ID
  const getMaterialById = async (materialId) => {
    if (!jwtToken || !materialId) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/materials/${materialId}`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const materialData = await response.json();
        return materialData;
      } else {
        console.warn(`Failed to fetch material ${materialId}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching material ${materialId}:`, error);
      return null;
    }
  };

  // Get lead charges from C1 Lead API
  const getLeadCharges = async (distance, leadType) => {
    if (!jwtToken || !distance || !leadType) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/masterc1lead/getC1LeadByDistAndType?distance=${distance}&leadType=${encodeURIComponent(leadType)}`,
        {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Accept": "application/json"
          }
        }
      );

      if (response.ok) {
        const leadChargesData = await response.json();
        return Array.isArray(leadChargesData) && leadChargesData.length > 0 ? leadChargesData[0] : null;
      } else {
        console.warn(`Failed to fetch lead charges for distance ${distance} and type ${leadType}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching lead charges:`, error);
      return null;
    }
  };

  // Get materials from consumption data
  
const getMaterialsFromConsumption = async () => {
  if (!jwtToken) {
    console.warn('No JWT token available');
    return [];
  }

  try {
    console.log('Loading materials from transaction item properties (split-aware)...');
    
    // Get all transaction items from cache
    const storedItems = localStorage.getItem("subRecordCache");
    if (!storedItems) {
      console.log('No sub record cache found');
      return [];
    }

    const itemsObject = JSON.parse(storedItems);
    const allItems = Object.values(itemsObject).flat();
    
    const materialsWithDetails = [];
    const processedMaterials = new Map(); // Track by material name to avoid duplicates
    
    // For each item, fetch its actual transaction item properties (which include split materials)
    for (const item of allItems) {
      try {
        const itemId = item.id;
        if (!itemId) continue;

        // Fetch current transaction item properties (these will include split materials)
        const propertiesResponse = await fetch(
          `${API_BASE_URL}/api/txn-item-properties/serchByTxnItemId/${itemId}`,
          {
            headers: {
              "Authorization": `Bearer ${jwtToken}`,
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }
        );

        if (propertiesResponse.ok) {
          const properties = await propertiesResponse.json();
          
          if (Array.isArray(properties) && properties.length > 0) {
            console.log(`Found ${properties.length} properties for item ${item.itemNo}`);
            
            for (const property of properties) {
              const materialName = property.material?.trim();
              if (!materialName) continue;

              // Check if we already processed this material name
              if (processedMaterials.has(materialName.toLowerCase())) {
                console.log(`Skipping duplicate material: ${materialName}`);
                continue;
              }

              // Try to get additional material details from the materials API
              let materialDetails = null;
              let ssrRate = 0;

              // Try to find material details by name (since split materials might not have direct material IDs)
              try {
                const materialsResponse = await fetch(`${API_BASE_URL}/api/materials`, {
                  headers: {
                    "Authorization": `Bearer ${jwtToken}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                  }
                });

                if (materialsResponse.ok) {
                  const allMaterials = await materialsResponse.json();
                  materialDetails = allMaterials.find(mat => 
                    mat.materialName?.toLowerCase().trim() === materialName.toLowerCase()
                  );
                }
              } catch (materialError) {
                console.warn(`Error fetching material details for ${materialName}:`, materialError);
              }

              // Get SSR rate if detailed item ID exists
              if (item.detailedItemId || property.fkDetailedItemId) {
                const detailedItemId = item.detailedItemId || property.fkDetailedItemId;
                try {
                  ssrRate = await getSSRRateByDetailedItemId(detailedItemId);
                } catch (ssrError) {
                  console.warn(`Error fetching SSR rate for detailed item ${detailedItemId}:`, ssrError);
                }
              }

              const materialInfo = {
                id: materialDetails?.materialId || `property-${property.id}`,
                name: materialName,
                unit: property.materialUnit || materialDetails?.unit || 'Unit',
                leadFactor: materialDetails?.leadFactor || 0,
                leadType: materialDetails?.leadType || 'MACHINE',
                royalty: materialDetails?.royalty || '',
                constant: property.materialConstant || 0,
                propertyId: property.id,
                txnItemId: property.txnItemId,
                ssrRate: ssrRate || 0,
                sourceItemNo: item.itemNo
              };

              processedMaterials.set(materialName.toLowerCase(), materialInfo);
              materialsWithDetails.push(materialInfo);
              
              console.log(`Added material from properties: ${materialName} (Property ID: ${property.id})`);
            }
          }
        } else {
          console.warn(`Failed to fetch properties for item ${itemId}:`, propertiesResponse.status);
        }
      } catch (itemError) {
        console.warn(`Error processing item ${item.itemNo}:`, itemError);
      }
    }

    console.log(`Successfully processed ${materialsWithDetails.length} materials from transaction item properties`);
    return materialsWithDetails;

  } catch (error) {
    console.error('Error getting materials from transaction item properties:', error);
    return [];
  }
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
  const getSSRRateByDetailedItemId = async (detailedItemId) => {
    if (!jwtToken || !detailedItemId) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/master/detailedItems/${detailedItemId}`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const detailedItemData = await response.json();
        return detailedItemData.completedRate || 0;
      } else {
        console.warn(`Failed to fetch detailed item ${detailedItemId}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching detailed item ${detailedItemId}:`, error);
      return null;
    }
  };
  const navigateToRoyalty = async () => {
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

  // toast.success("Preparing royalty data...");
  navigate("/royalty");
};
 const downloadLeadPDF = async () => {
  try {
    // Import React PDF components
    const { Document, Page, Text, View, StyleSheet, Font, pdf, Image } = await import('@react-pdf/renderer');
    
    // Register fonts for PDF
    Font.register({
      family: 'Helvetica',
      src: 'https://fonts.gstatic.com/s/helvetica/v1/helvetica-regular.woff2',
    });

    // Configuration constants for A4 portrait
    const ROWS_PER_PAGE = 25;
    const FONT_SIZE = 10;
    const HEADER_FONT_SIZE = 12;
    const TITLE_FONT_SIZE = 16;

    // Get signatures from localStorage
    const getSignatures = () => {
      try {
        const preparedBySignature = localStorage.getItem('preparedBySignature');
        const checkedBySignature = localStorage.getItem('checkedBySignature');
        
        return {
          preparedBy: preparedBySignature || '',
          checkedBy: checkedBySignature || ''
        };
      } catch (error) {
        console.error('Error loading signatures:', error);
        return { preparedBy: '', checkedBy: '' };
      }
    };

    const signatures = getSignatures();

    // PDF Styles with enhanced chart styles
    const styles = StyleSheet.create({
      page: {
        fontFamily: 'Helvetica',
        fontSize: FONT_SIZE,
        padding: 30,
        backgroundColor: '#FFFFFF',
        lineHeight: 1.2,
      },
      header: {
        textAlign: 'center',
        marginBottom: 25,
      },
      title: {
        fontSize: TITLE_FONT_SIZE,
        fontWeight: 'bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        lineHeight: 1.3,
      },
      subtitle: {
        fontSize: HEADER_FONT_SIZE + 2,
        fontWeight: 'bold',
        marginBottom: 15,
        lineHeight: 1.3,
      },
      continuationNote: {
        fontSize: FONT_SIZE - 1,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
      },
      table: {
        display: 'table',
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        borderStyle: 'solid',
        marginBottom: 20,
      },
      tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        minHeight: 25,
      },
      tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        minHeight: 35,
      },
      tableCell: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderRightStyle: 'solid',
        textAlign: 'center',
        fontSize: FONT_SIZE - 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 25,
      },
      tableCellLeft: {
        padding: 4,
        borderRightWidth: 1,
        borderRightColor: '#000',
        borderRightStyle: 'solid',
        textAlign: 'left',
        fontSize: FONT_SIZE - 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        minHeight: 25,
      },
      // Column widths
      srNoCell: { width: '8%' },
      materialCell: { width: '26%' },
      typeCell: { width: '12%' },
      locationCell: { width: '20%' },
      leadKmCell: { width: '10%' },
      leadChargesCell: { width: '12%' },
      
      headerCell: {
        fontSize: FONT_SIZE,
        fontWeight: 'bold',
        padding: 6,
        lineHeight: 1.1,
      },
      materialNameText: {
        fontSize: FONT_SIZE - 1,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        lineHeight: 1.2,
      },
      quantityText: {
        fontSize: FONT_SIZE - 1,
        textAlign: 'center',
      },
      signaturesSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 40,
        paddingTop: 20,
      },
      signature: {
        width: '40%',
        textAlign: 'center',
        alignItems: 'center',
      },
      signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        height: 50,
        width: '100%',
        marginBottom: 10,
      },
      signatureLabel: {
        fontSize: FONT_SIZE + 2,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
      },
      signatureName: {
        fontSize: FONT_SIZE,
        textAlign: 'center',
        marginTop: 3,
        fontWeight: 'normal',
      },
      pageNumber: {
        position: 'absolute',
        bottom: 15,
        right: 30,
        fontSize: FONT_SIZE - 2,
        color: '#666',
      },
      emptyMessage: {
        width: '100%',
        textAlign: 'center',
        padding: 30,
        fontSize: FONT_SIZE + 2,
        color: '#666',
        fontStyle: 'italic',
      },
      // ENHANCED chart page styles for better visibility
      chartPage: {
        fontFamily: 'Helvetica',
        fontSize: FONT_SIZE,
        padding: 20,
        backgroundColor: '#FFFFFF',
        lineHeight: 1.2,
        alignItems: 'center',
      },
      chartContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 5,
        backgroundColor: '#ffffff',
      },
      chartDescription: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        border: '1px solid #e2e8f0',
        marginHorizontal: 10,
      },
      chartDescriptionText: {
        fontSize: 12,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 1.4,
      }
    });

    // Function to create high-quality chart image specifically for PDF
    const createHighQualityChartForPDF = () => {
      if (!canvasRef.current) return null;
      
      try {
        // Create a much higher resolution canvas for PDF
        const originalCanvas = canvasRef.current;
        const pdfCanvas = document.createElement('canvas');
        const pdfCtx = pdfCanvas.getContext('2d');
        
        // Use very high scaling factor for crisp PDF rendering
        const scaleFactor = 4;
        pdfCanvas.width = originalCanvas.width * scaleFactor;
        pdfCanvas.height = originalCanvas.height * scaleFactor;
        
        // Set high-quality rendering options
        pdfCtx.imageSmoothingEnabled = true;
        pdfCtx.imageSmoothingQuality = 'high';
        pdfCtx.textRenderingOptimization = 'optimizeQuality';
        
        // Fill with white background
        pdfCtx.fillStyle = '#ffffff';
        pdfCtx.fillRect(0, 0, pdfCanvas.width, pdfCanvas.height);
        
        // Scale and draw the original canvas
        pdfCtx.scale(scaleFactor, scaleFactor);
        pdfCtx.drawImage(originalCanvas, 0, 0);
        
        return pdfCanvas.toDataURL('image/png', 1.0);
        
      } catch (error) {
        console.error('Error creating high-quality chart for PDF:', error);
        
        // Fallback: try with original canvas
        try {
          const originalCanvas = canvasRef.current;
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          
          // Even the fallback uses 2x scaling
          tempCanvas.width = originalCanvas.width * 2;
          tempCanvas.height = originalCanvas.height * 2;
          
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          tempCtx.scale(2, 2);
          tempCtx.imageSmoothingEnabled = true;
          tempCtx.imageSmoothingQuality = 'high';
          tempCtx.drawImage(originalCanvas, 0, 0);
          
          return tempCanvas.toDataURL('image/png', 1.0);
        } catch (fallbackError) {
          console.error('Fallback chart creation failed:', fallbackError);
          return null;
        }
      }
    };

    // Filter and prepare data
    const validLeadData = leadData.filter(item => 
      item.materialName && 
      item.source && 
      item.leadInKm > 0
    );

    const leadDataWithSequentialSrNo = validLeadData.map((item, index) => ({
      ...item,
      sequentialSrNo: index + 1
    }));

    const splitDataIntoPages = (data) => {
      const pages = [];
      for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
        pages.push(data.slice(i, i + ROWS_PER_PAGE));
      }
      return pages.length > 0 ? pages : [[]];
    };

    const leadPages = splitDataIntoPages(leadDataWithSequentialSrNo);
    const totalPages = Math.max(leadPages.length, 1);
    const totalPagesWithChart = totalPages + 1;

    // Lead Chart PDF Component
    const LeadChartPDF = () => {
      
      // Render table pages (keep existing table rendering logic)
      const renderTablePage = (pageIndex) => {
        const currentLeadData = leadPages[pageIndex] || [];
        const isLastPage = pageIndex === totalPages - 1;
        
        return (
          <Page key={`table-${pageIndex}`} size="A4" orientation="portrait" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                NAME OF WORK- {workName ? workName.toUpperCase() : 'CONSTRUCTION WORK'}
              </Text>
              <Text style={styles.subtitle}>
                LEAD CHART
              </Text>
              {totalPages > 1 && (
                <Text style={styles.continuationNote}>
                  Page {pageIndex + 1} of {totalPagesWithChart}
                  {pageIndex > 0 && ' (Continued)'}
                </Text>
              )}
            </View>

            {/* Table */}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCell, styles.headerCell, styles.srNoCell]}>
                  <Text>SR.</Text>
                  <Text>NO.</Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell, styles.materialCell]}>
                  <Text>MATERIAL</Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell, styles.typeCell]}>
                  <Text>TYPE OF</Text>
                  <Text>MATERIAL</Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell, styles.locationCell]}>
                  <Text>LOCATION OF</Text>
                  <Text>QUARRY</Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell, styles.leadKmCell]}>
                  <Text>LEAD</Text>
                  <Text>IN KM.</Text>
                </View>
                <View style={[styles.tableCell, styles.headerCell, styles.leadChargesCell, { borderRightWidth: 0 }]}>
                  <Text>LEAD</Text>
                  <Text>CHARGES</Text>
                </View>
              </View>

              {/* Table Body */}
              {currentLeadData.length > 0 ? (
                currentLeadData.map((item) => (
                  <View key={`lead-${item.id}`} style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.srNoCell]}>
                      <Text>{item.sequentialSrNo}</Text>
                    </View>
                    <View style={[styles.tableCellLeft, styles.materialCell]}>
                      <Text style={styles.materialNameText}>
                        {item.materialName ? item.materialName.toUpperCase() : 'UNKNOWN MATERIAL'}
                      </Text>
                    </View>
                    <View style={[styles.tableCell, styles.typeCell]}>
                      <Text>{item.leadType || 'MACHINE'}</Text>
                    </View>
                    <View style={[styles.tableCellLeft, styles.locationCell]}>
                      <Text>{item.source || '-'}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.leadKmCell]}>
                      <Text>{item.leadInKm ? parseFloat(item.leadInKm).toFixed(2) : '0.00'}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.leadChargesCell, { borderRightWidth: 0 }]}>
                      <Text>{item.leadCharges ? parseFloat(item.leadCharges).toFixed(2) : '0.00'}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.emptyMessage, { borderRightWidth: 0 }]}>
                    <Text>
                      No lead data found. Please ensure materials have source and lead distance configured.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Signatures Section - Only on last page */}
            {isLastPage && (
              <View style={styles.signaturesSection}>
                <View style={styles.signature}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Prepared By</Text>
                  <Text style={styles.signatureName}>
                    {signatures.preparedBy || 'N/A'}
                  </Text>
                </View>
                <View style={styles.signature}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Checked By</Text>
                  <Text style={styles.signatureName}>
                    {signatures.checkedBy || 'N/A'}
                  </Text>
                </View>
              </View>
            )}

            {/* Page Number */}
            <Text style={styles.pageNumber}>
              Page {pageIndex + 1} of {totalPagesWithChart}
            </Text>
          </Page>
        );
      };

      // ENHANCED render query chart page with much better image quality
      const renderQueryChartPage = () => {
        // Get high-quality chart image
        const chartImageData = createHighQualityChartForPDF();

        return (
          <Page key="query-chart" size="A4" orientation="portrait" style={styles.chartPage}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                NAME OF WORK- {workName ? workName.toUpperCase() : 'CONSTRUCTION WORK'}
              </Text>
              <Text style={styles.subtitle}>
                MATERIAL SOURCE QUERY CHART
              </Text>
            </View>

            {/* Chart Container with optimized sizing */}
            <View style={styles.chartContainer}>
              {chartImageData ? (
                <Image
                  src={chartImageData}
                  style={{
                    width: '100%',
                    maxWidth: 540, // Optimized for A4
                    height: 'auto',
                    minHeight: 400,
                    maxHeight: 500,
                    objectFit: 'contain',
                    objectPosition: 'center',
                    border: '2px solid #e5e7eb',
                    borderRadius: 4,
                    backgroundColor: '#ffffff', // Ensure white background
                  }}
                />
              ) : (
                <View style={{
                  width: '100%',
                  height: 450,
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e5e7eb',
                  backgroundColor: '#f9f9f9',
                  borderRadius: 4,
                }}>
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#6b7280', 
                    textAlign: 'center',
                    lineHeight: 1.5,
                    maxWidth: 300,
                  }}>
                    Query Chart not available
                    {'\n\n'}
                    Please ensure the chart is generated before downloading PDF.
                    {'\n\n'}
                    The chart shows material sources and transport routes with distances clearly marked.
                  </Text>
                </View>
              )}
            </View>

            {/* Chart Description */}
            <View style={styles.chartDescription}>
              <Text style={styles.chartDescriptionText}>
                This chart illustrates the spatial relationship between the project site and material sources,
                showing transport routes and distances for lead charge calculations. Each arrow represents
                a transport route with distance marked in kilometers, and materials are listed at each source location.
              </Text>
            </View>

            {/* Page Number */}
            <Text style={styles.pageNumber}>
              Page {totalPagesWithChart} of {totalPagesWithChart}
            </Text>
          </Page>
        );
      };

      return (
        <Document>
          {/* Table pages */}
          {Array.from({ length: totalPages }, (_, pageIndex) => renderTablePage(pageIndex))}
          {/* Query chart page */}
          {renderQueryChartPage()}
        </Document>
      );
    };

    // Generate PDF
    const doc = <LeadChartPDF />;
    const pdfBlob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lead_Chart_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification('PDF downloaded successfully', 'success');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    addNotification('Error generating PDF. Please install @react-pdf/renderer package.', 'error');
  }
};
  const fetchSavedLeadData = async () => {
  if (!jwtToken || !workOrderId || !reviseId) {
    console.warn('Missing JWT token, workOrderId, or reviseId');
    return [];
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/txn-leads/${workOrderId}/${reviseId}`,
      {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json"
        }
      }
    );

    if (response.ok) {
      const savedLeadData = await response.json();
      console.log(`Fetched ${savedLeadData.length} saved lead records from API`);
      return savedLeadData;
    } else {
      console.warn('Failed to fetch saved lead data:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error fetching saved lead data:', error);
    return [];
  }
};


const saveLeadData = async (leadItem) => {
  if (!jwtToken) {
    console.warn('No JWT token available');
    return { success: false, error: 'No authentication token' };
  }

  try {
    // Validate required fields
    if (!leadItem.materialName || !leadItem.source || !leadItem.leadInKm) {
      return { success: false, error: 'Missing required fields: Material Name, Source, and Lead in KM are required' };
    }

    const payload = {
      srNo: parseInt(leadItem.srNo) || 0,
      materialName: String(leadItem.materialName).trim(),
      location: String(leadItem.source).trim(),
      leadInKm: parseFloat(leadItem.leadInKm) || 0,
      leadCharges: parseFloat(leadItem.leadCharges) || 0,
      ssrRate: parseFloat(leadItem.ssrRate) || 0, // Include SSR rate
      currentRate: parseFloat(leadItem.currentRate) || 0, // Include current rate
      diffInRate: parseFloat(leadItem.diffInRate) || 0, // Include difference rate
      unit: String(leadItem.rateUnit || 'Per Cu.M.'),
      remark: leadItem.remarks ? String(leadItem.remarks).trim() : null,
      fkWorkorderId: workOrderId || 0,
      fkReviseId: reviseId || 0
    };

    console.log('Saving lead data payload:', payload);

    const response = await fetch(`${API_BASE_URL}/api/txn-leads`, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('Save response:', response.status, responseText);

    if (response.ok) {
      let responseData = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.log('Response is not JSON, treating as success');
      }
      
      return { 
        success: true, 
        data: responseData,
        apiId: responseData?.id || null 
      };
    } else {
      let errorMessage = 'Failed to save lead data';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status}`;
      }
      
      console.error('Failed to save lead data:', response.status, errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('Error saving lead data:', error);
    return { 
      success: false, 
      error: error.message.includes('fetch') ? 'Network connection error. Please check your internet connection.' : error.message 
    };
  }
};


// Delete lead data from API
const deleteLeadData = async (leadId) => {
  if (!jwtToken || !leadId) {
    return { success: false, error: 'Missing authentication or lead ID' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/txn-leads/${leadId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('Failed to delete lead data:', response.status, errorText);
      return { success: false, error: `Delete failed: ${response.status}` };
    }
  } catch (error) {
    console.error('Error deleting lead data:', error);
    return { 
      success: false, 
      error: error.message.includes('fetch') ? 'Network connection error' : error.message 
    };
  }
};

const updateLeadData = async (leadItem) => {
  if (!jwtToken || !leadItem.apiId) {
    return { success: false, error: 'No authentication token or API ID' };
  }

  try {
    if (!leadItem.materialName || !leadItem.source || !leadItem.leadInKm) {
      return { success: false, error: 'Missing required fields: Material Name, Source, and Lead in KM are required' };
    }

    const payload = {
      id: leadItem.apiId,
      srNo: parseInt(leadItem.srNo) || 0,
      materialName: String(leadItem.materialName).trim(),
      location: String(leadItem.source).trim(),
      leadInKm: parseFloat(leadItem.leadInKm) || 0,
      leadCharges: parseFloat(leadItem.leadCharges) || 0,
      ssrRate: parseFloat(leadItem.ssrRate) || 0, // Include SSR rate
      currentRate: parseFloat(leadItem.currentRate) || 0, // Include current rate
      diffInRate: parseFloat(leadItem.diffInRate) || 0, // Include difference rate
      unit: String(leadItem.rateUnit || 'Per Cu.M.'),
      remark: leadItem.remarks ? String(leadItem.remarks).trim() : null,
      fkWorkorderId: workOrderId || 0,
      fkReviseId: reviseId || 0
    };

    const response = await fetch(`${API_BASE_URL}/api/txn-leads/${leadItem.apiId}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to update lead data' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Enable edit mode for a saved row
const enableEditMode = (id) => {
  setEditingRowId(id);
  addNotification('Edit mode enabled. Make your changes and save.', 'info');
};

// Save updated row data
const saveUpdatedRow = async (id) => {
  const item = leadData.find(row => row.id === id);
  if (!item || !item.apiId) {
    addNotification('Cannot update: Row not found or not saved yet', 'error');
    return;
  }

  // Check if all required fields are filled
  if (!item.materialName || !item.source || !item.leadInKm || item.leadInKm <= 0) {
    addNotification('Please fill all required fields: Material Name, Source, and Lead in KM', 'warning');
    return;
  }

  setUpdatingRows(prev => new Set(prev).add(id));
  
  try {
    const result = await updateLeadData(item);
    
    if (result.success) {
      // Update the item status and exit edit mode
      setLeadData(prev => prev.map(row => 
        row.id === id 
          ? { ...row, isSaved: true, isEdited: true }
          : row
      ));
      setEditingRowId(null);
      addNotification('Lead data updated successfully', 'success');
      
      // Regenerate query chart after update
      setTimeout(() => generateQueryChart(), 200);
    } else {
      addNotification(result.error || 'Failed to update lead data', 'error');
    }
  } catch (error) {
    addNotification('Network error while updating', 'error');
    console.error('Update error:', error);
  } finally {
    setUpdatingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

// Cancel edit mode
const cancelEdit = (id) => {
  setEditingRowId(null);
  // Reload the original data (you might want to store original values)
  addNotification('Edit cancelled', 'info');
};
const saveIndividualRow = async (id) => {
  const item = leadData.find(row => row.id === id);
  if (!item) {
    addNotification('Row not found', 'error');
    return;
  }

  // Check if all required fields are filled
  if (!item.materialName || !item.source || !item.leadInKm || item.leadInKm <= 0) {
    addNotification('Please fill all required fields: Material Name, Source, and Lead in KM', 'warning');
    return;
  }

  setSavingRows(prev => new Set(prev).add(id));
  
  try {
    const result = await saveLeadData(item);
    
    if (result.success) {
      // Update the item with API ID and saved status
      setLeadData(prev => prev.map(row => 
        row.id === id 
          ? { ...row, isSaved: true, apiId: result.apiId }
          : row
      ));
      addNotification('Lead data saved successfully', 'success');
    } else {
      addNotification(result.error || 'Failed to save lead data', 'error');
    }
  } catch (error) {
    addNotification('Network error while saving', 'error');
    console.error('Save error:', error);
  } finally {
    setSavingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }
};

  // Create location mappings based on lead data
  const createLocationMappings = (data) => {
  const mappings = new Map();
  
  // Helper function to normalize location names
  const normalizeLocation = (location) => {
    return location
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };
  
  data.forEach(item => {
    if (item.source && item.source.trim() !== '') {
      const normalizedSource = normalizeLocation(item.source);
      if (!mappings.has(normalizedSource)) {
        mappings.set(normalizedSource, []);
      }
      mappings.get(normalizedSource).push(item);
    }
  });
  
  setLocationMappings(mappings);
};

  // Load data
 const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    console.log('Loading lead charges data...');
    
    loadWorkName();
    loadWorkOrderDetails();
    
    const storedWorkOrderId = localStorage.getItem('workOrderId') || 
                       localStorage.getItem('workorderId') || 
                       localStorage.getItem('workOrderID') || 
                       localStorage.getItem('workorder_id');
    const storedReviseId = localStorage.getItem('reviseId') || 
                    localStorage.getItem('revisionId');
    
    const workOrderIdValue = storedWorkOrderId ? parseInt(storedWorkOrderId) : null;
    const reviseIdValue = storedReviseId ? parseInt(storedReviseId) : null;
    
    let savedLeadData = [];
    if (workOrderIdValue && reviseIdValue) {
      setWorkOrderId(workOrderIdValue);
      setReviseId(reviseIdValue);
      
      const response = await fetch(
        `${API_BASE_URL}/api/txn-leads/${workOrderIdValue}/${reviseIdValue}`,
        {
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
            "Accept": "application/json"
          }
        }
      );

      if (response.ok) {
        savedLeadData = await response.json();
        console.log(`Fetched ${savedLeadData.length} saved lead records from API`);
      }
    }
    
    // Get materials from transaction item properties (includes split materials)
    const materialsFromProperties = await getMaterialsFromConsumption();
    setMaterials(materialsFromProperties);

    const savedDataMap = new Map();
    savedLeadData.forEach(savedItem => {
      savedDataMap.set(savedItem.materialName, savedItem);
    });

    let leadEntries = [];
    let nextId = 1;

    // Add saved records first
    savedLeadData.forEach((savedItem, index) => {
      const matchingMaterial = materialsFromProperties.find(mat => 
        mat.name === savedItem.materialName
      );

      leadEntries.push({
        id: nextId++,
        srNo: savedItem.srNo || (index + 1),
        materialId: matchingMaterial?.id || null,
        materialName: savedItem.materialName,
        leadFactor: matchingMaterial?.leadFactor || 0,
        leadType: matchingMaterial?.leadType || '',
        source: savedItem.location || '',
        leadInKm: savedItem.leadInKm || 0,
        leadCharges: savedItem.leadCharges || 0,
        leadCost: savedItem.leadCharges && matchingMaterial?.leadFactor 
          ? savedItem.leadCharges / matchingMaterial.leadFactor 
          : 0,
        ssrRate: savedItem.ssrRate || 0,
        currentRate: savedItem.currentRate || 0,
        diffInRate: savedItem.diffInRate || 0,
        rateUnit: savedItem.unit || (matchingMaterial?.unit || 'Per Cu.M.'),
        remarks: savedItem.remark || '',
        royalty: matchingMaterial?.royalty || '',
        constant: matchingMaterial?.constant || 0,
        propertyId: matchingMaterial?.propertyId || null,
        isNewRow: false,
        isSaved: true,
        apiId: savedItem.id
      });
    });

    // Add materials from transaction item properties (these include split materials)
    materialsFromProperties.forEach((material, index) => {
      if (!savedDataMap.has(material.name)) {
        leadEntries.push({
          id: nextId++,
          srNo: leadEntries.length + 1,
          materialId: material.id,
          materialName: material.name,
          leadFactor: material.leadFactor,
          leadType: material.leadType,
          source: '',
          leadInKm: 0,
          leadCharges: 0,
          leadCost: 0,
          ssrRate: material.ssrRate || 0,
          currentRate: 0,
          diffInRate: 0,
          rateUnit: material.unit || 'Per Cu.M.',
          remarks: '',
          royalty: material.royalty,
          constant: material.constant,
          propertyId: material.propertyId,
          isNewRow: false,
          isSaved: false
        });
      }
    });

    setLeadData(leadEntries);
    createLocationMappings(leadEntries);
    console.log(`Created ${leadEntries.length} lead entries with split materials`);

  } catch (error) {
    console.error('Error loading data:', error);
    setError('Failed to load lead charges data');
  } finally {
    setLoading(false);
  }
};
const handleCellClick = (id, field) => {
  const item = leadData.find(row => row.id === id);
  if (!item || !item.isSaved) return;
  
  if (doubleClickTimer) {
    clearTimeout(doubleClickTimer);
    setDoubleClickTimer(null);
    // Double click detected
    enableEditMode(id);
    setEditingCell({ id, field });
  } else {
    // First click
    setDoubleClickTimer(setTimeout(() => {
      setDoubleClickTimer(null);
      // Single click action (if needed)
    }, 300));
  }
};
const renderEditableCellWithDoubleClick = (item, field, value, type = 'text') => {
  const isEditing = editingCell?.id === item.id && editingCell?.field === field;
  const isInEditMode = editingRowId === item.id;
  
  const isReadOnly = ((field === 'materialName' && !item.isNewRow) || 
                      field === 'leadCost') && 
                     !isInEditMode;
  
  const isFieldReadOnly = item.isSaved && !isInEditMode && !item.isNewRow;
  
  if (isEditing && !isReadOnly && !isFieldReadOnly) {
    return renderEditableCell(item, field, value, type);
  }
  
  // For saved rows, show as clickable
  if (item.isSaved && !isInEditMode && !isReadOnly) {
    return (
      <input
        type="text"
        value={value || ''}
        readOnly
        onClick={() => handleCellClick(item.id, field)}
        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 cursor-pointer text-sm hover:bg-gray-100"
        title="Double-click to edit"
      />
    );
  }
  
  return renderEditableCell(item, field, value, type);
};
  // Calculate lead charges when distance changes
  const calculateLeadCharges = async (materialId, distance, leadType) => {
    if (!distance || distance <= 0 || !leadType) {
      return 0;
    }

    try {
      const leadChargesData = await getLeadCharges(distance, leadType);
      if (leadChargesData && leadChargesData.cost) {
        return leadChargesData.cost;
      }
      return 0;
    } catch (error) {
      console.error('Error calculating lead charges:', error);
      return 0;
    }
  };

  // Add new row
 

const addNewRow = async () => {
  const dropdownMaterials = await fetchMaterialsForDropdown();
  setAvailableMaterials(dropdownMaterials);

  const newId = Math.max(...leadData.map(item => item.id), 0) + 1;
  const newRow = {
    id: newId,
    srNo: leadData.length + 1,
    materialId: null,
    materialName: '',
    leadFactor: 0,
    leadType: '',
    source: '',
    leadInKm: 0,
    leadCharges: 0,
    ssrRate: 0,
    currentRate: 0,
    diffInRate: 0,
    rateUnit: 'Per Cu.M.',
    remarks: '',
    royalty: '',
    constant: 0,
    fkDetailedItemId: null,
    isNewRow: true
  };
  
  setLeadData(prev => [...prev, newRow]);
  addNotification('New row added successfully', 'success');
};
  // Delete row
 const deleteRow = async (id) => {
  const itemToDelete = leadData.find(item => item.id === id);
  
  // If it's a saved item (has API ID), delete from API first
  if (itemToDelete && itemToDelete.apiId) {
    const result = await deleteLeadData(itemToDelete.apiId);
    if (!result.success) {
      addNotification(result.error || 'Failed to delete from server', 'error');
      return;
    }
  }

  setLeadData(prev => {
    const filtered = prev.filter(item => item.id !== id);
    const updated = filtered.map((item, index) => ({
      ...item,
      srNo: index + 1
    }));
    createLocationMappings(updated);
    return updated;
  });
  addNotification('Row deleted successfully', 'success');
};
// Auto-generate query chart with improved text visibility
const generateQueryChart = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Increased canvas dimensions for better space
  canvas.width = 1400; 
  canvas.height = 900; 

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const rectWidth = 160; // Increased size
  const rectHeight = 50;  // Increased size

  // Draw center rectangle with better visibility
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3; // Thicker border
  ctx.strokeRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);

  // Center text with larger, bolder font
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px Arial'; // Increased font size
  ctx.textAlign = 'center';
  ctx.fillText('PROJECT SITE', centerX, centerY - 6);
  ctx.font = '14px Arial'; // Increased font size
  ctx.fillText(workName || 'Main Site', centerX, centerY + 12);

  // Enhanced city normalization function
  const normalizeLocation = (location) => {
    return location
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Group materials by normalized location and distance
  const locationGroups = new Map();
  const materialsWithLocation = leadData.filter(item => item.source && item.materialName);
  
  materialsWithLocation.forEach(material => {
    const normalizedLocation = normalizeLocation(material.source);
    const distance = parseFloat(material.leadInKm) || 0;
    const key = `${normalizedLocation}-${distance}`;
    
    if (!locationGroups.has(key)) {
      locationGroups.set(key, {
        location: material.source,
        normalizedLocation,
        distance,
        materials: []
      });
    }
    locationGroups.get(key).materials.push(material);
  });

  const groupedData = Array.from(locationGroups.values());
  
  groupedData.forEach((group, index) => {
    const baseAngle = Math.PI / 2;
    const angle = baseAngle - (index * (2 * Math.PI)) / groupedData.length;
    
    const distance = group.distance;
    const maxDistance = Math.max(...leadData.map(item => parseFloat(item.leadInKm) || 0));
    
    const baseRadius = 180; // Increased base radius
    const maxRadius = 380;  // Increased max radius
    const radius = baseRadius + (distance / Math.max(maxDistance, 1)) * (maxRadius - baseRadius);
    
    const materialX = centerX + Math.cos(angle) * radius;
    const materialY = centerY - Math.sin(angle) * radius;

    // Calculate arrow start point with updated rect size
    let startX, startY;
    const rectHalfWidth = rectWidth / 2;
    const rectHalfHeight = rectHeight / 2;
    
    const absAngleCos = Math.abs(Math.cos(angle));
    const absAngleSin = Math.abs(Math.sin(angle));
    
    if (absAngleCos * rectHalfHeight > absAngleSin * rectHalfWidth) {
      if (Math.cos(angle) > 0) {
        startX = centerX + rectHalfWidth;
        startY = centerY - Math.tan(angle) * rectHalfWidth;
      } else {
        startX = centerX - rectHalfWidth;
        startY = centerY + Math.tan(angle) * rectHalfWidth;
      }
    } else {
      if (Math.sin(angle) > 0) {
        startX = centerX + rectHalfHeight / Math.tan(angle);
        startY = centerY - rectHalfHeight;
      } else {
        startX = centerX - rectHalfHeight / Math.tan(angle);
        startY = centerY + rectHalfHeight;
      }
    }

    // Draw arrow with better visibility
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4; // Increased line width
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(materialX, materialY);
    ctx.stroke();

    // Draw arrowhead with larger size
    const arrowLength = 18; // Increased arrow length
    const arrowAngle = Math.PI / 6;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(materialX, materialY);
    ctx.lineTo(
      materialX - arrowLength * Math.cos(angle - arrowAngle),
      materialY + arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(materialX, materialY);
    ctx.lineTo(
      materialX - arrowLength * Math.cos(angle + arrowAngle),
      materialY + arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();

    // Draw location point with larger size
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(materialX, materialY, 10, 0, 2 * Math.PI); // Increased radius
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.stroke();


    // Distance label with better font and positioning - NO BACKGROUND
ctx.fillStyle = '#1f2937';
ctx.font = 'bold 16px Arial';
ctx.textAlign = 'center';

const distanceLabelRadius = 0.6;
const distanceLabelX = startX + (materialX - startX) * distanceLabelRadius;
const distanceLabelY = startY + (materialY - startY) * distanceLabelRadius;

const perpAngle = angle + Math.PI / 2;
const offsetDistance = 25;
const finalDistanceLabelX = distanceLabelX + Math.cos(perpAngle) * offsetDistance;
const finalDistanceLabelY = distanceLabelY - Math.sin(perpAngle) * offsetDistance;

const distanceText = `${distance.toFixed(1)} KM`;
ctx.fillText(distanceText, finalDistanceLabelX, finalDistanceLabelY + 2);
// Location name - NO BACKGROUND
ctx.font = 'bold 20px Arial';
ctx.fillStyle = '#059669';

const labelOffset = 45;
let labelX = materialX;
let labelY = materialY;

// Determine text alignment based on position
if (Math.cos(angle) > 0) {
  labelX += labelOffset;
  ctx.textAlign = 'left';
} else {
  labelX -= labelOffset;
  ctx.textAlign = 'right';
}

if (Math.sin(angle) > 0) {
  labelY -= labelOffset;
} else {
  labelY += labelOffset;
}

const locationText = group.location;
ctx.fillText(locationText, labelX, labelY + 3);
    // Materials display with improved formatting
 // Materials display - NO BACKGROUND
const maxLineWidth = 220;
const lineHeight = 18;

ctx.font = '12px Arial';
ctx.fillStyle = '#6b7280';

// Smart line breaking
const materialLines = [];
let currentLine = '';

group.materials.forEach((material, index) => {
  const materialName = material.materialName;
  const testLine = currentLine ? `${currentLine}, ${materialName}` : materialName;
  const testWidth = ctx.measureText(testLine).width;
  
  if (testWidth > maxLineWidth && currentLine !== '') {
    materialLines.push(currentLine);
    currentLine = materialName;
  } else {
    currentLine = testLine;
  }
  
  if (index === group.materials.length - 1) {
    materialLines.push(currentLine);
  }
});

// Draw material lines without backgrounds
materialLines.forEach((line, lineIndex) => {
  const materialLineY = labelY + 25 + (lineIndex * lineHeight);
  ctx.fillText(line, labelX, materialLineY + 2);
});
  });

  // Enhanced Legend with much better visibility
  const legendX = 30;
  const legendY = 40;
  const legendWidth = 280; // Increased width
  const legendHeight = 140; // Increased height
  
  // Legend background with better styling
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.fillRect(legendX - 15, legendY - 30, legendWidth, legendHeight);
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(legendX - 15, legendY - 30, legendWidth, legendHeight);
  
  // Legend shadow effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(legendX - 13, legendY - 28, legendWidth, legendHeight);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.fillRect(legendX - 15, legendY - 30, legendWidth, legendHeight);
  ctx.strokeRect(legendX - 15, legendY - 30, legendWidth, legendHeight);
  
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 18px Arial'; // Larger legend title
  ctx.textAlign = 'left';
  ctx.fillText('Legend:', legendX, legendY - 5);
  
  ctx.font = '14px Arial'; // Larger legend text
  
  // Project site rectangle
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(legendX, legendY + 20, 18, 12); // Larger legend items
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 2;
  ctx.strokeRect(legendX, legendY + 20, 18, 12);
  ctx.fillStyle = '#374151';
  ctx.fillText('Project Site', legendX + 28, legendY + 30);

  // Material source point
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(legendX + 9, legendY + 50, 7, 0, 2 * Math.PI); // Larger dot
  ctx.fill();
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#374151';
  ctx.fillText('Material Source', legendX + 28, legendY + 55);

  // Arrow line
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(legendX, legendY + 75);
  ctx.lineTo(legendX + 18, legendY + 75);
  ctx.stroke();
  ctx.fillStyle = '#374151';
  ctx.fillText('Transport Route', legendX + 28, legendY + 80);

  ctx.fillStyle = '#374151';
  ctx.fillText('Distance & Materials Listed', legendX + 28, legendY + 100);
};
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    const lastRow = leadData[leadData.length - 1];
    if (lastRow && !lastRow.materialName && !lastRow.source && !lastRow.leadInKm) {
      deleteRow(lastRow.id);
    }
  }
};
useEffect(() => {
  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [leadData]);
// Canvas mouse handlers for pan functionality
const handleCanvasMouseDown = (e) => {
  if (selectedTool === 'move') {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  } else {
    startDrawing(e);
  }
};

const handleCanvasMouseMove = (e) => {
  if (selectedTool === 'move' && isDragging) {
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  } else {
    draw(e);
  }
};

const handleCanvasMouseUp = () => {
  setIsDragging(false);
  stopDrawing();
};

// Double-click handler for table rows
const handleRowDoubleClick = (id) => {
  const item = leadData.find(row => row.id === id);
  if (item && item.isSaved) {
    enableEditMode(id);
  }
};
  // Canvas drawing functionality
  const startDrawing = (e) => {
    if (selectedTool === 'pointer') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing || selectedTool === 'pointer') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(drawing => {
      drawPath(ctx, drawing);
    });
    
    drawPath(ctx, { tool: selectedTool, path: [...currentPath, { x, y }] });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentPath.length > 0) {
      setDrawings(prev => [...prev, { tool: selectedTool, path: currentPath }]);
    }
    setCurrentPath([]);
  };

  const drawPath = (ctx, drawing) => {
    if (!drawing.path || drawing.path.length === 0) return;
    
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    if (drawing.tool === 'pen' || drawing.tool === 'line') {
      ctx.moveTo(drawing.path[0].x, drawing.path[0].y);
      drawing.path.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
    } else if (drawing.tool === 'rectangle') {
      const start = drawing.path[0];
      const end = drawing.path[drawing.path.length - 1];
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (drawing.tool === 'circle') {
      const start = drawing.path[0];
      const end = drawing.path[drawing.path.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
    }
    
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawings([]);
    generateQueryChart(); // Regenerate the auto chart
  };

  const addNotification = (message, type = 'info') => {
  const id = Date.now();
  const notificationTypes = {
    success: { bg: 'bg-green-500', icon: '✓' },
    error: { bg: 'bg-red-500', icon: '✗' },
    warning: { bg: 'bg-yellow-500', icon: '⚠' },
    info: { bg: 'bg-blue-500', icon: 'ℹ' }
  };
  
  const config = notificationTypes[type] || notificationTypes.info;
  
  setNotifications(prev => [...prev, { 
    id, 
    message, 
    type, 
    bgColor: config.bg,
    icon: config.icon
  }]);
  
  setTimeout(() => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, 4000);
};


const handleCellEdit = async (id, field, value) => {
  const updatedData = [];
  let shouldAutoSave = false;
  
  for (const item of leadData) {
    if (item.id === id) {
      const updatedItem = { ...item, [field]: value };
      
      // Handle rate field changes and calculate difference
      if (field === 'ssrRate' || field === 'currentRate') {
        const ssrRate = field === 'ssrRate' ? parseFloat(value) || 0 : parseFloat(item.ssrRate) || 0;
        const currentRate = field === 'currentRate' ? parseFloat(value) || 0 : parseFloat(item.currentRate) || 0;
        
        // Calculate difference: Current Rate - SSR Rate
        updatedItem.diffInRate = currentRate - ssrRate;
        
        if (field === 'ssrRate') {
          updatedItem.ssrRate = ssrRate;
        }
        if (field === 'currentRate') {
          updatedItem.currentRate = currentRate;
        }
      }
      
      // Handle manual difference rate input
      if (field === 'diffInRate') {
        updatedItem.diffInRate = parseFloat(value) || 0;
      }
      
      // Auto-calculate lead cost and charges
      if (field === 'leadInKm' && value > 0 && item.leadType) {
        try {
          const leadCharges = await calculateLeadCharges(item.materialId, parseFloat(value), item.leadType);
          updatedItem.leadCharges = leadCharges;
          
          if (item.leadFactor && item.leadFactor > 0) {
            updatedItem.leadCost = leadCharges / item.leadFactor;
          } else {
            updatedItem.leadCost = 0;
          }
          
          // Immediate auto-save when lead cost is calculated and all required fields are present
          if (updatedItem.leadCost > 0 && updatedItem.materialName && updatedItem.source) {
            shouldAutoSave = true;
          }
        } catch (error) {
          console.error('Error calculating lead charges:', error);
          updatedItem.leadCharges = 0;
          updatedItem.leadCost = 0;
        }
      }
      
      // Auto-save when source is entered and other required fields are present
      if (field === 'source' && value.trim() && updatedItem.materialName && updatedItem.leadInKm > 0) {
        shouldAutoSave = true;
      }
      
      if (field === 'materialName' && item.isNewRow) {
        const existingMaterial = leadData.find(existing => 
          existing.id !== id && existing.materialName === value
        );
        
        if (existingMaterial) {
          addNotification('This material is already added to the table', 'error');
          return;
        }

        const selectedMaterial = availableMaterials.find(mat => mat.name === value);
        if (selectedMaterial) {
          updatedItem.materialId = selectedMaterial.id;
          updatedItem.leadFactor = selectedMaterial.leadFactor;
          updatedItem.leadType = selectedMaterial.leadType || 'MACHINE';
          updatedItem.rateUnit = selectedMaterial.unit;
          updatedItem.royalty = selectedMaterial.royalty;
          
          if (item.leadInKm > 0) {
            try {
              const leadCharges = await calculateLeadCharges(selectedMaterial.id, item.leadInKm, selectedMaterial.leadType || 'MACHINE');
              updatedItem.leadCharges = leadCharges;
              
              if (selectedMaterial.leadFactor && selectedMaterial.leadFactor > 0) {
                updatedItem.leadCost = leadCharges / selectedMaterial.leadFactor;
                if (updatedItem.source) {
                  shouldAutoSave = true;
                }
              }
            } catch (error) {
              console.error('Error calculating lead charges:', error);
            }
          }
        }
      }
      
      if (updatedItem.isSaved && editingRowId !== id) {
        updatedItem.isSaved = false;
      }
      
      updatedData.push(updatedItem);
    } else {
      updatedData.push(item);
    }
  }
  
  setLeadData(updatedData);
  createLocationMappings(updatedData);
  setEditingCell(null);
  
  // Immediate auto-save with shorter delay
  if (shouldAutoSave) {
    const itemToSave = updatedData.find(item => item.id === id);
    if (itemToSave && !itemToSave.isSaved) {
      // Shorter timeout for immediate saving
      setTimeout(async () => {
        const result = await saveLeadData(itemToSave);
        if (result.success) {
          setLeadData(prev => prev.map(row => 
            row.id === id ? { ...row, isSaved: true, apiId: result.apiId } : row
          ));
          addNotification('Lead data auto-saved successfully', 'success');
          
          // Regenerate chart after auto-save
          setTimeout(() => generateQueryChart(), 100);
        } else {
          addNotification('Auto-save failed: ' + (result.error || 'Unknown error'), 'error');
        }
      }, 100);
    }
  }
  
  if (field === 'source' || field === 'leadInKm') {
    setTimeout(() => generateQueryChart(), 200);
  }
};
  const handleSelectChange = (id, field, value) => {
    setTimeout(() => {
      handleCellEdit(id, field, value);
    }, 0);
  };

  // Filter data based on search term
   const filteredData = leadData.filter(item =>
    item.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.leadType?.toLowerCase().includes(searchTerm.toLowerCase())
  );
 const totalPages = Math.ceil(leadData.length / rowsPerPage);
   const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
const renderEditableCell = (item, field, value, type = 'text') => {
  const isEditing = editingCell?.id === item.id && editingCell?.field === field;
  const isInEditMode = editingRowId === item.id;
  
  // Check if field should be editable
  const isReadOnly = ((field === 'materialName' && !item.isNewRow) || 
                      field === 'leadCost') && 
                     !isInEditMode;
  
  // For saved rows not in edit mode, make all fields read-only except for new rows
  // But allow rate fields to be editable even for saved rows
  const isFieldReadOnly = item.isSaved && !isInEditMode && !item.isNewRow && 
                          !['ssrRate', 'currentRate', 'diffInRate'].includes(field);
  
  if (isEditing && !isReadOnly && !isFieldReadOnly) {
    if (field === 'materialName') {
      return (
        <select
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleSelectChange(item.id, field, e.target.value)}
          onChange={(e) => handleSelectChange(item.id, field, e.target.value)}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none text-sm"
        >
          <option value="">Select Material</option>
          {availableMaterials.map((material, index) => (
            <option key={index} value={material.name} title={material.name}>
              {material.name.length > 25 ? material.name.substring(0, 25) + '...' : material.name}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type={type}
          step={type === 'number' ? '0.01' : undefined}
          defaultValue={value}
          autoFocus
          onBlur={(e) => handleCellEdit(item.id, field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellEdit(item.id, field, e.target.value);
            }
            if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none text-sm"
        />
      );
    }
  }
  
  // Render read-only fields
  if (isReadOnly || isFieldReadOnly) {
    let displayValue = value;
    if (field === 'leadCost' && value) displayValue = `₹${value.toFixed(1)}`;
    
    const bgClass = item.isSaved && !isInEditMode ? 'bg-gray-50' : 
                   field === 'leadCost' ? 'bg-green-50' : 'bg-gray-100';
    
    return (
      <input
        type="text"
        value={displayValue || ''}
        readOnly
        className={`w-full px-2 py-1 border border-gray-300 rounded cursor-not-allowed text-sm ${bgClass} ${
          field === 'leadCost' ? 'font-semibold text-green-700' : 'text-gray-600'
        }`}
        title={value || ''}
      />
    );
  }
  
  // Make rate fields always editable
  if (['ssrRate', 'currentRate', 'diffInRate'].includes(field)) {
    return (
      <input
        type="number"
        step="0.01"
        value={value || 0}
        onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
        onFocus={() => setEditingCell({ id: item.id, field })}
        className={`w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-sm text-center ${
          field === 'diffInRate' ? 'font-semibold text-blue-700 bg-blue-50' : ''
        }`}
        title={
          field === 'ssrRate' ? 'SSR Rate - Enter rate from schedule' :
          field === 'currentRate' ? 'Current Rate - Enter current market rate' :
          'Difference in Rates - Auto calculated (Current - SSR) or manually editable'
        }
      />
    );
  }
  
  return (
    <input
      type={type}
      step={type === 'number' ? '0.01' : undefined}
      value={value || ''}
      onChange={(e) => handleCellEdit(item.id, field, e.target.value)}
      onFocus={() => setEditingCell({ id: item.id, field })}
      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white text-sm"
      title={value || ''}
    />
  );
};
  // Update query chart when lead data changes
useEffect(() => {
  if (canvasRef.current && leadData.length > 0) {
    const timeoutId = setTimeout(() => {
      generateQueryChart();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }
}, [leadData, locationMappings, pan, zoom]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <span className="text-lg text-gray-700">Loading lead charges data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle size={24} />
            <span className="font-medium">Error loading data</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
        <div className="mb-6 mt-2 p-4 border border-gray-300 rounded bg-white shadow-md">
  <StepperPage 
    currentStep={currentStep}
    onStepClick={handleStepNavigation}
  />
</div>
      <div className="p-6">
        {/* Work Name Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-lg font-semibold text-gray-800">Name of Work:-</h2>
      <p className="text-gray-600 mt-1">{workName}</p>
      <h3 className="text-md font-semibold text-gray-800 mt-2">Lead Charges</h3>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    <button
        onClick={downloadLeadPDF}
        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <Download size={16} />
        Download PDF
      </button>
    </div>
  </div>
</div>
       

        {/* Lead Charges Table */}
       <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-16">
            Sr No.
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-52">
            Name of Material
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-28">
            Lead Type
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-36">
            Source of Material
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-24">
            Lead KM
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-28">
            Lead Cost
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-28">
            SSR Rate
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-28">
            Current Rate
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-28">
            Diff in Rates
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-24">
            Unit
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-r w-32">
            Remarks
          </th>
          <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-24">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {currentData.map((item) => (
          <tr 
            key={item.id} 
            className={`hover:bg-gray-50 ${item.isSaved ? 'bg-green-50' : ''} cursor-pointer`}
            onDoubleClick={() => handleRowDoubleClick(item.id)}
            title="Double-click to edit saved rows"
          >
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-16">
              {item.srNo}
            </td>
            <td className="px-3 py-3 text-sm font-medium text-gray-900 border-r w-52">
              {item.isNewRow ? (
                renderEditableCell(item, 'materialName', item.materialName)
              ) : (
                <div className="truncate" title={item.materialName || "Material from cache - not editable"}>
                  <input
                    type="text"
                    value={item.materialName || ''}
                    readOnly
                    className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-gray-700 text-sm truncate"
                  />
                </div>
              )}
            </td>
           <td className="px-3 py-3 text-sm text-gray-600 border-r w-28">
  <div className="truncate" title={item.leadType || "Auto-filled from material data"}>
    <input
      type="text"
      value={item.leadType || ' '}
      readOnly
      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-sm truncate"
      placeholder="MACHINE"
    />
  </div>
</td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-36">
              {renderEditableCell(item, 'source', item.source)}
            </td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-24">
              {renderEditableCell(item, 'leadInKm', item.leadInKm, 'number')}
            </td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r font-medium w-28">
              <input
                type="text"
                value={item.leadCost ? `₹${item.leadCost.toFixed(1)}` : '₹0'}
                readOnly
                className="w-full px-2 py-1 border border-gray-300 rounded bg-green-50 cursor-not-allowed font-semibold text-green-700 text-sm"
                title="Lead Cost = Lead Charges ÷ Lead Factor"
              />
            </td>
           <td className="px-3 py-3 text-sm text-gray-900 border-r w-28">
  {renderEditableCell(item, 'ssrRate', item.ssrRate, 'number')}
</td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-28">
  {renderEditableCell(item, 'currentRate', item.currentRate, 'number')}
</td>
           <td className="px-3 py-3 text-sm text-gray-900 border-r w-28">
  {renderEditableCell(item, 'diffInRate', item.diffInRate, 'number')}
</td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-24">
              {renderEditableCell(item, 'rateUnit', item.rateUnit)}
            </td>
            <td className="px-3 py-3 text-sm text-gray-900 border-r w-32">
              {renderEditableCell(item, 'remarks', item.remarks)}
            </td>
            <td className="px-3 py-3 text-sm text-gray-900 w-24">
              <div className="flex items-center gap-1">
                {(!item.isSaved && item.materialName && item.source && item.leadInKm > 0) && (
                  <button
                    onClick={() => saveIndividualRow(item.id)}
                    disabled={savingRows.has(item.id)}
                    className={`p-1 rounded ${
                      savingRows.has(item.id) 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                    }`}
                    title="Save row to database"
                  >
                    {savingRows.has(item.id) ? (
                      <Loader className="animate-spin" size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                  </button>
                )}
                {(item.isSaved && item.apiId && editingRowId !== item.id) && (
                  <button
                    onClick={() => enableEditMode(item.id)}
                    className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 p-1 rounded"
                    title="Edit saved row"
                  >
                    <Edit size={14} />
                  </button>
                )}
                {(editingRowId === item.id) && (
                  <>
                    <button
                      onClick={() => saveUpdatedRow(item.id)}
                      disabled={updatingRows.has(item.id)}
                      className={`p-1 rounded ${
                        updatingRows.has(item.id) 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                      }`}
                      title="Save changes"
                    >
                      {updatingRows.has(item.id) ? (
                        <Loader className="animate-spin" size={14} />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => cancelEdit(item.id)}
                      className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1 rounded"
                      title="Cancel edit"
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
                {(item.isSaved && editingRowId !== item.id) && (
                  <div className="p-1 text-green-600" title="Saved to database">
                    <Check size={14} />
                  </div>
                )}
                <button
                  onClick={() => deleteRow(item.id)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded"
                  title="Delete row"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        
        {/* Add Material Button Row - Bottom Left Inside Table */}
        <tr className="bg-blue-50 border-t-2 border-blue-200">
          <td className="px-3 py-4">
            <button
              onClick={addNewRow}
              className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
              title="Add New Lead"
            >
              <Plus size={18} />
            </button>
          </td>
          <td colSpan="11" className="px-3 py-4 text-left">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Click the + button to add new material</span>
             
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700 font-medium">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1); // Reset to first page when changing rows per page
          }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium text-gray-900">{Math.min(((currentPage - 1) * rowsPerPage) + 1, filteredData.length)}</span> to{' '}
        <span className="font-medium text-gray-900">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of{' '}
        <span className="font-medium text-gray-900">{filteredData.length}</span> entries
        {searchTerm && (
          <span className="text-blue-600 ml-2">(filtered from {leadData.length} total)</span>
        )}
      </div>
    </div>

    <div className="flex items-center gap-1">
      {/* First Page Button */}
      <button
        onClick={() => setCurrentPage(1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
        title="First page"
      >
        <ChevronLeft size={16} />
        <ChevronLeft size={16} className="-ml-1.5" />
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
        title="Previous page"
      >
        <ChevronLeft size={16} />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="hidden md:flex items-center">
        {(() => {
          const pages = [];
          const totalPagesToShow = 5;
          const totalPagesCalculated = Math.ceil(filteredData.length / rowsPerPage);
          let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
          let endPage = Math.min(totalPagesCalculated, startPage + totalPagesToShow - 1);
          
          // Adjust start page if we're near the end
          if (endPage - startPage + 1 < totalPagesToShow) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
          }

          // Add first page and ellipsis if needed
          if (startPage > 1) {
            pages.push(
              <button
                key={1}
                onClick={() => setCurrentPage(1)}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                1
              </button>
            );
            if (startPage > 2) {
              pages.push(
                <span key="ellipsis1" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-r border-gray-300">
                  ...
                </span>
              );
            }
          }

          // Add page numbers
          for (let i = startPage; i <= endPage; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`relative inline-flex items-center px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 transition-all duration-200 ${
                  currentPage === i
                    ? 'bg-blue-600 text-white border-blue-600 z-10 shadow-sm'
                    : 'text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {i}
              </button>
            );
          }

          // Add last page and ellipsis if needed
          if (endPage < totalPagesCalculated) {
            if (endPage < totalPagesCalculated - 1) {
              pages.push(
                <span key="ellipsis2" className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-r border-gray-300">
                  ...
                </span>
              );
            }
            pages.push(
              <button
                key={totalPagesCalculated}
                onClick={() => setCurrentPage(totalPagesCalculated)}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                {totalPagesCalculated}
              </button>
            );
          }

          return pages;
        })()}
      </div>

      {/* Current Page Indicator for Mobile */}
      <div className="md:hidden flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border-t border-b border-r border-gray-300">
        <span>Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}</span>
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage >= Math.ceil(filteredData.length / rowsPerPage)}
        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-r border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
        title="Next page"
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => setCurrentPage(Math.ceil(filteredData.length / rowsPerPage))}
        disabled={currentPage >= Math.ceil(filteredData.length / rowsPerPage)}
        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
        title="Last page"
      >
        <ChevronRight size={16} />
        <ChevronRight size={16} className="-ml-1.5" />
      </button>
    </div>
  </div>
</div>

        {/* Auto-Generated Query Chart */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
 <div className="p-4 border-b border-gray-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`p-2 rounded hover:bg-gray-200 ${
              selectedTool === tool.id ? 'bg-blue-500 text-white' : 'text-gray-700'
            }`}
            title={tool.label}
          >
            <tool.icon size={16} />
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {/* <button
          onClick={clearCanvas}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          title="Clear & Regenerate"
        >
          <Trash2 size={16} />
        </button> */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded hover:bg-gray-200 ${
            showGrid ? 'bg-blue-500 text-white' : 'text-gray-700'
          }`}
          title="Toggle Grid"
        >
          <Grid size={16} />
        </button>
        {/* Pan mode indicator */}
        {selectedTool === 'move' && (
          <div className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Navigation size={14} />
            Pan Mode Active
          </div>
        )}
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Zoom:</span>
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value={25}>25%</option>
          <option value={50}>50%</option>
          <option value={75}>75%</option>
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
          <option value={200}>200%</option>
        </select>
      </div>
      <button
        onClick={() => {
          setPan({ x: 0, y: 0 });
          setZoom(100);
          addNotification('View reset to center', 'info');
        }}
        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center gap-2"
      >
        <RotateCcw size={14} />
        Reset View
      </button>
    </div>
  </div>
</div>


<div className="p-4">
  <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      className={`w-full ${selectedTool === 'move' ? 'cursor-move' : 'cursor-crosshair'}`}
      style={{ 
        transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`, 
        transformOrigin: '0 0',
        maxHeight: '600px'
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    />
    
    {showGrid && (
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    )}
    
    {/* Pan instructions */}
    {selectedTool === 'move' && (
      <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
        Click and drag to pan the chart
      </div>
    )}
  </div>
</div>
</div>
        

      
        

        
       
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
  <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
    {notifications.map(notification => (
      <div
        key={notification.id}
        className={`p-4 rounded-lg shadow-lg ${notification.bgColor || 'bg-blue-500'} text-white transform transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg font-bold flex-shrink-0">
            {notification.icon}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
            {notification.type === 'error' && (
              <p className="text-xs mt-1 opacity-90">
                Please check your network connection and try again.
              </p>
            )}
          </div>
          <button
            onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            className="text-white hover:text-gray-200 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    ))}
  </div>
)}
<div className="flex justify-center">
  <button
    onClick={navigateToRoyalty}
    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
  >
    <span>Next</span>
    <ArrowRight className="h-4 w-4" />
  </button>
</div>
    </div>
  );
};

export default LeadChargesManagement;