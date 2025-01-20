import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';

import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import Layout from './components/common/Layout/Layout';
import TransitionLayout from './components/common/Layout/TransitionLayout';
import RoomLobby from './components/Room/RoomLobby';
import GameRoom from './pages/Game/GameRoom';


const App = () => {
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

      </TransitionLayout>
    </>
  );
}

export default App;
