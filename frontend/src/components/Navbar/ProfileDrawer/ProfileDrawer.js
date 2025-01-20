import React, { useRef, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import gsap from 'gsap';

const ProfileDrawer = forwardRef(({ isOpen, onClose, user, onLogout, onThemeToggle, isAdmin }, ref) => {
  const theme = useSelector((state) => state.theme.current);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const drawer = drawerRef.current;
    const overlay = overlayRef.current;

    if (isOpen) {
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        display: 'block'
      });
      gsap.to(drawer, {
        x: 0,
        duration: 0.7,
        ease: "ease.in"
      });
    } else {
      gsap.to(drawer, {
        x: '100%',
        duration: 0.5,
        ease: "ease.out"
      });
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.3,
        display: 'none'
      });
    }
  }, [isOpen]);

  return (
    <>
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 h-full w-80 shadow-lg z-50 transform translate-x-full
          ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {user ? `Hello, ${user.name}` : 'Hello, Guest'}
            </h2>
            <button 
              onClick={onClose} 
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4 flex-grow relative">
            <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${theme === 'dark' ? 'gray-900' : 'gray-200'} pointer-events-none`} />
            {user ? (
              <div className={`flex items-center space-x-3 p-4 rounded-lg
                ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            ) : null}
            
            <div className={`space-y-2 relative z-10 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Link 
                to="/" 
                className={`block transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-blue-400' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
                onClick={onClose}
                onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
              >
                Home
              </Link>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`block transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                    onClick={onClose}
                    onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                    onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
                  >
                    Dashboard
                  </Link>

                  <Link 
                    to="/profile" 
                    className={`block transition-colors ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-blue-400' 
                        : 'text-gray-600 hover:text-blue-500'
                    }`}
                    onClick={onClose}
                    onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                    onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
                  >
                    Profile
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`block transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-300 hover:text-blue-400' 
                          : 'text-gray-600 hover:text-blue-500'
                      }`}
                      onClick={onClose}
                      onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                      onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
                    >
                      Control Panel
                    </Link>
                  )}
                  
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className={`block w-full text-left transition-colors ${
                      theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'
                    }`}
                    onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                    onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className={`block transition-colors ${
                    theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-500'
                  }`}
                  onClick={onClose}
                  onMouseEnter={(e) => gsap.to(e.target, { scale: 1.1 })}
                  onMouseLeave={(e) => gsap.to(e.target, { scale: 1 })}
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => {
                onThemeToggle();
              }} 
              className={`p-2 w-10 h-10 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export default ProfileDrawer;