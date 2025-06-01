import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Minimize2, X, ArrowLeft } from 'lucide-react';
import { 
  minimizeChat, 
  closeChat, 
  openChat, 
  setActiveConversation, 
  setActiveChatRoom,
  sendMessage,
  resetUnreadCount
} from '../../store/chatSlice';
import { emitSocketEvent } from '../../store/socketSlice';
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
    roomDetails,
    messages,
    loading,
    onlineUsers
  } = useSelector((state) => state.chat);
  
  // Get current game room as fallback
  const currentGameRoom = useSelector((state) => state.room.data);

  const [showConversations, setShowConversations] = useState(true);
  const [messageText, setMessageText] = useState('');

  const isDarkTheme = theme === 'dark';
  const currentChatId = activeConversation || activeRoom;
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  // OPTIMIZATION: Auto-show conversations when no active chat
  useEffect(() => {
    if (!activeConversation && !activeRoom && isOpen) {
      setShowConversations(true);
    }
  }, [activeConversation, activeRoom, isOpen]);

  // ===== CENTRALIZED CHAT STATE MANAGEMENT (NO SOCKET ROOM JOINING) =====
  
  // Reset unread counts when switching chats - NO socket calls here
  useEffect(() => {
    if (currentChatId) {
      if (activeConversation) {
        dispatch(resetUnreadCount({ conversationId: activeConversation }));
      } else if (activeRoom) {
        dispatch(resetUnreadCount({ roomId: activeRoom }));
      }
    }
  }, [dispatch, activeConversation, activeRoom, currentChatId]);

  // ===== CENTRALIZED MESSAGE SENDING =====
  
  const handleSendMessage = async (content) => {
    if (!content.trim() || !currentChatId) return false;

    const messageData = {
      content: content.trim(),
      conversationId: activeConversation,
      roomId: activeRoom,
      messageType: 'text'
    };

    try {
      // Send via Redux action (which adds optimistic message and gets senderId)
      const result = await dispatch(sendMessage(messageData)).unwrap();
      
      // Send via socket with all required fields - SINGLE CALL
      emitSocketEvent('send_message', {
        content: result.content,
        conversationId: result.conversationId,
        roomId: result.roomId,
        messageType: result.messageType,
        senderId: result.senderId,
        tempId: result.tempId
      });

      setMessageText('');
      
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  // ===== CENTRALIZED CHAT SELECTION =====
  
  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    setShowConversations(false);
  };

  const handleSelectRoom = (roomId) => {
    dispatch(setActiveChatRoom(roomId));
    // Keep conversation list open when selecting rooms
    // setShowConversations(false); // Removed this line
  };

  // ===== CENTRALIZED CHAT INFO =====
  
  const getCurrentChatInfo = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c._id === activeConversation);
      if (conversation) {
        const otherUser = conversation.participants.find(p => p._id !== user.id);
        return {
          name: conversation.isGroup ? conversation.groupName : otherUser?.name,
          avatar: conversation.isGroup ? conversation.groupAvatar : otherUser?.picture,
          isOnline: otherUser ? onlineUsers.includes(otherUser._id) : false,
          type: 'conversation'
        };
      }
    }
    
    if (activeRoom) {
      const roomData = roomDetails[activeRoom];
      
      // If we have room details, use them
      if (roomData && roomData.name) {
        return {
          name: roomData.name,
          avatar: roomData.image || null,
          isOnline: true,
          type: 'room'
        };
      }
      
      // Fallback to current game room data if this is the current game room
      if (currentGameRoom && currentGameRoom._id === activeRoom && currentGameRoom.name) {
        return {
          name: currentGameRoom.name,
          avatar: currentGameRoom.image || null,
          isOnline: true,
          type: 'room'
        };
      }
      
      // Fallback to checking if it's the Home room
      if (activeRoom === user?.homeRoomId) {
        return {
          name: 'Home',
          avatar: null,
          isOnline: true,
          type: 'room'
        };
      }
      
      // Final fallback
      return {
        name: 'Room Chat',
        avatar: null,
        isOnline: true,
        type: 'room'
      };
    }
    
    return null;
  };

  const getOnlineUserCount = () => {
    if (activeConversation) {
      const conversation = conversations.find(c => c._id === activeConversation);
      if (conversation) {
        // For conversations, count online participants
        const onlineParticipants = conversation.participants.filter(p => 
          onlineUsers.includes(p._id)
        );
        return onlineParticipants.length;
      }
    }
    
    if (activeRoom) {
      // For rooms, use the actual room data from socket
      const roomData = roomDetails[activeRoom];
      if (roomData?.onlineCount !== undefined) {
        return roomData.onlineCount;
      }
      return 0;
    }
    
    return 0;
  };

  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // Get current chat title
  const getCurrentChatTitle = () => {
    const chatInfo = getCurrentChatInfo();
    if (chatInfo) {
      // Check if we're currently in a room lobby page to avoid duplicate titles
      const isInRoomLobby = window.location.pathname.startsWith('/room/');
      if (chatInfo.type === 'room' && isInRoomLobby) {
        return 'Room Chat';
      }
      return chatInfo.name;
    }
    return 'Chat';
  };

  const chatTitle = getCurrentChatTitle();
  const hasActiveChat = !!(activeConversation || activeRoom);

  // OPTIMIZATION: Back to conversations handler
  const handleBackToConversations = () => {
    setShowConversations(true);
  };

  if (!user) return null;

  // ===== RENDER =====
  
  return (
    <>
      {/* Chat Button */}
      {!isOpen && !isMinimized && (
        <button
          onClick={() => dispatch(openChat())}
          className={`fixed bottom-6 left-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${
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
      )}

      {/* Minimized Chat */}
      {isMinimized && (
        <div 
          onClick={() => dispatch(openChat())}
          className={`fixed bottom-6 left-6 p-3 rounded-t-lg shadow-lg cursor-pointer transition-all duration-300 z-40 ${
            isDarkTheme 
              ? 'bg-gray-800 border border-gray-700 text-white' 
              : 'bg-white border border-gray-300 text-gray-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            <MessageCircle size={16} />
            <span className="text-sm font-medium">{chatTitle}</span>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 left-6 w-[500px] h-[500px] rounded-lg shadow-2xl overflow-hidden z-40 ${
          isDarkTheme 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-300'
        }`}>
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkTheme ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              {/* Back button when showing chat and conversations are hidden */}
              {hasActiveChat && !showConversations && (
                <button
                  onClick={handleBackToConversations}
                  className={`p-1 rounded transition-colors ${
                    isDarkTheme 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              
              <MessageCircle size={18} className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'} />
              <h3 className={`font-medium text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {showConversations && !hasActiveChat ? 'Messages' : chatTitle}
              </h3>
              
              {totalUnreadCount > 0 && showConversations && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(minimizeChat())}
                className={`p-1 rounded transition-colors ${
                  isDarkTheme 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => dispatch(closeChat())}
                className={`p-1 rounded transition-colors ${
                  isDarkTheme 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="h-[436px] flex">
            {/* Conversation List */}
            {(showConversations || !hasActiveChat) && (
              <div className={`${hasActiveChat ? 'w-[200px]' : 'w-full'} border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
                <ConversationList 
                  // Pass clean props instead of Redux access
                  conversations={conversations}
                  roomDetails={roomDetails}
                  activeConversation={activeConversation}
                  activeRoom={activeRoom}
                  unreadCounts={unreadCounts}
                  onlineUsers={onlineUsers}
                  currentGameRoom={currentGameRoom}
                  user={user}
                  isDarkTheme={isDarkTheme}
                  // Pass clean callbacks
                  onSelectConversation={handleSelectConversation}
                  onSelectRoom={handleSelectRoom}
                  onSelectHomeRoom={() => handleSelectRoom(user?.homeRoomId)}
                />
              </div>
            )}
            
            {/* Chat Window */}
            {hasActiveChat && (!showConversations || window.innerWidth >= 768) && (
              <div className={`${showConversations ? 'flex-1' : 'w-full'}`}>
                <ChatWindow 
                  // Pass clean props instead of Redux access
                  chatInfo={getCurrentChatInfo()}
                  onlineCount={getOnlineUserCount()}
                  messages={currentMessages}
                  loading={loading}
                  messageText={messageText}
                  currentChatId={currentChatId}
                  user={user}
                  isDarkTheme={isDarkTheme}
                  // Pass clean callbacks
                  onInputChange={(text) => setMessageText(text)}
                  onSendMessage={handleSendMessage}
                />
              </div>
            )}
            
            {/* Placeholder when no active chat */}
            {!hasActiveChat && !showConversations && (
              <div className="w-full flex items-center justify-center">
                <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat; 