import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../Navbar/Navbar';
import Footer from '../../Footer/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../../store/themeSlice';
import { checkAuthStatus } from '../../../store/authSlice';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  const theme = useSelector((state) => state.theme.current);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      console.log("Checking auth status");
      dispatch(checkAuthStatus());
      isInitialMount.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (isMounted) {
      document.body.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, isMounted]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navbar user={user} onThemeToggle={handleThemeToggle} />
      <main className="pt-[7dvh] sm:pt-[8dvh] md:pt-[9dvh] lg:pt-[10dvh] flex-grow">
        <Outlet>
          {children}
        </Outlet>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;