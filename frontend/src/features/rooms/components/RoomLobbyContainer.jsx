import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { emitSocketEvent } from "../../../app/store/socketSlice";
import { switchToRoom, initializeRoomData } from "../../../app/store/roomSlice"; 
import { setActiveChatRoom } from "../../../app/store/chatSlice";
import { addToast } from "../../../app/store/toastSlice";
import PlayerList from "./PlayerList";
import axios from "axios";
import CenteredLoader from "../../../shared/components/ui/LoadingSpinner";
import CountdownTimer from "./CountdownTimer";

const RoomLobby = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  
  // Get state from centralized room management
  const room = useSelector((state) => state.room.data);
  const roomIsInitialized = useSelector((state) => state.room.isInitialized);
  const chatIsInitialized = useSelector((state) => state.chat.isInitialized);
  const currentRoomId = useSelector((state) => state.chat.activeRoom);
  const isConnected = useSelector((state) => state.socket.isConnected);
  const theme = useSelector((state) => state.theme.current);
  const user = useSelector((state) => state.auth.user);
  
  // Local state for UI only
  const [roomSwitchAttempted, setRoomSwitchAttempted] = useState(false);
  const [lastSwitchAttempt, setLastSwitchAttempt] = useState(0);
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [editingSettings, setEditingSettings] = useState({});
  
  const roomDataTimeoutRef = useRef(null);
  const isDarkTheme = theme === 'dark';

  // Simplified loading logic: show loading until we have socket + chat + either room data or confirmed no room
  const isLoading = !isConnected || !chatIsInitialized || (!!roomId && !roomIsInitialized);

  // Handle room data request timeout
  useEffect(() => {
    if (roomId && isConnected && chatIsInitialized && !roomIsInitialized && roomSwitchAttempted) {
      // Start timeout for room data request
      roomDataTimeoutRef.current = setTimeout(() => {
        // If we still don't have room data after timeout, initialize as null (room not found)
        dispatch(initializeRoomData(null));
      }, 5000); // 5 second timeout
    }

    return () => {
      if (roomDataTimeoutRef.current) {
        clearTimeout(roomDataTimeoutRef.current);
      }
    };
  }, [roomId, isConnected, chatIsInitialized, roomIsInitialized, roomSwitchAttempted, dispatch]);

  // Clear timeout when room data arrives
  useEffect(() => {
    if (roomIsInitialized && roomDataTimeoutRef.current) {
      clearTimeout(roomDataTimeoutRef.current);
      roomDataTimeoutRef.current = null;
    }
  }, [roomIsInitialized]);

  // Room switching logic - only run after socket and chat initialization
  useEffect(() => {
    // Don't attempt room switching until we have all required data and socket is initialized
    if (!user?.id || !roomId || !isConnected || !chatIsInitialized) {
      return;
    }
    
    const now = Date.now();
    const cooldownPeriod = 2000; // 2 second cooldown between attempts
    const timeSinceLastAttempt = now - lastSwitchAttempt;
    
    // Prevent rapid successive calls
    if (roomSwitchAttempted && timeSinceLastAttempt < cooldownPeriod) {
      return;
    }
    
    // Check if we're already in the correct room with valid data
    const isInCorrectRoom = currentRoomId === roomId && room && room._id === roomId;
    
    if (isInCorrectRoom) {
      setRoomSwitchAttempted(true);
      return;
    }
    
    // If we don't have room data yet, request it
    if (!roomIsInitialized) {
      // Request room data first
      emitSocketEvent('request_room_data', { roomId });
      setRoomSwitchAttempted(true);
      setLastSwitchAttempt(now);
      return;
    }
    
    // If room is initialized but we don't have data, it might be an invalid room
    if (!room && roomIsInitialized) {
      // Already requested room data but got null - might be invalid room
      return; // Let the "room not found" logic handle this
    }
    
    // Switch to the target room using centralized room management
    if (currentRoomId !== roomId && room) {
      setRoomSwitchAttempted(true);
      setLastSwitchAttempt(now);
      
      dispatch(switchToRoom({ 
        roomId: roomId,
        leaveRoomId: currentRoomId 
      })).catch(error => {
        console.error('Failed to switch to room:', error);
        setRoomSwitchAttempted(false);
        
        dispatch(addToast({
          message: 'Unable to access this room. You may not be a member.',
          type: 'error'
        }));
        navigate('/');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roomId, currentRoomId, isConnected, chatIsInitialized, roomIsInitialized, room, roomSwitchAttempted]);

  // Auto-switch chat to current room when in room lobby
  useEffect(() => {
    if (room && room._id && roomId && room._id === roomId) {
      dispatch(setActiveChatRoom(roomId));
    }
  }, [room, roomId, dispatch]);

  // Reset room switch flag when roomId changes
  useEffect(() => {
    setRoomSwitchAttempted(false);
    setLastSwitchAttempt(0);
  }, [roomId]);

  const handleRemovePlayer = async (playerId) => {
    try {
      await axios.delete(`/api/rooms/${roomId}/removePlayer/${playerId}`, {
        withCredentials: true
      });
      
      dispatch(addToast({
        message: 'Player removed successfully',
        type: 'success'
      }));
    } catch (error) {
      console.error('Failed to remove player:', error);
      
      // Show specific error message to user
      const errorMessage = error.response?.data?.message || 'Failed to remove player';
      dispatch(addToast({
        message: errorMessage,
        type: 'error'
      }));
    }
  };

  const handleEditSettings = () => {
    setEditingSettings({
      name: room.name,
      timeLimit: room.timeLimit,
      gameMode: room.gameMode,
      turnBased: room.turnBased
    });
    setShowEditSettings(true);
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put(`/api/rooms/${roomId}`, editingSettings);
      setShowEditSettings(false);
      dispatch(addToast({
        message: 'Room settings updated successfully!',
        type: 'success'
      }));
    } catch (error) {
      console.error('Failed to update room settings:', error);
      dispatch(addToast({
        message: 'Failed to update room settings',
        type: 'error'
      }));
    }
  };

  const handleStartGame = async () => {
    try {
      console.log('🎮 Starting game for room:', roomId);
      
      // Make API call to start the game - backend will handle socket events
      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start game');
      }

      const data = await response.json();
      console.log('✅ Game start initiated:', data);
      
      // Show initial toast - countdown and navigation will be handled by socket events
      dispatch(addToast({
        message: 'Game starting...',
        type: 'success'
      }));

    } catch (error) {
      console.error("Failed to start game:", error);
      
      // Show error toast to user
      dispatch(addToast({
        message: `Failed to start game: ${error.message}`,
        type: 'error'
      }));
    }
  };

  const handleLeaveRoom = () => {
    // Emit socket event to leave room
    emitSocketEvent('leave_room', { roomId });
    navigate("/");
  };

  const handleCountdownComplete = () => {
    console.log('🎮 Countdown completed, waiting for game_started event...');
    // The navigation will be handled by the game_started socket event
    // This is just a placeholder for any additional logic needed when countdown completes
  };

  // Show loading while waiting for socket initialization or room data
  if (isLoading) {
    return (
      <CenteredLoader 
        statusText={!isConnected ? 'Connecting...' : 'Loading room data...'}
      />
    );
  }

  // Show room not found only after socket has initialized and we confirmed no room data
  if (!room) {
    return (
      <div className="text-center py-8">
        <p className={`mb-4 ${isDarkTheme ? 'text-gray-400' : 'text-gray-700'}`}>
          Room not found or you don't have access to this room
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    );
  }

  // Handle creator comparison - creator might be string ID or object with _id
  const creatorId = typeof room.creator === 'string' ? room.creator : room.creator?._id;
  const isCreator = creatorId === user?.id;
  const canStartGame = isCreator && room.players && room.players.length >= 2;
  
  // Check if game is starting or active
  const gameState = room.gameState;
  const isGameStarting = gameState?.status === 'starting';
  const isGameActive = gameState?.status === 'active';

  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      {/* Game Starting Countdown Overlay */}
      {isGameStarting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <CountdownTimer 
            duration={gameState.countdown || 3} 
            onComplete={handleCountdownComplete}
          />
        </div>
      )}
      
      {/* Room Header */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                {room.name}
              </h1>
              {isCreator && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Creator
                </span>
              )}
            </div>
            <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
              Room ID: {roomId}
            </p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDarkTheme 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            Leave Room
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PlayerList
            players={room.players || []}
            isCreator={isCreator}
            onRemovePlayer={handleRemovePlayer}
            isDarkTheme={isDarkTheme}
            roomId={roomId}
          />
        </div>
        
        <div>
          {/* Game Settings Display */}
          <div className={`p-6 rounded-xl shadow-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                Game Settings
              </h3>
              {isCreator && room.status === 'waiting' && (
                <button
                  onClick={handleEditSettings}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkTheme 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Edit
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className={`font-semibold ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Time Limit:
                </span>
                <span className={`ml-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  {room.timeLimit || 30} minutes
                </span>
              </div>
              <div>
                <span className={`font-semibold ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Game Mode:
                </span>
                <span className={`ml-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  {room.gameMode || 'Puzzle'}
                </span>
              </div>
              <div>
                <span className={`font-semibold ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Turn-based:
                </span>
                <span className={`ml-2 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                  {room.turnBased ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          {isCreator && (
            <div className="mt-6">
              <button
                onClick={handleStartGame}
                disabled={!canStartGame || isGameStarting || isGameActive}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  canStartGame && !isGameStarting && !isGameActive
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : isDarkTheme 
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                }`}
              >
                {isGameActive 
                  ? "Game In Progress" 
                  : isGameStarting 
                    ? "Starting Game..." 
                    : canStartGame 
                      ? "Start Game" 
                      : "Need at least 2 players"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Settings Modal */}
      {showEditSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`bg-${isDarkTheme ? 'gray-800' : 'white'} p-6 rounded-xl shadow-xl max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Edit Room Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Room Name
                </label>
                <input
                  type="text"
                  value={editingSettings.name || ''}
                  onChange={(e) => setEditingSettings({...editingSettings, name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={editingSettings.timeLimit || 30}
                  onChange={(e) => setEditingSettings({...editingSettings, timeLimit: parseInt(e.target.value)})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Game Mode
                </label>
                <select
                  value={editingSettings.gameMode || 'puzzle'}
                  onChange={(e) => setEditingSettings({...editingSettings, gameMode: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    isDarkTheme 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="puzzle">Puzzle</option>
                  <option value="drawablePuzzle">Drawable Puzzle</option>
                  <option value="drawable">Drawable</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="turnBased"
                  checked={editingSettings.turnBased || false}
                  onChange={(e) => setEditingSettings({...editingSettings, turnBased: e.target.checked})}
                  disabled={editingSettings.gameMode === 'drawable'}
                  className="mr-2"
                />
                <label htmlFor="turnBased" className={`text-sm font-medium ${
                  editingSettings.gameMode === 'drawable' 
                    ? 'text-gray-400' 
                    : isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Turn-based game {editingSettings.gameMode === 'drawable' ? '(not available for whiteboard)' : ''}
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditSettings(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDarkTheme 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomLobby;