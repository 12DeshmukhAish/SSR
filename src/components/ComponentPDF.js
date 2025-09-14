import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if needed
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/helvetica/v1/helvetica-regular.woff2',
});

// Configuration constants
const PORTRAIT_MAX_MATERIALS = 4; // Increased from 3 to 4 due to optimized widths
const MAX_COLUMNS_PER_PAGE_PORTRAIT = 4; // Increased from 3 to 4
const MAX_COLUMNS_PER_PAGE_LANDSCAPE = 12; // Increased from 8 to 12
const ROWS_PER_PAGE_PORTRAIT = 20;
const ROWS_PER_PAGE_LANDSCAPE = 15;
const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 8;

// Helper function to filter items with materials
const filterItemsWithMaterials = (items) => {
  return items.filter(item => 
    item.materials && Array.isArray(item.materials) && item.materials.length > 0
  );
};

// Helper function to calculate the maximum digits in quantity values
const calculateMaxQuantityDigits = (items) => {
  if (!items || items.length === 0) return 3; // Default minimum width
  
  const maxQuantity = Math.max(...items.map(item => {
    const qty = item.quantity || 0;
    // Count digits including decimal places
    return qty.toString().replace('.', '').length;
  }));
  
  // Return minimum of 3 digits, maximum of 8 digits for reasonable width
  return Math.max(3, Math.min(maxQuantity + 2, 8)); // +2 for decimal point and buffer
};

// Helper function to estimate content height for page fitting
const estimateContentHeight = (items, isLandscape, fontSize) => {
  if (!items || items.length === 0) return 0;
  
  const headerHeight = isLandscape ? 60 : 70;
  const rowHeight = isLandscape ? 35 : 42; // Average row height
  const totalRowHeight = isLandscape ? 30 : 35;
  const signaturesHeight = isLandscape ? 80 : 100;
  const margins = isLandscape ? 30 : 40;
  
  return headerHeight + (items.length * rowHeight) + totalRowHeight + signaturesHeight + margins;
};

// Enhanced function to split items with better page fitting
const smartSplitItemsIntoPages = (items, isLandscape, fontSize) => {
  if (!items || items.length === 0) return [[]];
  
  const maxRows = isLandscape ? ROWS_PER_PAGE_LANDSCAPE : ROWS_PER_PAGE_PORTRAIT;
  const pages = [];
  const pageHeight = isLandscape ? 595 : 842; // A4 dimensions in points
  
  let currentPageItems = [];
  let currentPageHeight = isLandscape ? 80 : 100; // Starting height for header
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemHeight = calculateRowHeight(item.description, isLandscape);
    
    // Check if adding this item would exceed 90% of page height (keeping 10% buffer)
    const maxUsableHeight = pageHeight * 0.9;
    const projectedHeight = currentPageHeight + itemHeight;
    
    // If we're approaching the limit or hit max rows, start a new page
    if ((projectedHeight > maxUsableHeight || currentPageItems.length >= maxRows) && currentPageItems.length > 0) {
      pages.push([...currentPageItems]);
      currentPageItems = [item];
      currentPageHeight = (isLandscape ? 80 : 100) + itemHeight; // Reset with header + current item
    } else {
      currentPageItems.push(item);
      currentPageHeight += itemHeight;
    }
  }
  
  // Add the last page if it has items
  if (currentPageItems.length > 0) {
    pages.push(currentPageItems);
  }
  
  return pages.length > 0 ? pages : [[]];
};

// Dynamic font size calculation based on content and orientation
const calculateFontSize = (materialCount, itemCount, isLandscape) => {
  let fontSize = MAX_FONT_SIZE;
  
  if (isLandscape) {
    // Landscape mode - smaller font due to more columns
    fontSize = Math.max(MIN_FONT_SIZE, MAX_FONT_SIZE - 1);
    if (materialCount > 8) fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
    if (materialCount > 10) fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
  } else {
    // Portrait mode - adjust based on material count
    if (materialCount > 3) fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
    if (materialCount > 4) fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
  }
  
  if (itemCount > 20) fontSize = Math.max(MIN_FONT_SIZE, fontSize - 0.5);
  
  return fontSize;
};

