import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import { MainLayout } from '../../shared/layouts/MainLayout';
import { TransitionLayout } from '../../shared/layouts/TransitionLayout';

// Feature Pages
import { HomePage } from '../../features/home/pages/HomePage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { RoomLobbyPage } from '../../features/rooms/pages/RoomLobbyPage';
import { GameRoomPage } from '../../features/game/pages/GameRoomPage';
import { NotFoundPage } from '../../features/common/pages/NotFoundPage';

// Shared Components
import { ProtectedRoute } from '../../shared/components/auth/ProtectedRoute';

/**
 * App Router component following Single Responsibility Principle
 * Handles all application routing configuration
 */
export const AppRouter = () => {
  return (
    <TransitionLayout>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/rooms/:roomId" element={
            <ProtectedRoute>
              <RoomLobbyPage />
            </ProtectedRoute>
          } />

          <Route path="/game/:gameId" element={
            <ProtectedRoute>
              <GameRoomPage />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </TransitionLayout>
  );
}; 