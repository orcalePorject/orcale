import React, { useState, useEffect } from 'react';
import { X, Save, CreditCard, FileText, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AddPlanModal = ({ isOpen, onClose, onSuccess, editData = null }) => {
  const [loading, setLoading] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_desc: '',
    duration_days: '30',
    price: '',
    is_active: 'y'
  });

  const durationOptions = [
    { value: '7', label: 'Weekly (7 days)' },
    { value: '30', label: 'Monthly (30 days)' },
    { value: '90', label: 'Quarterly (90 days)' },
    { value: '180', label: 'Half Yearly (180 days)' },
    { value: '365', label: 'Yearly (365 days)' },
    { value: 'custom', label: 'Custom Duration' }
  ];

  // Initialize form with edit data if provided
  useEffect(() => {
    if (editData) {
      setFormData({
        plan_code: editData.PLAN_CODE,
        plan_desc: editData.PLAN_DESC || '',
        duration_days: editData.DURATION_DAYS.toString(),
        price: editData.PRICE.toString(),
        is_active: editData.IS_ACTIVE
      });
      
      // Check if duration is custom
      const isCustom = !['7', '30', '90', '180', '365'].includes(editData.DURATION_DAYS.toString());
      setShowCustomDuration(isCustom);
    } else {
      // Reset form
      setFormData({
        plan_code: '',
        plan_desc: '',
        duration_days: '30',
        price: '',
        is_active: 'y'
      });
      setShowCustomDuration(false);
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'duration_days') {
      if (value === 'custom') {
        setShowCustomDuration(true);
        setFormData({
          ...formData,
          [name]: ''
        });
      } else {
        setShowCustomDuration(false);
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'plan_code') {
      // Auto-uppercase for plan code
      setFormData({
        ...formData,
        [name]: value.toUpperCase()
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.plan_code.trim()) {
    toast.error('Plan code is required');
    return;
  }
  
  if (!formData.price) {
    toast.error('Price is required');
    return;
  }
  
  if (parseFloat(formData.price) <= 0) {
    toast.error('Price must be greater than 0');
    return;
  }
  
  const duration = showCustomDuration ? formData.duration_days : formData.duration_days;
  if (!duration || parseInt(duration) < 1) {
    toast.error('Duration must be at least 1 day');
    return;
  }
  
  // Validate plan code format
  const codeRegex = /^[A-Z0-9_]+$/;
  if (!codeRegex.test(formData.plan_code.trim())) {
    toast.error('Plan code must contain only uppercase letters, numbers, and underscores');
    return;
  }

  setLoading(true);
  try {
    let url, method, payload;
    
    if (editData) {
      // EDIT MODE: Update existing plan
      url = `http://localhost:5000/api/membership/${editData.PLAN_CODE}`;
      method = 'PUT';
      payload = {
        plan_desc: formData.plan_desc.trim() || null,
        duration_days: parseInt(duration),
        price: parseFloat(formData.price)
      };
    } else {
      // ADD MODE: Create new plan
      url = 'http://localhost:5000/api/membership';
      method = 'POST';
      payload = {
        plan_code: formData.plan_code.trim(),
        plan_desc: formData.plan_desc.trim() || null,
        duration_days: parseInt(duration),
        price: parseFloat(formData.price),
        is_active: formData.is_active
      };
    }
    
    console.log(`${editData ? 'Updating' : 'Creating'} plan:`, payload);
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast.success(editData ? 'Plan updated successfully!' : 'Plan created successfully!');
      resetForm();
      onSuccess();
    } else {
      toast.error(data.error || (editData ? 'Failed to update plan' : 'Failed to create plan'));
    }
  } catch (error) {
    console.error('Error saving plan:', error);
    toast.error(editData ? 'Failed to update plan' : 'Failed to create plan');
  } finally {
    setLoading(false);
  }
};
  const resetForm = () => {
    setFormData({
      plan_code: '',
      plan_desc: '',
      duration_days: '30',
      price: '',
      is_active: 'y'
    });
    setShowCustomDuration(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const durationValue = showCustomDuration ? formData.duration_days : formData.duration_days;
  const dailyRate = formData.price && durationValue && parseInt(durationValue) > 0
    ? (parseFloat(formData.price) / parseInt(durationValue)).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editData ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
              type="button"
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Code *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  name="plan_code"
                  value={formData.plan_code}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition uppercase"
                  placeholder="e.g., BASIC_MONTHLY, VIP_YEARLY"
                  required
                  disabled={loading || editData}
                  pattern="[A-Z0-9_]+"
                  title="Only uppercase letters, numbers, and underscores"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use uppercase letters, numbers, and underscores only
              </p>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <textarea
                  name="plan_desc"
                  value={formData.plan_desc}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition min-h-[100px]"
                  placeholder="Describe the features and benefits of this plan..."
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="duration_days"
                    value={showCustomDuration ? 'custom' : formData.duration_days}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition appearance-none"
                    disabled={loading}
                    required
                  >
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {showCustomDuration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Days *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleChange}
                      min="1"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="Enter days"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Daily Rate Calculation */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Daily Rate:</span>
                <span className="text-lg font-bold text-blue-600">${dailyRate}/day</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on {durationValue || '0'} days at ${formData.price || '0.00'}
              </p>
            </div>
            
            {/* Status (only for new plans) */}
            {!editData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      value="y"
                      checked={formData.is_active === 'y'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={loading}
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="is_active"
                      value="n"
                      checked={formData.is_active === 'n'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={loading}
                    />
                    <span className="ml-2 text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Edit Mode Warning */}
            {editData && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Edit Mode</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Plan code cannot be changed. Changing duration or price will affect only new subscriptions.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {editData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {editData ? 'Update Plan' : 'Create Plan'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPlanModal;