import React from 'react';

export const FeatureCard = ({ feature, theme }) => (
  <div className={`feature opacity-0 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
    <div className="text-4xl mb-4">{feature.icon}</div>
    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
  </div>
);