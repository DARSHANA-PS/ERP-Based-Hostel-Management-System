// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { token, role, name, studentId, year, gender, hostelName, roomNumber, roommates, email, mobile, etc. }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initial context load indicator
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedUserName = localStorage.getItem('userName');
    const storedStudentId = localStorage.getItem('studentId');
    const storedStudentYear = localStorage.getItem('studentYear');
    const storedStudentGender = localStorage.getItem('studentGender');
    const storedStudentHostel = localStorage.getItem('studentHostel'); // NEW
    const storedStudentRoom = localStorage.getItem('studentRoom'); // NEW
    const storedStudentRoommates = localStorage.getItem('studentRoommates'); // NEW (JSON string)
    const storedStudentEmail = localStorage.getItem('studentEmail'); // NEW
    const storedStudentPhone = localStorage.getItem('studentPhone'); // NEW
    const storedStudentDepartment = localStorage.getItem('studentDepartment'); // NEW


    if (storedToken && storedRole) {
      setUser({
        token: storedToken,
        role: storedRole,
        name: storedUserName,
        studentId: storedStudentId,
        year: storedStudentYear ? parseInt(storedStudentYear) : null,
        gender: storedStudentGender,
        hostelName: storedStudentHostel, // NEW
        roomNumber: storedStudentRoom, // NEW
        roommates: storedStudentRoommates ? JSON.parse(storedStudentRoommates) : [], // NEW
        email: storedStudentEmail, // NEW
        mobile: storedStudentPhone, // NEW
        department: storedStudentDepartment, // NEW
        // Add other profile fields as needed
      });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // --- MOCK LOGIN FUNCTION (for development) ---
  // In a real app, this would get user data (including year & gender) from backend
  const login = async (role, username, password) => {
    setLoading(true); // Set loading for the login request
    try {
      if (!username || !password) {
        throw new Error('Username and password are required.');
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

      const dummyToken = `mock-token-${role}-${username}`;
      const dummyUserName = `Student ${username.replace('test', '') || ''}`;
      const dummyStudentId = `STU${Math.floor(10000 + Math.random() * 90000)}`;
      
      // For student role, we'll initially set year to null/undefined 
      // to trigger the YearSelection component on first login.
      // For other roles, year is not relevant.
      const dummyStudentYear = role === 'student' ? null : undefined; 
      const dummyStudentGender = role === 'student' ? (username.includes('male') ? 'male' : 'female') : undefined;

      // Mock booking data (can be refined later, e.g. set after booking)
      const mockHostelName = role === 'student' && username === 'testbooked' ? (dummyStudentGender === 'male' ? 'Boys Hall A' : 'Girls Hall C') : null;
      const mockRoomNumber = role === 'student' && username === 'testbooked' ? '101' : null;
      const mockRoommates = role === 'student' && username === 'testbooked' 
        ? (dummyStudentGender === 'male' ? ['John Doe', 'Peter Pan'] : ['Jane Smith', 'Alice Wonderland']) 
        : [];
      const mockEmail = `${username}@example.com`;
      const mockPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const mockDepartment = 'Computer Science';


      localStorage.setItem('token', dummyToken);
      localStorage.setItem('role', role);
      localStorage.setItem('userName', dummyUserName);
      localStorage.setItem('studentId', dummyStudentId);
      if (dummyStudentYear !== null) localStorage.setItem('studentYear', dummyStudentYear.toString());
      if (dummyStudentGender) localStorage.setItem('studentGender', dummyStudentGender);

      // Store mock booking and profile data
      if (mockHostelName) localStorage.setItem('studentHostel', mockHostelName);
      if (mockRoomNumber) localStorage.setItem('studentRoom', mockRoomNumber);
      if (mockRoommates.length > 0) localStorage.setItem('studentRoommates', JSON.stringify(mockRoommates));
      localStorage.setItem('studentEmail', mockEmail);
      localStorage.setItem('studentPhone', mockPhone);
      localStorage.setItem('studentDepartment', mockDepartment);


      setUser({
        token: dummyToken,
        role: role,
        name: dummyUserName,
        studentId: dummyStudentId,
        year: dummyStudentYear,
        gender: dummyStudentGender,
        hostelName: mockHostelName, // NEW
        roomNumber: mockRoomNumber, // NEW
        roommates: mockRoommates, // NEW
        email: mockEmail, // NEW
        mobile: mockPhone, // NEW
        department: mockDepartment, // NEW
      });
      setIsAuthenticated(true);
      
      // Navigate to the appropriate dashboard
      navigate(`/${role}/home`); 
      return { success: true, message: 'Mock login successful!' };

    } catch (error) {
      return { success: false, message: error.message || 'Mock login failed.' };
    } finally {
      setLoading(false); // Reset loading after request
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentYear');
    localStorage.removeItem('studentGender');
    localStorage.removeItem('studentHostel'); // NEW
    localStorage.removeItem('studentRoom'); // NEW
    localStorage.removeItem('studentRoommates'); // NEW
    localStorage.removeItem('studentEmail'); // NEW
    localStorage.removeItem('studentPhone'); // NEW
    localStorage.removeItem('studentDepartment'); // NEW
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const registerStudent = async (data) => {
    setLoading(true); 
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Mock registration submitted for approval!' };
    } catch (error) {
      return { success: false, message: error.message || 'Mock registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const updateStudentYear = async (selectedYear) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.setItem('studentYear', selectedYear.toString());
      setUser(prevUser => ({
        ...prevUser,
        year: selectedYear,
      }));
      return { success: true };
    } catch (error) {
      console.error("Failed to update student year:", error);
      return { success: false, message: error.message || 'Failed to update year.' };
    } finally {
      setLoading(false);
    }
  };
  
  // NEW: Mock function to simulate room booking (updates user state)
  const mockBookRoom = async (hostelName, roomNumber, roommates) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('studentHostel', hostelName);
      localStorage.setItem('studentRoom', roomNumber);
      localStorage.setItem('studentRoommates', JSON.stringify(roommates));
      setUser(prevUser => ({
        ...prevUser,
        hostelName,
        roomNumber,
        roommates,
      }));
      return { success: true };
    } catch (error) {
      console.error("Mock room booking failed:", error);
      return { success: false, message: error.message || 'Mock room booking failed.' };
    } finally {
      setLoading(false);
    }
  };

  // NEW: Mock function to submit a complaint
  const mockSubmitComplaint = async (title, description) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      // In a real app, you'd add this to a list in state or fetch from a mock backend
      console.log('Mock complaint submitted:', { title, description, studentId: user.studentId });
      return { success: true, message: 'Complaint submitted successfully!' };
    } catch (error) {
      console.error("Mock complaint submission failed:", error);
      return { success: false, message: error.message || 'Mock complaint submission failed.' };
    } finally {
      setLoading(false);
    }
  };

  const contextValue = { 
    user, 
    isAuthenticated, 
    loading, 
    login, 
    logout, 
    registerStudent, 
    updateStudentYear,
    mockBookRoom, // NEW
    mockSubmitComplaint, // NEW
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
