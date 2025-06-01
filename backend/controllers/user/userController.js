const User = require('../../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('friends', 'name email picture')
      .populate('currentRoom', 'name status');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, picture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, picture },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { friends: friendId } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { friends: friendId } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOnlineStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await req.user.updateOnlineStatus(status);
    res.json({ message: 'Online status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const currentUserId = req.user._id;
    
    if (!query || query.trim().length < 2) {
      return res.json({ users: [] });
    }
    
    // Search users by name or email (case-insensitive)
    // Exclude current user from results
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { name: { $regex: query.trim(), $options: 'i' } },
        { email: { $regex: query.trim(), $options: 'i' } }
      ]
    })
    .select('_id name email picture isOnline lastActive')
    .limit(parseInt(limit))
    .sort({ isOnline: -1, name: 1 }); // Online users first, then alphabetical
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};