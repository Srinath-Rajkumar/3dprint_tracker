// frontend/src/services/dashboardService.js (New File)
import axios from 'axios';

const API_URL = '/api/dashboard'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

const getSummary = async () => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_URL}/summary`, config);
  return data;
};

export default { getSummary };