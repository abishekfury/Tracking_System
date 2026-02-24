import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Skeleton,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restaurant as DietIcon,
  TrendingUp as GoalIcon,
  Schedule as TimeIcon,
  LocalFireDepartment as CaloriesIcon,
  SportsGymnastics as ProteinIcon,
  Grain as CarbsIcon,
  WaterDrop as FatsIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  DashboardContainer,
  PageHeader,
  ContentSection,
  ProfessionalCard,
  StatsGrid,
  StatCard,
} from '../../components/ui/LayoutComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DietPlanManagement = () => {
  const theme = useTheme();
  
  const [dietPlans, setDietPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // Filters
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    goal: '',
    duration: '',
    dailyCalorieTarget: '',
    macroTargets: {
      protein: '',
      carbs: '',
      fats: ''
    },
    notes: '',
    restrictions: [],
    waterIntake: 8,
    meals: []
  });

  const goalOptions = [
    { value: 'weight-loss', label: 'Weight Loss', color: 'error' },
    { value: 'weight-gain', label: 'Weight Gain', color: 'success' },
    { value: 'muscle-gain', label: 'Muscle Gain', color: 'primary' },
    { value: 'maintenance', label: 'Maintenance', color: 'info' },
    { value: 'athletic-performance', label: 'Athletic Performance', color: 'secondary' }
  ];

  const mealTimings = [
    'breakfast',
    'morning-snack', 
    'lunch',
    'evening-snack',
    'dinner',
    'post-workout'
  ];

  useEffect(() => {
    fetchClients();
    fetchDietPlans();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/clients');
      if (response.data.success) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    }
  };

  const fetchDietPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/diet-plans');
      
      if (response.data.success) {
        setDietPlans(response.data.dietPlans);
      }
    } catch (error) {
      console.error('Error fetching diet plans:', error);
      setError('Failed to load diet plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setFormData({
      clientId: '',
      title: '',
      description: '',
      goal: '',
      duration: '',
      dailyCalorieTarget: '',
      macroTargets: { protein: '', carbs: '', fats: '' },
      notes: '',
      restrictions: [],
      waterIntake: 8,
      meals: []
    });
    setOpenDialog(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      clientId: plan.client._id,
      title: plan.title,
      description: plan.description || '',
      goal: plan.goal,
      duration: plan.duration || '',
      dailyCalorieTarget: plan.dailyCalorieTarget || '',
      macroTargets: plan.macroTargets || { protein: '', carbs: '', fats: '' },
      notes: plan.notes || '',
      restrictions: plan.restrictions || [],
      waterIntake: plan.waterIntake || 8,
      meals: plan.meals || []
    });
    setOpenDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.clientId) newErrors.clientId = 'Please select a client';
    if (!formData.title || !formData.title.trim()) newErrors.title = 'Plan title is required';
    if (!formData.goal) newErrors.goal = 'Please select a goal';
    if (formData.dailyCalorieTarget && (isNaN(formData.dailyCalorieTarget) || Number(formData.dailyCalorieTarget) <= 0))
      newErrors.dailyCalorieTarget = 'Enter a valid positive calorie number';

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the highlighted errors before submitting.');
      return;
    }
    
    try {
      const planData = {
        ...formData,
        dailyCalorieTarget: formData.dailyCalorieTarget ? parseInt(formData.dailyCalorieTarget) : undefined,
        waterIntake: parseInt(formData.waterIntake),
        macroTargets: {
          protein: formData.macroTargets.protein ? parseInt(formData.macroTargets.protein) : undefined,
          carbs: formData.macroTargets.carbs ? parseInt(formData.macroTargets.carbs) : undefined,
          fats: formData.macroTargets.fats ? parseInt(formData.macroTargets.fats) : undefined,
        }
      };

      console.log('Submitting diet plan data:', planData);

      if (editingPlan) {
        const response = await axios.put(`/diet-plans/${editingPlan._id}`, planData);
        console.log('Update response:', response.data);
        setSuccess('Diet plan updated successfully');
      } else {
        const response = await axios.post('/diet-plans', planData);
        console.log('Create response:', response.data);
        setSuccess('Diet plan created successfully');
      }

      setOpenDialog(false);
      setFormErrors({});
      fetchDietPlans();
    } catch (error) {
      console.error('Error submitting diet plan:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save diet plan');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/diet-plans/${id}`);
      setSuccess('Diet plan deleted successfully');
      setDeleteConfirm(null);
      fetchDietPlans();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete diet plan');
    }
  };

  const addMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [...prev.meals, {
        name: '',
        description: '',
        timing: 'breakfast',
        calories: '',
        protein: '',
        carbs: '',
        fats: '',
        ingredients: [],
        instructions: ''
      }]
    }));
  };

  const updateMeal = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.map((meal, i) => 
        i === index ? { ...meal, [field]: value } : meal
      )
    }));
  };

  const removeMeal = (index) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const filteredPlans = dietPlans.filter(plan => {
    // Search term filter
    const matchesSearch = !searchTerm || 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${plan.client?.firstName || ''} ${plan.client?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Client filter (only apply if not already filtered by server)
    const matchesClient = !selectedClient || plan.client?._id === selectedClient;
    
    // Goal filter (only apply if not already filtered by server)  
    const matchesGoal = !selectedGoal || plan.goal === selectedGoal;
    
    return matchesSearch && matchesClient && matchesGoal;
  });

  const stats = {
    totalPlans: dietPlans.length,
    activePlans: dietPlans.filter(p => p.isActive).length,
    weightLoss: dietPlans.filter(p => p.goal === 'weight-loss').length,
    muscleGain: dietPlans.filter(p => p.goal === 'muscle-gain').length,
  };

  return (
    <DashboardContainer>
      <PageHeader 
        title="Diet Plan Management"
        subtitle="Create and manage comprehensive nutrition plans for your clients"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePlan}
          >
            Create Diet Plan
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <StatsGrid>
        <StatCard
          title="Total Diet Plans"
          value={stats.totalPlans}
          change="Active plans"
          icon={<DietIcon />}
          color="primary"
        />
        <StatCard
          title="Active Plans"
          value={stats.activePlans}
          change="Currently active"
          icon={<GoalIcon />}
          color="success"
        />
        <StatCard
          title="Weight Loss Plans"
          value={stats.weightLoss}
          change="Fat loss focused"
          icon={<CaloriesIcon />}
          color="error"
        />
        <StatCard
          title="Muscle Gain Plans"
          value={stats.muscleGain}
          change="Muscle building"
          icon={<ProteinIcon />}
          color="info"
        />
      </StatsGrid>

      {/* Filters */}
      <ContentSection title="Filters">
        <ProfessionalCard>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search plans or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  label="Client"
                >
                  <MenuItem value="">All Clients</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.firstName} {client.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Goal</InputLabel>
                <Select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  label="Goal"
                >
                  <MenuItem value="">All Goals</MenuItem>
                  {goalOptions.map((goal) => (
                    <MenuItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSelectedClient('');
                  setSelectedGoal('');
                  setSearchTerm('');
                }}
                fullWidth
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </ProfessionalCard>
      </ContentSection>

      {/* Diet Plans List */}
      <ContentSection title={`Diet Plans (${filteredPlans.length})`}>
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, i) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            ))}
          </Grid>
        ) : filteredPlans.length === 0 ? (
          <ProfessionalCard>
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={8}
            >
              <DietIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Diet Plans Found
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                Create your first diet plan to get started with nutrition management.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreatePlan}
              >
                Create Diet Plan
              </Button>
            </Box>
          </ProfessionalCard>
        ) : (
          <Grid container spacing={3}>
            {filteredPlans.map((plan) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={plan._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {plan.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.client?.firstName} {plan.client?.lastName}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Chip 
                          label={goalOptions.find(g => g.value === plan.goal)?.label || plan.goal}
                          color={goalOptions.find(g => g.value === plan.goal)?.color || 'default'}
                          size="small"
                        />
                        {plan.isActive && (
                          <Chip label="Active" color="success" size="small" />
                        )}
                      </Box>
                    </Box>

                    {plan.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {plan.description}
                      </Typography>
                    )}

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {plan.dailyCalorieTarget && (
                        <Grid size={{ xs: 6 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CaloriesIcon fontSize="small" color="error" />
                            <Typography variant="body2">
                              {plan.dailyCalorieTarget} kcal
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid size={{ xs: 6 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DietIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {plan.meals?.length || 0} meals
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography variant="caption" color="text.secondary" display="block">
                      Updated: {formatDate(plan.lastUpdated)}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPlan(plan)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteConfirm(plan)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </ContentSection>

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => { setOpenDialog(false); setFormErrors({}); }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required error={!!formErrors.clientId}>
                  <InputLabel>Client</InputLabel>
                  <Select
                    value={formData.clientId}
                    onChange={(e) => { setFormData(prev => ({ ...prev, clientId: e.target.value })); if (formErrors.clientId) setFormErrors(p => ({...p, clientId: ''})); }}
                    label="Client"
                    disabled={!!editingPlan}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client._id} value={client._id}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.clientId && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{formErrors.clientId}</Typography>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Plan Title"
                  value={formData.title}
                  onChange={(e) => { setFormData(prev => ({ ...prev, title: e.target.value })); if (formErrors.title) setFormErrors(p => ({...p, title: ''})); }}
                  error={!!formErrors.title}
                  helperText={formErrors.title || 'e.g., Weight Loss Plan - Phase 1'}
                  placeholder="e.g., Weight Loss Plan - Phase 1"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the diet plan goals and approach..."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth required error={!!formErrors.goal}>
                  <InputLabel>Goal</InputLabel>
                  <Select
                    value={formData.goal}
                    onChange={(e) => { setFormData(prev => ({ ...prev, goal: e.target.value })); if (formErrors.goal) setFormErrors(p => ({...p, goal: ''})); }}
                    label="Goal"
                  >
                    {goalOptions.map((goal) => (
                      <MenuItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.goal && <Typography variant="caption" color="error" sx={{ ml: 1.5 }}>{formErrors.goal}</Typography>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 8 weeks"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Daily Calorie Target"
                  type="number"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) => { setFormData(prev => ({ ...prev, dailyCalorieTarget: e.target.value })); if (formErrors.dailyCalorieTarget) setFormErrors(p => ({...p, dailyCalorieTarget: ''})); }}
                  error={!!formErrors.dailyCalorieTarget}
                  helperText={formErrors.dailyCalorieTarget}
                  placeholder="2000"
                  inputProps={{ min: 1 }}
                />
              </Grid>

              {/* Macro Targets */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Macro Targets (grams)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Protein"
                  type="number"
                  value={formData.macroTargets.protein}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macroTargets: { ...prev.macroTargets, protein: e.target.value }
                  }))}
                  InputProps={{
                    startAdornment: <ProteinIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Carbohydrates"
                  type="number"
                  value={formData.macroTargets.carbs}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macroTargets: { ...prev.macroTargets, carbs: e.target.value }
                  }))}
                  InputProps={{
                    startAdornment: <CarbsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Fats"
                  type="number"
                  value={formData.macroTargets.fats}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macroTargets: { ...prev.macroTargets, fats: e.target.value }
                  }))}
                  InputProps={{
                    startAdornment: <FatsIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Daily Water Intake (glasses)"
                  type="number"
                  value={formData.waterIntake}
                  onChange={(e) => setFormData(prev => ({ ...prev, waterIntake: e.target.value }))}
                />
              </Grid>

              {/* Notes */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes & Instructions"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, instructions, or guidelines..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the diet plan "{deleteConfirm?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button 
            onClick={() => handleDelete(deleteConfirm._id)} 
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
};

export default DietPlanManagement;