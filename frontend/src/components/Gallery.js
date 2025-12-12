import React from 'react';
import './Gallery.css';

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
      title: 'Main Building',
      category: 'campus'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
      title: 'Boys Hostel Room',
      category: 'rooms'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?w=600',
      title: 'Study Hall',
      category: 'facilities'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1626178793926-22b28830aa30?w=600',
      title: 'Common Area',
      category: 'facilities'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=600',
      title: 'Dining Hall',
      category: 'facilities'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1630073120157-1f42fb525721?w=600',
      title: 'Recreation Room',
      category: 'facilities'
    }
  ];

  return (
    <section id="gallery" className="section gallery-section">
      <div className="gallery-bg">
        <div className="gallery-pattern"></div>
        <div className="gallery-orb gallery-orb-1"></div>
        <div className="gallery-orb gallery-orb-2"></div>
      </div>

      <div className="container">
        <div className="gallery-header" data-aos="fade-up">
          <div className="section-label">
            <span>Gallery</span>
          </div>
          <h2 className="section-title">
            <span className="title-line">Explore Our</span>
            <span className="title-gradient">Campus Life</span>
          </h2>
          <p className="section-subtitle">
            Take a virtual tour of our modern facilities and comfortable living spaces
          </p>
        </div>

        <div className="gallery-grid">
          {galleryImages.map((image, index) => (
            <div 
              key={image.id} 
              className="gallery-card"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="gallery-image-wrapper">
                <img src={image.src} alt={image.title} />
                <div className="gallery-overlay">
                  <h3>{image.title}</h3>
                  <span className="gallery-category">{image.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
