import React from 'react';
import {
  Button as MUIButton,
  IconButton as MUIIconButton,
  Fab as MUIFab,
  CircularProgress,
  Box,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MUIButton)(({ theme, variant, size }) => ({
  borderRadius: 8,
  fontWeight: 500,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.2s ease-in-out',
  
  // Size adjustments
  ...(size === 'large' && {
    fontSize: '1rem',
    padding: '12px 24px',
    minHeight: 48,
  }),
  
  // Gradient variant
  ...(variant === 'gradient' && {
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    },
  }),
  
  // Glass morphism variant
  ...(variant === 'glass' && {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      transform: 'translateY(-1px)',
    },
  }),
  
  // Success variant
  ...(variant === 'success' && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  }),
  
  // Warning variant
  ...(variant === 'warning' && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
    },
  }),
}));

const Button = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  variant = 'contained',
  size = 'medium',
  disabled = false,
  onClick,
  startIcon,
  endIcon,
  ...props
}) => {
  const handleClick = (event) => {
    if (!loading && !disabled && onClick) {
      onClick(event);
    }
  };

  return (
    <StyledButton
      variant={variant === 'gradient' || variant === 'glass' || variant === 'success' || variant === 'warning' ? 'contained' : variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={handleClick}
      startIcon={!loading && startIcon}
      endIcon={!loading && endIcon}
      {...props}
    >
      {loading ? (
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={16} color="inherit" />
          {loadingText}
        </Box>
      ) : (
        children
      )}
    </StyledButton>
  );
};

// Specialized button components
export const PrimaryButton = ({ children, ...props }) => (
  <Button variant="contained" color="primary" {...props}>
    {children}
  </Button>
);

export const SecondaryButton = ({ children, ...props }) => (
  <Button variant="outlined" color="primary" {...props}>
    {children}
  </Button>
);

export const GradientButton = ({ children, ...props }) => (
  <Button variant="gradient" {...props}>
    {children}
  </Button>
);

export const SuccessButton = ({ children, ...props }) => (
  <Button variant="success" {...props}>
    {children}
  </Button>
);

export const WarningButton = ({ children, ...props }) => (
  <Button variant="warning" {...props}>
    {children}
  </Button>
);

export const DangerButton = ({ children, ...props }) => (
  <Button variant="contained" color="error" {...props}>
    {children}
  </Button>
);

// Icon button with enhanced styling
export const IconButton = ({ children, variant = 'default', ...props }) => {
  const StyledIconButton = styled(MUIIconButton)(({ theme }) => ({
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'scale(1.05)',
    },
    ...(variant === 'contained' && {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
  }));

  return (
    <StyledIconButton {...props}>
      {children}
    </StyledIconButton>
  );
};

// Floating Action Button
export const FloatingActionButton = ({ children, color = 'primary', ...props }) => (
  <MUIFab
    color={color}
    sx={{
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    }}
    {...props}
  >
    {children}
  </MUIFab>
);

export default Button;