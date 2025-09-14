import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, Crown, Loader, AlertTriangle, RefreshCw, ArrowLeft, Calendar, CreditCard, TrendingUp, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const ModifySubscriptionPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modifying, setModifying] = useState(false);

  // Function to get current user ID from localStorage or JWT token
  const getCurrentUserId = () => {
    try {
      const storedUid = localStorage.getItem('uid');
      if (storedUid && storedUid !== localStorage.getItem('username')) {
        return storedUid;
      }

      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('id');
      if (storedUserId && storedUserId !== localStorage.getItem('username')) {
        return storedUserId;
      }

      const jwtToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          const possibleIds = [payload.userId, payload.id, payload.uid, payload.sub];
          for (const id of possibleIds) {
            if (id && id !== payload.username && !isNaN(id)) {
              return id.toString();
            }
          }
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
      }

      const storedUserData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.id && userData.id !== userData.username) {
            return userData.id.toString();
          }
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError);
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('token');
  };

  // Fetch current subscription details
  const fetchCurrentSubscription = async () => {
  try {
    const userId = getCurrentUserId();
    const token = getAuthToken();
    
    if (!userId || !token) {
      throw new Error('User ID or token not found');
    }

    const response = await fetch(`${API_BASE_URL}/api/user-subscriptions/searchByUsrId?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No subscription found for user');
        return null;
      }
      throw new Error(`Failed to fetch current subscription. Status: ${response.status}`);
    }

    const subscriptionArray = await response.json();
    console.log('Current subscription data:', subscriptionArray);
    
    if (Array.isArray(subscriptionArray) && subscriptionArray.length > 0) {
      const activeSubscription = subscriptionArray.find(sub => 
        sub.status && sub.status.toLowerCase() === 'active'
      ) || subscriptionArray[subscriptionArray.length - 1];

      // Get credit information for this subscription (similar to credit page)
      let creditInfo = { totalCredits: 0, usedCredits: 0, remainingCredits: 0 };
      
      try {
        const creditResponse = await fetch(`${API_BASE_URL}/api/user-credit-points`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          }
        });
        
        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          const userCredits = Array.isArray(creditData) 
            ? creditData.filter(credit => credit.userId == userId && credit.userSubscriptionId == activeSubscription.id)
            : [];
          
          if (userCredits.length > 0) {
            // Get the latest credit record for this subscription
            const latestCredit = userCredits.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
            creditInfo = {
              totalCredits: latestCredit.availableCredits,
              usedCredits: latestCredit.usedCredits,
              remainingCredits: latestCredit.availableCredits - latestCredit.usedCredits
            };
          }
        }
      } catch (creditError) {
        console.error('Error fetching credit info:', creditError);
      }

      // Enhanced subscription with actual credit data
      const enhancedSubscription = {
        ...activeSubscription,
        ...creditInfo, // Add actual credit information
        planDuration: activeSubscription.billingCycle || 
                     activeSubscription.subscriptionType || 
                     activeSubscription.planType || 
                     activeSubscription.planDuration || 
                     'monthly'
      };
      
      console.log('Enhanced subscription with credits:', enhancedSubscription);
      return enhancedSubscription;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching current subscription:', err);
    throw err;
  }
};


  // Fetch available subscription plans
  const fetchSubscriptionData = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/master-subscriptions`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription plans. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Available subscription data:', data);
      
      // Filter only active plans
      const activePlans = data.filter(plan => plan.isActive === true);
      setSubscriptionData(activePlans);
      
      return activePlans;
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      throw err;
    }
  };

  
  // Fetch all data on component mount
 const fetchAllData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Remove the mock data loading and use real API calls
    const [currentSub, availablePlans] = await Promise.all([
      fetchCurrentSubscription(),
      fetchSubscriptionData()
    ]);
    
    setCurrentSubscription(currentSub);
    setSubscriptionData(availablePlans);
    
    console.log('All data loaded:', {
      currentSub,
      availablePlansCount: availablePlans.length
    });
    
  } catch (err) {
    console.error('Error fetching data:', err);
    setError(err.message || 'Unable to load subscription data. Please try again.');
  } finally {
    setLoading(false);
  }
};

