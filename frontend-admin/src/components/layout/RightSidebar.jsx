import { X, CheckCircle, Search, User, Truck, Edit2, Trash2, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentOrderDetails } from '../../data/mockData';

export default function RightSidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { shippingMethod, orderId, date, peopleCount, items, subtotal, tax, donation, total } = currentOrderDetails;

  return (
    <aside className={`${isOpen ? 'w-80 border-l' : 'w-0 border-l-0'} h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-[-2px_0_10px_rgba(0,0,0,0.02)] z-10 relative transition-all duration-300 shrink-0 overflow-hidden`}>
      <div className="w-80 p-5 flex flex-col h-full overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Order {orderId}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{date}</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Info */}
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6 shadow-inner border border-gray-100 dark:border-gray-700">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold shadow-sm border-2 border-white dark:border-gray-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Walk-in Customer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{peopleCount} Items Total</p>
            </div>
          </div>
        </div>
        
        {/* Ordered Items */}
        <div className="mb-6 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Order Items
            </h3>
            <span className="text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              {shippingMethod}
            </span>
          </div>
          
          <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-medium w-5 bg-amber-50 dark:bg-amber-900/30 text-center rounded text-xs py-0.5">{item.qty}x</span>
                <span className="font-medium text-gray-700 dark:text-gray-200 truncate w-32">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
       
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-solid border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-800 dark:text-gray-200">Total Payable</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      

      {/* Actions */}
      <div className="mt-6 flex gap-3 justify-end">
        
        <button 
          onClick={() => navigate('/order-line')}
          className="w-2/3 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-md shadow-amber-600/30"
        >
          <CheckCircle className="w-4 h-4" />
          View Now !
        </button>
      </div>
      </div>
    </aside>
  );
}
