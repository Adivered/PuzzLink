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
import SimpleInvitationHandler from './components/common/SimpleInvitationHandler';

import { useDispatch, useSelector } from 'react-redux';
import { disconnectSocket } from './store/socketSlice';

const App = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.current);

  // Global socket cleanup only on actual page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      dispatch(disconnectSocket());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dispatch]);

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
        <SimpleInvitationHandler theme={theme} />
      </TransitionLayout>
    </>
  );
}

export default App;
