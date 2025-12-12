import React, { useEffect, useRef } from 'react';
import './Features.css';

const Features = ({ scrollY }) => {
  const featuresRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!featuresRef.current) return;

      const rect = featuresRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const distanceFromCenter = Math.abs(windowHeight / 2 - cardCenter);
        const scale = Math.max(0.9, 1 - distanceFromCenter / windowHeight);
        
        card.style.transform = `scale(${scale})`;
        card.style.opacity = scale;
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.// components/Features.js (continuation)
    removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🧍‍♂️',
      title: 'Online Student Registration',
      description: 'Easy, gender-based registration and approval process with admin verification.',
      gradient: 'feature-gradient-1'
    },
    {
      icon: '🏠',
      title: 'Room Allocation & Live Availability',
      description: 'Browse available rooms in real time and select your preferred accommodation instantly.',
      gradient: 'feature-gradient-2'
    },
    {
      icon: '💳',
      title: 'Digital Fee Payment Gateway',
      description: 'Secure online payments with receipts and automatic status updates.',
      gradient: 'feature-gradient-3'
    },
    {
      icon: '⚡',
      title: 'Complaint & Feedback Management',
      description: 'File and track maintenance or service requests with quick resolution updates.',
      gradient: 'feature-gradient-4'
    },
    {
      icon: '🍽️',
      title: 'Mess & Dining Management',
      description: 'Check daily menus, mess attendance, and monthly expenses with transparency.',
      gradient: 'feature-gradient-5'
    },
    {
      icon: '📊',
      title: 'Reports & Analytics',
      description: 'Comprehensive data dashboards for administrators and wardens.',
      gradient: 'feature-gradient-6'
    },
    {
      icon: '🔔',
      title: 'Announcements & Notifications',
      description: 'Stay informed with the latest hostel circulars, events, and alerts.',
      gradient: 'feature-gradient-7'
    },
    {
      icon: '🔐',
      title: 'Multi-Role Secure Login',
      description: 'Role-based dashboards for Admin, Warden, and Student with full data protection.',
      gradient: 'feature-gradient-8'
    }
  ];

  return (
    <section ref={featuresRef} className="features-section section-dark">
      <div className="features-bg">
        <div 
          className="features-parallax-bg" 
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </div>

      <div className="container">
        <div className="features-header">
          <div className="section-label" data-aos="fade-down">
            <span>Features</span>
          </div>
          
          <h2 className="features-title" data-aos="fade-up" data-aos-delay="200">
            <span className="title-line">Why Choose Our</span>
            <span className="title-gradient">Hostel ERP System</span>
          </h2>
          
          <p className="features-subtitle" data-aos="fade-up" data-aos-delay="400">
            Built with cutting-edge technology and designed for excellence
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="feature-card-premium"
              data-aos="fade-up"
              data-aos-delay={100 + index * 50}
            >
              <div className={`feature-icon-wrapper ${feature.gradient}`}>
                <span className="feature-icon-emoji">{feature.icon}</span>
                <div className="icon-glow"></div>
              </div>
              
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              
              <div className="feature-overlay"></div>
              <div className="feature-border"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
