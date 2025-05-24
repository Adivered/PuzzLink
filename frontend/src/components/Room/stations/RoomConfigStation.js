import { useState, useRef } from "react";

const RoomConfigStation = ({ roomData, updateRoomData, isActive, isDarkTheme }) => {
  const stationRef = useRef(null);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvitePlayer = (e) => {
    e.preventDefault();
    if (inviteEmail && !roomData.invites.includes(inviteEmail)) {
      updateRoomData({ invites: [...roomData.invites, inviteEmail] });
      setInviteEmail("");
    }
  };

  const handleRemoveInvite = (index) => {
    updateRoomData({ invites: roomData.invites.filter((_, i) => i !== index) });
  };

  return (
    <div
      ref={stationRef}
      className={`absolute w-full transition-opacity duration-300 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ display: isActive ? "block" : "none" }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Room Configuration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-medium">Room Name</label>
          <input
            type="text"
            value={roomData.name}
            onChange={(e) => updateRoomData({ name: e.target.value })}
            className={`w-full p-3 border rounded-lg ${
              isDarkTheme ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
            }`}
            placeholder="Enter room name"
            required
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">Time Limit (minutes)</label>
          <div className="flex items-center">
            <input
              type="range"
              min="5"
              max="180"
              value={roomData.timeLimit}
              onChange={(e) => updateRoomData({ timeLimit: Number.parseInt(e.target.value) })}
              className="w-full mr-4"
            />
            <span className={`text-lg font-medium ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
              {roomData.timeLimit}
            </span>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block mb-2 font-medium">Invite Players</label>
          <div className="flex">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className={`flex-grow p-3 border rounded-l-lg ${
                isDarkTheme ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
              }`}
              placeholder="Enter player's email"
            />
            <button
              onClick={handleInvitePlayer}
              className={`px-4 py-3 rounded-r-lg font-medium ${
                isDarkTheme ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Invite
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={roomData.turnBased}
              onChange={(e) => updateRoomData({ turnBased: e.target.checked })}
              disabled={roomData.gameMode === 'Drawable'}
              className={`mr-2 w-5 h-5 ${roomData.gameMode === 'Drawable' ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <span className={`font-medium ${roomData.gameMode === 'Drawable' ? 'opacity-50' : ''}`}>
              Turn-based game {roomData.gameMode === 'Drawable' ? '(Not available for whiteboard)' : ''}
            </span>
          </label>
        </div>
      </div>
      {roomData.invites.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-3">Invited Players:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roomData.invites.map((invite, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  isDarkTheme ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <span>{invite}</span>
                <button onClick={() => handleRemoveInvite(index)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomConfigStation;