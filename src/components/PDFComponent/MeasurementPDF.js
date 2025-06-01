import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
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
  },
  measurementSheetTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderStyle: 'none',
    marginBottom: 0,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    backgroundColor: '#f2f2f2',
    marginBottom: 0,
  },
  tableColHeader: {
    padding: 3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCol: {
    padding: 3,
  },
  lastTableCol: {
    padding: 3,
  },
  srNoCol: { width: '5%' },
  itemNoCol: { width: '8%' },
  descriptionCol: { width: '31%' },
  noCol: { width: '10%' },
  lCol: { width: '7%' },
  bwCol: { width: '7%' },
  dhCol: { width: '7%' },
  qtyCol: { width: '10%' },
  floorCol: { width: '15%' },
  emptyCol: {
    padding: 3,
  },
  itemRow: {
    marginTop: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid',
  },
  totalRow: {
    flexDirection: 'row',
    borderBottomWidth: 0,
    fontWeight: 'bold',
    marginTop: 0,
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
  },
  netQuantityRow: {
    flexDirection: 'row',
    fontWeight: 'bold',
    marginTop: 0,
    paddingTop: 2,
  },
  netQuantityText: {
    textAlign: 'right',
    fontWeight: 'bold',
    paddingRight: 5,
  },
  netQuantityValue: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  netQuantityUnit: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  floorLiftText: {
    textAlign: 'center',
    fontSize: 9,
  },
  spacerRow: {
    height: 10,
    borderTopWidth: 0.25,
    borderTopColor: '#f2f2f2',
    borderTopStyle: 'solid',
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
  }
});

// Function to calculate total quantity for an item's measurements
const calculateTotalQuantity = (measurements) => {
  if (!measurements || measurements.length === 0) return 0;
  return measurements.reduce((total, m) => total + (parseFloat(m.quantity) || 0), 0).toFixed(2);
};

// Group measurements by floor/lift
const groupMeasurementsByFloor = (measurements) => {
  const groups = {};
  
  if (!measurements || measurements.length === 0) return groups;
  
  measurements.forEach(m => {
    const key = m.floorLiftRise || 'No Floor/Lift Specified';
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  
  return groups;
};

// Calculate subtotal for a group of measurements
const calculateGroupSubtotal = (measurements) => {
  return measurements.reduce((total, m) => total + (parseFloat(m.quantity) || 0), 0).toFixed(2);
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
        <View style={[styles.tableColHeader, styles.qtyCol]}>
          <Text>Quantity</Text>
        </View>
        <View style={[styles.tableColHeader, styles.floorCol, styles.lastTableCol]}>
          <Text>Floor Rise/Lift</Text>
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
                <Text>{item.itemNo}</Text>
              </View>
              <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                <Text>{item.descriptionOfItem} {item.unit ? `(${item.unit})` : ''}</Text>
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
              <View style={[styles.tableCol, styles.floorCol, styles.floorLiftText, styles.lastTableCol]}>
                <Text>{item.floorLiftRise || ''}</Text>
              </View>
            </View>
            
            {/* Render measurements by floor groups */}
            {Object.keys(groupedMeasurements).map((floorKey, floorIdx) => {
              const floorMeasurements = groupedMeasurements[floorKey];
              const groupSubtotal = calculateGroupSubtotal(floorMeasurements);
              
              return (
                <React.Fragment key={`floor-${floorIdx}`}>
                  {/* Floor Group Heading */}
                  <View style={[styles.tableRow, styles.groupHeadingRow]} wrap={false}>
                    <View style={[styles.tableCol, styles.srNoCol]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCol, styles.itemNoCol]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCol, { width: '77%' }, styles.descriptionText]}>
                      <Text style={{ fontWeight: 'bold' }}>{floorKey}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.floorCol, styles.lastTableCol]}>
                      <Text></Text>
                    </View>
                  </View>
                  
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
                        <Text>{measurement.description || ''}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.noCol, styles.centerAlign]}>
                        <Text>{measurement.number || ''}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.lCol, styles.centerAlign]}>
                        <Text>{measurement.length || ''}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.bwCol, styles.centerAlign]}>
                        <Text>{measurement.breadthWidth || ''}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.dhCol, styles.centerAlign]}>
                        <Text>{measurement.depthHeight || ''}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                        <Text>{(parseFloat(measurement.quantity) || 0).toFixed(2)}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.floorCol, styles.lastTableCol]}>
                        <Text></Text>
                      </View>
                    </View>
                  ))}
                  
                  {/* Floor Subtotal Row */}
                  <View style={[styles.tableRow, styles.subTotalRow]} wrap={false}>
                    <View style={[styles.tableCol, styles.srNoCol]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCol, styles.itemNoCol]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCol, { width: '49%' }, styles.rightAlign]}>
                      <Text>Subtotal for {floorKey}:</Text>
                    </View>
                    <View style={[styles.tableCol, { width: '21%' }]}>
                      <Text></Text>
                    </View>
                    <View style={[styles.tableCol, styles.qtyCol, styles.centerAlign]}>
                      <Text>{groupSubtotal}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.floorCol, styles.lastTableCol]}>
                      <Text></Text>
                    </View>
                  </View>
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
              <View style={[styles.tableCol, { width: '49%' }, styles.netQuantityText]}>
                <Text>Net Quantity:</Text>
              </View>
              <View style={[styles.tableCol, { width: '21%' }]}>
                <Text></Text>
              </View>
              <View style={[styles.tableCol, styles.qtyCol, styles.netQuantityValue]}>
                <Text>{calculateTotalQuantity(item.measurements)}</Text>
              </View>
              <View style={[styles.tableCol, styles.floorCol, styles.netQuantityUnit, styles.lastTableCol]}>
                <Text>{item.unit || ''}</Text>
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