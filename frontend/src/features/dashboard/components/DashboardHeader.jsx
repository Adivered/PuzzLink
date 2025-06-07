import React from 'react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';

/**
 * Dashboard Header component following Single Responsibility Principle
 * Handles dashboard title and subtitle display with animations
 */
export const DashboardHeader = ({ titleRef, subtitleRef, currentStationData }) => {
  const { theme } = useThemeManager();

  const titleClasses = `text-2xl lg:text-3xl font-bold mb-2 ${
    theme === 'dark' ? 'text-white' : 'text-gray-900'
  }`;

  const subtitleClasses = `text-sm lg:text-base ${
    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  }`;

  return (
    <div className="flex-none px-6 pt-2 pb-2">
      <div className="text-center">
        <h1 ref={titleRef} className={titleClasses}>
          {currentStationData.title}
        </h1>
        <p ref={subtitleRef} className={subtitleClasses}>
          {currentStationData.subtitle}
        </p>
      </div>
    </div>
  );
}; 