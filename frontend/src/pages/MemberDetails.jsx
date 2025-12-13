import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Calendar, CreditCard, 
  Activity, Edit, ArrowLeft, CheckCircle, XCircle 
} from 'lucide-react';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchMemberDetails();
    fetchPayments();
    fetchAttendance();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/members/${id}`);
      const data = await response.json();
      if (data.success) {
        setMember(data.data);
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/member/${id}`);
      const data = await response.json();
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/attendance/today`);
      const data = await response.json();
      if (data.success) {
        const memberAttendance = data.data.filter(a => a.MEMBER_ID === parseInt(id));
        setAttendance(memberAttendance);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Member not found</h3>
          <button
            onClick={() => navigate('/members')}
            className="mt-4 btn-primary"
          >
            Back to Members
          </button>
        </div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.AMOUNT || 0), 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/members')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {member.F_NAME} {member.L_NAME}
            </h1>
            <p className="text-gray-600">Member ID: {member.M_ID}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            member.STATUS === 'ACTIVE' 
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {member.STATUS}
          </span>
          <button className="flex items-center space-x-2 btn-secondary">
            <Edit size={20} />
            <span>Edit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <div className="mt-1 flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {member.F_NAME} {member.L_NAME}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <div className="mt-1 flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{member.PHONE}</span>
                </div>
              </div>
              
              {member.EMAIL && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{member.EMAIL}</span>
                  </div>
                </div>
              )}
              
              {member.DOB && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{member.DOB}</span>
                  </div>
                </div>
              )}
              
              {member.ADDRESS && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <div className="mt-1 flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <span className="text-gray-900">{member.ADDRESS}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payments History */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
            
            {payments.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Description</th>
                      <th className="table-header">Received By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map(payment => (
                      <tr key={payment.PAYMENT_ID}>
                        <td className="table-cell">{payment.PAYMENT_DATE}</td>
                        <td className="table-cell font-medium">
                          ${parseFloat(payment.AMOUNT).toLocaleString()}
                        </td>
                        <td className="table-cell">{payment.DESCRIPTION}</td>
                        <td className="table-cell">{payment.RECEIVED_BY_NAME || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No payment history found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Membership Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Membership Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p className="font-medium">{member.JOIN_DATE}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="font-medium">{member.CREATED_BY_NAME || 'System'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/payments/process?member=${id}`)}
                className="w-full flex items-center justify-center space-x-2 btn-primary"
              >
                <CreditCard size={20} />
                <span>Record Payment</span>
              </button>
              
              <button
                onClick={() => {
                  // Mark attendance
                  fetch(`http://localhost:5000/api/attendance/mark`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      member_id: id,
                      is_present: 1
                    })
                  }).then(() => fetchAttendance());
                }}
                className="w-full flex items-center justify-center space-x-2 btn-secondary"
              >
                <CheckCircle size={20} />
                <span>Mark Present</span>
              </button>
              
              <button
                onClick={() => {
                  fetch(`http://localhost:5000/api/attendance/mark`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      member_id: id,
                      is_present: 0
                    })
                  }).then(() => fetchAttendance());
                }}
                className="w-full flex items-center justify-center space-x-2 btn-secondary"
              >
                <XCircle size={20} />
                <span>Mark Absent</span>
              </button>
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h2>
            {attendance.length > 0 ? (
              <div className="space-y-2">
                {attendance.map(record => (
                  <div key={record.ATT_DATE} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{record.ATT_DATE}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.IS_PRESENT === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.IS_PRESENT === 1 ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No attendance record for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;