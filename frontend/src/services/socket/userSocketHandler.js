import store from '../../store';
import { setUserOnline, setUserOffline } from '../../store/chatSlice';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

class UserSocketHandler {
  constructor(socket) {
    this.socket = socket;
    this.initializeListeners();
  }

  initializeListeners() {
    // User online/offline status
    this.socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
      store.dispatch(setUserOnline(userId));
    });

    this.socket.on(SOCKET_EVENTS.USER_OFFLINE, (userId) => {
      store.dispatch(setUserOffline(userId));
    });

    // Connection status
    this.socket.on(SOCKET_EVENTS.ERROR, ({ message }) => {
      console.error('Socket error:', message);
      // You could dispatch an error action here
    });
  }

  // User-specific emit methods
  joinUser(userId) {
    this.socket.emit(SOCKET_EVENTS.JOIN_USER, userId);
  }

  userGoingOffline(userId) {
    this.socket.emit(SOCKET_EVENTS.USER_GOING_OFFLINE, userId);
  }

  updateUserActivity(userId) {
    this.socket.emit(SOCKET_EVENTS.USER_ACTIVITY, userId);
  }

  // Cleanup method
  destroy() {
    this.socket.off(SOCKET_EVENTS.USER_ONLINE);
    this.socket.off(SOCKET_EVENTS.USER_OFFLINE);
    this.socket.off(SOCKET_EVENTS.ERROR);
  }
}

export default UserSocketHandler; 