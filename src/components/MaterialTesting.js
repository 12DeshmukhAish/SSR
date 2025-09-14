import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, X, Save, Trash2, Edit ,ArrowRight} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import StepperPage from './Stepper';
import toast, { Toaster } from 'react-hot-toast';

const MaterialTestingPage = () => {
  const [materialTests, setMaterialTests] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(5); 
  const [testMasterData, setTestMasterData] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [workOrderId, setWorkOrderId] = useState(null);
  const [reviseId, setReviseId] = useState(null);
  const [workName, setWorkName] = useState('');
   const [items, setItems] = useState({});
  const navigate = useNavigate();
  const [jwtToken, setJwtToken] = useState(null);
  const [workorderData, setWorkorderData] = useState(null);
  const [revisionData, setRevisionData] = useState(null);
  
  // Work details state
  const [workDetails, setWorkDetails] = useState({
    nameOfWork: '',
    nameOfSubWork: '',
    workOrderNo: '',
    revisionNo: ''
  });
  const [workLoading, setWorkLoading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    sr_no: '',
    description_of_test: '',
    consumption: '',
    unit: '',
    details: []
  });

  const UNIT_OPTIONS = [
    { value: 'CuM', label: 'CuM' },
    { value: 'SqM', label: 'SqM' },
    { value: 'Rmt', label: 'Rmt' },
    { value: 'Nos', label: 'Nos' }
  ];
