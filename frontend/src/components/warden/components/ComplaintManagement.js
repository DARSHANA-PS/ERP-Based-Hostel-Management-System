import React, { useState, useEffect } from 'react';
import './ComplaintManagement.css';

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/warden/complaints?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    const remarks = prompt('Add remarks for this status update:');
    if (!remarks) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/warden/complaints/${complaintId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus, remarks })
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Complaint updated successfully');
        fetchComplaints();
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const forwardToAdmin = async (complaintId) => {
    if (window.confirm('Forward this complaint to admin?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/warden/complaints/${complaintId}/forward`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();
        if (data.success) {
          alert('Complaint forwarded to admin successfully');
          fetchComplaints();
        }
      } catch (error) {
        console.error('Error forwarding complaint:', error);
      }
    }
  };

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'in-progress':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Electrical':
        return '⚡';
      case 'Plumbing':
        return '🔧';
      case 'Cleanliness':
        return '🧹';
      case 'Security':
        return '🔒';
      case 'Food':
        return '🍽️';
      default:
        return '📋';
    }
  };

  return (
    <div className="complaint-management">
      <div className="section-header" data-aos="fade-down">
        <h1 className="section-title">Complaint Management</h1>
        <p className="section-subtitle">View and resolve complaints raised by students in your hostel</p>
      </div>

      {/* Summary Cards */}
      <div className="complaint-summary" data-aos="fade-up">
        <div className="summary-card pending">
          <span className="summary-icon">⏳</span>
          <div className="summary-content">
            <h3>{complaints.filter(c => c.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="summary-card in-progress">
          <span className="summary-icon">🔄</span>
          <div className="summary-content">
            <h3>{complaints.filter(c => c.status === 'in-progress').length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="summary-card resolved">
          <span className="summary-icon">✅</span>
          <div className="summary-content">
            <h3>{complaints.filter(c => c.status === 'resolved').length}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="complaint-filters" data-aos="fade-up">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Complaints
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      {/* Complaints List */}
      <div className="complaints-container" data-aos="fade-up">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading complaints...</p>
          </div>
        ) : complaints.length > 0 ? (
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div 
                key={complaint._id} 
                className={`complaint-card ${complaint.status}`}
                onClick={() => viewComplaintDetails(complaint)}
              >
                <div className="complaint-header">
                  <div className="complaint-meta">
                    <span className="complaint-id">#{complaint.complaintId}</span>
                    <span className="complaint-date">
                      {new Date(complaint.dateSubmitted).toLocaleDateString()}
                    </span>
                  </div>
                  <span 
                    className={`status-badge ${complaint.status}`}
                    style={{ backgroundColor: getStatusColor(complaint.status) + '20', 
                             color: getStatusColor(complaint.status) }}
                  >
                    {complaint.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="complaint-body">
                  <div className="complaint-category">
                    <span className="category-icon">{getCategoryIcon(complaint.issueType)}</span>
                    <span className="category-text">{complaint.issueType}</span>
                  </div>
                  
                  <div className="complaint-info">
                    <p className="student-info">
                      <strong>{complaint.studentName}</strong> • Room {complaint.roomNo}
                    </p>
                    <p className="complaint-description">{complaint.description}</p>
                  </div>
                </div>

                <div className="complaint-footer">
                  <button
                    className="action-btn view"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewComplaintDetails(complaint);
                    }}
                  >
                    View Details
                  </button>
                  {complaint.status === 'pending' && (
                    <button
                      className="action-btn start"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComplaintStatus(complaint._id, 'in-progress');
                      }}
                    >
                      Start Working
                    </button>
                  )}
                  {complaint.status === 'in-progress' && (
                    <button
                      className="action-btn resolve"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateComplaintStatus(complaint._id, 'resolved');
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No complaints found</h3>
            <p>No complaints match your filter criteria</p>
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content complaint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="complaint-detail-header">
                <div className="detail-id">#{selectedComplaint.complaintId}</div>
                <span 
                  className={`status-badge ${selectedComplaint.status}`}
                  style={{ backgroundColor: getStatusColor(selectedComplaint.status) + '20', 
                           color: getStatusColor(selectedComplaint.status) }}
                >
                  {selectedComplaint.status.replace('-', ' ')}
                </span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Student Name</label>
                  <p>{selectedComplaint.studentName}</p>
                </div>
                <div className="detail-item">
                  <label>Room Number</label>
                  <p>{selectedComplaint.roomNo}</p>
                </div>
                <div className="detail-item">
                  <label>Issue Type</label>
                  <p>{selectedComplaint.issueType}</p>
                </div>
                <div className="detail-item">
                  <label>Date Submitted</label>
                  <p>{new Date(selectedComplaint.dateSubmitted).toLocaleString()}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p className="complaint-full-description">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.remarks && (
                <div className="detail-section">
                  <h3>Remarks/Actions Taken</h3>
                  <p className="complaint-remarks">{selectedComplaint.remarks}</p>
                </div>
              )}

              <div className="modal-actions">
                {selectedComplaint.status === 'pending' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => updateComplaintStatus(selectedComplaint._id, 'in-progress')}
                  >
                    Start Working
                  </button>
                )}
                {selectedComplaint.status === 'in-progress' && (
                  <button
                    className="btn btn-success"
                    onClick={() => updateComplaintStatus(selectedComplaint._id, 'resolved')}
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  className="btn btn-warning"
                  onClick={() => forwardToAdmin(selectedComplaint._id)}
                >
                  Forward to Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
