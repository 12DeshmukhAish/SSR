import React, { useState, useEffect } from 'react';
import { 
  Check, Star, Zap, Shield, Crown, Calendar, User, 
  ArrowLeft, Calculator, TrendingDown, Gift, Clock, Repeat, 
  ChevronDown, Info, X, Loader, Plus, CreditCard, Minus,
  Percent, Tag, Sparkles, RefreshCw
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const RenewPlanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [masterPlan, setMasterPlan] = useState(null);
  const [error, setError] = useState(null);
  
  // Extra Credits State
  const [extraCredits, setExtraCredits] = useState(0);
  const [showExtraCreditsInput, setShowExtraCreditsInput] = useState(false);
  
  // Coupon state
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Get current user ID
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

  // Fetch current subscription and master plan details
  const fetchSubscriptionDetails = async () => {
    try {
      setPlanLoading(true);
      const token = getAuthToken();
      const userId = getCurrentUserId();

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      // Fetch user subscription
      const subscriptionResponse = await fetch(`${API_BASE_URL}/api/user-subscriptions/searchByUsrId?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to fetch subscription details');
      }

      const subscriptionData = await subscriptionResponse.json();
      
      if (!Array.isArray(subscriptionData) || subscriptionData.length === 0) {
        throw new Error('No active subscription found');
      }

      // Get the latest active subscription
      const latestSubscription = subscriptionData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
      setCurrentSubscription(latestSubscription);

      // Fetch master subscription details
      const masterResponse = await fetch(`${API_BASE_URL}/api/master-subscriptions/${latestSubscription.masterSubscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!masterResponse.ok) {
        throw new Error('Failed to fetch plan details');
      }

      const masterData = await masterResponse.json();
      setMasterPlan(masterData);
      
      // Set auto renewal based on current subscription
      setAutoRenewal(latestSubscription.autoRenewal === 'true' || latestSubscription.autoRenewal === true);

    } catch (error) {
      console.error('Error fetching subscription details:', error);
      setError(error.message);
    } finally {
      setPlanLoading(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
      
      const jwtToken = getAuthToken();
      
      if (!jwtToken) {
        const username = localStorage.getItem('username');
        const fullName = localStorage.getItem('fullName');
        setUserData({ 
          userName: username || 'User',
          fullName: fullName || username || 'User'
        });
        setIsLoading(false);
        return;
      }

      // Try different endpoints
      const endpointsToTry = [
        `${API_BASE_URL}/api/auth/user/${userId}`,
        `${API_BASE_URL}/api/auth/user/current`
      ];
      
      let userData = null;
      
      for (const endpoint of endpointsToTry) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
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
            };
            break;
          }
        } catch (fetchError) {
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
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      const username = localStorage.getItem('username');
      const fullName = localStorage.getItem('fullName');
      setUserData({ 
        userName: username || 'User',
        fullName: fullName || username || 'User'
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchSubscriptionDetails();
  }, []);

  // Calculate totals
  const calculateTotals = () => {
    if (!masterPlan) return { finalTotal: 0, gstAmount: 0, subtotal: 0, discountAmount: 0 };
    
    const basePlanPrice = masterPlan.totalPrice || 0;
    const extraCreditsCost = extraCredits * (masterPlan.extraCreditPrice || 0);
    const subtotal = basePlanPrice + extraCreditsCost;
    const discountAmount = appliedCoupon 
      ? appliedCoupon.discountType === 'percentage' 
        ? Math.min((subtotal * appliedCoupon.discount) / 100, appliedCoupon.maxDiscount || subtotal)
        : appliedCoupon.discount
      : discount;
    
    const discountedSubtotal = subtotal - discountAmount;
    const gstAmount = (discountedSubtotal * 18) / 100;
    const finalTotal = discountedSubtotal + gstAmount;
    
    return {
      basePlanPrice,
      extraCreditsCost,
      subtotal,
      discountAmount,
      discountedSubtotal,
      gstAmount,
      finalTotal
    };
  };

  const totals = calculateTotals();

  const getPlanIcon = (planName) => {
    if (!planName) return <Star className="w-6 h-6" />;
    
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

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        plan: masterPlan,
        currentSubscription: currentSubscription,
        autoRenewal: autoRenewal,
        appliedCoupon: appliedCoupon,
        extraCredits: extraCredits,
        extraCreditsCost: totals.extraCreditsCost,
        discount: totals.discountAmount,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        finalPrice: totals.finalTotal,
        totalCredits: (masterPlan?.totalCredits || 0) + extraCredits,
        isRenewal: true
      }
    });
  };

  // Loading state
  if (planLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Plan Details</h2>
          <p className="text-gray-600">Fetching your subscription information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Plan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/credit')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!masterPlan || !currentSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Plan Found</h2>
          <p className="text-gray-600">Unable to load your current plan details.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
            Back to credit page
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Renew Your Plan</h1>
          </div>
          <p className="text-lg text-white/90">Continue with your current plan and maintain uninterrupted service</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription Status */}
            {/* <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentSubscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {currentSubscription.status || 'Active'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(currentSubscription.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(currentSubscription.endDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Next Billing</p>
                  <p className="font-medium">{formatDate(currentSubscription.nextBillingDate)}</p>
                </div>
              </div>
            </div> */}

            {/* Plan Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {getPlanIcon(masterPlan.planName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold capitalize">{masterPlan.planName}</h2>
                    <p className="text-white/90">
                      {masterPlan.planType} {masterPlan.planDuration && `• ${masterPlan.planDuration}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{masterPlan.totalPrice.toLocaleString()}
                    </span>
                    {masterPlan.planDuration && (
                      <span className="text-gray-500">/{masterPlan.planDuration}</span>
                    )}
                  </div>
                  
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    RENEWAL PRICE
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-4">
                  Same great features and credits as your current plan
                </p>
              </div>

              {/* Extra Credits Section */}
              {masterPlan.extraCreditPrice && masterPlan.extraCreditPrice > 0 && (
                <div className="p-6 border-b bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Extra Credits</h3>
                  
                  {!showExtraCreditsInput ? (
                    <button
                      onClick={() => setShowExtraCreditsInput(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Extra Credits
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 min-w-0">
                          Number of Credits:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExtraCredits(prev => Math.max(0, prev - 1))}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            disabled={extraCredits === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={extraCredits}
                            onChange={(e) => setExtraCredits(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => setExtraCredits(prev => prev + 1)}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Price per credit:</span>
                          <span className="font-semibold">₹{masterPlan.extraCreditPrice}</span>
                        </div>
                        {extraCredits > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{extraCredits} credits:</span>
                            <span className="font-bold text-blue-600">₹{totals.extraCreditsCost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowExtraCreditsInput(false);
                          setExtraCredits(0);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Free Benefits */}
              {masterPlan.planExtraCredit > 0 && (
                <div className="p-6 bg-green-50 border-l-4 border-green-400">
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Bonus Credits Included!</h3>
                      <p className="text-green-700 mt-1">
                        Your renewal includes <strong>{masterPlan.planExtraCredit} bonus credits</strong> at no extra cost.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What you'll continue to get</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {(masterPlan.totalCredits || 0) + extraCredits} Total Credits
                    </div>
                    <div className="text-sm text-gray-600">
                      {masterPlan.baseCredits} base + {masterPlan.planExtraCredit} bonus
                      {extraCredits > 0 && ` + ${extraCredits} extra`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{masterPlan.creditExpirationDays} Days Validity</div>
                    <div className="text-sm text-gray-600">From renewal date</div>
                  </div>
                </div>
                
                {masterPlan.creditRollover === 1 && (
                  <div className="flex items-start gap-3">
                    <Repeat className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">Credit Rollover</div>
                      <div className="text-sm text-gray-600">Unused credits carry forward</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">24/7 Support</div>
                    <div className="text-sm text-gray-600">Chat, email & phone</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Renewal Summary</h3>
              
              {/* Plan Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">{masterPlan.planName} Plan Renewal</span>
                  <span className="font-semibold">₹{masterPlan.totalPrice.toLocaleString()}</span>
                </div>
                
                {/* Extra Credits */}
                {extraCredits > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{extraCredits} Extra Credits</span>
                    <span className="font-semibold">₹{totals.extraCreditsCost.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Subtotal */}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Subtotal</span>
                  <span>₹{totals.subtotal.toLocaleString()}</span>
                </div>

                {/* Applied Coupon */}
                {appliedCoupon && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {appliedCoupon.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-green-700">Discount</span>
                      <span className="text-sm font-semibold text-green-700">
                        -₹{totals.discountAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* GST */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">GST (18%)</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="font-semibold">₹{totals.gstAmount.toLocaleString()}</span>
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center text-xl font-bold text-orange-600 border-t pt-4">
                  <span>Total Amount</span>
                  <span>₹{totals.finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t pt-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Account holder</span>
                </div>
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

              {/* Auto Renewal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRenewal}
                    onChange={(e) => setAutoRenewal(e.target.checked)}
                    className="w-5 h-5 text-orange-600 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Auto-renewal</div>
                    <div className="text-sm text-gray-600">
                      Automatically renew every {masterPlan.planDuration}. Cancel anytime.
                    </div>
                  </div>
                </label>
              </div>

              {/* Renew Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Renew Plan Now
              </button>

              {/* Trust Indicators */}
              <div className="mt-6 text-center">
                <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>SSL Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Seamless Renewal</span>
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

export default RenewPlanPage;