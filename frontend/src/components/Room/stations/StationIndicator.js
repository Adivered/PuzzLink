import { PuzzlePieceIcon, CogIcon, PhotoIcon } from "@heroicons/react/24/outline";

const StationIndicator = ({ currentStation, isDarkTheme, roomData }) => {
  const allStations = [
    { name: "Game Type", icon: <PuzzlePieceIcon className="w-6 h-6" /> },
    { name: "Room Setup", icon: <CogIcon className="w-6 h-6" /> },
    { name: "Image", icon: <PhotoIcon className="w-6 h-6" /> },
  ];
  
  // Skip image station for whiteboard games
  const stations = roomData?.gameMode === 'Drawable' 
    ? allStations.slice(0, 2) 
    : allStations;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {stations.map((station, index) => (
          <div
            key={index}
            className={`flex flex-col items-center transition-opacity ${
              index === currentStation ? "opacity-100" : index < currentStation ? "opacity-80" : "opacity-50"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                index <= currentStation
                  ? isDarkTheme
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkTheme
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {station.icon}
            </div>
            <span className="text-sm font-medium">{station.name}</span>
          </div>
        ))}
      </div>
      <div className={`w-full h-2 rounded-full ${isDarkTheme ? "bg-gray-700" : "bg-gray-200"}`}>
        <div
          className={`h-full rounded-full ${isDarkTheme ? "bg-blue-600" : "bg-blue-500"}`}
          style={{ width: `${(currentStation / (stations.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default StationIndicator;