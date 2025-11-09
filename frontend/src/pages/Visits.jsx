import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { visitService } from '../utils/visitService.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Visits = () => {
  const { hasAnyRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const canCreateVisit = hasAnyRole(['admin', 'receptionist']);

  const {
    data: visitsData,
    isLoading,
    isError,
  } = useQuery(
    ['visits', currentPage, statusFilter, searchTerm],
    () => visitService.getAllVisits({ page: currentPage, limit: 10, status: statusFilter, search: searchTerm }),
    { keepPreviousData: true }
  );

  const visits = visitsData?.data || [];
  const totalPages = visitsData?.totalPages || 1;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500">Error loading visits.</div>;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Patient Visits</h1>
        {canCreateVisit && (
          <Link to="/visits/new" className="btn-primary inline-flex items-center w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Start New Visit
          </Link>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
            className="input-field pl-10 w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visits.map((visit) => (
                <tr key={visit._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{visit.patient?.firstName} {visit.patient?.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Dr. {visit.doctor?.firstName} {visit.doctor?.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(visit.visitDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap truncate max-w-xs">{visit.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        visit.status === 'In-Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {visit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/visits/${visit._id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end">
                      <Eye className="h-5 w-5 mr-1"/>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
       <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn-secondary disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn-secondary disabled:opacity-50"
        >
          Next
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Visits;