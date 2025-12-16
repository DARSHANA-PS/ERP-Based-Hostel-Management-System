// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';

import { AuthProvider } from './context/AuthContext'; 

// Homepage Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HostelOverview from './components/HostelOverview';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Auth Components
import RoleSelection from './components/auth/RoleSelection';
import Login from './components/auth/Login';
import StudentRegistration from './components/auth/StudentRegistration';
import WardenRegistration from './components/auth/WardenRegistration';
import GenderSelection from './components/auth/GenderSelection';
import EmailCheck from './components/auth/EmailCheck';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentDashboard from './components/student/StudentDashboard'; // Path to StudentDashboard is correct
import WardenDashboard from './components/warden/WardenDashboard';

// Student Components directly under 'components/student/'
import YearSelection from './components/student/YearSelection'; // PATH CORRECTED: No 'components/' subfolder here

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
    AOS.init({ duration: 1200, easing: 'ease-out-cubic', once: false, mirror: true, anchorPlacement: 'top-bottom', offset: 100, delay: 0, startEvent: 'DOMContentLoaded', animatedClassName: 'aos-animate', disableMutationObserver: false, debounceDelay: 50, throttleDelay: 99 });

    const handleScroll = () => { setScrollY(window.scrollY); AOS.refresh(); };
    const handleMouseMove = (e) => { const x = (e.clientX / window.innerWidth - 0.5) * 2; const y = (e.clientY / window.innerHeight - 0.5) * 2; setMousePosition({ x, y }); };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'auto';
      AOS.refresh();
    }, 2000);

    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(loadingTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
    }
  }, [isLoading]);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
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
            
            {/* Student specific routes - carefully ordered */}
            <Route 
              path="/student/select-year" 
              element={<ProtectedRoute requiredRole="student" mustHaveYear={false}><YearSelection /></ProtectedRoute>} 
            />
            {/* This route now serves as a container for all dashboard routes, requires year */}
            <Route 
              path="/student/*" 
              element={<ProtectedRoute requiredRole="student" mustHaveYear={true}><StudentDashboard /></ProtectedRoute>} 
            />

            {/* Admin and Warden Protected Routes remain the same */}
            <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/warden/*" element={<ProtectedRoute requiredRole="warden"><WardenDashboard /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
