import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createRoom } from "../../../app/store/roomSlice";
import { addToast } from "../../../app/store/toastSlice";
import { useNavigate } from "react-router-dom";
import GameTypeStation from "./stations/GameTypeStation";
import RoomConfigStation from "./stations/RoomConfigStation";
import ImageStation from "./stations/ImageStation";
import StationIndicator from "./stations/StationIndicator";


const CreateRoom = ({ onStationChange }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);

  const [currentStation, setCurrentStation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stationsRef = useRef(null);

  const [roomData, setRoomData] = useState({
    name: "",
    invites: [],
    timeLimit: 30,
    gameMode: "",
    turnBased: false,
    image: null,
    imagePrompt: "",
    imagePreview: null,
  });

  const isDarkTheme = theme === "dark";

  // Notify parent when station changes
  useEffect(() => {
    if (onStationChange) {
      onStationChange(currentStation);
    }
  }, [currentStation, onStationChange]);

  const handleNext = () => {
    if (currentStation < 2) {
      // Skip image station for whiteboard games
      if (currentStation === 1 && roomData.gameMode === 'Drawable') {
        return; // Stay on station 1, will create room directly
      }
      setCurrentStation(currentStation + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStation > 0) {
      // Skip image station when going back from whiteboard games
      if (currentStation === 2 && roomData.gameMode === 'Drawable') {
        setCurrentStation(0); // Go back to game type selection
      } else {
        setCurrentStation(currentStation - 1);
      }
    }
  };

  const updateRoomData = (data) => {
    setRoomData((prev) => ({ ...prev, ...data }));
  };

  const handleCreateRoom = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create room with invited users - invitations are now sent automatically during room creation
      const result = await dispatch(createRoom(roomData)).unwrap();

      // Show success toast
      const inviteCount = roomData.invites.length;
      let message = `Room "${result.name}" created successfully!`;
      if (inviteCount > 0) {
        message += ` Invitations sent to ${inviteCount} user${inviteCount > 1 ? 's' : ''}.`;
      }
      
      dispatch(addToast({
        message,
        type: 'success'
      }));

      navigate(`/rooms/${result._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      dispatch(addToast({
        message: 'Failed to create room. Please try again.',
        type: 'error'
      }));
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = () => {
    if (currentStation === 0) return !!roomData.gameMode;
    if (currentStation === 1) return !!roomData.name && roomData.timeLimit >= 5;
    return true;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Card Container */}
      <div
        className={`h-full flex flex-col p-6 lg:p-8 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-sm ${
          isDarkTheme 
            ? "bg-gray-800/95 border border-gray-700/50 text-white" 
            : "bg-white/95 border border-gray-200/50 text-gray-800"
        }`}
      >
        {/* Station Indicator */}
        <div className="flex-none mb-3 lg:mb-4">
          <StationIndicator currentStation={currentStation} isDarkTheme={isDarkTheme} roomData={roomData} />
        </div>

        {/* Main Content Area - Expands to fill available space */}
        <div ref={stationsRef} className="flex-1 relative min-h-0">
          <GameTypeStation
            roomData={roomData}
            updateRoomData={updateRoomData}
            isActive={currentStation === 0}
            isDarkTheme={isDarkTheme}
          />
          <RoomConfigStation
            roomData={roomData}
            updateRoomData={updateRoomData}
            isActive={currentStation === 1}
            isDarkTheme={isDarkTheme}
          />
          <ImageStation
            roomData={roomData}
            updateRoomData={updateRoomData}
            isActive={currentStation === 2}
            isDarkTheme={isDarkTheme}
          />
        </div>

        {/* Navigation Controls */}
        <div className={`flex-none ${currentStation > 0 ? "flex justify-between" : "flex justify-end"} mt-3 lg:mt-4 pt-3 border-t ${
          isDarkTheme ? 'border-gray-700/50' : 'border-gray-200/50'
        }`}>
          {currentStation > 0 && (
            <button
              onClick={handlePrevious}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm ${
                isDarkTheme 
                  ? "bg-red-700/80 hover:bg-red-600 text-white shadow-md" 
                  : "bg-red-100 hover:bg-red-200 text-red-800 shadow-sm"
              }`}
            >
              Previous
            </button>
          )}
          {currentStation < 2 && !(currentStation === 1 && roomData.gameMode === 'Drawable') ? (
            <button
              onClick={handleNext}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm ${
                !canProceedToNext() 
                  ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600" 
                  : "bg-purple-500 hover:bg-purple-600 text-white hover:shadow-purple-500/25"
              }`}
              disabled={!canProceedToNext()}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreateRoom}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm ${
                isSubmitting 
                  ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600" 
                  : "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/25"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Room"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;