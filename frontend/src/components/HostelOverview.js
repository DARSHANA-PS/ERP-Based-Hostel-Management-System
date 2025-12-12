import React, { useEffect, useRef } from 'react';
import './HostelOverview.css';

const HostelOverview = () => {
  const sectionRef = useRef(null);

  const hostels = [
    {
      id: 'boys',
      title: 'Boys Hostel',
      description: 'Located within the main campus, the Boys Hostel offers spacious rooms, modern amenities, and a disciplined environment conducive to learning and growth.',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      facilities: [
        '24/7 Security with CCTV surveillance',
        'Wi-Fi-enabled study spaces',
        'Common rooms and recreation halls',
        'Laundry and cleaning services',
        'Medical & emergency assistance'
      ],
      color: '#1a237e'
    },
    {
      id: 'womens',
      title: "Women's Hostel",
      description: 'A safe, well-structured facility providing comfort, hygiene, and peace of mind, ensuring every student feels at home.',
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      facilities: [
        'Biometric entry and night security',
        'Hygienic mess with balanced meals',
        'Study halls and reading lounges',
        'Health & wellness room',
        'Shuttle and visitor management system'
      ],
      color: '#e91e63'
    }
  ];

  return (
    <section id="hostels" className="section hostel-section" ref={sectionRef}>
      <div className="hostel-bg">
        <div className="hostel-pattern"></div>
        <div className="hostel-orb hostel-orb-1"></div>
        <div className="hostel-orb hostel-orb-2"></div>
      </div>

      <div className="container">
        <div className="hostel-header" data-aos="fade-up">
          <div className="section-label">
            <span>Hostels</span>
          </div>
          <h2 className="section-title">
            Our <span className="title-gradient">Hostel Facilities</span>
          </h2>
          <p className="section-subtitle">
            We provide two state-of-the-art residential facilities dedicated to students 
            of Excellence University. Each hostel is managed by a dedicated warden and 
            supported by a team ensuring 24×7 safety, cleanliness, and convenience.
          </p>
        </div>

        <div className="hostels-container">
          {hostels.map((hostel, index) => (
            <div 
              key={hostel.id}
              className={`hostel-card ${hostel.id}`}
              data-aos={index === 0 ? "fade-right" : "fade-left"}
              data-aos-delay={index * 200}
            >
              <div className="hostel-image-container">
                <img src={hostel.image} alt={hostel.title} />
                <div className="hostel-overlay" style={{background: hostel.color}}></div>
              </div>
              
              <div className="hostel-content">
                <h3>{hostel.title}</h3>
                <p className="hostel-description">{hostel.description}</p>
                
                <h4>Facilities:</h4>
                <ul className="facilities-list">
                  {hostel.facilities.map((facility, idx) => (
                    <li key={idx} data-aos="fade-up" data-aos-delay={300 + idx * 50}>
                      <span className="check-icon">✔</span>
                      {facility}
                    </li>
                  ))}
                </ul>
                
                <button className="explore-btn" style={{background: hostel.color}}>
                  Explore {hostel.title}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HostelOverview;
