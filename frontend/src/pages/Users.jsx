import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Shield } from 'lucide-react';
import { userService } from '../utils/userService';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmationDialog from './ConfirmationDialog';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery('users', userService.getAllUsers);

  const toggleStatusMutation = useMutation(userService.toggleUserStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User status updated!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    },
  });
  
  const users = data?.data || [];

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all staff accounts</p>
        </div>
        <Link to="/users/new" className="btn-primary flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-500">{user.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm">{user.role}</span>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <button onClick={() => toggleStatusMutation.mutate(user._id)}>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? <ToggleRight className="mr-1"/> : <ToggleLeft className="mr-1"/>}
                            {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                        <Link to={`/users/${user._id}/edit`} className="text-indigo-600 hover:text-indigo-900"><Edit className="w-4 h-4" /></Link>
                        {/* Add delete functionality here */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;