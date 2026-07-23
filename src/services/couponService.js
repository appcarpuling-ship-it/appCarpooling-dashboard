import api from './api';

const BASE = '/coupons';

export const getAll = async () => {
  const response = await api.get(BASE);
  return response.data;
};

export const create = async (couponData) => {
  const response = await api.post(BASE, couponData);
  return response.data;
};

export const update = async (id, couponData) => {
  const response = await api.put(`${BASE}/${id}`, couponData);
  return response.data;
};

export const toggleStatus = async (id) => {
  const response = await api.patch(`${BASE}/${id}/toggle-status`);
  return response.data;
};

export const remove = async (id) => {
  const response = await api.delete(`${BASE}/${id}`);
  return response.data;
};

export default {
  getAll,
  create,
  update,
  toggleStatus,
  remove,
};
