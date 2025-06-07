import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Game Layout component - provides common structure for all game types
 * Handles theming and common game UI patterns
 */
export const GameLayout = ({ 
  children, 
  className = '',
  fullScreen = true,
  background = 'default'
}) => {
  const theme = useSelector((state) => state.theme.current);
  
  const getBackgroundClasses = () => {
    const baseClasses = fullScreen ? 'h-[calc(100vh-4rem)] w-full mt-16' : 'h-full w-full';
    
    switch (background) {
      case 'whiteboard':
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`;
      case 'puzzle':
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`;
      case 'error':
        return `${baseClasses} flex items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`;
      default:
        return `${baseClasses} ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`;
    }
  };

  return (
    <div className={`${getBackgroundClasses()} ${className}`}>
      {children}
    </div>
  );
};

export default GameLayout; 