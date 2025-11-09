import React from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../utils/dashboardService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DoctorQueue from './DoctorQueue';
import { User, Bed, Stethoscope, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon }) => (
  <div className="card flex items-center p-6">
    <div className="bg-blue-100 text-blue-600 rounded-full p-4 mr-4">
      {React.createElement(icon, { className: "w-8 h-8" })}
    </div>
    <div>
      <p className="text-gray-500 text-lg">{title}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery('dashboardStats', dashboardService.getStats);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">Could not load dashboard statistics.</p>;

  const stats = data?.data || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Patients" value={stats.totalPatients ?? 0} icon={User} />
      <StatCard title="Active Visits" value={stats.activeVisits ?? 0} icon={Bed} />
      <StatCard title="Available Doctors" value={stats.totalDoctors ?? 0} icon={Stethoscope} />
      <StatCard title="Appointments Today" value={stats.appointmentsToday ?? 0} icon={FileText} />
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
        <p className="text-gray-600">Here's what's happening in the hospital today.</p>
      </div>
      
      {/* Conditionally render dashboard content based on user role */}
      {user?.role === 'doctor' ? <DoctorQueue /> : <AdminDashboard />}
      
      {/* You can add more role-based components here in the future */}
      {/* e.g., {user?.role === 'receptionist' && <ReceptionistDashboard />} */}
    </div>
  );
};

export default Dashboard;