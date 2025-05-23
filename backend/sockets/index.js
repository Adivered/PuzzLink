const chatHandler = require('./chatHandler');
const userHandler = require('./userHandler');
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
};

module.exports = initializeSocket; 