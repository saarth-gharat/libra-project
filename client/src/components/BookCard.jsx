import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function BookCard({ book, onClick }) {
  const isAvailable = book.available_copies > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="card p-5 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex gap-4">
        <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <BookOpen size={24} className="text-primary-600 dark:text-primary-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{book.author}</p>

          <div className="flex items-center gap-2 mt-2">
            {book.category && (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${book.category.color}15`,
                  color: book.category.color,
                }}
              >
                {book.category.name}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {isAvailable ? `${book.available_copies} available` : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
