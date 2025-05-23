# Socket Architecture Documentation

## Overview

This directory contains a modular socket.io implementation that separates different types of real-time functionality into dedicated handlers. This architecture makes it easy to add new features, maintain existing code, and debug socket-related issues.

## Structure

```
backend/sockets/
├── index.js              # Main socket initialization
├── events.js             # Socket event constants
├── chatHandler.js        # Chat and messaging functionality
├── userHandler.js        # User presence and authentication
├── roomHandler.js        # Room management and notifications
├── gameHandler.js        # Game-specific real-time features
└── README.md            # This documentation
```

## Handlers

### 1. Chat Handler (`chatHandler.js`)
Manages all chat-related functionality:
- **Events**: `send_message`, `join_conversation`, `typing_start`, `typing_stop`
- **Features**: Real-time messaging, typing indicators, message reactions, read receipts
- **Rooms**: Conversation-based and room-based messaging

### 2. User Handler (`userHandler.js`)
Handles user presence and authentication:
- **Events**: `join_user`, `user_going_offline`, `user_activity`
- **Features**: Online/offline status, user activity tracking, presence management
- **Rooms**: Personal user rooms for notifications

### 3. Room Handler (`roomHandler.js`)
Manages room-related functionality:
- **Events**: `join_room`, `leave_room`, `player_joined`, `game_starting`
- **Features**: Room membership, player management, game lifecycle events
- **Rooms**: Room-specific notifications and updates

### 4. Game Handler (`gameHandler.js`)
Handles game-specific real-time features:
- **Events**: `piece_moved`, `game_completed`, `hint_used`, `cursor_position`
- **Features**: Puzzle collaboration, game state sync, turn management
- **Rooms**: Game-specific rooms and spectator rooms

## Adding New Features

### Backend

1. **Create a new handler** (e.g., `notificationHandler.js`):
```javascript
const notificationHandler = (socket, io) => {
  socket.on('send_notification', async (data) => {
    // Handle notification logic
    io.to(`user_${data.recipientId}`).emit('new_notification', data);
  });
};

module.exports = notificationHandler;
```

2. **Add event constants** to `events.js`:
```javascript
const SOCKET_EVENTS = {
  // ... existing events
  SEND_NOTIFICATION: 'send_notification',
  NEW_NOTIFICATION: 'new_notification',
};
```

3. **Register the handler** in `index.js`:
```javascript
const notificationHandler = require('./notificationHandler');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    // ... existing handlers
    notificationHandler(socket, io);
  });
};
```

### Frontend

1. **Create a handler** in `frontend/src/services/socket/`:
```javascript
// notificationSocketHandler.js
import { SOCKET_EVENTS } from '../../constants/socketEvents';

class NotificationSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
  }

  initializeListeners() {
    this.socket.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification) => {
      // Handle notification
    });
  }

  sendNotification(data) {
    this.socket.emit(SOCKET_EVENTS.SEND_NOTIFICATION, data);
  }

  destroy() {
    this.socket.off(SOCKET_EVENTS.NEW_NOTIFICATION);
  }
}

export default NotificationSocketHandler;
```

2. **Register in socketService.js**:
```javascript
import NotificationSocketHandler from './socket/notificationSocketHandler';

initializeHandlers() {
  // ... existing handlers
  this.handlers.notification = new NotificationSocketHandler(this.socket);
}
```

## Best Practices

1. **Event Naming**: Use descriptive, consistent event names
2. **Error Handling**: Always include try-catch blocks and emit error events
3. **Room Management**: Use consistent room naming patterns (`user_${id}`, `room_${id}`)
4. **Cleanup**: Implement proper cleanup in handler destroy methods
5. **Logging**: Include meaningful console logs for debugging
6. **Validation**: Validate incoming data before processing

## Event Constants

All socket events are defined in `events.js` (backend) and `constants/socketEvents.js` (frontend) to:
- Avoid magic strings
- Ensure consistency between frontend and backend
- Make refactoring easier
- Provide better IDE support

## Room Naming Conventions

- `user_${userId}` - Personal user rooms for notifications
- `room_${roomId}` - Room-specific communications
- `conversation_${conversationId}` - Private conversations
- `game_${gameId}` - Game-specific events
- `game_${gameId}_spectators` - Spectator rooms

This modular architecture makes it easy to scale the real-time features of PuzzLink while maintaining clean, organized code. 