import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsCheckLg,
  BsHourglass,
  BsArrowRightShort,
  BsGraphUp,
  BsStars,
  BsPencilSquare
} from 'react-icons/bs';
import { FaStar } from "react-icons/fa";

const StepperPage = ({ currentStep = 1, onStepClick }) => {
  const navigate = useNavigate();

  const steps = [
    { 
      id: 1, 
      name: 'ESTIMATE', 
      path: '/estimate', 
      icon: <BsCheckLg className="w-5 h-5" />, 
      activeIcon: <BsHourglass className="w-5 h-5 animate-pulse" /> 
    },
    { 
      id: 2, 
      name: 'SUB-ESTIMATE', 
      path: '/subestimate', 
      icon: <BsHourglass className="w-5 h-5" />, 
      activeIcon: <BsHourglass className="w-5 h-5 animate-pulse" /> 
    },
    { 
      id: 3, 
      name: 'LEAD', 
      path: '/lead', 
      icon: <BsArrowRightShort className="w-5 h-5 " />, 
      activeIcon: <BsArrowRightShort className="w-5 h-5 " />, 
      disabled: false
    },
    { 
      id: 4, 
      name: 'ROYALTY', 
      path: '/royalty', 
      icon: <BsGraphUp className="w-5 h-5 " />, 
      activeIcon: <BsGraphUp className="w-5 h-5 " />, 
      disabled: false
    },
    { 
      id: 5, 
      name: 'MAT', 
      path: '/mat', 
      icon: <FaStar className="w-5 h-5 " />, 
      activeIcon: <BsStars className="w-5 h-5 " />, 
      disabled: false
    },
    { 
      id: 6, 
      name: 'CMT/QTY', 
      path: '/cmt-qty', 
      icon: <FaStar className="w-5 h-5 " />, 
      activeIcon: <BsStars className="w-5 h-5 " />, 
      disabled: false
    },
    { 
      id: 7, 
      name: 'REVIEW', 
      path: '/pdf-preview', 
      icon: <BsPencilSquare className="w-5 h-5" />, 
      activeIcon: <BsPencilSquare className="w-5 h-5" /> 
    }
  ];

  const getStepStatus = (stepId) => {
    // Check current page location
    const isOnEstimatePage = window.location.pathname === '/estimate';
    const isOnSubestimatePage = window.location.pathname === '/subestimate';
    const isOnLeadPage = window.location.pathname === '/lead';
    const isOnRoyaltyPage = window.location.pathname === '/royalty';
    const isOnMatPage = window.location.pathname === '/mat';
    const isOnCmtQtyPage = window.location.pathname === '/cmt-qty';
    const isOnReviewPage = window.location.pathname === '/pdf-preview';
    
    if (isOnEstimatePage) {
      if (stepId === 1) return 'current';
      return 'pending';
    } else if (isOnSubestimatePage) {
      if (stepId === 1) return 'completed';
      if (stepId === 2) return 'current';
      return 'pending';
    } else if (isOnLeadPage) {
      if (stepId === 1 || stepId === 2) return 'completed';
      if (stepId === 3) return 'current';
      return 'pending';
    } else if (isOnRoyaltyPage) {
      if (stepId === 1 || stepId === 2 || stepId === 3) return 'completed';
      if (stepId === 4) return 'current';
      return 'pending';
    } else if (isOnMatPage) {
      if (stepId === 1 || stepId === 2 || stepId === 3 || stepId === 4) return 'completed';
      if (stepId === 5) return 'current';
      return 'pending';
    } else if (isOnCmtQtyPage) {
      if (stepId === 1 || stepId === 2 || stepId === 3 || stepId === 4 || stepId === 5) return 'completed';
      if (stepId === 6) return 'current';
      return 'pending';
    } else if (isOnReviewPage) {
      if (stepId === 1 || stepId === 2 || stepId === 3 || stepId === 4 || stepId === 5 || stepId === 6) return 'completed';
      if (stepId === 7) return 'current';
      return 'pending';
    } else {
      if (stepId < currentStep) return 'completed';
      if (stepId === currentStep) return 'current';
      return 'pending';
    }
  };

  const getBackgroundColor = (status, disabled) => {
    if (disabled) return 'bg-gray-200 text-gray-400';
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-orange-400 text-white';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  const getArrowColor = (status, disabled) => {
    if (disabled) return '#d1d5db';
    switch (status) {
      case 'completed': return '#10b981';
      case 'current': return '#fb923c';
      default: return '#d1d5db';
    }
  };

  const handleStepClick = (step) => {
    if (onStepClick && typeof onStepClick === 'function') {
      try {
        onStepClick(step.id);
      } catch (error) {
        console.warn("Error in onStepClick callback:", error);
        handleDefaultNavigation(step);
      }
      return;
    }

    handleDefaultNavigation(step);
  };

  const handleDefaultNavigation = (step) => {
    if (!step.disabled) {
      const currentPath = window.location.pathname;
      const isOnReviewPage = currentPath === '/pdf-preview';
      
      // If we're on the review page, allow navigation to any previous step
      if (isOnReviewPage && step.id < 7) {
        navigate(step.path);
        return;
      }
      
      // For other pages, apply the original logic
      if (step.id === 1 && currentPath !== '/estimate') {
        navigate(step.path);
      } else if (step.id === 2) {
        // Only check for workOrderId and reviseId if NOT coming from review page
        if (!isOnReviewPage) {
          const workOrderId = localStorage.getItem("workOrderId");
          const reviseId = localStorage.getItem("reviseId");
          
          if (workOrderId && reviseId) {
            navigate(step.path);
          } else if (currentPath !== '/subestimate') {
            console.warn("Please complete the estimate first");
            alert("Please complete the estimate first");
          }
        } else {
          // From review page, allow direct navigation
          navigate(step.path);
        }
      } else if (step.id === 3 && currentPath !== '/lead') {
        navigate(step.path);
      } else if (step.id === 4 && currentPath !== '/royalty') {
        navigate(step.path);
      } else if (step.id === 5 && currentPath !== '/mat') {
        navigate(step.path);
      } else if (step.id === 6 && currentPath !== '/cmt-qty') {
        navigate(step.path);
      } else if (step.id === 7) {
        navigate(step.path);
      }
    }
  };

  return (
    <div className="w-full flex flex-row justify-between items-center">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const bgColor = getBackgroundColor(status, step.disabled);
        const arrowColor = getArrowColor(status, step.disabled);
        const isClickable = !step.disabled;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`relative group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleStepClick(step)}
            >
              <div
                className={`flex items-center ${bgColor} px-4 py-2 rounded-r-md transition-all duration-300 ${
                  index === 0 ? 'rounded-l-md' : ''
                }`}
              >
                <div className="mr-2">
                  {status === 'current' && !step.disabled ? step.activeIcon : step.icon}
                </div>
                <span className="font-bold">{step.name}</span>
              </div>

              {/* Tooltip */}
              {isClickable && (
                <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1 whitespace-nowrap z-50">
                  {status === 'completed'
                    ? 'View completed step'
                    : status === 'current'
                    ? 'Current step'
                    : 'Go to step'}
                </div>
              )}
            </div>

            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div
                className="w-0 h-0 border-y-8 border-y-transparent border-l-8 z-10"
                style={{ 
                  borderLeftColor: arrowColor
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepperPage;