const Game = require('../models/Game');
const User = require('../models/User');
const Room = require('../models/Room');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Track active socket connections per user
const userConnections = new Map(); // userId -> Set of socket IDs

// Track recent room switch requests to prevent duplicates
const recentSwitchRequests = new Map(); // userId -> { roomId, timestamp }
const SWITCH_COOLDOWN = 2000; // 2 seconds cooldown between identical switch requests

// Send initial data to frontend (replaces API calls)
const sendInitialData = async (socket, userId) => {
  try {
    console.log(`📦 Sending initial data to user ${userId}`);

    // Get user's conversations
    const conversations = await Conversation.find({
      participants: userId
    }).populate({
      path: 'participants',
      select: 'name picture isOnline lastActive'
    }).populate({
      path: 'lastMessage',
      select: 'content sender createdAt messageType'
    }).sort({ updatedAt: -1 });

    // Get user's rooms (including Home room and any rooms they're in)
    const user = await User.findById(userId).populate('currentRoom');
    const homeRoom = await Room.findOne({ name: "Home" });
    
    // Get only the user's current room (if they have one)
    let currentRoomData = null;
    if (user.currentRoom) {
      currentRoomData = await Room.findById(user.currentRoom._id)
        .populate('creator', 'name picture isOnline lastActive')
        .populate('players', 'name picture currentRoom isOnline lastActive')
        .populate('pendingInvitations', 'name picture isOnline lastActive');
    }
    
    const roomDetails = {};
    
    // Add Home room details
    if (homeRoom) {
      roomDetails[homeRoom._id] = {
        name: homeRoom.name,
        description: homeRoom.description || 'Global community chat',
        image: homeRoom.image,
        onlineCount: 0 // Will be updated by room_users event
      };
    }

    // Add details for ONLY the user's current room (if they have one and it's not Home)
    if (currentRoomData && currentRoomData._id.toString() !== homeRoom?._id.toString()) {
      roomDetails[currentRoomData._id] = {
        _id: currentRoomData._id,
        name: currentRoomData.name,
        description: currentRoomData.description,
        image: currentRoomData.image,
        creator: currentRoomData.creator,
        players: currentRoomData.players,
        pendingInvitations: currentRoomData.pendingInvitations,
        timeLimit: currentRoomData.timeLimit,
        gameMode: currentRoomData.gameMode,
        turnBased: currentRoomData.turnBased,
        status: currentRoomData.status,
        currentGame: currentRoomData.currentGame,
        onlineCount: 0 // Will be updated by room_users event
      };
    }

    // Get recent messages for conversations and rooms
    const messages = {};
    
    // Get messages for each conversation
    for (const conversation of conversations) {
      const conversationMessages = await Message.find({
        conversation: conversation._id
      }).populate('sender', 'name picture')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      messages[conversation._id] = conversationMessages.reverse(); // Oldest first
    }

    // Get messages for Home room
    if (homeRoom) {
      const homeMessages = await Message.find({
        room: homeRoom._id
      }).populate('sender', 'name picture')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      messages[homeRoom._id] = homeMessages.reverse(); // Oldest first
    }

    // Get messages for ONLY the user's current room (if they have one and it's not Home)
    if (currentRoomData && currentRoomData._id.toString() !== homeRoom?._id.toString()) {
      const roomMessages = await Message.find({
        room: currentRoomData._id
      }).populate('sender', 'name picture')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      messages[currentRoomData._id] = roomMessages.reverse(); // Oldest first
    }

    // Send all initial data in one event
    socket.emit('initial_data', {
      conversations,
      roomDetails,
      messages,
      currentRoom: user.currentRoom
    });

    console.log(`✅ Sent initial data to user ${userId}: ${conversations.length} conversations, ${Object.keys(roomDetails).length} rooms, ${Object.keys(messages).length} message sets`);

  } catch (error) {
    console.error('Error sending initial data:', error);
    socket.emit('error', { message: 'Failed to load initial data' });
  }
};

