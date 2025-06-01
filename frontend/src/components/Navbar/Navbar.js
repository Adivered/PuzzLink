// Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import AnimatedLogo from '../common/AnimatedLogo/AnimatedLogo';
import ProfileDrawer from './ProfileDrawer/ProfileDrawer';
import gsap from 'gsap';

const Navbar = ({ user, onThemeToggle }) => {
  const dispatch = useDispatch();

  const theme = useSelector((state) => state.theme.current);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const drawerRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (drawerRef.current) {
      if (isProfileOpen) {
        gsap.to(drawerRef.current, {
          x: 0,
          duration: 0.5,
          ease: "power3.out"
        });
      } else {
        gsap.to(drawerRef.current, {
          x: '-100%',
          duration: 0.5,
          ease: "power3.in"
        });
      }
    }
  }, [isProfileOpen]);

  return (
    <>
      <nav className={`h-[7dvh] sm:h-[8dvh] md:h-[9dvh] lg:h-[10dvh] fixed top-0 left-0 right-0 px-6 pt-2 md:pt-3 lg:pt-4 shadow-md z-50 transition-all duration-300 ${
        isScrolled 
          ? `backdrop-blur-md ${theme === 'dark' ? 'bg-gray-900/80 border-b border-gray-700/50' : 'bg-white/80 border-b border-gray-200/50'}`
          : `${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`
        }`}>
        <div className="container mx-auto flex justify-between items-center">
          <AnimatedLogo />

          {user && (
            <button
              onClick={() => setIsProfileOpen(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold transition-colors ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {user.email[0].toUpperCase()}
            </button>
          )}
        </div>
      </nav>

      <ProfileDrawer
        ref={drawerRef}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
        onThemeToggle={onThemeToggle}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default Navbar;