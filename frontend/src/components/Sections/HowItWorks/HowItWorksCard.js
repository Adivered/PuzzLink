import React from 'react';

export const HowItWorksCard = ({ step, index, theme }) => (
  <div className={`step-${index} flex flex-col items-center w-64`}>
    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
      {index + 1}
    </div>
    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
    <p className={`text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
      {step.description}
    </p>
  </div>
);