// frontend/src/components/student/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { 
  FiHome, 
  FiBookOpen, 
  FiMap, 
  FiFileText, 
  FiUser, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import AOS from 'aos';
import './Sidebar.css'; // CSS is in the same folder

const Sidebar = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const authContext = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  // --- END HOOKS SECTION ---

  useEffect(() => {
    AOS.refresh();
  }, []);

  if (!authContext) {
    console.error('Sidebar component: AuthContext is null. Component is not wrapped by AuthProvider.');
    return null;
  }
  const { user, logout } = authContext;

  const navItems = [
    { name: 'Home', icon: <FiHome />, path: '/student/home' },
    { name: 'Hostels', icon: <FiMap />, path: '/student/hostels' },
    { name: 'My Booking', icon: <FiBookOpen />, path: '/student/my-booking' },
    { name: 'Complaints', icon: <FiFileText />, path: '/student/complaints' },
    { name: 'Profile', icon: <FiUser />, path: '/student/profile' },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const displayUserName = user?.name || 'Student';
  const userInitial = displayUserName.charAt(0).toUpperCase();

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">Hostel<span>ERP</span></h3>
        <button onClick={toggleSidebar} className="toggle-btn">
          {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
        </button>
      </div>

      <div className="sidebar-user-profile">
        <div className="profile-avatar">{userInitial}</div>
        {isOpen && <div className="profile-details">
          <p className="profile-name">{displayUserName}</p>
          <p className="profile-role">{user?.role || 'Student'}</p>
        </div>}
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut size={20} />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