const calculateColumnWidths = (materialCount, isLandscape, maxQuantityDigits = 3) => {
  // Calculate quantity column width based on number of digits
  const baseQuantityWidth = 6;
  const widthPerDigit = 1.2;
  let quantityWidth = Math.max(6, Math.min(baseQuantityWidth + (maxQuantityDigits * widthPerDigit), 15));
  
  if (isLandscape) {
    // Landscape: Optimized for more materials
    let srNoWidth = 4;
    let itemWidth = 18; // Slightly reduced to give more space to materials
    
    // Adjust item width based on material count
    if (materialCount > 8) {
      itemWidth = 15;
      srNoWidth = 3;
      quantityWidth = Math.min(quantityWidth, 10);
    }
    if (materialCount > 10) {
      itemWidth = 12;
      srNoWidth = 3;
      quantityWidth = Math.min(quantityWidth, 8);
    }
    
    const fixedColumnsWidth = srNoWidth + itemWidth + quantityWidth;
    const availableWidth = 100 - fixedColumnsWidth;
    
    if (materialCount === 0) return { srNo: srNoWidth, item: itemWidth, quantity: quantityWidth, material: 0 };
    
    // Ensure minimum width for material columns to accommodate wrapped text
    const materialColumnWidth = Math.max(6, Math.min(availableWidth / materialCount, 12));
    
    return {
      srNo: srNoWidth,
      item: itemWidth,
      quantity: quantityWidth,
      material: materialColumnWidth
    };
  } else {
    // Portrait: Better space allocation for material names
    let srNoWidth = 5;
    let itemWidth = 25; // Reduced to give more space to materials
    
    // Adjust item width based on material count
    if (materialCount > 3) {
      itemWidth = 22;
      srNoWidth = 4;
      quantityWidth = Math.min(quantityWidth, 12);
    }
    if (materialCount > 4) {
      itemWidth = 18;
      srNoWidth = 4;
      quantityWidth = Math.min(quantityWidth, 10);
    }
    
    const fixedColumnsWidth = srNoWidth + itemWidth + quantityWidth;
    const availableWidth = 100 - fixedColumnsWidth;
    
    if (materialCount === 0) return { srNo: srNoWidth, item: itemWidth, quantity: quantityWidth, material: 0 };
    
    // Ensure good minimum width for material columns
    const materialColumnWidth = Math.max(10, Math.min(availableWidth / materialCount, 20));
    
    return {
      srNo: srNoWidth,
      item: itemWidth,
      quantity: quantityWidth,
      material: materialColumnWidth
    };
  }
};

// Split materials into pages based on orientation
const splitMaterialsIntoPages = (materials, isLandscape) => {
  const maxColumns = isLandscape ? MAX_COLUMNS_PER_PAGE_LANDSCAPE : MAX_COLUMNS_PER_PAGE_PORTRAIT;
  const pages = [];
  for (let i = 0; i < materials.length; i += maxColumns) {
    pages.push(materials.slice(i, i + maxColumns));
  }
  return pages.length > 0 ? pages : [[]];
};

// Enhanced row height calculation with better text fitting
const calculateRowHeight = (text, isLandscape, maxWidth = null) => {
  if (!text) return isLandscape ? 28 : 35;
  
  // More accurate estimation based on text length and available width
  const avgCharsPerLine = isLandscape ? 18 : 25; // Conservative estimate
  const estimatedLines = Math.ceil(text.length / avgCharsPerLine);
  const lineHeight = isLandscape ? 11 : 13; // Height per line
  const basePadding = isLandscape ? 8 : 10; // Top and bottom padding
  
  // Calculate total height needed
  const calculatedHeight = Math.max(1, estimatedLines) * lineHeight + basePadding;
  
  // Set minimum and maximum heights with better constraints
  const minHeight = isLandscape ? 28 : 35;
  const maxHeight = isLandscape ? 70 : 85; // Reduced max height to fit more content
  
  return Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
};

