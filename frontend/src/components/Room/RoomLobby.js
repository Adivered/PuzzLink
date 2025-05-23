import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { gsap } from "gsap";
import { updateRoom, addPlayer, removePlayer, startGame, fetchRoom } from "../../store/roomSlice";
import PlayerList from "./PlayerList";
import GameSettings from "./GameSettings";
import ImageSelector from "./ImageSelector";
import CountdownTimer from "./CountdownTimer";
import { useParams, useNavigate } from "react-router-dom";
import useIsomorphicLayoutEffect from "../../hooks/useIsomorphicLayoutEffect";
import { XMarkIcon } from "@heroicons/react/24/outline";

const RoomLobby = () => {
  const { roomId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const theme = useSelector((state) => state.theme.current);
  const room = useSelector((state) => state.room.data);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const lobbyRef = useRef(null);
  const isDarkTheme = theme === "dark";

  useIsomorphicLayoutEffect(() => {
    if (roomId) {
      dispatch(fetchRoom(roomId));
    }
  }, [roomId, dispatch]);

  const isCreator = user && room && room.creator && user._id === room.creator._id;

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lobbyRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "expo.out",
      });
      gsap.from(".lobby-section", {
        opacity: 0,
        y: 30,
        duration: 0.6,
        stagger: 0.2,
        ease: "expo.out",
        delay: 0.2,
      });
    }, lobbyRef);
    return () => ctx.revert();
  }, []);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleUpdateRoom = (updatedData) => {
    dispatch(updateRoom({ roomId: room._id, ...updatedData }));
    setIsEditing(false);
  };

  const handleAddPlayer = (email) => {
    dispatch(addPlayer({ roomId: room._id, email }));
  };

  const handleRemovePlayer = (playerId) => {
    dispatch(removePlayer({ roomId: room._id, playerId }));
  };

  const handleStartGame = async () => {
    const result = await dispatch(startGame(room._id)).unwrap();
    navigate(`/game/${result.gameId}`);
  };

  if (!room?._id) return null;

  return (
    <div
      ref={lobbyRef}
      className={`max-w-5xl mx-auto p-4 sm:p-6 min-h-screen ${
        isDarkTheme ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="lobby-section text-center mb-8">
        <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          {room.name} Lobby
        </h2>
        <p className="mt-2 text-lg text-gray-400">
          Gather your friends and get ready to play!
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ gridTemplateRows: 'auto 1fr' }}>
        {/* Player List - Column 1, Full Height */}
        <div className="lobby-section md:col-span-1 md:row-span-2 h-full">
          <div
            className={`p-6 rounded-xl shadow-lg h-full flex flex-col ${
              isDarkTheme ? "bg-gray-800" : "bg-white"
            }`}
          >
            <PlayerList
              players={room.players}
              isCreator={isCreator}
              onAddPlayer={handleAddPlayer}
              onRemovePlayer={handleRemovePlayer}
              isDarkTheme={isDarkTheme}
              className="flex-grow overflow-y-auto"
            />
          </div>
        </div>

        {/* Game Settings - Column 2, Row 1 */}
        <div className="lobby-section md:col-span-1 md:row-span-1">
          <div
            className={`p-6 rounded-xl shadow-lg ${
              isDarkTheme ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3 className="text-2xl font-semibold mb-4">Game Settings</h3>
            <div className="space-y-2">
              <p>
                <span className={`font-bold ${isDarkTheme ? "text-white" : "text-black"}`}>
                  Time Limit:
                </span>{" "}
                <span className="font-medium text-gray-400">
                  {room.timeLimit} minutes
                </span>
              </p>
              <p>
                <span className={`font-bold ${isDarkTheme ? "text-white" : "text-black"}`}>
                  Game Mode:
                </span>{" "}
                <span className="font-medium text-gray-400">
                  {room.gameMode}
                </span>
              </p>
              <p>
                <span className={`font-bold ${isDarkTheme ? "text-white" : "text-black"}`}>
                  Turn-based:
                </span>{" "}
                <span className="font-medium text-gray-400">
                  {room.turnBased ? "Yes" : "No"}
                </span>
              </p>
            </div>
            {isCreator && !isEditing && (
              <button
                onClick={handleEditToggle}
                className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-300"
              >
                Edit Settings
              </button>
            )}
          </div>
        </div>

        {/* Game Image - Column 2, Row 2 */}
        {room.image && (
          <div className="lobby-section md:col-span-1 md:row-span-1">
            <div
              className={`p-6 rounded-xl shadow-lg ${
                isDarkTheme ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3 className="text-2xl font-semibold mb-4">Game Image</h3>
              <img
                src={room.image}
                alt="Game"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Start Game Button or Countdown */}
      <div className="lobby-section mt-8 text-center">
        {isCreator && !isStarting ? (
          <button
            onClick={() => setIsStarting(true)}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold text-xl rounded-full transition duration-300 transform hover:scale-105"
          >
            Start Game
          </button>
        ) : (
          isStarting && (
            <CountdownTimer duration={5} onComplete={handleStartGame} />
          )
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-xl shadow-lg w-full max-w-lg ${
              isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Edit Room Settings</h3>
              <button onClick={handleEditToggle}>
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <GameSettings
              initialSettings={room}
              onSave={handleUpdateRoom}
              onCancel={handleEditToggle}
              isDarkTheme={isDarkTheme}
            />
            <ImageSelector
              currentImage={room.image}
              onSelectImage={(image) => handleUpdateRoom({ image })}
              isDarkTheme={isDarkTheme}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomLobby;