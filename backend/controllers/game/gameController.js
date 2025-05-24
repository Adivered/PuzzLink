const Game = require('../../models/Game');
const Puzzle = require('../../models/Puzzle');
const Whiteboard = require('../../models/Whiteboard');

exports.getGameState = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId)
      .populate({
        path: 'room',
        select: 'name creator players gameMode',
        populate: {
          path: 'players',
          select: 'name picture'
        }
      })
      .populate({
        path: 'puzzle',
        populate: {
          path: 'pieces'
        }
      })
      .populate('whiteboard');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGameState = async (req, res) => {
  try {
    console.log("Updating Game")
    const { gameId } = req.params;
    const { pieceId, position } = req.body;
    console.log("Game ID: ", gameId)
    console.log("Piece ID: ", pieceId)
    console.log("Position: ", position)

    const game = await Game.findById(gameId)
      .populate({
        path: 'puzzle',
        populate: {
          path: 'pieces'
        }
      });

    console.log("Game: ", game)

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }
    console.log("Game Found")
    console.log("game.puzzle.pieces: ",game.puzzle.pieces)
    // Find and update the piece position
    const piece = game.puzzle.pieces.find(p => p._id.toString() === pieceId);
    console.log("Piece: ", piece)
    if (!piece) {
      return res.status(404).json({ message: 'Piece not found' });
    }

    console.log("Piece: ", piece)

    // Update piece position
    piece.currentPosition = position;
    
    // Check if piece is correctly placed
    piece.isCorrectlyPlaced = 
      piece.position.row === Math.floor(position / Math.sqrt(game.puzzle.pieces.length)) &&
      piece.position.col === position % Math.sqrt(game.puzzle.pieces.length);

    await game.puzzle.save();
    
    // Check if puzzle is completed
    if (game.puzzle.pieces.every(p => p.isCorrectlyPlaced)) {
      game.puzzle.isCompleted = true;
      game.puzzle.completedAt = new Date();
      await game.puzzle.save();
    }

    // Return updated game state
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.endGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    game.endTime = new Date();
    await game.save();

    res.json(game);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};