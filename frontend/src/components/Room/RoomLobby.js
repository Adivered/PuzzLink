import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { gsap } from 'gsap';
import { updateRoom, addPlayer, removePlayer, startGame, fetchRoom } from '../../store/roomSlice';
import PlayerList from './PlayerList';
import GameSettings from './GameSettings';
import ImageSelector from './ImageSelector';
import CountdownTimer from './CountdownTimer';
import { useParams, useNavigate } from 'react-router-dom';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

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

  useIsomorphicLayoutEffect(() => {
    if (roomId) {
      dispatch(fetchRoom(roomId));
    }
  }, [roomId, dispatch]);

  const isCreator = user && room && room.creator && user._id === room.creator._id;
  console.log("isCreator:", isCreator);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(lobbyRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      });

    }, lobbyRef);

    return () => ctx.revert();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

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
    console.log('Game started:', result);
    navigate(`/game/${result.gameId}`);
  };

  if (!room?._id) return null;

  return (
    <div ref={lobbyRef} className={`p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-4xl font-bold mb-6 text-center">
        Room Lobby: {room.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PlayerList
            players={room.players}
            isCreator={isCreator}
            onAddPlayer={handleAddPlayer}
            onRemovePlayer={handleRemovePlayer}
          />
        </div>

        <div>
          {isCreator ? (
            isEditing ? (
              <div className="space-y-4">
                <GameSettings
                  initialSettings={room}
                  onSave={handleUpdateRoom}
                  onCancel={() => setIsEditing(false)}
                />
                <ImageSelector
                  currentImage={room.image}
                  onSelectImage={(image) => handleUpdateRoom({ image })}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold">Game Settings</h3>
                <p>Time Limit: {room.timeLimit} minutes</p>
                <p>Game Mode: {room.gameMode}</p>
                <p>Turn-based: {room.turnBased ? 'Yes' : 'No'}</p>
                <button
                  onClick={handleEditToggle}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Edit Settings
                </button>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Game Settings</h3>
              <p>Time Limit: {room.timeLimit} minutes</p>
              <p>Game Mode: {room.gameMode}</p>
              <p>Turn-based: {room.turnBased ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>

      {room.image && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-2">Game Image</h3>
          <img src={room.image} alt="Game" className="w-full h-64 object-cover rounded-lg" />
        </div>
      )}

      {(isCreator && !isStarting) ? (
        <button
          onClick={() => setIsStarting(true)}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-xl transition duration-300 transform hover:scale-105"
        >
          Start Game
        </button>

      ) :
        <div className="mt-6">
          {/* GAME START EDIT */}
          <CountdownTimer duration={5} onComplete={handleStartGame} />
        </div>
      }
    </div >
  );
};

export default RoomLobby;

