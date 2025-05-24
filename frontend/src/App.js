import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';
import ToastContainer from './components/common/ToastComponent';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import Layout from './components/common/Layout/Layout';
import TransitionLayout from './components/common/Layout/TransitionLayout';
import RoomLobby from './components/Room/RoomLobby';
import GameRoom from './pages/Game/GameRoom';
import FloatingChat from './components/Chat/FloatingChat';
import socketService from './services/socketService';

const App = () => {
  // Global socket cleanup only on actual page unload
  useEffect(() => {
    console.log('App component mounted - setting up cleanup handlers');
    
    const handleBeforeUnload = () => {
      console.log('Page unloading - disconnecting socket');
      socketService.disconnect();
    };

    // Only add the beforeunload listener, don't disconnect on component unmount
    window.addEventListener('beforeunload', handleBeforeUnload);

    // In development, add additional logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - App component initialized');
      
      // Log when cleanup function is called (but don't disconnect)
      return () => {
        console.log('App component cleanup called (StrictMode or unmount) - NOT disconnecting socket');
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }

    // Production cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <TransitionLayout>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/rooms/:roomId" element={
              <ProtectedRoute>
                <RoomLobby />
              </ProtectedRoute>
            } />

            <Route path="/game/:gameId" element={
              <ProtectedRoute>
                <GameRoom />
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer />
        <FloatingChat />
      </TransitionLayout>
    </>
  );
}

export default App;
