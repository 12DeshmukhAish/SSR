import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, Crown, Loader, AlertTriangle, RefreshCw, ArrowLeft, TrendingUp, Award, Sparkles, Calculator, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const UpgradePlanPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [upgradePlans, setUpgradePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Plan hierarchy for upgrade logic - Updated to match your master subscription table
  const planHierarchy = {
    'pay as you go': 0,
    'basic': 1,
    'standard': 2,
    'pro': 3,
    'premium': 4,
    'enterprise': 5
  };

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

  // Fetch current user's subscription
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

    const data = await response.json();
    console.log('Current subscription data:', data);
    
    let activeSubscription;
    
    if (Array.isArray(data) && data.length > 0) {
      activeSubscription = data.find(sub => 
        sub.status && sub.status.toLowerCase() === 'active'
      ) || data[data.length - 1];
    } else if (data && typeof data === 'object') {
      activeSubscription = data;
    }
    
    if (activeSubscription) {
      // Fetch credit information for this subscription
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
            ? creditData.filter(credit => 
                credit.userId == userId && 
                credit.userSubscriptionId == activeSubscription.id
              )
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
        // Fallback to subscription data if available
        creditInfo = {
          totalCredits: activeSubscription.totalCredits || 0,
          usedCredits: activeSubscription.usedCredits || 0,
          remainingCredits: (activeSubscription.totalCredits || 0) - (activeSubscription.usedCredits || 0)
        };
      }

      // Enhance subscription data with billing cycle info and credit data
      const enhancedSubscription = {
        ...activeSubscription,
        ...creditInfo, // Include actual credit data from API
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
    return null;
  }
};

  // Fetch all available subscription plans
  const fetchAvailablePlans = async () => {
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
      console.log('Available plans data:', data);
      
      const activePlans = data.filter(plan => plan.isActive === true);
      return activePlans;
    } catch (err) {
      console.error('Error fetching available plans:', err);
      throw err;
    }
  };

  // Check if current user has pay as you go plan
  const isPayAsYouGoPlan = (currentSub) => {
    return currentSub?.planName?.toLowerCase() === 'pay as you go';
  };

  // Filter upgrade plans based on current subscription - FIXED VERSION
 const filterUpgradePlans = (currentSub, allPlans) => {
  if (!currentSub) {
    // If no current subscription, show all subscription plans (not pay as you go)
    return allPlans.filter(plan => plan.planType === 'Subscription');
  }

  // Get current plan details
  const currentPlanDetails = getCurrentPlanDetails();
  const isCurrentPayAsYouGo = currentPlanDetails.isPayAsYouGo;

  // If current plan is pay as you go, show all subscription plans
  if (isCurrentPayAsYouGo) {
    return allPlans.filter(plan => plan.planType === 'Subscription');
  }

  // For subscription users, find current plan in master subscriptions
  let currentMasterPlan = null;
  
  // Try multiple methods to find the current plan
  if (currentSub.subscriptionId) {
    currentMasterPlan = allPlans.find(plan => 
      plan.subscriptionId === currentSub.subscriptionId
    );
  }
  
  // If not found by subscriptionId, try by plan name and duration
  if (!currentMasterPlan) {
    const currentPlanName = currentPlanDetails.planName?.toLowerCase() || '';
    const currentPlanDuration = currentPlanDetails.planDuration?.toLowerCase() || '';
    
    currentMasterPlan = allPlans.find(plan => 
      plan.planName?.toLowerCase() === currentPlanName &&
      plan.planDuration?.toLowerCase() === currentPlanDuration &&
      plan.planType === 'Subscription'
    );
  }
  
  // If still not found, try just by plan name
  if (!currentMasterPlan) {
    const currentPlanName = currentPlanDetails.planName?.toLowerCase() || '';
    currentMasterPlan = allPlans.find(plan => 
      plan.planName?.toLowerCase() === currentPlanName &&
      plan.planType === 'Subscription'
    );
  }
  
  if (!currentMasterPlan) {
    console.warn('Current subscription not found in master subscriptions, showing all subscription plans');
    return allPlans.filter(plan => plan.planType === 'Subscription');
  }

  const currentPlanName = currentMasterPlan.planName?.toLowerCase() || '';
  const currentPlanLevel = planHierarchy[currentPlanName] || -1;
  const currentPlanDuration = currentMasterPlan.planDuration?.toLowerCase();

  console.log('Current plan details for filtering:', {
    planName: currentPlanName,
    planLevel: currentPlanLevel,
    planDuration: currentPlanDuration,
    subscriptionId: currentMasterPlan.subscriptionId
  });

  // Filter upgrade plans based on your specific logic
  const upgradePlans = allPlans.filter(plan => {
    const planLevel = planHierarchy[plan.planName?.toLowerCase()] || 0;
    const planNameLower = plan.planName?.toLowerCase();
    
    // Skip if not a subscription plan
    if (plan.planType !== 'Subscription') return false;
    
    // MAIN LOGIC: If current plan is Basic Monthly
    if (currentPlanName === 'basic' && currentPlanDuration === 'monthly') {
      // Show only Standard+ plans (higher tier) and Basic Yearly
      if (planLevel > currentPlanLevel) {
        return true; // Show Standard, Pro, Premium, Enterprise (all durations)
      }
      // Show Basic Yearly (same tier but different duration)
      if (planNameLower === 'basic' && plan.planDuration?.toLowerCase() === 'yearly') {
        return true;
      }
      return false; // Don't show Basic Monthly again
    }
    
    // GENERAL LOGIC: For other plans
    // 1. Show higher tier plans (regardless of duration)
    if (planLevel > currentPlanLevel) {
      return true;
    }
    
    // 2. For same tier plans, only show yearly version if current is monthly
    if (planLevel === currentPlanLevel && planNameLower === currentPlanName) {
      // If current is monthly, show yearly of same plan
      if (currentPlanDuration === 'monthly' && plan.planDuration?.toLowerCase() === 'yearly') {
        return true;
      }
      // If current is yearly, don't show monthly of same plan (downgrade)
      return false;
    }
    
    return false;
  });

  console.log('Filtered upgrade plans:', upgradePlans.map(p => ({
    name: p.planName,
    duration: p.planDuration,
    level: planHierarchy[p.planName?.toLowerCase()],
    id: p.subscriptionId
  })));

  return upgradePlans;
};
  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allPlans = await fetchAvailablePlans();
      setAvailablePlans(allPlans);
      
      const currentSub = await fetchCurrentSubscription();
      setCurrentSubscription(currentSub);
      
      const filteredUpgradePlans = filterUpgradePlans(currentSub, allPlans);
      setUpgradePlans(filteredUpgradePlans);
      
      console.log('All data loaded:', {
        currentSub,
        allPlansCount: allPlans.length,
        upgradeOptionsCount: filteredUpgradePlans.length
      });
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Unable to load upgrade plans. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  const getCurrentPlanDetails = () => {
  if (!currentSubscription) {
    return {
      planName: 'No Active Plan',
      totalCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      planDuration: 'N/A',
      isPayAsYouGo: false,
      displayName: 'No Active Plan',
      billingCycle: 'N/A',
      fullDisplayName: 'No Active Plan'
    };
  }

  // Get plan name and normalize it
  const planName = currentSubscription.planName || 'Current Plan';
  const isPayAsYouGoPlan = planName.toLowerCase() === 'pay as you go';
  
  // Use actual credit data from the enhanced subscription
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
    // For pay-as-you-go plans
    const payAsYouGoPlan = availablePlans.find(plan => 
      plan.planName?.toLowerCase() === 'pay as you go'
    );
    
    const credits = payAsYouGoPlan?.totalCredits || actualTotalCredits || 0;
    
    return {
      planName: planName,
      totalCredits: credits,
      usedCredits: actualUsedCredits,
      remainingCredits: actualRemainingCredits,
      planDuration: 'one-time',
      isPayAsYouGo: true,
      displayName: 'Pay as you go',
      billingCycle: 'One-time',
      fullDisplayName: 'Pay as you go'
    };
  }
  
  // For subscription plans, try to find matching master plan
  let matchingMasterPlan = null;
  
  // Try to find by subscriptionId first
  if (currentSubscription.subscriptionId) {
    matchingMasterPlan = availablePlans.find(plan => 
      plan.subscriptionId === currentSubscription.subscriptionId
    );
  }
  
  // If not found, try to match by plan name and duration
  if (!matchingMasterPlan) {
    matchingMasterPlan = availablePlans.find(plan => 
      plan.planName?.toLowerCase() === planName.toLowerCase() &&
      plan.planDuration?.toLowerCase() === planDuration.toLowerCase() &&
      plan.planType === 'Subscription'
    );
  }
  
  // If still not found, try just by plan name
  if (!matchingMasterPlan) {
    matchingMasterPlan = availablePlans.find(plan => 
      plan.planName?.toLowerCase() === planName.toLowerCase() &&
      plan.planType === 'Subscription'
    );
  }
  
  if (matchingMasterPlan) {
    // Create proper display format using actual credit data
    const cleanPlanName = matchingMasterPlan.planName.charAt(0).toUpperCase() + 
                          matchingMasterPlan.planName.slice(1).toLowerCase();
    
    let finalDisplayCycle = 'Monthly';
    let finalPlanDuration = 'monthly';
    
    if (matchingMasterPlan.planDuration?.toLowerCase().includes('month')) {
      finalDisplayCycle = 'Monthly';
      finalPlanDuration = 'monthly';
    } else if (matchingMasterPlan.planDuration?.toLowerCase().includes('year') || 
               matchingMasterPlan.planDuration?.toLowerCase().includes('annual')) {
      finalDisplayCycle = 'Yearly';
      finalPlanDuration = 'yearly';
    }
    
    return {
      planName: matchingMasterPlan.planName,
      totalCredits: actualTotalCredits, // Use actual credit data
      usedCredits: actualUsedCredits,   // Use actual credit data
      remainingCredits: actualRemainingCredits, // Use actual credit data
      planDuration: finalPlanDuration,
      isPayAsYouGo: false,
      displayName: cleanPlanName,
      billingCycle: finalDisplayCycle,
      fullDisplayName: `${cleanPlanName} ${finalDisplayCycle}`
    };
  }
  
  // Fallback - use actual data from current subscription
  const cleanPlanName = planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase();
  
  return {
    planName: planName,
    totalCredits: actualTotalCredits,
    usedCredits: actualUsedCredits,
    remainingCredits: actualRemainingCredits,
    planDuration: planDuration,
    isPayAsYouGo: false,
    displayName: cleanPlanName,
    billingCycle: displayCycle,
    fullDisplayName: `${cleanPlanName} ${displayCycle}`
  };
};

  const handleUpgrade = (plan) => {
    const pricing = {
      finalPrice: plan.totalPrice,
      discount: 0,
      originalPrice: plan.totalPrice
    };

    navigate('/plandetails', {
      state: {
        plan: plan,
        credits: plan.totalCredits,
        pricing: pricing,
        autoRenewal: plan.planType === 'Subscription',
        isUpgrade: true,
        currentPlan: currentSubscription
      }
    });
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
      case 'premium':
        return <Award className="w-6 h-6" />;
      case 'enterprise':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  // Get filtered upgrade plans based on selected duration
  const getFilteredUpgradePlans = () => {
    if (!currentSubscription || isPayAsYouGoPlan(currentSubscription)) {
      // For pay-as-you-go users or no subscription, filter by selected plan type
      if (selectedPlan === 'monthly') {
        return upgradePlans.filter(plan => plan.planDuration === 'monthly');
      } else {
        return upgradePlans.filter(plan => plan.planDuration === 'yearly');
      }
    }

    // Find current master plan to get duration
    const currentMasterPlan = availablePlans.find(plan => 
      plan.subscriptionId === currentSubscription.subscriptionId
    );
    
    const currentPlanDuration = currentMasterPlan?.planDuration?.toLowerCase();
    
    if (selectedPlan === 'monthly') {
      return upgradePlans.filter(plan => {
        if (plan.planDuration === 'monthly') return true;
        
        // Include yearly version of current plan if user currently has monthly
        if (currentPlanDuration === 'monthly' && 
            plan.planDuration === 'yearly' && 
            plan.planName?.toLowerCase() === currentMasterPlan.planName?.toLowerCase()) {
          return true;
        }
        
        return false;
      });
    } else {
      return upgradePlans.filter(plan => plan.planDuration === 'yearly');
    }
  };

  // Calculate credit cost and savings
  const calculateCreditCostAndSavings = (plan) => {
    const costPerCredit = plan.totalPrice / plan.totalCredits;
    let monthlySavings = null;
    let currentPlanSavings = null;
    
    if (plan.planDuration === 'yearly') {
      const monthlyPlan = availablePlans.find(p => 
        p.planName === plan.planName && 
        p.planDuration === 'monthly' && 
        p.planType === plan.planType
      );
      
      if (monthlyPlan) {
        const monthlyCostPerCredit = monthlyPlan.totalPrice / monthlyPlan.totalCredits;
        monthlySavings = monthlyCostPerCredit - costPerCredit;
      }
    }

    // Calculate savings compared to current plan
    if (currentSubscription) {
      const currentMasterPlan = availablePlans.find(plan => 
        plan.subscriptionId === currentSubscription.subscriptionId
      );
      
      if (currentMasterPlan) {
        const currentCostPerCredit = currentMasterPlan.totalPrice / currentMasterPlan.totalCredits;
        currentPlanSavings = currentCostPerCredit - costPerCredit;
      }
    }
    
    return { costPerCredit, monthlySavings, currentPlanSavings };
  };

  // Get responsive grid classes based on number of cards
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

  // Get card width for single card layout
  const getCardWidth = (cardCount) => {
    if (cardCount === 1) {
      return "w-full max-w-sm";
    }
    return "";
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Upgrade Options</h2>
          <p className="text-gray-600 max-w-md">Analyzing your current plan and finding the best upgrade options...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Upgrade Plans</h2>
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
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </button>
            <p className="text-sm text-gray-500">
              If the issue persists, please contact support or try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredPlans = getFilteredUpgradePlans();
  const subscriptionPlans = filteredPlans.filter(plan => plan.planType === 'Subscription');
  const hasUpgradePlans = filteredPlans.length > 0;
  const isCurrentPayAsYouGo = currentSubscription && isPayAsYouGoPlan(currentSubscription);

  // No upgrade plans available
  if (!hasUpgradePlans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Crown className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">You're on the Best Plan!</h2>
          <p className="text-gray-600 mb-6">
            {currentSubscription 
              ? `You're currently on the highest tier plan. No upgrades are available at this time.`
              : 'No higher-tier plans are available for upgrade at this time.'
            }
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold flex items-center gap-2 mx-auto transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            View All Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-orange/90 hover:text-orange mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to CreditPage
          </button>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-orange-500 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-relaxed pb-1">
              {isCurrentPayAsYouGo ? 'Switch to Subscription' : 'Upgrade Your Plan'}
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {isCurrentPayAsYouGo 
              ? 'Enjoy recurring benefits and better value with our subscription plans.'
              : 'Take your experience to the next level with our premium plans designed for growth.'
            }
          </p>

          {/* Current Plan Display */}
       {currentSubscription && (
  <div className="max-w-lg mx-auto mb-8">
    {(() => {
      const currentPlanDetails = getCurrentPlanDetails();
      return (
        <div className={`border rounded-xl p-4 ${
          currentPlanDetails.isPayAsYouGo 
            ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <p className={`text-sm font-medium mb-2 ${
            currentPlanDetails.isPayAsYouGo ? 'text-yellow-600' : 'text-blue-600'
          }`}>
            Your Current Plan
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className={`p-2 rounded-lg ${
              currentPlanDetails.isPayAsYouGo ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              {getPlanIcon(currentPlanDetails.planName)}
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">
                {currentPlanDetails.fullDisplayName}
              </h3>
              <div className="flex flex-col text-sm">
                <p className={`${
                  currentPlanDetails.isPayAsYouGo ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  Total: {currentPlanDetails.totalCredits.toLocaleString()} credits
                </p>
                {currentPlanDetails.totalCredits > 0 && (
                  <>
                    <p className="text-green-600">
                      Remaining: {currentPlanDetails.remainingCredits.toLocaleString()} credits
                    </p>
                    <p className="text-gray-500">
                      Used: {currentPlanDetails.usedCredits.toLocaleString()} credits
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Credit Usage Progress Bar for Subscription Plans */}
          {!currentPlanDetails.isPayAsYouGo && currentPlanDetails.totalCredits > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Credit Usage</span>
                <span>{Math.round((currentPlanDetails.usedCredits / currentPlanDetails.totalCredits) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (currentPlanDetails.usedCredits / currentPlanDetails.totalCredits) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {currentPlanDetails.isPayAsYouGo && (
            <div className="mt-3 text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
              💡 Switch to subscription for automatic renewals and better value!
            </div>
          )}
          {!currentPlanDetails.isPayAsYouGo && (
            <div className="mt-3 text-center">
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
                Active Subscription Plan
              </div>
            </div>
          )}
        </div>
      );
    })()}
  </div>
)}

        </div>

        {/* Plan Duration Toggle */}
        {(isCurrentPayAsYouGo || subscriptionPlans.length > 0) && (
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

        {/* Upgrade Plans Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {isCurrentPayAsYouGo ? 'Available Subscription Plans' : 'Available Upgrades'}
          </h2>
          <div className={`${getGridClasses(filteredPlans.length)} animate-fade-in-up`}>
            {filteredPlans.map((plan, index) => {
              const isPayAsYouGo = plan.planName?.toLowerCase() === 'pay as you go';
              const isRecommended = plan.planName?.toLowerCase() === 'pro';
              const { costPerCredit, monthlySavings, currentPlanSavings } = calculateCreditCostAndSavings(plan);

              return (
                <div
                  key={plan.subscriptionId}
                  className={`relative bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl h-full flex flex-col transform hover:scale-105 hover:-translate-y-2 ${
                    isRecommended ? 'ring-2 ring-orange-500 scale-105' : ''
                  } ${getCardWidth(filteredPlans.length)} animate-slide-up`}
                  style={{ 
                    minHeight: '580px',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                        RECOMMENDED
                      </div>
                    </div>
                  )}

                  {/* Upgrade/Switch Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-2 rounded-full shadow-lg animate-pulse">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 rounded-full mb-4 transition-all duration-300 ${
                        isRecommended ? 'bg-gradient-to-r from-orange-100 to-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
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

                      {/* Annual Cost for Monthly Plans */}
                      {plan.planDuration === 'monthly' && (
                        <div className="relative mb-3">
                          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 rounded-xl px-4 py-3 mx-auto inline-block shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group">
                            <div className="flex items-center justify-center gap-3">
                              <div className="flex items-center">
                                <Calculator className="w-4 h-4 text-slate-600 mr-2 group-hover:text-blue-600 transition-colors duration-300" />
                                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                                  Annual Cost:
                                </span>
                              </div>
                              <span className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">
                                ₹{(plan.totalPrice * 12).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-center mt-2 pt-2 border-t border-slate-100">
                              <TrendingDown className="w-3 h-3 text-emerald-500 mr-1.5 group-hover:animate-bounce" />
                              <span className="text-xs text-slate-600 font-medium group-hover:text-emerald-600 transition-colors duration-300">
                                Switch to yearly plan for better value
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 mb-2">
                        ₹{costPerCredit.toFixed(2)} per credit
                      </div>
                      
                      {/* Savings Display */}
                      <div className="space-y-2">
                        {monthlySavings && monthlySavings > 0 && (
                          <div className="text-sm text-green-600 font-semibold bg-gradient-to-r from-green-50 to-green-100 px-3 py-1 rounded-full inline-block animate-pulse">
                            Save ₹{monthlySavings.toFixed(2)} per credit vs monthly
                          </div>
                        )}
                        
                        {currentPlanSavings && currentPlanSavings > 0 && (
                          <div className="text-sm text-blue-600 font-semibold bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1 rounded-full inline-block">
                            ₹{currentPlanSavings.toFixed(2)} better than current plan
                          </div>
                        )}
                      </div>
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
                        {!isPayAsYouGo && plan.creditRollover === 1 && (
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700">
                              Credit Rollover
                            </span>
                          </li>
                        )}
                        {!isPayAsYouGo && (
                          <li className="flex items-center group">
                            <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="text-gray-700">
                              Auto Renewal
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
                        
                        {planHierarchy[plan.planName?.toLowerCase()] >= 3 && (
                          <>
                            <li className="flex items-center group">
                              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                              <span className="text-gray-700">
                                Dedicated Account Manager
                              </span>
                            </li>
                            <li className="flex items-center group">
                              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                              <span className="text-gray-700">
                                Custom Integrations
                              </span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Upgrade/Switch Button */}
                    <button 
                      onClick={() => handleUpgrade(plan)}
                      className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      {isCurrentPayAsYouGo ? `Switch to ${plan.planName}` : `Upgrade to ${plan.planName}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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

export default UpgradePlanPage;