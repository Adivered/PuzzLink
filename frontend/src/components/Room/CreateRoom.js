import { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createRoom } from "../../store/roomSlice";
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

  const handleNext = () => currentStation < 2 && setCurrentStation(currentStation + 1);
  const handlePrevious = () => currentStation > 0 && setCurrentStation(currentStation - 1);

  const updateRoomData = (data) => {
    setRoomData((prev) => ({ ...prev, ...data }));
  };

  const handleCreateRoom = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await dispatch(createRoom(roomData)).unwrap();
      navigate(`/rooms/${result._id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
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
      className={`max-w-4xl mx-auto p-4 sm:p-6 rounded-xl shadow-lg transition-colors duration-300 ${
        isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <StationIndicator currentStation={currentStation} isDarkTheme={isDarkTheme} />

      <div ref={stationsRef} className="relative min-h-[500px]">
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

      <div className={`flex ${currentStation > 0 ? "justify-between" : "justify-end"} mt-8`}>
        {currentStation > 0 && (
          <button
            onClick={handlePrevious}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDarkTheme ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Previous
          </button>
        )}
        {currentStation < 2 ? (
          <button
            onClick={handleNext}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !canProceedToNext() ? "opacity-50 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={!canProceedToNext()}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleCreateRoom}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
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