import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading);

  // Show loading state
  if (loading) {
    console.log('Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user) {
    console.log('User not found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If admin-only route and user is not admin, redirect to dashboard
  if (adminOnly && user.role !== 'admin') {
    console.log('User not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Rendering protected content');
  return children;
}
