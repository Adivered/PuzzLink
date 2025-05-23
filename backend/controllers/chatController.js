const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Room = require('../models/Room');

// Get conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      participants: userId
    }).sort({ updatedAt: -1 });

    res.json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get or create conversation between two users
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    if (participantId === userId.toString()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId], $size: 2 },
      isGroup: false
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId],
        isGroup: false
      });
      await conversation.save();
      await conversation.populate('participants', 'name picture isOnline lastActive');
    }

    res.json({
      status: 'success',
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get messages for a conversation or room
exports.getMessages = async (req, res) => {
  try {
    const { conversationId, roomId } = req.query;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    let query = {};
    if (conversationId) {
      query.conversation = conversationId;
    } else if (roomId) {
      query.room = roomId;
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Either conversationId or roomId is required'
      });
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, conversationId, roomId, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required'
      });
    }

    if (!conversationId && !roomId) {
      return res.status(400).json({
        status: 'error',
        message: 'Either conversationId or roomId is required'
      });
    }

    const messageData = {
      content: content.trim(),
      sender: senderId,
      messageType
    };

    if (conversationId) {
      messageData.conversation = conversationId;
    } else {
      messageData.room = roomId;
    }

    const message = new Message(messageData);
    await message.save();
    await message.populate('sender', 'name picture isOnline');

    // Update conversation's last message if it's a conversation message
    if (conversationId) {
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        updatedAt: new Date()
      });
    }

    res.status(201).json({
      status: 'success',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get room messages
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;

    // Verify user is in the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Room not found'
      });
    }

    if (!room.players.includes(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not a member of this room'
      });
    }

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      status: 'success',
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 