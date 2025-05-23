const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const chatHandler = (socket, io) => {
  // Join a conversation
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave a conversation
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      const { content, conversationId, roomId, senderId, messageType = 'text' } = messageData;
      
      // Validate required fields
      if (!content || !senderId) {
        socket.emit('message_error', { error: 'Missing required fields' });
        return;
      }

      if (!conversationId && !roomId) {
        socket.emit('message_error', { error: 'Either conversationId or roomId is required' });
        return;
      }
      
      const newMessageData = {
        content,
        sender: senderId,
        messageType
      };

      if (conversationId) {
        newMessageData.conversation = conversationId;
      } else if (roomId) {
        newMessageData.room = roomId;
      }

      const message = new Message(newMessageData);
      await message.save();
      await message.populate('sender', 'name picture isOnline');

      // Update conversation's last message if it's a conversation message
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });
      }

      // Emit to appropriate room/conversation
      if (roomId) {
        io.to(`room_${roomId}`).emit('new_message', message);
      } else if (conversationId) {
        io.to(`conversation_${conversationId}`).emit('new_message', message);
      }

      console.log(`Message sent in ${roomId ? 'room' : 'conversation'}: ${roomId || conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', ({ roomId, conversationId, userId, userName }) => {
    const room = roomId ? `room_${roomId}` : `conversation_${conversationId}`;
    socket.to(room).emit('user_typing', { userId, userName });
    console.log(`User ${userName} started typing in ${room}`);
  });

  socket.on('typing_stop', ({ roomId, conversationId, userId }) => {
    const room = roomId ? `room_${roomId}` : `conversation_${conversationId}`;
    socket.to(room).emit('user_stop_typing', { userId });
    console.log(`User ${userId} stopped typing in ${room}`);
  });

  // Mark messages as read
  socket.on('mark_messages_read', async ({ messageIds, userId }) => {
    try {
      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          'readBy.user': { $ne: userId }
        },
        {
          $push: {
            readBy: {
              user: userId,
              readAt: new Date()
            }
          }
        }
      );

      // Emit read receipt to other participants
      messageIds.forEach(messageId => {
        socket.broadcast.emit('message_read', { messageId, userId });
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Handle message reactions (for future implementation)
  socket.on('add_reaction', async ({ messageId, reaction, userId }) => {
    try {
      // Implementation for message reactions
      const message = await Message.findById(messageId);
      if (message) {
        // Add reaction logic here
        io.emit('reaction_added', { messageId, reaction, userId });
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  });
};

module.exports = chatHandler; 