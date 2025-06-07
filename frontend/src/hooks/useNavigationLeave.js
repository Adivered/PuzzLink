import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getSocketInstance } from '../app/store/socketSlice';

/**
 * Hook to handle room leaving when user navigates away from room/game pages
 */
const useNavigationLeave = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const roomData = useSelector((state) => state.room.data);
  const previousLocation = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousLocation.current;
    
    // Check if user was on a room/game page
    const wasOnRoomPage = previousPath.startsWith('/rooms/');
    const wasOnGamePage = previousPath.startsWith('/game/');
    
    // Check if user is now on a room/game page
    const isOnRoomPage = currentPath.startsWith('/rooms/');
    const isOnGamePage = currentPath.startsWith('/game/');
    
    // If user was on room/game page and is now leaving to a different page
    if ((wasOnRoomPage || wasOnGamePage) && (!isOnRoomPage && !isOnGamePage)) {
      const socket = getSocketInstance();
      
      if (socket && socket.connected && (user?.currentRoom || roomData?._id)) {
        const roomId = user?.currentRoom || roomData?._id;
        console.log('👋 User navigating away from room, emitting leave_room:', roomId);
        
        // Emit leave room event
        socket.emit('leave_room', { roomId });
      }
    }
    
    // Update previous location
    previousLocation.current = currentPath;
  }, [location.pathname, user?.currentRoom, roomData?._id]);

  // Handle page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const socket = getSocketInstance();
      const currentPath = location.pathname;
      const isOnRoomPage = currentPath.startsWith('/rooms/');
      const isOnGamePage = currentPath.startsWith('/game/');
      
      if (socket && socket.connected && (isOnRoomPage || isOnGamePage)) {
        const roomId = user?.currentRoom || roomData?._id;
        if (roomId) {
          console.log('👋 Page unload, emitting leave_room:', roomId);
          socket.emit('leave_room', { roomId });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, user?.currentRoom, roomData?._id]);
};

export default useNavigationLeave; 