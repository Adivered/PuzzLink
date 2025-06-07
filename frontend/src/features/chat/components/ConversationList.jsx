import React, { useMemo } from 'react';
import { Home } from 'lucide-react';

const ConversationList = ({ 
  // Props from parent
  conversations = [],
  roomDetails,
  activeConversation,
  activeRoom,
  unreadCounts,
  onlineUsers = [],
  currentGameRoom,
  user,
  homeConversationId,
  theme,
  // Callbacks from parent
  onSelectConversation,
  onSelectRoom,
  onSelectHomeConversation
}) => {
  // ===== PURE DATA PROCESSING (NO REDUX/SOCKET CALLS) =====

  // OPTIMIZATION: Memoize room list to prevent infinite re-renders
  const userRooms = useMemo(() => {
    // Get all rooms from roomDetails (game rooms)
    const chatRooms = Object.entries(roomDetails).filter(([roomId, roomData]) => 
      roomData && roomData.name
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

  // OPTIMIZATION: Memoize home conversation info to prevent re-renders
  const homeConversation = useMemo(() => {
    if (!homeConversationId) return null;
    
    const isActive = activeConversation === homeConversationId;
    const unreadCount = unreadCounts[homeConversationId] || 0;
    
    return {
      id: homeConversationId,
      name: 'Home',
      isActive,
      unreadCount,
      description: 'Global community chat'
    };
  }, [homeConversationId, activeConversation, unreadCounts]);

  // Show loading only if we have absolutely no useful data
  const hasUsefulData = homeConversation || userRooms.length > 0;
  
  if (!hasUsefulData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Connecting to chat...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {/* Home Conversation - Always shown first for authenticated users */}
          {homeConversation && (
            <div
              onClick={onSelectHomeConversation}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                homeConversation.isActive
                  ? theme === 'dark' 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-blue-500 text-white border-blue-400'
                  : theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-200 border-gray-600 border-dashed' 
                    : 'hover:bg-gray-100 text-gray-800 border-gray-300 border-dashed'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Home Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  homeConversation.isActive
                    ? 'bg-white bg-opacity-20'
                    : theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                }`}>
                  <Home size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {homeConversation.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {homeConversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {homeConversation.unreadCount > 99 ? '99+' : homeConversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-1 ${homeConversation.isActive ? 'text-blue-100' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {homeConversation.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User's Joined Rooms */}
          {userRooms.length > 0 && (
            <>
              {(homeConversation || conversations.length > 0) && (
                <div className={`px-3 py-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className={`text-xs font-medium uppercase tracking-wider flex items-center`}>
                    <Home size={12} className="mr-2" />
                    Rooms
                  </div>
                </div>
              )}
              
              {userRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    room.isActive
                      ? theme === 'dark' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-500 text-white'
                      : theme === 'dark' 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Room Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      room.isActive
                        ? 'bg-white bg-opacity-20'
                        : theme === 'dark' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-500 text-white'
                    }`}>
                      <span className="text-lg font-bold">
                        {room.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          <span>{room.name}</span>
                        </h4>
                        <div className="flex items-center space-x-2">
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