const [detailFormData, setDetailFormData] = useState({
  id: null,
  name_of_test: '',
  freq: '',
  material: '',
  material_unit: '',
  required_test: '',
  remark: '',
  test_description: '',
  rate: 0,
  original_required_test: '',
  is_updated: false
});
  const loadWorkOrderDetails = () => {
    const storedWorkOrderId = localStorage.getItem('workOrderId') || 
                       localStorage.getItem('workorderId') || 
                       localStorage.getItem('workOrderID') || 
                       localStorage.getItem('workorder_id');
    const storedReviseId = localStorage.getItem('reviseId') || 
                    localStorage.getItem('revisionId');
    
    if (storedWorkOrderId) {
      setWorkOrderId(parseInt(storedWorkOrderId));
    }
    if (storedReviseId) {
      setReviseId(parseInt(storedReviseId));
    }
  };

  const loadWorkName = () => {
    const storedWorkName = localStorage.getItem('nameOfWork');
    if (storedWorkName) {
      setWorkName(storedWorkName);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jwtToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    if (token) {
      setJwtToken(token);
    }
  }, []);

  // API Functions
  const fetchWorkDetails = async (workOrderNo, revisionNo) => {
    setWorkLoading(true);
    try {
      const workOrderToUse = workOrderNo || workOrderId;
      const revisionToUse = revisionNo || reviseId;
      
      if (!workOrderToUse || !revisionToUse) {
        console.warn('Missing work order or revision details');
        setWorkDetails({
          nameOfWork: workName || 'Work details not available',
          nameOfSubWork: 'Construction Material Testing',
          workOrderNo: workOrderToUse || '',
          revisionNo: revisionToUse || ''
        });
        setWorkLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderToUse}/revisions/${revisionToUse}`);
      if (response.ok) {
        const data = await response.json();
        setWorkDetails({
          nameOfWork: data.work_name || data.name_of_work || workName || '',
          nameOfSubWork: data.sub_work_name || data.name_of_sub_work || 'Construction Material Testing',
          workOrderNo: workOrderToUse,
          revisionNo: revisionToUse
        });
      } else {
        console.error('Failed to fetch work details');
        setWorkDetails({
          nameOfWork: workName || 'Work details not available',
          nameOfSubWork: 'Construction Material Testing',
          workOrderNo: workOrderToUse,
          revisionNo: revisionToUse
        });
      }
    } catch (error) {
      console.error('Error fetching work details:', error);
      setWorkDetails({
        nameOfWork: workName || 'Work details not available',
        nameOfSubWork: 'Construction Material Testing',
        workOrderNo: workOrderId || '',
        revisionNo: reviseId || ''
      });
    } finally {
      setWorkLoading(false);
    }
  };

  const handleStepNavigation = (stepId) => {
    const stepRoutes = {
      1: '/estimate',
      2: '/subestimate', 
      3: '/lead',
      4: '/royalty',
      5: '/mat',
      6: '/cmt-qty',
      7: '/pdf-preview'
    };

    if (stepRoutes[stepId]) {
      navigate(stepRoutes[stepId]);
    }
  };

  const fetchMaterialTestingSummary = async (workOrderNo, revisionNo) => {
  if (!jwtToken) {
    console.warn('No JWT token available for fetching material testing summary');
    setMaterialTests([]);
    return;
  }
  
  setLoading(true);
  try {
    const workOrderToUse = workOrderNo || workOrderId;
    const revisionToUse = revisionNo || reviseId;
    
    const queryParams = new URLSearchParams();
    if (workOrderToUse) queryParams.append('work_order_no', workOrderToUse);
    if (revisionToUse) queryParams.append('revision_no', revisionToUse);
    
    const response = await fetch(`https://24.101.103.87:8082/api/material-testing?${queryParams}`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Raw material testing data:', data);
      
      // Normalize the field names and ensure each test has a details property initialized as null
      const testsWithDetails = data.map(test => ({
        ...test,
        // Ensure consistent field naming
        sr_no: test.srNo || test.sr_no,
        srNo: test.srNo || test.sr_no,
        description_of_test: test.descriptionOfTest || test.description_of_test,
        descriptionOfTest: test.descriptionOfTest || test.description_of_test,
        details: null // Initialize as null so we can check if details are loaded
      }));
      
      console.log('Processed material tests:', testsWithDetails);
      setMaterialTests(testsWithDetails);
      
      // Clear any previously expanded rows that might not exist anymore
      const validSrNos = new Set(testsWithDetails.map(test => test.srNo || test.sr_no));
      const filteredExpandedRows = new Set([...expandedRows].filter(srNo => validSrNos.has(parseInt(srNo))));
      setExpandedRows(filteredExpandedRows);
    } else {
      console.error('Failed to fetch material testing summary:', response.status);
      setMaterialTests([]);
    }
  } catch (error) {
    console.error('Error fetching material testing summary:', error);
    setMaterialTests([]);
  } finally {
    setLoading(false);
  }
};
const fetchMaterialTestingDetail = async (srNo, workOrderNo, revisionNo) => {
  if (!jwtToken) {
    console.warn('No JWT token available for fetching material testing detail');
    return [];
  }
  
  try {
    const workOrderToUse = workOrderNo || workOrderId;
    const revisionToUse = revisionNo || reviseId;
    
    const response = await fetch(`https://24.101.103.87:8082/api/material-testing-details`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const allDetails = await response.json();
      
      // Filter details for the specific srNo and work order
      const filteredDetails = allDetails.filter(detail => {
        return detail.materialTesting && 
               detail.materialTesting.srNo === parseInt(srNo) &&
               detail.materialTesting.workorderId === parseInt(workOrderToUse) &&
               detail.materialTesting.reviseId === parseInt(revisionToUse);
      });
      
      // Transform the data to match your expected format
      return filteredDetails.map(detail => ({
        id: detail.id,
        name_of_test: detail.nameOfTest || '',
        freq: detail.frequency || '',
        material: detail.materialTestingDetailCol || '', // Map this field properly
        material_unit: detail.unit || '',
        required_test: detail.requiredTest || '',
        remark: detail.remark || '',
        test_description: detail.materialTestingDetailCol || '',
        rate: detail.rate || 0,
        original_required_test: detail.requiredTest || '', // Set initial value
        is_updated: false // Initially not updated
      }));
    } else {
      console.error('Failed to fetch material testing detail:', response.status);
    }
  } catch (error) {
    console.error('Error fetching material testing detail:', error);
  }
  return [];
};

