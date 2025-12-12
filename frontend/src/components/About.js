import React, { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxElements = sectionRef.current?.querySelectorAll('.parallax-about');
      
      if (parallaxElements) {
        parallaxElements.forEach((el) => {
          const speed = el.getAttribute('data-speed');
          el.style.transform = `translateY(${scrolled * speed}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="about" className="section about-section" ref={sectionRef}>
      <div className="parallax-about floating-shape-1" data-speed="0.2"></div>
      <div className="parallax-about floating-shape-2" data-speed="-0.1"></div>
      
      <div className="container">
        <div className="about-content">
          <div className="about-text" data-aos="fade-right">
            <h2 className="section-title">
              About the <span className="gradient-text">Hostel ERP System</span>
            </h2>
            
            <p className="about-description">
              The Hostel ERP Management System of Excellence University is a comprehensive, 
              digitalized platform built to automate and simplify all aspects of hostel 
              administration. From student onboarding to room allocation, fee collection, 
              and grievance redressal, this ERP transforms the entire hostel management 
              process into a paperless and efficient system.
            </p>
            
            <div className="hostel-types">
              <div className="hostel-type" data-aos="fade-up" data-aos-delay="200">
                <div className="hostel-icon">🏠</div>
                <h3>Boys Hostel</h3>
                <p>A secure, well-equipped residence designed for comfort and discipline.</p>
              </div>
              
              <div className="hostel-type" data-aos="fade-up" data-aos-delay="400">
                <div className="hostel-icon">🏡</div>
                <h3>Women's Hostel</h3>
                <p>A modern, safe, and fully-managed facility promoting academic and personal well-being.</p>
              </div>
            </div>
            
            <div className="mission-statement" data-aos="fade-up" data-aos-delay="600">
              <h3>Our Mission</h3>
              <p>"To create a smart, transparent, and student-friendly environment for hostel 
              administration using innovative digital technology."</p>
            </div>
          </div>
          
          <div className="about-visual" data-aos="fade-left">
            <div className="visual-container">
              <img 
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600" 
                alt="Modern Hostel Building"
                className="about-image"
              />
              <div className="stats-overlay">
                <div className="stat-item">
                  <h4>2</h4>
                  <p>Hostels</p>
                </div>
                <div className="stat-item">
                  <h4>1200+</h4>
                  <p>Students</p>
                </div>
                <div className="stat-item">
                  <h4>300+</h4>
                  <p>Rooms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
