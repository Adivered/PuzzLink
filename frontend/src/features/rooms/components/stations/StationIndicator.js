import { PuzzlePieceIcon, CogIcon, PhotoIcon } from "@heroicons/react/24/outline";
import React from "react";

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
    <div className="mb-4">
      <div className="flex justify-between mb-1 max-w-sm mx-auto">
        {stations.map((station, index) => (
          <div
            key={index}
            className={`flex flex-col items-center transition-opacity ${
              index === currentStation ? "opacity-100" : index < currentStation ? "opacity-80" : "opacity-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                index <= currentStation
                  ? isDarkTheme
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white"
                  : isDarkTheme
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {React.cloneElement(station.icon, { className: "w-5 h-5" })}
              </div>
            </div>
            <span className="text-xs font-medium">{station.name}</span>
          </div>
        ))}
      </div>
      <div className={`w-full max-w-sm mx-auto h-1.5 rounded-full ${isDarkTheme ? "bg-gray-700" : "bg-gray-200"}`}>
        <div
          className={`h-full rounded-full ${isDarkTheme ? "bg-blue-600" : "bg-blue-500"}`}
          style={{ width: `${(currentStation / (stations.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default StationIndicator;