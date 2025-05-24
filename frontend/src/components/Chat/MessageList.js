import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { format, isToday, isYesterday } from 'date-fns';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const MessageList = ({ messages, loading }) => {
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isDarkTheme = theme === 'dark';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM dd, HH:mm');
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM dd, yyyy');
    }
  };

  const shouldGroupMessage = (currentMessage, previousMessage) => {
    if (!previousMessage) return false;
    
    // Group if same sender and within 5 minutes
    const timeDiff = new Date(currentMessage.createdAt) - new Date(previousMessage.createdAt);
    return (
      currentMessage.sender._id === previousMessage.sender._id &&
      timeDiff < 5 * 60 * 1000 // 5 minutes
    );
  };

  const getMessageStatus = (message) => {
    const isOwnMessage = message.sender._id === user.id;
    if (!isOwnMessage) return null;
    
    if (message.isOptimistic) {
      return 'sending';
    } else if (message.isSent || !message.isOptimistic) {
      return 'sent';
    } else {
      return 'delivered';
    }
  };

  const renderMessageStatus = (status) => {
    if (!status) return null;
    
    switch (status) {
      case 'sending':
        return (
          <Clock className={`w-3 h-3 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
        );
      case 'sent':
        return (
          <CheckCircle className={`w-3 h-3 ${isDarkTheme ? 'text-green-400' : 'text-green-500'}`} />
        );
      case 'delivered':
        return (
          <CheckCircle className={`w-3 h-3 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
        );
      case 'failed':
        return (
          <AlertCircle className={`w-3 h-3 ${isDarkTheme ? 'text-red-400' : 'text-red-500'}`} />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading messages...
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-lg mb-2">💬</p>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={messagesContainerRef}
      className="h-full overflow-y-auto p-4 space-y-1"
    >
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const isOwnMessage = message.sender._id === user.id;
        const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
        const isGrouped = shouldGroupMessage(message, previousMessage);
        const messageStatus = getMessageStatus(message);

        return (
          <div key={message._id || message.tempId}>
            {/* Date Separator */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {formatDateSeparator(message.createdAt)}
                </div>
              </div>
            )}

            {/* Message */}
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
              <div className={`flex items-end space-x-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isOwnMessage && !isGrouped && (
                  <div className="flex-shrink-0">
                    {message.sender.picture ? (
                      <img
                        src={message.sender.picture}
                        alt={message.sender.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isDarkTheme ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {message.sender.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}

                {/* Spacer for grouped messages */}
                {!isOwnMessage && isGrouped && (
                  <div className="w-6"></div>
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {/* Sender name for non-grouped messages */}
                  {!isOwnMessage && !isGrouped && (
                    <span className={`text-xs mb-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      {message.sender.name}
                    </span>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-full break-words ${
                      isOwnMessage
                        ? isDarkTheme
                          ? message.isOptimistic 
                            ? 'bg-blue-700 text-white opacity-75' 
                            : 'bg-blue-600 text-white'
                          : message.isOptimistic 
                            ? 'bg-blue-400 text-white opacity-75' 
                            : 'bg-blue-500 text-white'
                        : isDarkTheme
                          ? 'bg-gray-700 text-gray-200'
                          : 'bg-gray-200 text-gray-800'
                    } ${
                      isGrouped
                        ? isOwnMessage
                          ? 'rounded-br-sm'
                          : 'rounded-bl-sm'
                        : ''
                    }`}
                  >
                    {message.messageType === 'system' ? (
                      <span className="italic text-sm">{message.content}</span>
                    ) : message.messageType === 'image' ? (
                      <div>
                        <img
                          src={message.content}
                          alt="Shared image"
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    ) : (
                      <span className="text-sm whitespace-pre-wrap">{message.content}</span>
                    )}
                  </div>

                  {/* Timestamp and Status */}
                  <div className={`flex items-center space-x-1 mt-1 ${
                    isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <span className={`text-xs ${
                      isDarkTheme ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </span>
                    {isOwnMessage && renderMessageStatus(messageStatus)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 