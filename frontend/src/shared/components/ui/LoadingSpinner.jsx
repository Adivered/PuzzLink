import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = 'Loading...', 
  theme = 'light',
  statusText,
  showProgress = false,
  progressSteps = [],
  progressLabels = []
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    gray: theme === 'dark' ? 'border-gray-300' : 'border-gray-600'
  };

  const displayText = statusText || text;

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      
      {displayText && (
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {displayText}
        </p>
      )}

      {showProgress && progressSteps.length > 0 && (
        <div className="flex items-center space-x-2">
          {progressSteps.map((isComplete, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div 
                className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                  isComplete 
                    ? `bg-${color}-500 border-${color}-500` 
                    : `border-gray-300 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`
                }`}
              />
              {progressLabels[index] && (
                <span className={`text-xs ${
                  isComplete 
                    ? `text-${color}-600 font-medium` 
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {progressLabels[index]}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CenteredLoader = ({ 
  theme = 'light', 
  className = '',
  ...props 
}) => (
  <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
    <LoadingSpinner theme={theme} {...props} />
  </div>
);

export { LoadingSpinner };
export default CenteredLoader; 