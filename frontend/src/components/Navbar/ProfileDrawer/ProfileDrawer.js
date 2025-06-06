import React, { useRef, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '../../../store/themeSlice';
import { gsap } from 'gsap';

const ProfileDrawer = forwardRef(({ isOpen, onClose, user, onLogout, theme }, ref) => {
  const dispatch = useDispatch();
  const overlayRef = useRef(null);
  const internalDrawerRef = useRef(null);
  const drawerRef = ref || internalDrawerRef;

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;

    if (!drawer || !overlay) return;

    if (isOpen) {
      gsap.set(overlay, { display: 'block' });
      gsap.set(drawer, { x: '100%' });
      
      gsap.to(overlay, { opacity: 0.5, duration: 0.3 });
      gsap.to(drawer, { x: '0%', duration: 0.3 });
    } else {
      gsap.to(drawer, { x: '100%', duration: 0.3 });
      gsap.to(overlay, { 
        opacity: 0, 
        duration: 0.3,
        onComplete: () => gsap.set(overlay, { display: 'none' })
      });
    }
  }, [isOpen]);

  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black opacity-0 z-40"
        style={{ display: 'none' }}
        onClick={onClose}
      />
      
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-80 shadow-xl z-50
          ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
        style={{ transform: 'translateX(100%)' }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {user ? `Hello, ${user.name}` : 'Hello, Guest'}
            </h2>
            <button 
              onClick={onClose} 
              className={`text-2xl ${
                theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 flex-grow">
            {user ? (
              <div className={`flex items-center space-x-3 p-4 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm opacity-75">{user.email}</p>
                </div>
              </div>
            ) : null}
            
            <div className={`space-y-3 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Link 
                to="/" 
                className={`block py-2 px-3 rounded ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-600' 
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-200'
                }`}
                onClick={onClose}
              >
                🏠 Home
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/profile" 
                    className={`block py-2 px-3 rounded ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-600' 
                        : 'text-gray-600 hover:text-blue-500 hover:bg-gray-200'
                    }`}
                    onClick={onClose}
                  >
                    👤 Profile
                  </Link>
                  
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className={`block w-full text-left py-2 px-3 rounded ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-red-400 hover:bg-gray-600' 
                        : 'text-gray-600 hover:text-red-500 hover:bg-gray-200'
                    }`}
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className={`block py-2 px-3 rounded ${
                    theme === 'dark' 
                      ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-600' 
                      : 'text-gray-600 hover:text-blue-500 hover:bg-gray-200'
                  }`}
                  onClick={onClose}
                >
                  🔑 Login
                </Link>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={handleThemeToggle}
              className={`p-3 rounded-full ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="text-xl">
                {theme === 'dark' ? '🌞' : '🌙'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

ProfileDrawer.displayName = 'ProfileDrawer';

export default ProfileDrawer;