import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Alert,
  Skeleton,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  DashboardContainer,
  PageHeader,
  StatsGrid,
  StatCard,
  ContentSection,
  ProfessionalCard,
  QuickActions,
  ResponsiveGrid,
  GridItem,
} from '../../components/ui/LayoutComponents';

// Chart components (you'll need to create these)
const LineChart = ({ data, title }) => (
  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color=\"text.secondary\">{title} Chart Placeholder</Typography>
  </Box>
);

const PieChart = ({ data, title }) => (
  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color=\"text.secondary\">{title} Chart Placeholder</Typography>
  </Box>
);

const BarChart = ({ data, title }) => (
  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography color=\"text.secondary\">{title} Chart Placeholder</Typography>
  </Box>
);

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    todayAttendance: 0,
    monthlyRevenue: 0,
  });
  const [chartData, setChartData] = useState({
    attendance: [],
    revenue: [],
    clientStatus: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all required data
      const [clientsResponse, attendanceResponse, paymentsResponse] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/attendance'),
        axios.get('/api/payments/revenue'),
      ]);

      const clients = clientsResponse.data;
      const attendance = attendanceResponse.data;
      const revenue = paymentsResponse.data;

      // Calculate stats
      const totalClients = clients.length;
      const activeClients = clients.filter(client => client.isActive).length;
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(
        record => record.date && record.date.split('T')[0] === today
      ).length;

      // Current month revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthRevenue = revenue.find(r => r._id === currentMonth);
      const monthlyRevenue = currentMonthRevenue?.totalAmount || 0;

      setStats({
        totalClients,
        activeClients,
        todayAttendance,
        monthlyRevenue,
      });

      // Generate chart data
      generateChartData(attendance, revenue, clients);
      generateRecentActivity(clients, attendance);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set mock data for development
      setStats({
        totalClients: 45,
        activeClients: 38,
        todayAttendance: 22,
        monthlyRevenue: 12500,
      });
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (attendance, revenue, clients) => {
    // Generate attendance trend (last 7 days)
    const attendanceData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayAttendance = attendance.filter(record => 
        record.date && record.date.split('T')[0] === dateStr
      ).length;
      
      attendanceData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        attendance: dayAttendance,
      });
    }

    // Generate revenue data (last 6 months)
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);
      const monthRevenue = revenue.find(r => r._id === monthStr);
      
      revenueData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthRevenue?.totalAmount || 0,
      });
    }

    // Client status distribution
    const activeCount = clients.filter(c => c.isActive).length;
    const inactiveCount = clients.length - activeCount;
    
    const clientStatusData = [
      { name: 'Active', value: activeCount },
      { name: 'Inactive', value: inactiveCount },
    ];

    setChartData({
      attendance: attendanceData,
      revenue: revenueData,
      clientStatus: clientStatusData,
    });
  };

  const generateRecentActivity = (clients, attendance) => {
    const activities = [
      {
        id: 1,
        type: 'client',
        message: 'New client registration',
        detail: clients[0]?.name || 'John Doe',
        time: '2 hours ago',
      },
      {
        id: 2,
        type: 'attendance',
        message: 'Attendance marked',
        detail: '15 members checked in today',
        time: '3 hours ago',
      },
      {
        id: 3,
        type: 'payment',
        message: 'Payment received',
        detail: '$150 from membership fees',
        time: '5 hours ago',
      },
    ];
    
    setRecentActivity(activities);
  };

  const generateMockData = () => {
    const mockAttendance = [
      { date: 'Mon', attendance: 15 },
      { date: 'Tue', attendance: 18 },
      { date: 'Wed', attendance: 22 },
      { date: 'Thu', attendance: 20 },
      { date: 'Fri', attendance: 25 },
      { date: 'Sat', attendance: 30 },
      { date: 'Sun', attendance: 12 },
    ];

    const mockRevenue = [
      { month: 'Aug', revenue: 8500 },
      { month: 'Sep', revenue: 9200 },
      { month: 'Oct', revenue: 10800 },
      { month: 'Nov', revenue: 11500 },
      { month: 'Dec', revenue: 12200 },
      { month: 'Jan', revenue: 12500 },
    ];

    const mockClientStatus = [
      { name: 'Active', value: 38 },
      { name: 'Inactive', value: 7 },
    ];

    setChartData({
      attendance: mockAttendance,
      revenue: mockRevenue,
      clientStatus: mockClientStatus,
    });

    setRecentActivity([
      {
        id: 1,
        type: 'client',
        message: 'New client registration',
        detail: 'John Doe joined the gym',
        time: '2 hours ago',
      },
      {
        id: 2,
        type: 'attendance',
        message: 'Attendance marked',
        detail: '22 members checked in today',
        time: '3 hours ago',
      },
      {
        id: 3,
        type: 'payment',
        message: 'Payment received',
        detail: '$150 from Sarah Wilson',
        time: '5 hours ago',
      },
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Register a new gym member',
      icon: <PersonAddIcon />,
      action: () => navigate('/trainer/clients/add'),
      color: 'primary',
    },
    {
      title: 'Mark Attendance',
      description: 'Record daily attendance',
      icon: <EventNoteIcon />,
      action: () => navigate('/trainer/attendance'),
      color: 'success',
    },
    {
      title: 'View Reports',
      description: 'Generate performance reports',
      icon: <AssessmentIcon />,
      action: () => navigate('/trainer/reports'),
      color: 'info',
    },
  ];

  if (error) {
    return (
      <DashboardContainer>
        <Alert severity=\"error\" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant=\"contained\" onClick={fetchDashboardData}>
          Retry
        </Button>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Page Header */}
      <PageHeader
        title=\"Trainer Dashboard\"
        subtitle=\"Welcome back! Here's what's happening at your gym today.\"
        actions={
          <Button
            variant=\"contained\"
            startIcon={<AddIcon />}
            onClick={() => navigate('/trainer/clients/add')}
            sx={{ ml: 2 }}
          >
            Add Client
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard
          title=\"Total Clients\"
          value={loading ? <Skeleton width={60} /> : stats.totalClients}
          change=\"+5 this month\"
          changeType=\"positive\"
          icon={<PeopleIcon />}
          onClick={() => navigate('/trainer/clients')}
        />
        <StatCard
          title=\"Active Members\"
          value={loading ? <Skeleton width={60} /> : stats.activeClients}
          change={`${Math.round((stats.activeClients / stats.totalClients) * 100) || 0}% active`}
          changeType=\"positive\"
          icon={<TrendingUpIcon />}
        />
        <StatCard
          title=\"Today's Attendance\"
          value={loading ? <Skeleton width={60} /> : stats.todayAttendance}
          change=\"Good turnout\"
          changeType=\"positive\"
          icon={<EventNoteIcon />}
          onClick={() => navigate('/trainer/attendance')}
        />
        <StatCard
          title=\"Monthly Revenue\"
          value={loading ? <Skeleton width={80} /> : formatCurrency(stats.monthlyRevenue)}
          change=\"+8% from last month\"
          changeType=\"positive\"
          icon={<PaymentIcon />}
          onClick={() => navigate('/trainer/payments')}
        />
      </StatsGrid>

      {/* Quick Actions */}
      <ContentSection title=\"Quick Actions\">
        <QuickActions
          actions={quickActions.map((action) => (
            <Button
              key={action.title}
              variant=\"outlined\"
              startIcon={action.icon}
              onClick={action.action}
              sx={{ minWidth: 160 }}
            >
              {action.title}
            </Button>
          ))}
        />
      </ContentSection>

      {/* Charts Section */}
      <ResponsiveGrid spacing={3}>
        {/* Attendance Trend */}
        <GridItem xs={12} lg={8}>
          <ProfessionalCard title=\"Weekly Attendance Trend\">
            <LineChart data={chartData.attendance} title=\"Attendance\" />
          </ProfessionalCard>
        </GridItem>

        {/* Member Status */}
        <GridItem xs={12} lg={4}>
          <ProfessionalCard title=\"Member Status\">
            <PieChart data={chartData.clientStatus} title=\"Status\" />
          </ProfessionalCard>
        </GridItem>

        {/* Revenue Trend */}
        <GridItem xs={12} lg={8}>
          <ProfessionalCard title=\"Revenue Trend\">
            <BarChart data={chartData.revenue} title=\"Revenue\" />
          </ProfessionalCard>
        </GridItem>

        {/* Recent Activity */}
        <GridItem xs={12} lg={4}>
          <ProfessionalCard 
            title=\"Recent Activity\"
            subtitle=\"Latest updates and changes\"
          >
            <Box sx={{ mt: 2 }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                    <Skeleton variant=\"text\" width=\"80%\" />
                    <Skeleton variant=\"text\" width=\"60%\" />
                  </Box>
                ))
              ) : (
                recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant=\"body2\" fontWeight={600}>
                      {activity.message}
                    </Typography>
                    <Typography variant=\"caption\" color=\"text.secondary\">
                      {activity.detail} • {activity.time}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </ProfessionalCard>
        </GridItem>
      </ResponsiveGrid>
    </DashboardContainer>
  );
};

export default TrainerDashboard;