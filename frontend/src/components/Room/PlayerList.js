import React, { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";
import { UserPlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const PlayerList = ({ players, isCreator, onAddPlayer, onRemovePlayer, isDarkTheme }) => {
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const [localToasts, setLocalToasts] = useState([]); // Local state for toasts
  const listRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".player-item", {
        opacity: 0,
        x: -20,
        duration: 0.5,
        stagger: 0.1,
        ease: "expo.out",
      });
    }, listRef);
    return () => ctx.revert();
  }, [players]);

  const addLocalToast = (message, type) => {
    const id = Date.now();
    setLocalToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      if (isMounted.current) {
        setLocalToasts((prev) => prev.filter((toast) => toast.id !== id));
      }
    }, 3000);
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (newPlayerEmail) {
      try {
        await onAddPlayer(newPlayerEmail);
        if (isMounted.current) {
          addLocalToast(`Player ${newPlayerEmail} added successfully!`, "success");
          setNewPlayerEmail("");
        }
      } catch (error) {
        if (isMounted.current) {
          addLocalToast(
            `Failed to add player: ${error.message || "Unknown error"}`,
            "error"
          );
        }
      }
    } else {
      if (isMounted.current) {
        addLocalToast("Please enter a valid email address.", "error");
      }
    }
  };

  const handleRemovePlayer = async (playerId) => {
    try {
      await onRemovePlayer(playerId);
      if (isMounted.current) {
        addLocalToast("Player removed successfully!", "success");
      }
    } catch (error) {
      if (isMounted.current) {
        addLocalToast(
          `Failed to remove player: ${error.message || "Unknown error"}`,
          "error"
        );
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
        Players ({players.length})
      </h3>
      <ul className="space-y-3">
        {players.map((player) => {
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold transition-colors duration-300">
                  {avatarInitial}
                </div>
                <span
                  className={`text-base font-medium transition-colors duration-300 ${
                    isDarkTheme ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {username}
                </span>
              </div>
              {isCreator && (
                <button
                  onClick={() => handleRemovePlayer(player._id)}
                  className={`p-1 rounded-full transition-colors duration-300 ${
                    isDarkTheme
                      ? "text-red-400 hover:text-red-500 hover:bg-gray-600"
                      : "text-red-500 hover:text-red-600 hover:bg-gray-200"
                  }`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {isCreator && (
        <form
          onSubmit={handleAddPlayer}
          className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center"
        >
          <input
            type="email"
            value={newPlayerEmail}
            onChange={(e) => setNewPlayerEmail(e.target.value)}
            placeholder="Enter player's email"
            className={`flex-grow p-3 rounded-lg border transition-colors duration-300 ${
              isDarkTheme
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-400"
            } focus:outline-none focus:ring-2 shadow-sm sm:max-w-md`}
          />
          <button
            type="submit"
            className={`px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md sm:w-auto w-full max-w-xs mx-auto`}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>Add Player</span>
          </button>
        </form>
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
                  : "bg-blue-500"
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