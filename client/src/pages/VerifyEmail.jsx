import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email address...');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await fetch(`/api/verification/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          
          // Store token for automatic login
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }

          // Redirect after 3 seconds
          setTimeout(() => {
            if (data.user?.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verifying':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            LIBRA.ONE
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Email Verification
          </p>
        </div>

        <div className={`border rounded-2xl p-8 text-center ${getStatusColor()}`}>
          <div className="mb-6 flex justify-center">
            {getStatusIcon()}
          </div>
          
          <h2 className="text-xl font-semibold mb-3">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <p className="text-green-800 dark:text-green-200 text-sm">
                You'll be redirected to your dashboard shortly...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full py-2.5"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary w-full py-2.5"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {status === 'verifying' && (
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>This may take a few moments...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}