import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, MapPin, Calendar, Hash, Layers, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/books/${id}`)
      .then((res) => {
        setBook(res.data.book);
        setForm(res.data.book);
      })
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    try {
      const res = await api.put(`/books/${id}`, {
        title: form.title,
        author: form.author,
        isbn: form.isbn,
        description: form.description,
        publisher: form.publisher,
        published_year: form.published_year,
        total_copies: form.total_copies,
        available_copies: form.available_copies,
        category_id: form.category_id,
        location: form.location,
      });
      setBook(res.data.book);
      setEditing(false);
      toast.success('Book updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      toast.success('Book deleted');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-8 w-32" />
        <SkeletonLoader className="h-64" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate('/books')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft size={16} />
        Back to books
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex gap-4">
            <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center flex-shrink-0">
              <BookOpen size={32} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field text-lg font-bold mb-1"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{book.title}</h1>
              )}
              {editing ? (
                <input
                  type="text"
                  value={form.author || ''}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="input-field text-sm mt-1"
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{book.author}</p>
              )}
              {book.category && (
                <span
                  className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${book.category.color}15`, color: book.category.color }}
                >
                  {book.category.name}
                </span>
              )}
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleUpdate} className="btn-primary text-xs">Save</button>
                  <button onClick={() => { setEditing(false); setForm(book); }} className="btn-secondary text-xs">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="btn-secondary gap-1.5 text-xs">
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={handleDelete} className="btn-danger gap-1.5 text-xs">
                    <Trash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input-field mb-4 h-24"
          />
        ) : (
          book.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {book.description}
            </p>
          )
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Hash size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">ISBN</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{book.isbn || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Copies</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {book.available_copies} / {book.total_copies}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Published</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{book.published_year || 'N/A'}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Location</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{book.location || 'N/A'}</p>
          </div>
        </div>

        {book.borrows && book.borrows.length > 0 && user?.role === 'admin' && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Active Borrows</h3>
            <div className="space-y-2">
              {book.borrows.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Borrow #{b.id}</span>
                  <span className="text-gray-500 dark:text-gray-400">Due: {new Date(b.due_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
