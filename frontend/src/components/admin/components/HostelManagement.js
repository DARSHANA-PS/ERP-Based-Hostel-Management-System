import React, { useState, useEffect } from 'react';
import './HostelManagement.css';

const HostelManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [wardens, setWardens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    hostelName: '',
    hostelCode: '',
    hostelType: '',
    wardenId: '',
    totalFloors: '',
    totalRooms: '',
    studentsPerRoom: '',
    perStudentAmount: '', // Add this field
    location: '',
    facilities: '',
    contactNumber: '',
    email: '',
    hostelImage: null,
    hostelVideo: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchHostels();
    fetchWardens();
  }, []);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hostels/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHostels(data.data);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWardens = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/all-wardens', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWardens(data.data.filter(w => w.status === 'approved'));
      }
    } catch (error) {
      console.error('Error fetching wardens:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
      
      // Create preview for images
      if (name === 'hostelImage' && file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
      
      // Create preview for videos
      if (name === 'hostelVideo' && file) {
        const videoUrl = URL.createObjectURL(file);
        setVideoPreview(videoUrl);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hostelName) newErrors.hostelName = 'Hostel name is required';
    if (!formData.hostelCode) newErrors.hostelCode = 'Hostel code is required';
    if (!formData.hostelType) newErrors.hostelType = 'Hostel type is required';
    if (!formData.wardenId) newErrors.wardenId = 'Please select a warden';
    if (!formData.totalFloors || formData.totalFloors < 1) newErrors.totalFloors = 'Valid floor count is required';
    if (!formData.totalRooms || formData.totalRooms < 1) newErrors.totalRooms = 'Valid room count is required';
    if (!formData.studentsPerRoom) newErrors.studentsPerRoom = 'Students per room is required';
    if (!formData.perStudentAmount || formData.perStudentAmount < 0) newErrors.perStudentAmount = 'Valid amount per student is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.facilities) newErrors.facilities = 'Facilities description is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      const response = await fetch('http://localhost:5000/api/hostels/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setShowCreateModal(false);
        fetchHostels();
        resetForm();
      } else {
        alert(data.message || 'Error creating hostel');
      }
    } catch (error) {
      console.error('Error creating hostel:', error);
      alert('Error creating hostel');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      hostelName: '',
      hostelCode: '',
      hostelType: '',
      wardenId: '',
      totalFloors: '',
      totalRooms: '',
      studentsPerRoom: '',
      perStudentAmount: '',
      location: '',
      facilities: '',
      contactNumber: '',
      email: '',
      hostelImage: null,
      hostelVideo: null
    });
    setErrors({});
    setImagePreview(null);
    setVideoPreview(null);
  };

  const handleView = async (hostelId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/${hostelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedHostel(data.data);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching hostel details:', error);
    }
  };

  const handleDelete = async (hostelId) => {
    if (!window.confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hostels/${hostelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchHostels();
      } else {
        alert(data.message || 'Error deleting hostel');
      }
    } catch (error) {
      console.error('Error deleting hostel:', error);
      alert('Error deleting hostel');
    }
  };

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.hostelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hostel.hostelCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || hostel.hostelType === filter;
    return matchesSearch && matchesFilter;
  });

  const hostelCapacity = formData.totalRooms && formData.studentsPerRoom ? 
    parseInt(formData.totalRooms) * parseInt(formData.studentsPerRoom) : 0;
  
  // Calculate total revenue potential
  const totalRevenuePotential = hostelCapacity && formData.perStudentAmount ? 
    hostelCapacity * parseFloat(formData.perStudentAmount) : 0;

  return (
    <div className="hostel-management">
      {/* Header Section */}
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="icon">🏢</span>
            Hostel Management
          </h2>
          <p className="section-subtitle">Manage all hostels and their facilities</p>
        </div>
        
        <button 
          className="btn-create"
          onClick={() => setShowCreateModal(true)}
        >
          <span>➕</span>
          Create Hostel
        </button>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by hostel name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'Male' ? 'active' : ''}`}
            onClick={() => setFilter('Male')}
          >
            Boys
          </button>
          <button
            className={`filter-btn ${filter === 'Female' ? 'active' : ''}`}
            onClick={() => setFilter('Female')}
          >
            Girls
          </button>
        </div>
      </div>

      {/* Hostels Grid */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading hostels...</p>
        </div>
      ) : filteredHostels.length > 0 ? (
        <div className="hostels-grid">
          {filteredHostels.map((hostel) => (
            <div key={hostel._id} className={`hostel-card ${hostel.hostelType === 'Male' ? 'male' : 'female'}`}>
              {/* Image Section */}
              <div className="hostel-image-wrapper">
                {hostel.hostelImage ? (
                  <img 
                    src={`http://localhost:5000/${hostel.hostelImage.replace(/\\/g, '/')}`} 
                    alt={hostel.hostelName}
                    className="hostel-main-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500';
                    }}
                  />
                ) : (
                  <div className="hostel-placeholder">
                    <span className="placeholder-icon">🏢</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="hostel-badges">
                  <span className={`type-badge ${hostel.hostelType.toLowerCase()}`}>
                    {hostel.hostelType === 'Male' ? 'Boys' : 'Girls'}
                  </span>
                  <span className="video-available-badge">
                    🎥 Video Tour
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="hostel-card-content">
                {/* Header */}
                <div className="hostel-header-info">
                  <h3 className="hostel-name">{hostel.hostelName}</h3>
                  <p className="hostel-code">{hostel.hostelCode}</p>
                </div>

                {/* Stats Grid */}
                <div className="hostel-stats-grid">
                  <div className="stat-box">
                    <span className="stat-icon">🏢</span>
                    <div className="stat-content">
                      <span className="stat-number">{hostel.totalRooms}</span>
                      <span className="stat-label">Rooms</span>
                    </div>
                  </div>
                  
                  <div className="stat-box">
                    <span className="stat-icon">👥</span>
                    <div className="stat-content">
                      <span className="stat-number">{hostel.hostelCapacity}</span>
                      <span className="stat-label">Capacity</span>
                    </div>
                  </div>
                  
                  <div className="stat-box highlight">
                    <span className="stat-icon">💰</span>
                    <div className="stat-content">
                      <span className="stat-number">₹{hostel.perStudentAmount?.toLocaleString() || 0}</span>
                      <span className="stat-label">Per Student</span>
                    </div>
                  </div>
                </div>

                {/* Warden Info */}
                <div className="warden-section">
                  <div className="warden-avatar">
                    {hostel.wardenId?.fullName ? hostel.wardenId.fullName.charAt(0).toUpperCase() : 'W'}
                  </div>
                  <div className="warden-info">
                    <span className="warden-name">{hostel.wardenId?.fullName || 'No Warden Assigned'}</span>
                    <span className="warden-role">Warden</span>
                  </div>
                </div>

                {/* Location */}
                <div className="location-section">
                  <span className="location-icon">📍</span>
                  <span className="location-text">{hostel.location}</span>
                </div>

                {/* Occupancy Bar */}
                <div className="occupancy-section">
                  <div className="occupancy-info">
                    <span>Occupancy</span>
                    <span className="occupancy-percent">
                      {Math.round(((hostel.occupiedBeds || 0) / hostel.totalBeds) * 100)}%
                    </span>
                  </div>
                  <div className="occupancy-bar-wrapper">
                    <div 
                      className="occupancy-bar-fill"
                      style={{ width: `${((hostel.occupiedBeds || 0) / hostel.totalBeds) * 100}%` }}
                    />
                  </div>
                  <p className="occupancy-text">
                    {hostel.occupiedBeds || 0} of {hostel.totalBeds} beds occupied
                  </p>
                </div>

                {/* Actions */}
                <div className="hostel-actions">
                  <button 
                    className="action-button view"
                    onClick={() => handleView(hostel._id)}
                    title="View Details"
                  >
                    <span>👁️</span>
                    <span>View</span>
                  </button>
                  <button 
                    className="action-button edit"
                    title="Edit Hostel"
                  >
                    <span>✏️</span>
                    <span>Edit</span>
                  </button>
                  <button 
                    className="action-button delete"
                    onClick={() => handleDelete(hostel._id)}
                    title="Delete Hostel"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No hostels found</h3>
          <p>Start by creating a new hostel</p>
        </div>
      )}

      {/* Create Hostel Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Hostel</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="hostel-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Hostel Name *</label>
                  <input
                    type="text"
                    name="hostelName"
                    value={formData.hostelName}
                    onChange={handleInputChange}
                    placeholder="e.g., Excellence Boys Hostel"
                    className={errors.hostelName ? 'error' : ''}
                  />
                  {errors.hostelName && <span className="error-text">{errors.hostelName}</span>}
                </div>

                <div className="form-group">
                  <label>Hostel Code *</label>
                  <input
                    type="text"
                    name="hostelCode"
                    value={formData.hostelCode}
                    onChange={handleInputChange}
                    placeholder="e.g., BH001"
                    className={errors.hostelCode ? 'error' : ''}
                  />
                  {errors.hostelCode && <span className="error-text">{errors.hostelCode}</span>}
                </div>

                <div className="form-group">
                  <label>Hostel Type *</label>
                  <select
                    name="hostelType"
                    value={formData.hostelType}
                    onChange={handleInputChange}
                    className={errors.hostelType ? 'error' : ''}
                  >
                    <option value="">Select Type</option>
                    <option value="Male">Boys Hostel</option>
                    <option value="Female">Girls Hostel</option>
                  </select>
                  {errors.hostelType && <span className="error-text">{errors.hostelType}</span>}
                </div>

                <div className="form-group">
                  <label>Assign Warden *</label>
                  <select
                    name="wardenId"
                    value={formData.wardenId}
                    onChange={handleInputChange}
                    className={errors.wardenId ? 'error' : ''}
                  >
                    <option value="">Select Warden</option>
                    {wardens
                      .filter(w => {
                        const hostelTypeMatch = formData.hostelType === 'Male' ? 
                          w.gender === 'male' : w.gender === 'female';
                        return w.status === 'approved' && hostelTypeMatch;
                      })
                      .map(warden => (
                        <option key={warden._id} value={warden._id}>
                          {warden.fullName} - {warden.designation.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))
                    }
                  </select>
                  {errors.wardenId && <span className="error-text">{errors.wardenId}</span>}
                </div>

                <div className="form-group">
                  <label>Total Floors *</label>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g., 4"
                    className={errors.totalFloors ? 'error' : ''}
                  />
                  {errors.totalFloors && <span className="error-text">{errors.totalFloors}</span>}
                </div>

                <div className="form-group">
                  <label>Total Rooms *</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g., 150"
                    className={errors.totalRooms ? 'error' : ''}
                  />
                  {errors.totalRooms && <span className="error-text">{errors.totalRooms}</span>}
                </div>

                <div className="form-group">
                  <label>Students per Room *</label>
                  <select
                    name="studentsPerRoom"
                    value={formData.studentsPerRoom}
                    onChange={handleInputChange}
                    className={errors.studentsPerRoom ? 'error' : ''}
                  >
                    <option value="">Select</option>
                    <option value="1">1 (Single)</option>
                    <option value="2">2 (Double)</option>
                    <option value="3">3 (Triple)</option>
                    <option value="4">4 (Quad)</option>
                  </select>
                  {errors.studentsPerRoom && <span className="error-text">{errors.studentsPerRoom}</span>}
                </div>

                <div className="form-group">
                  <label>Amount per Student (₹) *</label>
                  <input
                    type="number"
                    name="perStudentAmount"
                    value={formData.perStudentAmount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="e.g., 5000"
                    className={errors.perStudentAmount ? 'error' : ''}
                  />
                  {errors.perStudentAmount && <span className="error-text">{errors.perStudentAmount}</span>}
                  <span className="helper-text">Monthly fee per student</span>
                </div>

                <div className="form-group">
                  <label>Hostel Capacity</label>
                  <input
                    type="text"
                    value={hostelCapacity}
                    disabled
                    className="disabled-input"
                  />
                  <span className="helper-text">Auto-calculated</span>
                </div>

                <div className="form-group">
                  <label>Total Revenue Potential</label>
                  <input
                    type="text"
                    value={`₹${totalRevenuePotential.toLocaleString()}`}
                    disabled
                    className="disabled-input"
                  />
                  <span className="helper-text">Monthly revenue at full capacity</span>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., North Campus Block A"
                    className={errors.location ? 'error' : ''}
                  />
                  {errors.location && <span className="error-text">{errors.location}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 9876543210"
                    className={errors.contactNumber ? 'error' : ''}
                  />
                  {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g., hostel@college.edu"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Facilities *</label>
                  <textarea
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    placeholder="e.g., Wi-Fi, 24/7 Security, Mess, Laundry, Common Room, Study Hall"
                    rows="3"
                    className={errors.facilities ? 'error' : ''}
                  />
                  {errors.facilities && <span className="error-text">{errors.facilities}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Hostel Image (Optional)</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="hostelImage"
                      name="hostelImage"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="file-input"
                    />
                    <label htmlFor="hostelImage" className="file-upload-label">
                      <span className="upload-icon">📷</span>
                      <span>{formData.hostelImage ? formData.hostelImage.name : 'Choose an image'}</span>
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Hostel preview" />
                      <button 
                        type="button" 
                        className="remove-file"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, hostelImage: null }));
                          setImagePreview(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Hostel Video Tour (Optional)</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      id="hostelVideo"
                      name="hostelVideo"
                      onChange={handleInputChange}
                      accept="video/*"
                      className="file-input"
                    />
                    <label htmlFor="hostelVideo" className="file-upload-label">
                      <span className="upload-icon">🎥</span>
                      <span>{formData.hostelVideo ? formData.hostelVideo.name : 'Choose a video (Max 100MB)'}</span>
                    </label>
                  </div>
                  {videoPreview && (
                    <div className="video-preview">
                      <video width="300" controls>
                        <source src={videoPreview} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <button 
                        type="button" 
                        className="remove-file"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, hostelVideo: null }));
                          URL.revokeObjectURL(videoPreview);
                          setVideoPreview(null);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {isLoading && uploadProgress > 0 && (
                  <div className="upload-progress full-width">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <span className="progress-text">Uploading... {uploadProgress}%</span>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Hostel Details Modal */}
      {showViewModal && selectedHostel && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏢 Hostel Details - {selectedHostel.hostelName}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="hostel-details">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Hostel ID</span>
                  <span className="detail-value">{selectedHostel.hostelCode}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hostel Type</span>
                  <span className="detail-value">{selectedHostel.hostelType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Warden</span>
                  <span className="detail-value">{selectedHostel.wardenId?.fullName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Floors</span>
                  <span className="detail-value">{selectedHostel.totalFloors}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Rooms</span>
                  <span className="detail-value">{selectedHostel.totalRooms}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Students per Room</span>
                  <span className="detail-value">{selectedHostel.studentsPerRoom}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hostel Capacity</span>
                  <span className="detail-value">{selectedHostel.hostelCapacity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount per Student</span>
                  <span className="detail-value highlight">₹{selectedHostel.perStudentAmount?.toLocaleString() || 0}/month</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Revenue Potential</span>
                  <span className="detail-value highlight">₹{((selectedHostel.perStudentAmount || 0) * selectedHostel.hostelCapacity).toLocaleString()}/month</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Available Rooms</span>
                  <span className="detail-value highlight">{selectedHostel.stats?.availableRooms || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{selectedHostel.location}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Facilities</span>
                  <span className="detail-value">{selectedHostel.facilities}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact</span>
                  <span className="detail-value">📞 {selectedHostel.contactNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">📧 {selectedHostel.email || 'N/A'}</span>
                </div>
              </div>

              {selectedHostel.stats && (
                <div className="room-stats">
                  <h3>Room Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card available">
                      <span className="stat-icon">✅</span>
                      <span className="stat-number">{selectedHostel.stats.availableRooms}</span>
                      <span className="stat-label">Available</span>
                    </div>
                    <div className="stat-card full">
                      <span className="stat-icon">🚫</span>
                      <span className="stat-number">{selectedHostel.stats.fullRooms}</span>
                      <span className="stat-label">Full</span>
                    </div>
                    <div className="stat-card maintenance">
                      <span className="stat-icon">🔧</span>
                      <span className="stat-number">{selectedHostel.stats.maintenanceRooms}</span>
                      <span className="stat-label">Maintenance</span>
                    </div>
                    <div className="stat-card occupied">
                      <span className="stat-icon">👥</span>
                      <span className="stat-number">{selectedHostel.stats.totalOccupied}</span>
                      <span className="stat-label">Students</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-view-video"
                  onClick={() => setShowVideoModal(true)}
                >
                  🎥 View Video Tour
                </button>
                <button 
                  className="btn-view-rooms"
                  onClick={() => {
                    window.location.href = `/admin/rooms?hostel=${selectedHostel._id}`;
                  }}
                >
                  View Rooms
                </button>
                <button className="btn-edit">Edit Hostel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedHostel && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎥 Video Tour - {selectedHostel.hostelName}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowVideoModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="video-container">
              <video 
                width="100%" 
                controls 
                autoPlay
              >
                <source 
                                    src="/videos/hostel-tour.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostelManagement;
