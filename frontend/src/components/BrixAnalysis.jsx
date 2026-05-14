import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import './BrixAnalysis.css';

function BrixAnalysis() {
  const [brix, setBrix] = useState('');
  const [area, setArea] = useState('');
  const [sugarOutput, setSugarOutput] = useState(null);

  const calculateYield = () => {
    if (brix && area) {
      const estimatedSugar = (parseFloat(area) * 80 * (parseFloat(brix) / 100) * 0.12).toFixed(2);
      setSugarOutput(estimatedSugar);
    } else {
      alert("Please enter both Brix and Area values.");
    }
  };

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="header">
          <h1>🔬 Brix & Quality Analysis</h1>
          <p style={{ color: '#666' }}>Deep dive into regional sugar content metrics</p>
        </div>

        <div className="analysis-grid">
          <div className="card">
            <h3>Sugar Content Trend (%)</h3>
            <p style={{ fontSize: '13px', color: '#777' }}>Tracking average Brix levels across the region for the last 30 days.</p>
            
            <div className="chart-placeholder">
              <p>[ Interactive Brix Trend Chart Loading... ]</p>
            </div>

            <table className="quality-table">
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Current Avg Brix</th>
                  <th>Maturity Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Pune West</td>
                  <td>21.4%</td>
                  <td><span className="grade-high">Premium</span></td>
                  <td>Ready</td>
                </tr>
                <tr>
                  <td>Satara North</td>
                  <td>18.2%</td>
                  <td><span className="grade-med">Average</span></td>
                  <td>Growing</td>
                </tr>
                <tr>
                  <td>Sangli East</td>
                  <td>20.1%</td>
                  <td><span className="grade-high">High</span></td>
                  <td>Harvesting</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card calculator">
            <h3>Quick Yield Predictor</h3>
            <div className="input-field">
              <label>Enter Brix Value (%)</label>
              <input 
                type="number" 
                placeholder="e.g. 19.5" 
                step="0.1" 
                value={brix}
                onChange={(e) => setBrix(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label>Land Area (Acres)</label>
              <input 
                type="number" 
                placeholder="e.g. 10" 
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
            <button className="calc-btn" onClick={calculateYield}>Calculate Estimate</button>

            {sugarOutput && (
              <div className="result-box">
                <p style={{ fontSize: '12px' }}>Estimated Sugar Output</p>
                <h2>{sugarOutput} Tons</h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default BrixAnalysis;
