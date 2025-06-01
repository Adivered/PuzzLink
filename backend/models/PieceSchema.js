const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true }
  },
  currentPosition: {
    row: Number,
    col: Number
  },
  imageData: {
    type: String,
    required: true
  },
  connections: {
    top: { type: Boolean, default: false },
    right: { type: Boolean, default: false },
    bottom: { type: Boolean, default: false },
    left: { type: Boolean, default: false }
  },
  isCorrectlyPlaced: {
    type: Boolean,
    default: false
  },
  rotation: {
    type: Number,
    default: 0,
    min: 0,
    max: 270
  },
  lastMovedAt: {
    type: Date,
    default: Date.now
  },
  lastMovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
PieceSchema.index({ 'position.row': 1, 'position.col': 1 });
PieceSchema.index({ 'currentPosition.row': 1, 'currentPosition.col': 1 });
PieceSchema.index({ isCorrectlyPlaced: 1 });

// Method to check if piece is in correct position
PieceSchema.methods.checkCorrectPlacement = function() {
  if (!this.currentPosition || !this.position) return false;
  
  return this.position.row === this.currentPosition.row && 
         this.position.col === this.currentPosition.col;
};

// Method to get piece neighbors
PieceSchema.methods.getNeighborPositions = function() {
  if (!this.position) return [];
  
  const { row, col } = this.position;
  return [
    { row: row - 1, col, direction: 'top' },
    { row, col: col + 1, direction: 'right' },
    { row: row + 1, col, direction: 'bottom' },
    { row, col: col - 1, direction: 'left' }
  ].filter(pos => pos.row >= 0 && pos.col >= 0);
};

// Static method to find pieces by position
PieceSchema.statics.findByPosition = function(row, col, isCurrentPosition = false) {
  const query = {};
  if (isCurrentPosition) {
    query['currentPosition.row'] = row;
    query['currentPosition.col'] = col;
  } else {
    query['position.row'] = row;
    query['position.col'] = col;
  }
  return this.findOne(query);
};

module.exports = mongoose.model('PieceSchema', PieceSchema);