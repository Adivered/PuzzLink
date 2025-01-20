// auth.js (routes)
const express = require("express");
const router = express.Router();
const { loginUser, googleAuth, googleCallback, getCurrentUser, logout, checkAuthStatus } = require("../controllers/auth/authController");
const validateBody = require("../middlewares/validateMiddleware");
const isAuthenticated = require("../middlewares/authMiddleware");

// Local auth routes
router.post(
  "/auth/login",
  validateBody(isAuthenticated),
  loginUser
);

// Update Google OAuth routes with better security
router.get('/auth/google', googleAuth);
router.get("/auth/google/callback", googleCallback);

// User routes
router.get("/auth/user", isAuthenticated, getCurrentUser);
router.get("/auth/status", isAuthenticated, checkAuthStatus);
router.get("/auth/logout", isAuthenticated, logout);

module.exports = router;
