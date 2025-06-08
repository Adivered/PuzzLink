// authController.js
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const User = require("../../models/User");
const Conversation = require("../../models/Conversation");

// Cache for Home conversation ID to avoid repeated DB queries
let cachedHomeConversationId = null;

// Helper function to get or create Home conversation ID (cached)
const getHomeConversationId = async () => {
  if (cachedHomeConversationId) {
    return cachedHomeConversationId;
  }
  
  try {
    // Simple fast query - just find by groupName and isGroup
    let homeConversation = await Conversation.findOne({ 
      groupName: "Home",
      isGroup: true 
    }, '_id');
    
    if (!homeConversation) {
      // Create the global Home conversation with empty participants initially
      homeConversation = new Conversation({
        groupName: "Home",
        isGroup: true,
        participants: [], // Start empty for performance
        createdBy: null // System conversation
      });
      await homeConversation.save();
    }
    
    // Cache the ID for future requests
    cachedHomeConversationId = homeConversation._id;
    return cachedHomeConversationId;
  } catch (error) {
    console.error('Error getting Home conversation ID:', error);
    return null;
  }
};

// Helper function to ensure user is in Home conversation (only called during login)
const ensureUserInHomeConversation = async (userId) => {
  try {
    const homeConversationId = await getHomeConversationId();
    if (!homeConversationId) return null;
    
    // Check if user is already in the conversation
    const userInConversation = await Conversation.findOne({
      _id: homeConversationId,
      participants: userId
    }, '_id');
    
    if (!userInConversation) {
      // Add user to Home conversation
      await Conversation.findByIdAndUpdate(homeConversationId, {
        $addToSet: { participants: userId } // Use $addToSet to avoid duplicates
      });
    }
    
    // Update user's online status
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastActive: new Date()
    });
    
    return homeConversationId;
  } catch (error) {
    console.error('Error ensuring user in Home conversation:', error);
    return null;
  }
};

const loginUser = asyncHandler(async (req, res) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      res.status(500);
      throw new Error(err.message);
    }
    if (!user) {
      res.status(401);
      throw new Error(info.message);
    }
    req.logIn(user, async (err) => {
      if (err) {
        res.status(500);
        throw new Error(err.message);
      }
      
      // Ensure user is in Home conversation
      const homeConversationId = await ensureUserInHomeConversation(user._id);
      
      // Store homeConversationId in session for fast access
      req.session.homeConversationId = homeConversationId;
      
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          provider: user.provider
        },
        homeConversationId
      });
    });
  })(req, res);
});

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
  accessType: "offline"
});

// Simplified googleCallback that handles everything in one place
const googleCallback = (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }

    req.logIn(user, async (err) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=Login failed`);
      }

      // Ensure user is in Home conversation
      const homeConversationId = await ensureUserInHomeConversation(user._id);
      
      // Store homeConversationId in session for fast access
      req.session.homeConversationId = homeConversationId;

      // Single redirect to home with success - frontend will get homeId from auth status
      return res.redirect(`${process.env.CLIENT_URL}/?auth=success`);
    });
  })(req, res, next);
};

// SUPER FAST: No database queries at all!
const checkAuthStatus = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  if (req.user) {
    // Get homeConversationId from session (instant!) or use cached value
    let homeConversationId = req.session.homeConversationId || cachedHomeConversationId;
    
    // If still no ID, try to get/create it (this should be rare)
    if (!homeConversationId) {
      console.log('⚠️ No homeConversationId in session/cache, fetching...');
      homeConversationId = await ensureUserInHomeConversation(req.user._id);
      
      // Store in session for next time
      if (homeConversationId) {
        req.session.homeConversationId = homeConversationId;
      } else {
        console.error('❌ Failed to get/create Home conversation for user:', req.user._id);
        return res.status(500).json({ error: 'Failed to initialize Home conversation' });
      }
    }
    
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        provider: req.user.provider
      },
      homeConversationId
    });
  } else {
    res.json({ 
      authenticated: false, 
      user: null 
    });
  }
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    // Update user offline status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastActive: new Date()
    });
  }
  
  req.logout((err) => {
    if (err) {
      res.status(500);
      throw new Error("Logout failed");
    }
    req.session.destroy((err) => {
      if (err) {
        res.status(500);
        throw new Error("Session destruction failed");
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

module.exports = {
  loginUser,
  googleAuth,
  googleCallback,
  checkAuthStatus,
  logout
};
