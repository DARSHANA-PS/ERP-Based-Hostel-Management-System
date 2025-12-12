const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Add token if exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Add body if data exists
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API call failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  login: (data) => apiCall('/auth/login', 'POST', data),
  registerStudent: (data) => apiCall('/auth/register/student', 'POST', data),
  registerWarden: (data) => apiCall('/auth/register/warden', 'POST', data),
  checkEmail: (data) => apiCall('/auth/check-email', 'POST', data),
};

// Admin APIs
export const adminAPI = {
  getPendingRegistrations: () => apiCall('/admin/pending-registrations'),
  approveStudent: (id) => apiCall(`/admin/approve/student/${id}`, 'PUT'),
  rejectStudent: (id) => apiCall(`/admin/reject/student/${id}`, 'PUT'),
  approveWarden: (id) => apiCall(`/admin/approve/warden/${id}`, 'PUT'),
  rejectWarden: (id) => apiCall(`/admin/reject/warden/${id}`, 'PUT'),
  getAllStudents: () => apiCall('/admin/all-students'),
  getAllWardens: () => apiCall('/admin/all-wardens'),
  getDashboardStats: () => apiCall('/admin/dashboard-stats'),
};

// Student APIs - Combined all student methods
export const studentAPI = {
  // Profile Management
  getProfile: () => apiCall('/student/profile'),
  updateProfile: (data) => apiCall('/student/profile', 'PUT', data),
  uploadPhoto: (formData) => {
    const config = {
      method: 'POST',
      headers: {}
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.body = formData;
    
    return fetch(`${API_BASE_URL}/student/profile/photo`, config)
      .then(res => res.json());
  },
  
  // Room Management
  getRoomDetails: () => apiCall('/student/room'),
  bookRoom: (roomId) => apiCall('/student/book-room', 'POST', { roomId }),
  
  // Hostel Management
  getAvailableHostels: () => apiCall('/student/hostels/available'),
  getHostelRooms: (hostelId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/student/hostels/${hostelId}/rooms${queryString ? `?${queryString}` : ''}`);
  },
  getHostelStats: (hostelId) => apiCall(`/student/hostels/${hostelId}/stats`),
  getHostelDetails: () => apiCall('/student/hostel/details'),
  getWardenContact: () => apiCall('/student/hostel/warden'),
  
  // Dashboard
  getDashboardStats: () => apiCall('/student/dashboard/stats'),
  
  // Fee Management
  getFeeDetails: () => apiCall('/student/fees'),
  getFeeHistory: () => apiCall('/student/fees/history'),
  downloadFeeReceipt: (feeId) => `${API_BASE_URL}/student/fees/receipt/${feeId}`,
  
  // Announcements
  getAnnouncements: () => apiCall('/student/announcements'),
  markAnnouncementRead: (id) => apiCall(`/student/announcements/${id}/read`, 'PUT'),
  
  // Complaints
  getComplaints: () => apiCall('/student/complaints'),
  createComplaint: (data) => apiCall('/student/complaints', 'POST', data),
  getComplaintDetails: (id) => apiCall(`/student/complaints/${id}`),
  
  // Contact/Help
  sendMessage: (data) => apiCall('/student/contact/message', 'POST', data),
  
  // Notifications
  getNotifications: () => apiCall('/student/notifications'),
  markNotificationRead: (id) => apiCall(`/student/notifications/${id}/read`, 'PUT'),
};

// Warden APIs
export const wardenAPI = {
  getProfile: () => apiCall('/warden/profile'),
  getStudents: () => apiCall('/warden/students'),
  getComplaints: () => apiCall('/warden/complaints'),
  updateComplaintStatus: (id, status) => apiCall(`/warden/complaints/${id}`, 'PUT', { status }),
};

// Hostel APIs
export const hostelAPI = {
  getAllHostels: () => apiCall('/hostels/all'),
  getHostelById: (id) => apiCall(`/hostels/${id}`),
  createHostel: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    const config = {
      method: 'POST',
      headers: {}
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.body = formData;
    
    return fetch(`${API_BASE_URL}/hostels/create`, config)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.message || 'Failed to create hostel');
        }
        return data;
      });
  },
  updateHostel: (id, data) => apiCall(`/hostels/update/${id}`, 'PUT', data),
  deleteHostel: (id) => apiCall(`/hostels/${id}`, 'DELETE'),
  getHostelVideo: (id) => `${API_BASE_URL}/hostels/video/${id}`,
};

// Room APIs
export const roomAPI = {
  getAllRooms: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/rooms/all${queryString ? `?${queryString}` : ''}`);
  },
  getRoomById: (id) => apiCall(`/rooms/${id}`),
  getRoomStudents: (roomId) => apiCall(`/rooms/${roomId}/students`),
  updateRoomStatus: (id, status) => apiCall(`/rooms/status/${id}`, 'PUT', { status }),
  allocateStudent: (roomId, studentId) => apiCall(`/rooms/allocate/${roomId}`, 'POST', { studentId }),
  deallocateStudent: (roomId, studentId) => apiCall(`/rooms/deallocate/${roomId}`, 'POST', { studentId }),
  getRoomStats: (hostelId) => apiCall(`/rooms/stats/${hostelId}`),
};

// Fee APIs
export const feeAPI = {
  // Admin APIs
  createFeeStructure: (formData) => {
    const config = {
      method: 'POST',
      headers: {}
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.body = formData;
    
    return fetch(`${API_BASE_URL}/fees/structure`, config)
      .then(res => res.json());
  },
  
  getFeeStructures: () => apiCall('/fees/structures'),
  updateFeeStructure: (id, data) => apiCall(`/fees/structure/${id}`, 'PUT', data),
  deleteFeeStructure: (id) => apiCall(`/fees/structure/${id}`, 'DELETE'),
  getFeeStatistics: () => apiCall('/fees/statistics'),
  downloadReport: (type) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/fees/report/${type}?token=${token}`;
  },
  
  // Warden APIs
  getHostelFees: (hostelId) => apiCall(`/fees/hostel-fees/${hostelId}`),
  verifyTransaction: (transactionId, data) => apiCall(`/fees/verify/${transactionId}`, 'PUT', data),
  
  // Student APIs
  getMyFees: () => apiCall('/fees/my-fees'),
  submitPayment: (formData) => {
    const config = {
      method: 'POST',
      headers: {}
    };
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.body = formData;
    
    return fetch(`${API_BASE_URL}/fees/payment`, config)
      .then(res => res.json());
  },
  
  // Common APIs
  sendReminder: (data) => apiCall('/fees/reminder', 'POST', data),
};
