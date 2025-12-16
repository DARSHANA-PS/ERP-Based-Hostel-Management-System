// frontend/src/components/student/components/DashboardHome.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { FiBookOpen, FiMap, FiFileText, FiCalendar, FiHome, FiUser } from 'react-icons/fi';
import AOS from 'aos';
import './DashboardHome.css'; // CSS is in the same folder

const DashboardHome = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const navigate = useNavigate();
  const authContext = useAuth();

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('DashboardHome component: AuthContext is null. Component is not wrapped by AuthProvider.');
    return null;
  }
  const { user } = authContext;

  const displayName = user?.name || 'Student';
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student';
  const hasBookedRoom = user?.hostelName && user?.roomNumber;

  return (
    <div className="dashboard-home-container">
      <div className="welcome-banner" data-aos="fade-down">
        <h1 className="banner-title">Hello, <span className="highlight-text">{displayName}</span>!</h1>
        <p className="banner-subtitle">Welcome to your {displayRole} Portal for Year {user?.year || ''}.</p>
        <p className="banner-subtitle-small">Ready to make your hostel life smoother?</p>
      </div>

      {hasBookedRoom && (
        <div className="current-hostel-card" data-aos="fade-up" data-aos-delay="50">
          <FiHome size={30} className="hostel-icon" />
          <div className="hostel-info-details">
            <h3 className="hostel-card-title">Your Current Hostel: <span className="highlight-text">{user.hostelName}</span></h3>
            <p className="hostel-card-subtitle">Room No: <span className="highlight-text">{user.roomNumber}</span></p>
            <p className="hostel-card-roommates">
              Roommates: {user.roommates && user.roommates.length > 0 
                ? user.roommates.join(', ')
                : 'No roommates yet'}
            </p>
            <button className="view-details-btn" onClick={() => navigate('/student/my-booking')}>View My Booking</button>
          </div>
        </div>
      )}

      <div className="action-cards-grid">
        <div 
          className="action-card" 
          data-aos="fade-up" 
          data-aos-delay={hasBookedRoom ? "150" : "100"}
          onClick={() => navigate('/student/hostels')}
        >
          <FiMap size={40} className="card-icon" />
          <h3 className="card-title">Explore Hostels</h3>
          <p className="card-description">Find and book your ideal room.</p>
        </div>

        <div 
          className="action-card" 
          data-aos="fade-up" 
          data-aos-delay={hasBookedRoom ? "250" : "200"}
          onClick={() => navigate('/student/my-booking')}
        >
          <FiBookOpen size={40} className="card-icon" />
          <h3 className="card-title">My Bookings</h3>
          <p className="card-description">View your current and past bookings.</p>
        </div>

        <div 
          className="action-card" 
          data-aos="fade-up" 
          data-aos-delay={hasBookedRoom ? "350" : "300"}
          onClick={() => navigate('/student/complaints')}
        >
          <FiFileText size={40} className="card-icon" />
          <h3 className="card-title">Submit Complaint</h3>
          <p className="card-description">Report issues or give feedback.</p>
        </div>

        <div 
          className="action-card" 
          data-aos="fade-up" 
          data-aos-delay={hasBookedRoom ? "450" : "400"}
          onClick={() => navigate('/student/profile')}
        >
          <FiUser size={40} className="card-icon" />
          <h3 className="card-title">My Profile</h3>
          <p className="card-description">View and manage your personal details.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
