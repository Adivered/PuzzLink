import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Minimize2, X, Users } from 'lucide-react';
import { toggleChat, minimizeChat, closeChat, openChat } from '../../store/chatSlice';
import ChatWindow from './ChatWindow';
import ConversationList from './ConversationList';

const FloatingChat = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const { 
    isOpen, 
    isMinimized, 
    unreadCounts, 
    activeConversation, 
    activeRoom, 
    conversations, 
    roomDetails 
  } = useSelector((state) => state.chat);
  const [showConversations, setShowConversations] = useState(true);

  const isDarkTheme = theme === 'dark';

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // Get current chat title
  const getCurrentChatTitle = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c._id === activeConversation);
      if (conversation) {
        if (conversation.isGroup) {
          return conversation.groupName || 'Group Chat';
        } else {
          const otherUser = conversation.participants.find(p => p._id !== user._id);
          return otherUser?.name || 'Chat';
        }
      }
    }
    
    if (activeRoom) {
      const roomData = roomDetails[activeRoom];
      
      // If we have room details, use them
      if (roomData) {
        return roomData.name;
      }
      
      // Fallback to checking if it's the Home room
      if (activeRoom === user?.homeRoomId) {
        return 'Home';
      }
      
      // Default fallback
      return 'Room Chat';
    }
    
    return 'Chat';
  };

  const chatTitle = getCurrentChatTitle();

  const handleToggleChat = () => {
    dispatch(toggleChat());
    if (!isOpen) {
      setShowConversations(true);
    }
  };

  const handleMinimize = () => {
    dispatch(minimizeChat());
  };

  const handleClose = () => {
    dispatch(closeChat());
  };

  const handleOpenChat = () => {
    dispatch(openChat());
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {(!isOpen && !isMinimized) && (
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={handleToggleChat}
            className={`relative p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              isDarkTheme 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <MessageCircle size={24} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Minimized Chat Bar */}
      {isMinimized && (
        <div className="fixed bottom-0 left-6 z-50">
          <div
            className={`flex items-center px-4 py-2 rounded-t-lg shadow-lg cursor-pointer transition-colors ${
              isDarkTheme 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-800 border-gray-200'
            } border border-b-0`}
            onClick={handleOpenChat}
          >
            <MessageCircle size={20} className="mr-2" />
            <span className="font-medium">{chatTitle}</span>
            {totalUnreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-[500px] h-[500px] flex flex-col">
          <div
            className={`rounded-lg shadow-2xl border transition-colors ${
              isDarkTheme 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-4 border-b rounded-t-lg ${
                isDarkTheme 
                  ? 'border-gray-700 bg-gray-750' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle size={20} className={isDarkTheme ? 'text-blue-400' : 'text-blue-500'} />
                <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-800'}`}>
                  {chatTitle}
                </h3>
                {totalUnreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowConversations(!showConversations)}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-gray-600 text-gray-300' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Toggle conversations"
                >
                  <Users size={16} />
                </button>
                <button
                  onClick={handleMinimize}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-gray-600 text-gray-300' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={handleClose}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-gray-600 text-gray-300' 
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[436px] flex">
              {showConversations && (
                <div className={`w-[180px] border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                  <ConversationList onSelectConversation={() => {
                    // Only hide conversations list if we have an active chat
                    if (activeConversation || activeRoom) {
                      setShowConversations(false);
                    }
                  }} />
                </div>
              )}
              <div className={`${showConversations ? 'flex-1' : 'w-full'}`}>
                <ChatWindow />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat; 