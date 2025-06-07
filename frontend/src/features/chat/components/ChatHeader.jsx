import React from 'react';
import { MessageCircle, ArrowLeft, Minimize2, X } from 'lucide-react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Chat Header component following Single Responsibility Principle
 * Handles the chat window header with navigation and controls
 */
export const ChatHeader = ({ 
  showConversations,
  currentChatInfo,
  totalUnreadCount,
  hasActiveChat,
  onBackToConversations,
  onMinimize,
  onClose
}) => {
  const { theme } = useThemeManager();
  const isDarkTheme = theme === 'dark';

  const headerClasses = `p-4 border-b flex items-center justify-between ${
    isDarkTheme ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
  }`;

  const buttonClasses = `p-1 rounded transition-colors ${
    isDarkTheme 
      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
  }`;

  const getChatTitle = () => {
    if (showConversations && !hasActiveChat) {
      return 'Messages';
    }
    if (currentChatInfo) {
      const isInRoomLobby = window.location.pathname.startsWith('/rooms/');
      if (currentChatInfo.type === 'room' && isInRoomLobby) {
        return 'Room Chat';
      }
      return currentChatInfo.name;
    }
    return 'Chat';
  };

  return (
    <div className={headerClasses}>
      <div className="flex items-center space-x-2">
        {hasActiveChat && !showConversations && (
          <button
            onClick={onBackToConversations}
            className={buttonClasses}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        
        <MessageCircle size={18} className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'} />
        <h3 className={`font-medium text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          {getChatTitle()}
        </h3>
        
        {totalUnreadCount > 0 && showConversations && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={onMinimize}
          className={buttonClasses}
          aria-label="Minimize chat"
        >
          <Minimize2 size={16} />
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
  );
}; 