import api from './api';

export const userService = {
  // Get all users with pagination
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get a single user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create a new user (uses the auth register route)
  createUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Update a user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete a user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  // Toggle user's active status
  toggleUserStatus: async (id) => {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data;
  }
};