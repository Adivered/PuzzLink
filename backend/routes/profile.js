const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, removeFriend } = require('../controllers/profile/profileController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/api/profile', isAuthenticated, getProfile);
router.put('/api/profile', isAuthenticated, updateProfile);
router.delete('/api/profile/friends/:friendId', isAuthenticated, removeFriend);

module.exports = router;