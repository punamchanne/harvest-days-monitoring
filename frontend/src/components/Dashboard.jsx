import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import './Dashboard.css';

const socket = io('http://localhost:5000');

function App() {
  const [sensorData, setSensorData] = useState({
    brix: '17.80',
    nir: '620',
    moisture: '48',
    temp: '30.5'
  });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Analyzing...');
  
  const syncStatus = (brixVal) => {
    const b = parseFloat(brixVal);
    if (b >= 19.0) {
      setAiResult({ message: `Optimal Sugar (${b}%)! READY FOR HARVEST.`, type: 'success' });
      setStatus('MATURE (Peak)');
    } else {
      const daysLeft = Math.ceil((20 - b) / 0.15);
      setAiResult({ message: `Sweetness is rising (${b}%). Approx. ${daysLeft} DAYS until peak maturity.`, type: 'warning' });
      setStatus(`RIPENING (~${daysLeft} days)`);
    }
  };

  useEffect(() => {
    socket.on('update_dashboard', (data) => {
      setSensorData(prev => ({ ...prev, ...data }));
      syncStatus(data.brix);
    });

    return () => socket.off('update_dashboard');
  }, []);

  const runAIAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        nir: parseFloat(sensorData.nir),
        moisture: parseFloat(sensorData.moisture),
        temp: parseFloat(sensorData.temp)
      });

      if (response.data.status === 'success') {
        const brixVal = response.data.brix;
        setSensorData(prev => ({ ...prev, brix: brixVal }));
        syncStatus(brixVal);
      }
    } catch (error) {
      setAiResult({ message: 'Backend error. Check app.py console.', type: 'error' });
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
            <p className="node-info">Node: ESP32-dev | Status: Active</p>
          </div>
          <div className="ai-badge">● AI ENGINE CONNECTED</div>
        </header>

        <div className="sensor-grid">
          <div className="card brix-card">
            <span className="label">Predicted Brix (Sugar Content)</span>
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
          <p>Process sensor data through the ML Prediction Engine</p>
          
          {!loading ? (
            <button className="ai-btn" onClick={runAIAnalysis}>Run AI Analysis</button>
          ) : (
            <div className="loader"></div>
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

export default App;
