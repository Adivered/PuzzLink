import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search } from 'lucide-react';
import { fetchConversations, setActiveConversation, setActiveRoom } from '../../store/chatSlice';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ onSelectConversation }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  const { 
    conversations, 
    activeConversation, 
    loading, 
    unreadCounts,
    onlineUsers 
  } = useSelector((state) => state.chat);

  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    if (user) {
      dispatch(fetchConversations());
    }
  }, [dispatch, user]);

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    dispatch(setActiveRoom(null));
    onSelectConversation?.();
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
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
    const senderName = sender === user._id ? 'You' : getOtherParticipant(conversation)?.name;
    
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

  if (loading.conversations) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading conversations...
        </div>
      </div>
    );
  }

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
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-sm mb-2">No conversations yet</p>
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
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => {
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList; 