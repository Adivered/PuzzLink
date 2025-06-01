import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { gsap } from "gsap";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";
import { TrashIcon } from "@heroicons/react/24/outline";
import { addToast } from "../../store/toastSlice";
import UserSearch from "../common/UserSearch";
import axios from "axios";

const PlayerList = ({ players, isCreator, onRemovePlayer, isDarkTheme, roomId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [localToasts, setLocalToasts] = useState([]);
  const listRef = useRef(null);
  const isMounted = useRef(true);

  // Deduplicate players to prevent React key conflicts
  const uniquePlayers = React.useMemo(() => {
    if (!players || !Array.isArray(players)) {
      return [];
    }
    
    const seen = new Set();
    return players.filter(player => {
      if (!player || !player._id || seen.has(player._id)) {
        return false;
      }
      seen.add(player._id);
      return true;
    });
  }, [players]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const playerItems = document.querySelectorAll(".player-item");
      if (playerItems.length > 0) {
        gsap.from(".player-item", {
          opacity: 0,
          x: -20,
          duration: 0.5,
          stagger: 0.1,
          ease: "expo.out",
        });
      }
    }, listRef);
    return () => ctx.revert();
  }, [uniquePlayers]);

  const addLocalToast = (message, type) => {
    const id = Date.now();
    setLocalToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      if (isMounted.current) {
        setLocalToasts((prev) => prev.filter((toast) => toast.id !== id));
      }
    }, 3000);
  };

  const handleInviteUser = async (selectedUser) => {
    try {
      // Check if user is already in the room
      if (uniquePlayers.find(p => p._id === selectedUser._id)) {
        addLocalToast(`${selectedUser.name} is already in the room!`, "info");
        return;
      }

      // Check if we have required data
  
      if (!roomId || !user) {
        addLocalToast("Unable to send invitation. Missing room or user data.", "error");
        console.error('❌ Missing data for invitation:', { roomId, user });
        return;
      }

      // Send invitation via API (this will handle both online and offline users)
      const response = await axios.post(`/api/rooms/${roomId}/invite`, {
        userIds: [selectedUser._id]
      });

      // Show success toast
      dispatch(addToast({
        message: `Invitation sent to ${selectedUser.name}!`,
        type: 'success'
      }));

      addLocalToast(`Invitation sent to ${selectedUser.name}!`, "success");
      
      console.log('Invitation sent successfully:', response.data);
    } catch (error) {
      console.error('Failed to invite user:', error);
      
      let errorMessage = `Failed to invite ${selectedUser.name}`;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addLocalToast(errorMessage, "error");
      
      // Show global error toast for serious issues
      dispatch(addToast({
        message: 'Failed to send invitation. Please try again.',
        type: 'error'
      }));
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await onRemovePlayer(playerId);
      if (isMounted.current) {
        addLocalToast("Player removed successfully!", "success");
      }
    } catch (error) {
      console.error('Failed to remove player:', error);
      
      let errorMessage = "Failed to remove player";
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        errorMessage = "Only the room creator can remove players";
      } else if (error.response?.status === 404) {
        errorMessage = "Room or player not found";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Cannot remove this player";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (isMounted.current) {
        addLocalToast(errorMessage, "error");
        
        // Also show global toast for important errors
        dispatch(addToast({
          message: errorMessage,
          type: 'error'
        }));
      }
    }
  };

  return (
    <div
      ref={listRef}
      className={`p-4 sm:p-6 rounded-lg shadow-md transition-colors duration-300 ${
        isDarkTheme ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3
        className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
          isDarkTheme ? "text-white" : "text-gray-900"
        }`}
      >
        Players ({uniquePlayers.length})
      </h3>
      <ul className="space-y-3">
        {uniquePlayers.map((player) => {
          const username = player?.name || "Unknown Player";
          const avatarInitial = username.charAt(0).toUpperCase();

          return (
            <li
              key={player._id}
              id={`player-${player._id}`}
              className={`player-item flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                isDarkTheme
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-4">
                {player.picture ? (
                  <img
                    src={player.picture}
                    alt={username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold transition-colors duration-300">
                    {avatarInitial}
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className={`text-base font-medium transition-colors duration-300 ${
                      isDarkTheme ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {username}
                  </span>
                  {player.isOnline && (
                    <span className="text-xs text-green-500 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </span>
                  )}
                </div>
              </div>
              {isCreator && player._id !== user?.id && (
                <button
                  onClick={() => handleRemovePlayer(player._id)}
                  className={`p-1 rounded-full transition-colors duration-300 ${
                    isDarkTheme
                      ? "text-red-400 hover:text-red-500 hover:bg-gray-600"
                      : "text-red-500 hover:text-red-600 hover:bg-gray-200"
                  }`}
                  title="Remove player"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      
      {isCreator && (
        <div className="mt-6">
          <label className="block mb-2 font-medium">Invite More Players</label>
          <UserSearch
            onSelectUser={handleInviteUser}
            placeholder="Search and invite players..."
            className="w-full"
          />
          <p className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Search for users to invite them to your room. They will be added automatically when they accept.
          </p>
        </div>
      )}
      
      {/* Local Toasts Below Player List */}
      <div className="mt-4 space-y-2">
        {localToasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-md text-white flex items-center justify-between ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                  ? "bg-red-500"
                  : toast.type === "info"
                    ? "bg-blue-500"
                    : "bg-gray-500"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;