import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '@/pages/Login';

export default function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
