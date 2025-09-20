import React, { useState, useEffect } from 'react';

const TestConnectionPage = () => {
  const [backendUrl, setBackendUrl] = useState(process.env.REACT_APP_BACKEND_URL);
  const [healthStatus, setHealthStatus] = useState('Testing...');
  const [apiStatus, setApiStatus] = useState('Testing...');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing backend URL:', backendUrl);
      
      // Test health
      const healthResponse = await fetch(`${backendUrl}/health`);
      const healthData = await healthResponse.text();
      setHealthStatus(`✅ ${healthData}`);
      
      // Test API
      const apiResponse = await fetch(`${backendUrl}/api/student-network`);
      const apiData = await apiResponse.text();
      setApiStatus(`✅ API Response: ${apiData}`);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setHealthStatus(`❌ Health Error: ${error.message}`);
      setApiStatus(`❌ API Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: 'white', color: 'black' }}>
      <h1>🔧 Frontend-Backend Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Configuration:</h3>
        <p><strong>REACT_APP_BACKEND_URL:</strong> {backendUrl || 'NOT SET ❌'}</p>
        <p><strong>Current Domain:</strong> {window.location.origin}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Connection Tests:</h3>
        <p>{healthStatus}</p>
        <p>{apiStatus}</p>
        <button onClick={testConnection} style={{ padding: '10px', margin: '10px 0' }}>
          🔄 Test Again
        </button>
      </div>
      
      <div>
        <h3>Direct Links:</h3>
        <p><a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">Health Check</a></p>
        <p><a href={`${backendUrl}/api/student-network`} target="_blank" rel="noopener noreferrer">Student Network API</a></p>
      </div>
    </div>
  );
};

export default TestConnectionPage;