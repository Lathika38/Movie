import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { RoleRoute } from './layouts/RoleRoute';
import { DashboardRedirect } from './layouts/DashboardRedirect';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { SettingsPage } from './pages/SettingsPage';

// Workspaces
import { DirectorDashboard } from './features/director/DirectorDashboard';
import { ProducerDashboard } from './features/producer/ProducerDashboard';
import { ActorDashboard } from './features/actor/ActorDashboard';
import { MusicDirectorDashboard } from './features/music/MusicDirectorDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MovieProvider>
            <NotificationProvider>
            <Routes>
              {/* Public Entry Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              {/* Protected Role Workspaces & Settings */}
              <Route element={<DashboardLayout />}>
                {/* Unified Role Redirector */}
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Director Workspace */}
                <Route element={<RoleRoute allowedRoles={['DIRECTOR']} />}>
                  <Route path="/director" element={<DirectorDashboard />} />
                </Route>

                {/* Producer Workspace */}
                <Route element={<RoleRoute allowedRoles={['PRODUCER']} />}>
                  <Route path="/producer" element={<ProducerDashboard />} />
                </Route>

                {/* Actor Workspace */}
                <Route element={<RoleRoute allowedRoles={['ACTOR']} />}>
                  <Route path="/actor" element={<ActorDashboard />} />
                </Route>

                {/* Music Director Workspace */}
                <Route element={<RoleRoute allowedRoles={['MUSIC_DIRECTOR']} />}>
                  <Route path="/music-director" element={<MusicDirectorDashboard />} />
                </Route>

                {/* Admin Workspace */}
                <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Settings & RBAC Suite for all authenticated roles */}
                <Route element={<RoleRoute allowedRoles={['DIRECTOR', 'PRODUCER', 'ACTOR', 'MUSIC_DIRECTOR', 'ADMIN']} />}>
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </MovieProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
}
