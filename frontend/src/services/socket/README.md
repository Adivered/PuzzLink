# Frontend Socket Architecture

## Overview

The frontend socket system is organized into modular handlers that mirror the backend structure. Each handler manages specific types of real-time functionality and integrates with Redux for state management.

## Structure

```
frontend/src/services/socket/
├── chatSocketHandler.js     # Chat and messaging
├── userSocketHandler.js     # User presence
├── roomSocketHandler.js     # Room management
├── gameSocketHandler.js     # Game functionality
└── README.md               # This documentation

frontend/src/constants/
└── socketEvents.js         # Event constants (mirrors backend)

frontend/src/services/
└── socketService.js        # Main socket service (singleton)
```

## Socket Service Usage

### Basic Connection
```javascript
import socketService from '../services/socketService';

// Connect to server
socketService.connect();

// Join user room for notifications
socketService.joinUser(userId);
```

### Chat Features
```javascript
// Send a message
socketService.sendMessage({
  content: 'Hello!',
  senderId: userId,
  conversationId: conversationId // or roomId for room chat
});

// Join a conversation
socketService.joinConversation(conversationId);

// Typing indicators
socketService.startTyping({ conversationId, userId, userName });
socketService.stopTyping({ conversationId, userId });
```

### Room Features
```javascript
// Join a room
socketService.joinRoom(roomId);

// Subscribe to room events
socketService.onRoomEvent('playerJoined', (data) => {
  console.log('Player joined:', data.player);
});

// Send room invitation
socketService.sendRoomInvitation({
  recipientId: userId,
  roomId: roomId,
  inviterName: 'John Doe'
});
```

### Game Features
```javascript
// Join a game
socketService.joinGame(gameId);

// Subscribe to game events
socketService.onGameEvent('pieceMoved', (data) => {
  // Update game state
});

// Send game events
socketService.pieceMoved({
  gameId,
  pieceId: 'piece_1',
  fromPosition: { x: 0, y: 0 },
  toPosition: { x: 100, y: 100 },
  playerId: userId
});
```

## Handler Architecture

### Chat Handler
- **Redux Integration**: Automatically dispatches actions to update chat state
- **Features**: Messages, typing indicators, read receipts, reactions
- **State Updates**: `addMessage`, `setTypingUser`, `removeTypingUser`

### User Handler
- **Redux Integration**: Updates user online/offline status
- **Features**: Presence management, activity tracking
- **State Updates**: `setUserOnline`, `setUserOffline`

### Room Handler
- **Event System**: Uses callback system for component subscriptions
- **Features**: Room membership, player management, invitations
- **Usage**: Components can subscribe to specific room events

### Game Handler
- **Event System**: Callback-based for real-time game updates
- **Features**: Puzzle collaboration, game state sync, spectator mode
- **Usage**: Game components subscribe to relevant events

## Component Integration

### Using Room Events in Components
```javascript
import { useEffect } from 'react';
import socketService from '../services/socketService';

const RoomComponent = ({ roomId }) => {
  useEffect(() => {
    const handlePlayerJoined = (data) => {
      // Handle player joined
    };

    const handleGameStarting = (data) => {
      // Handle game starting
    };

    // Subscribe to events
    socketService.onRoomEvent('playerJoined', handlePlayerJoined);
    socketService.onRoomEvent('gameStarting', handleGameStarting);

    // Cleanup
    return () => {
      socketService.offRoomEvent('playerJoined', handlePlayerJoined);
      socketService.offRoomEvent('gameStarting', handleGameStarting);
    };
  }, []);

  // Component JSX
};
```

### Using Game Events in Components
```javascript
const GameComponent = ({ gameId }) => {
  useEffect(() => {
    const handlePieceMoved = (data) => {
      // Update piece position
    };

    socketService.onGameEvent('pieceMoved', handlePieceMoved);
    socketService.joinGame(gameId);

    return () => {
      socketService.offGameEvent('pieceMoved', handlePieceMoved);
      socketService.leaveGame(gameId);
    };
  }, [gameId]);
};
```

## State Management Integration

### Chat State (Redux)
The chat handler automatically integrates with Redux:
- New messages are added to the store
- Typing indicators are managed
- User online status is updated
- Conversation last messages are tracked

### Custom State Management
For room and game events, components can:
1. Subscribe to specific events
2. Update local component state
3. Dispatch custom Redux actions if needed

## Error Handling

```javascript
// Socket connection status
if (socketService.isSocketConnected()) {
  // Socket is connected
  socketService.sendMessage(messageData);
} else {
  // Handle offline state
  console.log('Socket not connected');
}

// Error events are logged automatically
// Custom error handling can be added to handlers
```

## Cleanup and Memory Management

### Automatic Cleanup
- Handlers automatically clean up listeners on disconnect
- Component unmounting should remove event subscriptions

### Manual Cleanup
```javascript
// In component cleanup
useEffect(() => {
  return () => {
    socketService.leaveRoom(roomId);
    socketService.leaveConversation(conversationId);
  };
}, []);
```

## Adding New Features

1. **Add events** to `constants/socketEvents.js`
2. **Create handler** in `services/socket/`
3. **Register handler** in `socketService.js`
4. **Add methods** to socketService for easy access
5. **Update components** to use new functionality

This modular approach ensures clean separation of concerns and makes it easy to add new real-time features to PuzzLink. 