import api from './api.js';

export const productService = {
  /**
   * Fetches all products (medications) for billing.
   * @returns {Promise} Axios promise response.
   */
  getAllProducts: () => {
    return api.get('/products');
  },
};