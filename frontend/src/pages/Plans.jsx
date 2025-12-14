import React, { useState, useEffect } from 'react';
// import {  useNavigationType } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  DollarSign,
  Calendar,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import AddPlanModal from '../components/AddPlanModal';

const Plans = () => {
  // const navigate = useNavigationType();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/membership');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data || []);
      } else {
        toast.error(data.error || 'Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlans();
  };
const handleStatusChange = async (planCode, newStatus) => {
  try {
    const response = await fetch(`http://localhost:5000/api/membership/${planCode}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newStatus })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success(`Plan ${newStatus === 'y' ? 'activated' : 'deactivated'} successfully`);
      fetchPlans(); // Refresh the list
    } else {
      toast.error(data.error || 'Failed to update plan status');
    }
  } catch (error) {
    console.error('Error updating plan status:', error);
    toast.error('Failed to update plan status');
  }
};

const handleDeletePlan = async (planCode) => {
  if (!window.confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/membership/${planCode}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success('Plan deleted successfully');
      fetchPlans(); // Refresh the list
    } else {
      toast.error(data.error || 'Failed to delete plan');
    }
  } catch (error) {
    console.error('Error deleting plan:', error);
    toast.error('Failed to delete plan');
  }
};


  const calculateDailyRate = (price, duration) => {
    return (parseFloat(price) / parseInt(duration)).toFixed(2);
  };

  const filteredPlans = plans.filter(plan => {
    if (statusFilter === 'active' && plan.IS_ACTIVE !== 'y') return false;
    if (statusFilter === 'inactive' && plan.IS_ACTIVE !== 'n') return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        plan.PLAN_CODE.toLowerCase().includes(searchLower) ||
        (plan.PLAN_DESC && plan.PLAN_DESC.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Membership Plans</h1>
          <p className="text-gray-600 mt-1">Manage your gym's membership plans and pricing</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <button
            onClick={fetchPlans}
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
            <span>Add New Plan</span>
          </button>
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
                placeholder="Search plans by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </form>
          
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="flex items-center justify-center space-x-2 btn-primary"
              disabled={loading}
            >
              <Filter size={20} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid/List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Plans ({filteredPlans.length})
            </h2>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredPlans.length} of {plans.length} plans
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.PLAN_CODE} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.PLAN_CODE}</h3>
                    <p className="text-gray-600 mt-1">{plan.PLAN_DESC || 'No description'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.IS_ACTIVE === 'y' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.IS_ACTIVE === 'y' ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Price</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${parseFloat(plan.PRICE).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Duration</span>
                    </div>
                    <span className="font-medium">
                      {plan.DURATION_DAYS} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Daily Rate</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ${calculateDailyRate(plan.PRICE, plan.DURATION_DAYS)}/day
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleStatusChange(plan.PLAN_CODE, plan.IS_ACTIVE === 'y' ? 'n' : 'y')}
                    className={`p-2 rounded-md ${
                      plan.IS_ACTIVE === 'y'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={plan.IS_ACTIVE === 'y' ? 'Deactivate' : 'Activate'}
                  >
                    {plan.IS_ACTIVE === 'y' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </button>
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast.info('Edit feature coming soon!');
                    }}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                    onClick={() => handleDeletePlan(plan.PLAN_CODE)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No plans found' : 'No plans yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'Get started by creating your first membership plan'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-2 btn-primary"
              >
                <Plus size={20} />
                <span>Create First Plan</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      <AddPlanModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchPlans();
        }}
      />
    </div>
  );
};

export default Plans;