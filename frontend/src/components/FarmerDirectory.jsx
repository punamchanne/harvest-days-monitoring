import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import './FarmerDirectory.css';

function FarmerDirectory() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [variety, setVariety] = useState('Co 86032');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch registered farmers
  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/farmers');
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setFarmers(data.farmers);
      } else {
        console.error('Failed to fetch farmers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleAddFarmer = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/farmers/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password: password || 'farmer@123',
          name,
          phone,
          location,
          area: area ? `${area} Acres` : '',
          variety
        })
      });

      const data = await response.json();
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Failed to add farmer');
      }

      setModalSuccess('Farmer registered and added successfully!');
      // Reset form fields
      setUsername('');
      setPassword('');
      setName('');
      setPhone('');
      setLocation('');
      setArea('');
      setVariety('Co 86032');
      
      // Refresh directory list
      fetchFarmers();

      // Automatically close modal after 1.5s
      setTimeout(() => {
        setShowModal(false);
        setModalSuccess('');
      }, 1500);

    } catch (err) {
      setModalError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique locations for dropdown filter
  const locations = ['All Locations', ...new Set(farmers.map(f => f.location).filter(Boolean))];

  // Filtering logic
  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = 
      (farmer.name && farmer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (farmer.username && farmer.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (farmer.id && String(farmer.id).includes(searchTerm));
      
    const matchesLocation = locationFilter === 'All Locations' || farmer.location === locationFilter;
    
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="directory-header">
          <div>
            <h1>🌱 Farmer Directory</h1>
            <p style={{ color: '#666' }}>Manage your registered sugarcane growers</p>
            <span className="total-count">
              {loading ? 'Loading...' : `Total: ${filteredFarmers.length} Farmers Showing`}
            </span>
          </div>
          <div className="controls">
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search by name, ID or username..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className="filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              {locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))}
            </select>

            <button className="add-farmer-btn" onClick={() => setShowModal(true)}>
              ➕ Add Farmer
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '100px 0' }}>
            <div className="loader"></div>
          </div>
        ) : filteredFarmers.length === 0 ? (
          <div className="empty-state">
            <h3>No Farmers Found</h3>
            <p>Try resetting filters or register new farmers to get started.</p>
          </div>
        ) : (
          <div className="farmer-grid">
            {filteredFarmers.map((farmer, index) => (
              <div className="farmer-card" key={index}>
                <div className="farmer-info">
                  <div className="card-top-row">
                    <span className="farmer-id-badge">#SC-{1000 + farmer.id}</span>
                    <span className={`status-badge-inline ${farmer.status === 'Ready to Harvest' ? 'status-ready' : 'status-growing'}`}>
                      {farmer.status}
                    </span>
                  </div>
                  <h3>{farmer.name}</h3>
                  <p className="farmer-username">👤 @{farmer.username}</p>
                  <p>📍 <b>Location:</b> {farmer.location || 'N/A'}</p>
                  <p>🚜 <b>Farm Area:</b> {farmer.area || 'N/A'}</p>
                  <p>🌾 <b>Variety:</b> {farmer.variety || 'N/A'}</p>
                  <p>📈 <b>Sugar Content (Brix):</b> <strong style={{ color: '#2e7d32' }}>{farmer.brix || '0.0%'}</strong></p>
                  <p>📅 <b>Exp. Harvest:</b> {farmer.harvest_date || 'TBD'}</p>
                </div>
                <div className="contact-row">
                  {farmer.phone ? (
                    <a href={`tel:${farmer.phone}`} className="call-btn">📞 Call: {farmer.phone}</a>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#888' }}>No phone available</span>
                  )}
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(farmer.location || '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-map"
                  >
                    View Map 🗺️
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Farmer Modal Overlay */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content animate-slide-in">
              <div className="modal-header">
                <h2>➕ Add New Sugarcane Grower</h2>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleAddFarmer} className="modal-form">
                {modalError && <div className="modal-alert error">{modalError}</div>}
                {modalSuccess && <div className="modal-alert success">{modalSuccess}</div>}

                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Farmer Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rajesh Patil" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 9876543210" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Location / Village</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Pune West, MH" 
                      value={location} 
                      onChange={(e) => setLocation(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Farm Area (in Acres)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 10" 
                      value={area} 
                      onChange={(e) => setArea(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Login Username *</label>
                    <input 
                      type="text" 
                      placeholder="Unique username for farmer" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Login Password (Optional - defaults to 'farmer@123')</label>
                    <input 
                      type="password" 
                      placeholder="Enter secret password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit" disabled={submitting}>
                    {submitting ? 'Registering...' : 'Register Farmer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default FarmerDirectory;
