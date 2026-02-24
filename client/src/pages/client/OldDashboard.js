import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Alert,
  Skeleton,
  LinearProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  FitnessCenter as FitnessCenterIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  StatsCard, 
  DashboardCard, 
  PrimaryButton,
  AreaChartComponent,
  LineChartComponent,
} from '../../components/ui';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAttendance: 0,
    thisMonthAttendance: 0,
    attendanceRate: 0,
    paymentStatus: 'up-to-date',
    hasWorkoutPlan: false,
    nextPaymentDue: null,
  });
  const [loading, setLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [chartData, setChartData] = useState({
    attendance: [],
    progress: [],
  });
  const [error, setError] = useState('');
  const [todayWorkout, setTodayWorkout] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch client's data
      const [attendanceRes, paymentsRes, workoutRes] = await Promise.all([
        axios.get('/attendance/my-records', { params: { limit: 30 } }).catch(() => ({ data: { attendance: [] } })),
        axios.get('/payments/my-payments').catch(() => ({ data: { payments: [] } })),
        axios.get('/workouts/my-plan').catch(() => ({ data: { success: false, workout: null } }))
      ]);

      const attendance = attendanceRes.data.attendance || [];
      const payments = paymentsRes.data.payments || [];
      const workout = workoutRes.data.workout;

      // Calculate stats
      const totalAttendance = attendance.length;
      
      // Calculate this month's attendance
      const currentMonth = new Date().toISOString().slice(0, 7);
      const thisMonthAttendance = attendance.filter(record => 
        record.date && record.date.slice(0, 7) === currentMonth
      ).length;

      // Calculate attendance rate (assuming 30 days in a month, expected 20 visits)
      const expectedMonthlyVisits = 20;
      const attendanceRate = Math.round((thisMonthAttendance / expectedMonthlyVisits) * 100);

      // Check payment status for current month
      const currentMonthPayment = payments.find(payment => 
        payment.paymentMonth === currentMonth
      );
      const paymentStatus = currentMonthPayment ? 
        (currentMonthPayment.status === 'paid' ? 'up-to-date' : 'pending') : 
        'pending';

      // Calculate next payment due date
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextPaymentDue = nextMonth.toLocaleDateString();

      setStats({
        totalAttendance,
        thisMonthAttendance,
        attendanceRate: Math.min(attendanceRate, 100),
        paymentStatus,
        hasWorkoutPlan: Boolean(workout),
        nextPaymentDue,
      });

      setRecentAttendance(attendance.slice(0, 5));
      generateChartData(attendance);
      
      if (workout) {
        setTodayWorkout(workout);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set mock data for development
      setStats({
        totalAttendance: 45,
        thisMonthAttendance: 12,
        attendanceRate: 60,
        paymentStatus: 'up-to-date',
        hasWorkoutPlan: true,
        nextPaymentDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      });
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (attendance) => {
    // Generate last 30 days attendance data
    const attendanceData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAttended = attendance.some(record => 
        record.date && record.date.split('T')[0] === dateStr
      );
      
      attendanceData.push({
        date: date.getDate(),
        attended: dayAttended ? 1 : 0
      });
    }

    // Generate progress data (mock for now)
    const progressData = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i += 5) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      progressData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: 70 + Math.sin(i / 5) * 2 + Math.random() * 1 - 0.5,
      });
    }

    setChartData({
      attendance: attendanceData,
      progress: progressData,
    });
  };

  const generateMockData = () => {
    // Mock chart data for development
    const attendanceData = Array.from({ length: 30 }, (_, i) => ({
      date: i + 1,
      attended: Math.random() > 0.4 ? 1 : 0,
    }));

    const progressData = [
      { date: 'Jan 1', weight: 70.5 },
      { date: 'Jan 6', weight: 70.2 },
      { date: 'Jan 11', weight: 69.8 },
      { date: 'Jan 16', weight: 69.5 },
      { date: 'Jan 21', weight: 69.3 },
      { date: 'Jan 26', weight: 69.0 },
    ];

    setChartData({
      attendance: attendanceData,
      progress: progressData,
    });

    // Mock recent attendance
    setRecentAttendance([
      { id: 1, date: '2024-01-30T10:30:00Z', checkInTime: '10:30 AM' },
      { id: 2, date: '2024-01-28T14:15:00Z', checkInTime: '2:15 PM' },
      { id: 3, date: '2024-01-26T09:45:00Z', checkInTime: '9:45 AM' },
      { id: 4, date: '2024-01-24T16:20:00Z', checkInTime: '4:20 PM' },
      { id: 5, date: '2024-01-22T11:00:00Z', checkInTime: '11:00 AM' },
    ]);

    // Mock today's workout
    setTodayWorkout({
      name: 'Upper Body Strength',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 12 },
        { name: 'Pull-ups', sets: 3, reps: 8 },
        { name: 'Shoulder Press', sets: 3, reps: 10 },
      ],
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'up-to-date': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getAttendanceRateColor = (rate) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'error';
  };

  if (error && !loading) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.name || user?.username || 'Member'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your fitness progress and gym activity overview.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
          <StatsCard
            title="Total Check-ins"
            value={loading ? <Skeleton width={60} /> : stats.totalAttendance}
            icon={<EventNoteIcon />}
            color="primary"
            trend={{
              direction: 'up',
              value: `${stats.thisMonthAttendance} this month`,
              icon: <TrendingUpIcon fontSize="small" />
            }}
            onClick={() => navigate('/client/attendance')}
          />
        </Grid>
        
        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
          <StatsCard
            title="Attendance Rate"
            value={loading ? <Skeleton width={60} /> : `${stats.attendanceRate}%`}
            icon={<TrendingUpIcon />}
            color={getAttendanceRateColor(stats.attendanceRate)}
            trend={{
              direction: stats.attendanceRate >= 70 ? 'up' : 'down',
              value: stats.attendanceRate >= 70 ? 'Great job!' : 'Keep going!',
              icon: <TrendingUpIcon fontSize="small" />
            }}
          />
        </Grid>
        
        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
          <StatsCard
            title="Payment Status"
            value={loading ? <Skeleton width={80} /> : stats.paymentStatus.replace('-', ' ')}
            icon={<PaymentIcon />}
            color={getPaymentStatusColor(stats.paymentStatus)}
            trend={{
              direction: 'neutral',
              value: `Due: ${stats.nextPaymentDue}`,
              icon: <ScheduleIcon fontSize="small" />
            }}
            onClick={() => navigate('/client/payments')}
          />
        </Grid>
        
        <Grid size={{ xs: 6, sm: 6, md: 3, lg: 3 }}>
          <StatsCard
            title="Workout Plan"
            value={loading ? <Skeleton width={60} /> : (stats.hasWorkoutPlan ? 'Active' : 'None')}
            icon={<FitnessCenterIcon />}
            color={stats.hasWorkoutPlan ? 'success' : 'error'}
            trend={{
              direction: stats.hasWorkoutPlan ? 'up' : 'down',
              value: stats.hasWorkoutPlan ? 'Ready to go!' : 'Contact trainer',
              icon: stats.hasWorkoutPlan ? <CheckCircleIcon fontSize="small" /> : <WarningIcon fontSize="small" />
            }}
            onClick={() => navigate('/client/workout')}
          />
        </Grid>
      </Grid>

      {/* Charts and Activity Section */}
      <Grid container spacing={{ xs: 2, sm: 3 }} mb={{ xs: 3, sm: 4 }}>
        <Grid size={{ xs: 12, md: 8, lg: 8, xl: 8 }}>
          <AreaChartComponent
            title="30-Day Attendance Pattern"
            data={chartData.attendance}
            xKey="date"
            yKey="attended"
            color="#1565c0"
            labelFormatter={(value) => `Day ${value}`}
            valueFormatter={(value) => value ? 'Attended' : 'Missed'}
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 4, lg: 4, xl: 4 }}>
          <DashboardCard title="This Month's Progress" sx={{ height: 400 }}>
            {loading ? (
              <Box>
                {[1,2,3].map((i) => (
                  <Box key={i} mb={3}>
                    <Skeleton variant="text" width="80%" />
                    <LinearProgress sx={{ my: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Attendance Goal
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={stats.attendanceRate} 
                    color={getAttendanceRateColor(stats.attendanceRate)}
                    sx={{ height: 8, borderRadius: 4, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stats.thisMonthAttendance}/20 sessions this month
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Status
                  </Typography>
                  <Chip
                    label={stats.paymentStatus.replace('-', ' ').toUpperCase()}
                    color={getPaymentStatusColor(stats.paymentStatus)}
                    size="small"
                    icon={stats.paymentStatus === 'up-to-date' ? <CheckCircleIcon /> : <WarningIcon />}
                  />
                </Box>

                <Box mt={3} display="flex" gap={1} flexDirection="column">
                  <PrimaryButton
                    fullWidth
                    startIcon={<FitnessCenterIcon />}
                    onClick={() => navigate('/client/workout')}
                  >
                    View Workout Plan
                  </PrimaryButton>
                  <PrimaryButton
                    fullWidth
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={() => navigate('/client/progress')}
                  >
                    Upload Progress Photo
                  </PrimaryButton>
                </Box>
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6, lg: 6, xl: 6 }}>
          <DashboardCard title="Recent Check-ins">
            {loading ? (
              <Box>
                {[1,2,3,4].map((i) => (
                  <Box key={i} display="flex" alignItems="center" mb={2}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box flexGrow={1}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="60%" />
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <List dense>
                {recentAttendance.map((attendance) => (
                  <ListItem key={attendance.id} disablePadding>
                    <ListItemIcon>
                      <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                        <CheckCircleIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={new Date(attendance.date).toLocaleDateString()}
                      secondary={`Check-in: ${attendance.checkInTime || 'N/A'}`}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DashboardCard>
        </Grid>

        {/* Today's Workout */}
        <Grid size={{ xs: 12, md: 6, lg: 6, xl: 6 }}>
          <DashboardCard title="Today's Workout">
            {loading ? (
              <Box>
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 2 }} />
                {[1,2,3].map((i) => (
                  <Box key={i} mb={1}>
                    <Skeleton variant="text" width="80%" />
                  </Box>
                ))}
              </Box>
            ) : todayWorkout ? (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {todayWorkout.name}
                </Typography>
                <List dense>
                  {todayWorkout.exercises.slice(0, 4).map((exercise, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemIcon>
                        <FitnessCenterIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={exercise.name}
                        secondary={`${exercise.sets} sets × ${exercise.reps} reps`}
                        primaryTypographyProps={{ fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
                <PrimaryButton
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/client/workout')}
                >
                  View Full Workout
                </PrimaryButton>
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <WarningIcon color="action" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No workout plan assigned
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Contact your trainer to get a personalized workout plan
                </Typography>
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientDashboard;
     