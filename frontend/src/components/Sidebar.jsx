import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  Activity,
  Plus,
  Settings,
  Search,
  User,
  LogOut,
  Shield,
  FileText,
  BarChart3,
  Bell,
  DollarSign, 
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout, hasPermission, hasRole } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    ];

    if (hasRole('admin') || hasRole('doctor') || hasRole('nurse') || hasRole('receptionist')) {
      baseItems.push(
        { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'receptionist'] },
        { path: '/patients/search', icon: Search, label: 'Advanced Search', roles: ['admin', 'receptionist'] },
        { path: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'doctor', 'nurse', 'receptionist'] }
      );

      if (hasRole('doctor')) {
        baseItems.push(
          { path: '/doctors/my-queue', icon: Activity, label: 'My Queue', roles: ['doctor'] }
        );
      } else {
        baseItems.push(
          { path: '/visits',
            icon: Activity,
            label: 'Visits', 
            roles: ['admin', 'receptionist'] }
          );
      }
    }

    if (hasRole('admin') || hasRole('receptionist')) {
        baseItems.push(
            { path: '/billing', icon: DollarSign, label: 'Billing', roles: ['admin', 'receptionist']}
        )
    }

    if (hasRole('admin')) {
      baseItems.push(
        { path: '/doctors', icon: UserCheck, label: 'Doctors', roles: ['admin'] },
        { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin'] },
        { path: '/users', icon: Shield, label: 'User Management', roles: ['admin'] },
        { path: '/services', icon: Briefcase, label: 'Services', roles: ['admin'] }
      );
    }

    return baseItems.filter(item => 
      item.roles.some(role => hasRole(role))
    );
  };

  const menuItems = getMenuItems();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      doctor: 'Doctor',
      nurse: 'Nurse',
      receptionist: 'Receptionist',
    };
    return roleNames[role] || role;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-full">      
      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getRoleDisplayName(user?.role)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </h3>
          <div className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          <Link
            to="/profile"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Link>
          <Link
            to="/settings"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3" />
            Change Password
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-gray-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3 text-red-600" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
