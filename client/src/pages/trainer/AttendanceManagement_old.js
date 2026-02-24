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
  KPIGrid,
  KPIItem,
  StatsCard,
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
  const [filterDate, setFilterDate] = useState('');
  const [error, setError] = useState('');
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
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const todayAttendance = attendanceData.filter(record => 
      record.date.split('T')[0] === today
    ).length;

    const weeklyAttendance = attendanceData.filter(record => 
      new Date(record.date) >= oneWeekAgo
    ).length;

    const monthlyAttendance = attendanceData.filter(record => 
      new Date(record.date) >= oneMonthAgo
    ).length;

    setStats({ todayAttendance, weeklyAttendance, monthlyAttendance });
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    
    if (!markForm.clientId || !markForm.date) {
      alert('Please select a client and date');
      return;
    }

    try {
      const attendanceData = {
        clientId: markForm.clientId,
        date: markForm.date,
        checkIn: markForm.checkIn || new Date().toTimeString().slice(0, 5),
        checkOut: markForm.checkOut || '',
        notes: markForm.notes
      };

      await axios.post('/attendance', attendanceData);
      
      setShowMarkForm(false);
      setMarkForm({
        clientId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        notes: ''
      });
      
      fetchData(); // Refresh data
      alert('Attendance marked successfully!');
    } catch (error) {
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    try {
      await axios.delete(`/attendance/${attendanceId}`);
      fetchData(); // Refresh data
      alert('Attendance record deleted successfully!');
    } catch (error) {
      alert('Error deleting attendance: ' + (error.response?.data?.message || error.message));
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
      filtered = filtered.filter(record => 
        record.date.split('T')[0] === filterDate
      );
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const markTodayAttendance = async (clientId) => {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    // Check if attendance already exists for today
    const existingAttendance = attendance.find(record => 
      record.clientId === clientId && record.date.split('T')[0] === today
    );

    if (existingAttendance) {
      alert('Attendance already marked for this client today!');
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
      alert('Attendance marked successfully!');
    } catch (error) {
      alert('Error marking attendance: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="attendance-management">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowMarkForm(true)}
        >
          Mark New Attendance
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.todayAttendance}</h3>
            <p>Today's Attendance</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.weeklyAttendance}</h3>
            <p>This Week</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.monthlyAttendance}</h3>
            <p>This Month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{clients.length}</h3>
            <p>Active Clients</p>
          </div>
        </div>
      </div>

      {/* Quick Mark Section */}
      <div className="quick-mark-section">
        <h2>Quick Mark Today's Attendance</h2>
        <div className="quick-mark-grid">
          {clients.filter(client => client.isActive).map(client => {
            const todayRecord = attendance.find(record => 
              record.clientId === client._id && 
              record.date.split('T')[0] === new Date().toISOString().split('T')[0]
            );
            
            return (
              <div key={client._id} className="quick-mark-card">
                <div className="client-info">
                  <h4>{client.firstName} {client.lastName}</h4>
                  <p>{client.email}</p>
                </div>
                <div className="attendance-status">
                  {todayRecord ? (
                    <span className="status present">✅ Present</span>
                  ) : (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => markTodayAttendance(client._id)}
                    >
                      Mark Present
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-filter"
          />
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="attendance-records">
        <h2>Attendance Records</h2>
        {getFilteredAttendance().length === 0 ? (
          <div className="no-data">
            <p>No attendance records found.</p>
            {attendance.length === 0 && (
              <p>Start by marking attendance for your clients!</p>
            )}
          </div>
        ) : (
          <div className="records-table">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAttendance().map((record) => {
                  const checkIn = record.checkIn ? new Date(`2000-01-01T${record.checkIn}`) : null;
                  const checkOut = record.checkOut ? new Date(`2000-01-01T${record.checkOut}`) : null;
                  const duration = checkIn && checkOut 
                    ? Math.round((checkOut - checkIn) / (1000 * 60)) + ' mins'
                    : 'N/A';

                  return (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{getClientName(record.clientId)}</td>
                      <td>{record.checkIn || 'N/A'}</td>
                      <td>{record.checkOut || 'N/A'}</td>
                      <td>{duration}</td>
                      <td>{record.notes || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAttendance(record._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showMarkForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Mark Attendance</h3>
              <button 
                className="close-btn"
                onClick={() => setShowMarkForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleMarkAttendance} className="modal-content">
              <div className="form-group">
                <label>Select Client</label>
                <select
                  value={markForm.clientId}
                  onChange={(e) => setMarkForm({...markForm, clientId: e.target.value})}
                  required
                  className="form-control"
                >
                  <option value="">Choose a client...</option>
                  {clients.filter(client => client.isActive).map(client => (
                    <option key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={markForm.date}
                  onChange={(e) => setMarkForm({...markForm, date: e.target.value})}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Check In Time</label>
                  <input
                    type="time"
                    value={markForm.checkIn}
                    onChange={(e) => setMarkForm({...markForm, checkIn: e.target.value})}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Check Out Time</label>
                  <input
                    type="time"
                    value={markForm.checkOut}
                    onChange={(e) => setMarkForm({...markForm, checkOut: e.target.value})}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={markForm.notes}
                  onChange={(e) => setMarkForm({...markForm, notes: e.target.value})}
                  className="form-control"
                  rows="3"
                  placeholder="Any additional notes..."
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMarkForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