const getCurrentPlanDetails = () => {
  if (!currentSubscription) {
    return {
      planName: 'No Active Plan',
      totalCredits: 0,
      planDuration: 'N/A',
      isPayAsYouGo: false,
      displayName: 'No Active Plan',
      billingCycle: 'N/A',
      fullDisplayName: 'No Active Plan',
      usedCredits: 0,
      remainingCredits: 0
    };
  }

  // Get plan name and normalize it
  const planName = currentSubscription.planName || 'Current Plan';
  const isPayAsYouGoPlan = planName.toLowerCase() === 'pay as you go';
  
  // Use actual credit data from current subscription (fetched like credit page)
  const actualTotalCredits = currentSubscription.totalCredits || 0;
  const actualUsedCredits = currentSubscription.usedCredits || 0;
  const actualRemainingCredits = currentSubscription.remainingCredits || 0;
  
  // Get billing cycle info
  const billingCycle = currentSubscription.billingCycle || 
                      currentSubscription.subscriptionType || 
                      currentSubscription.planType || 
                      currentSubscription.planDuration || 
                      'monthly';
  
  let planDuration = 'monthly';
  let displayCycle = 'Monthly';
  
  if (billingCycle.toLowerCase().includes('month')) {
    planDuration = 'monthly';
    displayCycle = 'Monthly';
  } else if (billingCycle.toLowerCase().includes('year') || billingCycle.toLowerCase().includes('annual')) {
    planDuration = 'yearly';
    displayCycle = 'Yearly';
  } else {
    planDuration = billingCycle.toLowerCase();
    displayCycle = billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1);
  }

  if (isPayAsYouGoPlan) {
    return {
      planName: planName,
      totalCredits: actualTotalCredits,
      usedCredits: actualUsedCredits,
      remainingCredits: actualRemainingCredits,
      planDuration: 'one-time',
      isPayAsYouGo: true,
      displayName: 'Pay as you go',
      billingCycle: 'One-time',
      fullDisplayName: 'Pay as you go'
    };
  }
  
  // For subscription plans, find matching master plan for additional details
  let matchingMasterPlan = null;
  
  // Try to find by subscriptionId first
  if (currentSubscription.subscriptionId) {
    matchingMasterPlan = subscriptionData.find(plan => 
      plan.subscriptionId === currentSubscription.subscriptionId
    );
  }
  
  // If not found, try to match by plan name and duration
  if (!matchingMasterPlan) {
    matchingMasterPlan = subscriptionData.find(plan => 
      plan.planName?.toLowerCase() === planName.toLowerCase() &&
      plan.planDuration?.toLowerCase() === planDuration.toLowerCase() &&
      plan.planType === 'Subscription'
    );
  }
  
  const cleanPlanName = planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  
  return {
    planName: planName,
    totalCredits: actualTotalCredits, // Use actual data from API
    usedCredits: actualUsedCredits,   // Use actual data from API
    remainingCredits: actualRemainingCredits, // Use actual data from API
    planDuration: planDuration,
    isPayAsYouGo: false,
    displayName: cleanPlanName,
    billingCycle: displayCycle,
    fullDisplayName: `${cleanPlanName} ${displayCycle}`
  };
};

  // Handle plan modification
  const handleModifySubscription = async (newPlan) => {
    if (!currentSubscription) {
      setError('No current subscription found. Please contact support.');
      return;
    }

    // Check if current plan is expired
    const currentDate = new Date();
    const endDate = new Date(currentSubscription.endDate);
    
    if (endDate <= currentDate) {
      setError('Your current subscription has expired. Please purchase a new subscription instead.');
      return;
    }

    // Check if user is selecting the same plan
    if (currentSubscription.subscriptionId === newPlan.subscriptionId) {
      setError('You are already subscribed to this plan. Please select a different plan.');
      return;
    }

    setModifying(true);

    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      const modificationData = {
        userId: userId,
        currentSubscriptionId: currentSubscription.subscriptionId,
        newSubscriptionId: newPlan.subscriptionId,
        modificationReason: 'User requested plan change'
      };

      const response = await fetch(`${API_BASE_URL}/api/modify-subscription`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(modificationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to modify subscription. Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Modification result:', result);

      // Navigate to plan details or success page
      navigate('/plandetails', {
        state: {
          plan: newPlan,
          credits: newPlan.totalCredits,
          pricing: {
            finalPrice: newPlan.totalPrice,
            discount: 0,
            originalPrice: newPlan.totalPrice
          },
          autoRenewal: newPlan.planType === 'Subscription',
          isModification: true,
          previousPlan: currentSubscription
        }
      });

    } catch (err) {
      console.error('Error modifying subscription:', err);
      setError(err.message || 'Failed to modify subscription. Please try again.');
    } finally {
      setModifying(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'pay as you go':
        return <Zap className="w-6 h-6" />;
      case 'basic':
        return <Shield className="w-6 h-6" />;
      case 'standard':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getSubscriptionPlans = () => {
    return subscriptionData.filter(plan => 
      plan.planType === 'Subscription' && plan.isActive === true
    );
  };

  const getPayAsYouGoPlans = () => {
    return subscriptionData.filter(plan => 
      plan.planName?.toLowerCase() === 'pay as you go' && plan.isActive === true
    );
  };

  const getFilteredSubscriptionPlans = () => {
    const subscriptionPlans = getSubscriptionPlans();
    if (selectedPlan === 'monthly') {
      return subscriptionPlans.filter(plan => plan.planDuration === 'monthly');
    } else {
      return subscriptionPlans.filter(plan => plan.planDuration === 'yearly');
    }
  };

  const getAllPlansInOrder = () => {
    const payAsYouGoPlans = getPayAsYouGoPlans();
    const subscriptionPlans = getFilteredSubscriptionPlans();
    return [...payAsYouGoPlans, ...subscriptionPlans];
  };

  const calculateCreditCostAndSavings = (plan) => {
    const costPerCredit = plan.totalPrice / plan.totalCredits;
    let monthlySavings = null;
    
    if (plan.planDuration === 'yearly') {
      const monthlyPlan = subscriptionData.find(p => 
        p.planName === plan.planName && 
        p.planDuration === 'monthly' && 
        p.planType === plan.planType
      );
      
      if (monthlyPlan) {
        const monthlyCostPerCredit = monthlyPlan.totalPrice / monthlyPlan.totalCredits;
        monthlySavings = monthlyCostPerCredit - costPerCredit;
      }
    }
    
    return { costPerCredit, monthlySavings };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isCurrentPlan = (plan) => {
    return currentSubscription && currentSubscription.subscriptionId === plan.subscriptionId;
  };

  const getGridClasses = (cardCount) => {
    if (cardCount === 1) {
      return "flex justify-center";
    } else if (cardCount === 2) {
      return "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto";
    } else if (cardCount === 3) {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto";
    } else {
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto";
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Get current plan details for use in render
  const currentPlanDetails = getCurrentPlanDetails();
  const allPlans = getAllPlansInOrder();
  const subscriptionPlans = getFilteredSubscriptionPlans();
  const daysRemaining = currentSubscription ? getDaysRemaining(currentSubscription.endDate) : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Subscription Details</h2>
          <p className="text-gray-600 max-w-md">Fetching your current subscription and available plans...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Subscription Data</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </button>
            <button
              onClick={() => navigate('/subscription')}
              className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 font-semibold"
            >
              Back to Subscriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
      
         {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
         
              <button
                                 onClick={() => navigate('/history')}
                                   className="flex items-center gap-2 text-orange/90 hover:text-orange mb-4 transition-colors"
                                 >
                                   <ArrowLeft className="w-5 h-5" />
                                     Back to CreditPage
                                 </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-loose pb-2">
            Modify Your Subscription
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4">
            Upgrade or change your current plan to better suit your needs.
          </p>
        </div>

        {/* Current Subscription Overview */}
        {currentSubscription && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-500" />
                Current Subscription
              </h2>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                daysRemaining > 30 
                  ? 'bg-green-100 text-green-700' 
                  : daysRemaining > 7 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getPlanIcon(currentPlanDetails.planName)}
                  <h3 className="font-semibold text-gray-900">
                    {currentPlanDetails.displayName}
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  {currentPlanDetails.billingCycle}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Total Credits</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {currentPlanDetails.totalCredits.toLocaleString()} credits allocated
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Used Credits</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {currentPlanDetails.usedCredits.toLocaleString()} credits used
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Remaining</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {currentPlanDetails.remainingCredits.toLocaleString()} credits left
                </p>
              </div>
            </div>
            
            {/* Credit Usage Progress Bar */}
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Credit Usage</span>
                <span className="text-sm text-gray-600">
                  {currentPlanDetails.totalCredits > 0 ? 
                    Math.round((currentPlanDetails.usedCredits / currentPlanDetails.totalCredits) * 100) : 0}% used
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${currentPlanDetails.totalCredits > 0 ? 
                      (currentPlanDetails.usedCredits / currentPlanDetails.totalCredits) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 animate-slide-up">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Important Notes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your current subscription must be active to modify it</li>
                <li>• Plan changes will take effect immediately</li>
                <li>• Remaining credits from your current plan will be adjusted accordingly</li>
                <li>• You cannot select the same plan you're currently subscribed to</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Plan Duration Toggle - Only show if subscription plans exist */}
        {subscriptionPlans.length > 0 && (
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex bg-white rounded-full p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-500 transform ${
                  selectedPlan === 'monthly'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-500 relative transform ${
                  selectedPlan === 'yearly'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-102'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-1 rounded-full text-[10px] animate-pulse">
                  Save!
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Available Plans */}
        {allPlans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Plans</h2>
            <div className={`${getGridClasses(allPlans.length)} animate-fade-in-up`}>
              {allPlans.map((plan, index) => {
                const isPayAsYouGo = plan.planName?.toLowerCase() === 'pay as you go';
                const isPopular = plan.planName?.toLowerCase() === 'standard';
                const isCurrent = isCurrentPlan(plan);
                const { costPerCredit, monthlySavings } = calculateCreditCostAndSavings(plan);

                return (
                  <div
                    key={plan.subscriptionId}
                    className={`relative bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl h-full flex flex-col transform hover:scale-105 hover:-translate-y-2 ${
                      isCurrent 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : isPopular 
                          ? 'ring-2 ring-orange-500 scale-105' 
                          : ''
                    } animate-slide-up`}
                    style={{ 
                      minHeight: '520px',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Current Plan Badge */}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                          CURRENT PLAN
                        </div>
                      </div>
                    )}

                    {/* Popular Badge */}
                    {isPopular && !isCurrent && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                          MOST POPULAR
                        </div>
                      </div>
                    )}

                    <div className="p-6 flex flex-col h-full">
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex p-3 rounded-full mb-4 transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-gradient-to-r from-blue-100 to-blue-100 text-blue-600'
                            : isPopular || isPayAsYouGo 
                              ? 'bg-gradient-to-r from-orange-100 to-orange-100 text-orange-600' 
                              : 'bg-gray-100 text-gray-600'
                        } hover:scale-110`}>
                          {getPlanIcon(plan.planName)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">
                          {plan.planName}
                        </h3>
                        <p className="text-gray-500 text-sm capitalize">
                          {isPayAsYouGo ? 'One-time purchase' : `${plan.planDuration} Plan`}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="text-center mb-6">
                        <div className="flex items-baseline justify-center gap-1 mb-3">
                          <span className="text-lg text-gray-500">₹</span>
                          <span className="text-4xl font-bold text-gray-900 transition-all duration-300 hover:scale-110">
                            {plan.totalPrice.toLocaleString()}
                          </span>
                          {!isPayAsYouGo && (
                            <span className="text-gray-500 text-sm">
                              /{plan.planDuration === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          ₹{costPerCredit.toFixed(2)} per credit
                        </div>
                        
                        {monthlySavings && monthlySavings > 0 && (
                          <div className="text-sm text-green-600 font-semibold bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-full inline-block animate-pulse">
                            Save ₹{monthlySavings.toFixed(2)} per credit vs monthly
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mb-8 flex-grow">
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700 font-medium">
                              {plan.totalCredits.toLocaleString()} Total Credits
                            </span>
                          </li>
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700">
                              {plan.creditExpirationDays} days validity
                            </span>
                          </li>
                          {plan.creditRollover === 1 && (
                            <li className="flex items-center group">
                              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                              <span className="text-gray-700">
                                Credit Rollover
                              </span>
                            </li>
                          )}
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700">
                              24/7 Priority Support
                            </span>
                          </li>
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700">
                              Advanced Analytics
                            </span>
                          </li>
                         
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <button 
                        onClick={() => handleModifySubscription(plan)}
                        disabled={isCurrent || modifying || daysRemaining <= 0}
                        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                          isCurrent
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {modifying ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin inline mr-2" />
                            Processing...
                          </>
                        ) : isCurrent ? (
                          'Current Plan'
                        ) : daysRemaining <= 0 ? (
                          'Subscription Expired'
                        ) : (
                          'Switch to This Plan'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in 1s ease-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }

        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default ModifySubscriptionPage;