import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../contexts/AuthContext';

const RoleGate: React.FC<{ allow: Role[]; fallback?: React.ReactNode; children: React.ReactNode; }>
= ({ allow, fallback = null, children }) => {
  const { user } = useAuth();
  if (!user) return <>{fallback}</>;
  return allow.includes(user.role) ? <>{children}</> : <>{fallback}</>;
};

export default RoleGate;
