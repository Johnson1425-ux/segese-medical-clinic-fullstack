import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Calendar, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ConfirmationDialog from './ConfirmationDialog.jsx';

const Appointments = () => {
  const { hasAnyRole, user, role, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const canManage = hasAnyRole(['admin', 'receptionist']);

  // Fetch appointments with detailed logging
  const { data: appointments, isLoading, isError, error } = useQuery(
    'appointments', 
    async () => {      
      const response = await api.get('/appointments');      
      return response.data.data;
    },
  );

  // Delete appointment mutation
  const deleteMutation = useMutation(
    (id) => {
      return api.delete(`/appointments/${id}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
        toast.success('Appointment deleted successfully');
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete appointment');
        setDialogOpen(false);
      },
    }
  );

  const handleDeleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAppointment) {
      deleteMutation.mutate(selectedAppointment._id);
    }
  };

  // Handle permission check
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800">Authentication Required</h3>
          <p className="text-yellow-700">Please log in to view appointments.</p>
        </div>
      </div>
    );
  }

  // if (!canView) {
  //   return (
  //     <div className="p-6">
  //       <div className="bg-red-50 border border-red-200 rounded-md p-4">
  //         <h3 className="text-lg font-medium text-red-800">Access Denied</h3>
  //         <p className="text-red-700">You don't have permission to view appointments.</p>
  //         <p className="text-sm text-red-600 mt-2">Your role: {role}</p>
  //         <p className="text-sm text-red-600">Required roles: admin, receptionist, or doctor</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800">Error Loading Appointments</h3>
          <p className="text-red-700">{error?.response?.data?.message || error?.message || 'Unknown error occurred'}</p>
          <p className="text-sm text-red-600 mt-2">Status: {error?.response?.status}</p>
          
          <button
            onClick={() => {
              console.log('🔄 Retrying query...');
              queryClient.invalidateQueries('appointments');
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        {canManage && (
          <Link
            to="/appointments/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Appointment
          </Link>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {canManage && <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments && appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(appointment.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <Link to={`/appointments/edit/${appointment._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button onClick={() => handleDeleteClick(appointment)} className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-4 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
      />
    </div>
  );
};

export default Appointments;