import React from 'react';

const PopupButton = ({ onClick, variant = 'primary', children }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors duration-200';
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: theme => theme === 'dark' 
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

export default PopupButton;