import axios from 'axios';

const API = axios.create({
  baseURL: 'https://pulse-metrics-saas.onrender.com/api/v1',
});

// Auto-inject JWT token in every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;