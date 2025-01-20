import React from 'react';
import { useSelector } from 'react-redux';

const Footer = () => {
  const theme = useSelector((state) => state.theme.current);

  return (
    <footer className={`py-4 w-full ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <div className="container mx-auto text-center px-4">
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>&copy; 2023 PuzzLink. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

