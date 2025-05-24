import store from '../../store';
import { addSocketEvent } from '../../store/socketSlice';

class WhiteboardSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.listeners = {};
    this.setupListeners();
  }

  setupListeners() {
    // Whiteboard state sync
    this.listeners.whiteboardStateSync = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'whiteboard_state_sync', 
        data 
      }));
      
      // Emit custom event for components to listen to
      window.dispatchEvent(new CustomEvent('whiteboardStateSync', { detail: data }));
    };

    // Stroke added
    this.listeners.whiteboardStrokeAdded = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'whiteboard_stroke_added', 
        data 
      }));
      
      window.dispatchEvent(new CustomEvent('whiteboardStrokeAdded', { detail: data }));
    };

    // Stroke undone
    this.listeners.whiteboardUndo = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'whiteboard_undo', 
        data 
      }));
      
      window.dispatchEvent(new CustomEvent('whiteboardUndo', { detail: data }));
    };

    // Whiteboard cleared
    this.listeners.whiteboardCleared = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'whiteboard_cleared', 
        data 
      }));
      
      window.dispatchEvent(new CustomEvent('whiteboardCleared', { detail: data }));
    };

    // User cursor position
    this.listeners.whiteboardUserCursor = (data) => {
      window.dispatchEvent(new CustomEvent('whiteboardUserCursor', { detail: data }));
    };

    // Draw start
    this.listeners.whiteboardDrawStart = (data) => {
      window.dispatchEvent(new CustomEvent('whiteboardDrawStart', { detail: data }));
    };

    // Draw move
    this.listeners.whiteboardDrawMove = (data) => {
      window.dispatchEvent(new CustomEvent('whiteboardDrawMove', { detail: data }));
    };

    // Tool change
    this.listeners.whiteboardToolChange = (data) => {
      window.dispatchEvent(new CustomEvent('whiteboardToolChange', { detail: data }));
    };

    // Player joined
    this.listeners.playerJoinedGame = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'player_joined_game', 
        data 
      }));
      
      window.dispatchEvent(new CustomEvent('playerJoinedGame', { detail: data }));
    };

    // Player left
    this.listeners.playerLeftGame = (data) => {
      store.dispatch(addSocketEvent({ 
        type: 'player_left_game', 
        data 
      }));
      
      window.dispatchEvent(new CustomEvent('playerLeftGame', { detail: data }));
    };

    // Register all listeners
    Object.entries(this.listeners).forEach(([event, handler]) => {
      const socketEvent = this.camelToSnakeCase(event);
      this.socket.on(socketEvent, handler);
    });

    console.log('🎨 Whiteboard socket handler initialized');
  }

  // Convert camelCase to snake_case for socket events
  camelToSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  destroy() {
    // Remove all listeners
    Object.entries(this.listeners).forEach(([event, handler]) => {
      const socketEvent = this.camelToSnakeCase(event);
      this.socket.off(socketEvent, handler);
    });
    
    this.listeners = {};
    console.log('🎨 Whiteboard socket handler destroyed');
  }
}

export default WhiteboardSocketHandler; 