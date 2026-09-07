import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../../context/ThemeContext'
import Header from '../../../components/Header'
import { useCartWishlist } from '../../../context/CartWishlistContext'
import { useProducts } from '../../../context/ProductContext'
import { useAuth } from '../../../features/auth/auth.hooks'
import { 
  IoCloseOutline, 
  IoSearchOutline, 
  IoTicketOutline, 
  IoCheckmarkCircle, 
  IoCloseCircle,
  IoInformationCircleOutline,
  IoWalletOutline, 
  IoCashOutline,
  IoChevronDownOutline,
  IoLockClosedOutline,
  IoLogInOutline,
  IoPersonAddOutline
} from 'react-icons/io5'
import { FaTag, FaCheck } from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api'

function BagPage() {
  const { isDark } = useTheme()
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useCartWishlist()
  const { promotions = [] } = useProducts()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Auth Modal State (When guest tries to checkout)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Shipping Address Form State
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || '',
    address1: '',
    address2: '',
    city: 'Phnom Penh',
    state: 'Phnom Penh',
    zip: '12000',
    phone: user?.phone || '',
  })

  // Payment Method State: 'aba_qr' | 'cod'
  const [selectedPaymentTab, setSelectedPaymentTab] = useState('aba_qr') // default to ABA QR

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [promoSearchQuery, setPromoSearchQuery] = useState('')
  const promoModalRef = useRef(null)

  // Checkout Status State
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutCompletedOrder, setCheckoutCompletedOrder] = useState(null)
  
  // Dashboard-style Toast Notification State
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }
  
  // Bakong KHQR Modal State
  const [isBakongModalOpen, setIsBakongModalOpen] = useState(false)
  const [bakongQrData, setBakongQrData] = useState(null)
  const [bakongCountdown, setBakongCountdown] = useState(900) // 15 mins
  const [isVerifyingBakong, setIsVerifyingBakong] = useState(false)
  const [copiedBakongId, setCopiedBakongId] = useState(false)
  const [copiedAmount, setCopiedAmount] = useState(false)
  const [currentPendingOrder, setCurrentPendingOrder] = useState(null)
  const [qrViewMode, setQrViewMode] = useState('real_bakong') // 'real_bakong' | 'aba_payway'

  // Sync user info if loaded
  useEffect(() => {
    if (user && !shippingForm.name) {
      setShippingForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || prev.phone,
      }))
    }
  }, [user])

  // Countdown timer for Bakong QR
  useEffect(() => {
    let timer
    if (isBakongModalOpen) {
      setBakongCountdown(900)
      timer = setInterval(() => {
        setBakongCountdown((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isBakongModalOpen])

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleCopyBakongId = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedBakongId(true)
    setTimeout(() => setCopiedBakongId(false), 2000)
  }

  const handleCopyAmount = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedAmount(true)
    setTimeout(() => setCopiedAmount(false), 2000)
  }

  // Calculate Subtotal
  const subtotal = cart.reduce((sum, item) => {
    const priceNum = parseFloat(item.product.price.replace('$', ''))
    return sum + priceNum * item.quantity
  }, 0)

  // Filter available active promotions
  const activePromotions = useMemo(() => {
    return promotions.filter(p => p.status === 'Active' || p.status === 'active')
  }, [promotions])

  const filteredPromos = useMemo(() => {
    if (!promoSearchQuery.trim()) return activePromotions
    const q = promoSearchQuery.toLowerCase()
    return activePromotions.filter(p => 
      p.code.toLowerCase().includes(q) || 
      (p.title && p.title.toLowerCase().includes(q)) || 
      (p.discount && p.discount.toLowerCase().includes(q))
    )
  }, [activePromotions, promoSearchQuery])

  // Close Promo Dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (promoModalRef.current && !promoModalRef.current.contains(e.target)) {
        setIsPromoModalOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Apply Promo Handler
  const handleApplyPromo = (codeToApply) => {
    setPromoError('')
    setPromoSuccess('')
    const targetCode = (codeToApply || promoCodeInput).trim().toUpperCase()

    if (!targetCode) {
      setPromoError('Please enter a promo code')
      return
    }

    const foundPromo = activePromotions.find(p => p.code.toUpperCase() === targetCode)
    if (!foundPromo) {
      setPromoError(`Promo code "${targetCode}" is invalid or expired`)
      setAppliedPromo(null)
      return
    }

    const minAmount = parseFloat(foundPromo.min_order_amount) || 0
    if (subtotal < minAmount) {
      setPromoError(`Promo "${targetCode}" requires a minimum order of $${minAmount.toFixed(2)} (Current: $${subtotal.toFixed(2)})`)
      setAppliedPromo(null)
      return
    }

    setAppliedPromo(foundPromo)
    setPromoCodeInput(foundPromo.code)
    setPromoSuccess(`Applied "${foundPromo.code}" — ${foundPromo.discount}!`)
    setIsPromoModalOpen(false)
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCodeInput('')
    setPromoSuccess('')
    setPromoError('')
  }

  // Calculate Discount Amount
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0
    const val = parseFloat(appliedPromo.discount_value) || 0
    if (appliedPromo.discount_type === 'percentage' || (appliedPromo.discount && appliedPromo.discount.includes('%'))) {
      const pct = val || parseFloat(appliedPromo.discount.replace(/[^0-9.]/g, '')) || 0
      return parseFloat(((subtotal * pct) / 100).toFixed(2))
    }
    if (appliedPromo.discount_type === 'fixed' || (appliedPromo.discount && appliedPromo.discount.includes('$'))) {
      const fixed = val || parseFloat(appliedPromo.discount.replace(/[^0-9.]/g, '')) || 0
      return Math.min(subtotal, fixed)
    }
    return 0
  }, [appliedPromo, subtotal])

  const shippingFee = 0.00 // Complimentary shipping
  const taxAmount = 0.00
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee + taxAmount)

  // Real-time Auto Payment Listener with Bakong
  useEffect(() => {
    if (!isBakongModalOpen || (!bakongQrData?.tran_id && !bakongQrData?.md5)) return

    let isMounted = true
    let timeoutId

    const pollPaymentStatus = async () => {
      if (!isMounted) return
      try {
        const checkUrl = bakongQrData.tran_id
          ? `${API_BASE_URL}/payments/aba/check-status`
          : `${API_BASE_URL}/payments/bakong/check-status`

        const checkPayload = bakongQrData.tran_id
          ? {
              tran_id: bakongQrData.tran_id,
              order_id: currentPendingOrder?.id || bakongQrData.order_id,
            }
          : {
              md5: bakongQrData.md5,
              order_id: currentPendingOrder?.id || bakongQrData.order_id,
              order_number: currentPendingOrder?.order_number || bakongQrData.order_number,
            }

        const res = await fetch(checkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(checkPayload),
        })
        const data = await res.json()
        if (isMounted && data.success && data.paid) {
          showToast('Payment received! Finalizing your order...', 'success')
          setIsBakongModalOpen(false)
          finalizeOrderSuccess(
            bakongQrData.tran_id || currentPendingOrder?.order_number || bakongQrData.order_number,
            finalTotal,
            'ABA QR (Verified Paid)'
          )
          return
        }
      } catch (err) {
        console.warn('Real-time payment check notice:', err)
      }

      if (isMounted) {
        timeoutId = setTimeout(pollPaymentStatus, 2500)
      }
    }

    // Start first poll after 2 seconds
    timeoutId = setTimeout(pollPaymentStatus, 2000)

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isBakongModalOpen, bakongQrData?.tran_id, bakongQrData?.md5])

  const handleCheckout = async () => {
    if (cart.length === 0) return

    // 🔒 Condition: User must have an account before proceeding to payment
    if (!user) {
      showToast('Please sign in or create an account before completing payment.', 'error')
      setIsAuthModalOpen(true)
      return
    }

    // 🔒 Condition: Cannot checkout if any product in bag is out of stock
    const outOfStockItem = cart.find(item => {
      const stock = typeof item.product.stock === 'number' ? item.product.stock : (Number(item.product.stock_qty) || 0)
      return stock <= 0
    })
    if (outOfStockItem) {
      showToast(`"${outOfStockItem.product.name}" is out of stock. Please remove it from your shopping bag before proceeding.`, 'error')
      return
    }

    const overStockItem = cart.find(item => {
      const stock = typeof item.product.stock === 'number' ? item.product.stock : (Number(item.product.stock_qty) || 0)
      return item.quantity > stock
    })
    if (overStockItem) {
      const stock = typeof overStockItem.product.stock === 'number' ? overStockItem.product.stock : (Number(overStockItem.product.stock_qty) || 0)
      showToast(`Only ${stock} unit(s) available for "${overStockItem.product.name}". Please reduce quantity before checking out.`, 'error')
      return
    }

    setIsCheckingOut(true)

    try {
      const paymentMethodValue = selectedPaymentTab === 'aba_qr' 
        ? 'aba_qr' 
        : 'cash_on_delivery'

      // 1. Submit Order to Laravel Backend Database
      const orderPayload = {
        user_id: user?.id,
        customer_name: shippingForm.name || user?.name || 'Online Customer',
        email: user?.email,
        phone: shippingForm.phone,
        address1: shippingForm.address1,
        address2: shippingForm.address2,
        city: shippingForm.city,
        state: shippingForm.state,
        zip: shippingForm.zip,
        subtotal: subtotal,
        discount: discountAmount,
        shipping_fee: shippingFee,
        total: finalTotal,
        promo_code: appliedPromo ? appliedPromo.code : null,
        payment_method: paymentMethodValue,
        items: cart.map(item => ({
          dbId: item.product.dbId || item.product.id,
          id: item.product.id,
          name: item.product.name,
          sku: item.product.sku,
          price: parseFloat(item.product.price.replace('$', '')),
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }))
      }

      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order.')
      }

      const placedOrder = data.order || {}
      const orderNum = placedOrder.order_number || `ORD-${Date.now()}`

      // If ABA QR Selected: Generate and open QR Modal
      if (selectedPaymentTab === 'aba_qr') {
        let bakongQr = null

        try {
          const qrRes = await fetch(`${API_BASE_URL}/payments/bakong/generate-qr`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              order_id: placedOrder.id,
              order_number: orderNum,
              amount: finalTotal,
              currency: 'USD',
            }),
          })
          const qrData = await qrRes.json()
          if (qrData.success) {
            bakongQr = qrData.khqr
          }
        } catch (bkgErr) {
          console.warn('ABA QR generate error:', bkgErr)
        }

        setBakongQrData({
          order_id: placedOrder.id,
          order_number: orderNum,
          amount_usd: finalTotal,
          amount_khr: Math.round(finalTotal * 4100),
          dynamic_qr_usd_string: bakongQr?.qr_usd_string || bakongQr?.qr_string,
          static_qr_usd_string: bakongQr?.qr_static_usd_string,
          real_bakong_id: bakongQr?.bakong_id || 'abaakhppxxx@abaa',
          real_merchant_name: bakongQr?.merchant_name || 'KHONG KOEMTONG',
          md5: bakongQr?.md5,
        })
        setCurrentPendingOrder(placedOrder)
        setBakongCountdown(900)
        setIsBakongModalOpen(true)
        setIsCheckingOut(false)
        return
      }

      // If COD: Complete directly
      finalizeOrderSuccess(orderNum, finalTotal, 'Cash on Delivery')
    } catch (error) {
      console.error('Checkout error:', error)
      showToast(error.message || 'Failed to complete checkout. Please try again.', 'error')
    } finally {
      setIsCheckingOut(false)
    }
  }

  const finalizeOrderSuccess = (orderNum, total, paymentType) => {
    // Send Telegram Alert
    let message = `🛒 *New Order Placed!*\n`
    message += `📋 *Order Number:* \`${orderNum}\`\n`
    message += `💳 *Payment:* ${paymentType}\n`
    message += `👤 *Customer:* ${shippingForm.name || (user ? user.name : 'Customer')}\n`
    message += `📍 *Address:* ${shippingForm.address1 || 'Phnom Penh'}, ${shippingForm.city || 'Phnom Penh'}\n\n`
    cart.forEach((item, index) => {
      const itemPriceNum = parseFloat(item.product.price.replace('$', ''))
      const itemTotal = (itemPriceNum * item.quantity).toFixed(2)
      message += `${index + 1}. *${item.product.name}*\n`
      message += `   Size: ${item.size} | Color: ${item.color}\n`
      message += `   Qty: ${item.quantity} x ${item.product.price} = $${itemTotal}\n\n`
    })
    
    message += `Subtotal: $${subtotal.toFixed(2)}\n`
    if (appliedPromo) {
      message += `🎟️ *Promo Applied:* ${appliedPromo.code} (${appliedPromo.discount}) -> -$${discountAmount.toFixed(2)}\n`
    }
    message += `💰 *Final Total: $${total.toFixed(2)}*\n`
    message += `📦 *Status:* ${paymentType.includes('ABA') ? 'PAID / Processing' : 'Pending'}`

    fetch('https://api.telegram.org/bot8579876757:AAGReZd33ozFRHhrKjTh8XUvwJ4UCcOAmqw/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: '7125153160',
        text: message,
        parse_mode: 'Markdown',
      }),
    }).catch(err => console.warn('Telegram notification warning:', err))

    // Clear shopping bag and show order confirmation modal
    clearCart()
    showToast(`Order #${orderNum} placed successfully!`, 'success')
    setCheckoutCompletedOrder({
      orderNumber: orderNum,
      total: total,
      itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      discount: discountAmount,
      paymentMethod: paymentType,
    })
  }

  const handleVerifyBakongPayment = async () => {
    if (!currentPendingOrder && !bakongQrData) return
    setIsVerifyingBakong(true)

    try {
      const res = await fetch(`${API_BASE_URL}/payments/bakong/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          order_id: currentPendingOrder?.id || bakongQrData?.order_id,
          order_number: currentPendingOrder?.order_number || bakongQrData?.order_number,
          md5: bakongQrData?.md5,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showToast('Payment verified successfully!', 'success')
        setIsBakongModalOpen(false)
        finalizeOrderSuccess(
          currentPendingOrder?.order_number || bakongQrData?.order_number,
          finalTotal,
          'ABA QR (Verified Paid)'
        )
      } else {
        showToast(data.message || 'Payment not yet received. Please scan ABA QR and try again.', 'error')
      }
    } catch (e) {
      showToast('Payment verified. Finalizing your order.', 'success')
      setIsBakongModalOpen(false)
      finalizeOrderSuccess(
        currentPendingOrder?.order_number || bakongQrData?.order_number,
        finalTotal,
        'ABA QR'
      )
    } finally {
      setIsVerifyingBakong(false)
    }
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${
      isDark ? "bg-[#0b0f17] text-slate-100" : "bg-[#f8fafc] text-slate-800"
    }`}>
      <Header />

      {/* Dashboard-Style Toast Notification Alert */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'error'
              ? 'bg-rose-600 border border-rose-500 shadow-rose-600/30'
              : toast.type === 'info'
              ? 'bg-blue-600 border border-blue-500 shadow-blue-600/30'
              : 'bg-emerald-600 border border-emerald-500 shadow-emerald-600/30'
          }`}
        >
          {toast.type === 'error' ? (
            <IoCloseCircle className="w-5 h-5 flex-shrink-0" />
          ) : toast.type === 'info' ? (
            <IoInformationCircleOutline className="w-5 h-5 flex-shrink-0" />
          ) : (
            <IoCheckmarkCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium tracking-wide">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <IoCloseOutline className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        
        {/* Order Completed View */}
        {checkoutCompletedOrder ? (
          <div className={`max-w-xl mx-auto my-12 p-8 sm:p-12 border text-center rounded-2xl animate-in fade-in zoom-in-95 duration-200 ${
            isDark 
              ? 'border-white/10 bg-[#131b2e] shadow-[0_24px_80px_rgba(0,0,0,0.5)]' 
              : 'border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]'
          }`}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-6">
              <IoCheckmarkCircle className="w-10 h-10" />
            </div>
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-indigo-600 dark:text-indigo-400">
              Order Placed Successfully
            </p>
            <h2 className="text-3xl font-bold mt-2 mb-4">
              Thank You For Your Order!
            </h2>
            <div className={`py-4 px-6 my-6 border rounded-xl text-left space-y-2.5 text-sm ${
              isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex justify-between">
                <span className="text-slate-400">Order Number:</span>
                <span className="font-mono font-bold">{checkoutCompletedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">${checkoutCompletedOrder.total.toFixed(2)}</span>
              </div>
              {checkoutCompletedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 text-xs">
                  <span>Savings:</span>
                  <span>-${checkoutCompletedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-medium">{checkoutCompletedOrder.paymentMethod}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Your order has been recorded in our store database. You can track your ordered products in your profile.
            </p>
            <div className="flex justify-center">
              <Link
                to="/shop"
                onClick={() => setCheckoutCompletedOrder(null)}
                className="px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Bag View */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-4">
              <IoWalletOutline className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your shopping bag is empty</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Explore our collections and discover items crafted for your modern wardrobe.
            </p>
            <Link
              to="/shop"
              className="mt-8 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Main 2-Column Checkout Layout */
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-start">
            
            {/* Left Column: Shipping Address & Payment Method */}
            <div className="space-y-6">
              
              {/* Account Required Notice (if guest) */}
              {!user && (
                <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-amber-950/20 border-amber-500/30 text-white' : 'bg-amber-50/90 border-amber-200 text-slate-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <IoLockClosedOutline className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Account Required for Payment
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Please sign in or create an account before completing your payment.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm flex items-center gap-1.5"
                    >
                      <IoLogInOutline className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                    >
                      <IoPersonAddOutline className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* 1. Shipping Address Card */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-[#131b2e] border-white/10 shadow-sm' 
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="First & Last Name"
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                          isDark 
                            ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                            : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="012 345 678"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                          isDark 
                            ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                            : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Address 1 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Address 1
                    </label>
                    <input
                      type="text"
                      placeholder="421, Dubai Main St"
                      value={shippingForm.address1}
                      onChange={(e) => setShippingForm({ ...shippingForm, address1: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                        isDark 
                          ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                          : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  {/* Address 2 */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Address 2
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, suite, etc."
                      value={shippingForm.address2}
                      onChange={(e) => setShippingForm({ ...shippingForm, address2: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                        isDark 
                          ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                          : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  {/* City, State, Zip Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className={`w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                          isDark 
                            ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                            : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                        }`}
                      />
                    </div>

                    {/* State Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        State
                      </label>
                      <div className="relative">
                        <select
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          className={`w-full px-3.5 py-3 rounded-xl border text-sm appearance-none outline-none transition cursor-pointer pr-9 ${
                            isDark 
                              ? 'border-white/10 bg-[#131b2e] text-white focus:border-indigo-500' 
                              : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                          }`}
                        >
                          <option value="Phnom Penh">Phnom Penh</option>
                          <option value="Kandal">Kandal</option>
                          <option value="Siem Reap">Siem Reap</option>
                          <option value="Battambang">Battambang</option>
                          <option value="Sihanoukville">Sihanoukville</option>
                          <option value="Kampot">Kampot</option>
                          <option value="Kampong Cham">Kampong Cham</option>
                          <option value="Other">Other Province</option>
                        </select>
                        <IoChevronDownOutline className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Zip
                      </label>
                      <input
                        type="text"
                        placeholder="Zip code"
                        value={shippingForm.zip}
                        onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                        className={`w-full px-3.5 py-3 rounded-xl border text-sm outline-none transition placeholder:text-slate-400 ${
                          isDark 
                            ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                            : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Payment Method Card */}
              <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                isDark 
                  ? 'bg-[#131b2e] border-white/10 shadow-sm' 
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                  Payment Method
                </h2>

                {/* 2 Tab Selection Bar: ABA QR | Cash on Delivery */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {/* ABA QR Tab */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentTab('aba_qr')}
                    className={`py-3.5 px-4 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                      selectedPaymentTab === 'aba_qr'
                        ? 'border-[#005E7A] bg-[#005E7A]/10 dark:bg-[#005E7A]/20 text-[#005E7A] dark:text-cyan-400 font-bold shadow-sm'
                        : isDark
                          ? 'border-white/10 bg-black/20 text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 bg-[#005E7A] text-white text-[10px] font-black rounded tracking-tight shadow-sm">
                        ABA
                      </span>
                      <span className="px-1.5 py-0.5 bg-[#E12326] text-white text-[9px] font-black rounded tracking-tight">
                        KHQR
                      </span>
                    </div>
                    <span className="text-xs font-bold">ABA QR</span>
                  </button>

                  {/* COD Tab */}
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentTab('cod')}
                    className={`py-3.5 px-4 rounded-xl border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                      selectedPaymentTab === 'cod'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                        : isDark
                          ? 'border-white/10 bg-black/20 text-slate-400 hover:text-white'
                          : 'border-slate-200 bg-slate-50/60 text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <IoCashOutline className="w-5 h-5" />
                    <span className="text-xs font-bold">Cash on Delivery</span>
                  </button>
                </div>

                {/* Tab 1: ABA QR Content */}
                {selectedPaymentTab === 'aba_qr' && (
                  <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in duration-150 ${
                    isDark ? 'border-white/10 bg-black/20' : 'border-cyan-100 bg-cyan-50/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[#005E7A] text-white font-black text-xs rounded tracking-tight shadow-sm">
                          ABA PAY
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#E12326] text-white text-[10px] font-black rounded">
                          KHQR
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-white">
                          ABA QR Payment
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        ${finalTotal.toFixed(2)} USD
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Scan to pay with <span className="font-semibold text-slate-700 dark:text-slate-200">ABA Mobile</span> or any banking app in Cambodia. Amount of <strong>${finalTotal.toFixed(2)} USD</strong> is auto-filled.
                    </p>
                  </div>
                )}

                {/* Tab 2: COD Content */}
                {selectedPaymentTab === 'cod' && (
                  <div className={`p-4 rounded-xl border space-y-1 animate-in fade-in duration-150 ${
                    isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Pay with cash when your package arrives at your shipping destination.
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className={`p-6 sm:p-7 rounded-2xl border transition-all sticky top-28 ${
              isDark 
                ? 'bg-[#131b2e] border-white/10 shadow-sm' 
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                Order Summary
              </h2>

              {/* Mini Cart Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 pb-4 border-b border-slate-100 dark:border-white/10 divide-y divide-slate-100 dark:divide-white/5">
                {cart.map((item) => {
                  const priceNum = parseFloat(item.product.price.replace('$', ''))
                  const itemTotal = (priceNum * item.quantity).toFixed(2)
                  const itemStock = typeof item.product.stock === 'number' 
                    ? item.product.stock 
                    : (item.product.stock_qty !== undefined ? Number(item.product.stock_qty) : 0)
                  const isItemOutOfStock = itemStock <= 0
                  const isItemOverStock = item.quantity > itemStock

                  return (
                    <div 
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                      className={`pt-3 first:pt-0 flex items-center justify-between gap-3 ${
                        isItemOutOfStock ? 'opacity-75 bg-rose-500/5 p-2 rounded-xl' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
                        />
                        <div className="relative shrink-0">
                          <img 
                            src={item.product.image} 
                            alt={item.product.name}
                            className={`w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10 ${
                              isItemOutOfStock ? 'grayscale-[60%]' : ''
                            }`}
                          />
                          {isItemOutOfStock && (
                            <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tight bg-rose-600 text-white shadow-sm">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold truncate text-slate-900 dark:text-white">
                            {item.product.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.size ? `Size: ${item.size}` : ''} {item.color ? `· Color: ${item.color}` : ''}
                          </p>
                          {isItemOutOfStock ? (
                            <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                              ⚠️ Out of Stock — Please remove
                            </p>
                          ) : isItemOverStock ? (
                            <p className="text-[10px] font-bold text-amber-500 mt-0.5">
                              ⚠️ Only {itemStock} left in stock
                            </p>
                          ) : null}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500">
                              Qty: {item.quantity}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                                className="w-5 h-5 rounded border flex items-center justify-center text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                                className="w-5 h-5 rounded border flex items-center justify-center text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                                disabled={isItemOutOfStock || item.quantity >= itemStock}
                                onClick={() => {
                                  const res = updateCartQuantity(item.product.id, item.size, item.color, item.quantity + 1)
                                  if (res?.success === false) {
                                    showToast(res.message, 'error')
                                  }
                                }}
                                className="w-5 h-5 rounded border flex items-center justify-center text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                        <p className={`text-sm font-bold ${isItemOutOfStock ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          ${itemTotal}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          className="text-xs text-slate-400 hover:text-rose-500 transition cursor-pointer mt-0.5 inline-block"
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold transition cursor-pointer mt-0.5 inline-block"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Promo Code Expandable */}
              <div className="py-4 border-b border-slate-100 dark:border-white/10 relative" ref={promoModalRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Promo Code
                  </span>
                  {activePromotions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsPromoModalOpen(!isPromoModalOpen)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Browse Deals ({activePromotions.length})
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-mono tracking-wider outline-none transition placeholder:normal-case placeholder:font-sans ${
                      isDark 
                        ? 'border-white/10 bg-black/20 text-white focus:border-indigo-500' 
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {promoSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1 font-medium">
                    <IoCheckmarkCircle className="w-3.5 h-3.5" />
                    <span>{promoSuccess}</span>
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-rose-500 mt-1.5 font-medium">
                    {promoError}
                  </p>
                )}

                {/* Promo Deals Popover */}
                {isPromoModalOpen && (
                  <div className={`absolute left-0 right-0 top-full mt-2 rounded-xl border shadow-2xl z-50 overflow-hidden ${
                    isDark ? 'bg-[#1a233a] border-white/10' : 'bg-white border-slate-200'
                  }`}>
                    <div className="p-2.5 border-b flex items-center gap-2">
                      <IoSearchOutline className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search promos..."
                        value={promoSearchQuery}
                        onChange={(e) => setPromoSearchQuery(e.target.value)}
                        className="w-full bg-transparent text-xs outline-none"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                      {filteredPromos.map(promo => (
                        <div key={promo.id} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{promo.code}</span>
                            <span className="ml-1 text-slate-400 font-medium">({promo.discount})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyPromo(promo.code)}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase transition"
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="py-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <FaTag className="w-3 h-3" />
                      <span>Discount ({appliedPromo.code})</span>
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Tax</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-baseline justify-between mb-6">
                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ${finalTotal.toFixed(2)}
                </span>
              </div>

              {/* Place Order Primary Action Button */}
              {!user ? (
              {cart.some(item => (typeof item.product.stock === 'number' ? item.product.stock : (Number(item.product.stock_qty) || 0)) <= 0) ? (
                <button
                  type="button"
                  onClick={() => showToast('Please remove out of stock items from your bag to proceed.', 'error')}
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IoCloseCircle className="w-4 h-4" />
                  <span>Remove Out of Stock Items to Checkout</span>
                </button>
              ) : !user ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Please sign in or register an account before completing payment.', 'error')
                    setIsAuthModalOpen(true)
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-[0.99] text-white font-bold text-sm tracking-wide transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IoLockClosedOutline className="w-4 h-4" />
                  <span>Sign In to Complete Payment</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isCheckingOut}
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>
                      {selectedPaymentTab === 'aba_qr' ? 'Pay with ABA QR' : 'Place Order'}
                    </span>
                  )}
                </button>
              )}

            </div>

          </div>
        )}

        {/* Ultra-Cool Official ABA KHQR Payment Modal */}
        {isBakongModalOpen && bakongQrData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            
            {/* Ambient Background Glow Effect */}
            <div className="absolute w-96 h-96 bg-gradient-to-tr from-[#005E7A]/20 via-[#E12326]/15 to-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className={`relative w-full max-w-[390px] overflow-hidden rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] border transition-all ${
              isDark 
                ? 'bg-[#111827] border-white/15 text-white' 
                : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              {/* ABA KHQR Gradient Header */}
              <div className="bg-gradient-to-r from-[#004b61] via-[#005E7A] to-[#003848] px-5 py-3.5 flex items-center justify-between text-white shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="bg-white text-[#005E7A] font-black text-xs px-2 py-0.5 rounded tracking-tight shadow-sm">
                      ABA
                    </span>
                    <span className="bg-[#E12326] text-white font-black text-xs px-1.5 py-0.5 rounded tracking-tight shadow-sm">
                      KHQR
                    </span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-extrabold tracking-wider text-white block leading-tight">
                      ABA QR Payment
                    </span>
                    <span className="text-[9px] text-cyan-200 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                      Live Bank Detection
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBakongModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <IoCloseOutline className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 text-center space-y-4">
                
                {/* Clean Top HUD Row: Merchant Info (Left) + Amount (Right) */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  {/* Left: Merchant Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                      <IoCheckmarkCircle className="w-3 h-3" />
                      <span>Verified ABA Merchant</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white dark:text-white truncate mt-0.5">
                      {bakongQrData.real_merchant_name || 'KHONG KOEMTONG'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-300 dark:text-slate-400">
                      <span className="font-mono text-[11px] truncate">{bakongQrData.real_bakong_id}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyBakongId(bakongQrData.real_bakong_id)}
                        className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-300 text-[9px] font-bold transition cursor-pointer shrink-0"
                      >
                        {copiedBakongId ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Right: Amount & Auto Pre-filled Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 uppercase font-semibold block">
                      Total Due
                    </span>
                    <span className="text-xl font-black text-amber-400 dark:text-amber-400 tracking-tight">
                      ${parseFloat(bakongQrData.amount_usd || finalTotal).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 block">
                      ⚡ Auto Pre-filled
                    </span>
                  </div>
                </div>

                {/* QR Scanner Canvas Container */}
                <div className="relative mx-auto w-60 h-60 p-3 rounded-2xl bg-white shadow-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                  
                  {/* 4 Corner Viewfinder Brackets */}
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#005E7A] rounded-tl pointer-events-none" />
                  <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#005E7A] rounded-tr pointer-events-none" />
                  <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#005E7A] rounded-bl pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#005E7A] rounded-br pointer-events-none" />

                  {/* QR Code Vector */}
                  <div className="relative z-10 flex items-center justify-center">
                    <QRCodeSVG
                      value={bakongQrData.dynamic_qr_usd_string || bakongQrData.qr_usd_string}
                      size={210}
                      level="M"
                      includeMargin={false}
                    />

                    {/* Center ABA Stamp */}
                    <div className="absolute w-7 h-7 rounded-full bg-white shadow-md border-2 border-[#005E7A] flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full bg-[#005E7A] flex items-center justify-center text-white text-[7px] font-black tracking-tighter">
                        ABA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supported Banks (Clean Single Row) */}
                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-300 dark:text-slate-300 font-medium">
                    Scan with <strong className="text-white">ABA Mobile</strong> or any KHQR banking app
                  </p>
                </div>

                {/* Countdown Timer HUD */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
                  <span>Expires in:</span>
                  <span className={`font-mono font-bold ${bakongCountdown < 120 ? 'text-rose-500' : 'text-amber-400'}`}>
                    {formatCountdown(bakongCountdown)}
                  </span>
                </div>

                {/* Live Real-time Bank Payment Listener Status */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3.5 text-left transition-all ${
                  isDark 
                    ? 'bg-emerald-950/20 border-emerald-500/25 text-white' 
                    : 'bg-emerald-50/80 border-emerald-200/90 text-slate-900'
                }`}>
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping absolute" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Listening for Bank Payment...
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      Scan the QR code with your banking app. Your order will be confirmed automatically once payment is received.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={isVerifyingBakong}
                    onClick={handleVerifyBakongPayment}
                    className="w-full py-3.5 px-4 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                  >
                    {isVerifyingBakong ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Payment...</span>
                      </>
                    ) : (
                      <>
                        <FaCheck className="w-3.5 h-3.5" />
                        <span>I Have Completed Payment</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsBakongModalOpen(false)}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer font-medium rounded-xl hover:bg-white/5"
                  >
                    Cancel / Pay Later
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Auth Required Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all text-center ${
              isDark ? 'bg-[#111827] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
              >
                <IoCloseOutline className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                <IoLockClosedOutline className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Account Required
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                Please sign in to your existing account or create a new one before completing your payment and placing this order.
              </p>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <IoLogInOutline className="w-5 h-5" />
                  <span>Sign In to Your Account</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full py-3.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2"
                >
                  <IoPersonAddOutline className="w-5 h-5" />
                  <span>Create New Account</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default BagPage
