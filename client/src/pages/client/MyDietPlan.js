import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Restaurant as DietIcon,
  LocalFireDepartment as CaloriesIcon,
  SportsGymnastics as ProteinIcon,
  Grain as CarbsIcon,
  WaterDrop as FatsIcon,
  WaterDrop,
  Schedule as TimeIcon,
  Notes as NotesIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  DashboardContainer,
  PageHeader,
  ContentSection,
  ProfessionalCard,
  StatsGrid,
  StatCard,
} from '../../components/ui/LayoutComponents';
import { formatDate } from '../../utils/formatters';

const MyDietPlan = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDietPlan();
  }, []);

  const fetchDietPlan = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/diet-plans/my-plan');
      
      if (response.data.success) {
        setDietPlan(response.data.dietPlan);
      }
    } catch (error) {
      console.error('Error fetching diet plan:', error);
      if (error.response?.status === 404) {
        setError('No diet plan assigned yet');
      } else {
        setError('Failed to load your diet plan');
      }
    } finally {
      setLoading(false);
    }
  };

  const getGoalColor = (goal) => {
    switch (goal) {
      case 'weight-loss': return 'error';
      case 'weight-gain': return 'success';
      case 'muscle-gain': return 'primary';
      case 'maintenance': return 'info';
      case 'athletic-performance': return 'secondary';
      default: return 'default';
    }
  };

  const getGoalLabel = (goal) => {
    switch (goal) {
      case 'weight-loss': return 'Weight Loss';
      case 'weight-gain': return 'Weight Gain';
      case 'muscle-gain': return 'Muscle Gain';
      case 'maintenance': return 'Maintenance';
      case 'athletic-performance': return 'Athletic Performance';
      default: return goal;
    }
  };

  const getMealTimingLabel = (timing) => {
    switch (timing) {
      case 'breakfast': return 'Breakfast';
      case 'morning-snack': return 'Morning Snack';
      case 'lunch': return 'Lunch';
      case 'evening-snack': return 'Evening Snack';
      case 'dinner': return 'Dinner';
      case 'post-workout': return 'Post Workout';
      default: return timing;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <PageHeader 
          title="My Diet Plan"
          subtitle="Your personalized nutrition plan"
        />
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      </DashboardContainer>
    );
  }

  if (error || !dietPlan) {
    return (
      <DashboardContainer>
        <PageHeader 
          title="My Diet Plan"
          subtitle="Your personalized nutrition plan"
        />
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
              No Diet Plan Available
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {error || "You don't have an active diet plan yet. Please contact your trainer to get one assigned."}
            </Typography>
          </Box>
        </ProfessionalCard>
      </DashboardContainer>
    );
  }

  const totalMacros = dietPlan.macroTargets || {};
  const totalCalories = dietPlan.dailyCalorieTarget || 0;

  return (
    <DashboardContainer>
      <PageHeader 
        title="My Diet Plan"
        subtitle={dietPlan.title}
        actions={
          <Chip 
            label={getGoalLabel(dietPlan.goal)}
            color={getGoalColor(dietPlan.goal)}
          />
        }
      />

      {/* Plan Overview */}
      <ContentSection title="Plan Overview">
        <ProfessionalCard>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h6" gutterBottom>
                {dietPlan.title}
              </Typography>
              {dietPlan.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {dietPlan.description}
                </Typography>
              )}
              
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <Chip 
                  label={`Goal: ${getGoalLabel(dietPlan.goal)}`}
                  color={getGoalColor(dietPlan.goal)}
                />
                {dietPlan.duration && (
                  <Chip 
                    label={`Duration: ${dietPlan.duration}`}
                    variant="outlined"
                  />
                )}
                <Chip 
                  label={`Water: ${dietPlan.waterIntake || 8} glasses/day`}
                  icon={<WaterDrop />}
                  variant="outlined"
                />
              </Box>

              {dietPlan.notes && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <NotesIcon sx={{ mr: 1, fontSize: 'small' }} />
                    Instructions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dietPlan.notes}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Created by: {dietPlan.createdBy?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {formatDate(dietPlan.lastUpdated)}
              </Typography>
            </Grid>
          </Grid>
        </ProfessionalCard>
      </ContentSection>

      {/* Daily Targets */}
      {(totalCalories > 0 || Object.keys(totalMacros).length > 0) && (
        <ContentSection title="Daily Targets">
          <StatsGrid>
            {totalCalories > 0 && (
              <StatCard
                title="Calorie Target"
                value={totalCalories}
                unit="kcal"
                icon={<CaloriesIcon />}
                color="error"
              />
            )}
            {totalMacros.protein > 0 && (
              <StatCard
                title="Protein"
                value={totalMacros.protein}
                unit="g"
                icon={<ProteinIcon />}
                color="primary"
              />
            )}
            {totalMacros.carbs > 0 && (
              <StatCard
                title="Carbohydrates"
                value={totalMacros.carbs}
                unit="g"
                icon={<CarbsIcon />}
                color="warning"
              />
            )}
            {totalMacros.fats > 0 && (
              <StatCard
                title="Fats"
                value={totalMacros.fats}
                unit="g"
                icon={<FatsIcon />}
                color="info"
              />
            )}
          </StatsGrid>
        </ContentSection>
      )}

      {/* Meal Plan */}
      {dietPlan.meals && dietPlan.meals.length > 0 && (
        <ContentSection title="Meal Plan">
          <Grid container spacing={3}>
            {dietPlan.meals.map((meal, index) => (
              <Grid size={{ xs: 12, md: 6 }} key={index}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Typography variant="h6" gutterBottom>
                        {meal.name}
                      </Typography>
                      <Chip 
                        label={getMealTimingLabel(meal.timing)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    {meal.description && (
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {meal.description}
                      </Typography>
                    )}

                    {/* Nutrition Info */}
                    {(meal.calories || meal.protein || meal.carbs || meal.fats) && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Nutrition (per serving)
                        </Typography>
                        <Grid container spacing={2}>
                          {meal.calories && (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2">
                                Calories: {meal.calories} kcal
                              </Typography>
                            </Grid>
                          )}
                          {meal.protein && (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2">
                                Protein: {meal.protein}g
                              </Typography>
                            </Grid>
                          )}
                          {meal.carbs && (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2">
                                Carbs: {meal.carbs}g
                              </Typography>
                            </Grid>
                          )}
                          {meal.fats && (
                            <Grid size={{ xs: 6 }}>
                              <Typography variant="body2">
                                Fats: {meal.fats}g
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    )}

                    {/* Ingredients */}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2">
                            Ingredients ({meal.ingredients.length})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List dense>
                            {meal.ingredients.map((ingredient, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <CheckIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${ingredient.name}`}
                                  secondary={`${ingredient.quantity} ${ingredient.unit || ''}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {/* Instructions */}
                    {meal.instructions && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle2">
                            Preparation Instructions
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2">
                            {meal.instructions}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </ContentSection>
      )}

      {/* Restrictions & Supplements */}
      <Grid container spacing={3}>
        {dietPlan.restrictions && dietPlan.restrictions.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ContentSection title="Dietary Restrictions">
              <ProfessionalCard>
                <List>
                  {dietPlan.restrictions.map((restriction, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <NotesIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={restriction} />
                    </ListItem>
                  ))}
                </List>
              </ProfessionalCard>
            </ContentSection>
          </Grid>
        )}

        {dietPlan.supplements && dietPlan.supplements.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <ContentSection title="Supplements">
              <ProfessionalCard>
                <List>
                  {dietPlan.supplements.map((supplement, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={supplement.name}
                        secondary={
                          <Box>
                            {supplement.dosage && (
                              <Typography variant="body2">
                                Dosage: {supplement.dosage}
                              </Typography>
                            )}
                            {supplement.timing && (
                              <Typography variant="body2">
                                Timing: {supplement.timing}
                              </Typography>
                            )}
                            {supplement.instructions && (
                              <Typography variant="body2" color="text.secondary">
                                {supplement.instructions}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </ProfessionalCard>
            </ContentSection>
          </Grid>
        )}
      </Grid>
    </DashboardContainer>
  );
};

export default MyDietPlan;
