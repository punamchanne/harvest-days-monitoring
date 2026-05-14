import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const farmers = [
  { user: "vijaykadam@1977", pass: "kadam@123" },
  { user: "mahadevpawar@1944", pass: "pawar@123" },
  { user: "girishtaware@1971", pass: "taware@123" }
];

function Login() {
  const [role, setRole] = useState('farmer');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (role === 'factory') {
      alert("Factory Login Successful");
      navigate('/admin-dashboard');
    } else {
      const isValid = farmers.find(f => f.user === username && f.pass === password);
      if (isValid) {
        alert("Farmer Login Successful");
        navigate('/dashboard');
      } else {
        alert("Invalid Farmer ID or Password");
      }
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${role === 'factory' ? 'factory-mode' : ''}`}>
        <div className="logo-area">
          <h1>{role === 'factory' ? '🏭 Factory Login' : '🌱 Farmer Login'}</h1>
          <p>Sugarcane Yield Prediction System</p>
        </div>

        <div className="role-selector">
          <input 
            type="radio" 
            name="role" 
            id="farmer-role" 
            checked={role === 'farmer'} 
            onChange={() => setRole('farmer')} 
          />
          <input 
            type="radio" 
            name="role" 
            id="admin-role" 
            checked={role === 'factory'} 
            onChange={() => setRole('factory')} 
          />
          
          <label htmlFor="farmer-role">Farmer</label>
          <label htmlFor="admin-role">Factory</label>
          
          <div className="slider"></div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button className="btn-login">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
