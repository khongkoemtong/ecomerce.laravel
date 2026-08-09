import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activeOrders, currentOrderDetails } from '../data/mockData';
import { Clock, Users, Hash, Receipt } from 'lucide-react';

export default function OrderLinePage() {
  const [orders, setOrders] = useState(activeOrders);
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const navigate = useNavigate();

  const handleStatusChange = (newStatus, newColor) => {
    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrder.id) {
        return { ...o, status: newStatus, statusColor: newColor };
      }
      return o;
    });
    setOrders(updatedOrders);
    setSelectedOrder({ ...selectedOrder, status: newStatus, statusColor: newColor });
  };

  // For demonstration, we'll reuse currentOrderDetails for the products of any selected order.
  // In a real app, you would fetch details based on selectedOrder.id

  return (
    <div className="p-8 flex flex-col transition-colors duration-200">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Line</h2>
      </div>

      <div className="flex gap-6">
        {/* Left Column - Order List */}
        <div className="w-1/3 flex flex-col gap-4">
          {orders.map((order) => (
            <div 
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`p-5 rounded-xl cursor-pointer border-2 transition-all ${
                selectedOrder.id === order.id 
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-300 dark:hover:border-gray-600 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900 dark:text-white text-lg">{order.id}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${order.statusColor}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{order.peopleCount} People</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4" />
                  <span>{order.itemsCount} Items</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Clock className="w-4 h-4" />
                  <span>{order.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Order Details */}
        <div className="w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-auto">
            {selectedOrder ? (
              <>
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Order Details</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Viewing items for {selectedOrder.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Date</div>
                    <div className="font-medium text-gray-900 dark:text-white">{currentOrderDetails.date}</div>
                  </div>
                </div>

                <div className="pr-4">
                  <table className="w-full text-left">
                    <thead className="bg-white dark:bg-gray-800 z-10">
                      <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 font-medium">Person</th>
                        <th className="pb-3 font-medium text-center">Qty</th>
                        <th className="pb-3 font-medium text-center">Status</th>
                        <th className="pb-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {currentOrderDetails.items.map((item, idx) => (
                        <tr 
                          key={idx} 
                          onClick={() => navigate(`/customer-order/${encodeURIComponent(item.name)}`)}
                          className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        >
                          <td className="py-4">
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{item.name}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-semibold">
                              {item.qty}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              item.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              item.status === 'Processing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 text-right font-bold text-gray-900 dark:text-white">
                            ${item.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 shrink-0">
                  <div className="flex justify-end">
                    <div className="w-72 space-y-3">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span className="font-medium text-gray-900 dark:text-white">${currentOrderDetails.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Tax (10%)</span>
                        <span className="font-medium text-gray-900 dark:text-white">${currentOrderDetails.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-amber-600 dark:text-amber-400">${currentOrderDetails.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Change Status */}
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Change Status:</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange('Pending', 'bg-orange-500')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${selectedOrder.status === 'Pending' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => handleStatusChange('Processing', 'bg-amber-600')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${selectedOrder.status === 'Processing' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        Processing
                      </button>
                      <button 
                        onClick={() => handleStatusChange('Shipped', 'bg-purple-500')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${selectedOrder.status === 'Shipped' ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                      >
                        Shipped
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 min-h-[400px]">
                <Receipt className="w-16 h-16 mb-4 opacity-20" />
                <p>Select an order to view its details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
