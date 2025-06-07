import React from 'react';
import { Outlet } from 'react-router-dom';

// Layout Components
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';

// Layout Hooks
import { useThemeManager } from '../hooks/useThemeManager';
import { useSocketManager } from '../hooks/useSocketManager';

/**
 * Main Layout component following Single Responsibility Principle
 * Provides consistent layout structure and manages theme/socket connections
 */
export const MainLayout = ({ children }) => {
  const { themeClasses } = useThemeManager();
  
  // Initialize socket connections for authenticated users
  useSocketManager();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${themeClasses}`}>
      <Navbar />
      <main className="flex-grow">
        <Outlet>
          {children}
        </Outlet>
      </main>
      <Footer />
    </div>
  );
}; 