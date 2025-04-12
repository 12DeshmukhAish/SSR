// File: PDFGenerator.jsx
import React, { useEffect, useState } from 'react';
import MeasurementPDFExport from './MeasurementPDFExport';
import Stepper from '../components/Stepper';

const PDFGenerator = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const nameOfWork = localStorage.getItem('nameOfWork') || 'Measurement Sheet';
  const subRecordCache = JSON.parse(localStorage.getItem('subRecordCache') || '[]');
  const workOrderId = localStorage.getItem('pdfWorkOrderId') || '';
  const revisionNumber = localStorage.getItem('pdfRevisionNumber') || '1.0';

  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0NDM2NDMwLCJleHAiOjE3NDQ1MjI4MzB9.T_YSsBeIwdvbKBECM79ZHJ5Z3_cCMQeCwMSlF3fHH6g'; // store in env ideally

  const fetchMeasurements = async (itemId) => {
    try {
      const res = await fetch(`http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return await res.json();
    } catch (err) {
      console.error(`Error fetching measurements for item ${itemId}:`, err);
      return [];
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const allItems = subRecordCache || [];
      const detailedItems = await Promise.all(
        allItems.map(async (item) => {
          const measurements = await fetchMeasurements(item.id);
          return { ...item, measurements };
        })
      );
      setItems(detailedItems);
    } catch (err) {
      console.error("Error fetching item details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
          <div className="text-center py-6">Loading measurement data...</div>
        ) : (
          <>
            <div className="border border-dashed border-gray-400 rounded p-4 mb-6">
              <p className="text-sm text-gray-600 text-center mb-2">Review your measurement data below:</p>
              <MeasurementPDFExport
                nameOfWork={nameOfWork}
                items={items}
                workOrderId={workOrderId}
                revisionNumber={revisionNumber}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PDFGenerator;
