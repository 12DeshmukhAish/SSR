import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Minus, CreditCard, Shield, Check, 
  Info, Calculator, Star, Crown, Zap, AlertCircle,
  Loader, Package, Activity, Gift
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const BuyExtraCreditsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extraCredits, setExtraCredits] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [userData, setUserData] = useState(null);

  // Get current user data functions
  const getCurrentUserId = () => {
    try {
      const storedUid = localStorage.getItem('uid');
      if (storedUid && storedUid !== localStorage.getItem('username')) {
        return storedUid;
      }

      const jwtToken = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          return payload.userId || payload.id || payload.uid || payload.sub;
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
      }

      return localStorage.getItem('userId') || localStorage.getItem('id');
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  const getAuthToken = () => {
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('token');
  };

  // Fetch current subscription and plan details// Updated fetchCurrentSubscription function
// Updated fetchCurrentSubscription function
const fetchCurrentSubscription = async () => {
  try {
    const token = getAuthToken();
    const userId = getCurrentUserId();

    if (!token || !userId) {
      setError('Authentication required. Please login again.');
      return;
    }

    // Fetch user subscription
    const response = await fetch(`${API_BASE_URL}/api/user-subscriptions/searchByUsrId?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const subscriptionArray = await response.json();
      
      if (Array.isArray(subscriptionArray) && subscriptionArray.length > 0) {
        const sortedSubscriptions = subscriptionArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const activeSubscription = subscriptionArray.find(sub => 
          sub.status && sub.status.toLowerCase() === 'active'
        ) || sortedSubscriptions[0];

        // Get credit information
        let creditInfo = { 
          totalAvailableCredits: 0, 
          totalUsedCredits: 0, 
          totalRemainingCredits: 0
        };
        
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
              ? creditData.filter(credit => credit.userId == userId)
              : [];
            
            if (userCredits.length > 0) {
              creditInfo.totalAvailableCredits = userCredits.reduce((sum, credit) => sum + credit.availableCredits, 0);
              creditInfo.totalUsedCredits = userCredits.reduce((sum, credit) => sum + credit.usedCredits, 0);
              creditInfo.totalRemainingCredits = creditInfo.totalAvailableCredits - creditInfo.totalUsedCredits;
            }
          }
        } catch (creditError) {
          console.error('Error fetching credit info:', creditError);
        }

        // Fetch master subscription details for extra credit price
        let extraCreditPrice = getDefaultExtraCreditPrice(activeSubscription.planName); // fallback
        
        if (activeSubscription.masterSubscriptionId) {
          try {
            const masterSubId = activeSubscription.masterSubscriptionId;
            const masterResponse = await fetch(`${API_BASE_URL}/api/master-subscriptions/${masterSubId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (masterResponse.ok) {
              const masterData = await masterResponse.json();
              extraCreditPrice = masterData.extraCreditPrice || extraCreditPrice;
              console.log('Fetched extra credit price from master subscription:', extraCreditPrice);
            } else {
              console.warn('Failed to fetch master subscription details, using default price');
            }
          } catch (masterError) {
            console.error('Error fetching master subscription:', masterError);
            console.log('Using default extra credit price');
          }
        }

        // Set subscription with enhanced data
        setCurrentSubscription({
          id: activeSubscription.id,
          planName: activeSubscription.planName || 'Subscription Plan',
          planType: 'Subscription',
          status: activeSubscription.status || 'Active',
          totalCredits: creditInfo.totalAvailableCredits,
          usedCredits: creditInfo.totalUsedCredits,
          remainingCredits: creditInfo.totalRemainingCredits,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate,
          monthlyPrice: activeSubscription.price || 0,
          autoRenewal: activeSubscription.autoRenewal,
          // Plan specific details for extra credits
          baseCredits: activeSubscription.baseCredits || creditInfo.totalAvailableCredits,
          bonusCredits: activeSubscription.bonusCredits || 0,
          extraCreditPrice: extraCreditPrice, // Use the fetched price
          validityDays: activeSubscription.validityDays || 365,
          rollover: activeSubscription.rollover || 0,
          duration: activeSubscription.duration || 'monthly',
          subscriptionId: activeSubscription.masterSubscriptionId || activeSubscription.id // Store master subscription ID for reference
        });
      } else {
        setError('No active subscription found. Please subscribe to a plan first.');
      }
    } else {
      setError('Unable to fetch subscription details.');
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    setError('Failed to load subscription details. Please try again.');
  }
};
  // Get default extra credit price based on plan name
  const getDefaultExtraCreditPrice = (planName) => {
    if (!planName) return 1;
    
    switch (planName.toLowerCase()) {
      case 'basic':
        return 1;
      case 'standard':
        return 0.8;
      case 'pro':
        return 0.6;
      case 'enterprise':
        return 0.5;
      default:
        return 1;
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();
      
      if (!token) {
        const username = localStorage.getItem('username');
        const fullName = localStorage.getItem('fullName');
        setUserData({ 
          userName: username || 'User',
          fullName: fullName || username || 'User'
        });
        return;
      }

      const endpointsToTry = [
        `${API_BASE_URL}/api/auth/user/${userId}`,
        `${API_BASE_URL}/api/auth/user/current`,
        `${API_BASE_URL}/api/auth/me`
      ];
      
      let userData = null;
      
      for (const endpoint of endpointsToTry) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            userData = {
              id: data.id || 'N/A',
              userName: data.username || 'N/A',
              email: data.email || 'N/A',
              mobile: data.mobile || 'N/A',
              fullName: data.fullName || data.username || 'N/A',
              active: data.active !== undefined ? (data.active === 1 || data.active === true) : 'N/A'
            };
            break;
          }
        } catch (fetchError) {
          console.error('Fetch error for endpoint:', endpoint, fetchError);
          continue;
        }
      }
      
      if (!userData) {
        const username = localStorage.getItem('username');
        const fullName = localStorage.getItem('fullName');
        userData = { 
          userName: username || 'User',
          fullName: fullName || username || 'User'
        };
      }
      
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      const username = localStorage.getItem('username');
      const fullName = localStorage.getItem('fullName');
      setUserData({ 
        userName: username || 'User',
        fullName: fullName || username || 'User'
      });
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCurrentSubscription(),
          fetchUserData()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle extra credits change
  const handleExtraCreditsChange = (value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setExtraCredits(numValue);
  };

  const incrementExtraCredits = () => {
    setExtraCredits(prev => prev + 10); // Increment by 10 for convenience
  };

  const decrementExtraCredits = () => {
    setExtraCredits(prev => Math.max(0, prev - 10));
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!currentSubscription) return { subtotal: 0, gstAmount: 0, finalTotal: 0 };
    
    const subtotal = extraCredits * currentSubscription.extraCreditPrice;
    const gstAmount = (subtotal * 18) / 100;
    const finalTotal = subtotal + gstAmount;
    
    return { subtotal, gstAmount, finalTotal };
  };

  const totals = calculateTotals();

  // Get plan icon
  const getPlanIcon = (planName) => {
    if (!planName) return <Star className="w-6 h-6" />;
    
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Shield className="w-6 h-6" />;
      case 'standard':
        return <Star className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (extraCredits === 0) {
      alert('Please select number of credits to purchase');
      return;
    }

    navigate('/payment', {
      state: {
        plan: {
          id: `extra-credits-${Date.now()}`,
          planName: `${extraCredits} Extra Credits`,
          planType: 'Extra Credits',
          totalPrice: totals.finalTotal,
          totalCredits: extraCredits,
          baseCredits: extraCredits,
          planExtraCredit: 0,
          creditExpirationDays: currentSubscription?.validityDays || 365,
          creditRollover: currentSubscription?.rollover || 0,
          extraCreditPrice: currentSubscription?.extraCreditPrice || 1,
          planDuration: 'one-time'
        },
        credits: extraCredits,
        pricing: totals.subtotal,
        autoRenewal: false,
        appliedCoupon: null,
        extraCredits: extraCredits,
        extraCreditsCost: totals.subtotal,
        discount: 0,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        finalPrice: totals.finalTotal,
        totalCredits: extraCredits,
        isExtraCreditsOnly: true,
        parentSubscription: currentSubscription
      }
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Extra Credits</h2>
          <p className="text-gray-600">Fetching your plan details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/history')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">You need an active subscription to purchase extra credits.</p>
          <button
            onClick={() => navigate('/subscription')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Choose Subscription Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Credit
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Buy Extra Credits</h1>
          <p className="text-lg text-white/90">Add more credits to your current plan</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Current Plan & Credit Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan Information */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {getPlanIcon(currentSubscription.planName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Your Current Plan</h2>
                    <p className="text-white/90">
                      {currentSubscription.planName} • {currentSubscription.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Plan Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan Name:</span>
                        <span className="font-medium">{currentSubscription.planName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Price:</span>
                        <span className="font-medium">₹{currentSubscription.monthlyPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">{currentSubscription.status}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Credit Usage</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Credits:</span>
                        <span className="font-medium">{currentSubscription.totalCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Used Credits:</span>
                        <span className="font-medium text-red-600">{currentSubscription.usedCredits.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-medium text-green-600">{currentSubscription.remainingCredits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Usage Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Credit Usage</span>
                    <span>{Math.round((currentSubscription.usedCredits / currentSubscription.totalCredits) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(currentSubscription.usedCredits / currentSubscription.totalCredits) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Extra Credits Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Select Extra Credits</h3>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Credit Pricing</span>
                </div>
                <p className="text-orange-700 text-sm">
                  Each additional credit costs ₹{currentSubscription.extraCreditPrice}. 
                  Credits will be added to your current plan and follow the same validity period.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-lg font-medium text-gray-900 min-w-fit">
                    Number of Credits:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementExtraCredits}
                      className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50"
                      disabled={extraCredits === 0}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={extraCredits}
                      onChange={(e) => handleExtraCreditsChange(e.target.value)}
                      className="w-24 px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      onClick={incrementExtraCredits}
                      className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Selection Buttons */}
                <div>
                  <p className="text-sm text-gray-600 mb-3">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {[50, 100, 250, 500, 1000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setExtraCredits(amount)}
                        className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                          extraCredits === amount
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cost Calculation */}
                {extraCredits > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Cost Breakdown</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">{extraCredits} credits × ₹{currentSubscription.extraCreditPrice}</span>
                        <span className="font-semibold text-green-700">₹{totals.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">GST (18%)</span>
                        <span className="font-semibold text-green-700">₹{totals.gstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="font-semibold text-green-900">Total Amount</span>
                        <span className="font-bold text-green-900 text-lg">₹{totals.finalTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What You Get</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Instant Credit Addition</div>
                    <div className="text-sm text-gray-600">Credits added immediately after payment</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Same Validity Period</div>
                    <div className="text-sm text-gray-600">Credits follow your current plan validity</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">No Additional Fees</div>
                    <div className="text-sm text-gray-600">Only pay for credits + applicable GST</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">24/7 Support</div>
                    <div className="text-sm text-gray-600">Get help whenever you need it</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {extraCredits > 0 ? (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{extraCredits} Extra Credits</span>
                    <span className="font-semibold">₹{totals.subtotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">GST (18%)</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-semibold">₹{totals.gstAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold text-orange-600 border-t pt-4">
                    <span>Total Amount</span>
                    <span>₹{totals.finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Select credits to see pricing</p>
                </div>
              )}

              {/* User Info */}
              <div className="border-t pt-4 mb-6">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {userData?.fullName || userData?.userName || 'User'}
                  </div>
                  {userData?.email && userData?.email !== 'N/A' && (
                    <div className="text-sm text-gray-500">
                      {userData.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handleProceedToPayment}
                disabled={extraCredits === 0}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl ${
                  extraCredits > 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {extraCredits > 0 ? 'Proceed to Payment' : 'Select Credits to Continue'}
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 text-center">
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Instant Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyExtraCreditsPage;