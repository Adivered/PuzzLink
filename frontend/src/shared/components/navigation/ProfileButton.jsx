import React from 'react';
import { useThemeManager } from '../../hooks/useThemeManager';

/**
 * Profile Button component following Single Responsibility Principle
 * Handles user profile button display and avatar rendering
 */
export const ProfileButton = ({ user, onClick }) => {
  const { theme } = useThemeManager();

  const buttonClasses = `w-8 h-8 rounded-full border-2 transition-colors ${
    theme === 'dark' 
      ? 'border-gray-600 hover:border-gray-500' 
      : 'border-gray-300 hover:border-gray-400'
  }`;

  const avatarClasses = `w-full h-full rounded-full flex items-center justify-center text-xs font-bold ${
    theme === 'dark' 
      ? 'bg-gray-700 text-gray-200' 
      : 'bg-gray-200 text-gray-700'
  }`;

  return (
    <button
      onClick={onClick}
      className={buttonClasses}
      aria-label="Open profile menu"
    >
      {user.picture ? (
        <img 
          src={user.picture} 
          alt="Profile" 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className={avatarClasses}>
          {user.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
    </button>
  );
}; 