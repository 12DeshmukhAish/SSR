import React, { useEffect, useState } from 'react';
import MeasurementPDFExport from './MeasurementPDFExport'; // adjust path if needed

const PDFGenerator = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const nameOfWork = localStorage.getItem('nameOfWork') || 'Measurement Sheet';
  const subRecordCache = JSON.parse(localStorage.getItem('subRecordCache') || '{}');
  
  const workOrderId = localStorage.getItem("pdfWorkOrderId") || "";
  const revisionNumber = localStorage.getItem("pdfRevisionNumber") || "1.0";
  
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQzODUzNjgyLCJleHAiOjE3NDM5NDAwODJ9.sqUaOTWlqjybtP5c4VZwRPgQfPapwx88VVRSMFgp9b0'; // ideally store in env or get from context
  
  const fetchMeasurements = async (itemId) => {
    try {
      const res = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (error) {
      console.error(`Error fetching measurements for item ${itemId}:`, error);
      return [];
    }
  };
  
  const fetchItems = async () => {
    setLoading(true);
    try {
      const allItems = Object.values(subRecordCache).flat();
      const detailedItems = await Promise.all(
        allItems.map(async (item) => {
          const measurements = await fetchMeasurements(item.id);
          return { ...item, measurements };
        })
      );
      setItems(detailedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchItems();
  }, []);
  
  if (loading) {
    return <div className="text-center mt-6">Loading measurement data...</div>;
  }
  
  return (
    <div className="mt-4">
      <MeasurementPDFExport 
        nameOfWork={nameOfWork} 
        items={items} 
        workOrderId={workOrderId} 
        revisionNumber={revisionNumber} 
      />
    </div>
  );
};

export default PDFGenerator;