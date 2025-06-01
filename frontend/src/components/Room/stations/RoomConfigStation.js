import { useRef } from "react";
import UserSearch from "../../common/UserSearch";

const RoomConfigStation = ({ roomData, updateRoomData, isActive, isDarkTheme }) => {
  const stationRef = useRef(null);

  const handleInviteUser = (selectedUser) => {
    // Check if user is already invited
    if (roomData.invites.find(u => u._id === selectedUser._id)) {
      return;
    }

    // Add to room data invites list (will be used after room creation)
    updateRoomData({ 
      invites: [...roomData.invites, selectedUser] 
    });
  };

  const handleRemoveInvite = (userId) => {
    updateRoomData({ 
      invites: roomData.invites.filter(u => u._id !== userId) 
    });
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
          <UserSearch
            onSelectUser={handleInviteUser}
            placeholder="Search and invite players..."
            className="w-full"
          />
          <p className={`text-xs mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
            Search for users by name or email. Invitations will be sent after room creation.
          </p>
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
          <h3 className="font-bold mb-3">Players to Invite ({roomData.invites.length}):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {roomData.invites.map((invitedUser) => (
              <div
                key={invitedUser._id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  isDarkTheme ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {invitedUser.picture ? (
                    <img
                      src={invitedUser.picture}
                      alt={invitedUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                    }`}>
                      <span className="text-sm font-medium">
                        {invitedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{invitedUser.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                        {invitedUser.email}
                      </p>
                      {invitedUser.isOnline && (
                        <span className="text-xs text-green-500 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveInvite(invitedUser._id)} 
                  className="text-red-500 hover:text-red-700 text-sm"
                >
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