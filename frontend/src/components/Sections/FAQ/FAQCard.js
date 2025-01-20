import React from 'react';

export const FAQCard = ({ faq, theme }) => (
  <div className={`faq-item opacity-0 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
    <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{faq.answer}</p>
  </div>
);