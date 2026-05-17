import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Sidebar from './Sidebar';
import './HistoricalData.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      min: 10,
      max: 24,
      title: { display: true, text: 'Sugar Content (Brix %)' }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (item) => ` Brix: ${item.raw}%`
      }
    }
  }
};

function HistoricalData() {
  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);

    const fetchHistory = async () => {
      try {
        if (!user.username) {
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:5000/api/history/${user.username}`);
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setHistoryLogs(data.history);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Prepare chart data dynamically based on the last 7 scans
  // We reverse the slice so that chronologically oldest is on the left and newest is on the right
  const chartLogs = [...historyLogs].slice(0, 7).reverse();

  const chartLabels = chartLogs.length > 0
    ? chartLogs.map(log => {
        // extract HH:MM or date
        const parts = log.timestamp.split(' ');
        return parts[1] || log.timestamp;
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const brixDataValues = chartLogs.length > 0
    ? chartLogs.map(log => parseFloat(log.brix || '0'))
    : [14.2, 16.5, 15.1, 18.2, 16.8, 19.5, 18.9];

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Brix Content (%)',
      data: brixDataValues,
      borderColor: '#1b5e20',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 8,
      pointHoverRadius: 10,
      pointBackgroundColor: (context) => {
        const index = context.dataIndex;
        if (index === 0) return '#1b5e20';
        const value = context.dataset.data[index];
        const prev = context.dataset.data[index - 1] || value;
        return value >= prev ? '#4CAF50' : '#d32f2f'; // green on upward, red on downward
      }
    }]
  };

  const handleExportCSV = () => {
    if (historyLogs.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    // Create CSV content
    const headers = ["Date & Time", "Brix (%)", "NIR (nm)", "Soil Moisture (%)", "Temperature (C)", "AI Quality Result"];
    const rows = historyLogs.map(log => [
      log.timestamp,
      log.brix,
      log.nir,
      `${log.moisture}%`,
      log.temp,
      log.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentUser?.username || 'farmer'}_sugarcane_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1>Historical Quality Trends</h1>
            <p style={{ color: '#666' }}>
              Brix Momentum Tracking for <b>{currentUser ? currentUser.name : 'Grower'}</b>
            </p>
          </div>
          <button className="btn-export" onClick={handleExportCSV}>Download CSV Report</button>
        </div>

        <div className="chart-container">
          <h3 style={{ marginBottom: '15px' }}>Brix Volatility (Last 7 Runs)</h3>
          <div style={{ height: '350px' }}>
            <Line data={chartData} options={options} />
          </div>
        </div>

        <div className="table-container">
          <h3>Detailed Sensor Logs</h3>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="loader"></div>
            </div>
          ) : historyLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <h3>No analysis logs recorded yet</h3>
              <p>Go to the Live Dashboard and click "Run AI Analysis" to add logs here!</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Brix (%)</th>
                  <th>NIR (nm)</th>
                  <th>Soil Moist.</th>
                  <th>Temp (°C)</th>
                  <th>AI Result</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestamp}</td>
                    <td><strong>{log.brix}</strong></td>
                    <td>{log.nir} nm</td>
                    <td>{log.moisture}%</td>
                    <td>{log.temp}°C</td>
                    <td>
                      <span className={`status-badge ${log.status === 'Ready to Harvest' ? 'good' : 'wait'}`}>
                        {log.status === 'Ready to Harvest' ? 'Ready' : 'In Growth'}
                      </span>
                    </td>
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

export default HistoricalData;
