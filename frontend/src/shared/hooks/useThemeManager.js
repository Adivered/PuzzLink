import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Theme manager hook following Single Responsibility Principle
 * Handles theme state, DOM updates, and CSS class generation
 */
export const useThemeManager = () => {
  const theme = useSelector((state) => state.theme.current);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatches by ensuring theme is only applied client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Apply theme changes only after component has mounted to prevent hydration issues
  useEffect(() => {
    if (isMounted) {
      document.body.classList.toggle('dark', theme === 'dark');
      // Add data-theme attribute for scrollbar styling
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isMounted]);

  // Memoize theme classes to prevent unnecessary re-renders
  const themeClasses = useMemo(() => {
    return theme === 'dark' 
      ? 'bg-gray-900 text-white' 
      : 'bg-white text-gray-900';
  }, [theme]);

  return {
    theme,
    themeClasses,
    isMounted,
    isDark: theme === 'dark',
  };
}; 