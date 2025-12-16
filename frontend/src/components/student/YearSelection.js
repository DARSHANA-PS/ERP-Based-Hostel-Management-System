// frontend/src/components/student/YearSelection.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Path adjusted: up(student), up(components), down(context)
import AOS from 'aos';
import './YearSelection.css'; // CSS is in the same folder
import '../auth/auth-animations.css'; // Path to auth animations CSS (relative to 'student/')

const years = [2, 3, 4];

const YearSelection = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const navigate = useNavigate();
  const authContext = useAuth();
  
  const [selectedYear, setSelectedYear] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('YearSelection: AuthContext is null. Component is not wrapped by AuthProvider.');
    return <div>Error: Authentication context not available. Please ensure AuthProvider wraps this component.</div>;
  }
  const { user, loading: authGlobalLoading, updateStudentYear, logout } = authContext;

  const handleSubmit = async () => {
    if (!selectedYear) {
      setError('Please select your current academic year.');
      return;
    }
    setError('');
    setIsUpdating(true);

    const response = await updateStudentYear(parseInt(selectedYear));
    if (response.success) {
      navigate('/student/home', { replace: true });
    } else {
      setError(response.message || 'Failed to save year. Please try again.');
    }
    setIsUpdating(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (authGlobalLoading) {
    return (
      <div className="year-selection-page loading-state">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return <p>Unauthorized access. Please login.</p>; 
  }

  return (
    <div className="year-selection-page">
      <div className="ys-bg-container">
        <div className="ys-bg-gradient"></div>
        <div className="ys-floating-shapes">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>

      <div className="ys-nav">
        <button 
          className="nav-btn"
          onClick={handleLogout}
        >
          <span>←</span>
          <span>Logout</span>
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      <div className="ys-container">
        <div className="ys-card" data-aos="zoom-in">
          <h1 className="ys-title">Welcome, <span className="gradient-text">{user?.name || 'Student'}</span>!</h1>
          <p className="ys-subtitle">Please select your current academic year to proceed to your hostel portal.</p>

          {error && <div className="error-message">⚠️ {error}</div>}

          <div className="year-grid">
            {years.map((year) => (
              <button
                key={year}
                className={`year-button ${selectedYear === year.toString() ? 'selected' : ''}`}
                onClick={() => setSelectedYear(year.toString())}
                disabled={isUpdating}
              >
                {year} Year
              </button>
            ))}
          </div>

          <button 
            className="submit-year-btn" 
            onClick={handleSubmit} 
            disabled={isUpdating || !selectedYear}
          >
            {isUpdating ? 'Saving...' : 'Continue to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default YearSelection;
