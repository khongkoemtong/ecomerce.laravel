import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Users,
  CreditCard,
  Star,
  Gift,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Layers,
  Award,
  ShieldCheck,
  Grid
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { initialOrdersData } from '../../data/ordersData';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [orderCount, setOrderCount] = useState(initialOrdersData.length);

  // Fetch Order Count dynamically from API
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/orders-list')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.orders) {
          setOrderCount(data.orders.length);
        }
      })
      .catch((err) => console.warn('Sidebar order count fetch fallback:', err));
  }, []);

  // Accordion states
  const isManageProductsActive = ['/manage-products', '/categories', '/brands'].some(path => currentPath.startsWith(path));
  const isSettingsActive = currentPath.startsWith('/settings');

  const [openProducts, setOpenProducts] = useState(isManageProductsActive);
  const [openSettings, setOpenSettings] = useState(isSettingsActive);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (isManageProductsActive) setOpenProducts(true);
    if (isSettingsActive) setOpenSettings(true);
  }, [currentPath, isManageProductsActive, isSettingsActive]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <>
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white shrink-0 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)] overflow-hidden`}>
        {/* Logo */}
        <div className={`p-6 flex items-center ${isOpen ? 'gap-3' : 'justify-center'} h-20 shrink-0 border-b border-gray-100 dark:border-gray-700/50`}>
          <div className="w-9 h-9 shrink-0 bg-amber-500 relative flex items-center justify-center shadow-md">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-white dark:border-b-gray-800 rotate-45 absolute -ml-1 -mt-1"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-white dark:border-t-gray-800 -rotate-45 absolute ml-1 mt-1"></div>
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-gray-900 dark:text-white whitespace-nowrap">
                Tasty Station
              </h1>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tracking-wider uppercase">Admin Portal</span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Dashboard' : undefined}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Dashboard</span>}
          </NavLink>

          {/* Order Line with Order Count Badge */}
          <NavLink
            to="/order-line"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? `Order Line (${orderCount})` : undefined}
          >
            <div className="relative flex items-center">
              <ShoppingBag className="w-5 h-5 shrink-0" />
              {!isOpen && (
                <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-gray-800 shadow-xs">
                  {orderCount}
                </span>
              )}
            </div>
            {isOpen && (
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="whitespace-nowrap truncate">Order Line</span>
                <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-extrabold px-2 py-0.5 rounded-full ml-2 shrink-0">
                  {orderCount}
                </span>
              </div>
            )}
          </NavLink>

          {/* Manage Inventory */}
          <NavLink
            to="/manage-inventory"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Manage Inventory' : undefined}
          >
            <Package className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Manage Inventory</span>}
          </NavLink>

          {/* Manage Products Accordion */}
          <div>
            <button
              onClick={() => setOpenProducts(!openProducts)}
              className={`w-full flex items-center justify-between ${isOpen ? 'px-3.5' : 'px-0 justify-center'} py-2.5 font-medium text-sm transition-all ${
                isManageProductsActive
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={!isOpen ? 'Manage Products' : undefined}
            >
              <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                <Grid className="w-5 h-5 shrink-0" />
                {isOpen && <span className="whitespace-nowrap">Manage Products</span>}
              </div>
              {isOpen && (
                openProducts ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )
              )}
            </button>

            {/* Sub-menu items */}
            {openProducts && (
              <div className={`space-y-1 ${isOpen ? 'mt-1 pl-9' : 'mt-1'}`}>
                <NavLink
                  to="/manage-products"
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                    }`
                  }
                  title={!isOpen ? 'Products' : undefined}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">Products</span>}
                </NavLink>

                <NavLink
                  to="/categories"
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                    }`
                  }
                  title={!isOpen ? 'Categories' : undefined}
                >
                  <Tag className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">Categories</span>}
                </NavLink>

                <NavLink
                  to="/brands"
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                    }`
                  }
                  title={!isOpen ? 'Brands' : undefined}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">Brands</span>}
                </NavLink>
              </div>
            )}
          </div>

          {/* Customers */}
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Customers' : undefined}
          >
            <Users className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Customers</span>}
          </NavLink>

          {/* Payments */}
          <NavLink
            to="/payments"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Payments' : undefined}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Payments</span>}
          </NavLink>

          {/* Reviews */}
          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Reviews' : undefined}
          >
            <Star className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Reviews</span>}
          </NavLink>

          {/* Promotions */}
          <NavLink
            to="/promotions"
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-sm font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`
            }
            title={!isOpen ? 'Promotions' : undefined}
          >
            <Gift className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap">Promotions</span>}
          </NavLink>

          {/* User Settings Accordion */}
          <div className="pt-2">
            <button
              onClick={() => setOpenSettings(!openSettings)}
              className={`w-full flex items-center justify-between ${isOpen ? 'px-3.5' : 'px-0 justify-center'} py-2.5 font-medium text-sm transition-all ${
                isSettingsActive
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={!isOpen ? 'User Settings' : undefined}
            >
              <div className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'}`}>
                <Settings className="w-5 h-5 shrink-0" />
                {isOpen && <span className="whitespace-nowrap">User Settings</span>}
              </div>
              {isOpen && (
                openSettings ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )
              )}
            </button>

            {/* Settings Sub-menu */}
            {openSettings && (
              <div className={`space-y-1 ${isOpen ? 'mt-1 pl-9' : 'mt-1'}`}>
                <NavLink
                  to="/settings/roles"
                  className={({ isActive }) =>
                    `flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border-l-2 border-amber-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-700/30'
                    }`
                  }
                  title={!isOpen ? 'User Roles' : undefined}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="whitespace-nowrap">User Roles</span>}
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isOpen ? 'gap-3 px-3.5' : 'justify-center'} py-2.5 font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-none`}
            title={!isOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {isOpen && <span className="whitespace-nowrap font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 shadow-xl max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to log out of the admin panel?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}