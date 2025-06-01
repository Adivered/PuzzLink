// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[${process.env.NODE_ENV === 'production' ? 0 : 1}] New client connected: ${socket.id.slice(-12)}`);
  
  // Import handlers
  setupPuzzleHandler(socket, io);
  setupChatHandler(socket, io);
  setupUserHandler(socket, io);
  
  socket.on('disconnect', () => {
    console.log(`[${process.env.NODE_ENV === 'production' ? 0 : 1}] Client disconnected: ${socket.id.slice(-12)}`);
  });
}); 