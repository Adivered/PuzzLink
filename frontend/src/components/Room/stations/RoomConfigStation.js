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
      className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${
        isActive ? "opacity-100 z-10" : "opacity-0 z-0"
      }`}
      style={{ display: isActive ? "flex" : "none" }}
    >
      <div className="flex-1 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-medium text-sm">Room Name</label>
            <input
              type="text"
              value={roomData.name}
              onChange={(e) => updateRoomData({ name: e.target.value })}
              className={`w-full p-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDarkTheme ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-gray-800 focus:border-blue-500"
              }`}
              placeholder="Enter room name"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-sm">Time Limit</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="180"
                value={roomData.timeLimit}
                onChange={(e) => updateRoomData({ timeLimit: Number.parseInt(e.target.value) })}
                className={`flex-1 h-2 rounded-lg appearance-none cursor-pointer ${
                  isDarkTheme 
                    ? 'bg-gray-600 slider-thumb-dark' 
                    : 'bg-gray-300 slider-thumb-light'
                }`}
                style={{
                  background: `linear-gradient(to right, ${isDarkTheme ? '#3b82f6' : '#2563eb'} 0%, ${isDarkTheme ? '#3b82f6' : '#2563eb'} ${((roomData.timeLimit - 5) / 175) * 100}%, ${isDarkTheme ? '#4b5563' : '#d1d5db'} ${((roomData.timeLimit - 5) / 175) * 100}%, ${isDarkTheme ? '#4b5563' : '#d1d5db'} 100%)`
                }}
              />
              <span className={`text-sm font-medium min-w-[3rem] ${isDarkTheme ? "text-white" : "text-gray-800"}`}>
                {roomData.timeLimit}m
              </span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium text-sm">Invite Players</label>
          <UserSearch
            onSelectUser={handleInviteUser}
            placeholder="Search and invite players..."
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={roomData.turnBased}
              onChange={(e) => updateRoomData({ turnBased: e.target.checked })}
              disabled={roomData.gameMode === 'Drawable'}
              className={`mr-2 w-4 h-4 ${roomData.gameMode === 'Drawable' ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <span className={`font-medium text-sm ${roomData.gameMode === 'Drawable' ? 'opacity-50' : ''}`}>
              Turn-based game {roomData.gameMode === 'Drawable' ? '(Not available for whiteboard)' : ''}
            </span>
          </label>
        </div>
        
        {roomData.invites.length > 0 && (
          <div className="flex-1">
            <h3 className="font-bold mb-2 text-sm">Invited Players ({roomData.invites.length}):</h3>
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roomData.invites.map((invitedUser) => (
                  <div
                    key={invitedUser._id}
                    className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                      isDarkTheme ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {invitedUser.picture ? (
                        <img
                          src={invitedUser.picture}
                          alt={invitedUser.name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                        }`}>
                          <span className="text-xs font-medium">
                            {invitedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{invitedUser.name}</p>
                        {invitedUser.isOnline && (
                          <span className="text-xs text-green-500 flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveInvite(invitedUser._id)} 
                      className="text-red-500 hover:text-red-700 text-xs ml-1 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomConfigStation;