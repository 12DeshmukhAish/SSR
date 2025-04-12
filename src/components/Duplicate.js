import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const DuplicateEstimate = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    workname: 'fg',
    state: 'MH',
    department: 'PWD',
    workOrderID: '',
    chapter: '18',
    ssr: 'demo2',
    area: 'Inaccessible Areas',
    preparedBy: 'fghj',
    checkedBy: 'fgh',
    createdBy: '92'
  });
  
  // Get data from localStorage on component mount
// Modify the useEffect hook to check for localStorage items and handle the redirect
useEffect(() => {
    const recordId = localStorage.getItem("recordId");
    const revisionId = localStorage.getItem("revisionId");
    
    if (!recordId || !revisionId) {
      setError('Please select a workorder first.');
      // Instead of just setting an error, we should also disable form functionality
      setFormData(prev => ({
        ...prev,
        disabled: true
      }));
    } else {
      setError('');
      generateCustomID();
    }
  }, []);
  
  // Update the redirectToSelection function to be more reliable
  const redirectToSelection = () => {
    router.push("/workorders");
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
    
    // Regenerate work order ID if state changes
    if (id === "state") {
      generateCustomID();
    }
  };
  
  const generateCustomID = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Get TIN from state
    let tin = "00";
    if (formData.state === "demo1") tin = "23";
    else if (formData.state === "MH") tin = "27";
    else if (formData.state === "demo2") tin = "34";
    
    const phpId = 221; // Static ID for this example
    const wo = "WO";
    
    // Generate the unique ID
    const finalID = `${tin}${wo}${year}${month}${day}${hours}${minutes}${seconds}${phpId}`;
    
    setFormData(prev => ({
      ...prev,
      workOrderID: finalID
    }));
  };
  
  const validateStep1 = () => {
    if (!formData.workname.trim()) {
      alert("❌ Please enter the 'Name of Work' before proceeding!");
      return false;
    }
    if (!formData.state) {
      alert("❌ Please Select the 'State' before proceeding!");
      return false;
    }
    if (!formData.department) {
      alert("❌ Please Select the 'Department' before proceeding!");
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    if (!formData.ssr || !formData.chapter || !formData.area || !formData.preparedBy || !formData.checkedBy) {
      alert("❌ Please fill in all required fields before proceeding!");
      return false;
    }
    return true;
  };
  
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setProgress(50);
    }
  };
  
  const prevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setProgress(0);
    }
  };
  
  const getFormattedDate = () => {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };
  
  const addWork = async () => {
    // Check if recordId and revisionId exist before proceeding
    const recordId = localStorage.getItem("recordId");
    const revisionId = localStorage.getItem("revisionId");
    
    if (!recordId || !revisionId) {
      setError('Please select a workorder first.');
      return;
    }
    
    if (!validateStep2()) return;
    
    setIsLoading(true);
    
    const url = "http://24.101.103.87:8082/api/workorders";
    const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5MjA5MTYwNjEyIiwiaWF0IjoxNzQ0MzQxNTczLCJleHAiOjE3NDQ0Mjc5NzN9.SycTRXd07aBBqZSaDyWRcOPeilCapFkOEZ-R2dOvXqQ";
    
    if (!token) {
      alert("Authentication failed! Token not found.");
      setIsLoading(false);
      return;
    }
    
    const payload = {
      workOrderID: formData.workOrderID,
      nameOfWork: formData.workname,
      state: formData.state,
      ssr: formData.ssr,
      chapterId: formData.chapter,
      area: formData.area,
      createdBy: formData.createdBy,
      preparedBySignature: formData.preparedBy,
      checkedBySignature: formData.checkedBy,
      createdDate: getFormattedDate(),
      department: formData.department,
      deletedFlag: 0,
      status: "Progress"
    };
    
    try {
      // First API call to add work order
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store data in localStorage
        localStorage.setItem("nameOfWork", formData.workname);
        localStorage.setItem("workorderId", data.id);
        localStorage.setItem("chapter", formData.chapter);
        localStorage.setItem("ssr", formData.ssr);
        localStorage.setItem("area", formData.area);
        localStorage.setItem("autogenerated", formData.workOrderID);
        localStorage.setItem("status", "Progress");
        localStorage.setItem("reviseno", '1.0');
        
        // Call second API to create revision
        await sendToAnotherAPI(data.id, token);
        
      } else {
        alert(data.message || "❌ Failed to add work order. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendToAnotherAPI = async (workorderId, token) => {
    const secondaryUrl = "http://24.101.103.87:8082/api/workorder-revisions";
    
    const subworkPayload = {
      workorderId,
      reviseNumber: '1.0',
      createdDate: getFormattedDate(),
      createdBy: localStorage.getItem("id"),
      updatedDate: getFormattedDate(),
      updatedBy: localStorage.getItem("id"),
      deletedFlag: 'no',
      revisionStage: 'started',
      currentFlag: true
    };
    
    try {
      const subworkResponse = await fetch(secondaryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(subworkPayload)
      });
      
      const subworkData = await subworkResponse.json();
      
      if (subworkResponse.ok) {
        localStorage.setItem("reviseId", subworkData.id);
        
        // Fetch existing revisions for duplication
        const recordId = localStorage.getItem("recordId");
        const revisionId = localStorage.getItem("revisionId");
        
        if (recordId && revisionId) {
          await duplicateSubworks(revisionId, recordId, workorderId, subworkData.id, token);
        } else {
          router.push("/pdf-preview");
        }
      } else {
        console.warn("⚠️ Failed to add revision:", subworkData);
        alert(subworkData.message || "Failed to add revision.");
      }
    } catch (error) {
      console.error("❌ Error sending data to secondary API:", error);
      alert("Error occurred while sending data to the second API.");
    }
  };
  
  const duplicateSubworks = async (revisionId, recordId, workorderId, newReviseId, token) => {
    try {
      // Fetch existing subworks
      const subworksResponse = await fetch(
        `http://24.101.103.87:8082/api/subwork/${revisionId}/${recordId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!subworksResponse.ok) {
        throw new Error(`Error fetching subworks: ${subworksResponse.statusText}`);
      }
      
      const subworks = await subworksResponse.json();
      const subworkMap = {};
      
      // Process each subwork sequentially
      for (const subwork of subworks) {
        // Insert new subwork
        const newSubworkResponse = await fetch(
          "http://24.101.103.87:8082/api/subwork",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              ...subwork,
              id: undefined,
              workorderId: workorderId,
              reviseId: newReviseId
            })
          }
        );
        
        if (!newSubworkResponse.ok) {
          console.error("Error creating new subwork");
          continue;
        }
        
        const newSubwork = await newSubworkResponse.json();
        subworkMap[subwork.id] = newSubwork.id;
        
        // Fetch txn_items for this subwork
        const itemsResponse = await fetch(
          `http://24.101.103.87:8082/api/txn-items/BySubwork/${subwork.id}`,
          {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
          }
        );
        
        if (!itemsResponse.ok) {
          console.error("Error fetching items for subwork");
          continue;
        }
        
        const items = await itemsResponse.json();
        const itemMap = {};
        
        // Process each item
        for (const item of items) {
          const newItemResponse = await fetch(
            "http://24.101.103.87:8082/api/txn-items",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                ...item,
                id: undefined,
                fkSubworkId: newSubwork.id
              })
            }
          );
          
          if (!newItemResponse.ok) {
            console.error("Error creating new item");
            continue;
          }
          
          const newItem = await newItemResponse.json();
          itemMap[item.id] = newItem.id;
          
          // Fetch txn_item_mts for this item
          const mtsResponse = await fetch(
            `http://24.101.103.87:8082/api/txn-items-mts/ByItemId/${item.id}`,
            {
              method: "GET",
              headers: { "Authorization": `Bearer ${token}` }
            }
          );
          
          if (!mtsResponse.ok) {
            console.error("Error fetching mts records");
            continue;
          }
          
          const mtsRecords = await mtsResponse.json();
          
          // Process each mts record
          for (const mts of mtsRecords) {
            await fetch(
              "http://24.101.103.87:8082/api/txn-items-mts",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  ...mts,
                  id: undefined,
                  fkTxnItemId: newItem.id
                })
              }
            );
          }
        }
      }
      
      // Navigate to measurement page after successful duplication
      router.push("/tmeasurement");
      
    } catch (error) {
      console.error("Error during duplication process:", error);
      alert("Error occurred during the duplication process.");
    }
  };
  
  // Function to fetch revisions by workorder ID
  const fetchRevisionsByWorkorderId = async (workorderId) => {
    const token = localStorage.getItem("authToken");
    if (!token || !workorderId) return [];
    
    try {
      const response = await fetch(
        `http://24.101.103.87:8082/api/workorder-revisions/ByWorkorderId/${workorderId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching revisions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching revisions:", error);
      return [];
    }
  };

  
  
  
  return (
    <div className="container mx-auto border border-gray-300 rounded-lg p-4 max-w-4xl">
      <h6 className="text-lg font-semibold mb-4">Duplicate Workorder For fg</h6>
      
      {/* Error message */}
      {/* Error message with prominent action button */}
{error && (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow">
    <div className="flex items-center">
      <div className="py-1">
        <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="font-bold">{error}</p>
        <p className="text-sm">Please select a workorder before proceeding with duplication.</p>
      </div>
      <button 
        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow"
        onClick={redirectToSelection}
      >
        Select Workorder
      </button>
    </div>
  </div>
)}
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 h-2 mb-6 rounded-full">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Step 1 */}
      {!error && currentStep === 1 && (
        <div className="space-y-4">
          <div className="w-full">
            <label htmlFor="workname" className="block mb-1">Name Of Work:</label>
            <textarea 
              id="workname" 
              className="w-full border border-gray-300 rounded p-2 mb-3"
              value={formData.workname}
              onChange={handleInputChange}
              required
            ></textarea>
            <input type="hidden" value="92" id="createdBy"/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block mb-1">State:</label>
              <select 
                name="state" 
                id="state" 
                className="w-full border border-gray-300 rounded p-2 mb-3"
                value={formData.state}
                onChange={handleInputChange}
              >
                <option value="">Select State</option>
                <option value="demo1" data-tin="23">demo1</option>
                <option value="MH" data-tin="27">MH</option>
                <option value="demo2" data-tin="34">demo2</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="department" className="block mb-1">Department:</label>
              <select 
                name="department" 
                id="department" 
                className="w-full border border-gray-300 rounded p-2 mb-3"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="">Select Department</option>
                <option value="PWD">PWD</option>
              </select>
            </div>
          </div>
          
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={nextStep}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Step 2 */}
      {!error && currentStep === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="WorkOrder" className="block mb-1">Work order ID:</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded p-2 mb-3 bg-gray-100"
                id="WorkOrder" 
                value={formData.workOrderID}
                readOnly
              />
            </div>
            
            <div>
              <label htmlFor="chapter" className="block mb-1">Chapter:</label>
              <select 
                name="chapter" 
                id="chapter" 
                className="w-full border border-gray-300 rounded p-2 mb-3 bg-gray-100"
                value={formData.chapter}
                onChange={handleInputChange}
                disabled
              >
                <option value="">Select Chapter</option>
                <option value="1">Accoustic</option>
                <option value="18">Road Works</option>
                <option value="3">Building Works</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ssr" className="block mb-1">SSR:</label>
              <select 
                name="ssr" 
                id="ssr" 
                className="w-full border border-gray-300 rounded p-2 mb-3"
                value={formData.ssr}
                onChange={handleInputChange}
              >
                <option value="">Select SSR</option>
                <option value="demo2">demo2</option>
                <option value="SSR 2022-23">SSR 2022-23</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="area" className="block mb-1">Area:</label>
              <select 
                name="area" 
                id="area" 
                className="w-full border border-gray-300 rounded p-2 mb-3"
                value={formData.area}
                onChange={handleInputChange}
              >
                <option value="">Select Area</option>
                <option value="Corporation Area">Corporation Area</option>
                <option value="Muncipal Council Area">Muncipal Council Area</option>
                <option value="For Mumbai/Brahan Mumbai">For Mumbai/Brahan Mumbai</option>
                <option value="Sugarcane Factory Area (Within 10 KM radius)">Sugarcane Factory Area (Within 10 KM radius)</option>
                <option value="Notified Tribal Areas">Notified Tribal Areas</option>
                <option value="Hilly Areas">Hilly Areas</option>
                <option value="Inaccessible Areas">Inaccessible Areas</option>
                <option value="Inside Premises of Central Jail">Inside Premises of Central Jail</option>
                <option value="Mental Hospital">Mental Hospital</option>
                <option value="Raj Bhawan">Raj Bhawan</option>
                <option value="Yerawada Printing Presses">Yerawada Printing Presses</option>
                <option value="Tiger Project Area in Maleghat">Tiger Project Area in Maleghat</option>
                <option value="Coal / Lime Mining Area">Coal / Lime Mining Area</option>
                <option value="Naxelite Affected Area">Naxelite Affected Area</option>
                <option value="Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas">Metropolitan areas notified by UDD excluding Municipal Corporation and Council areas</option>
                <option value="General Area">General Area</option>
                <option value="abcs">abcs</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preparedBy" className="block mb-1">Prepared By:</label>
              <textarea 
                placeholder="Prepared BY..." 
                className="w-full border border-gray-300 rounded p-2 mb-3" 
                rows="5" 
                id="preparedBy"
                value={formData.preparedBy}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="checkedBy" className="block mb-1">Checked By:</label>
              <textarea 
                placeholder="Checked By ..." 
                className="w-full border border-gray-300 rounded p-2 mb-3" 
                rows="5" 
                id="checkedBy"
                value={formData.checkedBy}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              onClick={prevStep}
            >
              Previous
            </button>
            
            <button 
              onClick={addWork} 
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg flex flex-col items-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700">Processing your request...</p>
          </div>
        </div>
      )}
      
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center group relative">
          <span className="absolute right-full mr-3 bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Create New Estimate
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        
        <button className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center group relative">
          <span className="absolute right-full mr-3 bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Contact
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DuplicateEstimate;