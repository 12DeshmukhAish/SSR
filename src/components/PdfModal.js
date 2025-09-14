import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PDFDownloadModal = ({ 
  workorderId, 
  onClose, 
  downloadPDF,
  workorderRecord,
  url = API_BASE_URL
}) => {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication token from localStorage
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    console.log("PDFDownloadModal mounted with:", { workorderId, url, hasToken: !!token });

    if (workorderId && token) {
      fetchRevisions();
    } else {
      console.warn("Missing required data:", { workorderId, token: !!token });
      if (!token) {
        setError("Authentication token not found. Please log in again.");
      }
    }
  }, [workorderId, token, url]);

  const fetchRevisions = async () => {
    if (!workorderId || !token) {
      setError("Missing authentication or work order ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching revisions for Record ID:", workorderId);
      
      const response = await fetch(`${url}/api/workorder-revisions/ByWorkorderId/${workorderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("API returned invalid data format");
      }

      // Filter revisions that are not deleted AND have PDF location
      const filteredRevisions = data.filter(rev => 
        rev && 
        rev.deletedFlag && 
        rev.deletedFlag.toLowerCase() === "no" &&
        rev.pdfLocation // Only show revisions that have PDF generated
      );

      console.log("Filtered revisions with PDF:", filteredRevisions);
      setRevisions(filteredRevisions);

      // Auto-select first revision if only one exists
      if (filteredRevisions.length === 1) {
        setSelectedRevisionId(filteredRevisions[0].id);
      }

    } catch (err) {
      console.error("Error fetching revisions:", err);
      setError(`Failed to load revisions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedRevisionId) {
      alert("Please select a revision!");
      return;
    }

    const selectedRevision = revisions.find(rev => rev.id === selectedRevisionId);
    
    if (!selectedRevision || !selectedRevision.pdfLocation) {
      alert("Selected revision PDF not found!");
      return;
    }

    setDownloading(true);

    try {
      // Call the downloadPDF function passed as prop
      await downloadPDF(selectedRevision.pdfLocation);
      
      // Close modal after successful download
      onClose();
      
    } catch (err) {
      console.error("Error during PDF download:", err);
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleClose = () => {
    setSelectedRevisionId(null);
    setError(null);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    fetchRevisions();
  };

  // Show authentication error
  if (!token) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Authentication Required</h3>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          
          <p className="text-red-600 mb-4">Authentication token not found.</p>
          <p className="text-gray-600 mb-6">Please log in again to continue.</p>
          
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Revision PDF to Download</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Work Order: {workorderRecord?.workOrderID || workorderId}</p>
        </div>

        <div className="mb-6">
          {loading ? (
            <div className="text-center py-4">
              <p>Loading available PDFs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <h4 className="text-red-600 font-medium mb-2">Error loading PDFs</h4>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-600">No PDFs available for download.</p>
              <p className="text-sm text-gray-500 mt-2">PDFs are only available for completed revisions.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">Select a revision to download its PDF:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {revisions.map((rev, index) => (
                  <label key={rev.id || index} className="flex items-start cursor-pointer p-3 hover:bg-gray-50 rounded border">
                    <input
                      type="radio"
                      name="revision"
                      value={rev.id}
                      checked={selectedRevisionId === rev.id}
                      onChange={() => setSelectedRevisionId(rev.id)}
                      className="mr-3 text-blue-600 focus:ring-blue-500 mt-1"
                      disabled={downloading}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Revision {rev.reviseNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        Created: {new Date(rev.createdDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        ✓ PDF Available
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            disabled={downloading}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedRevisionId || downloading || loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            {downloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              'Download PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFDownloadModal;