import  { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, 
  Eye, Phone, Mail, Briefcase, Calendar, UserCheck,
  DollarSign, Lock, Unlock, Save, X, UserPlus,
  RefreshCw, CheckCircle, XCircle, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import EditStaffModal from '../components/EditStaffModal';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  
  // Handle edit button click
  const handleEditClick = (staffMember) => {
    setEditingStaff(staffMember);
    setIsEditModalOpen(true);
  };

  // Handle save staff
  const handleSaveStaff = async (formData) => {
    if (!editingStaff) return;
    
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${editingStaff.STAFF_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Staff updated successfully!');
        setIsEditModalOpen(false);
        setEditingStaff(null);
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to update staff');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff');
    } finally {
      setSaving(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStaff(null);
  };
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    role: 'RECEPTION',
    username: '',
    password: '',
    salary: '',
    status: 'ACTIVE'
  });

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/staff';
      const params = [];
      
      if (statusFilter) {
        params.push(`status=${statusFilter}`);
      }
      
      if (searchTerm && searchTerm.trim().length >= 2) {
        // Note: You might need to add search functionality to backend
        // For now, we'll filter client-side
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setStaff(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [statusFilter]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.username) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Staff added successfully!');
        setShowAddForm(false);
        setFormData({
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          role: 'RECEPTION',
          username: '',
          password: '',
          salary: '',
          status: 'ACTIVE'
        });
        fetchStaff();
      } else {
        toast.error(data.error || 'Failed to add staff');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateStaff = async (staffId) => {
  //   try {
  //     setLoading(true);
  //     const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(formData)
  //     });
      
  //     const data = await response.json();
      
  //     if (data.success) {
  //       toast.success('Staff updated successfully!');
  //       setEditingId(null);
  //       fetchStaff();
  //     } else {
  //       toast.error(data.error || 'Failed to update staff');
  //     }
  //   } catch (error) {
  //     console.error('Error updating staff:', error);
  //     toast.error('Failed to update staff');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

const handleDeleteStaff = async (staffId, staffName) => {
  if (!window.confirm(`Are you sure you want to delete ${staffName}?\n\nThis will:\n1. Remove their references from payments\n2. Remove their references from members\n3. Delete their attendance records\n4. Permanently delete the staff record`)) return;
  
  try {
    setLoading(true);
    
    const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    console.log('Delete response:', data);
    
    if (data.success) {
      // Check if it was actually deleted or just marked inactive
      if (data.data?.action === 'marked_inactive') {
        toast.success(
          <div>
            <p className="font-semibold">Staff Marked as INACTIVE</p>
            <p className="text-sm">Staff member could not be permanently deleted due to database constraints, but has been marked as INACTIVE.</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.success(data.message || 'Staff deleted successfully!');
      }
      
      fetchStaff(); // Refresh the list
      
    } else {
      // Show detailed error
      toast.error(
        <div>
          <p className="font-semibold">Delete Failed</p>
          <p className="text-sm">{data.error}</p>
          <button
            onClick={() => handleMarkInactive(staffId, staffName)}
            className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm underline"
          >
            Mark as INACTIVE Instead
          </button>
        </div>,
        { duration: 6000 }
      );
    }
  } catch (error) {
    console.error('Error deleting staff:', error);
    toast.error(`Network error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

// Add function to mark as inactive
const handleMarkInactive = async (staffId, staffName) => {
  if (!window.confirm(`Mark ${staffName} as INACTIVE instead?`)) return;
  
  try {
    setLoading(true);
    
    const response = await fetch(`http://localhost:5000/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INACTIVE' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success(`Staff marked as INACTIVE`);
      fetchStaff();
    } else {
      toast.error(data.error || 'Failed to mark as inactive');
    }
  } catch (error) {
    console.error('Error marking inactive:', error);
    toast.error(`Failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleMarkAttendance = async (staffId, staffName, isPresent) => {
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${staffId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_present: isPresent })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Marked ${staffName} as ${isPresent ? 'Present' : 'Absent'}`);
      } else {
        toast.error(data.error || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  // const handleEditClick = (staffMember) => {
  //   setEditingId(staffMember.STAFF_ID);
  //   setFormData({
  //     first_name: staffMember.FIRST_NAME,
  //     last_name: staffMember.LAST_NAME,
  //     phone: staffMember.PHONE,
  //     email: staffMember.EMAIL || '',
  //     role: staffMember.ROLE,
  //     username: staffMember.USERNAME,
  //     password: '', // Don't show current password
  //     salary: staffMember.SALARY || '',
  //     status: staffMember.STATUS
  //   });
  // };

  const handleViewDetails = (staffMember) => {
    setSelectedStaff(staffMember);
  };

  

  const roles = ['ADMIN', 'RECEPTION', 'CLEANER', 'MANAGER', 'TRAINER'];

  return (
    <div className="p-6">

         <EditStaffModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        staff={editingStaff}
        onSave={handleSaveStaff}
        loading={saving}
      />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage all gym staff members</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={fetchStaff}
            className="flex items-center justify-center space-x-2 btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center space-x-2 btn-primary"
          >
            <UserPlus size={20} />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
            
            <button
              onClick={() => {
                // Implement export functionality
                toast.info('Export feature coming soon!');
              }}
              className="flex items-center justify-center space-x-2 btn-secondary"
            >
              <Download size={20} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Staff Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Add New Staff</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddStaff} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="John"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="johndoe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary ($)
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Staff Members ({staff.length})
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            {staff.filter(s => s.STATUS === 'ACTIVE').length} active staff
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : staff.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Staff Member</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Hire Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map(staffMember => (
                  <tr key={staffMember.STAFF_ID} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {staffMember.FIRST_NAME} {staffMember.LAST_NAME}
                          </p>
                          <p className="text-sm text-gray-500">ID: {staffMember.STAFF_ID}</p>
                          {staffMember.USERNAME && (
                            <p className="text-xs text-gray-500">@{staffMember.USERNAME}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">{staffMember.PHONE}</span>
                        </div>
                        {staffMember.EMAIL && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm truncate">{staffMember.EMAIL}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staffMember.ROLE === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800'
                          : staffMember.ROLE === 'MANAGER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {staffMember.ROLE}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staffMember.STATUS === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : staffMember.STATUS === 'INACTIVE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {staffMember.STATUS}
                      </span>
                    </td>
                    <td className="table-cell">
                      {staffMember.HIRE_DATE}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(staffMember)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(staffMember)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                          title="Edit Staff"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(staffMember.STAFF_ID, `${staffMember.FIRST_NAME} ${staffMember.LAST_NAME}`, true)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Mark Present"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(staffMember.STAFF_ID, `${staffMember.FIRST_NAME} ${staffMember.LAST_NAME}`, false)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Mark Absent"
                        >
                          <XCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.STAFF_ID, `${staffMember.FIRST_NAME} ${staffMember.LAST_NAME}`)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Staff"
                        >
                          <Trash2 size={18} />
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
              No staff members found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by adding your first staff member
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <UserPlus size={20} />
              <span>Add First Staff</span>
            </button>
          </div>
        )}
      </div>

      {/* Staff Details Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Staff Details</h2>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedStaff.FIRST_NAME} {selectedStaff.LAST_NAME}
                    </h3>
                    <p className="text-gray-500">Staff ID: {selectedStaff.STAFF_ID}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedStaff.STATUS === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedStaff.STATUS}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedStaff.ROLE === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedStaff.ROLE}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{selectedStaff.PHONE}</span>
                      </div>
                      {selectedStaff.EMAIL && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-3" />
                          <span>{selectedStaff.EMAIL}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                        <span>@{selectedStaff.USERNAME}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Employment Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <span>Hired: {selectedStaff.HIRE_DATE}</span>
                      </div>
                      {selectedStaff.SALARY && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-3" />
                          <span>Salary: ${parseFloat(selectedStaff.SALARY).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-3">Created:</span>
                        <span>{selectedStaff.CREATED_AT}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <button
                    onClick={() => {
                      handleEditClick(selectedStaff);
                      setSelectedStaff(null);
                    }}
                    className="w-full btn-primary"
                  >
                    <Edit size={20} className="mr-2" />
                    Edit Staff Information
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;