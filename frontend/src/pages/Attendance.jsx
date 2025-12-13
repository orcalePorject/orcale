import React, { useState, useEffect } from 'react';
import { Calendar, UserCheck, Users, Check, X } from 'lucide-react';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchMembers();
    fetchTodayAttendance();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/members/active');
      const data = await response.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/today');
      const data = await response.json();
      if (data.success) {
        const attendanceMap = {};
        data.data.forEach(item => {
          attendanceMap[item.MEMBER_ID] = item.IS_PRESENT === 1;
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (memberId, isPresent) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          is_present: isPresent ? 1 : 0
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setAttendance(prev => ({
          ...prev,
          [memberId]: isPresent
        }));
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(v => v).length;
  const absentCount = Object.values(attendance).filter(v => !v).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-gray-600">Mark attendance for today</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold mt-2">{members.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Present Today</p>
              <p className="text-2xl font-bold mt-2 text-green-600">{presentCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Absent Today</p>
              <p className="text-2xl font-bold mt-2 text-red-600">{absentCount}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Today's Attendance</h2>
          <button
            onClick={() => {
              // Mark all present
              members.forEach(member => {
                markAttendance(member.M_ID, true);
              });
            }}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Mark All Present'}
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Member</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.M_ID} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">
                          {member.F_NAME} {member.L_NAME}
                        </p>
                        <p className="text-sm text-gray-500">ID: {member.M_ID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{member.PHONE}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      attendance[member.M_ID] 
                        ? 'bg-green-100 text-green-800'
                        : attendance[member.M_ID] === false
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {attendance[member.M_ID] === true ? 'Present' : 
                       attendance[member.M_ID] === false ? 'Absent' : 'Not Marked'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => markAttendance(member.M_ID, true)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          attendance[member.M_ID] === true
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        disabled={loading}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => markAttendance(member.M_ID, false)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          attendance[member.M_ID] === false
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                        disabled={loading}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;