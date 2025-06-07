import React, { useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { MessageList } from './MessageList';

/**
 * Chat Window component following Single Responsibility Principle
 * Orchestrates chat display with header, messages, and input
 * Accepts theme as prop to avoid prop drilling in children
 */
export const ChatWindow = ({
  // Chat data
  chatInfo,
  onlineCount,
  messages,
  loading,
  currentChatId,
  user,
  isDarkTheme,
  
  // Input state and handlers
  messageText,
  onInputChange,
  onSendMessage
}) => {
  const messageInputRef = useRef(null);

  const handleInputChange = (e) => {
    onInputChange(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentChatId) return;

    const success = await onSendMessage(messageText);
    
    if (success && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Don't render if no current chat
  if (!currentChatId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-lg mb-2">💬</p>
          <p className="text-sm">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      {chatInfo && (
        <div className={`p-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            {chatInfo.avatar ? (
              <img
                src={chatInfo.avatar}
                alt={chatInfo.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isDarkTheme ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'
              }`}>
                {chatInfo.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className={`font-medium text-sm ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  {chatInfo.name}
                </h4>
                {loading.messages && messages.length > 0 && (
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isDarkTheme ? 'bg-blue-400' : 'bg-blue-500'
                  }`} title="Loading new messages..." />
                )}
              </div>
              <div className="flex items-center space-x-2">
                {chatInfo.isOnline && (
                  <p className={`text-xs ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                    Online
                  </p>
                )}
                {onlineCount > 0 && (
                  <>
                    {chatInfo.isOnline && <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>•</span>}
                    <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                      {onlineCount} {onlineCount === 1 ? 'person' : 'people'} online
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          loading={loading.messages && messages.length === 0}
          user={user}
          isDarkTheme={isDarkTheme}
        />
      </div>

      {/* Message Input */}
      <div className={`p-3 border-t ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className={`w-full px-3 py-2 text-sm rounded-lg border resize-none transition-colors ${
                isDarkTheme 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
              } focus:outline-none focus:ring-1 focus:ring-blue-500`}
              style={{ minHeight: '38px', maxHeight: '100px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
              }}
            />
          </div>
          
          <button
            type="button"
            className={`p-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'hover:bg-gray-600 text-gray-300' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Add emoji"
          >
            <Smile size={20} />
          </button>
          
          <button
            type="submit"
            disabled={!messageText.trim() || loading.sending}
            className={`p-2 rounded-lg transition-colors ${
              messageText.trim() && !loading.sending
                ? isDarkTheme 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                : isDarkTheme 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}; 