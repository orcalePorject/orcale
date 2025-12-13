import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Briefcase, Calendar } from 'lucide-react';

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/staff');
      const data = await response.json();
      if (data.success) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-600 mt-1">Manage all gym staff members</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map(person => (
            <div key={person.STAFF_ID} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {person.FIRST_NAME} {person.LAST_NAME}
                  </h3>
                  <div className="flex items-center mt-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{person.ROLE}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  person.STATUS === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {person.STATUS}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm">{person.PHONE}</span>
                </div>
                {person.EMAIL && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-sm truncate">{person.EMAIL}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm">Hired: {person.HIRE_DATE}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Staff ID:</span>
                  <span className="font-medium">{person.STAFF_ID}</span>
                </div>
                {person.SALARY && (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Salary:</span>
                    <span className="font-medium">${parseFloat(person.SALARY).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Staff;