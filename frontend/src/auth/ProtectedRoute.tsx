import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getToken } from './token';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
