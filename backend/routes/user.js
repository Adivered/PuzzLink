const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addFriend, removeFriend, updateOnlineStatus } = require('../controllers/user/userController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/api/user', isAuthenticated, getUserProfile);
router.put('/api/user', isAuthenticated, updateUserProfile);
router.post('/api/user/friends', isAuthenticated, addFriend);
router.delete('/api/user/friends/:friendId', isAuthenticated, removeFriend);
router.put('/api/user/online-status', isAuthenticated, updateOnlineStatus);

module.exports = router;