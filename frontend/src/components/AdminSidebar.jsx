import React from 'react';
import { NavLink } from 'react-router-dom';

function AdminSidebar() {
  return (
    <div className="sidebar admin-sidebar">
      <h2>🏭 Factory Admin</h2>
      <nav className="nav-links">
        <NavLink to="/admin-dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard Overview</NavLink>
        <NavLink to="/farmer-directory" className={({ isActive }) => isActive ? "active" : ""}>Farmer Directory</NavLink>
        <NavLink to="/harvest-schedules" className={({ isActive }) => isActive ? "active" : ""}>Harvest Schedules</NavLink>
        <NavLink to="/brix-analysis" className={({ isActive }) => isActive ? "active" : ""}>Brix Analysis</NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>Settings</NavLink>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Logout</NavLink>
      </nav>
    </div>
  );
}

export default AdminSidebar;
