import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

const GuestRoute = ({ children }) => {
  const isAuthed = authService.isAuthenticated();

  if (isAuthed) {
    return <Navigate to="/app/inbox" replace />;
  }

  return children;
};

export default GuestRoute;

