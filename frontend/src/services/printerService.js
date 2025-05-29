// frontend/src/services/printerService.js
import axios from 'axios';

const API_URL = '/api/printers'; // Proxied

const getAuthHeaders = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
};

// For FormData, axios sets Content-Type automatically
const getAuthHeadersForFormData = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo && userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
    // Don't set Content-Type: 'multipart/form-data' here, let axios handle it
};


const getAllPrinters = async () => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(API_URL, config);
  return data;
};

const getPrinterById = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.get(`${API_URL}/${id}`, config);
  return data;
};

// printerData should be FormData if it includes an image
const createPrinter = async (printerData) => {
  const config = { headers: getAuthHeadersForFormData() };
  const { data } = await axios.post(API_URL, printerData, config);
  return data;
};

// printerData should be FormData if it includes an image
const updatePrinter = async (id, printerData) => {
  const config = { headers: getAuthHeadersForFormData() };
  const { data } = await axios.put(`${API_URL}/${id}`, printerData, config);
  return data;
};

const deletePrinter = async (id) => {
  const config = { headers: getAuthHeaders() };
  const { data } = await axios.delete(`${API_URL}/${id}`, config);
  return data;
};

export default {
  getAllPrinters,
  getPrinterById,
  createPrinter,
  updatePrinter,
  deletePrinter,
};