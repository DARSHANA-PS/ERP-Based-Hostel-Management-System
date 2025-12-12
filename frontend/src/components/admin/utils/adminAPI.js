// ==========================
// FIXED BASE URL FOR VERCEL + LOCALHOST
// ==========================

// Removes trailing slash & supports environment variable on Vercel
const API_BASE_URL = "https://appsail-50036818087.development.catalystappsail.in/api";


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
    
    return result.success ? result.data : result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};


export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const registrations = await apiCall('/admin/pending-registrations');
    return {
      totalHostels: 2,
      totalRooms: 400,
      totalStudents: registrations.students?.filter(s => s.status === 'approved').length || 0,
      totalWardens: registrations.wardens?.filter(w => w.status === 'approved').length || 0,
      pendingFees: 210000,
      pendingComplaints: 5
    };
  },

  // Student Management
  getAllStudents: async () => {
    const response = await apiCall('/admin/all-students');
    return response || [];
  },

  approveStudent: (id) => apiCall(`/admin/approve/student/${id}`, 'PUT'),
  rejectStudent: (id) => apiCall(`/admin/reject/student/${id}`, 'PUT'),

  // Warden Management
  getAllWardens: async () => {
    const response = await apiCall('/admin/all-wardens');
    return response || [];
  },

  approveWarden: (id) => apiCall(`/admin/approve/warden/${id}`, 'PUT'),
  rejectWarden: (id) => apiCall(`/admin/reject/warden/${id}`, 'PUT'),

  // Pending Registrations
  getPendingRegistrations: () => apiCall('/admin/pending-registrations'),

  // Room Management (placeholder)
  getRoomStats: async () => {
    return {
      totalRooms: 400,
      occupied: 340,
      available: 60,
      maintenance: 0
    };
  },

  // Announcements (placeholder)
  sendAnnouncement: (data) => apiCall('/admin/announcements', 'POST', data),

  // Reports (placeholder)
  generateReport: (type) => apiCall(`/admin/reports/${type}`)
};
