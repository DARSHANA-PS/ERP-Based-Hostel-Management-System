import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../../services/api';
import './RoomDetails.css';

const RoomDetails = () => {
  const [roomData, setRoomData] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getRoomDetails();
      setRoomData(response.data);
      
      // Mock roommates data
      setRoommates([
        {
          id: 1,
          name: 'John Doe',
          rollNo: 'CS2021001',
          department: 'Computer Science',
          mobile: '+91 98765xxxxx'
        },
        {
          id: 2,
          name: 'Michael Smith',
          rollNo: 'CS2021002',
          department: 'Computer Science',
          mobile: '+91 87654xxxxx'
        }
      ]);
    } catch (error) {
      console.error('Error fetching room details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="room-loading">
        <div className="loader"></div>
        <p>Loading room details...</p>
      </div>
    );
  }

  return (
    <div className="room-details-container">
      {/* Header */}
      <div className="room-header" data-aos="fade-down">
        <h1>My Room</h1>
        <p>View details of your allocated room and roommates</p>
      </div>

      {/* Room Info Card */}
      <div className="room-info-card" data-aos="fade-up">
        <div className="room-number-section">
          <div className="room-number-display">
            <h2>Room {roomData?.roomNumber || 'Not Assigned'}</h2>
            <p className="room-type">Triple Sharing</p>
          </div>
          <div className="room-status">
            <span className="status-dot"></span>
            <span>Occupied</span>
          </div>
        </div>

        <div className="room-details-grid">
          <div className="detail-box">
            <span className="detail-icon">🏢</span>
            <div>
              <p className="detail-label">Floor</p>
              <p className="detail-value">2nd Floor</p>
            </div>
          </div>
          <div className="detail-box">
            <span className="detail-icon">🛏️</span>
            <div>
              <p className="detail-label">Bed Number</p>
              <p className="detail-value">{roomData?.bedNumber || 'A'}</p>
            </div>
          </div>
          <div className="detail-box">
            <span className="detail-icon">🏡</span>
            <div>
              <p className="detail-label">Hostel</p>
              <p className="detail-value">{roomData?.hostelName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Card */}
      <div className="facilities-card" data-aos="fade-up">
        <h3>Room Facilities</h3>
        <div className="facilities-list">
          <div className="facility">
            <span className="facility-icon">💨</span>
            <span>Fan</span>
          </div>
          <div className="facility">
            <span className="facility-icon">📶</span>
            <span>Wi-Fi</span>
          </div>
          <div className="facility">
            <span className="facility-icon">🚿</span>
            <span>Attached Bathroom</span>
          </div>
          <div className="facility">
            <span className="facility-icon">🔌</span>
            <span>Power Backup</span>
          </div>
          <div className="facility">
            <span className="facility-icon">🪟</span>
            <span>Ventilation</span>
          </div>
          <div className="facility">
            <span className="facility-icon">🗄️</span>
            <span>Study Table</span>
          </div>
        </div>
      </div>

      {/* Roommates Card */}
      <div className="roommates-card" data-aos="fade-up">
        <h3>Roommates</h3>
        <div className="roommates-list">
          {roommates.map((roommate) => (
            <div key={roommate.id} className="roommate-item">
              <div className="roommate-avatar">
                <span>{roommate.name.charAt(0)}</span>
              </div>
              <div className="roommate-info">
                <h4>{roommate.name}</h4>
                <p>Roll No: {roommate.rollNo}</p>
                <p>{roommate.department}</p>
                <p className="contact">📱 {roommate.mobile}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="room-actions" data-aos="fade-up">
        <button className="action-btn">
          <span>🔄</span>
          Request Room Change
        </button>
        <button className="action-btn">
          <span>🔧</span>
          Report Room Issue
        </button>
        <button className="action-btn">
          <span>📋</span>
          Room Guidelines
        </button>
      </div>
    </div>
  );
};

export default RoomDetails;
