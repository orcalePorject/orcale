
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  Dumbbell, 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  User,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/members', label: 'Members', icon: Users },
    { path: '/classes', label: 'Classes', icon: Calendar },
    { path: '/payments', label: 'Payments', icon: CreditCard },
{ path: '/attendance', label: 'Attendance', icon: Activity },
{ path: '/staff', label: 'Staff', icon: Users },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">GymPro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="bg-primary-100 p-2 rounded-full">
                  <User size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {user && (
                <div className="px-4 py-3 border-t">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <User size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;