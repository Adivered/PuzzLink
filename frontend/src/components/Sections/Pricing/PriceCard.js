import React from 'react';
import CheckIcon from '../../common/Icons/CheckIcon';

export const PriceCard = ({ plan, theme }) => (
  <div className={`price-card opacity-0 p-8 rounded-lg shadow-lg flex flex-col ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
    <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
    <p className="text-4xl font-bold mb-6">{plan.price}</p>
    <ul className="mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-center mb-2">
          <CheckIcon />
          {feature}
        </li>
      ))}
    </ul>
    <button className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition duration-300">
      Choose Plan
    </button>
  </div>
);