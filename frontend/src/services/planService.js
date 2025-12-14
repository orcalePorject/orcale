import API from './api';

export const planService = {
  getAllPlans: async (filters = {}) => {
    const response = await API.get('/membership', { params: filters });
    return response.data;
  },
  
  getPlanByCode: async (planCode) => {
    const response = await API.get(`/membership/${planCode}`);
    return response.data;
  },
  
  createPlan: async (planData) => {
    const response = await API.post('/membership', planData);
    return response.data;
  },
  
  updatePlanStatus: async (planCode, status) => {
    const response = await API.put(`/membership/${planCode}/status`, { is_active: status });
    return response.data;
  },
  
  updatePlan: async (planCode, planData) => {
    const response = await API.put(`/membership/${planCode}`, planData);
    return response.data;
  },
  
  deletePlan: async (planCode) => {
    const response = await API.delete(`/membership/${planCode}`);
    return response.data;
  }
};