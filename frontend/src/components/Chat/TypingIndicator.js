import React from 'react';
import { useSelector } from 'react-redux';

const TypingIndicator = () => {
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const { activeConversation, activeRoom, typingUsers } = useSelector((state) => state.chat);

  const isDarkTheme = theme === 'dark';
  const currentChatId = activeConversation || activeRoom;
  const currentTypingUsers = currentChatId ? typingUsers[currentChatId] || [] : [];

  // Filter out current user from typing users
  const otherTypingUsers = currentTypingUsers.filter(typingUser => typingUser.userId !== user._id);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0].userName} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing...`;
    } else {
      return `${otherTypingUsers[0].userName} and ${otherTypingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '150ms' }}></div>
          <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkTheme ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className={`text-xs italic ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {getTypingText()}
        </span>
      </div>
    </div>
  );
};

export default TypingIndicator; 