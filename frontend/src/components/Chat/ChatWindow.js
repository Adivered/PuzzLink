import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Send, Smile } from 'lucide-react';
import { fetchMessages, sendMessage, resetUnreadCount } from '../../store/chatSlice';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import socketService from '../../services/socketService';

const ChatWindow = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const { 
    activeConversation, 
    activeRoom, 
    messages, 
    loading,
    conversations 
  } = useSelector((state) => state.chat);

  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const isDarkTheme = theme === 'dark';
  const currentChatId = activeConversation || activeRoom;
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  // Get current conversation/room info
  const getCurrentChatInfo = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c._id === activeConversation);
      if (conversation) {
        const otherUser = conversation.participants.find(p => p._id !== user._id);
        return {
          name: conversation.isGroup ? conversation.groupName : otherUser?.name,
          avatar: conversation.isGroup ? conversation.groupAvatar : otherUser?.picture,
          isOnline: otherUser ? true : false, // You can implement online status logic here
          type: 'conversation'
        };
      }
    }
    
    if (activeRoom) {
      return {
        name: 'Room Chat',
        avatar: null,
        isOnline: true,
        type: 'room'
      };
    }
    
    return null;
  };

  const chatInfo = getCurrentChatInfo();

  // Fetch messages when active chat changes
  useEffect(() => {
    if (currentChatId) {
      if (activeConversation) {
        dispatch(fetchMessages({ conversationId: activeConversation }));
        socketService.joinConversation(activeConversation);
        dispatch(resetUnreadCount({ conversationId: activeConversation }));
      } else if (activeRoom) {
        dispatch(fetchMessages({ roomId: activeRoom }));
        socketService.joinRoom(activeRoom);
        dispatch(resetUnreadCount({ roomId: activeRoom }));
      }
    }
  }, [dispatch, activeConversation, activeRoom, currentChatId]);

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!isTyping && currentChatId) {
      setIsTyping(true);
      socketService.startTyping({
        conversationId: activeConversation,
        roomId: activeRoom,
        userId: user._id,
        userName: user.name
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      socketService.stopTyping({
        conversationId: activeConversation,
        roomId: activeRoom,
        userId: user._id
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    if (e.target.value.trim() && !isTyping) {
      handleTypingStart();
    } else if (!e.target.value.trim() && isTyping) {
      handleTypingStop();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentChatId) return;

    const messageData = {
      content: messageText.trim(),
      conversationId: activeConversation,
      roomId: activeRoom,
      messageType: 'text'
    };

    try {
      // Send via Redux action (which will also send via API)
      await dispatch(sendMessage(messageData)).unwrap();
      
      // Also send via socket for real-time delivery
      socketService.sendMessage({
        ...messageData,
        senderId: user._id
      });

      setMessageText('');
      handleTypingStop();
      
      // Focus back on input
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

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
            <div>
              <h4 className={`font-medium text-sm ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                {chatInfo.name}
              </h4>
              {chatInfo.isOnline && (
                <p className={`text-xs ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                  Online
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={currentMessages} loading={loading.messages} />
        <TypingIndicator />
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

export default ChatWindow; 