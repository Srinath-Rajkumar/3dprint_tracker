// frontend/src/services/costService.js
import axios from 'axios';

const API_URL = '/api/cost/settings'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

const getCostSettings = async () => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(API_URL, config);
  return data;
};

const updateCostSettings = async (settingsData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.put(API_URL, settingsData, config);
  return data;
};

export default {
  getCostSettings,
  updateCostSettings,
};