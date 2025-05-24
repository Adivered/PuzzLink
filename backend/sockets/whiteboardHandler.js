const Whiteboard = require('../models/Whiteboard');
const { SOCKET_EVENTS, ROOM_NAMES } = require('./events');

const whiteboardHandler = (socket, io) => {
  // Join a whiteboard session
  socket.on(SOCKET_EVENTS.JOIN_GAME, async (gameId) => {
    try {
      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      socket.join(whiteboardRoom);
      console.log(`Socket ${socket.id} joined whiteboard: ${gameId}`);
      
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
          c => c.user._id.toString() === socket.userId.toString()
        );
        
        if (!existingCollaborator) {
          whiteboard.collaborators.push({
            user: socket.userId,
            joinedAt: new Date(),
            lastActive: new Date()
          });
          await whiteboard.save();
        }
        
        // Notify other users that someone joined
        socket.to(whiteboardRoom).emit(SOCKET_EVENTS.PLAYER_JOINED_GAME, {
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
      }
    } catch (error) {
      console.error('Error joining whiteboard:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join whiteboard' });
    }
  });

  // Leave whiteboard session
  socket.on(SOCKET_EVENTS.LEAVE_GAME, async (gameId) => {
    try {
      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      socket.leave(whiteboardRoom);
      console.log(`Socket ${socket.id} left whiteboard: ${gameId}`);
      
      // Update collaborator cursor visibility
      if (socket.userId) {
        const whiteboard = await Whiteboard.findOne({ game: gameId });
        if (whiteboard) {
          const success = await whiteboard.updateCollaboratorCursor(socket.userId, { visible: false });
          if (!success) {
            console.warn(`Failed to hide cursor for user ${socket.userId} leaving whiteboard ${gameId}`);
          }
        }
        
        // Notify other users
        socket.to(whiteboardRoom).emit(SOCKET_EVENTS.PLAYER_LEFT_GAME, {
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
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_START, ({ gameId, strokeData }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    socket.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_START, {
      gameId,
      strokeData: {
        ...strokeData,
        userId: socket.userId
      },
      timestamp: new Date()
    });
  });

  // Handle drawing movement
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, ({ gameId, strokeId, point }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    socket.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_DRAW_MOVE, {
      gameId,
      strokeId,
      point,
      userId: socket.userId,
      timestamp: new Date()
    });
  });

  // Handle drawing end and save stroke
  socket.on(SOCKET_EVENTS.WHITEBOARD_DRAW_END, async ({ gameId, strokeData }) => {
    try {
      const whiteboard = await Whiteboard.findOne({ game: gameId });
      if (!whiteboard) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      // Add stroke to whiteboard
      const completeStroke = {
        ...strokeData,
        userId: socket.userId,
        timestamp: new Date()
      };

      await whiteboard.addStroke(completeStroke);

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      
      // Broadcast the completed stroke to all users including sender
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_STROKE_ADDED, {
        gameId,
        stroke: completeStroke,
        version: whiteboard.version,
        timestamp: new Date()
      });

      console.log(`Stroke added to whiteboard ${gameId} by user ${socket.userId}`);
    } catch (error) {
      console.error('Error saving stroke:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to save stroke' });
    }
  });

  // Handle whiteboard clear
  socket.on(SOCKET_EVENTS.WHITEBOARD_CLEAR, async ({ gameId, clearAll = true }) => {
    try {
      const whiteboard = await Whiteboard.findOne({ game: gameId });
      if (!whiteboard) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      if (clearAll) {
        await whiteboard.clearStrokes();
      } else {
        await whiteboard.clearStrokes(socket.userId);
      }

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_CLEARED, {
        gameId,
        clearedBy: socket.userId,
        clearAll,
        version: whiteboard.version,
        timestamp: new Date()
      });

      console.log(`Whiteboard ${gameId} cleared by user ${socket.userId}`);
    } catch (error) {
      console.error('Error clearing whiteboard:', error);
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to clear whiteboard' });
    }
  });

  // Handle cursor position updates
  socket.on(SOCKET_EVENTS.WHITEBOARD_CURSOR_POSITION, async ({ gameId, x, y, visible = true }) => {
    try {
      if (!socket.userId) return;

      const whiteboard = await Whiteboard.findOne({ game: gameId });
      if (whiteboard) {
        const success = await whiteboard.updateCollaboratorCursor(socket.userId, { x, y, visible });
        if (!success) {
          // Log the error but don't send error to client as cursor updates are non-critical
          console.warn(`Failed to update cursor position for user ${socket.userId} in whiteboard ${gameId}`);
        }
      }

      // Always broadcast cursor position to other users regardless of DB update success
      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      socket.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_USER_CURSOR, {
        gameId,
        userId: socket.userId,
        x,
        y,
        visible,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in cursor position handler:', error);
      // Don't emit error to client for cursor positions as they are non-critical
    }
  });

  // Handle tool changes
  socket.on(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, ({ gameId, tool, color, size, opacity }) => {
    const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
    socket.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_TOOL_CHANGE, {
      gameId,
      userId: socket.userId,
      tool,
      color,
      size,
      opacity,
      timestamp: new Date()
    });
  });

  // Handle undo operation
  socket.on(SOCKET_EVENTS.WHITEBOARD_UNDO, async ({ gameId, strokeId }) => {
    try {
      const whiteboard = await Whiteboard.findOne({ game: gameId });
      if (!whiteboard) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Whiteboard not found' });
        return;
      }

      await whiteboard.removeStroke(strokeId);

      const whiteboardRoom = ROOM_NAMES.WHITEBOARD(gameId);
      io.to(whiteboardRoom).emit(SOCKET_EVENTS.WHITEBOARD_UNDO, {
        gameId,
        strokeId,
        undoneBy: socket.userId,
        version: whiteboard.version,
        timestamp: new Date()
      });

      console.log(`Stroke ${strokeId} undone from whiteboard ${gameId} by user ${socket.userId}`);
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