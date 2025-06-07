import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter } from 'react-router-dom';

import store, { persistor } from '../store';

/**
 * App Providers component following Single Responsibility Principle
 * Handles all app-level context providers and their configuration
 */
export const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
};
