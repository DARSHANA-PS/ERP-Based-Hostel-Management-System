import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.refresh();
  }, []);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: '🎓',
      description: 'Register as a student to book hostel rooms and access student services',
      color: 'var(--primary-pink)',
      gradient: 'var(--gradient-primary)',
      path: '/register/student/gender'
    },
    {
      id: 'warden',
      title: 'Warden',
      icon: '🏫',
      description: 'Register as a warden to manage hostel operations and student affairs',
      color: 'var(--coral)',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)',
      path: '/register/warden'
    }
  ];

  return (
    <div className="role-selection-page">
      {/* Background Elements */}
      <div className="role-bg-container">
        <div className="role-bg-gradient"></div>
        <div className="role-bg-pattern"></div>
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>

      {/* Home Button */}
      <button 
        className="home-button"
        onClick={() => navigate('/')}
        data-aos="fade-down"
      >
        <span className="home-icon">🏠</span>
        <span>Back to Home</span>
      </button>

      {/* Main Content */}
      <div className="role-container">
        <div className="role-header" data-aos="fade-up">
          <h1 className="role-title">
            Choose Your <span className="gradient-text">Role</span>
          </h1>
          <p className="role-subtitle">
            Select how you want to register in the Hostel ERP System
          </p>
        </div>

        <div className="role-cards-container">
          {roles.map((role, index) => (
            <div
              key={role.id}
              className="role-card"
              data-aos="fade-up"
              data-aos-delay={index * 200}
              onClick={() => navigate(role.path)}
              style={{ '--card-color': role.color }}
            >
              <div className="role-card-inner">
                <div className="role-icon-wrapper">
                  <div 
                    className="role-icon"
                    style={{ background: role.gradient }}
                  >
                    <span>{role.icon}</span>
                  </div>
                  <div className="icon-glow" style={{ background: role.gradient }}></div>
                </div>
                
                <h2 className="role-card-title">{role.title}</h2>
                <p className="role-card-description">{role.description}</p>
                
                <div className="role-card-footer">
                  <span className="register-text">Register as {role.title}</span>
                  <span className="arrow-icon">→</span>
                </div>

                <div className="card-hover-effect"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="role-footer" data-aos="fade-up" data-aos-delay="400">
          <p>Already have an account?</p>
          <button 
            className="login-link"
            onClick={() => navigate('/login/student')}
          >
            Login Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
