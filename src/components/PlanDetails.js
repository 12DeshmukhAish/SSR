import React, { useState, useEffect } from 'react';
import { 
  Check, Star, Zap, Shield, Crown, Calendar, User, 
  ArrowLeft, Calculator, TrendingDown, Gift, Clock, Repeat, 
  ChevronDown, Info, X, Loader, Plus, CreditCard, Minus,
  Percent, Tag, Sparkles
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const PlanDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Festive Season Coupon State
  const [showFestiveCoupons, setShowFestiveCoupons] = useState(false);
  const [festiveCoupons, setFestiveCoupons] = useState([]);
  const [festiveLoading, setFestiveLoading] = useState(false);
  
  // Get plan data from navigation state
  const { plan, credits, pricing, autoRenewal: defaultAutoRenewal } = location.state || 
  (() => {
    // Fallback: try to get data from localStorage
    try {
      const tempData = localStorage.getItem('tempPlanData');
      if (tempData) {
        const parsed = JSON.parse(tempData);
        localStorage.removeItem('tempPlanData'); // Clean up
        
        // Validate parsed data
        if (parsed.plan && typeof parsed.plan.totalPrice === 'number') {
          return parsed;
        } else {
          console.error('Invalid plan data in localStorage');
          return {};
        }
      }
    } catch (e) {
      console.error('Error parsing temp plan data:', e);
    }
    return {};
  })();
  const isValidPlan = plan && typeof plan.totalPrice === 'number';
  // Festive season coupons (mock data - replace with API call)
  const mockFestiveCoupons = [
    {
      id: 1,
      code: 'DIWALI2024',
      title: 'Diwali Special',
      description: '25% off on all plans',
      discount: 25,
      discountType: 'percentage',
      minAmount: 500,
      maxDiscount: 2000,
      validUntil: '2024-11-15',
      emoji: '🪔'
    },
    {
      id: 2,
      code: 'FESTIVE50',
      title: 'Festival Bonanza',
      description: 'Flat ₹500 off',
      discount: 500,
      discountType: 'fixed',
      minAmount: 1000,
      maxDiscount: 500,
      validUntil: '2024-12-31',
      emoji: '🎉'
    },
    {
      id: 3,
      code: 'NEWYEAR2025',
      title: 'New Year Offer',
      description: '30% off + bonus credits',
      discount: 30,
      discountType: 'percentage',
      minAmount: 800,
      maxDiscount: 3000,
      validUntil: '2025-01-31',
      emoji: '✨'
    }
  ];

  useEffect(() => {
    if (defaultAutoRenewal !== undefined) {
      setAutoRenewal(defaultAutoRenewal);
    }
  }, [defaultAutoRenewal]);
 useEffect(() => {
    const fetchUserData = async () => {
      // Only proceed if we have valid plan data
      if (!isValidPlan) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get current user ID
        const userId = getCurrentUserId();
        setCurrentUserId(userId);
        console.log('Retrieved User ID:', userId);
        
        // Get JWT token - try multiple possible keys
        const jwtToken = localStorage.getItem('authToken') || 
                         localStorage.getItem('token') || 
                         localStorage.getItem('accessToken');
        
        console.log('JWT Token exists:', !!jwtToken);
        
        if (!jwtToken) {
          // Fallback to stored username and fullName
          const username = localStorage.getItem('username');
          const fullName = localStorage.getItem('fullName');
          setUserData({ 
            userName: username || 'User',
            fullName: fullName || username || 'User'
          });
          setIsLoading(false);
          return;
        }

        // Try different API endpoints in order of preference
        const endpointsToTry = [];
        
        if (userId && userId !== localStorage.getItem('username')) {
          // Try with numeric user ID first
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${userId}`);
        }
        
        // Fallback to username-based endpoints
        const username = localStorage.getItem('username');
        if (username) {
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/username/${username}`);
          endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${username}`);
        }
        
        // Try current user endpoint
        endpointsToTry.push(`${API_BASE_URL}/api/auth/user/current`);
        endpointsToTry.push(`${API_BASE_URL}/api/auth/me`);
        
        let userData = null;
        let lastError;
        
        for (const endpoint of endpointsToTry) {
          try {
            console.log('Trying API URL:', endpoint);
            
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            console.log('API Response Status:', response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log('API Response Data:', data);
              
              // Store the correct user ID for future use
              if (data.id && data.id !== data.username) {
                setCurrentUserId(data.id.toString());
                localStorage.setItem('uid', data.id.toString());
              }
              
              userData = {
                id: data.id || 'N/A',
                userName: data.username || 'N/A',
                email: data.email || 'N/A',
                mobile: data.mobile || 'N/A',
                role: data.authorities ? data.authorities.map(auth => auth.authority.replace('ROLE_', '')) : ['N/A'],
                createdAt: data.createdAt || 'N/A',
                fullName: data.fullName || data.username || 'N/A',
                active: data.active !== undefined ? (data.active === 1 || data.active === true) : 'N/A'
              };
              break; // Success, exit the loop
            } else if (response.status === 401) {
              lastError = new Error('Authentication failed. Please login again.');
            } else if (response.status === 403) {
              lastError = new Error('Access forbidden. You do not have permission to view this profile.');
            } else if (response.status === 404) {
              lastError = new Error('User not found.');
              continue; // Try next endpoint
            } else {
              lastError = new Error(`API error: ${response.status}`);
            }
          } catch (fetchError) {
            console.error('Fetch error for endpoint:', endpoint, fetchError);
            lastError = fetchError;
            continue; // Try next endpoint
          }
        }
        
        if (!userData) {
          console.error("Error fetching user data:", lastError);
          // Use fallback data from localStorage
          const username = localStorage.getItem('username');
          const fullName = localStorage.getItem('fullName');
          userData = { 
            userName: username || 'User',
            fullName: fullName || username || 'User'
          };
        }
        
        console.log('Final User Data:', userData);
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

    fetchUserData();
  }, [isValidPlan]);
   useEffect(() => {
    const loadFestiveCoupons = async () => {
      if (!isValidPlan) return;

      setFestiveLoading(true);
      try {
        // Replace with actual API call
        // const response = await fetch(`${API_BASE_URL}/api/coupons/festive`);
        // const data = await response.json();
        // setFestiveCoupons(data);
        
        // For now, using mock data
        setFestiveCoupons(mockFestiveCoupons);
      } catch (error) {
        console.error('Error loading festive coupons:', error);
        setFestiveCoupons(mockFestiveCoupons);
      } finally {
        setFestiveLoading(false);
      }
    };

    loadFestiveCoupons();
  }, [isValidPlan]);
  useEffect(() => {
    if (!isValidPlan) {
      console.error('Invalid or missing plan data, redirecting to subscription');
      navigate('/subscription');
    }
  }, [isValidPlan, navigate]);

  // Early return AFTER all hooks have been called
  if (!isValidPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Plan Details</h2>
          <p className="text-gray-600">Redirecting to subscription page...</p>
        </div>
      </div>
    );
  }
  // Calculate totals
  const calculateTotals = () => {
    const basePlanPrice = plan.totalPrice;
    const extraCreditsCost = extraCredits * (plan.extraCreditPrice || 0);
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
  
  // Fetch user data with enhanced API calls
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       setIsLoading(true);
        
  //       // Get current user ID
  //       const userId = getCurrentUserId();
  //       setCurrentUserId(userId);
  //       console.log('Retrieved User ID:', userId);
        
  //       // Get JWT token - try multiple possible keys
  //       const jwtToken = localStorage.getItem('authToken') || 
  //                        localStorage.getItem('token') || 
  //                        localStorage.getItem('accessToken');
        
  //       console.log('JWT Token exists:', !!jwtToken);
        
  //       if (!jwtToken) {
  //         // Fallback to stored username and fullName
  //         const username = localStorage.getItem('username');
  //         const fullName = localStorage.getItem('fullName');
  //         setUserData({ 
  //           userName: username || 'User',
  //           fullName: fullName || username || 'User'
  //         });
  //         setIsLoading(false);
  //         return;
  //       }

  //       // Try different API endpoints in order of preference
  //       const endpointsToTry = [];
        
  //       if (userId && userId !== localStorage.getItem('username')) {
  //         // Try with numeric user ID first
  //         endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${userId}`);
  //       }
        
  //       // Fallback to username-based endpoints
  //       const username = localStorage.getItem('username');
  //       if (username) {
  //         endpointsToTry.push(`${API_BASE_URL}/api/auth/user/username/${username}`);
  //         endpointsToTry.push(`${API_BASE_URL}/api/auth/user/${username}`);
  //       }
        
  //       // Try current user endpoint
  //       endpointsToTry.push(`${API_BASE_URL}/api/auth/user/current`);
  //       endpointsToTry.push(`${API_BASE_URL}/api/auth/me`);
        
  //       let userData = null;
  //       let lastError;
        
  //       for (const endpoint of endpointsToTry) {
  //         try {
  //           console.log('Trying API URL:', endpoint);
            
  //           const response = await fetch(endpoint, {
  //             method: 'GET',
  //             headers: {
  //               'Authorization': `Bearer ${jwtToken}`,
  //               'Content-Type': 'application/json',
  //               'Accept': 'application/json'
  //             }
  //           });
            
  //           console.log('API Response Status:', response.status);
            
  //           if (response.ok) {
  //             const data = await response.json();
  //             console.log('API Response Data:', data);
              
  //             // Store the correct user ID for future use
  //             if (data.id && data.id !== data.username) {
  //               setCurrentUserId(data.id.toString());
  //               localStorage.setItem('uid', data.id.toString());
  //             }
              
  //             userData = {
  //               id: data.id || 'N/A',
  //               userName: data.username || 'N/A',
  //               email: data.email || 'N/A',
  //               mobile: data.mobile || 'N/A',
  //               role: data.authorities ? data.authorities.map(auth => auth.authority.replace('ROLE_', '')) : ['N/A'],
  //               createdAt: data.createdAt || 'N/A',
  //               fullName: data.fullName || data.username || 'N/A',
  //               active: data.active !== undefined ? (data.active === 1 || data.active === true) : 'N/A'
  //             };
  //             break; // Success, exit the loop
  //           } else if (response.status === 401) {
  //             lastError = new Error('Authentication failed. Please login again.');
  //           } else if (response.status === 403) {
  //             lastError = new Error('Access forbidden. You do not have permission to view this profile.');
  //           } else if (response.status === 404) {
  //             lastError = new Error('User not found.');
  //             continue; // Try next endpoint
  //           } else {
  //             lastError = new Error(`API error: ${response.status}`);
  //           }
  //         } catch (fetchError) {
  //           console.error('Fetch error for endpoint:', endpoint, fetchError);
  //           lastError = fetchError;
  //           continue; // Try next endpoint
  //         }
  //       }
        
  //       if (!userData) {
  //         console.error("Error fetching user data:", lastError);
  //         // Use fallback data from localStorage
  //         const username = localStorage.getItem('username');
  //         const fullName = localStorage.getItem('fullName');
  //         userData = { 
  //           userName: username || 'User',
  //           fullName: fullName || username || 'User'
  //         };
  //       }
        
  //       console.log('Final User Data:', userData);
  //       setUserData(userData);
  //       setIsLoading(false);
        
  //     } catch (error) {
  //       console.error('Error fetching user data:', error);
  //       const username = localStorage.getItem('username');
  //       const fullName = localStorage.getItem('fullName');
  //       setUserData({ 
  //         userName: username || 'User',
  //         fullName: fullName || username || 'User'
  //       });
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  // // Load festive coupons
  // useEffect(() => {
  //   const loadFestiveCoupons = async () => {
  //     setFestiveLoading(true);
  //     try {
  //       // Replace with actual API call
  //       // const response = await fetch(`${API_BASE_URL}/api/coupons/festive`);
  //       // const data = await response.json();
  //       // setFestiveCoupons(data);
        
  //       // For now, using mock data
  //       setFestiveCoupons(mockFestiveCoupons);
  //     } catch (error) {
  //       console.error('Error loading festive coupons:', error);
  //       setFestiveCoupons(mockFestiveCoupons);
  //     } finally {
  //       setFestiveLoading(false);
  //     }
  //   };

  //   loadFestiveCoupons();
  // }, []);

  // Redirect if no plan data
  if (!plan) {
    navigate('/subscription');
    return null;
  }

  // Function to get current user ID
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

      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  // Extra Credits Handlers
  const handleExtraCreditsChange = (value) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setExtraCredits(numValue);
  };

  const incrementExtraCredits = () => {
    setExtraCredits(prev => prev + 1);
  };

  const decrementExtraCredits = () => {
    setExtraCredits(prev => Math.max(0, prev - 1));
  };

  // Coupon validation function
  const validateCoupon = async (code, isFestive = false) => {
    setCouponLoading(true);
    setCouponError('');
    
    try {
      if (isFestive) {
        // Handle festive coupon validation
        const festiveCoupon = festiveCoupons.find(c => c.code === code);
        if (festiveCoupon && totals.subtotal >= festiveCoupon.minAmount) {
          setAppliedCoupon(festiveCoupon);
          setShowCouponInput(false);
          setShowFestiveCoupons(false);
          setCouponError('');
          setCouponCode(code);
          return;
        } else {
          setCouponError(festiveCoupon ? `Minimum order amount ₹${festiveCoupon.minAmount} required` : 'Invalid coupon');
          return;
        }
      }

      const jwtToken = localStorage.getItem('authToken') || 
                       localStorage.getItem('token') || 
                       localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          couponCode: code,
          planId: plan.id,
          userId: currentUserId,
          planPrice: totals.subtotal
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setDiscount(data.discount || 0);
        setShowCouponInput(false);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscount(0);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Failed to validate coupon. Please try again.');
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  // Apply coupon handler
  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim());
    } else {
      setCouponError('Please enter a coupon code');
    }
  };

  // Apply festive coupon handler
  const handleApplyFestiveCoupon = (coupon) => {
    validateCoupon(coupon.code, true);
  };

  // Remove coupon handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    setCouponError('');
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

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        plan: plan,
        credits: credits,
        pricing: pricing,
        autoRenewal: autoRenewal,
        appliedCoupon: appliedCoupon,
        extraCredits: extraCredits,
        extraCreditsCost: totals.extraCreditsCost,
        discount: totals.discountAmount,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        finalPrice: totals.finalTotal,
        totalCredits: plan.totalCredits + extraCredits
      }
    });
  };

  // Calculate cost per credit
  const costPerCredit = plan.totalPrice / plan.totalCredits;
  
  // Calculate potential savings if it's a yearly plan
  const calculateYearlySavings = () => {
    if (plan.planDuration === 'yearly') {
      const monthlyEquivalent = (plan.totalPrice / 12);
      const monthlyCostPerCredit = monthlyEquivalent / (plan.totalCredits / 12);
      return costPerCredit < monthlyCostPerCredit ? monthlyCostPerCredit - costPerCredit : 0;
    }
    return 0;
  };

  const yearlySavings = calculateYearlySavings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Plans
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Cart</h1>
          <p className="text-lg text-white/90">Review your selected plan and proceed to checkout</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    {getPlanIcon(plan.planName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold capitalize">{plan.planName}</h2>
                    <p className="text-white/90">
                      {plan.planType} {plan.planDuration && `• ${plan.planDuration}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{plan.totalPrice.toLocaleString()}
                    </span>
                    {plan.planDuration && (
                      <span className="text-gray-500">/{plan.planDuration}</span>
                    )}
                  </div>
                  
                  {yearlySavings > 0 && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                      SAVE ₹{(yearlySavings * plan.totalCredits).toFixed(0)}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-4">
                  Renews at ₹{(plan.totalPrice * 1.2).toLocaleString()}/mo for a year. Cancel anytime.
                </p>
              </div>

              {/* Extra Credits Section */}
              {plan.extraCreditPrice && plan.extraCreditPrice > 0 && (
                <div className="p-6 border-b bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Extra Credits</h3>
                  
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
                            onClick={decrementExtraCredits}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            disabled={extraCredits === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={extraCredits}
                            onChange={(e) => handleExtraCreditsChange(e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={incrementExtraCredits}
                            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Price per credit:</span>
                          <span className="font-semibold">₹{plan.extraCreditPrice}</span>
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
              {plan.planExtraCredit > 0 && (
                <div className="p-6 bg-green-50 border-l-4 border-green-400">
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900">Great news!</h3>
                      <p className="text-green-700 mt-1">
                        Your <strong>FREE {plan.planExtraCredit} bonus credits</strong> are included with this order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What's included</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {plan.totalCredits + extraCredits} Total Credits
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.baseCredits} base + {plan.planExtraCredit} bonus
                      {extraCredits > 0 && ` + ${extraCredits} extra`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{plan.creditExpirationDays} Days Validity</div>
                    <div className="text-sm text-gray-600">From activation date</div>
                  </div>
                </div>
                
                {plan.creditRollover === 1 && (
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Plan Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700">{plan.planName} Plan</span>
                  <span className="font-semibold">₹{plan.totalPrice.toLocaleString()}</span>
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

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
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
                    {isLoading ? 'Loading...' : (userData?.fullName || userData?.userName || 'User')}
                  </div>
                  {userData?.email && userData?.email !== 'N/A' && (
                    <div className="text-sm text-gray-500">
                      {userData.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Auto Renewal */}
              {plan.planType === 'Subscription' && (
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
                        Automatically renew every {plan.planDuration}. Cancel anytime.
                      </div>
                    </div>
                  </label>
                </div>
              )}

              {/* Enhanced Coupon Section */}
              <div className="mb-6 space-y-4">
                {/* Regular Coupon Input */}
                {!showCouponInput && !appliedCoupon ? (
                  <button 
                    onClick={() => setShowCouponInput(true)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Gift className="w-4 h-4" />
                    Have a coupon code?
                  </button>
                ) : showCouponInput ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                        disabled={couponLoading}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                      >
                        {couponLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    
                    {couponError && (
                      <p className="text-red-600 text-xs">{couponError}</p>
                    )}
                    
                    <button
                      onClick={() => {
                        setShowCouponInput(false);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}

                {/* Festive Season Coupons */}
                {!appliedCoupon && (
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowFestiveCoupons(!showFestiveCoupons)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Festive Season Offers
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showFestiveCoupons ? 'rotate-180' : ''}`} />
                    </button>

                    {showFestiveCoupons && (
                      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                        {festiveLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader className="w-6 h-6 animate-spin text-purple-600" />
                          </div>
                        ) : (
                          festiveCoupons.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleApplyFestiveCoupon(coupon)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{coupon.emoji}</span>
                                    <span className="font-semibold text-purple-900 text-sm">
                                      {coupon.title}
                                    </span>
                                  </div>
                                  <p className="text-xs text-purple-700 mb-2">
                                    {coupon.description}
                                  </p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-mono bg-purple-200 text-purple-800 px-2 py-1 rounded">
                                      {coupon.code}
                                    </span>
                                    <span className="text-purple-600">
                                      Valid till {new Date(coupon.validUntil).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {totals.subtotal < coupon.minAmount && (
                                    <p className="text-xs text-red-600 mt-1">
                                      Min. order: ₹{coupon.minAmount}
                                    </p>
                                  )}
                                </div>
                                <div className="ml-2">
                                  <Tag className="w-4 h-4 text-purple-600" />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Continue to Payment
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
                    <span>Money Back Guarantee</span>
                  </div>
                </div>
                
                {/* GST Information */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <Percent className="w-3 h-3" />
                    <span>GST included as per Indian tax regulations</span>
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

export default PlanDetailsPage;