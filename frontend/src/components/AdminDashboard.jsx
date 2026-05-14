import React from 'react';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const farmers = [
  { id: "#SC-8801", name: "vijaykadam@1977", mobile: "+91 98XXX XXX10", location: "Pune West", type: "Co 86032", brix: "21.2%", status: "Ready to Harvest", harvestDate: "20-Oct-2024" },
  { id: "#SC-8802", name: "mahadev pawar", mobile: "+91 98XXX XXX22", location: "Satara North", type: "CoC 671", brix: "16.5%", status: "In Growth", harvestDate: "15-Nov-2024" },
  { id: "#SC-8803", name: "Suresh Deshmukh", mobile: "+91 98XXX XXX45", location: "Sangli East", type: "Co 86032", brix: "20.8%", status: "Ready to Harvest", harvestDate: "22-Oct-2024" },
  { id: "#SC-8804", name: "Vijay Singh", mobile: "+91 98XXX XXX88", location: "Nashik Central", type: "Co 0265", brix: "14.2%", status: "In Growth", harvestDate: "05-Dec-2024" }
];

function AdminDashboard() {
  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <header className="header">
          <h1>Regional Harvest Monitor</h1>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Farmers</h3>
            <p>1,248</p>
          </div>
          <div className="stat-card">
            <h3>Ready for Harvest</h3>
            <p>42</p>
          </div>
          <div className="stat-card">
            <h3>Avg. Brix Value</h3>
            <p>18.4%</p>
          </div>
          <div className="stat-card">
            <h3>Total Area (Acres)</h3>
            <p>15,400</p>
          </div>
        </div>

        <div className="table-container">
          <h2>Comprehensive Farmer List</h2>
          <table>
            <thead>
              <tr>
                <th>Farmer ID</th>
                <th>Name</th>
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
                  <td>{farmer.id}</td>
                  <td><b>{farmer.name}</b></td>
                  <td>{farmer.mobile}</td>
                  <td>{farmer.location}</td>
                  <td>{farmer.type}</td>
                  <td>{farmer.brix}</td>
                  <td>
                    <span className={`badge ${farmer.status === 'Ready to Harvest' ? 'status-ready' : 'status-growing'}`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td>{farmer.harvestDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
