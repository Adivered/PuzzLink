import store from '../../store';
import { 
  addMessage, 
  setTypingUser, 
  removeTypingUser, 
  updateConversationLastMessage,
  markMessageAsSent,
  removeOptimisticMessage
} from '../../store/chatSlice';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

class ChatSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
  }

  initializeListeners() {    
    // New message received from server
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      const state = store.getState();
      const currentUserId = state.auth.user?.id;
      
      // Only add messages from other users (not our own)
      if (message.sender._id !== currentUserId) {
        store.dispatch(addMessage(message));
        
        // Update conversation last message if it's a conversation message
        if (message.conversation) {
          store.dispatch(updateConversationLastMessage({
            conversationId: message.conversation,
            message
          }));
        }
      }
    });

    // Message sent successfully (confirmation from server)
    this.socket.on(SOCKET_EVENTS.MESSAGE_SENT, ({ tempId, message }) => {
      console.log('🎯 MESSAGE_SENT received:', { tempId, messageId: message._id });
      
      // Mark the optimistic message as sent
      store.dispatch(markMessageAsSent({
        tempId,
        messageId: message._id
      }));
    });

    // Message failed to send
    this.socket.on(SOCKET_EVENTS.MESSAGE_ERROR, ({ error, tempId, conversationId, roomId }) => {
      console.error('Failed to send message:', error);
      
      // Remove failed optimistic message
      if (tempId) {
        store.dispatch(removeOptimisticMessage({
          tempId,
          conversationId,
          roomId
        }));
      }
    });

    // Typing indicators
    this.socket.on(SOCKET_EVENTS.USER_TYPING, ({ userId, userName, roomId, conversationId }) => {
      const state = store.getState();
      const { activeConversation, activeRoom } = state.chat;
      
      // Only show typing indicator if it's for the currently active chat
      const isRelevant = (conversationId && activeConversation === conversationId) || 
                        (roomId && activeRoom === roomId);
      
      if (isRelevant) {
        store.dispatch(setTypingUser({
          conversationId: activeConversation,
          roomId: activeRoom,
          userId,
          userName
        }));
      }
    });

    this.socket.on(SOCKET_EVENTS.USER_STOP_TYPING, ({ userId, roomId, conversationId }) => {
      const state = store.getState();
      const { activeConversation, activeRoom } = state.chat;
      
      // Only remove typing indicator if it's for the currently active chat
      const isRelevant = (conversationId && activeConversation === conversationId) || 
                        (roomId && activeRoom === roomId);
      
      if (isRelevant) {
        store.dispatch(removeTypingUser({
          conversationId: activeConversation,
          roomId: activeRoom,
          userId
        }));
      }
    });

    // Message read receipts
    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ messageId, userId }) => {
      // Handle read receipts if needed
    });

    // Message reactions
    this.socket.on(SOCKET_EVENTS.REACTION_ADDED, ({ messageId, reaction, userId }) => {
      // Handle message reactions if needed
    });
  }

  // Chat-specific emit methods
  joinConversation(conversationId) {
    this.socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conversationId);
  }

  leaveConversation(conversationId) {
    this.socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, conversationId);
  }

  sendMessage(messageData) {
    // Use the tempId passed in the messageData
    const tempId = messageData.tempId || `temp_${Date.now()}_${Math.random()}`;
    
    const messageWithTempId = {
      ...messageData,
      tempId
    };
    
    console.log('🚀 Sending message via socket:', { tempId, content: messageData.content });
    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, messageWithTempId);
    
    // Return tempId so calling code can track the message
    return tempId;
  }

  startTyping({ conversationId, roomId, userId, userName }) {
    this.socket.emit(SOCKET_EVENTS.TYPING_START, {
      conversationId,
      roomId,
      userId,
      userName
    });
  }

  stopTyping({ conversationId, roomId, userId }) {
    this.socket.emit(SOCKET_EVENTS.TYPING_STOP, {
      conversationId,
      roomId,
      userId
    });
  }

  markMessagesAsRead({ messageIds, userId }) {
    this.socket.emit(SOCKET_EVENTS.MARK_MESSAGES_READ, {
      messageIds,
      userId
    });
  }

  addReaction({ messageId, reaction, userId }) {
    this.socket.emit(SOCKET_EVENTS.ADD_REACTION, {
      messageId,
      reaction,
      userId
    });
  }

  // Cleanup method
  destroy() {
    this.socket.off(SOCKET_EVENTS.NEW_MESSAGE);
    this.socket.off(SOCKET_EVENTS.MESSAGE_SENT);
    this.socket.off(SOCKET_EVENTS.MESSAGE_ERROR);
    this.socket.off(SOCKET_EVENTS.USER_TYPING);
    this.socket.off(SOCKET_EVENTS.USER_STOP_TYPING);
    this.socket.off(SOCKET_EVENTS.MESSAGE_READ);
    this.socket.off(SOCKET_EVENTS.REACTION_ADDED);
  }
}

export default ChatSocketHandler; 