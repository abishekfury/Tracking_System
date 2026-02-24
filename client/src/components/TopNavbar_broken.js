import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ onMenuToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleProfileClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleProfileClose();
    navigate('/settings');
  };

  // Mock notifications - you can replace with real data
  const notifications = [
    { id: 1, title: 'New client registered', time: '5 min ago', unread: true },
    { id: 2, title: 'Payment received from John Doe', time: '1 hour ago', unread: true },
    { id: 3, title: 'Workout plan updated', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <AppBar 
      position=\"fixed\" 
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
        {/* Left Section */}
        <Box display=\"flex\" alignItems=\"center\" gap={2}>
          <IconButton
            onClick={onMenuToggle}
            sx={{ 
              display: { xs: 'flex', lg: 'none' },
              color: 'text.primary' 
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box display=\"flex\" alignItems=\"center\" gap={1}>
            <Typography 
              variant=\"h6\" 
              sx={{ 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              FitTrack Pro
            </Typography>
          </Box>
        </Box>

        {/* Right Section */}
        <Box display=\"flex\" alignItems=\"center\" gap={1}>
          {/* Theme Toggle */}
          <IconButton 
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            <LightModeIcon fontSize=\"small\" />
          </IconButton>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationMenu}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            <Badge badgeContent={unreadCount} color=\"error\">
              <NotificationsIcon fontSize=\"small\" />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenu}
            sx={{ 
              p: 0.5,
              ml: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          PaperProps={{
            sx: {
              width: 320,
              mt: 1.5,
              border: `1px solid ${theme.palette.grey[200]}`,
              boxShadow: theme.shadows[8],
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
            <Typography variant=\"subtitle1\" fontWeight={600}>
              Notifications
            </Typography>
            <Typography variant=\"caption\" color=\"text.secondary\">
              You have {unreadCount} unread notifications
            </Typography>
          </Box>
          
          {notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              sx={{ 
                py: 2, 
                px: 2,
                borderLeft: notification.unread ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                backgroundColor: notification.unread ? alpha(theme.palette.primary.main, 0.02) : 'transparent'
              }}
            >
              <Box>
                <Typography 
                  variant=\"body2\" 
                  sx={{ 
                    fontWeight: notification.unread ? 600 : 400,
                    mb: 0.5 
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography variant=\"caption\" color=\"text.secondary\">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          
          <Divider />
          <MenuItem sx={{ justifyContent: 'center', py: 1.5 }}>
            <Typography variant=\"caption\" color=\"primary.main\" fontWeight={600}>
              View All Notifications
            </Typography>
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileClose}
          PaperProps={{
            sx: {
              width: 220,
              mt: 1.5,
              border: `1px solid ${theme.palette.grey[200]}`,
              boxShadow: theme.shadows[8],
            }
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
            <Typography variant=\"subtitle2\" fontWeight={600}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant=\"caption\" color=\"text.secondary\">
              {user?.email || 'user@example.com'}
            </Typography>
          </Box>
          
          <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
            <PersonIcon fontSize=\"small\" sx={{ mr: 2, color: 'text.secondary' }} />
            <Typography variant=\"body2\">Profile</Typography>
          </MenuItem>
          
          <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
            <SettingsIcon fontSize=\"small\" sx={{ mr: 2, color: 'text.secondary' }} />
            <Typography variant=\"body2\">Settings</Typography>
          </MenuItem>
          
          <Divider />
          
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 1.5,
              color: 'error.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.04)
              }
            }}
          >
            <LogoutIcon fontSize=\"small\" sx={{ mr: 2 }} />
            <Typography variant=\"body2\">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;