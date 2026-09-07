import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Filter, Grid, List, 
  Mail, Phone, MapPin, ExternalLink, Edit2, Trash2, 
  Crown, CheckCircle, XCircle, Clock, DollarSign, 
  ShoppingBag, TrendingUp, X, Check, ArrowUpDown, Sparkles,
  Loader2, RefreshCw
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

export default function CustomersPage() {
  const navigate = useNavigate();
  
  // Data & Pagination States (8-items per batch)
  const [customers, setCustomers] = useState([]);
  const [metrics, setMetrics] = useState({
    total_customers: 0,
    active_customers: 0,
    vip_customers: 0,
    total_revenue: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters & View Modes
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('spent-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'Active',
    tier: 'Regular',
    totalSpent: 0,
    totalOrders: 0,
  });

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Customers from Backend API
  const fetchCustomers = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('per_page', '8');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());
      if (tierFilter !== 'All') params.append('tier', tierFilter);
      if (sortBy) params.append('sort_by', sortBy);
      params.append('_t', Date.now().toString());

      const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
        cache: 'no-store'
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      let customerList = [];
      if (Array.isArray(data.customers)) {
        customerList = data.customers;
      } else if (Array.isArray(data.User)) {
        customerList = data.User.map((u) => ({
          id: `CUST-${String(u.id).padStart(3, '0')}`,
          db_id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '+855 (0) 12 345 678',
          location: 'Phnom Penh, Cambodia',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f59e0b&color=fff&size=150`,
          status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Active',
          tier: 'Regular',
          totalOrders: 0,
          totalSpent: 0,
          joinDate: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent',
          lastActive: 'Just now',
        }));
      }

      if (append) {
        setCustomers((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const uniqueNew = customerList.filter((c) => !existingIds.has(c.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setCustomers(customerList);
      }

      if (data.metrics) {
        setMetrics(data.metrics);
      } else {
        setMetrics({
          total_customers: data.total || customerList.length,
          active_customers: customerList.filter(c => c.status === 'Active').length,
          vip_customers: customerList.filter(c => c.tier === 'VIP').length,
          total_revenue: customerList.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        });
      }
      setHasMore(Boolean(data.hasMore));
      setPage(data.currentPage || pageNum);
      setTotalCount(data.total || customerList.length);
    } catch (err) {
      console.error('Error fetching customers from API:', err);
      showToast('Could not load customers from server', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, statusFilter, tierFilter, sortBy]);

  // Initial & Filter Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1, false);
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Load 8 More Customers
  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore) return;
    fetchCustomers(page + 1, true);
  };

  // Modal Open Handlers
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      location: '',
      status: 'Active',
      tier: 'Regular',
      totalSpent: 0,
      totalOrders: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      location: customer.location || '',
      status: customer.status || 'Active',
      tier: customer.tier || 'Regular',
      totalSpent: customer.totalSpent || 0,
      totalOrders: customer.totalOrders || 0,
    });
    setIsModalOpen(true);
  };

  // Form Submit Handler (Create & Update API directly to MySQL)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please enter customer name and email', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCustomer) {
        // UPDATE Existing Customer via PUT directly to MySQL
        const targetId = editingCustomer.db_id || editingCustomer.id.toString().replace('CUST-', '');
        const res = await fetch(`${API_BASE_URL}/users/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            location: formData.location.trim(),
            status: formData.status.toLowerCase(),
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to update customer in database');
        }

        showToast(`Customer "${formData.name}" updated in database!`, 'success');
      } else {
        // CREATE New Customer via POST directly to MySQL
        const res = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            location: formData.location.trim(),
            status: formData.status.toLowerCase(),
            tier: formData.tier,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create customer in database');
        }

        showToast(`New customer "${formData.name}" saved to database!`, 'success');
      }
      setIsModalOpen(false);
      // Refresh list from database
      fetchCustomers(1, false);
    } catch (err) {
      console.error('Customer submit error:', err);
      showToast(err.message || 'Error saving customer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Customer Handler directly from MySQL
  const handleDeleteCustomer = async (id, name, dbId) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}" from database?`)) {
      return;
    }

    try {
      const targetId = dbId || id.toString().replace('CUST-', '');
      const res = await fetch(`${API_BASE_URL}/users/${targetId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete customer from database');
      }

      showToast(`Customer "${name}" removed from database`, 'success');
      fetchCustomers(1, false);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete customer', 'error');
    }
  };

  // Status Change Handler (Toggle between Active and Inactive in MySQL)
  const handleToggleStatus = async (id, currentStatus, dbId) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    
    // Instant optimistic UI Update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      const targetId = dbId || id.toString().replace('CUST-', '');
      await fetch(`${API_BASE_URL}/users/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus.toLowerCase() }),
      });
      showToast(`Status updated to ${nextStatus} in database`);
    } catch (err) {
      console.warn('Status update API error:', err);
    }
  };

  // Tier Badge Color Helper
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'VIP':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-700/50';
      case 'New':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700/50';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  // Status Badge Color Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      case 'Blocked':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col min-h-screen transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-none shadow-xl border flex items-center gap-3 transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-rose-600 text-white border-rose-700' 
            : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-gray-800 dark:border-gray-200'
        }`}>
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Customer Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real database customer accounts, VIP tiers, total spent, and order history
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-none bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 text-sm shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Customers</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {isLoading ? '...' : (metrics.total_customers ?? customers.length)}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> Real database count
            </span>
          </div>
          <div className="w-14 h-14 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Accounts</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {isLoading ? '...' : (metrics.active_customers ?? customers.filter(c => c.status === 'Active').length)}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle className="w-3.5 h-3.5" /> Active in database
            </span>
          </div>
          <div className="w-14 h-14 rounded-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">VIP Members</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {isLoading ? '...' : (metrics.vip_customers ?? customers.filter(c => c.tier === 'VIP').length)}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              <Crown className="w-3.5 h-3.5" /> Orders ≥ $500
            </span>
          </div>
          <div className="w-14 h-14 rounded-none bg-amber-100/50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
            <Crown className="w-7 h-7" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-amber-500">
              {isLoading ? '...' : `$${Number(metrics.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
              <DollarSign className="w-3.5 h-3.5" /> All customer orders
            </span>
          </div>
          <div className="w-14 h-14 rounded-none bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-none p-4 md:p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, city..."
            className="w-full pl-11 pr-8 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-3">
          
          {/* Tier Filter */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-none border border-gray-200 dark:border-gray-700 text-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tier:</span>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-gray-800">All Tiers</option>
              <option value="VIP" className="dark:bg-gray-800">VIP</option>
              <option value="Regular" className="dark:bg-gray-800">Regular</option>
              <option value="New" className="dark:bg-gray-800">New</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-none border border-gray-200 dark:border-gray-700 text-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All" className="dark:bg-gray-800">All Statuses</option>
              <option value="Active" className="dark:bg-gray-800">Active</option>
              <option value="Inactive" className="dark:bg-gray-800">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-none border border-gray-200 dark:border-gray-700 text-sm">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-gray-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="spent-desc" className="dark:bg-gray-800">Top Spent</option>
              <option value="spent-asc" className="dark:bg-gray-800">Lowest Spent</option>
              <option value="orders-desc" className="dark:bg-gray-800">Most Orders</option>
              <option value="name-asc" className="dark:bg-gray-800">Name (A-Z)</option>
              <option value="newest" className="dark:bg-gray-800">Newest First</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-none border border-gray-200 dark:border-gray-700 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-none transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-none transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Loading Skeleton State (8 Cards or 8 Rows) */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col justify-between h-96">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-none" />
                    <div className="flex flex-col gap-1.5 items-end">
                      <div className="w-12 h-5 bg-gray-200 dark:bg-gray-700 rounded-none" />
                      <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-none" />
                    </div>
                  </div>
                  <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded-none mb-2" />
                  <div className="w-1/3 h-3 bg-gray-100 dark:bg-gray-800 rounded-none mb-4" />
                  <div className="space-y-2 mb-6">
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-none" />
                    <div className="w-2/3 h-3 bg-gray-100 dark:bg-gray-800 rounded-none" />
                    <div className="w-1/2 h-3 bg-gray-100 dark:bg-gray-800 rounded-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-none">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-none" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-none" />
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-none" />
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-none" />
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-none" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-6 space-y-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-12 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-none" />
            ))}
          </div>
        )
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-none p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No customers found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
            No customers match your current search and filter criteria. Try clearing your filters or adding a new customer.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-gray-800 rounded-none p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Top Row: Avatar & Badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=f59e0b&color=fff&size=150`;
                      }}
                      className="w-16 h-16 rounded-none object-cover shadow-sm border border-gray-100 dark:border-gray-700"
                    />
                    {customer.tier === 'VIP' && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-none shadow-md" title="VIP Customer">
                        <Crown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold border ${getTierBadge(customer.tier)}`}>
                      {customer.tier}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(customer.id, customer.status, customer.db_id)}
                      className={`px-2.5 py-0.5 rounded-none text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadge(customer.status)}`}
                      title="Click to toggle status"
                    >
                      {customer.status}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                  {customer.name}
                </h3>
                <p className="text-xs text-gray-400 mb-4">{customer.id}</p>

                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 mb-6">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{customer.location}</span>
                  </div>
                </div>

                {/* Spending & Orders Stats */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-none bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/50 mb-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Orders</span>
                    <span className="font-extrabold text-base text-gray-900 dark:text-white">{customer.totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Total Spent</span>
                    <span className="font-extrabold text-base text-amber-500">${Number(customer.totalSpent || 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  onClick={() => navigate(`/customer-order/${encodeURIComponent(customer.name)}`)}
                  className="flex-1 py-2.5 px-3 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(customer)}
                  className="p-2.5 rounded-none border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  title="Edit Customer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id, customer.name, customer.db_id)}
                  className="p-2.5 rounded-none border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (

        /* TABLE VIEW */
        <div className="bg-white dark:bg-gray-800 rounded-none border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 text-xs uppercase font-bold tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Tier & Status</th>
                  <th className="py-4 px-6 text-center">Orders</th>
                  <th className="py-4 px-6 text-right">Total Spent</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {customers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    {/* Name & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=f59e0b&color=fff&size=150`;
                          }}
                          className="w-10 h-10 rounded-none object-cover shadow-sm shrink-0"
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                            {customer.name}
                          </div>
                          <div className="text-xs text-gray-400">{customer.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-6">
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.phone}</div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-xs font-medium">
                      {customer.location}
                    </td>

                    {/* Tier & Status */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold border ${getTierBadge(customer.tier)}`}>
                          {customer.tier}
                        </span>
                        <button
                          onClick={() => handleToggleStatus(customer.id, customer.status, customer.db_id)}
                          className={`px-2.5 py-0.5 rounded-none text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadge(customer.status)}`}
                          title="Click to change status"
                        >
                          {customer.status}
                        </button>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="py-4 px-6 text-center font-bold text-gray-900 dark:text-white">
                      {customer.totalOrders}
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-6 text-right font-black text-amber-500 text-base">
                      ${Number(customer.totalSpent || 0).toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/customer-order/${encodeURIComponent(customer.name)}`)}
                          className="px-3 py-1.5 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="p-1.5 rounded-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id, customer.name, customer.db_id)}
                          className="p-1.5 rounded-none text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination & Load More Section (8 data per fetch) */}
      {!isLoading && customers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div>
            Showing <span className="font-bold text-gray-900 dark:text-white">{customers.length}</span> of{' '}
            <span className="font-bold text-gray-900 dark:text-white">{totalCount}</span> total customers (8 per batch)
          </div>

          <div>
            {hasMore ? (
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-none shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading 8 More Customers...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Load 8 More Customers</span>
                  </>
                )}
              </button>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                All customers loaded ({customers.length} total)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-none max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                {editingCustomer ? 'Edit Customer Info' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. eleanor@example.com"
                  className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location / City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Phnom Penh, Cambodia"
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
                  >
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="New">New</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-none border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-none bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md text-sm transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>{editingCustomer ? 'Save Changes' : 'Create Customer'}</span>
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
