import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Home page logic hook following Single Responsibility Principle
 * Manages popup state and user authentication-related display logic
 */
export const useHomePageLogic = () => {
  const { user, statusChecked, googleCallbackDetected } = useSelector((state) => state.auth);
  const [shouldShowPopup, setShouldShowPopup] = useState(false);

  // Only show popup when auth status has been checked, user is not authenticated, 
  // and we're not in the middle of processing a Google callback
  useEffect(() => {
    if (statusChecked && !googleCallbackDetected) {
      setShouldShowPopup(!user);
    } else if (googleCallbackDetected) {
      // Hide popup immediately when Google callback is detected
      setShouldShowPopup(false);
    }
  }, [user, statusChecked, googleCallbackDetected]);

  // Memoized close handler to prevent unnecessary re-renders
  const handleClosePopup = useCallback(() => {
    setShouldShowPopup(false);
  }, []);

  return {
    shouldShowPopup,
    handleClosePopup,
    isAuthenticated: !!user,
  };
}; 