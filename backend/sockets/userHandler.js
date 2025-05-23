const User = require('../models/User');

const userHandler = (socket, io) => {
  // Join user to their personal room for notifications
  socket.on('join_user', async (userId) => {
    try {
      socket.userId = userId; // Store userId on socket for reference
      socket.join(`user_${userId}`);
      
      // Update user online status
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        lastActive: new Date()
      });
      
      console.log(`User ${userId} joined personal room`);
      
      // Broadcast user online status to all connected clients
      socket.broadcast.emit('user_online', userId);
    } catch (error) {
      console.error('Error in join_user:', error);
      socket.emit('error', { message: 'Failed to join user room' });
    }
  });

  // Handle user going offline
  socket.on('user_going_offline', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastActive: new Date()
      });
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', userId);
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

  // Handle disconnect for user-specific cleanup
  socket.on('disconnect', async () => {
    if (socket.userId) {
      try {
        // Note: We don't immediately set user offline as they might have multiple tabs
        // Consider implementing a more sophisticated online/offline detection
        console.log(`User ${socket.userId} disconnected`);
        
        // You could implement a delayed offline status here
        // setTimeout(async () => {
        //   // Check if user has other active connections
        //   const userSockets = await io.in(`user_${socket.userId}`).fetchSockets();
        //   if (userSockets.length === 0) {
        //     await User.findByIdAndUpdate(socket.userId, { isOnline: false });
        //     io.emit('user_offline', socket.userId);
        //   }
        // }, 5000); // 5 second delay
      } catch (error) {
        console.error('Error in user disconnect cleanup:', error);
      }
    }
  });
};

module.exports = userHandler; 