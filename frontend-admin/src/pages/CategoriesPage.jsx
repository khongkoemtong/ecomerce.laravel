import { useState } from 'react';
import { Layers, Plus, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const initialCategories = [
  { id: '1', name: 'Coffee & Drinks', code: 'CAT-001', itemCount: 42, icon: '☕', status: 'Active', description: 'Hot & iced coffees, teas, smoothies, and soft drinks' },
  { id: '2', name: 'Burgers & Sandwiches', code: 'CAT-002', itemCount: 28, icon: '🍔', status: 'Active', description: 'Gourmet beef, chicken burgers and toasted paninis' },
  { id: '3', name: 'Pizza & Pasta', code: 'CAT-003', itemCount: 35, icon: '🍕', status: 'Active', description: 'Wood-fired pizzas and fresh handmade pasta dishes' },
  { id: '4', name: 'Desserts & Sweets', code: 'CAT-004', itemCount: 19, icon: '🍰', status: 'Active', description: 'Cakes, pastries, gelato, and sweet treats' },
  { id: '5', name: 'Snacks & Sides', code: 'CAT-005', itemCount: 24, icon: '🍕', status: 'Active', description: 'Fries, onion rings, dips, and quick appetizers' },
  { id: '6', name: 'Healthy & Salad', code: 'CAT-006', itemCount: 15, icon: '🥗', status: 'Inactive', description: 'Fresh organic greens, bowls, and vegan options' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', code: '', icon: '📦', description: '' });

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    const catToAdd = {
      id: String(Date.now()),
      name: newCat.name,
      code: newCat.code || `CAT-${Math.floor(100 + Math.random() * 900)}`,
      itemCount: 0,
      icon: newCat.icon || '📁',
      status: 'Active',
      description: newCat.description || 'No description provided.',
    };
    setCategories([catToAdd, ...categories]);
    setNewCat({ name: '', code: '', icon: '📦', description: '' });
    setShowAddModal(false);
  };

  const toggleStatus = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c));
  };

  const deleteCategory = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-amber-500" />
            Categories Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize product catalog into distinct categories and groups.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 transition-all shadow-sm self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 dark:text-white"
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Showing <span className="text-gray-900 dark:text-white font-bold">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800/50">
                    {category.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{category.name}</h3>
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{category.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(category.id)}
                  className={`px-3 py-1 text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                    category.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                  }`}
                >
                  {category.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {category.status}
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                {category.description}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {category.itemCount} <span className="font-normal text-gray-400">Products</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 max-w-md w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  placeholder="e.g. Seafood & Grills"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={newCat.code}
                    onChange={(e) => setNewCat({ ...newCat, code: e.target.value })}
                    placeholder="CAT-007"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={newCat.icon}
                    onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                    placeholder="🍤"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
