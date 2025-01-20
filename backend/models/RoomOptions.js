const mongoose = require('mongoose');

const roomOptionsSchema = new mongoose.Schema({
  maxPlayers: {
    type: Number,
    min: 1,
    max: 8
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 5,
    max: 180
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

module.exports = mongoose.model('RoomOptions', roomOptionsSchema);