import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ scrollY }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when clicking outside
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.navbar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
      setDropdownOpen(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login/student');
  };

  const handleRegisterClick = () => {
    navigate('/role-selection');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-wrapper">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-brand">
            <div className="logo-wrapper" onClick={() => scrollToSection('home')}>
              <div className="logo-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="url(#gradient1)"/>
                  <path d="M20 10L25.77 17.5H14.23L20 10Z" fill="white"/>
                  <path d="M14 22.5H26V30H14V22.5Z" fill="white" fillOpacity="0.8"/>
                  <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40">
                      <stop stopColor="#8B6B4A"/>
                      <stop offset="1" stopColor="#A0826D"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">HostelERP</span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <a 
              href="#home" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('home');
              }}
            >
              <span className="nav-icon">🏠</span>
              <span className="nav-text">Home</span>
            </a>
            <a 
              href="#about" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
            >
              <span className="nav-icon">💜</span>
              <span className="nav-text">About</span>
            </a>
            <a 
              href="#features" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('features');
              }}
            >
              <span className="nav-icon">✨</span>
              <span className="nav-text">Features</span>
            </a>
            <a 
              href="#hostels" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hostels');
              }}
            >
              <span className="nav-icon">🏢</span>
              <span className="nav-text">Hostels</span>
            </a>
            <a 
              href="#gallery" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('gallery');
              }}
            >
              <span className="nav-icon">🖼️</span>
              <span className="nav-text">Gallery</span>
            </a>
            <a 
              href="#contact" 
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
              <span className="nav-icon">📞</span>
              <span className="nav-text">Contact</span>
            </a>

            {/* Mobile Menu Actions */}
            {mobileMenuOpen && (
              <div className="navbar-actions">
                <button className="btn-signup" onClick={handleRegisterClick}>
                  Register
                </button>
                <button className="btn-login-primary" onClick={handleLoginClick}>
                  Login
                </button>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            <button className="btn-signup" onClick={handleRegisterClick}>
              Register
            </button>
            <button className="btn-login-primary" onClick={handleLoginClick}>
              Login
            </button>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