const userHandler = (socket, io) => {
  // Join user to their personal room for notifications and auto-join relevant chat rooms
  socket.on('join_user', async (userId) => {
    try {
      // Get user info first for proper correlation logging
      const user = await User.findById(userId).populate('currentRoom');
      if (!user) {
        console.error(`❌ User not found: ${userId}`);
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Store user info on socket for future reference and correlation
      socket.userId = userId;
      socket.userEmail = user.email;
      socket.userName = user.name;
      socket.join(`user_${userId}`);
      
      // Enhanced correlation logging - clear socket-to-user mapping
      console.log(`🔐 ${user.email} <${socket.id.slice(-8)}>`);
      
      // Track this socket connection for the user
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId).add(socket.id);
      
      // Verify the user is actually in the room
      const userRoom = `user_${userId}`;
      const socketsInRoom = socket.adapter.rooms.get(userRoom);
      console.log(`   📍 Personal room: user_${userId.slice(-8)} (${socketsInRoom ? socketsInRoom.size : 0} sockets)`);
      
      // Check if this is the user's first connection (they were offline)
      const wasOffline = !user.isOnline;
      
      // Update user online status and last active time
      await User.findByIdAndUpdate(userId, { 
        isOnline: true,
        lastActive: new Date()
      });

      // Send initial data to eliminate API calls
      await sendInitialData(socket, userId);
      
      // Auto-join Home room chat (global chat)
      const homeRoom = await Room.findOne({ name: "Home" });
      if (homeRoom) {
        socket.join(`room_${homeRoom._id}`);
        console.log(`   ✅ Auto-joined: ${homeRoom.name} (${homeRoom._id.toString().slice(-8)})`);
        
        // Auto-join current room only if it's different from Home and user was offline
        if (user.currentRoom && 
            user.currentRoom._id.toString() !== homeRoom?._id.toString() && 
            wasOffline) {
          socket.join(`room_${user.currentRoom._id}`);
          console.log(`   ✅ Auto-joined: ${user.currentRoom.name} (${user.currentRoom._id.toString().slice(-8)})`);
          
          socket.to(`room_${user.currentRoom._id}`).emit('user_joined_room', {
            userId,
            userName: user.name,
            roomId: user.currentRoom._id,
            roomName: user.currentRoom.name
          });
        }
      }
      
      // Only broadcast user online status if they were previously offline
      if (wasOffline) {
        socket.broadcast.emit('user_online', {
          userId,
          userName: user.name
        });
        console.log(`   📡 Broadcasted online status (was offline)`);
      }
      
      // Get active connection count for this user
      const activeConnections = userConnections.get(userId)?.size || 0;
      console.log(`✅ ${user.email} fully connected (${activeConnections} active connection${activeConnections !== 1 ? 's' : ''})`);
      
      // Check for pending room invitations and send them
      const roomsWithPendingInvitations = await Room.find({
        pendingInvitations: userId
      }).populate('creator', 'name');
      
      if (roomsWithPendingInvitations.length > 0) {
        console.log(`📬 Found ${roomsWithPendingInvitations.length} pending invitations for user ${userId}`);
        
        for (const room of roomsWithPendingInvitations) {
          // Send the pending invitation
          socket.emit('room_invitation', {
            roomId: room._id,
            inviterName: room.creator.name,
            timestamp: room.createdAt
          });
          
          console.log(`📨 Sent pending invitation to ${userId} for room ${room._id} from ${room.creator.name}`);
        }
      }
    } catch (error) {
      console.error('Error in join_user:', error);
      socket.emit('error', { message: 'Failed to join user room' });
    }
  });

  // Handle user going offline
  socket.on('user_going_offline', async (userId) => {
    try {
      // Remove all connections for this user (explicit offline)
      if (userConnections.has(userId)) {
        userConnections.delete(userId);
      }
      
      const user = await User.findById(userId).populate('currentRoom');
      
      await User.findByIdAndUpdate(userId, { 
        isOnline: false,
        lastActive: new Date()
      });
      
      // Notify only the current room that user is going offline
      if (user?.currentRoom) {
        socket.to(`room_${user.currentRoom._id}`).emit('user_left_room', {
          userId,
          userName: user.name,
          roomId: user.currentRoom._id,
          roomName: user.currentRoom.name
        });
      }
      
      // Broadcast user offline status
      socket.broadcast.emit('user_offline', {
        userId,
        userName: user?.name
      });
      
      console.log(`User ${userId} explicitly went offline`);
    } catch (error) {
      console.error('Error in user_going_offline:', error);
    }
  });

  // Update user activity
  socket.on('user_activity', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { 
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  });

  // Handle user switching rooms (unified room management)
  socket.on('switch_room', async ({ userId, newRoomId, leaveRoomId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Check for duplicate switch requests within cooldown period
      const now = Date.now();
      const lastSwitch = recentSwitchRequests.get(userId);
      
      if (lastSwitch && lastSwitch.roomId === newRoomId && (now - lastSwitch.timestamp) < SWITCH_COOLDOWN) {
        console.log(`🚫 Duplicate switch_room request from user ${userId} to room ${newRoomId} within cooldown, ignoring`);
        return;
      }

      // Update the recent switch tracking
      recentSwitchRequests.set(userId, { roomId: newRoomId, timestamp: now });

      // OPTIMIZATION: Check if user is already in the target room to prevent redundant switches
      if (user.currentRoom && user.currentRoom.toString() === newRoomId) {
        console.log(`🔄 User ${userId} already in room ${newRoomId}, skipping switch`);
        
        // Still send room data in case the frontend needs it
        const existingRoom = await Room.findById(newRoomId)
          .populate('creator', 'name picture isOnline lastActive')
          .populate('players', 'name picture currentRoom isOnline lastActive')
          .populate('pendingInvitations', 'name picture isOnline lastActive');
          
        if (existingRoom) {
          socket.emit('room_data_update', {
            roomId: newRoomId,
            roomData: {
              _id: existingRoom._id,
              name: existingRoom.name,
              description: existingRoom.description,
              image: existingRoom.image,
              creator: existingRoom.creator,
              players: existingRoom.players,
              pendingInvitations: existingRoom.pendingInvitations,
              timeLimit: existingRoom.timeLimit,
              gameMode: existingRoom.gameMode,
              turnBased: existingRoom.turnBased,
              status: existingRoom.status,
              currentGame: existingRoom.currentGame,
              onlineCount: 0
            }
          });
        }
        return;
      }

      // Leave previous room if specified
      if (leaveRoomId) {
        socket.leave(`room_${leaveRoomId}`);
        const leftRoom = await Room.findById(leaveRoomId);
        if (leftRoom) {
          socket.to(`room_${leaveRoomId}`).emit('user_left_room', {
            userId,
            userName: user.name,
            roomId: leaveRoomId,
            roomName: leftRoom.name
          });
        }
      }

      // Join new room
      if (newRoomId) {
        socket.join(`room_${newRoomId}`);
        console.log(`🏠 User ${userId} joined room socket: room_${newRoomId}`);
        
        // Verify the user is actually in the room socket
        const roomSocketName = `room_${newRoomId}`;
        const socketsInRoom = socket.adapter.rooms.get(roomSocketName);
        console.log(`   - Sockets in room socket: ${socketsInRoom ? socketsInRoom.size : 0}`);
        
        const newRoom = await Room.findById(newRoomId)
          .populate('creator', 'name picture isOnline lastActive')
          .populate('players', 'name picture currentRoom isOnline lastActive')
          .populate('pendingInvitations', 'name picture isOnline lastActive');
          
        if (newRoom) {
          // Update user's current room
          await User.findByIdAndUpdate(userId, { currentRoom: newRoomId });
          
          // Send room data to the user who just joined
          const roomMessages = await Message.find({
            room: newRoomId
          }).populate('sender', 'name picture')
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
          
          const messages = roomMessages.reverse(); // Oldest first
          
          // Send room data update
          socket.emit('room_data_update', {
            roomId: newRoomId,
            roomData: {
              _id: newRoom._id,
              name: newRoom.name,
              description: newRoom.description,
              image: newRoom.image,
              creator: newRoom.creator,
              players: newRoom.players,
              pendingInvitations: newRoom.pendingInvitations,
              timeLimit: newRoom.timeLimit,
              gameMode: newRoom.gameMode,
              turnBased: newRoom.turnBased,
              status: newRoom.status,
              currentGame: newRoom.currentGame,
              onlineCount: 0 // Will be updated by room_users event
            }
          });
          
          // Send messages update
          socket.emit('messages_update', {
            chatId: newRoomId,
            messages
          });
          
          console.log(`✅ Sent room data for ${newRoom.name}: ${messages.length} messages`);
          
          // Notify other room members that user joined
          socket.to(`room_${newRoomId}`).emit('user_joined_room', {
            userId,
            userName: user.name,
            roomId: newRoomId,
            roomName: newRoom.name
          });
        }
      }

      console.log(`User ${userId} switched from room ${leaveRoomId} to room ${newRoomId}`);
    } catch (error) {
      console.error('Error in switch_room:', error);
    }
  });

  // Handle disconnect with proper cleanup
  socket.on('disconnect', async () => {
    try {
      const socketId = socket.id;
      const userId = socket.userId;
      const userEmail = socket.userEmail;
      const userName = socket.userName;
      
      // Enhanced disconnect logging with user correlation
      if (userEmail) {
        console.log(`🔌 ${userEmail} <${socketId.slice(-8)}> disconnected`);
      } else {
        console.log(`🔌 Socket ${socketId.slice(-8)} disconnected (no user correlation)`);
      }
      
      if (userId) {
        // Remove this socket from user connections
        if (userConnections.has(userId)) {
          userConnections.get(userId).delete(socketId);
          
          const remainingConnections = userConnections.get(userId).size;
          console.log(`   📊 Remaining connections for ${userEmail || userId.slice(-8)}: ${remainingConnections}`);
          
          // If no more connections, mark user as offline
          if (remainingConnections === 0) {
            userConnections.delete(userId);
            await User.findByIdAndUpdate(userId, { 
              isOnline: false, 
              lastActive: new Date()
            });
            
            console.log(`   📴 ${userEmail || `User ${userId.slice(-8)}`} marked offline (last connection)`);
            
            // Broadcast offline status
            socket.broadcast.emit('user_offline', {
              userId,
              userName: userName || 'Unknown User'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
};

// Cleanup function to handle stale connections
const cleanupStaleConnections = async (io) => {
  console.log('Running stale connection cleanup...');
  
  // OPTIMIZATION: Batch process user updates to prevent MongoDB overload
  const usersToUpdate = [];
  
  for (const [userId, socketIds] of userConnections.entries()) {
    const validSockets = new Set();
    
    // Check which sockets are still connected
    for (const socketId of socketIds) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.connected) {
        validSockets.add(socketId);
      }
    }
    
    // Update the connection tracking
    if (validSockets.size === 0) {
      // No valid connections, mark for offline update
      userConnections.delete(userId);
      usersToUpdate.push(userId);
      console.log(`Cleaned up stale connections for user ${userId} - will set offline`);
    } else if (validSockets.size < socketIds.size) {
      // Some stale connections removed
      userConnections.set(userId, validSockets);
      console.log(`Cleaned up ${socketIds.size - validSockets.size} stale connections for user ${userId}`);
    }
  }
  
  // OPTIMIZATION: Batch update users to offline status
  if (usersToUpdate.length > 0) {
    try {
      const updateResult = await User.updateMany(
        { _id: { $in: usersToUpdate } },
        { 
          isOnline: false,
          lastActive: new Date()
        },
        { 
          lean: true // Use lean for better performance
        }
      );
      console.log(`✅ Batch updated ${updateResult.modifiedCount} users to offline status`);
    } catch (error) {
      console.warn(`⚠️ Could not batch update users to offline status:`, error.message);
      // OPTIMIZATION: Don't throw, just log warning for cleanup functions
    }
  }
};

// Periodic cleanup of stale switch request tracking (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  
  for (const [userId, switchData] of recentSwitchRequests.entries()) {
    if (now - switchData.timestamp > staleThreshold) {
      recentSwitchRequests.delete(userId);
    }
  }
  
  if (recentSwitchRequests.size > 0) {
    console.log(`🧹 Cleaned up stale switch tracking. Active entries: ${recentSwitchRequests.size}`);
  }
}, 5 * 60 * 1000);

// Export the handler and cleanup function
module.exports = { 
  userHandler,
  cleanupStaleConnections,
  getUserConnections: () => userConnections // For debugging
}; 