import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  EventNote as EventIcon,
  Payment as PaymentIcon,
  FitnessCenter as WorkoutIcon,
  Assessment as ProgressIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuth();

  const menuItems = {
    trainer: [
      {
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/trainer/dashboard',
        active: location.pathname === '/trainer/dashboard',
      },
      {
        title: 'Clients',
        icon: <PeopleIcon />,
        path: '/trainer/clients',
        active: location.pathname.startsWith('/trainer/clients'),
      },
      {
        title: 'Add Client',
        icon: <PersonAddIcon />,
        path: '/trainer/clients/add',
        active: location.pathname === '/trainer/clients/add',
      },
      {
        title: 'Attendance',
        icon: <EventIcon />,
        path: '/trainer/attendance',
        active: location.pathname === '/trainer/attendance',
      },
      {
        title: 'Payments',
        icon: <PaymentIcon />,
        path: '/trainer/payments',
        active: location.pathname === '/trainer/payments',
      },
      {
        title: 'Workout Plans',
        icon: <WorkoutIcon />,
        path: '/trainer/workouts',
        active: location.pathname === '/trainer/workouts',
      },
      {
        title: 'Client Progress',
        icon: <ProgressIcon />,
        path: '/trainer/progress',
        active: location.pathname === '/trainer/progress',
      },
    ],
    client: [
      {
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/client/dashboard',
        active: location.pathname === '/client/dashboard',
      },
      {
        title: 'My Attendance',
        icon: <EventIcon />,
        path: '/client/attendance',
        active: location.pathname === '/client/attendance',
      },
      {
        title: 'My Payments',
        icon: <PaymentIcon />,
        path: '/client/payments',
        active: location.pathname === '/client/payments',
      },
      {
        title: 'My Workout Plan',
        icon: <WorkoutIcon />,
        path: '/client/workout',
        active: location.pathname === '/client/workout',
      },
      {
        title: 'Progress Upload',
        icon: <ProgressIcon />,
        path: '/client/progress',
        active: location.pathname === '/client/progress',
      },
    ],
  };

  const accountItems = [
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      active: location.pathname === '/settings',
    },
    {
      title: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      active: location.pathname === '/help',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const currentMenuItems = menuItems[user?.role] || [];

  return (
    <Drawer
      variant=\"permanent\"
      open={open}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: `1px solid ${theme.palette.grey[200]}`,
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* Brand Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
        <Box display=\"flex\" alignItems=\"center\" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
            }}
          >
            F
          </Box>
          <Box>
            <Typography variant=\"h6\" sx={{ fontWeight: 700, color: 'text.primary' }}>
              FitTrack Pro
            </Typography>
            <Typography variant=\"caption\" color=\"text.secondary\">
              Gym Management
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
        <Box display=\"flex\" alignItems=\"center\" gap={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box flex={1}>
            <Typography 
              variant=\"subtitle2\" 
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              {user?.username || 'User'}
            </Typography>
            <Typography 
              variant=\"caption\" 
              sx={{ 
                color: 'text.secondary',
                textTransform: 'capitalize',
                fontSize: '0.75rem'
              }}
            >
              {user?.role || 'Role'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <Typography 
          variant=\"overline\" 
          sx={{ 
            px: 3, 
            color: 'text.secondary', 
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}
        >
          MAIN
        </Typography>
        
        <List sx={{ px: 2, mt: 1 }}>
          {currentMenuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  backgroundColor: item.active 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  color: item.active 
                    ? theme.palette.primary.main 
                    : 'text.primary',
                  '&:hover': {
                    backgroundColor: item.active 
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: 40,
                    '& svg': { fontSize: '1.25rem' }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: item.active ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mx: 3, my: 2 }} />

        <Typography 
          variant=\"overline\" 
          sx={{ 
            px: 3, 
            color: 'text.secondary', 
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px'
          }}
        >
          ACCOUNT
        </Typography>
        
        <List sx={{ px: 2, mt: 1 }}>
          {accountItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  backgroundColor: item.active 
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  color: item.active 
                    ? theme.palette.primary.main 
                    : 'text.primary',
                  '&:hover': {
                    backgroundColor: item.active 
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.grey[500], 0.08),
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: 40,
                    '& svg': { fontSize: '1.25rem' }
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: item.active ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.grey[200]}` }}>
        <Typography 
          variant=\"caption\" 
          color=\"text.secondary\" 
          sx={{ fontSize: '0.75rem' }}
        >
          © 2026 FitTrack Pro v2.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;