import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import './HarvestSchedules.css';

function HarvestSchedules() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch farmers to create dynamic harvest schedules
  const fetchHarvestSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/farmers');
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setFarmers(data.farmers);
      } else {
        console.error('Failed to load schedules:', data.message);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvestSchedules();
  }, []);

  const handleAction = (name) => {
    alert(`Dispatch Request Sent for ${name}. Transport vehicle and labor team will be notified.`);
  };

  // Convert database farmer fields into schedule objects
  const schedules = farmers.map(farmer => {
    // Expected harvest date is formatted like "20-Oct-2026" or "In 15 Days"
    let day = '20';
    let month = 'Oct';
    
    const hDate = farmer.harvest_date || '20-Oct-2026';
    if (hDate.includes('-')) {
      const parts = hDate.split('-');
      day = parts[0] || '20';
      month = parts[1] || 'Oct';
    } else if (hDate.toLowerCase().includes('in')) {
      // Dynamic description like "In 15 Days" -> just use current date + days
      const days = parseInt(hDate.replace(/[^0-9]/g, '')) || 10;
      const future = new Date();
      future.setDate(future.getDate() + days);
      day = String(future.getDate());
      month = future.toLocaleString('en-US', { month: 'short' });
    } else if (hDate.toLowerCase().includes('ready') || hDate.toLowerCase().includes('now')) {
      const today = new Date();
      day = String(today.getDate());
      month = today.toLocaleString('en-US', { month: 'short' });
    }

    const brixVal = parseFloat(farmer.brix || '0');
    const isReady = brixVal >= 19.0 || (farmer.status && farmer.status.toLowerCase().includes('ready'));
    
    return {
      day,
      month,
      name: farmer.name,
      id: `#SC-${1000 + farmer.id}`,
      location: farmer.location || 'N/A',
      area: farmer.area || 'N/A',
      brix: farmer.brix || '0.0%',
      status: isReady ? "CRITICAL: READY" : "MONITORING (IN GROWTH)",
      urgent: isReady,
      action: isReady ? "Assign Transport" : "Awaiting Brix 19%",
      disabled: !isReady
    };
  });

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="schedule-header">
          <h1>🗓️ Harvest Schedules</h1>
          <p>Priority harvesting based on live field Brix metrics and crop maturity.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
            <div className="loader"></div>
          </div>
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '16px' }}>
            <h3>No Scheduled Harvests</h3>
            <p>Once growers register and perform sensor analysis, harvest schedules will generate here.</p>
          </div>
        ) : (
          <div className="schedules-list">
            {schedules.map((item, index) => (
              <div className="schedule-card" key={index}>
                <div className="date-tile">
                  <span className="day">{item.day}</span>
                  <span className="month">{item.month}</span>
                </div>
                <div className="info-content">
                  <div className="farmer-meta">
                    <h3>{item.name} ({item.id})</h3>
                    <p>📍 {item.location} | Area: {item.area}</p>
                    <span className="brix-badge">Brix: {item.brix}</span>
                  </div>
                  <div className="status-indicator">
                    <span className={`urgency ${item.urgent ? 'urgent' : 'normal'}`}>
                      {item.status}
                    </span>
                    <br />
                    <button 
                      className="btn-schedule" 
                      onClick={() => !item.disabled && handleAction(item.name)}
                      style={item.disabled ? { background: '#94a3b8', cursor: 'not-allowed', boxShadow: 'none' } : {}}
                      disabled={item.disabled}
                    >
                      {item.action}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HarvestSchedules;
