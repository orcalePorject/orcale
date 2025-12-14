import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import MemberRegistration from './pages/MemberRegistration';
import Attendance from './pages/Attendance';
import Staff from './pages/Staff';
import ProcessPayment from './pages/ProcessPayment';
import Classes from './pages/Classes';
import Plans from './pages/Plans';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id" element={<MemberDetails />} />
            <Route path="/members/register" element={<MemberRegistration />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/staff" element={<Staff />} />
             <Route path="/plans" element={<Plans />} /> 
            <Route path="/payments/process" element={<ProcessPayment />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;