import React from 'react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Login Layout component following Single Responsibility Principle
 * Provides consistent layout structure for login pages
 */
export const LoginLayout = ({ children, formRef }) => {
  const { theme } = useThemeManager();

  const containerClasses = `min-h-screen w-full flex items-center justify-center p-4 ${
    theme === 'dark' ? 'bg-gray-900' : 'bg-white'
  }`;

  const cardClasses = `max-w-md w-full p-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:shadow-3xl flex flex-col justify-center ${
    theme === 'dark' 
      ? 'bg-gray-800 border border-gray-700' 
      : 'bg-white border border-gray-200'
  }`;

  return (
    <div className={containerClasses}>
      <div ref={formRef} className={cardClasses}>
        {children}
      </div>
    </div>
  );
}; 