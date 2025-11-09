import api from './api';

export const dashboardService = {
  /**
   * Fetches general statistics for the admin dashboard.
   */
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};