const Room = require('../models/Room');
const User = require('../models/User');

const roomHandler = (socket, io) => {
  // Join a room (now primarily for game/room management, chat is handled automatically)
  socket.on('join_room', async (roomId) => {
    try {
      // Update user's current room
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          currentRoom: roomId,
          lastActive: new Date()
        });
      }
      
      // Join socket room for room-specific events (not chat, that's handled automatically)
      socket.join(`room_${roomId}`);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      
      // Notify other room members that a user joined
      if (socket.userId) {
        const user = await User.findById(socket.userId);
        socket.to(`room_${roomId}`).emit('user_joined_room', {
          userId: socket.userId,
          userName: user?.name,
          roomId
        });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Leave a room
  socket.on('leave_room', async (roomId) => {
    try {
      // Update user's current room (set to null or back to Home)
      if (socket.userId) {
        const homeRoom = await Room.findOne({ name: "Home" });
        await User.findByIdAndUpdate(socket.userId, {
          currentRoom: homeRoom?._id || null,
          lastActive: new Date()
        });
      }
      
      socket.leave(`room_${roomId}`);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
      
      // Notify other room members that a user left
      if (socket.userId) {
        const user = await User.findById(socket.userId);
        socket.to(`room_${roomId}`).emit('user_left_room', {
          userId: socket.userId,
          userName: user?.name,
          roomId
        });
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Room updates (settings, players, etc.)
  socket.on('room_updated', async ({ roomId, updateData }) => {
    try {
      // Broadcast room updates to all room members
      socket.to(`room_${roomId}`).emit('room_update', {
        roomId,
        updateData
      });
      
      console.log(`Room ${roomId} updated:`, updateData);
    } catch (error) {
      console.error('Error broadcasting room update:', error);
    }
  });

  // Player joined room (more specific than general user join)
  socket.on('player_joined', async ({ roomId, player }) => {
    try {
      // Add player to room in database
      await Room.findByIdAndUpdate(roomId, {
        $addToSet: { players: player.id }
      });
      
      socket.to(`room_${roomId}`).emit('player_joined', {
        roomId,
        player
      });
      console.log(`Player ${player.name} joined room ${roomId}`);
    } catch (error) {
      console.error('Error adding player to room:', error);
    }
  });

  // Player left room (more specific than general user leave)
  socket.on('player_left', async ({ roomId, playerId }) => {
    try {
      // Remove player from room in database
      await Room.findByIdAndUpdate(roomId, {
        $pull: { players: playerId }
      });
      
      socket.to(`room_${roomId}`).emit('player_left', {
        roomId,
        playerId
      });
      console.log(`Player ${playerId} left room ${roomId}`);
    } catch (error) {
      console.error('Error removing player from room:', error);
    }
  });

  // Game starting countdown
  socket.on('game_starting', ({ roomId, countdown }) => {
    io.to(`room_${roomId}`).emit('game_starting', {
      roomId,
      countdown
    });
    console.log(`Game starting in room ${roomId} with countdown: ${countdown}`);
  });

  // Game started
  socket.on('game_started', ({ roomId, gameId }) => {
    io.to(`room_${roomId}`).emit('game_started', {
      roomId,
      gameId
    });
    console.log(`Game ${gameId} started in room ${roomId}`);
  });

  // Room invitations
  socket.on('send_room_invitation', async ({ recipientId, roomId, inviterName }) => {
    try {
      // Send invitation to specific user
      io.to(`user_${recipientId}`).emit('room_invitation', {
        roomId,
        inviterName,
        timestamp: new Date()
      });
      
      console.log(`Room invitation sent to user ${recipientId} for room ${roomId}`);
    } catch (error) {
      console.error('Error sending room invitation:', error);
    }
  });

  // Room invitation response
  socket.on('room_invitation_response', async ({ roomId, accepted }) => {
    try {
      if (accepted && socket.userId) {
        // User accepted, join them to the room notifications
        socket.join(`room_${roomId}`);
        
        // Update user's current room
        await User.findByIdAndUpdate(socket.userId, {
          currentRoom: roomId
        });
        
        // Add user to room players
        await Room.findByIdAndUpdate(roomId, {
          $addToSet: { players: socket.userId }
        });
        
        // Notify room members
        const user = await User.findById(socket.userId);
        socket.to(`room_${roomId}`).emit('invitation_accepted', {
          userId: socket.userId,
          userName: user?.name,
          roomId
        });
      }
      console.log(`Room invitation ${accepted ? 'accepted' : 'declined'} for room ${roomId}`);
    } catch (error) {
      console.error('Error handling room invitation response:', error);
    }
  });

  // Get room online users (useful for chat UI)
  socket.on('get_room_users', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      
      if (!room) {
        socket.emit('room_users', { roomId, users: [] });
        return;
      }
      
      let onlineUsers = [];
      
      if (room.name === 'Home') {
        // For Home room, get all online users (Home room includes everyone)
        onlineUsers = await User.find({ 
          isOnline: true 
        }).select('name picture isOnline lastActive');
      } else {
        // For regular rooms, get online players only
        const populatedRoom = await Room.findById(roomId).populate({
          path: 'players',
          select: 'name picture isOnline lastActive',
          match: { isOnline: true }
        });
        onlineUsers = populatedRoom?.players || [];
      }
      
      socket.emit('room_users', {
        roomId,
        users: onlineUsers
      });
      
      // Only log if there are users or in development mode
      if (onlineUsers.length > 0 || process.env.NODE_ENV === 'development') {
        console.log(`Room ${room.name}: ${onlineUsers.length} online users`);
      }
    } catch (error) {
      console.error('Error getting room users:', error);
      socket.emit('room_users', { roomId, users: [] });
    }
  });
};

module.exports = roomHandler; 