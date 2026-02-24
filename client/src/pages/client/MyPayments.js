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
  Payment as PaymentIcon,
  TrendingUp as TrendingIcon,
  AccountBalance as AccountIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DashboardContainer,
  PageHeader,
  StatsGrid,
  StatCard,
  ContentSection,
  ProfessionalCard,
} from '../../components/ui/LayoutComponents';

const MyPayments = () => {
  const theme = useTheme();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayments();
  }, [selectedYear]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get('/payments/my-payments', {
          params: { year: selectedYear, limit: 50 }
        }),
        axios.get('/payments/stats/my-stats', {
          params: { year: selectedYear }
        }).catch(() => ({ data: { success: false } }))
      ]);

      setPayments(paymentsRes.data.payments || []);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'upi': return 'UPI';
      default: return method;
    }
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const calculateTotalPaid = () => {
    return payments
      .filter(p => p.status === 'paid')
      .reduce((total, p) => total + p.amount, 0);
  };

  const calculatePendingAmount = () => {
    return payments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((total, p) => total + p.amount, 0);
  };

  if (error) {
    return (
      <DashboardContainer>
        <PageHeader title="My Payments" subtitle="Track your payment history and status" />
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageHeader 
        title="My Payments" 
        subtitle="Track your payment history and manage dues"
        actions={
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              label="Select Year"
            >
              {getYearOptions().map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard
          title="Total Paid"
          value={loading ? <Skeleton width={80} /> : formatCurrency(calculateTotalPaid())}
          change="this year"
          changeType="positive"
          icon={<PaymentIcon />}
        />
        <StatCard
          title="Pending Amount"
          value={loading ? <Skeleton width={80} /> : formatCurrency(calculatePendingAmount())}
          change="outstanding dues"
          changeType={calculatePendingAmount() > 0 ? "negative" : "positive"}
          icon={<AccountIcon />}
        />
        <StatCard
          title="Total Transactions"
          value={loading ? <Skeleton width={40} /> : payments.length}
          change="payment records"
          changeType="neutral"
          icon={<ReceiptIcon />}
        />
        <StatCard
          title="Payment Success Rate"
          value={
            loading ? (
              <Skeleton width={60} />
            ) : (
              `${payments.length > 0 ? Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100) : 0}%`
            )
          }
          change="on-time payments"
          changeType="positive"
          icon={<TrendingIcon />}
        />
      </StatsGrid>

      {/* Payment Records */}
      <ContentSection title="Payment History">
        <ProfessionalCard>
          {loading ? (
            <Box p={3}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : payments.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={8}
            >
              <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No payment records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payment history will appear here once transactions are made
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow 
                      key={payment._id || payment.date}
                      sx={{ '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {formatDate(payment.paymentDate || payment.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status.toUpperCase()}
                          color={getStatusColor(payment.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getPaymentMethodDisplay(payment.method)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payment.period || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {payment.notes || 'No notes'}
                        </Typography>
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

export default MyPayments;

  