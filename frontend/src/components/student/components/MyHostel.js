// frontend/src/components/student/components/MyHostel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { studentAPI } from '../../../services/api'; // Path adjusted
import { FiHome, FiKey, FiUsers, FiCalendar, FiDollarSign, FiInfo, FiCheckCircle } from 'react-icons/fi';
import AOS from 'aos';
import './MyHostel.css'; // CSS is in the same folder

const MyHostel = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const navigate = useNavigate();
  const authContext = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('MyHostel: AuthContext is null.');
    return <div>Error: Authentication context not available.</div>;
  }
  const { user, loading: authGlobalLoading } = authContext;

  useEffect(() => { // This useEffect now comes after the `if (!authContext)` check
    const fetchMyBooking = async () => {
      if (authGlobalLoading || !user) {
        return;
      }

      if (!user.hostelName || !user.roomNumber) {
        setError('You do not have any active hostel booking.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await studentAPI.getMyBookings();
        if (response.data && response.data.length > 0) {
          setBooking(response.data[0]); 
        } else {
          setError('No active booking found.');
        }
      } catch (err) {
        console.error("Failed to fetch my booking:", err);
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBooking();
  }, [authGlobalLoading, user]);

  if (authGlobalLoading || loading) {
    return <div className="my-hostel-container loading-state">Loading My Booking...</div>;
  }

  if (error) {
    return <div className="my-hostel-container error-state">Error: {error}</div>;
  }

  if (!booking) {
    return (
      <div className="my-hostel-container no-booking-state" data-aos="fade-up">
        <FiInfo size={50} className="info-icon-large" />
        <h2 className="no-booking-title">No Active Hostel Booking</h2>
        <p className="no-booking-text">It looks like you haven't booked a hostel room yet. Explore available hostels to find your perfect spot!</p>
        <button className="explore-hostels-btn" onClick={() => navigate('/student/hostels')}>Explore Hostels</button>
      </div>
    );
  }

  return (
    <div className="my-hostel-container">
      <h1 className="page-title">My Hostel <span className="gradient-text">Booking</span></h1>

      <div className="booking-card" data-aos="fade-up">
        <div className="booking-header">
          <FiHome size={35} className="booking-icon" />
          <div className="header-details">
            <h2 className="hostel-name">{booking.hostelName || 'N/A'}</h2>
            <p className="room-number">Room No: <span className="highlight-text">{booking.roomNumber || 'N/A'}</span></p>
          </div>
        </div>

        <div className="booking-details-grid">
          <div className="detail-item" data-aos="fade-left" data-aos-delay="100">
            <FiKey size={20} className="detail-icon" />
            <span className="detail-label">Booking ID:</span>
            <span className="detail-value">{booking._id || 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="200">
            <FiCalendar size={20} className="detail-icon" />
            <span className="detail-label">Booking Date:</span>
            <span className="detail-value">{booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="detail-item" data-aos="fade-left" data-aos-delay="300">
            <FiCheckCircle size={20} className="detail-icon" />
            <span className="detail-label">Status:</span>
            <span className={`detail-value status-${booking.status?.toLowerCase()}`}>{booking.status || 'N/A'}</span>
          </div>
        </div>

        <div className="roommates-section" data-aos="fade-up" data-aos-delay="400">
          <h3><FiUsers size={20} /> Current Roommates:</h3>
          {booking.roommates && booking.roommates.length > 0 ? (
            <ul className="roommates-list">
              {booking.roommates.map((mate, index) => (
                <li key={index}>{mate}</li>
              ))}
            </ul>
          ) : (
            <p className="no-roommates-text">No other roommates in your room yet.</p>
          )}
        </div>

        <div className="additional-info" data-aos="fade-up" data-aos-delay="500">
          <h3><FiDollarSign size={20} /> Fee Details (Mock)</h3>
          <p>Monthly Rent: <span className="highlight-text">₹5000</span></p>
          <p>Due Date: <span className="highlight-text">25th of every month</span></p>
          <button className="pay-fee-btn">Pay Fees Now</button>
        </div>
      </div>
    </div>
  );
};

export default MyHostel;
