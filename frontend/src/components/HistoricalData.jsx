import React from 'react';
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

const logs = [
  { time: "2026-02-03 09:00", brix: "16.8%", nir: "625", moist: "45%", temp: "31.2", res: "Wait" },
  { time: "2026-02-02 14:30", brix: "18.2%", nir: "610", moist: "40%", temp: "33.5", res: "Ready" },
  { time: "2026-02-01 10:15", brix: "15.1%", nir: "630", moist: "55%", temp: "28.8", res: "Wait" },
  { time: "2026-01-31 16:00", brix: "16.5%", nir: "615", moist: "48%", temp: "30.1", res: "Wait" },
  { time: "2026-01-30 08:45", brix: "14.2%", nir: "642", moist: "52%", temp: "28.4", res: "Wait" }
];

const brixDataValues = [14.2, 16.5, 15.1, 18.2, 16.8, 19.5, 18.9];
const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const data = {
  labels: labels,
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
      const prev = context.dataset.data[index - 1];
      return value >= prev ? '#4CAF50' : '#d32f2f';
    }
  }]
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      min: 12,
      max: 22,
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
  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <div className="header">
          <div>
            <h1>Historical Quality Trends</h1>
            <p style={{ color: '#666' }}>Brix Momentum Tracking: Mon - Fri</p>
          </div>
          <button className="btn-export">Download CSV Report</button>
        </div>

        <div className="chart-container">
          <h3 style={{ marginBottom: '15px' }}>Weekly Brix Volatility</h3>
          <div style={{ height: '350px' }}>
            <Line data={data} options={options} />
          </div>
        </div>

        <div className="table-container">
          <h3>Detailed Sensor Logs</h3>
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
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.time}</td>
                  <td><strong>{log.brix}</strong></td>
                  <td>{log.nir} nm</td>
                  <td>{log.moist}</td>
                  <td>{log.temp}°C</td>
                  <td>
                    <span className={`status-badge ${log.res === 'Ready' ? 'good' : 'wait'}`}>
                      {log.res}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default HistoricalData;
