const express = require('express');
const User = require('../models/User');
const Room = require('../models/Room');
const Conversation = require('../models/Conversation');

const router = express.Router();

// Admin endpoint to clean up Home room duplication
router.post('/admin/cleanup-home-room', async (req, res) => {
  try {
    console.log('🧹 Starting Home room cleanup...');
    
    // Find ALL rooms named "Home"
    const homeRooms = await Room.find({ name: "Home" });
    console.log(`Found ${homeRooms.length} Home room(s)`);
    
    const results = {
      homeRoomsFound: homeRooms.length,
      usersUpdated: 0,
      roomsDeleted: 0,
      homeConversationExists: false
    };

    for (const homeRoom of homeRooms) {
      console.log(`Processing Home room: ${homeRoom._id} (${homeRoom.name})`);
      
      // Find users who have this Home room as their currentRoom
      const usersWithHomeRoom = await User.find({ currentRoom: homeRoom._id });
      console.log(`  - ${usersWithHomeRoom.length} users have this as currentRoom`);
      
      // Update these users to have no currentRoom
      if (usersWithHomeRoom.length > 0) {
        await User.updateMany(
          { currentRoom: homeRoom._id },
          { $set: { currentRoom: null } }
        );
        console.log(`  - Updated ${usersWithHomeRoom.length} users to have no currentRoom`);
        results.usersUpdated += usersWithHomeRoom.length;
        
        // List the users
        for (const user of usersWithHomeRoom) {
          console.log(`    * ${user.email}`);
        }
      }
      
      // Remove the Home Room
      await Room.findByIdAndDelete(homeRoom._id);
      console.log(`  - Deleted Home room: ${homeRoom._id}`);
      results.roomsDeleted++;
    }
    
    // Ensure Home Conversation exists
    let homeConversation = await Conversation.findOne({ 
      groupName: "Home",
      isGroup: true 
    });
    
    if (!homeConversation) {
      console.log('Creating Home Conversation...');
      homeConversation = new Conversation({
        groupName: "Home",
        isGroup: true,
        participants: [],
        createdBy: null
      });
      await homeConversation.save();
      console.log(`Created Home Conversation: ${homeConversation._id}`);
      results.homeConversationCreated = homeConversation._id;
    } else {
      console.log(`Home Conversation exists: ${homeConversation._id}`);
      results.homeConversationExists = homeConversation._id;
    }
    
    console.log('✅ Cleanup completed successfully');
    
    res.json({
      success: true,
      message: 'Home room cleanup completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
});

module.exports = router; 