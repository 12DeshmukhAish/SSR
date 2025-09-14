import React from 'react';
import { Document, Page, Text, View, StyleSheet ,PDFDownloadLink} from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 50, // Increased bottom padding for page number
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  border: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  // Enhanced watermark styles for better visibility
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Bring it forward but still behind text
  },
  watermarkText: {
    fontSize: 140,
    fontWeight: 'bold',
    color: 'rgba(200, 200, 200, 0.4)', // Lighter gray with reduced opacity
    letterSpacing: 25,
    transform: 'rotate(-45deg)',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  workNameHeader: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    position: 'relative',
    zIndex: 2, // Ensure text appears above watermark
  },
  measurementSheetTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
    color: '#000000',
    position: 'relative',
    zIndex: 2, // Ensure text appears above watermark
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#ffffff',
    position: 'relative',
    zIndex: 2, // Ensure table appears above watermark
  },
  tableRow: {
    flexDirection: 'row',
    borderStyle: 'none',
    marginBottom: 0,
    backgroundColor: '#ffffff',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    backgroundColor: '#f8f9fa',
    marginBottom: 0,
    minHeight: 25, // Ensure proper header height
  },
  tableColHeader: {
    padding: 4,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    justifyContent: 'center', // Vertically center the text
    alignItems: 'center', // Horizontally center the text
    display: 'flex',
  },
  tableCol: {
    padding: 3,
    color: '#000000',
  },
  lastTableCol: {
    padding: 3,
    color: '#000000',
    borderRightWidth: 0,
  },
  srNoCol: { width: '7%' },
  itemNoCol: { width: '9%' },
  descriptionCol: { width: '35%' },
  noCol: { width: '8%' },
  lCol: { width: '8%' },
  bwCol: { width: '8%' },
  dhCol: { width: '8%' },
  qtyCol: { width: '9%' },
  unitCol: { width: '8%' }, // New unit column
  emptyCol: {
    padding: 3,
    color: '#000000',
  },
  itemRow: {
    marginTop: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    fontWeight: 'bold',
    marginTop: 0,
    backgroundColor: '#ffffff',
  },
  rightAlign: {
    textAlign: 'right',
  },
  centerAlign: {
    textAlign: 'center',
  },
  textAlign: {
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'left',
  },
  // Updated page number styles - positioned to right corner
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    right: 30, // Changed from center to right corner
    color: '#000000',
    zIndex: 3, // Ensure page number appears above everything
  },
  netQuantityRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    marginTop: 0,
    paddingTop: 2,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
  },
  netQuantityText: {
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 5,
    color: '#000000',
  },
  spacerRow: {
    height: 10,
    borderTopWidth: 0.25,
    borderTopColor: '#f2f2f2',
    borderTopStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  floorGroupingRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderTopWidth: 0.5,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    marginTop: 0,
    marginBottom: 0,
  },
  floorGroupingText: {
    fontWeight: 'bold',
    color: '#000000',
    fontSize: 10,
    textAlign: 'left',
    paddingLeft: 5,
  },
  subTotalRow: {
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#cccccc',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
  },
  // Content container to ensure proper spacing from page number
  contentContainer: {
    flex: 1,
    minHeight: 0, // Allow content to shrink if needed
  },
  // Adaptive signature section - standard size
  signatureSection: {
    marginTop: 15,
    marginBottom: 25,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
    position: 'relative',
    zIndex: 2,
    minHeight: 60,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    height: 50,
  },
  signatureBox: {
    width: '45%',
    alignItems: 'center',
    height: 50,
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: '100%',
    height: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    marginBottom: 3,
    justifyContent: 'flex-end',
    paddingBottom: 2,
    paddingHorizontal: 5,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  signatureLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginTop: 3,
  },
  signatureSubLabel: {
    fontSize: 7,
    textAlign: 'center',
    color: '#000000',
    marginTop: 1,
  },
  // Long quantity text handling - spans multiple columns for better display
  longQuantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Multi-column quantity display for very long numbers
  quantityMultiCol: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quantityOverflow: {
    fontSize: 9,
    textAlign: 'center',
    color: '#000000',
  },
});

// Function to calculate total quantity for an item's measurements
const calculateTotalQuantity = (measurements) => {
  if (!measurements || measurements.length === 0) return 0;
  return measurements.reduce((total, m) => total + (parseFloat(m.quantity) || 0), 0).toFixed(2);
};

