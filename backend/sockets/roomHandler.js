const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

const roomHandler = (socket, io) => {
  // Join a room (now primarily for game/room management, chat is handled automatically)
  socket.on('join_room', async (data) => {
    try {
      // Handle both string and object formats
      const roomId = typeof data === 'string' ? data : data.roomId;
      
      console.log(`🏠 User ${socket.userId} joining room socket: ${roomId}`);
      
      // Update user's current room
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          currentRoom: roomId,
          lastActive: new Date()
        });
      }
      
      // Join socket room for room-specific events (including chat)
      socket.join(`room_${roomId}`);
      console.log(`✅ Socket ${socket.id} joined room: ${roomId}`);
      
      // Verify the socket is in the room
      const roomSocketName = `room_${roomId}`;
      const socketsInRoom = socket.adapter.rooms.get(roomSocketName);
      console.log(`   - Sockets in room: ${socketsInRoom ? socketsInRoom.size : 0}`);
      
      // Send current room users list to the joining user
      socket.emit('get_room_users', roomId);
      
      // Notify other room members that a user joined (only if it's a new join, not a rejoin)
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
  socket.on('leave_room', async (data) => {
    try {
      // Handle both string and object formats
      const roomId = typeof data === 'string' ? data : data.roomId;
      
      // Update user's current room (set to null since Home is now a conversation)
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          currentRoom: null,
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
      // Check if recipient is connected to their personal room
      const recipientRoom = `user_${recipientId}`;
      const recipientSockets = io.sockets.adapter.rooms.get(recipientRoom);
      
      console.log(`🔍 Checking invitation recipient ${recipientId}:`);
      console.log(`   - Personal room: ${recipientRoom}`);
      console.log(`   - Connected sockets in room: ${recipientSockets ? recipientSockets.size : 0}`);
      
      if (!recipientSockets || recipientSockets.size === 0) {
        console.log(`⚠️ Recipient ${recipientId} is not connected to their personal socket room`);
        // Still try to send the invitation in case they connect soon
      }
      
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
        
        // Add user to room players and remove from pending invitations
        const updatedRoom = await Room.findByIdAndUpdate(roomId, {
          $addToSet: { players: socket.userId },
          $pull: { pendingInvitations: socket.userId }
        }, { new: true }).populate({
          path: 'players',
          select: 'name picture currentRoom isOnline lastActive'
        }).populate({
          path: 'creator',
          select: 'name picture isOnline lastActive'
        }).populate({
          path: 'pendingInvitations',
          select: 'name picture isOnline lastActive'
        });
        
        // Get the user who just joined
        const user = await User.findById(socket.userId);
        
        // Get room messages from embedded room messages
        const roomMessages = await Message.find({
          _id: { $in: updatedRoom.messages }
        }).populate('sender', 'name picture')
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        
        const messages = roomMessages.reverse();
        
        // OPTIMIZATION: Create single room data update object
        const roomDataUpdate = {
          roomId,
          roomData: {
            _id: updatedRoom._id,
            name: updatedRoom.name,
            description: updatedRoom.description,
            image: updatedRoom.image,
            creator: updatedRoom.creator,
            players: updatedRoom.players,
            pendingInvitations: updatedRoom.pendingInvitations,
            timeLimit: updatedRoom.timeLimit,
            gameMode: updatedRoom.gameMode,
            turnBased: updatedRoom.turnBased,
            status: updatedRoom.status,
            currentGame: updatedRoom.currentGame,
            onlineCount: 0 // Will be updated by room_users event
          }
        };
        
        // OPTIMIZATION: Send consolidated updates to all room members
        const roomSocketName = `room_${roomId}`;
        const socketsInRoom = io.sockets.adapter.rooms.get(roomSocketName);
        
        console.log(`📡 Broadcasting optimized room updates to room ${roomId}:`);
        console.log(`   - Sockets in room: ${socketsInRoom ? socketsInRoom.size : 0}`);
        console.log(`   - Player data: { id: ${user?._id}, name: '${user?.name}' }`);
        console.log(`   - Updated room players: ${updatedRoom.players?.length || 0} players`);
        
        // OPTIMIZATION: Single broadcast to all room members with complete data
        io.to(roomSocketName).emit('room_data_update', roomDataUpdate);
        
        // OPTIMIZATION: Single player_joined event with deduplicated players list
        const playerJoinedData = {
          roomId,
          player: {
            _id: user._id,
            name: user.name,
            picture: user.picture,
            isOnline: user.isOnline,
            lastActive: user.lastActive
          },
          players: updatedRoom.players // Full deduplicated player list
        };
        
        io.to(roomSocketName).emit('player_joined', playerJoinedData);
        
        // Send messages only to the new user (others already have them)
        socket.emit('messages_update', {
          chatId: roomId,
          messages
        });
        
        // OPTIMIZATION: Single notification for invitation acceptance
        socket.to(roomSocketName).emit('invitation_accepted', {
          userId: socket.userId,
          userName: user?.name,
          roomId
        });
        
        console.log(`✅ ${user?.name} joined room ${roomId} via invitation`);
        
      } else {
        console.log(`❌ Room invitation declined for room ${roomId}`);
        
        // If declined, remove from pending invitations
        if (socket.userId) {
          await Room.findByIdAndUpdate(roomId, {
            $pull: { pendingInvitations: socket.userId }
          });
          console.log(`🗑️ Removed ${socket.userId} from pending invitations for room ${roomId}`);
        }
      }
    } catch (error) {
      console.error('Error handling room invitation response:', error);
    }
  });

  // Request room data (for when user joins a room and needs fresh data)
  socket.on('request_room_data', async ({ roomId }) => {
    try {
      console.log(`📦 Requesting room data for room ${roomId} by user ${socket.userId}`);
      
      // Get room details
      const room = await Room.findById(roomId)
        .populate('creator', 'name picture isOnline lastActive')
        .populate('players', 'name picture currentRoom isOnline lastActive')
        .populate('pendingInvitations', 'name picture isOnline lastActive');
      
      if (!room) {
        console.error(`❌ Room ${roomId} not found`);
        return;
      }
      
      // Get recent messages from embedded room messages
      const roomMessages = await Message.find({
        _id: { $in: room.messages }
      }).populate('sender', 'name picture')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      const messages = roomMessages.reverse(); // Oldest first
      
      // Send room data update
      socket.emit('room_data_update', {
        roomId,
        roomData: {
          _id: room._id,
          name: room.name,
          description: room.description,
          image: room.image,
          creator: room.creator,
          players: room.players,
          pendingInvitations: room.pendingInvitations,
          timeLimit: room.timeLimit,
          gameMode: room.gameMode,
          turnBased: room.turnBased,
          status: room.status,
          currentGame: room.currentGame,
          onlineCount: 0 // Will be updated by room_users event
        }
      });
      
      // Send messages update
      socket.emit('messages_update', {
        chatId: roomId,
        messages
      });
      
      console.log(`✅ Sent room data for ${room.name}: ${messages.length} messages`);
      
    } catch (error) {
      console.error('Error requesting room data:', error);
    }
  });

  // Get room online users (useful for chat UI)
  socket.on('get_room_users', async (data) => {
    try {
      // Handle both string and object formats
      const roomId = typeof data === 'string' ? data : data.roomId;
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