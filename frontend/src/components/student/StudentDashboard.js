// frontend/src/components/student/StudentDashboard.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Path to AuthContext

// All nested components are imported from the './components/' subfolder
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardHome from './components/DashboardHome';
import RoomDetails from './components/RoomDetails';
import MyHostel from './components/MyHostel';
import Complaints from './components/Complaints';
import Profile from './components/Profile';

// HostelSelection is now directly in the 'student' folder
import HostelSelection from './HostelSelection'; // PATH CORRECTED

import './StudentDashboard.css'; // CSS for this component is in the same folder

const StudentDashboard = () => {
  const authContext = useAuth();
  
  if (!authContext) {
    console.error('StudentDashboard component: AuthContext is null. Component is not wrapped by AuthProvider.');
    return null;
  }
  const { user, loading: authGlobalLoading } = authContext;

  // ProtectedRoute ensures correct role AND year is set before rendering this.
  // This is a fail-safe, but should ideally not be hit if routing is correct.
  if (authGlobalLoading || !user || user.role !== 'student' || !user.year) {
    return null; 
  }

  return (
    <div className="student-dashboard">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar />
        <div className="dashboard-content">
          <Routes>
            <Route path="home" element={<DashboardHome />} />
            <Route path="hostels" element={<HostelSelection />} />
            {/* These paths are relative to /student/ */}
            {/* HostelSelection component can display a list of rooms if route matches /hostels/:hostelId/rooms */}
            <Route path="hostels/:hostelId/rooms" element={<HostelSelection />} /> 
            <Route path="hostels/:hostelId/rooms/:roomId" element={<RoomDetails />} />
            
            <Route path="my-booking" element={<MyHostel />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="profile" element={<Profile />} />
            {/* Fallback for /student/ if no sub-route matches, redirects to home */}
            <Route path="/" element={<DashboardHome />} /> 
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
