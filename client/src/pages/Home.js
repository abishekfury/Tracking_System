import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Avatar,
  Button,
  Chip,
  useTheme,
  Divider,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import {
  FitnessCenter as FitnessCenterIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  PhotoCamera as PhotoIcon,
  Restaurant as DietIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// ── Styled Components ──────────────────────────────────────────────────────────

const Navbar = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 5),
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2.5),
  },
}));

const NavButton = styled('button')(({ theme, variant: v }) => ({
  padding: '9px 22px',
  borderRadius: 10,
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: v === 'filled'
    ? 'none'
    : `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`,
  background: v === 'filled'
    ? 'linear-gradient(135deg, #6B46C1, #7C3AED)'
    : 'transparent',
  color: v === 'filled' ? '#fff' : theme.palette.primary.main,
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: v === 'filled'
      ? '0 4px 14px rgba(107,70,193,0.35)'
      : 'none',
    background: v === 'filled'
      ? 'linear-gradient(135deg, #5B3AAB, #6B2FD9)'
      : alpha(theme.palette.primary.main, 0.06),
  },
}));

const HeroBg = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: 'linear-gradient(150deg, #F0EAFB 0%, #EDE9FE 40%, #FAF5FF 100%)',
  position: 'relative',
  overflow: 'hidden',
  paddingTop: 80,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(107,70,193,0.12) 0%, transparent 70%)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
  },
}));

