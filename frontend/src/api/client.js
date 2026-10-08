import axios from 'axios';

const apiClient = axios.create({
  // Vite uses import.meta.env instead of process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;