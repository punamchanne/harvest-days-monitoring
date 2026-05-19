import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';

const socket = io('http://localhost:5000');

function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  
  const [sensorData, setSensorData] = useState({
    brix: '0.0',
    nir: '620',
    moisture: '48',
    temp: '30.5'
  });
  
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ripening');
  
  const syncStatus = (brixVal) => {
    const b = parseFloat(brixVal);
    if (b >= 19.0) {
      setAiResult({ message: `Optimal Sugar (${b}%)! READY FOR HARVEST.`, type: 'success' });
      setStatus('Ready to Harvest');
    } else {
      const daysLeft = Math.ceil((20 - b) / 0.15);
      setAiResult({ message: `Sweetness is rising (${b}%). Approx. ${daysLeft} DAYS until peak maturity.`, type: 'warning' });
      setStatus(`In Growth (~${daysLeft} days)`);
    }
  };

  useEffect(() => {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      
      // Initialize brix and status from database value
      const dbBrix = parsedUser.brix ? parseFloat(parsedUser.brix) : 0.0;
      setSensorData(prev => ({
        ...prev,
        brix: dbBrix.toFixed(2)
      }));
      setStatus(parsedUser.status || 'In Growth');
      if (dbBrix > 0) {
        syncStatus(dbBrix);
      }
    }

    // Socket.io for live sensor monitoring
    socket.on('update_dashboard', (data) => {
      setSensorData(prev => ({ ...prev, ...data }));
      if (data.brix) {
        syncStatus(data.brix);
      }
    });

    return () => socket.off('update_dashboard');
  }, []);

  const runAIAnalysis = async () => {
    setLoading(true);
    setAiResult(null);
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        username: currentUser ? currentUser.username : '',
        nir: parseFloat(sensorData.nir),
        moisture: parseFloat(sensorData.moisture),
        temp: parseFloat(sensorData.temp)
      });

      if (response.data.status === 'success') {
        const brixVal = response.data.brix;
        const predStatus = response.data.prediction_status;
        const harvestDate = response.data.harvest_date;

        setSensorData(prev => ({ ...prev, brix: brixVal.toFixed(2) }));
        syncStatus(brixVal);
        
        // Update user session in localStorage so that it updates instantly
        if (currentUser) {
          const updatedUser = { 
            ...currentUser, 
            brix: brixVal.toFixed(2) + '%', 
            status: predStatus, 
            harvest_date: harvestDate 
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      }
    } catch (error) {
      console.error(error);
      setAiResult({ message: 'Error processing sensor analysis. Verify backend app.py.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="header-bar">
          <div>
            <h1>Field Monitoring</h1>
            <p className="node-info">
              Grower ID: <b>#SC-{1000 + (currentUser?.id || 1)}</b> | 
              Name: <b>{currentUser ? currentUser.name : 'Farmer'}</b> | 
              Variety: <b>{currentUser ? currentUser.variety : 'Co 86032'}</b> |
              Area: <b>{currentUser ? currentUser.area : 'N/A'}</b>
            </p>
          </div>
          <div className="ai-badge">● AI PREDICTION LIVE</div>
        </header>

        <div className="sensor-grid">
          <div className="card brix-card">
            <span className="label">Sugar Level (Brix Value)</span>
            <div className="value">{sensorData.brix}%</div>
            <p className="status-tag">Status: {status}</p>
          </div>

          <div className="card hardware-card">
            <span className="label">Hardware Status</span>
            <div className="hw-status-container">
              <div className="hw-status-dot active"></div>
              <span className="hw-node-name">ESP32-NODE-01</span>
            </div>
            <a 
              href="http://192.168.4.1" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hw-monitor-btn-modern"
            >
              📡 Live ESP32 Monitor
            </a>
          </div>

          <div className="card">
            <span className="label">NIR Sensor (HW11)</span>
            <div className="value">{sensorData.nir} nm</div>
            <p className="sub-label">Spectral Reflectance</p>
          </div>

          <div className="card">
            <span className="label">Soil Moisture</span>
            <div className="value">{sensorData.moisture}%</div>
            <p className="sub-label">Capacitive Sensor</p>
          </div>

          <div className="card">
            <span className="label">DHT-11 Temp</span>
            <div className="value">{sensorData.temp}°C</div>
            <p className="sub-label">Environmental Sensor</p>
          </div>
        </div>

        <section className="ai-section">
          <h3>AI Quality Analyzer</h3>
          <p>Process your spectral readings through the deep learning model to predict sugarcane maturity.</p>
          
          {!loading ? (
            <button className="ai-btn" onClick={runAIAnalysis}>Run AI Analysis</button>
          ) : (
            <div className="loader" style={{ margin: '15px auto' }}></div>
          )}

          {aiResult && (
            <div className={`result-msg ${aiResult.type}`}>
              {aiResult.message}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
