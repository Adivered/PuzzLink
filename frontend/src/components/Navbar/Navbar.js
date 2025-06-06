import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import AnimatedLogo from '../common/AnimatedLogo/AnimatedLogo';
import ProfileDrawer from './ProfileDrawer/ProfileDrawer';

const Navbar = ({ user, theme }) => {
  const dispatch = useDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Handle scroll detection for backdrop blur effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-150 ${
        isScrolled 
          ? theme === 'dark' 
            ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-xl shadow-black/20' 
            : 'bg-white/95 backdrop-blur-md border-b border-gray-300 shadow-xl shadow-black/10'
          : theme === 'dark' 
            ? 'bg-gray-900/10 backdrop-blur-none' 
            : 'bg-white/10 backdrop-blur-none'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <AnimatedLogo theme={theme} />
            
            <div className="flex items-center space-x-6">
              {user && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      theme === 'dark' ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-xs font-bold ${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <ProfileDrawer 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        theme={theme}
      />
    </>
  );
};

export default Navbar;