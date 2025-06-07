import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

/**
 * Floating Chat logic hook following Single Responsibility Principle
 * Handles all chat state management and business logic
 */
export const useFloatingChatLogic = () => {
  const dispatch = useDispatch();
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
  const [showConversations, setShowConversations] = useState(true);
  const [messageText, setMessageText] = useState('');

  const currentChatId = activeConversation || activeRoom;
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  // Auto-show conversations when no active chat
  useEffect(() => {
    if (!activeConversation && !activeRoom && isOpen) {
      setShowConversations(true);
    }
  }, [activeConversation, activeRoom, isOpen]);
  
  // Reset unread count for active chat
  useEffect(() => {
    if (currentChatId) {
      if (activeConversation) {
        dispatch(resetUnreadCount({ conversationId: activeConversation }));
      } else if (activeRoom) {
        dispatch(resetUnreadCount({ roomId: activeRoom }));
      }
    }
  }, [dispatch, activeConversation, activeRoom, currentChatId]);

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  // Chat actions
  const handleToggleChat = useCallback(() => {
    if (isMinimized) {
      // If minimized, expand the chat
      dispatch(openChat());
    } else if (isOpen) {
      // If open, minimize the chat
      dispatch(minimizeChat());
    } else {
      // If closed, open the chat
      dispatch(openChat());
    }
  }, [dispatch, isMinimized, isOpen]);

  const handleMinimize = useCallback(() => {
    dispatch(minimizeChat());
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch(closeChat());
  }, [dispatch]);



  const handleSendMessage = useCallback(async (content) => {
    if (!content.trim() || !currentChatId) return false;

    const messageData = {
      content: content.trim(),
      conversationId: activeConversation,
      roomId: activeRoom,
      messageType: 'text'
    };

    try {
      const result = await dispatch(sendMessage(messageData)).unwrap();
      
      // Emit socket event properly
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
  }, [dispatch, currentChatId, activeConversation, activeRoom]);

  // Chat counting and selection logic
  const getTotalChatCount = useCallback(() => {
    let count = 0;
    
    // Count Home conversation
    if (homeConversationId) {
      count++;
    }
    
    // Count game rooms (explicitly exclude Home room)
    const gameRooms = Object.keys(roomDetails).filter(roomId => 
      roomDetails[roomId]?.name && roomDetails[roomId]?.name !== 'Home'
    );
    count += gameRooms.length;
    
    // Count other conversations (minus Home)
    const otherConversations = conversations.filter(c => c._id !== homeConversationId);
    count += otherConversations.length;
    
    return count;
  }, [homeConversationId, roomDetails, conversations.length]);
  
  const shouldCollapseList = getTotalChatCount() <= 2;
  
  const handleSelectConversation = useCallback((conversationId) => {
    dispatch(setActiveConversation(conversationId));
    // Emit socket event to join the conversation for real-time chat
    emitSocketEvent('join_conversation', conversationId);
    if (shouldCollapseList) {
      setShowConversations(false);
    }
  }, [dispatch, shouldCollapseList]);

  const handleSelectRoom = useCallback((roomId) => {
    dispatch(setActiveRoom(roomId));
    // Emit socket event to join the room for real-time chat
    emitSocketEvent('join_room', { roomId });
    // Request room data and messages
    emitSocketEvent('request_room_data', { roomId });
  }, [dispatch]);

  const onSelectHomeConversation = useCallback(() => {
    if (homeConversationId) {
      handleSelectConversation(homeConversationId);
      if (shouldCollapseList) {
        setShowConversations(false);
      }
    }
  }, [handleSelectConversation, homeConversationId, shouldCollapseList]);

  const handleBackToConversations = useCallback(() => {
    setShowConversations(true);
  }, []);

  // Chat info calculations
  const getCurrentChatInfo = useCallback(() => {
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
      
      // Note: Home is now a conversation, not a room
      
      return {
        name: 'Room Chat',
        avatar: null,
        isOnline: true,
        type: 'room'
      };
    }
    
    return null;
  }, [activeConversation, activeRoom, conversations, user, onlineUsers, roomDetails, currentGameRoom]);

  const getOnlineUserCount = useCallback(() => {
    if (activeConversation) {
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
  }, [activeConversation, activeRoom, conversations, onlineUsers, roomDetails]);

  const currentChatInfo = getCurrentChatInfo();
  const hasActiveChat = !!(activeConversation || activeRoom);

  return {
    // State
    user,
    isOpen,
    isMinimized,
    showConversations,
    messageText,
    setMessageText,
    currentChatInfo,
    currentMessages,
    totalUnreadCount,
    hasActiveChat,
    loading,
    
    // Actions
    handleToggleChat,
    handleMinimize,
    handleClose,
    handleSendMessage,
    handleSelectConversation,
    handleSelectRoom,
    handleBackToConversations,
    onSelectHomeConversation,
    
    // Computed values
    getOnlineUserCount: getOnlineUserCount(),
  };
}; 