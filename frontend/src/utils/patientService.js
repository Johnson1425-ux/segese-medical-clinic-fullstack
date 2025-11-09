import api from '../utils/api.js';

export const patientService = {
  // Get all patients
  getAllPatients: async (params = {}) => {
    const response = await api.get('/patients', { params });
    return response.data;
  },

  // Get patient by ID
  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Create new patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients', patientData);
    return response.data;
  },

  // Update patient
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },

  // Delete patient
  deletePatient: async (id) => {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  },

  // Search patients - updated to accept search parameters
  searchPatients: async (searchParams = {}) => {
    const queryParams = new URLSearchParams();
    
    // Handle basic search query
    if (searchParams.q) {
      queryParams.append('q', searchParams.q);
    }
    
    // Handle pagination
    if (searchParams.page) {
      queryParams.append('page', searchParams.page);
    }
    
    if (searchParams.limit) {
      queryParams.append('limit', searchParams.limit);
    }

    const queryString = queryParams.toString();
    const url = `/patients/search${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }
};