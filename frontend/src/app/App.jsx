import React from 'react';
import { AppRouter } from './router/AppRouter';
import { AppProviders } from './providers/AppProviders';
import { GlobalComponents } from './components/GlobalComponents';

// Initialize GSAP plugins globally
import '../utils/gsapSetup';

/**
 * Main App component following Single Responsibility Principle
 * Only responsible for combining top-level app structure
 */
const App = () => {
  return (
    <AppProviders>
      <AppRouter />
      <GlobalComponents />
    </AppProviders>
  );
};

export default App; 