import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  userRole: string | null;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  allowedRoles,
  userRole,
}) => {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};
