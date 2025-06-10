import React from 'react';
import { Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 16, // Increased from 12
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
    maxWidth: 100, // Increased from 80
    maxHeight: 100, // Increased from 80
    marginBottom: 20,
    objectFit: 'contain',
  },
  // Company section
  companyName: {
    fontSize: 22, // Increased from 16
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 15,
    color: '#000',
  },
  companyAddress: {
    fontSize: 14, // Increased from 10
    textAlign: 'center',
    color: '#000',
    lineHeight: 1.4,
    maxWidth: '80%',
  },
  // Estimate title section
  estimateTitle: {
    marginTop: 50,
    marginBottom: 30, // Reduced from 60
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    minWidth: '40%',
  },
  estimateTitleText: {
    fontSize: 24, // Increased from 18
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563eb',
    letterSpacing: 8,
  },
  // Work name section
  workNameContainer: {
    marginBottom: 15, // Reduced from 30
    alignItems: 'center',
  },
  workNameLabel: {
    fontSize: 20, // Increased from 16
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8, // Reduced from 15
    color: '#000',
    letterSpacing: 2,
  },
  workName: {
    fontSize: 20, // Increased from 16
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 1.3,
    maxWidth: '90%',
    marginBottom: 8, // Reduced from 20
  },
  clientName: {
    fontSize: 20, // Increased from 16
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8, // Reduced from 40
  },
  // Property details
  propertyDetails: {
    fontSize: 20, // Increased from 16
    textAlign: 'center',
    color: '#000',
    marginBottom: 30, // Reduced from 50
    lineHeight: 1.4,
  },
  // Cost section
  estimateCostContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  estimateCostText: {
    fontSize: 20, // Increased from 16
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    letterSpacing: 2,
  },
});

// Format Indian currency with lakhs format
const formatIndianCurrency = (amount) => {
  if (!amount) return '0.00';
  
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

// Main Cover Page PDF Component
export const CoverPagePDF = ({ 
  companyLogo,
  companyName,
  companyAddress,
  workName,
  clientName,
  propertyNo,
  propertyAddress,
  estimateCost,
}) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Triple Border Effect */}
      <View style={styles.outerBorder} />
      <View style={styles.middleBorder} />
      
      
      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Company Logo */}
        <View style={styles.logoContainer}>
          {companyLogo && (
            <Image 
              style={styles.logo} 
              src={companyLogo}
            />
          )}
          
          {/* Company Name */}
          <Text style={styles.companyName}>
            {companyName }
          </Text>
          
          {/* Company Address */}
          <Text style={styles.companyAddress}>
            {companyAddress }
          </Text>
        </View>
        
        {/* Estimate Title */}
        <View style={styles.estimateTitle}>
          <Text style={styles.estimateTitleText}>
            ESTIMATE
          </Text>
        </View>

        {/* Work Name Section */}
        <View style={styles.workNameContainer}>
          <Text style={styles.workNameLabel}>
             NAME OF WORK 
          </Text>
          
          <Text style={styles.workName}>
            {workName }
          </Text>
          
          <Text style={styles.clientName}>
            FOR
          </Text>
          
          <Text style={styles.clientName}>
            {clientName }
          </Text>
        </View>

        {/* Property Details */}
        <Text style={styles.propertyDetails}>
          Property no {propertyNo || 'Plot No. 123'}, At {propertyAddress || '456 Property Street, Location, City'}
        </Text>

        {/* Estimate Cost */}
        <View style={styles.estimateCostContainer}>
          <Text style={styles.estimateCostText}>
            ESTIMATE COST :- {formatIndianCurrency(estimateCost) || '15,00,000'} LAKHS
          </Text>
        </View>
      </View>
    </Page>
  );
};

export default CoverPagePDF;