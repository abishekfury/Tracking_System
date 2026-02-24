import React from 'react';
import {
  TextField as MUITextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

const StyledTextField = styled(MUITextField)(({ theme, variant: customVariant }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease-in-out',
    ...(customVariant === 'modern' && {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
      },
    }),
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

const InputField = ({
  label,
  helperText,
  error = false,
  required = false,
  variant = 'outlined',
  customVariant = 'default',
  startIcon,
  endIcon,
  children,
  sx,
  ...props
}) => {
  const textFieldProps = {
    variant,
    error,
    helperText,
    required,
    customVariant,
    fullWidth: true,
    ...props,
  };

  // Handle start and end icons
  if (startIcon || endIcon) {
    textFieldProps.InputProps = {
      ...textFieldProps.InputProps,
      ...(startIcon && {
        startAdornment: (
          <InputAdornment position="start">
            {startIcon}
          </InputAdornment>
        ),
      }),
      ...(endIcon && {
        endAdornment: (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ),
      }),
    };
  }

  const field = children || <StyledTextField {...textFieldProps} />;

  if (label && variant !== 'outlined') {
    return (
      <FormControl fullWidth error={error} required={required} sx={sx}>
        <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
          {label}
        </FormLabel>
        {field}
        {helperText && (
          <FormHelperText>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    );
  }

  return (
    <Box sx={sx}>
      {field}
    </Box>
  );
};

// Specialized input components
export const SearchField = ({ placeholder = 'Search...', ...props }) => {
  return (
    <InputField
      placeholder={placeholder}
      customVariant="modern"
      startIcon={<SearchIcon color="action" />}
      {...props}
    />
  );
};

export const PasswordField = ({ ...props }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <InputField
      type={showPassword ? 'text' : 'password'}
      endIcon={
        <Box
          component="button"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          sx={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </Box>
      }
      {...props}
    />
  );
};

export const NumberField = ({ min, max, step = 1, ...props }) => (
  <InputField
    type="number"
    inputProps={{
      min,
      max,
      step,
    }}
    {...props}
  />
);

export const EmailField = ({ ...props }) => (
  <InputField
    type="email"
    {...props}
  />
);

export const PhoneField = ({ ...props }) => (
  <InputField
    type="tel"
    {...props}
  />
);

// Form section component
export const FormSection = ({ title, subtitle, children, sx }) => (
  <Box sx={{ mb: 4, ...sx }}>
    {title && (
      <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
        {title}
      </Typography>
    )}
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {subtitle}
      </Typography>
    )}
    {children}
  </Box>
);

// Form row for side-by-side fields
export const FormRow = ({ children, spacing = 2, sx }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: `repeat(${React.Children.count(children)}, 1fr)` },
      gap: spacing,
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default InputField;