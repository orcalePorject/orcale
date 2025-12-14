import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Search, Filter, Edit, Trash2, 
  Eye, Users, Clock, User, CheckCircle, XCircle,
  RefreshCw, BookOpen, TrendingUp, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddClassModal from '../components/AddClassModal';
import EditClassModal from '../components/EditClassModal';
import BookClassModal from '../components/BookClassModal';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [trainerFilter, setTrainerFilter] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/classes';
      const params = [];
      
      if (statusFilter) {
        params.push(`is_active=${statusFilter}`);
      }
      
      if (trainerFilter) {
        params.push(`trainer_id=${trainerFilter}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setClasses(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trainers for filter
  const fetchTrainers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trainers?status=ACTIVE');
      const data = await response.json();
      
      if (data.success) {
        setTrainers(data.data);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
  }, [statusFilter, trainerFilter]);

  const handleEditClick = (classItem) => {
    setEditingClass(classItem);
    setShowEditModal(true);
  };

  const handleViewDetails = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleBookClass = (classItem) => {
    setSelectedClass(classItem);
    setShowBookModal(true);
  };

  const handleDeleteClass = async (classId, className) => {
    if (!window.confirm(`Are you sure you want to delete "${className}"?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message || 'Class deleted successfully');
        fetchClasses();
      } else {
        toast.error(data.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Failed to delete class');
    }
  };

  const handleToggleStatus = async (classId, currentStatus, className) => {
    const newStatus = currentStatus === 'Y' ? 'N' : 'Y';
    const action = newStatus === 'Y' ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${action} "${className}"?`)) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Class ${action}d successfully`);
        fetchClasses();
      } else {
        toast.error(data.error || `Failed to ${action} class`);
      }
    } catch (error) {
      console.error('Error updating class:', error);
      toast.error(`Failed to ${action} class`);
    }
  };

  const calculateOccupancyRate = (currentBookings, maxCapacity) => {
    if (!maxCapacity || maxCapacity === 0) return 0;
    return Math.round((currentBookings / maxCapacity) * 100);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
          <p className="text-gray-600 mt-1">Manage gym classes and bookings</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={fetchClasses}
            className="flex items-center justify-center space-x-2 btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 btn-primary"
          >
            <Plus size={20} />
            <span>Add New Class</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold mt-2">{classes.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Classes</p>
              <p className="text-2xl font-bold mt-2 text-green-600">
                {classes.filter(c => c.IS_ACTIVE === 'Y').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Occupancy</p>
              <p className="text-2xl font-bold mt-2 text-purple-600">
                {classes.length > 0 
                  ? Math.round(classes.reduce((sum, c) => sum + calculateOccupancyRate(c.CURRENT_BOOKINGS || 0, c.MAX_CAPACITY || 20), 0) / classes.length)
                  : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Bookings</p>
              <p className="text-2xl font-bold mt-2 text-orange-600">
                {classes.reduce((sum, c) => sum + (c.CURRENT_BOOKINGS || 0), 0)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
          </div>
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
                placeholder="Search classes..."
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
              <option value="Y">Active</option>
              <option value="N">Inactive</option>
            </select>
            
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Trainers</option>
              {trainers.map(trainer => (
                <option key={trainer.TRAINER_ID} value={trainer.TRAINER_ID}>
                  {trainer.FIRST_NAME} {trainer.LAST_NAME}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => {
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

      {/* Classes List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Classes ({classes.length})
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            {classes.filter(c => c.IS_ACTIVE === 'Y').length} active classes
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : classes.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Class</th>
                  <th className="table-header">Trainer</th>
                  <th className="table-header">Capacity</th>
                  <th className="table-header">Duration</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {classes.map(classItem => {
                  const occupancyRate = calculateOccupancyRate(classItem.CURRENT_BOOKINGS || 0, classItem.MAX_CAPACITY || 20);
                  
                  return (
                    <tr key={classItem.CLASS_ID} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {classItem.CLASS_NAME}
                            </p>
                            <p className="text-sm text-gray-500">
                              Code: {classItem.CLASS_CODE || classItem.CLASS_ID}
                              {classItem.DESCRIPTION && (
                                <span className="ml-2">• {classItem.DESCRIPTION}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{classItem.TRAINER_NAME || 'Not Assigned'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">
                              {classItem.CURRENT_BOOKINGS || 0}/{classItem.MAX_CAPACITY || 20}
                            </span>
                            <span className={`text-xs font-medium ${
                              occupancyRate >= 80 ? 'text-red-600' :
                              occupancyRate >= 60 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {occupancyRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                occupancyRate >= 80 ? 'bg-red-600' :
                                occupancyRate >= 60 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{classItem.DURATION} min</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            classItem.IS_ACTIVE === 'Y' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {classItem.IS_ACTIVE === 'Y' ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(
                              classItem.CLASS_ID, 
                              classItem.IS_ACTIVE, 
                              classItem.CLASS_NAME
                            )}
                            className={`p-1 rounded-md ${
                              classItem.IS_ACTIVE === 'Y' 
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={classItem.IS_ACTIVE === 'Y' ? 'Deactivate' : 'Activate'}
                          >
                            {classItem.IS_ACTIVE === 'Y' ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(classItem)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(classItem)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                            title="Edit Class"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleBookClass(classItem)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Book Class"
                          >
                            <BookOpen size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(classItem.CLASS_ID, classItem.CLASS_NAME)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No classes found
            </h3>
            <p className="text-gray-500 mb-6">
              Get started by creating your first class
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 btn-primary"
            >
              <Plus size={20} />
              <span>Create First Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchClasses();
        }}
      />
      
      <EditClassModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        class={editingClass}
        onSuccess={() => {
          setShowEditModal(false);
          fetchClasses();
        }}
      />
      
      <BookClassModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        class={selectedClass}
        onSuccess={() => {
          setShowBookModal(false);
          fetchClasses();
        }}
      />
    </div>
  );
};

export default Classes;