export const MeasurementComponentPDF = ({ 
  workName, 
  items = [], 
  allMaterials = [], 
  materialData = {}, 
  materialTotals = {},
  signatures = { preparedBy: '', checkedBy: '' },
  ssrName = ''
}) => {
  // Filter items to only include those with materials
  const filteredItems = filterItemsWithMaterials(items);
  
  // Calculate maximum quantity digits for dynamic column width
  const maxQuantityDigits = calculateMaxQuantityDigits(filteredItems);
  
  // Determine orientation based on number of materials
  const isLandscape = allMaterials.length > PORTRAIT_MAX_MATERIALS;
  const orientation = isLandscape ? 'landscape' : 'portrait';
  
  // Calculate dynamic sizing based on filtered items and orientation
  const fontSize = calculateFontSize(allMaterials.length, filteredItems.length, isLandscape);
  const columnWidths = calculateColumnWidths(allMaterials.length, isLandscape, maxQuantityDigits);
  
  // Split materials and filtered items for pagination with smart fitting
  const materialPages = splitMaterialsIntoPages(allMaterials, isLandscape);
  const itemPages = smartSplitItemsIntoPages(filteredItems, isLandscape, fontSize);
  
  // Calculate total pages needed
  const totalPages = Math.max(materialPages.length, itemPages.length, 1);
  
  // Create dynamic styles based on orientation
  const createDynamicStyles = (currentMaterialCount, isLandscapeMode) => StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: fontSize,
      padding: isLandscapeMode ? 12 : 16, // Slightly reduced padding for more space
      backgroundColor: '#FFFFFF',
    },
    header: {
      textAlign: 'center',
      marginBottom: isLandscapeMode ? 8 : 12, // Reduced margin
    },
    title: {
      fontSize: isLandscapeMode ? 12 : 14,
      fontWeight: 'bold',
      marginBottom: 5,
      textTransform: 'uppercase',
      lineHeight: 1.1,
    },
    subtitle: {
      fontSize: isLandscapeMode ? 10 : 12,
      fontWeight: 'bold',
      marginBottom: isLandscapeMode ? 6 : 10,
      lineHeight: 1.1,
    },
    orientationNote: {
      fontSize: 7,
      color: '#666',
      textAlign: 'center',
      marginTop: 2,
      fontStyle: 'italic',
    },
    table: {
      display: 'table',
      width: '100%',
      borderWidth: 1,
      borderColor: '#000',
      borderStyle: 'solid',
      marginBottom: isLandscapeMode ? 8 : 12,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#000',
      borderBottomStyle: 'solid',
    },
    tableHeader: {
      backgroundColor: '#f0f0f0',
      fontWeight: 'bold',
    },
    tableCell: {
      padding: isLandscapeMode ? 2 : 3,
      borderRightWidth: 1,
      borderRightColor: '#000',
      borderRightStyle: 'solid',
      textAlign: 'center',
      fontSize: fontSize,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: isLandscapeMode ? 3 : 4,
      paddingBottom: isLandscapeMode ? 3 : 4,
      overflow: 'visible',
    },
    tableCellLeft: {
      padding: isLandscapeMode ? 2 : 3,
      borderRightWidth: 1,
      borderRightColor: '#000',
      borderRightStyle: 'solid',
      textAlign: 'left',
      fontSize: fontSize,
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      paddingTop: isLandscapeMode ? 3 : 4,
      paddingBottom: isLandscapeMode ? 3 : 4,
      overflow: 'visible',
    },
    srNoCell: {
      width: `${columnWidths.srNo}%`,
      textAlign: 'center',
    },
    itemCell: {
      width: `${columnWidths.item}%`,
      textAlign: 'left',
    },
    quantityCell: {
      width: `${columnWidths.quantity}%`,
      textAlign: 'center',
    },
   materialHeaderCell: {
  width: `${columnWidths.material}%`,
  flexDirection: 'column',
  padding: isLandscapeMode ? 2 : 3,
  alignItems: 'center',
  justifyContent: 'flex-start',
  minHeight: isLandscapeMode ? 45 : 55, // Increased height to accommodate wrapped text
  overflow: 'visible', // Changed from 'hidden' to 'visible'
},

   materialHeaderText: {
  fontSize: Math.max(5, fontSize - (currentMaterialCount > 8 ? 1.5 : 1)),
  fontWeight: 'bold',
  marginBottom: 2,
  textAlign: 'center',
  lineHeight: 1.1,
  overflow: 'visible', // Changed from 'hidden' to 'visible'
  flexWrap: 'wrap', // Allow text to wrap
  width: '100%',
  paddingHorizontal: 1,
},
   materialSubHeader: {
  flexDirection: 'row',
  width: '100%',
  marginTop: 'auto', // Push to bottom of the header cell
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
},
    materialSubCell: {
      width: '50%',
      padding: isLandscapeMode ? 0.5 : 1,
      fontSize: Math.max(4, fontSize - 2),
      backgroundColor: '#e0e0e0',
      textAlign: 'center',
      borderRightWidth: 0.5,
      borderRightColor: '#999',
      borderRightStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isLandscapeMode ? 12 : 15,
      overflow: 'hidden',
    },
    materialDataCell: {
      width: `${columnWidths.material}%`,
      flexDirection: 'column',
      padding: 0,
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden',
    },
    materialDataRow: {
      flexDirection: 'row',
      width: '100%',
      minHeight: isLandscapeMode ? 26 : 32,
    },
    materialDataSubCell: {
      width: '50%',
      padding: isLandscapeMode ? 1 : 2,
      fontSize: Math.max(5, fontSize - 0.5),
      textAlign: 'center',
      borderRightWidth: 0.5,
      borderRightColor: '#ccc',
      borderRightStyle: 'solid',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: isLandscapeMode ? 2 : 3,
      overflow: 'visible',
    },
    itemDescriptionContainer: {
      width: '100%',
      overflow: 'visible',
      justifyContent: 'flex-start',
      paddingTop: 1,
    },
    itemDescription: {
      fontSize: Math.max(5, fontSize - (currentMaterialCount > 6 ? 1.5 : 1)),
      marginBottom: isLandscapeMode ? 1 : 2,
      fontWeight: 'bold',
      lineHeight: 1.1, // Tighter line height for better fitting
      textAlign: 'left',
    },
    itemCode: {
      fontSize: Math.max(4, fontSize - (currentMaterialCount > 6 ? 2.5 : 2)),
      color: '#666',
      lineHeight: 1.0,
      textAlign: 'left',
      wordWrap: 'break-word',
    },
    totalRow: {
      backgroundColor: '#f0f0f0',
      fontWeight: 'bold',
    },
  totalCell: {
  padding: isLandscapeMode ? 3 : 4,
  borderRightWidth: 1,
  borderRightColor: '#000',
  borderRightStyle: 'solid',
  textAlign: 'left',
  fontSize: fontSize,
  fontWeight: 'bold',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  minHeight: isLandscapeMode ? 22 : 28,
},

