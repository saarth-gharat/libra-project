import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/student')
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <SkeletonLoader className="h-8 w-48 mb-2" />
          <SkeletonLoader className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader className="h-28" count={4} />
        </div>
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  const { stats, currentBooks, recentHistory } = data;

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track your reading progress and borrowing activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Currently Reading"
          value={stats.activeBorrows}
          icon={BookOpen}
          color="primary"
          subtext={`of ${stats.maxBorrowLimit} max`}
        />
        <StatCard label="Total Borrowed" value={stats.totalBorrowed} icon={BarChart3} color="blue" />
        <StatCard
          label="Pending Fines"
          value={`₹${parseFloat(stats.pendingFines || 0).toFixed(2)}`}
          icon={DollarSign}
          color={stats.pendingFines > 0 ? 'red' : 'green'}
        />
        <StatCard
          label="Borrow Limit"
          value={`${stats.activeBorrows}/${stats.maxBorrowLimit}`}
          icon={BarChart3}
          color="amber"
        />
      </div>

      {/* Currently Reading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Currently Reading
        </h3>
        {currentBooks && currentBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentBooks.map((borrow) => {
              const daysLeft = getDaysRemaining(borrow.due_date);
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft >= 0 && daysLeft <= 3;

              return (
                <div
                  key={borrow.id}
                  className={`p-4 rounded-xl border transition-colors ${
                    isOverdue
                      ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/10'
                      : isUrgent
                      ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/10'
                      : 'border-gray-100 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {borrow.book.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{borrow.book.author}</p>

                      <div className="flex items-center gap-2 mt-2">
                        {isOverdue ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                            <AlertTriangle size={12} />
                            Overdue by {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 text-xs font-medium ${
                            isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <Clock size={12} />
                            {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar for due date */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverdue ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-primary-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(0, ((14 - daysLeft) / 14) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No books currently borrowed</p>
            <p className="text-xs text-gray-400 mt-1">Browse the library to find your next read</p>
          </div>
        )}
      </motion.div>

      {/* Reading History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Reading History
        </h3>
        {recentHistory && recentHistory.length > 0 ? (
          <div className="space-y-3">
            {recentHistory.map((borrow) => (
              <div key={borrow.id} className="flex items-center gap-3 py-2">
                <div className="w-10 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {borrow.book.title}
                  </p>
                  <p className="text-xs text-gray-400">{borrow.book.author}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  Returned {new Date(borrow.return_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No reading history yet</p>
        )}
      </motion.div>
    </div>
  );
}
