import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import serviceService from '../utils/serviceService.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const Services = () => {
  const { data: services, isLoading, isError } = useQuery('services', () => 
    serviceService.getAllServices().then(res => res.data.data)
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>Error loading services.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Services</h1>
        <Link to="/services/new" className="btn-primary inline-flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add New Service
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price (TZS)</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services?.map((service) => (
              <tr key={service._id}>
                <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{service.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">{service.price.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/services/edit/${service._id}`} className="text-indigo-600 hover:text-indigo-900">
                    <Edit className="inline h-5 w-5" />
                  </Link>
                  {/* Delete functionality can be added here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;