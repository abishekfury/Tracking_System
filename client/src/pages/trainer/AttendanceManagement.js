import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import {
  DashboardContainer,
  StatsGrid,
  StatCard,
  PrimaryButton,
  SecondaryButton,
  FormSection,
} from '../../components/ui';

const AttendanceManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [attendance, setAttendance] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const [stats, setStats] = useState({
    todayAttendance: 0,
    weeklyAttendance: 0,
    monthlyAttendance: 0
  });

  const [markForm, setMarkForm] = useState({
    clientId: '',
    date: new Date(),
    checkIn: '',
    checkOut: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [attendanceRes, clientsRes] = await Promise.all([
        axios.get('/attendance'),
        axios.get('/clients')
      ]);
      
      const attendanceData = attendanceRes.data.attendance || [];
      const clientsData = clientsRes.data.clients || [];
      
      setAttendance(attendanceData);
      setClients(clientsData);
      calculateStats(attendanceData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceData) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => 
      a.date.split('T')[0] === today
    ).length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyAttendance = attendanceData.filter(a => 
      new Date(a.date) >= oneWeekAgo
    ).length;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyAttendance = attendanceData.filter(a => 
      new Date(a.date) >= oneMonthAgo
    ).length;

    setStats({
      todayAttendance,
      weeklyAttendance,
      monthlyAttendance
    });
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!markForm.clientId) newErrors.clientId = 'Please select a client';
    if (!markForm.checkIn) newErrors.checkIn = 'Check-in time is required';
    if (markForm.checkIn && markForm.checkOut && markForm.checkOut <= markForm.checkIn) {
      newErrors.checkOut = 'Check-out must be after check-in time';
    }
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setError('');
      setFormErrors({});
      const attendanceData = {
        clientId: markForm.clientId,
        date: markForm.date.toISOString().split('T')[0],
        checkIn: markForm.checkIn,
        checkOut: markForm.checkOut,
        notes: markForm.notes
      };

      await axios.post('/attendance', attendanceData);
      
      setMarkForm({
        clientId: '',
        date: new Date(),
        checkIn: '',
        checkOut: '',
        notes: ''
      });
      
      setShowMarkForm(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Error marking attendance');
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    const record = attendance.find(a => a._id === attendanceId);
    if (!window.confirm(`Are you sure you want to delete this attendance record for ${getClientName(record.clientId)}?`)) {
      return;
    }

    try {
      await axios.delete(`/attendance/${attendanceId}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting attendance:', error);
      setError('Error deleting attendance record');
    }
  };

  const markTodayAttendance = async (clientId) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    // Check if attendance already exists for today
    const existingAttendance = attendance.find(record => 
      record.clientId === clientId && record.date.split('T')[0] === today
    );

    if (existingAttendance) {
      setError('Attendance already marked for this client today!');
      return;
    }

    try {
      await axios.post('/attendance', {
        clientId: clientId,
        date: today,
        checkIn: currentTime,
        notes: 'Quick mark attendance'
      });
      
      fetchData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.response?.data?.message || 'Error marking attendance');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getFilteredAttendance = () => {
    let filtered = [...attendance];

    if (searchTerm) {
      filtered = filtered.filter(record => {
        const clientName = getClientName(record.clientId).toLowerCase();
        return clientName.includes(searchTerm.toLowerCase());
      });
    }

    if (filterDate) {
      const filterDateStr = filterDate.toISOString().split('T')[0];
      filtered = filtered.filter(record => 
        record.date.split('T')[0] === filterDateStr
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const formatDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    const duration = Math.round((checkOutTime - checkInTime) / (1000 * 60));
    
    if (duration < 60) return `${duration} mins`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Attendance Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage client attendance records
          </Typography>
        </Box>
        {!isMobile && (
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => setShowMarkForm(true)}
            size="large"
          >
            Mark Attendance
          </PrimaryButton>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats */}
      <StatsGrid>
        <StatCard
          title="Today's Attendance"
          value={loading ? '...' : stats.todayAttendance}
          change="Active today"
          icon={<CalendarIcon />}
          color="primary"
        />
        <StatCard
          title="This Week"
          value={loading ? '...' : stats.weeklyAttendance}
          change="Total visits"
          icon={<TrendingUpIcon />}
          color="success"
        />
        <StatCard
          title="This Month"
          value={loading ? '...' : stats.monthlyAttendance}
          change="Monthly total"
          icon={<ScheduleIcon />}
          color="info"
        />
        <StatCard
          title="Active Clients"
          value={loading ? '...' : clients.filter(c => c.isActive).length}
          change="Total active"
          icon={<GroupIcon />}
          color="warning"
        />
      </StatsGrid>

      {/* Quick Mark Section */}
      <Card 
        elevation={0} 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          mb: 3 
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Quick Mark Today's Attendance
          </Typography>
          <Grid container spacing={2}>
            {clients.filter(client => client.isActive).slice(0, isMobile ? 4 : 8).map(client => {
              const todayRecord = attendance.find(record => 
                record.clientId === client._id && 
                record.date.split('T')[0] === new Date().toISOString().split('T')[0]
              );
              
              return (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={client._id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
                      p: 2,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[2]
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} mb={1}>
                      {client.firstName} {client.lastName}
                    </Typography>
                    {todayRecord ? (
                      <Chip 
                        label="Present" 
                        color="success" 
                        size="small"
                        icon={<CheckCircleIcon />}
                      />
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => markTodayAttendance(client._id)}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Mark Present
                      </Button>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card 
        elevation={0} 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          mb: 3 
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Filter by Date"
                  value={filterDate}
                  onChange={(newValue) => setFilterDate(newValue)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, md: 2 }}>
              <SecondaryButton
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate(null);
                }}
              >
                Clear
              </SecondaryButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card 
        elevation={0}
        sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <CardContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box flexGrow={1}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </CardContent>
        ) : getFilteredAttendance().length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No attendance records found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchTerm || filterDate 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by marking attendance for your clients!'
              }
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => setShowMarkForm(true)}
            >
              Mark First Attendance
            </PrimaryButton>
          </CardContent>
        ) : isMobile ? (
          // Mobile: Card Layout
          <Box p={2}>
            {getFilteredAttendance().map((record) => (
              <Card 
                key={record._id} 
                elevation={0}
                sx={{ 
                  mb: 2, 
                  border: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {getClientName(record.clientId)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(record.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteAttendance(record._id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Check In
                      </Typography>
                      <Chip 
                        label={record.checkIn || 'N/A'} 
                        size="small" 
                        icon={<TimeIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Check Out
                      </Typography>
                      <Chip 
                        label={record.checkOut || 'N/A'} 
                        size="small" 
                        icon={<TimeIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration: {formatDuration(record.checkIn, record.checkOut)}
                      </Typography>
                      {record.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {record.notes}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Desktop: Table Layout
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Check In
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Check Out
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Duration
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Notes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredAttendance().map((record) => (
                  <TableRow 
                    key={record._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(record.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {getClientName(record.clientId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.checkIn || 'N/A'} 
                        size="small" 
                        color={record.checkIn ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.checkOut || 'N/A'} 
                        size="small" 
                        color={record.checkOut ? 'error' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDuration(record.checkIn, record.checkOut)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {record.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteAttendance(record._id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowMarkForm(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Mark Attendance Dialog */}
      <Dialog 
        open={showMarkForm} 
        onClose={() => { setShowMarkForm(false); setFormErrors({}); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ScheduleIcon />
            Mark Attendance
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleMarkAttendance}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Select Client"
                  value={markForm.clientId}
                  onChange={(e) => { setMarkForm({...markForm, clientId: e.target.value}); if (formErrors.clientId) setFormErrors(p => ({...p, clientId: ''})); }}
                  required
                  error={!!formErrors.clientId}
                  helperText={formErrors.clientId}
                >
                  <MenuItem value="">Choose a client...</MenuItem>
                  {clients.filter(client => client.isActive).map(client => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={markForm.date}
                    onChange={(newValue) => setMarkForm({...markForm, date: newValue})}
                    disableFuture
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Check In Time"
                  type="time"
                  value={markForm.checkIn}
                  onChange={(e) => { setMarkForm({...markForm, checkIn: e.target.value}); if (formErrors.checkIn) setFormErrors(p => ({...p, checkIn: ''})); }}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!formErrors.checkIn}
                  helperText={formErrors.checkIn || 'Required'}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Check Out Time"
                  type="time"
                  value={markForm.checkOut}
                  onChange={(e) => { setMarkForm({...markForm, checkOut: e.target.value}); if (formErrors.checkOut) setFormErrors(p => ({...p, checkOut: ''})); }}
                  InputLabelProps={{ shrink: true }}
                  error={!!formErrors.checkOut}
                  helperText={formErrors.checkOut || 'Optional'}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={markForm.notes}
                  onChange={(e) => setMarkForm({...markForm, notes: e.target.value})}
                  placeholder="Any additional notes..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <SecondaryButton onClick={() => setShowMarkForm(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">
              Mark Attendance
            </PrimaryButton>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardContainer>
  );
};

export default AttendanceManagement;