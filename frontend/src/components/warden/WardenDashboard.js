import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardHome from './components/DashboardHome';
import StudentManagement from './components/StudentManagement';
import RoomManagement from './components/RoomManagement';
import FeeManagement from './components/FeeManagement';
import ComplaintManagement from './components/ComplaintManagement';
import Announcements from './components/Announcements';
import Profile from './components/Profile';
import './WardenDashboard.css';

const WardenDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [wardenData, setWardenData] = useState(null);
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  useEffect(() => {
    // Fetch warden data
    fetchWardenData();
    
    // Initialize AOS
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

  const fetchWardenData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWardenData(data.data);
      }
    } catch (error) {
      console.error('Error fetching warden data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login/warden');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome wardenData={wardenData} />;
      case 'students':
        return <StudentManagement searchQuery={searchQuery} />;
      case 'rooms':
        return <RoomManagement />;
      case 'fees':
        return <FeeManagement />;
      case 'complaints':
        return <ComplaintManagement />;
      case 'announcements':
        return <Announcements />;
      case 'profile':
        return <Profile wardenData={wardenData} refreshData={fetchWardenData} />;
      default:
        return <DashboardHome wardenData={wardenData} />;
    }
  };

  return (
    <div ref={dashboardRef} className={`warden-dashboard ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
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
        wardenData={wardenData}
      />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <TopBar 
          onLogout={handleLogout}
          notifications={notifications}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          wardenData={wardenData}
        />

        {/* Content Area */}
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WardenDashboard;
