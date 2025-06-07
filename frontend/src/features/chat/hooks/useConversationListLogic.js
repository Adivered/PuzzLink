import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Conversation List logic hook following Single Responsibility Principle
 * Handles conversation data processing and state management
 */
export const useConversationListLogic = () => {
  const user = useSelector((state) => state.auth.user);
  const { 
    roomDetails,
    activeRoom,
    unreadCounts,
    conversations,
    activeConversation
  } = useSelector((state) => state.chat);
  const currentGameRoom = useSelector((state) => state.room.data);

  // Process user rooms data
  const userRooms = useMemo(() => {
    // Get all rooms from roomDetails (game rooms only - explicitly exclude Home room)
    const chatRooms = Object.entries(roomDetails).filter(([roomId, roomData]) => 
      roomData && roomData.name && roomData.name !== 'Home'
    ).map(([roomId, roomData]) => ({
      id: roomId,
      name: roomData.name || 'Unknown Room',
      isActive: activeRoom === roomId,
      unreadCount: unreadCounts[roomId] || 0,
      onlineCount: roomData.players?.length || roomData.onlineCount || 0,
      description: roomData.description || 'Room chat',
      isCurrentGameRoom: currentGameRoom && currentGameRoom._id === roomId
    }));
    
    // Always include current game room if not already in the list
    if (currentGameRoom && currentGameRoom._id) {
      const roomExists = chatRooms.some(room => room.id === currentGameRoom._id);
      
      if (!roomExists) {
        // Use more accurate player count from roomDetails if available
        const roomDetailsData = roomDetails[currentGameRoom._id];
        const playerCount = roomDetailsData?.players?.length || 
                           roomDetailsData?.onlineCount || 
                           currentGameRoom.players?.length || 0;
        
        chatRooms.push({
          id: currentGameRoom._id,
          name: currentGameRoom.name || 'Current Room',
          isActive: activeRoom === currentGameRoom._id,
          unreadCount: unreadCounts[currentGameRoom._id] || 0,
          onlineCount: playerCount,
          description: 'Current game room',
          isCurrentGameRoom: true
        });
      }
    }
    
    // Sort to show current game room first
    return chatRooms.sort((a, b) => {
      if (a.isCurrentGameRoom && !b.isCurrentGameRoom) return -1;
      if (!a.isCurrentGameRoom && b.isCurrentGameRoom) return 1;
      return 0;
    });
  }, [roomDetails, activeRoom, unreadCounts, currentGameRoom]);

  // Process home conversation data - No longer used since we're using the feature-based system
  const homeRoom = null;

  // Check if we have useful data to display
  const hasUsefulData = homeRoom || userRooms.length > 0;

  return {
    roomDetails,
    activeRoom,
    unreadCounts,
    currentGameRoom,
    user,
    userRooms,
    homeRoom,
    hasUsefulData,
    conversations,
    activeConversation,
  };
}; 