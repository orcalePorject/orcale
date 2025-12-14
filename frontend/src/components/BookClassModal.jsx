import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const BookClassModal = ({ isOpen, onClose, class: classData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    member_id: '',
    booking_date: '',
    start_time: '',
    end_time: ''
  });

  // Initialize form with today's date and default times
  useEffect(() => {
    if (isOpen && classData) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      const defaultTime = '09:00'; // Default start time
      
      // Calculate end time based on class duration
      const duration = classData.DURATION || 60;
      const [hours, minutes] = defaultTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + duration);
      const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      
      setFormData({
        member_id: '',
        booking_date: formattedDate,
        start_time: defaultTime,
        end_time: formattedEndTime
      });
      setSelectedMember(null);
      setSearchTerm('');
      setMembers([]);
    }
  }, [isOpen, classData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Update end time when start time changes
  useEffect(() => {
    if (formData.start_time && classData) {
      const duration = classData.DURATION || 60;
      const [hours, minutes] = formData.start_time.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + duration);
      const formattedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      
      setFormData(prev => ({
        ...prev,
        end_time: formattedEndTime
      }));
    }
  }, [formData.start_time, classData]);

  const searchMembers = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      toast.error('Enter at least 2 characters to search');
      return;
    }
    
    setSearching(true);
    try {
      const response = await fetch(`http://localhost:5000/api/members/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data);
        if (data.data.length === 0) {
          toast.info('No members found');
        }
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    setFormData(prev => ({
      ...prev,
      member_id: member.M_ID
    }));
    setSearchTerm('');
    setMembers([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!classData) return;
    
    if (!formData.member_id || !formData.booking_date || !formData.start_time) {
      toast.error('Please select a member and provide booking details');
      return;
    }
    
    // Check if class is active
    if (classData.IS_ACTIVE !== 'Y') {
      toast.error('This class is not active');
      return;
    }
    
    // Check capacity
    const currentBookings = classData.CURRENT_BOOKINGS || 0;
    const maxCapacity = classData.MAX_CAPACITY || 20;
    
    if (currentBookings >= maxCapacity) {
      toast.error(`Class is full! Maximum capacity: ${maxCapacity}`);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/classes/${classData.CLASS_ID}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Booking created successfully!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !classData) return null;

  const occupancyRate = Math.round(((classData.CURRENT_BOOKINGS || 0) / (classData.MAX_CAPACITY || 20)) * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Book Class</h2>
              <p className="text-sm text-gray-500 mt-1">
                {classData.CLASS_NAME} • {classData.TRAINER_NAME}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Class Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Class</p>
                <p className="font-medium">{classData.CLASS_NAME}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trainer</p>
                <p className="font-medium">{classData.TRAINER_NAME}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <p className="font-medium">{classData.DURATION || 60} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Capacity</p>
                <p className="font-medium">
                  {classData.CURRENT_BOOKINGS || 0}/{classData.MAX_CAPACITY || 20}
                  <span className={`ml-2 text-sm ${occupancyRate >= 80 ? 'text-red-600' : 'text-green-600'}`}>
                    ({occupancyRate}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Member *
              </label>
              
              {selectedMember ? (
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {selectedMember.FULL_NAME || `${selectedMember.F_NAME} ${selectedMember.L_NAME}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Phone: {selectedMember.PHONE} • Status: 
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                          selectedMember.STATUS === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedMember.STATUS}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMember(null);
                        setFormData(prev => ({ ...prev, member_id: '' }));
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchMembers())}
                        className="input-field pl-10"
                        placeholder="Search members by name or phone..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={searchMembers}
                      className="btn-secondary flex items-center space-x-2"
                      disabled={searching}
                    >
                      {searching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      ) : (
                        <Search size={18} />
                      )}
                      <span>Search</span>
                    </button>
                  </div>
                  
                  {members.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      {members.map(member => (
                        <div
                          key={member.M_ID}
                          onClick={() => selectMember(member)}
                          className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium">
                                {member.FULL_NAME || `${member.F_NAME} ${member.L_NAME}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {member.PHONE} • {member.EMAIL || 'No email'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    name="booking_date"
                    value={formData.booking_date}
                    onChange={handleChange}
                    className="input-field pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time (Auto-calculated)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="input-field pl-10 bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            {/* Capacity Warning */}
            {occupancyRate >= 80 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This class is {occupancyRate >= 90 ? 'almost full' : 'getting full'} 
                  ({classData.CURRENT_BOOKINGS || 0}/{classData.MAX_CAPACITY || 20} spots taken)
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={loading || !selectedMember}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Book Class</span>
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

export default BookClassModal;