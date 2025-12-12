import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../../services/api';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getProfile();
      setProfileData(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const updatableFields = {
        mobile: formData.mobile,
        parentMobile: formData.parentMobile,
        permanentAddress: formData.permanentAddress,
        emergencyContact: formData.emergencyContact
      };
      
      await studentAPI.updateProfile(updatableFields);
      setProfileData(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header" data-aos="fade-down">
        <h1>My Profile</h1>
        <p>Manage and update your personal details</p>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Picture Section */}
        <div className="profile-picture-section" data-aos="fade-right">
          <div className="profile-picture">
            {photoPreview || profileData?.photo ? (
              <img src={photoPreview || profileData.photo} alt="Profile" />
            ) : (
              <div className="profile-picture-placeholder">
                <span>{profileData?.fullName?.charAt(0)}</span>
              </div>
            )}
            {isEditing && (
              <label className="photo-upload-btn">
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
                <span>📷</span>
              </label>
            )}
          </div>
          <h2>{profileData?.fullName}</h2>
          <p className="student-id">ID: {profileData?.studentId}</p>
          <p className="student-status">Status: <span className="status-active">Active</span></p>
        </div>

        {/* Profile Details Section */}
        <div className="profile-details" data-aos="fade-left">
          {/* Personal Information */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Personal Information</h3>
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="detail-grid">
              <div className="detail-item">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={formData.fullName || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Gender</label>
                <input 
                  type="text" 
                  value={formData.gender || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Date of Birth</label>
                <input 
                  type="text" 
                  value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Aadhar Number</label>
                <input 
                  type="text" 
                  value={formData.aadharNumber || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Email ID</label>
                <input 
                  type="email" 
                  value={formData.email || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile || ''} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isEditing ? 'editable' : ''}
                />
              </div>
              
              <div className="detail-item">
                <label>Course / Year</label>
                <input 
                  type="text" 
                  value={`${formData.course || ''} - Year ${formData.year || ''}`} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Department</label>
                <input 
                  type="text" 
                  value={formData.department || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Parent's Name</label>
                <input 
                  type="text" 
                  value={formData.parentName || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Parent's Mobile</label>
                <input 
                  type="tel" 
                  name="parentMobile"
                  value={formData.parentMobile || ''} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isEditing ? 'editable' : ''}
                />
              </div>
              
              <div className="detail-item">
                <label>Emergency Contact</label>
                <input 
                  type="tel" 
                  name="emergencyContact"
                  value={formData.emergencyContact || ''} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isEditing ? 'editable' : ''}
                />
              </div>
              
              <div className="detail-item full-width">
                <label>Permanent Address</label>
                <textarea 
                  name="permanentAddress"
                  value={formData.permanentAddress || ''} 
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={isEditing ? 'editable' : ''}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Hostel Information */}
          <div className="detail-section">
            <h3>Hostel Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Hostel Name</label>
                <input 
                  type="text" 
                  value={formData.hostelName || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Room Type</label>
                <input 
                  type="text" 
                  value={formData.roomType || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
              
              <div className="detail-item">
                <label>Mess Preference</label>
                <input 
                  type="text" 
                  value={formData.messPreference || ''} 
                  disabled 
                  className="disabled-input"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="profile-actions">
              <button className="btn-cancel" onClick={() => {
                setIsEditing(false);
                setFormData(profileData);
                setPhotoPreview(null);
              }}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Message */}
      <div className="info-message" data-aos="fade-up">
        <p>
          <strong>Note:</strong> Your information is used to manage hostel records and communication. 
          Only mobile numbers and address can be updated. For other changes, please contact the admin.
        </p>
      </div>
    </div>
  );
};

export default Profile;
