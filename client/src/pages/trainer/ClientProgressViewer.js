import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  CardMedia,
  Chip,
  Button,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  SortByAlpha as SortIcon,
} from '@mui/icons-material';
import axios from 'axios';
import {
  DashboardContainer,
  StatsGrid,
  StatCard,
  StatsCard,
  SecondaryButton,
} from '../../components/ui';

const ClientProgressViewer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [progressImages, setProgressImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [order, setOrder] = useState('desc');
  const [selectedClientName, setSelectedClientName] = useState('');
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If URL already includes protocol, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Otherwise, prepend server URL
    return `https://tracking-system-a7ib.onrender.com${imageUrl}`;
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchProgressImages();
    } else {
      setProgressImages([]);
      setSelectedClientName('');
    }
  }, [selectedClientId, sortBy, order]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/clients');
      
      if (response.data.success) {
        setClients(response.data.clients);
      } else {
        console.error('Failed to fetch clients:', response.data.message);
        setError('Failed to load clients');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressImages = async () => {
    if (!selectedClientId) return;

    setLoadingImages(true);
    setError('');
    try {
      const response = await axios.get(
        `/progress-images/client/${selectedClientId}?sortBy=${sortBy}&order=${order}`
      );
      
      if (response.data.success) {
        setProgressImages(response.data.images);
        setSelectedClientName(response.data.clientName);
      } else {
        console.error('Failed to fetch progress images:', response.data.message);
        setProgressImages([]);
        setError('Failed to load progress images');
      }
    } catch (error) {
      console.error('Error fetching progress images:', error);
      setProgressImages([]);
      setError('Failed to load progress images');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageStats = () => {
    if (!progressImages.length) return { total: 0, thisMonth: 0, latest: null };
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonth = progressImages.filter(img => 
      img.uploadedAt.slice(0, 7) === currentMonth
    ).length;
    
    const latest = progressImages.length > 0 ? progressImages[0] : null;
    
    return {
      total: progressImages.length,
      thisMonth,
      latest: latest ? new Date(latest.uploadedAt).toLocaleDateString() : 'N/A'
    };
  };

  const stats = getImageStats();

  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Client Progress Viewer
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and track client progress photos and transformations
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Client Selection */}
      <Card 
        elevation={0} 
        sx={{ 
          border: `1px solid ${theme.palette.divider}`, 
          mb: 3 
        }}
      >
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Select Client"
                value={selectedClientId}
                onChange={handleClientChange}
                disabled={loading}
              >
                <MenuItem value="">Choose a client...</MenuItem>
                {clients.map(client => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.firstName} {client.lastName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {selectedClientId && (
              <>
                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    label="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="uploadedAt">Upload Date</MenuItem>
                    <MenuItem value="notes">Notes</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 6, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    label="Order"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  >
                    <MenuItem value="desc">Newest First</MenuItem>
                    <MenuItem value="asc">Oldest First</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {selectedClientId && (
        <>
          {/* Stats Cards */}
          <StatsGrid>
            <StatCard>
              <StatsCard
                title="Total Images"
                value={loadingImages ? <Skeleton width={40} /> : stats.total}
                icon={<PhotoIcon />}
                color="primary"
                trend={{
                  direction: 'up',
                  value: 'Progress photos',
                  icon: <ImageIcon fontSize="small" />
                }}
              />
            </StatCard>
            
            <StatCard>
              <StatsCard
                title="This Month"
                value={loadingImages ? <Skeleton width={40} /> : stats.thisMonth}
                icon={<CalendarIcon />}
                color="success"
                trend={{
                  direction: 'up',
                  value: 'New uploads',
                  icon: <TrendingUpIcon fontSize="small" />
                }}
              />
            </StatCard>
            
            <StatCard>
              <StatsCard
                title="Latest Upload"
                value={loadingImages ? <Skeleton width={80} /> : stats.latest}
                icon={<CalendarIcon />}
                color="info"
                trend={{
                  direction: 'neutral',
                  value: 'Most recent',
                  icon: <CalendarIcon fontSize="small" />
                }}
              />
            </StatCard>
            
            <StatCard>
              <StatsCard
                title="Client"
                value={loadingImages ? <Skeleton width={80} /> : selectedClientName || 'Loading...'}
                icon={<PhotoIcon />}
                color="warning"
                trend={{
                  direction: 'neutral',
                  value: 'Selected client',
                  icon: <PhotoIcon fontSize="small" />
                }}
              />
            </StatCard>
          </StatsGrid>

          {/* Progress Images */}
          <Card 
            elevation={0}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Progress Photos
                </Typography>
                <Chip 
                  icon={<SortIcon />}
                  label={`${progressImages.length} images`}
                  variant="outlined"
                />
              </Box>

              {loadingImages ? (
                <Grid container spacing={2}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Card>
                        <Skeleton variant="rectangular" height={200} />
                        <CardContent>
                          <Skeleton variant="text" width="60%" />
                          <Skeleton variant="text" width="40%" />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : progressImages.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <PhotoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No progress images found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClientName} hasn't uploaded any progress photos yet.
                  </Typography>
                </Box>
              ) : isMobile ? (
                // Mobile: Grid Layout
                <Grid container spacing={2}>
                  {progressImages.map((image, index) => (
                    <Grid size={{ xs: 6 }} key={image._id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: theme.shadows[4]
                          }
                        }}
                        onClick={() => handleImageClick(image)}
                      >
                        <CardMedia
                          component="img"
                          height="150"
                          image={image.imageUrl}
                          alt={`Progress ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(image.uploadedAt)}
                          </Typography>
                          {image.notes && (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {image.notes.length > 30 ? `${image.notes.substring(0, 30)}...` : image.notes}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                // Desktop: Image List
                <ImageList variant="masonry" cols={4} gap={16}>
                  {progressImages.map((image, index) => (
                    <ImageListItem 
                      key={image._id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          '& .MuiImageListItemBar-root': {
                            opacity: 1
                          }
                        }
                      }}
                      onClick={() => handleImageClick(image)}
                    >
                      <img
                        src={getImageUrl(image.imageUrl)}
                        alt={`Progress ${index + 1}`}
                        loading="lazy"
                        style={{ 
                          borderRadius: theme.shape.borderRadius,
                          maxHeight: 300,
                          objectFit: 'cover'
                        }}
                      />
                      <ImageListItemBar
                        title={formatDate(image.uploadedAt)}
                        subtitle={image.notes || 'No notes'}
                        sx={{ 
                          opacity: 0.8,
                          transition: 'opacity 0.2s',
                          '& .MuiImageListItemBar-title': {
                            fontSize: '0.875rem'
                          },
                          '& .MuiImageListItemBar-subtitle': {
                            fontSize: '0.75rem'
                          }
                        }}
                        actionIcon={
                          <IconButton
                            sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(image);
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        }
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Image Viewer Dialog */}
      <Dialog
        open={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedImage && (
          <>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <IconButton
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8, 
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                  }
                }}
                onClick={() => setShowImageDialog(false)}
              >
                <CloseIcon />
              </IconButton>
              
              <img
                src={getImageUrl(selectedImage.imageUrl)}
                alt="Progress"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
              
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Upload Date: {formatDate(selectedImage.uploadedAt)}
                </Typography>
                
                {selectedImage.notes && (
                  <Typography variant="body1" color="text.secondary" mb={2}>
                    Notes: {selectedImage.notes}
                  </Typography>
                )}
                
                <Chip 
                  label={`Client: ${selectedClientName}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
              <SecondaryButton
                startIcon={<DownloadIcon />}
                onClick={() => window.open(getImageUrl(selectedImage.imageUrl), '_blank')}
              >
                Download
              </SecondaryButton>
              <SecondaryButton onClick={() => setShowImageDialog(false)}>
                Close
              </SecondaryButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardContainer>
  );
};

export default ClientProgressViewer;