import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // Import X icon for close button

const DuplicateModal = ({ workorderId, onClose }) => {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [loading, setLoading] = useState(false);  // Set initial loading to false
  const [error, setError] = useState(null);
  
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0MjAyNDEzLCJleHAiOjE3NDQyODg4MTN9.cxCaFHJsjjmwxjCOSHwov6xVsxaZsn9AWTDqnSwhXK0";

  useEffect(() => {
    if (workorderId) {  // Only call fetchRevisions if workorderId exists
      fetchRevisions();
    }
  }, [workorderId]);

  const fetchRevisions = async () => {
    if (!workorderId) {
      return; // Don't do anything if no workorderId
    }
    
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await fetch(
        `http://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${workorderId}`, 
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter revisions where deletedFlag is "no"
      const filteredRevisions = data.filter(rev => 
        rev && rev.deletedFlag && rev.deletedFlag.toLowerCase() === "no"
      );
      
      setRevisions(filteredRevisions);
    } catch (err) {
      console.error("Error fetching revisions:", err);
      setError("Failed to load revisions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedRevisionId) {
      alert("Please select a revision!");
      return;
    }

    // Store values in localStorage (same as in the original code)
    localStorage.setItem("recordId", workorderId);
    localStorage.setItem("revisionId", selectedRevisionId);

    // Get the selected revision data for pre-fill
    const selectedRevision = revisions.find(rev => rev.id === selectedRevisionId);
    if (selectedRevision) {
      // Store pre-fill fields if available in the revision
      if (selectedRevision.nameOfWork) localStorage.setItem("prefill_nameOfWork", selectedRevision.nameOfWork);
      if (selectedRevision.state) localStorage.setItem("prefill_state", selectedRevision.state);
      if (selectedRevision.department) localStorage.setItem("prefill_department", selectedRevision.department);
      if (selectedRevision.ssr) localStorage.setItem("prefill_ssr", selectedRevision.ssr);
      if (selectedRevision.area) localStorage.setItem("prefill_area", selectedRevision.area);
      if (selectedRevision.preparedBySignature) localStorage.setItem("prefill_preparedBy", selectedRevision.preparedBySignature);
      if (selectedRevision.checkedBySignature) localStorage.setItem("prefill_checkedBy", selectedRevision.checkedBySignature);
      if (selectedRevision.chapterId) localStorage.setItem("prefill_chapter", selectedRevision.chapterId.toString());
    }

    // Redirect to duplicate page
    window.location.href = "/duplicateestimate";
  };

  // Handle view PDF if available
  const handleViewPdf = (pdfLocation) => {
    if (pdfLocation) {
      window.open(pdfLocation, "_blank");
    } else {
      alert("PDF not available!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Duplicate Workorder</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {!workorderId ? (
            <div className="py-4 text-center text-red-600">
              <p>Please select a workorder first.</p>
            </div>
          ) : (
            <>
              <p className="mb-4"><strong>Record ID:</strong> {workorderId}</p>
              
              {loading ? (
                <div className="py-4 text-center">
                  <p>Loading revisions...</p>
                </div>
              ) : error ? (
                <div className="py-4 text-center text-red-600">
                  <p>{error}</p>
                </div>
              ) : revisions.length === 0 ? (
                <div className="py-4 text-center">
                  <p>No revisions available for this workorder.</p>
                </div>
              ) : (
                <div className="border rounded-md mb-4 max-h-60 overflow-y-auto">
                  {revisions.map(revision => (
                    <div 
                      key={revision.id} 
                      className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        id={`rev-${revision.id}`}
                        name="revision"
                        value={revision.id}
                        checked={selectedRevisionId === revision.id}
                        onChange={() => setSelectedRevisionId(revision.id)}
                        className="mr-3"
                      />
                      <label 
                        htmlFor={`rev-${revision.id}`}
                        className="flex-grow cursor-pointer"
                      >
                        Revision {revision.reviseNumber}
                      </label>
                      
                      {revision.pdfLocation && (
                        <button
                          onClick={() => handleViewPdf(revision.pdfLocation)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View PDF
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2 p-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedRevisionId || loading || !workorderId}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;