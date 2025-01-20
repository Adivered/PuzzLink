const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
  },
  gameMode: {
    type: String,
    enum: ['puzzle', 'drawablePuzzle', 'drawable'],
    required: true,
  },
  turnBased: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: null
  },
  imagePrompt: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'inProgress', 'completed'],
    default: 'waiting'
  },
  currentGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.pre('findOne', function(next) {
  this.populate({
    path: 'players',
    select: 'name picture currentRoom isOnline lastActive'
  });
  next();
});

roomSchema.pre('find', function(next) {
  this.populate({
    path: 'players',
    select: 'name picture currentRoom isOnline lastActive'
  });
  next();
});

module.exports = mongoose.model('Room', roomSchema);