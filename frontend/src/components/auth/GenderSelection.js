import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import './GenderSelection.css';

const GenderSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.refresh();
  }, []);

  const genders = [
    {
      id: 'male',
      title: 'Boys Hostel',
      icon: '👦',
      emoji: '🏠',
      description: 'Register for Boys Hostel accommodation',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#667eea'
    },
    {
      id: 'female',
      title: 'Girls Hostel',
      icon: '👧',
      emoji: '🏡',
      description: 'Register for Girls Hostel accommodation',
      gradient: 'var(--gradient-primary)',
      color: 'var(--primary-pink)'
    }
  ];

  return (
    <div className="gender-selection-page">
      {/* Background */}
      <div className="gender-bg-container">
        <div className="gender-bg-gradient"></div>
        <div className="animated-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-header">
        <button 
          className="back-button"
          onClick={() => navigate('/role-selection')}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button 
          className="home-nav-button"
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="gender-container">
        <div className="gender-header" data-aos="fade-up">
          <h1 className="gender-title">
            Select Your <span className="gradient-text">Hostel Type</span>
          </h1>
          <p className="gender-subtitle">
            Choose your gender to proceed with the appropriate hostel registration
          </p>
        </div>

        <div className="gender-cards-wrapper">
          {genders.map((gender, index) => (
            <div
              key={gender.id}
              className="gender-card"
              data-aos="zoom-in"
              data-aos-delay={index * 200}
              onClick={() => navigate(`/register/student/${gender.id}`)}
            >
              <div className="card-background" style={{ background: gender.gradient }}></div>
              
              <div className="card-content">
                <div className="icon-container">
                  <span className="main-icon">{gender.icon}</span>
                  <span className="secondary-icon">{gender.emoji}</span>
                </div>
                
                <h2 className="card-title">{gender.title}</h2>
                <p className="card-description">{gender.description}</p>
                
                <div className="card-action">
                  <span>Continue</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>

              <div className="card-glow" style={{ background: gender.gradient }}></div>
            </div>
          ))}
        </div>

        <div className="gender-footer" data-aos="fade-up" data-aos-delay="400">
          <p>Need help? Contact our support team</p>
          <a href="mailto:hostel@excellence.edu" className="support-link">
            hostel@excellence.edu
          </a>
        </div>
      </div>
    </div>
  );
};

export default GenderSelection;
