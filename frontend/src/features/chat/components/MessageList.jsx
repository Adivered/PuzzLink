import React, { useEffect, useRef, useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * MessageList component following Single Responsibility Principle
 * Handles message display, scrolling behavior, and status indicators
 */
export const MessageList = ({ messages, loading, user, isDarkTheme }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);
  const [hasScrolledToPosition, setHasScrolledToPosition] = useState(false);

  // Track last read message when component first loads
  useEffect(() => {
    if (messages.length > 0 && !lastReadMessageId) {
      // Set the last message as "read" when first opening chat
      const lastMessage = messages[messages.length - 1];
      setLastReadMessageId(lastMessage._id || lastMessage.tempId);
    }
  }, [messages, lastReadMessageId]);

  // Scroll to last read message position on initial load
  useEffect(() => {
    if (lastReadMessageId && !hasScrolledToPosition && messagesContainerRef.current) {
      const messageElement = document.querySelector(`[data-message-id="${lastReadMessageId}"]`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        setHasScrolledToPosition(true);
      } else if (messagesEndRef.current) {
        // Fallback to bottom if specific message not found
        messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        setHasScrolledToPosition(true);
      }
    }
  }, [lastReadMessageId, hasScrolledToPosition, messages]);

  // Auto-scroll for new messages (user's own messages always, others only if near bottom)
  useEffect(() => {
    if (messages.length > 0 && hasScrolledToPosition && messagesContainerRef.current) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage.sender?._id === user?.id || lastMessage.senderId === user?.id;
      
      if (isOwnMessage) {
        // Always scroll for user's own messages
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest'
          });
          setLastReadMessageId(lastMessage._id || lastMessage.tempId);
        }
             } else {
         // For received messages, scroll if user is near bottom or if no previous scroll interaction
         const container = messagesContainerRef.current;
         const { scrollTop, scrollHeight, clientHeight } = container;
         const isNearBottom = scrollHeight - scrollTop - clientHeight < 150; // Increased threshold
         
         // Always scroll for received messages if user is near bottom
         if (isNearBottom && messagesEndRef.current) {
           messagesEndRef.current.scrollIntoView({ 
             behavior: 'smooth',
             block: 'end',
             inline: 'nearest'
           });
           setLastReadMessageId(lastMessage._id || lastMessage.tempId);
         }
       }
    }
  }, [messages, hasScrolledToPosition, user?.id]);

  // Update last read message when user scrolls near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        setLastReadMessageId(lastMessage._id || lastMessage.tempId);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
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
    
    const currentDate = new Date(currentMessage.createdAt || currentMessage.timestamp);
    const previousDate = new Date(previousMessage.createdAt || previousMessage.timestamp);
    
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
    const currentSenderId = currentMessage.sender?._id || currentMessage.senderId;
    const previousSenderId = previousMessage.sender?._id || previousMessage.senderId;
    const timeDiff = new Date(currentMessage.createdAt || currentMessage.timestamp) - 
                    new Date(previousMessage.createdAt || previousMessage.timestamp);
    
    return (
      currentSenderId === previousSenderId &&
      timeDiff < 5 * 60 * 1000 // 5 minutes
    );
  };

  const getMessageStatus = (message) => {
    const isOwnMessage = message.sender?._id === user?.id || message.senderId === user?.id;
    if (!isOwnMessage) return null;
    
    if (message.isOptimistic && message.tempId) {
      return 'sending';
    } else if (message.isSent === true) {
      return 'sent';
    } else if (!message.isOptimistic && message._id) {
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
        const isOwnMessage = message.sender?._id === user?.id || message.senderId === user?.id;
        const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
        const isGrouped = shouldGroupMessage(message, previousMessage);
        const messageStatus = getMessageStatus(message);
        const messageTimestamp = message.createdAt || message.timestamp;
        const senderInfo = message.sender || { _id: message.senderId, name: 'Unknown' };

        return (
          <div key={message._id || message.tempId || index} data-message-id={message._id || message.tempId}>
            {/* Date Separator */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <div className={`px-3 py-1 rounded-full text-xs ${
                  isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}>
                  {formatDateSeparator(messageTimestamp)}
                </div>
              </div>
            )}

            {/* Message */}
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
              <div className={`flex items-end space-x-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isOwnMessage && !isGrouped && (
                  <div className="flex-shrink-0">
                    {senderInfo.picture ? (
                      <img
                        src={senderInfo.picture}
                        alt={senderInfo.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        isDarkTheme ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {senderInfo.name?.charAt(0)?.toUpperCase() || '?'}
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
                      {senderInfo.name}
                    </span>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-full break-words ${
                      isOwnMessage
                        ? isDarkTheme
                          ? message.isOptimistic === true
                            ? 'bg-blue-700 text-white opacity-75' 
                            : 'bg-blue-600 text-white'
                          : message.isOptimistic === true
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
                          alt="Shared content"
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
                      isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(messageTimestamp)}
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