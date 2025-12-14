import React, { useState, useEffect } from 'react';
import { X, Save, Users, Clock, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AddClassModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    class_name: '',
    trainer_id: '',
    description: '',
    max_capacity: '20',
    duration: '60',
    is_active: 'Y'
  });

  // Fetch trainers for dropdown
  useEffect(() => {
    if (isOpen) {
      fetchTrainers();
    }
  }, [isOpen]);

  const fetchTrainers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trainers?status=ACTIVE');
      const data = await response.json();
      
      if (data.success) {
        setTrainers(data.data);
        // Set first trainer as default if available
        if (data.data.length > 0 && !formData.trainer_id) {
          setFormData(prev => ({
            ...prev,
            trainer_id: data.data[0].TRAINER_ID.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.class_name || !formData.trainer_id) {
      toast.error('Class name and trainer are required');
      return;
    }
    
    if (parseInt(formData.max_capacity) < 1) {
      toast.error('Maximum capacity must be at least 1');
      return;
    }
    
    if (parseInt(formData.duration) < 15) {
      toast.error('Duration must be at least 15 minutes');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          max_capacity: parseInt(formData.max_capacity),
          duration: parseInt(formData.duration)
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Class created successfully!');
        resetForm();
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      class_name: '',
      trainer_id: trainers.length > 0 ? trainers[0].TRAINER_ID.toString() : '',
      description: '',
      max_capacity: '20',
      duration: '60',
      is_active: 'Y'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add New Class</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="class_name"
                    value={formData.class_name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="e.g., Yoga Basics, HIIT, Zumba"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trainer *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="trainer_id"
                    value={formData.trainer_id}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map(trainer => (
                      <option key={trainer.TRAINER_ID} value={trainer.TRAINER_ID}>
                        {trainer.FIRST_NAME} {trainer.LAST_NAME}
                        {trainer.SPECIALIZATION && ` (${trainer.SPECIALIZATION})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Y">Active</option>
                  <option value="N">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Capacity *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="max_capacity"
                    value={formData.max_capacity}
                    onChange={handleChange}
                    className="input-field pl-10"
                    min="1"
                    max="100"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input-field pl-10"
                    min="15"
                    max="240"
                    step="5"
                    required
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="input-field pl-10"
                    placeholder="Describe the class, equipment needed, difficulty level, etc."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Create Class</span>
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

export default AddClassModal;