// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // The vite proxy will redirect this to http://localhost:8000/api/test
    axios.get('/api/suha')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        setMessage('Failed to connect to backend.');
        console.error('API Error:', error);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-3xl font-bold text-slate-700 p-8 bg-white rounded-lg shadow-md">
        {message}
      </h1>
    </div>
  );
}

export default App;