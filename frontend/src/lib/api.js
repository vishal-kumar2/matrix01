// src/lib/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWallet = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}/wallet`);
    return res.data;
  } catch (err) {
    console.error('Wallet API Error:', err);
    return { balance: 0 }; // Return zero instead of mock balance
  }
};

export const getUserPickups = async (userId) => {
  try {
    const res = await api.get(`/pickups?userId=${userId}`);
    return res.data;
  } catch (err) {
    console.error('Pickups API Error:', err);
    return []; // Return empty list instead of mock pickups
  }
};