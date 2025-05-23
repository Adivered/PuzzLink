import store from '../../store';
import { 
  addMessage, 
  setTypingUser, 
  removeTypingUser, 
  updateConversationLastMessage 
} from '../../store/chatSlice';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

class ChatSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
  }

  initializeListeners() {
    // New message received
    this.socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
      store.dispatch(addMessage(message));
      
      // Update conversation last message if it's a conversation message
      if (message.conversation) {
        store.dispatch(updateConversationLastMessage({
          conversationId: message.conversation,
          message
        }));
      }
    });

    // Typing indicators
    this.socket.on(SOCKET_EVENTS.USER_TYPING, ({ userId, userName }) => {
      const state = store.getState();
      const { activeConversation, activeRoom } = state.chat;
      
      store.dispatch(setTypingUser({
        conversationId: activeConversation,
        roomId: activeRoom,
        userId,
        userName
      }));
    });

    this.socket.on(SOCKET_EVENTS.USER_STOP_TYPING, ({ userId }) => {
      const state = store.getState();
      const { activeConversation, activeRoom } = state.chat;
      
      store.dispatch(removeTypingUser({
        conversationId: activeConversation,
        roomId: activeRoom,
        userId
      }));
    });

    // Message error handling
    this.socket.on(SOCKET_EVENTS.MESSAGE_ERROR, ({ error }) => {
      console.error('Message error:', error);
      // You could dispatch an error action here
    });

    // Message read receipts
    this.socket.on(SOCKET_EVENTS.MESSAGE_READ, ({ messageId, userId }) => {
      // Handle read receipts
      console.log(`Message ${messageId} read by user ${userId}`);
    });

    // Message reactions
    this.socket.on(SOCKET_EVENTS.REACTION_ADDED, ({ messageId, reaction, userId }) => {
      // Handle message reactions
      console.log(`Reaction ${reaction} added to message ${messageId} by user ${userId}`);
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
    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, messageData);
  }

  startTyping({ roomId, conversationId, userId, userName }) {
    this.socket.emit(SOCKET_EVENTS.TYPING_START, { roomId, conversationId, userId, userName });
  }

  stopTyping({ roomId, conversationId, userId }) {
    this.socket.emit(SOCKET_EVENTS.TYPING_STOP, { roomId, conversationId, userId });
  }

  markMessagesAsRead({ messageIds, userId }) {
    this.socket.emit(SOCKET_EVENTS.MARK_MESSAGES_READ, { messageIds, userId });
  }

  addReaction({ messageId, reaction, userId }) {
    this.socket.emit(SOCKET_EVENTS.ADD_REACTION, { messageId, reaction, userId });
  }

  // Cleanup method
  destroy() {
    // Remove all listeners
    this.socket.off(SOCKET_EVENTS.NEW_MESSAGE);
    this.socket.off(SOCKET_EVENTS.USER_TYPING);
    this.socket.off(SOCKET_EVENTS.USER_STOP_TYPING);
    this.socket.off(SOCKET_EVENTS.MESSAGE_ERROR);
    this.socket.off(SOCKET_EVENTS.MESSAGE_READ);
    this.socket.off(SOCKET_EVENTS.REACTION_ADDED);
  }
}

export default ChatSocketHandler; 