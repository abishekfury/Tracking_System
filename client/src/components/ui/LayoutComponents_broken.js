import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Typography,
  useTheme, 
  useMediaQuery 
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
        display=\"flex\" 
        justifyContent=\"space-between\" 
        alignItems=\"flex-start\" 
        flexWrap=\"wrap\" 
        gap={2}
      >
        <Box flex={1}>
          {breadcrumbs}
          <Typography 
            variant=\"h3\" 
            component=\"h1\" 
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
              variant=\"body1\" 
              color=\"text.secondary\"
              sx={{ maxWidth: '600px' }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box display=\"flex\" gap={1} alignItems=\"center\">
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
  
  return (
    <Grid item xs={12} sm={6} md={3} {...props}>
      <Card
        sx={{
          p: 3,
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s ease-in-out',
          '&:hover': onClick ? {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
          } : {},
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box display=\"flex\" alignItems=\"center\" justifyContent=\"space-between\" mb={2}>
            <Typography 
              variant=\"h6\" 
              color=\"text.secondary\" 
              sx={{ fontSize: '0.875rem', fontWeight: 500 }}
            >
              {title}
            </Typography>
            {icon && (
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {icon}
              </Box>
            )}
          </Box>
          
          <Typography 
            variant=\"h3\" 
            component=\"div\" 
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {loading ? '...' : value}
          </Typography>
          
          {change && (
            <Typography 
              variant=\"body2\" 
              sx={{ 
                color: getChangeColor(),
                fontWeight: 500,
                fontSize: '0.75rem'
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
          display=\"flex\" 
          justifyContent=\"space-between\" 
          alignItems=\"flex-start\" 
          mb={3}
        >
          <Box>
            {title && (
              <Typography 
                variant=\"h5\" 
                gutterBottom 
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant=\"body2\" color=\"text.secondary\">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && (
            <Box display=\"flex\" gap={1}>
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
            display=\"flex\" 
            justifyContent=\"space-between\" 
            alignItems=\"flex-start\"
          >
            <Box>
              {title && (
                <Typography 
                  variant=\"h6\" 
                  gutterBottom 
                  sx={{ fontWeight: 600 }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant=\"body2\" color=\"text.secondary\">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions && (
              <Box display=\"flex\" gap={1}>
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
  return (
    <Grid item xs={xs} sm={sm} md={md} lg={lg} xl={xl} {...props}>
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
        variant=\"h6\" 
        gutterBottom 
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant=\"body2\" 
          color=\"text.secondary\" 
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