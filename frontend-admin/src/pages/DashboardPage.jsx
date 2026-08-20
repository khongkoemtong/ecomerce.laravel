import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  RotateCcw, 
  TrendingUp, 
  ArrowUpRight, 
  ChevronDown, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Sparkles,
  Check
} from 'lucide-react';
import { 
  dashboardMetrics, 
  timeRangeOptions,
  stockChartDataByPeriod,
  customTagProducts, 
  salesOrders, 
  delayedProducts 
} from '../data/dashboardData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(3); // Default to Fashion ($31,000)
  const [activeTag, setActiveTag] = useState('Fast Moving');
  
  // Section-by-Section API States & Fallbacks
  const [metrics, setMetrics] = useState(dashboardMetrics);
  const [tagProductsList, setTagProductsList] = useState(customTagProducts);
  const [salesOrdersList, setSalesOrdersList] = useState(salesOrders);
  const [delayedProductsList, setDelayedProductsList] = useState(delayedProducts);
  const [restockItemsCount, setRestockItemsCount] = useState(120);
  const [apiStockChartData, setApiStockChartData] = useState(null);

  // Time Range Dropdown States
  const [timeRange, setTimeRange] = useState('Monthly');
  const [isChartTimeOpen, setIsChartTimeOpen] = useState(false);
  const [salesTimeRange, setSalesTimeRange] = useState('Monthly');
  const [isSalesTimeOpen, setIsSalesTimeOpen] = useState(false);

  const chartDropdownRef = useRef(null);
  const salesDropdownRef = useRef(null);

  // 1. Fetch Top KPI Metrics Section
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.metrics) setMetrics(data.metrics);
      })
      .catch((err) => console.warn('Metrics Section API fallback:', err));
  }, []);

  // 2. Fetch Stock Chart Analytics Section (by timeRange)
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/dashboard/stock-chart?period=${timeRange}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stockChartData && data.stockChartData.length > 0) {
          setApiStockChartData(data.stockChartData);
        }
      })
      .catch((err) => console.warn('Stock Chart Section API fallback:', err));
  }, [timeRange]);

  // 3. Fetch Custom Tag Products Section (by activeTag)
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/dashboard/tag-products?tag=${activeTag}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && data.products.length > 0) {
          setTagProductsList(data.products);
        }
      })
      .catch((err) => console.warn('Tag Products Section API fallback:', err));
  }, [activeTag]);

  // 4. Fetch Sales Orders Widget Section (by salesTimeRange)
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/dashboard/sales-orders?period=${salesTimeRange}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.salesOrders && data.salesOrders.length > 0) {
          setSalesOrdersList(data.salesOrders);
        }
      })
      .catch((err) => console.warn('Sales Orders Section API fallback:', err));
  }, [salesTimeRange]);

  // 5. Fetch Restock Recommendations & Delayed Shipments Section
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/restock-recommendations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.delayedProducts && data.delayedProducts.length > 0) {
          setDelayedProductsList(data.delayedProducts);
        }
        if (data?.itemsCount) {
          setRestockItemsCount(data.itemsCount);
        }
      })
      .catch((err) => console.warn('Restock Recommendations Section API fallback:', err));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) {
        setIsChartTimeOpen(false);
      }
      if (salesDropdownRef.current && !salesDropdownRef.current.contains(event.target)) {
        setIsSalesTimeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rawChartData = (apiStockChartData && apiStockChartData.length > 0) 
    ? apiStockChartData 
    : (stockChartDataByPeriod[timeRange] || stockChartDataByPeriod.Monthly);

  // Helper functions to get accurate Y coordinates on the SVG lines for any X (cx) position
  const getStockY = (cx) => {
    if (cx <= 160) {
      const t = cx / 160;
      return (1 - t) ** 2 * 140 + 2 * (1 - t) * t * 40 + t ** 2 * 110;
    } else if (cx <= 320) {
      const t = (cx - 160) / 160;
      return (1 - t) ** 2 * 110 + 2 * (1 - t) * t * 180 + t ** 2 * 70;
    } else {
      const t = (cx - 320) / 180;
      return (1 - t) ** 2 * 70 + 2 * (1 - t) * t * (-40) + t ** 2 * 20;
    }
  };

  const getConsumeY = (cx) => {
    if (cx <= 170) {
      const t = cx / 170;
      return (1 - t) ** 2 * 170 + 2 * (1 - t) * t * 80 + t ** 2 * 140;
    } else if (cx <= 330) {
      const t = (cx - 170) / 160;
      return (1 - t) ** 2 * 140 + 2 * (1 - t) * t * 200 + t ** 2 * 100;
    } else {
      const t = (cx - 330) / 170;
      return (1 - t) ** 2 * 100 + 2 * (1 - t) * t * 0 + t ** 2 * 50;
    }
  };

  const activeChartData = rawChartData.map((pt, index, arr) => {
    const total = arr.length;
    const cx = total > 1 ? Math.round(50 + index * (400 / (total - 1))) : 250;
    return {
      ...pt,
      cx: cx,
      stockY: Math.round(getStockY(cx)),
      consumeY: Math.round(getConsumeY(cx))
    };
  });

  const currentChartPoint = activeChartData[activeIndex] || activeChartData[0] || { cx: 285, stockY: 75, consumeY: 110, category: 'Fashion', price: '$ 31,000' };
  const filteredTagProducts = tagProductsList.filter((prod) => prod.tag === activeTag);
  const displayedTagProducts = filteredTagProducts.length > 0 ? filteredTagProducts : tagProductsList;




  return (
    <div className="p-6 md:p-8 space-y-6 bg-[#f8f9fc] dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-100 transition-colors duration-200">
      
      {/* ==================== 1. TOP METRIC CARDS ROW ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Orders (Dark Card) */}
        <div className="bg-[#18181b] text-white rounded-none p-5 shadow-lg border border-zinc-800 flex flex-col justify-between transition-all hover:shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-none bg-[#ccff00]/20 text-[#ccff00] flex items-center justify-center shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <button 
              onClick={() => navigate('/order-line')}
              title="View Orders"
              className="w-8 h-8 rounded-none bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div>
            <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider block mb-1">Total Orders</span>
            <div className="text-3xl font-extrabold text-white tracking-tight mb-3">
              {metrics.totalOrders.value}
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#ccff00]/20 text-[#ccff00] text-xs font-bold px-2.5 py-0.5 rounded-none flex items-center gap-0.5">
                ▲ {metrics.totalOrders.change}
              </span>
              <span className="text-xs text-zinc-400">{metrics.totalOrders.period}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Already Delivered (Light Card) */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="w-10 h-10 rounded-none bg-[#e6ff55] text-zinc-900 flex items-center justify-center shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <button 
              onClick={() => navigate('/order-line')}
              title="View Delivered Orders"
              className="w-8 h-8 rounded-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Already Delivered</span>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
              {metrics.alreadyDelivered.value}
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-none flex items-center gap-0.5">
                ▲ {metrics.alreadyDelivered.change}
              </span>
              <span className="text-xs text-gray-400">{metrics.alreadyDelivered.period}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Product Return */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-stretch transition-all hover:shadow-md">
          <div className="flex flex-col justify-between">
            <div className="w-10 h-10 rounded-none bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Product Return</span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {metrics.productReturn.value}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-none">
                  ▼ {metrics.productReturn.change}
                </span>
                <span className="text-[10px] text-gray-400 truncate">{metrics.productReturn.period}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end">
            <button 
              onClick={() => navigate('/manage-products')}
              title="View Product Returns"
              className="w-8 h-8 rounded-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
            {/* SVG Arc Gauge */}
            <div className="relative w-24 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray="50, 100"
                />
                <path
                  className="text-lime-400"
                  strokeWidth="4"
                  strokeDasharray={`${metrics.productReturn.percentage / 2}, 100`}
                  strokeLinecap="square"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {metrics.productReturn.countText}
                </span>
                <span className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight">
                  Products Return
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Turnover Rate */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-stretch transition-all hover:shadow-md">
          <div className="flex flex-col justify-between">
            <div className="w-10 h-10 rounded-none bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider block mb-1">Turnover Rate</span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
                {metrics.turnoverRate.value}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 text-xs font-bold px-2 py-0.5 rounded-none">
                  ▼ {metrics.turnoverRate.change}
                </span>
                <span className="text-[10px] text-gray-400 truncate">{metrics.turnoverRate.period}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-end">
            <button 
              onClick={() => navigate('/manage-inventory')}
              title="View Turnover Analysis"
              className="w-8 h-8 rounded-none bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
            {/* SVG Arc Gauge */}
            <div className="relative w-24 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200 dark:text-gray-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  strokeDasharray="50, 100"
                />
                <path
                  className="text-rose-400"
                  strokeWidth="4"
                  strokeDasharray="30, 100"
                  strokeLinecap="square"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 text-center">
                <span className="text-xs font-bold text-rose-500 leading-tight">
                  20%
                </span>
                <span className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight">
                  Decrease
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>


      {/* ==================== 2. MIDDLE ANALYTICS ROW ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left: Total Stock Volume vs Consume Rate (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Total Stock Volume vs Consume Rate
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Stock-volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#ccff00]"></span>
                    <span className="text-gray-600 dark:text-gray-400">Consume</span>
                  </div>
                </div>

                {/* Dropdown Menu Container */}
                <div className="relative" ref={chartDropdownRef}>
                  <button 
                    onClick={() => setIsChartTimeOpen(!isChartTimeOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-none text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    {timeRange}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isChartTimeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Popup */}
                  {isChartTimeOpen && (
                    <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 text-xs">
                      {timeRangeOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setTimeRange(opt);
                            setIsChartTimeOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            timeRange === opt 
                              ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {opt}
                          {timeRange === opt && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Area */}
            <div className="relative h-60 w-full my-4 group">
              {/* Y Axis Guides */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-gray-400 pointer-events-none">
                <div className="border-b border-dashed border-gray-100 dark:border-gray-800/80 pb-1">$50K</div>
                <div className="border-b border-dashed border-gray-100 dark:border-gray-800/80 pb-1">$40K</div>
                <div className="border-b border-dashed border-gray-100 dark:border-gray-800/80 pb-1">$30K</div>
                <div className="border-b border-dashed border-gray-100 dark:border-gray-800/80 pb-1">$20K</div>
                <div className="border-b border-dashed border-gray-100 dark:border-gray-800/80 pb-1">$10K</div>
              </div>

              {/* Chart Curved Paths */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="consumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ccff00" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Stock Fill & Line */}
                <path
                  d="M 0,140 Q 80,40 160,110 T 320,70 T 500,20 L 500,200 L 0,200 Z"
                  fill="url(#stockGrad)"
                />
                <path
                  d="M 0,140 Q 80,40 160,110 T 320,70 T 500,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                {/* Consume Fill & Line */}
                <path
                  d="M 0,170 Q 90,80 170,140 T 330,100 T 500,50 L 500,200 L 0,200 Z"
                  fill="url(#consumeGrad)"
                />
                <path
                  d="M 0,170 Q 90,80 170,140 T 330,100 T 500,50"
                  fill="none"
                  stroke="#ccff00"
                  strokeWidth="3"
                />

                {/* Vertical Guideline for Hovered Node */}
                <line
                  x1={currentChartPoint.cx}
                  y1="0"
                  x2={currentChartPoint.cx}
                  y2="200"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className="transition-all duration-300 opacity-60"
                />

                {/* Active Highlight Node Circles */}
                <circle 
                  cx={currentChartPoint.cx} 
                  cy={currentChartPoint.stockY} 
                  r="7" 
                  fill="#10b981" 
                  stroke="#ffffff" 
                  strokeWidth="2"
                  className="transition-all duration-300 shadow-md"
                />
                <circle 
                  cx={currentChartPoint.cx} 
                  cy={currentChartPoint.consumeY} 
                  r="6" 
                  fill="#ccff00" 
                  stroke="#18181b" 
                  strokeWidth="2"
                  className="transition-all duration-300 shadow-md"
                />

                {/* Interactive Hit Areas for Hovering Nodes */}
                {activeChartData.map((pt, index) => (
                  <rect
                    key={pt.id}
                    x={pt.cx - 35}
                    y="0"
                    width="70"
                    height="200"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setActiveIndex(index)}
                  />
                ))}
              </svg>

              {/* Dynamic Hover Tooltip Box */}
              <div 
                className="absolute bg-[#18181b] text-white px-3.5 py-2 rounded-none shadow-xl border border-zinc-700 flex flex-col items-center z-20 pointer-events-none transition-all duration-300 ease-out -translate-x-1/2 -translate-y-full mb-3"
                style={{ 
                  left: `${(currentChartPoint.cx / 500) * 100}%`, 
                  top: `${(currentChartPoint.stockY / 200) * 100}%` 
                }}
              >
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                  {currentChartPoint.category} ({timeRange})
                </span>
                <span className="text-[#ccff00] text-sm font-bold">
                  {currentChartPoint.price}
                </span>
                {/* Pointer triangle */}
                <div className="w-2.5 h-2.5 bg-[#18181b] rotate-45 absolute -bottom-1 border-r border-b border-zinc-700"></div>
              </div>
            </div>
          </div>

          {/* Category Tabs at bottom */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 overflow-x-auto custom-scrollbar">
            {activeChartData.map((pt, index) => (
              <button
                key={pt.id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={`px-4 py-1.5 rounded-none text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeIndex === index
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {pt.category}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Custom Tags & Labels (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Custom Tags & Labels
              </h2>
              <p className="text-xs text-gray-400">Categories By AI Assistant</p>
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-4">
              {['Fast Moving', 'Discounted', 'Low Demand', 'Dead Items', 'New Arrival'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-none text-xs font-medium transition-all shrink-0 border cursor-pointer ${
                    activeTag === tag
                      ? 'bg-[#18181b] text-white border-[#18181b] dark:bg-white dark:text-zinc-900 dark:border-white shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
              <button 
                onClick={() => navigate('/categories')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-100 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tag
              </button>
            </div>

            {/* Product Table Filtered By Active Tag */}
            <div className="overflow-x-auto max-h-[250px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-3 font-medium">Product's Details</th>
                    <th className="pb-3 font-medium text-center">Total Qty</th>
                    <th className="pb-3 font-medium text-center">Stock In</th>
                    <th className="pb-3 font-medium text-center">Price</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {displayedTagProducts.length > 0 ? (
                    displayedTagProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-2.5 flex items-center gap-2.5">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-8 h-8 rounded-none object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white leading-tight">{prod.name}</div>
                            <div className="text-[10px] text-gray-400">{prod.id}</div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-medium text-gray-700 dark:text-gray-300">
                          {prod.totalQty.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-center font-medium text-gray-700 dark:text-gray-300">
                          {prod.stockIn}
                        </td>
                        <td className="py-2.5 text-center font-bold text-gray-900 dark:text-white">
                          {prod.price}
                        </td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1 text-gray-400">
                            <button 
                              onClick={() => navigate('/manage-products')}
                              className="p-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => navigate('/manage-products')}
                              className="p-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-400 text-xs font-medium">
                        No products tagged with "{activeTag}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>


      {/* ==================== 3. BOTTOM WIDGETS ROW ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">

        {/* Bottom Left: Sales & Order */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Sales & Order</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/order-line')}
                  className="p-1.5 rounded-none bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/order-line')}
                  className="p-1.5 rounded-none bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Filter className="w-4 h-4" />
                </button>

                {/* Interactive Sales Dropdown Menu */}
                <div className="relative" ref={salesDropdownRef}>
                  <button 
                    onClick={() => setIsSalesTimeOpen(!isSalesTimeOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    {salesTimeRange} <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSalesTimeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Popup */}
                  {isSalesTimeOpen && (
                    <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-30 py-1 text-xs">
                      {timeRangeOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSalesTimeRange(opt);
                            setIsSalesTimeOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                            salesTimeRange === opt 
                              ? 'font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {opt}
                          {salesTimeRange === opt && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sales Table */}
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Product Name</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium text-center">Priority</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {salesOrdersList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 flex items-center gap-2.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-8 h-8 rounded-none object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-[10px] text-gray-400">{item.stockText}</div>
                      </div>
                    </td>
                    <td className="py-2.5 font-semibold text-gray-900 dark:text-white">{item.price}</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-bold ${item.priorityColor}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-400">
                        <button 
                          onClick={() => navigate('/manage-products')}
                          className="p-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => navigate('/manage-products')}
                          className="p-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Center: AI Restock Recommendation */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                AI Restock Recommendation
              </h2>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/50">
                AI Active
              </span>
            </div>

            {/* Glowing & Clear AI Trend Graph Container */}
            <div className="relative h-32 w-full my-3 bg-gradient-to-b from-emerald-50/40 to-transparent dark:from-emerald-950/20 dark:to-transparent border border-emerald-100 dark:border-emerald-900/40 p-2 overflow-hidden">
              {/* Background Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none">
                <div className="border-b border-dashed border-emerald-200/50 dark:border-emerald-900/40 w-full"></div>
                <div className="border-b border-dashed border-emerald-200/50 dark:border-emerald-900/40 w-full"></div>
                <div className="border-b border-dashed border-emerald-200/50 dark:border-emerald-900/40 w-full"></div>
              </div>

              {/* High Contrast SVG Area & Curve Line Chart */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="aiRestockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Area Gradient Fill */}
                <path
                  d="M 10,75 Q 80,82 150,50 T 270,18 L 270,85 L 10,85 Z"
                  fill="url(#aiRestockGrad)"
                />

                {/* Main Glowing Emerald Curve */}
                <path
                  d="M 10,75 Q 80,82 150,50 T 270,18"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Trend Points along curve */}
                <circle cx="10" cy="75" r="3.5" fill="#10b981" />
                <circle cx="150" cy="50" r="4" fill="#10b981" />

                {/* Peak Glowing Target Point */}
                <circle cx="270" cy="18" r="9" fill="#10b981" fillOpacity="0.3" />
                <circle cx="270" cy="18" r="6" fill="#10b981" />
                <circle cx="270" cy="18" r="2.5" fill="#ffffff" />
              </svg>

              {/* Day Time Markers */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[9px] font-bold text-gray-400 dark:text-gray-500 pointer-events-none">
                <span>Day 1</span>
                <span>Day 3</span>
                <span>Day 5</span>
                <span>Day 8</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Day 11</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 mt-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">Currently to run out of stock soon</span>
                <span className="text-gray-400 text-[10px]">In AI Prediction</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-base font-extrabold text-gray-900 dark:text-white">{restockItemsCount} Items</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">1-11 actual dates</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button 
              onClick={() => navigate('/manage-inventory')}
              className="py-2.5 bg-[#18181b] hover:bg-zinc-800 text-white rounded-none font-medium text-xs transition-colors shadow-sm text-center cursor-pointer"
            >
              See All
            </button>
            <button 
              onClick={() => navigate('/manage-inventory')}
              className="py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-900 dark:text-white rounded-none font-medium text-xs transition-colors text-center cursor-pointer"
            >
              Restock Now
            </button>
          </div>
        </div>

        {/* Bottom Right: Still Not Arrived */}
        <div className="bg-white dark:bg-gray-900 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Still Not Arrived
            </h2>

            {/* Products List */}
            <div className="overflow-x-auto max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 font-medium">Product Name</th>
                  <th className="pb-3 font-medium text-center">Delays</th>
                  <th className="pb-3 pr-1 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {delayedProductsList.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 flex items-center gap-2.5">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-8 h-8 rounded-none object-cover border border-gray-100 dark:border-gray-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{prod.name}</div>
                        <div className="text-[10px] text-gray-400">{prod.id}</div>
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-gray-500 dark:text-gray-400 font-medium">
                      {prod.delay}
                    </td>
                    <td className="py-2.5 text-right pr-1">
                      <button 
                        onClick={() => navigate('/customers')}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-none text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Contact
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          {/* Action Button */}
          <div className="mt-6">
            <button 
              onClick={() => navigate('/order-line')}
              className="w-full py-2.5 bg-[#18181b] hover:bg-zinc-800 text-white rounded-none font-medium text-xs transition-colors shadow-sm text-center cursor-pointer"
            >
              See All
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
