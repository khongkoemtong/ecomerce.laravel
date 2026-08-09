import { ChevronRight, ChevronLeft, Plus, Minus } from 'lucide-react';
import { activeOrders, productCategories, productItems } from '../data/mockData';
import { useOutletContext } from 'react-router-dom';
import { useState, useRef } from 'react';

export default function DashboardPage() {
  const categoriesRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const { isSidebarOpen, isRightSidebarOpen } = useOutletContext() || { isSidebarOpen: true, isRightSidebarOpen: true };
  const areBothClosed = !isSidebarOpen && !isRightSidebarOpen;

  return (
    <div className="p-8 pb-12 transition-colors duration-200">
      {/* Order Line Section */}
      

      {/* Foodies Menu Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Catalog</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => categoriesRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => categoriesRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Categories */}
        <div 
          ref={categoriesRef}
          className="flex gap-4 mb-8 overflow-x-auto pb-2 custom-scrollbar border-b-2 border-gray-200 dark:border-gray-700 scroll-smooth"
        >
          {productCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-3 py-3 px-6 rounded-t border-x border-t transition-colors -mb-[2px] ${
                activeCategory === cat.id 
                  ? 'border-amber-500 bg-white dark:bg-gray-800 border-b-white dark:border-b-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 bg-transparent border-b-transparent'
              }`}
            >
              <span className="text-2xl leading-none bg-white dark:bg-gray-700 p-2 rounded shadow-sm border border-gray-100 dark:border-gray-600">{cat.icon}</span>
              <div className="text-left">
                <div className={`font-bold text-sm ${activeCategory === cat.id ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {cat.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{cat.count} items</div>
              </div>
            </button>
          ))}
        </div>

        {/* Product Items Grid */}
        <div className={`grid gap-6 ${areBothClosed ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'}`}>
          {(activeCategory === 'all' 
            ? productItems 
            : productItems.filter(item => {
                const catInfo = productCategories.find(c => c.id === activeCategory);
                return item.category.toLowerCase() === catInfo?.id.toLowerCase();
              })
          ).map((item) => (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-gray-800 rounded shadow-sm transition-all hover:shadow-md border-2 ${areBothClosed ? 'p-5' : 'p-4 flex flex-col items-center justify-center'} ${
                item.quantity > 0 
                  ? 'border-amber-500 shadow-[0_0_15px_rgba(20,184,166,0.15)] dark:shadow-[0_0_15px_rgba(20,184,166,0.05)]' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className={`flex justify-center relative ${areBothClosed ? 'mb-4 pt-2' : 'mb-3'}`}>
                <img src={item.image} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full shadow-inner" />
                {item.quantity > 0 && (
                   <span className={`absolute bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white dark:border-gray-800 ${areBothClosed ? 'top-0 right-4' : 'top-0 right-0'}`}>
                     {item.quantity}
                   </span>
                )}
              </div>
              
              {areBothClosed && (
                <div className="w-full mt-4">
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1 block uppercase tracking-wider">{item.category}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4 truncate" title={item.name}>{item.name}</h3>
                  
                  <div className="flex justify-between items-center mt-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <span className="font-extrabold text-xl text-gray-900 dark:text-white">${item.price.toFixed(2)}</span>
                    
                    {item.quantity > 0 ? (
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                        <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base w-6 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                        <button className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors shadow-sm border border-amber-600">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 dark:text-gray-600 transition-colors opacity-50 cursor-not-allowed">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-base w-6 text-center text-gray-400 dark:text-gray-600">0</span>
                        <button className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:border-amber-500 dark:hover:border-amber-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shadow-sm">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
