const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalGamesPlayed: {
    type: Number,
    default: 0
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  currentGame: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  }
});

module.exports = mongoose.model('Profile', profileSchema);