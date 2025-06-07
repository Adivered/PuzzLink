import React, { useEffect } from 'react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';
import { usePopupAnimation } from '../../../hooks/animations/usePopupAnimation';

/**
 * Welcome Popup component following Single Responsibility Principle
 * Original design with GSAP animations and proper PuzzLink branding
 */
export const WelcomePopup = ({ onClose }) => {
  const { theme } = useThemeManager();
  const { popupRef, overlayRef, handleClose } = usePopupAnimation(onClose, true);
  const isDark = theme === 'dark';

  const handleConfirm = () => {
    handleClose();
    window.location.href = '/login';
  };

  // Handle escape key
  useEffect(() => {
    const currentPopupRef = popupRef.current;
    const currentOverlayRef = overlayRef.current;
    if (!currentPopupRef || !currentOverlayRef) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose, popupRef, overlayRef]);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 opacity-0"
    >
      <div 
        ref={popupRef}
        className={`
          w-full max-w-md p-6 mx-4 rounded-xl shadow-2xl transform
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          transition-colors duration-200
        `}
      >
        <h2 className="text-2xl font-bold mb-4">Welcome to PuzzLink!</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Join us to create and solve collaborative puzzles with friends around the world.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className={`px-4 py-2 rounded-md border transition-colors duration-200 ${
              isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Maybe Later
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}; 