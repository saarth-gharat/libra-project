import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Search, BookOpen, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Borrows() {
  const { user } = useAuth();
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ user_id: '', book_id: '' });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);

  const fetchBorrows = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);

    api.get(`/borrows?${params}`)
      .then((res) => setBorrows(res.data.borrows))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBorrows();
  }, [statusFilter]);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/users?limit=100').then((res) => setUsers(res.data.users)).catch(() => {});
      api.get('/books?limit=100&available=true').then((res) => setBooks(res.data.books)).catch(() => {});
    }
  }, [user]);

  const handleIssue = async () => {
    try {
      await api.post('/borrows/issue', {
        user_id: parseInt(issueForm.user_id),
        book_id: parseInt(issueForm.book_id),
      });
      toast.success('Book issued successfully');
      setShowIssueModal(false);
      setIssueForm({ user_id: '', book_id: '' });
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Issue failed');
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      const res = await api.patch(`/borrows/${borrowId}/return`);
      toast.success('Book returned successfully');
      if (res.data.fine) {
        toast(`Fine of ₹${parseFloat(res.data.fine.amount).toFixed(2)} generated`, { icon: '⚠️' });
      }
      fetchBorrows();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return failed');
    }
  };

  const statusIcon = {
    active: <Clock size={14} className="text-blue-500" />,
    returned: <CheckCircle size={14} className="text-emerald-500" />,
    overdue: <AlertTriangle size={14} className="text-red-500" />,
  };

  const statusBadge = {
    active: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    returned: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    overdue: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Borrows</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage book issue and return</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => setShowIssueModal(true)} className="btn-primary gap-2">
            <ArrowLeftRight size={16} />
            Issue Book
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['', 'active', 'returned', 'overdue'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonLoader className="h-12" count={5} />
      ) : borrows.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Book</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Student</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Borrowed</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Due</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
                  {user?.role === 'admin' && (
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-6 py-3">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {borrows.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 rounded bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={14} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{b.book?.title}</p>
                          <p className="text-xs text-gray-400">{b.book?.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.user?.student_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(b.borrow_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(b.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge[b.status] || ''}`}>
                        {statusIcon[b.status]}
                        {b.status}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-right">
                        {b.status === 'active' && (
                          <button
                            onClick={() => handleReturn(b.id)}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                          >
                            Return
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card py-12 text-center">
          <ArrowLeftRight size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No borrow records found</p>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowIssueModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Issue Book</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Student</label>
                <select
                  value={issueForm.user_id}
                  onChange={(e) => setIssueForm({ ...issueForm, user_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select student</option>
                  {users.filter((u) => u.role === 'student').map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.student_id || u.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Book</label>
                <select
                  value={issueForm.book_id}
                  onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select book</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleIssue} disabled={!issueForm.user_id || !issueForm.book_id} className="btn-primary flex-1 disabled:opacity-50">
                  Issue Book
                </button>
                <button onClick={() => setShowIssueModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
