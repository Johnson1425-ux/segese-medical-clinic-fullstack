import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const VerifyEmail = () => {
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now access all features of the application.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed. Please try again or contact support.');
      }
    };

    if (token) {
      verifyEmailToken();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email or request a new verification link.');
    }
  }, [token, verifyEmail, navigate]);

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      setMessage('A new verification email has been sent to your email address.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verifying your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Email verified successfully!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {message}
            </p>
            <div className="mt-6">
              <Link
                to="/dashboard"
                className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Verification failed
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {message}
            </p>
            <div className="mt-6 space-y-4">
              <button
                onClick={handleResendVerification}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Mail className="h-4 w-4 mr-2" />
                Resend verification email
              </button>
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
