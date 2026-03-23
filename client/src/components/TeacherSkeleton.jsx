import { motion } from 'framer-motion';

export default function TeacherSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"
          />
          <div className="space-y-2">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"
            />
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"
            />
          </div>
        </div>
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"
        />
      </div>

      <div className="space-y-3">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
          className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
          className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"
        />
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
          className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg"
        />
      </div>
    </div>
  );
}
