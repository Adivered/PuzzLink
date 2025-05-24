const mongoose = require('mongoose');

const StrokeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tool: {
    type: String,
    enum: ['pen', 'brush', 'eraser', 'highlighter', 'line', 'rectangle', 'circle', 'arrow'],
    default: 'pen'
  },
  color: {
    type: String,
    default: '#000000'
  },
  size: {
    type: Number,
    default: 2,
    min: 1,
    max: 50
  },
  opacity: {
    type: Number,
    default: 1,
    min: 0,
    max: 1
  },
  points: [{
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    pressure: { type: Number, default: 1 }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const WhiteboardSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  strokes: [StrokeSchema],
  background: {
    color: {
      type: String,
      default: '#ffffff'
    },
    image: {
      type: String,
      default: null
    }
  },
  dimensions: {
    width: {
      type: Number,
      default: 1920
    },
    height: {
      type: Number,
      default: 1080
    }
  },
  settings: {
    allowDrawing: {
      type: Boolean,
      default: true
    },
    allowErasing: {
      type: Boolean,
      default: true
    },
    maxStrokes: {
      type: Number,
      default: 10000
    }
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    cursor: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      visible: { type: Boolean, default: false }
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
WhiteboardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better performance
WhiteboardSchema.index({ game: 1 });
WhiteboardSchema.index({ 'strokes.userId': 1 });
WhiteboardSchema.index({ 'strokes.timestamp': 1 });

// Methods
WhiteboardSchema.methods.addStroke = function(strokeData) {
  this.strokes.push(strokeData);
  this.version += 1;
  return this.save();
};

WhiteboardSchema.methods.removeStroke = function(strokeId) {
  this.strokes = this.strokes.filter(stroke => stroke.id !== strokeId);
  this.version += 1;
  return this.save();
};

WhiteboardSchema.methods.clearStrokes = function(userId = null) {
  if (userId) {
    // Clear only strokes by specific user
    this.strokes = this.strokes.filter(stroke => stroke.userId.toString() !== userId.toString());
  } else {
    // Clear all strokes
    this.strokes = [];
  }
  this.version += 1;
  return this.save();
};

WhiteboardSchema.methods.updateCollaboratorCursor = async function(userId, cursorData) {
  // Use direct MongoDB update to avoid version conflicts for cursor positions
  // Cursor positions are ephemeral and don't need strict versioning
  const update = {
    $set: {
      'collaborators.$.cursor': { ...cursorData },
      'collaborators.$.lastActive': new Date()
    }
  };
  
  try {
    // Try to update existing collaborator
    const result = await this.constructor.updateOne(
      { 
        _id: this._id, 
        'collaborators.user': userId 
      },
      update,
      { runValidators: true }
    );
    
    // If no collaborator found, add new one
    if (result.matchedCount === 0) {
      await this.constructor.updateOne(
        { _id: this._id },
        {
          $push: {
            collaborators: {
              user: userId,
              cursor: cursorData,
              joinedAt: new Date(),
              lastActive: new Date()
            }
          }
        },
        { runValidators: true }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating cursor position:', error);
    return false;
  }
};

module.exports = mongoose.model('Whiteboard', WhiteboardSchema); 