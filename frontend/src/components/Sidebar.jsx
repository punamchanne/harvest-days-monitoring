import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>AgriSmart IoT</h2>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Live Dashboard</NavLink>
        <NavLink to="/historical-data" className={({ isActive }) => isActive ? "active" : ""}>Historical Data</NavLink>
        <NavLink to="/sensor-health" className={({ isActive }) => isActive ? "active" : ""}>Sensor Health</NavLink>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Logout</NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
