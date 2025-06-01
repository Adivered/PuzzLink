const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Helper function to get user display info for logging
const getUserDisplayInfo = (socket) => {
  if (socket.userEmail) {
    return `${socket.userEmail} <${socket.id.slice(-8)}>`;
  }
  return `Socket ${socket.id.slice(-8)} (no user)`;
};

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
      const { content, conversationId, roomId, senderId, messageType = 'text', tempId } = messageData;
      
      // Validate required fields
      if (!content || !senderId) {
        socket.emit('message_error', { 
          error: 'Missing required fields',
          tempId,
          conversationId,
          roomId
        });
        return;
      }

      if (!conversationId && !roomId) {
        socket.emit('message_error', { 
          error: 'Either conversationId or roomId is required',
          tempId,
          conversationId,
          roomId
        });
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

      // Add tempId to the message for tracking optimistic updates
      const messageWithTempId = {
        ...message.toObject(),
        tempId
      };

      // Update conversation's last message if it's a conversation message
      if (conversationId) {
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          updatedAt: new Date()
        });
      }

      // Emit to appropriate room/conversation
      if (roomId) {
        // Check who's in the room before broadcasting
        const roomSocketName = `room_${roomId}`;
        const socketsInRoom = io.sockets.adapter.rooms.get(roomSocketName);
        const socketCount = socketsInRoom ? socketsInRoom.size : 0;
        
        // Enhanced logging with user info
        const userInfo = await getUserDisplayInfo(socket);
        const roomDisplay = `room: ${roomId.slice(-8)}`;
        
        console.log(`📨 Broadcasting message from ${userInfo} to ${roomDisplay}:`);
        console.log(`   - Message ID: ${message._id}`);
        console.log(`   - Sockets in room: ${socketCount}`);
        if (socketCount > 0) {
          const socketDisplays = Array.from(socketsInRoom).map(id => id.slice(-8)).join(', ');
          console.log(`   - Socket IDs: ${socketDisplays}`);
        }
        
        // Send to all users in the room
        io.to(`room_${roomId}`).emit('message_received', messageWithTempId);
        
        if (socketCount === 0) {
          console.warn(`⚠️ No sockets in room ${roomId.slice(-8)} to receive message!`);
        }
      } else if (conversationId) {
        // Send to all users in the conversation
        const userInfo = await getUserDisplayInfo(socket);
        const convDisplay = `conversation: ${conversationId.slice(-8)}`;
        
        io.to(`conversation_${conversationId}`).emit('message_received', messageWithTempId);
        console.log(`📨 Broadcasted message from ${userInfo} to ${convDisplay}: ${message._id}`);
      }

      // Send confirmation back to sender
      socket.emit('message_sent', {
        tempId,
        message: messageWithTempId
      });

      console.log(`Message sent successfully: ${message._id} with tempId: ${tempId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { 
        error: 'Failed to send message',
        tempId: messageData.tempId,
        conversationId: messageData.conversationId,
        roomId: messageData.roomId
      });
    }
  });

  // Handle message read receipts
  socket.on('mark_messages_read', async ({ messageIds, userId }) => {
    try {
      // Update read status in database
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $addToSet: { readBy: { user: userId, readAt: new Date() } } }
      );

      // Broadcast read receipts
      messageIds.forEach(messageId => {
        socket.broadcast.emit('message_read', {
          messageId,
          userId
        });
      });

      console.log(`Messages marked as read by user ${userId}:`, messageIds);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle message reactions
  socket.on('add_reaction', async ({ messageId, reaction, userId }) => {
    try {
      // Add reaction logic here (you'll need to update your Message schema)
      // For now, just broadcast the reaction
      socket.broadcast.emit('reaction_added', {
        messageId,
        reaction,
        userId
      });

      console.log(`Reaction ${reaction} added to message ${messageId} by user ${userId}`);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  });
};

module.exports = chatHandler; 