import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton as MuiIconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  FitnessCenter as FitnessCenterIcon,
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircleOutline as CheckIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// ── Styled Components ──────────────────────────────────────────────────────────

const PageWrapper = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
});

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 45%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: theme.spacing(8, 7),
  background: 'linear-gradient(145deg, #4C1D95 0%, #6B46C1 45%, #7C3AED 100%)',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: { display: 'none' },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-15%',
    left: '-5%',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(6, 4),
  background: theme.palette.background.default,
  overflowY: 'auto',
}));

const FormCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  padding: theme.spacing(5),
  borderRadius: 20,
  boxShadow: '0 4px 32px rgba(107,70,193,0.10)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.10)}`,
  background: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: alpha(theme.palette.primary.main, 0.03),
    '& fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.primary.main, 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  },
}));

const SignInButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '14px 24px',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: '#fff',
  background: 'linear-gradient(135deg, #6B46C1 0%, #7C3AED 100%)',
  boxShadow: '0 4px 16px rgba(107,70,193,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all 0.2s ease',
  '&:hover:not(:disabled)': {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px rgba(107,70,193,0.45)',
  },
  '&:active:not(:disabled)': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
}));

const BulletItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

// ── Component ──────────────────────────────────────────────────────────────────

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { login, isAuthenticated, isTrainer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    navigate(isTrainer ? '/trainer' : '/client', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const from = location.state?.from?.pathname || (isTrainer ? '/trainer' : '/client');
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bullets = [
    'Manage clients & track attendance',
    'Assign workout & diet plans',
    'Monitor payments & progress',
  ];

  return (
    <PageWrapper>
      {/* ── Left Branding Panel ── */}
      <LeftPanel>
        <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Logo */}
          <Box display="flex" alignItems="center" gap={1.5} mb={7}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', width: 48, height: 48 }}>
              <FitnessCenterIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="#fff" letterSpacing={0.5}>
              FitTrack Pro
            </Typography>
          </Box>

          {/* Headline */}
          <Typography
            variant="h2"
            fontWeight={800}
            color="#fff"
            lineHeight={1.15}
            sx={{ mb: 3, fontSize: { md: '2.4rem', lg: '3rem' } }}
          >
            Your Gym,<br />
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.75)' }}>
              Smarter.
            </Box>
          </Typography>

          <Typography
            variant="body1"
            color="rgba(255,255,255,0.72)"
            sx={{ mb: 5, lineHeight: 1.7, maxWidth: 340 }}
          >
            A modern platform built for fitness professionals to manage
            every aspect of their gym in one place.
          </Typography>

          {/* Bullet features */}
          {bullets.map((item, i) => (
            <BulletItem key={i}>
              <CheckIcon sx={{ color: '#A78BFA', fontSize: 20, flexShrink: 0 }} />
              <Typography variant="body2" color="rgba(255,255,255,0.85)" fontWeight={500}>
                {item}
              </Typography>
            </BulletItem>
          ))}

          {/* Bottom stat chips */}
          <Box display="flex" gap={1.5} mt={7} flexWrap="wrap">
            {[
              { label: 'Active Clients', value: '500+' },
              { label: 'Uptime', value: '99.9%' },
              { label: 'Secure', value: 'JWT Auth' },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" display="block" color="rgba(255,255,255,0.55)" fontSize={11}>
                  {s.label}
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#fff" fontSize={13}>
                  {s.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </LeftPanel>

      {/* ── Right Form Panel ── */}
      <RightPanel>
        {/* Mobile logo */}
        {isMobile && (
          <Box display="flex" alignItems="center" gap={1} mb={4}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
              <FitnessCenterIcon sx={{ fontSize: 22 }} />
            </Avatar>
            <Typography variant="h6" fontWeight={700} color="primary">
              FitTrack Pro
            </Typography>
          </Box>
        )}

        <FormCard elevation={0}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
              Welcome back 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2, fontSize: '0.875rem' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box mb={2.5}>
              <StyledTextField
                fullWidth
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                autoFocus
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box mb={3.5}>
              <StyledTextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                size="medium"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <MuiIconButton
                        size="small"
                        onClick={() => setShowPassword(p => !p)}
                        edge="end"
                      >
                        {showPassword
                          ? <VisibilityOff sx={{ fontSize: 18, color: 'text.disabled' }} />
                          : <Visibility sx={{ fontSize: 18, color: 'text.disabled' }} />
                        }
                      </MuiIconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <SignInButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <CircularProgress size={18} sx={{ color: '#fff' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowIcon sx={{ fontSize: 18 }} />
                </>
              )}
            </SignInButton>
          </Box>

          {/* Footer link */}
          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Need help?{' '}
              <Link
                to="/"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Go to Home
              </Link>
            </Typography>
          </Box>

          {/* Demo credentials */}
          {process.env.NODE_ENV === 'development' && (
            <Box
              mt={3}
              p={2}
              sx={{
                borderRadius: 2,
                background: alpha(theme.palette.primary.main, 0.06),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <Typography
                variant="caption"
                display="block"
                fontWeight={700}
                color="primary.main"
                mb={0.5}
              >
                🔑 Demo Credentials
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <b>Trainer:</b> trainer@gymtracker.com / trainer123
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <b>Client:</b> client@gymtracker.com / client123
              </Typography>
            </Box>
          )}
        </FormCard>

        {/* Trust badges */}
        <Box display="flex" gap={1} mt={4} flexWrap="wrap" justifyContent="center">
          {['Secure Login', 'Role-Based Access', 'Data Protected'].map((badge) => (
            <Chip
              key={badge}
              label={badge}
              size="small"
              variant="outlined"
              sx={{
                fontSize: 11,
                color: 'text.secondary',
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />
          ))}
        </Box>
      </RightPanel>
    </PageWrapper>
  );
};

export default Login;
