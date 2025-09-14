import React, { useState, useEffect, useRef } from 'react';

const DatePicker = ({ onDateRangeSelect, onClose }) => {
  const [selectedMonth, setSelectedMonth] = useState(1); // 0-based, 1 = February
  const [selectedYear, setSelectedYear] = useState(2025);
  const [startDate, setStartDate] = useState('25');
  const [endDate, setEndDate] = useState('25');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);
  
  const months = [
    { name: 'Feb 2025', days: 28 },
    { name: 'Mar 2025', days: 31 }
  ];
  
  const generateCalendarDays = (month, year) => {
    const daysInMonth = month === 1 ? 28 : 31; // Simplified for Feb & Mar
    const firstDay = month === 1 ? 4 : 5; // Thu for Feb, Fri for Mar (2025)
    
    // Generate previous month days for filling the calendar start
    const prevMonthDays = [];
    const prevMonthLength = month === 1 ? 31 : 28; // Jan = 31, Feb = 28
    for (let i = 0; i < firstDay; i++) {
      prevMonthDays.push({
        day: prevMonthLength - firstDay + i + 1,
        current: false
      });
    }
    
    // Generate current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        current: true
      });
    }
    
    // Generate next month days to fill the calendar
    const nextMonthDays = [];
    const totalDaysSoFar = prevMonthDays.length + currentMonthDays.length;
    const daysToAdd = 42 - totalDaysSoFar;
    for (let i = 1; i <= daysToAdd; i++) {
      nextMonthDays.push({
        day: i,
        current: false
      });
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const handleDateClick = (day, monthIndex) => {
    if (!startDate) {
      setStartDate(day);
      setSelectedMonth(monthIndex);
    } else if (!endDate) {
      setEndDate(day);
      onDateRangeSelect(`${selectedYear}-0${selectedMonth + 1}-${startDate} - ${selectedYear}-0${monthIndex + 1}-${day}`);
    } else {
      setStartDate(day);
      setEndDate('');
      setSelectedMonth(monthIndex);
    }
  };
  
  const handlePrevMonth = () => {
    if (selectedMonth > 0) setSelectedMonth(selectedMonth - 1);
  };
  
  const handleNextMonth = () => {
    if (selectedMonth < months.length - 1) setSelectedMonth(selectedMonth + 1);
  };
  
  const handleVerticalScroll = (e) => {
    setScrollPosition(e.target.scrollTop);
  };
  
  const handleApply = () => {
    if (startDate && endDate) {
      onDateRangeSelect(`${selectedYear}-0${selectedMonth + 1}-${startDate} - ${selectedYear}-0${selectedMonth + 1}-${endDate}`);
      onClose();
    }
  };
  
  // Render the calendar grid for each month
  const renderCalendarGrid = (monthIndex) => {
    const days = generateCalendarDays(monthIndex, selectedYear);
    const isSelectedMonth = selectedMonth === monthIndex;
    
    return (
      <div className="w-full">
        <div className="grid grid-cols-7 mb-2">
          <div className="text-center text-sm font-medium">Su</div>
          <div className="text-center text-sm font-medium">Mo</div>
          <div className="text-center text-sm font-medium">Tu</div>
          <div className="text-center text-sm font-medium">We</div>
          <div className="text-center text-sm font-medium">Th</div>
          <div className="text-center text-sm font-medium">Fr</div>
          <div className="text-center text-sm font-medium">Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.slice(0, 42).map((day, index) => (
            <div 
              key={index}
              className={`text-center p-1 text-sm rounded cursor-pointer
                ${day.current ? 'hover:bg-gray-200' : 'text-gray-400'}
                ${day.day === parseInt(startDate) && isSelectedMonth ? 'bg-blue-500 text-white' : ''}
                ${day.day === parseInt(endDate) && isSelectedMonth ? 'bg-blue-500 text-white' : ''}
              `}
              onClick={() => day.current && handleDateClick(day.day, monthIndex)}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4" style={{ width: '600px' }}>
      {/* Month Navigation */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <button onClick={handlePrevMonth} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="font-medium mx-2">
            {months[0].name}
          </div>
          <button onClick={handleNextMonth} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex items-center">
          <button onClick={handlePrevMonth} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="font-medium mx-2">
            {months[1].name}
          </div>
          <button onClick={handleNextMonth} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar Container with Vertical Scrollbar */}
      <div className="flex space-x-4 relative">
        {/* Left Calendar */}
        <div className="w-1/2 max-h-64 overflow-y-auto scrollbar-thin" 
             ref={scrollContainerRef}
             onScroll={handleVerticalScroll}>
          {renderCalendarGrid(0)}
        </div>
        
        {/* Vertical Scrollbar */}
        <div className="absolute h-64 w-1 bg-gray-200 left-1/2 transform -translate-x-2 rounded-full">
          <div 
            className="w-3 h-12 bg-gray-400 rounded-full -ml-1 cursor-pointer hover:bg-gray-500"
            style={{ 
              top: `${(scrollPosition / (scrollContainerRef.current?.scrollHeight || 1)) * 100}%`,
              position: 'absolute'
            }}
          ></div>
        </div>
        
        {/* Right Calendar */}
        <div className="w-1/2 max-h-64 overflow-y-auto scrollbar-thin">
          {renderCalendarGrid(1)}
        </div>
      </div>
      
      {/* Apply Button */}
      <div className="flex justify-end mt-4">
        <button 
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DatePicker;