import API from './api';

export const staffService = {
  getAllStaff: async (status) => {
    const response = await API.get('/staff', {
      params: status ? { status } : {}
    });
    return response.data;
  },
  
  getStaffById: async (staffId) => {
    const response = await API.get(`/staff/${staffId}`);
    return response.data;
  },
  
  getStaffAttendance: async (staffId, month, year) => {
    const response = await API.get(`/staff/${staffId}/attendance`, {
      params: { month, year }
    });
    return response.data;
  }
};