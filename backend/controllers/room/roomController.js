const Room = require('../../models/Room');
const Game = require('../../models/Game');
const User = require('../../models/User');
const PieceSchema = require('../../models/PieceSchema');
const Puzzle = require('../../models/Puzzle');
const Whiteboard = require('../../models/Whiteboard');

exports.createRoom = async (req, res) => {
  try {
    const { roomName, players, gameMode, timeLimit, turnBased } = req.body;
    let imagePath = null;
    
    // Only process image for non-whiteboard games
    if (req.file && gameMode.toLowerCase() !== 'drawable') {
      imagePath = encodeURI(`/uploads/${req.file.filename}`); // Encode the image path
    }
    
    // Parse players from JSON string and extract user IDs for invitations
    let invitedPlayerIds = [];
    if (players) {
      try {
        const parsedPlayers = JSON.parse(players);
        invitedPlayerIds = parsedPlayers.map(player => player._id);
      } catch (error) {
        console.error("Error parsing players JSON:", error);
        return res.status(400).json({ message: 'Invalid players data format' });
      }
    }
    
    // Create room with only the creator as a player initially
    // Invited users will be added when they accept the invitation
    const room = await Room.create({
      name: roomName,
      creator: req.user._id,
      players: [req.user._id], // Only creator initially
      timeLimit,
      gameMode: gameMode.toLowerCase(),
      turnBased: gameMode.toLowerCase() === 'drawable' ? false : turnBased, // Force turnBased to false for whiteboard
      image: imagePath,
      status: 'waiting',
      pendingInvitations: invitedPlayerIds, // Store pending invitations
    });
    
    // Update current room for the creator only
    await User.findByIdAndUpdate(req.user._id, {
      currentRoom: room._id,
    });
    
    // Send invitations to invited players
    const io = req.app.get('io');
    
    // Ensure the creator joins the room socket for real-time updates
    if (io) {
      // Find the creator's socket and join them to the room
      const creatorRoom = `user_${req.user._id}`;
      const creatorSockets = io.sockets.adapter.rooms.get(creatorRoom);
      
      if (creatorSockets && creatorSockets.size > 0) {
        // Get the first socket for this user and join them to the room
        const socketId = Array.from(creatorSockets)[0];
        const creatorSocket = io.sockets.sockets.get(socketId);
        
        if (creatorSocket) {
          creatorSocket.join(`room_${room._id}`);
        }
      }
    }
    if (io && invitedPlayerIds.length > 0) {
      for (const playerId of invitedPlayerIds) {
        // Check if recipient is connected to their personal room
        const recipientRoom = `user_${playerId}`;
        
        // Send invitation regardless of connection status
        // If user is offline, they'll get it when they come online
        io.to(recipientRoom).emit('room_invitation', {
          roomId: room._id,
          inviterName: req.user.name,
          timestamp: new Date()
        });
      }
    }
    
    // Populate and return the room
    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'name picture isOnline lastActive')
      .populate('players', 'name picture currentRoom isOnline lastActive');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    let room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Game already in progress' });
    }
    if (room.players.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already in the room' });
    }
    room.players.push(req.user._id);
    room = await room.save();
    room = await room.populate('players', 'name picture currentRoom isOnline lastActive').exec();

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.startGame = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can start the game' });
    }

    try{
      let game;
      
      if (room.gameMode.toLowerCase() === 'drawable') {
        // Create whiteboard game
        const whiteboard = new Whiteboard({
          game: null, // Will be set after game creation
          background: {
            color: '#ffffff'
          },
          dimensions: {
            width: 1920,
            height: 1080
          }
        });
        
        game = new Game({
          room: room._id,
          whiteboard: null // Will be set after whiteboard creation
        });
        
        await game.save();
        
        // Update whiteboard with game reference
        whiteboard.game = game._id;
        await whiteboard.save();
        
        // Update game with whiteboard reference
        game.whiteboard = whiteboard._id;
        await game.save();
        
        console.log("Whiteboard game created: ", game);
      } else {
        // Create puzzle game (existing logic)
        let difficulty = room.difficulty === 'medium' ? { rows: 4, cols: 4 } : difficulty === 'easy' ? { rows: 3, cols: 3 } : { rows: 5, cols: 5 };
        const imageWidth = 1000; 
        const imageHeight = 1000;
        const piecesData = generatePuzzlePieces(imageWidth, imageHeight, difficulty.rows, difficulty.cols);
        console.log("Pieces: ", piecesData)

        const pieceDocuments = await Promise.all(
          piecesData.map(pieceData => {
            const piece = new PieceSchema({
              position: pieceData.position,
              currentPosition: pieceData.currentPosition,
              imageData: pieceData.imageData,
              connections: pieceData.connections,
              isCorrectlyPlaced: pieceData.isCorrectlyPlaced
            });
            return piece.save();
          })
        );

        const puzzle = await Puzzle.create({
          originalImage: {
            url: room.image,
            width: imageWidth,
            height: imageHeight
          },
          pieces: pieceDocuments.map(doc => doc._id),
        });
        
        game = new Game({
          room: room._id,
          puzzle: room.gameMode === 'puzzle' ? puzzle._id : undefined,
        });
        
        await game.save();
      }
      
      room.status = 'inProgress';
      room.currentGame = game._id;
      await room.save();

      // Get socket.io instance and emit game starting countdown
      const io = req.app.get('io');
      if (io) {
        // Emit game starting with countdown
        io.to(`room_${roomId}`).emit('game_starting', {
          roomId,
          countdown: 3
        });

        // After 3 seconds, emit game started
        setTimeout(() => {
          io.to(`room_${roomId}`).emit('game_started', {
            roomId,
            gameId: game._id
          });
        }, 3000);
      }

      res.json({ message: 'Game started', gameId: game._id });
    }
    catch(e){
      res.status(500).json({ message: 'Server error', error: e.message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId)
      .populate('creator', 'name picture isOnline lastActive')
      .populate('players', 'name picture currentRoom isOnline lastActive')
      .populate('pendingInvitations', 'name picture isOnline lastActive')
      .populate('currentGame', 'gameMode gameImages players');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if the user is a member of the room or has a pending invitation
    const isRoomMember = room.players.some(player => player._id.toString() === req.user._id.toString());
    const hasPendingInvitation = room.pendingInvitations.some(user => user._id.toString() === req.user._id.toString());
    
    if (!isRoomMember && !hasPendingInvitation) {
      return res.status(403).json({ message: 'You are not a member of this room' });
    }
    
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removePlayer = async (req, res) => {
  try {
    const { roomId, playerId } = req.params;
    
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if the requester is the room creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can remove players' });
    }
    
    // Check if the player is in the room (handle both populated and non-populated players)
    const playerInRoom = room.players.some(player => {
      const playerIdToCheck = player._id ? player._id.toString() : player.toString();
      return playerIdToCheck === playerId;
    });
    
    if (!playerInRoom) {
      return res.status(400).json({ message: 'Player is not in this room' });
    }
    
    // Don't allow removing the creator
    if (room.creator.toString() === playerId) {
      return res.status(400).json({ message: 'Cannot remove the room creator' });
    }
    
    // Get player info before removing
    const playerToRemove = await User.findById(playerId);
    
    // Remove player from room
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { players: playerId } },
      { new: true }
    ).populate('players', 'name picture currentRoom isOnline lastActive');
    
    // Update the removed player's current room to null (Home is now a conversation)
    await User.findByIdAndUpdate(playerId, {
      currentRoom: null
    });
    
    // Notify all room members about the player removal via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`room_${roomId}`).emit('player_removed', {
        roomId,
        playerId,
        playerName: playerToRemove?.name,
        removedBy: req.user.name,
        players: updatedRoom.players
      });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error removing player:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// Invite users to an existing room
