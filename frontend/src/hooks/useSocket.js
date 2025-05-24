import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isConnected, isConnecting } = useSelector((state) => state.socket);
  const authenticatedUser = useRef(null);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && !isConnected && !isConnecting) {
      console.log('🔌 Initiating socket connection for authenticated user');
      socketService.connect().catch((error) => {
        console.error('Failed to connect to socket server:', error.message);
        // Don't attempt immediate retry here - let the socket service handle retries
      });
    }
  }, [isAuthenticated, isConnected, isConnecting]);

  // Handle user authentication when socket is connected
  useEffect(() => {
    const currentUserId = user?.id;
    
    if (isAuthenticated && currentUserId && isConnected) {
      // Prevent re-authentication of the same user
      if (authenticatedUser.current !== currentUserId) {
        console.log('🔐 Authenticating user via useSocket hook:', currentUserId);
        socketService.authenticateUser(currentUserId);
        authenticatedUser.current = currentUserId;
      }
    } else if (!isAuthenticated) {
      // User logged out - reset authentication and disconnect socket
      authenticatedUser.current = null;
      console.log('👋 User logged out, clearing socket authentication');
      if (isConnected) {
        socketService.disconnect();
      }
    }
  }, [isAuthenticated, user?.id, isConnected]);

  return {
    isConnected,
    user: authenticatedUser.current
  };
};

export default useSocket; 