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
  centerText: {
    textAlign: 'center',
  },
  rightText: {
    textAlign: 'right',
  },
  leftText: {
    textAlign: 'left',
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
export const AbstractPDF = ({ 
  workName = "Construction Project", 
  workOrderId, 
  items = [], 
  auxiliaryWorks = [], 
  gstRate = 18 
}) => {
  // Calculate main items total
  const mainItemsTotal = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  
  // Calculate auxiliary works total
  const auxiliaryTotal = auxiliaryWorks.reduce((sum, aux) => sum + (parseFloat(aux.amount) || 0), 0);
  
  // Calculate subtotal (main items + auxiliary works)
  const subtotal = mainItemsTotal + auxiliaryTotal;
  
  // Calculate GST amount on subtotal
  const gstAmount = (subtotal * gstRate) / 100;
  
  // Calculate grand total (subtotal + GST)
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
        <Text>Grand Total: Rs. {formatCurrency(grandTotal)}</Text>
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

        {/* Main Items Total Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.summaryText, styles.rightText]}>Main Items Total:</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.summaryText, styles.rightText]}>{formatCurrency(mainItemsTotal)}</Text>
          </View>
        </View>

        {/* Auxiliary Works */}
        {auxiliaryWorks.map((aux, idx) => {
          const displayName = aux.description === 'Other' ? aux.customDescription : aux.description;
          const percentageText = aux.isPercentage ? ` (${aux.percentage}%)` : ' (Fixed Amount)';
          
          return (
            <View style={styles.auxiliaryRow} key={`aux-${idx}`}>
              <View style={styles.summaryLabelCol}>
                <Text style={[styles.auxiliaryText, styles.rightText]}>
                  {displayName}{percentageText}:
                </Text>
              </View>
              <View style={styles.summaryAmountCol}>
                <Text style={[styles.auxiliaryText, styles.rightText]}>
                  {formatCurrency(aux.amount || 0)}
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
            <Text style={[styles.summaryText, styles.rightText]}>{formatCurrency(subtotal)}</Text>
          </View>
        </View>

        {/* GST Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.auxiliaryText, styles.rightText]}>GST ({gstRate}%):</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.auxiliaryText, styles.rightText]}>{formatCurrency(gstAmount)}</Text>
          </View>
        </View>

        {/* Grand Total Row */}
        <View style={[styles.summaryRow, { backgroundColor: '#d0d0d0' }]}>
          <View style={styles.summaryLabelCol}>
            <Text style={[styles.summaryText, styles.rightText, { fontSize: 12 }]}>Grand Total:</Text>
          </View>
          <View style={styles.summaryAmountCol}>
            <Text style={[styles.summaryText, styles.rightText, { fontSize: 12 }]}>
              Rs. {formatCurrency(grandTotal)}
            </Text>
          </View>
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