// src/components/MeasurementPDF.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    padding: 3,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '20%',
    borderStyle: 'solid',
    borderWidth: 1,
    textAlign: 'center',
    padding: 3,
  },
  tableCell: {
    fontSize: 10,
  },
});

const MeasurementPDF = ({ workOrderId, nameOfWork, items, revisionNumber }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Measurement Sheet - {nameOfWork}</Text>
      <Text style={styles.title}>Work Order: {workOrderId} | Revision: {revisionNumber}</Text>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Item No</Text>
          <Text style={styles.tableColHeader}>Description</Text>
          <Text style={styles.tableColHeader}>Length</Text>
          <Text style={styles.tableColHeader}>Width</Text>
          <Text style={styles.tableColHeader}>Quantity</Text>
        </View>

        {items.map((item, index) => (
          <React.Fragment key={item.id || index}>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol}>{item.itemNo}</Text>
              <Text style={styles.tableCol}>{item.descriptionOfItem}</Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
              <Text style={styles.tableCol}></Text>
            </View>

            {item.measurements?.map((m, idx) => (
              <View style={styles.tableRow} key={idx}>
                <Text style={styles.tableCol}></Text>
                <Text style={styles.tableCol}>{m.description}</Text>
                <Text style={styles.tableCol}>{m.length}</Text>
                <Text style={styles.tableCol}>{m.width}</Text>
                <Text style={styles.tableCol}>{m.quantity}</Text>
              </View>
            ))}
          </React.Fragment>
        ))}
      </View>
    </Page>
  </Document>
);

export default MeasurementPDF;
