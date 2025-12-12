import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import './WardenRegistration.css';
import { authAPI } from '../../services/api';

const WardenRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    email: '',
    mobile: '',
    designation: '',
    assignedHostel: '',
    username: '',
    password: '',
    confirmPassword: '',
    idProof: null,
    experience: '',
    qualification: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    AOS.refresh();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.assignedHostel) newErrors.assignedHostel = 'Please select a hostel';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    setIsLoading(true);
    
    try {
      // Remove confirmPassword and idProof from the data being sent
      const registrationData = {
        fullName: formData.fullName,
        gender: formData.gender,
        email: formData.email,
        mobile: formData.mobile,
        designation: formData.designation,
        assignedHostel: formData.assignedHostel,
        username: formData.username,
        password: formData.password,
        experience: formData.experience || 0,
        qualification: formData.qualification || '',
        address: formData.address || ''
      };
      
      const response = await authAPI.registerWarden(registrationData);
      
      if (response.success) {
        alert(response.message || 'Registration submitted successfully! Please wait for admin approval.');
        navigate('/login/warden');
      }
    } catch (error) {
      console.error('Warden registration error:', error);
      alert(error.message || 'Error submitting registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
};

  return (
    <div className="warden-registration-page">
      {/* Background Elements */}
      <div className="warden-bg-container">
        <div className="warden-bg-gradient"></div>
        <div className="warden-pattern"></div>
        <div className="warden-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="warden-nav">
        <button 
          className="nav-btn"
          onClick={() => navigate('/role-selection')}
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
      <div className="warden-container">
        <div className="warden-card" data-aos="fade-up">
          {/* Header */}
          <div className="warden-header">
            <div className="header-icon">
              <span>🏫</span>
            </div>
            <h1 className="warden-title">
              Warden <span className="gradient-text">Registration</span>
            </h1>
            <p className="warden-subtitle">
              Register as a hostel warden to manage operations
            </p>
          </div>

          {/* Registration Form */}
          <form className="warden-form" onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="form-section">
              <h2 className="section-title">Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-field">
                  <label>Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={errors.gender ? 'error' : ''}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span className="error-text">{errors.gender}</span>}
                </div>

                <div className="form-field">
                  <label>Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter your mobile number"
                    className={errors.mobile ? 'error' : ''}
                  />
                  {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-section">
              <h2 className="section-title">Professional Information</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Designation *</label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={errors.designation ? 'error' : ''}
                  >
                    <option value="">Select Designation</option>
                    <option value="chief-warden">Chief Warden</option>
                    <option value="assistant-warden">Assistant Warden</option>
                    <option value="deputy-warden">Deputy Warden</option>
                    <option value="night-warden">Night Warden</option>
                  </select>
                  {errors.designation && <span className="error-text">{errors.designation}</span>}
                </div>

                <div className="form-field">
                  <label>Assigned Hostel *</label>
                  <select
                    name="assignedHostel"
                    value={formData.assignedHostel}
                    onChange={handleChange}
                    className={errors.assignedHostel ? 'error' : ''}
                  >
                    <option value="">Select Hostel</option>
                    <option value="boys-hostel">Boys Hostel</option>
                    <option value="girls-hostel">Girls Hostel</option>
                  </select>
                  {errors.assignedHostel && <span className="error-text">{errors.assignedHostel}</span>}
                </div>

                <div className="form-field">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Years of experience"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="Educational qualification"
                  />
                </div>

                <div className="form-field full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Current address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Authentication Details */}
            <div className="form-section">
              <h2 className="section-title">Authentication Details</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Create Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    className={errors.username ? 'error' : ''}
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>

                <div className="form-field">
                  <label>Create Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="form-field">
                  <label>Upload ID Proof (Optional)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      name="idProof"
                      onChange={handleChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      id="warden-id-upload"
                    />
                    <label htmlFor="warden-id-upload" className="file-label">
                      <span>📄</span>
                      <span>Upload ID Proof</span>
                    </label>
                    {formData.idProof && <span className="file-name">{formData.idProof.name}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Registration
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WardenRegistration;
