const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const isAuthenticated = require('../middlewares/authMiddleware');

// Apply authentication middleware to all chat routes
router.use('/api/chat', isAuthenticated);

// Conversation routes
router.get('/api/chat/conversations', chatController.getConversations);
router.post('/api/chat/conversations', chatController.getOrCreateConversation);

// Message routes
router.get('/api/chat/messages', chatController.getMessages);
router.post('/api/chat/messages', chatController.sendMessage);
router.put('/api/chat/messages/read', chatController.markAsRead);

// Room-specific chat routes
router.get('/api/chat/rooms/:roomId/messages', chatController.getRoomMessages);

module.exports = router; 