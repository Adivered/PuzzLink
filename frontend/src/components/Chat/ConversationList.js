import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Home, MessageCircle } from 'lucide-react';
import { fetchConversations, setActiveConversation, setActiveRoom } from '../../store/chatSlice';
import { formatDistanceToNow } from 'date-fns';
import socketService from '../../services/socketService';

const ConversationList = ({ onSelectConversation }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const { 
    conversations, 
    activeConversation, 
    activeRoom,
    loading, 
    unreadCounts,
    onlineUsers,
    roomDetails 
  } = useSelector((state) => state.chat);

  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    if (user && conversations.length === 0 && !loading.conversations) {
      dispatch(fetchConversations());
    }
  }, [dispatch, user, conversations.length]);

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    if (activeRoom) {
      dispatch(setActiveRoom(null));
    }
    onSelectConversation?.();
  };

  const handleSelectHomeRoom = () => {
    if (user?.homeRoomId) {
      dispatch(setActiveRoom(user.homeRoomId));
      if (activeConversation) {
        dispatch(setActiveConversation(null));
      }
      onSelectConversation?.();
    }
  };

  const handleSelectRoom = (roomId) => {
    dispatch(setActiveRoom(roomId));
    if (activeConversation) {
      dispatch(setActiveConversation(null));
    }
    onSelectConversation?.();
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user.id);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const getConversationName = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Group Chat';
    }
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.name || 'Unknown User';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupAvatar;
    }
    const otherUser = getOtherParticipant(conversation);
    return otherUser?.picture;
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const { content, sender, messageType } = conversation.lastMessage;
    const senderName = sender === user.id ? 'You' : getOtherParticipant(conversation)?.name;
    
    if (messageType === 'image') {
      return `${senderName}: 📷 Image`;
    }
    
    return `${senderName}: ${content.length > 30 ? content.substring(0, 30) + '...' : content}`;
  };

  const getLastMessageTime = (conversation) => {
    if (!conversation.lastMessage) return '';
    
    try {
      return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Get Home room info - only show when user is not in another room
  const getHomeRoomInfo = () => {
    if (!user?.homeRoomId) return null;
    
    // Hide Home chat if user is currently active in a different room
    if (activeRoom && activeRoom !== user.homeRoomId) {
      return null;
    }
    
    const homeRoomData = roomDetails[user.homeRoomId];
    const isActive = activeRoom === user.homeRoomId;
    const unreadCount = unreadCounts[user.homeRoomId] || 0;
    
    return {
      id: user.homeRoomId,
      name: homeRoomData?.name || 'Home',
      isActive,
      unreadCount,
      description: 'Global community chat'
    };
  };

  // Get user's joined rooms (excluding Home room)
  const getUserRooms = () => {
    if (!user?.homeRoomId) return [];
    
    // Get all rooms from roomDetails that are not the Home room
    return Object.entries(roomDetails).filter(([roomId, roomData]) => 
      roomId !== user.homeRoomId && roomData
    ).map(([roomId, roomData]) => ({
      id: roomId,
      name: roomData.name,
      isActive: activeRoom === roomId,
      unreadCount: unreadCounts[roomId] || 0,
      onlineCount: roomData.onlineCount || 0,
      description: roomData.description || 'Room chat'
    }));
  };

  const userRooms = getUserRooms();

  if (loading.conversations) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading conversations...
        </div>
      </div>
    );
  }

  const homeRoom = getHomeRoomInfo();

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className={`p-3 border-b ${isDarkTheme ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search conversations..."
            className={`w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-colors ${
              isDarkTheme 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {/* Home Room - Always shown first for authenticated users */}
          {homeRoom && (
            <div
              onClick={handleSelectHomeRoom}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                homeRoom.isActive
                  ? isDarkTheme 
                    ? 'bg-blue-600 text-white border-blue-500' 
                    : 'bg-blue-500 text-white border-blue-400'
                  : isDarkTheme 
                    ? 'hover:bg-gray-700 text-gray-200 border-gray-600 border-dashed' 
                    : 'hover:bg-gray-100 text-gray-800 border-gray-300 border-dashed'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Home Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  homeRoom.isActive
                    ? 'bg-white bg-opacity-20'
                    : isDarkTheme 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                }`}>
                  <Home size={18} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">
                      {homeRoom.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {homeRoom.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {homeRoom.unreadCount > 99 ? '99+' : homeRoom.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-1 ${homeRoom.isActive ? 'text-blue-100' : isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {homeRoom.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User's Joined Rooms */}
          {userRooms.length > 0 && (
            <>
              {(homeRoom || conversations.length > 0) && (
                <div className={`px-3 py-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  <div className={`text-xs font-medium uppercase tracking-wider flex items-center`}>
                    <Home size={12} className="mr-2" />
                    Rooms
                  </div>
                </div>
              )}
              
              {userRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    room.isActive
                      ? isDarkTheme 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-500 text-white'
                      : isDarkTheme 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Room Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      room.isActive
                        ? 'bg-white bg-opacity-20'
                        : isDarkTheme 
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
                          {room.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {room.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {room.unreadCount > 99 ? '99+' : room.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className={`text-xs ${room.isActive ? 'text-purple-100' : isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                          {room.onlineCount} {room.onlineCount === 1 ? 'person' : 'people'} online
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Section Divider */}
          {(homeRoom && conversations.length > 0) || (!homeRoom && conversations.length > 0 && activeRoom && activeRoom !== user?.homeRoomId) ? (
            <div className={`px-3 py-2 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`text-xs font-medium uppercase tracking-wider flex items-center`}>
                <MessageCircle size={12} className="mr-2" />
                Direct Messages
              </div>
            </div>
          ) : null}

          {/* Regular Conversations */}
          {conversations.length === 0 && !homeRoom ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm mb-2">
                  {activeRoom && activeRoom !== user?.homeRoomId 
                    ? "No direct conversations" 
                    : "No conversations yet"}
                </p>
                <p className="text-xs mb-3">
                  {activeRoom && activeRoom !== user?.homeRoomId 
                    ? "You're in a room. Start a direct conversation!" 
                    : "Start chatting with other users"}
                </p>
                <button
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDarkTheme 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <Plus size={16} />
                  <span>Start a conversation</span>
                </button>
              </div>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              const isActive = activeConversation === conversation._id;
              const unreadCount = unreadCounts[conversation._id] || 0;
              const isOnline = otherUser && isUserOnline(otherUser._id);

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation._id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? isDarkTheme 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      : isDarkTheme 
                        ? 'hover:bg-gray-700 text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {getConversationAvatar(conversation) ? (
                        <img
                          src={getConversationAvatar(conversation)}
                          alt={getConversationName(conversation)}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          isDarkTheme ? 'bg-gray-600 text-gray-200' : 'bg-gray-300 text-gray-700'
                        }`}>
                          {getConversationName(conversation).charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {getConversationName(conversation)}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                          <span className={`text-xs ${isActive ? 'text-blue-100' : isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getLastMessageTime(conversation)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-xs mt-1 truncate ${isActive ? 'text-blue-100' : isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getLastMessagePreview(conversation)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add new conversation button */}
          {conversations.length > 0 && (
            <div className="pt-2 mt-2 border-t border-gray-600 border-opacity-30">
              <button
                className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-sm transition-colors ${
                  isDarkTheme 
                    ? 'hover:bg-gray-700 text-gray-300 border border-gray-600 border-dashed' 
                    : 'hover:bg-gray-100 text-gray-600 border border-gray-300 border-dashed'
                }`}
              >
                <Plus size={16} />
                <span>New Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;