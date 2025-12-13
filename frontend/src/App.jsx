import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberRegistration from './pages/MemberRegistration';
import Attendance from './pages/Attendance';
import Staff from './pages/Staff';
import MemberDetails from './pages/MemberDetails';
import ProcessPayment from './pages/ProcessPayment';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </Provider>
  );
}

function AppRoutes() {
  const { isAuthenticated } = store.getState().auth;
  
  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/*" 
        element={isAuthenticated ? <AuthenticatedApp /> : <Navigate to="/login" replace />} 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar would go here if you extract it */}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/register" element={<MemberRegistration />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/staff" element={<Staff />} />
         <Route path="/members/:id" element={<MemberDetails />} />
         <Route path="/payments/process" element={<ProcessPayment />} />
      </Routes>
    </div>
  );
}

export default App;