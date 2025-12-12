import React, { useState, useEffect } from 'react';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/warden/announcements/${editingId}`
        : 'http://localhost:5000/api/warden/announcements';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingId ? 'Announcement updated successfully!' : 'Announcement posted successfully!');
        setShowCreateModal(false);
        setShowEditModal(false);
        setFormData({ title: '', description: '' });
        setEditingId(null);
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Failed to post announcement');
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.content
    });
    setEditingId(announcement._id);
    setShowEditModal(true);
  };

  const deleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/warden/announcements/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          alert('Announcement deleted successfully');
          fetchAnnouncements();
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
      }
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.isActive ? filter === 'active' : filter === 'archived';
  });

  return (
    <div className="announcements">
      <div className="section-header" data-aos="fade-down">
        <div className="header-content">
          <h1 className="section-title">Announcements</h1>
          <p className="section-subtitle">Post important updates and notices to all students</p>
        </div>
        <button 
          className="btn-create-announcement"
          onClick={() => setShowCreateModal(true)}
        >
          <span>📢</span>
          Make Announcement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="announcement-filters" data-aos="fade-up">
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-tab ${filter === 'archived' ? 'active' : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archived
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {/* Recent Announcements */}
      <div className="recent-announcements" data-aos="fade-up">
        <h2 className="subsection-title">Your Announcements</h2>
        
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="announcements-list">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-header">
                  <div className="announcement-meta">
                    <span className="announcement-icon">📢</span>
                    <div>
                      <h3 className="announcement-title">{announcement.title}</h3>
                      <span className="announcement-date">
                        {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="announcement-actions">
                    <button 
                      className="action-btn edit"
                      title="Edit"
                      onClick={() => handleEdit(announcement)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteAnnouncement(announcement._id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="announcement-body">
                  <p>{announcement.content}</p>
                </div>
                <div className="announcement-footer">
                  <span className={`status-badge ${announcement.isActive ? 'active' : 'archived'}`}>
                    {announcement.isActive ? 'Active' : 'Archived'}
                  </span>
                  <span className="view-count">
                    👁️ {announcement.readBy ? announcement.readBy.length : 0} views
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📢</span>
            <h3>No announcements yet</h3>
            <p>Click "Make Announcement" to post your first announcement</p>
          </div>
        )}
      </div>

      {/* Announcement Templates */}
      <div className="templates-section" data-aos="fade-up">
        <h2 className="subsection-title">Quick Templates</h2>
        <div className="templates-grid">
          <div 
            className="template-card"
            onClick={() => {
              setFormData({
                title: 'Room Inspection Notice',
                description: 'Room inspection will be conducted tomorrow. Please ensure your rooms are clean and organized.'
              });
              setShowCreateModal(true);
            }}
          >
            <span className="template-icon">🔍</span>
            <h4>Room Inspection</h4>
          </div>
          <div 
            className="template-card"
            onClick={() => {
              setFormData({
                title: 'Water Supply Maintenance',
                description: 'Water supply will be temporarily stopped for maintenance work. Please store water accordingly.'
              });
              setShowCreateModal(true);
            }}
          >
            <span className="template-icon">💧</span>
            <h4>Water Maintenance</h4>
          </div>
          <div 
            className="template-card"
            onClick={() => {
              setFormData({
                title: 'Hostel Meeting',
                description: 'Mandatory hostel meeting scheduled. All students must attend.'
              });
              setShowCreateModal(true);
            }}
          >
            <span className="template-icon">👥</span>
            <h4>Meeting Notice</h4>
          </div>
          <div 
            className="template-card"
            onClick={() => {
              setFormData({
                title: 'Fee Payment Reminder',
                description: 'This is a reminder to pay your hostel fees before the deadline.'
              });
              setShowCreateModal(true);
            }}
          >
            <span className="template-icon">💰</span>
            <h4>Fee Reminder</h4>
          </div>
        </div>
      </div>

      {/* Create/Edit Announcement Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setEditingId(null);
          setFormData({ title: '', description: '' });
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingId(null);
                  setFormData({ title: '', description: '' });
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="announcement-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="6"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter announcement details"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingId(null);
                    setFormData({ title: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Announcement' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
