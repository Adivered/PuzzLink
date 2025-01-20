const express = require('express');
const router = express.Router();
const { getGameState, updateGameState, endGame } = require('../controllers/game/gameController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.get('/api/games/:gameId', isAuthenticated, getGameState);
router.put('/api/games/:gameId', isAuthenticated, updateGameState);
router.post('/api/games/:gameId/end', isAuthenticated, endGame);

module.exports = router;