const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: null
  },
  groupAvatar: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  }
});

// Ensure participants array has at least 2 users for regular conversations
conversationSchema.pre('save', function(next) {
  if (!this.isGroup && this.participants.length !== 2) {
    return next(new Error('Regular conversations must have exactly 2 participants'));
  }
  if (this.isGroup && this.participants.length < 2) {
    return next(new Error('Group conversations must have at least 2 participants'));
  }
  next();
});

// Index for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Populate participants and last message
conversationSchema.pre('find', function(next) {
  this.populate({
    path: 'participants',
    select: 'name picture isOnline lastActive'
  }).populate({
    path: 'lastMessage',
    select: 'content sender createdAt messageType'
  });
  next();
});

conversationSchema.pre('findOne', function(next) {
  this.populate({
    path: 'participants',
    select: 'name picture isOnline lastActive'
  }).populate({
    path: 'lastMessage',
    select: 'content sender createdAt messageType'
  });
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema); 