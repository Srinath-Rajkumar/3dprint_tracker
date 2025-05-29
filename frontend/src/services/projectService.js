// frontend/src/services/projectService.js
import axios from 'axios';

const API_URL = '/api/projects'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

const getAllProjects = async () => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(API_URL, config);
  return data;
};

const getProjectById = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_URL}/${id}`, config);
  return data;
};

const createProject = async (projectData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.post(API_URL, projectData, config);
  return data;
};

const updateProject = async (id, projectData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.put(`${API_URL}/${id}`, projectData, config);
  return data;
};

const deleteProject = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.delete(`${API_URL}/${id}`, config);
  return data;
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};