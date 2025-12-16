// frontend/src/components/student/components/TopBar.js
import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { FiBell, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import AOS from 'aos';
import './TopBar.css'; // CSS is in the same folder

const TopBar = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const authContext = useAuth();
  // We don't need `useNavigate` here directly, only `logout` from context
  // --- END HOOKS SECTION ---

  useEffect(() => {
    AOS.refresh();
  }, []);

  if (!authContext) {
    console.error('TopBar component: AuthContext is null. Component is not wrapped by AuthProvider.');
    return null;
  }

  const { user, logout } = authContext;

  const handleLogout = () => { logout(); };
  const displayName = user?.name || 'Guest'; 
  const displayRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2 className="welcome-message">Welcome Back, <span className="highlight-text">{displayName}</span>!</h2>
        <p className="user-role">{displayRole} Dashboard</p>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn">
          <FiBell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <button className="topbar-icon-btn">
          <FiSettings size={20} />
        </button>
        
        <div className="profile-info">
          <FiUser size={20} className="profile-icon" />
          <span className="profile-name">{displayName}</span>
        </div>

        <button onClick={handleLogout} className="topbar-logout-btn">
          <FiLogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
