import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, User, Loader2 } from 'lucide-react';
import { patientService } from '../utils/patientService.js';

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Tanzania'
    },
    bloodType: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalHistory: '',
    allergies: '',
    currentMedications: '',
    insurance: {
      provider: '',
      policyNumber: '',
      groupNumber: ''
    },
    occupation: '',
    maritalStatus: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      fetchPatient();
    }
  }, [id, isEditing]);

  const fetchPatient = async () => {
    try {
      setIsLoading(true);
      const response = await patientService.getPatientById(id);
      
      // Handle different response structures more defensively
      let patientData;
      if (response?.data?.patient) {
        patientData = response.data.patient;
      } else if (response?.data) {
        patientData = response.data;
      } else {
        patientData = response;
      }
      
      // Ensure we have valid patient data
      if (!patientData) {
        throw new Error('No patient data received from server');
      }
      
      // Ensure nested objects exist with proper defaults
      const processedData = {
        firstName: patientData.firstName || '',
        lastName: patientData.lastName || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || '',
        bloodType: patientData.bloodType || '',
        occupation: patientData.occupation || '',
        maritalStatus: patientData.maritalStatus || '',
        medicalHistory: patientData.medicalHistory || '',
        allergies: patientData.allergies || '',
        currentMedications: patientData.currentMedications || '',
        address: {
          street: patientData.address?.street || '',
          city: patientData.address?.city || '',
          state: patientData.address?.state || '',
          zipCode: patientData.address?.zipCode || '',
          country: patientData.address?.country || 'Tanzania'
        },
        emergencyContact: {
          name: patientData.emergencyContact?.name || '',
          relationship: patientData.emergencyContact?.relationship || '',
          phone: patientData.emergencyContact?.phone || ''
        },
        insurance: {
          provider: patientData.insurance?.provider || '',
          policyNumber: patientData.insurance?.policyNumber || '',
          groupNumber: patientData.insurance?.groupNumber || ''
        }
      };
      
      // Format date for input if it exists
      if (processedData.dateOfBirth) {
        try {
          processedData.dateOfBirth = new Date(processedData.dateOfBirth).toISOString().split('T')[0];
        } catch (dateError) {
          console.error('Error formatting date:', dateError);
          processedData.dateOfBirth = '';
        }
      }
      
      setFormData(processedData);
    } catch (error) {
      console.error('Error fetching patient:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch patient data';
      toast.error(message);
      navigate('/patients');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.address?.street?.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.emergencyContact?.name?.trim()) {
      newErrors['emergencyContact.name'] = 'Emergency contact name is required';
    }

    if (!formData.emergencyContact?.phone?.trim()) {
      newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await patientService.updatePatient(id, formData);
        toast.success('Patient updated successfully');
      } else {
        await patientService.createPatient(formData);
        toast.success('Patient created successfully');
      }
      navigate('/patients');
    } catch (error) {
      const message = error.response?.data?.message || 
        (isEditing ? 'Failed to update patient' : 'Failed to create patient');
      toast.error(message);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested object properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];
  const relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Patients
        </button>
        <div className="flex items-center">
          <User className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Patient' : 'Add New Patient'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update patient information' : 'Enter patient details'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleChange}
                className={`input-field ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              />
              {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className={`input-field ${errors.gender ? 'border-red-500' : ''}`}
              >
                <option value="">Select gender</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType || ''}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select blood type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus || ''}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select marital status</option>
                {maritalStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter occupation"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address?.street || ''}
                onChange={handleChange}
                className={`input-field ${errors['address.street'] ? 'border-red-500' : ''}`}
                placeholder="Enter street address"
              />
              {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address?.city || ''}
                onChange={handleChange}
                className={`input-field ${errors['address.city'] ? 'border-red-500' : ''}`}
                placeholder="Enter city"
              />
              {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Region
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address?.state || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter state or region"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip/Postal Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address?.zipCode || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter zip code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="address.country"
                value={formData.address?.country || 'Tanzania'}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter country"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Contact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact?.name || ''}
                onChange={handleChange}
                className={`input-field ${errors['emergencyContact.name'] ? 'border-red-500' : ''}`}
                placeholder="Enter emergency contact name"
              />
              {errors['emergencyContact.name'] && <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.name']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact?.phone || ''}
                onChange={handleChange}
                className={`input-field ${errors['emergencyContact.phone'] ? 'border-red-500' : ''}`}
                placeholder="Enter emergency contact phone"
              />
              {errors['emergencyContact.phone'] && <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.phone']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
              </label>
              <select
                name="emergencyContact.relationship"
                value={formData.emergencyContact?.relationship || ''}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select relationship</option>
                {relationships.map(relationship => (
                  <option key={relationship} value={relationship}>{relationship}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Medical Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                value={formData.medicalHistory || ''}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Enter medical history (conditions, surgeries, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                name="allergies"
                value={formData.allergies || ''}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Enter allergies (medications, foods, environmental, etc.)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <textarea
                name="currentMedications"
                value={formData.currentMedications || ''}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Enter current medications and dosages"
              />
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Insurance Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider
              </label>
              <input
                type="text"
                name="insurance.provider"
                value={formData.insurance?.provider || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter insurance provider name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number
              </label>
              <input
                type="text"
                name="insurance.policyNumber"
                value={formData.insurance?.policyNumber || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter policy number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Number
              </label>
              <input
                type="text"
                name="insurance.groupNumber"
                value={formData.insurance?.groupNumber || ''}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter group number"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Patient' : 'Save Patient')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;