import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../app/store/authSlice';

/**
 * Navbar logic hook following Single Responsibility Principle
 * Handles navbar state management and user actions
 */
export const useNavbarLogic = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleOpenProfile = useCallback(() => {
    setIsProfileOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setIsProfileOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    setIsProfileOpen(false);
  }, [dispatch]);

  return {
    user,
    isProfileOpen,
    handleOpenProfile,
    handleCloseProfile,
    handleLogout,
  };
}; 