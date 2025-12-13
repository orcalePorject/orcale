import API from './api';

export const attendanceService = {
  markAttendance: async (memberId, isPresent) => {
    const response = await API.post('/attendance/mark', {
      member_id: memberId,
      is_present: isPresent ? 1 : 0
    });
    return response.data;
  },
  
  getTodayAttendance: async () => {
    const response = await API.get('/attendance/today');
    return response.data;
  },
  
  getAttendanceReport: async (startDate, endDate) => {
    const response = await API.get('/attendance/report', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }
};