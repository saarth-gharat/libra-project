import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-7xl font-bold text-gray-200 dark:text-gray-700 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Page not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary gap-2">
          <Home size={16} />
          Go home
        </Link>
      </motion.div>
    </div>
  );
}
