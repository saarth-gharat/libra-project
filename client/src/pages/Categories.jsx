import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tags, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#ec4899'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then((res) => setCategories(res.data.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/categories', form);
      toast.success('Category created');
      setShowAdd(false);
      setForm({ name: '', description: '', color: '#6366f1' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/categories/${id}`, form);
      toast.success('Category updated');
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Organize books by category</p>
        </div>
        <button onClick={() => { setShowAdd(true); setForm({ name: '', description: '', color: '#6366f1' }); }} className="btn-primary gap-2">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-4">
          <div className="flex items-center gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field flex-1"
              placeholder="Category name"
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field flex-1"
              placeholder="Description (optional)"
            />
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${form.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button onClick={handleAdd} disabled={!form.name} className="btn-primary disabled:opacity-50">Add</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary"><X size={16} /></button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <SkeletonLoader className="h-16" count={4} />
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
                <Tags size={18} style={{ color: cat.color }} />
              </div>

              {editId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-sm flex-1"
                  />
                  <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</h3>
                    <p className="text-xs text-gray-400">{cat.book_count || 0} books{cat.description ? ` · ${cat.description}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card py-12 text-center">
          <Tags size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No categories yet</p>
        </div>
      )}
    </div>
  );
}
