import React from 'react';
import Sidebar from './Sidebar';
import './SensorHealth.css';

function SensorHealth() {
  const sensors = [
    {
      name: "NIR",
      status: "online",
      address: "0x49",
      wavelength: "610nm-860nm",
      state: "Calibrated",
      voltage: "3.3V VCC",
      health: 100
    },
    {
      name: "DHT-11",
      status: "online",
      address: "0x76/0x77",
      interface: "SDA/SCL",
      dataStream: "Healthy",
      voltage: "3.3V VCC",
      health: 100
    },
    {
      name: "Soil Moisture",
      status: "online",
      pinMode: "Analog ADC",
      pinAssigned: "GPIO 34",
      type: "Capacitive",
      voltage: "5.0V VCC",
      health: 100
    },
    {
      name: "ESP32 Controller",
      status: "online",
      coreTemp: "38.5°C",
      memory: "124 KB Free",
      flashMode: "DIO",
      wifi: "-58dBm",
      health: 92,
      progressColor: "#60a5fa"
    }
  ];

  return (
    <div className="dashboard-container dark-theme">
      <Sidebar />
      <main className="main-content">
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Hardware Peripheral Health</h1>
            <p style={{ color: '#94a3b8' }}>Real-time diagnostics for ESP32</p>
          </div>
          <a 
            href="http://192.168.4.1" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              textDecoration: 'none', 
              background: '#facc15', 
              color: '#000', 
              padding: '8px 15px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: '600' 
            }}
          >
            📡 Open Hardware Monitor
          </a>
        </div>

        <div className="sensor-grid">
          {sensors.map((sensor, index) => (
            <div className="sensor-card" key={index}>
              <div className="status-header">
                <h3>{sensor.name}</h3>
                <span className={`badge ${sensor.status}`}>{sensor.status}</span>
              </div>
              <div className="technical-info">
                {sensor.address && <div className="info-row"><span>I2C Address:</span> <b>{sensor.address}</b></div>}
                {sensor.wavelength && <div className="info-row"><span>Wavelength:</span> <b>{sensor.wavelength}</b></div>}
                {sensor.state && <div className="info-row"><span>Status:</span> <b>{sensor.state}</b></div>}
                {sensor.interface && <div className="info-row"><span>Interface:</span> <b>{sensor.interface}</b></div>}
                {sensor.dataStream && <div className="info-row"><span>Data Stream:</span> <b>{sensor.dataStream}</b></div>}
                {sensor.pinMode && <div className="info-row"><span>Pin Mode:</span> <b>{sensor.pinMode}</b></div>}
                {sensor.pinAssigned && <div className="info-row"><span>Pin Assigned:</span> <b>{sensor.pinAssigned}</b></div>}
                {sensor.type && <div className="info-row"><span>Type:</span> <b>{sensor.type}</b></div>}
                {sensor.coreTemp && <div className="info-row"><span>Core Temp:</span> <b>{sensor.coreTemp}</b></div>}
                {sensor.memory && <div className="info-row"><span>Memory:</span> <b>{sensor.memory}</b></div>}
                {sensor.flashMode && <div className="info-row"><span>Flash Mode:</span> <b>{sensor.flashMode}</b></div>}
                
                <div className="voltage-tag">{sensor.voltage || `📶 WiFi: ${sensor.wifi}`}</div>
              </div>
              <div className="progress-mini">
                <div 
                  className="progress-bar" 
                  style={{ width: `${sensor.health}%`, background: sensor.progressColor || '#4CAF50' }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="logic-info">
          <h4>Hardware Connection Logic</h4>
          <p>
            All sensors are interfaced with the <b>ESP-32</b>. 
            NIR and DHT-11 utilize the <b>I2C Bus</b>, 
            while the soil probe uses the <b>ADC Channel</b> for analog readings.
          </p>
        </div>
      </main>
    </div>
  );
}

export default SensorHealth;
