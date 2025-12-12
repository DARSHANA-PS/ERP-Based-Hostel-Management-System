import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      // Changed from /api/students to /api/student
      const response = await axios.get('http://localhost:5000/api/student/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      const token = localStorage.getItem('token');
      // Changed from /api/students to /api/student
      await axios.put(
        `http://localhost:5000/api/student/announcements/${announcementId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  // Rest of your component code remains the same...
  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.category === filter);

  const getCategoryColor = (category) => {
    const colors = {
      general: '#4CAF50',
      maintenance: '#FF9800',
      event: '#2196F3',
      urgent: '#f44336',
      rules: '#9C27B0',
      fees: '#FFC107'
    };
    return colors[category] || '#757575';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="announcements"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="page-title">Announcements</h2>
      
      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'general' ? 'active' : ''} 
          onClick={() => setFilter('general')}
        >
          General
        </button>
        <button 
          className={filter === 'maintenance' ? 'active' : ''} 
          onClick={() => setFilter('maintenance')}
        >
          Maintenance
        </button>
        <button 
          className={filter === 'urgent' ? 'active' : ''} 
          onClick={() => setFilter('urgent')}
        >
          Urgent
        </button>
        <button 
          className={filter === 'event' ? 'active' : ''} 
          onClick={() => setFilter('event')}
        >
          Events
        </button>
        <button 
          className={filter === 'fees' ? 'active' : ''} 
          onClick={() => setFilter('fees')}
        >
          Fees
        </button>
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement, index) => (
            <motion.div
              key={announcement._id}
              className={`announcement-card ${announcement.priority}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => markAsRead(announcement._id)}
              style={{ borderLeftColor: getCategoryColor(announcement.category) }}
            >
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <div className="announcement-badges">
                  <span 
                    className={`announcement-category`}
                    style={{ backgroundColor: getCategoryColor(announcement.category) + '20',
                             color: getCategoryColor(announcement.category) }}
                  >
                    {announcement.category}
                  </span>
                  {announcement.priority === 'high' && (
                    <span className="priority-badge high">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
              <p className="announcement-content">{announcement.content}</p>
              <div className="announcement-footer">
                <span className="announcement-date">
                  {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="announcement-author">
                  By {announcement.createdBy?.fullName || 'Warden'}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📢</span>
            <p className="no-announcements">No announcements found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Announcements;
