import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Filter, Grid, List, 
  Mail, Phone, MapPin, ExternalLink, Edit2, Trash2, 
  Crown, CheckCircle, XCircle, Clock, DollarSign, 
  ShoppingBag, TrendingUp, X, Check, ArrowUpDown, Sparkles
} from 'lucide-react';
import { mockCustomers } from '../data/mockData';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('spent-desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
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
    setTimeout(() => setToast(null), 3000);
  };

  // Metrics calculation
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const vipCustomers = customers.filter(c => c.tier === 'VIP').length;
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  // Filtering & Sorting
  const filteredCustomers = customers
    .filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTier = tierFilter === 'All' || customer.tier === tierFilter;
      const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'spent-desc') return b.totalSpent - a.totalSpent;
      if (sortBy === 'spent-asc') return a.totalSpent - b.totalSpent;
      if (sortBy === 'orders-desc') return b.totalOrders - a.totalOrders;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

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
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
      status: customer.status,
      tier: customer.tier,
      totalSpent: customer.totalSpent,
      totalOrders: customer.totalOrders,
    });
    setIsModalOpen(true);
  };

  // Form Submit Handler
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Please enter customer name and email', 'error');
      return;
    }

    if (editingCustomer) {
      // Edit existing customer
      setCustomers(customers.map(c => c.id === editingCustomer.id ? {
        ...c,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        status: formData.status,
        tier: formData.tier,
      } : c));
      showToast(`Updated customer "${formData.name}" successfully!`);
    } else {
      // Add new customer
      const newCust = {
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '+1 (555) 000-0000',
        location: formData.location || 'Unknown Location',
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        status: formData.status,
        tier: formData.tier,
        totalOrders: 0,
        totalSpent: 0,
        joinDate: 'Just now',
        lastActive: 'Just now',
      };
      setCustomers([newCust, ...customers]);
      showToast(`New customer "${formData.name}" added successfully!`);
    }
    setIsModalOpen(false);
  };

  // Delete Customer Handler
  const handleDeleteCustomer = (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      setCustomers(customers.filter(c => c.id !== id));
      showToast(`Customer "${name}" removed`);
    }
  };

  // Status Change Handler
  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : currentStatus === 'Inactive' ? 'Blocked' : 'Active';
    setCustomers(customers.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    showToast(`Status updated to ${nextStatus}`);
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
            Monitor customer activity, tiers, total spend, and order history
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-none bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-200 text-sm shrink-0"
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalCustomers}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +12.4% this month
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{activeCustomers}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle className="w-3.5 h-3.5" /> {((activeCustomers / totalCustomers) * 100).toFixed(0)}% engagement
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
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{vipCustomers}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              <Crown className="w-3.5 h-3.5" /> Top Spenders
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
            <h3 className="text-3xl font-black text-amber-500">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">
              Avg: ${(totalRevenue / totalCustomers).toFixed(0)} / customer
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
            placeholder="Search by name, email, phone..."
            className="w-full pl-11 pr-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 transition-colors text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
              <option value="Blocked" className="dark:bg-gray-800">Blocked</option>
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
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 p-1 rounded-none border border-gray-200 dark:border-gray-700 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-none transition-all ${
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
              className={`p-2 rounded-none transition-all ${
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

      {/* Customer Display Section */}
      {filteredCustomers.length === 0 ? (
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
          {filteredCustomers.map((customer) => (
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
                      className="w-16 h-16 rounded-none object-cover shadow-sm border border-gray-100 dark:border-gray-700"
                    />
                    {customer.tier === 'VIP' && (
                      <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-none shadow-md">
                        <Crown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-none text-xs font-bold border ${getTierBadge(customer.tier)}`}>
                      {customer.tier}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(customer.id, customer.status)}
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
                    <span className="font-extrabold text-base text-amber-500">${customer.totalSpent.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  onClick={() => navigate(`/customer-order/${encodeURIComponent(customer.name)}`)}
                  className="flex-1 py-2.5 px-3 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(customer)}
                  className="p-2.5 rounded-none border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Edit Customer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                  className="p-2.5 rounded-none border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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
                {filteredCustomers.map((customer) => (
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
                          onClick={() => handleToggleStatus(customer.id, customer.status)}
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
                      ${customer.totalSpent.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/customer-order/${encodeURIComponent(customer.name)}`)}
                          className="px-3 py-1.5 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="p-1.5 rounded-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                          className="p-1.5 rounded-none text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
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
                className="p-2 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, State"
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
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
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
                    className="w-full px-4 py-2.5 rounded-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-none border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-none bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md text-sm transition-all"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
