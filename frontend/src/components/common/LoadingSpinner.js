import React from 'react';
import { useSelector } from 'react-redux';

const CenteredLoader = ({ 
  statusText = 'Loading...', 
  showProgress = false, 
  progressSteps = [], 
  progressLabels = []
}) => {
  const theme = useSelector((state) => state.theme.current);
  const isDarkTheme = theme === 'dark';

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 ${
      isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`text-center ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg mb-2">
          {statusText}
        </p>
        {showProgress && progressSteps.length > 0 && (
          <div className="flex items-center justify-center space-x-4 mt-4">
            {progressLabels.map((label, index) => (
              <div key={label} className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  progressSteps[index] 
                    ? 'bg-green-500' 
                    : isDarkTheme ? 'bg-gray-600' : 'bg-gray-300'
                }`}></div>
                <span className={`text-xs ${
                  isDarkTheme ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CenteredLoader; 