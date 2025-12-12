import React, { useState, useEffect } from 'react';
import { studentAPI, hostelAPI } from '../../../services/api';
import './MyHostel.css';

const MyHostel = () => {
  const [hostelData, setHostelData] = useState(null);
  const [wardenInfo, setWardenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    fetchHostelDetails();
  }, []);

  const fetchHostelDetails = async () => {
    try {
      setLoading(true);
      
      // Get student profile to find their hostel
      const profileResponse = await studentAPI.getProfile();
      const studentData = profileResponse.data;
      
      if (studentData.hostelName) {
        // Mock hostel data (replace with actual API call when available)
        const mockHostelData = {
          hostelName: studentData.hostelName,
          hostelType: studentData.gender + ' Hostel',
          location: 'North Campus Block A',
          totalRooms: 150,
          totalCapacity: 450,
          occupiedBeds: 380,
          facilities: [
            'Wi-Fi',
            '24/7 Security',
            'Common Room',
            'Study Hall',
            'Laundry',
            'Hot Water',
            'Power Backup',
            'Medical Facility'
          ],
          rules: [
            'Maintain silence hours from 10 PM to 6 AM',
            'No unauthorized visitors allowed',
            'Keep your room clean and tidy',
            'Respect hostel property and fellow residents',
            'Follow mess timings strictly',
            'No smoking or alcohol on premises'
          ],
          wardenDetails: {
            name: 'Dr. Rajesh Kumar',
            designation: 'Chief Warden',
            mobile: '+91 9876543210',
            email: 'warden@college.edu',
            officeHours: '9:00 AM - 6:00 PM',
            room: 'Ground Floor, Room 001'
          }
        };
        
        setHostelData(mockHostelData);
        setWardenInfo(mockHostelData.wardenDetails);
      }
    } catch (error) {
      console.error('Error fetching hostel details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="hostel-loading">
        <div className="loader"></div>
        <p>Loading hostel information...</p>
      </div>
    );
  }

  if (!hostelData) {
    return (
      <div className="no-hostel">
        <h2>No Hostel Assigned</h2>
        <p>You haven't been assigned to any hostel yet. Please contact the admin.</p>
      </div>
    );
  }

  return (
    <div className="my-hostel-container">
      {/* Header */}
      <div className="hostel-header" data-aos="fade-down">
        <h1>Hostel Information</h1>
        <p>View your assigned hostel details, facilities, and warden contact</p>
      </div>

      {/* Hostel Overview Card */}
      <div className="hostel-overview-card" data-aos="fade-up">
        <div className="hostel-image-section">
          <img 
            src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" 
            alt={hostelData.hostelName}
          />
          <button className="play-video-btn" onClick={() => setShowVideo(true)}>
            🎥 Virtual Tour
          </button>
        </div>
        
        <div className="hostel-info-section">
          <h2>{hostelData.hostelName}</h2>
          <p className="hostel-type">{hostelData.hostelType}</p>
          <p className="hostel-location">📍 {hostelData.location}</p>
          
          <div className="hostel-stats">
            <div className="stat">
              <span className="stat-value">{hostelData.totalRooms}</span>
              <span className="stat-label">Total Rooms</span>
            </div>
            <div className="stat">
              <span className="stat-value">{hostelData.totalCapacity}</span>
              <span className="stat-label">Total Capacity</span>
            </div>
            <div className="stat">
              <span className="stat-value">{hostelData.occupiedBeds}</span>
              <span className="stat-label">Occupied Beds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warden Information
      <div className="warden-card" data-aos="fade-up">
        <h3>Warden Information</h3>
        <div className="warden-details">
          <div className="warden-avatar">
            <span>{wardenInfo.name.charAt(0)}</span>
          </div>
          <div className="warden-info">
            <h4>{wardenInfo.name}</h4>
            <p className="designation">{wardenInfo.designation}</p>
            <div className="contact-details">
              <p>📱 {wardenInfo.mobile}</p>
              <p>📧 {wardenInfo.email}</p>
              <p>🏢 {wardenInfo.room}</p>
              <p>⏰ Office Hours: {wardenInfo.officeHours}</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Facilities and Rules */}
      <div className="facilities-rules-grid" data-aos="fade-up">
        {/* Facilities */}
        <div className="facilities-card">
          <h3>Available Facilities</h3>
          <div className="facilities-grid">
            {hostelData.facilities.map((facility, index) => (
              <div key={index} className="facility-item">
                <span className="facility-icon">✅</span>
                <span>{facility}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="rules-card">
          <h3>Hostel Rules & Regulations</h3>
          <ol className="rules-list">
            {hostelData.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Contact Card */}
      <div className="contact-card" data-aos="fade-up">
        <h3>Need Help?</h3>
        <p>For any hostel-related issues or queries, contact:</p>
        <div className="contact-options">
          <button className="contact-btn">
            <span>📞</span>
            Call Warden
          </button>
          <button className="contact-btn">
            <span>📧</span>
            Email Warden
          </button>
          <button className="contact-btn">
            <span>🏢</span>
            Visit Office
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="video-modal" onClick={() => setShowVideo(false)}>
          <div className="video-container" onClick={(e) => e.stopPropagation()}>
            <button className="close-video" onClick={() => setShowVideo(false)}>×</button>
            <video controls autoPlay>
              <source src="/videos/hostel-tour.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHostel;
