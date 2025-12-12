import React, { useState, useEffect } from 'react';
import './StudentManagement.css';

const StudentManagement = ({ searchQuery }) => {
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('approved');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (filter === 'pending') {
      fetchPendingStudents();
    } else {
      fetchStudents();
    }
  }, [filter, currentPage, searchQuery]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/warden/hostel-students?status=${filter}&search=${searchQuery}&page=${currentPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/pending-students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPendingStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/warden/student-request/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchPendingStudents();
      }
    } catch (error) {
      console.error('Error approving student:', error);
    }
  };

  const handleReject = async (studentId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/warden/student-request/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject', reason })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchPendingStudents();
      }
    } catch (error) {
      console.error('Error rejecting student:', error);
    }
  };

  const viewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const displayStudents = filter === 'pending' ? pendingStudents : students;

  return (
    <div className="student-management">
      <div className="section-header" data-aos="fade-down">
        <h1 className="section-title">Student Management</h1>
        <p className="section-subtitle">View and manage all students under your hostel</p>
      </div>

      {/* Filters */}
      <div className="filter-section" data-aos="fade-up">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved Students
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending Requests ({pendingStudents.length})
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-container" data-aos="fade-up">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading students...</p>
          </div>
        ) : displayStudents.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👥</span>
            <h3>No students found</h3>
            <p>{filter === 'pending' ? 'No pending requests' : 'No students in your hostel'}</p>
          </div>
        ) : (
          <>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Registration No.</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Room No.</th>
                  <th>Application Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="student-info">
                        <div className="student-avatar">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="student-name">{student.fullName}</div>
                          <div className="student-email">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{student.studentId}</td>
                    <td>{student.department}</td>
                    <td>{student.year}</td>
                    <td>{student.roomNumber || 'Not Assigned'}</td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => viewDetails(student)}
                        >
                          👁️
                        </button>
                        {student.status === 'pending' && (
                          <>
                            <button
                              className="btn-action btn-approve"
                              onClick={() => handleApprove(student._id)}
                            >
                              ✅
                            </button>
                            <button
                              className="btn-action btn-reject"
                              onClick={() => handleReject(student._id)}
                            >
                              ❌
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {filter === 'approved' && totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
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
                                    </div>
                                    </div>
              <div className="detail-section">
                <h3>Hostel Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Room Number</label>
                    <p>{selectedStudent.roomNumber || 'Not Assigned'}</p>
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
            {selectedStudent.status === 'pending' && (
              <div className="modal-footer">
                <button
                  className="btn btn-approve"
                  onClick={() => {
                    handleApprove(selectedStudent._id);
                    setShowModal(false);
                  }}
                >
                  Approve Student
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => {
                    handleReject(selectedStudent._id);
                    setShowModal(false);
                  }}
                >
                  Reject Student
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
