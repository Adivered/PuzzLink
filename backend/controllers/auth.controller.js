// authController.js
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const User = require("../../models/User"); // Adjust path as needed

const loginUser = asyncHandler(async (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      res.status(500);
      throw new Error(err.message);
    }
    if (!user) {
      res.status(401);
      throw new Error(info.message);
    }
    req.logIn(user, (err) => {
      if (err) {
        res.status(500);
        throw new Error(err.message);
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider
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

  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    provider: req.user.provider
  });
});

const checkAuthStatus = asyncHandler(async (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider
    } : null
  });
});

const logout = asyncHandler(async (req, res) => {
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