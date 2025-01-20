const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
  position: {
    row: Number,
    col: Number
  },
  currentPosition: {
    row: Number,
    col: Number
  },
  imageData: String,
  connections: {
    top: Boolean,
    right: Boolean,
    bottom: Boolean,
    left: Boolean
  },
  isCorrectlyPlaced: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('PieceSchema', PieceSchema);