// Group measurements by floor/lift (excluding empty/null values)
const groupMeasurementsByFloor = (measurements) => {
  const groups = {};
  
  if (!measurements || measurements.length === 0) return groups;
  
  measurements.forEach(m => {
    const floorValue = m.floorLiftRise;
    if (floorValue && floorValue.trim() !== '') {
      if (!groups[floorValue]) groups[floorValue] = [];
      groups[floorValue].push(m);
    } else {
      if (!groups['general']) groups['general'] = [];
      groups['general'].push(m);
    }
  });
  
  return groups;
};

// Calculate subtotal for a group of measurements
const calculateGroupSubtotal = (measurements) => {
  return measurements.reduce((total, m) => total + (parseFloat(m.quantity) || 0), 0).toFixed(2);
};

// Helper function to display value or empty space
const displayValue = (value, showDashForEmpty = true, isItemDescription = false) => {
  if (value && value.toString().trim() !== '') {
    return value;
  }
  
  if (isItemDescription) {
    return '';
  }
  
  return showDashForEmpty ? '-' : '';
};

// Helper function to get the correct measurement field values
const getMeasurementFieldValue = (measurement, fieldType) => {
  switch (fieldType) {
    case 'length':
      return measurement.length || measurement.l || measurement.L || '';
    case 'breadthWidth':
      return measurement.breadthWidth || measurement.width || measurement.breadth || measurement.b || measurement.B || measurement.w || measurement.W || '';
    case 'depthHeight':
      return measurement.depthHeight || measurement.height || measurement.depth || measurement.h || measurement.H || measurement.d || measurement.D || '';
    case 'number':
      return measurement.number || measurement.no || measurement.No || measurement.n || measurement.N || '';
    default:
      return '';
  }
};

// Helper function to check if quantity is too long for single column
const isQuantityTooLong = (quantity) => {
  const quantityStr = quantity.toString();
  // Consider quantity too long if more than 8 characters to be more conservative
  return quantityStr.length > 8; 
};

// Helper function to render quantity with overflow handling
const renderQuantityWithOverflow = (quantity, unit = '') => {
  const quantityStr = quantity.toString();
  
  if (isQuantityTooLong(quantityStr)) {
    // If quantity is too long, render it in description column with proper formatting
    return {
      isOverflow: true,
      quantityDisplay: quantityStr,
      unit: unit
    };
  }
  
  return {
    isOverflow: false,
    quantityDisplay: quantityStr,
    unit: unit
  };
};

// Helper function to determine if signature should go to next page
const shouldSignatureGoToNextPage = (availableSpace, signatureMinHeight = 80) => {
  // If available space is less than minimum required for proper signature display
  return availableSpace < signatureMinHeight;
};

