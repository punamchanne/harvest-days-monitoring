import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('active_brix');
    localStorage.removeItem('active_status');
  };

  return (
    <div className="sidebar">
      <h2>AgriSmart IoT</h2>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Live Dashboard</NavLink>
        <NavLink to="/historical-data" className={({ isActive }) => isActive ? "active" : ""}>Historical Data</NavLink>
        <NavLink to="/sensor-health" className={({ isActive }) => isActive ? "active" : ""}>Sensor Health</NavLink>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""} onClick={handleLogout}>Logout</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
