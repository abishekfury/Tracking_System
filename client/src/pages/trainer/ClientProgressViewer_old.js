import React, { useState, useEffect } from 'react';

const ClientProgressViewer = () => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [progressImages, setProgressImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [sortBy, setSortBy] = useState('uploadedAt');
  const [order, setOrder] = useState('desc');
  const [selectedClientName, setSelectedClientName] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchProgressImages();
    } else {
      setProgressImages([]);
    }
  }, [selectedClientId, sortBy, order]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setClients(data.clients);
      } else {
        console.error('Failed to fetch clients:', data.message);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressImages = async () => {
    if (!selectedClientId) return;

    setLoadingImages(true);
    try {
      const response = await fetch(
        `/api/progress-images/client/${selectedClientId}?sortBy=${sortBy}&order=${order}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setProgressImages(data.images);
        setSelectedClientName(data.clientName);
      } else {
        console.error('Failed to fetch progress images:', data.message);
        setProgressImages([]);
      }
    } catch (error) {
      console.error('Error fetching progress images:', error);
      setProgressImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value);
    setSelectedClientName('');
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Client Progress Images</h1>
        <p>View and manage client progress photos</p>
      </div>

      <div className="card">
        <h2>Select Client</h2>
        <div className="form-group">
          <label htmlFor="clientSelect">Choose a client to view their progress images:</label>
          <select
            id="clientSelect"
            value={selectedClientId}
            onChange={handleClientChange}
            className="form-input"
          >
            <option value="">-- Select a Client --</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.firstName} {client.lastName} ({client.user.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedClientId && (
        <div className="card">
          <h2>Sort Options</h2>
          <div className="sort-controls">
            <div className="form-group">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
              >
                <option value="uploadedAt">Upload Date</option>
                <option value="description">Description</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="order">Order:</label>
              <select
                id="order"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="form-input"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedClientId && (
        <div className="card">
          <h2>
            Progress Images for {selectedClientName}
            {progressImages.length > 0 && ` (${progressImages.length})`}
          </h2>
          
          {loadingImages ? (
            <div className="loading">Loading progress images...</div>
          ) : progressImages.length === 0 ? (
            <div className="empty-state">
              <p>No progress images found for this client.</p>
              <p>The client can upload progress images from their dashboard.</p>
            </div>
          ) : (
            <div className="images-grid">
              {progressImages.map((image) => (
                <div key={image._id} className="image-item trainer-view">
                  <img
                    src={image.imageUrl}
                    alt={image.description || 'Progress image'}
                    className="progress-image"
                  />
                  <div className="image-info">
                    <p className="image-date">{formatDate(image.uploadedAt)}</p>
                    {image.description && (
                      <p className="image-description">{image.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedClientId && (
        <div className="card">
          <div className="empty-state">
            <h3>Select a client to view their progress images</h3>
            <p>Choose a client from the dropdown above to see their uploaded progress photos.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProgressViewer;