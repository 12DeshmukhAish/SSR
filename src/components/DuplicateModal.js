import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DuplicateModal = ({ workorderId, onClose, url = "https://24.101.103.87:8082/api" }) => {
  const [revisions, setRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Get authentication token from localStorage (matching your JS code)
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    // Debug localStorage
    console.log("All localStorage keys:", Object.keys(localStorage));
    console.log("authToken:", localStorage.getItem("authToken"));
    console.log("Props:", { workorderId, url });
    
    if (workorderId && token) {
      fetchRevisions();
    } else {
      console.warn("Missing required data:", { workorderId, token: !!token });
    }
  }, [workorderId, token]);

  const fetchRevisions = async () => {
    if (!workorderId || !token) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log("Duplicate clicked for Record ID:", workorderId);
      console.log("API URL:", `${url}/workorder-revisions/ByWorkorderId/${workorderId}`);
      console.log("Token:", token ? `${token.substring(0, 20)}...` : 'No token');
      
      const response = await fetch(`${url}/workorder-revisions/ByWorkorderId/${workorderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Get response text first to see what we're actually receiving
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status} - ${responseText}`);
      }

      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Response was:", responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      console.log("API Response (parsed):", data);

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        throw new Error("API returned invalid data format");
      }

      // Filter revisions exactly like your JavaScript code
      const filteredRevisions = data.filter(rev => 
        rev && rev.deletedFlag && rev.deletedFlag.toLowerCase() === "no"
      );

      console.log("Filtered revisions:", filteredRevisions);
      setRevisions(filteredRevisions);

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

    setCreating(true);

    try {
      // Store values in localStorage exactly like your JS code
      localStorage.setItem("recordId", workorderId.toString());
      localStorage.setItem("revisionId", selectedRevisionId.toString());

      // Create form data to match your PHP submission
      const formData = new FormData();
      formData.append("recordId", workorderId);
      formData.append("revisionId", selectedRevisionId);

      // Submit to duplicateestimate.php like your JS code
      const response = await fetch("duplicateestimate.php", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        // If successful, redirect or handle success
        console.log("Duplicate request submitted successfully");
        onClose();
        
        // Optional: Navigate to the new page if needed
        // window.location.href = response.url;
      } else {
        throw new Error(`Server error: ${response.status}`);
      }

    } catch (err) {
      console.error("Error creating duplicate:", err);
      alert("Error creating duplicate. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSelectedRevisionId(null);
    setError(null);
    onClose();
  };

  // Show loading or error states
  if (!token) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Select Revision</h2>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <div className="py-4 text-center text-red-600">
              <p>Authentication token not found. Please log in again.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 border rounded-md hover:bg-gray-100">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Select Revision</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={creating}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4">
            <strong>Record ID:</strong> <span>{workorderId}</span>
          </p>

          <div className="revision-container">
            {loading ? (
              <div className="py-4 text-center">
                <p>Loading revisions...</p>
              </div>
            ) : error ? (
              <div className="py-4 text-center text-red-600">
                <p>{error}</p>
                <button 
                  onClick={fetchRevisions}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            ) : revisions.length === 0 ? (
              <div className="py-4 text-center">
                <p>No revisions available.</p>
              </div>
            ) : (
              <div className="border rounded-md mb-4 max-h-60 overflow-y-auto">
                {revisions.map(rev => (
                  <div
                    key={rev.id}
                    className="revision-row flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      id={`rev-${rev.id}`}
                      name="revision"
                      value={rev.id}
                      checked={selectedRevisionId === rev.id}
                      onChange={() => setSelectedRevisionId(rev.id)}
                      className="mr-3"
                      disabled={creating}
                    />
                    <label
                      htmlFor={`rev-${rev.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      {rev.reviseNumber}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer flex justify-end gap-2 p-4 border-t">
          <button
            onClick={handleConfirm}
            className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedRevisionId || loading || creating}
          >
            {creating ? 'Processing...' : 'Confirm'}
          </button>
          <button
            onClick={handleClose}
            className="btn btn-danger px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            disabled={creating}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateModal;