import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from '@react-pdf/renderer';

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
    // Removed the right border for column headers
  },
  tableCol: {
    padding: 3,
    // Removed the right border for cells
  },
  lastTableCol: {
    padding: 3,
  },
  srNoCol: { width: '5%' },
  itemNoCol: { width: '8%' },
  descriptionCol: { width: '31%' }, // Increased width to accommodate unit column removal
  noCol: { width: '10%' },
  lCol: { width: '7%' },
  bwCol: { width: '7%' },
  dhCol: { width: '7%' },
  qtyCol: { width: '10%' },
  floorCol: { width: '15%' }, // Increased width for floor/lift
  emptyCol: {
    padding: 3,
    // Removed the right border
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
    // Removed top border
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
    borderTopWidth: 0.25, // ↓ even fainter line
    borderTopColor: '#f2f2f2',
    borderTopStyle: 'solid',
  },
});

// Function to calculate total quantity for an item's measurements
const calculateTotalQuantity = (measurements) => {
  if (!measurements || measurements.length === 0) return 0;
  return measurements.reduce((total, m) => total + (parseFloat(m.quantity) || 0), 0).toFixed(2);
};

// Main PDF Document Component
const MeasurementPDF = ({ workOrderId, nameOfWork, items }) => (
  <Document>
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
        {items.map((item, idx) => (
          <React.Fragment key={item.id || idx}>
            {/* Item Row */}
            <View style={[styles.tableRow, styles.itemRow]}wrap={false}>
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
            
            {/* Measurement Rows */}
            {item.measurements && item.measurements.map((m, i) => (
              <View style={styles.tableRow} key={`measurement-${i}`}wrap={false}>
                <View style={[styles.emptyCol, styles.srNoCol]}>
                  <Text></Text>
                </View>
                <View style={[styles.emptyCol, styles.itemNoCol]}>
                  <Text></Text>
                </View>
                <View style={[styles.tableCol, styles.descriptionCol, styles.descriptionText]}>
                  <Text>{m.description || ''}</Text>
                </View>
                <View style={[styles.tableCol, styles.noCol, styles.textAlign]}>
                  <Text>
                    {m.number}x{m.multiplyNumber || 1}= {m.number * (m.multiplyNumber || 1)} x
                  </Text>
                </View>
                <View style={[styles.tableCol, styles.lCol, styles.textAlign]}>
                  <Text>{m.length} x</Text>
                </View>
                <View style={[styles.tableCol, styles.bwCol, styles.textAlign]}>
                  <Text>{m.width} x</Text>
                </View>
                <View style={[styles.tableCol, styles.dhCol, styles.textAlign]}>
                  <Text>{m.height} =</Text>
                </View>
                <View style={[styles.tableCol, styles.qtyCol, styles.textAlign]}>
                  <Text>{m.quantity}</Text>
                </View>
                <View style={[styles.tableCol, styles.floorCol, styles.floorLiftText, styles.lastTableCol]}>
                  <Text>{m.floorLiftRise || ''}</Text>
                </View>
              </View>
            ))}
            
            {/* Net Quantity Row */}
            {item.measurements && item.measurements.length > 0 && (
              <React.Fragment>
                <View style={styles.netQuantityRow}>
                  <View style={[{ width: '72%', padding: 3 }, styles.netQuantityText]}>
                    <Text>Net Quantity:</Text>
                  </View>
                  <View style={[{ width: '10%', padding: 3 }, styles.netQuantityValue]}>
                    <Text>{calculateTotalQuantity(item.measurements)}</Text>
                  </View>
                  <View style={[{ width: '3%', padding: 3, textAlign: 'center' }, styles.netQuantityUnit]}>
                    <Text>{item.unit || item.measurements[0]?.unit || ''}</Text>
                  </View>
                  <View style={[{ width: '15%', padding: 3 }, styles.lastTableCol]}>
                    <Text></Text>
                  </View>
                </View>
                
                {/* Add spacer row after each item */}
                <View style={styles.spacerRow} />

              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </View>
      
      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} 
        fixed 
      />
    </Page>
  </Document>
);

// Component for exporting the PDF
const MeasurementPDFExport = ({ nameOfWork, items, workOrderId, revisionNumber }) => {
  // Generate a work order ID if not provided
  const generateWorkOrderId = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `27WO${year}${month}${day}${random}`;
  };

  const finalWorkOrderId = workOrderId || generateWorkOrderId();
  const finalRevisionNumber = revisionNumber || '1.0';
  const fileName = `${finalWorkOrderId}_${finalRevisionNumber}.pdf`;
  
  // Format items data to include measurements
  const formatItemsWithMeasurements = (items) => {
    return items.map(item => {
      // If item already has measurements property, return as is
      if (item.measurements) return item;
      
      // Otherwise, assume measurements will be loaded separately
      // This is a placeholder for where you'd fetch measurements if needed
      return {
        ...item,
        measurements: [] // This would be populated with actual measurements data
      };
    });
  };

  const formattedItems = formatItemsWithMeasurements(items);
  
  return (
    <div className="text-center mt-6">
      <PDFDownloadLink
        document={<MeasurementPDF workOrderId={finalWorkOrderId} nameOfWork={nameOfWork} items={formattedItems} />}
        fileName={fileName}
      >
        {({ loading, error }) => {
          if (error) {
            console.error("PDF generation error:", error);
            return <button className="bg-red-600 text-white px-4 py-2 rounded">Error generating PDF</button>;
          }
          return (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {loading ? 'Generating PDF...' : 'Download  PDF'}
            </button>
          );
        }}
      </PDFDownloadLink>
    </div>
  );
};

export default MeasurementPDFExport;