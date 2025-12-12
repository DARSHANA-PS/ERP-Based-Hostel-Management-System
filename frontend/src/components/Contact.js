import React from 'react';
import './Contact.css';

const Contact = () => {
  const socialLinks = [
    { icon: '🔗', name: 'Facebook', url: '#' },
    { icon: '📸', name: 'Instagram', url: '#' },
    { icon: '🐦', name: 'Twitter', url: '#' },
    { icon: '💼', name: 'LinkedIn', url: '#' }
  ];

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="contact-header" data-aos="fade-up">
          <h2 className="section-title">Contact Us</h2>
        </div>

        <div className="contact-content">
          <div className="contact-info" data-aos="fade-right">
            <div className="info-card">
              <h3>🏫 Hostel Administration Office</h3>
              <p>Excellence University</p>
              <p>123 University Road, Education City</p>
              <p>State - 560001</p>
            </div>

            <div className="info-card">
              <h3>📧 Email</h3>
              <p>hosteladmin@excellence.edu.in</p>
            </div>

            <div className="info-card">
              <h3>📞 Phone</h3>
              <p>+91 98765 43210</p>
            </div>

            <div className="info-card">
              <h3>⏰ Office Hours</h3>
              <p>9:00 AM – 6:00 PM</p>
              <p>(Monday to Saturday)</p>
            </div>

            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                {socialLinks.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    className="social-icon"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="contact-form" data-aos="fade-left">
            <form>
              <h3>Send us a Message</h3>
              
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              
              <div className="form-group">
                <input type="tel" placeholder="Phone Number" />
              </div>
              
              <div className="form-group">
                <select required>
                  <option value="">Select Subject</option>
                  <option value="admission">Admission Query</option>
                  <option value="complaint">Complaint</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <textarea 
                  placeholder="Your Message" 
                  rows="5" 
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
