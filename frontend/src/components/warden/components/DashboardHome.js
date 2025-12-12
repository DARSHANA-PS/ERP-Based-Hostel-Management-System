import React, { useState, useEffect } from 'react';
import './DashboardHome.css';

const DashboardHome = ({ wardenData }) => {
  const [stats, setStats] = useState({
    hostelName: 'Loading...',
    totalRooms: 0,
    studentsStaying: 0,
    activeComplaints: 0,
    totalFeesCollected: 0,
    pendingRequests: 0,
    availableRooms: 0,
    occupiedBeds: 0,
    totalBeds: 0,
    occupancyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    // Mock recent activity data
    setRecentActivity([
      {
        id: 1,
        type: 'student',
        message: '3 new student requests awaiting approval',
        time: '2 hours ago',
        icon: '🎓'
      },
      {
        id: 2,
        type: 'complaint',
        message: 'New complaint from Room 102',
        time: '5 hours ago',
        icon: '📢'
      },
      {
        id: 3,
        type: 'fee',
        message: 'Fee payment received from 5 students',
        time: 'Yesterday',
        icon: '💰'
      }
    ]);
  };

  const quickActions = [
    { 
      title: 'Approve Students', 
      icon: '✅', 
      color: '#4CAF50',
      count: stats.pendingRequests,
      link: 'students'
    },
    { 
      title: 'View Complaints', 
      icon: '🧾', 
      color: '#FF9800',
      count: stats.activeComplaints,
      link: 'complaints'
    },
    { 
      title: 'Make Announcement', 
      icon: '📢', 
      color: '#2196F3',
      link: 'announcements'
    },
    { 
      title: 'View Hostel Details', 
      icon: '🏠', 
      color: '#9C27B0',
      link: 'rooms'
    }
  ];

  const statCards = [
    { 
      title: 'Hostel Name', 
      value: stats.hostelName, 
      icon: '🏠', 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      subtitle: stats.hostelType || 'Type'
    },
    { 
      title: 'Total Rooms', 
      value: stats.totalRooms, 
      icon: '🚪', 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      subtitle: `${stats.availableRooms} available`
    },
    { 
      title: 'Students', 
      value: stats.studentsStaying, 
      icon: '👨‍🎓', 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      subtitle: `${stats.pendingRequests} pending`
    },
    { 
      title: 'Complaints', 
      value: stats.activeComplaints, 
      icon: '⚠️', 
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      subtitle: 'Active issues'
    },
    { 
      title: 'Fees Collected', 
      value: `₹${stats.totalFeesCollected.toLocaleString()}`, 
      icon: '💰', 
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      subtitle: 'This month'
    },
    { 
      title: 'Occupancy', 
      value: `${stats.occupancyRate}%`, 
      icon: '📊', 
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      subtitle: `${stats.occupiedBeds}/${stats.totalBeds} beds`
    }
  ];

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section" data-aos="fade-down">
        <h1 className="welcome-title">
          Welcome back, {wardenData?.fullName || 'Warden'}! 👋
        </h1>
        <p className="welcome-subtitle">
          Here's a summary of your hostel today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section" data-aos="fade-up" data-aos-delay="100">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button 
              key={index}
              className="quick-action-card"
              style={{ '--action-color': action.color }}
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <span className="action-icon">{action.icon}</span>
              {action.count !== undefined && action.count > 0 && (
                <span className="action-badge">{action.count}</span>
              )}
              <span className="action-title">{action.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-section">
        <h2 className="section-title">Hostel Overview</h2>
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div 
              key={index}
              className="stat-card"
              data-aos="flip-left"
              data-aos-delay={index * 100}
            >
              <div className="stat-card-inner">
                <div className="stat-icon" style={{ background: stat.gradient }}>
                  <span>{stat.icon}</span>
                </div>
                <div className="stat-content">
                  <p className="stat-title">{stat.title}</p>
                  <h3 className="stat-value">{loading ? '...' : stat.value}</h3>
                  <p className="stat-subtitle">{stat.subtitle}</p>
                </div>
                <div className="stat-bg-icon">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Room Statistics */}
      {stats.roomStats && (
        <div className="room-stats-section" data-aos="fade-up">
          <h2 className="section-title">Room Status Overview</h2>
          <div className="room-stats-grid">
            <div className="room-stat-card available">
              <div className="room-stat-value">{stats.roomStats.available}</div>
              <div className="room-stat-label">Available Rooms</div>
            </div>
            <div className="room-stat-card full">
              <div className="room-stat-value">{stats.roomStats.full}</div>
              <div className="room-stat-label">Full Rooms</div>
            </div>
            <div className="room-stat-card maintenance">
              <div className="room-stat-value">{stats.roomStats.maintenance}</div>
              <div className="room-stat-label">Under Maintenance</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section" data-aos="fade-up">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p className="activity-message">{activity.message}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy Chart Placeholder */}
      <div className="chart-section" data-aos="fade-up">
        <h2 className="section-title">Occupancy Trends</h2>
        <div className="chart-container">
          <div className="occupancy-bar-chart">
            <div className="occupancy-bar" style={{ '--occupancy': stats.occupancyRate }}>
              <span className="occupancy-label">Current Occupancy: {stats.occupancyRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
