import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectSocket, disconnectSocket, emitSocketEvent } from '../app/store/socketSlice';
import { setActiveConversation } from '../app/store/chatSlice';
import { clearReconnectFlag } from '../app/store/authSlice';

const useSocket = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const homeConversationId = useSelector((state) => state.auth.homeConversationId);
  const shouldReconnectSocket = useSelector((state) => state.auth.shouldReconnectSocket);
  const { isConnected, isConnecting } = useSelector((state) => state.socket);
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    // Force reconnection after login - handle this first
    if (shouldReconnectSocket && user) {
      console.log('🔄 useSocket: Force reconnection requested');
      hasConnectedRef.current = false;
      
      // Disconnect first if connected, then reconnect will happen in next cycle
      if (isConnected) {
        dispatch(disconnectSocket()).then(() => {
          // Clear the flag after disconnection
          dispatch(clearReconnectFlag());
        });
      } else {
        // If not connected, just clear the flag and let normal connection happen
        dispatch(clearReconnectFlag());
      }
      return; // Exit early to let disconnection complete
    }

    // Normal connection logic - only connect when we have both user and valid homeConversationId
    if (user && homeConversationId && homeConversationId !== 'pending' && !isConnected && !isConnecting && !hasConnectedRef.current) {
      console.log('🔌 useSocket: Connecting for authenticated user', {
        userId: user.id,
        homeConversationId: homeConversationId.slice(-8)
      });
      
      hasConnectedRef.current = true;
      
      // 1. Connect to socket
      dispatch(connectSocket()).then((result) => {
        if (result.type === 'socket/connect/fulfilled') {
          console.log('✅ useSocket: Socket connected, joining user and setting home conversation');
          
          // 2. FIRST - Set active conversation to Home so UI is ready for messages
          dispatch(setActiveConversation(homeConversationId));
          
          // 3. THEN - Join user (this gets initial data including Home messages)
          emitSocketEvent('join_user', user.id);
        } else {
          console.error('❌ useSocket: Socket connection failed', result);
          hasConnectedRef.current = false;
        }
      });
    } else if (user && homeConversationId === 'pending') {
      console.log('⏳ useSocket: Waiting for valid homeConversationId (currently pending)');
    } else if (!user && isConnected) {
      // Disconnect when user logs out
      console.log('🔌 useSocket: User logged out, disconnecting socket');
      dispatch(disconnectSocket());
      hasConnectedRef.current = false;
    }
  }, [dispatch, user, homeConversationId, isConnected, isConnecting, shouldReconnectSocket]);

  return {
    isConnected,
    isConnecting
  };
};

export default useSocket; 