import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import AdminSidebar from './AdminSidebar';
import './BrixAnalysis.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BrixAnalysis() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calculator states
  const [brix, setBrix] = useState('');
  const [area, setArea] = useState('');
  const [sugarOutput, setSugarOutput] = useState(null);

  const fetchFarmersData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/farmers');
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setFarmers(data.farmers);
      }
    } catch (err) {
      console.error("Error loading farmers for analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmersData();
  }, []);

  const calculateYield = () => {
    if (brix && area) {
      const estimatedSugar = (parseFloat(area) * 80 * (parseFloat(brix) / 100) * 0.12).toFixed(2);
      setSugarOutput(estimatedSugar);
    } else {
      alert("Please enter both Brix and Area values.");
    }
  };

  // Group growers dynamically by location (region)
  const regionsData = {};
  farmers.forEach(farmer => {
    const loc = farmer.location || 'Other Region';
    // Clean brix string to float
    let bVal = 0.0;
    if (farmer.brix) {
      bVal = parseFloat(farmer.brix.replace('%', ''));
    }
    
    if (!regionsData[loc]) {
      regionsData[loc] = { brixSum: 0, count: 0 };
    }
    regionsData[loc].brixSum += bVal;
    regionsData[loc].count += 1;
  });

  const regionsList = Object.keys(regionsData).map(loc => {
    const count = regionsData[loc].count;
    const avgBrix = regionsData[loc].brixSum / count;
    
    let grade = 'Average';
    let gradeClass = 'grade-med';
    if (avgBrix >= 19.0) {
      grade = 'Premium';
      gradeClass = 'grade-high';
    } else if (avgBrix >= 17.0) {
      grade = 'High Quality';
      gradeClass = 'grade-high';
    }

    return {
      region: loc,
      avgBrix: avgBrix.toFixed(1) + '%',
      rawAvg: avgBrix,
      grade,
      gradeClass,
      status: avgBrix >= 19.0 ? 'Harvesting' : 'Ripening',
      count
    };
  });

  // Chart configs
  const chartLabels = regionsList.map(r => r.region);
  const chartDataPoints = regionsList.map(r => r.rawAvg);

  const chartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['No Regions'],
    datasets: [
      {
        label: 'Average Sugar Content (Brix %)',
        data: chartDataPoints.length > 0 ? chartDataPoints : [0],
        backgroundColor: 'rgba(46, 125, 50, 0.7)',
        borderColor: '#2e7d32',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 32
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 25,
        ticks: {
          callback: (value) => `${value}%`,
          font: { family: 'Outfit, sans-serif' }
        },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { font: { family: 'Outfit, sans-serif' } },
        grid: { display: false }
      }
    },
    plugins: {
      legend: {
        labels: { font: { family: 'Outfit, sans-serif', weight: 'bold' } }
      }
    }
  };

  return (
    <div className="dashboard-container admin-theme">
      <AdminSidebar />
      <main className="main-content">
        <div className="directory-header">
          <div>
            <h1>🔬 Brix & Quality Analysis</h1>
            <p style={{ color: '#666' }}>Real-time dynamic regional sweetness metrics and yield estimation</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '100px 0' }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div className="analysis-grid">
            <div className="card">
              <h3>Sugar Wavelengths by Region</h3>
              <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>
                Comparing dynamic average Brix values computed across registered farmers in each zone.
              </p>
              
              <div className="chart-placeholder" style={{ height: '300px', marginBottom: '30px', position: 'relative' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>

              <table className="quality-table">
                <thead>
                  <tr>
                    <th>Region / Village</th>
                    <th>Growers Registered</th>
                    <th>Current Avg Brix</th>
                    <th>Maturity Grade</th>
                    <th>Maturity Status</th>
                  </tr>
                </thead>
                <tbody>
                  {regionsList.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>
                        No dynamic farmer records found to analyze.
                      </td>
                    </tr>
                  ) : (
                    regionsList.map((item, index) => (
                      <tr key={index}>
                        <td><b>{item.region}</b></td>
                        <td>{item.count} growers</td>
                        <td style={{ color: '#2e7d32' }}><b>{item.brix} {item.avgBrix}</b></td>
                        <td><span className={item.gradeClass}>{item.grade}</span></td>
                        <td>
                          <span className={`badge ${item.status === 'Harvesting' ? 'status-ready' : 'status-growing'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="card calculator" style={{ height: 'fit-content' }}>
              <h3>Quick Yield Predictor</h3>
              <p style={{ fontSize: '13px', color: '#777', marginBottom: '20px' }}>
                Estimate dynamic processed sugar tons based on brix content and farm acreage.
              </p>
              
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
                <div className="result-box" style={{ marginTop: '25px', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '12px', padding: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#2e7d32', margin: 0 }}>Estimated Sugar Yield</p>
                  <h2 style={{ color: '#1b5e20', margin: '8px 0 0 0' }}>{sugarOutput} Tons</h2>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BrixAnalysis;
