import React from 'react';
import {
  Card as MUICard,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MUICard)(({ theme, variant = 'default' }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.2s ease-in-out',
  ...(variant === 'gradient' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    color: theme.palette.primary.contrastText,
  }),
  ...(variant === 'stats' && {
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1e1e1e, #2a2a2a)'
      : 'linear-gradient(135deg, #ffffff, #f8f9fa)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  }),
  ...(variant === 'interactive' && {
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.5)'
        : '0 8px 32px rgba(0,0,0,0.15)',
    },
  }),
}));

const Card = ({
  children,
  title,
  subtitle,
  actions,
  variant = 'default',
  loading = false,
  elevation = 1,
  onClick,
  ...props
}) => {
  if (loading) {
    return (
      <StyledCard variant={variant} elevation={elevation} {...props}>
        <CardHeader
          title={<Skeleton variant="text" width="60%" height={32} />}
          subheader={<Skeleton variant="text" width="40%" height={20} />}
        />
        <CardContent>
          <Skeleton variant="rectangular" width="100%" height={120} />
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard
      variant={variant}
      elevation={elevation}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 6px 20px rgba(0,0,0,0.4)'
              : '0 6px 20px rgba(0,0,0,0.1)',
          },
        }),
      }}
      {...props}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" component="h2" fontWeight={600}>
              {title}
            </Typography>
          )}
          subheader={subtitle}
        />
      )}
      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {children}
      </CardContent>
      {actions && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          {actions}
        </CardActions>
      )}
    </StyledCard>
  );
};

// Specialized card components
export const StatsCard = ({ icon, title, value, trend, color = 'primary', ...props }) => (
  <Card variant="stats" {...props}>
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="space-between" 
      sx={{ 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        textAlign: { xs: 'center', sm: 'left' }
      }}
    >
      <Box sx={{ order: { xs: 2, sm: 1 } }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography 
          variant={{ xs: 'h5', sm: 'h4' }} 
          fontWeight={700} 
          color={`${color}.main`}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          {value}
        </Typography>
        {trend && (
          <Typography
            variant="body2"
            sx={{
              color: trend.direction === 'up' ? 'success.main' : 'error.main',
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}
          >
            {trend.icon}
            {trend.value}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 2,
          backgroundColor: `${color}.main`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          order: { xs: 1, sm: 2 },
          fontSize: { xs: '1.2rem', sm: '1.5rem' }
        }}
      >
        {icon}
      </Box>
    </Box>
  </Card>
);

export const DashboardCard = ({ children, ...props }) => (
  <Card variant="interactive" elevation={2} {...props}>
    {children}
  </Card>
);

export default Card;