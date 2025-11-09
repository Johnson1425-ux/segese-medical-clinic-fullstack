import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, MapPin, Building } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('receptionist');
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm();

  const password = watch('password');

  const roles = [
    { value: 'receptionist', label: 'Receptionist', description: 'Register patients, start and end visits' },
    { value: 'nurse', label: 'Nurse', description: 'Assist with patient care and appointment management' },
    { value: 'doctor', label: 'Doctor', description: 'Manage patients, appointments, and medical records' },
    { value: 'admin', label: 'Administrator', description: 'Full system access and user management' },
  ];

  const onSubmit = async (data) => {
    try {
      const userData = {
        ...data,
        role: selectedRole,
      };

      await registerUser(userData);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          setError(err.field, { message: err.message });
        });
      } else {
        setError('root', { message: error.message || 'Registration failed' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Staff Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Only administrators can register new staff members.
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your account
            </Link>{' '}
            or contact your administrator.
          </p>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Access Restricted
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Staff registration is restricted to administrators only. 
                    Please contact your system administrator to create new staff accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
