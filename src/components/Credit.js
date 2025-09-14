import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Crown,
  Star,
  Shield,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Plus,
  ArrowRight,
  Package,
  Users,
  Loader,
  AlertTriangle,
  Info
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const CreditPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [criticalError, setCriticalError] = useState(false); // New state for critical errors
  const [selectedPayment, setSelectedPayment] = useState(null);
const [showPaymentModal, setShowPaymentModal] = useState(false);
  // State for API data
  const [dashboardData, setDashboardData] = useState({
    hasSubscription: false,
    currentSubscription: null,
    paymentHistory: [],
    creditHistory: [],
    usage: null
  });

  // Get current user data
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
 const fetchUserSubscription = async () => {
  try {
    const token = getAuthToken();
    const userId = getCurrentUserId();

    if (!token || !userId) {
      console.log('No auth token or user ID found');
      setDashboardData(prev => ({ ...prev, hasSubscription: false }));
      return false;
    }

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
        // Sort by start date to get the latest subscription
        const sortedSubscriptions = subscriptionArray.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        // Get the active subscription or the latest one
        const activeSubscription = subscriptionArray.find(sub => 
          sub.status && sub.status.toLowerCase() === 'active'
        ) || sortedSubscriptions[0];

        // Get credit information for ALL subscriptions of this user (same as buy extra credits page)
        let totalCreditsInfo = { 
          totalAvailableCredits: 0, 
          totalUsedCredits: 0, 
          totalRemainingCredits: 0,
          allCredits: []
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
              // Calculate total credits across all subscriptions (same as buy extra credits)
              totalCreditsInfo.totalAvailableCredits = userCredits.reduce((sum, credit) => sum + credit.availableCredits, 0);
              totalCreditsInfo.totalUsedCredits = userCredits.reduce((sum, credit) => sum + credit.usedCredits, 0);
              totalCreditsInfo.totalRemainingCredits = totalCreditsInfo.totalAvailableCredits - totalCreditsInfo.totalUsedCredits;
              totalCreditsInfo.allCredits = userCredits;
            }
          }
        } catch (creditError) {
          console.error('Error fetching credit info:', creditError);
        }

        // Create final subscription object with calculated credits (same pattern as buy extra credits)
        const transformedSubscription = {
          id: activeSubscription.id,
          planName: activeSubscription.planName || 'Subscription Plan',
          planType: 'Subscription',
          status: activeSubscription.status || 'Active',
          // Use total credits across all subscriptions (same as buy extra credits page)
          totalCredits: totalCreditsInfo.totalAvailableCredits,
          usedCredits: totalCreditsInfo.totalUsedCredits,
          remainingCredits: totalCreditsInfo.totalRemainingCredits,
          startDate: activeSubscription.startDate,
          endDate: activeSubscription.endDate,
          monthlyPrice: activeSubscription.price || 0,
          autoRenewal: activeSubscription.autoRenewal,
          // Store additional info for buy extra credits
          currentPlan: activeSubscription
        };

        // SINGLE STATE UPDATE - Only set state once with complete data (same as buy extra credits)
        setDashboardData(prev => ({
          ...prev,
          hasSubscription: true,
          currentSubscription: transformedSubscription,
          allSubscriptions: subscriptionArray,
          allCredits: totalCreditsInfo.allCredits
        }));
        
        return true;
      } else {
        console.log('No subscriptions found for user');
        setDashboardData(prev => ({ ...prev, hasSubscription: false }));
        return false;
      }
    } else if (response.status === 404) {
      console.log('No subscription found for user (404)');
      setDashboardData(prev => ({ ...prev, hasSubscription: false }));
      return false;
    } else if (response.status === 401) {
      console.log('Unauthorized access - token might be invalid');
      setCriticalError(true);
      setError('Session expired. Please login again.');
      return false;
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    if (error.message.includes('fetch') || error.message.includes('Network') || error.message.includes('500')) {
      setCriticalError(true);
      setError('Unable to connect to server. Please check your connection.');
    } else {
      setDashboardData(prev => ({ ...prev, hasSubscription: false }));
    }
    return false;
  }
};
const navigateToBuyExtraCredits = () => {
  try {
    // Check if currentSubscription exists
    if (!dashboardData.currentSubscription) {
      console.error('No current subscription found');
      window.location.href = '/subscription';
      return;
    }

    const currentSub = dashboardData.currentSubscription;
    const currentPlan = currentSub.currentPlan || currentSub;
    
    // Safely get plan name
    const planName = currentPlan?.planName || currentSub?.planName || '';

    console.log('Current plan name:', planName);
    
    // Check if current plan is "Pay as You Go"
    if (planName && planName.toLowerCase().includes('pay as you go')) {
      // For Pay as You Go, redirect to subscription page
      window.location.href = '/subscription';
      return;
    }
    
    // For subscription plans, redirect to buy extra credits page
    window.location.href = '/buy-extra-credits';
    
  } catch (error) {
    console.error('Error in navigateToBuyExtraCredits:', error);
    alert('An error occurred while loading extra credits page. Please try again.');
  }
};
const fetchPaymentHistory = async () => {
  try {
    const token = getAuthToken();
    const userId = getCurrentUserId();

    if (!token || !userId) return;

    // Fetch payment history
    const response = await fetch(`${API_BASE_URL}/api/user-payments/getAll`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const paymentData = await response.json();
      
      // Also fetch credit history to match credits with payments
      const creditResponse = await fetch(`${API_BASE_URL}/api/user-credit-points`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }
      });

      let creditData = [];
      if (creditResponse.ok) {
        creditData = await creditResponse.json();
      }

      // Filter payments for current user and enhance with credit information
      const userPayments = Array.isArray(paymentData) 
        ? paymentData
            .filter(payment => payment.userId == userId) // Filter by current user
            .map(payment => {
              // Find matching credit record for this payment
              const matchingCredit = Array.isArray(creditData) 
                ? creditData.find(credit => 
                    credit.userId == userId && 
                    (credit.userPaymentId == payment.paymentId || 
                     credit.userSubscriptionId == payment.userSubscriptionId)
                  )
                : null;

              // Calculate credits from matching credit record or use payment data
              const creditsReceived = matchingCredit 
                ? matchingCredit.availableCredits 
                : (payment.credits || 0);

              return {
                id: payment.paymentId,
                date: payment.paymentDate,
                amount: payment.amount,
                status: payment.status || 'Success',
                method: payment.paymentMethod || 'Credit Card',
                plan: payment.planName || 'Subscription Plan',
                credits: creditsReceived, // Use actual credits from API
                orderId: payment.orderId || `ORD-${payment.paymentId}`,
                transactionReference: payment.transactionId || `pay_${payment.paymentId}`,
                // Additional credit information for detailed view
                creditDetails: matchingCredit ? {
                  creditType: matchingCredit.creditType,
                  startDate: matchingCredit.startDate,
                  endDate: matchingCredit.endDate,
                  usedCredits: matchingCredit.usedCredits,
                  remainingCredits: matchingCredit.availableCredits - matchingCredit.usedCredits
                } : null
              };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
        : [];

      setDashboardData(prev => ({
        ...prev,
        paymentHistory: userPayments
      }));
    } else if (response.status === 404) {
      // No payment history is not an error
      setDashboardData(prev => ({ ...prev, paymentHistory: [] }));
    } else {
      throw new Error('Failed to fetch payment history');
    }
  } catch (error) {
    console.error('Error fetching payment history:', error);
    setDashboardData(prev => ({ ...prev, paymentHistory: [] }));
  }
};
// Add this function to check if plan is Pay As You Go
const isPayAsYouGoPlan = () => {
  const planName = dashboardData.currentSubscription?.currentPlan?.planName || 
                   dashboardData.currentSubscription?.planName || 
                   '';
  return planName && planName.toLowerCase().includes('pay as you go');
};

// Add this function to handle renew navigation
const navigateToRenewPlan = () => {
  try {
    if (!dashboardData.currentSubscription) {
      console.error('No current subscription found');
      alert('Unable to find current subscription details');
      return;
    }

    // For Pay As You Go plans, redirect to renew page
    window.location.href = '/renew-plan';
    
  } catch (error) {
    console.error('Error in navigateToRenewPlan:', error);
    alert('An error occurred while loading renew page. Please try again.');
  }
};
  // Fetch credit history
  const fetchCreditHistory = async () => {
  try {
    const token = getAuthToken();
    const userId = getCurrentUserId();

    if (!token || !userId) return;

    // Use the correct API endpoint
    const response = await fetch(`${API_BASE_URL}/api/user-credit-points`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const creditData = await response.json();
      
      // Transform the API response to match the expected format
      const transformedCreditHistory = Array.isArray(creditData) 
        ? creditData
            .filter(credit => credit.userId == userId) // Filter by current user
            .map(credit => ({
              id: credit.creditId,
              date: credit.startDate,
              type: 'Credit', // All entries from this API are credit additions
              amount: credit.availableCredits,
              description: `${credit.creditType} credits added`,
              balance: credit.availableCredits - credit.usedCredits,
              creditType: credit.creditType,
              usedCredits: credit.usedCredits,
              totalCredits: credit.availableCredits,
              expiryDate: credit.endDate,
              subscriptionId: credit.userSubscriptionId,
              paymentId: credit.userPaymentId
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
        : [];

      setDashboardData(prev => ({
        ...prev,
        creditHistory: transformedCreditHistory
      }));
    } else if (response.status === 404) {
      // No credit history is not an error
      setDashboardData(prev => ({ ...prev, creditHistory: [] }));
    } else {
      throw new Error('Failed to fetch credit history');
    }
  } catch (error) {
    console.error('Error fetching credit history:', error);
    setDashboardData(prev => ({ ...prev, creditHistory: [] }));
  }
};

const getFilteredPayments = () => {
  let filtered = dashboardData.paymentHistory;

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(payment => 
      (payment.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.plan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.method || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transactionReference || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply period filter
  if (filterPeriod !== 'all') {
    const days = parseInt(filterPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    filtered = filtered.filter(payment => 
      new Date(payment.date) >= cutoffDate
    );
  }

  return filtered;
};
const exportPaymentHistory = () => {
  try {
    const filtered = getFilteredPayments();
    
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content with proper credit information
    const headers = ['Transaction Reference', 'Date', 'Amount', 'Method', 'Status', 'Plan', 'Credits Received', 'Credit Type'];
    const csvContent = [
      headers.join(','),
      ...filtered.map(payment => [
        payment.transactionReference || `TXN-${payment.id}`,
        formatDate(payment.date),
        payment.amount || 0,
        payment.method || 'Credit Card',
        payment.status || 'Success',
        payment.plan || 'Subscription',
        payment.credits || 0,
        payment.creditDetails?.creditType || 'N/A'
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Failed to export data. Please try again.');
  }
};
const itemsPerPage = 10;
const filteredPayments = getFilteredPayments();
const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);
const handleViewPayment = (payment) => {
  setSelectedPayment(payment);
  setShowPaymentModal(true);
};

// Add this function to close the modal
const closePaymentModal = () => {
  setShowPaymentModal(false);
  setSelectedPayment(null);
};
const downloadReceipt = (payment) => {
  try {
    const receiptContent = `
PAYMENT RECEIPT
===============

Transaction Reference: ${payment.transactionReference || `TXN-${payment.id}`}
Date: ${formatDate(payment.date)}
Amount: ${formatCurrency(payment.amount)}
Status: ${payment.status || 'Success'}
Payment Method: ${payment.method || 'Credit Card'}
Plan: ${payment.plan || 'Subscription'}

CREDITS INFORMATION
===================
Credits Received: +${(payment.credits || 0).toLocaleString()}
${payment.creditDetails ? `Credit Type: ${payment.creditDetails.creditType}` : ''}
${payment.creditDetails ? `Credits Used: ${payment.creditDetails.usedCredits.toLocaleString()}` : ''}
${payment.creditDetails ? `Credits Remaining: ${payment.creditDetails.remainingCredits.toLocaleString()}` : ''}
${payment.creditDetails ? `Valid Until: ${formatDate(payment.creditDetails.endDate)}` : ''}
Cost per Credit: ${payment.credits && payment.amount ? formatCurrency(payment.amount / payment.credits) : 'N/A'}

${payment.transactionReference ? `Transaction Reference: ${payment.transactionReference}` : ''}

Thank you for your payment!
Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `receipt-${payment.transactionReference || payment.id}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    alert('Failed to download receipt. Please try again.');
  }
};
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterPeriod]);
  // Fetch usage statistics
  const fetchUsageStats = async () => {
    try {
      const token = getAuthToken();
      const userId = getCurrentUserId();

      if (!token || !userId) return;

      const response = await fetch(`${API_BASE_URL}/api/usage-stats/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const usageData = await response.json();
        setDashboardData(prev => ({
          ...prev,
          usage: usageData
        }));
      } else if (response.status === 404) {
        // No usage stats is not an error
        setDashboardData(prev => ({ ...prev, usage: null }));
      } else {
        throw new Error('Failed to fetch usage statistics');
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setDashboardData(prev => ({ ...prev, usage: null }));
    }
  };

  // Load all data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    setCriticalError(false);

    try {
      // First check if user has subscription
      const hasSubscription = await fetchUserSubscription();
      
      // Only fetch other data if user has subscription
      if (hasSubscription) {
        await Promise.all([
          fetchPaymentHistory(),
          fetchCreditHistory(),
          fetchUsageStats()
        ]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setCriticalError(true);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Navigation functions
  const navigateToSubscription = () => {
    window.location.href = '/subscription';
  };

  const navigateToUpgrade = () => {
    window.location.href = '/upgradeplan';
  };

  const navigateToModify = () => {
    window.location.href = '/modifyplan';
  };

  // Helper functions
  const getPlanIcon = (planName) => {
    if (!planName) return <Star className="w-5 h-5" />;
    
    switch (planName.toLowerCase()) {
      case 'basic':
        return <Shield className="w-5 h-5" />;
      case 'standard':
        return <Star className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100';
    
    switch (status.toLowerCase()) {
      case 'success':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
const canBuyExtraCredits = () => {
  const planName = dashboardData.currentSubscription?.currentPlan?.planName || 
                   dashboardData.currentSubscription?.planName || 
                   '';
  return planName && !planName.toLowerCase().includes('pay as you go');
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading </h2>
          <p className="text-gray-600">Fetching your account information...</p>
        </div>
      </div>
    );
  }

  // Critical Error state (network/server errors)
  if (criticalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Subscription</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={navigateToSubscription}
              className="bg-orange-500 text-black-400 px-6 py-3 rounded-lg border-2 border-orange-300 hover:border-orange-400 transition-colors font-medium"
            >
              Take Subscription
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No subscription state
  if (!dashboardData.hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
            <p className="text-gray-600 mt-2">Get started with a subscription plan to access all features</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-16">
          {/* No Subscription Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Welcome to Your Dashboard!</h2>
                  <p className="text-orange-100">Choose a subscription plan to unlock powerful features</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Package className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Credit Management</h3>
                  <p className="text-gray-600 text-sm">Track and manage your credit usage with detailed analytics</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Analytics</h3>
                  <p className="text-gray-600 text-sm">Get insights into your usage patterns and optimize consumption</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
                  <p className="text-gray-600 text-sm">Get 24/7 priority customer support and assistance</p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-dashed border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Choose from our flexible subscription plans designed to meet your needs. 
                  Start with our basic plan or go premium for advanced features.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={navigateToSubscription}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold flex items-center gap-2 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    Choose Subscription Plan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/contact'}
                    className="bg-white text-gray-700 px-8 py-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors font-medium flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Contact Sales
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Need help choosing a plan? 
                  <button
                    onClick={() => window.location.href = '/support'}
                    className="text-orange-600 hover:text-orange-700 font-medium ml-1"
                  >
                    Contact our support team
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Quick Setup</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Get started in minutes with our easy subscription process. 
                Choose your plan, complete payment, and start using credits immediately.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Secure & Reliable</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Your data and payments are protected with enterprise-grade security. 
                Enjoy reliable service with 99.9% uptime guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate credit usage percentage
  const creditUsagePercentage = dashboardData.currentSubscription ? 
    (dashboardData.currentSubscription.usedCredits / dashboardData.currentSubscription.totalCredits) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Dashboard</h1>
              <p className="text-gray-600">Monitor your subscription, payments, and credit usage</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'subscription', label: 'Subscription', icon: Crown },
                { id: 'payments', label: 'Payment History', icon: CreditCard }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
       {activeTab === 'overview' && dashboardData.currentSubscription && (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Available Credits</p>
            <p className="text-2xl font-bold text-gray-900">
              {(dashboardData.currentSubscription.remainingCredits || 0).toLocaleString()}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-gray-500">
                Total: {(dashboardData.currentSubscription.totalCredits || 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Used: {(dashboardData.currentSubscription.usedCredits || 0).toLocaleString()}
              </p>
            </div>
            {/* Show breakdown if multiple subscriptions */}
            {dashboardData.currentSubscription.totalSubscriptions > 1 && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <Info className="w-3 h-3 inline mr-1" />
                  Credits from {dashboardData.currentSubscription.totalSubscriptions} subscription(s)
                </p>
              </div>
            )}
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Activity className="w-6 h-6 text-orange-600" />
          </div>
        </div>
        
      <div className="mt-4 pt-4 border-t border-gray-200">
  {isPayAsYouGoPlan() ? (
    // Pay As You Go: Only show Renew button
    <button
      onClick={navigateToRenewPlan}
      className="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
    >
      <RefreshCw className="w-4 h-4" />
      Renew Current Plan
    </button>
  ) : (
    // Subscription Plans: Show both buttons
    <div className="flex flex-col gap-2">
      <button
        onClick={navigateToBuyExtraCredits}
        className="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
      >
        <Plus className="w-4 h-4" />
        Buy Extra Credits
      </button>
      <button
        onClick={navigateToRenewPlan}
        className="w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
      >
        <RefreshCw className="w-4 h-4" />
        Renew Current Plan
      </button>
    </div>
  )}
</div>
      </div>


              {/* <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">This Month Usage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(dashboardData.usage?.thisMonth || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">
                      {dashboardData.usage?.growthPercentage ? 
                        `↑ ${dashboardData.usage.growthPercentage}% from last month` : 
                        'No previous data'
                      }
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div> */}

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Plan Status</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardData.currentSubscription.status || 'Active'}
                    </p>
                    {/* <p className="text-sm text-gray-500">
                      End Date: {formatDate(dashboardData.currentSubscription.endDate)}
                    </p> */}
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    
                    {/* <p className="text-sm text-gray-500">per month</p> */}
                  {/* </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div> */} 
            </div>

            {/* Credit Usage Chart */}
         <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Usage Overview</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Credits Used (All Plans Combined)</span>
          <span className="font-medium">
            {(dashboardData.currentSubscription.usedCredits || 0).toLocaleString()} / {(dashboardData.currentSubscription.totalCredits || 0).toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-300"
            style={{ 
              width: `${dashboardData.currentSubscription.totalCredits > 0 ? 
                (dashboardData.currentSubscription.usedCredits / dashboardData.currentSubscription.totalCredits) * 100 : 0}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>0</span>
          <span>
            {dashboardData.currentSubscription.totalCredits > 0 ? 
              Math.round((dashboardData.currentSubscription.usedCredits / dashboardData.currentSubscription.totalCredits) * 100) : 0}% used
          </span>
          <span>{(dashboardData.currentSubscription.totalCredits || 0).toLocaleString()}</span>
        </div>
        
        {/* Additional info for multiple subscriptions */}
        {dashboardData.currentSubscription.totalSubscriptions > 1 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 mb-2">
              <Info className="w-3 h-3 inline mr-1" />
              Credits breakdown from {dashboardData.currentSubscription.totalSubscriptions} subscription(s):
            </p>
            {dashboardData.currentSubscription.creditBreakdown && 
             dashboardData.currentSubscription.creditBreakdown.map((breakdown, index) => (
              <div key={index} className="text-xs text-blue-600 flex justify-between">
                <span>{breakdown.creditType}:</span>
                <span>{breakdown.remaining.toLocaleString()} / {breakdown.available.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.creditHistory.length > 0 ? (
                  dashboardData.creditHistory.slice(0, 5).map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${item.type === 'Credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {item.type === 'Credit' ? 
                            <TrendingUp className="w-4 h-4 text-green-600" /> : 
                            <TrendingDown className="w-4 h-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${item.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.type === 'Credit' ? '+' : ''}{(item.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">Balance: {(item.balance || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && dashboardData.currentSubscription && (
          <div className="space-y-6">
            {/* Current Subscription */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Current Subscription</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dashboardData.currentSubscription.status)}`}>
                  {dashboardData.currentSubscription.status || 'Active'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      {getPlanIcon(dashboardData.currentSubscription.planName)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{dashboardData.currentSubscription.planName || 'Subscription Plan'}</p>
                      <p className="text-sm text-gray-500">{dashboardData.currentSubscription.planType || 'Subscription'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Credits:</span>
                      <span className="font-medium">{(dashboardData.currentSubscription.totalCredits || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Usage Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used Credits:</span>
                      <span className="font-medium">{(dashboardData.currentSubscription.usedCredits || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium text-green-600">{(dashboardData.currentSubscription.remainingCredits || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usage Rate:</span>
                      <span className="font-medium">{Math.round(creditUsagePercentage)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Important Dates</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-medium">{formatDate(dashboardData.currentSubscription.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-medium">{formatDate(dashboardData.currentSubscription.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
  <div className="flex flex-col sm:flex-row gap-4">
    {isPayAsYouGoPlan() ? (
      // Pay As You Go: Only show Renew button
      <button 
        onClick={navigateToRenewPlan}
        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Renew Current Plan
      </button>
    ) : (
      // Subscription Plans: Show both Buy Extra Credits and Renew buttons
      <>
        <button 
          onClick={navigateToBuyExtraCredits}
          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Buy Extra Credits
        </button>
        <button 
          onClick={navigateToRenewPlan}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Renew Current Plan
        </button>
      </>
    )}
    
    <button 
      onClick={navigateToUpgrade}
      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
    >
      Upgrade Plan
    </button>
    <button 
      onClick={navigateToModify}
      className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
    >
      Modify Subscription
    </button>
    <button className="bg-red-100 text-red-600 px-6 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium">
      Cancel Subscription
    </button>
  </div>
</div>

            </div>

            {/* Credit History Section integrated here */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Credit Transaction History</h3>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="all">All Transactions</option>
                      <option value="credit">Credits Only</option>
                      <option value="debit">Debits Only</option>
                    </select>
                    <button 
                      onClick={loadDashboardData}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {dashboardData.creditHistory.length > 0 ? (
                  dashboardData.creditHistory.map((transaction, index) => (
                    <div key={transaction.id || index} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-full ${transaction.type === 'Credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {transaction.type === 'Credit' ? 
                              <TrendingUp className="w-5 h-5 text-green-600" /> : 
                              <TrendingDown className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                              <span className="text-sm text-gray-400">•</span>
                              <p className="text-sm text-gray-500">ID: {transaction.id}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'Credit' ? '+' : ''}{(transaction.amount || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">Balance: {(transaction.balance || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit History</h3>
                    <p className="text-gray-500">Your credit transactions will appear here once you start using the service.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
  <div className="space-y-6">
    {/* Filters */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredPayments.length} of {dashboardData.paymentHistory.length} transactions
          </span>
          <button 
            onClick={exportPaymentHistory}
            disabled={filteredPayments.length === 0}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
      
      {/* Filter Summary */}
      {(searchTerm || filterPeriod !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            Active filters:
            {searchTerm && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                Search: "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-1 text-orange-500 hover:text-orange-700"
                >
                  ×
                </button>
              </span>
            )}
            {filterPeriod !== 'all' && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                Period: Last {filterPeriod} days
                <button 
                  onClick={() => setFilterPeriod('all')}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
      </div>
      
      <div className="overflow-x-auto">
        {paginatedPayments.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.map((payment, index) => (
                <tr key={payment.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{payment.transactionReference || `TXN-${payment.id}`}</div>
                      <div className="text-sm text-gray-500">{payment.plan || 'Subscription'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
  <div className="font-medium text-gray-900">{formatCurrency(payment.amount)}</div>
  <div className="text-sm text-gray-500">
    {payment.credits > 0 ? (
      <span className="text-green-600 font-medium">
        +{payment.credits.toLocaleString()} credits
      </span>
    ) : (
      <span className="text-gray-400">No credits data</span>
    )}
  </div>
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.method || 'Credit Card'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status || 'Success'}
                    </span>
                  </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <div className="flex items-center gap-2">
    <button 
      onClick={() => handleViewPayment(payment)}
      className="text-orange-600 hover:text-orange-900 font-medium flex items-center gap-1 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
      title="View payment details"
    >
      <Eye className="w-4 h-4" />
      View
    </button>
    <button 
      onClick={() => downloadReceipt(payment)}
      className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
      title="Download receipt"
    >
      <Download className="w-3 h-3" />
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            {searchTerm || filterPeriod !== 'all' ? (
              <>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-500 mb-4">No transactions match your current filters.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterPeriod('all');
                  }}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                <p className="text-gray-500">Your payment transactions will appear here once you make payments.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} results
            </p>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}

      </div>
      {showPaymentModal && selectedPayment && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Payment Details</h3>
          <button
            onClick={closePaymentModal}
            className="text-white hover:text-gray-200 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-6 space-y-6">
        {/* Transaction Overview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Transaction Overview</h4>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
              {selectedPayment.status || 'Success'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Transaction Reference</p>
              <p className="font-semibold text-gray-900">{selectedPayment.transactionReference || `TXN-${selectedPayment.id}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Date</p>
              <p className="font-semibold text-gray-900">{formatDate(selectedPayment.date)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedPayment.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold text-gray-900">{selectedPayment.method || 'Credit Card'}</p>
            </div>
          </div>
        </div>

        {/* Plan & Credits Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Plan Details</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan Name:</span>
                <span className="font-medium">{selectedPayment.plan || 'Subscription Plan'}</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4">
  <div className="flex items-center mb-3">
    <div className="bg-green-100 p-2 rounded-lg mr-3">
      <Activity className="w-5 h-5 text-green-600" />
    </div>
    <h4 className="font-semibold text-gray-900">Credits Information</h4>
  </div>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-gray-600">Credits Received:</span>
      <span className="font-bold text-green-600">
        +{(selectedPayment.credits || 0).toLocaleString()}
      </span>
    </div>
    {selectedPayment.creditDetails && (
      <>
        <div className="flex justify-between">
          <span className="text-gray-600">Credit Type:</span>
          <span className="font-medium">{selectedPayment.creditDetails.creditType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Credits Used:</span>
          <span className="font-medium text-red-600">
            -{(selectedPayment.creditDetails.usedCredits || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Credits Remaining:</span>
          <span className="font-medium text-blue-600">
            {(selectedPayment.creditDetails.remainingCredits || 0).toLocaleString()}
          </span>
        </div>
        
      </>
    )}
    <div className="flex justify-between pt-2 border-t border-green-200">
      <span className="text-gray-600">Cost per Credit:</span>
      <span className="font-medium">
        {selectedPayment.credits && selectedPayment.amount ? 
          formatCurrency(selectedPayment.amount / selectedPayment.credits) : 'N/A'}
      </span>
    </div>
  </div>
</div>

        </div>

       
        

        {/* Payment Timeline */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
            <div className="bg-gray-200 p-2 rounded-lg mr-3">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            Payment Timeline
          </h4>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Payment Completed</p>
                <p className="text-sm text-gray-500">{formatDate(selectedPayment.date)} • Credits added to account</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Payment Processed</p>
                <p className="text-sm text-gray-500">Transaction verified and confirmed</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-gray-900">Payment Initiated</p>
                <p className="text-sm text-gray-500">Payment request submitted</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => downloadReceipt(selectedPayment)}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
        
          <button
            onClick={() => window.location.href = '/contact'}
            className="bg-blue-100 text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default CreditPage;