const Game = require('../models/Game');

const gameHandler = (socket, io) => {
  // Join a game
  socket.on('join_game', async (gameId) => {
    try {
      socket.join(`game_${gameId}`);
      console.log(`Socket ${socket.id} joined game: ${gameId}`);
      
      // Notify other players that someone joined
      if (socket.userId) {
        socket.to(`game_${gameId}`).emit('player_joined_game', {
          userId: socket.userId,
          gameId
        });
      }
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // Leave a game
  socket.on('leave_game', (gameId) => {
    socket.leave(`game_${gameId}`);
    console.log(`Socket ${socket.id} left game: ${gameId}`);
    
    // Notify other players
    if (socket.userId) {
      socket.to(`game_${gameId}`).emit('player_left_game', {
        userId: socket.userId,
        gameId
      });
    }
  });

  // Puzzle piece moved
  socket.on('piece_moved', ({ gameId, pieceId, fromPosition, toPosition, playerId }) => {
    // Broadcast piece movement to other players
    socket.to(`game_${gameId}`).emit('piece_moved', {
      gameId,
      pieceId,
      fromPosition,
      toPosition,
      playerId,
      timestamp: new Date()
    });
    
    console.log(`Piece ${pieceId} moved in game ${gameId} by player ${playerId}`);
  });

  // Puzzle piece placed correctly
  socket.on('piece_placed_correctly', ({ gameId, pieceId, position, playerId }) => {
    io.to(`game_${gameId}`).emit('piece_placed_correctly', {
      gameId,
      pieceId,
      position,
      playerId,
      timestamp: new Date()
    });
    
    console.log(`Piece ${pieceId} placed correctly in game ${gameId} by player ${playerId}`);
  });

  // Game progress update
  socket.on('game_progress', ({ gameId, progress, playerId }) => {
    socket.to(`game_${gameId}`).emit('game_progress_update', {
      gameId,
      progress,
      playerId,
      timestamp: new Date()
    });
  });

  // Hint used
  socket.on('hint_used', ({ gameId, hintType, playerId }) => {
    socket.to(`game_${gameId}`).emit('hint_used', {
      gameId,
      hintType,
      playerId,
      timestamp: new Date()
    });
    
    console.log(`Hint ${hintType} used in game ${gameId} by player ${playerId}`);
  });

  // Game completed
  socket.on('game_completed', async ({ gameId, completionTime, playerId }) => {
    try {
      // Update game status
      await Game.findByIdAndUpdate(gameId, {
        status: 'completed',
        completedAt: new Date(),
        completionTime
      });

      // Notify all players
      io.to(`game_${gameId}`).emit('game_completed', {
        gameId,
        completionTime,
        playerId,
        timestamp: new Date()
      });
      
      console.log(`Game ${gameId} completed by player ${playerId} in ${completionTime}ms`);
    } catch (error) {
      console.error('Error updating game completion:', error);
    }
  });

  // Player cursor/mouse position (for collaborative features)
  socket.on('cursor_position', ({ gameId, x, y, playerId }) => {
    socket.to(`game_${gameId}`).emit('player_cursor', {
      gameId,
      x,
      y,
      playerId
    });
  });

  // Turn-based game events
  socket.on('turn_started', ({ gameId, playerId, turnNumber }) => {
    io.to(`game_${gameId}`).emit('turn_started', {
      gameId,
      playerId,
      turnNumber,
      timestamp: new Date()
    });
    
    console.log(`Turn ${turnNumber} started for player ${playerId} in game ${gameId}`);
  });

  socket.on('turn_ended', ({ gameId, playerId, turnNumber }) => {
    socket.to(`game_${gameId}`).emit('turn_ended', {
      gameId,
      playerId,
      turnNumber,
      timestamp: new Date()
    });
    
    console.log(`Turn ${turnNumber} ended for player ${playerId} in game ${gameId}`);
  });

  // Game pause/resume
  socket.on('game_paused', ({ gameId, playerId }) => {
    socket.to(`game_${gameId}`).emit('game_paused', {
      gameId,
      playerId,
      timestamp: new Date()
    });
  });

  socket.on('game_resumed', ({ gameId, playerId }) => {
    socket.to(`game_${gameId}`).emit('game_resumed', {
      gameId,
      playerId,
      timestamp: new Date()
    });
  });

  // Spectator events
  socket.on('join_as_spectator', ({ gameId }) => {
    socket.join(`game_${gameId}_spectators`);
    console.log(`Socket ${socket.id} joined as spectator for game: ${gameId}`);
  });

  // Game state sync request
  socket.on('request_game_state', ({ gameId }) => {
    // Emit current game state to requesting client
    // This would typically fetch the current game state from database
    socket.emit('game_state_sync', {
      gameId,
      // gameState data would go here
    });
  });
};

module.exports = gameHandler; 