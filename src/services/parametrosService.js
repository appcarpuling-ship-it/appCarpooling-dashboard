import api from './api';

const BASE = '/parametros';

export const getCostoViaje = async () => {
  const response = await api.get(`${BASE}/costo-viaje`);
  return response.data;
};

export const updateCostoViaje = async (data) => {
  const response = await api.put(`${BASE}/costo-viaje`, data);
  return response.data;
};

export const getSupportEmail = async () => {
  const response = await api.get(`${BASE}/support-email`);
  return response.data;
};

export const updateSupportEmail = async (supportEmail) => {
  const response = await api.put(`${BASE}/support-email`, { supportEmail });
  return response.data;
};

export const getSupportWhatsapp = async () => {
  const response = await api.get(`${BASE}/support-whatsapp`);
  return response.data;
};

export const updateSupportWhatsapp = async (supportWhatsapp) => {
  const response = await api.put(`${BASE}/support-whatsapp`, { supportWhatsapp });
  return response.data;
};

export default {
  getCostoViaje,
  updateCostoViaje,
  getSupportEmail,
  updateSupportEmail,
  getSupportWhatsapp,
  updateSupportWhatsapp,
};
