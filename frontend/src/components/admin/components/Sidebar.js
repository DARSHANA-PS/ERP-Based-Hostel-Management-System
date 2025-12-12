import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, collapsed, setCollapsed }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Student Management', icon: '👨‍🎓' },
    { id: 'wardens', label: 'Warden Management', icon: '👨‍🏫' },
    { id: 'hostels', label: 'Hostel Management', icon: '🏢' },
    { id: 'rooms', label: 'Room Management', icon: '🚪' },
    { id: 'fees', label: 'Fee Management', icon: '💰' }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <h2 className="logo-text">
            {collapsed ? 'H' : 'Hostel'}<span>ERP</span>
          </h2>
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
            <div className="nav-indicator"></div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-content">
          <span className="version">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
