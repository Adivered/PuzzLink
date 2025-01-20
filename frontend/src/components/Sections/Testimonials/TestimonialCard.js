import React from 'react';

export const TestimonialCard = ({ testimonial, theme }) => (
  <div className={`testimonial opacity-0 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
    <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>"{testimonial.quote}"</p>
    <div className="flex items-center">
      <div className="w-12 h-12 bg-blue-500 rounded-full mr-4"></div>
      <div>
        <h4 className="font-semibold">{testimonial.name}</h4>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>{testimonial.role}</p>
      </div>
    </div>
  </div>
);