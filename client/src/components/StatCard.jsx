import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, color = 'primary', subtext }) {
  const colorMap = {
    primary: 'bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-600 dark:from-primary-500/30 dark:to-primary-600/30 dark:text-primary-400',
    green: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-600 dark:from-emerald-500/30 dark:to-emerald-600/30 dark:text-emerald-400',
    amber: 'bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-600 dark:from-amber-500/30 dark:to-amber-600/30 dark:text-amber-400',
    red: 'bg-gradient-to-br from-red-500/20 to-red-600/20 text-red-600 dark:from-red-500/30 dark:to-red-600/30 dark:text-red-400',
    blue: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-600 dark:from-blue-500/30 dark:to-blue-600/30 dark:text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="glass-card p-6 hover-lift"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.primary}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}