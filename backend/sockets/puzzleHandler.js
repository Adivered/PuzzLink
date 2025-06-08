const Game = require('../models/Game');
const Puzzle = require('../models/Puzzle');
const PieceSchema = require('../models/PieceSchema');

const puzzleHandler = (socket, io) => {
  // Get puzzle state (called when puzzle component loads)
  socket.on('get_puzzle_state', async ({ gameId }) => {
    try {
      
      // Get game with populated puzzle data
      const game = await Game.findById(gameId)
        .populate({
          path: 'puzzle',
          populate: {
            path: 'pieces'
          }
        })
        .populate('room');
      
      if (!game || !game.puzzle) {
        socket.emit('puzzle_error', { message: 'Game or puzzle not found' });
        return;
      }
      
      // Send current puzzle state to the user (they're already in the game room)
      const puzzleState = {
        gameId,
        puzzle: {
          _id: game.puzzle._id,
          originalImage: game.puzzle.originalImage,
          pieces: game.puzzle.pieces.map(piece => ({
            _id: piece._id,
            position: piece.position,
            currentPosition: piece.currentPosition,
            imageData: piece.imageData,
            isCorrectlyPlaced: piece.isCorrectlyPlaced
          })),
          isCompleted: game.puzzle.isCompleted,
          completedAt: game.puzzle.completedAt
        },
        moves: game.moves,
        startTime: game.startTime,
        endTime: game.endTime
      };
      
      // Debug logging
      const piecesInBank = puzzleState.puzzle.pieces.filter(p => !p.currentPosition);
      const piecesOnGrid = puzzleState.puzzle.pieces.filter(p => p.currentPosition);
      const piecesCorrectlyPlaced = puzzleState.puzzle.pieces.filter(p => p.isCorrectlyPlaced);
      
      console.log(`🧩 Sending puzzle state to ${socket.userId}:`, {
        gameId,
        totalPieces: puzzleState.puzzle.pieces.length,
        piecesInBank: piecesInBank.length,
        piecesOnGrid: piecesOnGrid.length,
        piecesCorrectlyPlaced: piecesCorrectlyPlaced.length,
        isCompleted: puzzleState.puzzle.isCompleted,
        moves: puzzleState.moves,
        actuallyCompleted: piecesCorrectlyPlaced.length === puzzleState.puzzle.pieces.length
      });
      
      // Force reset completion status if pieces are not actually all correctly placed
      if (puzzleState.puzzle.isCompleted && piecesCorrectlyPlaced.length < puzzleState.puzzle.pieces.length) {
        console.log(`⚠️ Puzzle marked as completed but only ${piecesCorrectlyPlaced.length}/${puzzleState.puzzle.pieces.length} pieces correctly placed. Fixing...`);
        
        // Update the puzzle in database
        await Puzzle.findByIdAndUpdate(game.puzzle._id, {
          isCompleted: false,
          completedAt: null
        });
        
        // Update game
        await Game.findByIdAndUpdate(gameId, {
          endTime: null
        });
        
        // Update the state we're sending
        puzzleState.puzzle.isCompleted = false;
        puzzleState.puzzle.completedAt = null;
        puzzleState.endTime = null;
      }
      
      socket.emit('puzzle_state_sync', puzzleState);
      
      console.log(`✅ User ${socket.userId} received puzzle state for game ${gameId}`);
      
    } catch (error) {
      console.error('Error getting puzzle state:', error);
      socket.emit('puzzle_error', { message: 'Failed to get puzzle state' });
    }
  });

  // Join a puzzle game
  socket.on('join_puzzle', async ({ gameId }) => {
    try {
      console.log(`🧩 User ${socket.userId} initializing puzzle game: ${gameId}`);
      
      // Get game with populated puzzle data
      const game = await Game.findById(gameId)
        .populate({
          path: 'puzzle',
          populate: {
            path: 'pieces'
          }
        })
        .populate('room');
      
      if (!game || !game.puzzle) {
        socket.emit('puzzle_error', { message: 'Game or puzzle not found' });
        return;
      }
      
      // Send current puzzle state to the user (they're already in the game room)
      const puzzleState = {
        gameId,
        puzzle: {
          _id: game.puzzle._id,
          originalImage: game.puzzle.originalImage,
          pieces: game.puzzle.pieces.map(piece => ({
            _id: piece._id,
            position: piece.position,
            currentPosition: piece.currentPosition,
            imageData: piece.imageData,
            isCorrectlyPlaced: piece.isCorrectlyPlaced
          })),
          isCompleted: game.puzzle.isCompleted,
          completedAt: game.puzzle.completedAt
        },
        moves: game.moves,
        startTime: game.startTime,
        endTime: game.endTime
      };
      
      // Debug logging
      const piecesInBank = puzzleState.puzzle.pieces.filter(p => !p.currentPosition);
      const piecesOnGrid = puzzleState.puzzle.pieces.filter(p => p.currentPosition);
      const piecesCorrectlyPlaced = puzzleState.puzzle.pieces.filter(p => p.isCorrectlyPlaced);
      
      console.log(`🧩 Sending puzzle state to ${socket.userId}:`, {
        gameId,
        totalPieces: puzzleState.puzzle.pieces.length,
        piecesInBank: piecesInBank.length,
        piecesOnGrid: piecesOnGrid.length,
        piecesCorrectlyPlaced: piecesCorrectlyPlaced.length,
        isCompleted: puzzleState.puzzle.isCompleted,
        moves: puzzleState.moves,
        actuallyCompleted: piecesCorrectlyPlaced.length === puzzleState.puzzle.pieces.length
      });
      
      // Force reset completion status if pieces are not actually all correctly placed
      if (puzzleState.puzzle.isCompleted && piecesCorrectlyPlaced.length < puzzleState.puzzle.pieces.length) {
        console.log(`⚠️ Puzzle marked as completed but only ${piecesCorrectlyPlaced.length}/${puzzleState.puzzle.pieces.length} pieces correctly placed. Fixing...`);
        
        // Update the puzzle in database
        await Puzzle.findByIdAndUpdate(game.puzzle._id, {
          isCompleted: false,
          completedAt: null
        });
        
        // Update game
        await Game.findByIdAndUpdate(gameId, {
          endTime: null
        });
        
        // Update the state we're sending
        puzzleState.puzzle.isCompleted = false;
        puzzleState.puzzle.completedAt = null;
        puzzleState.endTime = null;
      }
      
      socket.emit('puzzle_state_sync', puzzleState);
      
      console.log(`✅ User ${socket.userId} initialized puzzle game ${gameId}`);
      
    } catch (error) {
      console.error('Error initializing puzzle:', error);
      socket.emit('puzzle_error', { message: 'Failed to initialize puzzle game' });
    }
  });

  // Handle piece movement - OPTIMIZED for performance
  socket.on('move_piece', async ({ gameId, pieceId, fromPosition, toPosition, moveType }) => {
    try {
      console.log(`🧩 Quick piece move: ${pieceId} from ${JSON.stringify(fromPosition)} to ${JSON.stringify(toPosition)}`);
      
      // Get game and puzzle in one query with minimal data
      const game = await Game.findById(gameId).select('puzzle room moves').populate({
        path: 'puzzle',
        select: 'pieces isCompleted'
      });
      
      if (!game || !game.puzzle) {
        socket.emit('puzzle_error', { message: 'Game not found' });
        return;
      }
      
      // Validate position quickly
      if (toPosition && (toPosition.row < 0 || toPosition.col < 0)) {
        socket.emit('puzzle_error', { message: 'Invalid position' });
        return;
      }
      
      let swappedPieceId = null;
      
      // Handle grid moves with potential swaps
      if (toPosition && moveType === 'grid') {
        // Check for occupied position and handle swap in one operation
        const occupyingPiece = await PieceSchema.findOneAndUpdate(
          {
            _id: { $in: game.puzzle.pieces },
            'currentPosition.row': toPosition.row,
            'currentPosition.col': toPosition.col,
            _id: { $ne: pieceId }
          },
          { currentPosition: fromPosition },
          { new: true }
        );
        
        if (occupyingPiece) {
          swappedPieceId = occupyingPiece._id;
        }
      }
      
      // Get the piece first to check its correct position
      const piece = await PieceSchema.findById(pieceId).select('position');
      if (!piece) {
        socket.emit('puzzle_error', { message: 'Piece not found' });
        return;
      }
      
      // Calculate if the piece will be correctly placed
      const isCorrectlyPlaced = toPosition && piece.position && 
        piece.position.row === toPosition.row && 
        piece.position.col === toPosition.col;
      
      // Update the piece with both position and correctness
      const updatedPiece = await PieceSchema.findByIdAndUpdate(
        pieceId,
        {
          currentPosition: toPosition,
          isCorrectlyPlaced: isCorrectlyPlaced
        },
        { new: true, select: 'isCorrectlyPlaced currentPosition position' }
      );
      
      // Increment move counter efficiently
      const gameUpdate = await Game.findByIdAndUpdate(
        gameId,
        { $inc: { moves: 1 } },
        { new: true, select: 'moves' }
      );
      
      // Broadcast to room immediately
      const gameRoom = `room_${game.room._id || game.room}`;
      const broadcastData = {
        gameId,
        pieceId,
        fromPosition,
        toPosition,
        moveType,
        isCorrectlyPlaced,
        movedBy: socket.userId,
        totalMoves: gameUpdate.moves
      };
      
      // Broadcast swap if it happened
      if (swappedPieceId) {
        io.to(gameRoom).emit('piece_moved', {
          gameId,
          pieceId: swappedPieceId,
          fromPosition: toPosition,
          toPosition: fromPosition,
          moveType: 'swap',
          movedBy: socket.userId
        });
      }
      
      // Broadcast main move - include sender so everyone gets same state
      io.to(gameRoom).emit('piece_moved', broadcastData);
      
      // Check completion status asynchronously (don't block the response)
      setImmediate(async () => {
        try {
          const correctPieces = await PieceSchema.countDocuments({
            _id: { $in: game.puzzle.pieces },
            isCorrectlyPlaced: true
          });
          
          const totalPieces = game.puzzle.pieces.length;
          
          if (correctPieces === totalPieces && !game.puzzle.isCompleted) {
            // Mark puzzle as completed
            const now = new Date();
            await Promise.all([
              Game.findByIdAndUpdate(gameId, { endTime: now }),
              game.puzzle.updateOne({ 
                isCompleted: true, 
                completedAt: now 
              })
            ]);
            
            // Broadcast completion
            io.to(gameRoom).emit('puzzle_completed', {
              gameId,
              completedAt: now,
              totalMoves: gameUpdate.moves,
              duration: now - game.startTime,
              completedBy: socket.userId
            });
            
            console.log(`🎉 Puzzle ${gameId} completed by user ${socket.userId}!`);
          }
        } catch (error) {
          console.error('Error checking completion:', error);
        }
      });
      
    } catch (error) {
      console.error('Error moving piece:', error);
      socket.emit('puzzle_error', { message: 'Failed to move piece' });
    }
  });

  // Handle hint request
  socket.on('request_hint', async ({ gameId }) => {
    try {
      const game = await Game.findById(gameId).populate('puzzle');
      if (!game || !game.puzzle) {
        socket.emit('puzzle_error', { message: 'Game not found' });
        return;
      }
      
      // Find a misplaced piece
      const allPieces = await PieceSchema.find({ _id: { $in: game.puzzle.pieces } });
      const misplacedPieces = allPieces.filter(p => !p.isCorrectlyPlaced);
      
      if (misplacedPieces.length > 0) {
        const randomPiece = misplacedPieces[Math.floor(Math.random() * misplacedPieces.length)];
        
        socket.emit('hint_provided', {
          gameId,
          pieceId: randomPiece._id,
          correctPosition: randomPiece.position,
          currentPosition: randomPiece.currentPosition
        });
        
        // Broadcast hint usage to other players
        const gameRoom = `room_${game.room._id || game.room}`;
        socket.to(gameRoom).emit('hint_used', {
          gameId,
          usedBy: socket.userId
        });
      } else {
        socket.emit('puzzle_error', { message: 'No hints available - puzzle is complete!' });
      }
      
    } catch (error) {
      console.error('Error providing hint:', error);
      socket.emit('puzzle_error', { message: 'Failed to provide hint' });
    }
  });

  // Handle puzzle reset
  socket.on('reset_puzzle', async ({ gameId }) => {
    try {
      const game = await Game.findById(gameId).populate('puzzle');
      if (!game || !game.puzzle) {
        socket.emit('puzzle_error', { message: 'Game not found' });
        return;
      }
      
      // Reset all pieces to bank (no current position)
      await PieceSchema.updateMany(
        { _id: { $in: game.puzzle.pieces } },
        { 
          $unset: { currentPosition: 1 },
          $set: { isCorrectlyPlaced: false }
        }
      );
      
      // Reset game state
      game.moves = 0;
      game.startTime = new Date();
      game.endTime = null;
      game.puzzle.isCompleted = false;
      game.puzzle.completedAt = null;
      
      await game.save();
      await game.puzzle.save();
      
      // Broadcast reset to all players
      const gameRoom = `room_${game.room._id || game.room}`;
      io.to(gameRoom).emit('puzzle_reset', {
        gameId,
        resetBy: socket.userId,
        newStartTime: game.startTime
      });
      
      console.log(`🔄 Puzzle ${gameId} reset by user ${socket.userId}`);
      
    } catch (error) {
      console.error('Error resetting puzzle:', error);
      socket.emit('puzzle_error', { message: 'Failed to reset puzzle' });
    }
  });

  // Handle game time expiration
  socket.on('game_time_expired', async ({ gameId, roomId }) => {
    try {
      console.log(`⏰ Game time expired for game ${gameId}, closing room ${roomId}`);
      
      // Update room status to completed
      const Room = require('../models/Room');
      await Room.findByIdAndUpdate(roomId, { 
        status: 'completed',
        endTime: new Date()
      });
      
      // Update game end time
      await Game.findByIdAndUpdate(gameId, { 
        endTime: new Date()
      });
      
      // Notify all players in the room that time is up and room is closing
      const roomSocketName = `room_${roomId}`;
      io.to(roomSocketName).emit('room_closed', {
        roomId,
        gameId,
        reason: 'time_expired',
        message: 'Time limit exceeded! The room has been closed.',
        timestamp: new Date()
      });
      
      console.log(`✅ Room ${roomId} closed due to time expiration`);
      
    } catch (error) {
      console.error('Error handling game time expiration:', error);
      socket.emit('puzzle_error', { message: 'Failed to handle time expiration' });
    }
  });

  // Handle leave room from game - use a different event name to avoid conflicts
  socket.on('leave_game_room', async ({ gameId }) => {
    try {
      console.log(`👋 User ${socket.userId} leaving game ${gameId}`);
      
      // Validate gameId to prevent undefined errors
      if (!gameId) {
        console.warn(`⚠️ Invalid gameId (${gameId}) for leave_game_room`);
        return;
      }
      
      // Get the game to find the room
      const game = await Game.findById(gameId).populate('room');
      if (!game || !game.room) {
        console.warn(`⚠️ Game ${gameId} or room not found`);
        socket.emit('puzzle_error', { message: 'Game or room not found' });
        return;
      }
      
      const roomId = game.room._id;
      const roomSocketName = `room_${roomId}`;
      
      // Remove user from room players
      const Room = require('../models/Room');
      await Room.findByIdAndUpdate(roomId, {
        $pull: { players: socket.userId }
      });
      
      // Leave the socket room
      socket.leave(roomSocketName);
      
      // Notify other players that this user left
      socket.to(roomSocketName).emit('player_left_room', {
        roomId,
        gameId,
        userId: socket.userId,
        timestamp: new Date()
      });
      
      // Confirm to the user that they left
      socket.emit('player_left_room', {
        roomId,
        gameId,
        userId: socket.userId,
        currentUserId: socket.userId, // This flags it as the current user leaving
        timestamp: new Date()
      });
      
      console.log(`✅ User ${socket.userId} left room ${roomId}`);
      
    } catch (error) {
      console.error('Error handling leave room:', error);
      socket.emit('puzzle_error', { message: 'Failed to leave room' });
    }
  });
};

module.exports = puzzleHandler; 