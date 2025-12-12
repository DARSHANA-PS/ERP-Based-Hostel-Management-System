import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/adminAPI';
import './StudentManagement.css';

const StudentManagement = ({ searchQuery }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery, filter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(student => student.status === filter);
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const handleApprove = async (studentId) => {
    try {
      await adminAPI.approveStudent(studentId);
      fetchStudents(); // Refresh list
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const handleReject = async (studentId) => {
    if (window.confirm('Are you sure you want to reject this application?')) {
      try {
        await adminAPI.rejectStudent(studentId);
        fetchStudents(); // Refresh list
      } catch (error) {
        console.error('Error rejecting student:', error);
      }
    }
  };

  const viewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', icon: '⏳' },
      approved: { class: 'badge-success', icon: '✅' },
      rejected: { class: 'badge-danger', icon: '❌' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="student-management">
      {/* Header */}
      <div className="section-header" data-aos="fade-down">
        <div>
          <h1 className="section-title">Student Management</h1>
          <p className="section-subtitle">Manage all student registrations and details</p>
        </div>
        <div className="header-actions">
          <button className="btn-export">
            <span>📊</span>
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" data-aos="fade-up" data-aos-delay="100">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Students ({students.length})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({students.filter(s => s.status === 'pending').length})
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({students.filter(s => s.status === 'approved').length})
          </button>
          <button
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({students.filter(s => s.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container" data-aos="fade-up" data-aos-delay="200">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner">⏳</div>
            <p>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎓</span>
            <h3>No students found</h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Department</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const badge = getStatusBadge(student.status);
                return (
                  <tr key={student._id} data-aos="fade-up" data-aos-delay={index * 50}>
                    <td>{student.studentId}</td>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          <span>{student.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="student-name">{student.fullName}</div>
                          <div className="student-email">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.gender}</td>
                    <td>{student.department}</td>
                    <td>{student.hostelName}</td>
                    <td>{student.roomNumber || 'Not Assigned'}</td>
                    <td>
                      <span className={`status-badge ${badge.class}`}>
                        <span>{badge.icon}</span>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => viewDetails(student)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {student.status === 'pending' && (
                          <>
                            <button
                              className="btn-action btn-approve"
                              onClick={() => handleApprove(student._id)}
                              title="Approve"
                            >
                              ✅
                            </button>
                            <button
                              className="btn-action btn-reject"
                              onClick={() => handleReject(student._id)}
                              title="Reject"
                            >
                              ❌
                            </button>
                          </>
                        )}
                        {student.status === 'approved' && (
                          <button
                            className="btn-action btn-edit"
                            title="Edit"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{selectedStudent.fullName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Student ID</label>
                    <p>{selectedStudent.studentId}</p>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <p>{selectedStudent.gender}</p>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth</label>
                    <p>{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Fees Receipt Number</label>
                    <p>{selectedStudent.aadharNumber}</p>
                  </div>
                  <div className="detail-item">
                    <label>Department</label>
                    <p>{selectedStudent.department}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedStudent.email}</p>
                  </div>
                  <div className="detail-item">
                    <label>Mobile</label>
                    <p>{selectedStudent.mobile}</p>
                  </div>
                  <div className="detail-item">
                    <label>Parent's Name</label>
                    <p>{selectedStudent.parentName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Parent's Mobile</label>
                    <p>{selectedStudent.parentMobile}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Permanent Address</label>
                    <p>{selectedStudent.permanentAddress}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Hostel Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Hostel Name</label>
                    <p>{selectedStudent.hostelName}</p>
                  </div>
                  <div className="detail-item">
                    <label>Room Type</label>
                    <p>{selectedStudent.roomType}</p>
                  </div>
                  <div className="detail-item">
                    <label>Mess Preference</label>
                    <p>{selectedStudent.messPreference}</p>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <p>{selectedStudent.status}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedStudent.status === 'pending' && (
                <>
                  <button
                    className="btn btn-approve"
                    onClick={() => {
                      handleApprove(selectedStudent._id);
                      setShowModal(false);
                    }}
                  >
                    Approve Application
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => {
                      handleReject(selectedStudent._id);
                      setShowModal(false);
                    }}
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
