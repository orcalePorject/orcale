import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveMembers } from '../store/slices/memberSlice';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { members, loading } = useSelector((state) => state.members);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchActiveMembers());
  }, [dispatch]);

  const stats = [
    {
      title: 'Active Members',
      value: members.length,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Monthly Revenue',
      value: `$${(members.length * 5000).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up',
    },
    {
      title: "Today's Attendance",
      value: Math.floor(members.length * 0.7),
      icon: Activity,
      color: 'bg-purple-500',
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Upcoming Classes',
      value: '8',
      icon: Calendar,
      color: 'bg-orange-500',
      change: '-2%',
      trend: 'down',
    },
  ];

  const recentMembers = members.slice(0, 5);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your gym today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Members</h2>
            <Link to="/members" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : recentMembers.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Phone</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentMembers.map((member) => (
                    <tr key={member.M_ID} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">
                        {member.F_NAME} {member.L_NAME}
                      </td>
                      <td className="table-cell text-gray-500">{member.PHONE}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          member.STATUS === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.STATUS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No members found</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/members/register"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <Users className="h-10 w-10 text-gray-400 group-hover:text-primary-500 mb-3" />
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Register New Member
              </span>
            </Link>
            
            <Link
              to="/classes"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <Calendar className="h-10 w-10 text-gray-400 group-hover:text-primary-500 mb-3" />
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Schedule Class
              </span>
            </Link>
            
            <Link
              to="/payments"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <CreditCard className="h-10 w-10 text-gray-400 group-hover:text-primary-500 mb-3" />
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Record Payment
              </span>
            </Link>
            
            <Link
              to="/attendance"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <Activity className="h-10 w-10 text-gray-400 group-hover:text-primary-500 mb-3" />
              <span className="font-medium text-gray-700 group-hover:text-primary-600">
                Take Attendance
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;