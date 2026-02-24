import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  FitnessCenter as WorkoutIcon,
  Schedule as ScheduleIcon,
  Assignment as PlanIcon,
  ExpandMore as ExpandMoreIcon,
  Timer as TimerIcon,
  Repeat as RepsIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  DashboardContainer,
  PageHeader,
  ContentSection,
  ProfessionalCard,
} from '../../components/ui/LayoutComponents';

const MyWorkoutPlan = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWorkoutPlan = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/workouts/my-plan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.workoutPlan) {
        setWorkoutPlan(response.data.workoutPlan);
      }
    } catch (error) {
      console.error('Error fetching workout plan:', error);
      if (error.response?.status === 404) {
        setError('No active workout plan found. Please contact your trainer.');
      } else {
        setError('Error loading workout plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan();
  }, []);

  if (loading) {
    return (
      <DashboardContainer>
        <PageHeader title="My Workout Plan" subtitle="Your personalized fitness routine" />
        <Box p={3}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height={200} sx={{ mb: 2 }} />
          ))}
        </Box>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <PageHeader title="My Workout Plan" subtitle="Your personalized fitness routine" />
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchWorkoutPlan}>
          Retry
        </Button>
      </DashboardContainer>
    );
  }

  if (!workoutPlan) {
    return (
      <DashboardContainer>
        <PageHeader title="My Workout Plan" subtitle="Your personalized fitness routine" />
        <ProfessionalCard>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
            py={8}
          >
            <WorkoutIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Workout Plan Available
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Your trainer hasn't assigned a workout plan yet.<br />
              Please contact them to get started with your fitness journey.
            </Typography>
          </Box>
        </ProfessionalCard>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <PageHeader 
        title="My Workout Plan"
        subtitle={workoutPlan.title || "Your personalized fitness routine"}
        actions={
          <Box display="flex" gap={1}>
            <Chip 
              icon={<ScheduleIcon />}
              label={`${workoutPlan.daysPerWeek || 0} days/week`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              icon={<TimerIcon />}
              label={workoutPlan.duration || 'Ongoing'}
              color="secondary"
              variant="outlined"
            />
          </Box>
        }
      />

      {/* Plan Overview */}
      <ContentSection title="Plan Overview">
        <ProfessionalCard>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h6" gutterBottom>
                {workoutPlan.title}
              </Typography>
              {workoutPlan.description && (
                <Typography variant="body1" paragraph color="text.secondary">
                  {workoutPlan.description}
                </Typography>
              )}
              
              <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <Chip 
                  label={`${workoutPlan.exercises?.length || 0} Exercises`}
                  icon={<WorkoutIcon />}
                  color="primary"
                />
                <Chip 
                  label={workoutPlan.level || 'Intermediate'}
                  color="secondary"
                />
                <Chip 
                  label={workoutPlan.focus || 'General Fitness'}
                  variant="outlined"
                />
              </Box>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                <Typography variant="subtitle2" gutterBottom>
                  Plan Details
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Created by:</strong> {workoutPlan.createdBy?.username || 'Your Trainer'}
                </Typography>
                <Typography variant="body2">
                  <strong>Last updated:</strong> {new Date(workoutPlan.lastUpdated || workoutPlan.createdAt).toLocaleDateString('en-IN')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </ProfessionalCard>
      </ContentSection>

      {/* Exercises */}
      <ContentSection title={`Exercises (${workoutPlan.exercises?.length || 0})`}>
        {!workoutPlan.exercises || workoutPlan.exercises.length === 0 ? (
          <ProfessionalCard>
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={6}
            >
              <PlanIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                No exercises added to this plan yet
              </Typography>
            </Box>
          </ProfessionalCard>
        ) : (
          <Box>
            {workoutPlan.exercises.map((exercise, index) => (
              <Accordion 
                key={index}
                sx={{ 
                  mb: 1,
                  '&:before': { display: 'none' },
                  boxShadow: theme.shadows[2]
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    '&.Mui-expanded': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04)
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" width="100%">
                    <WorkoutIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box flex={1}>
                      <Typography variant="h6" component="div">
                        {exercise.name}
                      </Typography>
                      <Box display="flex" gap={2} mt={0.5}>
                        <Chip 
                          label={`${exercise.sets} sets`}
                          size="small"
                          icon={<RepsIcon />}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`${exercise.reps} reps`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                        {exercise.weight && (
                          <Chip 
                            label={exercise.weight}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {exercise.description && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Instructions:
                        </Typography>
                        <Typography variant="body2" paragraph color="text.secondary">
                          {exercise.description}
                        </Typography>
                      </>
                    )}
                    
                    {exercise.notes && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.notes}
                        </Typography>
                      </>
                    )}
                    
                    {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Target Muscles:
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {exercise.targetMuscles.map((muscle, idx) => (
                            <Chip 
                              key={idx}
                              label={muscle}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </ContentSection>
    </DashboardContainer>
  );
};

export default MyWorkoutPlan;
                 