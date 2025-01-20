import React, { useState } from 'react';
import { gsap } from 'gsap';

const PlayerList = ({ players, isCreator, onAddPlayer, onRemovePlayer }) => {
  const [newPlayerEmail, setNewPlayerEmail] = useState('');

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newPlayerEmail) {
      onAddPlayer(newPlayerEmail);
      setNewPlayerEmail('');
    }
  };

  const handleRemovePlayer = (playerId) => {
    gsap.to(`#player-${playerId}`, {
      opacity: 0,
      x: -50,
      duration: 0.5,
      onComplete: () => onRemovePlayer(playerId)
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold">Players</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li 
            key={player._id} 
            id={`player-${player._id}`}
            className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
          >
            <span>{player.username}</span>
            {isCreator && (
              <button
                onClick={() => handleRemovePlayer(player._id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {isCreator && (
        <form onSubmit={handleAddPlayer} className="mt-4 flex">
          <input
            type="email"
            value={newPlayerEmail}
            onChange={(e) => setNewPlayerEmail(e.target.value)}
            placeholder="Enter player's email"
            className="flex-grow p-2 border rounded-l text-gray-800"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-r"
          >
            Add Player
          </button>
        </form>
      )}
    </div>
  );
};

export default PlayerList;

