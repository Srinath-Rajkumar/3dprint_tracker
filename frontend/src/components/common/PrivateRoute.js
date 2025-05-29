import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext'; // For profile selection
import { Spinner } from 'react-bootstrap'; // For loading state

const PrivateRoute = () => {
  const { userInfo, loading } = useContext(AuthContext);
  const { selectedProfile } = useApp();
  const location = useLocation();

  if (loading) {
    return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  }

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If user is logged in but hasn't selected a profile, and isn't trying to go to profile selection
  if (userInfo && !selectedProfile && location.pathname !== '/profile-select' && location.pathname !== '/') {
      return <Navigate to="/profile-select" state={{ from: location }} replace />;
  }

  // If user is an admin and requires initial setup, redirect them
  if (userInfo && userInfo.role === 'admin' && userInfo.requiresInitialSetup && location.pathname !== '/initial-admin-setup') {
    return <Navigate to="/initial-admin-setup" state={{ from: location }} replace />;
  }


  return <Outlet />;
};

export default PrivateRoute;