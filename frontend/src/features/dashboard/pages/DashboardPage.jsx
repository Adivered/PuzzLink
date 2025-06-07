import React from 'react';

// Feature Components
import { DashboardHeader } from '../components/DashboardHeader';
import { CreateRoomWizard } from '../components/CreateRoomWizard';

// Feature Hooks
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { useCreateRoomLogic } from '../hooks/useCreateRoomLogic';

// Shared Hooks
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Dashboard Page component following Single Responsibility Principle
 * Handles dashboard layout and orchestrates room creation functionality
 * Contains the main business logic for room creation process
 */
export const DashboardPage = () => {
  const { theme } = useThemeManager();
  const { 
    dashboardRef, 
    titleRef, 
    subtitleRef, 
    currentStationData 
  } = useDashboardLogic();

  const {
    // Room creation state
    currentStation,
    roomData,
    isSubmitting,
    
    // Station management
    handleNext,
    handlePrevious,
    updateRoomData,
    handleCreateRoom,
    canProceedToNext,
    
    // Station change handler for dashboard header
    handleStationChange,
  } = useCreateRoomLogic();

  const containerClasses = `h-[calc(100vh-140px)] overflow-hidden ${
    theme === 'dark' 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
  }`;

  return (
    <div className={containerClasses}>
      <div ref={dashboardRef} className="h-full flex flex-col">
        <DashboardHeader 
          titleRef={titleRef}
          subtitleRef={subtitleRef}
          currentStationData={currentStationData}
        />
        
        <div className="flex-1 px-4 pb-4 min-h-0">
          <div className="h-full flex items-center justify-center">
            <div className="w-full max-w-6xl h-full">
              <CreateRoomWizard
                currentStation={currentStation}
                roomData={roomData}
                isSubmitting={isSubmitting}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onUpdateRoomData={updateRoomData}
                onCreateRoom={handleCreateRoom}
                canProceedToNext={canProceedToNext}
                onStationChange={handleStationChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 