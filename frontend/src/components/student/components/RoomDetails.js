// frontend/src/components/student/components/RoomDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted: up(components), up(student), up(src), down(context)
import { studentAPI } from '../../../services/api'; // Path adjusted
// Replaced FiBed with FiLayers (which is available in react-icons/fi)
import { FiUsers, FiLayers, FiImage, FiAlertCircle, FiCheckCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi'; 
import AOS from 'aos';
import './RoomDetails.css';

const RoomDetails = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const { hostelId, roomId } = useParams();
  const navigate = useNavigate();
  const authContext = useAuth(); // Call useAuth() here

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('RoomDetails: AuthContext is null. Component is not wrapped by AuthProvider.');
    return <div>Error: Authentication context not available.</div>;
  }
  const { user, loading: authGlobalLoading, mockBookRoom } = authContext;

  useEffect(() => { // This useEffect now comes after the `if (!authContext)` check
    const fetchRoomDetails = async () => {
      if (authGlobalLoading || !user || !user.year || !user.gender) {
        return; // Wait for auth context to load fully
      }

      try {
        setLoading(true);
        setError('');
        setBookingMessage({ type: '', text: '' }); // Clear any previous messages
        const response = await studentAPI.getRoomDetails(roomId);
        if (response.data) {
          setRoom(response.data);
          // Set initial message if user has already booked this room
          if (user.roomNumber === response.data.number && user.hostelName === `Hostel ${hostelId}`) { // TODO: Match real hostel name
             setBookingMessage({ type: 'info', text: 'You have booked this room.' });
          }
        } else {
          setError('Room not found.');
        }
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        setError(err.message || 'Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, authGlobalLoading, user, hostelId]);

  const handleBookRoom = async () => {
    if (!room || room.occupied >= room.capacity) {
      setBookingMessage({ type: 'error', text: 'This room is already full.' });
      return;
    }
    if (user.roomNumber) { // If user already has a room
      setBookingMessage({ type: 'error', text: 'You already have a room booked. Please cancel your current booking first.' });
      return;
    }
    
    setLoading(true); // Set local loading for booking action
    setBookingMessage({ type: 'info', text: 'Booking room...' });

    // Simulate adding current user to occupants
    const mockOccupants = [...room.occupants, user.name || user.studentId || 'New Student']; 
    
    // Call the mock booking function from AuthContext
    const response = await mockBookRoom(
      `Hostel ${hostelId}`, // Placeholder, replace with actual hostel name from backend
      room.number, 
      mockOccupants
    ); 
    
    if (response.success) {
      setBookingMessage({ type: 'success', text: response.message || 'Room booked successfully!' });
      // Optimistically update UI
      setRoom(prev => ({ ...prev, occupied: prev.occupied + 1, occupants: mockOccupants }));
      // Navigate to My Bookings or Home after a short delay
      setTimeout(() => navigate('/student/my-booking', { replace: true }), 1500);
    } else {
      setBookingMessage({ type: 'error', text: response.message || 'Failed to book room.' });
    }
    setLoading(false); // Reset local loading
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % room.imageUrls.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + room.imageUrls.length) % room.imageUrls.length
    );
  };

  if (authGlobalLoading || loading) {
    return <div className="rd-page loading-state">Loading Room Details...</div>;
  }

  if (error) {
    return <div className="rd-page error-state">Error: {error}</div>;
  }

  if (!room) {
    return <div className="rd-page no-data-state">No room details available.</div>;
  }

  const availableSlots = room.capacity - room.occupied;
  const isFull = availableSlots <= 0;
  const isCurrentlyBookedByUser = user.roomNumber === room.number && user.hostelName === `Hostel ${hostelId}`; 

  return (
    <div className="room-details-page">
      <div className="rd-card" data-aos="fade-up">
        <div className="rd-header">
          <button className="rd-back-btn" onClick={() => navigate(-1)}>
            <span>←</span> Back to Rooms
          </button>
          <h1 className="rd-title">Room <span className="gradient-text">{room.number}</span></h1>
          <p className="rd-subtitle">Hostel: <span className="hostel-name-display">Hostel {hostelId}</span></p>
        </div>

        {bookingMessage.text && (
          <div className={`rd-message ${bookingMessage.type}`} data-aos="fade-down">
            {bookingMessage.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            <span>{bookingMessage.text}</span>
          </div>
        )}

        <div className="rd-content-grid">
          <div className="rd-images">
            {room.imageUrls && room.imageUrls.length > 0 ? (
              <div className="image-carousel">
                <img src={room.imageUrls[currentImageIndex]} alt={`Room ${room.number}`} className="room-image" />
                {room.imageUrls.length > 1 && (
                  <>
                    <button className="carousel-nav left" onClick={prevImage}><FiChevronLeft size={24} /></button>
                    <button className="carousel-nav right" onClick={nextImage}><FiChevronRight size={24} /></button>
                    <div className="carousel-indicators">
                        {room.imageUrls.map((_, idx) => (
                            <span 
                                key={idx} 
                                className={`indicator ${currentImageIndex === idx ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(idx)}
                            ></span>
                        ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="no-image-placeholder">
                <FiImage size={60} />
                <p>No images available for this room.</p>
              </div>
            )}
          </div>

          <div className="rd-info">
            <div className="info-block" data-aos="fade-left" data-aos-delay="100">
              <FiLayers size={24} className="info-icon" /> {/* Changed from FiBed to FiLayers */}
              <div>
                <h3 className="info-title">Capacity & Occupancy</h3>
                <p className="info-text">Total Beds: {room.capacity}</p>
                <p className="info-text">Occupied Beds: {room.occupied}</p>
                <p className={`info-text ${isFull ? 'full' : 'available'}`}>
                  Available Slots: {availableSlots}
                </p>
              </div>
            </div>

            <div className="info-block" data-aos="fade-left" data-aos-delay="200">
              <FiUsers size={24} className="info-icon" />
              <div>
                <h3 className="info-title">Current Occupants</h3>
                {room.occupants && room.occupants.length > 0 ? (
                  <ul className="occupants-list">
                    {room.occupants.map((occupant, index) => (
                      <li key={index}>{occupant}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="info-text">No occupants yet!</p>
                )}
              </div>
            </div>

            <button 
              className="rd-book-btn" 
              onClick={handleBookRoom} 
              disabled={isFull || loading || isCurrentlyBookedByUser || authGlobalLoading}
            >
              {isFull ? 'Room Full' : (isCurrentlyBookedByUser ? 'Room Booked By You' : (loading ? 'Booking...' : 'Book This Room'))}
            </button>
            {isFull && <p className="rd-warning-message">This room has reached its maximum capacity.</p>}
            {isCurrentlyBookedByUser && <p className="rd-info-message">You have already booked this room.</p>}
            {user.roomNumber && !isCurrentlyBookedByUser && <p className="rd-warning-message">You have an existing booking. Cancel it first to book a new room.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
