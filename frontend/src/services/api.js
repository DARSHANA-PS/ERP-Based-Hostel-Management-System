// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      localStorage.removeItem('studentId');
      localStorage.removeItem('studentYear');
      localStorage.removeItem('studentGender');
      localStorage.removeItem('studentHostel'); 
      localStorage.removeItem('studentRoom'); 
      localStorage.removeItem('studentRoommates');
      localStorage.removeItem('studentEmail');
      localStorage.removeItem('studentPhone');
      localStorage.removeItem('studentDepartment');
      // Optionally redirect to login page
      // window.location.href = '/login/student'; 
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  registerStudent: (data) => axiosInstance.post('/auth/register/student', data),
  registerWarden: (data) => axiosInstance.post('/auth/register/warden', data),
};

// --- MOCK STUDENT API --- (Replace with actual calls when backend is ready)
export const studentAPI = {
  getStudentProfile: async () => {
    // This will ideally fetch the full profile from backend.
    // For now, use data from AuthContext's user state or local storage.
    await new Promise(resolve => setTimeout(resolve, 500));
    return { 
      data: {
        name: localStorage.getItem('userName'),
        studentId: localStorage.getItem('studentId'),
        year: parseInt(localStorage.getItem('studentYear')),
        gender: localStorage.getItem('studentGender'),
        email: localStorage.getItem('studentEmail'),
        mobile: localStorage.getItem('studentPhone'),
        department: localStorage.getItem('studentDepartment'),
        hostelName: localStorage.getItem('studentHostel'),
        roomNumber: localStorage.getItem('studentRoom'),
        roommates: JSON.parse(localStorage.getItem('studentRoommates') || '[]'),
      } 
    };
  },

  getAvailableHostels: async ({ year, gender }) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    const mockHostels = [
      { _id: 'hostel1', name: 'Boys Hall A', wardenName: 'Mr. David Lee', availableRoomsCount: 5, imageUrl: 'https://images.unsplash.com/photo-1542301934-8c818274737d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { _id: 'hostel2', name: 'Boys Hall B', wardenName: 'Mr. Alex Smith', availableRoomsCount: 3, imageUrl: 'https://images.unsplash.com/photo-1628169134107-13009772c918?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      // ... more boy hostels
      { _id: 'hostel3', name: 'Girls Hall C', wardenName: 'Ms. Emily White', availableRoomsCount: 7, imageUrl: 'https://images.unsplash.com/photo-1574635678381-e24c2514c000?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      { _id: 'hostel4', name: 'Girls Hall D', wardenName: 'Ms. Sarah Green', availableRoomsCount: 2, imageUrl: 'https://images.unsplash.com/photo-1517409212001-c81b315264ba?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
      // ... more girl hostels
    ];
    // Filter by year (mock: all hostels are available for all years 2,3,4 for simplicity)
    // Filter by gender
    const filteredHostels = mockHostels.filter(h => 
      (gender === 'male' && h.name.includes('Boys')) || 
      (gender === 'female' && h.name.includes('Girls'))
    );
    return { data: filteredHostels };
  },

  getRoomsByHostel: async (hostelId) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const mockRooms = {
      'hostel1': [ // Boys Hall A
        { _id: 'room101', number: '101', capacity: 3, occupied: 3, occupants: ['John Doe', 'Peter Pan', 'Mock Student'], imageUrls: ['https://images.unsplash.com/photo-1598929438887-8a8b11116f39?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1592659762308-bb9389fcdb3f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
        { _id: 'room102', number: '102', capacity: 3, occupied: 2, occupants: ['Jane Doe', 'Alice Johnson'], imageUrls: ['https://images.unsplash.com/photo-1582719508461-904d516feaf5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
        { _id: 'room103', number: '103', capacity: 3, occupied: 0, occupants: [], imageUrls: [] },
        { _id: 'room104', number: '104', capacity: 3, occupied: 1, occupants: ['Bob Brown'], imageUrls: ['https://images.unsplash.com/photo-1574635678381-e24c2514c000?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      ],
      'hostel3': [ // Girls Hall C
        { _id: 'room201', number: '201', capacity: 3, occupied: 1, occupants: ['Ella Davis'], imageUrls: ['https://images.unsplash.com/photo-1616047021671-cc7297e5519c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
        { _id: 'room202', number: '202', capacity: 3, occupied: 3, occupants: ['Grace Lee', 'Chloe King', 'Lily Chen'], imageUrls: [] },
        { _id: 'room203', number: '203', capacity: 3, occupied: 2, occupants: ['Mia Wong', 'Sophia Garcia'], imageUrls: ['https://images.unsplash.com/photo-1582719508461-904d516feaf5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      ]
    };
    return { data: mockRooms[hostelId] || [] };
  },

  getRoomDetails: async (roomId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Simulate fetching a specific room's details from a larger mock set
    const allMockRooms = {
      'room101': { _id: 'room101', number: '101', capacity: 3, occupied: 3, occupants: ['John Doe', 'Peter Pan', 'Mock Student'], imageUrls: ['https://images.unsplash.com/photo-1598929438887-8a8b11116f39?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://images.unsplash.com/photo-1592659762308-bb9389fcdb3f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      'room102': { _id: 'room102', number: '102', capacity: 3, occupied: 2, occupants: ['Jane Doe', 'Alice Johnson'], imageUrls: ['https://images.unsplash.com/photo-1582719508461-904d516feaf5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      'room103': { _id: 'room103', number: '103', capacity: 3, occupied: 0, occupants: [], imageUrls: [] },
      'room104': { _id: 'room104', number: '104', capacity: 3, occupied: 1, occupants: ['Bob Brown'], imageUrls: ['https://images.unsplash.com/photo-1574635678381-e24c2514c000?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      'room201': { _id: 'room201', number: '201', capacity: 3, occupied: 1, occupants: ['Ella Davis'], imageUrls: ['https://images.unsplash.com/photo-1616047021671-cc7297e5519c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
      'room202': { _id: 'room202', number: '202', capacity: 3, occupied: 3, occupants: ['Grace Lee', 'Chloe King', 'Lily Chen'], imageUrls: [] },
      'room203': { _id: 'room203', number: '203', capacity: 3, occupied: 2, occupants: ['Mia Wong', 'Sophia Garcia'], imageUrls: ['https://images.unsplash.com/photo-1582719508461-904d516feaf5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'] },
    }
    return { data: allMockRooms[roomId] || null };
  },

  bookRoom: async (roomId) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const allMockRooms = { /* ... same as above ... */ };
    const room = allMockRooms[roomId];
    if (room && room.occupied < room.capacity) {
      // Simulate booking: In real API, backend would update and return confirmation
      return { success: true, message: `Room ${room.number} booked successfully!` };
    }
    return { success: false, message: 'Room is full or not found.' };
  },

  getMyBookings: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // For mock, simply return what's in local storage
    const hostelName = localStorage.getItem('studentHostel');
    const roomNumber = localStorage.getItem('studentRoom');
    const roommates = JSON.parse(localStorage.getItem('studentRoommates') || '[]');

    if (hostelName && roomNumber) {
      return {
        data: [{
          _id: 'mockBooking1',
          hostelName,
          roomNumber,
          roommates,
          status: 'Confirmed',
          bookingDate: new Date().toISOString(),
        }]
      };
    }
    return { data: [] };
  },

  submitComplaint: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const mockComplaints = JSON.parse(localStorage.getItem('mockComplaints') || '[]');
    const newComplaint = {
      _id: `comp${Math.floor(Math.random() * 10000)}`,
      title: data.title,
      description: data.description,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      studentId: localStorage.getItem('studentId'),
      studentName: localStorage.getItem('userName'),
    };
    mockComplaints.push(newComplaint);
    localStorage.setItem('mockComplaints', JSON.stringify(mockComplaints));
    return { success: true, data: newComplaint, message: 'Complaint submitted!' };
  },

  getMyComplaints: async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const mockComplaints = JSON.parse(localStorage.getItem('mockComplaints') || '[]');
    return { data: mockComplaints };
  },

  updateStudentYear: (year) => axiosInstance.put('/student/profile/year', { year }),
};

export const wardenAPI = {
  // ... your warden API definitions
};

export const adminAPI = {
  // ... your admin API definitions
};

export default axiosInstance;
