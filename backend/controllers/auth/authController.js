// authController.js
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const User = require("../../models/User"); // Adjust path as needed
const Room = require("../../models/Room"); // Add Room model

// Helper function to ensure Home room exists and join user
const ensureHomeRoomAndJoinUser = async (userId) => {
  try {
    // Find or create the "Home" room
    let homeRoom = await Room.findOne({ name: "Home" });
    
    if (!homeRoom) {
      // Create the Home room if it doesn't exist
      // Use the first user as creator, or create a system user
      homeRoom = new Room({
        name: "Home",
        creator: userId, // You might want to use a system user ID here
        timeLimit: 60, // Default values for the Home room
        difficulty: 'easy',
        gameMode: 'puzzle',
        turnBased: false,
        status: 'waiting' // Home room is always waiting for new members
      });
      await homeRoom.save();
    }
    
    // Add user to Home room if not already added
    if (!homeRoom.players.includes(userId)) {
      homeRoom.players.push(userId);
      await homeRoom.save();
    }
    
    // Update user's online status and current room
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      currentRoom: homeRoom._id,
      lastActive: new Date()
    });
    
    return homeRoom;
  } catch (error) {
    console.error('Error ensuring Home room:', error);
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
      
      // Auto-join Home room
      const homeRoom = await ensureHomeRoomAndJoinUser(user._id);
      
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        homeRoomId: homeRoom?._id
      });
    });
  })(req, res);
});

const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account", // Always show account selector
  accessType: "offline" // Request refresh token
});

const googleCallback = (req, res, next) => {
  console.log("Callbacked")
  passport.authenticate("google", async (err, user, info) => {
    if (err) {
      // Handle error by redirecting to frontend with error message
      return res.redirect(`${process.env.CLIENT_URL}/login?error=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication failed`);
    }

    req.logIn(user, async (err) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=Login failed`);
      }

      // Auto-join Home room for Google OAuth users too
      await ensureHomeRoomAndJoinUser(user._id);

      // Get return URL from session and remove it
      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      // Redirect to frontend with success
      return res.redirect(`${process.env.CLIENT_URL}/`);
    });
  })(req, res, next);
};

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authenticated");
  }

  // Ensure user is in Home room even when getting current user
  const homeRoom = await ensureHomeRoomAndJoinUser(req.user._id);

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    provider: req.user.provider,
    homeRoomId: homeRoom?._id
  });
});

const checkAuthStatus = asyncHandler(async (req, res) => {
  let user = null;
  let homeRoomId = null;
  
  if (req.user) {
    // Ensure user is in Home room during auth check
    const homeRoom = await ensureHomeRoomAndJoinUser(req.user._id);
    homeRoomId = homeRoom?._id;
    
    user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
      homeRoomId
    };
  }
  
  res.json({
    authenticated: req.isAuthenticated(),
    user
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    // Update user offline status and remove from current room
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      currentRoom: null,
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
  getCurrentUser,
  logout,
  checkAuthStatus
};
