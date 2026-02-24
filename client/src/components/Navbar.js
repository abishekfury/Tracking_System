import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Legacy Navbar component - replaced by TopNavbar
// Kept for backward compatibility if referenced elsewhere
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Return null since this is replaced by the new layout
  return null;
};

export default Navbar;