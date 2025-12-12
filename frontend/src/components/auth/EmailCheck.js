import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AOS from 'aos';
import './EmailCheck.css';

const EmailCheck = () => {
  const navigate = useNavigate();
  const { gender } = useParams();
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);

  const handleEmailCheck = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, role: 'student' })
      });

      const data = await response.json();

      if (data.success) {
        if (data.status === 'approved') {
          // Generate token for approved student
          try {
            const tokenResponse = await fetch('http://localhost:5000/api/auth/generate-student-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
            });

            const tokenData = await tokenResponse.json();
            
            if (tokenData.success) {
              // Store authentication data
              localStorage.setItem('token', tokenData.token);
              localStorage.setItem('userRole', 'student');
              localStorage.setItem('userId', tokenData.user.id);
              
              // Redirect to hostel selection
              navigate(`/student/hostel-selection/${gender}`, { 
                state: { 
                  email: tokenData.user.email, 
                  fullName: tokenData.user.fullName
                } 
              });
            } else {
              setError('Error authenticating. Please try again.');
            }
          } catch (tokenError) {
            console.error('Error generating token:', tokenError);
            setError('Error authenticating. Please try again.');
          }
        } else if (data.status === 'rejected') {
          setError('Your registration was previously rejected. Please contact admin at gowthamchmi007@gmail.com');
        } else if (data.status === 'pending') {
          setError('Your registration is already pending approval. Please check your email for updates.');
        } else if (data.status === 'new') {
          // New user, show full registration form
          navigate(`/register/student/${gender}/full`, { 
            state: { email } 
          });
        }
      } else {
        setError('Error checking email. Please try again.');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setError('Error checking email. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="email-check-page">
      {/* Background Elements */}
      <div className="email-bg-container">
        <div className="email-bg-gradient"></div>
        <div className="animated-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="email-nav">
        <button 
          className="nav-btn"
          onClick={() => navigate('/register/student/gender')}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="email-check-container">
        <div className="email-check-card" data-aos="fade-up">
          <div className="email-header">
            <div className="email-icon">
              <span>📧</span>
            </div>
            <h1 className="email-title">
              Enter Your <span className="gradient-text">Email</span>
            </h1>
            <p className="email-subtitle">
              We'll check if you have an existing registration
            </p>
          </div>
          
          <form onSubmit={handleEmailCheck} className="email-form">
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className={error ? 'error' : ''}
              />
              {error && <div className="error-message">{error}</div>}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <span className="loading-spinner">⏳</span>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          <div className="email-footer">
            <p>By continuing, you agree to our terms and conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCheck;
