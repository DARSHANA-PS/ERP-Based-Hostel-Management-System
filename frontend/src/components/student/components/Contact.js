import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form submitted:', formData);
  };

  const contacts = [
    {
      title: 'Hostel Warden',
      name: 'Dr. John Smith',
      email: 'warden@hostel.edu',
      phone: '+91 98765 43210',
      available: '9:00 AM - 6:00 PM'
    },
    {
      title: 'Assistant Warden',
      name: 'Ms. Sarah Johnson',
      email: 'assistant.warden@hostel.edu',
      phone: '+91 98765 43211',
      available: '10:00 AM - 7:00 PM'
    },
    {
      title: 'Maintenance',
      name: 'Mr. Robert Wilson',
      email: 'maintenance@hostel.edu',
      phone: '+91 98765 43212',
      available: '24/7 Emergency'
    }
  ];

  return (
    <motion.div
      className="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="page-title">Contact</h2>

      <div className="contact-cards">
        {contacts.map((contact, index) => (
          <motion.div
            key={index}
            className="contact-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <h3>{contact.title}</h3>
            <p className="contact-name">{contact.name}</p>
            <div className="contact-info">
              <p><i className="fas fa-envelope"></i> {contact.email}</p>
              <p><i className="fas fa-phone"></i> {contact.phone}</p>
              <p><i className="fas fa-clock"></i> {contact.available}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="contact-form-section">
        <h3>Send a Message</h3>
        <form className="contact-form" onSubmit={handleSubmit}>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            <option value="general">General Inquiry</option>
            <option value="complaint">Complaint</option>
            <option value="suggestion">Suggestion</option>
            <option value="emergency">Emergency</option>
          </select>

          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />

          <textarea
            placeholder="Your message..."
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows="6"
            required
          />

          <button type="submit">Send Message</button>
        </form>
      </div>

      <div className="emergency-section">
        <h3>Emergency Contacts</h3>
        <div className="emergency-numbers">
          <div className="emergency-item">
            <i className="fas fa-phone-alt"></i>
            <div>
              <h4>Security</h4>
              <p>+91 98765 43299</p>
            </div>
          </div>
          <div className="emergency-item">
            <i className="fas fa-ambulance"></i>
            <div>
              <h4>Medical Emergency</h4>
              <p>+91 98765 43288</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;
