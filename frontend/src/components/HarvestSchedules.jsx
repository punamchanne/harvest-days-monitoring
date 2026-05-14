import React from 'react';
import AdminSidebar from './AdminSidebar';
import './HarvestSchedules.css';

const schedules = [
  { day: "20", month: "Oct", name: "Rajesh Kumar", id: "#SC8801", location: "Pune West", area: "12.5 Acres", brix: "21.2%", status: "CRITICAL: OVERDUE", urgent: true, action: "Assign Transport" },
  { day: "22", month: "Oct", name: "Suresh Deshmukh", id: "#SC9012", location: "Sangli East", area: "22.0 Acres", brix: "20.8%", status: "SCHEDULED", urgent: false, action: "Confirm Pickup" },
  { day: "28", month: "Oct", name: "Amit Patil", id: "#SC8842", location: "Satara North", area: "8.2 Acres", brix: "18.5%", status: "MONITORING", urgent: false, action: "Awaiting Brix 20%", disabled: true }
];

function HarvestSchedules() {
  const handleAction = (name) => {
    alert(`Dispatch Request Sent for ${name}. Transport vehicle and labor team will be notified.`);
  };

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="schedule-header">
          <h1>🗓️ Harvest Schedules</h1>
          <p>Priority based on Brix values and crop maturity.</p>
        </div>

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
                    style={item.disabled ? { background: '#999', cursor: 'not-allowed' } : {}}
                  >
                    {item.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HarvestSchedules;
