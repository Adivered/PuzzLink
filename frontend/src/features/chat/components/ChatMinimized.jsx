import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Chat Minimized component following Single Responsibility Principle
 * Handles the minimized chat display
 */
export const ChatMinimized = ({ 
  chatTitle, 
  totalUnreadCount, 
  onExpand, 
  onClose 
}) => {
  const { theme } = useThemeManager();
  const isDarkTheme = theme === 'dark';

  const containerClasses = `p-3 rounded-t-lg shadow-lg cursor-pointer transition-all duration-300 ${
    isDarkTheme 
      ? 'bg-gray-800 border border-gray-700 text-white' 
      : 'bg-white border border-gray-300 text-gray-800'
  }`;

  const buttonClasses = `p-1 rounded hover:bg-opacity-20 ${
    isDarkTheme ? 'hover:bg-white' : 'hover:bg-black'
  }`;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className={containerClasses}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExpand}
            className="flex items-center space-x-2 flex-1"
            aria-label="Expand chat"
          >
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{chatTitle}</span>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className={buttonClasses}
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}; 