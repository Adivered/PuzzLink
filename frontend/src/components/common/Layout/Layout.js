import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Navbar/Navbar';
import Footer from '../../Footer/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../../../store/authSlice';
import { Outlet } from 'react-router-dom';
import useSocket from '../../../hooks/useSocket';
import useSocketEventHandlers from '../../../hooks/useSocketEventHandlers';

const Layout = ({ children }) => {
  const theme = useSelector((state) => state.theme.current);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const isInitialMount = useRef(true);

  // Use the socket hook to manage connections
  useSocket();
  
  // Use the socket event handlers hook to handle events globally
  useSocketEventHandlers();

  // isMounted prevents hydration mismatches by ensuring theme is only applied client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      dispatch(checkAuthStatus());
      isInitialMount.current = false;
    }
  }, [dispatch]);

  // Apply theme changes only after component has mounted to prevent hydration issues
  useEffect(() => {
    if (isMounted) {
      document.body.classList.toggle('dark', theme === 'dark');
      // Add data-theme attribute for scrollbar styling
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isMounted]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navbar user={user} theme={theme} />
      <main className="pt-20 flex-grow">
        <Outlet>
          {children}
        </Outlet>
      </main>
      <Footer theme={theme} />
    </div>
  );
};

export default Layout;