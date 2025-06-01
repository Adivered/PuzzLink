import React from 'react';
import { useSelector } from 'react-redux';

const Footer = () => {
  const theme = useSelector((state) => state.theme.current);

  return (
    <footer className={`py-8 w-full mt-auto border-t ${
      theme === 'dark' 
        ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
        : 'bg-gray-50/80 backdrop-blur-sm border-gray-200/50'
    }`}>
      <div className="container mx-auto text-center px-4">
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          &copy; 2024 PuzzLink. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

