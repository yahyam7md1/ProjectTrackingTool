import axios, { AxiosRequestConfig } from 'axios';

// Create a base axios instance with minimal configuration
const baseApiService = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the current authentication headers from localStorage
 * This function will be called for each API request to ensure the most recent token is used
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Response interceptor for centralized error handling
baseApiService.interceptors.response.use(
  (response) => {
    // Handle multi-status responses (207) as successful but with partial failures
    if (response.status === 207) {
      console.warn(`Partial success on ${response.config?.url || 'unknown endpoint'}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Log API errors centrally
    console.error(`API Error on ${error.config?.url || 'unknown endpoint'}:`, error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error("Unauthorized API request:", error.config?.url);
      
      // You could add additional logic here like refreshing the token
      // or redirecting to login if needed
    } else if (error.response?.status === 400 && error.response?.data?.validationError) {
      console.warn("Validation error:", error.response.data.error);
    }
    
    return Promise.reject(error);
  }
);

/**
 * API service with dynamic auth token injection
 * Each method retrieves the latest token from localStorage at call time
 */
const apiService = {
  /**
   * Perform a GET request with the latest auth token
   */
  get: (url: string, config: AxiosRequestConfig = {}) => 
    baseApiService.get(url, { 
      ...config, 
      headers: { 
        ...getAuthHeaders(), 
        ...config.headers 
      } 
    }),
  
  /**
   * Perform a POST request with the latest auth token
   */
  post: (url: string, data?: any, config: AxiosRequestConfig = {}) => 
    baseApiService.post(url, data, { 
      ...config, 
      headers: { 
        ...getAuthHeaders(), 
        ...config.headers 
      } 
    }),
  
  /**
   * Perform a PUT request with the latest auth token
   */
  put: (url: string, data?: any, config: AxiosRequestConfig = {}) => 
    baseApiService.put(url, data, { 
      ...config, 
      headers: { 
        ...getAuthHeaders(), 
        ...config.headers 
      } 
    }),
  
  /**
   * Perform a DELETE request with the latest auth token
   */
  delete: (url: string, config: AxiosRequestConfig = {}) => 
    baseApiService.delete(url, { 
      ...config, 
      headers: { 
        ...getAuthHeaders(), 
        ...config.headers 
      } 
    }),
};

export default apiService;