exports.inviteToRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'userIds array is required' });
    }
    
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if the requester is the room creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can invite players' });
    }
    
    // Filter out users who are already in the room or have pending invitations
    const newInvitations = userIds.filter(userId => 
      !room.players.includes(userId) && !room.pendingInvitations.includes(userId)
    );
    

    
    if (newInvitations.length === 0) {
      // More specific error messages
      const alreadyInRoom = userIds.filter(userId => room.players.includes(userId));
      const alreadyInvited = userIds.filter(userId => room.pendingInvitations.includes(userId));
      
      let message = 'Cannot send invitations: ';
      if (alreadyInRoom.length > 0) {
        message += `${alreadyInRoom.length} user(s) already in room. `;
      }
      if (alreadyInvited.length > 0) {
        message += `${alreadyInvited.length} user(s) already have pending invitations.`;
      }
      
      return res.status(400).json({ message: message.trim() });
    }
    
    // Add to pending invitations
    await Room.findByIdAndUpdate(roomId, {
      $addToSet: { pendingInvitations: { $each: newInvitations } }
    });
    
    // Send invitations via socket
    const io = req.app.get('io');
    if (io) {
      for (const userId of newInvitations) {
        const recipientRoom = `user_${userId}`;
        const recipientSockets = io.sockets.adapter.rooms.get(recipientRoom);
        
        // Send invitation (will be received if user is online, stored for later if offline)
        io.to(recipientRoom).emit('room_invitation', {
          roomId: room._id,
          inviterName: req.user.name,
          timestamp: new Date()
        });
      }
    }
    
    res.json({
      message: `Invitations sent to ${newInvitations.length} users`,
      invitedUsers: newInvitations
    });
  } catch (error) {
    console.error('Error inviting users to room:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const generatePuzzlePieces = (imageWidth, imageHeight, rows, cols) => {
  const pieces = [];
  const pieceWidth = imageWidth / cols;
  const pieceHeight = imageHeight / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({
        position: {
          row,
          col,
        },
        currentPosition: null, // Pieces start in the bank
        imageData: JSON.stringify({
          x: col * pieceWidth,
          y: row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
        }),
        connections: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
        isCorrectlyPlaced: false,
      });
    }
  }

  return pieces;
};

