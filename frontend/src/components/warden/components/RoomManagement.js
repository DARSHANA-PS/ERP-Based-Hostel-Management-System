import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [roomStats, setRoomStats] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchRoomStats();
  }, [selectedFloor, selectedStatus]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedFloor) params.append('floor', selectedFloor);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(
        `http://localhost:5000/api/warden/hostel-rooms?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/warden/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.roomStats) {
        setRoomStats(data.data.roomStats);
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
    }
  };

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleStatusChange = async (roomId, newStatus) => {
    const remarks = prompt(`Please provide remarks for changing status to ${newStatus}:`);
    if (!remarks) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/warden/room-status/${roomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, remarks })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchRooms();
        fetchRoomStats();
      }
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const getUniqueFloors = () => {
    const floors = [...new Set(rooms.map(room => room.floorNo))];
    return floors.sort((a, b) => a - b);
  };

  return (
    <div className="room-management">
      <div className="section-header" data-aos="fade-down">
        <h1 className="section-title">Room Management</h1>
        <p className="section-subtitle">Track and manage all rooms in your assigned hostel</p>
      </div>

      {/* Room Statistics */}
      {roomStats && (
        <div className="room-statistics" data-aos="fade-up">
          <div className="stats-cards">
            <div className="stat-card available">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.available}</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
            <div className="stat-card full">
              <div className="stat-icon">🔴</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.full}</span>
                <span className="stat-label">Full</span>
              </div>
            </div>
            <div className="stat-card maintenance">
              <div className="stat-icon">🟠</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.maintenance}</span>
                <span className="stat-label">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section" data-aos="fade-up">
        <div className="filter-group">
          <label>Floor</label>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="filter-select"
          >
            <option value="">All Floors</option>
            {getUniqueFloors().map(floor => (
              <option key={floor} value={floor}>Floor {floor}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading rooms...</p>
        </div>
      ) : rooms.length > 0 ? (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div 
              key={room._id} 
              className={`room-card ${room.status.toLowerCase()}`}
              data-aos="zoom-in"
            >
              <div className="room-header">
                <h3 className="room-number">Room {room.roomNo}</h3>
                <span className={`status-badge ${room.status.toLowerCase()}`}>
                  {room.status}
                </span>
              </div>

              <div className="room-info">
                <div className="info-row">
                  <span className="info-label">Floor:</span>
                  <span className="info-value">{room.floorNo}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Capacity:</span>
                  <span className="info-value">{room.capacity}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Occupied:</span>
                  <span className="info-value">{room.occupied}</span>
                </div>
              </div>

              <div className="room-occupancy">
                <div className="occupancy-bar">
                  <div 
                    className="occupancy-fill"
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                  ></div>
                </div>
                <span className="occupancy-text">
                  {room.capacity - room.occupied} beds available
                </span>
              </div>

              <div className="room-actions">
                <button 
                  className="action-btn view"
                  onClick={() => handleViewRoom(room)}
                  title="View Details"
                >
                  👁️
                </button>
                {room.status === 'Available' && (
                  <button 
                    className="action-btn maintenance"
                    onClick={() => handleStatusChange(room._id, 'Maintenance')}
                    title="Mark Maintenance"
                  >
                    🔧
                  </button>
                )}
                {room.status === 'Maintenance' && (
                  <button 
                    className="action-btn available"
                    onClick={() => handleStatusChange(room._id, 'Available')}
                    title="Mark Available"
                  >
                    ✅
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🚪</div>
          <h3>No rooms found</h3>
          <p>No rooms match your filter criteria</p>
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowRoomDetails(false)}>
          <div className="modal-content room-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Room Details - {selectedRoom.roomNo}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowRoomDetails(false)}
              >
                ✕
              </button>
            </div>

            <div className="room-details">
              <div className="details-section">
                <h3>Room Information</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Room Number</span>
                    <span className="detail-value">{selectedRoom.roomNo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Floor</span>
                    <span className="detail-value">{selectedRoom.floorNo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity</span>
                    <span className="detail-value">{selectedRoom.capacity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Occupied</span>
                    <span className="detail-value">{selectedRoom.occupied}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${selectedRoom.status.toLowerCase()}`}>
                      {selectedRoom.status}
                    </span>
                  </div>
                  {selectedRoom.remarks && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Remarks</span>
                      <span className="detail-value">{selectedRoom.remarks}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedRoom.students && selectedRoom.students.length > 0 && (
                <div className="details-section">
                  <h3>Students ({selectedRoom.students.length})</h3>
                  <div className="students-list">
                    {selectedRoom.students.map((student, index) => (
                      <div key={student._id} className="student-item">
                        <span className="student-number">{index + 1}.</span>
                        <div className="student-info">
                          <span className="student-name">{student.fullName}</span>
                          <span className="student-details">
                            ID: {student.studentId} | 📱 {student.mobile}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
