import React, { useRef, useEffect } from 'react';

// Existing Station Components
import GameTypeStation from '../../rooms/components/stations/GameTypeStation';
import RoomConfigStation from '../../rooms/components/stations/RoomConfigStation';
import ImageStation from '../../rooms/components/stations/ImageStation';
import StationIndicator from '../../rooms/components/stations/StationIndicator';

// Shared Hooks
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Create Room Wizard component following Single Responsibility Principle
 * Handles only UI presentation for the room creation wizard
 * All business logic is handled by the parent page/hooks
 */
export const CreateRoomWizard = ({
  currentStation,
  roomData,
  isSubmitting,
  onNext,
  onPrevious,
  onUpdateRoomData,
  onCreateRoom,
  canProceedToNext,
  onStationChange
}) => {
  const { theme } = useThemeManager();
  const stationsRef = useRef(null);
  const isDarkTheme = theme === 'dark';

  // Notify parent when station changes (for dashboard header)
  useEffect(() => {
    if (onStationChange) {
      onStationChange(currentStation);
    }
  }, [currentStation, onStationChange]);

  const cardClasses = `h-full flex flex-col p-6 lg:p-8 rounded-2xl shadow-2xl transition-all duration-300 backdrop-blur-sm ${
    isDarkTheme 
      ? "bg-gray-800/95 border border-gray-700/50 text-white" 
      : "bg-white/95 border border-gray-200/50 text-gray-800"
  }`;

  const navigationBorderClasses = `pt-3 border-t ${
    isDarkTheme ? 'border-gray-700/50' : 'border-gray-200/50'
  }`;

  const previousButtonClasses = `px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-sm ${
    isDarkTheme 
      ? "bg-red-700/80 hover:bg-red-600 text-white shadow-md" 
      : "bg-red-100 hover:bg-red-200 text-red-800 shadow-sm"
  }`;

  const nextButtonClasses = `px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm ${
    !canProceedToNext() 
      ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600" 
      : "bg-purple-500 hover:bg-purple-600 text-white hover:shadow-purple-500/25"
  }`;

  const createButtonClasses = `px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm ${
    isSubmitting 
      ? "opacity-50 cursor-not-allowed bg-gray-400 text-gray-600" 
      : "bg-green-500 hover:bg-green-600 text-white hover:shadow-green-500/25"
  }`;

  const shouldShowNext = currentStation < 2 && !(currentStation === 1 && roomData.gameMode === 'Drawable');

  return (
    <div className="h-full flex flex-col">
      <div className={cardClasses}>
        {/* Station Indicator */}
        <div className="flex-none mb-3 lg:mb-4">
          <StationIndicator 
            currentStation={currentStation} 
            isDarkTheme={isDarkTheme} 
            roomData={roomData} 
          />
        </div>

        {/* Main Content Area */}
        <div ref={stationsRef} className="flex-1 relative min-h-0">
          <GameTypeStation
            roomData={roomData}
            updateRoomData={onUpdateRoomData}
            isActive={currentStation === 0}
            isDarkTheme={isDarkTheme}
          />
          <RoomConfigStation
            roomData={roomData}
            updateRoomData={onUpdateRoomData}
            isActive={currentStation === 1}
            isDarkTheme={isDarkTheme}
          />
          <ImageStation
            roomData={roomData}
            updateRoomData={onUpdateRoomData}
            isActive={currentStation === 2}
            isDarkTheme={isDarkTheme}
          />
        </div>

        {/* Navigation Controls */}
        <div className={`flex-none ${
          currentStation > 0 ? "flex justify-between" : "flex justify-end"
        } mt-3 lg:mt-4 ${navigationBorderClasses}`}>
          {currentStation > 0 && (
            <button
              onClick={onPrevious}
              className={previousButtonClasses}
              aria-label="Go to previous step"
            >
              Previous
            </button>
          )}
          
          {shouldShowNext ? (
            <button
              onClick={onNext}
              className={nextButtonClasses}
              disabled={!canProceedToNext()}
              aria-label="Go to next step"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onCreateRoom}
              className={createButtonClasses}
              disabled={isSubmitting}
              aria-label="Create room"
            >
              {isSubmitting ? "Creating..." : "Create Room"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 