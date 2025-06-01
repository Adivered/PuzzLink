import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket, emitSocketEvent } from '../store/socketSlice';
import { setActiveRoom } from '../store/chatSlice';

const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { isConnected, isConnecting } = useSelector((state) => state.socket);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (user && !isConnected && !isConnecting && !hasConnectedRef.current) {
      hasConnectedRef.current = true;
      
      // 1. Connect to socket
      dispatch(connectSocket()).then((result) => {
        if (result.type === 'socket/connect/fulfilled') {
          // 2. FIRST - Set active room to Home so UI is ready for messages
          if (user.homeRoomId) {
            dispatch(setActiveRoom(user.homeRoomId));
          }
          
          // 3. THEN - Join user (this gets initial data including Home messages)
          emitSocketEvent('join_user', user.id);
        }
      });
    }

    // Disconnect when user logs out
    if (!user && isConnected) {
      dispatch(disconnectSocket());
      hasConnectedRef.current = false;
    }
  }, [dispatch, user, isConnected, isConnecting]);

  return {
    isConnected,
    isConnecting
  };
};

export default useSocket; 