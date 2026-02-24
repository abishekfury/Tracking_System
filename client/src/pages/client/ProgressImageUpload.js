import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Skeleton,
  Paper,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Photo as PhotoIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
  TrendingUp as ProgressIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import {
  DashboardContainer,
  PageHeader,
  ContentSection,
  ProfessionalCard,
} from '../../components/ui/LayoutComponents';

const ProgressImageUpload = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [progressImages, setProgressImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchProgressImages();
  }, []);

  const fetchProgressImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/progress-images/my-images', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProgressImages(response.data.images || []);
      }
    } catch (error) {
      console.error('Error fetching progress images:', error);
      if (error.response?.status === 404) {
        setProgressImages([]);
        setMessage('No progress images found');
        setMessageType('info');
      } else {
        setMessage('Error loading progress images');
        setMessageType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        setMessageType('error');
        setSelectedFile(null);
        setPreview(null);
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        setMessageType('error');
        setSelectedFile(null);
        setPreview(null);
        return;
      }

      setSelectedFile(file);
      setMessage('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage('Please select an image file');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', description);

      const token = localStorage.getItem('token');
      const response = await axios.post('/progress-images/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setMessage('Progress image uploaded successfully!');
        setMessageType('success');
        setSelectedFile(null);
        setDescription('');
        setPreview(null);
        
        // Refresh the image list
        await fetchProgressImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to upload image. Please try again.');
      }
      setMessageType('error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/progress-images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Image deleted successfully');
      setMessageType('success');
      await fetchProgressImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setMessage('Failed to delete image');
      setMessageType('error');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    const fileInput = document.getElementById('imageFile');
    if (fileInput) fileInput.value = '';
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If URL already includes protocol, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend server URL
    return `http://localhost:5000${imageUrl}`;
  };

  return (
    <DashboardContainer>
      <PageHeader 
        title="Progress Photos" 
        subtitle="Upload and track your fitness transformation journey"
      />

      {message && (
        <Alert 
          severity={messageType} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Upload Section */}
      <ContentSection title="Upload New Progress Photo">
        <ProfessionalCard>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box>
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="imageFile">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                    size="large"
                    sx={{ mb: 2, py: 2 }}
                  >
                    Choose Image
                  </Button>
                </label>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your progress, workout routine, or any notes..."
                  sx={{ mb: 2 }}
                />

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  
                  {selectedFile && (
                    <Button
                      variant="outlined"
                      onClick={clearSelection}
                      disabled={uploading}
                      startIcon={<CloseIcon />}
                    >
                      Clear
                    </Button>
                  )}
                </Box>

                {uploading && (
                  <Box mt={2}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                      Uploading... {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {preview ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.grey[500], 0.1)
                    }}
                  >
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: theme.shape.borderRadius
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {selectedFile?.name}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    height: 300,
                    border: `2px dashed ${theme.palette.grey[300]}`,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.05)
                  }}
                >
                  <PhotoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" textAlign="center">
                    Select an image to see preview
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </ProfessionalCard>
      </ContentSection>

      {/* Progress Images Gallery */}
      <ContentSection title={`Your Progress Gallery (${progressImages.length})`}>
        <ProfessionalCard>
          {loading ? (
            <Grid container spacing={2}>
              {[...Array(6)].map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Skeleton variant="rectangular" height={200} />
                </Grid>
              ))}
            </Grid>
          ) : progressImages.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              py={8}
            >
              <ProgressIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No progress photos yet
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Start your transformation journey by uploading your first progress photo
              </Typography>
            </Box>
          ) : (
            <ImageList variant="masonry" cols={3} gap={16}>
              {progressImages.map((image) => (
                <ImageListItem key={image._id}>
                  <img
                    src={getImageUrl(image.imageUrl)}
                    alt={image.description || 'Progress photo'}
                    loading="lazy"
                    style={{
                      borderRadius: theme.shape.borderRadius,
                      cursor: 'pointer'
                    }}
                    onClick={() => setFullscreenImage(image)}
                  />
                  <ImageListItemBar
                    title={formatDate(image.uploadedAt)}
                    subtitle={image.description}
                    actionIcon={
                      <Box>
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          onClick={() => setFullscreenImage(image)}
                          size="small"
                        >
                          <FullscreenIcon />
                        </IconButton>
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          onClick={() => handleDeleteImage(image._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </ProfessionalCard>
      </ContentSection>

      {/* Fullscreen Image Dialog */}
      <Dialog
        open={!!fullscreenImage}
        onClose={() => setFullscreenImage(null)}
        maxWidth="md"
        fullWidth
      >
        {fullscreenImage && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Progress Photo - {formatDate(fullscreenImage.uploadedAt)}
                </Typography>
                <IconButton onClick={() => setFullscreenImage(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <img
                src={getImageUrl(fullscreenImage.imageUrl)}
                alt={fullscreenImage.description || 'Progress photo'}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              {fullscreenImage.description && (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {fullscreenImage.description}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => handleDeleteImage(fullscreenImage._id)}
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
              <Button onClick={() => setFullscreenImage(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardContainer>
  );
};

export default ProgressImageUpload;
        