import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
});

// GET /users/:id/wallet -> Returns balance in paise
export const getWallet = async (userId) => {
  // Mock response
  return {
    balance: 45000, // 45000 paise = ₹450
    transactions: []
  };
};

// GET /users/:id/pickups -> Returns list for the home screen
export const getUserPickups = async (userId) => {
  // Mock response
  return [
    { id: 'pickup_123', category: 'LAPTOP', status: 'POOLED', estimatedValue: 35000, createdAt: new Date().toISOString() },
    { id: 'pickup_456', category: 'MOBILE_PHONE', status: 'AWAITING_VERIFICATION', estimatedValue: null, createdAt: new Date().toISOString() }
  ];
};

export default apiClient;