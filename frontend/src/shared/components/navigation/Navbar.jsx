import React from 'react';

// Shared Components
import { AnimatedLogo } from '../ui/AnimatedLogo';
import { ProfileButton } from './ProfileButton';
import { ProfileDrawer } from './ProfileDrawer';

// Shared Hooks
import { useNavbarLogic } from '../../hooks/useNavbarLogic';
import { useScrollDetection } from '../../hooks/useScrollDetection';
import { useThemeManager } from '../../hooks/useThemeManager';

/**
 * Navbar component following Single Responsibility Principle
 * Handles navigation UI and user profile access
 */
export const Navbar = () => {
  const { theme } = useThemeManager();
  const { isScrolled } = useScrollDetection();
  const {
    user,
    isProfileOpen,
    handleOpenProfile,
    handleCloseProfile,
    handleLogout,
  } = useNavbarLogic();

  const navbarClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
    isScrolled 
      ? theme === 'dark' 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-xl shadow-black/20' 
        : 'bg-white/95 backdrop-blur-md border-b border-gray-300 shadow-xl shadow-black/10'
      : 'bg-transparent backdrop-blur-none border-b border-transparent'
  }`;

  return (
    <>
      <nav className={navbarClasses}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AnimatedLogo />
            
            <div className="flex items-center space-x-6">
              {user && (
                <ProfileButton 
                  user={user}
                  onClick={handleOpenProfile}
                />
              )}
            </div>
          </div>
        </div>
      </nav>

      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}; 