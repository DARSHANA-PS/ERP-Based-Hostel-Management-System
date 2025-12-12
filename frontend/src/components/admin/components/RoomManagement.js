import React, { useState, useEffect } from 'react';
import './RoomManagement.css';
import StudentDetailsModal from './StudentDetailsModal';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomStats, setRoomStats] = useState(null);
  
  // Add state for video modal
  const [showHostelVideo, setShowHostelVideo] = useState(false);
  
  // Add state for student details modal
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Get hostel ID from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hostelId = urlParams.get('hostel');
    if (hostelId) {
      setSelectedHostel(hostelId);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      fetchRooms();
      fetchRoomStats();
    }
  }, [selectedHostel, selectedFloor, selectedStatus]);

  const fetchHostels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hostels/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHostels(data.data);
      }
    } catch (error) {
      console.error('Error fetching hostels:', error);
    }
  };

  const fetchRooms = async () => {
    if (!selectedHostel) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('hostelId', selectedHostel);
      if (selectedFloor) params.append('floor', selectedFloor);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`http://localhost:5000/api/rooms/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomStats = async () => {
    if (!selectedHostel) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rooms/stats/${selectedHostel}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRoomStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching room stats:', error);
    }
  };

  const handleViewRoom = async (roomId) => {
    setSelectedRoomId(roomId);
    setShowStudentDetails(true);
  };

  const handleViewRoomDetails = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedRoom(data.data);
        setShowRoomDetails(true);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/rooms/status/${roomId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchRooms();
        fetchRoomStats();
      } else {
        alert(data.message || 'Error updating room status');
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      alert('Error updating room status');
    }
  };

  // Updated function to handle video viewing
  const handleViewHostelVideo = () => {
    setShowHostelVideo(true);
  };

  const filteredRooms = rooms.filter(room =>
    room.roomNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUniqueFloors = () => {
    if (!roomStats || !roomStats.floorWiseStats) return [];
    return Object.keys(roomStats.floorWiseStats).map(floor => ({
      value: floor.replace('Floor ', ''),
      label: floor
    }));
  };

  return (
    <div className="room-management">
      {/* Header Section */}
      <div className="section-header">
        <div className="header-content">
          <h2 className="section-title">
            <span className="icon">🚪</span>
            Room Management
          </h2>
          <p className="section-subtitle">Manage room allocations and availability</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Select Hostel</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="filter-select"
          >
            <option value="">Choose a hostel</option>
            {hostels.map(hostel => (
              <option key={hostel._id} value={hostel._id}>
                {hostel.hostelName} ({hostel.hostelType})
              </option>
            ))}
          </select>
        </div>

        {selectedHostel && (
          <>
            <div className="filter-group">
              <label>Floor</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="filter-select"
              >
                <option value="">All Floors</option>
                {getUniqueFloors().map(floor => (
                  <option key={floor.value} value={floor.value}>
                    {floor.label}
                  </option>
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

            <div className="filter-group search-group">
              <label>Search Room</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search by room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Room Statistics */}
      {selectedHostel && roomStats && (
        <div className="room-statistics">
          <h3>Room Statistics</h3>
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-icon">🏠</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.totalRooms}</span>
                <span className="stat-label">Total Rooms</span>
              </div>
            </div>
            <div className="stat-card available">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.availableRooms}</span>
                <span className="stat-label">Available</span>
              </div>
            </div>
            <div className="stat-card full">
              <div className="stat-icon">🚫</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.fullRooms}</span>
                <span className="stat-label">Full</span>
              </div>
            </div>
            <div className="stat-card maintenance">
              <div className="stat-icon">🔧</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.maintenanceRooms}</span>
                <span className="stat-label">Maintenance</span>
              </div>
            </div>
            <div className="stat-card occupancy">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-number">{roomStats.totalOccupied}/{roomStats.totalCapacity}</span>
                <span className="stat-label">Occupancy</span>
              </div>
            </div>
          </div>

          {/* Floor-wise Statistics */}
          {roomStats.floorWiseStats && (
            <div className="floor-stats">
              <h4>Floor-wise Distribution</h4>
              <div className="floor-stats-grid">
                {Object.entries(roomStats.floorWiseStats).map(([floor, stats]) => (
                  <div key={floor} className="floor-stat">
                    <span className="floor-name">{floor}</span>
                    <div className="floor-info">
                      <span className="floor-rooms">Rooms: {stats.totalRooms}</span>
                      <span className="floor-available">Available: {stats.available}</span>
                      <span className="floor-occupied">Occupied: {stats.occupied}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Hostel Video Section - Updated */}
      {selectedHostel && (
        <div className="hostel-video-section">
          <button 
            className="btn-view-hostel-video"
            onClick={handleViewHostelVideo}
          >
            🎥 View Hostel Video Tour
          </button>
        </div>
      )}

      {/* Rooms Grid */}
      {selectedHostel ? (
        isLoading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading rooms...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div 
                key={room._id} 
                className={`room-card ${room.status.toLowerCase()}`}
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
                    onClick={() => handleViewRoom(room._id)}
                    title="View Students"
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
            <p>Try adjusting your filters or search criteria</p>
          </div>
        )
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>Select a hostel</h3>
          <p>Please select a hostel to view its rooms</p>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal 
        isOpen={showStudentDetails}
        onClose={() => setShowStudentDetails(false)}
        roomId={selectedRoomId}
      />

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
                    <span className="detail-label">Hostel</span>
                    <span className="detail-value">{selectedRoom.hostelId?.hostelName}</span>
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
                    <span className="detail-label">Available</span>
                    <span className="detail-value available">
                      {selectedRoom.capacity - selectedRoom.occupied}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${selectedRoom.status.toLowerCase()}`}>
                      {selectedRoom.status}
                    </span>
                  </div>
                  {selectedRoom.lastMaintenanceDate && (
                    <div className="detail-item">
                      <span className="detail-label">Last Maintenance</span>
                      <span className="detail-value">
                        {new Date(selectedRoom.lastMaintenanceDate).toLocaleDateString()}
                      </span>
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
                            ID: {student.studentId} | {student.department} - Year {student.year}
                          </span>
                          <span className="student-contact">
                            📱 {student.mobile} | 📧 {student.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="details-section">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoom.remarks && (
                <div className="details-section">
                  <h3>Remarks</h3>
                  <p className="remarks-text">{selectedRoom.remarks}</p>
                </div>
              )}

              <div className="modal-actions">
                {selectedRoom.status === 'Available' && selectedRoom.occupied < selectedRoom.capacity && (
                  <button className="btn-allocate">Allocate Student</button>
                )}
                {selectedRoom.status !== 'Maintenance' && (
                  <button 
                    className="btn-maintenance"
                    onClick={() => {
                      handleStatusChange(selectedRoom._id, 'Maintenance');
                      setShowRoomDetails(false);
                    }}
                  >
                    Mark Maintenance
                  </button>
                )}
                {selectedRoom.status === 'Maintenance' && (
                  <button 
                    className="btn-available"
                    onClick={() => {
                      handleStatusChange(selectedRoom._id, 'Available');
                      setShowRoomDetails(false);
                    }}
                  >
                    Mark Available
                  </button>
                )}
                <button className="btn-edit">Edit Room</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hostel Video Modal - Fixed */}
{showHostelVideo && (
  <div className="modal-overlay" onClick={() => setShowHostelVideo(false)}>
    <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>🎥 Video Tour - {hostels.find(h => h._id === selectedHostel)?.hostelName || 'Hostel'}</h2>
        <button 
          className="modal-close"
          onClick={() => setShowHostelVideo(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="video-container">
        <video 
          controls 
          autoPlay
          style={{ width: '100%', maxHeight: '70vh' }}
        >
          <source 
            src="/videos/hostel-tour.mp4" 
            type="video/mp4" 
          />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default RoomManagement;
