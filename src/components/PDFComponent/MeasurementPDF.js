import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
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
  workNameHeader: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  measurementSheetTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
    color: '#000000',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#ffffff',
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
  },
  tableColHeader: {
    padding: 3,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  tableCol: {
    padding: 3,
    color: '#000000',
  },
  lastTableCol: {
    padding: 3,
    color: '#000000',
  },
  srNoCol: { width: '8%' },
  itemNoCol: { width: '10%' },
  descriptionCol: { width: '40%' },
  noCol: { width: '10%' },
  lCol: { width: '8%' },
  bwCol: { width: '8%' },
  dhCol: { width: '8%' },
  qtyCol: { width: '8%' },
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
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    right: 15,
    textAlign: 'right',
    color: '#000000',
  },
  netQuantityRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    marginTop: 0,
    paddingTop: 2,
    backgroundColor: '#ffffff',
  },
  netQuantityText: {
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 5,
    color: '#000000',
  },
  netQuantityValue: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000',
  },
  netQuantityUnit: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#000000',
  },
  spacerRow: {
    height: 10,
    borderTopWidth: 0.25,
    borderTopColor: '#f2f2f2',
    borderTopStyle: 'solid',
    backgroundColor: '#ffffff',
  },
  groupHeadingRow: {
    backgroundColor: '#f9f9f9',
    fontWeight: 'bold',
  },
  subTotalRow: {
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#cccccc',
    fontWeight: 'bold',
    backgroundColor: '#ffffff',
  }
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
    // Only group if floor/lift has a meaningful value
    if (floorValue && floorValue.trim() !== '') {
      if (!groups[floorValue]) groups[floorValue] = [];
      groups[floorValue].push(m);
    } else {
      // For measurements without floor/lift, add them to a general group
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

// Helper function to display value or empty space (no dash for main item description)
const displayValue = (value, showDashForEmpty = true, isItemDescription = false) => {
  if (value && value.toString().trim() !== '') {
    return value;
  }
  
  // For item description row, don't show dash, just return empty space
  if (isItemDescription) {
    return '';
  }
  
  // For measurement values, only show dash if showDashForEmpty is true
  return showDashForEmpty ? '-' : '';
};

// Main Measurement PDF Document Component
export const MeasurementPDF = ({ workOrderId, nameOfWork, items }) => (
  <Page size="A4" style={styles.page}>
    {/* Border around the page */}
    <View style={styles.border} />
    
    {/* Work Name Header */}
    <Text style={styles.workNameHeader}>NAME OF WORK: {nameOfWork.toUpperCase()}</Text>
    <Text style={styles.measurementSheetTitle}>MEASUREMENT SHEET</Text>

    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeaderRow}>
        <View style={[styles.tableColHeader, styles.srNoCol]}>
          <Text>Sr.No.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.itemNoCol]}>
          <Text>Item No.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.descriptionCol]}>
          <Text>Description OF Item</Text>
        </View>
        <View style={[styles.tableColHeader, styles.noCol]}>
          <Text>No.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.lCol]}>
          <Text>L</Text>
        </View>
        <View style={[styles.tableColHeader, styles.bwCol]}>
          <Text>B/W</Text>
        </View>
        <View style={[styles.tableColHeader, styles.dhCol]}>
          <Text>D/H</Text>
        </View>
        <View style={[styles.tableColHeader, styles.qtyCol, styles.lastTableCol]}>
          <Text>Quantity</Text>
        </View>
      </View>

      {/* Table Body with Items and Measurements */}
      {items.map((item, idx) => {
        // Group measurements by floor/lift
        const groupedMeasurements = groupMeasurementsByFloor(item.measurements);
        
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
                <Text>{displayValue(item.descriptionOfItem, false, true)} {item.unit ? `(${item.unit})` : ''}</Text>
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
              <View style={[styles.tableCol, styles.qtyCol, styles.lastTableCol]}>
                <Text></Text>
              </View>
            </View>
            
            {/* Render measurements by floor groups */}
            {Object.keys(groupedMeasurements).map((floorKey, floorIdx) => {
              const floorMeasurements = groupedMeasurements[floorKey];
              const groupSubtotal = calculateGroupSubtotal(floorMeasurements);
              
              return (
                <React.Fragment key={`floor-${floorIdx}`}>
                  {/* Floor Group Heading - only show if it's not the general group or has a meaningful floor value */}
                  {floorKey !== 'general' && (
                    <View style={[styles.tableRow, styles.groupHeadingRow]} wrap={false}>
                      <View style={[styles.tableCol, styles.srNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, styles.itemNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, { width: '66%' }, styles.descriptionText]}>
                        <Text style={{ fontWeight: 'bold', color: '#000000' }}>{floorKey}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.qtyCol, styles.lastTableCol]}>
                        <Text></Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Measurements within the floor */}
                  {floorMeasurements.map((measurement, mIdx) => (
                    <View style={styles.tableRow} key={measurement.id || `m-${mIdx}`} wrap={false}>
                      <View style={[styles.tableCol, styles.srNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, styles.itemNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                        <Text>{displayValue(measurement.description, false)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.noCol, styles.centerAlign]}>
                        <Text>{displayValue(measurement.number)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.lCol, styles.centerAlign]}>
                        <Text>{displayValue(measurement.length)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.bwCol, styles.centerAlign]}>
                        <Text>{displayValue(measurement.breadthWidth)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.dhCol, styles.centerAlign]}>
                        <Text>{displayValue(measurement.depthHeight)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign, styles.lastTableCol]}>
                        <Text>{(parseFloat(measurement.quantity) || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                  
                  {/* Floor Subtotal Row - only show if it's not the general group */}
                  {floorKey !== 'general' && (
                    <View style={[styles.tableRow, styles.subTotalRow]} wrap={false}>
                      <View style={[styles.tableCol, styles.srNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, styles.itemNoCol]}>
                        <Text></Text>
                      </View>
                      <View style={[styles.tableCol, { width: '58%' }, styles.rightAlign]}>
                        <Text>Subtotal for {floorKey}:</Text>
                      </View>
                      <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign, styles.lastTableCol]}>
                        <Text>{groupSubtotal}</Text>
                      </View>
                    </View>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Net Quantity Row for the Item */}
            <View style={[styles.netQuantityRow]} wrap={false}>
              <View style={[styles.tableCol, styles.srNoCol]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, styles.itemNoCol]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, { width: '58%' }, styles.netQuantityText]}>
                <Text>Net Quantity:</Text>
              </View>
              <View style={[styles.tableCol, styles.qtyCol, styles.netQuantityValue, styles.lastTableCol]}>
                <Text>{calculateTotalQuantity(item.measurements)} {item.smallUnit || ''}</Text>
              </View>
            </View>
            
            {/* Spacer Row */}
            <View style={[styles.tableRow, styles.spacerRow]}>
              <View style={[styles.emptyCol, { width: '100%' }]}>
                <Text> </Text>
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
    
    {/* Page Number */}
    <Text 
      style={styles.pageNumber} 
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
      fixed 
    />
  </Page>
);