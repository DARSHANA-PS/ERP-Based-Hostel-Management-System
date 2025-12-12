import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardHome from './components/DashboardHome';
import Profile from './components/Profile';
import MyHostel from './components/MyHostel';
import RoomDetails from './components/RoomDetails';
import FeeManagement from './components/FeeManagement';
import Announcements from './components/Announcements';
import Complaints from './components/Complaints';
import Contact from './components/Contact';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true
    });

    // Handle scroll
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Handle mouse movement
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/student');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'profile':
        return <Profile />;
      case 'hostel':
        return <MyHostel />;
      case 'room':
        return <RoomDetails />;
      case 'fees':
        return <FeeManagement />;
      case 'announcements':
        return <Announcements />;
      case 'complaints':
        return <Complaints />;
      case 'contact':
        return <Contact />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className={`student-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${darkMode ? 'dark-mode' : ''}`}>
      {/* Background Effects */}
      <div className="dashboard-bg-container">
        <div 
          className="dashboard-orb-1"
          style={{ transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)` }}
        />
        <div 
          className="dashboard-orb-2"
          style={{ transform: `translate(${-mousePosition.x * 15}px, ${-mousePosition.y * 15}px)` }}
        />
        <div className="dashboard-orb-3" />
        <div className="dashboard-pattern" />
        <div className="dashboard-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="dashboard-particle" />
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <TopBar 
          onLogout={handleLogout}
          notifications={notifications}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Content Area */}
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
