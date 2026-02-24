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
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Error as OverdueIcon,
  Receipt as ReceiptIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  CalendarToday as CalendarIcon,
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
} from '../../components/ui';

const PaymentManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0
  });

  const [recordForm, setRecordForm] = useState({
    clientId: '',
    amount: '',
    paymentDate: new Date(),
    paymentMonth: new Date().toISOString().slice(0, 7),
    paymentMethod: 'cash',
    status: 'paid',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterMonth, filterYear, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch payments and clients first
      const [paymentsRes, clientsRes] = await Promise.all([
        axios.get('/payments', {
          params: {
            month: filterMonth,
            year: filterYear,
            status: filterStatus,
            limit: 100 // Increase limit to get more accurate stats
          }
        }),
        axios.get('/clients')
      ]);
      
      const paymentsData = paymentsRes.data.payments || [];
      const clientsData = clientsRes.data.clients || [];

      setPayments(paymentsData);
      setClients(clientsData);
      
      // Try to get revenue data from API, but fallback to calculating from payments if it fails
      try {
        const revenueRes = await axios.get('/payments/monthly-revenue');
        calculateStats(paymentsData, revenueRes.data);
      } catch (revenueError) {
        console.log('Revenue API failed, calculating from payments data');
        calculateStats(paymentsData, null);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentsData, revenueData) => {
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    // Calculate stats from payments data
    const totalRevenue = paymentsData
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const monthlyRevenue = paymentsData
      .filter(p => p.status === 'paid' && p.paymentMonth === currentMonthString)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
    const overduePayments = paymentsData.filter(p => p.status === 'overdue').length;

    // Use API data if available, otherwise use calculated values
    setStats({
      totalRevenue: revenueData?.totalRevenue || totalRevenue,
      monthlyRevenue: revenueData?.currentMonthRevenue || monthlyRevenue,
      pendingPayments,
      overduePayments
    });
  };

  const validatePaymentForm = () => {
    const newErrors = {};
    if (!recordForm.clientId) newErrors.clientId = 'Please select a client';
    if (!recordForm.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(recordForm.amount)) || parseFloat(recordForm.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (editingPayment) {
      return handleUpdatePayment(e);
    }

    if (!validatePaymentForm()) return;

    try {
      setError('');
      setFormErrors({});
      const paymentData = {
        clientId: recordForm.clientId,
        amount: parseFloat(recordForm.amount),
        paymentDate: recordForm.paymentDate.toISOString().split('T')[0],
        paymentMonth: recordForm.paymentMonth,
        paymentMethod: recordForm.paymentMethod,
        status: recordForm.status,
        notes: recordForm.notes
      };

      await axios.post('/payments', paymentData);
      
      setRecordForm({
        clientId: '',
        amount: '',
        paymentDate: new Date(),
        paymentMonth: new Date().toISOString().slice(0, 7),
        paymentMethod: 'cash',
        status: 'paid',
        notes: ''
      });
      
      setShowRecordForm(false);
      fetchData();
    } catch (error) {
      console.error('Error recording payment:', error);
      setError(error.response?.data?.message || 'Error recording payment');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`/payments/${paymentId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Error updating payment status');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    const payment = payments.find(p => p._id === paymentId);
    if (!window.confirm(`Are you sure you want to delete this payment record for ₹${payment?.amount}?`)) {
      return;
    }

    try {
      await axios.delete(`/payments/${paymentId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Error deleting payment record');
    }
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setRecordForm({
      clientId: payment.client._id || payment.client,
      amount: payment.amount.toString(),
      paymentDate: new Date(payment.paymentDate),
      paymentMonth: payment.paymentMonth,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      notes: payment.notes || ''
    });
    setShowRecordForm(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();

    if (!validatePaymentForm()) return;

    try {
      setError('');
      setFormErrors({});
      const paymentData = {
        clientId: recordForm.clientId,
        amount: parseFloat(recordForm.amount),
        paymentDate: recordForm.paymentDate.toISOString().split('T')[0],
        paymentMonth: recordForm.paymentMonth,
        paymentMethod: recordForm.paymentMethod,
        status: recordForm.status,
        notes: recordForm.notes
      };

      await axios.put(`/payments/${editingPayment._id}`, paymentData);
      
      setRecordForm({
        clientId: '',
        amount: '',
        paymentDate: new Date(),
        paymentMonth: new Date().toISOString().slice(0, 7),
        paymentMethod: 'cash',
        status: 'paid',
        notes: ''
      });
      
      setShowRecordForm(false);
      setEditingPayment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating payment:', error);
      setError(error.response?.data?.message || 'Error updating payment');
    }
  };

  const handleCloseForm = () => {
    setShowRecordForm(false);
    setEditingPayment(null);
    setFormErrors({});
    setRecordForm({
      clientId: '',
      amount: '',
      paymentDate: new Date(),
      paymentMonth: new Date().toISOString().slice(0, 7),
      paymentMethod: 'cash',
      status: 'paid',
      notes: ''
    });
  };

  const getClientName = (clientData) => {
    if (!clientData) {
      return 'Unknown Client';
    }
    
    // If clientData is an object (populated), use it directly
    if (typeof clientData === 'object' && clientData.firstName) {
      return `${clientData.firstName} ${clientData.lastName}`;
    }
    
    // If clientData is a string (ID), look it up in the clients array
    const clientId = typeof clientData === 'string' ? clientData : clientData._id;
    const client = clients.find(c => c._id === clientId);
    
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getFilteredPayments = () => {
    let filtered = [...payments];

    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const clientName = getClientName(payment.client).toLowerCase();
        return clientName.includes(searchTerm.toLowerCase());
      });
    }

    return filtered.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <PaidIcon />;
      case 'pending': return <PendingIcon />;
      case 'overdue': return <OverdueIcon />;
      default: return <ReceiptIcon />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <MoneyIcon />;
      case 'card': return <CardIcon />;
      case 'bank': return <BankIcon />;
      default: return <ReceiptIcon />;
    }
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payment Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track payments, manage billing, and monitor revenue
          </Typography>
        </Box>
        {!isMobile && (
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => setShowRecordForm(true)}
            size="large"
          >
            Record Payment
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
          title="Total Revenue"
          value={loading ? '...' : `₹${stats.totalRevenue.toLocaleString()}`}
          change="All time earnings"
          icon={<MoneyIcon />}
          color="primary"
        />
        <StatCard
          title="Monthly Revenue"
          value={loading ? '...' : `₹${stats.monthlyRevenue.toLocaleString()}`}
          change="This month"
          icon={<CalendarIcon />}
          color="success"
        />
        <StatCard
          title="Pending Payments"
          value={loading ? '...' : stats.pendingPayments}
          change="Awaiting payment"
          icon={<PendingIcon />}
          color="warning"
        />
        <StatCard
          title="Overdue Payments"
          value={loading ? '...' : stats.overduePayments}
          change="Requires attention"
          icon={<OverdueIcon />}
          color="error"
        />
      </StatsGrid>

      {/* Filters */}
      <Card 
        elevation={0} 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          mb: 3 
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
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
            
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                select
                label="Month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                <MenuItem value="">All Months</MenuItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <TextField
                fullWidth
                select
                label="Year"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 1 }}>
              <SecondaryButton
                fullWidth
                onClick={() => {
                  setSearchTerm('');
                  setFilterMonth('');
                  setFilterYear(new Date().getFullYear().toString());
                  setFilterStatus('');
                }}
              >
                Clear
              </SecondaryButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Table */}
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
        ) : getFilteredPayments().length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No payment records found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchTerm || filterMonth || filterStatus 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by recording your first payment!'
              }
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => setShowRecordForm(true)}
            >
              Record First Payment
            </PrimaryButton>
          </CardContent>
        ) : isMobile ? (
          // Mobile: Card Layout
          <Box p={2}>
            {getFilteredPayments().map((payment) => (
              <Card 
                key={payment._id} 
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
                        {getClientName(payment.client)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700} color="success.main">
                      ₹{payment.amount}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={payment.status} 
                        color={getStatusColor(payment.status)}
                        icon={getStatusIcon(payment.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Method
                      </Typography>
                      <Chip 
                        label={payment.paymentMethod} 
                        variant="outlined"
                        icon={getPaymentMethodIcon(payment.paymentMethod)}
                        size="small"
                      />
                    </Grid>
                    {payment.notes && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                          Notes: {payment.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  <Box display="flex" gap={1} mt={2}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPayment(payment)}
                    >
                      Edit
                    </Button>
                    {payment.status !== 'paid' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleUpdatePaymentStatus(payment._id, 'paid')}
                      >
                        Mark Paid
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeletePayment(payment._id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
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
                    Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Method
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Status
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
                {getFilteredPayments().map((payment) => (
                  <TableRow 
                    key={payment._id}
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {getClientName(payment.client)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        ₹{payment.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.paymentMethod} 
                        variant="outlined"
                        icon={getPaymentMethodIcon(payment.paymentMethod)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status} 
                        color={getStatusColor(payment.status)}
                        icon={getStatusIcon(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {payment.notes || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <EditIcon />
                        </IconButton>
                        {payment.status !== 'paid' && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => handleUpdatePaymentStatus(payment._id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePayment(payment._id)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
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
          onClick={() => setShowRecordForm(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Record/Edit Payment Dialog */}
      <Dialog 
        open={showRecordForm} 
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            {editingPayment ? <EditIcon /> : <ReceiptIcon />}
            {editingPayment ? 'Edit Payment' : 'Record Payment'}
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleRecordPayment}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Select Client"
                  value={recordForm.clientId}
                  onChange={(e) => { setRecordForm({...recordForm, clientId: e.target.value}); if (formErrors.clientId) setFormErrors(p => ({...p, clientId: ''})); }}
                  required
                  error={!!formErrors.clientId}
                  helperText={formErrors.clientId}
                >
                  <MenuItem value="">Choose a client...</MenuItem>
                  {clients.map(client => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={recordForm.amount}
                  onChange={(e) => { setRecordForm({...recordForm, amount: e.target.value}); if (formErrors.amount) setFormErrors(p => ({...p, amount: ''})); }}
                  required
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  inputProps={{ min: 1, step: 1 }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Payment Method"
                  value={recordForm.paymentMethod}
                  onChange={(e) => setRecordForm({...recordForm, paymentMethod: e.target.value})}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Payment Date"
                    value={recordForm.paymentDate}
                    onChange={(newValue) => setRecordForm({...recordForm, paymentDate: newValue})}
                    disableFuture
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={recordForm.status}
                  onChange={(e) => setRecordForm({...recordForm, status: e.target.value})}
                >
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Payment Month"
                  type="month"
                  value={recordForm.paymentMonth}
                  onChange={(e) => setRecordForm({...recordForm, paymentMonth: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({...recordForm, notes: e.target.value})}
                  placeholder="Any additional notes..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <SecondaryButton onClick={handleCloseForm}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">
              {editingPayment ? 'Update Payment' : 'Record Payment'}
            </PrimaryButton>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardContainer>
  );
};

export default PaymentManagement;