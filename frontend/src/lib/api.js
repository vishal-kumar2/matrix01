import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const apiClient = axios.create({ baseURL: API_BASE });

// Turns a backend error into a readable message.
export const errorMessage = (err) =>
  err?.response?.data?.error?.message || err?.message || 'Something went wrong';

// Frontend tiles -> backend pricing categories (backend/src/services/pricing.js)
const CATEGORY_MAP = {
  MOBILE_PHONE: 'phone',
  LAPTOP: 'laptop',
  TABLET: 'tablet',
  BATTERY: 'battery',
  CHARGER_CABLE: 'charger',
  SMALL_APPLIANCE: 'other',
  LARGE_APPLIANCE: 'other',
  PERIPHERAL: 'keyboard',
  OTHER: 'other',
};

// Frontend condition options -> backend conditions (WORKING, DAMAGED, DEAD)
const CONDITION_MAP = {
  WORKING: 'WORKING',
  PARTIALLY_WORKING: 'DAMAGED',
  PHYSICALLY_DAMAGED: 'DAMAGED',
  DEAD: 'DEAD',
};

export const toBackendCategory = (c) => CATEGORY_MAP[c] || 'other';
export const toBackendCondition = (c) => CONDITION_MAP[c] || 'DEAD';

// GET /users
export const getUsers = async () => (await apiClient.get('/users')).data;

// GET /users/:id/wallet -> { balance (paise), transactions[] }
export const getWallet = async (userId) => (await apiClient.get(`/users/${userId}/wallet`)).data;

// GET /users/:id/pickups -> flattened for the home screen list
export const getUserPickups = async (userId) => {
  const list = (await apiClient.get(`/users/${userId}/pickups`)).data;
  return list.map((p) => ({
    ...p,
    category: p.item?.category || 'other',
    estimatedValue: p.item?.estimatedValue ?? null,
  }));
};

// Agent endpoints
export const getAgentClusters = async (agentId) => (await apiClient.get(`/agents/${agentId}/clusters`)).data;
export const getCluster = async (clusterId) => (await apiClient.get(`/clusters/${clusterId}`)).data;
export const collectPickup = async (qrToken, agentId) =>
  (await apiClient.post('/collect', { qrToken, agentId })).data;

export default apiClient;
