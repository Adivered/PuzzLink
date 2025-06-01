import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createRoom } from "../../store/roomSlice";
import { addToast } from "../../store/toastSlice";
import { useNavigate } from "react-router-dom";
import GameTypeStation from "./stations/GameTypeStation";
import RoomConfigStation from "./stations/RoomConfigStation";
import ImageStation from "./stations/ImageStation";
import StationIndicator from "./stations/StationIndicator";


const CreateRoom = () => {
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
    <div
      className={`w-full mx-auto p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl transition-all duration-300 ${
        isDarkTheme 
          ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-white" 
          : "bg-white/90 backdrop-blur-sm border border-gray-200/50 text-gray-800 shadow-2xl"
      }`}
    >
      <StationIndicator currentStation={currentStation} isDarkTheme={isDarkTheme} roomData={roomData} />

      <div ref={stationsRef} className="relative min-h-[400px] sm:min-h-[450px] lg:min-h-[500px]">
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

      <div className={`flex ${currentStation > 0 ? "justify-between" : "justify-end"} mt-8 pt-6 border-t ${
        isDarkTheme ? 'border-gray-700/50' : 'border-gray-200/50'
      }`}>
        {currentStation > 0 && (
          <button
            onClick={handlePrevious}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              isDarkTheme 
                ? "bg-gray-700/80 hover:bg-gray-600 text-white shadow-lg" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-md"
            }`}
          >
            Previous
          </button>
        )}
        {currentStation < 2 && !(currentStation === 1 && roomData.gameMode === 'Drawable') ? (
          <button
            onClick={handleNext}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg ${
              !canProceedToNext() 
                ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600" 
                : "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-500/25"
            }`}
            disabled={!canProceedToNext()}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreateRoom}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg ${
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
  );
};

export default CreateRoom;