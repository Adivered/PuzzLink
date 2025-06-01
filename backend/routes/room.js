const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, startGame, getRoom, removePlayer, inviteToRoom, updateRoom } = require('../controllers/room/roomController');
const isAuthenticated = require('../middlewares/authMiddleware');
const upload = require('../middlewares/formDataMiddleware');

router.post('/api/rooms', isAuthenticated, upload.single('image'), createRoom);
router.get('/api/rooms/:roomId', isAuthenticated, getRoom);
router.put('/api/rooms/:roomId', isAuthenticated, updateRoom);
router.post('/api/rooms/:roomId/join', isAuthenticated, joinRoom);
router.post('/api/rooms/:roomId/start', isAuthenticated, startGame);
router.post('/api/rooms/:roomId/invite', isAuthenticated, inviteToRoom);
router.delete('/api/rooms/:roomId/removePlayer/:playerId', isAuthenticated, removePlayer);


module.exports = router;