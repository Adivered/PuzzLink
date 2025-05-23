const Room = require('../models/Room');
const User = require('../models/User');

const roomHandler = (socket, io) => {
  // Join a room
  socket.on('join_room', async (roomId) => {
    try {
      socket.join(`room_${roomId}`);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
      
      // Notify other room members that a user joined
      if (socket.userId) {
        socket.to(`room_${roomId}`).emit('user_joined_room', {
          userId: socket.userId,
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
      socket.leave(`room_${roomId}`);
      console.log(`Socket ${socket.id} left room: ${roomId}`);
      
      // Notify other room members that a user left
      if (socket.userId) {
        socket.to(`room_${roomId}`).emit('user_left_room', {
          userId: socket.userId,
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

  // Player joined room
  socket.on('player_joined', ({ roomId, player }) => {
    socket.to(`room_${roomId}`).emit('player_joined', {
      roomId,
      player
    });
    console.log(`Player ${player.name} joined room ${roomId}`);
  });

  // Player left room
  socket.on('player_left', ({ roomId, playerId }) => {
    socket.to(`room_${roomId}`).emit('player_left', {
      roomId,
      playerId
    });
    console.log(`Player ${playerId} left room ${roomId}`);
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
  socket.on('room_invitation_response', ({ roomId, accepted }) => {
    if (accepted && socket.userId) {
      // User accepted, join them to the room notifications
      socket.join(`room_${roomId}`);
      
      // Notify room members
      socket.to(`room_${roomId}`).emit('invitation_accepted', {
        userId: socket.userId,
        roomId
      });
    }
    console.log(`Room invitation ${accepted ? 'accepted' : 'declined'} for room ${roomId}`);
  });
};

module.exports = roomHandler; 