import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ wardenData, refreshData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    designation: '',
    gender: '',
    assignedHostel: '',
    joiningDate: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (wardenData) {
      setProfileData({
        fullName: wardenData.fullName || '',
        email: wardenData.email || '',
        mobile: wardenData.mobile || '',
        designation: wardenData.designation || '',
        gender: wardenData.gender || '',
        assignedHostel: wardenData.assignedHostel || 'Not Assigned',
        joiningDate: wardenData.createdAt || ''
      });
    }
  }, [wardenData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile: profileData.mobile
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        refreshData();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getDesignationDisplay = (designation) => {
    if (!designation) return 'Not Set';
    return designation.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getHostelDisplay = (hostel) => {
    if (!hostel || hostel === 'Not Assigned') return 'Not Assigned';
    return hostel.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="profile-section">
      {/* Header */}
      <div className="profile-header" data-aos="fade-down">
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your account details and view your assigned hostel information</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card" data-aos="fade-up">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            <span>{profileData.fullName.charAt(0)}</span>
            <button className="avatar-edit-btn" title="Update Profile Picture">
              📷
            </button>
          </div>
          <h2 className="profile-name">{profileData.fullName}</h2>
          <p className="profile-designation">{getDesignationDisplay(profileData.designation)}</p>
        </div>

        {/* Profile Information */}
        <div className="profile-info-section">
          <div className="info-header">
            <h3>Personal Information</h3>
            {!isEditing ? (
              <button 
                className="btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="btn-save"
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '✓ Save'}
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => {
                    setIsEditing(false);
                    if (wardenData) {
                      setProfileData({
                        fullName: wardenData.fullName || '',
                        email: wardenData.email || '',
                        mobile: wardenData.mobile || '',
                        designation: wardenData.designation || '',
                        gender: wardenData.gender || '',
                        assignedHostel: wardenData.assignedHostel || 'Not Assigned',
                        joiningDate: wardenData.createdAt || ''
                      });
                    }
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-details-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                disabled
                className="profile-input"
              />
            </div>
            
            <div className="detail-item">
              <label>Gender</label>
              <input
                type="text"
                value={profileData.gender}
                disabled
                className="profile-input"
              />
            </div>

            <div className="detail-item">
              <label>Email ID</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="profile-input"
              />
            </div>

            <div className="detail-item">
              <label>Contact Number</label>
              <input
                type="tel"
                name="mobile"
                value={profileData.mobile}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="profile-input"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="detail-item">
              <label>Designation</label>
              <input
                type="text"
                value={getDesignationDisplay(profileData.designation)}
                disabled
                className="profile-input"
              />
            </div>

            <div className="detail-item">
              <label>Assigned Hostel</label>
              <input
                type="text"
                value={getHostelDisplay(profileData.assignedHostel)}
                disabled
                className="profile-input"
              />
            </div>

            <div className="detail-item full-width">
              <label>Joining Date</label>
              <input
                type="text"
                value={profileData.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Not Available'}
                disabled
                className="profile-input"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="profile-actions">
          <button 
            className="action-btn btn-password"
            onClick={() => setShowPasswordModal(true)}
          >
            🔑 Change Password
          </button>
          <button className="action-btn btn-notifications">
            🔔 Notification Settings
          </button>
          <button className="action-btn btn-logout">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="profile-stats" data-aos="fade-up" data-aos-delay="200">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>Days Active</h3>
            <p className="stat-value">
              {wardenData && wardenData.createdAt 
                ? Math.floor((new Date() - new Date(wardenData.createdAt)) / (1000 * 60 * 60 * 24))
                : 0}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h3>Hostel Managed</h3>
            <p className="stat-value">
              {profileData.assignedHostel !== 'Not Assigned' ? '1' : '0'}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Account Status</h3>
            <p className="stat-value status-active">Active</p>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="password-input"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="password-input"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="password-input"
                  />
                </div>

                <div className="form-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-submit"
                    onClick={handleChangePassword}
                    disabled={loading}
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
