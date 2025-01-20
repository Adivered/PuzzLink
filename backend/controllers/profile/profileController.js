const Profile = require('../../models/Profile');
const User = require('../../models/User');

exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate('friends', 'name email picture');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { friends } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { friends: { $each: friends } } },
      { new: true, upsert: true }
    ).populate('friends', 'name email picture');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { friends: friendId } },
      { new: true }
    ).populate('friends', 'name email picture');
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

