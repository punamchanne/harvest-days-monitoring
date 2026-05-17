import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

function AdminDashboard() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time farmers registered/added in the database
  const fetchFarmersData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/farmers');
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setFarmers(data.farmers);
      } else {
        console.error('Failed to load farmers on admin dashboard:', data.message);
      }
    } catch (error) {
      console.error('Error loading farmers data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmersData();
  }, []);

  // Compute live statistics
  const totalFarmers = farmers.length;
  
  const readyForHarvestCount = farmers.filter(
    f => f.status && f.status.toLowerCase().includes('ready')
  ).length;

  // Average Brix calculation
  const brixValues = farmers
    .map(f => parseFloat(f.brix || '0'))
    .filter(val => !isNaN(val) && val > 0);
  const avgBrix = brixValues.length > 0 
    ? (brixValues.reduce((sum, val) => sum + val, 0) / brixValues.length).toFixed(1)
    : '0.0';

  // Total Area Calculation
  const totalArea = farmers
    .map(f => {
      if (!f.area) return 0;
      const parsed = parseFloat(f.area.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    })
    .reduce((sum, val) => sum + val, 0);

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <header className="header">
          <h1>Regional Harvest Monitor</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Live factory supervisor control board</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Farmers</h3>
            <p>{loading ? '...' : totalFarmers}</p>
          </div>
          <div className="stat-card">
            <h3>Ready for Harvest</h3>
            <p>{loading ? '...' : readyForHarvestCount}</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Brix Value</h3>
            <p>{loading ? '...' : `${avgBrix}%`}</p>
          </div>
          <div className="stat-card">
            <h3>Total Area (Acres)</h3>
            <p>{loading ? '...' : `${totalArea} Ac`}</p>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>Comprehensive Farmer List</h2>
            <button className="refresh-btn-dashboard" onClick={fetchFarmersData} style={{
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px'
            }}>
              🔄 Refresh List
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
              <div className="loader"></div>
            </div>
          ) : farmers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <h3>No Farmers Registered</h3>
              <p>When farmers register or are manually added, they will show up here instantly.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Mobile</th>
                  <th>Location</th>
                  <th>Sugarcane Type</th>
                  <th>Brix Value</th>
                  <th>Status</th>
                  <th>Exp. Harvest Date</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer, index) => (
                  <tr key={index}>
                    <td>#SC-{1000 + farmer.id}</td>
                    <td><b>{farmer.name}</b></td>
                    <td><span style={{ color: '#64748b', fontSize: '13px' }}>@{farmer.username}</span></td>
                    <td>{farmer.phone || 'N/A'}</td>
                    <td>{farmer.location || 'N/A'}</td>
                    <td>{farmer.variety || 'N/A'}</td>
                    <td><b style={{ color: '#2e7d32' }}>{farmer.brix || '0.0%'}</b></td>
                    <td>
                      <span className={`badge ${farmer.status === 'Ready to Harvest' ? 'status-ready' : 'status-growing'}`}>
                        {farmer.status}
                      </span>
                    </td>
                    <td>{farmer.harvest_date || 'TBD'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
