import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, DollarSign, User, AlertCircle } from 'lucide-react';

const ProcessPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Membership Fee',
    payment_date: new Date().toISOString().split('T')[0]
  });

  // Get member ID from URL query
  const queryParams = new URLSearchParams(location.search);
  const memberId = queryParams.get('member');

  useEffect(() => {
    if (memberId) {
      fetchMemberDetails(memberId);
    }
  }, [memberId]);

  const fetchMemberDetails = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/members/${id}`);
      const data = await response.json();
      if (data.success) {
        setMember(data.data);
      }
    } catch (error) {
      console.error('Error fetching member:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          amount: parseFloat(formData.amount),
          description: formData.description,
          received_by: 1 // This should come from auth context
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment processed successfully!');
        navigate(`/members/${memberId}`);
      } else {
        alert('Payment failed: ' + data.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Process Payment</h1>
              <p className="text-gray-600">Record a payment for a member</p>
            </div>
          </div>
        </div>

        {/* Member Info */}
        {member && (
          <div className="card mb-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {member.F_NAME} {member.L_NAME}
                </h3>
                <p className="text-sm text-gray-500">ID: {member.M_ID} • Phone: {member.PHONE}</p>
                <p className="text-sm text-gray-500">Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    member.STATUS === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.STATUS}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Payment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Processing a payment will automatically update the member's status to ACTIVE if they are currently INACTIVE.
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse md:flex-row md:items-center justify-end space-y-4 md:space-y-0 md:space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Process Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcessPayment;