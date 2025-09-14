import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Loader, 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  ChevronDown,
  Lock,
  X,
  AlertCircle,
  Save,
  CheckCircle,
  Edit
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Indian states - moved outside component
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// Custom Dialog Component - moved outside
const CustomDialog = React.memo(({ isOpen, onClose, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scale-in">
        <div className={`flex items-center p-6 rounded-t-2xl ${type === 'error' ? 'bg-red-50 border-b border-red-100' : 'bg-green-50 border-b border-green-100'}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${type === 'error' ? 'bg-red-100' : 'bg-green-100'}`}>
            {type === 'error' ? 
              <AlertCircle className="w-6 h-6 text-red-600" /> : 
              <CheckCircle className="w-6 h-6 text-green-600" />
            }
          </div>
          <div className="ml-4 flex-1">
            <h3 className={`text-lg font-semibold ${type === 'error' ? 'text-red-800' : 'text-green-800'}`}>
              {type === 'error' ? 'Validation Error' : 'Success'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{message}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                type === 'error' 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Billing Form Component - moved outside and fixed
const BillingForm = React.memo(({ 
  billingInfo, 
  onInputChange, 
  onSaveBilling, 
  savingBilling, 
  subscriptionData 
}) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full mr-4 shadow-lg">
          <User className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Billing Information</h2>
          <p className="text-gray-600">Enter your billing details for invoice generation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
            First Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={billingInfo.firstName}
              onChange={onInputChange}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
              placeholder="Enter first name"
              autoComplete="given-name"
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={billingInfo.lastName}
            onChange={onInputChange}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
            placeholder="Enter last name"
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              id="email"
              type="email"
              name="email"
              value={billingInfo.email}
              onChange={onInputChange}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
              placeholder="Enter email address"
              autoComplete="email"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="md:col-span-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-xl border-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-all">
            <div className="flex items-center px-4 py-4 bg-gray-100 rounded-l-xl border-r border-gray-200">
              <span className="text-gray-700 font-medium">+91</span>
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={billingInfo.phone}
                onChange={onInputChange}
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-r-xl focus:outline-none"
                placeholder="Enter phone number"
                autoComplete="tel"
                maxLength="10"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
            Street Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5 pointer-events-none" />
            <textarea
              id="address"
              name="address"
              value={billingInfo.address}
              onChange={onInputChange}
              rows="3"
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl transition-all resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
              placeholder="Enter full address"
              autoComplete="street-address"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-3">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            name="city"
            value={billingInfo.city}
            onChange={onInputChange}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
            placeholder="Enter city"
            autoComplete="address-level2"
          />
        </div>

        {/* State */}
        <div>
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-3">
            State <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="state"
              name="state"
              value={billingInfo.state}
              onChange={onInputChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
              autoComplete="address-level1"
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* PIN Code */}
        <div>
          <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-3">
            PIN Code <span className="text-red-500">*</span>
          </label>
          <input
            id="zipCode"
            type="text"
            name="zipCode"
            value={billingInfo.zipCode}
            onChange={onInputChange}
            maxLength="6"
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white"
            placeholder="Enter PIN code"
            autoComplete="postal-code"
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-3">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            id="country"
            type="text"
            name="country"
            value="India"
            disabled
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
            autoComplete="country"
          />
        </div>
      </div>

      {/* Save and Pay Button */}
      <div className="mt-10">
        <button
          onClick={onSaveBilling}
          disabled={savingBilling}
          type="button"
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center ${
            savingBilling 
              ? 'bg-orange-400 text-white cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
          }`}
        >
          {savingBilling ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 mr-2" />
              Save & Pay ₹{(subscriptionData?.finalPrice || subscriptionData?.pricing?.finalPrice || 0).toLocaleString()}
            </>
          )}
        </button>
      </div>
    </div>
  );
});

// Billing Info Card Component - moved outside
const BillingInfoCard = React.memo(({ billingInfo, onEditBilling }) => (
  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full mr-4 shadow-lg">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Information</h2>
          <p className="text-green-600 font-medium">Information saved successfully</p>
        </div>
      </div>
      <button
        onClick={onEditBilling}
        className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium"
      >
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </button>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
          <p className="text-lg font-semibold text-gray-900">{billingInfo.firstName} {billingInfo.lastName}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <p className="text-gray-900">{billingInfo.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            <p className="text-gray-900">+91 {billingInfo.phone}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-900">{billingInfo.address}</p>
              <p className="text-gray-900">{billingInfo.city}, {billingInfo.state}</p>
              <p className="text-gray-900">{billingInfo.zipCode}, {billingInfo.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-8 text-center">
      <p className="text-gray-600 mb-4">Ready to complete your purchase!</p>
      <div className="flex items-center justify-center p-4 bg-green-50 rounded-xl border border-green-200">
        <Shield className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-sm font-medium text-green-800">Your payment will be processed securely</span>
      </div>
    </div>
  </div>
));

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [billingInfoSaved, setBillingInfoSaved] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('error');
  const [savingBilling, setSavingBilling] = useState(false);

  const showCustomDialog = useCallback((message, type = 'error') => {
    setDialogMessage(message);
    setDialogType(type);
    setShowDialog(true);
  }, []);

  const prefillBillingInfo = useCallback(() => {
    try {
      const storedUserData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        setBillingInfo(prev => ({
          ...prev,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          phone: userData.phone || userData.mobile || ''
        }));
      }
    } catch (error) {
      console.error('Error prefilling billing info:', error);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    if (location.state) {
      console.log('Payment Page - Received Data:', location.state);
      setSubscriptionData(location.state);
      prefillBillingInfo();
    } else {
      showCustomDialog('No subscription data found. Redirecting to subscription page.');
      setTimeout(() => navigate('/plan'), 2000);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [location.state, navigate, prefillBillingInfo, showCustomDialog]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateBillingForm = useCallback(() => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    
    for (let field of required) {
      if (!billingInfo[field].trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        const displayName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        showCustomDialog(`Please fill in ${displayName.replace('first name', 'First Name').replace('last name', 'Last Name').replace('zip code', 'PIN Code')}`);
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      showCustomDialog('Please enter a valid email address');
      return false;
    }

    if (billingInfo.phone.length < 10) {
      showCustomDialog('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }

    if (billingInfo.zipCode.length !== 6) {
      showCustomDialog('Please enter a valid 6-digit PIN code');
      return false;
    }

    return true;
  }, [billingInfo, showCustomDialog]);

  const getCurrentUserId = useCallback(() => {
    try {
      const storedUid = localStorage.getItem('uid');
      if (storedUid && storedUid !== localStorage.getItem('username')) {
        return parseInt(storedUid);
      }

      const storedUserId = localStorage.getItem('userId') || localStorage.getItem('id');
      if (storedUserId && storedUserId !== localStorage.getItem('username')) {
        return parseInt(storedUserId);
      }

      const jwtToken = getAuthToken();
      if (jwtToken) {
        try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          const possibleIds = [payload.userId, payload.id, payload.uid, payload.sub];
          for (const id of possibleIds) {
            if (id && id !== payload.username && !isNaN(id)) {
              return parseInt(id);
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
  }, []);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('jwtToken') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('token');
  }, []);

  const processPayment = useCallback(async () => {
    if (!subscriptionData) {
      showCustomDialog('Subscription data not found. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }

      const amount = subscriptionData.finalPrice || subscriptionData.pricing.finalPrice;
      const jwtToken = getAuthToken();

      console.log('Processing payment for amount:', amount);

      const orderResponse = await axios.post(`${API_BASE_URL}/api/payments/create`, null, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`
        },
        params: {
          amount: amount,
          currency: 'INR',
          userId: userId
        }
      });

      const { orderId, razorpayKey } = orderResponse.data;

      const paymentDescription = subscriptionData.extraCredits && subscriptionData.extraCredits > 0 
        ? `${subscriptionData.plan.planName.toUpperCase()} Plan - ${subscriptionData.totalCredits || subscriptionData.credits} Credits (includes ${subscriptionData.extraCredits} extra credits)`
        : `${subscriptionData.plan.planName.toUpperCase()} Plan - ${subscriptionData.credits} Credits`;

      const options = {
        key: razorpayKey,
        amount: amount * 100,
        currency: 'INR',
        name: 'myBOQ',
        description: paymentDescription,
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            
            const verificationData = {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            };

            const verify = await axios.post(`${API_BASE_URL}/api/payments/verify`, verificationData, { 
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${jwtToken}`
              }
            });

            if (verify.data === true) {
              await createSubscription(response.razorpay_payment_id);
            } else {
              showCustomDialog("Payment verification failed.");
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            showCustomDialog("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: `${billingInfo.firstName} ${billingInfo.lastName}`,
          email: billingInfo.email,
          contact: billingInfo.phone
        },
        theme: {
          color: "#f97316"
        },
        modal: {
          ondismiss: function(){
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Payment initiation error:', err);
      showCustomDialog("Error occurred while initiating payment. Please try again.");
      setLoading(false);
    }
  }, [subscriptionData, billingInfo, getCurrentUserId, getAuthToken, showCustomDialog]);

  const createSubscription = useCallback(async (paymentId) => {
    try {
      const userId = getCurrentUserId();
      const jwtToken = getAuthToken();
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + subscriptionData.plan.creditExpirationDays);
      
      const nextBillingDate = subscriptionData.plan.planType === 'Subscription' ? 
        new Date(startDate.getTime() + (subscriptionData.plan.planDuration === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000) :
        null;

      const subscriptionPayload = {
        masterSubscriptionId: subscriptionData.plan.subscriptionId,
        userId: parseInt(userId),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        price: subscriptionData.finalPrice || subscriptionData.pricing.finalPrice,
        status: "active",
        autoRenewal: subscriptionData.autoRenewal ? "yes" : "no",
        nextBillingDate: nextBillingDate ? nextBillingDate.toISOString() : null,
        prevUserSubscriptionId: 0,
        paymentId: paymentId
      };

      const subscriptionResponse = await fetch(`${API_BASE_URL}/api/user-subscriptions`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionPayload)
      });

      if (!subscriptionResponse.ok) {
        throw new Error(`Subscription creation failed! status: ${subscriptionResponse.status}`);
      }

      const subscriptionResult = await subscriptionResponse.json();
      const userSubscriptionId = subscriptionResult.id || subscriptionResult.userSubscriptionId;

      const paymentPayload = {
        transactionId: paymentId,
        userId: parseInt(userId),
        paymentDate: new Date().toISOString(),
        amount: subscriptionData.finalPrice || subscriptionData.pricing.finalPrice,
        paymentMethod: "Razorpay",
        userSubscriptionId: userSubscriptionId,
        creditId: 0,
        transactionStatus: "completed",
        currency: "INR",
        isPartialPayment: false,
        discountAmount: subscriptionData.discount || 0,
        discountCode: subscriptionData.appliedCoupon?.code || "",
        processingDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        extraCreditsQuantity: subscriptionData.extraCredits || 0,
        extraCreditsCost: subscriptionData.extraCreditsCost || 0,
        subtotal: subscriptionData.subtotal || 0,
        gstAmount: subscriptionData.gstAmount || 0
      };

      const paymentResponse = await fetch(`${API_BASE_URL}/api/user-payments/save`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentPayload)
      });

      if (!paymentResponse.ok) {
        throw new Error(`Payment save failed! status: ${paymentResponse.status}`);
      }

      const paymentResult = await paymentResponse.json();
      const userPaymentId = paymentResult.id || paymentResult.userPaymentId || paymentResult.paymentId || paymentId;

      const creditExpiryDate = new Date();
      creditExpiryDate.setDate(creditExpiryDate.getDate() + subscriptionData.plan.creditExpirationDays);

      const baseCreditPayload = {
        creditId: 0,
        userId: parseInt(userId),
        creditType: "Subscription",
        availableCredits: subscriptionData.credits,
        usedCredits: 0,
        startDate: startDate.toISOString(),
        endDate: creditExpiryDate.toISOString(),
        createdBy: parseInt(userId),
        updatedBy: parseInt(userId),
        updatedDate: new Date().toISOString(),
        userSubscriptionId: userSubscriptionId,
        userPaymentId: userPaymentId ? userPaymentId.toString() : paymentId
      };

      const baseCreditResponse = await fetch(`${API_BASE_URL}/api/user-credit-points`, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(baseCreditPayload)
      });

      if (subscriptionData.extraCredits && subscriptionData.extraCredits > 0) {
        console.log('Creating extra credits:', subscriptionData.extraCredits);
        
        const extraCreditPaymentPayload = {
          transactionId: paymentId + '_extra',
          userId: parseInt(userId),
          paymentDate: new Date().toISOString(),
          amount: subscriptionData.extraCreditsCost || 0,
          paymentMethod: "Razorpay",
          userSubscriptionId: userSubscriptionId,
          creditId: 0,
          transactionStatus: "completed",
          currency: "INR",
          isPartialPayment: false,
          discountAmount: 0,
          discountCode: "",
          processingDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paymentType: "ExtraCredits"
        };

        const extraPaymentResponse = await fetch(`${API_BASE_URL}/api/user-payments/save`, {
          method: 'POST',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(extraCreditPaymentPayload)
        });

        let extraUserPaymentId = paymentId + '_extra';
        if (extraPaymentResponse.ok) {
          const extraPaymentResult = await extraPaymentResponse.json();
          extraUserPaymentId = extraPaymentResult.id || extraPaymentResult.userPaymentId || extraPaymentResult.paymentId || (paymentId + '_extra');
        }

        const extraCreditPayload = {
          creditId: 0,
          userId: parseInt(userId),
          creditType: "Purchased",
          availableCredits: subscriptionData.extraCredits,
          usedCredits: 0,
          startDate: startDate.toISOString(),
          endDate: creditExpiryDate.toISOString(),
          createdBy: parseInt(userId),
          updatedBy: parseInt(userId),
          updatedDate: new Date().toISOString(),
          userSubscriptionId: userSubscriptionId,
          userPaymentId: extraUserPaymentId.toString()
        };

        const extraCreditResponse = await fetch(`${API_BASE_URL}/api/user-credit-points`, {
          method: 'POST',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(extraCreditPayload)
        });

        if (!extraCreditResponse.ok) {
          console.error('Extra credit creation failed');
        }
      }

      showCustomDialog(`Payment Successful! Your subscription has been activated and ${subscriptionData.totalCredits || subscriptionData.credits} credits have been added to your account.`, 'success');
      setTimeout(() => navigate('/history'), 2000);
      
    } catch (err) {
      console.error('Error in subscription process:', err);
      showCustomDialog(`Error: ${err.message}. Please contact support if payment was deducted.`);
    }
  }, [subscriptionData, getCurrentUserId, getAuthToken, showCustomDialog, navigate]);

  const handleSaveBillingInfo = useCallback(async () => {
    if (!validateBillingForm()) {
      return;
    }

    setSavingBilling(true);
    
    setTimeout(() => {
      setBillingInfoSaved(true);
      setIsEditingBilling(false);
      setSavingBilling(false);
      showCustomDialog('Billing information saved successfully! Proceeding to payment...', 'success');
      
      setTimeout(() => {
        setShowDialog(false);
        processPayment();
      }, 2000);
    }, 1500);
  }, [validateBillingForm, showCustomDialog, processPayment]);

  const handleEditBilling = useCallback(() => {
    setIsEditingBilling(true);
    setBillingInfoSaved(false);
  }, []);

  if (!subscriptionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 py-6 px-4">
      <CustomDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        message={dialogMessage}
        type={dialogType}
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Plans
          </button>
          
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-sm text-gray-600">Complete your purchase securely</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {billingInfoSaved && !isEditingBilling ? (
              <BillingInfoCard 
                billingInfo={billingInfo}
                onEditBilling={handleEditBilling}
              />
            ) : (
              <BillingForm 
                billingInfo={billingInfo}
                onInputChange={handleInputChange}
                onSaveBilling={handleSaveBillingInfo}
                savingBilling={savingBilling}
                subscriptionData={subscriptionData}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-600">Review your purchase</p>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 mb-6 text-center">
                <h4 className="font-bold text-lg capitalize mb-1">
                  {subscriptionData.plan.planName} Plan
                </h4>
                <p className="text-orange-100 text-sm capitalize">
                  {subscriptionData.plan.planDuration} subscription
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Credits:</span>
                  <span className="font-bold text-lg text-orange-600">
                    {subscriptionData.credits}
                  </span>
                </div>
                
                {subscriptionData.extraCredits && subscriptionData.extraCredits > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Extra Credits:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {subscriptionData.extraCredits}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Credits:</span>
                  <span className="font-bold text-xl text-green-600">
                    {subscriptionData.totalCredits || subscriptionData.credits}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Validity:</span>
                  <span className="font-semibold">{subscriptionData.plan.creditExpirationDays} days</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Price:</span>
                  <span className="text-gray-900">₹{subscriptionData.plan.totalPrice.toLocaleString()}</span>
                </div>

                {subscriptionData.extraCredits && subscriptionData.extraCredits > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Extra Credits Cost:</span>
                    <span className="text-gray-900">₹{subscriptionData.extraCreditsCost.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">₹{subscriptionData.subtotal.toLocaleString()}</span>
                </div>

                {subscriptionData.discount && subscriptionData.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-medium">Discount:</span>
                    <span className="text-green-600 font-bold">
                      -₹{subscriptionData.discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="text-gray-900">₹{subscriptionData.gstAmount.toLocaleString()}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Final Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₹{(subscriptionData.finalPrice || subscriptionData.pricing.finalPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-2" />
                  What's Included
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>
                      {subscriptionData.totalCredits || subscriptionData.credits} BOQ Credits
                      {subscriptionData.extraCredits > 0 && (
                        <span className="text-blue-600 ml-1">
                          (includes {subscriptionData.extraCredits} extra)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Instant activation</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Mobile app access</span>
                  </div>
                  {subscriptionData.extraCredits > 0 && (
                    <div className="flex items-center text-blue-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Extra credits at ₹{subscriptionData.plan.extraCreditPrice || 200} per credit</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <Shield className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>SSL secured payment gateway</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <Lock className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                  <span>Your data is encrypted & protected</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                  <Check className="w-3 h-3 text-green-500 mr-1" />
                  30-day money-back guarantee
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
            <p className="text-sm text-gray-600">Your payment information is protected with industry-standard encryption</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <Check className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Instant Activation</h3>
            <p className="text-sm text-gray-600">Your credits will be activated immediately after successful payment</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <CreditCard className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Payment Options</h3>
            <p className="text-sm text-gray-600">Pay using cards, UPI, net banking, or digital wallets</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes scale-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;