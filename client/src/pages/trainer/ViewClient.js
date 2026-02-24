import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  DateRange as DateRangeIcon,
  FitnessCenter as FitnessCenterIcon,
  LocalDining as LocalDiningIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatters';

const ViewClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPayments: 0,
    activePlans: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, paymentsResponse, plansResponse] = await Promise.allSettled([
        axios.get(`/clients/${id}`),
        axios.get(`/payments?clientId=${id}`),
        axios.get(`/diet-plans?clientId=${id}`)
      ]);

      if (clientResponse.status === 'fulfilled' && clientResponse.value.data.success) {
        setClient(clientResponse.value.data.client);
      } else {
        setError('Client not found');
        return;
      }

      // Calculate stats
      let totalPayments = 0;
      let activePlans = 0;

      if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value.data.success) {
        totalPayments = paymentsResponse.value.data.payments.reduce((sum, payment) => sum + payment.amount, 0);
      }

      if (plansResponse.status === 'fulfilled' && plansResponse.value.data.success) {
        activePlans = plansResponse.value.data.dietPlans.filter(plan => plan.isActive).length;
      }

      setStats({
        totalPayments,
        activePlans,
        attendanceRate: 85 // Placeholder - would need attendance data
      });

    } catch (error) {
      console.error('Error fetching client data:', error);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/trainer/clients/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/trainer/clients');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || 'Client not found'}
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Clients
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth="1400px" mx="auto">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Clients
        </Button>
        <Box display="flex" gap={2}>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
          >
            Edit Client
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Client Profile Card */}
        <Grid size={{ xs: 12, lg: 4, md: 5 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', pt: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {client.firstName?.[0]}{client.lastName?.[0]}
              </Avatar>
              
              <Typography variant="h4" gutterBottom>
                {client.firstName} {client.lastName}
              </Typography>
              
              <Chip 
                label={client.isActive ? 'Active' : 'Inactive'} 
                color={client.isActive ? 'success' : 'default'}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(client.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 2, elevation: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PaymentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Payments" 
                    secondary={formatCurrency(stats.totalPayments)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocalDiningIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Active Diet Plans" 
                    secondary={stats.activePlans}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Attendance Rate" 
                    secondary={`${stats.attendanceRate}%`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Details */}
        <Grid size={{ xs: 12, lg: 8, md: 7 }}>
          {/* Personal Information */}
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {client.firstName} {client.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <EmailIcon color="action" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {client.user?.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {client.phone && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <PhoneIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {client.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {client.dateOfBirth && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <DateRangeIcon color="action" sx={{ mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Date of Birth
                        </Typography>
                        <Typography variant="body1">
                          {new Date(client.dateOfBirth).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Fitness Information */}
              {(client.currentWeight || client.targetWeight || client.fitnessGoal) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Fitness Profile
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {client.currentWeight && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <FitnessCenterIcon color="action" sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Current Weight
                            </Typography>
                            <Typography variant="body1">
                              {client.currentWeight} kg
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    {client.targetWeight && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Target Weight
                          </Typography>
                          <Typography variant="body1">
                            {client.targetWeight} kg
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {client.fitnessGoal && (
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Fitness Goal
                          </Typography>
                          <Typography variant="body1">
                            {client.fitnessGoal}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

              {/* Membership Information */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                Membership Information
              </Typography>
              
              <Grid container spacing={3}>
                {client.membershipType && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Membership Type
                      </Typography>
                      <Typography variant="body1">
                        {client.membershipType}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {client.membershipStartDate && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(client.membershipStartDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {client.membershipEndDate && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(client.membershipEndDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip 
                      label={client.isActive ? 'Active' : 'Inactive'} 
                      color={client.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewClient;