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

export default {
  getCostoViaje,
  updateCostoViaje,
};
