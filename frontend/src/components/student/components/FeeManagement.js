import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './FeeManagement.css';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [feeDetails, setFeeDetails] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'upi',
    transactionId: ''
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchFeeDetails();
    fetchNotifications();
  }, []);

  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/fees/my-fees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Extract current fee and history
        const currentFee = data.data.fees.find(f => f.status !== 'paid') || data.data.fees[0];
        setFeeDetails(currentFee);
        setTransactions(data.data.transactions || []);
        
        // If there's a pending amount, set it as default in payment form
        if (currentFee?.pendingAmount) {
          setPaymentForm(prev => ({ ...prev, amount: currentFee.pendingAmount.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const feeNotifications = data.data.filter(n => n.type === 'fee_reminder');
        setNotifications(feeNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentProof) {
      alert('Please upload payment proof');
      return;
    }

    const formData = new FormData();
    formData.append('amount', paymentForm.amount);
    formData.append('paymentMethod', paymentForm.paymentMethod);
    formData.append('transactionId', paymentForm.transactionId);
    formData.append('paymentProof', paymentProof);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/fees/payment', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment submitted successfully! Waiting for verification.');
        setShowPaymentModal(false);
        fetchFeeDetails();
        resetPaymentForm();
      } else {
        alert(data.message || 'Payment submission failed');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      alert('Error submitting payment');
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      amount: feeDetails?.pendingAmount || '',
      paymentMethod: 'upi',
      transactionId: ''
    });
    setPaymentProof(null);
  };

  const downloadReceipt = (transactionId) => {
    const token = localStorage.getItem('token');
    window.open(
      `http://localhost:5000/api/fees/receipt/${transactionId}?token=${token}`,
      '_blank'
    );
  };

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

  if (loading) {
    return (
      <div className="fee-loading">
        <div className="loader"></div>
        <p>Loading fee details...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="student-fee-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="fee-header">
        <h1>Fee Management</h1>
        <p className="fee-subtitle">Manage your hostel fee payments</p>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fee-notifications">
          {notifications.map((notif, index) => (
            <div key={index} className="fee-notification">
              <span className="notif-icon">🔔</span>
              <span>{notif.message}</span>
              <span className="notif-date">
                {new Date(notif.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fee Summary Cards */}
      <div className="fee-summary-cards">
        <div className="summary-card total">
          <div className="card-icon">💵</div>
          <div className="card-info">
            <h3>Total Amount</h3>
            <p>₹{feeDetails?.totalAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="summary-card paid">
          <div className="card-icon">✅</div>
          <div className="card-info">
            <h3>Paid Amount</h3>
            <p>₹{feeDetails?.paidAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="card-icon">⏰</div>
          <div className="card-info">
            <h3>Pending Amount</h3>
            <p>₹{feeDetails?.pendingAmount?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="summary-card due-date">
          <div className="card-icon">📅</div>
          <div className="card-info">
            <h3>Due Date</h3>
            <p>{feeDetails?.dueDate ? new Date(feeDetails.dueDate).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      {feeDetails?.pendingAmount > 0 && (
        <div className="payment-section">
          <h2>Make Payment</h2>
          <div className="payment-options">
            {/* QR Code Section */}
            {feeDetails?.feeStructure?.paymentDetails?.qrCode && (
              <div className="qr-section">
                <h3>Scan QR Code</h3>
                <img 
                  src={`http://localhost:5000${feeDetails.feeStructure.paymentDetails.qrCode}`}
                  alt="Payment QR Code"
                  className="qr-code"
                />
                <p className="upi-id">
                  UPI ID: {feeDetails.feeStructure.paymentDetails.upiId || 'N/A'}
                </p>
              </div>
            )}

            {/* Bank Details */}
            {feeDetails?.feeStructure?.paymentDetails?.bankDetails?.accountNumber && (
              <div className="bank-details">
                <h3>Bank Transfer Details</h3>
                <div className="detail-row">
                  <span>Account Name:</span>
                  <span>{feeDetails.feeStructure.paymentDetails.bankDetails.accountName}</span>
                </div>
                <div className="detail-row">
                  <span>Account Number:</span>
                  <span>{feeDetails.feeStructure.paymentDetails.bankDetails.accountNumber}</span>
                </div>
                <div className="detail-row">
                  <span>IFSC Code:</span>
                  <span>{feeDetails.feeStructure.paymentDetails.bankDetails.ifscCode}</span>
                </div>
                <div className="detail-row">
                  <span>Bank Name:</span>
                  <span>{feeDetails.feeStructure.paymentDetails.bankDetails.bankName}</span>
                </div>
              </div>
            )}

            {/* Upload Payment Proof Button */}
            <div className="payment-action">
              <button 
                className="btn-pay-now"
                onClick={() => setShowPaymentModal(true)}
              >
                Upload Payment Proof
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="fee-tabs">
        <button 
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Fee
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'current' && feeDetails && (
        <div className="current-fee-details">
          <div className="detail-card">
            <h3>Fee Structure Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Hostel</label>
                <p>{feeDetails.hostel?.hostelName || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Room Type</label>
                <p className="capitalize">{feeDetails.feeStructure?.roomType || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Academic Year</label>
                <p>{feeDetails.feeStructure?.academicYear || 'N/A'}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(feeDetails.status) }}
                >
                  {feeDetails.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="payment-history">
          {transactions.length === 0 ? (
            <div className="empty-history">
              <p>No payment history available</p>
            </div>
          ) : (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td>{transaction.transactionId}</td>
                      <td>₹{transaction.amount.toLocaleString()}</td>
                      <td className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(transaction.status) }}
                        >
                          {transaction.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {transaction.status === 'verified' && (
                          <button 
                            className="btn-download"
                            onClick={() => downloadReceipt(transaction._id)}
                          >
                            📥 Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Payment Proof</h2>
              <button 
                className="modal-close"
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <div className="form-group">
                <label>Amount Paid (₹)</label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  min="1"
                  max={feeDetails?.pendingAmount}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                  required
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="card">Debit/Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={paymentForm.transactionId}
                  onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                  placeholder="Enter transaction reference number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Upload Payment Proof</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPaymentProof(e.target.files[0])}
                  required
                />
                <p className="file-hint">Upload screenshot or photo of payment receipt</p>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeeManagement;
