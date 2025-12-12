import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './Complaints.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newComplaint, setNewComplaint] = useState({
    category: 'maintenance',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fixed API endpoint - removed the 's' from students
      const response = await axios.get('http://localhost:5000/api/student/complaints', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setComplaints(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Fixed API endpoint - removed the 's' from students
      const response = await axios.post(
        'http://localhost:5000/api/student/complaints', 
        newComplaint, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('Complaint submitted successfully!');
        setShowForm(false);
        setNewComplaint({
          category: 'maintenance',
          description: '',
          priority: 'medium'
        });
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      water: '💧',
      electricity: '⚡',
      cleanliness: '🧹',
      wifi: '📶',
      maintenance: '🔧',
      others: '📋'
    };
    return icons[category] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      'in-progress': '#2196F3',
      resolved: '#4CAF50',
      rejected: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      urgent: '#D32F2F'
    };
    return colors[priority] || '#757575';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loader"></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="complaints"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="complaints-header">
        <div>
          <h2 className="page-title">My Complaints</h2>
          <p className="page-subtitle">Track and manage your hostel complaints</p>
        </div>
        <button 
          className="new-complaint-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Complaint'}
        </button>
      </div>

      {showForm && (
        <motion.form
          className="complaint-form"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
                required
              >
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="wifi">WiFi</option>
                <option value="maintenance">Maintenance</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <select
                value={newComplaint.priority}
                onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Describe your complaint in detail..."
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
              rows="5"
              maxLength="500"
              required
            />
            <small>{newComplaint.description.length}/500 characters</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Complaint
            </button>
          </div>
        </motion.form>
      )}

      <div className="complaints-stats">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <h3>{complaints.length}</h3>
            <p>Total Complaints</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div>
            <h3>{complaints.filter(c => c.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔄</span>
          <div>
            <h3>{complaints.filter(c => c.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div>
            <h3>{complaints.filter(c => c.status === 'resolved').length}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      <div className="complaints-list">
        {complaints.length > 0 ? (
          complaints.map((complaint, index) => (
            <motion.div
              key={complaint._id}
              className={`complaint-card ${complaint.status}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="complaint-header">
                <div className="complaint-title">
                  <span className="category-icon">{getCategoryIcon(complaint.category)}</span>
                  <h3>{complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)} Issue</h3>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(complaint.status) + '20', 
                           color: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
              </div>
              
              <p className="complaint-description">{complaint.description}</p>
              
              <div className="complaint-footer">
                <span 
                  className="priority-badge"
                  style={{ color: getPriorityColor(complaint.priority) }}
                >
                  {complaint.priority.toUpperCase()} Priority
                </span>
                <span className="complaint-date">
                  {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {complaint.resolution && (
                <div className="resolution-section">
                  <h4>Resolution</h4>
                  <p>{complaint.resolution}</p>
                  {complaint.resolvedAt && (
                    <span className="resolved-date">
                      Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No complaints found</h3>
            <p>You haven't raised any complaints yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Complaints;
