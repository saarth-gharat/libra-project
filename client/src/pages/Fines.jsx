import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Fines() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = () => {
    setLoading(true);
    api.get('/fines')
      .then((res) => setFines(res.data.fines))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFines(); }, []);

  const handlePay = async (id) => {
    try {
      await api.patch(`/fines/${id}/pay`);
      toast.success('Fine marked as paid');
      fetchFines();
    } catch (err) {
      toast.error('Failed to update fine');
    }
  };

  const handleWaive = async (id) => {
    try {
      await api.patch(`/fines/${id}/waive`);
      toast.success('Fine waived');
      fetchFines();
    } catch (err) {
      toast.error('Failed to waive fine');
    }
  };

  const statusIcon = {
    pending: <Clock size={14} className="text-amber-500" />,
    paid: <CheckCircle size={14} className="text-emerald-500" />,
    waived: <XCircle size={14} className="text-gray-400" />,
  };

  const statusBadge = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    waived: 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {user?.role === 'admin' ? 'Fines' : 'My Fines'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {user?.role === 'admin' ? 'Manage all library fines' : 'View your fine history'}
        </p>
      </div>

      {loading ? (
        <SkeletonLoader className="h-12" count={4} />
      ) : fines.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {user?.role === 'admin' && (
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Student</th>
                  )}
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Book</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Reason</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  {user?.role === 'admin' && (
                    <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {fines.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {f.user?.name}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {f.borrow?.book?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{f.reason}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{parseFloat(f.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge[f.status]}`}>
                        {statusIcon[f.status]}
                        {f.status}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4 text-right space-x-3">
                        {f.status === 'pending' && (
                          <>
                            <button onClick={() => handlePay(f.id)} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                              Mark Paid
                            </button>
                            <button onClick={() => handleWaive(f.id)} className="text-xs font-medium text-gray-500 hover:text-gray-700">
                              Waive
                            </button>
                          </>
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
          <Receipt size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No fines found</p>
        </div>
      )}
    </div>
  );
}
