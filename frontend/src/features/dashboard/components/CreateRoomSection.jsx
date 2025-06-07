import React from 'react';
import CreateRoomWizard from './CreateRoomWizard';

/**
 * Create Room Section component following Single Responsibility Principle
 * Wraps the existing CreateRoom component for the new architecture
 */
export const CreateRoomSection = ({ onStationChange }) => {
  return (
    <div className="flex-1 px-4 pb-4 min-h-0">
      <div className="h-full flex items-center justify-center">
        <div className="w-full max-w-6xl h-full">
          <CreateRoomWizard onStationChange={onStationChange} />
        </div>
      </div>
    </div>
  );
}; 