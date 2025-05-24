const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  puzzle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Puzzle',
  },
  whiteboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Whiteboard',
  },
  moves: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
}
);

GameSchema.methods.checkCompletion = function() {
  const allPiecesCorrect = this.puzzle.pieces.every(piece => 
    piece.isCorrectlyPlaced &&
    piece.position.row === piece.currentPosition.row &&
    piece.position.col === piece.currentPosition.col
  );
  
  if (allPiecesCorrect && !this.puzzle.isCompleted) {
    this.puzzle.isCompleted = true;
    this.puzzle.completedAt = new Date();
    this.status = 'completed';
  }
  
  return allPiecesCorrect;
};


module.exports = mongoose.model('Game', GameSchema);