// 2. Add this NEW style after totalCell in your createDynamicStyles function:
totalMaterialCell: {
  padding: isLandscapeMode ? 3 : 4,
  paddingLeft: isLandscapeMode ? 6 : 8,
  borderRightWidth: 1,
  borderRightColor: '#000',
  borderRightStyle: 'solid',
  textAlign: 'left',
  fontSize: fontSize,
  fontWeight: 'bold',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  minHeight: isLandscapeMode ? 22 : 28,
  width: `${columnWidths.material}%`,
},
    totalLabelCell: {
      width: `${columnWidths.srNo + columnWidths.item + columnWidths.quantity}%`,
    },
    signaturesSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginTop: isLandscapeMode ? 12 : 20,
      paddingTop: isLandscapeMode ? 8 : 12,
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
      height: isLandscapeMode ? 25 : 35,
      width: '100%',
      marginBottom: 6,
    },
    signatureLabel: {
      fontSize: fontSize,
      fontWeight: 'bold',
      marginBottom: 3,
      textAlign: 'center',
      color: '#000',
    },
    signatureName: {
      fontSize: fontSize - 1,
      color: '#000',
      textAlign: 'center',
      marginTop: 2,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 8,
      right: 12,
      fontSize: fontSize - 1,
      color: '#666',
    },
    emptyMessage: {
      width: '100%',
      textAlign: 'center',
      padding: 20,
      fontSize: fontSize + 1,
      color: '#666',
    },
    noMaterialsMessage: {
      width: '100%',
      textAlign: 'center',
      padding: 25,
      fontSize: fontSize + 2,
      color: '#666',
      fontStyle: 'italic',
    },
  });

  // Render a single page
  const renderPage = (pageIndex) => {
    const currentMaterials = materialPages[Math.min(pageIndex, materialPages.length - 1)] || [];
    const currentItems = itemPages[Math.min(pageIndex, itemPages.length - 1)] || [];
    const isLastPage = pageIndex === totalPages - 1;
    const styles = createDynamicStyles(currentMaterials.length, isLandscape);
    
    // Calculate starting serial number for this page based on actual items shown so far
    let startingSerialNumber = 1;
    for (let i = 0; i < pageIndex; i++) {
      const previousPageItems = itemPages[Math.min(i, itemPages.length - 1)] || [];
      startingSerialNumber += previousPageItems.length;
    }
    
    return (
      <Page key={pageIndex} size="A4" orientation={orientation} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            NAME OF WORK- {workName ? workName.toUpperCase() : 'CONSTRUCTION OF BUILDING'}
          </Text>
          <Text style={styles.subtitle}>
            OTHER MATERIAL COMPONENTS
          </Text>
          Show orientation info
          {/* <Text style={styles.orientationNote}>
            {isLandscape 
              ? ` ${allMaterials.length} materials (${currentMaterials.length} shown) | Page ${pageIndex + 1} of ${totalPages}`
              : ` ${allMaterials.length} materials (${currentMaterials.length} shown) | Page ${pageIndex + 1} of ${totalPages}`
            }
          </Text> */}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Show message if no items with materials */}
          {filteredItems.length === 0 && pageIndex === 0 ? (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.noMaterialsMessage]}>
                <Text>No items with materials found. Only items that have associated materials will be displayed in this report.</Text>
              </View>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={[styles.tableCell, styles.srNoCell]}>
                  <Text>Sr No.</Text>
                </View>
                <View style={[styles.tableCell, styles.itemCell]}>
                  <Text>Item Of Work</Text>
                </View>
                <View style={[styles.tableCell, styles.quantityCell]}>
                  <Text>Qty</Text>
                </View>
                
                {/* Material Headers */}
                {currentMaterials.map((material, index) => {
                  // Adjust material name length based on orientation and column width
                  const maxLength = isLandscape ? 8 : 12;
                const displayName = material.toUpperCase();
                    
                  return (
    <View key={`${pageIndex}-${material}`} style={[styles.tableCell, styles.materialHeaderCell, { position: 'relative' }]}>
      <Text style={styles.materialHeaderText}>
        {displayName}
      </Text>
      <View style={styles.materialSubHeader}>
        <View style={[styles.materialSubCell, { borderRightWidth: 0.5 }]}>
          <Text>Con.</Text>
        </View>
        <View style={[styles.materialSubCell, { borderRightWidth: 0 }]}>
          <Text>Qty.</Text>
        </View>
      </View>
    </View>
  );
})}
              </View>

              {/* Table Body */}
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => {
                  // Calculate correct serial number: starting number + current index
                  const serialNumber = startingSerialNumber + index;
                  
                  // Calculate dynamic row height based on description length
                  const rowHeight = calculateRowHeight(item.description, isLandscape);
                  
                  return (
                    <View key={item.id || `${pageIndex}-${index}`} style={[styles.tableRow, { minHeight: rowHeight }]}>
                      <View style={[styles.tableCellLeft, styles.srNoCell, { minHeight: rowHeight }]}>
                        <Text>{serialNumber}</Text>
                      </View>
                      <View style={[styles.tableCellLeft, styles.itemCell, { minHeight: rowHeight }]}>
                        <View style={styles.itemDescriptionContainer}>
                          <Text style={styles.itemDescription}>
                            {item.description || 'No description'}
                          </Text>
                          <Text style={styles.itemCode}>
                            SSR OF {ssrName || 'N/A'} ITEM NO. {item.itemNo || 'N/A'} PAGE NO. {item.pageNo || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.tableCell, styles.quantityCell, { minHeight: rowHeight }]}>
                        <Text>{(item.quantity || 0).toFixed(1)}</Text>
                      </View>
                      
                      {/* Material Data */}
                      {currentMaterials.map((material, materialIndex) => {
                        const materialInfo = materialData[item.id]?.[material];
                        const constantValue = materialInfo ? materialInfo.constant.toFixed(isLandscape ? 2 : 3) : '-';
                        const quantityValue = materialInfo ? materialInfo.total.toFixed(2) : '-';
                        
                        return (
                          <View key={`${item.id}-${material}`} style={[styles.tableCell, styles.materialDataCell, { minHeight: rowHeight }]}>
                            <View style={[styles.materialDataRow, { minHeight: rowHeight }]}>
                              <View style={[styles.materialDataSubCell, { borderRightWidth: 0.5, minHeight: rowHeight }]}>
                                <Text style={{ fontSize: Math.max(4, fontSize - 1) }}>
                                  {constantValue}
                                </Text>
                              </View>
                              <View style={[styles.materialDataSubCell, { borderRightWidth: 0, minHeight: rowHeight }]}>
                                <Text style={{ fontSize: Math.max(4, fontSize - 1) }}>
                                  {quantityValue}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })
              ) : (
                pageIndex === 0 && (
                  <View style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.emptyMessage]}>
                      <Text>No items with materials found for this page.</Text>
                    </View>
                  </View>
                )
              )}

              {/* Totals Row - Only on last page */}
           {isLastPage && currentItems.length > 0 && (
  <View style={[styles.tableRow, styles.totalRow]}>
    <View style={[styles.totalCell, styles.totalLabelCell]}>
      <Text>TOTAL:</Text>
    </View>
    {currentMaterials.map((material, materialIndex) => {
      const totalValue = (materialTotals[material] || 0).toFixed(2);
      return (
        <View key={`total-${material}`} style={styles.totalMaterialCell}>
          <Text style={{ 
            fontSize: fontSize, 
            fontWeight: 'bold',
            textAlign: 'left'
          }}>
            {totalValue}
          </Text>
        </View>
      );
    })}
  </View>
)}
            </>
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
      </Page>
    );
  };

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, pageIndex) => renderPage(pageIndex))}
    </Document>
  );
};