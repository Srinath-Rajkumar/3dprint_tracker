import axios from 'axios';
const API_URL = 'http://localhost:5001/api/auth'; // Set this in .env

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  if (response.data.token) {
    // localStorage.setItem('userInfo', JSON.stringify(response.data)); // Moved to AuthContext
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('selectedProfile'); // also clear profile
};

const initialAdminSetup = async (adminData, token) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL}/admin-setup`, adminData, config);
    return response.data;
};

// Add other auth related API calls like register, updateProfile etc.

export default { login, logout, initialAdminSetup };