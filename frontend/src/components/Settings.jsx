import React from 'react';
import AdminSidebar from './AdminSidebar';
import './Settings.css';

function Settings() {
  const handleSave = () => {
    alert('Settings Saved Successfully!');
  };

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="header">
          <h1>⚙️ System Settings</h1>
        </div>

        <div className="settings-container">
          <div className="settings-card">
            <h3>Admin Profile</h3>
            <div className="form-group">
              <label>Factory Name</label>
              <input type="text" defaultValue="Satara Sugar Works Ltd." />
            </div>
            <div className="form-group">
              <label>Administrator Email</label>
              <input type="email" defaultValue="admin@satarasugar.com" />
            </div>
          </div>

          <div className="settings-card">
            <h3>Harvest Parameters</h3>
            <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>Set the thresholds that trigger harvest alerts.</p>
            
            <div className="form-group">
              <label>Minimum Brix for Harvest (%)</label>
              <input type="number" defaultValue="19.5" step="0.1" />
            </div>
            
            <div className="form-group">
              <label>Default Sugarcane Variety</label>
              <select defaultValue="Co 86032">
                <option>Co 86032</option>
                <option>Co 0265</option>
                <option>CoC 671</option>
              </select>
            </div>
          </div>

          <div className="settings-card">
            <h3>Notification Preferences</h3>
            <div className="toggle-group">
              <div>
                <strong>Email Alerts</strong>
                <p style={{ fontSize: '12px', color: '#888' }}>Notify when a plot reaches optimal Brix.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="toggle-group">
              <div>
                <strong>SMS to Farmers</strong>
                <p style={{ fontSize: '12px', color: '#888' }}>Auto-send harvest dates to farmers.</p>
              </div>
              <input type="checkbox" />
            </div>
          </div>

          <div className="settings-card danger-zone">
            <h3 style={{ color: '#c53030' }}>System Security</h3>
            <div className="form-group">
              <label>Change Admin Password</label>
              <input type="password" placeholder="New Password" />
            </div>
            <button className="btn-save" onClick={handleSave}>Update Settings</button>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
