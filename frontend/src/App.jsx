import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HistoricalData from './components/HistoricalData';
import SensorHealth from './components/SensorHealth';
import AdminDashboard from './components/AdminDashboard';
import FarmerDirectory from './components/FarmerDirectory';
import BrixAnalysis from './components/BrixAnalysis';
import HarvestSchedules from './components/HarvestSchedules';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/historical-data" element={<HistoricalData />} />
        <Route path="/sensor-health" element={<SensorHealth />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/farmer-directory" element={<FarmerDirectory />} />
        <Route path="/brix-analysis" element={<BrixAnalysis />} />
        <Route path="/harvest-schedules" element={<HarvestSchedules />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
