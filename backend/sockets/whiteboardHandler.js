const Whiteboard = require('../models/Whiteboard');
const Game = require('../models/Game');
const User = require('../models/User');
const { SOCKET_EVENTS, ROOM_NAMES } = require('./events');

const whiteboardHandler = (socket, io) => {
  // Join a whiteboard session
  socket.on(SOCKET_EVENTS.JOIN_GAME, async (gameId) => {
    try {
      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      const gameRoom = ROOM_NAMES.GAME(gameId);
      
      console.log(`🎮 User ${socket.userId} attempting to join whiteboard ${gameId}`);
      console.log(`📍 Target rooms: ${whiteboardRoom}, ${gameRoom}`);
      
      // Find the game and populate the room to ensure user is authorized
      const game = await Game.findById(gameId).populate('room');
      
      // Join both whiteboard and game rooms
      socket.join(whiteboardRoom);
      socket.join(gameRoom);
      
      // Also join the regular room for this game
      if (game && game.room) {
        const regularRoomName = `room_${game.room._id}`;
        socket.join(regularRoomName);
        console.log(`🏠 Also joined regular room: ${regularRoomName}`);
      }
      
      // Verify socket is in rooms
      const socketRooms = Array.from(socket.rooms);
      console.log(`✅ Socket ${socket.id} joined rooms successfully. All rooms:`, socketRooms);
      
      console.log(`Socket ${socket.id} joined whiteboard: ${gameId} (rooms: ${whiteboardRoom}, ${gameRoom})`);
      if (!game) {
        console.error(`❌ Game ${gameId} not found`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game not found' });
        return;
      }
      
      console.log(`🎯 Game found: ${game._id}, Room: ${game.room?._id || 'No room'}`);
      
      // Check if user is a member of the game's room with retry logic
      if (socket.userId && game.room) {
        const isRoomMember = game.room.players.includes(socket.userId);
        console.log(`🔒 User ${socket.userId} room membership check: ${isRoomMember}`);
        
        if (!isRoomMember) {
          // Check if user is currently in the room socket (they might be joining)
          const roomSocketName = `room_${game.room._id}`;
          const userInRoomSocket = socket.rooms.has(roomSocketName);
          console.log(`🔍 User ${socket.userId} in room socket ${roomSocketName}: ${userInRoomSocket}`);
          
          // Also check if user's current room matches the game room
          const user = await User.findById(socket.userId);
          const userCurrentRoom = user?.currentRoom?.toString();
          const gameRoomId = game.room._id.toString();
          const userInCorrectRoom = userCurrentRoom === gameRoomId;
          
          console.log(`🔍 User current room: ${userCurrentRoom}, Game room: ${gameRoomId}, Match: ${userInCorrectRoom}`);
          
          if (!userInRoomSocket && !userInCorrectRoom) {
            console.error(`❌ User ${socket.userId} not authorized for game ${gameId} - not in room or socket`);
            socket.emit(SOCKET_EVENTS.ERROR, { message: 'You are not a member of this game' });
            return;
          } else {
            console.log(`✅ User ${socket.userId} authorized for game ${gameId} - joining in progress`);
          }
        } else {
          console.log(`✅ User ${socket.userId} authorized for game ${gameId} - in room players`);
        }
      }
      
      // Find existing whiteboard or create new one
      let whiteboard = await Whiteboard.findOne({ game: gameId })
        .populate('collaborators.user', 'name picture');
      
      if (!whiteboard) {
        whiteboard = new Whiteboard({ game: gameId });
        await whiteboard.save();
      }
      
      // Add user as collaborator if not already present
      if (socket.userId) {
        const existingCollaborator = whiteboard.collaborators.find(
          c => c.user && c.user._id.toString() === socket.userId.toString()
        );
        
        if (!existingCollaborator) {
          whiteboard.collaborators.push({
            user: socket.userId,
            joinedAt: new Date(),
            lastActive: new Date()
          });
          await whiteboard.save();
          
          // Re-populate after save
          await whiteboard.populate('collaborators.user', 'name picture');
        }
        
        // Notify other users in both rooms that someone joined
        socket.to(whiteboardRoom).emit(SOCKET_EVENTS.PLAYER_JOINED_GAME, {
          userId: socket.userId,
          gameId,
          timestamp: new Date()
        });
        
        socket.to(gameRoom).emit(SOCKET_EVENTS.PLAYER_JOINED_GAME, {
          userId: socket.userId,
          gameId,
          timestamp: new Date()
        });
        
        // Send current whiteboard state to the joining user
        socket.emit(SOCKET_EVENTS.WHITEBOARD_STATE_SYNC, {
          gameId,
          strokes: whiteboard.strokes,
          background: whiteboard.background,
          dimensions: whiteboard.dimensions,
          collaborators: whiteboard.collaborators,
          version: whiteboard.version
        });
        
        console.log(`User ${socket.userId} joined whiteboard ${gameId}, ${whiteboard.collaborators.length} total collaborators`);
        console.log(`📊 Current whiteboard state: ${whiteboard.strokes.length} strokes, version ${whiteboard.version}`);
      }
    } catch (error) {
      console.error('Error joining whiteboard:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        gameId,
        userId: socket.userId
      });
      socket.emit(SOCKET_EVENTS.ERROR, { 
        message: 'Failed to join whiteboard',
        details: error.message 
      });
    }
  });

  // Leave whiteboard session
  socket.on(SOCKET_EVENTS.LEAVE_GAME, async (gameId) => {
    try {
      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      const gameRoom = ROOM_NAMES.GAME(gameId);
      
      socket.leave(whiteboardRoom);
      socket.leave(gameRoom);
      
      console.log(`Socket ${socket.id} left whiteboard: ${gameId}`);
      
      // Update collaborator cursor visibility
      if (socket.userId) {
        const whiteboard = await Whiteboard.findOne({ game: gameId });
        if (whiteboard) {
          const collaborator = whiteboard.collaborators.find(
            c => c.user && c.user._id.toString() === socket.userId.toString()
          );
          
          if (collaborator && collaborator.cursor) {
            collaborator.cursor.visible = false;
            await whiteboard.save();
          }
        }
        
        // Notify other users in both rooms
        socket.to(whiteboardRoom).emit(SOCKET_EVENTS.PLAYER_LEFT_GAME, {
          userId: socket.userId,
          gameId,
          timestamp: new Date()
        });
        
        socket.to(gameRoom).emit(SOCKET_EVENTS.PLAYER_LEFT_GAME, {
          userId: socket.userId,
          gameId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error leaving whiteboard:', error);
    }
  });

  // Handle drawing start
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_START, async ({ gameId, strokeData }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    const gameRoom = ROOM_NAMES.GAME(gameId);
    
    console.log(`🎨 Broadcasting draw start to rooms: ${whiteboardRoom}, ${gameRoom}`);
    
    const broadcastData = {
      gameId,
      strokeData: {
        ...strokeData,
        userId: socket.userId
      },
      timestamp: new Date()
    };
    
    // Get room sockets for aggressive broadcasting
    const roomSockets = await io.in(whiteboardRoom).fetchSockets();
    console.log(`📡 Broadcasting draw start to ${roomSockets.length} sockets`);
    
    // AGGRESSIVELY broadcast to ALL users in BOTH rooms
    io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_START, broadcastData);
    io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_START, broadcastData);
    
    // Also emit to sender as fallback
    socket.emit(SOCKET_EVENTS.WHITEBOARD_DRAW_START, broadcastData);
    
    // Direct emit to each socket as additional fallback
    roomSockets.forEach(s => {
      s.emit(SOCKET_EVENTS.WHITEBOARD_DRAW_START, broadcastData);
    });
  });

  // Handle drawing movement
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, ({ gameId, strokeId, point }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    const gameRoom = ROOM_NAMES.GAME(gameId);
    
    const broadcastData = {
      gameId,
      strokeId,
      point,
      userId: socket.userId,
      timestamp: new Date()
    };
    
    // AGGRESSIVELY broadcast to ALL users in BOTH rooms
    io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, broadcastData);
    io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, broadcastData);
    
    // Also emit to sender as fallback
    socket.emit(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, broadcastData);
  });

  // Handle drawing end and save stroke
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_END, async ({ gameId, strokeData }) => {
    try {
      console.log(`📝 Saving stroke for game ${gameId}:`, {
        strokeId: strokeData.id,
        userId: socket.userId,
        pointCount: strokeData.points?.length || 0,
        tool: strokeData.tool
      });

      // Add stroke to whiteboard using atomic operation
      const completeStroke = {
        ...strokeData,
        userId: socket.userId,
        timestamp: new Date()
      };

      const updatedWhiteboard = await Whiteboard.findOneAndUpdate(
        { game: gameId },
        {
          $push: { strokes: completeStroke },
          $inc: { version: 1 }
        },
        { 
          new: true,
          runValidators: false,
          maxTimeMS: 5000 // Add timeout
        }
      );

      if (!updatedWhiteboard) {
        console.error(`❌ Whiteboard not found for game: ${gameId}`);
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      const gameRoom = ROOM_NAMES.GAME(gameId);
      
      // Get all sockets in the room for debugging
      const roomSockets = await io.in(whiteboardRoom).fetchSockets();
      const gameRoomSockets = await io.in(gameRoom).fetchSockets();
      console.log(`✅ Stroke saved successfully, broadcasting to rooms:`);
      console.log(`📡 Whiteboard room ${whiteboardRoom} has ${roomSockets.length} sockets:`, roomSockets.map(s => s.id));
      console.log(`📡 Game room ${gameRoom} has ${gameRoomSockets.length} sockets:`, gameRoomSockets.map(s => s.id));
      
      // Broadcast the completed stroke to all users including sender
      const broadcastData = {
        gameId,
        stroke: completeStroke,
        version: updatedWhiteboard.version,
        timestamp: new Date()
      };
      
      console.log(`📤 Broadcasting stroke data:`, {
        strokeId: completeStroke.id,
        userId: completeStroke.userId,
        version: updatedWhiteboard.version
      });
      
      // AGGRESSIVELY broadcast to BOTH rooms and ALL possible sockets
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_STROKE_ADDED, broadcastData);
      io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_STROKE_ADDED, broadcastData);
      
      // Also emit to the sender directly as a fallback
      socket.emit(SOCKET_EVENTS.WHITEBOARD_STROKE_ADDED, broadcastData);
      
      // Broadcast to individual sockets as additional fallback
      roomSockets.forEach(s => {
        console.log(`📤 Direct emit to socket ${s.id}`);
        s.emit(SOCKET_EVENTS.WHITEBOARD_STROKE_ADDED, broadcastData);
      });

      console.log(`Stroke added to whiteboard ${gameId} by user ${socket.userId}, version: ${updatedWhiteboard.version}`);
    } catch (error) {
      console.error('Error saving stroke:', error);
      
      // Send specific error message to client
      socket.emit(SOCKET_EVENTS.ERROR, { 
        message: 'Failed to save stroke',
        details: error.message,
        strokeId: strokeData?.id
      });
    }
  });

  // Handle whiteboard clear
  socket.on(SOCKET_EVENTS.WHITEBOARD_CLEAR, async ({ gameId, clearAll = true }) => {
    try {
      let updateOperation;
      
      if (clearAll) {
        updateOperation = {
          $set: { strokes: [] },
          $inc: { version: 1 }
        };
      } else {
        // Clear only strokes by this user
        updateOperation = {
          $pull: { strokes: { userId: socket.userId } },
          $inc: { version: 1 }
        };
      }

      const updatedWhiteboard = await Whiteboard.findOneAndUpdate(
        { game: gameId },
        updateOperation,
        { 
          new: true,
          runValidators: false
        }
      );

      if (!updatedWhiteboard) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      const gameRoom = ROOM_NAMES.GAME(gameId);
      
      const broadcastData = {
        gameId,
        clearedBy: socket.userId,
        clearAll,
        version: updatedWhiteboard.version,
        timestamp: new Date()
      };
      
      console.log(`📤 Broadcasting whiteboard clear to rooms: ${whiteboardRoom}, ${gameRoom}`);
      
      // AGGRESSIVELY broadcast to BOTH rooms
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_CLEARED, broadcastData);
      io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_CLEARED, broadcastData);
      
      // Also emit to sender as fallback
      socket.emit(SOCKET_EVENTS.WHITEBOARD_CLEARED, broadcastData);

      console.log(`Whiteboard ${gameId} cleared by user ${socket.userId}, version: ${updatedWhiteboard.version}`);
    } catch (error) {
      console.error('Error clearing whiteboard:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to clear whiteboard' });
    }
  });

  // Handle tool changes
  socket.on(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, ({ gameId, tool, color, size, opacity }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    const gameRoom = ROOM_NAMES.GAME(gameId);
    
    console.log(`🔧 Broadcasting tool change to rooms: ${whiteboardRoom}, ${gameRoom}`);
    
    const broadcastData = {
      gameId,
      userId: socket.userId,
      tool,
      color,
      size,
      opacity,
      timestamp: new Date()
    };
    
    // AGGRESSIVELY broadcast to BOTH rooms
    io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, broadcastData);
    io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, broadcastData);
    
    // Also emit to sender as fallback
    socket.emit(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, broadcastData);
  });

  // Handle undo operation
  socket.on(SOCKET_EVENTS.WHITEBOARD_UNDO, async ({ gameId, strokeId }) => {
    try {
      const updatedWhiteboard = await Whiteboard.findOneAndUpdate(
        { game: gameId },
        {
          $pull: { strokes: { id: strokeId } },
          $inc: { version: 1 }
        },
        { 
          new: true,
          runValidators: false
        }
      );

      if (!updatedWhiteboard) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      const gameRoom = ROOM_NAMES.GAME(gameId);
      
      const broadcastData = {
        gameId,
        strokeId,
        undoneBy: socket.userId,
        version: updatedWhiteboard.version,
        timestamp: new Date()
      };
      
      console.log(`📤 Broadcasting undo to rooms: ${whiteboardRoom}, ${gameRoom}`);
      
      // AGGRESSIVELY broadcast to BOTH rooms
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_UNDO, broadcastData);
      io.to(gameRoom).emit(SOCKET_EVENTS.WHITEBOARD_UNDO, broadcastData);
      
      // Also emit to sender as fallback
      socket.emit(SOCKET_EVENTS.WHITEBOARD_UNDO, broadcastData);

      console.log(`Stroke ${strokeId} undone from whiteboard ${gameId} by user ${socket.userId}, version: ${updatedWhiteboard.version}`);
    } catch (error) {
      console.error('Error undoing stroke:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to undo stroke' });
    }
  });

  // Request current whiteboard state
  socket.on(SOCKET_EVENTS.REQUEST_GAME_STATE, async ({ gameId }) => {
    try {
      const whiteboard = await Whiteboard.findOne({ game: gameId })
        .populate('collaborators.user', 'name picture');
      
      if (whiteboard) {
        socket.emit(SOCKET_EVENTS.WHITEBOARD_STATE_SYNC, {
          gameId,
          strokes: whiteboard.strokes,
          background: whiteboard.background,
          dimensions: whiteboard.dimensions,
          collaborators: whiteboard.collaborators,
          version: whiteboard.version
        });
      }
    } catch (error) {
      console.error('Error syncing whiteboard state:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to sync whiteboard state' });
    }
  });
};

module.exports = whiteboardHandler; 