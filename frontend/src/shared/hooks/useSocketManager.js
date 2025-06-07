import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeChatData } from '../../app/store/chatSlice';
import useSocket from '../../hooks/useSocket';
import useSocketEventHandlers from '../../hooks/useSocketEventHandlers';

/**
 * Socket manager hook following Single Responsibility Principle
 * Manages socket connections and initializes chat data for authenticated users
 */
export const useSocketManager = () => {
  const dispatch = useDispatch();
  const { user, homeConversationId } = useSelector((state) => state.auth);
  const { isInitialized } = useSelector((state) => state.chat);

  // Initialize socket connection for authenticated users
  useSocket();
  
  // Set up global socket event handlers
  useSocketEventHandlers();

  // Initialize chat data when user has valid home conversation
  useEffect(() => {
    if (user && homeConversationId && homeConversationId !== 'pending' && !isInitialized) {
      // Initialize chat with home conversation
      dispatch(initializeChatData({
        conversations: [], // Will be populated by socket events
        roomDetails: {},
        messages: {
          [homeConversationId]: [] // Initialize home conversation messages
        }
      }));
    }
  }, [user, homeConversationId, isInitialized, dispatch]);

  return {
    isConnected: !!user,
    isInitialized: isInitialized && !!homeConversationId,
  };
}; 