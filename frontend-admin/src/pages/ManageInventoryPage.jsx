import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FileText, 
  BarChart2, 
  Users, 
  Tag, 
  ChevronDown, 
  RefreshCw,
  PackageCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  History,
  Download,
  Edit3,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, '')) || 'http://127.0.0.1:8000/api';

const resolveImageUrl = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const baseUrl = (import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://127.0.0.1:8000').replace(/\/$/, '');
  return `${baseUrl}/${img.replace(/^\//, '')}`;
};

export default function ManageInventoryPage() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'overview'

  // Timeframe states for analytics
  const [timeframeStats, setTimeframeStats] = useState('This Month');
  const [timeframeHabits, setTimeframeHabits] = useState('This year');
  const [timeframeGrowth, setTimeframeGrowth] = useState('Today');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Stock Audit States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Data States
  const [stockItems, setStockItems] = useState([]);
  const [auditMetrics, setAuditMetrics] = useState({
    totalSkus: 0,
    healthyStockCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValuation: 0,
  });

  // Analytics API States
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalVisitors: 0,
    totalProductsSold: 0,
    categoryStatistics: [],
    habitsData: [],
    countryGrowth: [],
  });

  // Pagination & Loading States
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modal & Edit States
  const [editingItem, setEditingItem] = useState(null);
  const [adjustmentCount, setAdjustmentCount] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [toast, setToast] = useState(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'Manager Alex', action: 'Restocked +10 units', sku: 'BU-CTC-08', time: '10:14 AM' },
    { id: 2, user: 'Audit System', action: 'Low stock threshold triggered', sku: 'CE-GHE-11', time: '09:45 AM' },
    { id: 3, user: 'Staff Sarah', action: 'Physical count verified', sku: 'TO-PMS-13', time: 'Yesterday' }
  ]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Fetch Categories for Filter Dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          const list = data.categories?.data || (Array.isArray(data.categories) ? data.categories : []);
          setCategoriesList(list);
        }
      } catch (err) {
        console.warn('Could not load categories list:', err);
      }
    };
    fetchCats();
  }, []);

  // 2. Fetch Stock Audit Data (8 items per batch)
  const fetchAuditData = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setIsLoadingAudit(true);
    else setIsFetchingMore(true);

    try {
      const params = new URLSearchParams({
        per_page: '8',
        page: pageNum.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (selectedStatus !== 'All') {
        params.append('status', selectedStatus);
      }

      const res = await fetch(`${API_BASE_URL}/inventory/audit?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load stock audit registry');

      const data = await res.json();

      if (data.success && Array.isArray(data.stockItems)) {
        if (append) {
          setStockItems(prev => [...prev, ...data.stockItems]);
        } else {
          setStockItems(data.stockItems);
        }

        if (data.metrics) {
          setAuditMetrics(data.metrics);
        }
        setHasMore(data.hasMore || false);
        setPage(data.currentPage || pageNum);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching stock audit data:', err);
      showToast(err.message || 'Error loading stock audit records', 'error');
    } finally {
      setIsLoadingAudit(false);
      setIsFetchingMore(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  // 3. Fetch Analytics Data
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/analytics`);
      if (!res.ok) throw new Error('Failed to load inventory analytics');

      const data = await res.json();
      if (data.success && data.analytics) {
        setAnalyticsData(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      showToast('Error loading analytics statistics', 'error');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  // Trigger search / filters
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuditData(1, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAuditData]);

  // Load analytics when switching to overview tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalyticsData();
    }
  }, [activeTab, fetchAnalyticsData]);

  // Sync All Data handler
  const handleSyncData = async () => {
    setIsSyncing(true);
    await Promise.all([
      fetchAuditData(1, false),
      fetchAnalyticsData(),
    ]);
    setIsSyncing(false);
    showToast('Inventory and Analytics synchronized successfully!', 'success');
  };

  // Handle Quick Stock Adjustments (+5, -1)
  const handleQuickAdjust = async (item, delta) => {
    try {
      const targetId = item.db_id || item.id;
      const res = await fetch(`${API_BASE_URL}/inventory/adjust-stock/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          delta: delta,
          note: delta > 0 ? `Restocked +${delta} units` : `Adjusted ${delta} units`,
        }),
      });

      if (!res.ok) throw new Error('Failed to update stock');
      const resData = await res.json();

      if (resData.success && resData.item) {
        setStockItems(prev => prev.map(p => (p.id === item.id ? { ...p, ...resData.item } : p)));

        // Update local metrics
        setAuditMetrics(prev => {
          const newStock = resData.newStock;
          const oldStock = resData.oldStock;
          const diffValuation = (newStock - oldStock) * (item.price || 0);
          return {
            ...prev,
            totalValuation: Math.max(0, (prev.totalValuation || 0) + diffValuation),
          };
        });

        // Add to audit log
        setAuditLogs(prev => [
          {
            id: Date.now(),
            user: 'Admin User',
            action: delta > 0 ? `Restocked +${delta} units` : `Adjusted ${delta} units`,
            sku: item.id,
            time: 'Just now',
          },
          ...prev.slice(0, 4),
        ]);

        showToast(`Stock for ${item.name} updated to ${resData.newStock} units!`, 'success');
      }
    } catch (err) {
      console.error('Error adjusting stock:', err);
      showToast(err.message || 'Error updating stock level', 'error');
    }
  };

  // Handle Modal Save (Exact Physical Count)
  const saveModalAdjustment = async () => {
    if (!editingItem) return;
    setIsSavingStock(true);

    try {
      const targetId = editingItem.db_id || editingItem.id;
      const res = await fetch(`${API_BASE_URL}/inventory/adjust-stock/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          stock: Math.max(0, adjustmentCount),
          note: adjustmentNote || 'Physical count verified during audit',
        }),
      });

      if (!res.ok) throw new Error('Failed to save audit stock count');
      const resData = await res.json();

      if (resData.success && resData.item) {
        setStockItems(prev => prev.map(p => (p.id === editingItem.id ? { ...p, ...resData.item } : p)));

        // Add to audit log
        setAuditLogs(prev => [
          {
            id: Date.now(),
            user: 'Audit Officer',
            action: `Physical count set to ${adjustmentCount} (${adjustmentNote || 'Audit log'})`,
            sku: editingItem.id,
            time: 'Just now',
          },
          ...prev.slice(0, 4),
        ]);

        showToast(`Audited count for ${editingItem.name} saved successfully!`, 'success');
        setEditingItem(null);
        setAdjustmentNote('');
      }
    } catch (err) {
      console.error('Save audit error:', err);
      showToast(err.message || 'Error saving audit record', 'error');
    } finally {
      setIsSavingStock(false);
    }
  };

  // Export CSV Sheet
  const handleExportCSV = () => {
    if (stockItems.length === 0) {
      showToast('No items available to export', 'error');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Category', 'Brand', 'Unit Cost ($)', 'Selling Price ($)', 'Current Stock', 'Min Threshold', 'Status', 'Last Audited'];
    const rows = stockItems.map(item => [
      `"${item.id}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.brand}"`,
      item.unitCost.toFixed(2),
      item.price.toFixed(2),
      item.stock,
      item.minStock,
      item.stock === 0 ? 'Out of Stock' : item.stock <= item.minStock ? 'Low Stock' : 'In Stock',
      `"${item.lastAudited}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit sheet exported successfully!', 'success');
  };

  // SVG Pie chart calculation for Category Breakdown
  const pieSlices = useMemo(() => {
    const categories = analyticsData.categoryStatistics || [];
    if (categories.length === 0) return [];

    let accumulatedPercentage = 0;
    const circumference = 251.3; // 2 * pi * 40

    return categories.map((cat) => {
      const pct = cat.percentage || 0;
      const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
      accumulatedPercentage += pct;

      return {
        ...cat,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [analyticsData.categoryStatistics]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* TOAST NOTIFICATION */}
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

      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-none shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Management Inventory</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Real-time overview of inventory metrics, sales statistics & stock audit</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Tabs */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-1 rounded-none border border-gray-200 dark:border-gray-600">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('audit')} 
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Stock Audit ({auditMetrics.lowStockCount + auditMetrics.outOfStockCount > 0 ? `${auditMetrics.lowStockCount + auditMetrics.outOfStockCount} Alerts` : 'Healthy'})
            </button>
          </div>

          <button 
            onClick={handleSyncData}
            disabled={isSyncing}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-none transition-colors border border-amber-200 dark:border-amber-700/60 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>
      </div>


      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'overview' && (
        <>
          {isLoadingAnalytics ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-44 bg-gray-200 dark:bg-gray-800 rounded-none"></div>
              ))}
            </div>
          ) : (
            <>
              {/* MAIN DASHBOARD GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT COLUMN: 2x2 Metric Cards (Span 7) */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* CARD 1: TOTAL SALES */}
                  <div className="relative overflow-hidden bg-[#78350F] dark:bg-[#451A03] text-white p-6 rounded-none shadow-md border border-amber-900/80 flex flex-col justify-between h-[210px] group transition-all duration-300">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    <div className="flex items-center justify-between z-10">
                      <div className="w-12 h-12 rounded-none bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-sm">
                        <FileText className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-amber-400 text-gray-950 shadow-sm">
                        +20.9%
                      </span>
                    </div>

                    <div className="z-10 mt-4">
                      <p className="text-xs font-medium text-amber-200 uppercase tracking-wider">Total Sales</p>
                      <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-white">
                        ${(analyticsData.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>

                    <div className="z-10 text-[11px] text-amber-200/70 font-medium flex items-center gap-1.5">
                      <span>Live store revenue from orders</span>
                    </div>
                  </div>

                  {/* CARD 2: TOTAL ORDERS */}
                  <div className="relative overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-[210px] group transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

                    <div className="flex items-center justify-between z-10">
                      <div className="w-12 h-12 rounded-none bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-gray-600">
                        <BarChart2 className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-amber-500 text-white shadow-sm">
                        +10.9%
                      </span>
                    </div>

                    <div className="z-10 mt-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                      <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
                        {(analyticsData.totalOrders || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                      <span>Customer orders recorded in DB</span>
                    </div>
                  </div>

                  {/* CARD 3: TOTAL VISITORS */}
                  <div className="relative overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-[210px] group transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

                    <div className="flex items-center justify-between z-10">
                      <div className="w-12 h-12 rounded-none bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-gray-600">
                        <Users className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-emerald-500 text-white shadow-sm">
                        +14.2%
                      </span>
                    </div>

                    <div className="z-10 mt-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
                      <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
                        {(analyticsData.totalVisitors || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                      <span>Active user visits & accounts</span>
                    </div>
                  </div>

                  {/* CARD 4: TOTAL PRODUCTS SOLD */}
                  <div className="relative overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-[210px] group transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

                    <div className="flex items-center justify-between z-10">
                      <div className="w-12 h-12 rounded-none bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-gray-600">
                        <Tag className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-amber-500 text-white shadow-sm">
                        +20.9%
                      </span>
                    </div>

                    <div className="z-10 mt-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Products Sold</p>
                      <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">
                        {(analyticsData.totalProductsSold || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                      <span>Total items fulfilled across catalog</span>
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: PRODUCT STATISTIC */}
                <div className="lg:col-span-5 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:from-amber-950 dark:via-gray-800 dark:to-gray-900 p-6 rounded-none shadow-sm border border-amber-200 dark:border-amber-900/60 flex flex-col justify-between min-h-[440px]">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Statistic</h2>
                      <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-medium mt-0.5">Category distribution & catalog volume</p>
                    </div>

                    <div className="relative">
                      <select 
                        value={timeframeStats}
                        onChange={(e) => setTimeframeStats(e.target.value)}
                        className="appearance-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 pr-7 rounded-none border border-amber-300 dark:border-gray-600 shadow-sm focus:outline-none cursor-pointer"
                      >
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  {/* SVG Pie Chart Section */}
                  <div className="my-6 flex justify-center items-center relative">
                    <div className="w-56 h-56 relative flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 filter drop-shadow-sm">
                        {pieSlices.map((slice, idx) => (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="20"
                            strokeDasharray={slice.strokeDasharray}
                            strokeDashoffset={slice.strokeDashoffset}
                            className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                          />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Category Metrics List */}
                  <div className="space-y-3 pt-2 border-t border-amber-200/80 dark:border-white/10">
                    {(analyticsData.categoryStatistics || []).map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span style={{ backgroundColor: cat.color }} className="w-3 h-3 inline-block"></span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-gray-900 dark:text-white">{cat.count} SKUs</span>
                          <span className="px-2.5 py-0.5 rounded-none text-[11px] font-bold bg-amber-500 text-white">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* BOTTOM DASHBOARD GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* CUSTOMER HABITS */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Habits</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track your customers viewing vs buying trends</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-400 inline-block"></span>
                          <span className="text-gray-600 dark:text-gray-300">Seen Products</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-amber-700 inline-block"></span>
                          <span className="text-gray-600 dark:text-gray-300">Sales</span>
                        </div>
                      </div>

                      <div className="relative">
                        <select 
                          value={timeframeHabits}
                          onChange={(e) => setTimeframeHabits(e.target.value)}
                          className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 pr-7 rounded-none border border-gray-200 dark:border-gray-600 focus:outline-none cursor-pointer"
                        >
                          <option value="This year">This year</option>
                          <option value="Last year">Last year</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 absolute right-2 top-2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-6">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-xs text-gray-400 dark:text-gray-500 font-medium">
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>50K</span></div>
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>40K</span></div>
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>30K</span></div>
                      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>20K</span></div>
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1"><span>0K</span></div>
                    </div>

                    <div className="h-64 pl-10 pr-2 flex items-end justify-between relative z-10">
                      {(analyticsData.habitsData || []).map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group relative">
                          {hoveredBar === idx && (
                            <div className="absolute -top-12 bg-gray-900 text-white text-[10px] font-bold py-1 px-2.5 shadow-lg whitespace-nowrap z-20 pointer-events-none">
                              Seen: {item.seenRaw} | Sales: {item.salesRaw}
                            </div>
                          )}
                          <div 
                            className="flex items-end gap-1.5 cursor-pointer"
                            onMouseEnter={() => setHoveredBar(idx)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            <div style={{ height: `${Math.min(220, (item.seen / 50) * 220)}px` }} className="w-5 sm:w-6 bg-amber-400 transition-all duration-300 group-hover:bg-amber-500 shadow-sm"></div>
                            <div style={{ height: `${Math.min(220, (item.sales / 50) * 220)}px` }} className="w-5 sm:w-6 bg-amber-700 transition-all duration-300 group-hover:bg-amber-800 shadow-sm"></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-2">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CUSTOMER GROWTH */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Growth</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribution by registered customer location</p>
                    </div>
                    <div className="relative">
                      <select 
                        value={timeframeGrowth}
                        onChange={(e) => setTimeframeGrowth(e.target.value)}
                        className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 pr-7 rounded-none border border-gray-200 dark:border-gray-600 focus:outline-none cursor-pointer"
                      >
                        <option value="Today">Today</option>
                        <option value="This Week">This Week</option>
                        <option value="This Month">This Month</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 absolute right-2 top-2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-4 my-auto">
                    {(analyticsData.countryGrowth || []).map((country, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                            <span className="text-base leading-none">{country.flag}</span>
                            <span className="font-semibold">{country.name}</span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">{country.count} orders</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden">
                          <div style={{ width: `${country.percent}%` }} className="h-full bg-amber-500 dark:bg-amber-400 rounded-none transition-all duration-700"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}
        </>
      )}


      {/* TAB 2: STOCK AUDIT PAGE DESIGN */}
      {activeTab === 'audit' && (
        <div className="space-y-6">

          {/* STOCK AUDIT KPI STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total SKUs Audited</p>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{auditMetrics.totalSkus} SKUs</h3>
                <span className="text-[11px] text-amber-600 font-medium">100% Database verified</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <PackageCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Healthy Stock</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{auditMetrics.healthyStockCount} Items</h3>
                <span className="text-[11px] text-gray-400">Stock above threshold</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-gray-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Low Stock Alert</p>
                <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{auditMetrics.lowStockCount} Items</h3>
                <span className="text-[11px] text-amber-600 font-medium">Reorder recommended</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Out of Stock</p>
                <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{auditMetrics.outOfStockCount} Items</h3>
                <span className="text-[11px] text-red-500 font-medium">Urgent action required</span>
              </div>
              <div className="w-12 h-12 bg-red-50 dark:bg-gray-700 flex items-center justify-center text-red-600 dark:text-red-400">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>


          {/* SEARCH & AUDIT FILTER TOOLBAR */}
          <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by SKU, product name, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-none focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-none focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
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
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock Alert</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-none shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Audit Sheet
              </button>
            </div>

          </div>


          {/* STOCK AUDIT TABLE AND ACTIVITY LOG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* AUDIT TABLE (Span 8) */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Inventory Audit Registry</h3>
                <span className="text-xs font-semibold text-gray-500">
                  Showing {stockItems.length} of {totalCount} items
                </span>
              </div>

              {isLoadingAudit ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-none"></div>
                  ))}
                </div>
              ) : stockItems.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">
                  No products matched the audit criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 font-bold uppercase border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="py-3.5 px-4">Item & SKU</th>
                        <th className="py-3.5 px-4">Category / Brand</th>
                        <th className="py-3.5 px-4">Unit Cost / Price</th>
                        <th className="py-3.5 px-4">Current Stock</th>
                        <th className="py-3.5 px-4">Audit Status</th>
                        <th className="py-3.5 px-4 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {stockItems.map((item) => {
                        const isOut = item.stock === 0;
                        const isLow = item.stock > 0 && item.stock <= item.minStock;

                        return (
                          <tr key={item.id} className="hover:bg-amber-50/30 dark:hover:bg-gray-700/40 transition-colors">
                            
                            {/* Item & SKU */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={resolveImageUrl(item.image)} 
                                  alt={item.name} 
                                  className="w-10 h-10 object-cover border border-gray-200 dark:border-gray-600 rounded-none bg-gray-100"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80';
                                  }}
                                />
                                <div>
                                  <div className="font-bold text-gray-900 dark:text-white text-xs">{item.name}</div>
                                  <div className="text-[10px] font-mono text-gray-400">{item.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Category / Brand */}
                            <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">
                              <div>{item.category}</div>
                              <div className="text-[10px] text-amber-600 font-semibold">{item.brand}</div>
                            </td>

                            {/* Unit Cost / Price */}
                            <td className="py-3.5 px-4 font-medium">
                              <div className="text-gray-900 dark:text-white font-bold">${item.price.toFixed(2)}</div>
                              <div className="text-[10px] text-gray-400">Cost: ${item.unitCost.toFixed(2)}</div>
                            </td>

                            {/* Stock Level Progress */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1 w-28">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-gray-900 dark:text-white'}>
                                    {item.stock} units
                                  </span>
                                  <span className="text-[10px] text-gray-400">Min: {item.minStock}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden">
                                  <div 
                                    style={{ width: `${Math.min(100, (item.stock / item.maxStock) * 100)}%` }}
                                    className={`h-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  ></div>
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-none">
                                  <XCircle className="w-3 h-3" /> Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-none">
                                  <AlertTriangle className="w-3 h-3" /> Low Stock ({item.stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-none">
                                  <CheckCircle2 className="w-3 h-3" /> Healthy ({item.stock})
                                </span>
                              )}
                            </td>

                            {/* Quick Action */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleQuickAdjust(item, -1)}
                                  title="Deduct 1 Stock"
                                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center rounded-none font-bold text-xs"
                                >
                                  -
                                </button>
                                <button 
                                  onClick={() => handleQuickAdjust(item, +5)}
                                  title="Restock +5"
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-none"
                                >
                                  +5
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingItem(item);
                                    setAdjustmentCount(item.stock);
                                  }}
                                  title="Edit Stock Count"
                                  className="w-7 h-7 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center rounded-none"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 8-ITEM BATCH PAGINATION: LOAD MORE BUTTON */}
              {hasMore && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/60">
                  <button
                    onClick={() => fetchAuditData(page + 1, true)}
                    disabled={isFetchingMore}
                    className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-gray-600 transition-colors shadow-xs inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isFetchingMore ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading 8 More Items...</span>
                      </>
                    ) : (
                      <>
                        <span>Load 8 More Items ({stockItems.length} of {totalCount})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>


            {/* AUDIT LOG TIMELINE (Span 4) */}
            <div className="lg:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Audit Log History</h3>
                </div>
                <span className="text-[10px] text-amber-600 font-bold">Real-time</span>
              </div>

              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600/60 rounded-none flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{log.action}</div>
                      <div className="text-[11px] font-mono text-amber-600 font-semibold mt-0.5">{log.sku}</div>
                      <div className="text-[10px] text-gray-400 mt-1">By {log.user}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">{log.time}</span>
                  </div>
                ))}
              </div>

              {/* Audit Summary Box */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-none space-y-2 mt-6">
                <div className="font-bold text-xs text-amber-800 dark:text-amber-300 uppercase">Inventory Valuation</div>
                <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">
                  ${(auditMetrics.totalValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">Total estimated value of current inventory in stock.</p>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* MODAL FOR STOCK COUNT EDIT */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Audit Physical Count</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <img 
                  src={resolveImageUrl(editingItem.image)} 
                  alt={editingItem.name} 
                  className="w-12 h-12 object-cover bg-gray-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">{editingItem.name}</div>
                  <div className="text-xs font-mono text-amber-600">{editingItem.id}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">New Physical Count</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAdjustmentCount(prev => Math.max(0, prev - 1))}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-lg rounded-none hover:bg-gray-300"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={adjustmentCount}
                    onChange={(e) => setAdjustmentCount(parseInt(e.target.value) || 0)}
                    className="flex-1 text-center font-extrabold text-lg py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    onClick={() => setAdjustmentCount(prev => prev + 1)}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold text-lg rounded-none hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 dark:text-gray-300 mb-1.5">Audit Note / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Verified during Q3 physical count"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setEditingItem(null)} 
                disabled={isSavingStock}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={saveModalAdjustment} 
                disabled={isSavingStock}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingStock ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Audit Record</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