// Improved Signature component that handles page breaks better
const AdaptiveSignature = ({ signatures, forceNewPage = false }) => {
  if (forceNewPage) {
    // Force signature to next page if space is insufficient
    return (
      <View break style={styles.signatureSection}>
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              {/* Empty signature line */}
            </View>
            <Text style={styles.signatureLabel}>PREPARED BY</Text>
            {signatures.preparedBy && (
              <Text style={styles.signatureName}>{signatures.preparedBy}</Text>
            )}
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              {/* Empty signature line */}
            </View>
            <Text style={styles.signatureLabel}>CHECKED BY</Text>
            {signatures.checkedBy && (
              <Text style={styles.signatureName}>{signatures.checkedBy}</Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Normal signature section with wrap protection
  return (
    <View style={styles.signatureSection} wrap={false}>
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            {/* Empty signature line */}
          </View>
          <Text style={styles.signatureLabel}>PREPARED BY</Text>
          {signatures.preparedBy && (
            <Text style={styles.signatureName}>{signatures.preparedBy}</Text>
          )}
        </View>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}>
            {/* Empty signature line */}
          </View>
          <Text style={styles.signatureLabel}>CHECKED BY</Text>
          {signatures.checkedBy && (
            <Text style={styles.signatureName}>{signatures.checkedBy}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Updated main component with better space management
export const MeasurementPDF = ({ 
  workOrderId, 
  nameOfWork, 
  items, 
  signatures = { preparedBy: '', checkedBy: '' }, 
  showWatermark = false,
  useCompactSignature = false
}) => {
  // Calculate if signature should go to next page based on content
  const shouldForceNewPageForSignature = () => {
    if (!items || items.length === 0) return false;
    
    let totalRows = 0;
    items.forEach(item => {
      totalRows += 1; // Item row
      if (item.measurements) {
        const groups = groupMeasurementsByFloor(item.measurements);
        Object.keys(groups).forEach(key => {
          if (key !== 'general') totalRows += 1; // Floor group header
          totalRows += groups[key].length; // Measurement rows
          if (key !== 'general' && groups[key].length > 1) totalRows += 1; // Subtotal
        });
      }
      totalRows += 1; // Net quantity row
    });
    
    // Estimate if content will leave insufficient space for signature
    const estimatedHeight = totalRows * 15 + 100; // Rough calculation
    return estimatedHeight > 600; // If content is likely to fill most of page
  };

  const forceSignatureNewPage = shouldForceNewPageForSignature();
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Border around the page */}
      <View style={styles.border} />
      
      {/* Enhanced Watermark */}
      {showWatermark && (
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>DEMO</Text>
        </View>
      )}
      
      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Work Name Header */}
        <Text style={styles.workNameHeader}>NAME OF WORK: {nameOfWork.toUpperCase()}</Text>
        <Text style={styles.measurementSheetTitle}>MEASUREMENT SHEET</Text>

        <View style={styles.table}>
          {/* Updated Table Header with proper alignment and unit column title */}
          <View style={styles.tableHeaderRow}>
            <View style={[styles.tableColHeader, styles.srNoCol]}>
              <Text>Sr.No.</Text>
            </View>
            <View style={[styles.tableColHeader, styles.itemNoCol]}>
              <Text>Item No.</Text>
            </View>
            <View style={[styles.tableColHeader, styles.descriptionCol]}>
              <Text>Description of Item</Text>
            </View>
            <View style={[styles.tableColHeader, styles.noCol]}>
              <Text>No.</Text>
            </View>
            <View style={[styles.tableColHeader, styles.lCol]}>
              <Text>Length</Text>
            </View>
            <View style={[styles.tableColHeader, styles.bwCol]}>
              <Text>Breadth/ Width</Text>
            </View>
            <View style={[styles.tableColHeader, styles.dhCol]}>
              <Text>Depth/ Height</Text>
            </View>
            <View style={[styles.tableColHeader, styles.qtyCol]}>
              <Text>Quantity</Text>
            </View>
            <View style={[styles.tableColHeader, styles.unitCol, styles.lastTableCol]}>
              <Text>Unit</Text>
            </View>
          </View>

          {/* Table Body with Items and Measurements */}
          {items.map((item, idx) => {
            const groupedMeasurements = groupMeasurementsByFloor(item.measurements);
            const isLastItem = idx === items.length - 1;
            
            return (
              <React.Fragment key={item.id || idx}>
                {/* Item Row */}
                <View style={[styles.tableRow, styles.itemRow]} wrap={false}>
                  <View style={[styles.tableCol, styles.srNoCol, styles.textAlign]}>
                    <Text>{idx + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.itemNoCol, styles.textAlign]}>
                    <Text>{displayValue(item.itemNo, false, true)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                    <Text>{displayValue(item.descriptionOfItem, false, true)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.noCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.lCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.bwCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.dhCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.qtyCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.unitCol, styles.lastTableCol, styles.centerAlign]}>
                    <Text>{item.unit || ''}</Text>
                  </View>
                </View>
                
                {/* Render measurements by floor groups */}
                {Object.keys(groupedMeasurements).map((floorKey, floorIdx) => {
                  const floorMeasurements = groupedMeasurements[floorKey];
                  const groupSubtotal = calculateGroupSubtotal(floorMeasurements);
                  
                  return (
                    <React.Fragment key={`floor-${floorIdx}`}>
                      {/* Floor Group Heading Row */}
                      {floorKey !== 'general' && (
                        <View style={[styles.floorGroupingRow]} wrap={false}>
                          <View style={[styles.tableCol, styles.srNoCol]}>
                            <Text></Text>
                          </View>
                          <View style={[styles.tableCol, styles.itemNoCol]}>
                            <Text></Text>
                          </View>
                          <View style={[styles.tableCol, { width: '58%' }]}>
                            <Text style={styles.floorGroupingText}>{floorKey}</Text>
                          </View>
                          <View style={[styles.tableCol, styles.qtyCol]}>
                            <Text></Text>
                          </View>
                          <View style={[styles.tableCol, styles.unitCol, styles.lastTableCol]}>
                            <Text></Text>
                          </View>
                        </View>
                      )}
                      
                      {/* Measurements within the floor */}
                      {floorMeasurements.map((measurement, mIdx) => {
                        const quantityValue = (parseFloat(measurement.quantity) || 0).toFixed(2);
                        const quantityInfo = renderQuantityWithOverflow(quantityValue, item.smallUnit || item.unit || '');
                        
                        return (
                          <View style={styles.tableRow} key={measurement.id || `m-${mIdx}`} wrap={false}>
                            <View style={[styles.tableCol, styles.srNoCol]}>
                              <Text></Text>
                            </View>
                            <View style={[styles.tableCol, styles.itemNoCol]}>
                              <Text></Text>
                            </View>
                            
                            {/* Handle long quantity display in description column */}
                            {quantityInfo.isOverflow ? (
                              <>
                                <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                                  <Text>{displayValue(measurement.description, false)} (Qty: {quantityInfo.quantityDisplay} {quantityInfo.unit})</Text>
                                </View>
                                <View style={[styles.tableCol, styles.noCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'number'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.lCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'length'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.bwCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'breadthWidth'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.dhCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'depthHeight'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                                  <Text>→</Text>
                                </View>
                                <View style={[styles.tableCol, styles.unitCol, styles.lastTableCol, styles.centerAlign]}>
                                  <Text>See Left</Text>
                                </View>
                              </>
                            ) : (
                              <>
                                <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                                  <Text>{displayValue(measurement.description, false)}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.noCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'number'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.lCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'length'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.bwCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'breadthWidth'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.dhCol, styles.centerAlign]}>
                                  <Text>{displayValue(getMeasurementFieldValue(measurement, 'depthHeight'))}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                                  <Text>{quantityInfo.quantityDisplay}</Text>
                                </View>
                                <View style={[styles.tableCol, styles.unitCol, styles.lastTableCol, styles.centerAlign]}>
                                  <Text>{quantityInfo.unit}</Text>
                                </View>
                              </>
                            )}
                          </View>
                        );
                      })}
                      
                      {/* Floor Subtotal Row */}
                      {floorKey !== 'general' && floorMeasurements.length > 1 && (
                        <View style={[styles.tableRow, styles.subTotalRow]} wrap={false}>
                          <View style={[styles.tableCol, styles.srNoCol]}>
                            <Text></Text>
                          </View>
                          <View style={[styles.tableCol, styles.itemNoCol]}>
                            <Text></Text>
                          </View>
                          <View style={[styles.tableCol, { width: '50%' }, styles.rightAlign]}>
                            <Text style={{ fontWeight: 'bold' }}>Subtotal for {floorKey}:</Text>
                          </View>
                          <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                            <Text style={{ fontWeight: 'bold' }}>{groupSubtotal}</Text>
                          </View>
                          <View style={[styles.tableCol, styles.unitCol, styles.centerAlign, styles.lastTableCol]}>
                            <Text style={{ fontWeight: 'bold' }}>{item.smallUnit || item.unit || ''}</Text>
                          </View>
                        </View>
                      )}
                    </React.Fragment>
                  );
                })}
                
                {/* Net Quantity Row with improved alignment */}
                <View style={[styles.netQuantityRow]} wrap={false}>
                  <View style={[styles.tableCol, styles.srNoCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.itemNoCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.descriptionCol, styles.rightAlign]}>
                    <Text style={styles.netQuantityText}>Net Quantity:</Text>
                  </View>
                  <View style={[styles.tableCol, styles.noCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.lCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.bwCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.dhCol]}>
                    <Text></Text>
                  </View>
                  <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                    <Text style={{ fontWeight: 'bold' }}>{calculateTotalQuantity(item.measurements)}</Text>
                  </View>
                  <View style={[styles.tableCol, styles.unitCol, styles.centerAlign, styles.lastTableCol]}>
                    <Text style={{ fontWeight: 'bold' }}>{item.smallUnit || item.unit || ''}</Text>
                  </View>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </View>
      
      {/* Adaptive Signature Section with better page break handling */}
      <AdaptiveSignature 
        signatures={signatures} 
        forceNewPage={forceSignatureNewPage}
      />
      
      
    </Page>
  );
};