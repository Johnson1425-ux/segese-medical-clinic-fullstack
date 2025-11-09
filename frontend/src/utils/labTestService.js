import api from './api';

export const labTestService = {
  getAll: async () => {
    const response = await api.get('/lab-tests');
    return response.data;
  },
};