const StatPill = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 50,
  background: '#fff',
  boxShadow: '0 2px 12px rgba(107,70,193,0.12)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3.5),
  borderRadius: 18,
  background: '#fff',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.09)}`,
  boxShadow: '0 2px 16px rgba(107,70,193,0.07)',
  transition: 'all 0.25s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 28px rgba(107,70,193,0.14)',
    borderColor: alpha(theme.palette.primary.main, 0.22),
  },
}));

const IconWrap = styled(Box)(({ theme, color }) => ({
  width: 52,
  height: 52,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: color || alpha(theme.palette.primary.main, 0.1),
  marginBottom: theme.spacing(2),
}));

const CTASection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, #4C1D95 0%, #6B46C1 50%, #7C3AED 100%)',
  padding: theme.spacing(10, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -60,
    right: -60,
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
  },
}));

const Footer = styled(Box)(({ theme }) => ({
  background: '#0F172A',
  padding: theme.spacing(5, 0, 3),
}));

// ── Main Component ─────────────────────────────────────────────────────────────

const Home = () => {
  const { isAuthenticated, isTrainer, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const features = [
    {
      icon: PeopleIcon,
      title: 'Client Management',
      description: 'Manage detailed client profiles, membership types, and personal records in one place.',
      color: alpha('#6B46C1', 0.1),
      iconColor: '#6B46C1',
    },
    {
      icon: EventNoteIcon,
      title: 'Attendance Tracking',
      description: 'Mark daily attendance and get instant insights on client consistency and patterns.',
      color: alpha('#3B82F6', 0.1),
      iconColor: '#3B82F6',
    },
    {
      icon: PaymentIcon,
      title: 'Payment Management',
      description: 'Record dues, track payments, and view financial summaries with clean analytics.',
      color: alpha('#10B981', 0.1),
      iconColor: '#10B981',
    },
    {
      icon: AssignmentIcon,
      title: 'Workout Plans',
      description: 'Build and assign customized workout programs tailored to each client\'s goals.',
      color: alpha('#F59E0B', 0.1),
      iconColor: '#F59E0B',
    },
    {
      icon: DietIcon,
      title: 'Diet Plans',
      description: 'Create personalised nutrition plans and monitor dietary progress effortlessly.',
      color: alpha('#EC4899', 0.1),
      iconColor: '#EC4899',
    },
    {
      icon: PhotoIcon,
      title: 'Progress Photos',
      description: 'Upload and compare progress photos to visually track transformation journeys.',
      color: alpha('#8B5CF6', 0.1),
      iconColor: '#8B5CF6',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Members' },
    { value: '6', label: 'Core Modules' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Accessible' },
  ];

  // ── Logged-in redirect view ──
  if (isAuthenticated) {
    const dashboardPath = isTrainer ? '/trainer' : '/client';
    const userRole = isTrainer ? 'Trainer' : 'Client';
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(150deg, #F0EAFB 0%, #EDE9FE 40%, #FAF5FF 100%)',
        }}
      >
        <Box textAlign="center" px={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              margin: 'auto',
              mb: 3,
              boxShadow: '0 6px 24px rgba(107,70,193,0.35)',
            }}
          >
            <FitnessCenterIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            You're signed in as a {userRole}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Head to your dashboard to get started.
          </Typography>
          <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(dashboardPath)}
              startIcon={<DashboardIcon />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                boxShadow: '0 4px 14px rgba(107,70,193,0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(107,70,193,0.45)' },
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 600 }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Public Landing Page ──
  return (
    <Box sx={{ background: '#F8FAFC' }}>

      {/* ── Navbar ── */}
      <Navbar>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
            <FitnessCenterIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="subtitle1" fontWeight={700} color="primary.dark" letterSpacing={0.3}>
            FitTrack Pro
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} alignItems="center">
          <NavButton onClick={() => navigate('/login')}>Sign In</NavButton>
          <NavButton variant="filled" onClick={() => navigate('/login')}>Get Started</NavButton>
        </Box>
      </Navbar>

      {/* ── Hero ── */}
      <HeroBg>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="🏋️ Gym Management Platform"
                size="small"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: 12,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.dark',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
              <Typography
                variant="h1"
                fontWeight={900}
                color="text.primary"
                lineHeight={1.1}
                sx={{ fontSize: { xs: '2.6rem', sm: '3.4rem', md: '3.8rem' }, mb: 2.5 }}
              >
                Manage Your{' '}
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Gym Smarter
                </Box>
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                fontWeight={400}
                lineHeight={1.7}
                sx={{ mb: 5, maxWidth: 480 }}
              >
                FitTrack Pro brings clients, attendance, payments, workout plans,
                and progress tracking into one clean, professional platform.
              </Typography>

              <Box display="flex" gap={2} flexWrap="wrap" mb={5}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                    boxShadow: '0 4px 18px rgba(107,70,193,0.35)',
                    '&:hover': {
                      boxShadow: '0 6px 24px rgba(107,70,193,0.45)',
                      background: 'linear-gradient(135deg, #5B3AAB, #6B2FD9)',
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: alpha(theme.palette.primary.main, 0.35),
                    color: 'primary.main',
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                  }}
                >
                  Explore Features
                </Button>
              </Box>

              {/* Trust indicators */}
              <Box display="flex" gap={2.5} flexWrap="wrap">
                {['No setup fee', 'Secure & private', 'Role-based access'].map(t => (
                  <Box key={t} display="flex" alignItems="center" gap={0.7}>
                    <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {t}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Hero visual */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {/* Central card */}
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 380,
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 24px 64px rgba(107,70,193,0.18)',
                    background: '#fff',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  }}
                >
                  {/* Card header */}
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                      px: 3,
                      py: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                      <DashboardIcon sx={{ color: '#fff', fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700} color="#fff">
                        Trainer Dashboard
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Overview — Today
                      </Typography>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box sx={{ px: 3, py: 2.5 }}>
                    <Grid container spacing={1.5}>
                      {[
                        { label: 'Total Clients', value: '24', color: '#6B46C1' },
                        { label: 'Present Today', value: '18', color: '#10B981' },
                        { label: 'Due Payments', value: '3', color: '#F59E0B' },
                        { label: 'Active Plans', value: '21', color: '#3B82F6' },
                      ].map(s => (
                        <Grid size={{ xs: 6 }} key={s.label}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              background: alpha(s.color, 0.07),
                              border: `1px solid ${alpha(s.color, 0.12)}`,
                            }}
                          >
                            <Typography variant="h6" fontWeight={800} sx={{ color: s.color, lineHeight: 1 }}>
                              {s.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize={11}>
                              {s.label}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Recent activity list */}
                    {[
                      { name: 'Alice Johnson', action: 'Checked in', time: '9:02 AM' },
                      { name: 'Bob Smith', action: 'Payment received', time: '8:45 AM' },
                      { name: 'Carol White', action: 'Plan updated', time: '8:30 AM' },
                    ].map((a, i) => (
                      <Box key={i} display="flex" alignItems="center" justifyContent="space-between" mb={1.2}>
                        <Box display="flex" alignItems="center" gap={1.2}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              color: 'primary.main',
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {a.name[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" fontWeight={600} display="block" lineHeight={1.2}>
                              {a.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize={11}>
                              {a.action}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="caption" color="text.disabled" fontSize={11}>
                          {a.time}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Floating stat pills */}
                <StatPill sx={{ position: 'absolute', top: '8%', right: '-4%' }}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <Typography variant="caption" fontWeight={700} color="text.primary">+12% this month</Typography>
                </StatPill>
                <StatPill sx={{ position: 'absolute', bottom: '12%', left: '-6%' }}>
                  <SecurityIcon sx={{ fontSize: 16, color: '#6B46C1' }} />
                  <Typography variant="caption" fontWeight={700} color="text.primary">Secure & Encrypted</Typography>
                </StatPill>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </HeroBg>

      {/* ── Stats Bar ── */}
      <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
        <Container maxWidth="lg">
          <Grid container>
            {stats.map((s, i) => (
              <Grid size={{ xs: 6, sm: 3 }} key={i}>
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                    borderRight: i < 3 ? `1px solid ${alpha(theme.palette.primary.main, 0.08)}` : 'none',
                  }}
                >
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box id="features" sx={{ bgcolor: '#F8FAFC', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={7}>
            <Chip
              label="Everything You Need"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 600,
                fontSize: 12,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.dark',
              }}
            />
            <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
              All-in-One Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', lineHeight: 1.7 }}>
              Six powerful modules covering every part of your gym operations,
              from client onboarding to payment tracking.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <FeatureCard>
                    <IconWrap color={f.color}>
                      <Icon sx={{ fontSize: 26, color: f.iconColor }} />
                    </IconWrap>
                    <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.65}>
                      {f.description}
                    </Typography>
                  </FeatureCard>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── Role Split ── */}
      <Box sx={{ bgcolor: '#fff', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="Two Roles, One Platform"
                size="small"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.dark',
                }}
              />
              <Typography variant="h3" fontWeight={800} color="text.primary" gutterBottom>
                Built for Trainers &amp; Clients
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7} sx={{ mb: 4 }}>
                Trainers get full control — manage clients, create plans, and track
                payments. Clients get a clean personal view of their journey.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                endIcon={<ArrowIcon />}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6B46C1, #7C3AED)',
                  boxShadow: '0 4px 14px rgba(107,70,193,0.30)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(107,70,193,0.40)' },
                }}
              >
                Sign In Now
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2.5}>
                {[
                  {
                    role: 'Trainer',
                    color: '#6B46C1',
                    bg: alpha('#6B46C1', 0.06),
                    perks: ['Add & manage clients', 'Assign workout & diet plans', 'Track attendance & payments', 'View progress photos'],
                  },
                  {
                    role: 'Client',
                    color: '#3B82F6',
                    bg: alpha('#3B82F6', 0.06),
                    perks: ['View personal dashboard', 'See workout & diet plans', 'Track attendance history', 'Upload progress photos'],
                  },
                ].map(r => (
                  <Grid size={{ xs: 12, sm: 6 }} key={r.role}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: r.bg,
                        border: `1px solid ${alpha(r.color, 0.15)}`,
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: r.color, mb: 2 }}>
                        {r.role}
                      </Typography>
                      {r.perks.map(p => (
                        <Box key={p} display="flex" alignItems="flex-start" gap={1} mb={1}>
                          <CheckIcon sx={{ fontSize: 16, color: r.color, mt: '2px', flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary">{p}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── CTA ── */}
      <CTASection>
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} color="#fff" gutterBottom>
            Ready to Transform Your Gym?
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 5, lineHeight: 1.7, maxWidth: 480, mx: 'auto' }}>
            Get started today with FitTrack Pro and bring every part
            of your fitness business together in one place.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/login')}
            startIcon={<LoginIcon />}
            sx={{
              borderRadius: 2,
              px: 6,
              py: 1.8,
              fontSize: '1.05rem',
              fontWeight: 700,
              background: '#fff',
              color: '#6B46C1',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              '&:hover': {
                background: '#F3F0FF',
                boxShadow: '0 6px 28px rgba(0,0,0,0.2)',
              },
            }}
          >
            Get Started — It's Free
          </Button>
        </Container>
      </CTASection>

      {/* ── Footer ── */}
      <Footer>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
            <Box display="flex" alignItems="center" gap={1.2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                <FitnessCenterIcon sx={{ fontSize: 17 }} />
              </Avatar>
              <Typography variant="subtitle2" fontWeight={700} color="#fff">
                FitTrack Pro
              </Typography>
            </Box>
            <Typography variant="caption" color="rgba(255,255,255,0.4)">
              © {new Date().getFullYear()} FitTrack Pro. All rights reserved.
            </Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
          <Typography variant="caption" color="rgba(255,255,255,0.3)" display="block" textAlign="center">
            Built with React · Node.js · MongoDB · Material UI
          </Typography>
        </Container>
      </Footer>
    </Box>
  );
};

export default Home;
