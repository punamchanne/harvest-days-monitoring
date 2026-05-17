import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [role, setRole] = useState('farmer'); // 'farmer' or 'factory'
  const [isRegister, setIsRegister] = useState(false); // Toggle register mode
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [variety, setVariety] = useState('Co 86032');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const baseUrl = 'http://localhost:5000';
    const endpoint = isRegister ? `${baseUrl}/api/register` : `${baseUrl}/api/login`;
    
    const payload = isRegister 
      ? { role, username, password, name, phone, location, area: role === 'farmer' ? `${area} Acres` : '', variety: role === 'farmer' ? variety : '' }
      : { role, username, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isRegister) {
        setSuccessMsg('Registration Successful! Please Sign In.');
        setIsRegister(false);
        setPassword('');
      } else {
        // Login success
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'factory') {
          alert(`Welcome back, ${data.user.name}! Factory Dashboard login successful.`);
          navigate('/admin-dashboard');
        } else {
          alert(`Welcome, ${data.user.name}! Farmer Dashboard login successful.`);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card ${role === 'factory' ? 'factory-mode' : ''} ${isRegister ? 'register-mode' : ''}`}>
        <div className="logo-area">
          <h1>
            {role === 'factory' ? '🏭 Factory ' : '🌱 Farmer '} 
            {isRegister ? 'Registration' : 'Login'}
          </h1>
          <p>Smart Sugarcane Quality Monitoring and Prediction Device</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <input 
            type="radio" 
            name="role" 
            id="farmer-role" 
            checked={role === 'farmer'} 
            onChange={() => {
              setRole('farmer');
              setErrorMsg('');
            }} 
          />
          <input 
            type="radio" 
            name="role" 
            id="admin-role" 
            checked={role === 'factory'} 
            onChange={() => {
              setRole('factory');
              setErrorMsg('');
            }} 
          />
          
          <label htmlFor="farmer-role">Farmer</label>
          <label htmlFor="admin-role">Factory</label>
          
          <div className="slider"></div>
        </div>

        {/* Success/Error Alerts */}
        {errorMsg && <div className="alert-message error">{errorMsg}</div>}
        {successMsg && <div className="alert-message success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="tel" 
                  placeholder="Enter Phone Number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter Location / Village" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required 
                />
              </div>
              
              {role === 'farmer' && (
                <div className="input-group">
                  <input 
                    type="number" 
                    placeholder="Farm Area (in Acres)" 
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    required 
                  />
                </div>
              )}
            </>
          )}

          <div className="input-group">
            <input 
              type="text" 
              placeholder="Choose Username" 
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

          <button className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Register & Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <span onClick={() => { setIsRegister(false); setErrorMsg(''); }}>Sign In here</span>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <span onClick={() => { setIsRegister(true); setErrorMsg(''); }}>Register here</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
