import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AddBook() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    publisher: '',
    published_year: '',
    total_copies: 1,
    available_copies: 1,
    category_id: '',
    location: '',
  });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.published_year) payload.published_year = parseInt(payload.published_year);
      payload.total_copies = parseInt(payload.total_copies);
      payload.available_copies = parseInt(payload.available_copies);
      if (payload.category_id) payload.category_id = parseInt(payload.category_id);
      else delete payload.category_id;

      await api.post('/books', payload);
      toast.success('Book added successfully');
      navigate('/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={() => navigate('/books')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
      >
        <ArrowLeft size={16} />
        Back to books
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Book</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Fill in the details to add a book to the library</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Author *</label>
            <input name="author" value={form.author} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">ISBN</label>
            <input name="isbn" value={form.isbn} onChange={handleChange} className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-field h-20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Publisher</label>
            <input name="publisher" value={form.publisher} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Published Year</label>
            <input name="published_year" type="number" value={form.published_year} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="e.g. Shelf A-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Copies *</label>
            <input name="total_copies" type="number" min="1" value={form.total_copies} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Available Copies</label>
            <input name="available_copies" type="number" min="0" value={form.available_copies} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Book'}
          </button>
          <button type="button" onClick={() => navigate('/books')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </motion.form>
    </div>
  );
}
