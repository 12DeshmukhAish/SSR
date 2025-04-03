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

const StepperPage = ({ currentStep = 1 }) => {
  const navigate = useNavigate();

  const steps = [
    { id: 1, name: 'ESTIMATE', path: '/estimate', icon: <BsCheckLg className="w-5 h-5" />, activeIcon: <BsCheckLg className="w-5 h-5" /> },
    { id: 2, name: 'SUB-ESTIMATE', path: '/subestimate', icon: <BsHourglass className="w-5 h-5" />, activeIcon: <BsHourglass className="w-5 h-5 animate-pulse" /> },
    { id: 3, name: 'LEAD', path: '/lead', icon: <BsArrowRightShort className="w-5 h-5" />, activeIcon: <BsArrowRightShort className="w-5 h-5" /> },
    { id: 4, name: 'ROYALTY', path: '/royalty', icon: <BsGraphUp className="w-5 h-5" />, activeIcon: <BsGraphUp className="w-5 h-5" /> },
    { id: 5, name: 'MAT', path: '/mat', icon: <FaStar  className="w-5 h-5" />, activeIcon: <BsStars className="w-5 h-5" /> },
    { id: 6, name: 'CMT/QTY', path: '/cmt-qty', icon: <FaStar  className="w-5 h-5" />, activeIcon: <BsStars className="w-5 h-5" /> },
    { id: 7, name: 'REVIEW', path: '/pdf-preview', icon: <BsPencilSquare className="w-5 h-5" />, activeIcon: <BsPencilSquare className="w-5 h-5" /> }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getBackgroundColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'current': return 'bg-orange-400 text-white';
      default: return 'bg-gray-300 text-gray-600';
    }
  };

  const handleStepClick = (step) => {
    if (step.id <= currentStep + 1) {
      navigate(step.path);
    }
  };

  return (
    <div className="w-full flex flex-row justify-between items-center">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const bgColor = getBackgroundColor(status);
        const isClickable = step.id <= currentStep + 1;

        return (
          <React.Fragment key={step.id}>
            <div
              className={`relative group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              onClick={() => handleStepClick(step)}
            >
              <div
                className={`flex items-center ${bgColor} px-4 py-2 rounded-r-md transition-all duration-300 ${index === 0 ? 'rounded-l-md' : ''}`}
              >
                <div className="mr-2">
                  {status === 'current' ? step.activeIcon : step.icon}
                </div>
                <span className="font-bold">{step.name}</span>
              </div>

              {isClickable && (
                <div className="absolute left-0 -bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1 whitespace-nowrap">
                  {status === 'completed' ? 'View completed step' :
                    status === 'current' ? 'Current step' :
                      'Go to next step'}
                </div>
              )}
            </div>

            {index < steps.length - 1 && (
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-8 border-l-current z-10"
                style={{ color: getBackgroundColor(status).split(' ')[0].replace('bg-', '') }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepperPage;
