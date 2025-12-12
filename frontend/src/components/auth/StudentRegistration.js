import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AOS from 'aos';
import { authAPI } from '../../services/api';
import './StudentRegistration.css';

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { gender } = useParams();
  const location = useLocation();
  const { 
    email, 
    skipPersonalDetails, 
    existingUser, 
    fullName: existingFullName,
    skipHostelSelection,
    roomBooked
  } = location.state || {};
  
  // Determine starting step based on user status and flow
  const isNewUser = !skipPersonalDetails;
  const hasBookedRoom = roomBooked || skipHostelSelection;
  
  // Set initial step based on where user is coming from
  const getInitialStep = () => {
    if (isNewUser) return 1; // New user starts at step 1
    if (!hasBookedRoom) return 3; // Approved user without room starts at step 3
    return 4; // Approved user with room starts at step 4 (authentication only)
  };
  
  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const totalSteps = isNewUser ? 2 : (hasBookedRoom ? 1 : 2);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: existingFullName || '',
    gender: gender === 'male' ? 'Male' : 'Female',
    dateOfBirth: '',
    studentId: '',
    aadharNumber: '',
    department: '',
    year: '',
    course: '',
    photo: null,
    
    // Contact Details
    email: email || '',
    mobile: '',
    parentName: '',
    parentMobile: '',
    permanentAddress: '',
    emergencyContact: '',
    
    // Hostel Preference
    hostelName: gender === 'male' ? 'Boys Hostel' : 'Girls Hostel',
    roomType: '',
    messPreference: '',
    
    // Authentication
    username: '',
    password: '',
    confirmPassword: '',
    idProof: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If no email in state, redirect to email check
    if (!email) {
      navigate(`/register/student/${gender}`);
    }
  }, [email, gender, navigate]);

  useEffect(() => {
    AOS.refresh();
  }, [currentStep]);

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
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (isNewUser) {
      // Validation for new users
      switch(step) {
        case 1: // Personal Details
          if (!formData.fullName) newErrors.fullName = 'Full name is required';
          if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
          if (!formData.studentId) newErrors.studentId = 'Student ID is required';
          if (!formData.aadharNumber) newErrors.aadharNumber = 'Aadhar number is required';
          if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
            newErrors.aadharNumber = 'Receipt number must be 12 digits';
          }
          if (!formData.department) newErrors.department = 'Department is required';
          if (!formData.year) newErrors.year = 'Year is required';
          if (!formData.course) newErrors.course = 'Course is required';
          break;
          
        case 2: // Contact Details
          if (!formData.email) newErrors.email = 'Email is required';
          if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
          }
          if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
          if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
          }
          if (!formData.parentName) newErrors.parentName = 'Parent name is required';
          if (!formData.parentMobile) newErrors.parentMobile = 'Parent mobile is required';
          if (formData.parentMobile && !/^\d{10}$/.test(formData.parentMobile)) {
            newErrors.parentMobile = 'Parent mobile must be 10 digits';
          }
          if (!formData.permanentAddress) newErrors.permanentAddress = 'Address is required';
          if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
          if (formData.emergencyContact && !/^\d{10}$/.test(formData.emergencyContact)) {
            newErrors.emergencyContact = 'Emergency contact must be 10 digits';
          }
          break;
      }
    } else {
      // Validation for approved users
      switch(step) {
        case 3: // Hostel Preference (only shown if room not booked)
          if (!formData.roomType) newErrors.roomType = 'Room type is required';
          if (!formData.messPreference) newErrors.messPreference = 'Mess preference is required';
          break;
          
        case 4: // Authentication
          if (!formData.username) newErrors.username = 'Username is required';
          if (formData.username && formData.username.length < 4) {
            newErrors.username = 'Username must be at least 4 characters';
          }
          if (!formData.password) newErrors.password = 'Password is required';
          if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
          }
          if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
          if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
          break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!isNewUser && currentStep === 3 && !hasBookedRoom) {
        // If approved user just filled hostel preferences, redirect to hostel selection
        navigate(`/student/hostel-selection/${gender}`, {
          state: {
            email,
            fullName: existingFullName,
            messPreference: formData.messPreference
          }
        });
      } else {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (!isNewUser && currentStep === 3) {
      // If approved user at first step, go back to email check
      navigate(`/register/student/${gender}`);
    } else if (!isNewUser && currentStep === 4 && hasBookedRoom) {
      // If user has booked room and is at auth step, go back to hostel selection
      navigate(`/student/hostel-selection/${gender}`, {
        state: {
          email,
          fullName: existingFullName
        }
      });
    } else {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsLoading(true);
      setSubmitError('');
      
      try {
        let registrationData;
        
        if (isNewUser) {
          // New user: Submit personal and contact details only
          registrationData = {
            fullName: formData.fullName,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            studentId: formData.studentId,
            aadharNumber: formData.aadharNumber,
            department: formData.department,
            year: formData.year,
            course: formData.course,
            email: formData.email,
            mobile: formData.mobile,
            parentName: formData.parentName,
            parentMobile: formData.parentMobile,
            permanentAddress: formData.permanentAddress,
            emergencyContact: formData.emergencyContact,
            // Set temporary values for required fields
            hostelName: formData.hostelName,
            roomType: 'pending',
            messPreference: 'pending',
            username: 'pending_' + Date.now(),
            password: 'pending123',
            partialRegistration: true // Flag to indicate partial registration
          };
        } else {
          // Approved user: Update auth details
          registrationData = {
            email: formData.email,
            username: formData.username,
            password: formData.password,
            completeRegistration: true // Flag to indicate completing registration
          };
        }
        
        const response = await authAPI.registerStudent(registrationData);
        
        if (response.success) {
          if (isNewUser) {
            alert('Registration submitted successfully! You will receive an email once admin approves your request.');
            navigate('/');
          } else {
            alert('Registration completed successfully! You can now login.');
            navigate('/login/student');
          }
        }
      } catch (error) {
        setSubmitError(error.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderStep = () => {
    if (isNewUser) {
      // New user flow: Personal and Contact details only
      switch(currentStep) {
        case 1:
          return (
            <div className="form-step" data-aos="fade-up">
              <h2 className="step-title">Personal Details</h2>
              
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
                  <label>Gender</label>
                  <input
                    type="text"
                    value={formData.gender}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-field">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={errors.dateOfBirth ? 'error' : ''}
                  />
                  {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-field">
                  <label>Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    maxLength="9"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="Enter your student ID"
                    className={errors.studentId ? 'error' : ''}
                  />
                  {errors.studentId && <span className="error-text">{errors.studentId}</span>}
                </div>

                <div className="form-field">
                  <label>Fees Receipt Number*</label>
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="Enter receipt number"
                    maxLength="12"
                    className={errors.aadharNumber ? 'error' : ''}
                  />
                  {errors.aadharNumber && <span className="error-text">{errors.aadharNumber}</span>}
                </div>

                <div className="form-field">
                  <label>Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={errors.department ? 'error' : ''}
                  >
                    <option value="">Select Department</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                    <option value="EE">Electrical</option>
                  </select>
                  {errors.department && <span className="error-text">{errors.department}</span>}
                </div>

                <div className="form-field">
                  <label>Year *</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={errors.year ? 'error' : ''}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                  {errors.year && <span className="error-text">{errors.year}</span>}
                </div>

                <div className="form-field">
                  <label>Course *</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="Enter your course (e.g., B.Tech)"
                    className={errors.course ? 'error' : ''}
                  />
                  {errors.course && <span className="error-text">{errors.course}</span>}
                </div>

                <div className="form-field full-width">
                  <label>Photo Upload (Optional)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      name="photo"
                      onChange={handleChange}
                      accept="image/*"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="file-label">
                      <span>📷</span>
                      <span>Upload Photo</span>
                    </label>
                    {formData.photo && <span className="file-name">{formData.photo.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          );

        case 2:
          return (
            <div className="form-step" data-aos="fade-up">
              <h2 className="step-title">Contact Details</h2>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Email ID *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'error' : ''}
                    readOnly={!!email}
                    style={email ? { background: 'rgba(139, 107, 74, 0.1)', cursor: 'not-allowed' } : {}}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                  {email && <span className="helper-text" style={{ color: 'var(--light-brown)', fontSize: '12px' }}>Email is pre-filled from previous step</span>}
                </div>

                <div className="form-field">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    className={errors.mobile ? 'error' : ''}
                  />
                  {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                </div>

                <div className="form-field">
                  <label>Parent's Name *</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="Enter parent's name"
                    className={errors.parentName ? 'error' : ''}
                  />
                  {errors.parentName && <span className="error-text">{errors.parentName}</span>}
                </div>

                <div className="form-field">
                  <label>Parent's Mobile *</label>
                  <input
                    type="tel"
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleChange}
                    placeholder="Enter parent's mobile"
                    maxLength="10"
                    className={errors.parentMobile ? 'error' : ''}
                  />
                  {errors.parentMobile && <span className="error-text">{errors.parentMobile}</span>}
                </div>

                <div className="form-field full-width">
                  <label>Permanent Address *</label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    placeholder="Enter your permanent address"
                    rows="3"
                    className={errors.permanentAddress ? 'error' : ''}
                  />
                  {errors.permanentAddress && <span className="error-text">{errors.permanentAddress}</span>}
                </div>

                <div className="form-field">
                  <label>Emergency Contact Number *</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    placeholder="Enter emergency contact"
                    maxLength="10"
                    className={errors.emergencyContact ? 'error' : ''}
                  />
                  {errors.emergencyContact && <span className="error-text">{errors.emergencyContact}</span>}
                </div>
              </div>
            </div>
          );
      }
    } else {
      // Approved user flow
      switch(currentStep) {
        case 3:
          // Only show this step if room hasn't been booked
          if (hasBookedRoom) {
            setCurrentStep(4);
            return null;
          }
          
          return (
            <div className="form-step" data-aos="fade-up">
              <h2 className="step-title">Preferences</h2>
              {existingUser && (
                <div className="info-message" style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '15px',
                  padding: '15px 20px',
                  marginBottom: '30px',
                  color: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>✅</span>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '5px' }}>Welcome back, {formData.fullName || 'Student'}!</p>
                    <p style={{ fontSize: '14px', margin: 0 }}>Your registration was approved. Please set your preferences before selecting a hostel.</p>
                  </div>
                </div>
              )}
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Mess Preference *</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="messPreference"
                        value="veg"
                        checked={formData.messPreference === 'veg'}
                        onChange={handleChange}
                      />
                      <span>Vegetarian</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="messPreference"
                        value="non-veg"
                        checked={formData.messPreference === 'non-veg'}
                        onChange={handleChange}
                      />
                      <span>Non-Vegetarian</span>
                    </label>
                  </div>
                  {errors.messPreference && <span className="error-text">{errors.messPreference}</span>}
                </div>
              </div>

              <div className="info-box" style={{
                background: 'rgba(33, 150, 243, 0.1)',
                border: '1px solid rgba(33, 150, 243, 0.3)',
                borderRadius: '15px',
                padding: '20px',
                marginTop: '30px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#2196F3', fontSize: '16px', margin: 0 }}>
                  After setting your preferences, you'll be redirected to select your hostel and room.
                </p>
              </div>
            </div>
          );

        case 4:
          return (
            <div className="form-step" data-aos="fade-up">
              <h2 className="step-title">Create Login Credentials</h2>
              
              {roomBooked && (
                <div className="info-message" style={{
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  borderRadius: '15px',
                  padding: '15px 20px',
                  marginBottom: '30px',
                  color: '#4CAF50',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🎉</span>
                  <div>
                    <p style={{ fontWeight: '600', marginBottom: '5px' }}>Room Booked Successfully!</p>
                    <p style={{ fontSize: '14px', margin: 0 }}>Now create your login credentials to complete the registration.</p>
                  </div>
                </div>
              )}
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Create Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username (min. 4 characters)"
                    className={errors.username ? 'error' : ''}
                    autoComplete="username"
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
                    placeholder="Create a strong password (min. 6 characters)"
                    className={errors.password ? 'error' : ''}
                    autoComplete="new-password"
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
                    autoComplete="new-password"
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
                      id="id-upload"
                    />
                    <label htmlFor="id-upload" className="file-label">
                      <span>📄</span>
                      <span>Upload ID Proof</span>
                    </label>
                    {formData.idProof && <span className="file-name">{formData.idProof.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }
  };

  // Calculate progress based on actual flow
  const getStepNumber = () => {
    if (isNewUser) {
      return currentStep; // Steps 1-2 for new users
    } else if (hasBookedRoom) {
      return 1; // Only authentication step for users who booked room
    } else {
      return currentStep - 2; // Convert steps 3-4 to 1-2 for approved users
    }
  };

  const progressPercentage = (getStepNumber() / totalSteps) * 100;

  return (
    <div className="registration-page">
      {/* Background Elements */}
      <div className="reg-bg-container">
        <div className="reg-bg-gradient"></div>
        <div className="reg-floating-shapes">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="reg-nav">
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
      <div className="reg-container">
        <div className="reg-card">
          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-steps">
              {isNewUser ? (
                // New user: Personal and Contact steps
                <>
                  <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <span className="step-number">{currentStep > 1 ? '✓' : 1}</span>
                    <span className="step-label">Personal</span>
                  </div>
                  <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <span className="step-number">{currentStep > 2 ? '✓' : 2}</span>
                    <span className="step-label">Contact</span>
                  </div>
                </>
              ) : hasBookedRoom ? (
                // User with booked room: Only Authentication step
                <div className={`progress-step active`}>
                  <span className="step-number">1</span>
                  <span className="step-label">Authentication</span>
                </div>
              ) : (
                // Approved user without room: Preferences and Authentication
                <>
                  <div className={`progress-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                    <span className="step-number">{currentStep > 3 ? '✓' : 1}</span>
                    <span className="step-label">Preferences</span>
                  </div>
                  <div className={`progress-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`}>
                    <span className="step-number">{currentStep > 4 ? '✓' : 2}</span>
                    <span className="step-label">Authentication</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form Header */}
          <div className="reg-header" data-aos="fade-down">
            <h1 className="reg-title">
              Student <span className="gradient-text">Registration</span>
            </h1>
            <p className="reg-subtitle">{formData.hostelName}</p>
            {isNewUser ? (
              <p className="reg-subtitle" style={{ color: '#2196F3', marginTop: '10px' }}>
                Complete your details for admin approval
              </p>
            ) : roomBooked ? (
              <p className="reg-subtitle" style={{ color: '#4CAF50', marginTop: '10px' }}>
                Complete your registration
              </p>
            ) : (
              <p className="reg-subtitle" style={{ color: '#4CAF50', marginTop: '10px' }}>
                Complete your hostel booking
              </p>
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="error-message" data-aos="fade-down" style={{
              background: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '15px',
              padding: '15px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f44336'
            }}>
              <span className="error-icon">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Form Actions */}
            <div className="form-actions">
              {/* Previous button logic */}
              {((isNewUser && currentStep > 1) || 
                (!isNewUser && !hasBookedRoom && currentStep > 3) ||
                (!isNewUser && hasBookedRoom && currentStep > 4)) && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevious}
                >
                  <span>←</span>
                  Previous
                </button>
              )}

              {/* Next/Submit button logic */}
              {(isNewUser && currentStep < 2) ? (
                // New user: Show Next button for step 1
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Next
                  <span>→</span>
                </button>
              ) : (!isNewUser && !hasBookedRoom && currentStep === 3) ? (
                // Approved user without room: Show Next to go to hostel selection
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Select Hostel & Room
                  <span>→</span>
                </button>
              ) : (
                // Final submit button
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      {isNewUser ? 'Submit for Approval' : 'Complete Registration'}
                      <span>✓</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
