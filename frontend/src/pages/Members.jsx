import  { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Eye,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Members = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  // This function should be inside the component, before the useEffect
  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/members';
      const params = [];
      
      if (statusFilter) {
        params.push(`status=${statusFilter}`);
      }
      
      if (searchTerm && searchTerm.trim().length >= 2) {
        params.push(`search=${encodeURIComponent(searchTerm.trim())}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      console.log('Fetching members from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data);
        toast.success(`Found ${data.count} members`);
      } else {
        toast.error(data.error || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Load members on component mount
  useEffect(() => {
    fetchAllMembers();
  }, []); // Empty dependency array means run once on mount

  // Handler for search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAllMembers();
  };

  // Handler for status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Handler for refresh
  const handleRefresh = () => {
    fetchAllMembers();
  };

  // Handler for mark attendance
  const handleMarkAttendance = async (memberId, memberName) => {
    try {
      const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          is_present: 1
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Attendance marked for ${memberName}`);
      } else {
        toast.error(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  // Handler for record payment
  const handleRecordPayment = (memberId, memberName) => {
    navigate(`/payments/process?member=${memberId}&name=${encodeURIComponent(memberName)}`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Members</h1>
          <p className="text-gray-600 mt-1">Manage all gym members and their subscriptions</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center space-x-2 btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/members/register"
            className="flex items-center justify-center space-x-2 btn-primary"
          >
            <Plus size={20} />
            <span>Register New Member</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search members by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </form>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
            
            <button
              onClick={fetchAllMembers}
              className="flex items-center justify-center space-x-2 btn-primary"
              disabled={loading}
            >
              <Filter size={20} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="showInactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded"
          />
          <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700">
            Show inactive members
          </label>
        </div>
      </div>

      {/* Members Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Members ({members.length})
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            Showing {members.filter(m => showInactive || m.STATUS === 'ACTIVE').length} members
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : members.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Member</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Join Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Subscription</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members
                  .filter(member => showInactive || member.STATUS === 'ACTIVE')
                  .map((member) => (
                  <tr key={member.M_ID} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-primary-600">
                            {member.F_NAME?.[0]}{member.L_NAME?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {member.F_NAME} {member.L_NAME}
                          </p>
                          <p className="text-sm text-gray-500">ID: {member.M_ID}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{member.PHONE}</span>
                        </div>
                        {member.EMAIL && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm truncate">{member.EMAIL}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {formatDate(member.JOIN_DATE)}
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.STATUS === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : member.STATUS === 'INACTIVE'
                          ? 'bg-gray-100 text-gray-800'
                          : member.STATUS === 'SUSPENDED'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.STATUS}
                      </span>
                    </td>
                    <td className="table-cell">
                      {member.SUBSCRIPTION_END ? (
                        <div>
                          <div className="text-sm font-medium">{member.PLAN_CODE}</div>
                          <div className="text-xs text-gray-500">
                            Until: {formatDate(member.SUBSCRIPTION_END)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No subscription</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/members/${member.M_ID}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Member"
                          onClick={() => {
                            // Implement edit functionality
                            toast.info('Edit feature coming soon!');
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Mark Attendance"
                          onClick={() => handleMarkAttendance(member.M_ID, `${member.F_NAME} ${member.L_NAME}`)}
                        >
                          <UserCheck size={18} />
                        </button>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Record Payment"
                          onClick={() => handleRecordPayment(member.M_ID, `${member.F_NAME} ${member.L_NAME}`)}
                        >
                          <CreditCard size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No members found' : 'No members yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search terms'
                : 'Get started by registering your first member'}
            </p>
            {!searchTerm && !statusFilter && (
              <Link
                to="/members/register"
                className="inline-flex items-center space-x-2 btn-primary"
              >
                <Plus size={20} />
                <span>Register First Member</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;