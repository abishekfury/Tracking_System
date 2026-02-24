import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkoutPlanManagement = () => {
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewPlan, setShowViewPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workoutData, clientsData) => {
    const totalPlans = workoutData.length;
    const activePlans = workoutData.filter(plan => plan.isActive).length;
    const uniqueClients = new Set(workoutData.map(plan => plan.client._id || plan.client)).size;
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
    
    if (!planForm.clientId || !planForm.title || planForm.exercises.length === 0) {
      alert('Please fill in all required fields and add at least one exercise');
      return;
    }

    try {
      const planData = {
        clientId: planForm.clientId,
        title: planForm.title,
        description: planForm.description,
        daysPerWeek: planForm.daysPerWeek,
        duration: planForm.duration,
        exercises: planForm.exercises.filter(ex => ex.name.trim() !== '')
      };

      await axios.post('/workouts', planData);
      
      setShowCreateForm(false);
      resetForm();
      fetchData();
      alert('Workout plan created successfully!');
    } catch (error) {
      alert('Error creating workout plan: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this workout plan?')) {
      return;
    }

    try {
      await axios.delete(`/workouts/${planId}`);
      fetchData();
      alert('Workout plan deleted successfully!');
    } catch (error) {
      alert('Error deleting workout plan: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTogglePlanStatus = async (planId, currentStatus) => {
    try {
      await axios.put(`/workouts/${planId}`, { isActive: !currentStatus });
      fetchData();
      alert(`Workout plan ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert('Error updating plan status: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
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
  };

  const addExercise = () => {
    setPlanForm({
      ...planForm,
      exercises: [
        ...planForm.exercises,
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
  };

  const removeExercise = (index) => {
    if (planForm.exercises.length > 1) {
      setPlanForm({
        ...planForm,
        exercises: planForm.exercises.filter((_, i) => i !== index)
      });
    }
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = planForm.exercises.map((exercise, i) => 
      i === index ? { ...exercise, [field]: value } : exercise
    );
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
        const clientName = getClientName(plan.client._id || plan.client).toLowerCase();
        const title = plan.title.toLowerCase();
        return clientName.includes(searchTerm.toLowerCase()) ||
               title.includes(searchTerm.toLowerCase());
      });
    }

    if (filterStatus !== '') {
      filtered = filtered.filter(plan => 
        plan.isActive === (filterStatus === 'active')
      );
    }

    return filtered.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  };

  const createQuickPlan = async (clientId, planType) => {
    const quickPlans = {
      beginner: {
        title: 'Beginner Full Body Workout',
        description: 'A comprehensive full-body workout plan for beginners',
        exercises: [
          { name: 'Push-ups', sets: 3, reps: '8-10', weight: 'bodyweight', restTime: '90 seconds' },
          { name: 'Squats', sets: 3, reps: '10-12', weight: 'bodyweight', restTime: '90 seconds' },
          { name: 'Planks', sets: 3, reps: '30 seconds', weight: 'bodyweight', restTime: '60 seconds' },
          { name: 'Lunges', sets: 2, reps: '8 each leg', weight: 'bodyweight', restTime: '60 seconds' },
          { name: 'Mountain Climbers', sets: 3, reps: '20', weight: 'bodyweight', restTime: '60 seconds' }
        ]
      },
      strength: {
        title: 'Strength Training Plan',
        description: 'Intermediate strength building workout plan',
        exercises: [
          { name: 'Deadlifts', sets: 4, reps: '6-8', weight: '70-80% 1RM', restTime: '3 minutes' },
          { name: 'Bench Press', sets: 4, reps: '6-8', weight: '70-80% 1RM', restTime: '3 minutes' },
          { name: 'Squats', sets: 4, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 minutes' },
          { name: 'Pull-ups', sets: 3, reps: '5-8', weight: 'bodyweight+', restTime: '2 minutes' },
          { name: 'Shoulder Press', sets: 3, reps: '8-10', weight: 'moderate', restTime: '90 seconds' }
        ]
      },
      cardio: {
        title: 'Cardio & Conditioning Plan',
        description: 'High-intensity cardiovascular workout plan',
        exercises: [
          { name: 'Burpees', sets: 4, reps: '10-15', weight: 'bodyweight', restTime: '45 seconds' },
          { name: 'Mountain Climbers', sets: 4, reps: '30 seconds', weight: 'bodyweight', restTime: '30 seconds' },
          { name: 'Jump Squats', sets: 4, reps: '15-20', weight: 'bodyweight', restTime: '45 seconds' },
          { name: 'High Knees', sets: 4, reps: '30 seconds', weight: 'bodyweight', restTime: '30 seconds' },
          { name: 'Russian Twists', sets: 3, reps: '20 each side', weight: 'bodyweight', restTime: '45 seconds' }
        ]
      }
    };

    const plan = quickPlans[planType];
    try {
      await axios.post('/workouts', {
        clientId: clientId,
        title: plan.title,
        description: plan.description,
        daysPerWeek: 3,
        duration: '4 weeks',
        exercises: plan.exercises
      });
      
      fetchData();
      alert('Quick workout plan created successfully!');
    } catch (error) {
      alert('Error creating quick plan: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading workout plans...</div>
      </div>
    );
  }

  return (
    <div className="workout-management">
      <div className="page-header">
        <h1>Workout Plan Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Create New Plan
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalPlans}</h3>
            <p>Total Plans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activePlans}</h3>
            <p>Active Plans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.clientsWithPlans}</h3>
            <p>Clients with Plans</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-content">
            <h3>{stats.avgExercisesPerPlan}</h3>
            <p>Avg Exercises/Plan</p>
          </div>
        </div>
      </div>

      {/* Quick Plan Creation */}
      <div className="quick-plan-section">
        <h2>Quick Plan Creation</h2>
        <div className="quick-plan-grid">
          {clients.filter(client => client.isActive).slice(0, 6).map(client => (
            <div key={client._id} className="quick-plan-card">
              <div className="client-info">
                <h4>{client.firstName} {client.lastName}</h4>
                <p>{client.membershipType} membership</p>
              </div>
              <div className="quick-plan-actions">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => createQuickPlan(client._id, 'beginner')}
                >
                  Beginner
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => createQuickPlan(client._id, 'strength')}
                >
                  Strength
                </button>
                <button 
                  className="btn btn-sm btn-warning"
                  onClick={() => createQuickPlan(client._id, 'cardio')}
                >
                  Cardio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters">
          <input
            type="text"
            placeholder="Search by client name or plan title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Plans</option>
            <option value="active">Active Plans</option>
            <option value="inactive">Inactive Plans</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Workout Plans List */}
      <div className="workout-plans-list">
        <h2>Workout Plans</h2>
        {getFilteredPlans().length === 0 ? (
          <div className="no-data">
            <p>No workout plans found.</p>
            {workoutPlans.length === 0 && (
              <p>Start by creating workout plans for your clients!</p>
            )}
          </div>
        ) : (
          <div className="plans-grid">
            {getFilteredPlans().map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.title}</h3>
                  <div className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="plan-info">
                  <p><strong>Client:</strong> {getClientName(plan.client._id || plan.client)}</p>
                  <p><strong>Duration:</strong> {plan.duration}</p>
                  <p><strong>Days/Week:</strong> {plan.daysPerWeek}</p>
                  <p><strong>Exercises:</strong> {plan.exercises?.length || 0}</p>
                  {plan.description && <p><strong>Description:</strong> {plan.description}</p>}
                </div>
                <div className="plan-actions">
                  <button 
                    className="btn btn-info btn-sm"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowViewPlan(true);
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    className={`btn btn-sm ${plan.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleTogglePlanStatus(plan._id, plan.isActive)}
                  >
                    {plan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeletePlan(plan._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>Create New Workout Plan</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Client</label>
                  <select
                    value={planForm.clientId}
                    onChange={(e) => setPlanForm({...planForm, clientId: e.target.value})}
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
                  <label>Plan Title</label>
                  <input
                    type="text"
                    value={planForm.title}
                    onChange={(e) => setPlanForm({...planForm, title: e.target.value})}
                    required
                    className="form-control"
                    placeholder="e.g., Beginner Strength Training"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                  className="form-control"
                  rows="3"
                  placeholder="Brief description of the workout plan..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Days per Week</label>
                  <select
                    value={planForm.daysPerWeek}
                    onChange={(e) => setPlanForm({...planForm, daysPerWeek: parseInt(e.target.value)})}
                    className="form-control"
                  >
                    {[1,2,3,4,5,6,7].map(day => (
                      <option key={day} value={day}>{day} day{day > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={planForm.duration}
                    onChange={(e) => setPlanForm({...planForm, duration: e.target.value})}
                    className="form-control"
                  >
                    <option value="2 weeks">2 weeks</option>
                    <option value="4 weeks">4 weeks</option>
                    <option value="6 weeks">6 weeks</option>
                    <option value="8 weeks">8 weeks</option>
                    <option value="12 weeks">12 weeks</option>
                  </select>
                </div>
              </div>

              <div className="exercises-section">
                <div className="section-header">
                  <h4>Exercises</h4>
                  <button 
                    type="button" 
                    className="btn btn-success btn-sm"
                    onClick={addExercise}
                  >
                    Add Exercise
                  </button>
                </div>

                {planForm.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <div className="exercise-header">
                      <h5>Exercise {index + 1}</h5>
                      {planForm.exercises.length > 1 && (
                        <button 
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeExercise(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Exercise Name</label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => updateExercise(index, 'name', e.target.value)}
                          className="form-control"
                          placeholder="e.g., Push-ups"
                          list={`exercises-${index}`}
                        />
                        <datalist id={`exercises-${index}`}>
                          {exerciseLibrary.map(ex => (
                            <option key={ex} value={ex} />
                          ))}
                        </datalist>
                      </div>
                      <div className="form-group">
                        <label>Sets</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                          className="form-control"
                          min="1"
                          max="10"
                        />
                      </div>
                      <div className="form-group">
                        <label>Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          className="form-control"
                          placeholder="e.g., 10-12 or 30 seconds"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Weight</label>
                        <input
                          type="text"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                          className="form-control"
                          placeholder="e.g., bodyweight, 20kg, 70% 1RM"
                        />
                      </div>
                      <div className="form-group">
                        <label>Rest Time</label>
                        <select
                          value={exercise.restTime}
                          onChange={(e) => updateExercise(index, 'restTime', e.target.value)}
                          className="form-control"
                        >
                          <option value="30 seconds">30 seconds</option>
                          <option value="45 seconds">45 seconds</option>
                          <option value="60 seconds">60 seconds</option>
                          <option value="90 seconds">90 seconds</option>
                          <option value="2 minutes">2 minutes</option>
                          <option value="3 minutes">3 minutes</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Notes</label>
                      <input
                        type="text"
                        value={exercise.notes}
                        onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                        className="form-control"
                        placeholder="Additional instructions..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Workout Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Plan Details Modal */}
      {showViewPlan && selectedPlan && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h3>{selectedPlan.title}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowViewPlan(false);
                  setSelectedPlan(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="plan-details">
                <div className="detail-grid">
                  <div><strong>Client:</strong> {getClientName(selectedPlan.client._id || selectedPlan.client)}</div>
                  <div><strong>Duration:</strong> {selectedPlan.duration}</div>
                  <div><strong>Days/Week:</strong> {selectedPlan.daysPerWeek}</div>
                  <div><strong>Status:</strong> {selectedPlan.isActive ? 'Active' : 'Inactive'}</div>
                </div>
                {selectedPlan.description && (
                  <div className="description">
                    <strong>Description:</strong> {selectedPlan.description}
                  </div>
                )}
                <div className="exercises-list">
                  <h4>Exercises ({selectedPlan.exercises?.length || 0})</h4>
                  {selectedPlan.exercises?.map((exercise, index) => (
                    <div key={index} className="exercise-detail">
                      <h5>{index + 1}. {exercise.name}</h5>
                      <div className="exercise-specs">
                        <span>Sets: {exercise.sets}</span>
                        <span>Reps: {exercise.reps}</span>
                        {exercise.weight && <span>Weight: {exercise.weight}</span>}
                        <span>Rest: {exercise.restTime}</span>
                      </div>
                      {exercise.notes && <p className="exercise-notes">Notes: {exercise.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanManagement;
