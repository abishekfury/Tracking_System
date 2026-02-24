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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FitnessCenter as WorkoutIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  PlaylistAdd as PlanIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  DashboardContainer,
  StatsGrid,
  StatCard,
  PrimaryButton,
  SecondaryButton,
} from '../../components/ui';

const WorkoutPlanManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewPlan, setShowViewPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    clientsWithPlans: 0,
    avgExercisesPerPlan: 0
  });

  const [planForm, setPlanForm] = useState({
    clientId: '',
    title: '',
    description: '',
    daysPerWeek: 3,
    duration: '4 weeks',
    exercises: [
      {
        name: '',
        sets: 3,
        reps: '10-12',
        weight: '',
        restTime: '60 seconds',
        notes: ''
      }
    ]
  });

  // Exercise library for suggestions
  const exerciseLibrary = [
    'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press', 'Shoulder Press',
    'Bicep Curls', 'Tricep Dips', 'Lunges', 'Planks', 'Burpees', 'Mountain Climbers',
    'Lat Pulldowns', 'Chest Fly', 'Leg Press', 'Calf Raises', 'Russian Twists',
    'Leg Curls', 'Leg Extensions', 'Hip Thrusts', 'Face Pulls', 'Rows'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [workoutRes, clientsRes] = await Promise.all([
        axios.get('/workouts', { params: { limit: 50 } }),
        axios.get('/clients')
      ]);
      
      const workoutData = workoutRes.data.workoutPlans || [];
      const clientsData = clientsRes.data.clients || [];

      setWorkoutPlans(workoutData);
      setClients(clientsData);
      calculateStats(workoutData, clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load workout plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workoutData, clientsData) => {
    const totalPlans = workoutData.length;
    const activePlans = workoutData.filter(plan => plan.isActive).length;
    const uniqueClients = new Set(workoutData.map(plan => plan.client?._id || plan.clientId)).size;
    const totalExercises = workoutData.reduce((sum, plan) => sum + (plan.exercises?.length || 0), 0);
    const avgExercises = totalPlans > 0 ? Math.round(totalExercises / totalPlans) : 0;

    setStats({
      totalPlans,
      activePlans,
      clientsWithPlans: uniqueClients,
      avgExercisesPerPlan: avgExercises
    });
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!planForm.clientId) newErrors.clientId = 'Please select a client';
    if (!planForm.title || !planForm.title.trim()) newErrors.title = 'Plan title is required';
    const namedExercises = planForm.exercises.filter(ex => ex.name && ex.name.trim());
    if (namedExercises.length === 0) newErrors.exercises = 'Add at least one exercise with a name';

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the highlighted errors before submitting.');
      return;
    }

    try {
      setError('');
      const planData = {
        clientId: planForm.clientId,
        title: planForm.title,
        description: planForm.description,
        daysPerWeek: planForm.daysPerWeek,
        duration: planForm.duration,
        exercises: planForm.exercises.filter(ex => ex.name.trim() !== ''),
        isActive: true
      };

      await axios.post('/workouts', planData);
      
      setPlanForm({
        clientId: '',
        title: '',
        description: '',
        daysPerWeek: 3,
        duration: '4 weeks',
        exercises: [
          {
            name: '',
            sets: 3,
            reps: '10-12',
            weight: '',
            restTime: '60 seconds',
            notes: ''
          }
        ]
      });
      
      setShowCreateForm(false);
      setFormErrors({});
      fetchData();
    } catch (error) {
      console.error('Error creating workout plan:', error);
      setError(error.response?.data?.message || 'Error creating workout plan');
    }
  };

  const handleDeletePlan = async (planId) => {
    const plan = workoutPlans.find(p => p._id === planId);
    if (!window.confirm(`Are you sure you want to delete the workout plan "${plan?.title}"?`)) {
      return;
    }

    try {
      await axios.delete(`/workouts/${planId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      setError('Error deleting workout plan');
    }
  };

  const handleToggleActive = async (planId, currentStatus) => {
    try {
      await axios.put(`/workouts/${planId}`, { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      console.error('Error updating plan status:', error);
      setError('Error updating plan status');
    }
  };

  const addExercise = () => {
    setPlanForm({
      ...planForm,
      exercises: [...planForm.exercises, {
        name: '',
        sets: 3,
        reps: '10-12',
        weight: '',
        restTime: '60 seconds',
        notes: ''
      }]
    });
  };

  const removeExercise = (index) => {
    setPlanForm({
      ...planForm,
      exercises: planForm.exercises.filter((_, i) => i !== index)
    });
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...planForm.exercises];
    updatedExercises[index][field] = value;
    setPlanForm({ ...planForm, exercises: updatedExercises });
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c._id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getFilteredPlans = () => {
    let filtered = [...workoutPlans];

    if (searchTerm) {
      filtered = filtered.filter(plan => {
        const clientName = getClientName(plan.client?._id || plan.clientId).toLowerCase();
        const title = plan.title.toLowerCase();
        return clientName.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
      });
    }

    if (filterStatus) {
      if (filterStatus === 'active') {
        filtered = filtered.filter(plan => plan.isActive);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(plan => !plan.isActive);
      }
    }

    return filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Workout Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create and manage custom workout plans for your clients
          </Typography>
        </Box>
        {!isMobile && (
          <PrimaryButton
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            size="large"
          >
            Create Plan
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
          title="Total Workout Plans"
          value={loading ? '...' : stats.totalPlans}
          change="Workout plans"
          icon={<PlanIcon />}
          color="primary"
        />
        <StatCard
          title="Active Plans"
          value={loading ? '...' : stats.activePlans}
          change="Currently active"
          icon={<WorkoutIcon />}
          color="success"
        />
        <StatCard
          title="Clients with Plans"
          value={loading ? '...' : stats.clientsWithPlans}
          change="Unique clients"
          icon={<GroupIcon />}
          color="info"
        />
        <StatCard
          title="Avg Exercises"
          value={loading ? '...' : stats.avgExercisesPerPlan}
          change="Per plan"
          icon={<ScheduleIcon />}
          color="warning"
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
                placeholder="Search by client name or plan title..."
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
              <TextField
                fullWidth
                select
                label="Filter by Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Plans</MenuItem>
                <MenuItem value="active">Active Plans</MenuItem>
                <MenuItem value="inactive">Inactive Plans</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workout Plans */}
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
        ) : getFilteredPlans().length === 0 ? (
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkoutIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No workout plans found
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchTerm || filterStatus 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by creating your first workout plan!'
              }
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => setShowCreateForm(true)}
            >
              Create First Plan
            </PrimaryButton>
          </CardContent>
        ) : (
          <Box p={2}>
            {getFilteredPlans().map((plan) => (
              <Card 
                key={plan._id} 
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
                        {plan.title}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        Client: {getClientName(plan.client?._id || plan.clientId)}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        label={plan.isActive ? 'Active' : 'Inactive'}
                        color={plan.isActive ? 'success' : 'default'}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowViewPlan(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={plan.isActive ? 'warning' : 'success'}
                        onClick={() => handleToggleActive(plan._id, plan.isActive)}
                      >
                        {plan.isActive ? <EditIcon /> : <PlanIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeletePlan(plan._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Grid container spacing={2} mb={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {plan.duration}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Days/Week
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {plan.daysPerWeek}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Exercises
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {plan.exercises?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Created
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(plan.createdAt || plan.date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {plan.description && (
                    <Typography variant="body2" color="text.secondary">
                      {plan.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Card>

      {/* Mobile FAB */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowCreateForm(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Plan Dialog */}
      <Dialog 
        open={showCreateForm} 
        onClose={() => { setShowCreateForm(false); setFormErrors({}); }}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <WorkoutIcon />
            Create Workout Plan
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleCreatePlan}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Select Client"
                  value={planForm.clientId}
                  onChange={(e) => { setPlanForm({...planForm, clientId: e.target.value}); if (formErrors.clientId) setFormErrors(p => ({...p, clientId: ''})); }}
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

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Plan Title"
                  value={planForm.title}
                  onChange={(e) => { setPlanForm({...planForm, title: e.target.value}); if (formErrors.title) setFormErrors(p => ({...p, title: ''})); }}
                  required
                  error={!!formErrors.title}
                  helperText={formErrors.title || 'Give this plan a descriptive name (e.g. Upper Body Strength)'}
                  placeholder="e.g., Upper Body Strength Training"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  placeholder="Brief description of the workout plan..."
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Days per Week"
                  type="number"
                  value={planForm.daysPerWeek}
                  onChange={(e) => setPlanForm({...planForm, daysPerWeek: parseInt(e.target.value)})}
                  inputProps={{ min: 1, max: 7 }}
                />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Duration"
                  value={planForm.duration}
                  onChange={(e) => setPlanForm({...planForm, duration: e.target.value})}
                >
                  <MenuItem value="2 weeks">2 weeks</MenuItem>
                  <MenuItem value="4 weeks">4 weeks</MenuItem>
                  <MenuItem value="6 weeks">6 weeks</MenuItem>
                  <MenuItem value="8 weeks">8 weeks</MenuItem>
                  <MenuItem value="12 weeks">12 weeks</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="h6">Exercises</Typography>
                </Box>
                {formErrors.exercises && (
                  <Alert severity="error" sx={{ mb: 2 }}>{formErrors.exercises}</Alert>
                )}
                
                {planForm.exercises.map((exercise, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">
                          Exercise {index + 1}
                        </Typography>
                        {planForm.exercises.length > 1 && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeExercise(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Autocomplete
                            freeSolo
                            options={exerciseLibrary}
                            value={exercise.name}
                            onChange={(_, newValue) => updateExercise(index, 'name', newValue || '')}
                            onInputChange={(_, newInputValue) => updateExercise(index, 'name', newInputValue)}
                            renderInput={(params) => (
                              <TextField {...params} label="Exercise Name" fullWidth required />
                            )}
                          />
                        </Grid>
                        
                        <Grid size={{ xs: 3 }}>
                          <TextField
                            fullWidth
                            label="Sets"
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        
                        <Grid size={{ xs: 3 }}>
                          <TextField
                            fullWidth
                            label="Reps"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                            placeholder="10-12"
                          />
                        </Grid>
                        
                        <Grid size={{ xs: 3 }}>
                          <TextField
                            fullWidth
                            label="Weight"
                            value={exercise.weight}
                            onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                            placeholder="25 lbs"
                          />
                        </Grid>
                        
                        <Grid size={{ xs: 3 }}>
                          <TextField
                            fullWidth
                            label="Rest Time"
                            value={exercise.restTime}
                            onChange={(e) => updateExercise(index, 'restTime', e.target.value)}
                            placeholder="60s"
                          />
                        </Grid>
                        
                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            label="Notes"
                            value={exercise.notes}
                            onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                            placeholder="Form cues, modifications, etc."
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}

                <SecondaryButton
                  fullWidth
                  startIcon={<AddIcon />}
                  onClick={addExercise}
                  sx={{ mt: 2 }}
                >
                  Add Exercise
                </SecondaryButton>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <SecondaryButton onClick={() => setShowCreateForm(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit">
              Create Plan
            </PrimaryButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Plan Dialog */}
      <Dialog 
        open={showViewPlan} 
        onClose={() => setShowViewPlan(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPlan && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                <WorkoutIcon />
                {selectedPlan.title}
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Client</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {getClientName(selectedPlan.client?._id || selectedPlan.clientId)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedPlan.isActive ? 'Active' : 'Inactive'} 
                    color={selectedPlan.isActive ? 'success' : 'default'} 
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{selectedPlan.duration}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="text.secondary">Days per Week</Typography>
                  <Typography variant="body1">{selectedPlan.daysPerWeek}</Typography>
                </Grid>
              </Grid>

              {selectedPlan.description && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Description</Typography>
                  <Typography variant="body1">{selectedPlan.description}</Typography>
                </Box>
              )}

              <Typography variant="h6" mb={2}>Exercises ({selectedPlan.exercises?.length || 0})</Typography>
              
              {selectedPlan.exercises?.map((exercise, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {exercise.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">Sets</Typography>
                        <Typography variant="body2">{exercise.sets}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">Reps</Typography>
                        <Typography variant="body2">{exercise.reps}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">Weight</Typography>
                        <Typography variant="body2">{exercise.weight || 'N/A'}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="body2" color="text.secondary">Rest</Typography>
                        <Typography variant="body2">{exercise.restTime}</Typography>
                      </Grid>
                      {exercise.notes && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">Notes</Typography>
                          <Typography variant="body2">{exercise.notes}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )) || (
                <Typography variant="body2" color="text.secondary">
                  No exercises added to this plan.
                </Typography>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <SecondaryButton onClick={() => setShowViewPlan(false)}>
                Close
              </SecondaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardContainer>
  );
};

export default WorkoutPlanManagement;