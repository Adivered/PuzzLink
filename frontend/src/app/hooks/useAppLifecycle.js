import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { disconnectSocket } from '../store/socketSlice';
import { checkAuthStatus } from '../store/authSlice';

/**
 * App lifecycle hook following Single Responsibility Principle
 * Handles initialization and cleanup logic
 */
export const useAppLifecycle = () => {
  const dispatch = useDispatch();
  const authCheckCalled = useRef(false);
  const { statusChecked, googleCallbackDetected } = useSelector((state) => state.auth);

  // Initialize app on mount (with StrictMode safeguard)
  useEffect(() => {
    if (!authCheckCalled.current && !statusChecked) {
      console.log('🔄 useAppLifecycle: Checking auth status on app init');
      dispatch(checkAuthStatus());
      authCheckCalled.current = true;
    }
  }, [dispatch, statusChecked]);

  // Handle Google callback auth check (regardless of previous status checks)
  useEffect(() => {
    if (googleCallbackDetected) {
      console.log('🔄 useAppLifecycle: Handling Google callback auth check');
      dispatch(checkAuthStatus());
    }
  }, [googleCallbackDetected, dispatch]);

  // Global socket cleanup only on actual page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(disconnectSocket());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch]);
}; 