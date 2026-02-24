import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
} from '@mui/material';
import {
  AccountCircle as ProfileIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Palette as ThemeIcon,
  Storage as DataIcon,
  Help as HelpIcon,
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  DashboardContainer,
  PageHeader,
  ProfessionalCard,
  ResponsiveGrid,
  GridItem,
} from '../components/ui/LayoutComponents';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState({
    // Profile settings
    profile: {
      username: user?.username || '',
      email: user?.email || '',
      phone: '',
      bio: '',
      profileImage: null,
    },
    // Notification settings
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      attendanceReminders: true,
      paymentReminders: true,
      workoutReminders: true,
      newClientAlerts: true,
      systemUpdates: false,
    },
    // Preferences
    preferences: {
      language: 'en-IN',
      currency: 'INR',
      timeZone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      theme: 'purple',
      compactView: false,
    },
    // Privacy & Security
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      dataSharing: false,
      activityTracking: true,
    },
  });

  const settingSections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: <ProfileIcon />,
      description: 'Manage your personal information',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <NotificationIcon />,
      description: 'Control your notification preferences',
    },
    {
      id: 'preferences',
      title: 'App Preferences',
      icon: <ThemeIcon />,
      description: 'Customize your app experience',
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      icon: <SecurityIcon />,
      description: 'Manage your account security',
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: <DataIcon />,
      description: 'Export, backup, or delete your data',
    },
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    setMessage('Settings saved successfully!');
    setIsEditing(false);
    // Here you would typically save to backend
    setTimeout(() => setMessage(''), 3000);
  };

  const renderProfileSettings = () => (
    <ProfessionalCard title="Profile Information" subtitle="Update your personal details">
      <Box sx={{ mt: 3 }}>
        <Box display="flex" alignItems="center" mb={4} gap={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 600,
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || 'Member'}
            </Typography>
            <Chip 
              label={user?.role === 'trainer' ? 'Trainer Account' : 'Client Account'}
              size="small"
              color={user?.role === 'trainer' ? 'primary' : 'secondary'}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <ResponsiveGrid spacing={3}>
          <GridItem xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              value={settings.profile.username}
              onChange={(e) => handleSettingChange('profile', 'username', e.target.value)}
              disabled={!isEditing}
            />
          </GridItem>
          <GridItem xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              disabled={!isEditing}
            />
          </GridItem>
          <GridItem xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              value={settings.profile.phone}
              onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
              disabled={!isEditing}
              placeholder="+91 12345 67890"
            />
          </GridItem>
          <GridItem xs={12}>
            <TextField
              fullWidth
              label="Biography"
              multiline
              rows={3}
              value={settings.profile.bio}
              onChange={(e) => handleSettingChange('profile', 'bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
            />
          </GridItem>
        </ResponsiveGrid>

        <Box display="flex" gap={2} mt={4}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>
    </ProfessionalCard>
  );

  const renderNotificationSettings = () => (
    <ProfessionalCard title="Notification Preferences" subtitle="Control when and how you receive notifications">
      <List sx={{ mt: 2 }}>
        <ListItem>
          <ListItemIcon><NotificationIcon /></ListItemIcon>
          <ListItemText 
            primary="Email Notifications"
            secondary="Receive updates via email"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemIcon><NotificationIcon /></ListItemIcon>
          <ListItemText 
            primary="Push Notifications"
            secondary="Browser push notifications"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText 
            primary="Attendance Reminders"
            secondary="Daily workout reminders"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.notifications.attendanceReminders}
              onChange={(e) => handleSettingChange('notifications', 'attendanceReminders', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Payment Reminders"
            secondary="Monthly fee due notifications"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.notifications.paymentReminders}
              onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        {user?.role === 'trainer' && (
          <ListItem>
            <ListItemText 
              primary="New Client Alerts"
              secondary="Notifications for new registrations"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.notifications.newClientAlerts}
                onChange={(e) => handleSettingChange('notifications', 'newClientAlerts', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        )}
      </List>
    </ProfessionalCard>
  );

  const renderPreferencesSettings = () => (
    <ProfessionalCard title="App Preferences" subtitle="Customize your app experience">
      <ResponsiveGrid spacing={3} sx={{ mt: 3 }}>
        <GridItem xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={settings.preferences.language}
              onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
            >
              <MenuItem value="en-IN">English (India)</MenuItem>
              <MenuItem value="hi-IN">हिन्दी (Hindi)</MenuItem>
              <MenuItem value="ta-IN">தமிழ் (Tamil)</MenuItem>
              <MenuItem value="te-IN">తెలుగు (Telugu)</MenuItem>
              <MenuItem value="bn-IN">বাংলা (Bengali)</MenuItem>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={settings.preferences.currency}
              onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
            >
              <MenuItem value="INR">₹ Indian Rupee (INR)</MenuItem>
              <MenuItem value="USD">$ US Dollar (USD)</MenuItem>
              <MenuItem value="EUR">€ Euro (EUR)</MenuItem>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Time Zone</InputLabel>
            <Select
              value={settings.preferences.timeZone}
              onChange={(e) => handleSettingChange('preferences', 'timeZone', e.target.value)}
            >
              <MenuItem value="Asia/Kolkata">India Standard Time (IST)</MenuItem>
              <MenuItem value="Asia/Dubai">UAE Time</MenuItem>
              <MenuItem value="UTC">UTC</MenuItem>
            </Select>
          </FormControl>
        </GridItem>
        <GridItem xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Date Format</InputLabel>
            <Select
              value={settings.preferences.dateFormat}
              onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Indian)</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
            </Select>
          </FormControl>
        </GridItem>
      </ResponsiveGrid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Display Options</Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Compact View"
              secondary="Use smaller cards and condensed layout"
            />
            <ListItemSecondaryAction>
              <Switch
                checked={settings.preferences.compactView}
                onChange={(e) => handleSettingChange('preferences', 'compactView', e.target.checked)}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>
    </ProfessionalCard>
  );

  const renderSecuritySettings = () => (
    <ProfessionalCard title="Security & Privacy" subtitle="Manage your account security settings">
      <List sx={{ mt: 2 }}>
        <ListItem>
          <ListItemIcon><SecurityIcon /></ListItemIcon>
          <ListItemText 
            primary="Two-Factor Authentication"
            secondary="Add an extra layer of security to your account"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Login Alerts"
            secondary="Get notified of new login attempts"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.security.loginAlerts}
              onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Data Sharing"
            secondary="Allow anonymous usage data for improvements"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.security.dataSharing}
              onChange={(e) => handleSettingChange('security', 'dataSharing', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Activity Tracking"
            secondary="Track app usage for personalized experience"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={settings.security.activityTracking}
              onChange={(e) => handleSettingChange('security', 'activityTracking', e.target.checked)}
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>

      <Divider sx={{ my: 3 }} />
      
      <Box>
        <Typography variant="h6" gutterBottom color="error">
          Danger Zone
        </Typography>
        <Button
          variant="outlined"
          color="error"
          sx={{ mr: 2, mb: 2 }}
        >
          Change Password
        </Button>
        <Button
          variant="outlined"
          color="error"
          sx={{ mr: 2, mb: 2 }}
        >
          Deactivate Account
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{ mb: 2 }}
        >
          Delete Account
        </Button>
      </Box>
    </ProfessionalCard>
  );

  const renderDataSettings = () => (
    <ProfessionalCard title="Data Management" subtitle="Manage your data and privacy">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Export Your Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Download a copy of your data including workout history, payments, and attendance records.
        </Typography>
        <Button variant="outlined" sx={{ mb: 3 }}>
          Download Data Export
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Data Backup
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Create a backup of your account data that can be restored later.
        </Typography>
        <Button variant="outlined" sx={{ mb: 3 }}>
          Create Backup
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom color="error">
          Delete All Data
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Permanently delete all your data. This action cannot be undone.
        </Typography>
        <Button variant="contained" color="error">
          Delete All Data
        </Button>
      </Box>
    </ProfessionalCard>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'preferences':
        return renderPreferencesSettings();
      case 'security':
        return renderSecuritySettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <DashboardContainer>
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and settings"
        actions={[
          <Button
            key="back"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>,
        ]}
      />

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <ResponsiveGrid spacing={3}>
        <GridItem xs={12} md={3}>
          <ProfessionalCard title="Settings Menu">
            <List sx={{ mt: 2 }}>
              {settingSections.map((section) => (
                <ListItem
                  key={section.id}
                  button
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.50',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.100',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: activeSection === section.id ? 'primary.main' : 'inherit' 
                    }}
                  >
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={section.title}
                    secondary={section.description}
                    primaryTypographyProps={{
                      fontWeight: activeSection === section.id ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </ProfessionalCard>
        </GridItem>

        <GridItem xs={12} md={9}>
          {renderContent()}
        </GridItem>
      </ResponsiveGrid>
    </DashboardContainer>
  );
};

export default Settings;