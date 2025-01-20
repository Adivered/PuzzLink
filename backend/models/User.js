const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false, // Make password optional
    minlength: 6,
    select: false // Don't include password in query results by default
  },
  role: {
    type: String,
    enum: ['user', 'admin',],
    default: 'user'
  },
  googleId: {
    type: String,
    required: true, // Make googleId required
    unique: true // Ensure one account per Google user
  },
  name: {
    type: String,
    required: true // Make name required since we'll get it from Google
  },
  picture: {
    type: String, // Add this to store Google profile picture
    required: false
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.updateOnlineStatus = function(status) {
  this.isOnline = status;
  this.lastActive = Date.now();
  return this.save();
};

// Only hash password if it exists and was modified
userSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Modify the compare password method to handle OAuth users
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false; // OAuth users can't login with password
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Add a method to check if user is OAuth user
userSchema.methods.isOAuthUser = function() {
  return Boolean(this.googleId);
};

// Modify the auth middleware to handle OAuth users
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.googleId) {
      return res.status(401).json({ message: 'Not authorized - OAuth required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = mongoose.model('User', userSchema);
