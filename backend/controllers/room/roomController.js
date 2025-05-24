const Room = require('../../models/Room');
const Game = require('../../models/Game');
const User = require('../../models/User');
const PieceSchema = require('../../models/PieceSchema');
const Puzzle = require('../../models/Puzzle');
const Whiteboard = require('../../models/Whiteboard');

exports.createRoom = async (req, res) => {
  try {
    // console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Files:", req.files || req.file);
    const { roomName, players,gameMode, timeLimit, turnBased } = req.body;
    let imagePath = null;
    
    // Only process image for non-whiteboard games
    if (req.file && gameMode.toLowerCase() !== 'drawable') {
      imagePath = encodeURI(`/uploads/${req.file.filename}`); // Encode the image path
    }
    
    //const roomOptions = new RoomOptions({ timeLimit });
    let room = new Room({
      name: roomName,
      creator: req.user._id,
      players: players ? [req.user._id, ...players] : [req.user._id],
      timeLimit,
      gameMode: gameMode.toLowerCase(),
      turnBased: gameMode.toLowerCase() === 'drawable' ? false : turnBased, // Force turnBased to false for whiteboard
      image: imagePath,
      status: 'waiting',
    });
    room = await room.save();
    await Promise.all(room.players?.map(player => {
      console.log("Player: ", player)
      return User.findByIdAndUpdate(player, {
        currentRoom: room._id,
      });
    }));
    room = await Room.findById(room._id)
      .populate('players', 'name picture currentRoom isOnline lastActive');

    res.status(201).json(room);
  } catch (error) {
    console.log("Error: ", error.message)
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
    console.log("Request: (start) ", req.params, req.body)
    const { roomId } = req.params;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can start the game' });
    }

    console.log("Room found: ", room)

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
        console.log("Puzzle game created: ", game);
      }
      
      room.status = 'inProgress';
      room.currentGame = game._id;
      await room.save();

      res.json({ message: 'Game started', gameId: game._id });
    }
    catch(e){
      console.log("Error: ", e)
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
      .populate('players', 'name picture currentRoom isOnline lastActive')
      .populate('currentGame', 'gameMode gameImages players');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
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
        currentPosition: {
          row,
          col,
        },
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