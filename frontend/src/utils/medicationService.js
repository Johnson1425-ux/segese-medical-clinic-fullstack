import api from './api';

export const medicationService = {
  getAll: async () => {
    const response = await api.get('/medications');
    return response.data;
  },
};