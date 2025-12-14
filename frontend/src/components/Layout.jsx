import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16"> {/* Adjust based on your navbar height */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;