import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { adminAPI } from '../utils/adminAPI';
import './DashboardHome.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalHostels: 2,
    totalRooms: 400,
    totalStudents: 0,
    totalWardens: 0,
    pendingFees: 210000,
    pendingComplaints: 5
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Hostels', value: stats.totalHostels, icon: '🏠', color: '#E91E63', gradient: 'linear-gradient(135deg, #E91E63 0%, #E1BEE7 100%)' },
    { title: 'Total Rooms', value: stats.totalRooms, icon: '🚪', color: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)' },
    { title: 'Total Students', value: stats.totalStudents, icon: '👨‍🎓', color: '#667eea', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Total Wardens', value: stats.totalWardens, icon: '🧑‍🏫', color: '#30cfd0', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { title: 'Pending Fees', value: `₹${stats.pendingFees.toLocaleString()}`, icon: '💰', color: '#f093fb', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Complaints', value: stats.pendingComplaints, icon: '🧾', color: '#4facfe', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
  ];

  // Chart Data
  const occupancyData = {
    labels: ['Boys Hostel', 'Girls Hostel'],
    datasets: [
      {
        label: 'Occupied',
        data: [180, 160],
        backgroundColor: 'rgba(233, 30, 99, 0.8)',
      },
      {
        label: 'Available',
        data: [20, 20],
        backgroundColor: 'rgba(233, 30, 99, 0.3)',
      }
    ]
  };

  const genderData = {
    labels: ['Male Students', 'Female Students'],
    datasets: [{
      data: [450, 330],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(233, 30, 99, 0.8)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(233, 30, 99, 1)'
      ],
      borderWidth: 2
    }]
  };

  return (
    <div className="dashboard-home">
      {/* Page Header */}
      <div className="page-header" data-aos="fade-down">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's your hostel overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index}
            className="stat-card"
            data-aos="zoom-in"
            data-aos-delay={index * 100}
            style={{ '--card-gradient': stat.gradient }}
          >
            <div className="stat-card-inner">
              <div className="stat-icon" style={{ background: stat.gradient }}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{loading ? '...' : stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
              <div className="stat-bg-icon">{stat.icon}</div>
            </div>
            <div className="stat-card-footer">
              <span className="stat-trend">↑ 12%</span>
              <span className="stat-period">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container" data-aos="fade-right">
          <div className="chart-header">
            <h2 className="chart-title">Hostel Occupancy</h2>
            <button className="chart-btn">View Details</button>
          </div>
          <div className="chart-content">
            <Bar 
              data={occupancyData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true }
                }
              }} 
            />
          </div>
        </div>

        <div className="chart-container" data-aos="fade-left">
          <div className="chart-header">
            <h2 className="chart-title">Gender Distribution</h2>
            <button className="chart-btn">View Details</button>
          </div>
          <div className="chart-content">
            <Doughnut 
              data={genderData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities" data-aos="fade-up">
        <div className="section-header">
          <h2 className="section-title">Recent Activities</h2>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="activities-list">
          <div className="activity-item">
            <div className="activity-icon" style={{ background: 'rgba(233, 30, 99, 0.1)' }}>
              <span>🎓</span>
            </div>
            <div className="activity-content">
              <h4>New Student Registration</h4>
              <p>John Doe applied for Boys Hostel</p>
            </div>
            <span className="activity-time">2 hours ago</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon" style={{ background: 'rgba(255, 107, 107, 0.1)' }}>
              <span>🧑‍🏫</span>
            </div>
            <div className="activity-content">
              <h4>Warden Application</h4>
              <p>Sarah Smith applied for Warden position</p>
            </div>
            <span className="activity-time">5 hours ago</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon" style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
              <span>📢</span>
            </div>
            <div className="activity-content">
              <h4>New Complaint</h4>
              <p>Water issue reported in Room 204</p>
            </div>
            <span className="activity-time">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
