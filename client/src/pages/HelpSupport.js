import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Alert,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  QuestionAnswer as FaqIcon,
  ContactSupport as ContactIcon,
  VideoLibrary as VideoIcon,
  Download as DownloadIcon,
  BugReport as BugIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  DashboardContainer,
  PageHeader,
  ProfessionalCard,
  ResponsiveGrid,
  GridItem,
  ContentSection,
} from '../components/ui/LayoutComponents';
import { useAuth } from '../context/AuthContext';

const HelpSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  });
  const [submitMessage, setSubmitMessage] = useState('');

  const faqData = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I register as a new member?',
          answer: 'Visit our gym location or contact your trainer to create an account. You will need to provide your basic information, emergency contact details, and complete a health questionnaire. Our staff will guide you through the membership plans and help you choose the best option for your fitness goals.',
        },
        {
          question: 'What are the different membership plans available?',
          answer: 'We offer various membership plans: Basic Plan (₹1,500/month) - Access to gym equipment and basic facilities. Premium Plan (₹2,500/month) - Includes personal trainer sessions and group classes. VIP Plan (₹4,000/month) - Unlimited access with nutrition counseling and priority booking.',
        },
        {
          question: 'How do I check my attendance and payment history?',
          answer: 'Log in to your account and navigate to \"My Attendance\" or \"My Payments\" from the sidebar menu. You can view detailed records, download statements, and track your gym visit patterns.',
        },
      ],
    },
    {
      category: 'Payment & Billing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash, UPI payments (Google Pay, PhonePe, Paytm), credit/debit cards, bank transfers, and online banking. Monthly membership fees can be paid through any of these methods.',
        },
        {
          question: 'When is my monthly fee due?',
          answer: 'Your monthly fee is due on the same date each month as your registration date. You will receive reminder notifications 3 days before the due date via email and SMS.',
        },
        {
          question: 'Can I freeze my membership temporarily?',
          answer: 'Yes, memberships can be frozen for medical reasons, travel, or other valid circumstances. Contact your trainer or visit the gym office to process a membership freeze. Fees may apply based on the duration.',
        },
      ],
    },
    {
      category: 'Workout & Training',
      questions: [
        {
          question: 'How do I get a personalized workout plan?',
          answer: 'Your assigned trainer will create a customized workout plan based on your fitness goals, current fitness level, and any health considerations. The plan will be available in your dashboard under \"My Workout Plan\".',
        },
        {
          question: 'Can I change my workout plan?',
          answer: 'Yes, workout plans can be modified based on your progress and changing goals. Discuss with your trainer during regular check-ins or request changes through the app.',
        },
        {
          question: 'How do I track my workout progress?',
          answer: 'Use the \"Progress Upload\" feature to share photos, measurements, and achievements. Your trainer will monitor your progress and adjust your plan accordingly.',
        },
      ],
    },
    {
      category: 'Technical Support',
      questions: [
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'Click on \"Forgot Password\" on the login page and enter your registered email address. You will receive a password reset link via email. Follow the instructions to create a new password.',
        },
        {
          question: 'The app is not working properly on my phone.',
          answer: 'Try closing and reopening the app, check your internet connection, and ensure you have the latest version. If problems persist, clear your browser cache or contact technical support.',
        },
        {
          question: 'How do I update my personal information?',
          answer: 'Go to Settings > Profile Settings to update your personal information, contact details, and preferences. Changes to membership plans require trainer approval.',
        },
      ],
    },
  ];

  const contactMethods = [
    {
      title: 'Phone Support',
      description: 'Call our support team for immediate assistance',
      contact: '+91 98765 43210',
      hours: 'Mon-Sat, 6 AM - 10 PM',
      icon: <PhoneIcon />,
      color: 'primary',
    },
    {
      title: 'WhatsApp Support',
      description: 'Quick help via WhatsApp messaging',
      contact: '+91 98765 43210',
      hours: '24/7 Automated + Live Chat',
      icon: <WhatsAppIcon />,
      color: 'success',
    },
    {
      title: 'Email Support',
      description: 'Send detailed queries via email',
      contact: 'support@fittrackpro.com',
      hours: 'Response within 24 hours',
      icon: <EmailIcon />,
      color: 'info',
    },
  ];

  const quickActions = [
    {
      title: 'Video Tutorials',
      description: 'Watch how-to videos and guides',
      icon: <VideoIcon />,
      action: () => window.open('https://youtube.com/@fittrackpro', '_blank'),
    },
    {
      title: 'Download User Manual',
      description: 'Complete guide in PDF format',
      icon: <DownloadIcon />,
      action: () => {
        // Simulate PDF download
        alert('User manual will be downloaded shortly');
      },
    },
    {
      title: 'Report a Bug',
      description: 'Found an issue? Let us know',
      icon: <BugIcon />,
      action: () => setActiveTab('contact'),
    },
    {
      title: 'Rate Our App',
      description: 'Share your feedback',
      icon: <StarIcon />,
      action: () => {
        alert('Thank you for your interest! Rating feature coming soon.');
      },
    },
  ];

  const handleContactSubmit = () => {
    if (!contactForm.subject || !contactForm.message) {
      setSubmitMessage('Please fill in all required fields.');
      return;
    }
    
    setSubmitMessage('Your message has been sent successfully! We will get back to you within 24 hours.');
    setContactForm({ subject: '', message: '', priority: 'medium' });
    setTimeout(() => setSubmitMessage(''), 5000);
  };

  const renderFAQ = () => (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Frequently Asked Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Find answers to common questions about FitTrack Pro
      </Typography>
      
      {faqData.map((category, categoryIndex) => (
        <Box key={category.category} sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }} color="primary">
            {category.category}
          </Typography>
          {category.questions.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={500}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ))}
    </Box>
  );

  const renderContactForm = () => (
    <ProfessionalCard title="Contact Support" subtitle="Send us a message and we'll get back to you soon">
      <Box sx={{ mt: 3 }}>
        {submitMessage && (
          <Alert 
            severity={submitMessage.includes('successfully') ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
          >
            {submitMessage}
          </Alert>
        )}
        
        <ResponsiveGrid spacing={3}>
          <GridItem xs={12}>
            <TextField
              fullWidth
              label="Subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              required
            />
          </GridItem>
          <GridItem xs={12}>
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={6}
              value={contactForm.message}
              onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Please describe your issue in detail..."
              required
            />
          </GridItem>
          <GridItem xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={contactForm.priority}
              onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
              SelectProps={{ native: true }}
            >
              <option value="low">Low - General Question</option>
              <option value="medium">Medium - Need Help</option>
              <option value="high">High - Issue Blocking Usage</option>
              <option value="urgent">Urgent - Critical Problem</option>
            </TextField>
          </GridItem>
        </ResponsiveGrid>

        <Box display="flex" gap={2} mt={4}>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleContactSubmit}
          >
            Send Message
          </Button>
          <Button
            variant="outlined"
            onClick={() => setContactForm({ subject: '', message: '', priority: 'medium' })}
          >
            Clear Form
          </Button>
        </Box>
      </Box>
    </ProfessionalCard>
  );

  const renderContactMethods = () => (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Contact Information
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Get in touch with our support team through your preferred method
      </Typography>
      
      <ResponsiveGrid spacing={3}>
        {contactMethods.map((method, index) => (
          <GridItem key={index} xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: `${method.color}.main`,
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {method.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {method.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {method.description}
                </Typography>
                <Chip
                  label={method.contact}
                  color={method.color}
                  sx={{ mb: 1, fontWeight: 500 }}
                />
                <Typography variant="caption" display="block" color="text.secondary">
                  <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  {method.hours}
                </Typography>
              </CardContent>
            </Card>
          </GridItem>
        ))}
      </ResponsiveGrid>
    </Box>
  );

  const renderQuickActions = () => (
    <ContentSection title="Quick Actions">
      <ResponsiveGrid spacing={2}>
        {quickActions.map((action, index) => (
          <GridItem key={index} xs={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                height: 100,
                flexDirection: 'column',
                gap: 1,
                py: 2,
              }}
              onClick={action.action}
            >
              <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main' }}>
                {action.icon}
              </Avatar>
              <Box textAlign="center">
                <Typography variant="body2" fontWeight={600} noWrap>
                  {action.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {action.description}
                </Typography>
              </Box>
            </Button>
          </GridItem>
        ))}
      </ResponsiveGrid>
    </ContentSection>
  );

  return (
    <DashboardContainer>
      <PageHeader
        title="Help & Support"
        subtitle="Get help, find answers, and contact our support team"
        actions={[
          <Button
            key="back"
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>,
        ]}
      />

      {/* Quick Actions */}
      {renderQuickActions()}

      {/* Navigation Tabs */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant={activeTab === 'faq' ? 'contained' : 'outlined'}
            startIcon={<FaqIcon />}
            onClick={() => setActiveTab('faq')}
            sx={{ mb: 1 }}
          >
            FAQ
          </Button>
          <Button
            variant={activeTab === 'contact' ? 'contained' : 'outlined'}
            startIcon={<ContactIcon />}
            onClick={() => setActiveTab('contact')}
            sx={{ mb: 1 }}
          >
            Contact Support
          </Button>
          <Button
            variant={activeTab === 'methods' ? 'contained' : 'outlined'}
            startIcon={<PhoneIcon />}
            onClick={() => setActiveTab('methods')}
            sx={{ mb: 1 }}
          >
            Contact Info
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box>
        {activeTab === 'faq' && renderFAQ()}
        {activeTab === 'contact' && renderContactForm()}
        {activeTab === 'methods' && renderContactMethods()}
      </Box>

      {/* Additional Information */}
      <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'grey.200' }}>
        <ResponsiveGrid spacing={3}>
          <GridItem xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Office Hours
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Monday - Saturday"
                  secondary="6:00 AM - 10:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Sunday"
                  secondary="8:00 AM - 8:00 PM"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Public Holidays"
                  secondary="Limited Hours (Call for details)"
                />
              </ListItem>
            </List>
          </GridItem>
          <GridItem xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Emergency Contact
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              For urgent matters outside office hours, please contact:
            </Typography>
            <Chip
              icon={<PhoneIcon />}
              label="+91 98765 43210"
              color="error"
              sx={{ mr: 1, mb: 1 }}
            />
            <Typography variant="caption" display="block" color="text.secondary">
              Emergency support available 24/7
            </Typography>
          </GridItem>
        </ResponsiveGrid>
      </Box>
    </DashboardContainer>
  );
};

export default HelpSupport;