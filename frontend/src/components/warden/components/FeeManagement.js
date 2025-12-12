import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './FeeManagement.css';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [error, setError] = useState(null);
  const [hostelId, setHostelId] = useState(null);

  useEffect(() => {
    fetchWardenProfile();
  }, []);

  const fetchWardenProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching warden profile...');
      
      const response = await fetch('http://localhost:5000/api/warden/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warden profile: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Warden profile data:', data);
      
      if (data.success && data.data) {
        // Extract hostel ID properly
        let extractedHostelId = null;
        
        if (data.data.hostelId) {
          if (typeof data.data.hostelId === 'string') {
            extractedHostelId = data.data.hostelId;
          } else if (data.data.hostelId._id) {
            extractedHostelId = data.data.hostelId._id;
          }
        }
        
        if (extractedHostelId) {
          console.log('Found hostel ID:', extractedHostelId);
          setHostelId(extractedHostelId);
          fetchFeeData(extractedHostelId);
        } else {
          setError('You are not assigned to any hostel. Please contact the administrator.');
          setLoading(false);
        }
      } else {
        throw new Error('Invalid warden profile data');
      }
    } catch (error) {
      console.error('Error fetching warden profile:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchFeeData = async (hostelIdParam) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching fee data for hostel:', hostelIdParam);
      
      const response = await fetch(`http://localhost:5000/api/fees/hostel-fees/${hostelIdParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fee data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fee data response:', data);
      
      if (data.success) {
        setStudents(data.data.fees || []);
        setTransactions(data.data.transactions || []);
        calculateStatistics(data.data.fees || []);
      } else {
        throw new Error(data.message || 'Failed to fetch fee data');
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      setError(error.message);
      setStudents([]);
      setTransactions([]);
      calculateStatistics([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (fees) => {
    console.log('Calculating statistics for fees:', fees);
    
    const stats = {
      totalStudents: fees.length,
      paidCount: fees.filter(f => f.status === 'paid').length,
      pendingCount: fees.filter(f => f.status === 'pending').length,
      partialCount: fees.filter(f => f.status === 'partial').length,
      overdueCount: fees.filter(f => f.status === 'overdue').length,
      totalAmount: fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0),
      collectedAmount: fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
      pendingAmount: fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0)
    };
    
    console.log('Calculated statistics:', stats);
    setStatistics(stats);
  };

  const handleVerifyPayment = async (transactionId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/fees/verify/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: status === 'approve' ? 'verified' : 'rejected',
          remarks: status === 'approve' ? 'Payment verified' : 'Payment rejected - Invalid proof'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Payment ${status === 'approve' ? 'verified' : 'rejected'} successfully!`);
        if (hostelId) {
          fetchFeeData(hostelId);
        }
      } else {
        alert(data.message || 'Error verifying payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Error verifying payment');
    }
  };

  const handleSendReminder = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/fees/reminder', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentIds: selectedStudents,
          message: reminderMessage || 'This is a reminder that your hostel fee payment is due. Please pay on time.'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setShowReminderModal(false);
        setSelectedStudents([]);
        setReminderMessage('');
      } else {
        alert(data.message || 'Error sending reminders');
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending reminders');
    }
  };

  const handleSelectStudent = (studentId) => {
    if (!studentId) return;
    
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleSelectAll = () => {
    const pendingStudents = filteredStudents
      .filter(s => s.status !== 'paid' && s.student && s.student._id)
      .map(s => s.student._id);
    
    if (selectedStudents.length === pendingStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(pendingStudents);
    }
  };

  const filteredStudents = students.filter(fee => {
    const matchesStatus = filterStatus === 'all' || fee.status === filterStatus;
    const matchesSearch = 
      fee.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.student?.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.room?.roomNo?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingTransactions = transactions.filter(t => t.status === 'pending_verification');

  const getStatusColor = (status) => {
    const colors = {
      paid: '#4CAF50',
      pending: '#FF9800',
      partial: '#2196F3',
      overdue: '#F44336',
      verified: '#4CAF50',
      pending_verification: '#FFC107',
      rejected: '#F44336'
    };
    return colors[status] || '#757575';
  };

  const refreshData = () => {
    if (hostelId) {
      setLoading(true);
      setError(null);
      fetchFeeData(hostelId);
    } else {
      fetchWardenProfile();
    }
  };

  if (loading) {
    return (
      <div className="warden-fee-loading">
        <div className="loader"></div>
        <p>Loading fee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="warden-fee-error">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={refreshData} className="btn-retry">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="warden-fee-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="fee-header">
        <h1>Fee Management</h1>
        <div className="header-actions">
          <button 
            className="btn-refresh"
            onClick={refreshData}
            title="Refresh data"
          >
            🔄
          </button>
          <button 
            className="btn-send-reminder"
            onClick={() => setShowReminderModal(true)}
            disabled={students.length === 0}
          >
            📧 Send Reminder
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="fee-stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Students</h3>
              <p>{statistics.totalStudents}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Expected</h3>
              <p>₹{statistics.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card collected">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Collected</h3>
              <p>₹{statistics.collectedAmount.toLocaleString()}</p>
              <span className="stat-percentage">
                ({statistics.totalAmount ? ((statistics.collectedAmount / statistics.totalAmount) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <p>₹{statistics.pendingAmount.toLocaleString()}</p>
              <span className="stat-count">{statistics.pendingCount} students</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="fee-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          Pending Verification ({pendingTransactions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Student Fees
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="fee-overview">
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Payment Status Distribution</h3>
              <div className="status-breakdown">
                <div className="status-item paid">
                  <span className="status-label">Paid</span>
                  <span className="status-value">{statistics?.paidCount || 0}</span>
                </div>
                <div className="status-item partial">
                  <span className="status-label">Partial</span>
                  <span className="status-value">{statistics?.partialCount || 0}</span>
                </div>
                <div className="status-item pending">
                  <span className="status-label">Pending</span>
                  <span className="status-value">{statistics?.pendingCount || 0}</span>
                </div>
                <div className="status-item overdue">
                  <span className="status-label">Overdue</span>
                  <span className="status-value">{statistics?.overdueCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="overview-card">
              <h3>Recent Transactions</h3>
              {transactions.length === 0 ? (
                <p className="no-data">No transactions yet</p>
              ) : (
                <div className="recent-transactions">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction._id} className="transaction-item">
                      <div className="transaction-info">
                        <span className="student-name">
                          {transaction.student?.fullName || 'Unknown Student'}
                        </span>
                        <span className="transaction-date">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="transaction-amount">
                        ₹{(transaction.amount || 0).toLocaleString()}
                        <span 
                          className="transaction-status"
                          style={{ color: getStatusColor(transaction.status) }}
                        >
                          {(transaction.status || 'unknown').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Tab */}
      {activeTab === 'verification' && (
        <div className="verification-section">
          <h2>Pending Payment Verifications</h2>
          {pendingTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No payments pending verification</p>
            </div>
          ) : (
            <div className="verification-cards">
              {pendingTransactions.map(transaction => (
                <div key={transaction._id} className="verification-card">
                  <div className="card-header">
                    <h3>{transaction.student?.fullName || 'Unknown Student'}</h3>
                    <span className="student-id">
                      {transaction.student?.studentId || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="transaction-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span className="amount">
                        ₹{(transaction.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Transaction ID:</span>
                      <span>{transaction.transactionId || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Payment Method:</span>
                      <span className="capitalize">
                        {(transaction.paymentMethod || 'unknown').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span>Date:</span>
                      <span>
                        {transaction.createdAt 
                          ? new Date(transaction.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {transaction.paymentProof && (
                    <div className="payment-proof">
                      <h4>Payment Proof:</h4>
                      <a 
                        href={`http://localhost:5000${transaction.paymentProof}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="proof-link"
                      >
                        View Proof 📎
                      </a>
                    </div>
                  )}

                  <div className="verification-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleVerifyPayment(transaction._id, 'approve')}
                    >
                      ✅ Verify
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleVerifyPayment(transaction._id, 'reject')}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="students-fee-section">
          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, ID, or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>

            <button 
              className="btn-select-all"
              onClick={handleSelectAll}
              disabled={filteredStudents.length === 0}
            >
              {selectedStudents.length === filteredStudents.filter(s => s.status !== 'paid').length 
                ? 'Deselect All' 
                : 'Select All Pending'}
            </button>
          </div>

          {/* Students Table */}
          <div className="students-table-container">
            {filteredStudents.length === 0 ? (
              <div className="empty-state">
                <p>{searchQuery ? 'No students match your search' : 'No student fees found'}</p>
              </div>
            ) : (
              <table className="students-fee-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedStudents.length > 0 && 
                          selectedStudents.length === filteredStudents.filter(s => s.status !== 'paid').length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Room No</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((fee) => (
                    <tr key={fee._id}>
                      <td>
                        {fee.status !== 'paid' && fee.student?._id && (
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(fee.student._id)}
                            onChange={() => handleSelectStudent(fee.student._id)}
                          />
                        )}
                      </td>
                      <td>{fee.student?.fullName || 'Unknown'}</td>
                      <td>{fee.student?.studentId || 'N/A'}</td>
                      <td>{fee.room?.roomNo || fee.student?.roomNumber || 'N/A'}</td>
                      <td>₹{(fee.totalAmount || 0).toLocaleString()}</td>
                      <td>₹{(fee.paidAmount || 0).toLocaleString()}</td>
                      <td>₹{(fee.pendingAmount || 0).toLocaleString()}</td>
                      <td>
                        {fee.dueDate 
                          ? new Date(fee.dueDate).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(fee.status) }}
                        >
                          {fee.status || 'unknown'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-view-details"
                          onClick={() => setSelectedStudent(fee)}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Fee Reminder</h2>
              <button 
                className="modal-close"
                onClick={() => setShowReminderModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="selected-count">
                {selectedStudents.length > 0 
                  ? `${selectedStudents.length} student(s) selected` 
                  : 'No students selected - Select students from the Student Fees tab'}
              </div>

              <div className="form-group">
                <label>Reminder Message</label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  placeholder="Enter your reminder message..."
                  rows="4"
                  className="reminder-textarea"
                />
              </div>

              <div className="default-message">
                <p><strong>Default message:</strong></p>
                <p>This is a reminder that your hostel fee payment is due. Please pay on time.</p>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => setShowReminderModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-send"
                  onClick={handleSendReminder}
                  disabled={selectedStudents.length === 0}
                >
                  Send Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Fee Details</h2>
              <button 
                className="modal-close"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="student-detail-card">
                <h3>{selectedStudent.student?.fullName || 'Unknown Student'}</h3>
                <p><strong>ID:</strong> {selectedStudent.student?.studentId || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedStudent.student?.email || 'N/A'}</p>
                <p><strong>Mobile:</strong> {selectedStudent.student?.mobile || 'N/A'}</p>
                <p><strong>Room:</strong> {selectedStudent.room?.roomNo || selectedStudent.student?.roomNumber || 'N/A'}</p>
              </div>

              <div className="fee-details">
                <h4>Fee Information</h4>
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <span>₹{(selectedStudent.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Paid Amount:</span>
                  <span>₹{(selectedStudent.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Pending Amount:</span>
                  <span>₹{(selectedStudent.pendingAmount || 0).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span>Due Date:</span>
                  <span>
                    {selectedStudent.dueDate 
                      ? new Date(selectedStudent.dueDate).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedStudent.status) }}
                  >
                    {selectedStudent.status || 'unknown'}
                  </span>
                </div>
              </div>

              <h4>Payment History</h4>
              <div className="payment-history">
                {transactions
                  .filter(t => t.studentFee === selectedStudent._id || t.studentFee?._id === selectedStudent._id)
                  .length === 0 ? (
                    <p className="no-history">No payment history available</p>
                  ) : (
                    transactions
                      .filter(t => t.studentFee === selectedStudent._id || t.studentFee?._id === selectedStudent._id)
                      .map(transaction => (
                        <div key={transaction._id} className="history-item">
                          <div className="history-date">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="history-details">
                            <span>₹{(transaction.amount || 0).toLocaleString()}</span>
                            <span className="history-method">
                              {(transaction.paymentMethod ||                               'unknown').replace('_', ' ')}
                            </span>
                            <span 
                              className="history-status"
                              style={{ color: getStatusColor(transaction.status) }}
                            >
                              {(transaction.status || 'unknown').replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeeManagement;
