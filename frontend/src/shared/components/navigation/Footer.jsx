import React from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';

/**
 * Footer component following Single Responsibility Principle
 * Handles application footer display with consistent theming
 */
export const Footer = () => {
  const { theme } = useThemeManager();
  
  const footerClasses = `py-8 w-full mt-auto border-t ${
    theme === 'dark' 
      ? 'bg-gray-800/80 backdrop-blur-sm border-gray-700/50' 
      : 'bg-gray-50/80 backdrop-blur-sm border-gray-200/50'
  }`;

  const textClasses = `text-sm ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  }`;

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto text-center px-4">
        <p className={textClasses}>
          &copy; 2024 PuzzLink. All rights reserved.
        </p>
      </div>
    </footer>
  );
}; 