// frontend/src/services/trackingService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/tracking'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

// Get all print jobs for a project
const getPrintJobsForProject = async (projectId) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_BASE_URL}/project/${projectId}/jobs`, config);
  return data;
};

// Add a new print job to a project
const addPrintJob = async (projectId, jobData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.post(`${API_BASE_URL}/project/${projectId}/jobs`, jobData, config);
  return data;
};

// Get a single print job by its ID
const getPrintJobById = async (jobId) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, config);
  return data;
};

// Update a print job
const updatePrintJob = async (jobId, jobData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.put(`${API_BASE_URL}/jobs/${jobId}`, jobData, config);
  return data;
};

// Delete a print job
const deletePrintJob = async (jobId) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, config);
  return data;
};

// Reprint a failed job
const reprintFailedJob = async (failedJobId, reprintData) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.post(`${API_BASE_URL}/jobs/${failedJobId}/reprint`, reprintData, config);
  return data;
};


export default {
  getPrintJobsForProject,
  addPrintJob,
  getPrintJobById,
  updatePrintJob,
  deletePrintJob,
  reprintFailedJob,
};