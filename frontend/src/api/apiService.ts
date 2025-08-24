import axios from 'axios';

// Create an axios instance with custom configuration
const apiService = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to every request
apiService.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor could be added here if needed
// For example, to handle 401 unauthorized errors, refresh tokens, etc.

export default apiService;
