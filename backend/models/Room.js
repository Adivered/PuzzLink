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
  pendingInvitations: [{
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
  // Embedded chat functionality for private room conversations
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  unreadCount: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    count: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  }
});

// Update timestamps on save
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Populate players and chat data
roomSchema.pre('findOne', function(next) {
  this.populate({
    path: 'players',
    select: 'name picture currentRoom isOnline lastActive'
  }).populate({
    path: 'lastMessage',
    select: 'content sender createdAt messageType'
  });
  next();
});

roomSchema.pre('find', function(next) {
  this.populate({
    path: 'players',
    select: 'name picture currentRoom isOnline lastActive'
  }).populate({
    path: 'lastMessage',
    select: 'content sender createdAt messageType'
  });
  next();
});

// Helper method to add message to room
roomSchema.methods.addMessage = function(messageId) {
  this.messages.push(messageId);
  this.lastMessage = messageId;
  this.updatedAt = new Date();
  return this.save();
};

// Helper method to update unread count for a user
roomSchema.methods.incrementUnreadForUser = function(userId) {
  const userUnread = this.unreadCount.find(uc => uc.user.toString() === userId.toString());
  if (userUnread) {
    userUnread.count += 1;
  } else {
    this.unreadCount.push({ user: userId, count: 1 });
  }
  return this.save();
};

// Helper method to clear unread count for a user
roomSchema.methods.clearUnreadForUser = function(userId) {
  this.unreadCount = this.unreadCount.filter(uc => uc.user.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);