import React from 'react';
import { 
  Grid, 
  Box, 
  Container, 
  Typography,
  Card,
  CardContent,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

// Main Dashboard Container with responsive max-width and optimized laptop layout
export const DashboardContainer = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: isLaptop ? '1600px' : '1400px', // Increased max width for laptops
        px: { 
            ml:300,
          xs: 2, 
          sm: 3, 
          md: 4, 
          lg: 6,   // Increased padding for better centering
          xl: 8    // More padding on XL screens
        },
        py: { 
          xs: 2, 
          sm: 3, 
          md: 3,   // Consistent vertical padding
          lg: 3    // Consistent on large screens
        },
        mx: 'auto',
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

// KPI Grid Section - Enhanced for desktop with larger cards
export const KPIGrid = ({ children, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Grid 
      container 
      spacing={{ 
        xs: 1.5, 
        sm: 2, 
        md: 2.5,
        lg: 2,    // Reduced spacing for better laptop density
        xl: 2.5   // Moderate spacing on XL screens
      }}
      sx={{ 
        mb: { 
          xs: 3, 
          sm: 4, 
          md: 3,
          lg: 2.5   // Reduced margin for laptop
        },
        justifyContent: 'flex-start',
        ...props.sx 
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Individual KPI Item - responsive grid sizing
export const KPIItem = ({ children, ...props }) => {
  return (
    <Grid 
      item 
      xs={6}    // Mobile: 2 cards per row
      sm={6}    // Small: 2 cards per row  
      md={3}    // Medium+: 4 cards per row
      lg={3}    // Large: 4 cards per row
      {...props}
    >
      {children}
    </Grid>
  );
};

// Analytics Section - Main charts area with enhanced desktop layout
export const AnalyticsSection = ({ children, title, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Box
      sx={{
        mb: { 
          xs: 3, 
          sm: 4, 
          md: 3,
          lg: 2.5,  // Reduced spacing for laptop
          xl: 3
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Analytics Grid for charts layout with enhanced desktop spacing
export const AnalyticsGrid = ({ children, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Grid 
      container 
      spacing={{ 
        xs: 2, 
        sm: 2.5, 
        md: 3,
        lg: 2,  // Reduced spacing for laptop charts
        xl: 3
      }}
      sx={{ 
        justifyContent: 'flex-start',
        ...props.sx 
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Primary Chart Item (larger charts)
export const PrimaryChartItem = ({ children, ...props }) => {
  return (
    <Grid 
      item 
      xs={12}   // Mobile: full width
      sm={12}   // Small: full width
      md={8}    // Medium+: 8 columns
      lg={8}    // Large: 8 columns
      xl={8}    // XL: 8 columns
      {...props}
    >
      {children}
    </Grid>
  );
};

// Secondary Chart Item (smaller charts/widgets)
export const SecondaryChartItem = ({ children, ...props }) => {
  return (
    <Grid 
      item 
      xs={12}   // Mobile: full width
      sm={12}   // Small: full width  
      md={4}    // Medium+: 4 columns
      lg={4}    // Large: 4 columns
      xl={4}    // XL: 4 columns
      {...props}
    >
      {children}
    </Grid>
  );
};

// Insights Section - Bottom row with revenue and actions
export const InsightsSection = ({ children, ...props }) => {
  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Insights Grid for bottom section
export const InsightsGrid = ({ children, ...props }) => {
  return (
    <Grid 
      container 
      spacing={{ xs: 2, sm: 2.5, md: 3 }}
      sx={{ 
        ...props.sx 
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Equal Split Item (50/50 layout for insights)
export const EqualSplitItem = ({ children, ...props }) => {
  return (
    <Grid 
      item 
      xs={12}   // Mobile: full width
      sm={12}   // Small: full width
      md={6}    // Medium+: 6 columns (50%)
      lg={6}    // Large: 6 columns (50%)
      xl={6}    // XL: 6 columns (50%)
      {...props}
    >
      {children}
    </Grid>
  );
};

// Mobile Quick Actions Container
export const MobileActionsSection = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  if (!isMobile) return null;
  
  return (
    <Box
      sx={{
        mb: 3,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

// Mobile Action Buttons Grid
export const MobileActionsGrid = ({ children, ...props }) => {
  return (
    <Grid 
      container 
      spacing={1.5}
      sx={{ 
        ...props.sx 
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Full Width Action Item for mobile
export const FullWidthActionItem = ({ children, ...props }) => {
  return (
    <Grid 
      item 
      xs={12}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Section Header Component with enhanced desktop typography
export const SectionHeader = ({ title, subtitle, sx, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Box
      sx={{
        mb: { 
          xs: 2, 
          sm: 3, 
          md: 2.5,
          lg: 2,    // Reduced spacing for laptop
          xl: 2.5
        },
        ...sx
      }}
      {...props}
    >
      {title && (
        <Typography 
          variant="h4" 
          fontWeight={700} 
          gutterBottom={!isLaptop}
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '1.875rem' }, // Moderate size on laptop
            lineHeight: isLaptop ? 1.1 : 1.2,
            mb: isLaptop ? 0.5 : 1  // Tighter spacing on laptop
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem', lg: '0.95rem' }, // Slightly smaller on laptop
            lineHeight: 1.4
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

// Laptop-optimized chart container with reduced height for density
export const LaptopChartContainer = ({ children, title, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  if (!isLaptop) {
    return children; // Return normal container on non-laptop screens
  }
  
  return (
    <Box
      sx={{
        height: '320px',  // Fixed height for laptop density
        display: 'flex',
        flexDirection: 'column',
        '& .recharts-wrapper': {
          maxHeight: '280px !important',
        },
        ...props.sx
      }}
      {...props}
    >
      {title && (
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: '1rem' }}>
          {title}
        </Typography>
      )}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

// Laptop-specific dense grid for maximum space utilization
export const LaptopDenseGrid = ({ children, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  return (
    <Grid
      container
      spacing={isLaptop ? 2 : 3}
      sx={{
        '& .MuiGrid-item': {
          ...(isLaptop && {
            paddingTop: '12px !important',
            paddingLeft: '12px !important'
          })
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Grid>
  );
};

// Enhanced Stats Card Component with larger desktop size
export const StatsCard = ({ title, value, icon, color = 'primary', trend, ...props }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const getColorScheme = () => {
    switch (color) {
      case 'success': return {
        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
        iconBg: 'rgba(76, 175, 80, 0.15)',
        iconColor: '#4CAF50'
      };
      case 'error': return {
        background: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)',
        iconBg: 'rgba(244, 67, 54, 0.15)',
        iconColor: '#F44336'
      };
      case 'warning': return {
        background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
        iconBg: 'rgba(255, 152, 0, 0.15)',
        iconColor: '#FF9800'
      };
      case 'info': return {
        background: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
        iconBg: 'rgba(33, 150, 243, 0.15)',
        iconColor: '#2196F3'
      };
      default: return {
        background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
        iconBg: 'rgba(25, 118, 210, 0.15)',
        iconColor: '#1976D2'
      };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <Card
      elevation={0}
      sx={{
        background: colorScheme.background,
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        height: isLaptop ? '130px' : '120px', // Moderate height for laptop
        minHeight: isLaptop ? '130px' : '120px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 32px rgba(0,0,0,0.15)`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        },
        ...props.sx
      }}
      {...props}
    >
      <CardContent 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
          p: isLaptop ? 2.5 : 2.5, // Consistent padding
          '&:last-child': { pb: isLaptop ? 2.5 : 2.5 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography 
            variant="body2" 
            sx={{
              opacity: 0.9,
              fontSize: isLaptop ? '0.85rem' : '0.8rem',
              fontWeight: 500
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                width: isLaptop ? 42 : 40,
                height: isLaptop ? 42 : 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              fontSize: isLaptop ? '1.95rem' : '1.875rem' // Moderate size for laptop
            }}
          >
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9,
                  fontSize: isLaptop ? '0.85rem' : '0.75rem'
                }}
              >
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default {
  DashboardContainer,
  KPIGrid,
  KPIItem,
  AnalyticsSection,
  AnalyticsGrid,
  PrimaryChartItem,
  SecondaryChartItem,
  InsightsSection,
  InsightsGrid,
  EqualSplitItem,
  MobileActionsSection,
  MobileActionsGrid,
  FullWidthActionItem,
  SectionHeader,
  LaptopChartContainer,
  LaptopDenseGrid,
  StatsCard,
};