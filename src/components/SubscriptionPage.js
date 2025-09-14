import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Shield, Crown, Loader, AlertTriangle, RefreshCw, Calculator, TrendingDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const SubscriptionPage = () => {
  const navigate = useNavigate(); 
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Fetch subscription data from API
  const fetchSubscriptionData = async () => {
    setLoading(true);
    setError(null);
    
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
      console.log('Fetched subscription data:', data);
      
      // Filter only active plans
      const activePlans = data.filter(plan => plan.isActive === true);
      setSubscriptionData(activePlans);
      
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err.message || 'Unable to load subscription plans. Please check your connection and try again.');
      setSubscriptionData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSubmit = (plan) => {
    const pricing = {
      finalPrice: plan.totalPrice,
      discount: 0,
      originalPrice: plan.totalPrice
    };

    // Navigate to plan details page with subscription data
    navigate('/plandetails', {
      state: {
        plan: plan,
        credits: plan.totalCredits,
        pricing: pricing,
        autoRenewal: plan.planType === 'Subscription'
      }
    });
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
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
      plan.planName.toLowerCase() === 'pay as you go' && plan.isActive === true
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

  // Get all plans in order: Pay As You Go first, then subscription plans
  const getAllPlansInOrder = () => {
    const payAsYouGoPlans = getPayAsYouGoPlans();
    const subscriptionPlans = getFilteredSubscriptionPlans();
    return [...payAsYouGoPlans, ...subscriptionPlans];
  };

  // Calculate credit cost and savings
  const calculateCreditCostAndSavings = (plan) => {
    const costPerCredit = plan.totalPrice / plan.totalCredits;
    let monthlySavings = null;
    
    if (plan.planDuration === 'yearly') {
      // Find corresponding monthly plan for comparison
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

  const handleChoosePlan = (plan) => {
    handleSubscriptionSubmit(plan);
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
    fetchSubscriptionData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Subscription Plans</h2>
          <p className="text-gray-600 max-w-md">Fetching the latest pricing options for you. This may take a few moments...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Plans</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchSubscriptionData}
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

  const allPlans = getAllPlansInOrder();
  const payAsYouGoPlans = getPayAsYouGoPlans();
  const subscriptionPlans = getFilteredSubscriptionPlans();
  const hasPlans = allPlans.length > 0;

  // No plans available
  if (!hasPlans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Shield className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Plans Available</h2>
          <p className="text-gray-600 mb-6">
            No active subscription plans are currently available. Please check back later or contact support.
          </p>
          <button
            onClick={fetchSubscriptionData}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all duration-300 font-semibold flex items-center gap-2 mx-auto transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Plans
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
            onClick={() => navigate('/mywork')}
            className="flex items-center gap-2 text-orange/90 hover:text-orange mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to mywork
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Flexible pricing to match your business needs. Get started with the right plan for you.
          </p>
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

        {/* All Plans Section - Combined Display */}
        {hasPlans && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose Your Plan</h2>
            <div className={`${getGridClasses(allPlans.length)} animate-fade-in-up`}>
              {allPlans.map((plan, index) => {
                const isPayAsYouGo = plan.planName.toLowerCase() === 'pay as you go';
                const isPopular = plan.planName.toLowerCase() === 'standard';
                const { costPerCredit, monthlySavings } = calculateCreditCostAndSavings(plan);

                if (isPayAsYouGo) {
                  // Pay As You Go Card with Special Wrapper
                  return (
                    <div
                      key={`payg-${plan.subscriptionId}`}
                      className={`relative ${getCardWidth(allPlans.length)} animate-slide-up col-span-1`}
                      style={{ 
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Outer Flexible Solution Container - Made Wider */}
                      <div className="relative p-6 rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-yellow-50 border-3 border-orange-300 shadow-2xl hover:shadow-3xl transition-all duration-500">
                        {/* Enhanced Decorative Corner Elements */}
                        <div className="absolute top-3 left-3 w-3 h-3 bg-orange-400 rounded-full opacity-70 animate-pulse"></div>
                        <div className="absolute top-3 right-3 w-2 h-2 bg-yellow-400 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-3 left-3 w-2 h-2 bg-orange-300 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-3 right-3 w-3 h-3 bg-yellow-300 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        
                        {/* Additional decorative elements for width emphasis */}
                        <div className="absolute top-1/2 left-2 w-1 h-8 bg-orange-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute top-1/2 right-2 w-1 h-8 bg-yellow-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
                        
                        {/* Enhanced Flexible Solution Badge */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-white animate-pulse whitespace-nowrap">
                            FLEXIBLE SOLUTION
                          </div>
                        </div>

                        {/* Side Labels for Extra Width Visual */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 -rotate-90">
                          <div className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-semibold opacity-80">
                            NO COMMITMENT
                          </div>
                        </div>
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 rotate-90">
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold opacity-80">
                            INSTANT ACCESS
                          </div>
                        </div>

                        {/* Inner content container with standard card dimensions */}
                        <div className="flex justify-center">
                          {/* Standard Card Structure (Same as others) but centered */}
                          <div className="relative bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl h-full flex flex-col transform hover:scale-105 hover:-translate-y-2 w-full max-w-sm" style={{ minHeight: '520px' }}>
                          <div className="p-6 flex flex-col h-full">
                            {/* Plan Header */}
                            <div className="text-center mb-6">
                              <div className="inline-flex p-3 rounded-full mb-4 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 hover:scale-110 transition-transform duration-300">
                                {getPlanIcon(plan.planName)}
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">
                                {plan.planName}
                              </h3>
                              <p className="text-orange-600 text-sm font-medium">
                                One-time purchase • No commitment
                              </p>
                            </div>

                            {/* Pricing */}
                            <div className="text-center mb-6">
                              <div className="flex items-baseline justify-center gap-1 mb-3">
                                <span className="text-lg text-gray-500">₹</span>
                                <span className="text-4xl font-bold text-gray-900 transition-all duration-300 hover:scale-110">
                                  {plan.totalPrice.toLocaleString()}
                                </span>
                              </div>
                              
                              <div className="text-sm text-gray-600 mb-2">
                                ₹{costPerCredit.toFixed(2)} per credit
                              </div>
                              
                              <div className="text-sm text-orange-600 bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-1 rounded-full inline-block border border-orange-200">
                                {plan.totalCredits.toLocaleString()} credits included
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
                                <li className="flex items-center group">
                                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                                  <span className="text-gray-700">
                                    No monthly commitment
                                  </span>
                                </li>
                                <li className="flex items-center group">
                                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                                  <span className="text-gray-700">
                                    Perfect for testing & trials
                                  </span>
                                </li>
                                <li className="flex items-center group">
                                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                                  <span className="text-gray-700">
                                    24/7 Customer Support
                                  </span>
                                </li>
                                <li className="flex items-center group">
                                  <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-125" />
                                  <span className="text-gray-700">
                                    Instant activation
                                  </span>
                                </li>
                              </ul>
                            </div>

                            {/* Professional CTA Button */}
                            <button 
                              onClick={() => handleChoosePlan(plan)}
                              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                            >
                              Purchase Now
                            </button>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Regular Subscription Cards
                  return (
                    <div
                      key={plan.subscriptionId}
                      className={`relative bg-white rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl h-full flex flex-col transform hover:scale-105 hover:-translate-y-2 ${
                        isPopular ? 'ring-2 ring-orange-500 scale-105' : ''
                      } ${getCardWidth(allPlans.length)} animate-slide-up`}
                      style={{ 
                        minHeight: '520px',
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Popular Badge */}
                      {isPopular && (
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
                            isPopular ? 'bg-gradient-to-r from-orange-100 to-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                          } hover:scale-110`}>
                            {getPlanIcon(plan.planName)}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 capitalize mb-2">
                            {plan.planName}
                          </h3>
                          <p className="text-gray-500 text-sm capitalize">
                            {plan.planDuration} Plan
                          </p>
                        </div>

                        {/* Pricing */}
                        <div className="text-center mb-6">
                          <div className="flex items-baseline justify-center gap-1 mb-3">
                            <span className="text-lg text-gray-500">₹</span>
                            <span className="text-4xl font-bold text-gray-900 transition-all duration-300 hover:scale-110">
                              {plan.totalPrice.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm">
                              /{plan.planDuration === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          </div>
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
        {/* <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold border border-blue-200">
          12 months
        </div> */}
      </div>
      
      <div className="flex items-center justify-center mt-2 pt-2 border-t border-slate-100">
        <TrendingDown className="w-3 h-3 text-emerald-500 mr-1.5 group-hover:animate-bounce" />
        <span className="text-xs text-slate-600 font-medium group-hover:text-emerald-600 transition-colors duration-300">
          Switch to yearly plan for better value
        </span>
      </div>
    </div>
    
    {/* Subtle decorative elements */}
    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
    <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
  </div>
)}
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
                          onClick={() => handleChoosePlan(plan)}
                          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 mt-auto transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl`}
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  );
                }
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

export default SubscriptionPage;