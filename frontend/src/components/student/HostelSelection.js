// frontend/src/components/student/HostelSelection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Path adjusted: up(student), up(components), down(context)
import { studentAPI } from '../../services/api'; // Path adjusted
import AOS from 'aos';
import './HostelSelection.css'; // CSS is in the same folder

const HostelSelection = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const navigate = useNavigate();
  const authContext = useAuth();
  
  const [hostels, setHostels] = useState([]);
  const [loadingHostels, setLoadingHostels] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('HostelSelection: AuthContext is null. Component is not wrapped by AuthProvider.');
    return <div>Error: Authentication context not available.</div>;
  }
  const { user, loading: authGlobalLoading } = authContext;

  useEffect(() => { // This useEffect now comes after the `if (!authContext)` check
    const fetchHostels = async () => {
      if (authGlobalLoading || !user) {
        return; // Wait for auth context to load fully
      }

      // This redirect is redundant because ProtectedRoute handles it, but kept as a safeguard
      if (user.role === 'student' && !user.year) {
        setError('Please select your academic year first.');
        setLoadingHostels(false);
        navigate('/student/select-year', { replace: true });
        return;
      }

      try {
        setLoadingHostels(true);
        setError('');
        const response = await studentAPI.getAvailableHostels({
          year: user.year,
          gender: user.gender 
        });
        setHostels(response.data);
      } catch (err) {
        console.error("Failed to fetch hostels:", err);
        setError(err.message || 'Failed to load hostels. Please try again.');
      } finally {
        setLoadingHostels(false);
      }
    };

    fetchHostels();
  }, [authGlobalLoading, user, navigate]); // Depend on user and authLoading

  if (authGlobalLoading || loadingHostels) {
    return <div className="hostel-selection-container loading-state">Loading Hostels...</div>;
  }

  if (error) {
    return <div className="hostel-selection-container error-state">Error: {error}</div>;
  }

  // Final check if user data somehow disappears or is invalid
  if (!user || !user.year || !user.gender) {
    return <div className="hostel-selection-container error-state">Missing student details. Please select year or login again.</div>;
  }

  return (
    <div className="hostel-selection-container">
      <h1 className="page-title">Available Hostels for {user.gender === 'male' ? 'Boys' : 'Girls'} (Year <span className="gradient-text">{user.year}</span>)</h1>
      {hostels.length === 0 ? (
        <p className="no-hostels-message">No hostels available for your year and gender yet. Please check back later!</p>
      ) : (
        <div className="hostel-grid">
          {hostels.map((hostel) => (
            <div 
              key={hostel._id} 
              className="hostel-card"
              onClick={() => navigate(`/student/hostels/${hostel._id}/rooms`)} // Link to rooms
              data-aos="fade-up" // Add AOS animation
              data-aos-delay="100"
            >
              <img src={hostel.imageUrl || 'https://via.placeholder.com/400x200?text=Hostel+Image'} alt={hostel.name} className="hostel-image" />
              <div className="hostel-info">
                <h3 className="hostel-name">{hostel.name}</h3>
                <p className="hostel-warden">Warden: {hostel.wardenName || 'N/A'}</p>
                <div className="hostel-availability">
                  <span>Rooms Available: {hostel.availableRoomsCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostelSelection;
