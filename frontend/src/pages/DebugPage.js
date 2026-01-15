import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DebugPage = () => {
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL);
  const [healthCheck, setHealthCheck] = useState('Loading...');
  const [apiTest, setApiTest] = useState('Not tested');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log('Testing backend connection to:', backendUrl);
      
      // Test health endpoint
      const healthResponse = await fetch(`${backendUrl}/health`);
      const healthData = await healthResponse.text();
      setHealthCheck(`✅ Health: ${healthData}`);
      
      // Test API endpoint
      const apiResponse = await fetch(`${backendUrl}/api/volunteer-opportunities`);
      const apiData = await apiResponse.text();
      setApiTest(`✅ API: ${apiData.substring(0, 100)}...`);
      
    } catch (error) {
      console.error('Connection test failed:', error);
      setHealthCheck(`❌ Health Error: ${error.message}`);
      setApiTest(`❌ API Error: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 North Star Foundation Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Check:</h3>
        <p><strong>REACT_APP_BACKEND_URL:</strong> {backendUrl || 'NOT SET'}</p>
        <p><strong>Current Domain:</strong> {window.location.origin}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Backend Connection Test:</h3>
        <p>{healthCheck}</p>
        <p>{apiTest}</p>
        <button onClick={testConnection} style={{ padding: '10px', margin: '10px 0' }}>
          🔄 Test Connection Again
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Manual Tests:</h3>
        <p>1. Health: <a href={`${backendUrl}/health`} target="_blank" rel="noopener noreferrer">{backendUrl}/health</a></p>
        <p>2. API: <a href={`${backendUrl}/api/volunteer-opportunities`} target="_blank" rel="noopener noreferrer">{backendUrl}/api/volunteer-opportunities</a></p>
      </div>
      
      <div>
        <h3>Console Output:</h3>
        <p>Check browser console (F12) for detailed error messages</p>
      </div>
    </div>
  );
};

export default DebugPage;