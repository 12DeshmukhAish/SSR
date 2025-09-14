import React from 'react';
import { Document,Page, Text, View, StyleSheet, Image ,PDFDownloadLink} from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 16,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Border styling - triple border effect
  outerBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#000',
  },
  middleBorder: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  
  // Content container
  contentContainer: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Logo container
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    maxWidth: 100,
    maxHeight: 100,
    marginBottom: 20,
    objectFit: 'contain',
  },
  // Company section
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 15,
    color: '#000',
  },
  companyAddress: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
    lineHeight: 1.4,
    maxWidth: '80%',
    marginBottom: 8,
  },
  contactNo: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
    marginBottom: 10,
  },
  // Estimate title section
  estimateTitle: {
    marginTop: 50,
    marginBottom: 30,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    minWidth: '40%',
  },
  estimateTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    letterSpacing: 8,
  },
  // Work name section
  workNameContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  workNameLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
    letterSpacing: 2,
  },
  workName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1.3,
    maxWidth: '90%',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  // Property details
  propertyDetails: {
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
    marginBottom: 30,
    lineHeight: 1.4,
  },
  // Cost section
  estimateCostContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  estimateCostText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    letterSpacing: 2,
  },
  // Additional fields section
  additionalDetailsContainer: {
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
  },
  detailRow: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000',
    marginBottom: 5,
    lineHeight: 1.4,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  // Footer section
  footerContainer: {
    position: 'absolute',
    bottom: 70,
    left: 50,
    right: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    lineHeight: 1.4,
  },
});

// Format Indian currency with lakhs format
const formatIndianCurrency = (amount) => {
  if (!amount) return '';
  
  const numAmount = parseFloat(amount);
  const lakhs = (numAmount / 100000).toFixed(2);
  
  // Format with Indian comma system
  const [wholePart, decimalPart = '00'] = lakhs.toString().split('.');
  let formattedWholePart = '';
  let count = 0;
  
  for (let i = wholePart.length - 1; i >= 0; i--) {
    count++;
    formattedWholePart = wholePart[i] + formattedWholePart;
    
    if (i !== 0 && count === 3) {
      formattedWholePart = ',' + formattedWholePart;
    } else if (i !== 0 && count > 3 && (count - 3) % 2 === 0) {
      formattedWholePart = ',' + formattedWholePart;
    }
  }
  
  const formattedDecimalPart = decimalPart.padEnd(2, '0').substring(0, 2);
  return `${formattedWholePart}.${formattedDecimalPart}`;
};

// Helper function to check if a value is empty or undefined
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (typeof value === 'number') return false; // Numbers are not empty
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return !value; // For boolean and other types
};

// Main Cover Page PDF Component
export const CoverPagePDF = ({ 
  companyLogo,
  companyName,
  companyAddress,
  contactNo,
  workName,
  workOrderId,
  revisionNumber,
  area,
  ssr,
  clientName,
  propertyNo,
  propertyAddress,
  estimateCost,
  sorYear,
  preparedBy,
}) => {
  // Use the passed estimateCost directly - don't fetch during render
  const latestEstimateCost = estimateCost || 0;
  
  return (
    <Page size="A4" style={styles.page}>
      {/* Triple Border Effect */}
      <View style={styles.outerBorder} />
      <View style={styles.middleBorder} />
      
      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Company Logo and Details - Only show if company name exists */}
        {!isEmpty(companyName) && (
          <View style={styles.logoContainer}>
            {companyLogo && (
              <Image 
                style={styles.logo} 
                src={companyLogo}
              />
            )}
            
            {/* Company Name */}
            <Text style={styles.companyName}>
              {companyName}
            </Text>
            
            {/* Company Address - Only show if exists */}
            {!isEmpty(companyAddress) && (
              <Text style={styles.companyAddress}>
                {companyAddress}
              </Text>
            )}
            
            {/* Contact Number - Only show if exists */}
            {!isEmpty(contactNo) && (
              <Text style={styles.contactNo}>
                Contact: {contactNo}
              </Text>
            )}
          </View>
        )}
        
        {/* Estimate Title - Always show if any content exists */}
        {(!isEmpty(companyName) || !isEmpty(workName) || !isEmpty(clientName)) && (
          <View style={styles.estimateTitle}>
            <Text style={styles.estimateTitleText}>
              ESTIMATE
            </Text>
          </View>
        )}

        {/* Work Name Section - Only show if workName exists */}
        {!isEmpty(workName) && (
          <View style={styles.workNameContainer}>
            <Text style={styles.workNameLabel}>
              NAME OF WORK 
            </Text>
            
            <Text style={styles.workName}>
              {workName}
            </Text>
            
            {/* Only show "FOR" and client name if client name exists */}
            {!isEmpty(clientName) && (
              <>
                <Text style={styles.clientName}>
                  FOR
                </Text>
                
                <Text style={styles.clientName}>
                  {clientName}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Property Details - Only show if propertyNo or propertyAddress exists */}
        {(!isEmpty(propertyNo) || !isEmpty(propertyAddress)) && (
          <Text style={styles.propertyDetails}>
            {!isEmpty(propertyNo) && `PROPERTY NO ${propertyNo}`}
            {!isEmpty(propertyNo) && !isEmpty(propertyAddress) && ', '}
            {!isEmpty(propertyAddress) && `AT ${propertyAddress}`}
          </Text>
        )}

        {/* Estimate Cost - Only show if cost exists */}
        {!isEmpty(latestEstimateCost) && formatIndianCurrency(latestEstimateCost) && (
          <View style={styles.estimateCostContainer}>
            <Text style={styles.estimateCostText}>
              ESTIMATE COST : Rs. ₹{formatIndianCurrency(latestEstimateCost)}
            </Text>
          </View>
        )}

        {/* Additional Details Section */}
        <View style={styles.additionalDetailsContainer}>
          {/* Work Order ID */}
          {!isEmpty(workOrderId) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>Work Order ID:</Text> {workOrderId}
            </Text>
          )}
          
          {/* Revision Number */}
          {!isEmpty(revisionNumber) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>Revision Number:</Text> {revisionNumber}
            </Text>
          )}
          
          {/* Area */}
          {!isEmpty(area) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>Area:</Text> {area} sq ft
            </Text>
          )}
          
          {/* SSR */}
          {!isEmpty(ssr) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>SSR:</Text> {ssr}
            </Text>
          )}
          
          {/* SOR Year */}
          {!isEmpty(sorYear) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>SOR Year:</Text> {sorYear}
            </Text>
          )}
          
          {/* Date */}
          <Text style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text> {new Date().toLocaleDateString('en-GB')}
          </Text>
          
          {/* Prepared By */}
          {!isEmpty(preparedBy) && (
            <Text style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prepared By:</Text> {preparedBy}
            </Text>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          This estimate is prepared based on current market rates and is subject to change.
        </Text>
      </View>
    </Page>
  );
};

export default CoverPagePDF;