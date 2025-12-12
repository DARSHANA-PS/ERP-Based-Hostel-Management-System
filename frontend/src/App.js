import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

// Homepage Components - Only keeping required sections
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HostelOverview from './components/HostelOverview';
import Gallery from './components/Gallery'; // New Gallery component
import Contact from './components/Contact';
import Footer from './components/Footer';

// Auth Components
import RoleSelection from './components/auth/RoleSelection';
import Login from './components/auth/Login';
import StudentRegistration from './components/auth/StudentRegistration';
import WardenRegistration from './components/auth/WardenRegistration';
import GenderSelection from './components/auth/GenderSelection';
import EmailCheck from './components/auth/EmailCheck';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import StudentDashboard from './components/student/StudentDashboard';
import WardenDashboard from './components/warden/WardenDashboard';

// Student Components
import HostelSelection from './components/student/HostelSelection';

function HomePage({ scrollY, isLoading, mousePosition }) {
  return (
    <>
      <Navbar scrollY={scrollY} />
      <Hero scrollY={scrollY} mousePosition={mousePosition} />
      <About scrollY={scrollY} />
      <Features scrollY={scrollY} />
      <HostelOverview scrollY={scrollY} />
      <Gallery scrollY={scrollY} />
      <Contact scrollY={scrollY} />
      <Footer />
    </>
  );
}

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Enhanced AOS initialization
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      anchorPlacement: 'top-bottom',
      offset: 100,
      delay: 0,
      startEvent: 'DOMContentLoaded',
      animatedClassName: 'aos-animate',
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    // Scroll handler
    const handleScroll = () => {
      setScrollY(window.scrollY);
      AOS.refresh(); // Refresh AOS on scroll
    };

    // Mouse movement handler for parallax effects
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Loading screen timer
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'auto';
      AOS.refresh();
    }, 2000);

    // Initial setup
    document.body.style.overflow = 'hidden'; // Prevent scroll during loading

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(loadingTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Add loading animation class to body
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
    }
  }, [isLoading]);

  // Mouse follower effect
  useEffect(() => {
    const cursor = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursor.className = 'mouse-follower';
    cursorDot.className = 'mouse-follower-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    const handleMouseMove = (e) => {
      cursor.style.left = e.clientX - 20 + 'px';
      cursor.style.top = e.clientY - 20 + 'px';
      cursorDot.style.left = e.clientX - 4 + 'px';
      cursorDot.style.top = e.clientY - 4 + 'px';
    };

    const handleMouseDown = () => {
      cursor.style.transform = 'scale(0.8)';
      cursorDot.style.transform = 'scale(0.8)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = 'scale(1)';
      cursorDot.style.transform = 'scale(1)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
      if (cursorDot.parentNode) cursorDot.parentNode.removeChild(cursorDot);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Loading Animation */}
        {isLoading && (
          <div className="loading-screen">
            <div className="loading-content">
              <div className="loading-logo">
                <h2 className="loading-text">Hostel<span>ERP</span></h2>
              </div>
              <div className="loader-wrapper">
                <div className="loader"></div>
              </div>
              <p className="loading-message">Preparing your experience...</p>
            </div>
          </div>
        )}

        {/* Parallax Background Layers */}
        <div className="parallax-bg">
          <div 
            className="parallax-layer parallax-layer-1" 
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="parallax-layer parallax-layer-2" 
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          />
          <div 
            className="parallax-layer parallax-layer-3" 
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
        </div>

        <Routes>
          <Route path="/" element={<HomePage scrollY={scrollY} isLoading={isLoading} mousePosition={mousePosition} />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/login/:role" element={<Login />} />
          <Route path="/register/student/gender" element={<GenderSelection />} />
          <Route path="/register/student/:gender" element={<EmailCheck />} />
          <Route path="/register/student/:gender/full" element={<StudentRegistration />} />
          <Route path="/register/student/:gender/continue" element={<StudentRegistration />} />
          <Route path="/register/warden" element={<WardenRegistration />} />
          <Route path="/student/hostel-selection/:gender" element={<HostelSelection />} />
          <Route path="/admin/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/student/*" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/warden/*" element={<ProtectedRoute role="warden"><WardenDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
