const mongoose = require('mongoose');
const PieceSchema = require('./PieceSchema');

const PuzzleSchema = new mongoose.Schema({
  originalImage: {
    url: String,
    width: Number,
    height: Number
  },
  pieces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PieceSchema'
  }],
  gridSize: {
    type: Number,
    default: 4,
    min: 2,
    max: 10
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
PuzzleSchema.index({ isCompleted: 1, createdAt: -1 });

// Virtual for total pieces count
PuzzleSchema.virtual('totalPieces').get(function() {
  return this.gridSize * this.gridSize;
});

// Method to check if puzzle is solvable
PuzzleSchema.methods.isSolvable = function() {
  return this.pieces && this.pieces.length === this.totalPieces;
};

// Method to get completion percentage
PuzzleSchema.methods.getCompletionPercentage = function() {
  if (!this.pieces || this.pieces.length === 0) return 0;
  
  const correctPieces = this.pieces.filter(piece => piece.isCorrectlyPlaced).length;
  return Math.round((correctPieces / this.pieces.length) * 100);
};

module.exports = mongoose.model('Puzzle', PuzzleSchema);