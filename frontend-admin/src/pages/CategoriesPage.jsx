import { useState, useEffect } from 'react';
import { Layers, Plus, Search, Trash2, Edit, CheckCircle2, XCircle, Loader2, Image as ImageIcon, Upload, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    imageFile: null,
    status: 'active',
  });
  const [imagePreview, setImagePreview] = useState('');

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const queryParams = new URLSearchParams({
        per_page: '8',
        page: pageNum.toString(),
      });
      if (searchTerm.trim()) {
        queryParams.append('search', searchTerm.trim());
      }

      const res = await fetch(`${API_BASE_URL}/categories?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();

      let items = [];
      let more = false;

      if (data.categories?.data) {
        items = data.categories.data;
        more = !!data.categories.next_page_url;
      } else if (Array.isArray(data.categories)) {
        items = data.categories;
        more = data.hasMore ?? false;
      } else if (Array.isArray(data)) {
        items = data;
        more = false;
      }

      if (append) {
        setCategories((prev) => [...prev, ...items]);
      } else {
        setCategories(items);
      }
      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading categories:', err);
      showToastMsg('Failed to load categories from server.', 'error');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      imageFile: null,
      status: 'active',
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
      imageFile: null,
      status: category.status || 'active',
    });
    setImagePreview(category.image || '');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file, image: '' }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url, imageFile: null }));
    setImagePreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToastMsg('Please enter a category name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('name', formData.name.trim());
      if (formData.slug.trim()) dataPayload.append('slug', formData.slug.trim());
      if (formData.description.trim()) dataPayload.append('description', formData.description.trim());
      dataPayload.append('status', formData.status || 'active');

      if (formData.imageFile) {
        dataPayload.append('image', formData.imageFile);
      } else if (formData.image) {
        dataPayload.append('image', formData.image.trim());
      }

      let res;
      if (editingCategory) {
        // Laravel PUT with multipart/form-data works best with POST + _method=PUT
        dataPayload.append('_method', 'PUT');
        res = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
          method: 'POST',
          body: dataPayload,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          body: dataPayload,
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to save category');
      }

      showToastMsg(editingCategory ? 'Category updated successfully!' : 'Category created successfully!', 'success');
      setShowModal(false);
      fetchCategories(1, false);
    } catch (err) {
      console.error('Save category error:', err);
      showToastMsg(err.message || 'Error saving category.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete category');

      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToastMsg(`Category "${name}" deleted!`, 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showToastMsg('Failed to delete category from server.', 'error');
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: category.name,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, status: newStatus } : c))
      );
      showToastMsg(`Category status set to ${newStatus}!`, 'success');
    } catch (err) {
      console.error('Toggle status error:', err);
      showToastMsg('Failed to update category status.', 'error');
    }
  };

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 shadow-lg text-white font-medium text-sm transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
            }`}
        >
          {toast.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="w-7 h-7 text-amber-500" />
            Categories Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize catalog into distinct categories with images, real-time CRUD and 8-item batch loading.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
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
          Showing <span className="text-gray-900 dark:text-white font-bold">{categories.length}</span> categories
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm animate-pulse flex flex-col justify-between h-56"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-none" />
                  <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-700/60 mb-1" />
                <div className="w-2/3 h-3 bg-gray-100 dark:bg-gray-700/60" />
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700" />
                <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No categories found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get started by adding your first category.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1">{category.name}</h3>
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                          {category.slug || `CAT-${category.id}`}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(category)}
                      className={`px-2.5 py-0.5 text-[11px] font-semibold border flex items-center gap-1 cursor-pointer ${category.status === 'active' || category.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                        }`}
                    >
                      {category.status === 'active' || category.status === 'Active' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      <span className="capitalize">{category.status || 'active'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 min-h-[32px]">
                    {category.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    ID #{category.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(category)}
                      className="p-1.5 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => fetchCategories(page + 1, true)}
                disabled={isFetchingMore}
                className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-xs transition-all shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isFetchingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Loading Next 8 Categories...</span>
                  </>
                ) : (
                  <span>Load 8 More Categories ↓</span>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-800 max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Espresso & Coffee"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Slug / Code
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. espresso-coffee"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-sm dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              <div className="p-3 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 space-y-3">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                  Category Image
                </label>

                <div className="flex items-center gap-4">
                  {/* Image Preview Box */}
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white dark:bg-gray-800 overflow-hidden flex-shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer w-fit">
                      <Upload className="w-3.5 h-3.5 text-amber-500" />
                      <span>Choose File to Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <div className="text-[11px] text-gray-400">or enter image direct URL:</div>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={handleUrlChange}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2.5 py-1.5 text-xs dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
