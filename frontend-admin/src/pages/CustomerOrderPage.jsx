import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { customerProducts } from '../data/mockData';

export default function CustomerOrderPage() {
  const { customerName } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending');
  
  const decodedName = decodeURIComponent(customerName || '');
  const products = customerProducts[decodedName] || [];

  const subtotal = products.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  const totalItems = products.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="p-4 md:p-8 flex flex-col transition-colors duration-200 min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 shadow-sm"
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
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white text-3xl font-bold mb-4">
              {decodedName.charAt(0)}
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
                <Mail className="w-4 h-4" />
                <span>{decodedName.toLowerCase().replace(' ', '.')}@example.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 019-2834</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>123 Main St, New York, NY</span>
              </div>
            </div>
          </div>

          {/* Combined Status & Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
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
              <button 
                onClick={() => setStatus('Pending')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${status === 'Pending' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Pending
              </button>
              
              <button 
                onClick={() => setStatus('Processing')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${status === 'Processing' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Processing
              </button>
              
              <button 
                onClick={() => setStatus('Shipped')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${status === 'Shipped' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                Shipped
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Ordered Items Cards */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Items</h3>
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
              {products.length} Products
            </span>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {products.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
                  
                  {/* Image Section */}
                  <div className="w-full h-48 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Package className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    )}
                    {/* Quantity Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow-md px-3 py-1 rounded-full text-sm font-bold text-gray-900 dark:text-white border border-gray-200/50 dark:border-gray-700/50">
                      x{item.qty}
                    </div>
                  </div>
                  
                  {/* Product Details Section */}
                  <div className="flex flex-col flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2" title={item.name}>{item.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Unit Price: ${item.price.toFixed(2)}
                    </p>
                    
                    {/* Total Area */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
                       <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Item Total</span>
                       <span className="font-black text-xl text-amber-500">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No items found</h3>
              <p className="text-gray-500 dark:text-gray-400">This customer hasn't ordered anything yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
