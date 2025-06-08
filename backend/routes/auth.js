// auth.js (routes)
const express = require("express");
const router = express.Router();
const { loginUser, googleAuth, googleCallback, logout, checkAuthStatus } = require("../controllers/auth/authController");
const validateBody = require("../middlewares/validateMiddleware");
const isAuthenticated = require("../middlewares/authMiddleware");

// Local auth routes
router.post("/auth/login", loginUser);

// Update Google OAuth routes with better security
router.get('/auth/google', googleAuth);
router.get("/auth/google/callback", googleCallback);

// User routes  
router.get("/auth/status", checkAuthStatus);
router.get("/auth/logout", logout);

module.exports = router;