// Update room settings (only by creator)
exports.updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { timeLimit, gameMode, turnBased, name } = req.body;
    
    // Find the room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Check if the requester is the room creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the room creator can edit room settings' });
    }
    
    // Can't update if game is in progress
    if (room.status === 'inProgress') {
      return res.status(400).json({ message: 'Cannot update room settings while game is in progress' });
    }
    
    // Update allowed fields
    const updateData = {};
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (gameMode !== undefined) updateData.gameMode = gameMode.toLowerCase();
    if (turnBased !== undefined) updateData.turnBased = turnBased;
    if (name !== undefined) updateData.name = name;
    
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true }
    ).populate('creator', 'name picture isOnline lastActive')
     .populate('players', 'name picture currentRoom isOnline lastActive')
     .populate('pendingInvitations', 'name picture isOnline lastActive');
    
    // Notify all room members about the room update via socket
    const io = req.app.get('io');
    if (io) {
      const roomUpdateData = {
        roomId,
        roomData: {
          _id: updatedRoom._id,
          name: updatedRoom.name,
          creator: updatedRoom.creator,
          players: updatedRoom.players,
          pendingInvitations: updatedRoom.pendingInvitations,
          timeLimit: updatedRoom.timeLimit,
          gameMode: updatedRoom.gameMode,
          turnBased: updatedRoom.turnBased,
          status: updatedRoom.status,
          currentGame: updatedRoom.currentGame
        },
        updatedBy: req.user.name
      };
      
      io.to(`room_${roomId}`).emit('room_data_update', roomUpdateData);
      io.to(`room_${roomId}`).emit('room_settings_updated', {
        roomId,
        settings: updateData,
        updatedBy: req.user.name
      });
    }
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};