import { useState } from 'react';
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
  Plus,
  Minus,
  SlidersHorizontal,
  ArrowUpDown,
  History,
  Save,
  Download,
  Edit3
} from 'lucide-react';

export default function ManageInventoryPage() {
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'overview'

  // Timeframe states for analytics
  const [timeframeStats, setTimeframeStats] = useState('Today');
  const [timeframeHabits, setTimeframeHabits] = useState('This year');
  const [timeframeGrowth, setTimeframeGrowth] = useState('Today');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Stock Audit States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [adjustmentCount, setAdjustmentCount] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  // Mock Stock Audit Items
  const [stockItems, setStockItems] = useState([
    {
      id: 'SKU-8821',
      name: 'Sculptural Wool Overcoat',
      category: 'Outerwear',
      brand: 'Atelier',
      unitCost: 140,
      price: 240,
      stock: 10,
      minStock: 8,
      maxStock: 50,
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
      lastAudited: '2 hours ago'
    },
    {
      id: 'SKU-4412',
      name: 'Ivory Slip Dress',
      category: 'Clothing',
      brand: 'Atelier',
      unitCost: 70,
      price: 140,
      stock: 15,
      minStock: 10,
      maxStock: 40,
      image: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=300&q=80',
      lastAudited: '5 hours ago'
    },
    {
      id: 'SKU-9903',
      name: 'Polished Leather Boots',
      category: 'Footwear',
      brand: 'Prada',
      unitCost: 95,
      price: 180,
      stock: 3,
      minStock: 5,
      maxStock: 30,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80',
      lastAudited: '1 day ago'
    },
    {
      id: 'SKU-1049',
      name: 'Structured Leather Bag',
      category: 'Accessories',
      brand: 'Loewe',
      unitCost: 180,
      price: 310,
      stock: 0,
      minStock: 4,
      maxStock: 25,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
      lastAudited: 'Yesterday'
    },
    {
      id: 'SKU-3321',
      name: 'Cashmere Turtleneck',
      category: 'Clothing',
      brand: 'Jil Sander',
      unitCost: 110,
      price: 210,
      stock: 14,
      minStock: 6,
      maxStock: 35,
      image: 'https://images.unsplash.com/photo-1574164904299-3a102b110380?auto=format&fit=crop&w=300&q=80',
      lastAudited: '3 hours ago'
    },
    {
      id: 'SKU-5523',
      name: 'Gold Hoop Earrings',
      category: 'Accessories',
      brand: 'Celine',
      unitCost: 40,
      price: 95,
      stock: 25,
      minStock: 10,
      maxStock: 60,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80',
      lastAudited: 'Just now'
    },
    {
      id: 'SKU-7711',
      name: 'Classic Trench Coat',
      category: 'Outerwear',
      brand: 'Burberry',
      unitCost: 160,
      price: 280,
      stock: 2,
      minStock: 5,
      maxStock: 20,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=300&q=80',
      lastAudited: '4 days ago'
    }
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'Manager Alex', action: 'Restocked +10 units', sku: 'SKU-8821', time: '10:14 AM' },
    { id: 2, user: 'Audit System', action: 'Low stock threshold triggered', sku: 'SKU-9903', time: '09:45 AM' },
    { id: 3, user: 'Staff Sarah', action: 'Physical count verified', sku: 'SKU-4412', time: 'Yesterday' }
  ]);

  // Customer Habits Bar Data
  const habitsData = [
    { month: 'Jan', seen: 24, sales: 41, seenRaw: '24K', salesRaw: '41K' },
    { month: 'Feb', seen: 37, sales: 16, seenRaw: '37K', salesRaw: '16K' },
    { month: 'Mar', seen: 24, sales: 29, seenRaw: '24K', salesRaw: '29K' },
    { month: 'Apr', seen: 13, sales: 9,  seenRaw: '13K', salesRaw: '9K'  },
    { month: 'May', seen: 23, sales: 41, seenRaw: '23K', salesRaw: '41K' },
    { month: 'Jun', seen: 35, sales: 14, seenRaw: '35K', salesRaw: '14K' }
  ];

  // Country Growth Data
  const countryGrowth = [
    { name: 'United States', code: 'US', flag: '🇺🇸', percent: 87, count: '14,230' },
    { name: 'Germany',       code: 'DE', flag: '🇩🇪', percent: 57, count: '9,120'  },
    { name: 'Australia',     code: 'AU', flag: '🇦🇺', percent: 37, count: '5,840'  },
    { name: 'France',        code: 'FR', flag: '🇫🇷', percent: 17, count: '2,610'  }
  ];

  // Filter Stock Items
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    let matchesStatus = true;
    if (selectedStatus === 'In Stock') matchesStatus = item.stock > item.minStock;
    if (selectedStatus === 'Low Stock') matchesStatus = item.stock > 0 && item.stock <= item.minStock;
    if (selectedStatus === 'Out of Stock') matchesStatus = item.stock === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Quick Audit Adjustments
  const handleStockAdjustment = (id, delta) => {
    setStockItems(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + delta);
        return { ...item, stock: newStock, lastAudited: 'Just now' };
      }
      return item;
    }));

    // Log movement
    const targetItem = stockItems.find(i => i.id === id);
    if (targetItem) {
      const actionText = delta > 0 ? `Restocked +${delta} units` : `Adjusted ${delta} units`;
      setAuditLogs(prev => [
        { id: Date.now(), user: 'Admin User', action: actionText, sku: id, time: 'Just now' },
        ...prev.slice(0, 4)
      ]);
    }
  };

  const saveModalAdjustment = () => {
    if (!editingItem) return;
    setStockItems(prev => prev.map(item => {
      if (item.id === editingItem.id) {
        return { ...item, stock: Math.max(0, adjustmentCount), lastAudited: 'Just now' };
      }
      return item;
    }));

    setAuditLogs(prev => [
      { id: Date.now(), user: 'Admin Audit', action: `Stock set to ${adjustmentCount} (${adjustmentNote || 'Audit log'})`, sku: editingItem.id, time: 'Just now' },
      ...prev.slice(0, 4)
    ]);

    setEditingItem(null);
    setAdjustmentNote('');
  };

  // Stock Metrics Calculations
  const totalSkus = stockItems.length;
  const healthyStockCount = stockItems.filter(i => i.stock > i.minStock).length;
  const lowStockCount = stockItems.filter(i => i.stock > 0 && i.stock <= i.minStock).length;
  const outOfStockCount = stockItems.filter(i => i.stock === 0).length;
  const totalValuation = stockItems.reduce((acc, item) => acc + (item.stock * item.price), 0);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* Top Header / Action Bar (No Border Radius) */}
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
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('audit')} 
              className={`px-4 py-1.5 rounded-none text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
            >
              Stock Audit ({lowStockCount + outOfStockCount > 0 ? `${lowStockCount + outOfStockCount} Alerts` : 'Healthy'})
            </button>
          </div>

          <button className="flex items-center gap-2 text-xs font-medium px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-none transition-colors border border-amber-200 dark:border-amber-700/60">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Data
          </button>
        </div>
      </div>


      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'overview' && (
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
                  <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-white">$619,000</h3>
                </div>

                <div className="z-10 text-[11px] text-amber-200/70 font-medium flex items-center gap-1.5">
                  <span>Products vs Last Month</span>
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
                  <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">1,000</h3>
                </div>

                <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                  <span>Orders vs Last Month</span>
                </div>
              </div>

              {/* CARD 3: TOTAL VISITORS */}
              <div className="relative overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-[210px] group transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-700">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>

                <div className="flex items-center justify-between z-10">
                  <div className="w-12 h-12 rounded-none bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-gray-600">
                    <Users className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-red-500 text-white shadow-sm">
                    -10.2%
                  </span>
                </div>

                <div className="z-10 mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
                  <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">2003.67</h3>
                </div>

                <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                  <span>Users vs Last Month</span>
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
                  <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-gray-900 dark:text-white">3,000</h3>
                </div>

                <div className="z-10 text-[11px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1.5">
                  <span>Products vs Last Month</span>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: PRODUCT STATISTIC */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100 dark:from-amber-950 dark:via-gray-800 dark:to-gray-900 p-6 rounded-none shadow-sm border border-amber-200 dark:border-amber-900/60 flex flex-col justify-between min-h-[440px]">
              
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Statistic</h2>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 font-medium mt-0.5">Track your product sales</p>
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
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#92400E"
                      strokeWidth="20"
                      strokeDasharray="175.9 251.3"
                      strokeDashoffset="0"
                      className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="20"
                      strokeDasharray="50.2 251.3"
                      strokeDashoffset="-175.9"
                      className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#FCD34D"
                      strokeWidth="20"
                      strokeDasharray="25.1 251.3"
                      strokeDashoffset="-226.1"
                      className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                    />
                  </svg>
                </div>
              </div>

              {/* Category Metrics List */}
              <div className="space-y-3 pt-2 border-t border-amber-200/80 dark:border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#92400E] inline-block"></span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Electronics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-900 dark:text-white">2.487</span>
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-bold bg-amber-500 text-white">
                      +1.9%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#F59E0B] inline-block"></span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Games</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-900 dark:text-white">1.828</span>
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-bold bg-amber-500 text-white">
                      +2.9%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#FCD34D] inline-block"></span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Furniture</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-900 dark:text-white">1.463</span>
                    <span className="px-2.5 py-0.5 rounded-none text-[11px] font-bold bg-red-500 text-white">
                      -2.09%
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* CUSTOMER HABBITS */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-none shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Habbits</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track your customers habit</p>
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
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>40K</span></div>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>30K</span></div>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>20K</span></div>
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-1"><span>10K</span></div>
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-1"><span>0K</span></div>
                </div>

                <div className="h-64 pl-10 pr-2 flex items-end justify-between relative z-10">
                  {habitsData.map((item, idx) => (
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
                        <div style={{ height: `${(item.seen / 45) * 220}px` }} className="w-5 sm:w-6 bg-amber-400 transition-all duration-300 group-hover:bg-amber-500 shadow-sm"></div>
                        <div style={{ height: `${(item.sales / 45) * 220}px` }} className="w-5 sm:w-6 bg-amber-700 transition-all duration-300 group-hover:bg-amber-800 shadow-sm"></div>
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Track your customers by location</p>
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

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto">
                <div className="sm:col-span-6 flex justify-center items-center py-4">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <div className="absolute w-28 h-28 bg-[#78350F] text-white font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 -left-1 bottom-1 transition-transform hover:scale-105 z-10">87%</div>
                    <div className="absolute w-20 h-20 bg-[#D97706] text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 right-0 top-10 transition-transform hover:scale-105 z-20">57%</div>
                    <div className="absolute w-16 h-16 bg-[#F59E0B] text-white font-bold text-[11px] flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 bottom-0 right-4 transition-transform hover:scale-105 z-30">37%</div>
                    <div className="absolute w-14 h-14 bg-[#FCD34D] text-gray-950 font-extrabold text-[10px] flex items-center justify-center shadow-md border-2 border-white dark:border-gray-800 top-0 left-12 transition-transform hover:scale-105 z-40">17%</div>
                  </div>
                </div>

                <div className="sm:col-span-6 space-y-4">
                  {countryGrowth.map((country, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                          <span className="text-base leading-none">{country.flag}</span>
                          <span>{country.name}</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-none overflow-hidden">
                        <div style={{ width: `${country.percent}%` }} className="h-full bg-amber-500 dark:bg-amber-400 rounded-none transition-all duration-700"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
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
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{totalSkus} SKUs</h3>
                <span className="text-[11px] text-amber-600 font-medium">100% Verified</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <PackageCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Healthy Stock</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{healthyStockCount} Items</h3>
                <span className="text-[11px] text-gray-400">Stock above threshold</span>
              </div>
              <div className="w-12 h-12 bg-emerald-50 dark:bg-gray-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Low Stock Alert</p>
                <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{lowStockCount} Items</h3>
                <span className="text-[11px] text-amber-600 font-medium">Reorder recommended</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 border border-gray-200 dark:border-gray-700 rounded-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Out of Stock</p>
                <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{outOfStockCount} Items</h3>
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
                  <option value="Outerwear">Outerwear</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
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

              <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-none shadow-sm transition-colors">
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
                <span className="text-xs font-semibold text-gray-500">Showing {filteredStockItems.length} of {stockItems.length} items</span>
              </div>

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
                    {filteredStockItems.map((item) => {
                      const isOut = item.stock === 0;
                      const isLow = item.stock > 0 && item.stock <= item.minStock;

                      return (
                        <tr key={item.id} className="hover:bg-amber-50/30 dark:hover:bg-gray-700/40 transition-colors">
                          
                          {/* Item & SKU */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover border border-gray-200 dark:border-gray-600 rounded-none" />
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
                                onClick={() => handleStockAdjustment(item.id, -1)}
                                title="Deduct 1 Stock"
                                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center rounded-none font-bold text-xs"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => handleStockAdjustment(item.id, +5)}
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
                <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">${totalValuation.toLocaleString()}</div>
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
                <img src={editingItem.image} alt={editingItem.name} className="w-12 h-12 object-cover" />
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
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={saveModalAdjustment} 
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
              >
                Save Audit Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
