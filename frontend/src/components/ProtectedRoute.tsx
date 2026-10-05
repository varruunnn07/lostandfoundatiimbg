import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-panel p-8 rounded-[20px]">
          <p className="text-text-dark font-medium">Checking authentication...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
