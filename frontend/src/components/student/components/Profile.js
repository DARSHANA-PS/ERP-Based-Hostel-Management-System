// frontend/src/components/student/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { studentAPI } from '../../../services/api'; // Path adjusted
import { FiUser, FiMail, FiPhone, FiCalendar, FiBookOpen, FiHome, FiCreditCard } from 'react-icons/fi';
import AOS from 'aos';
import './Profile.css'; // CSS is in the same folder

const Profile = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const authContext = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('Profile: AuthContext is null.');
    return <div>Error: Authentication context not available.</div>;
  }
  const { user, loading: authGlobalLoading } = authContext;

  useEffect(() => { // This useEffect now comes after the `if (!authContext)` check
    const fetchProfile = async () => {
      if (authGlobalLoading || !user) {
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await studentAPI.getStudentProfile(); 
        setProfile(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authGlobalLoading, user]);

  if (authGlobalLoading || loading) {
    return <div className="profile-container loading-state">Loading Profile...</div>;
  }

  if (error) {
    return <div className="profile-container error-state">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="profile-container no-data-state">No profile data available.</div>;
  }

  const {
    name,
    studentId,
    email,
    mobile,
    gender,
    year,
    department,
    hostelName,
    roomNumber,
    roommates
  } = profile;

  return (
    <div className="profile-container">
      <h1 className="page-title">My <span className="gradient-text">Profile</span></h1>

      <div className="profile-card" data-aos="fade-up">
        <div className="profile-header">
          <div className="profile-avatar-large">{name?.charAt(0).toUpperCase() || '?'}</div>
          <div className="profile-basic-info">
            <h2 className="profile-name">{name || 'N/A'}</h2>
            <p className="profile-id">Student ID: <span className="highlight-text">{studentId || 'N/A'}</span></p>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item" data-aos="fade-left" data-aos-delay="100">
            <FiMail size={20} className="detail-icon" />
            <span className="detail-label">Email:</span>
            <span className="detail-value">{email || 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="200">
            <FiPhone size={20} className="detail-icon" />
            <span className="detail-label">Mobile:</span>
            <span className="detail-value">{mobile || 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="300">
            <FiUser size={20} className="detail-icon" />
            <span className="detail-label">Gender:</span>
            <span className="detail-value">{gender?.charAt(0).toUpperCase() + gender?.slice(1) || 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="400">
            <FiCalendar size={20} className="detail-icon" />
            <span className="detail-label">Academic Year:</span>
            <span className="detail-value">{year || 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="500">
            <FiBookOpen size={20} className="detail-icon" />
            <span className="detail-label">Department:</span>
            <span className="detail-value">{department || 'N/A'}</span>
          </div>
        </div>

        <div className="hostel-details-section" data-aos="fade-up" data-aos-delay="600">
          <h3><FiHome size={20} /> Hostel Information</h3>
          {hostelName && roomNumber ? (
            <>
              <p>Hostel: <span className="highlight-text">{hostelName}</span></p>
              <p>Room No: <span className="highlight-text">{roomNumber}</span></p>
              <p>Roommates: {roommates && roommates.length > 0 ? roommates.join(', ') : 'None'}</p>
            </>
          ) : (
            <p className="no-hostel-info">You do not have an active hostel booking.</p>
          )}
        </div>

        <div className="profile-actions" data-aos="fade-up" data-aos-delay="700">
          <button className="edit-profile-btn">Edit Profile</button>
          <button className="change-password-btn">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
