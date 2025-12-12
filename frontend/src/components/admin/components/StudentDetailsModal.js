import React, { useState, useEffect } from 'react';
import './StudentDetailsModal.css';

const StudentDetailsModal = ({ isOpen, onClose, roomId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);

  useEffect(() => {
    if (isOpen && roomId) {
      fetchStudents();
    }
  }, [isOpen, roomId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}/students`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
        setRoomInfo(data.roomInfo);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="student-modal-overlay" onClick={onClose}>
      <div className="student-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            Students in Room {roomInfo?.roomNo}
            <span className="room-occupancy">
              ({students.length}/{roomInfo?.capacity})
            </span>
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading students...</p>
            </div>
          ) : students.length > 0 ? (
            <div className="students-grid">
              {students.map((student, index) => (
                <div key={student._id} className="student-card">
                  <div className="student-header">
                    <div className="student-avatar">
                      {student.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-basic">
                      <h3>{student.fullName}</h3>
                      <p className="student-id">ID: {student.studentId}</p>
                    </div>
                  </div>
                  
                  <div className="student-details">
                    <div className="detail-row">
                      <span className="detail-label">📧 Email:</span>
                      <span className="detail-value">{student.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📱 Mobile:</span>
                      <span className="detail-value">{student.mobile || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🎓 Department:</span>
                      <span className="detail-value">{student.department || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">📅 Year:</span>
                      <span className="detail-value">{student.year || 'N/A'}</span>
                    </div>
                    {student.parentName && (
                      <div className="detail-row">
                        <span className="detail-label">👨‍👩‍👧 Parent:</span>
                        <span className="detail-value">{student.parentName}</span>
                      </div>
                    )}
                    {student.parentContact && (
                      <div className="detail-row">
                        <span className="detail-label">☎️ Parent Contact:</span>
                        <span className="detail-value">{student.parentContact}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No students assigned</h3>
              <p>This room is currently empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
