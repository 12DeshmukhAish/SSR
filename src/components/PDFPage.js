import React, { useRef, useEffect } from 'react';
import PDFGenerator from './PDFGenerator';

const PDFPage = () => {
  const pdfRef = useRef();

  useEffect(() => {
    if (pdfRef.current) {
      pdfRef.current.generatePDF();
    }
  }, []);

  return <PDFGenerator ref={pdfRef} />;
};

export default PDFPage;
