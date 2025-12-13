import API from './api';

export const paymentService = {
  processPayment: async (paymentData) => {
    const response = await API.post('/payments/process', paymentData);
    return response.data;
  },
  
  getMemberPayments: async (memberId) => {
    const response = await API.get(`/payments/member/${memberId}`);
    return response.data;
  },
  
  getAllPayments: async (filters = {}) => {
    const response = await API.get('/payments', { params: filters });
    return response.data;
  }
};