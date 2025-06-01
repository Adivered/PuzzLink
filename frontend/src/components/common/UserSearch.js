import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Search, User, UserCheck, Clock } from 'lucide-react';
import axios from 'axios';

const UserSearch = ({ onSelectUser, placeholder = "Search users...", className = "" }) => {
  const theme = useSelector((state) => state.theme.current);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  const isDarkTheme = theme === 'dark';

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setUsers([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/users/search?query=${encodeURIComponent(query.trim())}&limit=8`);
        setUsers(response.data.users || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user) => {
    onSelectUser(user);
    setQuery('');
    setUsers([]);
    setShowResults(false);
  };

  const getStatusIcon = (user) => {
    if (user.isOnline) {
      return <div className="w-3 h-3 bg-green-500 rounded-full" />;
    }
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  const getLastActiveText = (user) => {
    if (user.isOnline) {
      return 'Online';
    }
    
    if (user.lastActive) {
      const lastActive = new Date(user.lastActive);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastActive) / (1000 * 60));
      
      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`;
      } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
      }
    }
    
    return 'Offline';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search 
          size={16} 
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
            isDarkTheme ? 'text-gray-400' : 'text-gray-500'
          }`} 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-colors ${
            isDarkTheme 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
          } focus:outline-none focus:ring-1 focus:ring-blue-500`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`w-4 h-4 border-2 border-b-2 border-t-transparent rounded-full animate-spin ${
              isDarkTheme ? 'border-blue-400' : 'border-blue-500'
            }`} />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-64 overflow-y-auto ${
          isDarkTheme 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          {users.length === 0 && !loading && (
            <div className={`p-4 text-center text-sm ${
              isDarkTheme ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {query.trim().length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
            </div>
          )}
          
          {users.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserSelect(user)}
              className={`w-full p-3 text-left hover:bg-opacity-50 transition-colors border-b last:border-b-0 ${
                isDarkTheme 
                  ? 'hover:bg-gray-700 border-gray-700 text-white' 
                  : 'hover:bg-gray-50 border-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="relative">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDarkTheme ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <User size={20} className={isDarkTheme ? 'text-gray-300' : 'text-gray-600'} />
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  <div className="absolute -bottom-1 -right-1">
                    {getStatusIcon(user)}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium truncate">{user.name}</p>
                    {user.isOnline && (
                      <UserCheck size={14} className="text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className={`text-xs truncate ${
                      isDarkTheme ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </p>
                    <span className={`text-xs flex items-center space-x-1 ${
                      user.isOnline ? 'text-green-500' : (isDarkTheme ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {!user.isOnline && <Clock size={10} />}
                      <span>{getLastActiveText(user)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch; 