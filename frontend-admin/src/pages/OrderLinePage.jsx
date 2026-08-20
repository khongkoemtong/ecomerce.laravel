import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Plus,
  X,
  Check,
  Filter,
  Package,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit2,
  Trash2
} from 'lucide-react';
import { initialOrdersData } from '../data/ordersData';

export default function OrderLinePage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All Time');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Dropdown & Modal states
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedFile, setImportedFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importStatusMessage, setImportStatusMessage] = useState('');

  // Handle Updating Order Status
  const handleUpdateOrderStatus = (orderId, dbId, newStatus) => {
    // 1. Immediately update UI state for instant responsiveness
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, statusType: newStatus.toLowerCase() } : o))
    );

    // 2. Determine target ID for backend (prefer db_id, fallback to orderId string)
    const targetId = dbId || orderId.replace('#', '').trim();

    // 3. Put update request to backend database API
    fetch(`http://127.0.0.1:8000/api/orders-list/${encodeURIComponent(targetId)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus.toLowerCase() }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.status) {
          // Confirm state with backend response
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: data.status, statusType: data.status.toLowerCase() } : o))
          );
        }
      })
      .catch((err) => console.warn('Status update API error:', err));
  };

  // New Order Form State
  const [newOrderForm, setNewOrderForm] = useState({
    customer: '',
    salesChannel: 'Amazon',
    destination: 'International',
    itemName: '',
    sku: '',
    onHand: 50
  });

  const channelRef = useRef(null);
  const statusRef = useRef(null);
  const dateRef = useRef(null);
  const moreFiltersRef = useRef(null);

  // Pagination & Infinite Scroll (Lazy Loading) States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 1. Initial Page Fetch when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);

    const params = new URLSearchParams();
    params.append('page', '1');
    params.append('per_page', '10');
    if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
    if (selectedChannel && selectedChannel !== 'All') params.append('channel', selectedChannel);
    if (selectedDate && selectedDate !== 'All Time') params.append('date', selectedDate);
    if (selectedDestination && selectedDestination !== 'All') params.append('destination', selectedDestination);
    params.append('_t', Date.now().toString());

    fetch(`http://127.0.0.1:8000/api/orders-list?${params.toString()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) {
          setOrders(data.orders);
          setHasMore(Boolean(data.hasMore));
        }
      })
      .catch((err) => console.warn('Order line API fetch fallback:', err));
  }, [selectedStatus, selectedChannel, selectedDate, selectedDestination, searchQuery]);

  const observerTargetRef = useRef(null);

  // 2. Fetch Next Page on Scroll (Lazy Loading)
  const fetchNextPage = () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    const nextPage = page + 1;
    const params = new URLSearchParams();
    params.append('page', nextPage.toString());
    params.append('per_page', '10');
    if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
    if (selectedChannel && selectedChannel !== 'All') params.append('channel', selectedChannel);
    if (selectedDate && selectedDate !== 'All Time') params.append('date', selectedDate);
    if (selectedDestination && selectedDestination !== 'All') params.append('destination', selectedDestination);
    if (searchQuery) params.append('search', searchQuery);
    params.append('_t', Date.now().toString());

    fetch(`http://127.0.0.1:8000/api/orders-list?${params.toString()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders && data.orders.length > 0) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newUniqueOrders = data.orders.filter((o) => !existingIds.has(o.id));
            return [...prev, ...newUniqueOrders];
          });
          setPage(nextPage);
          setHasMore(Boolean(data.hasMore));
        } else {
          setHasMore(false);
        }
      })
      .catch((err) => console.warn('Lazy loading fetch error:', err))
      .finally(() => setIsLoadingMore(false));
  };

  // 3. Intersection Observer for Automatic Infinite Scroll (Sentinel trigger)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentTarget = observerTargetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, page, selectedStatus, selectedChannel, selectedDate, selectedDestination, searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (channelRef.current && !channelRef.current.contains(event.target)) {
        setIsChannelDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(event.target)) {
        setIsMoreFiltersOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle Order Row Expansion
  const toggleExpand = (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, isExpanded: !o.isExpanded } : o));
  };

  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Handle Shift + Click Range Selection & Normal Click Selection
  const handleSelectOrder = (orderId, index, event) => {
    if (event.nativeEvent.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const rangeIds = filteredOrders.slice(start, end + 1).map((o) => o.id);

      setSelectedOrders((prev) => {
        const set = new Set([...prev, ...rangeIds]);
        return Array.from(set);
      });
    } else {
      setSelectedOrders((prev) =>
        prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
      );
    }
    setLastSelectedIndex(index);
  };

  // Toggle Single Order Selection (legacy alias)
  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // Select All Orders
  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // Filter Orders based on search query (server-side handles status, channel, date, destination)
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    q = searchQuery.toLowerCase();
    return (constorder.id.toLowerCase().includes(q) ||
      order.customer.toLowerCase().includes(q) ||
      (order.subItems && order.subItems.some(sub => sub.name.toLowerCase().includes(q) || sub.sku.toLowerCase().includes(q)))
    );
  }); 

  // Handle Add New Order
  const handleCreateNewOrder = (e) => {
    e.preventDefault();
    if (!newOrderForm.customer || !newOrderForm.itemName) return;

    const newId = `#6${Math.floor(710 + Math.random() * 900)}`;
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    const newOrder = {
      id: newId,
      date: today,
      customer: newOrderForm.customer,
      salesChannel: newOrderForm.salesChannel,
      salesChannelIcon: newOrderForm.salesChannel.toLowerCase(),
      destination: newOrderForm.destination,
      itemsCount: 1,
      status: 'Pending',
      statusType: 'pending',
      isExpanded: true,
      subItems: [
        {
          id: `sub-${Date.now()}`,
          name: newOrderForm.itemName,
          sku: newOrderForm.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
          pick: 1,
          bin: 'A001-010',
          vendor: 'DEFAULT',
          onHand: Number(newOrderForm.onHand) || 50
        }
      ]
    };

    setOrders([newOrder, ...orders]);

    // Post to backend database API
    fetch('http://127.0.0.1:8000/api/orders-list/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: newOrderForm.customer,
        itemName: newOrderForm.itemName,
        salesChannel: newOrderForm.salesChannel,
        destination: newOrderForm.destination,
        total: 150
      })
    })
      .then((res) => res.json())
      .then((data) => console.log('Order saved in database backend:', data))
      .catch((err) => console.warn('Order API creation fallback:', err));

    setIsNewOrderModalOpen(false);
    setNewOrderForm({ customer: '', salesChannel: 'Amazon', destination: 'International', itemName: '', sku: '', onHand: 50 });
  };

  // Enhanced Export to Excel / CSV helper
  const handleExportToExcel = () => {
    const exportData = selectedOrders.length > 0
      ? filteredOrders.filter(o => selectedOrders.includes(o.id))
      : filteredOrders;

    if (exportData.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = ["Order ID", "Date", "Customer", "Sales Channel", "Destination", "Items Count", "Status"];
    const rows = exportData.map(e => [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${e.customer}"`,
      `"${e.salesChannel}"`,
      `"${e.destination}"`,
      `"${e.itemsCount}"`,
      `"${e.status}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import File Parser
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportedFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        setImportStatusMessage('CSV file is empty or missing data rows.');
        return;
      }

      const parsedOrders = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols.length >= 3 && cols[0]) {
          parsedOrders.push({
            id: cols[0].startsWith('#') ? cols[0] : `#${cols[0]}`,
            date: cols[1] || new Date().toLocaleDateString('en-US'),
            customer: cols[2] || 'Imported Customer',
            salesChannel: cols[3] || 'Amazon',
            salesChannelIcon: (cols[3] || 'Amazon').toLowerCase(),
            destination: cols[4] || 'International',
            itemsCount: Number(cols[5]) || 1,
            status: cols[6] || 'Pending',
            statusType: (cols[6] || 'Pending').toLowerCase(),
            isExpanded: false,
            subItems: [
              {
                id: `sub-imp-${Date.now()}-${i}`,
                name: 'Imported Product Item',
                sku: `SKU-IMP-${Math.floor(100000 + Math.random() * 900000)}`,
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80',
                pick: 1,
                bin: 'A001-010',
                vendor: 'IMPORTED',
                onHand: 100
              }
            ]
          });
        }
      }

      setImportPreview(parsedOrders);
      setImportStatusMessage(`Successfully loaded ${parsedOrders.length} order(s) from file.`);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importPreview.length === 0) return;
    setOrders(prev => [...importPreview, ...prev]);
    setIsImportModalOpen(false);
    setImportedFile(null);
    setImportPreview([]);
    setImportStatusMessage('');
  };

  const handleDownloadSampleCSV = () => {
    const sampleHeaders = ["Order ID", "Date", "Customer", "Sales Channel", "Destination", "Items Count", "Status"];
    const sampleRows = [
      ["#6801", "08/16/2026", "Alexander Wright", "Amazon", "International", "2", "Pending"],
      ["#6802", "08/16/2026", "Sophia Martinez", "Etsy", "Domestic", "1", "Fulfilled"]
    ];

    const csv = "\uFEFF" + [sampleHeaders.join(","), ...sampleRows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Orders_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for Sales Channel Badge Icon
  const renderChannelLogo = (channel) => {
    switch (channel.toLowerCase()) {
      case 'amazon':
        return (
          <div className="w-7 h-7 rounded-full bg-[#18181b] text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-sm" title="Amazon">
            a
          </div>
        );
      case 'etsy':
        return (
          <div className="w-7 h-7 rounded-full bg-[#f97316] text-white font-bold flex items-center justify-center text-[10px] tracking-tighter shadow-sm" title="Etsy">
            Etsy
          </div>
        );
      case 'shopify':
        return (
          <div className="w-7 h-7 rounded-full bg-[#84cc16] text-white font-extrabold flex items-center justify-center text-xs shadow-sm" title="Shopify">
            S
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {channel.charAt(0)}
          </div>
        );
    }
  };

  // Helper for Status Badge Pill with Icons
  const renderStatusPill = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#fef9c3] dark:bg-amber-950/60 text-[#ca8a04] dark:text-amber-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#ca8a04] dark:text-amber-400" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
            <RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
            <Package className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Shipped
          </span>
        );
      case 'delivered':
      case 'fulfilled':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#dcfce7] dark:bg-emerald-950/60 text-[#16a34a] dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] dark:text-emerald-400" />
            {status}
          </span>
        );
      case 'cancelled':
      case 'unfulfilled':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#ffe4e6] dark:bg-rose-950/60 text-[#e11d48] dark:text-rose-400 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-[#e11d48] dark:text-rose-400" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#f8f9fc] dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">

      {/* ==================== 1. TOP HEADER & ACTIONS ROW ==================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Orders</h1>
          <p className="text-xs text-gray-400 mt-1">Manage sales channels, fulfillment, and multi-vendor orders</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportToExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-none transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export to Excel
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-none transition-colors shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Orders
          </button>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 bg-[#18181b] hover:bg-zinc-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-zinc-900 text-xs font-bold rounded-none transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>


      {/* ==================== 2. FILTER & SEARCH BAR ==================== */}
      <div className="bg-white dark:bg-gray-900 p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID, Customer, SKU..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-zinc-500 rounded-none transition-colors"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">

          {/* Date Filter */}
          <div className="relative" ref={dateRef}>
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-none cursor-pointer"
            >
              Date: <span className="text-gray-900 dark:text-white font-bold">{selectedDate}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 text-xs">
                {['All Time', 'Today', 'This Week', 'This Month', 'This Year'].map((dt) => (
                  <button
                    key={dt}
                    onClick={() => {
                      setSelectedDate(dt);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedDate === dt ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {dt}
                    {selectedDate === dt && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sales Channel Filter */}
          <div className="relative" ref={channelRef}>
            <button
              onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-none cursor-pointer"
            >
              Sales Channel: <span className="text-gray-900 dark:text-white font-bold">{selectedChannel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isChannelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isChannelDropdownOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 text-xs">
                {['All', 'Amazon', 'Etsy', 'Shopify'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => {
                      setSelectedChannel(ch);
                      setIsChannelDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedChannel === ch ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {ch}
                    {selectedChannel === ch && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusRef}>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-none cursor-pointer"
            >
              Status: <span className="text-gray-900 dark:text-white font-bold">{selectedStatus}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 text-xs">
                {['All', 'Pending', 'Processing', 'Delivered', 'Fulfilled', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSelectedStatus(st);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedStatus === st ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {st}
                    {selectedStatus === st && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Filters */}
          <div className="relative" ref={moreFiltersRef}>
            <button
              onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-none cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              More Filters
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreFiltersOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 p-2 text-xs space-y-2">
                <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Destination Region</div>
                {['All', 'International', 'Domestic'].map((dest) => (
                  <button
                    key={dest}
                    onClick={() => {
                      setSelectedDestination(dest);
                      setIsMoreFiltersOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${selectedDestination === dest ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' : 'text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {dest}
                    {selectedDestination === dest && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                ))}

                <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedChannel('All');
                      setSelectedStatus('All');
                      setSelectedDate('All Time');
                      setSelectedDestination('All');
                      setSearchQuery('');
                      setIsMoreFiltersOpen(false);
                    }}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ==================== 3. ORDERS EXPANDABLE TABLE ==================== */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-semibold bg-gray-50/50 dark:bg-gray-800/30">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded-none border-gray-300 dark:border-gray-700 accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                </th>
                <th className="py-4 px-2 font-medium">Order ID & Icon</th>
                <th className="py-4 px-3 font-medium">Date</th>
                <th className="py-4 px-3 font-medium">Customer</th>
                <th className="py-4 px-3 font-medium text-center">Sales Channel</th>
                <th className="py-4 px-3 font-medium">Destination</th>
                <th className="py-4 px-3 font-medium text-center">Items</th>
                <th className="py-4 px-3 font-medium text-center">Status</th>
                <th className="py-4 px-3 font-medium text-center">Update Status</th>
                <th className="py-4 px-4 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const isSelected = selectedOrders.includes(order.id);
                  return (
                    <React.Fragment key={order.id}>
                      {/* Parent Order Row */}
                      <tr
                        onClick={(e) => {
                          if (e.target.tagName !== 'INPUT' && e.target.type !== 'checkbox' && e.target.tagName !== 'SELECT') {
                            toggleExpand(order.id);
                          }
                        }}
                        className={`border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer select-none ${order.isExpanded ? 'bg-gray-50/70 dark:bg-gray-800/40' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                          }`}
                      >
                        <td className="p-4 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOrder(order.id, index, e)}
                            className="w-4 h-4 rounded-none border-gray-300 dark:border-gray-700 accent-zinc-900 dark:accent-white cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-none bg-zinc-900 dark:bg-gray-800 text-amber-400 dark:text-amber-300 flex items-center justify-center shrink-0 border border-zinc-700 dark:border-gray-700 shadow-xs">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
                                {order.id}
                              </div>
                              <div className="text-[10px] text-gray-400">Order #{order.db_id || index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {order.date}
                        </td>
                        <td className="py-4 px-3 font-bold text-gray-900 dark:text-white">
                          {order.customer}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex justify-center">
                            {renderChannelLogo(order.salesChannel)}
                          </div>
                        </td>
                        <td className="py-4 px-3 font-medium text-gray-700 dark:text-gray-300">
                          {order.destination}
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-gray-900 dark:text-white">
                          {order.itemsCount}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex justify-center">
                            {renderStatusPill(order.status)}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <select
                              value={order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()) : 'Pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, order.db_id, e.target.value)}
                              className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-none cursor-pointer focus:outline-none focus:border-zinc-500 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 shadow-2xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="p-4 w-10 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(order.id);
                            }}
                            className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors cursor-pointer ml-auto"
                            title={order.isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {order.isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Collapsible Sub-Items Table Row */}
                      {order.isExpanded && (
                        <tr className="bg-gray-50/80 dark:bg-gray-900/60">
                          <td colSpan="10" className="px-12 py-3 border-b border-gray-200 dark:border-gray-800">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="text-gray-400 font-normal border-b border-gray-200/60 dark:border-gray-800">
                                  <th className="pb-2 pl-2">Product Name</th>
                                  <th className="pb-2 text-center">Pick</th>
                                  <th className="pb-2 text-center">Bin</th>
                                  <th className="pb-2 text-center">Vendor</th>
                                  <th className="pb-2 text-center">On Hand</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200/40 dark:divide-gray-800/40">
                                {order.subItems && order.subItems.length > 0 ? (
                                  order.subItems.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/60 dark:hover:bg-gray-800/40 transition-colors">
                                      <td className="py-3 pl-2 flex items-center gap-3">
                                        <img
                                          src={sub.image}
                                          alt={sub.name}
                                          className="w-10 h-10 object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                                        />
                                        <div>
                                          <div className="font-bold text-gray-900 dark:text-white leading-tight">{sub.name}</div>
                                          <div className="text-[10px] text-gray-400 mt-0.5">{sub.sku}</div>
                                        </div>
                                      </td>
                                      <td className="py-3 text-center font-bold text-gray-800 dark:text-gray-200">
                                        {sub.pick}
                                      </td>
                                      <td className="py-3 text-center font-medium text-gray-600 dark:text-gray-400">
                                        {sub.bin}
                                      </td>
                                      <td className="py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                                        {sub.vendor}
                                      </td>
                                      <td className="py-3 text-center font-bold text-gray-900 dark:text-white">
                                        {sub.onHand}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-400 italic">
                                      No product items attached to this order.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400 text-xs">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    No orders match your filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Lazy Loading / Infinite Scroll Footer Indicator */}
        <div
          ref={observerTargetRef}
          className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs min-h-[48px]"
        >
          <span className="text-gray-400 font-medium">
            Showing <strong className="text-gray-900 dark:text-white">{orders.length}</strong> orders
          </span>

          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading more orders...
            </div>
          ) : hasMore ? (
            <div className="flex items-center gap-2 text-gray-400 font-medium italic">
              <RefreshCw className="w-3.5 h-3.5 opacity-40 animate-spin" />
              Scroll for more...
            </div>
          ) : orders.length > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              All orders loaded ({orders.length} total)
            </span>
          ) : null}
        </div>
      </div>


      {/* ==================== 4. CREATE NEW ORDER MODAL ==================== */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Create New Order
              </h3>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.customer}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customer: e.target.value })}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-zinc-500 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Sales Channel</label>
                  <select
                    value={newOrderForm.salesChannel}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, salesChannel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none rounded-none"
                  >
                    <option value="Amazon">Amazon</option>
                    <option value="Etsy">Etsy</option>
                    <option value="Shopify">Shopify</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Destination</label>
                  <select
                    value={newOrderForm.destination}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, destination: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none rounded-none"
                  >
                    <option value="International">International</option>
                    <option value="Domestic">Domestic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newOrderForm.itemName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, itemName: e.target.value })}
                  placeholder="e.g. Ergonomic Office Chair"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-zinc-500 rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">SKU Number</label>
                  <input
                    type="text"
                    value={newOrderForm.sku}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, sku: e.target.value })}
                    placeholder="e.g. SKU-901283"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none rounded-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">On-Hand Stock</label>
                  <input
                    type="number"
                    value={newOrderForm.onHand}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, onHand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none rounded-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#18181b] hover:bg-zinc-800 text-white text-xs font-bold rounded-none shadow-md cursor-pointer"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 5. IMPORT ORDERS MODAL ==================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-500" />
                Import Orders from CSV / Excel
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportedFile(null);
                  setImportPreview([]);
                  setImportStatusMessage('');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* File Upload Box */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 p-6 text-center transition-colors relative cursor-pointer bg-gray-50/50 dark:bg-gray-800/30">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  {importedFile ? importedFile.name : 'Click or Drag & Drop CSV file to upload'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">Supports UTF-8 formatted .CSV files</p>
              </div>

              {/* Sample Template & Status Info */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV Template
                </button>
                {importStatusMessage && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    {importStatusMessage}
                  </span>
                )}
              </div>

              {/* Live Preview List */}
              {importPreview.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 p-3 max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar bg-gray-50 dark:bg-gray-800/50">
                  <div className="font-bold text-gray-700 dark:text-gray-300 text-[11px] mb-2">
                    Orders Preview ({importPreview.length}):
                  </div>
                  {importPreview.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-gray-200/50 dark:border-gray-700/50 last:border-0">
                      <span className="font-bold text-sky-600 dark:text-sky-400">{item.id}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{item.customer}</span>
                      <span className="text-gray-500">{item.salesChannel}</span>
                      <span className="text-emerald-600 font-bold">{item.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportedFile(null);
                    setImportPreview([]);
                    setImportStatusMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleConfirmImport}
                  className={`px-5 py-2 text-xs font-bold rounded-none shadow-md cursor-pointer transition-colors ${importPreview.length > 0
                      ? 'bg-[#18181b] hover:bg-zinc-800 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  Confirm & Import ({importPreview.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
