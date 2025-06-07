import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, Minimize2, X } from 'lucide-react';
import { 
  minimizeChat, 
  closeChat, 
  openChat, 
  setActiveConversation, 
  setActiveRoom,
  sendMessage,
  resetUnreadCount
} from '../../../app/store/chatSlice';
import { emitSocketEvent } from '../../../app/store/socketSlice';
import { ChatWindow } from './ChatWindow';
import ConversationList from './ConversationList';

/**
 * Floating Chat component following Single Responsibility Principle
 * Works with conversation-based Home instead of room-based
 */
export const FloatingChat = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const homeConversationId = useSelector((state) => state.auth.homeConversationId);
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
  
  const currentGameRoom = useSelector((state) => state.room.data);

  const [messageText, setMessageText] = useState('');

  const isDarkTheme = theme === 'dark';
  const currentChatId = activeConversation || activeRoom;
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  useEffect(() => {
    if (!activeConversation && !activeRoom && isOpen && homeConversationId && homeConversationId !== 'pending') {
      // Auto-select Home conversation when FloatingChat opens (only if we have a valid ID)
      dispatch(setActiveConversation(homeConversationId));
      emitSocketEvent('join_conversation', homeConversationId);
    }
  }, [activeConversation, activeRoom, isOpen, homeConversationId, dispatch]);

  // Clear active room when user leaves game room and switches to home
  useEffect(() => {
    const currentPath = window.location.pathname;
    const isInGameRoom = currentPath.startsWith('/game/');
    const isInRoomLobby = currentPath.startsWith('/rooms/');
    
    // If user is no longer in a room/game context and there's an active room, clear it
    if (!isInGameRoom && !isInRoomLobby && activeRoom) {
      dispatch(setActiveRoom(null));
      // Auto-select home conversation if available
      if (homeConversationId && homeConversationId !== 'pending') {
        dispatch(setActiveConversation(homeConversationId));
        emitSocketEvent('join_conversation', homeConversationId);
      }
    }
  }, [activeRoom, homeConversationId, dispatch]);
  
  useEffect(() => {
    if (currentChatId) {
      if (activeConversation) {
        dispatch(resetUnreadCount({ conversationId: activeConversation }));
      } else if (activeRoom) {
        dispatch(resetUnreadCount({ roomId: activeRoom }));
      }
    }
  }, [dispatch, activeConversation, activeRoom, currentChatId]);

  const handleSendMessage = async (content) => {
    if (!content.trim() || !currentChatId) return false;

    const messageData = {
      content: content.trim(),
      conversationId: activeConversation,
      roomId: activeRoom,
      messageType: 'text'
    };

    try {
      const result = await dispatch(sendMessage(messageData)).unwrap();
      
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
      return false;
    }
  };


  
  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    emitSocketEvent('join_conversation', conversationId);
  };

  const handleSelectRoom = (roomId) => {
    dispatch(setActiveRoom(roomId));
    emitSocketEvent('join_room', { roomId });
    emitSocketEvent('request_room_data', { roomId });
  };

  const handleSelectHomeConversation = () => {
    handleSelectConversation(homeConversationId);
  };

  const getCurrentChatInfo = () => {
    if (activeConversation) {
      // Check if it's the Home conversation
      if (activeConversation === homeConversationId) {
        return {
          name: 'Home',
          avatar: null,
          isOnline: true,
          type: 'conversation'
        };
      }
      
      // Regular conversation
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
      
      if (roomData && roomData.name) {
        return {
          name: roomData.name,
          avatar: roomData.image || null,
          isOnline: true,
          type: 'room'
        };
      }
      
      if (currentGameRoom && currentGameRoom._id === activeRoom && currentGameRoom.name) {
        return {
          name: currentGameRoom.name,
          avatar: currentGameRoom.image || null,
          isOnline: true,
          type: 'room'
        };
      }
      
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
      // For Home conversation, show total online users
      if (activeConversation === homeConversationId) {
        return onlineUsers.length;
      }
      
      const conversation = conversations.find(c => c._id === activeConversation);
      if (conversation) {
        const onlineParticipants = conversation.participants.filter(p => 
          onlineUsers.includes(p._id)
        );
        return onlineParticipants.length;
      }
    }
    
    if (activeRoom) {
      const roomData = roomDetails[activeRoom];
      if (roomData?.onlineCount !== undefined) {
        return roomData.onlineCount;
      }
      return 0;
    }
    
    return 0;
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const getCurrentChatTitle = () => {
    const chatInfo = getCurrentChatInfo();
    if (chatInfo) {
      const isInRoomLobby = window.location.pathname.startsWith('/rooms/');
      if (chatInfo.type === 'room' && isInRoomLobby) {
        return 'Room Chat';
      }
      return chatInfo.name;
    }
    return 'Chat';
  };

  const chatTitle = getCurrentChatTitle();
  const hasActiveChat = !!(activeConversation || activeRoom);

  if (!user || !homeConversationId) return null;

  return (
    <>
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

      {isOpen && (
        <div className={`fixed bottom-6 left-6 w-[500px] h-[500px] rounded-lg shadow-2xl overflow-hidden z-40 ${
          isDarkTheme 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-300'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkTheme ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              <MessageCircle size={18} className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'} />
              <h3 className={`font-medium text-lg ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {hasActiveChat ? chatTitle : 'Messages'}
              </h3>
              
              {totalUnreadCount > 0 && (
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

          <div className="h-[436px] flex">
            {/* Always show conversation list */}
            <div className={`w-[200px] border-r ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
              <ConversationList 
                conversations={conversations}
                roomDetails={roomDetails}
                activeConversation={activeConversation}
                activeRoom={activeRoom}
                unreadCounts={unreadCounts}
                onlineUsers={onlineUsers}
                currentGameRoom={currentGameRoom}
                user={user}
                homeConversationId={homeConversationId}
                theme={theme}
                onSelectConversation={handleSelectConversation}
                onSelectRoom={handleSelectRoom}
                onSelectHomeConversation={handleSelectHomeConversation}
              />
            </div>
            
            {/* Always show chat window area */}
            <div className="flex-1">
              {hasActiveChat ? (
                <ChatWindow 
                  chatInfo={getCurrentChatInfo()}
                  onlineCount={getOnlineUserCount()}
                  messages={currentMessages}
                  loading={loading}
                  messageText={messageText}
                  currentChatId={currentChatId}
                  user={user}
                  isDarkTheme={isDarkTheme}
                  onInputChange={(text) => setMessageText(text)}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 