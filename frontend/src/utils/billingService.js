import api from './api.js';

export const billingService = {
  /**
   * Creates a new invoice.
   * @param {object} invoiceData - The data for the new invoice.
   * @returns {Promise} Axios promise response.
   */
  createInvoice: (invoiceData) => {
    return api.post('/billing/invoices', invoiceData);
  },

  /**
   * Fetches all invoices with optional query parameters.
   * @param {object} params - Query parameters for filtering, pagination, etc.
   * @returns {Promise} Axios promise response.
   */
  getAllInvoices: (params) => {
    return api.get('/billing/invoices', { params });
  },

  /**
   * Fetches a single invoice by its ID.
   * @param {string} id - The ID of the invoice.
   * @returns {Promise} Axios promise response.
   */
  getInvoiceById: (id) => {
    return api.get(`/billing/invoices/${id}`);
  },
  
  /**
   * Adds a payment to an existing invoice.
   * @param {string} invoiceId - The ID of the invoice to pay.
   * @param {object} paymentData - The details of the payment.
   * @returns {Promise} Axios promise response.
   */
  addPayment: (invoiceId, paymentData) => {
    return api.post(`/billing/invoices/${invoiceId}/payments`, paymentData);
  },

  /**
   * Fetches billing statistics.
   * @returns {Promise} Axios promise response.
   */
  getStatistics: () => {
    return api.get('/billing/statistics');
  }
};