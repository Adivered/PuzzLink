const Image = require('../../models/Image');

exports.uploadImage = async (req, res) => {
  try {
    const { url, gameId, stage } = req.body;
    const image = new Image({
      url,
      uploadedBy: req.user._id,
      gameId,
      stage
    });
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getGameImages = async (req, res) => {
  try {
    const { gameId } = req.params;
    const images = await Image.find({ gameId }).sort('createdAt');
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};