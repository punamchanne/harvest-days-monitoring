import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import './FarmerDirectory.css';

const farmersData = [
  { id: "#SC-8801", name: "Rajesh Kumar", location: "Pune West, Maharashtra", area: "12 Acres", variety: "Co 86032", phone: "+919800000010" },
  { id: "#SC-8802", name: "Amit Patil", location: "Satara North, Maharashtra", area: "8 Acres", variety: "CoC 671", phone: "+919800000022" },
  { id: "#SC-8803", name: "Suresh Deshmukh", location: "Sangli East, Maharashtra", area: "25 Acres", variety: "Co 86032", phone: "+919800000045" },
  { id: "#SC-8804", name: "Vijay Singh", location: "Nashik Central, Maharashtra", area: "15 Acres", variety: "Co 0265", phone: "+919800000088" }
];

function FarmerDirectory() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFarmers = farmersData.filter(farmer => 
    farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    farmer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="directory-header">
          <div>
            <h1>🌱 Farmer Directory</h1>
            <p style={{ color: '#666' }}>Manage your registered sugarcane growers</p>
            <span className="total-count">Total: {filteredFarmers.length} Farmers Showing</span>
          </div>
          <div className="controls">
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className="filter-select">
              <option>All Locations</option>
              <option>Pune West</option>
              <option>Satara North</option>
              <option>Sangli East</option>
            </select>
          </div>
        </div>

        <div className="farmer-grid">
          {filteredFarmers.map((farmer, index) => (
            <div className="farmer-card" key={index}>
              <div className="farmer-info">
                <p>ID: {farmer.id}</p>
                <h3>{farmer.name}</h3>
                <p>📍 {farmer.location}</p>
                <p>🚜 <b>Area:</b> {farmer.area}</p>
                <p>🌾 <b>Variety:</b> {farmer.variety}</p>
              </div>
              <div className="contact-row">
                <a href={`tel:${farmer.phone}`} className="call-btn">📞 Call Farmer</a>
                <a href="#" className="view-map">View on Map</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default FarmerDirectory;
