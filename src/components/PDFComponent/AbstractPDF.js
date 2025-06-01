import React from 'react';
import { Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 10,
    lineHeight: 1.3,
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
  // Summary section
  summarySection: {
    marginTop: 10,
    borderTop: 1,
    borderColor: '#000',
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 11,
  },
  summaryLabel: {
    fontWeight: 'bold',
  },
  summaryValue: {
    fontWeight: 'bold',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderColor: '#000',
    paddingTop: 8,
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
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
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

// Format number with decimals
const formatNumber = (value) => {
  const num = parseFloat(value) || 0;
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
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
export const AbstractPDF = ({ workName, workOrderId, items, gstRate = 18 }) => {
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const gstAmount = (subtotal * gstRate) / 100;
  const grandTotal = subtotal + gstAmount;
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>CONSTRUCTION ESTIMATE</Text>
      
      {/* Work Name */}
      <View style={styles.workNameSection}>
        <Text style={styles.workNameText}>NAME OF WORK: {workName.toUpperCase()}</Text>
      </View>
      
      {/* Date and Total Cost */}
      <View style={styles.dateAndTotal}>
        <Text>Date: {getCurrentDate()}</Text>
        <Text>Total Cost: Rs. {formatCurrency(grandTotal)}</Text>
      </View>
      
      {/* Abstract Title */}
      <Text style={styles.abstractTitle}>ABSTRACT OF COST</Text>

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

        {/* Table Body */}
        {items.map((item, idx) => (
          <View style={styles.tableRow} key={item.id || idx}>
            <View style={styles.srNoCol}>
              <Text style={[styles.cellText, styles.centerText]}>{idx + 1}</Text>
            </View>
            <View style={styles.itemNoCol}>
              <Text style={[styles.cellText, styles.centerText]}>{item.itemNo || '-'}</Text>
            </View>
            <View style={styles.itemWorkCol}>
              <Text style={[styles.cellText, styles.leftText]}>
                {item.descriptionOfItem || item.description || '-'}
              </Text>
            </View>
            <View style={styles.qtyCol}>
              <Text style={[styles.cellText, styles.rightText]}>
                {formatNumber(item.quantity || 0)}
              </Text>
            </View>
            <View style={styles.rateCol}>
              <Text style={[styles.cellText, styles.rightText]}>
                {formatCurrency(item.labourRate || item.rate || 0)}
              </Text>
            </View>
            <View style={styles.unitCol}>
              <Text style={[styles.cellText, styles.centerText]}>
                {item.unit || '-'}
              </Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={[styles.cellText, styles.rightText]}>
                {formatCurrency(item.amount || 0)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>GST ({gstRate}%):</Text>
          <Text style={styles.summaryValue}>{formatCurrency(gstAmount)}</Text>
        </View>
        
        <View style={styles.grandTotalRow}>
          <Text>Grand Total:</Text>
          <Text>Rs. {formatCurrency(grandTotal)}</Text>
        </View>
      </View>
      
      {/* Footer */}
      <Text style={styles.footer}>
        This is a computer-generated document. No signature required.
      </Text>
      
      {/* Page Number */}
      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => `${getCurrentDate()}, Page ${pageNumber} of ${totalPages}`} 
        fixed 
      />
    </Page>
  );
};