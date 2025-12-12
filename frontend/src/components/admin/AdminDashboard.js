import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardHome from './components/DashboardHome';
import StudentManagement from './components/StudentManagement';
import WardenManagement from './components/WardenManagement';
import HostelManagement from './components/HostelManagement';
import RoomManagement from './components/RoomManagement';
import FeeManagement from './components/FeeManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  useEffect(() => {
    // Enhanced AOS initialization
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
      mirror: true,
      anchorPlacement: 'top-bottom',
      offset: 100
    });

    // Parallax scroll handler
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update parallax elements
      const orbs = document.querySelectorAll('.dashboard-orb-1, .dashboard-orb-2, .dashboard-orb-3');
      orbs.forEach((orb, index) => {
        const speed = 0.5 + (index * 0.2);
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
      
      // Pattern parallax
      const pattern = document.querySelector('.dashboard-pattern');
      if (pattern) {
        pattern.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    };

    // Mouse movement for subtle parallax
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
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
    navigate('/login/admin');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'students':
        return <StudentManagement searchQuery={searchQuery} />;
      case 'wardens':
        return <WardenManagement />;
      case 'hostels':
        return <HostelManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'fees':
        return <FeeManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div ref={dashboardRef} className={`admin-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Premium Parallax Background */}
      <div className="dashboard-bg-container">
        <div 
          className="dashboard-orb-1"
          style={{ 
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
        />
        <div 
          className="dashboard-orb-2"
          style={{ 
            transform: `translate(${-mousePosition.x * 15}px, ${-mousePosition.y * 15}px)`
          }}
        />
        <div className="dashboard-orb-3" />
        
        {/* Pattern Overlay */}
        <div className="dashboard-pattern" />
        
        {/* Floating Particles */}
        <div className="dashboard-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`dashboard-particle`} />
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Area */}
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
