import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerMember, clearMemberState } from '../store/slices/memberSlice';
import { 
  Save, 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MemberRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.members);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    plan_code: 'VIP_MONTH',
    created_by: user?.id || 1,
  });

  useEffect(() => {
    dispatch(clearMemberState());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Member registered successfully!');
      navigate('/members');
    }
  }, [success, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.f_name.trim()) {
      toast.error('First name is required');
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    // Format date for Oracle
    const submitData = {
      ...formData,
      dob: formData.dob || null,
    };

    await dispatch(registerMember(submitData));
  };

  const membershipPlans = [
    { code: 'VIP_MONTH', name: 'VIP Monthly', price: 500, duration: '30 days' },
    { code: 'VIP_YEAR', name: 'VIP Yearly', price: 5000, duration: '1 year' },
    { code: 'BASIC_MONTH', name: 'Basic Monthly', price: 250, duration: '30 days' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Register New Member</h1>
            <p className="text-gray-600 mt-1">Add a new member to your gym</p>
          </div>
          <button
            onClick={() => navigate('/members')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <User className="h-5 w-5 text-primary-600 mr-2" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="input-field pl-10"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Membership Plan */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Membership Plan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {membershipPlans.map((plan) => (
                <div
                  key={plan.code}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    formData.plan_code === plan.code
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                  onClick={() => setFormData({ ...formData, plan_code: plan.code })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{plan.name}</h3>
                    {formData.plan_code === plan.code && (
                      <div className="h-3 w-3 rounded-full bg-primary-500"></div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                  <p className="text-sm text-gray-500 mt-1">{plan.duration}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Submit */}
          <div className="card">
            <div className="flex items-start mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Important Information</h3>
                <p className="text-sm text-gray-600 mt-1">
                  By registering this member, you confirm that all information provided is accurate.
                  The member will be registered as INACTIVE until the first payment is processed.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row md:items-center justify-end space-y-4 md:space-y-0 md:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/members')}
                className="w-full md:w-auto btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto flex items-center justify-center space-x-2 btn-primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Register Member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberRegistration;