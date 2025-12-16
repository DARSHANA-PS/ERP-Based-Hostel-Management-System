// frontend/src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Correct path!
import AOS from 'aos';
import './Login.css';

const Login = () => {
  // console.log('Login component: Rendering.'); // DEBUG LOG

  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const { role } = useParams();
  const navigate = useNavigate();
  const authContext = useAuth(); // Call useAuth() here
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Local loading for form submission

  useEffect(() => {
    AOS.refresh();
  }, [role]);
  // --- END HOOKS SECTION ---

  // Now, after all hooks are called, you can safely use conditional logic
  if (!authContext) {
    console.error('Login component: AuthContext is null. This component is likely not wrapped by AuthProvider.');
    return <div>Error: Authentication context not available. Please ensure AuthProvider wraps this component.</div>;
  }
  
  // Safely destructure from authContext
  const { login, loading: authGlobalLoading } = authContext; // Renamed to authGlobalLoading to avoid confusion with local isLoading

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // console.log('Login component: Submitting form...'); // DEBUG LOG

    try {
      // The `login` function from AuthContext updates `authGlobalLoading`
      const response = await login(role, username, password);
      if (!response.success) {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (role === 'student') {
      navigate('/register/student/gender');
    } else if (role === 'warden') {
      navigate('/register/warden');
    }
  };

  return (
    <div className="login-page">
      {/* Background Elements */}
      <div className="login-bg-container">
        <div className="login-bg-gradient"></div>
        <div className="login-floating-shapes">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="login-nav">
        <button className="nav-btn" onClick={() => navigate(-1)}>
          <span>←</span>
          <span>Back</span>
        </button>
        <button className="nav-btn" onClick={() => navigate('/')}>
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="login-container">
        <div className="login-card" data-aos="zoom-in" data-aos-duration="800">
          <div className="login-header">
            <h1 className="login-title">
              {role.charAt(0).toUpperCase() + role.slice(1)}{' '}
              <span className="gradient-text">Login</span>
            </h1>
            <p className="login-subtitle">Access your Hostel ERP Account</p>
          </div>

          {error && (
            <div className="error-message" data-aos="fade-down">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or ID"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading || authGlobalLoading}>
              {isLoading || authGlobalLoading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Only show register prompt for student and warden */}
          {(role === 'student' || role === 'warden') && (
            <div className="register-prompt" data-aos="fade-up" data-aos-delay="200">
              <p>Don't have an account? </p>
              <button className="register-link" onClick={handleRegisterClick}>
                Register Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
