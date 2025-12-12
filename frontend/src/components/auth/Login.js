import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AOS from 'aos';
import { authAPI } from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);

  const getRoleConfig = () => {
    switch (role) {
      case 'student':
        return {
          title: 'Student Login',
          icon: '🎓',
          gradient: 'var(--gradient-primary)',
          description: 'Access your hostel dashboard'
        };
      case 'warden':
        return {
          title: 'Warden Login',
          icon: '🏫',
          gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)',
          description: 'Manage hostel operations'
        };
      case 'admin':
        return {
          title: 'Admin Login',
          icon: '👨‍💼',
          gradient: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)',
          description: 'System administration panel'
        };
      default:
        return {
          title: 'Login',
          icon: '🔐',
          gradient: 'var(--gradient-primary)',
          description: 'Sign in to your account'
        };
    }
  };

  const config = getRoleConfig();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
        role: role
      });
      
      if (response.success) {
        // Store token and user info
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Show success message
        console.log('Login successful!');
        
        // Redirect based on role
        switch(role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'warden':
            navigate('/warden/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials and try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Elements */}
      <div className="login-bg-container">
        <div className="login-bg-gradient"></div>
        <div className="login-bg-shapes">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
        </div>
        <div className="login-pattern"></div>
      </div>

      {/* Navigation */}
      <div className="login-nav">
        <button 
          className="nav-btn"
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="login-container">
        <div className="login-card" data-aos="fade-up">
          {/* Card Header */}
          <div className="login-header">
            <div className="login-icon" style={{ background: config.gradient }}>
              <span>{config.icon}</span>
            </div>
            <h1 className="login-title">{config.title}</h1>
            <p className="login-description">{config.description}</p>
          </div>

          {/* Role Selector */}
          <div className="role-tabs">
            <button 
              className={`role-tab ${role === 'student' ? 'active' : ''}`}
              onClick={() => navigate('/login/student')}
            >
              Student
            </button>
            <button 
              className={`role-tab ${role === 'warden' ? 'active' : ''}`}
              onClick={() => navigate('/login/warden')}
            >
              Warden
            </button>
            <button 
              className={`role-tab ${role === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('/login/admin')}
            >
              Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message" data-aos="fade-down">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>Don't have an account?</p>
            <button 
              className="register-link"
              onClick={() => navigate('/role-selection')}
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
