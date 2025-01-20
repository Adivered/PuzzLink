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
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});


module.exports = mongoose.model('Puzzle', PuzzleSchema);