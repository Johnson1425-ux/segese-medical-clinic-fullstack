import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Calendar, User, MapPin, Phone, Eye, Edit, AlertCircle } from 'lucide-react';
import { patientService } from '../utils/patientService.js';

const PatientSearch = () => {
  // Search criteria state
  const [searchMethod, setSearchMethod] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Advanced filter state (simplified to match backend capabilities)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const searchPatients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let searchParams = {
        page: currentPage,
        limit: 10
      };

      // Build search query based on method and query
      if (searchQuery.trim()) {
        searchParams.q = searchQuery.trim();
      }

      console.log('Searching with params:', searchParams);
      
      const response = await patientService.searchPatients(searchParams);
      
      console.log('Search response:', response);

      if (response.status === 'success') {
        // Handle the response structure from your backend
        const patientsData = response.data || response.patients || [];
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setTotalResults(response.count || patientsData.length || 0);
        
        // Calculate pages (assuming 10 per page)
        setTotalPages(Math.ceil((response.count || patientsData.length || 0) / 10));
      } else {
        throw new Error(response.message || 'Search failed');
      }
      
    } catch (error) {
      console.error('Error searching patients:', error);
      const message = error.response?.data?.message || error.message || 'Failed to search patients. Please try again.';
      setError(message);
      toast.error(message);
      setPatients([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Load patients when page changes (only if there's an active search)
  useEffect(() => {
    if (searchQuery.trim()) {
      searchPatients();
    }
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    setCurrentPage(1);
    searchPatients();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
    setPatients([]);
    setTotalResults(0);
    setTotalPages(1);
    setError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleView = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const PatientModal = ({ patient, onClose }) => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.patientId || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{`${patient.firstName} ${patient.lastName}`}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.email || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(patient.dateOfBirth)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <p className="mt-1 text-sm text-gray-900">{calculateAge(patient.dateOfBirth)} years</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.gender || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {patient.bloodType ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {patient.bloodType}
                      </span>
                    ) : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.maritalStatus || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.occupation || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.address ? 
                    `${patient.address.street}, ${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}, ${patient.address.country}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') 
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
  
            {/* Medical & Emergency Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Medical & Emergency Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                <p className="mt-1 text-sm text-gray-900">
                  {patient.emergencyContact?.name || 'N/A'}
                  {patient.emergencyContact?.relationship && ` (${patient.emergencyContact.relationship})`}
                </p>
                <p className="text-sm text-gray-500">{patient.emergencyContact?.phone || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Medical History</label>
                <p className="mt-1 text-sm text-gray-900">{patient.medicalHistory || 'None recorded'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Allergies</label>
                <p className="mt-1 text-sm text-gray-900">{patient.allergies || 'None recorded'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Medications</label>
                <p className="mt-1 text-sm text-gray-900">{patient.currentMedications || 'None recorded'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                <p className="mt-1 text-sm text-gray-900">{patient.insurance?.provider || 'N/A'}</p>
                {patient.insurance?.policyNumber && (
                  <p className="text-sm text-gray-500">Policy: {patient.insurance.policyNumber}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Link
              to={`/patients/${patient._id}/edit`}
              className="btn-secondary flex items-center"
              onClick={onClose}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Patient
            </Link>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg mr-4">
              <Search className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Manage Patients</h1>
              <p className="text-gray-600">Search and manage patients in the system</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Filter className="mr-2 text-blue-600" size={20} />
            Patient Search
          </h3>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                {/* <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patients
                </label> */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or phone number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center disabled:bg-gray-400"
                  >
                    <Search size={16} className="mr-2" />
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!searchQuery.trim() && patients.length === 0}
                    className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition disabled:bg-gray-200 disabled:cursor-not-allowed"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={20} />
              <strong>Error:</strong> {error}
            </div>
            <button 
              onClick={() => {
                setError(null);
                if (searchQuery.trim()) {
                  searchPatients();
                }
              }}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Patient Search'}
            </h3>
            {patients.length > 0 && searchQuery.trim() && (
              <p className="text-sm text-gray-600 mt-1">
                Found {totalResults} patient(s) matching your search
              </p>
            )}
            {!searchQuery.trim() && patients.length === 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Enter a search term above to find patients
              </p>
            )}
          </div> */}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500"></div>
                        <span className="ml-2">Loading patients...</span>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 && !searchQuery.trim() ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Patient Search</h3>
                        <p>Enter a patient's name, email, or phone number in the search field above to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No patients found matching "{searchQuery}". Try adjusting your search term.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName && patient.lastName 
                                ? `${patient.firstName} ${patient.lastName}`
                                : patient.fullName || 'N/A'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.gender || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(patient.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateAge(patient.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            onClick={() => handleView(patient)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Patient"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/patients/${patient._id || patient.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-blue-50"
                            title="Edit Patient"
                          >
                            <Edit size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
        />
      )}

    </div>
  );
};

export default PatientSearch;