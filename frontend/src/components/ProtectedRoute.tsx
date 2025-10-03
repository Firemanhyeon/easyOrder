// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ allowedRoles?: Array<'admin'|'store_owner'>; children: React.ReactNode; }> = ({ allowedRoles, children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;

  if(!user) {
    return null;
  };

  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
export default ProtectedRoute;
