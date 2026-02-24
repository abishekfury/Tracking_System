import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FileUpload as ImportIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  GroupOff as GroupOffIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  ToggleOff as DeactivateIcon,
  ToggleOn as ActivateIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  DashboardContainer,
  StatsGrid,
  StatCard,
  SectionHeader,
  PrimaryButton,
  SecondaryButton,
} from '../../components/ui';

const ClientList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/clients');
      if (response.data.success) {
        setClients(response.data.clients);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    const clientToDelete = clients.find(c => c._id === clientId);
    if (window.confirm(`Are you sure you want to delete ${clientToDelete?.firstName} ${clientToDelete?.lastName}? This action cannot be undone.`)) {
      try {
        await axios.delete(`/clients/${clientId}`);
        fetchClients(); // Refresh the list
        setAnchorEl(null);
      } catch (error) {
        console.error('Error deleting client:', error);
        setError('Error deleting client. Please try again.');
      }
    }
  };

  const handleToggleActive = async (clientId, currentStatus) => {
    try {
      await axios.put(`/clients/${clientId}`, {
        isActive: !currentStatus
      });
      fetchClients(); // Refresh the list
      setAnchorEl(null);
    } catch (error) {
      console.error('Error updating client status:', error);
      setError('Error updating client status. Please try again.');
    }
  };

  const handleMenuOpen = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  // Filter clients based on search and active status
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName.toLowerCase().includes(search.toLowerCase()) ||
      client.lastName.toLowerCase().includes(search.toLowerCase()) ||
      client.user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && client.isActive) ||
      (filterActive === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const inactiveClients = totalClients - activeClients;
  
  // Calculate new clients this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newClientsThisMonth = clients.filter(client => {
    return client.membershipStartDate?.slice(0, 7) === currentMonth;
  }).length;

  if (error && !loading && clients.length === 0) {
    return (
      <DashboardContainer>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Client Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your gym members, track memberships, and monitor client activity
          </Typography>
        </Box>
        {!isMobile && (
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => navigate('/trainer/clients/add')}
            size="large"
          >
            Add New Client
          </PrimaryButton>
        )}
      </Box>

      {/* Stats */}
      <StatsGrid>
        <StatCard
          title="Total Members"
          value={loading ? '...' : totalClients}
          change={`${newClientsThisMonth} new this month`}
          icon={<GroupIcon />}
          color="primary"
        />
        <StatCard
          title="Active Members"
          value={loading ? '...' : activeClients}
          change={`${Math.round((activeClients / totalClients) * 100) || 0}% of total`}
          icon={<PersonAddIcon />}
          color="success"
        />
        <StatCard
          title="Inactive Members"
          value={loading ? '...' : inactiveClients}
          change={`${Math.round((inactiveClients / totalClients) * 100) || 0}% of total`}
          icon={<GroupOffIcon />}
          color="error"
        />
        <StatCard
          title="New This Month"
          value={loading ? '...' : newClientsThisMonth}
          change="Recent additions"
          icon={<CalendarIcon />}
          color="info"
        />
      </StatsGrid>

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
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                placeholder="Search clients by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="medium"
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`All (${totalClients})`}
                  onClick={() => setFilterActive('all')}
                  color={filterActive === 'all' ? 'primary' : 'default'}
                  variant={filterActive === 'all' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Active (${activeClients})`}
                  onClick={() => setFilterActive('active')}
                  color={filterActive === 'active' ? 'success' : 'default'}
                  variant={filterActive === 'active' ? 'filled' : 'outlined'}
                />
                <Chip
                  label={`Inactive (${inactiveClients})`}
                  onClick={() => setFilterActive('inactive')}
                  color={filterActive === 'inactive' ? 'error' : 'default'}
                  variant={filterActive === 'inactive' ? 'filled' : 'outlined'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Client List */}
      {isMobile ? (
        // Mobile: Card Layout
        <Box>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box flexGrow={1}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))
          ) : filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <Card 
                key={client._id} 
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
                  {/* Client Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                      >
                        {client.firstName[0]}{client.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {client.firstName} {client.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, client)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* Client Details */}
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip
                        label={client.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={client.isActive ? 'success' : 'error'}
                        variant="filled"
                      />
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Phone:
                      </Typography>
                      <Typography variant="body2">
                        {client.phone}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Membership:
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {client.membershipType}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Joined:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(client.membershipStartDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ textAlign: 'center', py: 8 }}>
              <CardContent>
                <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No clients found
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {search || filterActive !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start by adding your first client.'
                  }
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        // Desktop: Table Layout
        <Card 
          elevation={0}
          sx={{ 
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Client
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Contact
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Membership
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Join Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, bgcolor: 'background.paper' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box>
                            <Skeleton variant="text" width={120} />
                            <Skeleton variant="text" width={100} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="rounded" width={60} height={24} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
                    </TableRow>
                  ))
                ) : filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client._id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:last-child td, &:last-child th': { border: 0 } 
                      }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                          >
                            {client.firstName[0]}{client.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {client.firstName} {client.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {client._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {client.user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {client.phone}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={client.membershipType}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={client.isActive ? 'Active' : 'Inactive'}
                          color={client.isActive ? 'success' : 'error'}
                          size="small"
                          variant="filled"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(client.membershipStartDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, client)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                      <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No clients found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search || filterActive !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Start by adding your first client.'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => navigate('/trainer/clients/add')}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 180 }
        }}
      >
        <MenuItem 
          onClick={() => {
            navigate(`/trainer/clients/${selectedClient?._id}`);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          View Profile
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            navigate(`/trainer/clients/${selectedClient?._id}/edit`);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit Client
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            handleToggleActive(selectedClient?._id, selectedClient?.isActive);
          }}
        >
          <ListItemIcon>
            {selectedClient?.isActive ? <DeactivateIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
          </ListItemIcon>
          {selectedClient?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleDeleteClient(selectedClient?._id);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete Client
        </MenuItem>
      </Menu>
    </DashboardContainer>
  );
};

export default ClientList;