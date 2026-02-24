import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  FitnessCenter as FitnessCenterIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  PhotoCamera as PhotoCameraIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const SidebarContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.mode === 'dark' ? '#0d1117' : '#fafbfc',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

const UserProfileSection = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(1.5, 2, 2, 2),
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: theme.palette.mode === 'dark' ? '#161b22' : '#ffffff',
  border: `1px solid ${theme.palette.divider}`,
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1),
    padding: theme.spacing(1.5),
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  borderRadius: 8,
  margin: '4px 8px',
  padding: '8px 16px',
  transition: 'all 0.2s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    margin: '2px 4px',
    padding: '6px 12px',
  },
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#21262d' : '#f3f4f6',
    transform: 'translateX(4px)',
  },
  ...(active && {
    backgroundColor: `${theme.palette.primary.main}20`,
    color: theme.palette.primary.main,
    fontWeight: 600,
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      left: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 3,
      height: 24,
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 2px 2px 0',
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:hover': {
      backgroundColor: `${theme.palette.primary.main}25`,
      transform: 'translateX(4px)',
    },
  }),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(2, 0, 1, 0),
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: theme.palette.text.secondary,
}));

const Sidebar = ({ userRole, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const trainerNavItems = [
    {
      section: 'Main',
      items: [
        { path: '/trainer', label: 'Dashboard', icon: DashboardIcon, exact: true },
        { path: '/trainer/clients', label: 'Clients', icon: PeopleIcon },
        { path: '/trainer/clients/add', label: 'Add Client', icon: PersonAddIcon },
      ]
    },
    {
      section: 'Management',
      items: [
        { path: '/trainer/attendance', label: 'Attendance', icon: EventNoteIcon },
        { path: '/trainer/payments', label: 'Payments', icon: PaymentIcon },
        { path: '/trainer/workouts', label: 'Workout Plans', icon: FitnessCenterIcon },
        { path: '/trainer/progress', label: 'Client Progress', icon: TrendingUpIcon },
      ]
    },
  ];

  const clientNavItems = [
    {
      section: 'Main',
      items: [
        { path: '/client', label: 'Dashboard', icon: DashboardIcon, exact: true },
        { path: '/client/workout', label: 'My Workout Plan', icon: FitnessCenterIcon },
      ]
    },
    {
      section: 'Tracking',
      items: [
        { path: '/client/attendance', label: 'My Attendance', icon: EventNoteIcon },
        { path: '/client/payments', label: 'My Payments', icon: PaymentIcon },
        { path: '/client/progress', label: 'Progress Images', icon: PhotoCameraIcon },
      ]
    },
  ];

  const commonNavItems = [
    {
      section: 'Account',
      items: [
        { path: '/settings', label: 'Settings', icon: SettingsIcon },
        { path: '/help', label: 'Help & Support', icon: HelpIcon },
      ]
    },
  ];

  const navItems = userRole === 'trainer' ? trainerNavItems : clientNavItems;
  const allNavItems = [...navItems, ...commonNavItems];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const getUserDisplayName = () => {
    return user?.name || user?.username || 'User';
  };

  const getUserRole = () => {
    return user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  };

  const getAvatarText = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <SidebarContainer>
      {/* User Profile Section */}
      <UserProfileSection elevation={0}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'primary.main',
            margin: 'auto',
            mb: 2,
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          {getAvatarText()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {getUserDisplayName()}
        </Typography>
        <Chip
          label={getUserRole()}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ fontSize: '0.75rem' }}
        />
      </UserProfileSection>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: 2 }}>
        {allNavItems.map((section) => (
          <Box key={section.section}>
            <SectionTitle variant="overline">
              {section.section}
            </SectionTitle>
            <List component="nav" disablePadding>
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path, item.exact);
                
                return (
                  <ListItem key={item.path} disablePadding>
                    <StyledListItemButton
                      active={active}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <IconComponent fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: active ? 600 : 500,
                        }}
                      />
                    </StyledListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid`, borderTopColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          FitTrack Pro v2.0
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2024 Gym Management
        </Typography>
      </Box>
    </SidebarContainer>
  );
};

export default Sidebar;
