import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Chat Icon component following Single Responsibility Principle
 * Handles the floating chat icon display with unread count
 */
export const ChatIcon = ({ onClick, totalUnreadCount }) => {
  const { theme } = useThemeManager();
  const isDarkTheme = theme === 'dark';

  const buttonClasses = `relative p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
    isDarkTheme 
      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
      : 'bg-blue-500 hover:bg-blue-600 text-white'
  }`;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={onClick}
        className={buttonClasses}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </button>
    </div>
  );
}; 