import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  ContactPhone as ContactIcon,
  CreditCard as MembershipIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ContactEmergency as EmergencyIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  DashboardContainer,
  PrimaryButton,
  SecondaryButton,
  FormSection,
} from '../../components/ui';

const EditClient = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const v = String(value || '').trim();
    switch (name) {
      case 'firstName':
        if (!v) return 'First name is required';
        if (!/^[a-zA-Z\s'\-]{2,}$/.test(v)) return 'Enter a valid first name (letters only)';
        return '';
      case 'lastName':
        if (!v) return 'Last name is required';
        if (!/^[a-zA-Z\s'\-]{2,}$/.test(v)) return 'Enter a valid last name (letters only)';
        return '';
      case 'phone':
        if (!v) return 'Phone number is required';
        if (!/^[+]?[\d\s\-(]{8,15}$/.test(v)) return 'Enter a valid phone number (8–15 digits)';
        return '';
      case 'emergencyContact.name':
        if (!v) return 'Emergency contact name is required';
        return '';
      case 'emergencyContact.phone':
        if (!v) return 'Emergency contact phone is required';
        if (!/^[+]?[\d\s\-(]{8,15}$/.test(v)) return 'Enter a valid phone number';
        return '';
      default:
        return '';
    }
  };
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    membershipType: 'monthly',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    isActive: true
  });

  const steps = [
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Basic personal details'
    },
    {
      label: 'Contact & Address',
      icon: <ContactIcon />,
      description: 'Contact information and address'
    },
    {
      label: 'Membership & Emergency',
      icon: <MembershipIcon />,
      description: 'Membership settings and emergency contact'
    }
  ];

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/clients/${id}`);
      
      if (response.data.success) {
        const client = response.data.client;
        setFormData({
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          phone: client.phone || '',
          address: client.address || '',
          dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : '',
          membershipType: client.membershipType || 'monthly',
          emergencyContact: {
            name: client.emergencyContact?.name || '',
            phone: client.emergencyContact?.phone || '',
            relationship: client.emergencyContact?.relationship || ''
          },
          isActive: client.isActive !== undefined ? client.isActive : true
        });
      } else {
        setError('Client not found');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      setError('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateCurrentStep = () => {
    setError('');
    const newErrors = {};

    switch (activeStep) {
      case 0:
        ['firstName', 'lastName'].forEach(f => {
          const err = validateField(f, formData[f]);
          if (err) newErrors[f] = err;
        });
        break;
      case 1: {
        const phoneErr = validateField('phone', formData.phone);
        if (phoneErr) newErrors.phone = phoneErr;
        break;
      }
      case 2: {
        const ecName = validateField('emergencyContact.name', formData.emergencyContact.name);
        const ecPhone = validateField('emergencyContact.phone', formData.emergencyContact.phone);
        if (ecName) newErrors['emergencyContact.name'] = ecName;
        if (ecPhone) newErrors['emergencyContact.phone'] = ecPhone;
        break;
      }
      default:
        break;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError('Please fix the highlighted errors before continuing.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const dataToSubmit = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
      };
      
      const response = await axios.put(`/clients/${id}`, dataToSubmit);
      
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/trainer/clients');
        }, 2000);
      } else {
        setError('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      setError(error.response?.data?.message || 'Failed to update client');
    } finally {
      setSaving(false);
    }
  };

  const handleBackToClients = () => {
    navigate('/trainer/clients');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <FormSection title="Personal Information" icon={<PersonIcon />}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        dateOfBirth: newValue ? newValue.toISOString().split('T')[0] : ''
                      }));
                    }}
                    disableFuture
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Optional — member must be at least 13 years old',
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </FormSection>
        );

      case 1:
        return (
          <FormSection title="Contact & Address Information" icon={<ContactIcon />}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  error={!!errors.phone}
                  helperText={errors.phone || 'Include country code (e.g. +91 98765 43210)'}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  helperText="Complete address for correspondence"
                />
              </Grid>
            </Grid>
          </FormSection>
        );

      case 2:
        return (
          <Box>
            <FormSection title="Membership Settings" icon={<MembershipIcon />}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Membership Type"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="monthly">Monthly - ₹3000/month</MenuItem>
                    <MenuItem value="quarterly">Quarterly - ₹8000/3 months</MenuItem>
                    <MenuItem value="yearly">Yearly - ₹30000/year</MenuItem>
                    <MenuItem value="basic">Basic - ₹2000/month</MenuItem>
                    <MenuItem value="premium">Premium - ₹5000/month</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="isActive"
                    value={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value }))}
                    required
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </FormSection>

            <Divider sx={{ my: 4 }} />

            <FormSection title="Emergency Contact" icon={<EmergencyIcon />}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Name"
                    name="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors['emergencyContact.name']}
                    helperText={errors['emergencyContact.name']}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact Phone"
                    name="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    error={!!errors['emergencyContact.phone']}
                    helperText={errors['emergencyContact.phone']}
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    select
                    label="Relationship"
                    name="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="parent">Parent</MenuItem>
                    <MenuItem value="spouse">Spouse</MenuItem>
                    <MenuItem value="sibling">Sibling</MenuItem>
                    <MenuItem value="friend">Friend</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </FormSection>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </DashboardContainer>
    );
  }

  if (success) {
    return (
      <DashboardContainer>
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <SaveIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Client Updated Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {formData.firstName} {formData.lastName}'s information has been updated.
            </Typography>
          </CardContent>
        </Card>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton 
          onClick={handleBackToClients}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Edit Client
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update {formData.firstName} {formData.lastName}'s information and membership details
          </Typography>
        </Box>
      </Box>

      {/* Stepper */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={step.icon}
                  optional={
                    <Typography variant="caption">
                      {step.description}
                    </Typography>
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form Content */}
      <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {renderStepContent(activeStep)}

            {/* Navigation Buttons */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              mt={4}
              pt={3}
              borderTop={`1px solid ${theme.palette.divider}`}
            >
              <Box>
                {activeStep > 0 && (
                  <SecondaryButton
                    onClick={handleBack}
                    disabled={saving}
                  >
                    Previous
                  </SecondaryButton>
                )}
              </Box>

              <Box display="flex" gap={2}>
                <SecondaryButton
                  onClick={handleBackToClients}
                  disabled={saving}
                >
                  Cancel
                </SecondaryButton>

                {activeStep === steps.length - 1 ? (
                  <PrimaryButton
                    type="submit"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    size="large"
                  >
                    {saving ? 'Updating...' : 'Update Client'}
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    onClick={handleNext}
                    disabled={saving}
                    size="large"
                  >
                    Next Step
                  </PrimaryButton>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </DashboardContainer>
  );
};

export default EditClient;