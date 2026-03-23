import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import AddBook from './pages/AddBook';
import AddTeacher from './pages/AddTeacher';
import Borrows from './pages/Borrows';
import UsersPage from './pages/Users';
import Teachers from './pages/Teachers';
import UserManagement from './pages/UserManagement';
import Fines from './pages/Fines';
import Categories from './pages/Categories';
import NotFound from './pages/NotFound';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        
        {/* Student routes */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        
        {/* Shared routes */}
        <Route path="/books" element={<Books />} />
        <Route path="/books/add" element={<ProtectedRoute adminOnly><AddBook /></ProtectedRoute>} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/borrows" element={<Borrows />} />
        <Route path="/my-borrows" element={<Borrows />} />
        <Route path="/fines" element={<Fines />} />
        <Route path="/my-fines" element={<Fines />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}