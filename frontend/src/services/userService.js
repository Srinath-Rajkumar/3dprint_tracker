// frontend/src/services/userService.js
import axios from 'axios';

const API_URL = '/api/users'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    return { Authorization: `Bearer ${userInfo.token}` };
  }
  return {};
};

const getAllUsers = async () => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(API_URL, config);
  return data;
};

const getUserById = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_URL}/${id}`, config);
  return data;
};

const createUser = async (userData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.post(API_URL, userData, config);
  return data;
};

const updateUser = async (id, userData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.put(`${API_URL}/${id}`, userData, config);
  return data;
};

const deleteUser = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.delete(`${API_URL}/${id}`, config);
  return data;
};

const changePassword = async (passwordData) => { // For user's own profile
    const config = { headers: getAuthHeaders() };
    // Assuming your backend has an endpoint like /api/auth/profile for password change
    const { data } = await axios.put('/api/auth/profile', passwordData, config);
    return data;
};


export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};