const fetchTestMasterData = async () => {
  if (!jwtToken) {
    console.warn('No JWT token available for fetching test master data');
    return;
  }
  
  try {
    const response = await fetch(`https://24.101.103.87:8082/api/master/constructionTestingMaterial`, {
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Remove duplicates based on nameOfTest
      const uniqueTests = data.filter((test, index, self) =>
        index === self.findIndex(t => t.nameOfTest === test.nameOfTest)
      );
      setTestMasterData(uniqueTests);
    } else {
      console.error('Failed to fetch test master data:', response.status);
    }
  } catch (error) {
    console.error('Error fetching test master data:', error);
  }
};

  const fetchWorkorderData = async (workOrderId) => {
    if (!jwtToken) {
      console.warn('No JWT token available for fetchWorkorderData');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/workorders`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const workorders = await response.json();
        const workorder = workorders.find(wo => wo.id === workOrderId);
        setWorkorderData(workorder);
        return workorder;
      } else {
        console.error('Failed to fetch workorder data:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching workorder data:', error);
      return null;
    }
  };

  const fetchRevisionData = async (workOrderId) => {
    if (!jwtToken) {
      console.warn('No JWT token available for fetchRevisionData');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/workorder-revisions/${workOrderId}`, {
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      
      if (response.ok) {
        const revisions = await response.json();
        const revision = revisions.find(r => r.id === reviseId || r.currentFlag === true);
        setRevisionData(revision);
        return revision;
      } else {
        console.error('Failed to fetch revision data:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error fetching revision data:', error);
      return null;
    }
  };

  const saveOrUpdateMaterialTest = async (testData) => {
    if (!jwtToken) {
      console.warn('No JWT token available for saving material test');
      throw new Error('Authentication required');
    }
    
    try {
      let workorder = workorderData;
      let revision = revisionData;
      
      if (!workorder && workOrderId) {
        workorder = await fetchWorkorderData(workOrderId);
      }
      
      if (!revision && workOrderId) {
        revision = await fetchRevisionData(workOrderId);
      }
      
      const method = testData.id ? 'PUT' : 'POST';
      const url = testData.id 
        ? `https://24.101.103.87:8082/api/material-testing/${testData.id}`
        : `https://24.101.103.87:8082/api/material-testing`;

      const payload = {
        srNo: parseInt(testData.sr_no) || 0,
        descriptionOfTest: testData.description_of_test,
        consumption: parseFloat(testData.consumption) || 0,
        unit: testData.unit,
        reviseId: reviseId || (revision ? revision.id : 0),
        workorderId: workOrderId || (workorder ? workorder.id : 0),
        revise: revision ? {
          id: revision.id,
          workorderId: revision.workorderId,
          reviseNumber: revision.reviseNumber,
          createdDate: revision.createdDate,
          createdBy: revision.createdBy,
          updatedBy: revision.updatedBy,
          currentFlag: revision.currentFlag,
          updatedDate: revision.updatedDate,
          deletedFlag: revision.deletedFlag,
          pdfLocation: revision.pdfLocation,
          revisionStage: revision.revisionStage,
          revisionStatus: revision.revisionStatus
        } : null,
        workorder: workorder ? {
          id: workorder.id, 
          workOrderID: workorder.workOrderID,
          createdDate: workorder.createdDate,
          createdBy: workorder.createdBy,
          state: workorder.state,
          nameOfWork: workorder.nameOfWork,
          ssr: workorder.ssr,
          area: workorder.area,
          chapterId: workorder.chapterId,
          preparedBySignature: workorder.preparedBySignature,
          checkedBySignature: workorder.checkedBySignature,
          status: workorder.status,
          department: workorder.department,
          deletedFlag: workorder.deletedFlag,
          multifloor: workorder.multifloor,
          fkSsrId: workorder.fkSsrId
        } : null
      }; 
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        fetchMaterialTestingSummary();
        return data;
      } else {
        const errorData = await response.text();
        console.error('Failed to save material test:', errorData);
        throw new Error('Failed to save material test');
      }
    } catch (error) {
      console.error('Error saving material test:', error);
      throw error;
    }
  };
  
  const saveOrUpdateTestDetail = async (srNo, detailData) => {
  if (!jwtToken) {
    console.warn('No JWT token available for saving test detail');
    showToast('Authentication required', 'error');
    return null;
  }
  
  try {
    console.log('Saving test detail for srNo:', srNo);
    console.log('Detail data received:', detailData);
    
    // Find the material testing record for this srNo
    const materialTestingRecord = materialTests.find(test => test.sr_no === srNo);
    console.log('Found material testing record:', materialTestingRecord);
    
    if (!materialTestingRecord) {
      console.error('Material testing record not found for srNo:', srNo);
      showToast('Material testing record not found', 'error');
      return null;
    }

    // Ensure we have workorder and revision data
    if (!workorderData && workOrderId) {
      await fetchWorkorderData(workOrderId);
    }
    if (!revisionData && workOrderId) {
      await fetchRevisionData(workOrderId);
    }

    const method = detailData.id ? 'PUT' : 'POST';
    const url = detailData.id 
      ? `https://24.101.103.87:8082/api/material-testing-details/${detailData.id}`
      : `https://24.101.103.87:8082/api/material-testing-details`;
    
    // Construct the complete request body matching API specification
    const payload = {
      id: detailData.id || 0,
      materialTestingId: materialTestingRecord.id || 0,
      srNo: parseInt(srNo) || 0,
      nameOfTest: detailData.name_of_test || '',
      frequency: parseFloat(detailData.freq) || 0,
      unit: detailData.material_unit || '',
      requiredTest: parseFloat(detailData.required_test) || 0,
      remark: detailData.remark || '',
      createdDate: detailData.createdDate || new Date().toISOString(),
      createdBy: detailData.createdBy || 0,
      materialTestingDetailCol: detailData.materialTestingDetailCol || '',
      materialTesting: {
        id: materialTestingRecord.id || 0,
        srNo: parseInt(srNo) || 0,
        descriptionOfTest: materialTestingRecord.description_of_test || '',
        consumption: parseFloat(materialTestingRecord.consumption) || 0,
        unit: materialTestingRecord.unit || '',
        reviseId: parseInt(reviseId) || parseInt(materialTestingRecord.revise_id) || 0,
        workorderId: parseInt(workOrderId) || parseInt(materialTestingRecord.workorder_id) || 0,
        revise: revisionData ? {
          id: revisionData.id || 0,
          workorderId: revisionData.workorderId || parseInt(workOrderId) || 0,
          reviseNumber: revisionData.reviseNumber || '',
          createdDate: revisionData.createdDate || new Date().toISOString(),
          createdBy: revisionData.createdBy || 0,
          updatedBy: revisionData.updatedBy || 0,
          currentFlag: revisionData.currentFlag !== undefined ? revisionData.currentFlag : true,
          updatedDate: revisionData.updatedDate || new Date().toISOString(),
          deletedFlag: revisionData.deletedFlag || '',
          pdfLocation: revisionData.pdfLocation || '',
          revisionStage: revisionData.revisionStage || '',
          revisionStatus: revisionData.revisionStatus || ''
        } : {
          id: parseInt(reviseId) || 0,
          workorderId: parseInt(workOrderId) || 0,
          reviseNumber: '',
          createdDate: new Date().toISOString(),
          createdBy: 0,
          updatedBy: 0,
          currentFlag: true,
          updatedDate: new Date().toISOString(),
          deletedFlag: '',
          pdfLocation: '',
          revisionStage: '',
          revisionStatus: ''
        },
        workorder: workorderData ? {
          id: workorderData.id || 0,
          workOrderID: workorderData.workOrderID || '',
          createdDate: workorderData.createdDate || new Date().toISOString(),
          createdBy: workorderData.createdBy || 0,
          state: workorderData.state || '',
          nameOfWork: workorderData.nameOfWork || '',
          ssr: workorderData.ssr || '',
          area: workorderData.area || '',
          chapterId: workorderData.chapterId || 0,
          preparedBySignature: workorderData.preparedBySignature || '',
          checkedBySignature: workorderData.checkedBySignature || '',
          status: workorderData.status || '',
          department: workorderData.department || '',
          deletedFlag: workorderData.deletedFlag || 0,
          multifloor: workorderData.multifloor || 0,
          fkSsrId: workorderData.fkSsrId || 0
        } : {
          id: parseInt(workOrderId) || 0,
          workOrderID: '',
          createdDate: new Date().toISOString(),
          createdBy: 0,
          state: '',
          nameOfWork: '',
          ssr: '',
          area: '',
          chapterId: 0,
          preparedBySignature: '',
          checkedBySignature: '',
          status: '',
          department: '',
          deletedFlag: 0,
          multifloor: 0,
          fkSsrId: 0
        }
      }
    };
    
    console.log('Sending payload to API:');
    console.log(JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method,
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    console.log('API Response status:', response.status);
    console.log('API Response headers:', response.headers);
    
    if (response.ok) {
      const result = await response.json();
      console.log('API Response success:', result);
      
      // Refresh the material testing summary
      await fetchMaterialTestingSummary(workDetails.workOrderNo, workDetails.revisionNo);
      return result;
    } else {
      const errorText = await response.text();
      console.error('API Response error:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText
      });
      showToast(`Failed to save test detail: ${response.status} - ${response.statusText}`, 'error');
      return null;
    }
  } catch (error) {
    console.error('Network error saving test detail:', error);
    showToast('Network error occurred while saving test detail', 'error');
    return null;
  }
};

  const deleteMaterialTest = async (testId) => {
  if (!jwtToken) {
    showToast('Authentication required', 'error');
    return;
  }
  
  try {
    const response = await fetch(`https://24.101.103.87:8082/api/material-testing/${testId}`, {
      method: 'PUT', // Changed from DELETE to PUT as per API spec
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      fetchMaterialTestingSummary(workDetails.workOrderNo, workDetails.revisionNo);
      showToast('Material test deleted successfully!', 'success');
    } else {
      console.error('Failed to delete material test:', response.status);
      showToast('Failed to delete material test', 'error');
    }
  } catch (error) {
    console.error('Error deleting material test:', error);
    showToast('Error deleting material test', 'error');
  }
};

 const deleteTestDetail = async (detailId) => {
  if (!jwtToken) {
    showToast('Authentication required', 'error');
    return;
  }
  
  try {
    const response = await fetch(`https://24.101.103.87:8082/api/material-testing-details/${detailId}`, {
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${jwtToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      // Refresh the data after successful deletion
      await fetchMaterialTestingSummary(workDetails.workOrderNo, workDetails.revisionNo);
      showToast('Test detail deleted successfully!', 'success');
    } else {
      console.error('Failed to delete test detail:', response.status);
      showToast('Failed to delete test detail', 'error');
    }
  } catch (error) {
    console.error('Error deleting test detail:', error);
    showToast('Error deleting test detail', 'error');
  }
};

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };
  
  useEffect(() => {
    loadWorkOrderDetails();
    loadWorkName();
    
    const getWorkOrderParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const workOrderNo = urlParams.get('workOrderNo') || urlParams.get('work_order_no');
      const revisionNo = urlParams.get('revisionNo') || urlParams.get('revision_no');
      return { workOrderNo, revisionNo };
    };
    
    const { workOrderNo: urlWorkOrderNo, revisionNo: urlRevisionNo } = getWorkOrderParams();
    
    if (jwtToken) {
      setTimeout(async () => {
        fetchWorkDetails(urlWorkOrderNo, urlRevisionNo);
        fetchMaterialTestingSummary(urlWorkOrderNo, urlRevisionNo);
        fetchTestMasterData();
        
        if (workOrderId) {
          await fetchWorkorderData(workOrderId);
          await fetchRevisionData(workOrderId);
        }
      }, 100);
    }
  }, [workOrderId, reviseId, jwtToken]);

 const handleRowExpand = async (srNo) => {
  const newExpandedRows = new Set(expandedRows);
  
  console.log('Expanding/collapsing row for srNo:', srNo);
  
  if (expandedRows.has(srNo)) {
    // Collapsing row
    newExpandedRows.delete(srNo);
    if (editingDetail === srNo) {
      setEditingDetail(null);
      setDetailFormData({
        id: null,
        name_of_test: '',
        freq: '',
        material: '',
        material_unit: '',
        required_test: '',
        remark: '',
        test_description: '',
        rate: 0,
        original_required_test: '',
        is_updated: false
      });
    }
  } else {
    // Expanding row - only expand this specific row
    newExpandedRows.add(srNo);
    
    // Find the specific test by srNo (fix the comparison)
    const testIndex = materialTests.findIndex(test => test.srNo === parseInt(srNo) || test.sr_no === parseInt(srNo));
    console.log('Found test index:', testIndex, 'for srNo:', srNo);
    console.log('Current materialTests:', materialTests);
    
    if (testIndex !== -1 && (!materialTests[testIndex].details || materialTests[testIndex].details === null)) {
      console.log('Loading details for srNo:', srNo);
      const details = await fetchMaterialTestingDetail(srNo, workDetails.workOrderNo, workDetails.revisionNo);
      console.log('Loaded details:', details);
      
      // Update only the specific test with its details
      const updatedTests = [...materialTests];
      updatedTests[testIndex].details = details;
      setMaterialTests(updatedTests);
      console.log('Updated materialTests with details:', updatedTests);
    } else {
      console.log('Details already exist or test not found:', {
        testIndex,
        existingDetails: materialTests[testIndex]?.details
      });
    }
  }
  
  // Update expanded rows state
  setExpandedRows(newExpandedRows);
};

 const handleTestSelection = (testName) => {
  const selectedTest = testMasterData.find(test => test.nameOfTest === testName);
  if (selectedTest) {
    setDetailFormData({
      ...detailFormData,
      name_of_test: testName,
      freq: '', // This field is not in the API response, so keep it empty for user input
      material: selectedTest.testDescription || '',
      material_unit: '', // This field is not in the API response, so keep it empty for user input
      test_description: selectedTest.testDescription || '',
      rate: selectedTest.rate || 0
    });
  }
};
 const navigateToPdfPreview = async () => {
  //   const allSubworkIds = Object.keys(items);
    
  //   if (allSubworkIds.length === 0) {
  //     // toast.error("No subworks or items found to generate PDF");
  //     return;
  //   }
 
  //   const allItemsWithMeasurements = await Promise.all(
  //     allSubworkIds.flatMap(subworkId =>
  //       (items[subworkId] || []).map(async (item) => {
  //         try {
  //           const response = await fetch(`${API_BASE_URL}/api/txn-items-mts/ByItemId/${item.id}`, {
  //             headers: {
  //               Authorization: `Bearer ${jwtToken}`,
  //               "Content-Type": "application/json",
  //             },
  //           });
  //           const measurements = await response.json();
  //           return { ...item, measurements: Array.isArray(measurements) ? measurements : [] };
  //         } catch (err) {
  //           console.error("Error fetching measurements for item", item.id, err);
  //           return { ...item, measurements: [] };
  //         }
  //       })
  //     )
  //   );
  
  //   localStorage.setItem("subRecordCache", JSON.stringify(allItemsWithMeasurements));
  //   localStorage.setItem("pdfWorkName", workOrderInfo.nameOfWork);
  //   localStorage.setItem("pdfWorkOrderId", workOrderInfo.autogenerated);
  //   localStorage.setItem("pdfRevisionNumber", workOrderInfo.reviseno);
  // localStorage.setItem("defaultActiveComponent", "abstract");
    // toast.success("Preparing full PDF...");
    navigate("/pdf-preview");
  };
  const handleSaveTest = async () => {
    try {
      const result = await saveOrUpdateMaterialTest(formData);
      if (result) {
        setShowModal(false);
        setFormData({
          sr_no: '',
          description_of_test: '',
          consumption: '',
          unit: '',
          details: []
        });
        showToast('Material testing added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving material test:', error);
      showToast('Failed to save material test. Please try again.', 'error');
    }
  };

const handleSaveDetail = async (srNo) => {
  console.log('Handling save detail for srNo:', srNo);
  console.log('Current form data:', detailFormData);
  
  // Validate required fields
  if (!detailFormData.name_of_test) {
    showToast('Please select a test name', 'error');
    return;
  }
  
  if (!detailFormData.required_test) {
    showToast('Please enter required test value', 'error');
    return;
  }
  
  try {
    // Track if required_test has been updated
    const updatedDetailData = { ...detailFormData };
    
    // If this is the first time setting required_test and it's different from a calculated value
    if (!detailFormData.original_required_test && detailFormData.required_test) {
      updatedDetailData.original_required_test = detailFormData.required_test;
    }

    // Check if required_test has been updated from its original value
    if (detailFormData.original_required_test && 
        detailFormData.required_test !== detailFormData.original_required_test) {
      updatedDetailData.is_updated = true;
    }

    console.log('Saving detail data:', updatedDetailData);
    
    const result = await saveOrUpdateTestDetail(srNo, updatedDetailData);
    
    if (result) {
      console.log('Detail saved successfully:', result);
      
      // Instead of calling fetchMaterialTestingSummary (which resets all details to null),
      // we'll refresh just the details for this specific test
      const updatedDetails = await fetchMaterialTestingDetail(srNo, workDetails.workOrderNo, workDetails.revisionNo);
      
      // Update the specific test's details in the materialTests array
      setMaterialTests(prevTests => {
        return prevTests.map(test => {
          if ((test.srNo === parseInt(srNo)) || (test.sr_no === parseInt(srNo))) {
            return { ...test, details: updatedDetails };
          }
          return test;
        });
      });
      
      // Reset form data
      setDetailFormData({
        id: null,
        name_of_test: '',
        freq: '',
        material: '',
        material_unit: '',
        required_test: '',
        remark: '',
        test_description: '',
        rate: 0,
        original_required_test: '',
        is_updated: false
      });
      
      setEditingDetail(null);
      const isEdit = detailFormData.id;
      showToast(
        isEdit ? 'Test detail updated successfully!' : 'Test detail added successfully!', 
        'success'
      );
    }
  } catch (error) {
    console.error('Error in handleSaveDetail:', error);
    showToast('Failed to save test detail. Please try again.', 'error');
  }
};
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Toast Message */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="mb-6 mt-2 p-4 border border-gray-300 rounded bg-white shadow-md">
        <StepperPage 
          currentStep={currentStep}
          onStepClick={handleStepNavigation}
        />
      </div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Construction Material Testing</h1>
              
              {workLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Name of Work:</span> 
                    <span className="ml-2">{workDetails.nameOfWork || 'Loading work details...'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Name of Sub Work:</span> 
                    <span className="ml-2">{workDetails.nameOfSubWork}</span>
                  </div>
                  {(workDetails.workOrderNo || workDetails.revisionNo) && (
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {workDetails.workOrderNo && (
                        <span>Work Order: <span className="font-mono">{workDetails.workOrderNo}</span></span>
                      )}
                      {workDetails.revisionNo && (
                        <span>Revision: <span className="font-mono">{workDetails.revisionNo}</span></span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={workLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Add Material Testing
            </button>
          </div>
        </div>

        {/* Material Testing Summary Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Summary of Material Testing</h2>
            <p className="text-sm text-gray-600 mt-1">Tests are calculated automatically based on SSR, can be customized if needed</p>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading material tests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description of Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption (as per statements attached)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {materialTests.map((test) => (
                    <React.Fragment key={test.sr_no}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleRowExpand(test.sr_no)}
                              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {expandedRows.has(test.sr_no) ? (
                                <ChevronDown size={16} className="text-gray-600" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-600" />
                              )}
                            </button>
                            <span className="text-sm font-medium text-gray-900">{test.srNo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-md">{test.descriptionOfTest}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{test.consumption}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{test.unit}</div>
                        </td>
                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
  <button
    onClick={() => deleteMaterialTest(test.id)} // Changed from test.srNo to test.id
    className="text-red-600 hover:text-red-900 transition-colors"
  >
    <Trash2 size={16} />
  </button>
</td>

                      </tr>
                      
                      {/* Expanded Detail Section */}
                      {expandedRows.has(test.sr_no) && (
                        <tr>
                          <td colSpan="5" className="px-4 py-4 bg-gray-50">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Material Testing Details - SR No. {test.sr_no}</h3>
                                <button
                                  onClick={() => {
                                    setDetailFormData({
                                      name_of_test: '',
                                      freq: '',
                                      material: '',
                                      material_unit: '',
                                      required_test: '',
                                      remark: ''
                                    });
                                    setEditingDetail(test.sr_no);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                                >
                                  <Plus size={14} />
                                  Add Test Detail
                                </button>
                              </div>
                              
                              {/* Detail Table */}
                             <div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sr No.</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name of Test</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required Tests</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      {/* Debug: Show if details exist */}
      {console.log('Rendering details for test:', test.srNo || test.sr_no, 'Details:', test.details)}
      
      {test.details && test.details.length > 0 ? (
        test.details.map((detail, index) => {
          console.log('Rendering detail:', index, detail);
          return (
            <tr key={detail.id || index} className="hover:bg-gray-50">
              <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
              <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">
                <div className="truncate" title={detail.name_of_test || ''}>
                  {detail.name_of_test || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-gray-900">{detail.freq || 'N/A'}</td>
              <td className="px-3 py-2 text-sm text-gray-900">{detail.material_unit || 'N/A'}</td>
              <td className="px-3 py-2 text-sm text-gray-900">
                <div>
                  {detail.is_updated && detail.original_required_test ? (
                    <div>
                      <span className="font-semibold text-blue-600">{detail.required_test} (Updated)</span>
                      <span className="text-gray-500 text-xs block">
                        Original: {detail.original_required_test}
                      </span>
                    </div>
                  ) : (
                    <span>{detail.required_test || 'N/A'}</span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 text-sm text-gray-900 max-w-xs">
                <div className="truncate" title={detail.remark || ''}>
                  {detail.remark || 'N/A'}
                </div>
              </td>
              <td className="px-3 py-2 text-sm font-medium">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setDetailFormData({
                        id: detail.id,
                        name_of_test: detail.name_of_test || '',
                        freq: detail.freq || '',
                        material: detail.material || '',
                        material_unit: detail.material_unit || '',
                        required_test: detail.required_test || '',
                        remark: detail.remark || '',
                        test_description: detail.test_description || '',
                        rate: detail.rate || 0,
                        original_required_test: detail.original_required_test || detail.required_test || '',
                        is_updated: detail.is_updated || false
                      });
                      setEditingDetail(test.srNo || test.sr_no);
                    }}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteTestDetail(detail.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="7" className="px-3 py-4 text-center text-gray-500">
            {test.details === null ? 'Loading details...' : 'No test details found. Click "Add Test Detail" to add some.'}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
                              {/* Add/Edit Detail Form */}
                              
{editingDetail === test.sr_no && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <h4 className="text-md font-medium text-gray-900 mb-3">
      {detailFormData.id ? 'Edit Test Detail' : 'Add Test Detail'}
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name of Test <span className="text-red-500">*</span>
        </label>
        <select
          value={detailFormData.name_of_test}
          onChange={(e) => handleTestSelection(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select Test</option>
          {testMasterData.map((test) => (
            <option key={test.consumptionTestingId} value={test.nameOfTest}>
              {test.nameOfTest}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
        <input
          type="text"
          value={detailFormData.freq}
          onChange={(e) => setDetailFormData({...detailFormData, freq: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 1 per 100 CuM"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <select
          value={detailFormData.material_unit}
          onChange={(e) => setDetailFormData({...detailFormData, material_unit: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Unit</option>
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Test <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={detailFormData.required_test}
          onChange={(e) => setDetailFormData({
            ...detailFormData, 
            required_test: e.target.value,
            is_updated: detailFormData.original_required_test && 
                       e.target.value !== detailFormData.original_required_test
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter required test count"
          required
        />
        {detailFormData.is_updated && (
          <p className="text-xs text-blue-600 mt-1">
            Original: {detailFormData.original_required_test}
          </p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
        <input
          type="number"
          step="0.01"
          value={detailFormData.rate}
          onChange={(e) => setDetailFormData({...detailFormData, rate: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          placeholder="Auto-filled from master"
          readOnly
        />
      </div>
      
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Test Description</label>
        <textarea
          value={detailFormData.test_description}
          onChange={(e) => setDetailFormData({...detailFormData, test_description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          rows="2"
          placeholder="Auto-filled from master"
          readOnly
        />
      </div>
      
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
        <textarea
          value={detailFormData.remark}
          onChange={(e) => setDetailFormData({...detailFormData, remark: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="2"
          placeholder="Enter any additional remarks..."
        />
      </div>
    </div>
    
    <div className="flex gap-2 mt-4">
      <button
        onClick={() => handleSaveDetail(test.sr_no)}
        disabled={!detailFormData.name_of_test || !detailFormData.required_test}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Save size={16} />
        {detailFormData.id ? 'Update Detail' : 'Save Detail'}
      </button>
      <button
        onClick={() => {
          setEditingDetail(null);
          setDetailFormData({
            name_of_test: '',
            freq: '',
            material: '',
            material_unit: '',
            required_test: '',
            remark: '',
            test_description: '',
            rate: 0,
            original_required_test: '',
            is_updated: false
          });
        }}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  </div>
)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              {materialTests.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500">
                  <p>No material tests found. Click "Add Material Testing" to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal for Adding Material Test */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add Material Testing</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sr No.</label>
                    <input
                      type="number"
                      value={formData.sr_no}
                      onChange={(e) => setFormData({...formData, sr_no: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter serial number..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description of Test</label>
                    <textarea
                      value={formData.description_of_test}
                      onChange={(e) => setFormData({...formData, description_of_test: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter test description..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consumption</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.consumption}
                        onChange={(e) => setFormData({...formData, consumption: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter consumption value..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Unit</option>
                        {UNIT_OPTIONS.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveTest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Save size={16} />
                    Save Test
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
     <div className="flex justify-center">
  <button
    onClick={navigateToPdfPreview}
    className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
  >
    <span>Next</span>
    <ArrowRight className="h-4 w-4" />
  </button>
</div> 
    </div>
    
  );
};

export default MaterialTestingPage;