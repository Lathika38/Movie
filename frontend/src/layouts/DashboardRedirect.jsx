import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardRedirect - Senior RBAC Router
 * Automatically determines authenticated role and redirects to authorized workspace.
 */
export const DashboardRedirect = () => {
  const { user, role, getRolePath } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const targetPath = getRolePath(role);
  return <Navigate to={targetPath} replace />;
};
