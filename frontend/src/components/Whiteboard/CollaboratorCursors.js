import React from 'react';

const CollaboratorCursors = ({ collaborators, currentUserId }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {collaborators
        .filter(collaborator => 
          collaborator.user._id !== currentUserId && 
          collaborator.cursor?.visible &&
          collaborator.cursor?.x !== undefined &&
          collaborator.cursor?.y !== undefined
        )
        .map(collaborator => (
          <div
            key={collaborator.user._id}
            className="absolute transition-all duration-75 ease-out"
            style={{
              left: `${collaborator.cursor.x}px`,
              top: `${collaborator.cursor.y}px`,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor pointer */}
            <div className="relative">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="drop-shadow-lg"
              >
                <path
                  d="M3 3L21 12L12 14L10 21L3 3Z"
                  fill="#3B82F6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <path
                  d="M3 3L21 12L12 14L10 21L3 3Z"
                  fill="#1E40AF"
                  stroke="none"
                />
              </svg>
              
              {/* User name label */}
              <div className="absolute top-6 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg border border-blue-400 opacity-90">
                {collaborator.user.name || 'Anonymous'}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
};

export default CollaboratorCursors; 