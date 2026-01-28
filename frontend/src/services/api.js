import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000
});

export const getItems = async () => {
  const { data } = await api.get('/items');
  return data;
};

export const getItemById = async (id) => {
  const { data } = await api.get(`/items/${id}`);
  return data;
};

export const getServerTime = async () => {
  const { data } = await api.get('/time');
  return data;
};

export const getItemBids = async (id, limit = 20) => {
  const { data } = await api.get(`/items/${id}/bids?limit=${limit}`);
  return data;
};

export default api;