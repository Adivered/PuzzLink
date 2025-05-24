const chatHandler = require('./chatHandler');
const { userHandler, cleanupStaleConnections } = require('./userHandler');
const roomHandler = require('./roomHandler');
const gameHandler = require('./gameHandler');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Initialize all handlers with the socket instance
    userHandler(socket, io);
    chatHandler(socket, io);
    roomHandler(socket, io);
    gameHandler(socket, io);

    // Global disconnect handler
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      // Handle any global cleanup here
    });
  });

  // Set up periodic cleanup of stale connections (every 5 minutes)
  setInterval(() => {
    cleanupStaleConnections(io);
  }, 5 * 60 * 1000); // 5 minutes

  console.log('Socket handlers initialized with connection tracking');
};

module.exports = initializeSocket; 