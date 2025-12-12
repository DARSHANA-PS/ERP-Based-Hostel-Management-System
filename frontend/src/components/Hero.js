import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';

const Hero = ({ scrollY }) => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const [counters, setCounters] = useState({ students: 0, rooms: 0, digital: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPos = (clientX / innerWidth - 0.5) * 2;
      const yPos = (clientY / innerHeight - 0.5) * 2;
      
      setMousePosition({ x: xPos, y: yPos });
      
      if (titleRef.current) {
        titleRef.current.style.transform = `translate(${xPos * 15}px, ${yPos * 15}px)`;
      }
      
      if (subtitleRef.current) {
        subtitleRef.current.style.transform = `translate(${xPos * -8}px, ${yPos * -8}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Enhanced parallax for background layers
  useEffect(() => {
    const parallaxElements = document.querySelectorAll('.hero-bg-layer, .shape, .float-element');
    
    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      element.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, [scrollY]);

  // Number counter animation
  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    const statsElement = document.querySelector('.hero-stats');
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const duration = 2500;
    const steps = 60;
    const interval = duration / steps;

    const targets = { students: 1200, rooms: 300, digital: 100 };
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setCounters({
        students: Math.floor(targets.students * easeProgress),
        rooms: Math.floor(targets.rooms * easeProgress),
        digital: Math.floor(targets.digital * easeProgress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  return (
    <section ref={heroRef} id="home" className="hero-section">
      <div className="hero-bg-container">
        <div className="hero-bg-layer hero-bg-1" />
        <div className="hero-bg-layer hero-bg-2" />
        <div className="hero-bg-layer hero-bg-3" />
        
        <div className="hero-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        
        <div className="hero-video-container">
          <div className="video-overlay"></div>
          <video 
            className="hero-background-video"
            autoPlay 
            muted 
            loop 
            playsInline
            poster="/videos/home-av-poster.jpg"
          >
            <source src="/videos/home-av.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      <div className="hero-content">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-badge" data-aos="fade-down" data-aos-delay="200">
              <span className="badge-text">Welcome to Excellence</span>
            </div>

            <h1 
              ref={titleRef}
              className="hero-title" 
              data-aos="fade-up" 
              data-aos-delay="400"
            >
              <span className="title-line">
                <span className="title-gradient" data-text="hostel">KEC-HOSTEL</span>
                <span className="title-gradient" data-text="KEC-ERP">-ERP</span>
              </span>
              <span className="title-line">
                <span className="title-word">Management</span>
                <span className="title-accent">System</span>
              </span>
            </h1>

            <p 
              ref={subtitleRef}
              className="hero-subtitle" 
              data-aos="fade-up" 
              data-aos-delay="600"
            >
              Transform your hostel experience with our cutting-edge digital platform.
              Seamlessly manage rooms, payments, and services all in one place.
            </p>

            <div className="hero-stats" data-aos="fade-up" data-aos-delay="800">
              <div className="stat-item">
                <span className="stat-number" data-value={counters.students}>
                  {counters.students}+
                </span>
                <span className="stat-label">Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" data-value={counters.rooms}>
                  {counters.rooms}+
                </span>
                <span className="stat-label">Rooms</span>
              </div>
              <div className="stat-item">
                <span className="stat-number" data-value={counters.digital}>
                  {counters.digital}%
                </span>
                <span className="stat-label">Digital</span>
              </div>
            </div>

            <div className="hero-cta" data-aos="fade-up" data-aos-delay="1000">
              <a href="#login" className="btn-premium btn-primary">
                <span className="btn-text">Login to Portal</span>
                <span className="btn-icon">→</span>
              </a>
              <a href="#register" className="btn-premium btn-secondary">
                <span className="btn-text">Register Now</span>
                <span className="btn-icon">→</span>
              </a>
            </div>

            <div className="scroll-indicator" data-aos="fade" data-aos-delay="1200">
              <div className="scroll-mouse">
                <div className="scroll-wheel"></div>
              </div>
              <span className="scroll-text">Scroll to explore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Elements */}
      <div className="floating-elements">
        <div 
          className="float-element float-1" 
          style={{ 
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`
          }}
        />
        <div 
          className="float-element float-2" 
          style={{ 
            transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`
          }}
        />
        <div 
          className="float-element float-3" 
          style={{ 
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * -15}px)`
          }}
        />
      </div>
    </section>
  );
};

export default Hero;
