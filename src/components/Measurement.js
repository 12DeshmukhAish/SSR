import React, { useEffect, useState } from 'react';
import Stepper from '../components/Stepper';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink, 
  Font 
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
                    
                    {/* Measurements for this floor */}
                    {floorMeasurements.map((m, i) => (
                      <View style={styles.tableRow} key={`measurement-${floorIdx}-${i}`} wrap={false}>
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
                            {m.number && `${m.number}${m.multiplyNumber ? ` × ${m.multiplyNumber}` : ''}`}
                            {(m.number && m.multiplyNumber) ? ` = ${m.number * m.multiplyNumber} ×` : m.number ? ' ×' : ''}
                          </Text>
                        </View>
                        <View style={[styles.tableCol, styles.lCol, styles.textAlign]}>
                          <Text>{m.length ? `${m.length} ×` : ''}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.bwCol, styles.textAlign]}>
                          <Text>{m.width ? `${m.width} ×` : ''}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.dhCol, styles.textAlign]}>
                          <Text>{m.height ? `${m.height} =` : ''}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.qtyCol, styles.textAlign]}>
                          <Text>{m.quantity}</Text>
                        </View>
                        <View style={[styles.tableCol, styles.floorCol, styles.floorLiftText, styles.lastTableCol]}>
                          <Text>{m.floorLiftRise || ''}</Text>
                        </View>
                      </View>
                    ))}
                    
                    {/* Subtotal for this floor group */}
                    <View style={[styles.tableRow, styles.subTotalRow]} wrap={false}>
                      <View style={[styles.tableCol, { width: '75%' }, styles.netQuantityText, { textAlign: 'right' }]}>
                        <Text>Subtotal for {floorKey}:</Text>
                      </View>
                      <View style={[styles.tableCol, styles.qtyCol, styles.textAlign]}>
                        <Text>{groupSubtotal}</Text>
                      </View>
                      <View style={[styles.tableCol, styles.floorCol, styles.lastTableCol]}>
                        <Text>{item.unit || ''}</Text>
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
              
              {/* Net Quantity Row */}
              {item.measurements && item.measurements.length > 0 && (
                <React.Fragment>
                  <View style={[styles.netQuantityRow, { borderTopWidth: 2, borderTopColor: '#000', borderTopStyle: 'solid' }]}>
                    <View style={[{ width: '75%', padding: 3 }, styles.netQuantityText]}>
                      <Text>Net Quantity:</Text>
                    </View>
                    <View style={[styles.qtyCol, styles.netQuantityValue]}>
                      <Text>{calculateTotalQuantity(item.measurements)}</Text>
                    </View>
                    <View style={[styles.floorCol, styles.netQuantityUnit, styles.lastTableCol]}>
                      <Text>{item.unit || item.measurements[0]?.unit || ''}</Text>
                    </View>
                  </View>
                  
                  {/* Add spacer row after each item */}
                  <View style={styles.spacerRow} />
                </React.Fragment>
              )}
            </React.Fragment>
          );
        })}
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
  
  return (
    <div className="text-center mt-6">
      <PDFDownloadLink
        document={<MeasurementPDF workOrderId={finalWorkOrderId} nameOfWork={nameOfWork} items={items} />}
        fileName={fileName}
        className="inline-block"
      >
        {({ loading, error }) => {
          if (error) {
            console.error("PDF generation error:", error);
            return <button className="bg-red-600 text-white px-4 py-2 rounded">Error generating PDF</button>;
          }
          return (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              {loading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          );
        }}
      </PDFDownloadLink>
    </div>
  );
};

const PDFGenerator = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nameOfWork = localStorage.getItem('nameOfWork') || 'Measurement Sheet';
  const workOrderId = localStorage.getItem('pdfWorkOrderId') || localStorage.getItem('autogenerated') || '';
  const revisionNumber = localStorage.getItem('pdfRevisionNumber') || localStorage.getItem('reviseno') || '1.0';
  
  // Get token from localStorage or use the provided one
  const token = localStorage.getItem('authToken') || 
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ2OTI5NTA1LCJleHAiOjE3NDcwMTU5MDV9.YyYwwuDLYkyB5YyGKxESmLSZ1KxRKBxUVGej2IFLvwM";

  const fetchMeasurements = async (itemId) => {
    try {
      const res = await fetch(`https://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
      // Get items from localStorage
      const subRecordCache = localStorage.getItem('subRecordCache');
      
      if (!subRecordCache) {
        setError("No measurement data found in local storage");
        setLoading(false);
        return;
      }
      
      // Parse the stored JSON
      let parsedItems;
      try {
        const itemsObject = JSON.parse(subRecordCache);
        
        // Handle different data structures
        if (Array.isArray(itemsObject)) {
          parsedItems = itemsObject;
        } else if (typeof itemsObject === 'object') {
          // Convert object values into a single array
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
      
      // Fetch measurements for each item
      const detailedItems = await Promise.all(
        parsedItems.map(async (item) => {
          const measurements = await fetchMeasurements(item.id);
          return { ...item, measurements };
        })
      );
      
      setItems(detailedItems);
    } catch (err) {
      console.error("Error fetching item details:", err);
      setError("Failed to load measurement data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleUpdateStatus = async () => {
    try {
      const wid = localStorage.getItem('workorderId');
      if (!wid) {
        console.warn("No work order ID found, status update skipped");
        return;
      }
      
      const response = await fetch(`https://24.101.103.87:8082/api/workorders/${wid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "completed" })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update work order status");
      }
      
      const result = await response.json();
      console.log("Work order status updated:", result);
      alert("Work order marked as completed successfully!");
    } catch (err) {
      console.error("Error updating work order status:", err);
      alert("Failed to update work order status");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stepper */}
      <div className="mb-6">
        <Stepper currentStep={7} />
      </div>
      
      {/* PDF Preview Section */}
      <div className="bg-white p-4 border rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
          PDF Preview - Measurement Sheet
        </h2>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading measurement data...</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchItems} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6">
            <p>No measurement items found.</p>
          </div>
        ) : (
          <>
            <div className="border border-dashed border-gray-400 rounded p-4 mb-6">
              <p className="text-sm text-gray-600 text-center mb-2">
                Review your measurement data below:
              </p>
              <div className="mb-4">
                <p className="font-bold text-center">Work Name: {nameOfWork}</p>
                <p className="text-sm text-center text-gray-600">
                  Work Order ID: {workOrderId} | Revision: {revisionNumber}
                </p>
              </div>
              
              <MeasurementPDFExport
                nameOfWork={nameOfWork}
                items={items}
                workOrderId={workOrderId}
                revisionNumber={revisionNumber}
              />
              
              <div className="mt-6 text-center">
                <button 
                  onClick={handleUpdateStatus}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors ml-4"
                >
                  Mark Work Order as Completed
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFGenerator;