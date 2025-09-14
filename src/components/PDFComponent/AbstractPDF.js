import React from 'react';
import {  Document, Page, Text, View, StyleSheet, PDFDownloadLink  } from '@react-pdf/renderer';

// Define styles for the PDF document matching Construction Estimate format
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  workNameSection: {
    marginBottom: 10,
  },
  workNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateAndTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    fontSize: 11,
  },
  abstractTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e6e6e6',
    borderTop: 1,
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#f8f8f8',
    minHeight: 25,
  },
  auxiliaryRow: {
    flexDirection: 'row',
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#f0f0f0',
    minHeight: 25,
  },
  grandTotalRow: {
    flexDirection: 'row',
    borderLeft: 1,
    borderRight: 1,
    borderBottom: 1,
    borderColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#d0d0d0',
    minHeight: 30,
  },
  // Column widths
  srNoCol: { 
    width: '8%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  itemNoCol: { 
    width: '10%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  itemWorkCol: { 
    width: '45%',
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  qtyCol: { 
    width: '10%',
    textAlign: 'right',
    justifyContent: 'center',
    paddingRight: 8,
  },
  rateCol: { 
    width: '12%',
    textAlign: 'right',
    justifyContent: 'center',
    paddingRight: 8,
  },
  unitCol: { 
    width: '10%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  amountCol: { 
    width: '15%',
    textAlign: 'right',
    justifyContent: 'center',
    paddingRight: 8,
  },
  // Summary section column widths
  summaryLabelCol: {
    width: '85%',
    textAlign: 'right',
    justifyContent: 'center',
    paddingRight: 8,
  },
  summaryAmountCol: {
    width: '15%',
    textAlign: 'right',
    justifyContent: 'center',
    paddingRight: 8,
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 10,
    lineHeight: 1.3,
  },
  summaryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  auxiliaryText: {
    fontSize: 10,
  },
  grandTotalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  centerText: {
    textAlign: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  leftText: {
    textAlign: 'left',
  },
  // Signature section styles
  signatureSection: {
    marginTop: 30,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    marginBottom: 5,
    height: 40,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 9,
    fontStyle: 'italic',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 50,
    right: 20,
    textAlign: 'right',
  },
});

// Format number as Indian currency
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
};

// Format number with decimals
const formatNumber = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
};

// Get current date in DD/MM/YYYY format
const getCurrentDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

