import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, MapPin, Phone, Mail, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { customerProducts } from '../data/mockData';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8000/api';

export default function CustomerOrderPage() {
  const { customerName } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const decodedName = decodeURIComponent(customerName || '');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/orders-list?search=${encodeURIComponent(decodedName)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders && data.orders.length > 0) {
          setOrders(data.orders);
          setStatus(data.orders[0].status || 'Pending');
        }
      })
      .catch((err) => console.warn('Customer order fetch error:', err))
      .finally(() => setLoading(false));
  }, [decodedName]);

  // Extract products either from real backend orders or fallback mock
  const products = orders.length > 0
    ? orders.flatMap((ord) => (ord.subItems || []).map((sub) => ({
        name: sub.name,
        price: 150,
        qty: sub.pick || 1,
        image: sub.image
      })))
    : (customerProducts[decodedName] || []);

  const subtotal = products.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const totalItems = products.reduce((acc, item) => acc + item.qty, 0);

  const handleUpdateStatus = (newStatus) => {
    setStatus(newStatus);
    if (orders.length > 0 && orders[0].db_id) {
      fetch(`${API_BASE_URL}/orders-list/${orders[0].db_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then(() => showToast(`Order status changed to ${newStatus}`, 'success'))
        .catch(() => showToast('Failed to update status', 'error'));
    } else {
      showToast(`Status updated to ${newStatus}`, 'info');
    }
  };

  return (
    <div className="p-4 md:p-8 flex flex-col transition-colors duration-200 min-h-screen relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white shadow-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-none border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 shadow-sm cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Customer Profile & Order
        </h2>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Profile & Order Summary */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-none bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-3xl font-bold mb-4">
              {decodedName.charAt(0) || 'C'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{decodedName}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Registered Customer
            </p>
            
            <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">Total Items</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{totalItems}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-wider">Total Spent</div>
                <div className="text-2xl font-black text-amber-500">${total.toFixed(0)}</div>
              </div>
            </div>

            {/* Fake Contact Info for realism */}
            <div className="w-full space-y-3 text-left text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{decodedName.toLowerCase().replace(/\s+/g, '.')}@example.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>123 Main St, New York, NY</span>
              </div>
            </div>
          </div>

          {/* Combined Status & Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-none p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Payment Summary</h4>
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Tax (10%)</span>
                <span className="font-medium text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-amber-500">${total.toFixed(2)}</span>
              </div>
            </div>

            <h4 className="font-bold text-gray-900 dark:text-white mb-4 pt-4 border-t border-gray-100 dark:border-gray-700">Order Status</h4>
            <div className="flex flex-wrap items-center gap-2">
              {['Pending', 'Processing', 'Shipped', 'Delivered'].map((st) => (
                <button 
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`px-4 py-2 text-xs font-semibold rounded-none transition-colors border cursor-pointer ${
                    status.toLowerCase() === st.toLowerCase()
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ordered Items Cards */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Items</h3>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-none text-xs font-semibold">
              {products.length} Products
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center items-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-none p-5 shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  
                  {/* Image Section */}
                  <div className="w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-none mb-5 relative overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                    {/* Quantity Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-md px-3 py-1 rounded-none text-xs font-bold text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50">
                      x{item.qty}
                    </div>
                  </div>
                  
                  {/* Product Details Section */}
                  <div className="flex flex-col flex-1">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2" title={item.name}>{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                      Unit Price: ${item.price.toFixed(2)}
                    </p>
                    
                    {/* Total Area */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                       <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Item Total</span>
                       <span className="font-black text-base text-amber-500">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-none p-12 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">This customer hasn't ordered anything yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
