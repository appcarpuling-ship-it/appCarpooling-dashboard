import api from './api';

export const newsService = {
  list: async () => {
    const { data } = await api.get('/news/admin/all');
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/news', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/news/${id}`, payload);
    return data;
  },
  toggle: async (id) => {
    const { data } = await api.patch(`/news/${id}/toggle`);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/news/${id}`);
    return data;
  },
};

export default newsService;
