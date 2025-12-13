import API from './api';

export const memberService = {
  // Get all active members
  getActiveMembers: async () => {
    const response = await API.get('/members/active');
    return response.data;
  },
  
  // Register new member
  registerMember: async (memberData) => {
    const response = await API.post('/members/register', memberData);
    return response.data;
  },
  
  // Get member by ID
  getMemberById: async (id) => {
    const response = await API.get(`/members/${id}`);
    return response.data;
  },
  
  // Search members
  searchMembers: async (searchTerm) => {
    const response = await API.get(`/members/search?q=${searchTerm}`);
    return response.data;
  }
};