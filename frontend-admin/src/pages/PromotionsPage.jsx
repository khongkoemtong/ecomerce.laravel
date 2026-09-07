import { useState, useEffect, useCallback } from 'react';
import { 
  Gift, 
  Plus, 
  Search, 
  Tag, 
  Calendar, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  RefreshCw, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  AlertCircle,
  Percent,
  SlidersHorizontal,
  Flame,
  Truck
} from 'lucide-react';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '')) || 'http://127.0.0.1:8000/api';

export default function PromotionsPage() {
  const [promos, setPromos] = useState([]);
  const [metrics, setMetrics] = useState({
    total_promos: 0,
    active_promos: 0,
    expired_promos: 0,
    total_redeemed: 0,
  });

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discount: '',
    type: 'Coupon',
    min_order_amount: '',
    usage_limit: '',
    validTill: '',
    status: 'Active',
    description: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch Promotions API (8 items per batch)
  const fetchPromotions = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const params = new URLSearchParams({
        per_page: '8',
        page: pageNum.toString(),
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedType !== 'All') {
        params.append('type', selectedType);
      }
      if (selectedStatus !== 'All') {
        params.append('status', selectedStatus);
      }

      const res = await fetch(`${API_BASE_URL}/promotions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load promotions');

      const data = await res.json();

      if (data.success && Array.isArray(data.promotions)) {
        if (append) {
          setPromos(prev => [...prev, ...data.promotions]);
        } else {
          setPromos(data.promotions);
        }

        if (data.metrics) {
          setMetrics(data.metrics);
        }
        setHasMore(data.hasMore || false);
        setPage(data.currentPage || pageNum);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      showToast(err.message || 'Error loading promotions from server', 'error');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
      setIsSyncing(false);
    }
  }, [searchTerm, selectedType, selectedStatus]);

  // Debounced Search Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPromotions(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPromotions]);

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      title: '',
      discount: '20% OFF',
      type: 'Coupon',
      min_order_amount: '50.00',
      usage_limit: '500',
      validTill: '2026-12-31',
      status: 'Active',
      description: '',
    });
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      title: promo.title,
      discount: promo.discount,
      type: promo.type || 'Coupon',
      min_order_amount: promo.min_order_amount ? promo.min_order_amount.toString() : '',
      usage_limit: promo.usageLimit ? promo.usageLimit.toString() : '',
      validTill: promo.validTill || '',
      status: promo.status || 'Active',
      description: promo.description || '',
    });
    setShowModal(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.title) {
      showToast('Please enter both promo code and campaign title', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        title: formData.title.trim(),
        discount: formData.discount.trim(),
        type: formData.type,
        min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit, 10) : null,
        validTill: formData.validTill || null,
        status: formData.status,
        description: formData.description.trim(),
      };

      let res;
      if (editingPromo) {
        const targetId = editingPromo.db_id || editingPromo.id;
        res = await fetch(`${API_BASE_URL}/promotions/${targetId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/promotions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || (resData.errors ? Object.values(resData.errors).flat().join(', ') : 'Failed to save promotion'));
      }

      showToast(editingPromo ? 'Promotion updated successfully!' : 'Promo code created successfully!', 'success');
      setShowModal(false);
      fetchPromotions(1, false);
    } catch (err) {
      console.error('Save promo error:', err);
      showToast(err.message || 'Error saving promotion', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Promo
  const handleDeletePromo = async (promo) => {
    if (!window.confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) return;

    try {
      const targetId = promo.db_id || promo.id;
      const res = await fetch(`${API_BASE_URL}/promotions/${targetId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to delete promotion');

      setPromos(prev => prev.filter(p => p.id !== promo.id));
      setMetrics(prev => ({
        ...prev,
        total_promos: Math.max(0, prev.total_promos - 1),
        active_promos: promo.status === 'Active' ? Math.max(0, prev.active_promos - 1) : prev.active_promos,
      }));
      showToast(`Promotion ${promo.code} deleted successfully`, 'success');
    } catch (err) {
      console.error('Delete promo error:', err);
      showToast(err.message || 'Error deleting promotion', 'error');
    }
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (promo) => {
    try {
      const targetId = promo.db_id || promo.id;
      const nextStatus = promo.status === 'Active' ? 'Disabled' : 'Active';

      const res = await fetch(`${API_BASE_URL}/promotions/${targetId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error('Failed to update promo status');
      const resData = await res.json();

      if (resData.success && resData.promo) {
        setPromos(prev => prev.map(p => (p.id === promo.id ? { ...p, status: resData.promo.status } : p)));
        showToast(`Promo ${promo.code} is now ${resData.promo.status}`, 'success');
      }
    } catch (err) {
      console.error('Status toggle error:', err);
      showToast(err.message || 'Error changing status', 'error');
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Promo code "${code}" copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Helper for type icons
  const renderTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'flash sale':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'shipping':
        return <Truck className="w-3.5 h-3.5 text-blue-500" />;
      case 'discount':
        return <Percent className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* TOAST ALERT */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 shadow-xl rounded-none border text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 ${
          toast.type === 'success' 
            ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100' 
            : 'bg-red-900/90 border-red-700 text-red-100'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gift className="w-7 h-7 text-amber-500" />
            Promotions & Coupons
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Create and manage campaign vouchers, percentage discounts, flash deals, and free delivery codes.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => {
              setIsSyncing(true);
              fetchPromotions(1, false);
            }}
            disabled={isSyncing}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-none transition-colors border border-amber-200 dark:border-amber-700/60 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-none transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Promo Code
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Campaigns</p>
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{metrics.total_promos} Codes</h3>
            <span className="text-[11px] text-amber-600 font-medium">All active & past</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Gift className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Active Campaigns</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.active_promos} Active</h3>
            <span className="text-[11px] text-gray-400">Ready for checkout</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-gray-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Expired / Inactive</p>
            <h3 className="text-2xl font-extrabold text-gray-600 dark:text-gray-300 mt-1">{metrics.expired_promos} Promos</h3>
            <span className="text-[11px] text-red-500 font-medium">Paused or outdated</span>
          </div>
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Redemptions</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{(metrics.total_redeemed || 0).toLocaleString()} Used</h3>
            <span className="text-[11px] text-amber-600 font-medium">Customer usage count</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER TOOLBAR */}
      <div className="bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700 rounded-none flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search promo code, campaign title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-amber-500 dark:text-white rounded-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-none focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Coupon">Coupon</option>
              <option value="Discount">Discount</option>
              <option value="Shipping">Free Shipping</option>
              <option value="Flash Sale">Flash Sale</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-none focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROMOTIONS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-1/3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 w-2/3"></div>
            </div>
          ))}
        </div>
      ) : promos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-16 text-center space-y-4">
          <Gift className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">No promotions found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">Try adjusting your search filters or click the button above to create a new promo code.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {promos.map((promo) => {
            const isExpired = promo.status === 'Expired';
            const isActive = promo.status === 'Active';

            return (
              <div
                key={promo.id}
                className={`bg-white dark:bg-gray-800 border p-6 shadow-sm flex flex-col justify-between rounded-none transition-all duration-200 hover:shadow-md ${
                  isActive 
                    ? 'border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-600' 
                    : 'border-gray-200/60 dark:border-gray-700/60 opacity-85'
                }`}
              >
                <div>
                  {/* Top Bar: Code and Status Toggle */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 border border-amber-200 dark:border-amber-800/80">
                      <span className="text-amber-700 dark:text-amber-300 font-mono font-bold text-xs tracking-wider">
                        {promo.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        title="Copy promo code"
                        className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 transition-colors ml-1"
                      >
                        {copiedCode === promo.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(promo)}
                      title="Click to toggle status"
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-none transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-200'
                          : isExpired
                          ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}
                    >
                      {promo.status}
                    </button>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    {renderTypeIcon(promo.type)}
                    <span>{promo.type}</span>
                    {promo.min_order_amount > 0 && (
                      <span className="text-gray-400 font-normal text-[10px]">· Min ${promo.min_order_amount}</span>
                    )}
                  </div>

                  {/* Title & Discount Highlight */}
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">{promo.title}</h3>
                  <div className="text-2xl font-black text-amber-500 mb-3 tracking-tight">{promo.discount}</div>

                  {promo.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {promo.description}
                    </p>
                  )}

                  {/* Metadata: Expiry & Usage count */}
                  <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Valid until:</span>
                      </div>
                      <strong className={`font-semibold ${isExpired ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                        {promo.validTill}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        <span>Redemptions:</span>
                      </div>
                      <strong className="text-gray-800 dark:text-gray-200 font-mono">
                        {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : 'times'}
                      </strong>
                    </div>

                    {promo.usageLimit && (
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 mt-1">
                        <div 
                          style={{ width: `${Math.min(100, (promo.usageCount / promo.usageLimit) * 100)}%` }} 
                          className="h-full bg-amber-500"
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="pt-4 mt-5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{promo.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(promo)}
                      className="p-1.5 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                      title="Edit promotion"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(promo)}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      title="Delete promotion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8-ITEM BATCH PAGINATION: LOAD MORE BUTTON */}
      {hasMore && (
        <div className="p-6 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm">
          <button
            onClick={() => fetchPromotions(page + 1, true)}
            disabled={isFetchingMore}
            className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-none shadow-sm transition-colors inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isFetchingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading 8 More Promo Codes...</span>
              </>
            ) : (
              <span>Load 8 More Promo Codes ({promos.length} of {totalCount})</span>
            )}
          </button>
        </div>
      )}

      {/* ADD / EDIT PROMOTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-none my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-500" />
                {editingPromo ? 'Edit Promotion Code' : 'Create New Promotion'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Promo Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-mono font-bold dark:text-white uppercase focus:outline-none focus:border-amber-500 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Campaign Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none cursor-pointer"
                  >
                    <option value="Coupon">Coupon</option>
                    <option value="Discount">Discount</option>
                    <option value="Shipping">Free Shipping</option>
                    <option value="Flash Sale">Flash Sale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. VIP Summer Holiday Discount 25% OFF"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-medium dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Discount Text / Value</label>
                  <input
                    type="text"
                    required
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="25% OFF or $20.00 OFF"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Min Order Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="e.g. 50.00"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-semibold dark:text-white focus:outline-none focus:border-amber-500 rounded-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1">Campaign Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details or terms and conditions..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 p-2.5 text-xs font-medium dark:text-white focus:outline-none focus:border-amber-500 rounded-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-none disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-none shadow-sm transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? 'Update Promotion' : 'Save Promotion'}</span>
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
