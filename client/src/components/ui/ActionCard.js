import React from 'react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography,
  IconButton,
  useTheme
} from '@mui/material';
import { PrimaryButton } from './Button';

// Action Card for mobile quick actions and desktop activity panels
export const ActionCard = ({ 
  title, 
  children, 
  actions = [], 
  compact = false,
  sx, 
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        height: compact ? 'auto' : '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[2],
        },
        ...sx
      }}
      {...props}
    >
      {title && (
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pt: { xs: 2, sm: 2.5 },
            pb: { xs: 1, sm: 1.5 },
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.125rem' },
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          '&:last-child': { pb: { xs: 2, sm: 2.5 } }
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
        
        {actions.length > 0 && (
          <Box
            sx={{
              mt: { xs: 2, sm: 2.5 },
              pt: { xs: 1.5, sm: 2 },
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {actions.map((action, index) => (
              <PrimaryButton
                key={index}
                fullWidth
                variant={index === 0 ? 'contained' : 'outlined'}
                startIcon={action.icon}
                onClick={action.onClick}
                size={compact ? 'medium' : 'large'}
                sx={{
                  justifyContent: 'center',
                  minHeight: { xs: 40, sm: 44 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {action.label}
              </PrimaryButton>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Compact Stats Summary for mobile reordering
export const MobileStatsSummary = ({ stats, loading }) => {
  const theme = useTheme();
  
  const summaryItems = [
    { label: 'Clients', value: stats?.totalClients || 0, color: 'primary' },
    { label: 'Today', value: stats?.todayAttendance || 0, color: 'info' },
    { label: 'Active', value: stats?.activeClients || 0, color: 'success' },
    { label: 'Revenue', value: `$${stats?.monthlyRevenue || 0}`, color: 'warning' }
  ];
  
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        mb: 2
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Quick Overview
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1.5,
          mt: 1.5
        }}
      >
        {summaryItems.map((item, index) => (
          <Box key={index} sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ 
                color: `${item.color}.main`,
                fontSize: '1.125rem',
                lineHeight: 1
              }}
            >
              {loading ? '-' : item.value}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

export default ActionCard;