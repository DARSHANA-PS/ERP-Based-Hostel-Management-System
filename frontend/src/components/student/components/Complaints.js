// frontend/src/components/student/components/Complaints.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Path adjusted
import { studentAPI } from '../../../services/api'; // Path adjusted
import { FiSend, FiList, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import AOS from 'aos';
import './Complaints.css'; // CSS is in the same folder

const Complaints = () => {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP ---
  const authContext = useAuth();
  
  const [complaints, setComplaints] = useState([]);
  const [newComplaint, setNewComplaint] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    AOS.refresh();
  }, []);
  // --- END HOOKS SECTION ---

  if (!authContext) {
    console.error('Complaints: AuthContext is null.');
    return <div>Error: Authentication context not available.</div>;
  }
  const { user, loading: authGlobalLoading, mockSubmitComplaint } = authContext;

  useEffect(() => { // This useEffect now comes after the `if (!authContext)` check
    const fetchComplaints = async () => {
      if (authGlobalLoading || !user) {
        return;
      }

      try {
        setLoading(true);
        const response = await studentAPI.getMyComplaints();
        setComplaints(response.data.reverse()); // Show newest first
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
        setSubmitMessage({ type: 'error', text: err.message || 'Failed to load complaints.' });
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [authGlobalLoading, user, submitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewComplaint(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    setSubmitMessage({ type: '', text: '' }); // Clear submission message
  };

  const validateForm = () => {
    const errors = {};
    if (!newComplaint.title.trim()) {
      errors.title = 'Complaint title is required.';
    }
    if (!newComplaint.description.trim()) {
      errors.description = 'Complaint description is required.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitMessage({ type: 'info', text: 'Submitting complaint...' });

    try {
      const response = await mockSubmitComplaint(newComplaint.title, newComplaint.description);
      if (response.success) {
        setSubmitMessage({ type: 'success', text: response.message || 'Complaint submitted successfully!' });
        setNewComplaint({ title: '', description: '' }); // Clear form
        // Trigger re-fetch for the list automatically via `submitting` dependency
      } else {
        setSubmitMessage({ type: 'error', text: response.message || 'Failed to submit complaint.' });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message || 'An error occurred during submission.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authGlobalLoading || loading) {
    return <div className="complaints-container loading-state">Loading Complaints...</div>;
  }

  return (
    <div className="complaints-container">
      <h1 className="page-title">My <span className="gradient-text">Complaints</span></h1>

      <div className="complaint-form-section" data-aos="fade-right">
        <h2><FiSend /> Submit a New Complaint</h2>
        <form onSubmit={handleSubmitComplaint} className="complaint-form">
          <div className="form-field">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newComplaint.title}
              onChange={handleChange}
              placeholder="e.g., Leaky Faucet in Room 101"
              className={formErrors.title ? 'error' : ''}
              disabled={submitting}
            />
            {formErrors.title && <span className="error-text">{formErrors.title}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={newComplaint.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue."
              rows="4"
              className={formErrors.description ? 'error' : ''}
              disabled={submitting}
            ></textarea>
            {formErrors.description && <span className="error-text">{formErrors.description}</span>}
          </div>
          {submitMessage.text && (
            <div className={`submission-message ${submitMessage.type}`}>
              {submitMessage.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
              <span>{submitMessage.text}</span>
            </div>
          )}
          <button type="submit" className="submit-complaint-btn" disabled={submitting}>
            {submitting ? (
              <>
                <span className="loading-spinner">⏳</span> Submitting...
              </>
            ) : (
              <>
                <FiSend /> Submit Complaint
              </>
            )}
          </button>
        </form>
      </div>

      <div className="complaint-list-section" data-aos="fade-left">
        <h2><FiList /> My Past Complaints</h2>
        {complaints.length === 0 ? (
          <p className="no-complaints-message">You have not submitted any complaints yet.</p>
        ) : (
          <div className="complaints-grid">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="complaint-card">
                <div className="complaint-card-header">
                  <h3>{complaint.title}</h3>
                  <span className={`complaint-status status-${complaint.status?.toLowerCase()}`}>{complaint.status}</span>
                </div>
                <p className="complaint-description">{complaint.description}</p>
                <p className="complaint-date">Submitted: {new Date(complaint.submittedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