// Main Abstract PDF Component
export const AbstractPDF = ({ 
  workName = "Construction Project", 
  workOrderId, 
  items = [], 
  auxiliaryWorks = [], 
  gstPercentage = 0,
  totalCost,
  subtotal,
  gstAmount,
  grandTotal
}) => {
  // Debug logging
  console.log('AbstractPDF Props:', {
    workName,
    workOrderId,
    items: items.length,
    auxiliaryWorks: auxiliaryWorks.length,
    gstPercentage,
    totalCost,
    subtotal,
    gstAmount,
    grandTotal
  });

  // Calculate main items total
  const calculatedTotalCost = items.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || parseFloat(item.completedRate) || 0;
    return sum + (quantity * rate);
  }, 0);
  
  // Use provided totalCost or calculated one
  const finalTotalCost = totalCost !== undefined ? totalCost : calculatedTotalCost;
  
  // Calculate auxiliary works total
  const auxiliaryTotal = auxiliaryWorks.reduce((sum, aux) => {
    return sum + (parseFloat(aux.amount) || 0);
  }, 0);
  
  // Calculate subtotal (main items + auxiliary works)
  const calculatedSubtotal = finalTotalCost + auxiliaryTotal;
  const finalSubtotal = subtotal !== undefined ? subtotal : calculatedSubtotal;
  
  // Calculate GST amount
  const calculatedGstAmount = (finalSubtotal * (parseFloat(gstPercentage) || 0)) / 100;
  const finalGstAmount = gstAmount !== undefined ? gstAmount : calculatedGstAmount;
  
  // Calculate grand total
  const calculatedGrandTotal = finalSubtotal + finalGstAmount;
  const finalGrandTotal = grandTotal !== undefined ? grandTotal : calculatedGrandTotal;
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>CONSTRUCTION ESTIMATE</Text>
      
      {/* Work Name */}
      {workName && (
        <View style={styles.workNameSection}>
          <Text style={styles.workNameText}>NAME OF WORK: {workName.toUpperCase()}</Text>
        </View>
      )}
      
      {/* Work Order ID */}
      {workOrderId && (
        <View style={styles.workNameSection}>
          <Text style={styles.workNameText}>WORK ORDER ID: {workOrderId}</Text>
        </View>
      )}
      
      {/* Date and Total */}
      <View style={styles.dateAndTotal}>
        <Text>Date: {getCurrentDate()}</Text>
   
      </View>
      
      {/* Abstract Title */}
      <Text style={styles.abstractTitle}>ABSTRACT</Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.srNoCol}>
            <Text style={styles.headerText}>Sr.{'\n'}No.</Text>
          </View>
          <View style={styles.itemNoCol}>
            <Text style={styles.headerText}>Item{'\n'}No.</Text>
          </View>
          <View style={styles.itemWorkCol}>
            <Text style={styles.headerText}>Item of work</Text>
          </View>
          <View style={styles.qtyCol}>
            <Text style={styles.headerText}>Qty</Text>
          </View>
          <View style={styles.rateCol}>
            <Text style={styles.headerText}>Rate</Text>
          </View>
          <View style={styles.unitCol}>
            <Text style={styles.headerText}>Unit</Text>
          </View>
          <View style={styles.amountCol}>
            <Text style={styles.headerText}>Amount</Text>
          </View>
        </View>

        {/* Main Items */}
        {items && items.length > 0 ? items.map((item, idx) => {
          const quantity = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || parseFloat(item.completedRate) || 0;
          const amount = quantity * rate;
          
          return (
            <View style={styles.tableRow} key={item.id || `item-${idx}`}>
              <View style={styles.srNoCol}>
                <Text style={[styles.cellText, styles.centerText]}>{idx + 1}</Text>
              </View>
              <View style={styles.itemNoCol}>
                <Text style={[styles.cellText, styles.centerText]}>{item.itemNo || '-'}</Text>
              </View>
              <View style={styles.itemWorkCol}>
                <Text style={[styles.cellText, styles.leftText]}>
                  {item.description || item.descriptionOfItem || '-'}
                </Text>
              </View>
              <View style={styles.qtyCol}>
                <Text style={[styles.cellText, styles.rightText]}>
                  {formatNumber(quantity)}
                </Text>
              </View>
              <View style={styles.rateCol}>
                <Text style={[styles.cellText, styles.rightText]}>
                  {formatNumber(rate)}
                </Text>
              </View>
              <View style={styles.unitCol}>
                <Text style={[styles.cellText, styles.centerText]}>
                  {item.unit || item.fullUnit || item.smallUnit || '-'}
                </Text>
              </View>
              <View style={styles.amountCol}>
                <Text style={[styles.cellText, styles.rightText]}>
                  {formatCurrency(amount)}
                </Text>
              </View>
            </View>
          );
        }) : (
          <View style={styles.tableRow}>
            <View style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
              <Text style={[styles.cellText, styles.centerText]}>No items available</Text>
            </View>
          </View>
        )}

        {/* Main Items Total Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.summaryText, styles.rightText]}>Main Items Total:</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.summaryText, styles.rightText]}>{formatCurrency(finalTotalCost)}</Text>
          </View>
        </View>

        {/* Auxiliary Works */}
        {auxiliaryWorks && auxiliaryWorks.length > 0 && auxiliaryWorks.map((aux, idx) => {
          // Handle auxiliary work description exactly like in preview
          let displayName = '';
          if (aux.description === 'Other') {
            displayName = aux.customDescription || 'Other';
          } else {
            displayName = aux.description || 'Auxiliary Work';
          }
          
          // Handle percentage or fixed amount display exactly like in preview
          let typeText = '';
          if (aux.isPercentage) {
            typeText = ` (${parseFloat(aux.percentage || 0).toFixed(2)}%)`;
          } else {
            typeText = ' (Fixed Amount)';
          }
          
          return (
            <View style={styles.auxiliaryRow} key={`aux-pdf-${idx}`}>
              <View style={styles.summaryLabelCol}>
                <Text style={[styles.auxiliaryText, styles.rightText]}>
                  {displayName}{typeText}:
                </Text>
              </View>
              <View style={styles.summaryAmountCol}>
                <Text style={[styles.auxiliaryText, styles.rightText]}>
                  {formatCurrency(parseFloat(aux.amount) || 0)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Subtotal Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.summaryText, styles.rightText]}>Subtotal:</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.summaryText, styles.rightText]}>{formatCurrency(finalSubtotal)}</Text>
          </View>
        </View>

        {/* GST Row */}
        <View style={styles.auxiliaryRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.auxiliaryText, styles.rightText]}>GST ({parseFloat(gstPercentage || 0).toFixed(2)}%):</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.auxiliaryText, styles.rightText]}>{formatCurrency(finalGstAmount)}</Text>
          </View>
        </View>

        {/* Grand Total Row */}
        <View style={styles.grandTotalRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.grandTotalText, styles.rightText]}>Grand Total:</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.grandTotalText, styles.rightText]}>
              Rs. {formatCurrency(finalGrandTotal)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}></View>
          <Text style={styles.signatureText}>Prepared By</Text>
          <Text style={styles.signatureLabel}>Engineer/Contractor</Text>
        </View>
        
        <View style={styles.signatureBox}>
          <View style={styles.signatureLine}></View>
          <Text style={styles.signatureText}>Approved By</Text>
          <Text style={styles.signatureLabel}>Project Manager/Client</Text>
        </View>
      </View>
      
      {/* Footer */}
      <Text style={styles.footer}>
        This is a computer-generated document. No signature required.
      </Text>
      
      {/* Page Number */}
      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
        fixed 
      />
    </Page>
  );
};