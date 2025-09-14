import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { API_BASE_URL} from '../config';
const DuplicateModal = ({ 
  workorderId, 
  onClose, 
  onDuplicate,          // Add this
  workorderRecord,      // Add this
  
  url = API_BASE_URL
}) => {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication token from localStorage
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("Id");

  useEffect(() => {
    console.log("DuplicateModal mounted with:", { workorderId, url, hasToken: !!token, userId });

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
      console.log("API URL:", `${url}/api/workorder-revisions/ByWorkorderId/${workorderId}`);

      const response = await fetch(`${url}/api/workorder-revisions/ByWorkorderId/${workorderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error! Status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        throw new Error("API returned invalid data format");
      }

      // Filter revisions exactly like the JavaScript code
      const filteredRevisions = data.filter(rev => 
        rev && rev.deletedFlag && rev.deletedFlag.toLowerCase() === "no"
      );

      console.log("Filtered revisions:", filteredRevisions);
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


const handleConfirm = async () => {
  if (!selectedRevisionId) {
    alert("Please select a revision!");
    return;
  }

  if (!workorderId) {
    alert("Work order ID is missing!");
    return;
  }

  setCreating(true);

  try {
    console.log("Starting duplication with:", { workorderId, selectedRevisionId });

    // Find the selected revision data
    const selectedRevision = revisions.find(rev => rev.id === selectedRevisionId);
    
    if (!selectedRevision) {
      throw new Error("Selected revision not found");
    }

    // Close modal first
    onClose();

    // Call the actual handleDuplicate function that does the real duplication
    if (onDuplicate && workorderRecord) {
      await onDuplicate(workorderId, selectedRevision, workorderRecord);
    } else {
      throw new Error("onDuplicate function or workorderRecord not provided");
    }

  } catch (err) {
    console.error("Error during duplication:", err);
    alert(`Error: ${err.message}`);
  } finally {
    setCreating(false);
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
          <h3 className="text-lg font-semibold">Select Revision to Duplicate</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        {/* <div className="mb-4">
          <p className="text-sm text-gray-600">Record ID: {workorderId}</p>
        </div> */}

        <div className="mb-6">
          {loading ? (
            <div className="text-center py-4">
              <p>Loading revisions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-4">
              <h4 className="text-red-600 font-medium mb-2">Error loading revisions</h4>
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
              <p>No revisions available for duplication.</p>
            </div>
          ) : (
            <div>
             
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {revisions.map((rev, index) => (
                  <label key={rev.id || index} className="flex items-start cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="radio"
                      name="revision"
                      value={rev.id}
                      checked={selectedRevisionId === rev.id}
                      onChange={() => setSelectedRevisionId(rev.id)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                      disabled={creating}
                    />
                    <div>
                      <div className="font-medium">
                        Revision {rev.reviseNumber}
                        {rev.description && (
                          <span className="font-normal text-gray-600"> ({rev.description})</span>
                        )}
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
            disabled={creating}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedRevisionId || creating || loading}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {creating ? (
              <span>Processing...</span>
            ) : (
              'Confirm Duplicate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;