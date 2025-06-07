import React, { useState } from 'react';

export const FAQCard = ({ faq, theme, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`group rounded-2xl transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-white/10 hover:bg-white/15 border border-white/20'
          : 'bg-white/70 hover:bg-white/90 border border-white/30'
      } backdrop-blur-sm shadow-lg hover:shadow-xl`}
    >
      <button
        className="w-full p-6 text-left focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold pr-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {faq.question}
          </h3>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded ? 'rotate-180' : ''
          } ${
            theme === 'dark' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            <svg className={`w-4 h-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          <p className={`text-base leading-relaxed ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}; 