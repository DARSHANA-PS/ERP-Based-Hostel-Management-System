import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import AOS from 'aos';
import './HostelSelection.css';
import StudentDetailsModal from '../admin/components/StudentDetailsModal';

const HostelSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { gender } = useParams();
  const { email, fullName } = location.state || {};

  const [hostels, setHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [roomStats, setRoomStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
    });
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/hostels/available', {
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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async (hostelId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (selectedFloor) params.append('floor', selectedFloor);

      const response = await fetch(`http://localhost:5000/api/student/hostels/${hostelId}/rooms?${params}`, {
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

  const fetchRoomStats = async (hostelId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/student/hostels/${hostelId}/stats`, {
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

  const handleHostelSelect = (hostel) => {
    setSelectedHostel(hostel);
    setShowRoomSelection(true);
    fetchRooms(hostel._id);
    fetchRoomStats(hostel._id);
  };

  const handleViewRoom = async (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  const handleBookRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to book this room?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/book-room', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Room booked successfully!\n\nRoom Number: ${data.data.roomNumber}\nHostel: ${data.data.hostelName}\nFloor: ${data.data.floorNo}`);
        navigate(`/register/student/${gender}/continue`, {
          state: {
            email,
            fullName,
            skipPersonalDetails: true,
            skipHostelSelection: true,
            roomBooked: true
          }
        });
      } else {
        alert(data.message || 'Error booking room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      alert('Error booking room');
    } finally {
      setIsLoading(false);
    }
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
    <div className="hostel-selection-page">
      {/* Background Elements */}
      <div className="selection-bg-container">
        <div className="selection-bg-gradient"></div>
        <div className="floating-shapes">
          <div className="shape shape-1" data-aos="fade-down"></div>
          <div className="shape shape-2" data-aos="fade-up"></div>
          <div className="shape shape-3" data-aos="fade-right"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="selection-nav">
        <button 
          className="nav-btn"
          onClick={() => navigate(-1)}
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button 
          className="nav-btn"
          onClick={() => navigate('/')}
        >
          <span>🏠</span>
          <span>Home</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="selection-container">
        <div className="selection-header" data-aos="fade-down">
          <h1 className="selection-title">
            Select Your <span className="gradient-text">Hostel</span>
          </h1>
          <p className="selection-subtitle">
            Welcome back, {fullName}! Choose your preferred hostel and room
          </p>
        </div>

        {!showRoomSelection ? (
          // Hostel Selection
          <div className="hostels-section">
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading available hostels...</p>
              </div>
            ) : hostels.length > 0 ? (
              <div className="hostels-grid">
                {hostels.map((hostel) => (
                  <div 
                    key={hostel._id} 
                    className="hostel-card"
                    data-aos="fade-up"
                    data-aos-delay="100"
                  >
                    {/* Hostel Image */}
                    <div className="hostel-image-section">
                      {hostel.hostelImage ? (
                        <img 
                          src={`http://localhost:5000/${hostel.hostelImage.replace(/\\/g, '/')}`} 
                          alt={hostel.hostelName}
                          className="hostel-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500';
                          }}
                        />
                      ) : (
                        <div className="hostel-placeholder-img">
                          <span>🏢</span>
                        </div>
                      )}
                      <div className="image-overlay">
                        <button 
                          className="video-tour-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHostel(hostel);
                            setShowVideoModal(true);
                          }}
                        >
                          🎥 Video Tour
                        </button>
                      </div>
                    </div>

                    {/* Hostel Info */}
                    <div className="hostel-info">
                      <h3 className="hostel-name">{hostel.hostelName}</h3>
                      <p className="hostel-location">
                        <span className="location-icon">📍</span>
                        {hostel.location}
                      </p>

                      {/* Stats */}
                      <div className="hostel-stats">
                        <div className="stat">
                          <span className="stat-value">{hostel.totalRooms}</span>
                          <span className="stat-label">Total Rooms</span>
                        </div>
                        <div className="stat highlight">
                          <span className="stat-value">{hostel.availableRooms}</span>
                          <span className="stat-label">Available</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{hostel.availableBeds}</span>
                          <span className="stat-label">Beds Free</span>
                        </div>
                      </div>

                      {/* Facilities */}
                      <div className="facilities-section">
                        <h4>Facilities</h4>
                        <p className="facilities-text">{hostel.facilities}</p>
                      </div>

                      {/* Warden Info */}
                      <div className="warden-info">
                        <div className="warden-avatar">
                          {hostel.wardenId?.fullName?.charAt(0) || 'W'}
                        </div>
                        <div className="warden-details">
                          <span className="warden-name">{hostel.wardenId?.fullName || 'Not Assigned'}</span>
                          <span className="warden-contact">📞 {hostel.contactNumber}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className="select-hostel-btn"
                        onClick={() => handleHostelSelect(hostel)}
                      >
                        Select & View Rooms
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🏢</div>
                <h3>No hostels available</h3>
                <p>Please contact administration for assistance</p>
              </div>
            )}
          </div>
        ) : (
          // Room Selection
          <div className="room-selection-section" data-aos="fade-up">
            {/* Back to Hostels */}
            <button 
              className="back-to-hostels"
              onClick={() => {
                setShowRoomSelection(false);
                setSelectedHostel(null);
                setRooms([]);
              }}
            >
              ← Back to Hostels
            </button>

            {/* Selected Hostel Info */}
            <div className="selected-hostel-info">
              <h2>{selectedHostel.hostelName}</h2>
              <p>{selectedHostel.location}</p>
            </div>

            {/* Filters */}
            <div className="room-filters">
              <div className="filter-group">
                <label>Floor</label>
                <select
                  value={selectedFloor}
                  onChange={(e) => {
                    setSelectedFloor(e.target.value);
                    fetchRooms(selectedHostel._id);
                  }}
                >
                  <option value="">All Floors</option>
                  {getUniqueFloors().map(floor => (
                    <option key={floor.value} value={floor.value}>
                      {floor.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group search-group">
                <label>Search Room</label>
                <input
                  type="text"
                  placeholder="Search by room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                className="view-video-btn"
                onClick={() => setShowVideoModal(true)}
              >
                🎥 View Hostel Tour
              </button>
            </div>

            {/* Room Statistics */}
            {roomStats && (
              <div className="room-statistics">
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
                  <div className="stat-card occupancy">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <span className="stat-number">{roomStats.totalOccupied}/{roomStats.totalCapacity}</span>
                      <span className="stat-label">Occupancy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rooms Grid */}
            {isLoading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading rooms...</p>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="rooms-grid">
                {filteredRooms.map((room) => (
                  <div 
                    key={room._id} 
                    className="room-card available"
                    data-aos="fade-up"
                  >
                    <div className="room-header">
                      <h3 className="room-number">Room {room.roomNo}</h3>
                      <span className="availability-badge">
                        {room.capacity - room.occupied} beds available
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
                    </div>

                    <div className="room-actions">
                      <button 
                        className="action-btn view"
                        onClick={() => handleViewRoom(room)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn book"
                        onClick={() => handleBookRoom(room._id)}
                        title="Book Room"
                      >
                        Book Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🚪</div>
                <h3>No available rooms</h3>
                <p>All rooms on this floor are occupied</p>
              </div>
            )}
          </div>
        )}
      </div>

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
                    <span className="detail-value">{selectedRoom.capacity} students</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Currently Occupied</span>
                    <span className="detail-value">{selectedRoom.occupied} students</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Available Beds</span>
                    <span className="detail-value available">{selectedRoom.capacity - selectedRoom.occupied}</span>
                  </div>
                </div>
              </div>

              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="details-section">
                  <h3>Room Amenities</h3>
                  <div className="amenities-list">
                    {selectedRoom.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-book-now"
                  onClick={() => {
                    setShowRoomDetails(false);
                    handleBookRoom(selectedRoom._id);
                  }}
                >
                  Book This Room
                </button>
                <button 
                  className="btn-cancel"
                  onClick={() => setShowRoomDetails(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedHostel && (
        <div className="modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎥 Video Tour - {selectedHostel.hostelName}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowVideoModal(false)}
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

export default HostelSelection;
