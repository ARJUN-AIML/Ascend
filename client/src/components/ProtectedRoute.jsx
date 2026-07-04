import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PremiumLoader from './PremiumLoader';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  console.log("ProtectedRoute", {
    loading,
    user: !!user
  });

  if (loading) {
    return <PremiumLoader />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Removed onboarding redirect per user request

  return children;
}

export default ProtectedRoute;
