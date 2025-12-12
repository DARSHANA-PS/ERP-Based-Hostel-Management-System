import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI';
import './WardenManagement.css';

const WardenManagement = () => {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllWardens();
      setWardens(data);
    } catch (error) {
      console.error('Error fetching wardens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (wardenId) => {
    try {
      await adminAPI.approveWarden(wardenId);
      fetchWardens();
    } catch (error) {
      console.error('Error approving warden:', error);
    }
  };

  const handleReject = async (wardenId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await adminAPI.rejectWarden(wardenId);
        fetchWardens();
      } catch (error) {
        console.error('Error rejecting warden:', error);
      }
    }
  };

  const filteredWardens = wardens.filter(warden => {
    if (filter === 'all') return true;
    return warden.status === filter;
  });

  return (
    <div className="warden-management">
      <div className="section-header" data-aos="fade-down">
        <div>
          <h1 className="section-title">Warden Management</h1>
          <p className="section-subtitle">Manage all warden registrations</p>
        </div>
      </div>

      <div className="filter-bar" data-aos="fade-up">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Wardens ({wardens.length})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({wardens.filter(w => w.status === 'pending').length})
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({wardens.filter(w => w.status === 'approved').length})
          </button>
        </div>
      </div>

      <div className="table-container" data-aos="fade-up">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳</div>
            <p>Loading wardens...</p>
          </div>
        ) : filteredWardens.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🧑‍🏫</span>
            <h3>No wardens found</h3>
          </div>
        ) : (
          <table className="wardens-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Hostel</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWardens.map((warden, index) => (
                <tr key={warden._id} data-aos="fade-up" data-aos-delay={index * 50}>
                  <td>{warden.fullName}</td>
                  <td>{warden.email}</td>
                  <td>{warden.mobile}</td>
                  <td>{warden.designation}</td>
                  <td>{warden.assignedHostel}</td>
                  <td>
                    <span className={`status-badge ${warden.status}`}>
                      {warden.status}
                    </span>
                  </td>
                  <td>
                    {warden.status === 'pending' && (
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-approve"
                          onClick={() => handleApprove(warden._id)}
                        >
                          ✅
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => handleReject(warden._id)}
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WardenManagement;
