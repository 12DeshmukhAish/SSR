import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { Eye, Download, RefreshCw, Loader, FileText, AlertCircle } from 'lucide-react';

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

// PDF Styles
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
    minHeight: 40, // Increased height for better text visibility
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    textAlign: 'center',
    fontSize: FONT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    overflow: 'visible', // Changed from hidden to visible
  },
  tableCellLeft: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    textAlign: 'left',
    fontSize: FONT_SIZE,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 25,
    overflow: 'visible', // Changed from hidden to visible
  },
  // Adjusted column widths for better fit
  srNoCell: { 
    width: '10%', // Increased from 8% to 10%
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialCell: { 
    width: '32%', // Reduced from 35% to 32%
    textAlign: 'left',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  totalQuantityCell: { 
    width: '20%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  royaltyQuantityCell: { 
    width: '23%', // Increased from 22% to 23%
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remarksCell: { 
    width: '15%',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerCell: {
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.2,
    overflow: 'visible',
    wordWrap: 'break-word',
  },
  // Special styling for SR.NO. header
  srNoHeaderCell: {
    fontSize: FONT_SIZE - 1, // Slightly smaller font
    fontWeight: 'bold',
    padding: 6,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.1,
    overflow: 'visible',
  },
  // Multi-line text containers for long headers
  headerTextContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  headerText: {
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.2,
    overflow: 'visible',
  },
  headerTextSmall: {
    fontSize: FONT_SIZE - 1,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.1,
    overflow: 'visible',
  },
  materialNameText: {
    fontSize: FONT_SIZE,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    textAlign: 'left',
  },
  quantityText: {
    fontSize: FONT_SIZE,
    textAlign: 'center',
    lineHeight: 1.2,
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
  loadingMessage: {
    width: '100%',
    textAlign: 'center',
    padding: 25,
    fontSize: FONT_SIZE + 1,
    color: '#0066cc',
  },
});

// Split materials into pages for pagination
const splitMaterialsIntoPages = (materials) => {
  const pages = [];
  for (let i = 0; i < materials.length; i += ROWS_PER_PAGE) {
    pages.push(materials.slice(i, i + ROWS_PER_PAGE));
  }
  return pages.length > 0 ? pages : [[]];
};

// PDF Document Component
export const MaterialSummaryPDF = ({ 
  workName = '', 
  materialSummary = [], 
  signatures = { preparedBy: '', checkedBy: '' },
  ssrYear = '',
  loadingRoyalty = false,
  loadingMts = false
}) => {
  // Split materials for pagination
  const materialPages = splitMaterialsIntoPages(materialSummary);
  const totalPages = Math.max(materialPages.length, 1);

  // Render a single page
  const renderPage = (pageIndex) => {
    const currentMaterials = materialPages[pageIndex] || [];
    const isLastPage = pageIndex === totalPages - 1;
    const startIndex = pageIndex * ROWS_PER_PAGE;
    
    return (
      <Page key={pageIndex} size="A4" orientation="portrait" style={styles.page}>
        {/* Header - Show on all pages */}
        <View style={styles.header}>
          <Text style={styles.title}>
            NAME OF WORK- {workName ? workName.toUpperCase() : 'CONSTRUCTION WORK'}
          </Text>
          <Text style={styles.subtitle}>
            MATERIAL SUMMARY
          </Text>
          {totalPages > 1 && (
            <Text style={styles.continuationNote}>
              Page {pageIndex + 1} of {totalPages}
              {pageIndex > 0 && ' (Continued)'}
            </Text>
          )}
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header - Show on all pages */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {/* SR.NO. Column - Special handling */}
            <View style={[styles.tableCell, styles.srNoCell]}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.srNoHeaderCell}>
                  SR.NO.
                </Text>
              </View>
            </View>
            
            {/* Material Column */}
            <View style={[styles.tableCellLeft, styles.materialCell]}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>
                  MATERIAL
                </Text>
              </View>
            </View>
            
            {/* Total Quantity Column - Multi-line header */}
            <View style={[styles.tableCell, styles.totalQuantityCell]}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTextSmall}>
                  TOTAL{'\n'}QUANTITY
                </Text>
              </View>
            </View>
            
            {/* Royalty Quantity Column - Multi-line header */}
            <View style={[styles.tableCell, styles.royaltyQuantityCell]}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTextSmall}>
                  QUANTITY OF{'\n'}ROYALTY
                </Text>
              </View>
            </View>
            
            {/* Remarks Column */}
            <View style={[styles.tableCell, styles.remarksCell, { borderRightWidth: 0 }]}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerText}>
                  REMARKS
                </Text>
              </View>
            </View>
          </View>

          {/* Table Body */}
          {currentMaterials.length > 0 ? (
            currentMaterials.map((material, index) => (
              <View key={material.srNo || `material-${startIndex + index}`} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.srNoCell]}>
                  <Text style={styles.quantityText}>{material.srNo}</Text>
                </View>
                <View style={[styles.tableCellLeft, styles.materialCell]}>
                  <Text style={styles.materialNameText}>
                    {material.materialName ? material.materialName.toUpperCase() : 'UNKNOWN MATERIAL'}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.totalQuantityCell]}>
                  <Text style={styles.quantityText}>
                    {loadingMts ? 'Loading...' : `${material.totalQuantity || '0.000'} ${material.unit || 'Unit'}`}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.royaltyQuantityCell]}>
                  <Text style={styles.quantityText}>
                    {loadingRoyalty ? 'Loading...' : (
                      material.royaltyQuantity && material.royaltyQuantity !== '-' 
                        ? `${material.royaltyQuantity} ${material.unit || 'Unit'}` 
                        : '-'
                    )}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.remarksCell, { borderRightWidth: 0 }]}>
                  <Text style={styles.quantityText}>{material.remarks || '-'}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.emptyMessage, { borderRightWidth: 0 }]}>
                {loadingMts || loadingRoyalty ? (
                  <Text style={styles.loadingMessage}>
                    Loading material data...
                  </Text>
                ) : (
                  <Text>
                    No materials found. Please ensure items have material properties configured.
                  </Text>
                )}
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
      </Page>
    );
  };

  return (
    <Document>
      {Array.from({ length: totalPages }, (_, pageIndex) => renderPage(pageIndex))}
    </Document>
  );
};