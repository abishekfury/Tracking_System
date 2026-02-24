import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Typography,
  useTheme, 
  useMediaQuery,
  alpha
} from '@mui/material';

// Professional Dashboard Container
export const DashboardContainer = ({ children, maxWidth = 'xl', ...props }) => {
  const theme = useTheme();
  
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

// Page Header Component
export const PageHeader = ({ 
  title, 
  subtitle, 
  actions,
  breadcrumbs,
  sx, 
  ...props 
}) => {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        pb: 3,
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        ...sx 
      }} 
      {...props}
    >
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="flex-start" 
        flexWrap="wrap" 
        gap={2}
      >
        <Box flex={1}>
          {breadcrumbs}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: 'text.primary',
              fontWeight: 700,
              mt: breadcrumbs ? 1 : 0
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: '600px' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box display="flex" gap={1} alignItems="center">
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Statistics Grid
export const StatsGrid = ({ children, ...props }) => {
  return (
    <Grid 
      container 
      spacing={{ xs: 2, sm: 3, md: 3 }}
      sx={{ mb: 4, ...props.sx }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Statistics Card
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  color = 'primary',
  icon, 
  onClick,
  loading = false,
  ...props 
}) => {
  const theme = useTheme();
  
  const getChangeColor = () => {
    if (changeType === 'positive') return theme.palette.success.main;
    if (changeType === 'negative') return theme.palette.error.main;
    return theme.palette.text.secondary;
  };
  
  const getIconColor = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'secondary': return theme.palette.secondary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };
  
  const getIconDarkColor = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.dark;
      case 'secondary': return theme.palette.secondary.dark;
      case 'success': return theme.palette.success.dark;
      case 'warning': return theme.palette.warning.dark;
      case 'error': return theme.palette.error.dark;
      case 'info': return theme.palette.info.dark;
      default: return theme.palette.primary.dark;
    }
  };
  
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }} {...props}>
      <Card
        sx={{
          p: 4,
          height: '100%',
          minHeight: 180,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease-in-out',
          border: `1px solid ${alpha(getIconColor(), 0.1)}`,
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[12],
            borderColor: alpha(getIconColor(), 0.3),
          } : {},
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            {icon && (
              <Box 
                sx={{ 
                  p: 1.5,
                  borderRadius: 2.5, 
                  background: `linear-gradient(135deg, ${getIconColor()}, ${getIconDarkColor()})`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 48,
                  minHeight: 48,
                  boxShadow: `0 4px 12px ${alpha(getIconColor(), 0.3)}`
                }}
              >
                {React.cloneElement(icon, { fontSize: 'medium' })}
              </Box>
            )}
          </Box>
          
          <Typography 
            variant="h2"
            component="div" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              fontSize: '2.5rem',
              lineHeight: 1.1,
              color: theme.palette.text.primary
            }}
          >
            {loading ? '...' : value}
          </Typography>
          
          {change && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: getChangeColor(),
                fontWeight: 600,
                fontSize: '0.875rem',
                letterSpacing: '0.25px'
              }}
            >
              {change}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};
        
// Content Section
export const ContentSection = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  sx, 
  ...props 
}) => {
  return (
    <Box sx={{ mb: 4, ...sx }} {...props}>
      {(title || subtitle || actions) && (
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start" 
          mb={3}
        >
          <Box>
            {title && (
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box display="flex" gap={1}>
              {actions}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

// Professional Card
export const ProfessionalCard = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  sx,
  ...props 
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        ...sx 
      }} 
      {...props}
    >
      {(title || subtitle || actions) && (
        <CardContent sx={{ pb: 2 }}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="flex-start"
          >
            <Box>
              {title && (
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ fontWeight: 600 }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box display="flex" gap={1}>
                {actions}
              </Box>
            )}
          </Box>
        </CardContent>
      )}
      <CardContent sx={{ pt: (title || subtitle || actions) ? 0 : 3 }}>
        {children}
      </CardContent>
    </Card>
  );
};

// Quick Actions Bar
export const QuickActions = ({ actions, sx, ...props }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        mb: 4,
        ...sx 
      }} 
      {...props}
    >
      {actions}
    </Box>
  );
};

// Responsive Grid
export const ResponsiveGrid = ({ children, spacing = 3, ...props }) => {
  return (
    <Grid container spacing={spacing} {...props}>
      {children}
    </Grid>
  );
};

// Grid Item Helper
export const GridItem = ({ xs = 12, sm, md, lg, xl, children, ...props }) => {
  // Build the size object for Grid v2
  const size = { xs };
  if (sm !== undefined) size.sm = sm;
  if (md !== undefined) size.md = md;
  if (lg !== undefined) size.lg = lg;
  if (xl !== undefined) size.xl = xl;

  return (
    <Grid size={size} {...props}>
      {children}
    </Grid>
  );
};

// Empty State
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  sx, 
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 4,
        ...sx
      }}
      {...props}
    >
      {icon && (
        <Box 
          sx={{ 
            mb: 3,
            p: 3,
            borderRadius: '50%',
            backgroundColor: 'grey.100',
            color: 'text.secondary'
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      
      {action}
    </Box>
  );
};

export default {
  DashboardContainer,
  PageHeader,
  StatsGrid,
  StatCard,
  ContentSection,
  ProfessionalCard,
  QuickActions,
  ResponsiveGrid,
  GridItem,
  EmptyState,
};