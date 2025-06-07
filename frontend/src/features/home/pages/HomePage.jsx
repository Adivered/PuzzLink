import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { setGoogleCallbackDetected } from '../../../app/store/authSlice';

// Feature Components
import { LandingPage } from '../components/LandingPage';
import { WelcomePopup } from '../components/WelcomePopup';

// Feature Hooks
import { useHomePageLogic } from '../hooks/useHomePageLogic';

/**
 * Home Page component following Single Responsibility Principle
 * Handles Google auth callback detection and renders home content
 */
export const HomePage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { shouldShowPopup, handleClosePopup } = useHomePageLogic();
  const callbackHandled = useRef(false);

  useEffect(() => {
    // Handle Google auth callback
    const authSuccess = searchParams.get('auth');
    
    if (authSuccess === 'success' && !callbackHandled.current) {
      // Google auth was successful, signal useAppLifecycle to handle auth check
      console.log('🔄 HomePage: Google callback detected, signaling useAppLifecycle');
      dispatch(setGoogleCallbackDetected());
      callbackHandled.current = true;
      
      // Clean up URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, dispatch]);

  return (
    <>
      <LandingPage />
      {shouldShowPopup && (
        <WelcomePopup onClose={handleClosePopup} />
      )}
    </>
  );
}; 