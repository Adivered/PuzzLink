const express = require('express');
const router = express.Router();
const { uploadImage, getGameImages } = require('../controllers/image/imageController');
const isAuthenticated = require('../middlewares/authMiddleware');

router.post('/api/images', isAuthenticated, uploadImage);
router.get('/api/games/:gameId/images', isAuthenticated, getGameImages);

module.exports = router;