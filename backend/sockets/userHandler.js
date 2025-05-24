const User = require('../models/User');
const Room = require('../models/Room');

// Track active socket connections per user
const userConnections = new Map(); // userId -> Set of socket IDs

const userHandler = (socket, io) => {
  // Join user to their personal room for notifications and auto-join relevant chat rooms
  socket.on('join_user', async (userId) => {
    try {
      socket.userId = userId; // Store userId on socket for reference
      socket.join(`user_${userId}`);
      
      // Track this socket connection for the user
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId).add(socket.id);
      
      // Get user with current room info
      const user = await User.findById(userId).populate('currentRoom');
      
      if (user) {
        // Check if this is the user's first connection (they were offline)
        const wasOffline = !user.isOnline;
        
        // Update user online status and last active time
        await User.findByIdAndUpdate(userId, { 
          isOnline: true,
          lastActive: new Date()
        });
        
        // Auto-join Home room chat (global chat)
        const homeRoom = await Room.findOne({ name: "Home" });
        if (homeRoom) {
          socket.join(`room_${homeRoom._id}`);
          console.log(`User ${userId} auto-joined Home room chat: ${homeRoom._id}`);
          
          // Only emit user_joined_room if user was offline (prevent spam on refresh)
          if (wasOffline) {
            socket.to(`room_${homeRoom._id}`).emit('user_joined_room', {
              userId,
              userName: user.name,
              roomId: homeRoom._id,
              roomName: "Home"
            });
          }
        }
        
        // Auto-join current room chat if user has one (and it's not Home)
        if (user.currentRoom && user.currentRoom._id.toString() !== homeRoom?._id.toString()) {
          socket.join(`room_${user.currentRoom._id}`);
          console.log(`User ${userId} auto-joined current room chat: ${user.currentRoom._id}`);
          
          // Only emit user_joined_room if user was offline (prevent spam on refresh)
          if (wasOffline) {
            socket.to(`room_${user.currentRoom._id}`).emit('user_joined_room', {
              userId,
              userName: user.name,
              roomId: user.currentRoom._id,
              roomName: user.currentRoom.name
            });
          }
        }
        
        // Only broadcast user online status if they were previously offline
        if (wasOffline) {
          socket.broadcast.emit('user_online', {
            userId,
            userName: user.name
          });
        }
      }
      
      console.log(`User ${userId} joined personal room and relevant chat rooms (${userConnections.get(userId).size} active connections)`);
    } catch (error) {
      console.error('Error in join_user:', error);
      socket.emit('error', { message: 'Failed to join user room' });
    }
  });

  // Handle user going offline
  socket.on('user_going_offline', async (userId) => {
    try {
      // Remove all connections for this user (explicit offline)
      if (userConnections.has(userId)) {
        userConnections.delete(userId);
      }
      
      const user = await User.findById(userId).populate('currentRoom');
      
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastActive: new Date()
      });
      
      // Notify all rooms user was in that they're going offline
      const homeRoom = await Room.findOne({ name: "Home" });
      if (homeRoom) {
        socket.to(`room_${homeRoom._id}`).emit('user_left_room', {
          userId,
          userName: user?.name,
          roomId: homeRoom._id,
          roomName: "Home"
        });
      }
      
      if (user?.currentRoom && user.currentRoom._id.toString() !== homeRoom?._id.toString()) {
        socket.to(`room_${user.currentRoom._id}`).emit('user_left_room', {
          userId,
          userName: user.name,
          roomId: user.currentRoom._id,
          roomName: user.currentRoom.name
        });
      }
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId,
        userName: user?.name
      });
      
      console.log(`User ${userId} explicitly went offline`);
    } catch (error) {
      console.error('Error in user_going_offline:', error);
    }
  });

  // Update user activity
  socket.on('user_activity', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { 
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  });

  // Handle user switching rooms (unified room management)
  socket.on('switch_room', async ({ userId, newRoomId, leaveRoomId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Leave previous room if specified
      if (leaveRoomId) {
        socket.leave(`room_${leaveRoomId}`);
        const leftRoom = await Room.findById(leaveRoomId);
        if (leftRoom) {
          socket.to(`room_${leaveRoomId}`).emit('user_left_room', {
            userId,
            userName: user.name,
            roomId: leaveRoomId,
            roomName: leftRoom.name
          });
        }
      }

      // Join new room
      if (newRoomId) {
        socket.join(`room_${newRoomId}`);
        const newRoom = await Room.findById(newRoomId);
        if (newRoom) {
          // Update user's current room
          await User.findByIdAndUpdate(userId, { currentRoom: newRoomId });
          
          socket.to(`room_${newRoomId}`).emit('user_joined_room', {
            userId,
            userName: user.name,
            roomId: newRoomId,
            roomName: newRoom.name
          });
        }
      }

      console.log(`User ${userId} switched from room ${leaveRoomId} to room ${newRoomId}`);
    } catch (error) {
      console.error('Error in switch_room:', error);
    }
  });

  // Handle disconnect - clean up user from all rooms
  socket.on('disconnect', async () => {
    if (socket.userId) {
      try {
        const userId = socket.userId;
        
        // Remove this socket connection from tracking
        if (userConnections.has(userId)) {
          userConnections.get(userId).delete(socket.id);
          
          // If user has no more active connections, set them offline
          if (userConnections.get(userId).size === 0) {
            userConnections.delete(userId);
            
            const user = await User.findById(userId).populate('currentRoom');
            
            // Set user offline only if they have no more connections
            await User.findByIdAndUpdate(userId, { 
              isOnline: false,
              lastActive: new Date()
            });

            // Notify all rooms user was in that they're going offline
            const homeRoom = await Room.findOne({ name: "Home" });
            if (homeRoom) {
              socket.to(`room_${homeRoom._id}`).emit('user_left_room', {
                userId: userId,
                userName: user?.name,
                roomId: homeRoom._id,
                roomName: "Home"
              });
            }

            if (user?.currentRoom && user.currentRoom._id.toString() !== homeRoom?._id.toString()) {
              socket.to(`room_${user.currentRoom._id}`).emit('user_left_room', {
                userId: userId,
                userName: user.name,
                roomId: user.currentRoom._id,
                roomName: user.currentRoom.name
              });
            }

            // Broadcast user offline status
            socket.broadcast.emit('user_offline', {
              userId: userId,
              userName: user?.name
            });

            console.log(`User ${userId} disconnected and cleaned up from all rooms (last connection)`);
          } else {
            console.log(`User ${userId} disconnected but still has ${userConnections.get(userId).size} active connections`);
          }
        }
      } catch (error) {
        console.error('Error during disconnect cleanup:', error);
      }
    }
  });
};

// Cleanup function to handle stale connections
const cleanupStaleConnections = (io) => {
  console.log('Running stale connection cleanup...');
  
  for (const [userId, socketIds] of userConnections.entries()) {
    const validSockets = new Set();
    
    // Check which sockets are still connected
    for (const socketId of socketIds) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.connected) {
        validSockets.add(socketId);
      }
    }
    
    // Update the connection tracking
    if (validSockets.size === 0) {
      // No valid connections, set user offline
      userConnections.delete(userId);
      User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastActive: new Date()
      }).catch(err => console.error('Error setting user offline during cleanup:', err));
      console.log(`Cleaned up stale connections for user ${userId} - set offline`);
    } else if (validSockets.size < socketIds.size) {
      // Some stale connections removed
      userConnections.set(userId, validSockets);
      console.log(`Cleaned up ${socketIds.size - validSockets.size} stale connections for user ${userId}`);
    }
  }
};

// Export the handler and cleanup function
module.exports = { 
  userHandler,
  cleanupStaleConnections,
  getUserConnections: () => userConnections // For debugging
}; 