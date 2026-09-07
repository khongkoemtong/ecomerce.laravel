import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { FaCheck, FaRotate, FaBoxOpen, FaTruck, FaClock, FaCircleCheck, FaChevronDown, FaChevronUp, FaReceipt } from 'react-icons/fa6'
import { IoBagHandleOutline, IoLocationOutline, IoQrCodeOutline, IoCashOutline } from 'react-icons/io5'
import DiscountBadge from '../../../components/DiscountBadge'
import { useAuth } from '../../../features/auth/auth.hooks'
import { fetchUserOrdersRequest } from '../../../features/auth/auth.service'

function ProfilePage() {
  const { isDark } = useTheme()
  const { wishlist, removeFromWishlist, addToCart } = useCartWishlist()
  const { isAuthenticated, isReady, user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('ORDERS')

  // Real orders state
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [ordersError, setOrdersError] = useState(null)
  const [orderFilter, setOrderFilter] = useState('ALL')
  const [expandedOrders, setExpandedOrders] = useState({})

  const loadOrders = useCallback(async () => {
    if (!user?.id && !user?.email) return
    setIsLoadingOrders(true)
    setOrdersError(null)
    try {
      const response = await fetchUserOrdersRequest(user?.id, user?.email)
      const data = response?.orders || response?.data?.orders || []
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrdersError(err.message || 'Could not load your orders. Please try again.')
    } finally {
      setIsLoadingOrders(false)
    }
  }, [user?.id, user?.email])

  useEffect(() => {
    if (isAuthenticated && (user?.id || user?.email)) {
      loadOrders()
    }
  }, [isAuthenticated, user?.id, user?.email, loadOrders])

  const toggleExpandOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  if (!isReady) {
    return (
      <div className={`flex min-h-screen items-center justify-center px-4 transition-all duration-300 ${
        isDark 
          ? "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,_#090909_0%,_#111111_45%,_#050505_100%)] text-stone-200" 
          : "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_35%),linear-gradient(135deg,_#fbf9f6_0%,_#f5f2eb_45%,_#ece7df_100%)] text-stone-700"
      }`}>
        <p className="text-sm uppercase tracking-[0.35em]">
          Loading session...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Bio state
  const username = user?.name ? `@${user.name.toLowerCase().replace(/\s+/g, '_')}` : '@clara_vogue'
  const title = user?.email || 'CREATIVE DIRECTOR & DIGITAL MUSE'
  const bio = 'Curating the intersection of architectural minimalism and avant-garde luxury. Based in Paris. Sharing the evolution of the modern wardrobe through the lens of ATELIER.'
  const curationLink = 'atelier.luxury/curations/clara-vogue'

  // My Outfits photos
  const outfits = [
    'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=600&q=80',
  ]

  // Helpers for formatting order statuses and payment methods
  const formatPaymentMethod = (method) => {
    switch (method?.toLowerCase()) {
      case 'aba_qr':
      case 'aba':
        return { label: 'ABA QR', icon: IoQrCodeOutline }
      case 'bakong_khqr':
      case 'bakong':
        return { label: 'ABA QR', icon: IoQrCodeOutline }
      case 'cash_on_delivery':
      case 'cod':
        return { label: 'Cash on Delivery', icon: IoCashOutline }
      default:
        return { label: method || 'Payment', icon: IoCashOutline }
    }
  }

  const getStatusBadge = (status, type = 'order') => {
    const s = (status || '').toLowerCase()
    if (s === 'paid' || s === 'delivered' || s === 'completed' || s === 'success') {
      return {
        bg: isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: s === 'paid' ? 'Paid' : s === 'delivered' ? 'Delivered' : 'Completed'
      }
    }
    if (s === 'processing' || s === 'shipped' || s === 'in_transit') {
      return {
        bg: isDark ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
        label: s === 'shipped' ? 'Shipped' : 'Processing'
      }
    }
    if (s === 'pending') {
      return {
        bg: isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
        label: 'Pending'
      }
    }
    if (s === 'cancelled' || s === 'failed') {
      return {
        bg: isDark ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: s === 'cancelled' ? 'Cancelled' : 'Failed'
      }
    }
    return {
      bg: isDark ? 'bg-stone-800 border-stone-700 text-stone-300' : 'bg-stone-100 text-stone-700 border-stone-300',
      dot: 'bg-stone-400',
      label: status || 'Unknown'
    }
  }

  // Filter orders based on selected tab
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'ALL') return true
    if (orderFilter === 'PAID') return (order.payment_status?.toLowerCase() === 'paid' || order.order_status?.toLowerCase() === 'paid')
    if (orderFilter === 'PENDING') return (order.order_status?.toLowerCase() === 'pending' || order.payment_status?.toLowerCase() === 'pending')
    if (orderFilter === 'PROCESSING') return ['processing', 'shipped'].includes(order.order_status?.toLowerCase())
    if (orderFilter === 'DELIVERED') return order.order_status?.toLowerCase() === 'delivered'
    if (orderFilter === 'CANCELLED') return order.order_status?.toLowerCase() === 'cancelled'
    return true
  })

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans ${
      isDark 
        ? "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.18),_transparent_35%),linear-gradient(135deg,_#090909_0%,_#111111_45%,_#050505_100%)] text-stone-100" 
        : "bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_35%),linear-gradient(135deg,_#fbf9f6_0%,_#f5f2eb_45%,_#ece7df_100%)] text-stone-900"
    }`}>
      <Header />

      <main className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6">
        
        {/* User Bio Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12 pb-12 border-b border-black/10 dark:border-white/10">
          
          {/* Left: Avatar with Verification Badge */}
          <div className="relative mx-auto md:mx-0 h-36 w-36 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&h=400&q=80"
              alt="Profile"
              className="h-full w-full rounded-full object-cover border border-black/15 dark:border-white/15 shadow-md"
            />
            <span className="absolute bottom-1 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black border border-white dark:border-black text-[10px]">
              <FaCheck className="h-2.5 w-2.5" />
            </span>
          </div>

          {/* Right: User details and CTAs */}
          <div className="flex-1 space-y-5 text-center md:text-left">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className={`font-serif text-3xl sm:text-4xl tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {username}
                </h1>
                <p className={`text-[0.68rem] uppercase tracking-[0.25em] font-semibold mt-1 ${
                  isDark ? 'text-amber-200/70' : 'text-amber-600'
                }`}>
                  {title}
                </p>
              </div>

              {/* Logout Button */}
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition cursor-pointer ${
                    isDark 
                      ? 'bg-amber-500 text-black hover:bg-amber-400' 
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-center md:justify-start gap-8 text-center border-y border-black/5 dark:border-white/5 py-4">
              <div>
                <p className={`text-xl font-serif font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{orders.length}</p>
                <p className="text-[0.65rem] uppercase tracking-widest text-stone-400">Total Orders</p>
              </div>
              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
              <div>
                <p className={`text-xl font-serif font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{wishlist.length}</p>
                <p className="text-[0.65rem] uppercase tracking-widest text-stone-400">Wishlisted</p>
              </div>
              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
              <div>
                <p className={`text-xl font-serif font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {orders.filter(o => o.order_status?.toLowerCase() === 'paid' || o.payment_status?.toLowerCase() === 'paid').length}
                </p>
                <p className="text-[0.65rem] uppercase tracking-widest text-stone-400">Paid Orders</p>
              </div>
            </div>

            {/* Description & Link */}
            <div className="space-y-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
              <p>{bio}</p>
              <a
                href="#"
                className={`inline-block text-xs uppercase tracking-wider font-semibold underline ${
                  isDark ? 'text-stone-200 hover:text-amber-300' : 'text-stone-800 hover:text-amber-600'
                }`}
              >
                {curationLink} &nearr;
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-b border-black/10 dark:border-white/10 mb-8 pt-4">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'ORDERS'
                ? isDark
                  ? 'border-amber-500 text-amber-400'
                  : 'border-stone-950 text-stone-950'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'ORDERS'
                  ? isDark ? 'bg-amber-500 text-black' : 'bg-stone-950 text-white'
                  : isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
              }`}>
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('WISHLIST')}
            className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'WISHLIST'
                ? isDark
                  ? 'border-amber-500 text-amber-400'
                  : 'border-stone-950 text-stone-950'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            <span>Wishlist</span>
            {wishlist.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'WISHLIST'
                  ? isDark ? 'bg-amber-500 text-black' : 'bg-stone-950 text-white'
                  : isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
              }`}>
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('OUTFITS')}
            className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] border-b-2 transition cursor-pointer ${
              activeTab === 'OUTFITS'
                ? isDark
                  ? 'border-amber-500 text-amber-400'
                  : 'border-stone-950 text-stone-950'
                : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
            }`}
          >
            My Outfits
          </button>
        </div>

        {/* Tab Content Panels */}
        <div>
          {/* TAB 1: REAL ORDERS LIST & STATUS TRACKING */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-6">
              
              {/* Header Toolbar: Filters + Refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[
                    { key: 'ALL', label: 'All', count: orders.length },
                    { key: 'PAID', label: 'Paid', count: orders.filter(o => o.payment_status?.toLowerCase() === 'paid' || o.order_status?.toLowerCase() === 'paid').length },
                    { key: 'PENDING', label: 'Pending', count: orders.filter(o => o.order_status?.toLowerCase() === 'pending' || o.payment_status?.toLowerCase() === 'pending').length },
                    { key: 'PROCESSING', label: 'Processing / Shipped', count: orders.filter(o => ['processing', 'shipped'].includes(o.order_status?.toLowerCase())).length },
                    { key: 'DELIVERED', label: 'Delivered', count: orders.filter(o => o.order_status?.toLowerCase() === 'delivered').length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderFilter(tab.key)}
                      className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border transition cursor-pointer flex items-center gap-1.5 ${
                        orderFilter === tab.key
                          ? isDark
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-900 text-white border-stone-900'
                          : isDark
                            ? 'border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200'
                            : 'border-black/10 text-stone-600 hover:border-black/20 hover:text-stone-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="opacity-70 text-[10px]">({tab.count})</span>
                    </button>
                  ))}
                </div>

                {/* Refresh Orders Button */}
                <button
                  type="button"
                  onClick={loadOrders}
                  disabled={isLoadingOrders}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider border rounded-full transition cursor-pointer self-start sm:self-auto ${
                    isDark
                      ? 'border-white/15 text-stone-300 hover:border-amber-400 hover:text-amber-400'
                      : 'border-black/15 text-stone-700 hover:border-stone-900 hover:text-stone-900'
                  }`}
                  title="Reload orders"
                >
                  <FaRotate className={`h-3 w-3 ${isLoadingOrders ? 'animate-spin text-amber-500' : ''}`} />
                  <span>{isLoadingOrders ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>

              {/* Error Alert */}
              {ordersError && (
                <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs">
                  <p>{ordersError}</p>
                </div>
              )}

              {/* Loading Skeleton */}
              {isLoadingOrders && orders.length === 0 && (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className={`p-6 border animate-pulse ${
                        isDark ? 'border-white/10 bg-stone-900/40' : 'border-black/10 bg-stone-100/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="h-4 bg-stone-500/20 rounded w-48" />
                        <div className="h-4 bg-stone-500/20 rounded w-24" />
                      </div>
                      <div className="flex gap-4">
                        <div className="h-20 w-16 bg-stone-500/20 rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-stone-500/20 rounded w-3/4" />
                          <div className="h-3 bg-stone-500/20 rounded w-1/2" />
                          <div className="h-3 bg-stone-500/20 rounded w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoadingOrders && filteredOrders.length === 0 && (
                <div className={`text-center py-16 px-4 border ${
                  isDark ? 'border-white/10 bg-stone-900/20' : 'border-black/10 bg-stone-50/50'
                }`}>
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
                    <FaReceipt className="h-5 w-5" />
                  </div>
                  <h3 className={`font-serif text-lg ${isDark ? 'text-white' : 'text-stone-900'}`}>
                    {orderFilter === 'ALL' ? 'No Orders Placed Yet' : `No ${orderFilter.toLowerCase()} orders found`}
                  </h3>
                  <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto">
                    {orderFilter === 'ALL' 
                      ? 'Explore our curated collections and place your first luxury order today.' 
                      : 'You do not have any orders currently matching this filter.'}
                  </p>
                  <Link
                    to="/"
                    className={`inline-block mt-6 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition cursor-pointer ${
                      isDark
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    Explore Collection
                  </Link>
                </div>
              )}

              {/* Real Orders Cards */}
              {!isLoadingOrders && filteredOrders.length > 0 && (
                <div className="space-y-6">
                  {filteredOrders.map((order) => {
                    const isExpanded = expandedOrders[order.id] ?? false
                    const orderStatusInfo = getStatusBadge(order.order_status, 'order')
                    const paymentStatusInfo = getStatusBadge(order.payment_status, 'payment')
                    const paymentMethodInfo = formatPaymentMethod(order.payment_method)
                    const PaymentIcon = paymentMethodInfo.icon

                    const items = order.items || []
                    const itemsCount = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
                    const orderDate = order.formatted_date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Recent')

                    const isPaid = order.payment_status?.toLowerCase() === 'paid' || order.order_status?.toLowerCase() === 'paid'
                    const isDelivered = order.order_status?.toLowerCase() === 'delivered'
                    const isProcessing = ['processing', 'shipped'].includes(order.order_status?.toLowerCase())

                    return (
                      <div
                        key={order.id}
                        className={`border transition-all duration-300 ${
                          isDark 
                            ? 'border-white/10 bg-stone-900/50 hover:border-amber-500/30' 
                            : 'border-black/10 bg-white hover:border-amber-600/30 shadow-sm'
                        }`}
                      >
                        {/* 1. ORDER TOP BAR */}
                        <div className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b ${
                          isDark ? 'border-white/10 bg-stone-900/80' : 'border-black/5 bg-[#faf8f5]'
                        }`}>
                          <div className="flex flex-wrap items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-mono text-sm font-bold tracking-tight ${isDark ? 'text-amber-300' : 'text-stone-900'}`}>
                                  #{order.order_number || `ORD-${order.id}`}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                Placed on {orderDate} &bull; {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                              </p>
                            </div>
                          </div>

                          {/* Status Badges & Method */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Payment Method Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border ${
                              isDark ? 'border-white/10 bg-black/40 text-stone-300' : 'border-black/10 bg-white text-stone-700'
                            }`}>
                              <PaymentIcon className="h-3 w-3 text-amber-500" />
                              <span>{paymentMethodInfo.label}</span>
                            </span>

                            {/* Payment Status Badge */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${paymentStatusInfo.bg}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${paymentStatusInfo.dot}`} />
                              <span>{paymentStatusInfo.label}</span>
                            </span>

                            {/* Order Status Badge (if different from payment) */}
                            {order.order_status?.toLowerCase() !== order.payment_status?.toLowerCase() && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-full border ${orderStatusInfo.bg}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${orderStatusInfo.dot}`} />
                                <span>{orderStatusInfo.label}</span>
                              </span>
                            )}

                            {/* Grand Total */}
                            <div className="ml-2 text-right">
                              <span className={`text-base font-bold font-mono ${isDark ? 'text-amber-400' : 'text-stone-950'}`}>
                                ${(Number(order.total) || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 2. ORDER PROGRESS TRACKER */}
                        <div className={`px-5 py-4 border-b ${
                          isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-[#fdfbf7]'
                        }`}>
                          <div className="grid grid-cols-4 gap-2 text-center relative">
                            
                            {/* Step 1: Placed */}
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-500 text-white mb-1 shadow-sm">
                                <FaCheck className="h-2.5 w-2.5" />
                              </div>
                              <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-stone-300' : 'text-stone-800'}`}>
                                Placed
                              </span>
                            </div>

                            {/* Step 2: Payment */}
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-sm ${
                                isPaid
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                              }`}>
                                {isPaid ? <FaCheck className="h-2.5 w-2.5" /> : <FaClock className="h-2.5 w-2.5" />}
                              </div>
                              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                isPaid ? (isDark ? 'text-stone-300' : 'text-stone-800') : 'text-amber-500'
                              }`}>
                                {isPaid ? 'Paid' : 'Payment Pending'}
                              </span>
                            </div>

                            {/* Step 3: Processing & Shipped */}
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-sm ${
                                isDelivered || isProcessing
                                  ? 'bg-sky-500 text-white'
                                  : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-200 text-stone-400'
                              }`}>
                                {isDelivered ? <FaCheck className="h-2.5 w-2.5" /> : <FaTruck className="h-2.5 w-2.5" />}
                              </div>
                              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                isDelivered || isProcessing ? (isDark ? 'text-stone-300' : 'text-stone-800') : 'text-stone-400'
                              }`}>
                                {order.order_status?.toLowerCase() === 'shipped' ? 'Shipped' : 'Processing'}
                              </span>
                            </div>

                            {/* Step 4: Delivered */}
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 shadow-sm ${
                                isDelivered
                                  ? 'bg-emerald-500 text-white'
                                  : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-200 text-stone-400'
                              }`}>
                                {isDelivered ? <FaCircleCheck className="h-3 w-3" /> : <FaBoxOpen className="h-2.5 w-2.5" />}
                              </div>
                              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                isDelivered ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-stone-400'
                              }`}>
                                Delivered
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. ORDER ITEMS LIST */}
                        <div className="p-5 space-y-4">
                          {items.map((item, idx) => {
                            const itemImage = item.image || item.product?.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80'
                            const itemName = item.product_name || item.product?.name || 'Product Item'
                            const itemPrice = Number(item.price) || 0
                            const itemQty = Number(item.quantity) || 1
                            const itemTotal = Number(item.total) || (itemPrice * itemQty)
                            const productSlug = item.product?.slug || item.product?.id || item.product_id

                            return (
                              <div
                                key={item.id || idx}
                                className={`flex items-center justify-between gap-4 pb-4 ${
                                  idx < items.length - 1 ? 'border-b border-black/5 dark:border-white/5' : ''
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  {/* Product Thumbnail */}
                                  <Link
                                    to={productSlug ? `/product/${productSlug}` : '#'}
                                    className="h-16 w-14 flex-shrink-0 overflow-hidden border border-black/10 dark:border-white/10 bg-stone-900 group"
                                  >
                                    <img
                                      src={itemImage}
                                      alt={itemName}
                                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80'
                                      }}
                                    />
                                  </Link>

                                  {/* Product Name & Quantity Details */}
                                  <div className="space-y-1">
                                    <Link
                                      to={productSlug ? `/product/${productSlug}` : '#'}
                                      className={`text-xs font-semibold uppercase tracking-wider block hover:text-amber-500 transition ${
                                        isDark ? 'text-white' : 'text-stone-900'
                                      }`}
                                    >
                                      {itemName}
                                    </Link>
                                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                                      <span>Qty: <strong className={isDark ? 'text-stone-200' : 'text-stone-700'}>{itemQty}</strong></span>
                                      <span>&bull;</span>
                                      <span>${itemPrice.toFixed(2)} each</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Item Total & Quick Action */}
                                <div className="text-right flex-shrink-0">
                                  <p className={`text-xs font-bold font-mono ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                                    ${itemTotal.toFixed(2)}
                                  </p>
                                  {productSlug && (
                                    <Link
                                      to={`/product/${productSlug}`}
                                      className={`inline-block mt-1 text-[10px] uppercase font-semibold tracking-wider underline hover:text-amber-500 transition ${
                                        isDark ? 'text-amber-400/80' : 'text-amber-700'
                                      }`}
                                    >
                                      View Product
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* 4. EXPANDABLE DETAILS ACCORDION (Address, Price Breakdown) */}
                        <div className={`border-t px-5 py-3 flex items-center justify-between ${
                          isDark ? 'border-white/5 bg-black/10' : 'border-black/5 bg-[#faf8f5]'
                        }`}>
                          <button
                            type="button"
                            onClick={() => toggleExpandOrder(order.id)}
                            className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider transition cursor-pointer ${
                              isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Shipping & Cost Breakdown'}</span>
                            {isExpanded ? <FaChevronUp className="h-2.5 w-2.5" /> : <FaChevronDown className="h-2.5 w-2.5" />}
                          </button>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-stone-400">
                              Order Status: <strong className={isDark ? 'text-white' : 'text-stone-900'}>{order.order_status?.toUpperCase() || 'PENDING'}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Expandable Body */}
                        {isExpanded && (
                          <div className={`p-5 border-t grid gap-6 sm:grid-cols-2 text-xs ${
                            isDark ? 'border-white/5 bg-stone-950/40 text-stone-300' : 'border-black/5 bg-[#f5f2eb]/60 text-stone-700'
                          }`}>
                            {/* Shipping Information */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px] text-amber-500">
                                <IoLocationOutline className="h-3.5 w-3.5" />
                                <span>Delivery Address</span>
                              </div>
                              <p className="font-medium text-stone-900 dark:text-stone-100">
                                {order.address?.full_name || user?.name || 'Customer'}
                              </p>
                              {order.address?.phone && (
                                <p className="text-stone-400">Phone: {order.address.phone}</p>
                              )}
                              <p className="text-stone-400 leading-relaxed">
                                {order.address?.address_line || 'Address provided at checkout'}
                                {order.address?.city ? `, ${order.address.city}` : ''}
                                {order.address?.province ? `, ${order.address.province}` : ''}
                              </p>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-1.5 sm:border-l sm:pl-6 border-black/5 dark:border-white/5">
                              <p className="font-semibold uppercase tracking-wider text-[11px] text-amber-500 mb-2">
                                Payment Breakdown
                              </p>
                              <div className="flex justify-between text-stone-400">
                                <span>Subtotal</span>
                                <span>${(Number(order.subtotal) || 0).toFixed(2)}</span>
                              </div>
                              {Number(order.discount) > 0 && (
                                <div className="flex justify-between text-rose-500">
                                  <span>Discount</span>
                                  <span>-${(Number(order.discount) || 0).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-stone-400">
                                <span>Shipping Fee</span>
                                <span>{Number(order.shipping_fee) > 0 ? `$${Number(order.shipping_fee).toFixed(2)}` : 'Free'}</span>
                              </div>
                              <div className={`flex justify-between font-bold pt-2 border-t text-sm ${
                                isDark ? 'border-white/10 text-white' : 'border-black/10 text-stone-900'
                              }`}>
                                <span>Total Paid / Due</span>
                                <span className="text-amber-500 font-mono">${(Number(order.total) || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: LIVE WISHLIST ITEMS */}
          {activeTab === 'WISHLIST' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm uppercase tracking-wider text-stone-400">No items in your wishlist</p>
                  <Link to="/" className="inline-block mt-4 text-xs font-semibold uppercase tracking-widest underline hover:text-amber-500">
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-2 sm:grid-cols-3">
                  {wishlist.map((item) => {
                    const isOutOfStock = (item.stock ?? 0) <= 0;
                    const originalVal = item.originalPrice ? parseFloat(item.originalPrice.replace('$', '')) : 0;
                    const currentVal = item.price ? parseFloat(item.price.replace('$', '')) : 0;
                    const discountPercent = originalVal && currentVal && originalVal > currentVal
                      ? Math.round(((originalVal - currentVal) / originalVal) * 100)
                      : 0;

                    return (
                      <div
                        key={item.id}
                        className={`group relative border transition-all duration-300 ${
                          isDark 
                            ? "border-white/10 bg-stone-900/90 hover:border-amber-500/30" 
                            : "border-black/10 bg-white hover:border-amber-600/30"
                        }`}
                      >
                        {/* Top-Left: Discount Percentage Badge */}
                        <DiscountBadge
                          discount={discountPercent}
                          className="absolute top-2 left-2"
                        />
                        {discountPercent > 0 && !isOutOfStock && (
                          <DiscountBadge
                            discount={discountPercent}
                            className="absolute top-2 left-2"
                          />
                        )}

                        {/* Sold Out Badge */}
                        {isOutOfStock && (
                          <span className="absolute top-2 left-2 z-20 bg-stone-950/90 text-rose-400 border border-rose-500/40 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 shadow-sm backdrop-blur-xs">
                            Sold Out
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className={`absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition cursor-pointer shadow-sm ${
                            isDark
                              ? 'border-white/10 bg-black/80 text-stone-300 hover:bg-black/60 hover:text-white'
                              : 'border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black'
                          }`}
                          aria-label="Remove item"
                        >
                          &times;
                        </button>

                        {/* Bottom-Left: Quick Add to Bag hover button on the image container */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(item, 'S', item.colors?.[0] || 'Black', 1)
                            if (!isOutOfStock) {
                              addToCart(item, 'S', item.colors?.[0] || 'Black', 1)
                            }
                          }}
                          className={`absolute left-2 bottom-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                            isDark
                              ? 'border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white'
                              : 'border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black'
                          className={`absolute left-2 bottom-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border transition cursor-pointer shadow-sm ${
                            isOutOfStock
                              ? "border-white/5 bg-black/40 text-stone-600 cursor-not-allowed opacity-40"
                              : isDark
                                ? 'border-white/10 bg-black/80 text-stone-300 hover:bg-black hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300'
                                : 'border-black/10 bg-white/90 text-stone-700 hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 transition-all duration-300'
                          }`}
                          aria-label="Add to Bag"
                          aria-label={isOutOfStock ? "Sold Out" : "Add to Bag"}
                        >
                          <IoBagHandleOutline className="h-3.5 w-3.5" />
                        </button>

                        <Link to={`/product/${item.id}`} className="block">
                          <div className="relative overflow-hidden aspect-[3/4]">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
                                isOutOfStock ? 'grayscale-[0.3] opacity-85' : ''
                              }`}
                            />
                          </div>
                          <div className="p-4">
                            <h3 className={`text-xs uppercase tracking-[0.2em] font-medium transition ${
                              isDark ? 'text-stone-300 group-hover:text-amber-300' : 'text-stone-800 group-hover:text-amber-600'
                            }`}>
                              {item.name}
                            </h3>
                            {discountPercent > 0 ? (
                            {isOutOfStock ? (
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="text-xs font-semibold text-rose-500">
                                  Sold Out
                                </span>
                                <span className={`text-[10px] opacity-50 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                  {item.price}
                                </span>
                              </div>
                            ) : discountPercent > 0 ? (
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className={`text-xs font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                                  {item.price}
                                </span>
                                <span className={`text-[10px] line-through opacity-60 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                  {item.originalPrice}
                                </span>
                              </div>
                            ) : (
                              <p className={`mt-1.5 text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-705'}`}>
                              <p className={`mt-1.5 text-xs font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                                {item.price}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY OUTFITS GRID */}
          {activeTab === 'OUTFITS' && (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
              {outfits.map((src, idx) => (
                <div key={idx} className="overflow-hidden aspect-[4/5] relative group border border-black/5 dark:border-white/5">
                  <img
                    src={src}
                    alt={`Curation outfit ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                    <p className="text-[0.65rem] uppercase tracking-wider text-white font-semibold">Atelier Wardrobe</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className={`border-t transition-all duration-300 px-5 py-12 sm:px-6 lg:px-8 ${
        isDark ? "border-white/10 bg-[#070707]" : "border-black/10 bg-[#f4f1eb]"
      }`}>
        <div className="mx-auto max-w-7xl grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className={`font-serif text-2xl tracking-[0.22em] ${isDark ? "text-white" : "text-stone-900"}`}>ATELIER</p>
            <p className={`mt-3 max-w-xs text-sm leading-6 ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              Refining the everyday through tailored silhouettes and purposeful texture.
            </p>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>Customer Care</p>
            <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Store locator</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Shipping &amp; Returns</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Accessibility</p>
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>About</p>
            <div className={`mt-3 space-y-2 text-sm ${isDark ? "text-stone-400" : "text-stone-600"}`}>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Journal</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Craftsmanship</p>
              <p className={`hover:text-amber-500 cursor-pointer transition ${isDark ? "hover:text-amber-300" : "hover:text-amber-600"}`}>Privacy Policy</p>
            </div>
          </div>

          <div>
            <p className={`text-xs uppercase tracking-[0.28em] ${isDark ? "text-amber-200/70" : "text-amber-600"}`}>Newsletter</p>
            <div className={`mt-3 flex items-center gap-3 border-b pb-3 text-sm ${
              isDark ? "border-white/20 text-stone-200" : "border-black/20 text-stone-800"
            }`}>
              <input
                type="email"
                placeholder="Enter email"
                className={`bg-transparent outline-none w-full text-sm ${
                  isDark ? "text-stone-200 placeholder:text-stone-600" : "text-stone-800 placeholder:text-stone-400"
                }`}
              />
              <button 
                type="button" 
                className={`transition ${isDark ? "text-amber-500 hover:text-amber-400" : "text-amber-600 hover:text-amber-500"}`} 
                aria-label="Subscribe"
              >
                &rarr;
              </button>
            </div>
          </div>
        </div>

        <div className={`mx-auto max-w-7xl mt-12 flex flex-col gap-3 border-t pt-5 text-xs uppercase tracking-[0.22em] sm:flex-row sm:items-center sm:justify-between ${
          isDark ? "border-white/10 text-stone-500" : "border-black/10 text-stone-400"
        }`}>
          <p>2026 Atelier. All rights reserved.</p>
          <p>Crafted for modern wardrobe rituals.</p>
        </div>
      </footer>
    </div>
  )
}

export default ProfilePage
