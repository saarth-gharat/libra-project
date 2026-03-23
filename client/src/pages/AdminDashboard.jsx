import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend,
} from 'chart.js';
import {
  BookOpen, Users, ArrowLeftRight, AlertTriangle, DollarSign,
  Clock, UserPlus, BookPlus, RotateCcw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, notificationsRes] = await Promise.all([
          api.get('/dashboard/admin'),
          api.get('/notifications')
        ]);
        
        setData(dashboardRes.data);
        setUnreadNotifications(notificationsRes.data.unreadCount || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader className="h-72" />
          <SkeletonLoader className="h-72" />
        </div>
      </div>
    );
  }

  const { stats, categoryStats, recentActivity, monthlyBorrows } = data;

  const barData = {
    labels: (monthlyBorrows || []).map((m) => {
      const [y, mo] = m.month.split('-');
      return new Date(y, mo - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Borrows',
        data: (monthlyBorrows || []).map((m) => parseInt(m.count)),
        backgroundColor: '#6366f1',
        borderRadius: 8,
        barThickness: 32,
      },
    ],
  };

  const doughnutData = {
    labels: (categoryStats || []).map((c) => c.name),
    datasets: [
      {
        data: (categoryStats || []).map((c) => parseInt(c.book_count)),
        backgroundColor: (categoryStats || []).map((c) => c.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const actionIconMap = {
    login: Clock,
    register: UserPlus,
    create: BookPlus,
    issue: ArrowLeftRight,
    return: RotateCcw,
    update: BookOpen,
    delete: AlertTriangle,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Overview of your library's activity and statistics
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Books" value={stats.totalBooks} icon={BookOpen} color="primary" />
        <StatCard label="Registered Students" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard label="Active Borrows" value={stats.activeBorrows} icon={ArrowLeftRight} color="green" />
        <StatCard
          label="Overdue Items"
          value={stats.overdueBorrows}
          icon={AlertTriangle}
          color="red"
          subtext={stats.totalFinesPending > 0 ? `₹${parseFloat(stats.totalFinesPending).toFixed(2)} in pending fines` : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Borrow Activity
          </h3>
          {monthlyBorrows && monthlyBorrows.length > 0 ? (
            <Bar
              data={barData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No borrow data yet
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Books by Category
          </h3>
          {categoryStats && categoryStats.length > 0 ? (
            <div className="flex items-center justify-center" style={{ maxHeight: 240 }}>
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
                  },
                  cutout: '65%',
                }}
              />
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              No categories yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {(recentActivity || []).slice(0, 10).map((activity) => {
            const Icon = actionIconMap[activity.action] || Clock;
            return (
              <div key={activity.id} className="flex items-start gap-3 py-2">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex-shrink-0">
                  <Icon size={14} className="text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activity.user?.name && `by ${activity.user.name} · `}
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          {(!recentActivity || recentActivity.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
