const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, startGame, getRoom } = require('../controllers/room/roomController');
const isAuthenticated = require('../middlewares/authMiddleware');
const upload = require('../middlewares/formDataMiddleware');

router.post('/api/rooms', isAuthenticated, upload.single('image'), createRoom);
router.get('/api/rooms/:roomId', isAuthenticated, getRoom);
router.post('/api/rooms/:roomId/join', isAuthenticated, joinRoom);
router.post('/api/rooms/:roomId/start', isAuthenticated, startGame);

module.exports = router;