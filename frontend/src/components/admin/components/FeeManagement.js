import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './FeeManagement.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feeStructures, setFeeStructures] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [formData, setFormData] = useState({
    hostel: '',
    roomType: '',
    amount: '',
    academicYear: new Date().getFullYear().toString(),
    dueDate: '',
    paymentDetails: {
      upiId: '',
      bankDetails: {
        accountName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
      }
    }
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all data in parallel
      const [structuresRes, statsRes, hostelsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/fees/structures', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Error fetching structures:', err);
          return { data: { data: [] } };
        }),
        axios.get('http://localhost:5000/api/fees/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Error fetching statistics:', err);
          return { data: { data: { overall: [], byHostel: [] } } };
        }),
        axios.get('http://localhost:5000/api/hostels/all', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          console.error('Error fetching hostels:', err);
          return { data: { data: [] } };
        })
      ]);

      console.log('Fetched data:', {
        structures: structuresRes.data,
        stats: statsRes.data,
        hostels: hostelsRes.data
      });
      
      setFeeStructures(structuresRes.data.data || []);
      setStatistics(statsRes.data.data || { overall: [], byHostel: [] });
      
      if (hostelsRes.data.success && hostelsRes.data.data) {
        setHostels(hostelsRes.data.data);
      } else {
        setHostels([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setFeeStructures([]);
      setStatistics({ overall: [], byHostel: [] });
      setHostels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Add form fields
      data.append('hostel', formData.hostel);
      data.append('roomType', formData.roomType);
      data.append('amount', formData.amount);
      data.append('academicYear', formData.academicYear);
      data.append('dueDate', formData.dueDate);
      data.append('paymentDetails', JSON.stringify(formData.paymentDetails));
      
      if (qrCodeFile) {
        data.append('qrCode', qrCodeFile);
      }

      console.log('Submitting fee structure:', {
        hostel: formData.hostel,
                roomType: formData.roomType,
        amount: formData.amount
      });

      await axios.post('http://localhost:5000/api/fees/structure', data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowAddModal(false);
      fetchData();
      resetForm();
      alert('Fee structure created successfully!');
    } catch (error) {
      console.error('Error creating fee structure:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Error creating fee structure');
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      hostel: structure.hostel._id,
      roomType: structure.roomType,
      amount: structure.amount,
      academicYear: structure.academicYear,
      dueDate: structure.dueDate.split('T')[0],
      paymentDetails: structure.paymentDetails || {
        upiId: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        }
      }
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/fees/structure/${editingStructure._id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setShowEditModal(false);
      fetchData();
      resetForm();
      setEditingStructure(null);
      alert('Fee structure updated successfully!');
    } catch (error) {
      console.error('Error updating fee structure:', error);
      alert(error.response?.data?.message || 'Error updating fee structure');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee structure? This will also delete all associated student fees.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/fees/structure/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      fetchData();
      alert('Fee structure deleted successfully!');
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      alert(error.response?.data?.message || 'Error deleting fee structure');
    }
  };

  const resetForm = () => {
    setFormData({
      hostel: '',
      roomType: '',
      amount: '',
      academicYear: new Date().getFullYear().toString(),
      dueDate: '',
      paymentDetails: {
        upiId: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        }
      }
    });
    setQrCodeFile(null);
  };

  const sendBulkReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      const overdueStudents = statistics?.overall?.find(s => s._id === 'overdue');
      
      if (!overdueStudents || overdueStudents.count === 0) {
        alert('No overdue payments found');
        return;
      }

      await axios.post('http://localhost:5000/api/fees/reminder', {
        type: 'overdue',
        message: 'This is a reminder that your hostel fee payment is overdue. Please pay immediately to avoid any penalties.'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Reminders sent successfully!');
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending reminders');
    }
  };

  const downloadReport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/fees/report/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fee_report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  // Chart data
  const barChartData = {
    labels: statistics?.byHostel?.map(h => h.hostelName || 'Unknown') || [],
    datasets: [
      {
        label: 'Collected',
        data: statistics?.byHostel?.map(h => h.collectedAmount) || [],
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      },
      {
        label: 'Pending',
        data: statistics?.byHostel?.map(h => h.pendingAmount) || [],
        backgroundColor: 'rgba(255, 152, 0, 0.6)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1
      }
    ]
  };

  const pieChartData = {
    labels: ['Paid', 'Pending', 'Partial', 'Overdue'],
    datasets: [{
      data: statistics?.overall?.map(s => s.count) || [0, 0, 0, 0],
      backgroundColor: [
        'rgba(76, 175, 80, 0.6)',
        'rgba(255, 152, 0, 0.6)',
        'rgba(33, 150, 243, 0.6)',
        'rgba(244, 67, 54, 0.6)'
      ],
      borderWidth: 1
    }]
  };

  if (loading) {
    return <div className="loading">Loading fee management data...</div>;
  }

  return (
    <motion.div
      className="fee-management"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fee-header">
        <h1>Fee Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <span className="btn-icon">+</span>
          Add Fee Structure
        </button>
      </div>

      <div className="fee-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'structures' ? 'active' : ''}`}
          onClick={() => setActiveTab('structures')}
        >
          Fee Structures
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="fee-overview">
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Total Expected</h3>
                <p>₹{statistics?.overall?.reduce((sum, s) => sum + (s.totalAmount || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card collected">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Collected</h3>
                <p>₹{statistics?.overall?.reduce((sum, s) => sum + (s.paidAmount || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p>₹{statistics?.overall?.reduce((sum, s) => sum + (s.pendingAmount || 0), 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card action">
              <button 
                className="btn-reminder"
                onClick={sendBulkReminder}
              >
                📧 Send Bulk Reminder
              </button>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-box">
              <h3>Collection by Hostel</h3>
              <Bar data={barChartData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Hostel-wise Fee Collection'
                  }
                }
              }} />
            </div>
            <div className="chart-box">
              <h3>Payment Status Distribution</h3>
              <Pie data={pieChartData} options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="fee-structures">
          <div className="structures-grid">
            {feeStructures.length === 0 ? (
              <p>No fee structures created yet.</p>
            ) : (
              feeStructures.map((structure) => (
                <div key={structure._id} className="structure-card">
                  <div className="structure-header">
                    <h3>{structure.hostel?.hostelName || 'Unknown Hostel'}</h3>
                    <span className="room-type">{structure.roomType}</span>
                  </div>
                  <div className="structure-details">
                    <div className="detail-item">
                      <span>Amount:</span>
                      <strong>₹{structure.amount?.toLocaleString() || 0}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Due Date:</span>
                      <strong>{structure.dueDate ? new Date(structure.dueDate).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Academic Year:</span>
                      <strong>{structure.academicYear}</strong>
                    </div>
                    <div className="detail-item">
                      <span>UPI ID:</span>
                      <strong>{structure.paymentDetails?.upiId || 'Not set'}</strong>
                    </div>
                  </div>
                  <div className="structure-actions">
                    <button className="btn-edit" onClick={() => handleEdit(structure)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(structure._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="fee-reports">
          <div className="reports-grid">
            <div className="report-card">
              <div className="report-icon">📊</div>
              <h3>Monthly Collection Report</h3>
              <p>Download detailed monthly fee collection report</p>
              <button 
                className="btn-download"
                onClick={() => downloadReport('monthly')}
              >
                Download PDF
              </button>
            </div>
            <div className="report-card">
              <div className="report-icon">🏠</div>
              <h3>Hostel-wise Report</h3>
              <p>Fee collection breakdown by hostel</p>
              <button 
                className="btn-download"
                onClick={() => downloadReport('hostel')}
              >
                Download PDF
              </button>
            </div>
            <div className="report-card">
              <div className="report-icon">⚠️</div>
              <h3>Pending Fees Report</h3>
              <p>List of students with pending fees</p>
              <button 
                className="btn-download"
                onClick={() => downloadReport('pending')}
              >
                Download PDF
              </button>
            </div>
            <div className="report-card">
              <div className="report-icon">📈</div>
              <h3>Annual Summary</h3>
              <p>Complete annual fee collection summary</p>
              <button 
                className="btn-download"
                onClick={() => downloadReport('annual')}
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowAddModal(false);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Fee Structure</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="fee-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Hostel</label>
                    <select
                      value={formData.hostel}
                      onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                      required
                    >
                      <option value="">Select Hostel</option>
                      {hostels.length === 0 ? (
                        <option disabled>No hostels available</option>
                      ) : (
                        hostels.map(hostel => (
                          <option key={hostel._id} value={hostel._id}>
                            {hostel.hostelName} ({hostel.hostelType})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="Enter amount"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment Details</h3>
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      value={formData.paymentDetails.upiId}
                      onChange={(e) => setFormData({
                        ...formData, 
                        paymentDetails: {...formData.paymentDetails, upiId: e.target.value}
                      })}
                      placeholder="example@upi"
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setQrCodeFile(e.target.files[0])}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Bank Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Name</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.accountName}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              accountName: e.target.value
                            }
                          }
                        })}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.accountNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              accountNumber: e.target.value
                            }
                          }
                        })}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.ifscCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              ifscCode: e.target.value
                            }
                          }
                        })}
                        placeholder="IFSC code"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.bankName}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              bankName: e.target.value
                            }
                          }
                        })}
                        placeholder="Bank name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Fee Structure
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Structure Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowEditModal(false);
          }
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Fee Structure</h2>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdate} className="fee-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Hostel</label>
                    <select
                      value={formData.hostel}
                      onChange={(e) => setFormData({...formData, hostel: e.target.value})}
                      required
                      disabled
                    >
                      <option value="">Select Hostel</option>
                      {hostels.map(hostel => (
                        <option key={hostel._id} value={hostel._id}>
                          {hostel.hostelName} ({hostel.hostelType})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                      required
                      disabled
                    >
                      <option value="">Select Type</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="dormitory">Dormitory</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      placeholder="Enter amount"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Payment Details</h3>
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      value={formData.paymentDetails.upiId}
                      onChange={(e) => setFormData({
                        ...formData, 
                        paymentDetails: {...formData.paymentDetails, upiId: e.target.value}
                      })}
                      placeholder="example@upi"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Bank Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Account Name</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.accountName}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              accountName: e.target.value
                            }
                          }
                        })}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.accountNumber}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              accountNumber: e.target.value
                            }
                          }
                        })}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.ifscCode}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              ifscCode: e.target.value
                            }
                          }
                        })}
                        placeholder="IFSC code"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Name</label>
                      <input
                        type="text"
                        value={formData.paymentDetails.bankDetails.bankName}
                        onChange={(e) => setFormData({
                          ...formData,
                          paymentDetails: {
                            ...formData.paymentDetails,
                            bankDetails: {
                              ...formData.paymentDetails.bankDetails,
                              bankName: e.target.value
                            }
                          }
                        })}
                        placeholder="Bank name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => {
                    setShowEditModal(false);
                    setEditingStructure(null);
                    resetForm();
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Update Fee Structure
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FeeManagement;
