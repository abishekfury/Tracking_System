import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  EventNote as AttendanceIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { formatDate, formatNumber } from '../../utils/formatters';
import {
  DashboardContainer,
  PageHeader,
  StatsGrid,
  StatCard,
  ContentSection,
  ProfessionalCard,
} from '../../components/ui/LayoutComponents';

const MyAttendance = () => {
  const theme = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      const [attendanceRes, statsRes] = await Promise.all([
        axios.get('/attendance/my-records', {
          params: {
            startDate: `${currentMonth}-01`,
            endDate: `${currentMonth}-31`,
            limit: 50
          }
        }),
        axios.get('/attendance/stats/my-stats', {
          params: {
            month: currentMonth.split('-')[1],
            year: currentMonth.split('-')[0]
          }
        }).catch(() => ({ data: { success: false } }))
      ]);

      setAttendance(attendanceRes.data.attendance || []);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  const getAttendanceStreak = () => {
    if (!attendance.length) return 0;
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < attendance.length; i++) {
      const attendanceDate = new Date(attendance[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (attendanceDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const calculateMonthlyPercentage = () => {
    const daysInMonth = new Date(
      parseInt(currentMonth.split('-')[0]),
      parseInt(currentMonth.split('-')[1]),
      0
    ).getDate();
    const attendanceDays = attendance.length;
    return Math.round((attendanceDays / daysInMonth) * 100);
  };

  if (error) {
    return (
      <DashboardContainer>
        <PageHeader title="My Attendance" subtitle="Track your gym attendance and progress" />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageHeader 
        title="My Attendance" 
        subtitle="Track your gym attendance and maintain consistency"
        actions={
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              label="Select Month"
            >
              {getMonthOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard
          title="Monthly Attendance"
          value={loading ? <Skeleton width={40} /> : attendance.length}
          change="gym visits this month"
          changeType="positive"
          icon={<AttendanceIcon />}
        />
        <StatCard
          title="Current Streak"
          value={loading ? <Skeleton width={50} /> : `${getAttendanceStreak()} days`}
          change="consecutive days"
          changeType="positive"
          icon={<TrendingIcon />}
        />
        <StatCard
          title="Monthly Rate"
          value={loading ? <Skeleton width={60} /> : `${calculateMonthlyPercentage()}%`}
          change="attendance percentage"
          changeType="positive"
          icon={<CalendarIcon />}
        />
        <StatCard
          title="Average Duration"
          value={
            loading ? (
              <Skeleton width={60} />
            ) : (
              formatDuration(
                attendance.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 
                (attendance.length || 1)
              )
            )
          }
          change="per session"
          changeType="neutral"
          icon={<TimeIcon />}
        />
      </StatsGrid>

      {/* Attendance Records */}
      <ContentSection title="Attendance Records">
        <ProfessionalCard>
          {loading ? (
            <Box p={3}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : attendance.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={8}
            >
              <AttendanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No attendance records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start visiting the gym to track your attendance
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow 
                      key={record._id || record.date}
                      sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(record.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : 'Active'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(record.duration)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={record.checkOut ? 'Completed' : 'Active'}
                          color={record.checkOut ? 'success' : 'primary'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </ProfessionalCard>
      </ContentSection>
    </DashboardContainer>
  );
};

export default MyAttendance;
                  